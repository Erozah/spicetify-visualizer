// src/backgrounds/CameraShakeEffect.js - Cinematic bass shake & chromatic recoil on heavy beats and drops
// SOLID Architecture: Dedicated camera impact displacement and chromatic aberration effect

export class CameraShakeEffect {
    constructor() {
        this.shakeX = 0;
        this.shakeY = 0;
        this.shakeAngle = 0;
        this.currentIntensity = 0;
        this.shakeTime = 0;
    }

    update(deltaTime, audio) {
        const targetIntensity = (audio && audio.bassShake) ? audio.bassShake : 0;
        if (targetIntensity > this.currentIntensity) {
            this.currentIntensity = targetIntensity;
        } else {
            // Slower, physically felt decay
            this.currentIntensity *= Math.pow(0.85, deltaTime * 60);
        }

        if (this.currentIntensity > 0.03) {
            this.shakeTime += deltaTime * 36;
            const isDrop = audio && audio.isDrop;
            // Up to 18px base amplitude, boosted to 28px on drops
            const maxDisplacement = (isDrop ? 28.0 : 18.0) * this.currentIntensity;

            // Harmonic wave + noise displacement for organic punch
            this.shakeX = (Math.sin(this.shakeTime * 1.8) * 0.65 + (Math.random() - 0.5) * 0.7) * maxDisplacement;
            this.shakeY = (Math.cos(this.shakeTime * 1.4) * 0.65 + (Math.random() - 0.5) * 0.7) * maxDisplacement;
            this.shakeAngle = Math.sin(this.shakeTime * 0.95) * (isDrop ? 0.018 : 0.011) * this.currentIntensity;
        } else {
            this.shakeX = 0;
            this.shakeY = 0;
            this.shakeAngle = 0;
        }
    }

    apply(ctx, centerX = null, centerY = null) {
        if (this.currentIntensity > 0.03) {
            ctx.translate(this.shakeX, this.shakeY);
            if (Math.abs(this.shakeAngle) > 0.0005 && centerX !== null && centerY !== null) {
                ctx.translate(centerX, centerY);
                ctx.rotate(this.shakeAngle);
                ctx.translate(-centerX, -centerY);
            }
        }
    }

    renderChromaticFlash(ctx, viewportWidth, viewportHeight, palette, audio = null) {
        if (this.currentIntensity > 0.18) {
            ctx.save();
            ctx.globalCompositeOperation = "screen";

            const intensity = this.currentIntensity;
            const isDrop = audio && audio.isDrop;
            const baseAlpha = Math.min(0.55, (intensity - 0.18) * 0.65 * (isDrop ? 1.5 : 1.0));

            // 1. Chromatic Edge Separation (Prismatic color aberration)
            const splitOffset = Math.max(5, this.shakeX * 2.8);

            // Primary chromatic channel shift
            ctx.fillStyle = palette.primaryAlpha ? palette.primaryAlpha(baseAlpha * 0.75) : "rgba(16, 185, 129, 0.25)";
            ctx.fillRect(splitOffset, 0, viewportWidth, viewportHeight);

            // Accent chromatic channel shift (opposing side)
            ctx.fillStyle = palette.accentAlpha ? palette.accentAlpha(baseAlpha * 0.75) : "rgba(52, 211, 153, 0.25)";
            ctx.fillRect(-splitOffset, 0, viewportWidth, viewportHeight);

            // 2. Heavy Impact / Drop Radial Vignette Flash
            if (intensity > 0.38 || isDrop) {
                const flashAlpha = Math.min(0.40, (intensity - 0.38) * 0.7 + (isDrop ? 0.20 : 0));
                const vignetteGrad = ctx.createRadialGradient(
                    viewportWidth * 0.5, viewportHeight * 0.5, viewportHeight * 0.15,
                    viewportWidth * 0.5, viewportHeight * 0.5, Math.max(viewportWidth, viewportHeight) * 0.72
                );
                vignetteGrad.addColorStop(0, "transparent");
                vignetteGrad.addColorStop(0.65, palette.primaryAlpha ? palette.primaryAlpha(flashAlpha * 0.6) : "rgba(16, 185, 129, 0.2)");
                vignetteGrad.addColorStop(1.0, palette.accentAlpha ? palette.accentAlpha(flashAlpha) : "rgba(52, 211, 153, 0.4)");
                ctx.fillStyle = vignetteGrad;
                ctx.fillRect(0, 0, viewportWidth, viewportHeight);
            }

            ctx.restore();
        }
    }
}

// Backward compatibility alias
var CameraShake = CameraShakeEffect;
