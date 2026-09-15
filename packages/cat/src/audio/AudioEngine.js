import { AudioEngineStateUpdater } from './AudioEngineStateUpdater.js';
import { AudioFeatureExtractor } from './AudioFeatureExtractor.js';
import { BeatPhaseTracker } from './BeatPhaseTracker.js';
import { CarrierToneLatencyTracker } from './CarrierToneLatencyTracker.js';
import { HardwareLatencyCompensator } from './HardwareLatencyCompensator.js';
import { MusicalFormSimulator } from './MusicalFormSimulator.js';
import { RhythmStringOnsetsExtractor } from './RhythmStringOnsetsExtractor.js';
import { SpectralBandAnalyzer } from './SpectralBandAnalyzer.js';
import { SpotifyAnalysisTrackLoader } from './SpotifyAnalysisTrackLoader.js';
import { SpotifyMetadataProtobufLoader } from './SpotifyMetadataProtobufLoader.js';
import { SpotifyPlayerHooks } from './SpotifyPlayerHooks.js';
import { SystemAudioBridgeWebSocketClient } from './SystemAudioBridgeWebSocketClient.js';
import { WebAudioStreamBridge } from './WebAudioStreamBridge.js';

export class AudioEngine {
    constructor() {
        this.isPlaying = false;
        this.progress = 0;
        this.duration = 0;
        this.trackUri = "";
        this.trackName = "";
        this.artistName = "";
        this.liveTime = 0;

        this.subBass = 0.1;
        this.bass = 0.1;
        this.mid = 0.1;
        this.treble = 0.1;
        this.energy = 0.1;
        this.rms = 0.1;

        this.tempo = 120;
        this.bpm = 120;
        this.beatProgress = 0;
        this.beatPhase = 0;
        this.beatImpulse = 0;
        this.isBeat = false;
        this.beatCount = 0;
        this.lastBeatTime = 0;

        this.isBar = false;
        this.barCount = 0;
        this.barPhase = 0;
        this.isDrop = false;
        this.sectionEnergy = 0.5;
        this.snareImpulse = 0;

        this.isSoft = false;
        this.softFactor = 0.5;
        this.dropFactor = 0.0;
        this.bassShake = 0.0;
        this.supernovaTrigger = false;
        this.spectralBands = new Float32Array(32);

        this.mids = 0.1;
        this.highs = 0.1;
        this.isBeatPulse = false;
        this.is4BeatPulse = false;

        this.carrierToneLatencyTracker = new CarrierToneLatencyTracker();
        this.featureExtractor = new AudioFeatureExtractor();
        this.phaseTracker = new BeatPhaseTracker();
        this.bandAnalyzer = new SpectralBandAnalyzer();
        this.musicalSimulator = new MusicalFormSimulator();
        this.webAudioBridge = new WebAudioStreamBridge(this.featureExtractor, this.phaseTracker, this.bandAnalyzer);
        this.latencyCompensator = new HardwareLatencyCompensator();
        this.spotifyAnalysis = new SpotifyAnalysisTrackLoader();
        this.protobufMetadataLoader = new SpotifyMetadataProtobufLoader();
        this.rhythmExtractor = new RhythmStringOnsetsExtractor();
        this.systemAudioBridge = new SystemAudioBridgeWebSocketClient();
        this.systemAudioBridge.connect();
        this.playerHooks = new SpotifyPlayerHooks(this);

        if (this.webAudioBridge.autoConnectSavedPreference) {
            setTimeout(() => {
                this.webAudioBridge.startMicrophoneCapture().catch(() => {});
            }, 1000);
        }
    }

    getCompensatedProgressSeconds() {
        const rawSeconds = this.progress / 1000;
        if (this.carrierToneLatencyTracker && this.carrierToneLatencyTracker.isCorrectionEnabled()) {
            return this.carrierToneLatencyTracker.getCompensatedProgressSeconds(rawSeconds);
        }
        return rawSeconds;
    }

    isVocalActive() {
        return Boolean(this.protobufMetadataLoader && this.protobufMetadataLoader.isVocalActive);
    }

    toggleLatencyCorrection() {
        if (this.carrierToneLatencyTracker) {
            const newState = !this.carrierToneLatencyTracker.isCorrectionEnabled();
            this.carrierToneLatencyTracker.setCorrectionEnabled(newState);
            return newState;
        }
        return false;
    }

    isLatencyCorrectionActive() {
        return Boolean(this.carrierToneLatencyTracker && this.carrierToneLatencyTracker.isCorrectionEnabled());
    }

    update(deltaTimeSeconds) {
        AudioEngineStateUpdater.update(this, deltaTimeSeconds);
    }

    syncModelAliases() {
        AudioEngineStateUpdater.synchronizeModelAliases(this);
    }

    async toggleLiveAudio() {
        if (this.webAudioBridge.isAudioCaptureActive) {
            this.webAudioBridge.stopMicrophoneCapture();
            return false;
        }
        return await this.webAudioBridge.startMicrophoneCapture();
    }

    isLiveAudioActive() {
        return Boolean(this.webAudioBridge && this.webAudioBridge.isAudioCaptureActive);
    }

    connectLiveSource(audioSourceNodeOrStream) {
        return this.webAudioBridge.connectAudioSource(audioSourceNodeOrStream);
    }

    disconnectLiveSource() {
        this.webAudioBridge.disconnectAudioSource();
    }
}
