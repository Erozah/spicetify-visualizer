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
                "SpicetifyVisualizerPopout",
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
        popupDocument.title = "Cyber & Cosmic Spicetify Visualizer";

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
        canvas.id = "detached-cat-visualizer-canvas";
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
        if (this.detachedCtx) {
            this.detachedCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
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
            const centerX = width * 0.5;
            const centerY = height * 0.52;

            const ctx = this.detachedCtx;
            const palette = this.engine.paletteManager.active;
            const audio = this.engine.audio;

            ctx.save();
            this.engine.env.render(
                ctx,
                width,
                height,
                this.engine.liveTime,
                audio,
                palette,
                centerX,
                centerY,
                this.engine.cosmicFractals
            );

            if (this.engine.env.effects && this.engine.env.effects.deck) {
                const deckHorizonY = height * 0.86;
                this.engine.woodenDeck.render(
                    ctx,
                    width,
                    height,
                    deckHorizonY,
                    palette,
                    audio,
                    centerX
                );
            }

            const activeModel = this.engine.models[this.engine.activeModelId] || Object.values(this.engine.models)[0];
            const catScale = Math.min(1.20, Math.max(0.65, Math.min(width / 950, height / 700)));

            if (activeModel && activeModel.render) {
                activeModel.render(
                    ctx,
                    centerX,
                    centerY,
                    catScale,
                    this.engine.liveTime,
                    audio,
                    palette,
                    this.engine.env.effects,
                    width,
                    height
                );
            }
            ctx.restore();

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
