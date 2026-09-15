// src/backgrounds/MossyPerchPlatform.js - Organic weathered mossy rock & stone perch platform
// SOLID Architecture: Dedicated natural ground platform renderer for the Red Panda

export class MossyPerchPlatform {
    constructor() {
        this.mossClusters = [
            { relX: -0.38, relY: 0.05, rx: 28, ry: 12, alpha: 0.85 },
            { relX: -0.22, relY: -0.02, rx: 34, ry: 14, alpha: 0.95 },
            { relX: -0.05, relY: 0.02, rx: 42, ry: 15, alpha: 1.0 },
            { relX: 0.16, relY: -0.04, rx: 36, ry: 13, alpha: 0.90 },
            { relX: 0.32, relY: 0.03, rx: 30, ry: 11, alpha: 0.80 },
            { relX: -0.12, relY: 0.08, rx: 24, ry: 9, alpha: 0.75 },
            { relX: 0.24, relY: 0.06, rx: 22, ry: 8, alpha: 0.70 }
        ];

        this.tendrils = [
            { relX: -0.32, len: 14, angle: 0.25 },
            { relX: -0.18, len: 18, angle: -0.15 },
            { relX: 0.08, len: 20, angle: 0.20 },
            { relX: 0.28, len: 15, angle: -0.30 }
        ];
    }

