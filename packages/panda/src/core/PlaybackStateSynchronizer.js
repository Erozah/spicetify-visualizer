export class PlaybackStateSynchronizer {
    static handlePlayPauseEvent(visualizerEngine) {
        const isMusicPlaying = typeof Spicetify !== "undefined" && Spicetify.Player && Spicetify.Player.isPlaying();
        const isLiveAudioActive = visualizerEngine.audio && visualizerEngine.audio.isLiveAudioActive && visualizerEngine.audio.isLiveAudioActive();
        if (visualizerEngine.audio) {
            visualizerEngine.audio.isPlaying = isMusicPlaying || isLiveAudioActive;
        }

        if (visualizerEngine.isForeground) {
            if (isMusicPlaying || isLiveAudioActive) {
                visualizerEngine.unfreeze();
            } else {
                visualizerEngine.freeze();
            }
        }
    }

    static handleMutualExclusionEvent(visualizerEngine, customEvent, myId) {
        const activatedVisualizerId = customEvent.detail ? customEvent.detail.id : null;
        if (activatedVisualizerId && activatedVisualizerId !== myId && visualizerEngine.isForeground) {
            visualizerEngine.toggleActive(false);
        }
    }

    static broadcastActivation(myId) {
        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("spicetify-visualizer-activated", {
                detail: { id: myId }
            }));
        }
    }

    static register(visualizerEngine, myId) {
        if (typeof Spicetify !== "undefined" && Spicetify.Player) {
            Spicetify.Player.addEventListener("onplaypause", () => {
                this.handlePlayPauseEvent(visualizerEngine);
            });
        }

        if (typeof window !== "undefined") {
            window.addEventListener("spicetify-visualizer-activated", (customEvent) => {
                this.handleMutualExclusionEvent(visualizerEngine, customEvent, myId);
            });
        }
    }
}
