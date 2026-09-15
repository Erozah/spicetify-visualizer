// src/models/cyber/CyberTailSegmented.js - Cyberpunk segmented neon tail kinematics & rendering

/**
 * Renders segmented cyber tail with lazy sway, neon double strokes, traveling data pulse, and tip glow.
 * @param {CanvasRenderingContext2D} canvasRenderingContext
 * @param {Array<Object>} tailPointsBuffer
 * @param {number} totalTailSegments
 * @param {number} animationTimeSeconds
 * @param {Object} audioFeatureState
 * @param {Object} visualizerPalette
 */
export function renderCyberTailSegmented(
    canvasRenderingContext,
    tailPointsBuffer,
    totalTailSegments,
    animationTimeSeconds,
    audioFeatureState,
    visualizerPalette
) {
    canvasRenderingContext.save();
    const rootCoordinateX = 0;
    const rootCoordinateY = 78;

    const energyLevel = audioFeatureState.energy || 0.35;
    const normalizedTempo = Math.max(0.40, Math.min(2.0, (audioFeatureState.bpm || audioFeatureState.tempo || 120) / 120));
    const isMusicPlaying = audioFeatureState.isPlaying !== false;

    // 1. Natural lazy tail sway on chill music (0.15 - 0.25 Hz)
    const swayFrequency = isMusicPlaying ? (0.65 + normalizedTempo * 0.45 * (0.35 + energyLevel * 0.65)) : 0.35;
    const swayAmplitude = isMusicPlaying ? (16 + energyLevel * 20 + (audioFeatureState.bass || 0) * 16) : 12;

    canvasRenderingContext.beginPath();
    canvasRenderingContext.moveTo(rootCoordinateX, rootCoordinateY);

    for (let segmentIndex = 0; segmentIndex < totalTailSegments; segmentIndex++) {
        const segmentFraction = (segmentIndex + 1) / totalTailSegments;
        const wavePhase = Math.sin(animationTimeSeconds * swayFrequency - segmentFraction * 2.50);
        const tailCurl = Math.pow(segmentFraction, 1.30) * (swayAmplitude * wavePhase);
        const segmentCoordinateX = rootCoordinateX + tailCurl + Math.sin(segmentFraction * Math.PI) * (15 + energyLevel * 10);
        const segmentCoordinateY = rootCoordinateY + segmentFraction * 65 - Math.pow(segmentFraction, 2) * 18;

        tailPointsBuffer[segmentIndex] = { x: segmentCoordinateX, y: segmentCoordinateY };
        canvasRenderingContext.lineTo(segmentCoordinateX, segmentCoordinateY);
    }

    // 2. Outer vibrant neon stroke
    canvasRenderingContext.globalCompositeOperation = "screen";
    canvasRenderingContext.strokeStyle = visualizerPalette.accent;
    canvasRenderingContext.lineWidth = 3.0 + (audioFeatureState.bass || 0) * 1.50;
    canvasRenderingContext.lineCap = "round";
    canvasRenderingContext.lineJoin = "round";
    canvasRenderingContext.stroke();

    // 3. Inner laser starlight core
    canvasRenderingContext.globalCompositeOperation = "lighter";
    canvasRenderingContext.strokeStyle = visualizerPalette.core;
    canvasRenderingContext.lineWidth = 1.4;
    canvasRenderingContext.stroke();

    // 4. Data packet pulse traveling along tail spine
    const pulseTravelSpeed = 0.50 + normalizedTempo * 0.50 * (0.40 + energyLevel * 0.60);
    const pulseNormalizedPosition = (animationTimeSeconds * pulseTravelSpeed) % 1.0;
    const activeSegmentIndex = Math.min(totalTailSegments - 1, Math.floor(pulseNormalizedPosition * totalTailSegments));
    const activePulsePoint = tailPointsBuffer[activeSegmentIndex];

    if (activePulsePoint) {
        canvasRenderingContext.fillStyle = visualizerPalette.core;
        canvasRenderingContext.beginPath();
        canvasRenderingContext.arc(activePulsePoint.x, activePulsePoint.y, 3.5 + (audioFeatureState.bass || 0) * 2.0, 0, Math.PI * 2);
        canvasRenderingContext.fill();
    }

    // 5. Reactive tail tip bead glow
    const tipNodePoint = tailPointsBuffer[totalTailSegments - 1];
    if (tipNodePoint) {
        canvasRenderingContext.fillStyle = visualizerPalette.primary;
        canvasRenderingContext.beginPath();
        canvasRenderingContext.arc(tipNodePoint.x, tipNodePoint.y, 4.0 + (audioFeatureState.treble || 0) * 3.0, 0, Math.PI * 2);
        canvasRenderingContext.fill();
    }

    canvasRenderingContext.restore();
}

// Backward-compatible alias
export const renderCyberTail = renderCyberTailSegmented;
