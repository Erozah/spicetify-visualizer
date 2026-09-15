// src/core/PanelBoundsSynchronizer.js - Viewport canvas sizing & observer-driven central placement
// SOLID Architecture: Dedicated viewport synchronizer using ResizeObserver on Spotify main view

export class PanelBoundsSynchronizer {
    static resizeObserverInstance = null;

    static syncPanelBounds(engine) {
        if (!engine.canvas) return;

        // Dr1mS optimization: Clamp DPR to 2.0 to prevent performance drops on 4K/HiDPI screens
        engine.dpr = Math.min(window.devicePixelRatio || 1, 2);
        engine.width = window.innerWidth;
        engine.height = window.innerHeight;

        const targetWidth = Math.floor(engine.width * engine.dpr);
        const targetHeight = Math.floor(engine.height * engine.dpr);

        if (engine.canvas.width !== targetWidth || engine.canvas.height !== targetHeight) {
            engine.canvas.width = targetWidth;
            engine.canvas.height = targetHeight;
            engine.ctx.setTransform(engine.dpr, 0, 0, engine.dpr, 0, 0);
            engine.env.resize(engine.width, engine.height);
        }

        const spotifyMainViewElement = document.querySelector(".Root__main-view, .main-view-container");
        if (spotifyMainViewElement && !engine.isFullscreen) {
            const mainViewBounds = spotifyMainViewElement.getBoundingClientRect();
            engine.pandaCenterX = mainViewBounds.left + mainViewBounds.width * 0.5;
            engine.pandaCenterY = mainViewBounds.top + mainViewBounds.height * 0.52;
        } else {
            engine.pandaCenterX = engine.width * 0.5;
            engine.pandaCenterY = engine.height * 0.52;
        }
    }

    static setupResizeHandling(engine) {
        const handleResize = () => {
            PanelBoundsSynchronizer.syncPanelBounds(engine);
            if (engine.isFrozen && engine.isForeground) {
                engine.renderFrame(0.016, true);
            }
        };

        window.addEventListener("resize", handleResize, { passive: true });

        if (typeof ResizeObserver !== "undefined") {
            const targetElement = document.querySelector(".Root__main-view, .main-view-container") || document.body;
            if (targetElement) {
                PanelBoundsSynchronizer.resizeObserverInstance = new ResizeObserver(() => {
                    handleResize();
                });
                PanelBoundsSynchronizer.resizeObserverInstance.observe(targetElement);
            }
        }

        handleResize();
    }
}

// Backward compatibility functional aliases
var syncPanelBounds = PanelBoundsSynchronizer.syncPanelBounds;
var setupResizeHandling = PanelBoundsSynchronizer.setupResizeHandling;
