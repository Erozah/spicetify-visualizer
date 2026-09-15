// src/ui/CanvasMountManager.js - Persistent global wallpaper canvas mounting

/**
 * Ensures the persistent visualizer canvas is created and injected at the root of document.body.
 * Conforms to spicetify canvas guidelines:
 * - Direct prepending in document.body
 * - Fixed position, 100vw x 100vh, z-index: 0, pointer-events: none
 * - Never unmounts or recreates across song changes or navigation
 * @returns {HTMLCanvasElement}
 */
export function mountGlobalCanvas() {
    let globalCanvasElement = document.getElementById("cyber-cat-canvas");
    if (!globalCanvasElement) {
        globalCanvasElement = document.createElement("canvas");
        globalCanvasElement.id = "cyber-cat-canvas";
        globalCanvasElement.className = "cyber-cat-canvas";

        // Enforce baseline geometry styles
        globalCanvasElement.style.position = "fixed";
        globalCanvasElement.style.top = "0px";
        globalCanvasElement.style.left = "0px";
        globalCanvasElement.style.width = "100vw";
        globalCanvasElement.style.height = "100vh";
        globalCanvasElement.style.zIndex = "0";
        globalCanvasElement.style.pointerEvents = "none";
        globalCanvasElement.style.display = "none";

        if (document.body) {
            document.body.prepend(globalCanvasElement);
        } else {
            document.addEventListener("DOMContentLoaded", () => {
                if (!document.getElementById("cyber-cat-canvas")) {
                    document.body.prepend(globalCanvasElement);
                }
            });
        }
    }
    return globalCanvasElement;
}

/**
 * Returns the currently mounted visualizer canvas element or null.
 * @returns {HTMLCanvasElement|null}
 */
export function getGlobalMountedCanvas() {
    return document.getElementById("cyber-cat-canvas");
}

/**
 * Verifies if the global visualizer canvas is currently attached to the DOM.
 * @returns {boolean}
 */
export function isGlobalCanvasMounted() {
    return !!document.getElementById("cyber-cat-canvas");
}

/**
 * Ensures canvas visibility matches active state without breaking DOM structure.
 * @param {boolean} isVisualizerForeground
 */
export function setGlobalCanvasVisibility(isVisualizerForeground) {
    const canvasElement = getGlobalMountedCanvas();
    if (canvasElement) {
        canvasElement.style.display = isVisualizerForeground ? "block" : "none";
    }
}

// Backward-compatible alias
export const initializeCanvas = mountGlobalCanvas;
