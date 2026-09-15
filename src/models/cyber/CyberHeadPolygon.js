import { renderCyberVibratingWhiskers } from './CyberVibratingWhiskers.js';

// src/models/cyber/CyberHeadPolygon.js - Cyber cat polygonal head, twitching ears, and forehead gem

/**
 * Renders faceted head geometry, twitching cyber ears, forehead diamond gem, and facial features.
 * @param {CanvasRenderingContext2D} canvasRenderingContext
 * @param {number} leftEarAngle
 * @param {number} rightEarAngle
 * @param {number} animationTimeSeconds
 * @param {Object} audioFeatureState
 * @param {Object} visualizerPalette
 */
export function renderCyberHeadPolygon(
    canvasRenderingContext,
    leftEarAngle,
    rightEarAngle,
    animationTimeSeconds,
    audioFeatureState,
    visualizerPalette
) {
    canvasRenderingContext.save();
    canvasRenderingContext.translate(0, -72);

    const bassIntensity = audioFeatureState.bass || 0;

    // 1. Helper to render a single polygonal ear
    const renderFacetedEar = (earCenterX, earAngle, isLeft) => {
        canvasRenderingContext.save();
        canvasRenderingContext.translate(earCenterX, -14);
        canvasRenderingContext.rotate(earAngle);

        canvasRenderingContext.strokeStyle = visualizerPalette.primary;
        canvasRenderingContext.lineWidth = 2.0;
        canvasRenderingContext.globalCompositeOperation = "screen";
        canvasRenderingContext.beginPath();
        canvasRenderingContext.moveTo(0, 10);
        canvasRenderingContext.lineTo(isLeft ? -12 : 12, -28);
        canvasRenderingContext.lineTo(isLeft ? 14 : -14, -6);
        canvasRenderingContext.closePath();
        canvasRenderingContext.stroke();

        canvasRenderingContext.fillStyle = visualizerPalette.accent;
        canvasRenderingContext.globalAlpha = 0.30 + bassIntensity * 0.30;
        canvasRenderingContext.beginPath();
        canvasRenderingContext.moveTo(isLeft ? -2 : 2, 6);
        canvasRenderingContext.lineTo(isLeft ? -9 : 9, -20);
        canvasRenderingContext.lineTo(isLeft ? 9 : -9, -4);
        canvasRenderingContext.closePath();
        canvasRenderingContext.fill();
        canvasRenderingContext.restore();
    };

    renderFacetedEar(-24, leftEarAngle, true);
    renderFacetedEar(24, rightEarAngle, false);

    // 2. Head polygon outline and semi-transparent dark body fill
    canvasRenderingContext.strokeStyle = visualizerPalette.primary;
    canvasRenderingContext.lineWidth = 2.0;
    canvasRenderingContext.globalCompositeOperation = "screen";
    canvasRenderingContext.globalAlpha = 0.95;

    canvasRenderingContext.beginPath();
    canvasRenderingContext.moveTo(-16, -14);
    canvasRenderingContext.lineTo(16, -14);
    canvasRenderingContext.lineTo(32, 4);
    canvasRenderingContext.lineTo(18, 22);
    canvasRenderingContext.lineTo(0, 26);
    canvasRenderingContext.lineTo(-18, 22);
    canvasRenderingContext.lineTo(-32, 4);
    canvasRenderingContext.closePath();
    canvasRenderingContext.stroke();

    canvasRenderingContext.fillStyle = "rgba(8, 6, 24, 0.75)";
    canvasRenderingContext.fill();

    // 3. Forehead diamond cyber gem
    const gemPulse = 1.0 + bassIntensity * 0.40;
    canvasRenderingContext.save();
    canvasRenderingContext.globalCompositeOperation = "lighter";
    canvasRenderingContext.fillStyle = visualizerPalette.core;
    canvasRenderingContext.beginPath();
    canvasRenderingContext.moveTo(0, -10 * gemPulse);
    canvasRenderingContext.lineTo(5 * gemPulse, -4 * gemPulse);
    canvasRenderingContext.lineTo(0, 2 * gemPulse);
    canvasRenderingContext.lineTo(-5 * gemPulse, -4 * gemPulse);
    canvasRenderingContext.closePath();
    canvasRenderingContext.fill();

    canvasRenderingContext.strokeStyle = visualizerPalette.accent;
    canvasRenderingContext.lineWidth = 1.0;
    canvasRenderingContext.stroke();
    canvasRenderingContext.restore();

    // 4. Render whiskers
    renderCyberVibratingWhiskers(canvasRenderingContext, animationTimeSeconds, audioFeatureState, visualizerPalette);

    // 5. Cyber nose & mouth contours
    canvasRenderingContext.strokeStyle = visualizerPalette.accent;
    canvasRenderingContext.lineWidth = 1.2;
    canvasRenderingContext.globalCompositeOperation = "screen";
    canvasRenderingContext.beginPath();
    canvasRenderingContext.moveTo(-3, 14);
    canvasRenderingContext.lineTo(3, 14);
    canvasRenderingContext.lineTo(0, 17);
    canvasRenderingContext.closePath();
    canvasRenderingContext.stroke();

    canvasRenderingContext.beginPath();
    canvasRenderingContext.moveTo(0, 17);
    canvasRenderingContext.lineTo(0, 20);
    canvasRenderingContext.moveTo(-5, 21);
    canvasRenderingContext.bezierCurveTo(-2, 23, 0, 20, 0, 20);
    canvasRenderingContext.bezierCurveTo(0, 20, 2, 23, 5, 21);
    canvasRenderingContext.stroke();

    canvasRenderingContext.restore();
}

// Backward-compatible alias
export const renderCyberHead = renderCyberHeadPolygon;
