// src/backgrounds/CosmicNebulaLayer.js - Volumetric cosmic nebula clouds & deep space ethereal aura

export class CosmicNebulaLayer {
    constructor() {
        this.orbitalDriftAngleRadians = 0;
    }

    update(deltaTimeSeconds, elapsedSongTimeSeconds, audioStateReference, isPlaybackActive = true) {
        const orbitalSpeed = isPlaybackActive
            ? (0.04 + (audioStateReference ? audioStateReference.energy : 0.3) * 0.06)
            : 0.015;
        this.orbitalDriftAngleRadians = (this.orbitalDriftAngleRadians + deltaTimeSeconds * orbitalSpeed) % (Math.PI * 2);
    }

    render(
        canvasRenderingContext,
        canvasViewportWidth,
        canvasViewportHeight,
        felineCenterCoordinateX,
        felineCenterCoordinateY,
        audioStateReference,
        paletteTheme,
        elapsedSongTimeSeconds
    ) {
        const bassLevel = audioStateReference ? (audioStateReference.bass || 0) : 0;
        const beatImpulseLevel = audioStateReference ? (audioStateReference.beatImpulse || 0) : 0;
        const energyLevel = audioStateReference ? (audioStateReference.energy || 0.3) : 0.3;

        canvasRenderingContext.save();
        canvasRenderingContext.globalCompositeOperation = "screen";

        // 1. Large soft cosmic aura behind subject
        const baseAuraRadius = Math.max(160, Math.min(canvasViewportWidth, canvasViewportHeight) * 0.38);
        const dynamicAuraRadius = baseAuraRadius * (1.0 + bassLevel * 0.2 + beatImpulseLevel * 0.15);

        const auraGradient = canvasRenderingContext.createRadialGradient(
            felineCenterCoordinateX, felineCenterCoordinateY, 20,
            felineCenterCoordinateX, felineCenterCoordinateY, dynamicAuraRadius
        );
        const baseAtmosphereAlpha = Math.min(0.5, 0.22 + energyLevel * 0.18 + bassLevel * 0.12);

        auraGradient.addColorStop(0, paletteTheme.accentAlpha ? paletteTheme.accentAlpha(baseAtmosphereAlpha * 0.8) : "rgba(255, 0, 127, 0.25)");
        auraGradient.addColorStop(0.35, paletteTheme.primaryAlpha ? paletteTheme.primaryAlpha(baseAtmosphereAlpha * 0.55) : "rgba(0, 240, 255, 0.18)");
        auraGradient.addColorStop(0.7, paletteTheme.secondaryAlpha ? paletteTheme.secondaryAlpha(baseAtmosphereAlpha * 0.25) : "rgba(157, 78, 221, 0.1)");
        auraGradient.addColorStop(1.0, "transparent");

        canvasRenderingContext.fillStyle = auraGradient;
        canvasRenderingContext.beginPath();
        canvasRenderingContext.arc(felineCenterCoordinateX, felineCenterCoordinateY, dynamicAuraRadius, 0, Math.PI * 2);
        canvasRenderingContext.fill();

        // 2. Multi-puff volumetric cosmic clouds with subtle orbital drift
        const totalPuffCount = 3;
        for (let puffIndex = 0; puffIndex < totalPuffCount; puffIndex++) {
            const orbitalAngle = this.orbitalDriftAngleRadians + (puffIndex * Math.PI * 2) / totalPuffCount;
            const orbitalDistance = baseAuraRadius * 0.45;
            const puffCenterX = felineCenterCoordinateX + Math.cos(orbitalAngle) * orbitalDistance;
            const puffCenterY = felineCenterCoordinateY + Math.sin(orbitalAngle * 0.8) * (orbitalDistance * 0.6);
            const puffRadius = baseAuraRadius * (0.65 + Math.sin(elapsedSongTimeSeconds + puffIndex) * 0.1);

            const puffGradient = canvasRenderingContext.createRadialGradient(
                puffCenterX, puffCenterY, 10,
                puffCenterX, puffCenterY, puffRadius
            );
            const puffAlpha = baseAtmosphereAlpha * 0.45;

            if (puffIndex % 2 === 0) {
                puffGradient.addColorStop(0, paletteTheme.primaryAlpha ? paletteTheme.primaryAlpha(puffAlpha) : "rgba(0, 240, 255, 0.15)");
                puffGradient.addColorStop(0.5, paletteTheme.secondaryAlpha ? paletteTheme.secondaryAlpha(puffAlpha * 0.4) : "rgba(157, 78, 221, 0.08)");
            } else {
                puffGradient.addColorStop(0, paletteTheme.accentAlpha ? paletteTheme.accentAlpha(puffAlpha) : "rgba(255, 0, 127, 0.15)");
                puffGradient.addColorStop(0.5, paletteTheme.primaryAlpha ? paletteTheme.primaryAlpha(puffAlpha * 0.4) : "rgba(0, 240, 255, 0.08)");
            }
            puffGradient.addColorStop(1.0, "transparent");

            canvasRenderingContext.fillStyle = puffGradient;
            canvasRenderingContext.beginPath();
            canvasRenderingContext.arc(puffCenterX, puffCenterY, puffRadius, 0, Math.PI * 2);
            canvasRenderingContext.fill();
        }

        canvasRenderingContext.restore();
    }
}

// Backward-compatible alias
