// src/backgrounds/CyberGridHorizon.js - 3D perspective synthwave grid & cyber sparkles on the horizon

export class CyberGridHorizon {
    constructor() {
        this.scrollOffsetPixels = 0;
        this.cyberSparkles = [];
        for (let sparkleIndex = 0; sparkleIndex < 35; sparkleIndex++) {
            this.cyberSparkles.push({
                normalizedX: Math.random(), normalizedY: Math.random(),
                radiusPixels: 1 + Math.random() * 2,
                verticalVelocityPixelsPerSecond: 20 + Math.random() * 45,
                baseOpacityAlpha: 0.2 + Math.random() * 0.6
            });
        }
    }

    update(deltaTimeSeconds, audioStateReference) {
        const energyLevel = audioStateReference ? (audioStateReference.energy || 0.35) : 0.35;
        const normalizedTempoRatio = Math.max(0.4, Math.min(2.0, (audioStateReference ? audioStateReference.bpm || 120 : 120) / 120));
        const scrollSpeed = (audioStateReference && audioStateReference.isPlaying !== false) ? (14 + normalizedTempoRatio * 18 + energyLevel * 50) : 8;
        this.scrollOffsetPixels = (this.scrollOffsetPixels + deltaTimeSeconds * scrollSpeed) % 40;

        const sparkleSpeedMultiplier = 0.4 + energyLevel * 0.6;
        for (let sparkleIndex = 0; sparkleIndex < this.cyberSparkles.length; sparkleIndex++) {
            const sparkle = this.cyberSparkles[sparkleIndex];
            sparkle.normalizedY -= (sparkle.verticalVelocityPixelsPerSecond * deltaTimeSeconds * sparkleSpeedMultiplier) / 500;
            if (sparkle.normalizedY < 0) { sparkle.normalizedY = 1.0; sparkle.normalizedX = Math.random(); }
        }
    }

    render(canvasRenderingContext, canvasViewportWidth, canvasViewportHeight, horizonVerticalCoordinate, audioStateReference, paletteTheme) {
        if (horizonVerticalCoordinate >= canvasViewportHeight) return;
        const gridHeightPixels = canvasViewportHeight - horizonVerticalCoordinate;
        const viewportCenterHorizontalCoordinate = canvasViewportWidth * 0.5;

        canvasRenderingContext.save();

        // 1. Horizon glow aura & laser
        const glowGrad = canvasRenderingContext.createLinearGradient(0, horizonVerticalCoordinate - 40, 0, horizonVerticalCoordinate + 30);
        const bassLevel = audioStateReference ? (audioStateReference.bass || 0) : 0;
        const energyLevel = audioStateReference ? (audioStateReference.energy || 0.35) : 0.35;
        const trebleLevel = audioStateReference ? (audioStateReference.treble || 0) : 0;

        glowGrad.addColorStop(0, "transparent");
        glowGrad.addColorStop(0.5, paletteTheme.accentAlpha ? paletteTheme.accentAlpha(0.4 + bassLevel * 0.3) : "rgba(255, 0, 127, 0.4)");
        glowGrad.addColorStop(1, "transparent");
        canvasRenderingContext.fillStyle = glowGrad;
        canvasRenderingContext.fillRect(0, horizonVerticalCoordinate - 40, canvasViewportWidth, 70);

        canvasRenderingContext.strokeStyle = paletteTheme.primary;
        canvasRenderingContext.lineWidth = 1.8 + bassLevel * 1.5;
        canvasRenderingContext.beginPath();
        canvasRenderingContext.moveTo(0, horizonVerticalCoordinate);
        canvasRenderingContext.lineTo(canvasViewportWidth, horizonVerticalCoordinate);
        canvasRenderingContext.stroke();

        // 2. Perspective grid floor
        canvasRenderingContext.save();
        canvasRenderingContext.beginPath();
        canvasRenderingContext.rect(0, horizonVerticalCoordinate, canvasViewportWidth, gridHeightPixels);
        canvasRenderingContext.clip();

        const totalHorizontalLineCount = 14;
        for (let lineIndex = 0; lineIndex < totalHorizontalLineCount; lineIndex++) {
            const fraction = (lineIndex + (this.scrollOffsetPixels / 40)) / totalHorizontalLineCount;
            const perspectiveDepth = Math.pow(fraction, 2.5);
            const lineVerticalPosition = horizonVerticalCoordinate + perspectiveDepth * gridHeightPixels;

            canvasRenderingContext.strokeStyle = paletteTheme.accentAlpha ? paletteTheme.accentAlpha(perspectiveDepth * (0.65 + energyLevel * 0.35)) : paletteTheme.accent;
            canvasRenderingContext.lineWidth = 1.0 + perspectiveDepth * 1.6;
            canvasRenderingContext.beginPath();
            canvasRenderingContext.moveTo(0, lineVerticalPosition);
            canvasRenderingContext.lineTo(canvasViewportWidth, lineVerticalPosition);
            canvasRenderingContext.stroke();
        }

        const verticalRayCount = 18;
        for (let rayIndex = -verticalRayCount / 2; rayIndex <= verticalRayCount / 2; rayIndex++) {
            const bottomCoordinateX = viewportCenterHorizontalCoordinate + (rayIndex / (verticalRayCount / 2)) * (canvasViewportWidth * 0.95);
            canvasRenderingContext.strokeStyle = paletteTheme.primaryAlpha ? paletteTheme.primaryAlpha(0.45 + energyLevel * 0.3) : paletteTheme.primary;
            canvasRenderingContext.lineWidth = 1.0;
            canvasRenderingContext.beginPath();
            canvasRenderingContext.moveTo(viewportCenterHorizontalCoordinate, horizonVerticalCoordinate);
            canvasRenderingContext.lineTo(bottomCoordinateX, canvasViewportHeight);
            canvasRenderingContext.stroke();
        }

        for (let sparkleIndex = 0; sparkleIndex < this.cyberSparkles.length; sparkleIndex++) {
            const sparkle = this.cyberSparkles[sparkleIndex];
            const px = sparkle.normalizedX * canvasViewportWidth;
            const py = horizonVerticalCoordinate + sparkle.normalizedY * gridHeightPixels;
            canvasRenderingContext.fillStyle = paletteTheme.core || "#ffffff";
            canvasRenderingContext.globalAlpha = sparkle.baseOpacityAlpha * (0.65 + trebleLevel * 0.35);
            canvasRenderingContext.beginPath();
            canvasRenderingContext.arc(px, py, sparkle.radiusPixels, 0, Math.PI * 2);
            canvasRenderingContext.fill();
        }

        canvasRenderingContext.restore();
        canvasRenderingContext.restore();
    }
}

