import { AudioEngine } from '../audio/AudioEngine.js';
import { BackgroundManager } from '../backgrounds/BackgroundManager.js';
import { ForestBackgroundManager } from '../backgrounds/ForestBackgroundManager.js';
import { FullscreenManager } from './FullscreenManager.js';
import { GlobalKeybindings } from './GlobalKeybindings.js';
import { PaletteManager } from '../theme/PaletteManager.js';
import { PanelBoundsSynchronizer, setupResizeHandling, syncPanelBounds } from './PanelBoundsSynchronizer.js';
import { PictureInPictureWindowManager } from './PictureInPictureWindowManager.js';
import { PlaybackStateSynchronizer } from "./PlaybackStateSynchronizer.js";
import { RenderPipelineRouter, renderVisualizerFrame } from './RenderPipelineRouter.js';
import { SacredFractalMandalas } from '../backgrounds/SacredFractalMandalas.js';
import { UiStateSynchronizer, updateVisualizerUI } from './UiStateSynchronizer.js';
import { WoodenDeckPlatform } from '../backgrounds/deck/WoodenDeckPlatform.js';
import { closeSettingsDropdown } from '../ui/SettingsDropdownBuilder.js';

export class VisualizerEngine {
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext("2d", { alpha: false });
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.paletteManager = new PaletteManager();
        this.audio = new AudioEngine();
        this.env = new BackgroundManager();
        this.forestEnv = new ForestBackgroundManager();
        this.cosmicFractals = new SacredFractalMandalas();
        this.woodenDeck = new WoodenDeckPlatform();
        window.SpicetifyVisualizerModels = window.SpicetifyVisualizerModels || {};
        this.models = window.SpicetifyVisualizerModels;
        this.pipManager = new PictureInPictureWindowManager(this);

        const savedModel = typeof localStorage !== "undefined" ? localStorage.getItem("spicetify-visualizer-model") : null;
        this.activeModelId = (savedModel && this.models[savedModel]) ? savedModel : Object.keys(this.models)[0];

        const savedTheme = typeof localStorage !== "undefined" ? localStorage.getItem("spicetify-visualizer-theme") : null;
        if (savedTheme) this.paletteManager.setPalette(savedTheme, true);

        this.isForeground = false; // Always start inactive regardless of saved state
        this.isFrozen = true;
        this.loopRunning = false;
        this.isFullscreen = false;
        this.liveTime = 0;
        this.lastFrameTime = performance.now();
        this.width = window.innerWidth || 800;
        this.height = window.innerHeight || 600;
        this.modelCenterX = this.width * 0.50;
        this.modelCenterY = this.height * 0.52;

        if (this.canvas) this.canvas.style.display = this.isForeground ? "block" : "none";

        PanelBoundsSynchronizer.setupResizeHandling(this);
        GlobalKeybindings.register(this);
        FullscreenManager.register(this);
        PlaybackStateSynchronizer.register(this, "visualizer");

