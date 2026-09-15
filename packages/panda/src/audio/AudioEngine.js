import { AudioEngineStateUpdater } from './AudioEngineStateUpdater.js';
import { AudioFeatureExtractor } from './AudioFeatureExtractor.js';
import { BeatPhaseTracker } from './BeatPhaseTracker.js';
import { CarrierToneLatencyTracker } from './CarrierToneLatencyTracker.js';
import { HardwareLatencyCompensator } from './HardwareLatencyCompensator.js';
import { MusicalFormSimulator } from './MusicalFormSimulator.js';
import { SpectralBandAnalyzer } from './SpectralBandAnalyzer.js';
import { SpotifyAnalysisEngine } from './SpotifyAnalysisEngine.js';
import { SpotifyMetadataProtobufLoader } from './SpotifyMetadataProtobufLoader.js';
import { SpotifyPlayerHooks } from './SpotifyPlayerHooks.js';
import { SpotifyRhythmStringDecoder } from './SpotifyRhythmStringDecoder.js';
import { SystemAudioBridgeWebSocketClient } from './SystemAudioBridgeWebSocketClient.js';
import { WebAudioStreamBridge } from './WebAudioStreamBridge.js';

export class AudioEngine {
    constructor() {
        this.isPlaying = false;
        this.progress = 0;
        this.tempo = 120;
        this.bpm = 120;
        this.trackDuration = 180000;
        this.trackUri = "";
        this.liveTime = 0;

        this.webAudioBridge = new WebAudioStreamBridge();
        this.spotifyAnalysis = new SpotifyAnalysisEngine();
        this.beatPhaseTracker = new BeatPhaseTracker();
        this.musicalFormSimulator = new MusicalFormSimulator();
        this.spectralBandAnalyzer = new SpectralBandAnalyzer();
        this.featureExtractor = new AudioFeatureExtractor();
        this.latencyCompensator = new HardwareLatencyCompensator();
        this.carrierToneLatencyTracker = new CarrierToneLatencyTracker();
        this.protobufMetadataLoader = new SpotifyMetadataProtobufLoader();
        this.rhythmDecoder = new SpotifyRhythmStringDecoder();
        this.webSocketClient = new SystemAudioBridgeWebSocketClient();
        this.webSocketClient.initializeConnection();

        this.energy = 0.35;
        this.bass = 0.2;
        this.mid = 0.2;
        this.treble = 0.2;
        this.subBass = 0.2;
        this.mids = 0.2;
        this.highs = 0.2;
        this.rms = 0.0;

        this.isBeat = false;
        this.isBeatPulse = false;
        this.isBar = false;
        this.is4BeatPulse = false;
        this.beatImpulse = 0.0;
        this.snareImpulse = 0.0;
        this.windGustImpulse = 0.0;
        this.beatPhase = 0.0;
        this.beatProgress = 0.0;
        this.barPhase = 0.0;
        this.beatCount = 0;
        this.barCount = 0;
        this.lastBeatTime = 0;

        this.isDrop = false;
        this.isSoft = false;
        this.softFactor = 0.0;
        this.dropFactor = 0.0;
        this.bassShake = 0.0;
        this.supernovaTrigger = false;
        this.isVocalActive = false;
        this.spectralBands = new Float32Array(32);

        this.lastProgressTimestampMs = performance.now();
        this.lastReportedProgressMs = 0;
        this.lastSupernovaTime = 0;

        SpotifyPlayerHooks.registerSpotifyPlayerEventListeners(this);
    }

    getCompensatedProgressSeconds() {
        const rawProgressSeconds = this.progress / 1000;
        if (this.carrierToneLatencyTracker && this.carrierToneLatencyTracker.isCorrectionEnabled()) {
            return this.carrierToneLatencyTracker.getCompensatedProgressSeconds(rawProgressSeconds);
        }
        if (this.latencyCompensator) {
            return this.latencyCompensator.calculateCompensatedProgressSeconds(rawProgressSeconds);
        }
        return rawProgressSeconds;
    }

    toggleLatencyCorrection() {
        if (this.carrierToneLatencyTracker) {
            const nextState = !this.carrierToneLatencyTracker.isCorrectionEnabled();
            this.carrierToneLatencyTracker.setCorrectionEnabled(nextState);
            return nextState;
        }
        return false;
    }

    isLatencyCorrectionActive() {
        return Boolean(this.carrierToneLatencyTracker && this.carrierToneLatencyTracker.isCorrectionEnabled());
    }

    isLiveAudioActive() {
        return Boolean(this.webAudioBridge && this.webAudioBridge.isAudioSourceConnected);
    }

