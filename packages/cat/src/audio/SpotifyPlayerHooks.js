// src/audio/SpotifyPlayerHooks.js - Abstraction of Spicetify.Player events & high-resolution continuous progress clock

export class SpotifyPlayerHooks {
    constructor(audioEngineReference) {
        this.audioEngine = audioEngineReference;
        this.lastReportedProgressMs = 0;
        this.lastReportedTimestampMs = performance.now();

        this.setupPlayerEventListeners();
    }

    setupPlayerEventListeners() {
        if (typeof Spicetify === "undefined" || !Spicetify.Player) return;

        Spicetify.Player.addEventListener("onplaypause", () => {
            if (this.audioEngine) {
                const isPlaying = Spicetify.Player.isPlaying();
                const isLive = this.audioEngine.isLiveAudioActive();
                this.audioEngine.isPlaying = isPlaying || isLive;
            }
        });

        Spicetify.Player.addEventListener("onprogress", () => {
            this.updateContinuousProgressClock(0.016);
        });

        Spicetify.Player.addEventListener("songchange", () => {
            this.syncTrackMetadata();
        });
    }

    syncTrackMetadata() {
        if (typeof Spicetify === "undefined" || !Spicetify.Player || !Spicetify.Player.data) return;

        const playerTrackItem = Spicetify.Player.data.item;
        if (!playerTrackItem) return;

        const newTrackUri = playerTrackItem.uri || "";
        const newTrackName = playerTrackItem.name || "";
        const newArtistName = (playerTrackItem.artists && playerTrackItem.artists[0]) ? playerTrackItem.artists[0].name : "";
        const trackDurationMs = playerTrackItem.duration ? playerTrackItem.duration.milliseconds : 180000;

        this.audioEngine.duration = trackDurationMs;

        if (newTrackUri && (newTrackUri !== this.audioEngine.trackUri || newTrackName !== this.audioEngine.trackName)) {
            this.audioEngine.trackUri = newTrackUri;
            this.audioEngine.trackName = newTrackName;
            this.audioEngine.artistName = newArtistName;
            this.lastReportedProgressMs = 0;
            this.lastReportedTimestampMs = performance.now();

            const pseudoHash = (newTrackUri + newTrackName).split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
            this.audioEngine.tempo = 100 + (pseudoHash % 50);
            this.audioEngine.bpm = this.audioEngine.tempo;

            if (this.audioEngine.spotifyAnalysis && typeof this.audioEngine.spotifyAnalysis.load === "function") {
                this.audioEngine.spotifyAnalysis.load(newTrackUri);
            }

            const rhythmData = playerTrackItem.rhythmstring || (playerTrackItem.metadata && playerTrackItem.metadata.rhythmstring);
            if (this.audioEngine.rhythmExtractor && rhythmData) {
                this.audioEngine.rhythmExtractor.loadRhythmString(rhythmData);
            }
        }
    }

    updateContinuousProgressClock(deltaTimeSeconds) {
        const currentTimestampMs = performance.now();

        if (typeof Spicetify !== "undefined" && Spicetify.Player) {
            this.audioEngine.isPlaying = Spicetify.Player.isPlaying();
            const rawProgressMs = Spicetify.Player.getProgress();

            if (typeof rawProgressMs === "number" && !isNaN(rawProgressMs)) {
                let compensatedProgressSec = rawProgressMs / 1000;
                if (this.audioEngine.latencyCompensator) {
                    compensatedProgressSec = this.audioEngine.latencyCompensator.getCompensatedPlaybackPositionSeconds(compensatedProgressSec);
                }
                const compensatedProgressMs = compensatedProgressSec * 1000;

                if (rawProgressMs !== this.lastReportedProgressMs) {
                    this.lastReportedProgressMs = rawProgressMs;
                    this.lastReportedTimestampMs = currentTimestampMs;
                    this.audioEngine.progress = compensatedProgressMs;
                } else if (this.audioEngine.isPlaying) {
                    const elapsedSinceLastReportMs = currentTimestampMs - this.lastReportedTimestampMs;
                    this.audioEngine.progress = compensatedProgressMs + elapsedSinceLastReportMs;
                }
            } else {
                this.audioEngine.progress += (this.audioEngine.isPlaying ? deltaTimeSeconds * 1000 : 0);
            }
        } else {
            this.audioEngine.progress += (this.audioEngine.isPlaying ? deltaTimeSeconds * 1000 : 0);
        }
    }
}
