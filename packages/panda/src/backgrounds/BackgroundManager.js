import { CameraShakeEffect } from './CameraShakeEffect.js';
import { EqualizerSpectralWaves } from './EqualizerSpectralWaves.js';
import { MossyPerchPlatform } from './MossyPerchPlatform.js';
import { MysticForest } from './forest/MysticForest.js';
import { ShockwaveRings } from './ShockwaveRings.js';
import { SupernovaDropBurst } from './SupernovaDropBurst.js';
import { VolumetricGodraysLayer } from './VolumetricGodraysLayer.js';

export class BackgroundManager {
    constructor() {
        this.shockwaves = [];

        this.forest = new MysticForest(
            typeof window !== "undefined" ? window.innerWidth : 1200,
            typeof window !== "undefined" ? window.innerHeight : 800
        );
        this.godrays = new VolumetricGodraysLayer();
        this.equalizer = new EqualizerSpectralWaves();
        this.cameraShake = new CameraShakeEffect();
        this.supernova = new SupernovaDropBurst();
        this.perch = new MossyPerchPlatform();

        this.effects = {
            forest: true,
            perch: true,
            godrays: true,
            leaves: true,
            spores: true,
            webglSwarm: true,
            spectrum: true,
            spectrumMode: "wave",
            shockwaves: true,
            shake: true,
            supernova: true
        };

        this.loadSettings();
    }

    loadSettings() {
        try {
            if (typeof localStorage !== "undefined") {
                const savedSettings = localStorage.getItem("panda-visualizer-effects");
                if (savedSettings) {
                    Object.assign(this.effects, JSON.parse(savedSettings));
                }
            }
        } catch (storageError) {
            console.warn("[BackgroundManager] Failed to load effects:", storageError);
        }
    }

    saveSettings() {
        try {
            if (typeof localStorage !== "undefined") {
                localStorage.setItem("panda-visualizer-effects", JSON.stringify(this.effects));
            }
        } catch (storageError) {
            console.warn("[BackgroundManager] Failed to save effects:", storageError);
        }
    }

    setEffect(effectName, isEnabled) {
        if (effectName in this.effects) {
            this.effects[effectName] = isEnabled;
            this.saveSettings();
        }
        return this.effects[effectName];
    }

    toggleEffect(effectName) {
        if (effectName in this.effects) {
            if (effectName === "spectrumMode") {
                this.effects.spectrumMode = this.effects.spectrumMode === "bars" ? "wave" : "bars";
            } else {
                this.effects[effectName] = !this.effects[effectName];
            }
            this.saveSettings();
        }
        return this.effects[effectName];
    }

    getEffect(effectName) {
        return this.effects[effectName];
    }

    spawnShockwave(originX, originY, maximumRadius, colorRgba, triggerType = "kick") {
        if (this.shockwaves.length < 12) {
            this.shockwaves.push(new ShockwaveRings(originX, originY, maximumRadius, colorRgba, triggerType));
        }
    }

    resize(viewportWidth, viewportHeight) {
        if (this.forest && typeof this.forest.resize === "function") {
            this.forest.resize(viewportWidth, viewportHeight);
        }
    }