    render(ctx, viewportWidth, viewportHeight, deckY, palette, audio, centerXOverride) {
        const energy = audio && typeof audio === "object" && audio.energy ? audio.energy : 0.35;
        const bass = audio && typeof audio === "object" && audio.bass ? audio.bass : 0.2;
        const softFactor = audio && typeof audio === "object" ? (audio.softFactor || (audio.isSoft ? 1.0 : 0.0)) : 0.0;

        const surfaceY = deckY || (viewportHeight * 0.86);
        const centerX = centerXOverride || (viewportWidth * 0.5);

        const rockWidth = Math.min(420, Math.max(260, viewportWidth * 0.32));
        const rockHeight = Math.min(85, Math.max(55, viewportHeight * 0.10));
        const halfWidth = rockWidth * 0.5;

        ctx.save();

        // 1. Soft Ambient Ground Shadow under the boulder
        const shadowGradient = ctx.createRadialGradient(
            centerX, surfaceY + rockHeight * 0.75, 10,
            centerX, surfaceY + rockHeight * 0.75, halfWidth * 1.35
        );
        shadowGradient.addColorStop(0, "rgba(2, 2, 6, 0.85)");
        shadowGradient.addColorStop(0.5, "rgba(5, 4, 10, 0.45)");
        shadowGradient.addColorStop(1.0, "transparent");

        ctx.fillStyle = shadowGradient;
        ctx.beginPath();
        ctx.ellipse(centerX, surfaceY + rockHeight * 0.75, halfWidth * 1.3, rockHeight * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Organic Rock Silhouette & Slate Gradient
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(centerX - halfWidth, surfaceY + 8);
        ctx.quadraticCurveTo(centerX - halfWidth * 0.5, surfaceY - 6, centerX, surfaceY - 4);
        ctx.quadraticCurveTo(centerX + halfWidth * 0.5, surfaceY - 5, centerX + halfWidth, surfaceY + 6);

        ctx.bezierCurveTo(
            centerX + halfWidth * 1.08, surfaceY + rockHeight * 0.45,
            centerX + halfWidth * 0.85, surfaceY + rockHeight * 0.95,
            centerX + halfWidth * 0.45, surfaceY + rockHeight
        );

        ctx.quadraticCurveTo(centerX, surfaceY + rockHeight + 4, centerX - halfWidth * 0.45, surfaceY + rockHeight);

        ctx.bezierCurveTo(
            centerX - halfWidth * 0.88, surfaceY + rockHeight * 0.92,
            centerX - halfWidth * 1.06, surfaceY + rockHeight * 0.40,
            centerX - halfWidth, surfaceY + 8
        );
        ctx.closePath();

        const rockGradient = ctx.createLinearGradient(centerX, surfaceY - 10, centerX, surfaceY + rockHeight + 5);
        rockGradient.addColorStop(0.0, "rgba(35, 30, 45, 0.98)");
        rockGradient.addColorStop(0.3, "rgba(22, 18, 30, 0.98)");
        rockGradient.addColorStop(0.7, "rgba(12, 10, 18, 0.99)");
        rockGradient.addColorStop(1.0, "rgba(5, 4, 8, 1.0)");

        ctx.fillStyle = rockGradient;
        ctx.fill();

        // Subtle stone rim highlight
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = palette.coreAlpha ? palette.coreAlpha(0.25) : "rgba(255, 255, 255, 0.2)";
        ctx.stroke();
        ctx.restore();

        // 3. Weathered Stone Cracks
        ctx.save();
        ctx.strokeStyle = "rgba(10, 8, 14, 0.85)";
        ctx.lineWidth = 1.2;

        ctx.beginPath();
        ctx.moveTo(centerX - halfWidth * 0.45, surfaceY + 14);
        ctx.quadraticCurveTo(centerX - halfWidth * 0.25, surfaceY + 28, centerX - halfWidth * 0.35, surfaceY + rockHeight * 0.65);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(centerX + halfWidth * 0.3, surfaceY + 12);
        ctx.quadraticCurveTo(centerX + halfWidth * 0.45, surfaceY + 30, centerX + halfWidth * 0.38, surfaceY + rockHeight * 0.7);
        ctx.stroke();
        ctx.restore();

        // 4. Bioluminescent Forest Moss Carpeting
        ctx.save();
        ctx.globalCompositeOperation = "screen";

        const mossPulse = Math.min(1.0, (0.35 * softFactor + (0.55 + energy * 0.35 + bass * 0.25) * (1.0 - softFactor * 0.5)));

        for (let i = 0; i < this.mossClusters.length; i++) {
            const m = this.mossClusters[i];
            const mx = centerX + m.relX * rockWidth;
            const my = surfaceY + m.relY * rockHeight;

            const mossGrad = ctx.createRadialGradient(mx, my, 0, mx, my, m.rx);
            const mAlpha = m.alpha * mossPulse;

            const primaryColor = (i % 2 === 0 && palette.secondaryAlpha)
                ? palette.secondaryAlpha(mAlpha * 0.75)
                : (palette.primaryAlpha ? palette.primaryAlpha(mAlpha * 0.85) : `rgba(16, 185, 129, ${mAlpha * 0.8})`);

            const glowColor = palette.primaryAlpha ? palette.primaryAlpha(mAlpha * 0.35) : "rgba(52, 211, 153, 0.3)";

            mossGrad.addColorStop(0, primaryColor);
            mossGrad.addColorStop(0.65, glowColor);
            mossGrad.addColorStop(1.0, "transparent");

            ctx.fillStyle = mossGrad;
            ctx.beginPath();
            ctx.ellipse(mx, my, m.rx, m.ry, 0, 0, Math.PI * 2);
            ctx.fill();

            // Tiny bright spores on moss crown
            ctx.fillStyle = palette.coreAlpha ? palette.coreAlpha(mAlpha * 0.9) : "rgba(255, 255, 255, 0.8)";
            ctx.beginPath();
            ctx.arc(mx + (i % 3 - 1) * 6, my - 2, 1.2, 0, Math.PI * 2);
            ctx.fill();
        }

        // 5. Hanging Moss / Vine Tendrils over the rock edge
        ctx.lineWidth = 1.4;
        for (let i = 0; i < this.tendrils.length; i++) {
            const t = this.tendrils[i];
            const tx = centerX + t.relX * rockWidth;
            const ty = surfaceY + 8;

            ctx.strokeStyle = palette.primaryAlpha ? palette.primaryAlpha(0.6 * mossPulse) : "rgba(16, 185, 129, 0.6)";
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.quadraticCurveTo(tx + Math.sin(t.angle) * 8, ty + t.len * 0.5, tx + Math.sin(t.angle) * 12, ty + t.len);
            ctx.stroke();

            // Tiny droplet at tendril tip
            ctx.fillStyle = palette.coreAlpha ? palette.coreAlpha(0.85 * mossPulse) : "#ffffff";
            ctx.beginPath();
            ctx.arc(tx + Math.sin(t.angle) * 12, ty + t.len, 1.0, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
        ctx.restore();
    }
}

// Backward compatibility alias