    connectLiveSource(audioSourceNodeOrStream) {
        if (!this.webAudioBridge) return false;
        const isConnected = this.webAudioBridge.connectLiveSource(audioSourceNodeOrStream);
        if (this.webAudioBridge.audioContext && this.latencyCompensator) {
            this.latencyCompensator.setAudioContext(this.webAudioBridge.audioContext);
        }
        return isConnected;
    }

    disconnectLiveSource() {
        if (this.webAudioBridge) {
            this.webAudioBridge.disconnectLiveSource();
        }
    }

    updateTrackInfo() {
        if (typeof Spicetify === "undefined" || !Spicetify.Player) return;
        try {
            const currentItem = Spicetify.Player.data && Spicetify.Player.data.item;
            if (!currentItem) return;

            const trackUri = currentItem.uri || "";
            const trackTitle = currentItem.name || "";
            const artistName = currentItem.artists && currentItem.artists[0] ? currentItem.artists[0].name : "";
            this.trackUri = trackUri;
            this.trackDuration = currentItem.duration ? currentItem.duration.milliseconds : 180000;

            this.tempo = this.beatPhaseTracker.estimateTrackTempoFromMetadata(trackUri, trackTitle, artistName);
            this.bpm = this.tempo;

            const spotifyTrackId = trackUri.startsWith("spotify:track:") ? trackUri.split(":")[2] : "";
            if (spotifyTrackId && this.spotifyAnalysis) {
                this.spotifyAnalysis.load(spotifyTrackId);
            }
            if (trackUri && this.protobufMetadataLoader) {
                this.protobufMetadataLoader.loadMetadataForTrack(trackUri);
            }
        } catch (error) {
            console.warn("[AudioEngine] Error updating track info:", error);
        }
    }

    update(deltaTimeSeconds) {
        AudioEngineStateUpdater.update(this, deltaTimeSeconds);
    }

    applyLiveAudioFrame(liveAudioFrame) {
        this.isPlaying = true;
        this.subBass = liveAudioFrame.subBass;
        this.bass = liveAudioFrame.bass;
        this.mid = liveAudioFrame.mid;
        this.mids = liveAudioFrame.mid;
        this.treble = liveAudioFrame.treble;
        this.highs = liveAudioFrame.treble;
        this.energy = liveAudioFrame.energy;
        this.rms = liveAudioFrame.rms;

        this.isBeat = liveAudioFrame.isBeat;
        this.beatImpulse = liveAudioFrame.beatImpulse;
        this.snareImpulse = liveAudioFrame.snareImpulse;
        this.isDrop = liveAudioFrame.isDrop;
        this.isSoft = liveAudioFrame.isSoft;
        this.softFactor = liveAudioFrame.softFactor;
        this.dropFactor = liveAudioFrame.dropFactor;
        this.bassShake = liveAudioFrame.bassShake;
        this.supernovaTrigger = liveAudioFrame.supernovaTrigger;
        this.spectralBands = liveAudioFrame.spectralBands;

        this.bpm = liveAudioFrame.bpm || this.bpm;
        this.tempo = this.bpm;
        this.beatCount = liveAudioFrame.beatCount;
        this.beatPhase = liveAudioFrame.beatPhase;
        this.beatProgress = liveAudioFrame.beatProgress;
        this.barPhase = liveAudioFrame.barPhase;
        this.isBeatPulse = this.isBeat;
        this.is4BeatPulse = this.isBeat && (this.beatCount % 4 === 0);
        this.isBar = this.is4BeatPulse;
        if (this.isBeat) this.lastBeatTime = this.liveTime;
    }

    synchronizePlaybackProgressClock(deltaTimeSeconds) {
        const currentTimestampMs = performance.now();
        if (typeof Spicetify !== "undefined" && Spicetify.Player) {
            this.isPlaying = Spicetify.Player.isPlaying();
            const rawProgress = Spicetify.Player.getProgress();
            if (typeof rawProgress === "number" && !isNaN(rawProgress)) {
                if (rawProgress !== this.lastReportedProgressMs) {
                    this.lastReportedProgressMs = rawProgress;
                    this.lastProgressTimestampMs = currentTimestampMs;
                    this.progress = rawProgress;
                } else if (this.isPlaying) {
                    const elapsedMs = currentTimestampMs - this.lastProgressTimestampMs;
                    this.progress = this.lastReportedProgressMs + elapsedMs;
                }
            } else {
                this.progress += (this.isPlaying ? deltaTimeSeconds * 1000 : 0);
            }
        } else {
            this.progress += (this.isPlaying ? deltaTimeSeconds * 1000 : 0);
        }
    }