    update(deltaTimeSeconds, viewportWidth, viewportHeight, audioState, paletteTheme, pandaCenterX, pandaCenterY) {
        const isMusicPlaying = Boolean(audioState && audioState.isPlaying);

        if (this.effects.shake && this.cameraShake) {
            this.cameraShake.update(deltaTimeSeconds, audioState);
        }

        if (this.effects.godrays && this.godrays) {
            this.godrays.update(deltaTimeSeconds, audioState, isMusicPlaying);
        }

        if (this.effects.forest && this.forest) {
            this.forest.update(deltaTimeSeconds, audioState, isMusicPlaying);
        }

        if (this.effects.spectrum && this.equalizer) {
            this.equalizer.setMode(this.effects.spectrumMode || "wave");
            this.equalizer.update(deltaTimeSeconds, audioState, isMusicPlaying);
        }

        if (this.effects.supernova && this.supernova) {
            this.supernova.update(deltaTimeSeconds, audioState, pandaCenterX, pandaCenterY);
        }

        if (this.effects.shockwaves && isMusicPlaying) {
            const overallEnergy = audioState.energy || 0.35;
            if ((audioState.isBeat && audioState.bass > 0.48 && overallEnergy > 0.28) || (audioState.beatImpulse > 0.75)) {
                this.spawnShockwave(pandaCenterX, pandaCenterY, Math.min(viewportWidth, viewportHeight) * 0.52, paletteTheme.shockwave, "kick");
            }
            if (audioState.snareImpulse > 0.65 && overallEnergy > 0.28) {
                this.spawnShockwave(pandaCenterX, pandaCenterY, Math.min(viewportWidth, viewportHeight) * 0.45, paletteTheme.accent, "snare");
            }
            for (let index = this.shockwaves.length - 1; index >= 0; index--) {
                if (!this.shockwaves[index].update(deltaTimeSeconds)) {
                    this.shockwaves.splice(index, 1);
                }
            }
        }
    }

    render(canvasRenderingContext, viewportWidth, viewportHeight, animationTimeSeconds, audioState, paletteTheme, pandaCenterX, pandaCenterY) {
        canvasRenderingContext.save();

        const ambientGradient = canvasRenderingContext.createRadialGradient(
            pandaCenterX, pandaCenterY, 30,
            pandaCenterX, pandaCenterY, Math.max(viewportWidth, viewportHeight) * 0.75
        );
        ambientGradient.addColorStop(0, paletteTheme.ambient);
        ambientGradient.addColorStop(1, "rgba(2, 2, 6, 0.98)");
        canvasRenderingContext.fillStyle = ambientGradient;
        canvasRenderingContext.fillRect(0, 0, viewportWidth, viewportHeight);

        if (this.effects.godrays && this.godrays) {
            this.godrays.render(canvasRenderingContext, viewportWidth, viewportHeight, pandaCenterX, pandaCenterY, audioState, paletteTheme);
        }

        if (this.effects.forest && this.forest) {
            this.forest.render(canvasRenderingContext, viewportWidth, viewportHeight, animationTimeSeconds, audioState, paletteTheme, pandaCenterX, pandaCenterY, this.effects);
        }

        if (this.effects.spectrum && this.equalizer) {
            const floorCoordinateY = viewportHeight * 0.88;
            this.equalizer.render(canvasRenderingContext, viewportWidth, viewportHeight, floorCoordinateY, audioState, paletteTheme, this.effects.spectrumMode);
        }

        const isDrop = Boolean(audioState && audioState.isDrop);
        const dropMultiplier = isDrop ? 1.4 : 1.0;
        const auraRadius = (130 + (audioState.bass || 0) * 35) * dropMultiplier;
        canvasRenderingContext.save();
        canvasRenderingContext.globalCompositeOperation = "lighter";
        canvasRenderingContext.strokeStyle = isDrop ? paletteTheme.accent : paletteTheme.primary;
        canvasRenderingContext.lineWidth = 1.0 + (isDrop ? 0.8 : 0);
        canvasRenderingContext.globalAlpha = Math.min(0.45, (0.12 + (audioState.bass || 0) * 0.15) * dropMultiplier);
        canvasRenderingContext.beginPath();
        canvasRenderingContext.arc(pandaCenterX, pandaCenterY, auraRadius, 0, Math.PI * 2);
        canvasRenderingContext.stroke();
        canvasRenderingContext.restore();

        if (this.effects.shockwaves) {
            for (let index = 0; index < this.shockwaves.length; index++) {
                this.shockwaves[index].render(canvasRenderingContext);
            }
        }

        canvasRenderingContext.restore();
    }
}
