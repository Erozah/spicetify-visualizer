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

        if (engine.systemAudioBridge && engine.systemAudioBridge.isBridgeActive()) {
            this.applyLiveFrame(engine, engine.systemAudioBridge.getAudioFrame());
            return;
        }

        if (engine.webAudioBridge && engine.webAudioBridge.isAudioCaptureActive) {
            try {
                const liveFrame = engine.webAudioBridge.processAudioStreamFrame(currentTimestampMs, deltaTimeSeconds);
                if (liveFrame && liveFrame.active) {
                    this.applyLiveFrame(engine, liveFrame);
                    return;
                }
            } catch (liveCaptureError) {
                console.warn("[AudioEngineStateUpdater] Live capture frame error:", liveCaptureError);
            }
        }

        engine.playerHooks.updateContinuousProgressClock(deltaTimeSeconds);

        const compensatedSeconds = engine.getCompensatedProgressSeconds();

        if (engine.protobufMetadataLoader) {
            engine.protobufMetadataLoader.queryVocalActivity(compensatedSeconds);
        }

        const spotifyFrame = engine.isPlaying ? engine.spotifyAnalysis.query(compensatedSeconds) : null;
        if (spotifyFrame) {
            if (engine.rhythmExtractor && !engine.rhythmExtractor.hasRhythmData()) {
                const rhythmString = engine.spotifyAnalysis.getRhythmString();
                if (rhythmString) {
                    engine.rhythmExtractor.loadRhythmString(rhythmString);
                }
            }
            this.applySpotifyFrame(engine, spotifyFrame, deltaTimeSeconds);
            this.applyRhythmOnsets(engine, compensatedSeconds);
            return;
        }

        this.applyLocalModel(engine, deltaTimeSeconds);
        this.applyRhythmOnsets(engine, compensatedSeconds);
    }

    static applyRhythmOnsets(engine, playbackSeconds) {
        if (!engine.isPlaying || !engine.rhythmExtractor || !engine.rhythmExtractor.hasRhythmData()) return;
        const querySeconds = typeof playbackSeconds === "number" ? playbackSeconds : engine.getCompensatedProgressSeconds();
        const onsetResult = engine.rhythmExtractor.queryRhythmOnset(querySeconds);
        if (onsetResult.isOnsetActive) {
            engine.isBeat = true;
            engine.beatImpulse = Math.max(engine.beatImpulse, onsetResult.onsetImpulseStrength);
            engine.lastBeatTime = engine.liveTime;
        }
    }

    static applyLiveFrame(engine, frame) {
        engine.isPlaying = true;
        engine.subBass = frame.subBass;
        engine.bass = frame.bass;
        engine.mid = frame.mid;
        engine.treble = frame.treble;
        engine.energy = frame.energy;
        engine.rms = frame.rms;
        engine.isBeat = frame.isBeat;
        engine.isBar = frame.isBar;
        engine.beatImpulse = frame.beatImpulse;
        engine.snareImpulse = frame.snareImpulse;
        engine.isDrop = frame.isDrop;
        engine.isSoft = frame.isSoft;
        engine.softFactor = frame.softFactor;
        engine.dropFactor = frame.dropFactor;
        engine.bassShake = frame.bassShake;
        engine.supernovaTrigger = frame.supernovaTrigger;
        engine.spectralBands = frame.spectralBands;
        engine.bpm = frame.bpm;
        engine.tempo = frame.bpm;
        engine.beatCount = frame.beatCount;
        engine.beatPhase = frame.beatPhase;
        engine.beatProgress = frame.beatProgress;
        engine.barPhase = frame.barPhase;
        this.synchronizeModelAliases(engine);
        if (engine.isBeat) engine.lastBeatTime = engine.liveTime;
    }

    static applySpotifyFrame(engine, frame, deltaTimeSeconds) {
        engine.tempo = frame.bpm;
        engine.bpm = frame.bpm;
        engine.beatProgress = frame.beatProgress;
        engine.beatPhase = frame.beatPhase;
        engine.isBeat = frame.isBeat;
        engine.isBar = frame.isBar;
        engine.beatCount = frame.beatCount;
        engine.barCount = frame.barCount;
        engine.barPhase = frame.barPhase;
        engine.isDrop = frame.isDrop;
        engine.sectionEnergy = frame.sectionEnergy;
        engine.snareImpulse = frame.snareImpulse;
        engine.beatImpulse = frame.beatImpulse;
        if (engine.isBeat) engine.lastBeatTime = engine.liveTime;

        const smoothingRate = frame.isBeat ? 0.42 : 0.25;
        engine.bass += (frame.bass - engine.bass) * smoothingRate;
        engine.mid += (frame.mid - engine.mid) * (smoothingRate * 0.85);
        engine.treble += (frame.treble - engine.treble) * smoothingRate;
        engine.energy += (frame.energy - engine.energy) * smoothingRate;

        engine.isSoft = (engine.energy < 0.28 && !engine.isDrop);
        engine.softFactor += ((engine.isSoft ? 1 : 0) - engine.softFactor) * Math.min(1, deltaTimeSeconds * 2.5);
        engine.dropFactor += ((engine.isDrop ? 1 : 0) - engine.dropFactor) * Math.min(1, deltaTimeSeconds * 4.0);
        if (engine.isBeat) {
            engine.bassShake = Math.max(engine.bassShake || 0, (engine.isDrop ? 0.95 : 0.6) * (engine.bass || 0.5));
        }
        engine.bassShake = (engine.bassShake || 0) * Math.pow(0.78, deltaTimeSeconds * 60);

        engine.spectralBands = engine.bandAnalyzer.synthesizeSpectralDistribution(
            engine.bass, engine.mid, engine.treble, engine.barPhase, engine.liveTime
        );
        this.synchronizeModelAliases(engine);
    }

    static applyLocalModel(engine, deltaTimeSeconds) {
        if (engine.isPlaying) {
            const beatIntervalSeconds = 60 / (engine.tempo || 120);
            const songSeconds = engine.getCompensatedProgressSeconds();
            const beatPhase = (songSeconds % beatIntervalSeconds) / beatIntervalSeconds;
            engine.beatProgress = beatPhase;
            engine.beatPhase = beatPhase;

            const beatIndex = Math.floor(songSeconds / beatIntervalSeconds);
            if (beatIndex !== engine.beatCount) {
                engine.beatCount = beatIndex;
                engine.isBeat = true;
                engine.lastBeatTime = engine.liveTime;
            } else {
                engine.isBeat = false;
            }

            const barProgress = engine.musicalSimulator.synthesizeRhythmicEnvelopes(engine, songSeconds, beatPhase, deltaTimeSeconds);
            engine.spectralBands = engine.bandAnalyzer.synthesizeSpectralDistribution(
                engine.bass, engine.mid, engine.treble, barProgress, engine.liveTime
            );
        } else {
            engine.musicalSimulator.applyRestingState(engine);
            engine.spectralBands = engine.bandAnalyzer.resetToRestingState();
        }
        this.synchronizeModelAliases(engine);
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

