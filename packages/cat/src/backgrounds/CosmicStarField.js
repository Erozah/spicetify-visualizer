export class CosmicStarParticle {
    constructor(canvasViewportWidth, canvasViewportHeight, isInitialSpawn = true) {
        this.resetPosition(canvasViewportWidth, canvasViewportHeight, isInitialSpawn);
        this.offscreenCache = null;
        this.offscreenStreakCache = null;
    }

    resetPosition(canvasViewportWidth, canvasViewportHeight, isInitialSpawn = false) {
        this.coordinateX = Math.random() * canvasViewportWidth;
        this.coordinateY = isInitialSpawn ? Math.random() * canvasViewportHeight : -10;
        this.radiusPixels = 0.6 + Math.random() * 1.8;
        this.verticalDriftSpeed = 10 + Math.random() * 20;
        this.baseAlphaOpacity = 0.2 + Math.random() * 0.6;
        this.pulseFrequency = 1.0 + Math.random() * 3.0;
        this.oscillationPhaseOffset = Math.random() * Math.PI * 2;
        this.hasDiffractionCrossSpikes = Math.random() > 0.82;
        this.diffractionSpikeLength = 4 + Math.random() * 7;
        this.offscreenCache = null; // Invalidate cache on reset
    }

    // Creates an offscreen canvas for this specific star type to avoid arc() calls
    _getSpriteCache(starGlowColor) {
        if (!this.offscreenCache || this.offscreenCache.color !== starGlowColor) {
            const size = Math.ceil(Math.max(this.radiusPixels * 2, this.diffractionSpikeLength * 2)) + 4;
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d', { alpha: true });
            const center = size / 2;

            ctx.fillStyle = starGlowColor;
            ctx.beginPath();
            ctx.arc(center, center, this.radiusPixels, 0, Math.PI * 2);
            ctx.fill();

            if (this.hasDiffractionCrossSpikes) {
                ctx.strokeStyle = starGlowColor;
                ctx.lineWidth = 0.75;
                ctx.globalAlpha = 0.65;
                ctx.beginPath();
                ctx.moveTo(center - this.diffractionSpikeLength, center);
                ctx.lineTo(center + this.diffractionSpikeLength, center);
                ctx.moveTo(center, center - this.diffractionSpikeLength);
                ctx.lineTo(center, center + this.diffractionSpikeLength);
                ctx.stroke();
            }

            this.offscreenCache = { canvas, center, color: starGlowColor };
        }
        return this.offscreenCache;
    }

    update(deltaTimeSeconds, canvasViewportWidth, canvasViewportHeight, audioStateReference) {
        const trebleEnergyLevel = audioStateReference ? (audioStateReference.treble || 0) : 0;
        const isSongDropActive = audioStateReference && audioStateReference.isDrop;
        const overallEnergy = audioStateReference ? (audioStateReference.energy || 0.4) : 0.4;

        const velocityMultiplier = isSongDropActive ? 4.0 : (overallEnergy > 0.7 ? 1.8 : (0.28 + overallEnergy * 0.72));
        this.coordinateY += this.verticalDriftSpeed * deltaTimeSeconds * (1 + trebleEnergyLevel * 0.3) * velocityMultiplier;

        if (this.coordinateY > canvasViewportHeight + 20) {
            this.resetPosition(canvasViewportWidth, canvasViewportHeight, false);
        }
    }

    render(canvasRenderingContext, elapsedSeconds, audioStateReference, starGlowColor) {
        const trebleEnergyLevel = audioStateReference ? (audioStateReference.treble || 0) : 0;
        const isSongDropActive = audioStateReference && audioStateReference.isDrop;
        const overallEnergy = audioStateReference ? (audioStateReference.energy || 0.4) : 0.4;
        const beatsPerMinute = audioStateReference ? (audioStateReference.bpm || 120) : 120;

        const isWarpingHyperspace = isSongDropActive || (beatsPerMinute >= 130 && overallEnergy > 0.65);
        const dynamicTwinkleFrequency = this.pulseFrequency * (0.4 + overallEnergy * 0.6);
        const twinkleOscillation = Math.sin(elapsedSeconds * dynamicTwinkleFrequency + this.oscillationPhaseOffset) * 0.25 + 0.75;
        const finalAlphaOpacity = Math.min(1.0, this.baseAlphaOpacity * twinkleOscillation * (0.8 + trebleEnergyLevel * 0.6));

        if (isWarpingHyperspace) {
            const streakLength = Math.min(65, this.verticalDriftSpeed * (isSongDropActive ? 2.4 : 1.2));
            canvasRenderingContext.save();
            canvasRenderingContext.strokeStyle = starGlowColor;
            canvasRenderingContext.lineWidth = Math.max(0.7, this.radiusPixels * 0.85);
            canvasRenderingContext.globalAlpha = Math.min(1.0, finalAlphaOpacity * 1.3);
            canvasRenderingContext.beginPath();
            canvasRenderingContext.moveTo(this.coordinateX, this.coordinateY);
            canvasRenderingContext.lineTo(this.coordinateX, this.coordinateY - streakLength);
            canvasRenderingContext.stroke();

            canvasRenderingContext.fillStyle = "#ffffff";
            canvasRenderingContext.globalAlpha = Math.min(1.0, finalAlphaOpacity * 1.5);
            canvasRenderingContext.beginPath();
            canvasRenderingContext.arc(this.coordinateX, this.coordinateY, this.radiusPixels * 1.2, 0, Math.PI * 2);
            canvasRenderingContext.fill();
            canvasRenderingContext.restore();
            return;
        }

        // Draw from offscreen cache for normal stars
        const cache = this._getSpriteCache(starGlowColor);
        canvasRenderingContext.globalAlpha = finalAlphaOpacity;
        canvasRenderingContext.drawImage(cache.canvas, this.coordinateX - cache.center, this.coordinateY - cache.center);
    }
}
