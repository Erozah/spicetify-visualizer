// src/models/cyber/CyberVibratingWhiskers.js - Audio-reactive vibrating cyber whiskers with multi-harmonic flex & snare response

export function renderCyberVibratingWhiskers(
    canvasRenderingContext,
    animationTimeSeconds,
    audioFeatureState,
    visualizerPalette
) {
    canvasRenderingContext.save();
    canvasRenderingContext.globalCompositeOperation = "screen";

    const trebleIntensity = audioFeatureState.treble || audioFeatureState.highs || 0;
    const midsIntensity = audioFeatureState.mids || audioFeatureState.mid || 0;
    const snareImpulse = audioFeatureState.snareImpulse || 0;
    const energyLevel = audioFeatureState.energy || 0.35;
    const isDropActive = !!audioFeatureState.isDrop;
    const dropMultiplier = isDropActive ? 1.40 : 1.0;

    // High frequency treble (>4000 Hz) oscillation flutter
    const spectralHighs = (audioFeatureState.spectralBands && audioFeatureState.spectralBands.length >= 32)
        ? (audioFeatureState.spectralBands[24] + audioFeatureState.spectralBands[28] + audioFeatureState.spectralBands[31]) / 3
        : trebleIntensity;
    const effectiveTreble = Math.max(trebleIntensity, spectralHighs);

    const highFrequencyFlutter = Math.sin(animationTimeSeconds * 34.0) * (effectiveTreble * 4.80 + snareImpulse * 3.50);
    const slowBreath = Math.sin(animationTimeSeconds * 1.60) * (midsIntensity * 1.20 * (0.35 + energyLevel * 0.65));
    const vibrationOffset = (highFrequencyFlutter + slowBreath) * dropMultiplier;

    const leftWhiskersList = [
        { startX: -14, startY: 14, cpX: -32, cpY: 10 + vibrationOffset * 0.70, endX: -50, endY: 7 + vibrationOffset },
        { startX: -15, startY: 17, cpX: -34, cpY: 17 + vibrationOffset * 0.30, endX: -55, endY: 17 + vibrationOffset * 0.40 },
        { startX: -14, startY: 20, cpX: -32, cpY: 23 - vibrationOffset * 0.60, endX: -48, endY: 27 - vibrationOffset }
    ];

    const rightWhiskersList = [
        { startX: 14, startY: 14, cpX: 32, cpY: 10 + vibrationOffset * 0.70, endX: 50, endY: 7 + vibrationOffset },
        { startX: 15, startY: 17, cpX: 34, cpY: 17 + vibrationOffset * 0.30, endX: 55, endY: 17 + vibrationOffset * 0.40 },
        { startX: 14, startY: 20, cpX: 32, cpY: 23 - vibrationOffset * 0.60, endX: 48, endY: 27 - vibrationOffset }
    ];

    const whiskerAlpha = Math.min(1.0, (0.55 + effectiveTreble * 0.40 + snareImpulse * 0.30) * dropMultiplier);
    const tipRadius = 1.0 + effectiveTreble * 2.0 + snareImpulse * 1.8;

    const renderWhiskerGroup = (whiskers) => {
        for (let index = 0; index < whiskers.length; index++) {
            const whisker = whiskers[index];
            canvasRenderingContext.strokeStyle = visualizerPalette.primaryAlpha
                ? visualizerPalette.primaryAlpha(whiskerAlpha)
                : visualizerPalette.primary;
            canvasRenderingContext.lineWidth = 1.0 + snareImpulse * 0.60;
            canvasRenderingContext.beginPath();
            canvasRenderingContext.moveTo(whisker.startX, whisker.startY);
            canvasRenderingContext.quadraticCurveTo(whisker.cpX, whisker.cpY, whisker.endX, whisker.endY);
            canvasRenderingContext.stroke();

            // Neon glowing bead at whisker tips on treble transients
            if (effectiveTreble > 0.25 || snareImpulse > 0.35 || isDropActive) {
                canvasRenderingContext.fillStyle = visualizerPalette.core;
                canvasRenderingContext.beginPath();
                canvasRenderingContext.arc(whisker.endX, whisker.endY, tipRadius, 0, Math.PI * 2);
                canvasRenderingContext.fill();
            }
        }
    };

    renderWhiskerGroup(leftWhiskersList);
    renderWhiskerGroup(rightWhiskersList);

    canvasRenderingContext.restore();
}

export const renderCyberWhiskers = renderCyberVibratingWhiskers;
