import { PanelBoundsSynchronizer, syncPanelBounds } from './PanelBoundsSynchronizer.js';

export class FullscreenManager {
    static toastTimer = null;

    static showToast() {
        let toastElement = document.getElementById("cyber-cat-fs-hint");
        if (!toastElement) {
            toastElement = document.createElement("div");
            toastElement.id = "cyber-cat-fs-hint";
            toastElement.textContent = "Cliquez n'importe où pour quitter le plein écran";
            document.body.appendChild(toastElement);
        }
        toastElement.classList.add("visible");
        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => {
            toastElement.classList.remove("visible");
        }, 3200);
    }

    static isSpotifyFullscreenTrigger(clickTarget) {
        if (!clickTarget || typeof clickTarget.closest !== "function") return false;

        const isVisualizerControl = clickTarget.closest(
            "#cosmic-cat-settings-dropdown, .cosmic-cat-settings-dropdown, #cosmic-cat-toggle-btn, #cosmic-cat-settings-btn, #cyber-cat-fs-hint"
        );
        if (isVisualizerControl) return false;

        const isNativeFullscreenButton = clickTarget.closest(
            '[data-testid="fullscreen-button"], [data-testid="npv-fullscreen-button"], [data-testid="video-player-fullscreen-button"], .main-fullScreenButton-button'
        );
        if (isNativeFullscreenButton) return true;

        const buttonElement = clickTarget.closest('button, [role="button"]');
        if (buttonElement) {
            const ariaLabelText = (buttonElement.getAttribute("aria-label") || "").toLowerCase();
            const titleText = (buttonElement.getAttribute("title") || "").toLowerCase();
            if (ariaLabelText.includes("plein écran") || ariaLabelText.includes("fullscreen") ||
                titleText.includes("plein écran") || titleText.includes("fullscreen")) {
                return true;
            }
        }

        const isVideoContainer = clickTarget.closest(
            '.Root__right-sidebar video, .main-nowPlayingView-container video, [data-testid="npv-cover-art"] video, .main-nowPlayingView-coverArt video, .main-trackInfo-container video, .main-fullScreenVideo-container'
        );
        return Boolean(isVideoContainer);
    }

    static register(visualizerEngine) {
        window.addEventListener("click", (clickEvent) => {
            if (!visualizerEngine) return;

            if (visualizerEngine.isFullscreen) {
                clickEvent.preventDefault();
                clickEvent.stopPropagation();
                clickEvent.stopImmediatePropagation();
                visualizerEngine.toggleFullscreen(false);
                return;
            }

            if (visualizerEngine.isForeground && this.isSpotifyFullscreenTrigger(clickEvent.target)) {
                clickEvent.preventDefault();
                clickEvent.stopPropagation();
                clickEvent.stopImmediatePropagation();
                visualizerEngine.toggleFullscreen(true);
            }
        }, true);
    }

    static toggle(visualizerEngine, forcedFullscreenState) {
        visualizerEngine.isFullscreen = typeof forcedFullscreenState === "boolean"
            ? forcedFullscreenState
            : !visualizerEngine.isFullscreen;

        if (visualizerEngine.isFullscreen && !visualizerEngine.isForeground) {
            visualizerEngine.toggleActive(true);
        }

        if (typeof document !== "undefined" && document.body) {
            document.body.classList.toggle("cyber-cat-fullscreen-active", visualizerEngine.isFullscreen);
        }

        PanelBoundsSynchronizer.syncPanelBounds(visualizerEngine);

        if (visualizerEngine.isFullscreen) {
            this.showToast();
            try {
                document.querySelectorAll("video").forEach((videoElement) => {
                    if (videoElement && typeof videoElement.pause === "function") videoElement.pause();
                });
            } catch (error) {}
        }
    }
}

export const toggleVisualizerFullscreen = (engine, forcedState) => FullscreenManager.toggle(engine, forcedState);
export const setupFullscreenClickHandler = (engine) => FullscreenManager.register(engine);
export const showFullscreenNotificationToast = () => FullscreenManager.showToast();
