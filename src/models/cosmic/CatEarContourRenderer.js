// src/models/cosmic/CatEarContourRenderer.js - Ear glowing contours, internal tufts, and ridges

/**
 * Renders glowing celestial ear contours, volumetric tufts, and internal starlight ridges.
 * @param {CanvasRenderingContext2D} canvasRenderingContext
 * @param {Object} deformationParameters
 * @param {Object} anatomyLandmarks
 * @param {Object} visualizerPalette
 */
export function renderCatEarContours(
    canvasRenderingContext,
    deformationParameters,
    anatomyLandmarks,
    visualizerPalette
) {
    const {
        leftEarTip,
        leftEarOuter,
        leftEarInner,
        rightEarTip,
        rightEarOuter,
        rightEarInner
    } = anatomyLandmarks;
    const beatImpulse = deformationParameters.beat || 0;
    const trebleIntensity = deformationParameters.highs || 0;

    canvasRenderingContext.save();
    canvasRenderingContext.globalCompositeOperation = "screen";

    // 1. Build unified ear contour path
    canvasRenderingContext.beginPath();
    canvasRenderingContext.moveTo(leftEarOuter[0], leftEarOuter[1]);
    canvasRenderingContext.quadraticCurveTo(
        (leftEarOuter[0] + leftEarTip[0]) * 0.5 - 4,
        (leftEarOuter[1] + leftEarTip[1]) * 0.5,
        leftEarTip[0],
        leftEarTip[1]
    );
    canvasRenderingContext.quadraticCurveTo(
        (leftEarInner[0] + leftEarTip[0]) * 0.5 + 3,
        (leftEarInner[1] + leftEarTip[1]) * 0.5,
        leftEarInner[0],
        leftEarInner[1]
    );

    canvasRenderingContext.moveTo(rightEarOuter[0], rightEarOuter[1]);
    canvasRenderingContext.quadraticCurveTo(
        (rightEarOuter[0] + rightEarTip[0]) * 0.5 + 4,
        (rightEarOuter[1] + rightEarTip[1]) * 0.5,
        rightEarTip[0],
        rightEarTip[1]
    );
    canvasRenderingContext.quadraticCurveTo(
        (rightEarInner[0] + rightEarTip[0]) * 0.5 - 3,
        (rightEarInner[1] + rightEarTip[1]) * 0.5,
        rightEarInner[0],
        rightEarInner[1]
    );

    // 2. Inner glowing celestial ear tufts fill
    canvasRenderingContext.fillStyle = visualizerPalette.accentAlpha(0.45 + beatImpulse * 0.35);
    canvasRenderingContext.fill();

    // 3. Multi-pass glow passes
    // Pass 1: Fine soft neon aura
    canvasRenderingContext.strokeStyle = visualizerPalette.primaryAlpha(0.85 + beatImpulse * 0.15);
    canvasRenderingContext.lineWidth = 4.0;
    canvasRenderingContext.stroke();

    // Pass 2: Intense razor-sharp neon contour
    canvasRenderingContext.strokeStyle = visualizerPalette.accentAlpha(1.0);
    canvasRenderingContext.lineWidth = 2.0;
    canvasRenderingContext.stroke();

    // Pass 3: Brilliant starlight core
    canvasRenderingContext.strokeStyle = "#ffffff";
    canvasRenderingContext.lineWidth = 1.0;
    canvasRenderingContext.stroke();

    // 4. Internal ear ridge starlight accents
    canvasRenderingContext.beginPath();
    canvasRenderingContext.moveTo(leftEarTip[0], leftEarTip[1]);
    canvasRenderingContext.quadraticCurveTo(
        leftEarTip[0] + 6,
        leftEarTip[1] + 25,
        (leftEarOuter[0] + leftEarInner[0]) * 0.5,
        (leftEarOuter[1] + leftEarInner[1]) * 0.5
    );
    canvasRenderingContext.moveTo(rightEarTip[0], rightEarTip[1]);
    canvasRenderingContext.quadraticCurveTo(
        rightEarTip[0] - 6,
        rightEarTip[1] + 25,
        (rightEarOuter[0] + rightEarInner[0]) * 0.5,
        (rightEarOuter[1] + rightEarInner[1]) * 0.5
    );

    canvasRenderingContext.strokeStyle = visualizerPalette.accentAlpha(0.90 + trebleIntensity * 0.10);
    canvasRenderingContext.lineWidth = 1.2;
    canvasRenderingContext.stroke();

    canvasRenderingContext.restore();
}

// Backward-compatible alias
