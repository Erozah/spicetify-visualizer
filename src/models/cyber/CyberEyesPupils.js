// src/models/cyber/CyberEyesPupils.js - Animated cyber cat eyes with audio-reactive pupil dilation & drop radiance

export function renderCyberEyesAndPupils(
    canvasRenderingContext,
    isBlinking,
    blinkProgress,
    audioFeatureState,
    visualizerPalette
) {
    canvasRenderingContext.save();
    canvasRenderingContext.translate(0, -72);

    const blinkRatio = isBlinking ? Math.sin(blinkProgress) : 0;
    const eyeHeightScale = Math.max(0.08, 1.0 - blinkRatio * 0.95);

    const beatImpulse = audioFeatureState.beatImpulse || 0;
    const energyLevel = audioFeatureState.energyLevel !== undefined
        ? audioFeatureState.energyLevel
        : (audioFeatureState.energy || 0.40);
    const isDropActive = !!audioFeatureState.isDrop;

    // Feline pupil dilation indexed on track energy level and drop state
    const pupilDilationFactor = Math.min(1.0, energyLevel * 0.70 + beatImpulse * 0.35 + (isDropActive ? 0.45 : 0));
    const pupilWidth = 1.5 + pupilDilationFactor * 4.2;
    const pupilHeight = 4.2 + pupilDilationFactor * 0.6;

    // 1. Outer Ocular Halo Flare during high energy or drop
    if (isDropActive || energyLevel > 0.65) {
        canvasRenderingContext.save();
        canvasRenderingContext.globalCompositeOperation = "lighter";
        const haloRadius = 14 + (isDropActive ? 8 : 0) + beatImpulse * 4;
        const haloAlpha = isDropActive ? 0.50 : 0.30;

        [-14, 14].forEach((eyeOffset) => {
            const gradient = canvasRenderingContext.createRadialGradient(eyeOffset, 2, 2, eyeOffset, 2, haloRadius);
            gradient.addColorStop(0, visualizerPalette.core);
            gradient.addColorStop(0.40, visualizerPalette.accentAlpha ? visualizerPalette.accentAlpha(haloAlpha) : visualizerPalette.accent);
            gradient.addColorStop(1.0, "transparent");
            canvasRenderingContext.fillStyle = gradient;
            canvasRenderingContext.beginPath();
            canvasRenderingContext.arc(eyeOffset, 2, haloRadius, 0, Math.PI * 2);
            canvasRenderingContext.fill();
        });
        canvasRenderingContext.restore();
    }

    // 2. Render Single Eye Geometry Helper
    const renderSingleEye = (horizontalOffset, tiltAngle) => {
        canvasRenderingContext.save();
        canvasRenderingContext.translate(horizontalOffset, 2);
        canvasRenderingContext.scale(1.0, eyeHeightScale);

        canvasRenderingContext.globalCompositeOperation = "lighter";
        canvasRenderingContext.fillStyle = visualizerPalette.primary;
        canvasRenderingContext.beginPath();
        canvasRenderingContext.ellipse(0, 0, 7.5, 5.0, tiltAngle, 0, Math.PI * 2);
        canvasRenderingContext.fill();

        canvasRenderingContext.fillStyle = visualizerPalette.core;
        canvasRenderingContext.beginPath();
        canvasRenderingContext.ellipse(0, 0, 4.5, 3.0, tiltAngle, 0, Math.PI * 2);
        canvasRenderingContext.fill();

        canvasRenderingContext.fillStyle = "#010108";
        canvasRenderingContext.beginPath();
        canvasRenderingContext.ellipse(0, 0, pupilWidth, pupilHeight, 0, 0, Math.PI * 2);
        canvasRenderingContext.fill();

        canvasRenderingContext.fillStyle = "#ffffff";
        canvasRenderingContext.beginPath();
        canvasRenderingContext.arc(2, -1.8, 1.2, 0, Math.PI * 2);
        canvasRenderingContext.fill();

        // Prismatic light refraction streaks on drop impact
        if (isDropActive) {
            canvasRenderingContext.strokeStyle = visualizerPalette.accent;
            canvasRenderingContext.lineWidth = 1.0;
            canvasRenderingContext.beginPath();
            canvasRenderingContext.moveTo(-5, -2);
            canvasRenderingContext.lineTo(5, 2);
            canvasRenderingContext.stroke();
        }

        canvasRenderingContext.restore();
    };

    renderSingleEye(-14, -0.15);
    renderSingleEye(14, 0.15);

    canvasRenderingContext.restore();
}

export const renderCyberEyes = renderCyberEyesAndPupils;