    applySpotifyAnalysisFrame(analysisData, deltaTimeSeconds) {
        this.tempo = analysisData.bpm;
        this.bpm = analysisData.bpm;
        this.beatProgress = analysisData.beatProgress;
        this.beatPhase = analysisData.beatPhase;
        this.isBeat = analysisData.isBeat;
        this.isBar = analysisData.isBar;
        this.is4BeatPulse = analysisData.is4BeatPulse;
        this.isBeatPulse = analysisData.isBeat;
        this.beatCount = analysisData.beatCount;
        this.barCount = analysisData.barCount;
        this.barPhase = analysisData.barPhase;

        const previousDrop = this.isDrop;
        this.isDrop = analysisData.isDrop;
        this.snareImpulse = analysisData.snareImpulse;
        this.beatImpulse = analysisData.beatImpulse;

        if (this.isBeat) this.lastBeatTime = this.liveTime;

        const smoothingRate = analysisData.isBeat ? 0.42 : 0.25;
        this.bass += (analysisData.bass - this.bass) * smoothingRate;
        this.mid += (analysisData.mid - this.mid) * (smoothingRate * 0.85);
        this.treble += (analysisData.treble - this.treble) * smoothingRate;
        this.energy += (analysisData.energy - this.energy) * smoothingRate;
        this.mids = this.mid;
        this.highs = this.treble;

        this.isSoft = (this.energy < 0.28 && !this.isDrop);
        this.softFactor += ((this.isSoft ? 1.0 : 0.0) - this.softFactor) * Math.min(1.0, deltaTimeSeconds * 2.5);
        this.dropFactor += ((this.isDrop ? 1.0 : 0.0) - this.dropFactor) * Math.min(1.0, deltaTimeSeconds * 4.0);

        const cooldownElapsed = (this.liveTime - this.lastSupernovaTime > 4.5);
        if (((this.isDrop && !previousDrop) || (this.isBeat && this.bass > 0.70 && this.energy > 0.50 && this.isDrop)) && cooldownElapsed) {
            this.supernovaTrigger = true;
            this.lastSupernovaTime = this.liveTime;
        }

        if (this.isBeat) {
            this.bassShake = Math.max(this.bassShake || 0, (this.isDrop ? 1.0 : 0.75) * (this.bass || 0.6));
        }
        this.bassShake = (this.bassShake || 0) * Math.pow(0.85, deltaTimeSeconds * 60);

        if (!this.spectralBands) this.spectralBands = new Float32Array(32);
        for (let bandIndex = 0; bandIndex < 32; bandIndex++) {
            const normalizedIndex = bandIndex / 31;
            const targetEnergy = normalizedIndex < 0.3 ? this.bass : (normalizedIndex < 0.7 ? this.mid : this.treble);
            const waveModulation = 0.8 + Math.sin(bandIndex * 0.5 + this.liveTime * 5) * 0.2;
            this.spectralBands[bandIndex] += (targetEnergy * waveModulation - this.spectralBands[bandIndex]) * 0.3;
        }
    }

    applyLocalRhythmicModel(playbackSeconds, deltaTimeSeconds) {
        const currentSeconds = this.isPlaying ? playbackSeconds : (this.liveTime * 0.5);
        const phase = this.beatPhaseTracker.updatePhaseProgression(currentSeconds, this.tempo);

        this.beatProgress = phase.beatPhase;
        this.beatPhase = phase.beatPhase;
        this.barPhase = phase.barPhase;
        this.isBeat = phase.isBeatOnset && this.isPlaying;
        this.isBeatPulse = this.isBeat;
        this.isBar = this.isBeat && (phase.beatInMeasure === 0);
        this.is4BeatPulse = this.isBar;
        if (this.isBeat) this.lastBeatTime = this.liveTime;

        if (this.isPlaying) {
            this.musicalFormSimulator.synthesizeRhythmicEnvelopes(this, phase, deltaTimeSeconds);
        } else {
            this.musicalFormSimulator.applyRestingState(this);
        }

        this.mids = this.mid;
        this.highs = this.treble;
    }

    applyWebSocketBridgeData() {
        if (!this.webSocketClient || !this.webSocketClient.isBridgeConnected()) return;

        this.spectralBands = this.webSocketClient.spectralBands;
        if (this.webSocketClient.spectralFlux > 0.35) {
            this.snareImpulse = Math.max(this.snareImpulse, Math.min(1.0, this.webSocketClient.spectralFlux));
        }
        if (this.webSocketClient.receivedAudioEnergy > 0) {
            this.energy = (this.energy + this.webSocketClient.receivedAudioEnergy) * 0.5;
        }
        if (this.webSocketClient.receivedBassEnergy > 0) {
            this.bass = (this.bass + this.webSocketClient.receivedBassEnergy) * 0.5;
        }
        if (this.webSocketClient.isBeat) {
            this.isBeat = true;
            this.beatImpulse = Math.max(this.beatImpulse, this.webSocketClient.beatImpulse);
        }
        if (this.webSocketClient.snareImpulse > 0) {
            this.snareImpulse = Math.max(this.snareImpulse, this.webSocketClient.snareImpulse);
        }
    }
}
