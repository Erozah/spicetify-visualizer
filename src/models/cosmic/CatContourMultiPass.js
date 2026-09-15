// src/models/cosmic/CatContourMultiPass.js - Multi-layer laser glowing silhouette contour

/**
 * Renders layered laser neon contours with starlight core and audio-reactive flare.
 * @param {CanvasRenderingContext2D} canvasRenderingContext
 * @param {Object} deformationParameters
 * @param {Object} visualizerPalette
 */
export function renderCatContourMultiPass(
    canvasRenderingContext,
    deformationParameters,
    visualizerPalette
) {
    const bassIntensity = deformationParameters.bass || 0;
    const trebleIntensity = deformationParameters.highs || 0;
    const beatImpulse = deformationParameters.beat || 0;

    canvasRenderingContext.save();

    // Pass 0: Crisp thin dark contrast edge to isolate silhouette from vibrant backgrounds
    canvasRenderingContext.strokeStyle = "rgba(1, 1, 4, 0.95)";
    canvasRenderingContext.lineWidth = 4.5;
    canvasRenderingContext.stroke();

    canvasRenderingContext.save();
    canvasRenderingContext.globalCompositeOperation = "screen";

    // Layer 1: Volumetric neon glow aura responding to sub-bass
    canvasRenderingContext.strokeStyle = visualizerPalette.primaryAlpha(0.85 + bassIntensity * 0.15);
    canvasRenderingContext.lineWidth = 5.2 + bassIntensity * 1.5;
    canvasRenderingContext.stroke();

    // Layer 2: Ultra-vibrant laser neon edge contour
    canvasRenderingContext.strokeStyle = visualizerPalette.accentAlpha(1.0);
    canvasRenderingContext.lineWidth = 2.2;
    canvasRenderingContext.stroke();

    // Layer 3: Pure starlight white laser core responding to highs
    const starlightOpacity = Math.min(1.0, 0.95 + trebleIntensity * 0.05);
    canvasRenderingContext.strokeStyle = `rgba(255, 255, 255, ${starlightOpacity})`;
    canvasRenderingContext.lineWidth = 1.1;
    canvasRenderingContext.stroke();

    // Layer 4: High-energy rhythmic beat flash
    if (beatImpulse > 0.25) {
        const flashIntensity = Math.min(1.0, beatImpulse * 0.85);
        canvasRenderingContext.strokeStyle = `rgba(255, 255, 255, ${flashIntensity})`;
        canvasRenderingContext.lineWidth = 2.0;
        canvasRenderingContext.stroke();
    }

    // Layer 5: Accent halo on heavy bass drop
    if (deformationParameters.isDrop) {
        canvasRenderingContext.strokeStyle = visualizerPalette.accentAlpha(0.60 + beatImpulse * 0.40);
        canvasRenderingContext.lineWidth = 3.6;
        canvasRenderingContext.stroke();
    }

    canvasRenderingContext.restore();
    canvasRenderingContext.restore();
}

// Backward-compatible alias
