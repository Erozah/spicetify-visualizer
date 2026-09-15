// src/models/redpanda/PandaAnatomyCoordinates.js - Procedural Bezier contours & anatomical coordinates for Red Panda
// SOLID Architecture: Dedicated geometric path generator for body and skull silhouettes

export class PandaAnatomyCoordinates {
    static buildBodyPath(ctx) {
        // Organic seated pear/panda silhouette with rounded shoulders and plush hips
        ctx.beginPath();
        ctx.moveTo(0, -65);                                // Neck/shoulder connection
        ctx.bezierCurveTo(45, -60, 75, -20, 85, 25);       // Right shoulder to flank
        ctx.bezierCurveTo(95, 65, 90, 105, 65, 125);       // Right hip to base
        ctx.bezierCurveTo(35, 135, -35, 135, -65, 125);    // Rounded base/bottom
        ctx.bezierCurveTo(-90, 105, -95, 65, -85, 25);     // Left hip to flank
        ctx.bezierCurveTo(-75, -20, -45, -60, 0, -65);     // Left shoulder to neck
        ctx.closePath();
    }

    static buildHeadPath(ctx) {
        // Broad rounded red panda skull with cute chubby cheek ruffs
        ctx.beginPath();
        ctx.moveTo(0, -42);                                // Crown
        ctx.bezierCurveTo(28, -42, 52, -28, 58, -8);       // Right upper temple
        ctx.bezierCurveTo(68, 6, 75, 24, 60, 36);          // Right chubby cheek ruff
        ctx.bezierCurveTo(45, 48, 25, 44, 0, 42);          // Right jaw to chin
        ctx.bezierCurveTo(-25, 44, -45, 48, -60, 36);      // Chin to left jaw
        ctx.bezierCurveTo(-75, 24, -68, 6, -58, -8);       // Left chubby cheek ruff
        ctx.bezierCurveTo(-52, -28, -28, -42, 0, -42);     // Left upper temple to crown
        ctx.closePath();
    }

    static calculateBaseDimensions(viewportWidth, viewportHeight) {
        const baseWidth = Math.min(260, Math.min(viewportWidth * 0.30, viewportHeight * 0.42));
        const pandaScale = baseWidth / 250;
        const bodyHeight = baseWidth * 1.25;
        return { baseWidth, pandaScale, bodyHeight };
    }
}
