// src/audio/SpotifyPlayerHooks.js - Spicetify Player event abstraction and state synchronization

export class SpotifyPlayerHooks {
    static registerSpotifyPlayerEventListeners(audioEngine) {
        if (typeof Spicetify === "undefined" || !Spicetify.Player) return;

        try {
            audioEngine.isPlaying = Spicetify.Player.isPlaying();

            Spicetify.Player.addEventListener("onplaypause", () => {
                audioEngine.isPlaying = Spicetify.Player.isPlaying();
            });

            Spicetify.Player.addEventListener("onprogress", (event) => {
                if (event && event.data) {
                    audioEngine.progress = event.data;
                }
            });

            Spicetify.Player.addEventListener("songchange", () => {
                audioEngine.updateTrackInfo();
            });

            audioEngine.updateTrackInfo();
        } catch (error) {
            console.warn("[SpotifyPlayerHooks] Failed to register Spotify player hooks:", error);
        }
    }
}

// Backward-compatible function alias
export const setupSpotifyHooks = SpotifyPlayerHooks.registerSpotifyPlayerEventListeners;
