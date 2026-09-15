// src/models/redpanda/tail/TailRingFurRenderer.js - Plush alternating ringed fur & neon laser outlines
// SOLID Architecture: Dedicated renderer for the Red Panda's iconic alternating rings, dark tip & fur tufts

export class TailRingFurRenderer {
    constructor(ringCount = 8) {
        this.ringCount = ringCount;
    }

    calculateWidthProfile(fraction, scale, isDrop) {
        const bell = Math.sin(fraction * Math.PI);
        const baseWidth = 18 * scale;
        const maxWidth = (46 + (isDrop ? 8 : 0)) * scale;
        return baseWidth + (maxWidth - baseWidth) * Math.pow(bell, 0.75);
    }

    render(ctx, points, segmentCount, palette, audio, scale) {
        if (!points || points.length < 2) return;

        const energy = audio && typeof audio === "object" && audio.energy ? audio.energy : 0.35;
        const beat = audio && typeof audio === "object" && audio.beatImpulse ? audio.beatImpulse : 0;
        const isDrop = audio && typeof audio === "object" && audio.isDrop;

        const leftEdge = [];
        const rightEdge = [];

        for (let i = 0; i < segmentCount; i++) {
            const frac = i / (segmentCount - 1);
            const p = points[i];
            const w = this.calculateWidthProfile(frac, scale, isDrop);

            let nx = 0, ny = 1;
            if (i < segmentCount - 1) {
                const next = points[i + 1];
                const dx = next.x - p.x;
                const dy = next.y - p.y;
                const len = Math.sqrt(dx * dx + dy * dy) || 1;
                nx = -dy / len;
                ny = dx / len;
            } else {
                const prev = points[i - 1];
                const dx = p.x - prev.x;
                const dy = p.y - prev.y;
                const len = Math.sqrt(dx * dx + dy * dy) || 1;
                nx = -dy / len;
                ny = dx / len;
            }

            leftEdge.push({ x: p.x + nx * w * 0.5, y: p.y + ny * w * 0.5 });
            rightEdge.push({ x: p.x - nx * w * 0.5, y: p.y - ny * w * 0.5 });
        }

        ctx.save();

        // 1. Base Dark Mask for contrast
        ctx.beginPath();
        ctx.moveTo(leftEdge[0].x, leftEdge[0].y);
        for (let i = 1; i < segmentCount; i++) {
            ctx.lineTo(leftEdge[i].x, leftEdge[i].y);
        }
        const tip = points[segmentCount - 1];
        const tipRadius = this.calculateWidthProfile(1.0, scale, isDrop) * 0.5;
        ctx.arc(tip.x, tip.y, tipRadius, 0, Math.PI);
        for (let i = segmentCount - 1; i >= 0; i--) {
            ctx.lineTo(rightEdge[i].x, rightEdge[i].y);
        }
        ctx.closePath();
        ctx.fillStyle = "rgba(14, 8, 20, 0.95)";
        ctx.fill();

        // 2. Alternating Rings: Luminous Cream vs Warm Copper
        for (let r = 0; r < this.ringCount; r++) {
            const startFrac = r / this.ringCount;
            const endFrac = (r + 1) / this.ringCount;

            const startIdx = Math.floor(startFrac * (segmentCount - 1));
            const endIdx = Math.min(segmentCount - 1, Math.ceil(endFrac * (segmentCount - 1)));
            if (endIdx <= startIdx) continue;

            const isLightRing = (r % 2 === 1);

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(leftEdge[startIdx].x, leftEdge[startIdx].y);
            for (let i = startIdx + 1; i <= endIdx; i++) {
                ctx.lineTo(leftEdge[i].x, leftEdge[i].y);
            }
            for (let i = endIdx; i >= startIdx; i--) {
                ctx.lineTo(rightEdge[i].x, rightEdge[i].y);
            }
            ctx.closePath();

            const midPoint = points[Math.floor((startIdx + endIdx) * 0.5)];
            const ringWidth = this.calculateWidthProfile((startFrac + endFrac) * 0.5, scale, isDrop);
            const ringGrad = ctx.createRadialGradient(midPoint.x, midPoint.y, 2, midPoint.x, midPoint.y, ringWidth);

            if (isLightRing) {
                const ringAlpha = Math.min(1.0, 0.70 + beat * 0.30);
                ringGrad.addColorStop(0, palette.coreAlpha ? palette.coreAlpha(ringAlpha) : "#ffffff");
                ringGrad.addColorStop(0.5, palette.primaryAlpha ? palette.primaryAlpha(ringAlpha * 0.75) : "rgba(0, 240, 255, 0.7)");
                ringGrad.addColorStop(1.0, palette.coreAlpha ? palette.coreAlpha(ringAlpha * 0.4) : "rgba(255, 255, 255, 0.3)");
                ctx.fillStyle = ringGrad;
                ctx.fill();
            } else {
                const copperAlpha = Math.min(1.0, 0.65 + energy * 0.35);
                ringGrad.addColorStop(0, palette.accentAlpha ? palette.accentAlpha(copperAlpha) : "rgba(255, 80, 40, 0.8)");
                ringGrad.addColorStop(0.6, palette.secondaryAlpha ? palette.secondaryAlpha(copperAlpha * 0.7) : "rgba(180, 40, 60, 0.6)");
                ringGrad.addColorStop(1.0, "rgba(20, 8, 15, 0.9)");
                ctx.fillStyle = ringGrad;
                ctx.fill();
            }

            ctx.restore();
        }

        // 3. Dark Plumage Tip
        const tipIdx = Math.floor(segmentCount * 0.88);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(leftEdge[tipIdx].x, leftEdge[tipIdx].y);
        for (let i = tipIdx + 1; i < segmentCount; i++) {
            ctx.lineTo(leftEdge[i].x, leftEdge[i].y);
        }
        ctx.arc(tip.x, tip.y, tipRadius, 0, Math.PI);
        for (let i = segmentCount - 1; i >= tipIdx; i--) {
            ctx.lineTo(rightEdge[i].x, rightEdge[i].y);
        }
        ctx.closePath();
        ctx.fillStyle = "rgba(10, 6, 16, 0.95)";
        ctx.fill();
        ctx.restore();

        // 4. Laser Neon Contours & Outer Fur Tufts
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        ctx.strokeStyle = palette.primaryAlpha ? palette.primaryAlpha(0.85) : "#00f0ff";
        ctx.lineWidth = 1.8;

        ctx.beginPath();
        ctx.moveTo(leftEdge[0].x, leftEdge[0].y);
        for (let i = 1; i < segmentCount; i++) {
            ctx.lineTo(leftEdge[i].x, leftEdge[i].y);
        }
        ctx.arc(tip.x, tip.y, tipRadius, 0, Math.PI);
        for (let i = segmentCount - 1; i >= 0; i--) {
            ctx.lineTo(rightEdge[i].x, rightEdge[i].y);
        }
        ctx.stroke();

        // Fluffy Fur Edge Accents
        ctx.strokeStyle = palette.coreAlpha ? palette.coreAlpha(0.7) : "rgba(255, 255, 255, 0.6)";
        ctx.lineWidth = 1.0;
        for (let i = 2; i < segmentCount - 1; i += 2) {
            const lp = leftEdge[i];
            const rp = rightEdge[i];
            ctx.beginPath();
            ctx.moveTo(lp.x, lp.y);
            ctx.lineTo(lp.x - 5 * scale, lp.y - 3 * scale);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(rp.x, rp.y);
            ctx.lineTo(rp.x + 5 * scale, rp.y - 3 * scale);
            ctx.stroke();
        }

        ctx.restore();
        ctx.restore();
    }
}
