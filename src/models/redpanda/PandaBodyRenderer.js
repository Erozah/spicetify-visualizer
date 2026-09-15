import { PandaAnatomyCoordinates } from './PandaAnatomyCoordinates.js';

// src/models/redpanda/PandaBodyRenderer.js - Seated body silhouette, copper coat gradient & constellation spine
// SOLID Architecture: Dedicated body silhouette, halo, spine, and chest core renderer

export class PandaBodyRenderer {
    render(ctx, palette, audio, softFactor, dropFactor, isDrop) {
        const energy = audio && typeof audio === "object" && audio.energy ? audio.energy : 0.35;
        const beat = audio && typeof audio === "object" && audio.beatImpulse ? audio.beatImpulse : 0;
        const bass = audio && typeof audio === "object" && audio.bass ? audio.bass : 0.2;

        // 1. Body Aura & Bioluminescent Halo (Behind Body Silhouette)
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        const auraRadius = 150 * (1.0 + bass * 0.25 + (isDrop ? 0.35 : 0));
        const auraGradient = ctx.createRadialGradient(0, 15, 20, 0, 15, auraRadius);
        const auraAlpha = Math.min(0.65, 0.15 * softFactor + (0.28 + energy * 0.30 + dropFactor * 0.20));
        auraGradient.addColorStop(0, palette.accentAlpha ? palette.accentAlpha(auraAlpha * 1.1) : "rgba(255, 100, 50, 0.4)");
        auraGradient.addColorStop(0.5, palette.primaryAlpha ? palette.primaryAlpha(auraAlpha * 0.6) : "rgba(0, 240, 255, 0.2)");
        auraGradient.addColorStop(1, "transparent");
        ctx.fillStyle = auraGradient;
        ctx.beginPath();
        ctx.arc(0, 15, auraRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 2. Base Body Dark Contrast Mask
        ctx.save();
        PandaAnatomyCoordinates.buildBodyPath(ctx);
        ctx.fillStyle = "rgba(12, 6, 16, 0.96)";
        ctx.fill();

        // Upper body & Back: Rich glowing Auburn / Copper / Palette Accent
        const bodyGradient = ctx.createLinearGradient(0, -90, 0, 130);
        const upperAlpha = Math.min(1.0, 0.75 + energy * 0.25);
        bodyGradient.addColorStop(0, palette.accentAlpha ? palette.accentAlpha(upperAlpha) : "rgba(255, 90, 45, 0.95)");
        bodyGradient.addColorStop(0.45, palette.secondaryAlpha ? palette.secondaryAlpha(upperAlpha * 0.85) : "rgba(200, 50, 80, 0.85)");
        bodyGradient.addColorStop(0.85, "rgba(22, 10, 25, 0.95)");
        bodyGradient.addColorStop(1.0, "rgba(10, 4, 15, 0.98)");
        ctx.fillStyle = bodyGradient;
        PandaAnatomyCoordinates.buildBodyPath(ctx);
        ctx.fill();
        ctx.restore();

        // 3. Pulsing Celestial Heart & Chest Core
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        const heartY = 15;
        const heartPulse = (0.5 + beat * 0.5);
        const heartRadius = (35 + beat * 18 + bass * 12);
        const heartGradient = ctx.createRadialGradient(0, heartY, 2, 0, heartY, heartRadius);
        heartGradient.addColorStop(0, palette.coreAlpha ? palette.coreAlpha(heartPulse * 0.95) : "#ffffff");
        heartGradient.addColorStop(0.4, palette.primaryAlpha ? palette.primaryAlpha(heartPulse * 0.7) : "rgba(0, 240, 255, 0.6)");
        heartGradient.addColorStop(1, "transparent");
        ctx.fillStyle = heartGradient;
        ctx.beginPath();
        ctx.arc(0, heartY, heartRadius, 0, Math.PI * 2);
        ctx.fill();

        // Constellation Spine Nodes
        const spineNodes = [-45, -20, 10, 40, 70];
        ctx.fillStyle = palette.coreAlpha ? palette.coreAlpha(0.85) : "#ffffff";
        for (let s = 0; s < spineNodes.length; s++) {
            const ny = spineNodes[s];
            const nodeSize = (s === 2) ? 3.5 : 2.2;
            ctx.beginPath();
            ctx.arc(0, ny, nodeSize * (1.0 + beat * 0.4), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        // 4. Laser Neon Body Contours
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        ctx.strokeStyle = palette.primaryAlpha ? palette.primaryAlpha(0.9) : "#00f0ff";
        ctx.lineWidth = 1.8;
        PandaAnatomyCoordinates.buildBodyPath(ctx);
        ctx.stroke();

        // Shoulder & Back luminous fur accents
        ctx.strokeStyle = palette.accentAlpha ? palette.accentAlpha(0.7) : "#ff007f";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-50, -20);
        ctx.quadraticCurveTo(-75, 10, -60, 50);
        ctx.moveTo(50, -20);
        ctx.quadraticCurveTo(75, 10, 60, 50);
        ctx.stroke();
        ctx.restore();
    }
}
