// src/backgrounds/MysticForestTonemapCompositor.js - Non-destructive alpha-luminance tonemapping compositor
// SOLID Architecture: Dedicated compositor ensuring dark forest elements remain transparent over Spotify UI while luminous elements bloom

export class MysticForestTonemapCompositor {
    constructor(minimumLuminanceCutoff = 0.08) {
        this.minimumLuminanceCutoff = minimumLuminanceCutoff;
    }

    calculateLuminance(redChannel, greenChannel, blueChannel) {
        return (0.299 * redChannel + 0.587 * greenChannel + 0.114 * blueChannel) / 255.0;
    }

    calculateTonemappedAlpha(normalizedLuminance, requestedBaseAlpha) {
        if (normalizedLuminance <= this.minimumLuminanceCutoff) {
            return 0.0;
        }

        const effectiveLuminance = (normalizedLuminance - this.minimumLuminanceCutoff) / (1.0 - this.minimumLuminanceCutoff);
        const tonemappedAlphaCurve = Math.pow(effectiveLuminance, 0.85);
        return Math.min(1.0, requestedBaseAlpha * tonemappedAlphaCurve);
    }

    createTonemappedRgbaString(redChannel, greenChannel, blueChannel, requestedBaseAlpha) {
        const normalizedLuminance = this.calculateLuminance(redChannel, greenChannel, blueChannel);
        const tonemappedAlpha = this.calculateTonemappedAlpha(normalizedLuminance, requestedBaseAlpha);
        return `rgba(${redChannel}, ${greenChannel}, ${blueChannel}, ${tonemappedAlpha.toFixed(3)})`;
    }

    applyAtmosphericPass(canvasRenderingContext, compositeOperationType, renderCallback) {
        canvasRenderingContext.save();
        canvasRenderingContext.globalCompositeOperation = compositeOperationType;
        renderCallback();
        canvasRenderingContext.restore();
    }
}