        this.loop = this.loop.bind(this);
        if (this.isForeground) {
            PlaybackStateSynchronizer.broadcastActivation("visualizer");
            this.updateAllUI();
        }
    }

    freeze() {
        if (!this.isForeground) return;
        this.isFrozen = true;
        this.loopRunning = false;
        this.renderFrame(0.016, true);
    }

    unfreeze() {
        if (!this.isForeground) return;
        this.isFrozen = false;
        if (!this.loopRunning) {
            this.loopRunning = true;
            this.lastFrameTime = performance.now();
            requestAnimationFrame(this.loop);
        }
    }

    toggleActive(forcedState = null) {
        this.isForeground = typeof forcedState === "boolean" ? forcedState : !this.isForeground;
        if (this.isForeground) PlaybackStateSynchronizer.broadcastActivation("visualizer");
        if (typeof localStorage !== "undefined") localStorage.setItem("spicetify-visualizer-bg-enabled", this.isForeground ? "true" : "false");
        if (this.canvas) this.canvas.style.display = this.isForeground ? "block" : "none";

        if (this.isForeground) {
            if (this.audio && typeof Spicetify !== "undefined" && Spicetify.Player) { this.audio.isPlaying = Spicetify.Player.isPlaying(); }
            (this.audio && this.audio.isPlaying) ? this.unfreeze() : this.freeze();
        } else {
            this.loopRunning = false;
            this.isFrozen = true;
            if (this.pipManager) this.pipManager.closeDetachedWindow();
            if (this.ctx && this.canvas) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            if (typeof closeSettingsDropdown === "function") closeSettingsDropdown();
        }
        this.updateAllUI();
    }

    setModel(modelIdentifier) {
        if (!this.models[modelIdentifier]) return this.activeModelId;
        this.activeModelId = modelIdentifier;
        if (typeof localStorage !== "undefined") localStorage.setItem("spicetify-visualizer-model", modelIdentifier);
        this.updateAllUI();
        if (this.isForeground && this.isFrozen) this.renderFrame(0.016, true);
        return this.activeModelId;
    }

    nextModel() {
        return this.setModel(Object.keys(this.models)[(Object.keys(this.models).indexOf(this.activeModelId) + 1) % Object.keys(this.models).length]);
    }

    setPalette(paletteIdentifier) {
        this.paletteManager.setPalette(paletteIdentifier, true);
        if (typeof localStorage !== "undefined") localStorage.setItem("spicetify-visualizer-theme", paletteIdentifier);
        this.updateAllUI();
        if (this.isForeground && this.isFrozen) this.renderFrame(0.016, true);
    }

    nextPalette() {
        const nextPalette = this.paletteManager.nextPalette();
        if (typeof localStorage !== "undefined" && nextPalette && nextPalette.id) {
            localStorage.setItem("spicetify-visualizer-theme", nextPalette.id);
        }
        this.updateAllUI();
        if (this.isForeground && this.isFrozen) this.renderFrame(0.016, true);
        return nextPalette;
    }

    toggleEffect(effectName) {
        const result = this.env.toggleEffect(effectName);
        this.updateAllUI();
        if (this.isForeground && this.isFrozen) this.renderFrame(0.016, true);
        return result;
    }

    nextBackground() {
        const result = this.env && typeof this.env.cyclePreset === "function" ? this.env.cyclePreset() : null;
        this.updateAllUI();
        if (this.isForeground && this.isFrozen) this.renderFrame(0.016, true);
        return result;
    }

    setEffect(effectName, isEnabled) {
        const result = this.env.setEffect(effectName, isEnabled);
        this.updateAllUI();
        if (this.isForeground && this.isFrozen) this.renderFrame(0.016, true);
        return result;
    }

    getEffect(effectName) {
        return this.env.getEffect(effectName);
    }

    togglePiP() {
        if (this.pipManager) {
            return this.pipManager.toggleDetachedWindow();
        }
        return false;
    }

    isPiPOpen() {
        return Boolean(this.pipManager && this.pipManager.isDetachedWindowOpen());
    }

    updateAllUI() {
        UiStateSynchronizer.updateVisualizerUI(this);
    }

    toggleFullscreen(forcedState) {
        FullscreenManager.toggle(this, forcedState);
    }

    syncBounds() {
        PanelBoundsSynchronizer.syncPanelBounds(this);
    }

    renderFrame(deltaTimeSeconds, isStatic = false) {
        RenderPipelineRouter.renderVisualizerFrame(this, deltaTimeSeconds, isStatic);
    }

    loop(currentTimestampMs) {
        if (!this.isForeground) {
            this.loopRunning = false;
            return;
        }

        const isLive = this.audio && this.audio.isLiveAudioActive();
        if (this.audio && !this.audio.isPlaying && !isLive) {
            this.freeze();
            return;
        }

        try {
            const deltaTimeSeconds = Math.min(0.10, (currentTimestampMs - this.lastFrameTime) / 1000) || 0.016;
            this.lastFrameTime = currentTimestampMs;
            this.liveTime += deltaTimeSeconds;

            if ((Math.floor(this.liveTime * 60) % 30) === 0) {
                PanelBoundsSynchronizer.syncPanelBounds(this);
            }
            if (!this.isFrozen) {
                this.renderFrame(deltaTimeSeconds, false);
            }
        } catch (loopError) {
            console.error("[SpicetifyVisualizerEngine] Animation loop error:", loopError);
            if (this.ctx && this.canvas) {
                this.ctx.save();
                this.ctx.setTransform(1,0,0,1,0,0);
                this.ctx.fillStyle = 'red';
                this.ctx.font = '20px sans-serif';
                this.ctx.fillText(loopError.toString() + " | " + loopError.stack, 20, 50);
                this.ctx.restore();
            }
        } finally {
            if (this.loopRunning && !this.isFrozen && this.isForeground) {
                requestAnimationFrame(this.loop);
            }
        }
    }

    destroy() {
        this.loopRunning = false;
        if (this.pipManager) {
            this.pipManager.closeDetachedWindow();
        }
        if (this.audio) {
            this.audio.disconnectLiveSource();
            if (this.audio.systemAudioBridge) this.audio.systemAudioBridge.disconnect();
        }
    }
}

