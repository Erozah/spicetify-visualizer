// src/models/cosmic/CatInteriorStellarSpine.js - Celestial body gradient, pulsar heart, and spine starlight

/**
 * Renders cosmic body interior gradient, pulsing heart core, and radiant spinal energy line.
 * @param {CanvasRenderingContext2D} canvasRenderingContext
 * @param {Object} deformationParameters
 * @param {Object} anatomyLandmarks
 * @param {Object} visualizerPalette
 * @param {number} animationTimeSeconds
 */
export function renderCatInteriorStellarSpine(
    canvasRenderingContext,
    deformationParameters,
    anatomyLandmarks,
    visualizerPalette,
    animationTimeSeconds
) {
    const { scaleY, scaleX, bass, beat } = deformationParameters;
    const { headCenter, spineMid, baseCenter } = anatomyLandmarks;

    canvasRenderingContext.save();

    // 1. Ethereal, luminous celestial body gradient
    const interiorRadialGradient = canvasRenderingContext.createRadialGradient(
        spineMid[0], spineMid[1] - scaleY * 0.15, 10,
        spineMid[0], spineMid[1], scaleY * 1.05
    );
    interiorRadialGradient.addColorStop(0, visualizerPalette.primaryAlpha(0.65 + beat * 0.25));
    interiorRadialGradient.addColorStop(0.35, visualizerPalette.secondaryAlpha(0.55 + bass * 0.20));
    interiorRadialGradient.addColorStop(0.75, visualizerPalette.deepNebulaAlpha(0.75));
    interiorRadialGradient.addColorStop(1.0, "rgba(8, 6, 22, 0.90)");

    canvasRenderingContext.fillStyle = interiorRadialGradient;
    canvasRenderingContext.fill();

    // 2. High-vibrancy glowing chest and feline heart (ultra-luminous pulsar)
    canvasRenderingContext.save();
    canvasRenderingContext.globalCompositeOperation = "screen";

    const dropBloomMultiplier = deformationParameters.isDrop ? 1.45 : 1.0;
    const heartPulseRadius = scaleY * (0.75 + beat * 0.35 * dropBloomMultiplier + (deformationParameters.mids || 0) * 0.20);
    const heartGlowGradient = canvasRenderingContext.createRadialGradient(
        spineMid[0], spineMid[1] - scaleY * 0.20, 5,
        spineMid[0], spineMid[1] - scaleY * 0.10, heartPulseRadius
    );
    heartGlowGradient.addColorStop(0, "rgba(255, 255, 255, 0.98)");
    heartGlowGradient.addColorStop(0.25, visualizerPalette.accentAlpha(0.95 * dropBloomMultiplier));
    heartGlowGradient.addColorStop(0.55, visualizerPalette.primaryAlpha((0.75 + bass * 0.25) * dropBloomMultiplier));
    heartGlowGradient.addColorStop(0.85, visualizerPalette.secondaryAlpha(0.40));
    heartGlowGradient.addColorStop(1.0, "transparent");

    canvasRenderingContext.fillStyle = heartGlowGradient;
    canvasRenderingContext.fill();

    // 3. Flank and back starlight silk sheen
    const silkSheenGradient = canvasRenderingContext.createLinearGradient(
        spineMid[0] - scaleX * 0.50, spineMid[1],
        spineMid[0] + scaleX * 0.50, spineMid[1]
    );
    silkSheenGradient.addColorStop(0, visualizerPalette.accentAlpha(0.50));
    silkSheenGradient.addColorStop(0.30, visualizerPalette.primaryAlpha(0.25));
    silkSheenGradient.addColorStop(0.70, visualizerPalette.primaryAlpha(0.25));
    silkSheenGradient.addColorStop(1.0, visualizerPalette.accentAlpha(0.50));

    canvasRenderingContext.fillStyle = silkSheenGradient;
    canvasRenderingContext.fill();

    // 4. Luminous spine energy line with sparkling starlight
    const beatsPerMinute = deformationParameters.bpm || 120;
    const energyLevel = deformationParameters.energy || 0.40;
    const spineWaveSpeed = 0.50 + (beatsPerMinute / 120) * 0.70 * (0.40 + energyLevel * 0.60);
    const spineLineWidth = (2.4 + beat * 1.8 + (deformationParameters.mids || 0) * 1.2) * (deformationParameters.isDrop ? 1.4 : 1.0);

    canvasRenderingContext.beginPath();
    canvasRenderingContext.moveTo(headCenter[0], headCenter[1] + 10);
    canvasRenderingContext.quadraticCurveTo(
        spineMid[0] + Math.sin(animationTimeSeconds * spineWaveSpeed) * (3.0 + beat * 5.0),
        spineMid[1],
        baseCenter[0],
        baseCenter[1] - 8
    );
    canvasRenderingContext.strokeStyle = visualizerPalette.accentAlpha(1.0);
    canvasRenderingContext.lineWidth = spineLineWidth;
    canvasRenderingContext.stroke();

    canvasRenderingContext.strokeStyle = "#ffffff";
    canvasRenderingContext.lineWidth = Math.max(1.0, spineLineWidth * 0.45);
    canvasRenderingContext.stroke();

    canvasRenderingContext.restore();
    canvasRenderingContext.restore();
}

// Backward-compatible alias
