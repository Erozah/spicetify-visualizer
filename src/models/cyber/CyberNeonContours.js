// src/models/cyber/CyberNeonContours.js - Neon cyber body outline contours and markings

/**
 * Renders cyber body flanks, base paw contact lines, and chest chevron marking.
 * @param {CanvasRenderingContext2D} canvasRenderingContext
 * @param {Object} audioFeatureState
 * @param {Object} visualizerPalette
 */
export function renderCyberNeonContours(canvasRenderingContext, audioFeatureState, visualizerPalette) {
    const energyLevel = audioFeatureState.energy || 0.35;
    const midsIntensity = audioFeatureState.mids || audioFeatureState.mid || 0;
    const bassIntensity = audioFeatureState.bass || 0;

    canvasRenderingContext.save();
    canvasRenderingContext.globalCompositeOperation = "screen";

    // 1. Outer neon flank lines
    canvasRenderingContext.strokeStyle = visualizerPalette.primary;
    canvasRenderingContext.lineWidth = 1.8 + bassIntensity * 0.60;
    canvasRenderingContext.lineCap = "round";
    canvasRenderingContext.lineJoin = "round";
    canvasRenderingContext.globalAlpha = Math.min(1.0, 0.85 + energyLevel * 0.15);

    // Left flank contour
    canvasRenderingContext.beginPath();
    canvasRenderingContext.moveTo(-10, -50);
    canvasRenderingContext.bezierCurveTo(-26, -30, -44, 0, -42, 45);
    canvasRenderingContext.bezierCurveTo(-40, 75, -58, 92, -38, 98);
    canvasRenderingContext.stroke();

    // Right flank contour
    canvasRenderingContext.beginPath();
    canvasRenderingContext.moveTo(10, -50);
    canvasRenderingContext.bezierCurveTo(26, -30, 44, 0, 42, 45);
    canvasRenderingContext.bezierCurveTo(40, 75, 58, 92, 38, 98);
    canvasRenderingContext.stroke();

    // 2. Base paw resting lines
    canvasRenderingContext.beginPath();
    canvasRenderingContext.moveTo(-38, 98);
    canvasRenderingContext.lineTo(-12, 98);
    canvasRenderingContext.moveTo(12, 98);
    canvasRenderingContext.lineTo(38, 98);
    canvasRenderingContext.stroke();

    // 3. Starlight sharp highlight layer
    canvasRenderingContext.save();
    canvasRenderingContext.globalCompositeOperation = "lighter";
    canvasRenderingContext.strokeStyle = "#ffffff";
    canvasRenderingContext.lineWidth = 0.80;
    canvasRenderingContext.globalAlpha = 0.40 + energyLevel * 0.30;

    canvasRenderingContext.beginPath();
    canvasRenderingContext.moveTo(-8, -48);
    canvasRenderingContext.bezierCurveTo(-22, -28, -40, 0, -38, 45);
    canvasRenderingContext.moveTo(8, -48);
    canvasRenderingContext.bezierCurveTo(22, -28, 40, 0, 38, 45);
    canvasRenderingContext.stroke();
    canvasRenderingContext.restore();

    // 4. Chest chevron cyber accent
    canvasRenderingContext.strokeStyle = visualizerPalette.accent;
    canvasRenderingContext.lineWidth = 1.2;
    canvasRenderingContext.globalAlpha = 0.50 + midsIntensity * 0.30;
    canvasRenderingContext.beginPath();
    canvasRenderingContext.moveTo(-16, -18);
    canvasRenderingContext.lineTo(0, -6);
    canvasRenderingContext.lineTo(16, -18);
    canvasRenderingContext.stroke();

    canvasRenderingContext.restore();
}

// Backward-compatible alias
export const renderCyberBodyContours = renderCyberNeonContours;
