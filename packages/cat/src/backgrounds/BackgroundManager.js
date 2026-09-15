import { CURATED_BACKGROUND_PRESETS, loadPersistedBackgroundEffects, persistBackgroundEffects } from './BackgroundPresetsRegistry.js';
import { CameraShakeEffect } from './CameraShakeEffect.js';
import { CosmicNebulaLayer } from './CosmicNebulaLayer.js';
import { CosmicParticleSingularityLayer } from './CosmicParticleSingularityLayer.js';
import { CosmicStarParticle } from './CosmicStarField.js';
import { CosmicSupernovaBurst } from './CosmicSupernovaBurst.js';
import { CyberGridHorizon } from './CyberGridHorizon.js';
import { RhythmSpectrumFloor } from './RhythmSpectrumFloor.js';
import { ShockwaveRingParticle } from './ShockwaveRings.js';

export class BackgroundManager {
    constructor() {
        this.stars = [];
        this.shockwaves = [];
        this.maximumStarCount = 95;
        this.initializeStarfield(
            typeof window !== "undefined" ? window.innerWidth : 1200,
            typeof window !== "undefined" ? window.innerHeight : 800
        );

        this.grid = new CyberGridHorizon();
        this.nebula = new CosmicNebulaLayer();
        this.cameraShake = new CameraShakeEffect();
        this.supernovaBurst = new CosmicSupernovaBurst();
        this.singularityLayer = new CosmicParticleSingularityLayer();
        this.spectrumFloor = new RhythmSpectrumFloor();
        this.effects = loadPersistedBackgroundEffects();
        this.currentPresetIndex = 0;
    }

    setEffect(effectName, isEnabled) {
        if (effectName in this.effects) {
            this.effects[effectName] = Boolean(isEnabled);
            persistBackgroundEffects(this.effects);
        }
        return this.effects[effectName];
    }

    toggleEffect(effectName) {
        if (effectName in this.effects) {
            this.effects[effectName] = !this.effects[effectName];
            persistBackgroundEffects(this.effects);
        }
        return this.effects[effectName];
    }

    getEffect(effectName) {
        return Boolean(this.effects[effectName]);
    }

    getPresets() {
        return CURATED_BACKGROUND_PRESETS;
    }

    cyclePreset() {
        const presets = CURATED_BACKGROUND_PRESETS;
        this.currentPresetIndex = (this.currentPresetIndex + 1) % presets.length;
        const targetPreset = presets[this.currentPresetIndex];
        Object.assign(this.effects, targetPreset.effects);
        persistBackgroundEffects(this.effects);
        return targetPreset;
    }

    initializeStarfield(canvasViewportWidth, canvasViewportHeight) {
        this.stars = [];
        for (let starIndex = 0; starIndex < this.maximumStarCount; starIndex++) {
            this.stars.push(new CosmicStarParticle(canvasViewportWidth, canvasViewportHeight, true));
        }
    }

    handleResize(canvasViewportWidth, canvasViewportHeight) {
        this.initializeStarfield(canvasViewportWidth, canvasViewportHeight);
    }

    resize(canvasViewportWidth, canvasViewportHeight) {
        this.handleResize(canvasViewportWidth, canvasViewportHeight);
    }

    update(
        deltaTimeSeconds,
        elapsedSongTimeSeconds,
        audioStateReference,
        canvasViewportWidth,
        canvasViewportHeight,
        felineCenterCoordinateX,
        felineCenterCoordinateY
    ) {
        this.cameraShake.update(deltaTimeSeconds, audioStateReference);
        this.supernovaBurst.update(
            deltaTimeSeconds,
            audioStateReference,
            felineCenterCoordinateX,
            felineCenterCoordinateY
        );

        if (this.effects.stars) {
            for (let index = 0; index < this.stars.length; index++) {
                this.stars[index].update(
                    deltaTimeSeconds,
                    canvasViewportWidth,
                    canvasViewportHeight,
                    audioStateReference
                );
            }
        }

        if (this.effects.nebula) {
            this.nebula.update(
                deltaTimeSeconds,
                elapsedSongTimeSeconds,
                audioStateReference,
                audioStateReference.isPlaying !== false
            );
        }

        if (this.effects.shockwaves) {
            if (audioStateReference.isBeat) {
                const maxRadius = Math.min(canvasViewportWidth, canvasViewportHeight) * 0.42;
                this.shockwaves.push(
                    new ShockwaveRingParticle(felineCenterCoordinateX, felineCenterCoordinateY, maxRadius, "#00f0ff", "kick")
                );
            }
            if (audioStateReference.snareImpulse > 0.60) {
                const maxRadius = Math.min(canvasViewportWidth, canvasViewportHeight) * 0.35;
                this.shockwaves.push(
                    new ShockwaveRingParticle(felineCenterCoordinateX, felineCenterCoordinateY, maxRadius, "#ff007f", "snare")
                );
            }
            for (let shockwaveIndex = this.shockwaves.length - 1; shockwaveIndex >= 0; shockwaveIndex--) {
                if (!this.shockwaves[shockwaveIndex].update(deltaTimeSeconds)) {
                    this.shockwaves.splice(shockwaveIndex, 1);
                }
            }
        }

        if (this.effects.grid) {
            this.grid.update(deltaTimeSeconds, audioStateReference);
        }
    }

