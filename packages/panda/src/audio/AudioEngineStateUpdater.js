export class AudioEngineStateUpdater {
    static lastTrackUri = "";

    static update(engine, deltaTimeSeconds) {
        engine.liveTime += deltaTimeSeconds;
        const currentTimestampMs = performance.now();

        if (engine.trackUri && engine.trackUri !== this.lastTrackUri) {
            this.lastTrackUri = engine.trackUri;
            if (engine.protobufMetadataLoader) {
                engine.protobufMetadataLoader.loadMetadataForTrack(engine.trackUri);
            }
        }

        if (engine.webSocketClient && engine.webSocketClient.isBridgeConnected && engine.webSocketClient.isBridgeConnected()) {
            engine.applyWebSocketBridgeData();
        }

        if (engine.isLiveAudioActive()) {
            const liveAudioFrame = engine.webAudioBridge.update(deltaTimeSeconds, engine.liveTime);
            if (liveAudioFrame && liveAudioFrame.active) {
                engine.applyLiveAudioFrame(liveAudioFrame);
                return;
            }
        }

        engine.synchronizePlaybackProgressClock(deltaTimeSeconds);

        const compensatedProgressSeconds = engine.getCompensatedProgressSeconds();

        if (engine.protobufMetadataLoader) {
            engine.isVocalActive = engine.protobufMetadataLoader.queryVocalActivity(compensatedProgressSeconds);
        }

        const analysisData = engine.isPlaying ? engine.spotifyAnalysis.query(compensatedProgressSeconds) : null;
        if (analysisData) {
            if (engine.rhythmDecoder && !engine.rhythmDecoder.hasRhythmData()) {
                const rhythmString = engine.spotifyAnalysis.getRhythmString ? engine.spotifyAnalysis.getRhythmString() : null;
                if (rhythmString) {
                    engine.rhythmDecoder.loadRhythmString(rhythmString);
                }
            }
            engine.applySpotifyAnalysisFrame(analysisData, deltaTimeSeconds);
            this.applyRhythmDecoderOnsets(engine, compensatedProgressSeconds);
            engine.applyWebSocketBridgeData();
            return;
        }

        engine.applyLocalRhythmicModel(compensatedProgressSeconds, deltaTimeSeconds);
        this.applyRhythmDecoderOnsets(engine, compensatedProgressSeconds);
        engine.applyWebSocketBridgeData();
    }

    static applyRhythmDecoderOnsets(engine, playbackSeconds) {
        if (!engine.isPlaying || !engine.rhythmDecoder || !engine.rhythmDecoder.hasRhythmData()) return;

        const mainOnset = engine.rhythmDecoder.queryRhythmOnset(playbackSeconds);
        if (mainOnset.isOnsetActive) {
            engine.isBeat = true;
            engine.beatImpulse = Math.max(engine.beatImpulse, mainOnset.onsetImpulseStrength);
            engine.lastBeatTime = engine.liveTime;
        }

        const channel0 = engine.rhythmDecoder.queryChannelOnset(0, playbackSeconds);
        if (channel0.isOnsetActive) {
            engine.snareImpulse = Math.max(engine.snareImpulse, channel0.onsetImpulseStrength);
        }

        const channel1 = engine.rhythmDecoder.queryChannelOnset(1, playbackSeconds);
        if (channel1.isOnsetActive) {
            engine.windGustImpulse = Math.max(engine.windGustImpulse || 0, channel1.onsetImpulseStrength);
        }
    }

    static synchronizeModelAliases(engine) {
        engine.mids = engine.mid;
        engine.highs = engine.treble;
        engine.isBeatPulse = engine.isBeat;
        engine.is4BeatPulse = engine.isBeat && (engine.beatCount % 4 === 0);
        engine.isBar = engine.is4BeatPulse;
        engine.bpm = engine.tempo;
    }
}
