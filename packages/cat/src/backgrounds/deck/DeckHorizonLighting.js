// src/backgrounds/deck/DeckHorizonLighting.js - Wooden deck rim light, reflection, and contact shadow with audio transients

export function renderDeckHorizonLighting(
    canvasRenderingContext,
    canvasViewportWidth,
    canvasViewportHeight,
    deckHorizonCoordinateY,
    paletteTheme,
    audioStateReference,
    felineCenterCoordinateX = null
) {
    const deckHeightPixels = canvasViewportHeight - deckHorizonCoordinateY;
    const bassLevel = audioStateReference ? (audioStateReference.bass || 0) : 0;
    const beatImpulse = audioStateReference ? (audioStateReference.beatImpulse || 0) : 0;
    const snareImpulse = audioStateReference ? (audioStateReference.snareImpulse || 0) : 0;
    const energyLevel = audioStateReference ? (audioStateReference.energy || 0.5) : 0.5;
    const isSongDrop = audioStateReference ? (audioStateReference.isDrop || false) : false;
    const dropMultiplier = isSongDrop ? 1.4 : 1.0;
    const centerHorizontalX = felineCenterCoordinateX !== null ? felineCenterCoordinateX : canvasViewportWidth * 0.5;

    // 1. Deck Horizon Rim Light
    canvasRenderingContext.save();
    canvasRenderingContext.globalCompositeOperation = "screen";

    const rimGradient = canvasRenderingContext.createLinearGradient(0, deckHorizonCoordinateY - 4, 0, deckHorizonCoordinateY + 8);
    rimGradient.addColorStop(0, paletteTheme.accentAlpha
        ? paletteTheme.accentAlpha(Math.min(1.0, (0.65 + beatImpulse * 0.35 + snareImpulse * 0.3) * dropMultiplier))
        : "rgba(255, 0, 127, 0.6)");
    rimGradient.addColorStop(0.35, paletteTheme.primaryAlpha
        ? paletteTheme.primaryAlpha(Math.min(1.0, (0.4 + bassLevel * 0.3) * dropMultiplier))
        : "rgba(0, 240, 255, 0.4)");
    rimGradient.addColorStop(1.0, "transparent");

    canvasRenderingContext.fillStyle = rimGradient;
    canvasRenderingContext.fillRect(0, deckHorizonCoordinateY - 3, canvasViewportWidth, 10);

    // Diffuse rim line
    canvasRenderingContext.strokeStyle = paletteTheme.accentAlpha
        ? paletteTheme.accentAlpha(Math.min(1.0, (0.5 + beatImpulse * 0.3 + snareImpulse * 0.25) * dropMultiplier))
        : "rgba(255, 0, 127, 0.5)";
    canvasRenderingContext.lineWidth = 3.0 + (isSongDrop ? 1.5 : 0);
    canvasRenderingContext.beginPath();
    canvasRenderingContext.moveTo(0, deckHorizonCoordinateY);
    canvasRenderingContext.lineTo(canvasViewportWidth, deckHorizonCoordinateY);
    canvasRenderingContext.stroke();

    // Crisp white core rim
    const whiteRimOpacity = Math.min(1.0, (0.6 + beatImpulse * 0.4 + snareImpulse * 0.4) * dropMultiplier);
    canvasRenderingContext.strokeStyle = `rgba(255, 255, 255, ${whiteRimOpacity})`;
    canvasRenderingContext.lineWidth = 1.0 + (isSongDrop ? 0.5 : 0);
    canvasRenderingContext.beginPath();
    canvasRenderingContext.moveTo(0, deckHorizonCoordinateY);
    canvasRenderingContext.lineTo(canvasViewportWidth, deckHorizonCoordinateY);
    canvasRenderingContext.stroke();

    canvasRenderingContext.restore();

    // 2. Ambient Feline & Energy Reflection on Polished Wood Surface
    canvasRenderingContext.save();
    canvasRenderingContext.globalCompositeOperation = "screen";

    const reflectionWidth = canvasViewportWidth * 0.34 * (1.0 + bassLevel * 0.25 + (isSongDrop ? 0.3 : 0));
    const reflectionHeight = deckHeightPixels * 0.85;

    const woodReflectionGradient = canvasRenderingContext.createRadialGradient(
        centerHorizontalX, deckHorizonCoordinateY + 6, 4,
        centerHorizontalX, deckHorizonCoordinateY + reflectionHeight * 0.5, reflectionWidth
    );

    const reflectionOpacity = Math.min(1.0, (0.22 + bassLevel * 0.18 + beatImpulse * 0.2 + snareImpulse * 0.15) * (0.8 + energyLevel * 0.4) * dropMultiplier);
    woodReflectionGradient.addColorStop(0, paletteTheme.accentAlpha ? paletteTheme.accentAlpha(reflectionOpacity * 0.95) : "rgba(255, 0, 127, 0.5)");
    woodReflectionGradient.addColorStop(0.3, paletteTheme.primaryAlpha ? paletteTheme.primaryAlpha(reflectionOpacity * 0.65) : "rgba(0, 240, 255, 0.3)");
    woodReflectionGradient.addColorStop(0.7, paletteTheme.secondaryAlpha ? paletteTheme.secondaryAlpha(reflectionOpacity * 0.3) : "rgba(157, 78, 221, 0.15)");
    woodReflectionGradient.addColorStop(1.0, "transparent");

    canvasRenderingContext.fillStyle = woodReflectionGradient;
    canvasRenderingContext.beginPath();
    canvasRenderingContext.ellipse(centerHorizontalX, deckHorizonCoordinateY + reflectionHeight * 0.4, reflectionWidth, reflectionHeight * 0.5, 0, 0, Math.PI * 2);
    canvasRenderingContext.fill();

    canvasRenderingContext.restore();

    // 3. Contact Shadow beneath paws and haunches
    canvasRenderingContext.save();
    const contactShadowGradient = canvasRenderingContext.createRadialGradient(
        centerHorizontalX, deckHorizonCoordinateY + 3, 8,
        centerHorizontalX, deckHorizonCoordinateY + 4, canvasViewportWidth * 0.16
    );
    contactShadowGradient.addColorStop(0, "rgba(2, 1, 5, 0.90)");
    contactShadowGradient.addColorStop(0.6, "rgba(4, 2, 8, 0.6)");
    contactShadowGradient.addColorStop(1.0, "transparent");

    canvasRenderingContext.fillStyle = contactShadowGradient;
    canvasRenderingContext.beginPath();
    canvasRenderingContext.ellipse(centerHorizontalX, deckHorizonCoordinateY + 3, canvasViewportWidth * 0.18, 7, 0, 0, Math.PI * 2);
    canvasRenderingContext.fill();

    canvasRenderingContext.restore();
}

// Backward-compatible alias
export const renderDeckLighting = renderDeckHorizonLighting;
