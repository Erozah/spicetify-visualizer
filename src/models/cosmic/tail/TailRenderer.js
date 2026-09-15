import { buildTailClosedPath } from './TailCatmullRomBuilder.js';
import { renderTailSparksEmitter } from './TailSparksEmitter.js';

// src/models/cosmic/tail/TailRenderer.js - Tail canvas rendering with glow and contact shadow

/**
 * Renders complete tail composite: deck contact shadow, cosmic body fill, neon aura, and tip flare.
 * @param {CanvasRenderingContext2D} canvasRenderingContext
 * @param {Object} tailPhysicsInstance
 * @param {Object} visualizerPalette
 * @param {Object} audioFeatureState
 * @param {number} baseRenderScale
 * @param {number} deckHorizonCoordinateY
 */
export function renderTailCompositeLayers(
    canvasRenderingContext,
    tailPhysicsInstance,
    visualizerPalette,
    audioFeatureState,
    baseRenderScale,
    deckHorizonCoordinateY
) {
    if (tailPhysicsInstance.nodes.length < 3) return;

    const bassIntensity = audioFeatureState.bass || 0;
    const trebleIntensity = audioFeatureState.highs || 0;
    const beatImpulse = audioFeatureState.beatImpulse || 0;

    canvasRenderingContext.save();

    // 1. Tail Contact Shadow onto Wooden Deck Surface
    if (deckHorizonCoordinateY) {
        canvasRenderingContext.save();
        canvasRenderingContext.beginPath();
        canvasRenderingContext.moveTo(tailPhysicsInstance.nodes[0].x, deckHorizonCoordinateY + 4);
        for (let index = 1; index < tailPhysicsInstance.segmentCount; index++) {
            canvasRenderingContext.lineTo(tailPhysicsInstance.nodes[index].x, deckHorizonCoordinateY + 6);
        }
        canvasRenderingContext.lineWidth = 14 * baseRenderScale;
        canvasRenderingContext.strokeStyle = "rgba(2, 1, 6, 0.45)";
        canvasRenderingContext.stroke();
        canvasRenderingContext.restore();
    }

    // 2. Tail Interior Cosmic Shimmer
    buildTailClosedPath(
        canvasRenderingContext,
        tailPhysicsInstance.nodes,
        tailPhysicsInstance.leftPoints,
        tailPhysicsInstance.rightPoints,
        tailPhysicsInstance.segmentCount,
        baseRenderScale
    );
    const rootNode = tailPhysicsInstance.nodes[0];
    const tipNode = tailPhysicsInstance.nodes[tailPhysicsInstance.segmentCount - 1];

    const tailGradient = canvasRenderingContext.createLinearGradient(rootNode.x, rootNode.y, tipNode.x, tipNode.y);
    tailGradient.addColorStop(0, "rgba(16, 12, 32, 0.95)");
    tailGradient.addColorStop(0.50, "rgba(10, 8, 24, 0.98)");
    tailGradient.addColorStop(1.0, "rgba(6, 4, 16, 1.0)");
    canvasRenderingContext.fillStyle = tailGradient;
    canvasRenderingContext.fill();

    // Subtle inner energy core
    canvasRenderingContext.save();
    canvasRenderingContext.globalCompositeOperation = "screen";
    const innerEnergyGradient = canvasRenderingContext.createLinearGradient(rootNode.x, rootNode.y, tipNode.x, tipNode.y);
    innerEnergyGradient.addColorStop(0, visualizerPalette.primaryAlpha(0.25 + bassIntensity * 0.20));
    innerEnergyGradient.addColorStop(0.60, visualizerPalette.accentAlpha(0.20 + trebleIntensity * 0.20));
    innerEnergyGradient.addColorStop(1.0, visualizerPalette.accentAlpha(0.35 + beatImpulse * 0.30));
    canvasRenderingContext.fillStyle = innerEnergyGradient;
    canvasRenderingContext.fill();
    canvasRenderingContext.restore();

    // 3. Glowing Feline Fur Outer Contour
    canvasRenderingContext.save();
    canvasRenderingContext.globalCompositeOperation = "screen";

    // Outer soft glow
    buildTailClosedPath(canvasRenderingContext, tailPhysicsInstance.nodes, tailPhysicsInstance.leftPoints, tailPhysicsInstance.rightPoints, tailPhysicsInstance.segmentCount, baseRenderScale);
    canvasRenderingContext.strokeStyle = visualizerPalette.primaryAlpha(0.75 + bassIntensity * 0.25);
    canvasRenderingContext.lineWidth = 3.5 * baseRenderScale;
    canvasRenderingContext.stroke();

    // Vibrant neon rim
    buildTailClosedPath(canvasRenderingContext, tailPhysicsInstance.nodes, tailPhysicsInstance.leftPoints, tailPhysicsInstance.rightPoints, tailPhysicsInstance.segmentCount, baseRenderScale);
    canvasRenderingContext.strokeStyle = visualizerPalette.accentAlpha(1.0);
    canvasRenderingContext.lineWidth = 1.8 * baseRenderScale;
    canvasRenderingContext.stroke();

    // Starlight crisp highlight
    buildTailClosedPath(canvasRenderingContext, tailPhysicsInstance.nodes, tailPhysicsInstance.leftPoints, tailPhysicsInstance.rightPoints, tailPhysicsInstance.segmentCount, baseRenderScale);
    canvasRenderingContext.strokeStyle = `rgba(255, 255, 255, ${0.92 + trebleIntensity * 0.08})`;
    canvasRenderingContext.lineWidth = 0.9 * baseRenderScale;
    canvasRenderingContext.stroke();

    // Tip glowing energy tuft
    const tipGlowRadial = canvasRenderingContext.createRadialGradient(tipNode.x, tipNode.y, 0, tipNode.x, tipNode.y, 16 * baseRenderScale);
    tipGlowRadial.addColorStop(0, "rgba(255, 255, 255, 0.95)");
    tipGlowRadial.addColorStop(0.35, visualizerPalette.accentAlpha(0.85));
    tipGlowRadial.addColorStop(0.75, visualizerPalette.primaryAlpha(0.40));
    tipGlowRadial.addColorStop(1.0, "transparent");

    canvasRenderingContext.fillStyle = tipGlowRadial;
    canvasRenderingContext.beginPath();
    canvasRenderingContext.arc(tipNode.x, tipNode.y, 16 * baseRenderScale, 0, Math.PI * 2);
    canvasRenderingContext.fill();

    // Render sparks trail
    renderTailSparksEmitter(canvasRenderingContext, tailPhysicsInstance.sparkTrail, visualizerPalette);

    canvasRenderingContext.restore();
    canvasRenderingContext.restore();
}

// Backward-compatible alias
export const renderTailLayers = renderTailCompositeLayers;