    render(
        canvasRenderingContext,
        canvasViewportWidth,
        canvasViewportHeight,
        elapsedSongTimeSeconds,
        audioStateReference,
        paletteTheme,
        felineCenterCoordinateX,
        felineCenterCoordinateY,
        sacredFractalsInstance = null
    ) {
        canvasRenderingContext.save();

        const backgroundGradient = canvasRenderingContext.createRadialGradient(
            felineCenterCoordinateX,
            felineCenterCoordinateY,
            30,
            felineCenterCoordinateX,
            felineCenterCoordinateY,
            Math.max(canvasViewportWidth, canvasViewportHeight) * 0.75
        );
        backgroundGradient.addColorStop(0, paletteTheme.ambient);
        backgroundGradient.addColorStop(1, "rgba(2, 2, 6, 0.98)");
        canvasRenderingContext.fillStyle = backgroundGradient;
        canvasRenderingContext.fillRect(0, 0, canvasViewportWidth, canvasViewportHeight);

        if (this.effects.grid) {
            this.grid.render(
                canvasRenderingContext,
                canvasViewportWidth,
                canvasViewportHeight,
                canvasViewportHeight * 0.68,
                audioStateReference,
                paletteTheme
            );
        }

        if (this.effects.nebula) {
            this.nebula.render(
                canvasRenderingContext,
                canvasViewportWidth,
                canvasViewportHeight,
                felineCenterCoordinateX,
                felineCenterCoordinateY,
                audioStateReference,
                paletteTheme,
                elapsedSongTimeSeconds
            );
        }

        if (this.effects.fractals && sacredFractalsInstance) {
            sacredFractalsInstance.render(
                canvasRenderingContext,
                felineCenterCoordinateX,
                felineCenterCoordinateY,
                Math.min(canvasViewportWidth, canvasViewportHeight) * 0.26,
                paletteTheme,
                audioStateReference
            );
        }

        if (this.effects.singularity && this.singularityLayer) {
            this.singularityLayer.render(
                canvasRenderingContext,
                canvasViewportWidth,
                canvasViewportHeight,
                felineCenterCoordinateX,
                felineCenterCoordinateY,
                audioStateReference,
                paletteTheme
            );
        }

        if (this.effects.stars) {
            canvasRenderingContext.globalCompositeOperation = "screen";
            for (let starIndex = 0; starIndex < this.stars.length; starIndex++) {
                this.stars[starIndex].render(
                    canvasRenderingContext,
                    elapsedSongTimeSeconds,
                    audioStateReference,
                    paletteTheme.core
                );
            }
        }

        if (this.effects.spectrumFloor && this.spectrumFloor) {
            const floorY = canvasViewportHeight * 0.86;
            this.spectrumFloor.render(
                canvasRenderingContext,
                canvasViewportWidth,
                canvasViewportHeight,
                floorY,
                audioStateReference,
                paletteTheme
            );
        }

        if (this.effects.shockwaves) {
            for (let shockwaveIndex = 0; shockwaveIndex < this.shockwaves.length; shockwaveIndex++) {
                this.shockwaves[shockwaveIndex].render(canvasRenderingContext);
            }
        }

        this.supernovaBurst.render(canvasRenderingContext, canvasViewportWidth, canvasViewportHeight, paletteTheme);
        this.cameraShake.renderChromaticFlash(
            canvasRenderingContext,
            canvasViewportWidth,
            canvasViewportHeight,
            paletteTheme,
            audioStateReference
        );

        canvasRenderingContext.restore();
    }
}
