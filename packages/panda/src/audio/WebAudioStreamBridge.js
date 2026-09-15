import { AudioFeatureExtractor } from './AudioFeatureExtractor.js';
import { BeatPhaseTracker } from './BeatPhaseTracker.js';
import { SpectralBandAnalyzer } from './SpectralBandAnalyzer.js';

// src/audio/WebAudioStreamBridge.js - Web Audio API capture, audio stream routing & analysis

export class WebAudioStreamBridge {
    constructor() {
        this.audioContext = null;
        this.analyserNode = null;
        this.sourceNode = null;
        this.frequencyDataArray = null;
        this.timeDomainDataArray = null;
        this.isAudioSourceConnected = false;

        this.spectralAnalyzer = new SpectralBandAnalyzer();
        this.featureExtractor = new AudioFeatureExtractor();
        this.beatTracker = new BeatPhaseTracker();

        // Energy tracking & onset detection
        this.previousBassEnergy = 0.0;
        this.detectedBeatsPerMinute = 120;
        this.beatTimestamps = [];
        this.lastDetectedBeatTimestamp = 0;
    }

    initializeAudioContext() {
        if (this.audioContext) return true;
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return false;

            this.audioContext = new AudioContextClass();
            this.analyserNode = this.audioContext.createAnalyser();
            this.analyserNode.fftSize = 512;
            this.analyserNode.smoothingTimeConstant = 0.65;

            const bufferLength = this.analyserNode.frequencyBinCount;
            this.frequencyDataArray = new Uint8Array(bufferLength);
            this.timeDomainDataArray = new Uint8Array(bufferLength);

            // Konsl anti-suspension technique: Inaudible 20 kHz oscillator preventing CEF from auto-suspending the audio pipeline
            try {
                this.keepAliveOscillator = this.audioContext.createOscillator();
                const keepAliveGain = this.audioContext.createGain();
                this.keepAliveOscillator.frequency.value = 20000;
                keepAliveGain.gain.value = 0.0001;
                this.keepAliveOscillator.connect(keepAliveGain);
                keepAliveGain.connect(this.audioContext.destination);
                this.keepAliveOscillator.start();
            } catch (oscError) {}

            return true;
        } catch (error) {
            console.warn("[WebAudioStreamBridge] AudioContext initialization failed:", error);
            return false;
        }
    }

    connectLiveSource(audioSource) {
        if (!this.initializeAudioContext()) return false;

        try {
            if (this.audioContext.state === "suspended") {
                this.audioContext.resume();
            }

            if (this.sourceNode) {
                try { this.sourceNode.disconnect(); } catch (e) {}
            }

            if (audioSource instanceof MediaStream) {
                this.sourceNode = this.audioContext.createMediaStreamSource(audioSource);
                this.sourceNode.connect(this.analyserNode);
            } else if (audioSource instanceof HTMLMediaElement) {
                this.sourceNode = this.audioContext.createMediaElementSource(audioSource);
                this.sourceNode.connect(this.analyserNode);
                this.analyserNode.connect(this.audioContext.destination);
            } else if (audioSource && typeof audioSource.connect === "function") {
                audioSource.connect(this.analyserNode);
                this.sourceNode = audioSource;
            }

            this.isAudioSourceConnected = true;
            return true;
        } catch (error) {
            console.warn("[WebAudioStreamBridge] Failed to connect audio source:", error);
            return false;
        }
    }

    disconnectLiveSource() {
        if (this.sourceNode) {
            try { this.sourceNode.disconnect(); } catch (e) {}
            this.sourceNode = null;
        }
        if (this.keepAliveOscillator) {
            try { this.keepAliveOscillator.stop(); } catch (e) {}
            this.keepAliveOscillator = null;
        }
        this.isAudioSourceConnected = false;
    }

    update(deltaTimeSeconds, currentPlaybackSeconds = null) {
        if (!this.isAudioSourceConnected || !this.analyserNode) {
            return null;
        }

        this.analyserNode.getByteFrequencyData(this.frequencyDataArray);
        this.analyserNode.getByteTimeDomainData(this.timeDomainDataArray);

        // Decompose frequencies
        const spectral = this.spectralAnalyzer.decomposeByteFrequencyData(this.frequencyDataArray);

        // Raw root-mean-square calculation
        let sumSquared = 0;
        for (let i = 0; i < this.timeDomainDataArray.length; i++) {
            const normalized = (this.timeDomainDataArray[i] - 128) / 128.0;
            sumSquared += normalized * normalized;
        }
        const rootMeanSquare = Math.sqrt(sumSquared / this.timeDomainDataArray.length);

        // Onset kick detection: rapid rise in sub-bass / bass
        const bassRise = spectral.bass - this.previousBassEnergy;
        const now = performance.now();
        const minBeatInterval = 60000 / 220; // Maximum 220 BPM
        const isKickOnset = (bassRise > 0.12 && spectral.bass > 0.35 && (now - this.lastDetectedBeatTimestamp > minBeatInterval));

        if (isKickOnset) {
            const timeSinceLast = now - this.lastDetectedBeatTimestamp;
            this.lastDetectedBeatTimestamp = now;
            if (timeSinceLast > 250 && timeSinceLast < 1500) {
                this.beatTimestamps.push(timeSinceLast);
                if (this.beatTimestamps.length > 8) this.beatTimestamps.shift();
                const averageInterval = this.beatTimestamps.reduce((a, b) => a + b, 0) / this.beatTimestamps.length;
                this.detectedBeatsPerMinute = Math.round(60000 / averageInterval);
            }
        }
        this.previousBassEnergy = spectral.bass;

        // Snare onset: spike in midrange/treble
        const isSnareOnset = (spectral.mid > 0.45 && spectral.treble > 0.35 && !isKickOnset);

        // Phase tracking
        const currentSeconds = currentPlaybackSeconds !== null ? currentPlaybackSeconds : (now / 1000);
        const phase = this.beatTracker.updatePhaseProgression(currentSeconds, this.detectedBeatsPerMinute);

        // Feature extraction (drops, camera shake, supernova)
        const features = this.featureExtractor.extractFeatures(
            deltaTimeSeconds,
            currentSeconds,
            spectral.energy,
            spectral.bass,
            spectral.mid,
            spectral.treble,
            isKickOnset,
            isSnareOnset
        );

        return {
            active: true,
            subBass: spectral.subBass,
            bass: spectral.bass,
            mid: spectral.mid,
            treble: spectral.treble,
            energy: spectral.energy,
            rms: rootMeanSquare,
            isBeat: isKickOnset || phase.isBeatOnset,
            beatImpulse: features.beatImpulse,
            snareImpulse: features.snareImpulse,
            isDrop: features.isDrop,
            isSoft: spectral.energy < 0.26 && !features.isDrop,
            softFactor: features.softFactor,
            dropFactor: features.dropFactor,
            bassShake: features.bassShake,
            supernovaTrigger: features.supernovaTrigger,
            spectralBands: spectral.spectralBands,
            bpm: this.detectedBeatsPerMinute,
            beatCount: phase.beatCount,
            beatPhase: phase.beatPhase,
            beatProgress: phase.beatPhase,
            barPhase: phase.barPhase
        };
    }
}

// Backward-compatible alias
export const WebAudioBridge = WebAudioStreamBridge;
