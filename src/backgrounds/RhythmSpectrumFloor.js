export class RhythmSpectrumFloor {
    constructor() {
        this.barCount = 48;
        this.barHeights = new Float32Array(this.barCount);
    }

    render(canvasRenderingContext, viewportWidth, viewportHeight, horizonY, audioState, paletteTheme) {
        if (!audioState) return;

        const spectralBands = audioState.spectralBands || new Float32Array(32);
        const bandCount = spectralBands.length;
        const totalBars = this.barCount;
        const totalWidth = viewportWidth * 0.85;
        const startX = (viewportWidth - totalWidth) * 0.5;
        const barWidth = (totalWidth / totalBars) * 0.72;
        const spacing = (totalWidth - barWidth * totalBars) / (totalBars + 1);
        const maximumHeight = Math.min(viewportHeight * 0.22, 140);
        const energy = audioState.energy || 0.3;

        canvasRenderingContext.save();
        canvasRenderingContext.globalCompositeOperation = "screen";

        for (let barIndex = 0; barIndex < totalBars; barIndex++) {
            const normalizedIndex = barIndex / (totalBars - 1);
            const bandSampleIndex = Math.min(bandCount - 1, Math.floor(normalizedIndex * bandCount));
            const bandValue = spectralBands[bandSampleIndex] || 0.05;

            const targetHeight = (bandValue * 0.85 + energy * 0.15) * maximumHeight;
            this.barHeights[barIndex] += (targetHeight - this.barHeights[barIndex]) * 0.28;

            const currentHeight = Math.max(2, this.barHeights[barIndex]);
            const x = startX + spacing * (barIndex + 1) + barWidth * barIndex;
            const y = horizonY - currentHeight;

            const gradient = canvasRenderingContext.createLinearGradient(x, y, x, horizonY);
            gradient.addColorStop(0, paletteTheme.accentAlpha ? paletteTheme.accentAlpha(0.85) : paletteTheme.accent);
            gradient.addColorStop(0.6, paletteTheme.primaryAlpha ? paletteTheme.primaryAlpha(0.55) : paletteTheme.primary);
            gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

            canvasRenderingContext.fillStyle = gradient;
            canvasRenderingContext.fillRect(x, y, barWidth, currentHeight);

            canvasRenderingContext.fillStyle = paletteTheme.coreAlpha ? paletteTheme.coreAlpha(0.9) : "#ffffff";
            canvasRenderingContext.fillRect(x, y, barWidth, 1.5);
        }

        canvasRenderingContext.restore();
    }
}
