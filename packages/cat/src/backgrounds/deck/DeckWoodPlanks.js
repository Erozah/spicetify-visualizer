// src/backgrounds/deck/DeckWoodPlanks.js - Wooden deck plank geometry, wood grain, and fasteners

export function initializeDeckPlankProfiles(totalPlankCount = 4) {
    const plankProfiles = [];
    for (let plankIndex = 0; plankIndex < totalPlankCount; plankIndex++) {
        const colorShift = (Math.random() - 0.5) * 8;
        const redChannel = Math.max(8, Math.min(32, 16 + colorShift));
        const greenChannel = Math.max(6, Math.min(26, 12 + colorShift * 0.8));
        const blueChannel = Math.max(10, Math.min(38, 22 + colorShift * 1.2));

        plankProfiles.push({
            red: redChannel | 0,
            green: greenChannel | 0,
            blue: blueChannel | 0,
            topEdgeColor: `rgba(${(redChannel + 6) | 0}, ${(greenChannel + 5) | 0}, ${(blueChannel + 8) | 0}, 0.95)`,
            midBodyColor: `rgba(${redChannel | 0}, ${greenChannel | 0}, ${blueChannel | 0}, 0.95)`,
            bottomEdgeColor: `rgba(${(redChannel - 4) | 0}, ${(greenChannel - 3) | 0}, ${(blueChannel - 5) | 0}, 0.95)`,
            grainStreakColor: `rgba(${(redChannel + 14) | 0}, ${(greenChannel + 12) | 0}, ${(blueChannel + 18) | 0}, 0.16)`,
            fastenerPositions: [0.12, 0.32, 0.5, 0.68, 0.88]
        });
    }
    return plankProfiles;
}

export function renderDeckWoodPlanks(
    canvasRenderingContext,
    canvasViewportWidth,
    canvasViewportHeight,
    deckHorizonCoordinateY,
    plankProfiles
) {
    const deckHeightPixels = canvasViewportHeight - deckHorizonCoordinateY;

    // 1. Base Deck Floor Fill
    const baseFloorGradient = canvasRenderingContext.createLinearGradient(0, deckHorizonCoordinateY, 0, canvasViewportHeight);
    baseFloorGradient.addColorStop(0, "rgba(14, 10, 20, 0.98)");
    baseFloorGradient.addColorStop(0.35, "rgba(20, 14, 26, 0.99)");
    baseFloorGradient.addColorStop(0.7, "rgba(12, 8, 18, 1.0)");
    baseFloorGradient.addColorStop(1.0, "rgba(6, 4, 12, 1.0)");

    canvasRenderingContext.fillStyle = baseFloorGradient;
    canvasRenderingContext.fillRect(0, deckHorizonCoordinateY, canvasViewportWidth, deckHeightPixels);

    // 2. Horizontal Wooden Planks
    let currentVerticalY = deckHorizonCoordinateY;
    const totalCount = plankProfiles.length;

    for (let plankIndex = 0; plankIndex < totalCount; plankIndex++) {
        const perspectiveProgress = plankIndex / totalCount;
        const plankHeight = deckHeightPixels * (0.16 + perspectiveProgress * 0.16);
        const plankBottomCoordinateY = Math.min(canvasViewportHeight, currentVerticalY + plankHeight);
        const plank = plankProfiles[plankIndex];

        const plankGradient = canvasRenderingContext.createLinearGradient(0, currentVerticalY, 0, plankBottomCoordinateY);
        plankGradient.addColorStop(0, plank.topEdgeColor);
        plankGradient.addColorStop(0.5, plank.midBodyColor);
        plankGradient.addColorStop(1.0, plank.bottomEdgeColor);

        canvasRenderingContext.fillStyle = plankGradient;
        canvasRenderingContext.fillRect(0, currentVerticalY, canvasViewportWidth, plankHeight);

        // Wood grain streak
        canvasRenderingContext.strokeStyle = plank.grainStreakColor;
        canvasRenderingContext.lineWidth = 1.0;
        const grainVerticalY = currentVerticalY + plankHeight * 0.45;

        canvasRenderingContext.beginPath();
        canvasRenderingContext.moveTo(0, grainVerticalY);
        canvasRenderingContext.quadraticCurveTo(canvasViewportWidth * 0.45, grainVerticalY - 1.2, canvasViewportWidth, grainVerticalY + 0.8);
        canvasRenderingContext.stroke();

        // Plank seam shadow
        canvasRenderingContext.fillStyle = "rgba(4, 3, 8, 0.95)";
        canvasRenderingContext.fillRect(0, plankBottomCoordinateY - 1.5, canvasViewportWidth, 1.5);

        // Plank top bevel highlight
        canvasRenderingContext.fillStyle = "rgba(255, 255, 255, 0.07)";
        canvasRenderingContext.fillRect(0, currentVerticalY, canvasViewportWidth, 1);

        // Nail fasteners
        const fastenerPositions = plank.fastenerPositions;
        const nailCenterY = currentVerticalY + plankHeight * 0.5;
        for (let nailIndex = 0; nailIndex < fastenerPositions.length; nailIndex++) {
            const nailCenterX = fastenerPositions[nailIndex] * canvasViewportWidth;

            canvasRenderingContext.beginPath();
            canvasRenderingContext.arc(nailCenterX, nailCenterY, 1.6, 0, Math.PI * 2);
            canvasRenderingContext.fillStyle = "rgba(10, 8, 16, 0.85)";
            canvasRenderingContext.fill();

            canvasRenderingContext.beginPath();
            canvasRenderingContext.arc(nailCenterX - 0.4, nailCenterY - 0.4, 0.9, 0, Math.PI * 2);
            canvasRenderingContext.fillStyle = "rgba(255, 255, 255, 0.14)";
            canvasRenderingContext.fill();
        }

        currentVerticalY = plankBottomCoordinateY;
    }
}

// Backward-compatible aliases
export const initDeckPlanks = initializeDeckPlankProfiles;
export const renderDeckPlanks = renderDeckWoodPlanks;
