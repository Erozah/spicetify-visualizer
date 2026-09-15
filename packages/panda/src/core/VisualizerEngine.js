import { PlaybackStateSynchronizer } from "./PlaybackStateSynchronizer.js";
import { AudioEngine } from '../audio/AudioEngine.js';
import { BackgroundManager } from '../backgrounds/BackgroundManager.js';
import { DynamicAlbumColorExtractor } from '../theme/DynamicAlbumColorExtractor.js';
import { FullscreenManager } from './FullscreenManager.js';
import { GlobalKeybindings } from './GlobalKeybindings.js';
import { PaletteManager } from '../theme/PaletteManager.js';
import { PanelBoundsSynchronizer } from './PanelBoundsSynchronizer.js';
import { PictureInPictureWindowManager } from './PictureInPictureWindowManager.js';
import { RedPanda } from '../models/redpanda/RedPanda.js';
import { RenderPipelineRouter, renderVisualizerFrame } from './RenderPipelineRouter.js';
import { UiStateSynchronizer, updateVisualizerUI } from './UiStateSynchronizer.js';

export class PandaVisualizerEngine {
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d', { alpha: false });
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);

        this.paletteManager = new PaletteManager();
        this.dynamicColorExtractor = new DynamicAlbumColorExtractor(this.paletteManager);
        this.audio = new AudioEngine();
        this.env = new BackgroundManager();
        this.model = new RedPanda();
        this.pipManager = new PictureInPictureWindowManager(this);

        const savedTheme = (typeof localStorage !== 'undefined')
            ? localStorage.getItem('panda-visualizer-theme')
            : null;
        if (savedTheme) {
            this.paletteManager.setPalette(savedTheme, true);
        } else {
            this.paletteManager.setPalette('bamboo', true);
        }

        const savedActive = (typeof localStorage !== 'undefined')
            ? (localStorage.getItem('panda-visualizer-bg-enabled') === 'true')
            : false;
        this.isForeground = savedActive;
        this.isFrozen = true;
        this.loopRunning = false;
        this.isFullscreen = false;

        this.liveTime = 0;
        this.lastFrameTime = performance.now();

        this.width = window.innerWidth || 800;
        this.height = window.innerHeight || 600;
        this.pandaCenterX = this.width * 0.5;
        this.pandaCenterY = this.height * 0.52;

        if (typeof document !== 'undefined' && document.body) {
            document.body.classList.toggle('panda-visualizer-active', this.isForeground);
        }

        if (this.canvas) {
            this.canvas.style.display = this.isForeground ? 'block' : 'none';
        }

        PanelBoundsSynchronizer.setupResizeHandling(this);
        GlobalKeybindings.register(this);
        FullscreenManager.register(this);



        PlaybackStateSynchronizer.register(this, "panda");
        this.loop = this.loop.bind(this);
        if (this.isForeground) {
            if (this.audio && typeof Spicetify !== "undefined" && Spicetify.Player) { this.audio.isPlaying = Spicetify.Player.isPlaying(); }
            const isPlaying = this.audio && this.audio.isPlaying;
            if (isPlaying) {
                this.unfreeze();
            } else {
                this.freeze();
            }
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

    syncBounds() {
        PanelBoundsSynchronizer.syncPanelBounds(this);
    }

    toggleActive(forcedState) {
        const nextActive = typeof forcedState === 'boolean' ? forcedState : !this.isForeground;
        this.isForeground = nextActive;

        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('panda-visualizer-bg-enabled', this.isForeground ? 'true' : 'false');
        }

        if (typeof document !== 'undefined' && document.body) {
            document.body.classList.toggle('panda-visualizer-active', this.isForeground);
        }

        if (this.isForeground) {
            if (this.canvas) {
                this.canvas.style.display = 'block';
            }
            if (this.audio && typeof Spicetify !== "undefined" && Spicetify.Player) { this.audio.isPlaying = Spicetify.Player.isPlaying(); }
            const isPlaying = this.audio && this.audio.isPlaying;
            if (isPlaying) {
                this.unfreeze();
            } else {
                this.freeze();
            }
        } else {
            this.loopRunning = false;
            this.isFrozen = true;
            if (this.canvas) {
                this.canvas.style.display = 'none';
            }
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            if (typeof closeSettingsDropdown === 'function') {
                closeSettingsDropdown();
            }
        }

        this.updateAllUI();
    }

    get isActive() {
        return this.isForeground;
    }

    togglePictureInPicture() {
        if (this.pipManager) {
            return this.pipManager.toggleDetachedWindow();
        }
        return false;
    }

    isPictureInPictureActive() {
        return Boolean(this.pipManager && this.pipManager.isDetachedWindowOpen());
    }

    setPalette(paletteIdentifier) {
        this.paletteManager.setPalette(paletteIdentifier, true);
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('panda-visualizer-theme', paletteIdentifier);
        }
        this.updateAllUI();
        if (this.isForeground && this.isFrozen) this.renderFrame(0.016, true);
    }

    nextPalette() {
        const nextPalette = this.paletteManager.nextPalette();
        if (typeof localStorage !== 'undefined' && nextPalette && nextPalette.id) {
            localStorage.setItem('panda-visualizer-theme', nextPalette.id);
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

    setEffect(effectName, isEnabled) {
        const result = this.env.setEffect(effectName, isEnabled);
        this.updateAllUI();
        if (this.isForeground && this.isFrozen) this.renderFrame(0.016, true);
        return result;
    }

    getEffect(effectName) {
        return this.env.getEffect(effectName);
    }

    updateAllUI() {
        UiStateSynchronizer.updateVisualizerUI(this);
    }

    toggleFullscreen(forcedState) {
        FullscreenManager.toggle(this, forcedState);
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
            const deltaTimeSeconds = Math.min(0.1, (currentTimestampMs - this.lastFrameTime) / 1000) || 0.016;
            this.lastFrameTime = currentTimestampMs;
            this.liveTime += deltaTimeSeconds;

            if (this.isFrozen) return;

            this.renderFrame(deltaTimeSeconds, false);
        } catch (loopError) {
            console.error('[PandaVisualizerEngine] Loop error:', loopError);
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
            if (this.audio.webSocketClient && this.audio.webSocketClient.disconnect) {
                this.audio.webSocketClient.disconnect();
            }
        }
    }
}

export const VisualizerEngine = PandaVisualizerEngine;
