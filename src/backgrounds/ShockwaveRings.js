// src/backgrounds/ShockwaveRings.js - Audio beat-driven radial shockwave pulse rings (dual kick & snare)

export class ShockwaveRingParticle {
    constructor(
        originCenterCoordinateX,
        originCenterCoordinateY,
        maximumRadiusPixels,
        ringStrokeColor,
        pulseType = "kick"
    ) {
        this.originCenterCoordinateX = originCenterCoordinateX;
        this.originCenterCoordinateY = originCenterCoordinateY;
        this.pulseType = pulseType;
        this.maximumRadiusPixels = maximumRadiusPixels;
        this.ringStrokeColor = ringStrokeColor;
        this.remainingLifetimeRatio = 1.0;

        if (pulseType === "snare") {
            this.currentRadiusPixels = 26;
            this.expansionSpeedRate = 6.2;
            this.decaySpeedRate = 2.2;
            this.baseStrokeLineWidth = 1.2;
        } else {
            // Kick / Bass shockwave
            this.currentRadiusPixels = 16;
            this.expansionSpeedRate = 3.6;
            this.decaySpeedRate = 1.35;
            this.baseStrokeLineWidth = 2.8;
        }
    }

    update(deltaTimeSeconds) {
        this.currentRadiusPixels += (this.maximumRadiusPixels - this.currentRadiusPixels) *
            (deltaTimeSeconds * this.expansionSpeedRate);
        this.remainingLifetimeRatio -= deltaTimeSeconds * this.decaySpeedRate;
        return this.remainingLifetimeRatio > 0;
    }

    render(canvasRenderingContext) {
        if (this.remainingLifetimeRatio <= 0) return;

        canvasRenderingContext.save();
        canvasRenderingContext.globalCompositeOperation = "lighter";
        canvasRenderingContext.strokeStyle = this.ringStrokeColor;
        canvasRenderingContext.lineWidth = Math.max(0.6, this.baseStrokeLineWidth * this.remainingLifetimeRatio);
        canvasRenderingContext.globalAlpha = Math.max(
            0,
            this.remainingLifetimeRatio * (this.pulseType === "snare" ? 0.75 : 0.65)
        );
        canvasRenderingContext.beginPath();
        canvasRenderingContext.arc(
            this.originCenterCoordinateX,
            this.originCenterCoordinateY,
            this.currentRadiusPixels,
            0,
            Math.PI * 2
        );
        canvasRenderingContext.stroke();

        // Secondary concentric echo ring
        if (this.pulseType === "kick" && this.currentRadiusPixels > 35) {
            canvasRenderingContext.lineWidth = 1.0 * this.remainingLifetimeRatio;
            canvasRenderingContext.globalAlpha = Math.max(0, this.remainingLifetimeRatio * 0.35);
            canvasRenderingContext.beginPath();
            canvasRenderingContext.arc(
                this.originCenterCoordinateX,
                this.originCenterCoordinateY,
                this.currentRadiusPixels * 0.75,
                0,
                Math.PI * 2
            );
            canvasRenderingContext.stroke();
        } else if (this.pulseType === "snare" && this.currentRadiusPixels > 30) {
            canvasRenderingContext.lineWidth = 0.7 * this.remainingLifetimeRatio;
            canvasRenderingContext.globalAlpha = Math.max(0, this.remainingLifetimeRatio * 0.4);
            canvasRenderingContext.beginPath();
            canvasRenderingContext.arc(
                this.originCenterCoordinateX,
                this.originCenterCoordinateY,
                this.currentRadiusPixels * 0.88,
                0,
                Math.PI * 2
            );
            canvasRenderingContext.stroke();
        }

        canvasRenderingContext.restore();
    }
}

// Backward-compatible alias
