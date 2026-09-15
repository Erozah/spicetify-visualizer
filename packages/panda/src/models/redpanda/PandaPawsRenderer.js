// src/models/redpanda/PandaPawsRenderer.js - Seated front paws with pads, neon borders & claws
// SOLID Architecture: Dedicated paw rendering module

export class PandaPawsRenderer {
    render(ctx, palette, audio) {
        ctx.save();
        const pawPositions = [-38, 38];
        for (let p = 0; p < pawPositions.length; p++) {
            const px = pawPositions[p];
            const py = 118;

            ctx.fillStyle = "rgba(10, 6, 16, 0.96)";
            ctx.beginPath();
            ctx.ellipse(px, py, 18, 14, 0, 0, Math.PI * 2);
            ctx.fill();

            // Neon claw marks
            ctx.strokeStyle = palette.primaryAlpha ? palette.primaryAlpha(0.85) : "#00f0ff";
            ctx.lineWidth = 1.4;
            ctx.stroke();

            // 3 small claw tips
            ctx.fillStyle = palette.coreAlpha ? palette.coreAlpha(0.9) : "#ffffff";
            for (let c = -1; c <= 1; c++) {
                ctx.beginPath();
                ctx.arc(px + c * 8, py + 8, 1.4, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.restore();
    }
}
