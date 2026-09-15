export class PanelBoundsSynchronizer {
    static resizeObserverInstance = null;

    static syncPanelBounds(visualizerEngine) {
        if (!visualizerEngine.canvas) return;

        const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        visualizerEngine.dpr = devicePixelRatio;
        visualizerEngine.width = window.innerWidth;
        visualizerEngine.height = window.innerHeight;

        const targetPixelWidth = Math.floor(visualizerEngine.width * devicePixelRatio);
        const targetPixelHeight = Math.floor(visualizerEngine.height * devicePixelRatio);

        if (visualizerEngine.canvas.width !== targetPixelWidth || visualizerEngine.canvas.height !== targetPixelHeight) {
            visualizerEngine.canvas.width = targetPixelWidth;
            visualizerEngine.canvas.height = targetPixelHeight;

            if (visualizerEngine.ctx && typeof visualizerEngine.ctx.setTransform === "function") {
                visualizerEngine.ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
            }

            if (visualizerEngine.env && typeof visualizerEngine.env.resize === "function") {
                visualizerEngine.env.resize(visualizerEngine.width, visualizerEngine.height);
            }
        }

        const spotifyMainViewElement = document.querySelector(".Root__main-view, .main-view-container");
        if (spotifyMainViewElement && !visualizerEngine.isFullscreen) {
            const mainViewBounds = spotifyMainViewElement.getBoundingClientRect();
            visualizerEngine.modelCenterX = mainViewBounds.left + mainViewBounds.width * 0.50;
            visualizerEngine.modelCenterY = mainViewBounds.top + mainViewBounds.height * 0.52;
        } else {
            visualizerEngine.modelCenterX = visualizerEngine.width * 0.50;
            visualizerEngine.modelCenterY = visualizerEngine.height * 0.52;
        }
    }

    static setupResizeHandling(visualizerEngine) {
        let resizeAnimationFrameId = null;

        const handleWindowResize = () => {
            if (resizeAnimationFrameId) {
                cancelAnimationFrame(resizeAnimationFrameId);
            }

            resizeAnimationFrameId = requestAnimationFrame(() => {
                this.syncPanelBounds(visualizerEngine);
                if (visualizerEngine.isFrozen && visualizerEngine.isForeground) {
                    visualizerEngine.renderFrame(0.016, true);
                }
                resizeAnimationFrameId = null;
            });
        };

        window.addEventListener("resize", handleWindowResize, { passive: true });

        if (typeof ResizeObserver !== "undefined") {
            const spotifyMainViewElement = document.querySelector(".Root__main-view, .main-view-container") || document.body;
            if (spotifyMainViewElement) {
                this.resizeObserverInstance = new ResizeObserver(() => {
                    handleWindowResize();
                });
                this.resizeObserverInstance.observe(spotifyMainViewElement);
            }
        }

        this.syncPanelBounds(visualizerEngine);
    }
}

export const syncPanelBounds = (engine) => PanelBoundsSynchronizer.syncPanelBounds(engine);
export const setupResizeHandling = (engine) => PanelBoundsSynchronizer.setupResizeHandling(engine);
