import { RenderPipelineRouter } from './RenderPipelineRouter.js';

export class PictureInPictureWindowManager {
    constructor(visualizerEngine) {
        this.engine = visualizerEngine;
        this.detachedWindow = null;
        this.detachedCanvas = null;
        this.detachedCtx = null;
        this.detachedAnimationFrameId = null;
        this.isPipActive = false;
        this.lastDetachedFrameTime = performance.now();
    }

    isDetachedWindowOpen() {
        return this.isPipActive && this.detachedWindow && !this.detachedWindow.closed;
    }

    async openDetachedWindow() {
        if (this.isDetachedWindowOpen()) {
            try {
                this.detachedWindow.focus();
            } catch (focusError) {}
            return true;
        }

        let targetWindow = null;

        if (typeof window !== "undefined" && window.documentPictureInPicture && typeof window.documentPictureInPicture.requestWindow === "function") {
            try {
                targetWindow = await window.documentPictureInPicture.requestWindow({
                    width: 760,
                    height: 540
                });
            } catch (pipError) {
                console.warn("[PictureInPictureWindowManager] Document PiP request failed, using window.open:", pipError);
            }
        }

        if (!targetWindow) {
            targetWindow = window.open(
                "",
                "PandaVisualizerPopout",
                "width=760,height=540,menubar=no,toolbar=no,location=no,status=no,resizable=yes"
            );
        }

        if (!targetWindow) {
            if (typeof Spicetify !== "undefined" && Spicetify.showNotification) {
                Spicetify.showNotification("Impossible d'ouvrir la fenêtre PiP (popups bloqués)");
            }
            return false;
        }

        this.detachedWindow = targetWindow;
        this.isPipActive = true;

        const popupDocument = targetWindow.document;
        popupDocument.title = "Red Panda & Mystic Forest Visualizer";

        document.querySelectorAll("style, link[rel='stylesheet']").forEach((styleNode) => {
            try {
                popupDocument.head.appendChild(styleNode.cloneNode(true));
            } catch (styleCloneError) {}
        });

        popupDocument.body.style.margin = "0";
        popupDocument.body.style.padding = "0";
        popupDocument.body.style.overflow = "hidden";
        popupDocument.body.style.backgroundColor = "#020206";

        const canvas = popupDocument.createElement("canvas");
        canvas.id = "detached-panda-visualizer-canvas";
        canvas.style.position = "absolute";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.display = "block";
        popupDocument.body.appendChild(canvas);

        this.detachedCanvas = canvas;
        this.detachedCtx = canvas.getContext("2d", { alpha: false });

        const handleResize = () => {
            this.syncDetachedCanvasDimensions();
        };
        targetWindow.addEventListener("resize", handleResize);

        const handleClose = () => {
            this.closeDetachedWindow();
        };
        targetWindow.addEventListener("pagehide", handleClose);
        targetWindow.addEventListener("beforeunload", handleClose);

        this.syncDetachedCanvasDimensions();
        this.lastDetachedFrameTime = performance.now();
        this.startDetachedRenderLoop();

        return true;
    }

    syncDetachedCanvasDimensions() {
        if (!this.detachedCanvas || !this.detachedWindow) return;
        const width = this.detachedWindow.innerWidth || 760;
        const height = this.detachedWindow.innerHeight || 540;
        const dpr = Math.min(this.detachedWindow.devicePixelRatio || 1, 2);

        this.detachedCanvas.width = Math.floor(width * dpr);
        this.detachedCanvas.height = Math.floor(height * dpr);
    }

    startDetachedRenderLoop() {
        if (this.detachedAnimationFrameId) {
            cancelAnimationFrame(this.detachedAnimationFrameId);
        }

        const renderDetachedFrame = (currentTimestampMs) => {
            if (!this.isDetachedWindowOpen()) {
                this.closeDetachedWindow();
                return;
            }

            const deltaTimeSeconds = Math.min(0.10, (currentTimestampMs - this.lastDetachedFrameTime) / 1000) || 0.016;
            this.lastDetachedFrameTime = currentTimestampMs;

            const width = this.detachedWindow.innerWidth || 760;
            const height = this.detachedWindow.innerHeight || 540;
            const dpr = Math.min(this.detachedWindow.devicePixelRatio || 1, 2);

            RenderPipelineRouter.renderFrameToContext(
                this.engine,
                this.detachedCtx,
                width,
                height,
                deltaTimeSeconds,
                false,
                dpr
            );

            this.detachedAnimationFrameId = requestAnimationFrame(renderDetachedFrame);
        };

        this.detachedAnimationFrameId = requestAnimationFrame(renderDetachedFrame);
    }

    closeDetachedWindow() {
        if (this.detachedAnimationFrameId) {
            cancelAnimationFrame(this.detachedAnimationFrameId);
            this.detachedAnimationFrameId = null;
        }

        this.isPipActive = false;
        if (this.detachedWindow && !this.detachedWindow.closed) {
            try {
                this.detachedWindow.close();
            } catch (closeError) {}
        }
        this.detachedWindow = null;
        this.detachedCanvas = null;
        this.detachedCtx = null;
    }

    toggleDetachedWindow() {
        if (this.isDetachedWindowOpen()) {
            this.closeDetachedWindow();
            return false;
        }
        return this.openDetachedWindow();
    }
}
