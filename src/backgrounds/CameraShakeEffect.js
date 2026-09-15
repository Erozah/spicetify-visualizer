// src/backgrounds/CameraShakeEffect.js - Cinematic camera recoil, harmonic vibration & chromatic impact flashes

export class CameraShakeEffect {
    constructor() {
        this.displacementOffsetX = 0;
        this.displacementOffsetY = 0;
        this.cameraRotationAngle = 0;
        this.currentShakeIntensity = 0;
        this.oscillationTimerSeconds = 0;
    }

    update(deltaTimeSeconds, audioStateReference) {
        const targetShakeLevel = (audioStateReference && audioStateReference.bassShake)
            ? audioStateReference.bassShake
            : 0;

        if (targetShakeLevel > this.currentShakeIntensity) {
            this.currentShakeIntensity = targetShakeLevel;
        } else {
            this.currentShakeIntensity *= Math.pow(0.85, deltaTimeSeconds * 60);
        }

        if (this.currentShakeIntensity > 0.03) {
            this.oscillationTimerSeconds += deltaTimeSeconds * 36;
            const isHeavyDrop = audioStateReference && audioStateReference.isDrop;
            const maximumPixelDisplacement = (isHeavyDrop ? 28.0 : 18.0) * this.currentShakeIntensity;

            this.displacementOffsetX = (
                Math.sin(this.oscillationTimerSeconds * 1.8) * 0.65 +
                (Math.random() - 0.5) * 0.7
            ) * maximumPixelDisplacement;

            this.displacementOffsetY = (
                Math.cos(this.oscillationTimerSeconds * 1.4) * 0.65 +
                (Math.random() - 0.5) * 0.7
            ) * maximumPixelDisplacement;

            this.cameraRotationAngle = Math.sin(this.oscillationTimerSeconds * 0.95) *
                (isHeavyDrop ? 0.018 : 0.011) * this.currentShakeIntensity;
        } else {
            this.displacementOffsetX = 0;
            this.displacementOffsetY = 0;
            this.cameraRotationAngle = 0;
        }
    }

    applyCameraTransform(canvasRenderingContext, felineCenterCoordinateX = null, felineCenterCoordinateY = null) {
        if (this.currentShakeIntensity > 0.03) {
            canvasRenderingContext.translate(this.displacementOffsetX, this.displacementOffsetY);
            if (Math.abs(this.cameraRotationAngle) > 0.0005 && felineCenterCoordinateX !== null && felineCenterCoordinateY !== null) {
                canvasRenderingContext.translate(felineCenterCoordinateX, felineCenterCoordinateY);
                canvasRenderingContext.rotate(this.cameraRotationAngle);
                canvasRenderingContext.translate(-felineCenterCoordinateX, -felineCenterCoordinateY);
            }
        }
    }

    renderChromaticFlash(canvasRenderingContext, canvasViewportWidth, canvasViewportHeight, paletteTheme, audioStateReference = null) {
        if (this.currentShakeIntensity <= 0.18) return;

        canvasRenderingContext.save();
        canvasRenderingContext.globalCompositeOperation = "screen";

        const intensityLevel = this.currentShakeIntensity;
        const isSongDrop = audioStateReference && audioStateReference.isDrop;
        const baseFlashOpacity = Math.min(0.55, (intensityLevel - 0.18) * 0.65 * (isSongDrop ? 1.5 : 1.0));

        // Chromatic edge separation
        const chromaticOffsetPixels = Math.max(5, this.displacementOffsetX * 2.8);

        canvasRenderingContext.fillStyle = paletteTheme.primaryAlpha
            ? paletteTheme.primaryAlpha(baseFlashOpacity * 0.75)
            : "rgba(0, 240, 255, 0.25)";
        canvasRenderingContext.fillRect(chromaticOffsetPixels, 0, canvasViewportWidth, canvasViewportHeight);

        canvasRenderingContext.fillStyle = paletteTheme.accentAlpha
            ? paletteTheme.accentAlpha(baseFlashOpacity * 0.75)
            : "rgba(255, 0, 127, 0.25)";
        canvasRenderingContext.fillRect(-chromaticOffsetPixels, 0, canvasViewportWidth, canvasViewportHeight);

        if (intensityLevel > 0.38 || isSongDrop) {
            const vignetteOpacity = Math.min(0.40, (intensityLevel - 0.38) * 0.7 + (isSongDrop ? 0.20 : 0));
            const centerX = canvasViewportWidth * 0.5;
            const centerY = canvasViewportHeight * 0.5;
            const maxDimension = Math.max(canvasViewportWidth, canvasViewportHeight);

            const radialGradient = canvasRenderingContext.createRadialGradient(
                centerX, centerY, canvasViewportHeight * 0.15,
                centerX, centerY, maxDimension * 0.72
            );
            radialGradient.addColorStop(0, "transparent");
            radialGradient.addColorStop(0.65, paletteTheme.primaryAlpha ? paletteTheme.primaryAlpha(vignetteOpacity * 0.6) : "transparent");
            radialGradient.addColorStop(1.0, paletteTheme.accentAlpha ? paletteTheme.accentAlpha(vignetteOpacity) : "rgba(255, 0, 127, 0.4)");

            canvasRenderingContext.fillStyle = radialGradient;
            canvasRenderingContext.fillRect(0, 0, canvasViewportWidth, canvasViewportHeight);
        }

        canvasRenderingContext.restore();
    }
}
