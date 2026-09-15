// src/models/cyber/CyberAuraRenderer.js - Cyber cat diffuse body aura gradient

/**
 * Renders the volumetric neon silhouette aura behind the cyber cat.
 * @param {CanvasRenderingContext2D} canvasRenderingContext
 * @param {Object} audioFeatureState
 * @param {Object} visualizerPalette
 */
export function renderCyberSilhouetteAura(canvasRenderingContext, audioFeatureState, visualizerPalette) {
    const bassIntensity = audioFeatureState.bass || 0;
    const midsIntensity = audioFeatureState.mids || audioFeatureState.mid || 0;
    const beatImpulse = audioFeatureState.beatImpulse || 0;

    canvasRenderingContext.save();

    // 1. Compute audio-reactive radial gradient
    const gradientCenterY = 20 + beatImpulse * 4;
    const gradientRadius = 95 + bassIntensity * 18;
    const bodyAuraGradient = canvasRenderingContext.createRadialGradient(
        0, 0, 10,
        0, gradientCenterY, gradientRadius
    );

    const primaryColor = visualizerPalette.primary || "#00f0ff";
    const secondaryColor = visualizerPalette.secondary || "#ff007f";

    bodyAuraGradient.addColorStop(0, primaryColor);
    bodyAuraGradient.addColorStop(0.50, secondaryColor);
    bodyAuraGradient.addColorStop(1.0, "rgba(5, 5, 20, 0.45)");

    canvasRenderingContext.fillStyle = bodyAuraGradient;
    canvasRenderingContext.globalAlpha = Math.min(0.95, 0.35 + bassIntensity * 0.25 + midsIntensity * 0.15);

    // 2. Trace torso silhouette contour
    canvasRenderingContext.beginPath();
    canvasRenderingContext.moveTo(0, -50);
    canvasRenderingContext.bezierCurveTo(-25, -35, -45, 0, -42, 45);
    canvasRenderingContext.bezierCurveTo(-40, 75, -55, 92, -35, 98);
    canvasRenderingContext.lineTo(35, 98);
    canvasRenderingContext.bezierCurveTo(55, 92, 40, 75, 42, 45);
    canvasRenderingContext.bezierCurveTo(45, 0, 25, -35, 0, -50);
    canvasRenderingContext.closePath();
    canvasRenderingContext.fill();

    // 3. Ambient volumetric starlight corona on beat drops
    if (audioFeatureState.isDrop || beatImpulse > 0.60) {
        canvasRenderingContext.save();
        canvasRenderingContext.globalCompositeOperation = "screen";
        canvasRenderingContext.fillStyle = visualizerPalette.accentAlpha
            ? visualizerPalette.accentAlpha(0.20 * beatImpulse)
            : "rgba(255, 0, 127, 0.2)";
        canvasRenderingContext.beginPath();
        canvasRenderingContext.arc(0, 20, gradientRadius * 1.15, 0, Math.PI * 2);
        canvasRenderingContext.fill();
        canvasRenderingContext.restore();
    }

    canvasRenderingContext.restore();
}

// Backward-compatible alias
