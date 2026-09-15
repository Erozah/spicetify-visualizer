// src/backgrounds/forest/BambooGroveStalks.js - Procedural flanked bamboo stalks with segment nodes & leaf clusters
// SOLID Architecture: Dedicated renderer for bamboo canes, nodes, and foliage clusters

export class BambooGroveStalks {
    constructor(viewportWidth = 1200, viewportHeight = 800) {
        this.stalks = [];
        this.initializeStalks(viewportWidth, viewportHeight);
    }

    initializeStalks(viewportWidth, viewportHeight) {
        this.stalks = [];
        const stalkCount = 18;

        for (let i = 0; i < stalkCount; i++) {
            const isLeftFlank = (i % 2 === 0);
            const flankFraction = (i / stalkCount);
            // Left flank: 2% to 30% of screen width; Right flank: 70% to 98% of screen width
            const xPosition = isLeftFlank
                ? (viewportWidth * (0.02 + (flankFraction * 0.28)))
                : (viewportWidth * (0.70 + (flankFraction * 0.28)));

            const depth = 0.35 + Math.random() * 0.65; // 0.35 distant/thin, 1.0 foreground/thick
            const baseRadius = (5 + depth * 14);
            const heightVariance = (Math.random() - 0.5) * 40;
            const segmentCount = Math.floor(6 + depth * 5);

            const stalkHeight = viewportHeight * 1.05 + heightVariance;
            const segmentLength = stalkHeight / segmentCount;
            const segments = [];

            for (let s = 0; s < segmentCount; s++) {
                const segmentY = viewportHeight - (s * segmentLength);
                const hasBranch = (s >= 2 && s < segmentCount - 1 && Math.random() > 0.45);
                const branchDirection = (xPosition < viewportWidth * 0.5)
                    ? (Math.random() > 0.3 ? 1 : -1)
                    : (Math.random() > 0.3 ? -1 : 1);

                segments.push({
                    y: segmentY,
                    len: segmentLength,
                    hasBranch: hasBranch,
                    branchDir: branchDirection,
                    branchLen: (25 + Math.random() * 45) * depth,
                    branchAngle: (branchDirection > 0 ? 0.45 : -0.45) + (Math.random() - 0.5) * 0.25
                });
            }

            this.stalks.push({
                x: xPosition,
                depth: depth,
                radius: baseRadius,
                curve: (Math.random() - 0.5) * 25,
                swaySpeed: 0.8 + (1.0 - depth) * 0.8 + Math.random() * 0.4,
                swayPhase: Math.random() * Math.PI * 2,
                segments: segments
            });
        }

        // Painter's algorithm: sort stalks so distant ones render first
        this.stalks.sort((first, second) => first.depth - second.depth);
    }

    render(ctx, viewportWidth, viewportHeight, windPhase, windIntensity, audio, palette) {
        const bass = audio && typeof audio === "object" && audio.bass ? audio.bass : 0.2;
        const dropFactor = audio && typeof audio === "object" ? (audio.dropFactor || (audio.isDrop ? 1.0 : 0.0)) : 0.0;

        for (let i = 0; i < this.stalks.length; i++) {
            const stalk = this.stalks[i];
            const depth = stalk.depth;
            const swayAmount = Math.sin(windPhase * stalk.swaySpeed + stalk.swayPhase) * (12 + depth * 24) * windIntensity;
            const startX = stalk.x;
            const topX = startX + stalk.curve + swayAmount;

            const stalkAlpha = (0.20 + depth * 0.55) * (0.8 + dropFactor * 0.3);
            const stalkGradient = ctx.createLinearGradient(startX, viewportHeight, topX, 0);

            const baseColor = (depth > 0.7)
                ? (palette.primaryAlpha ? palette.primaryAlpha(stalkAlpha * 0.9) : `rgba(0, 240, 255, ${stalkAlpha})`)
                : (palette.secondaryAlpha ? palette.secondaryAlpha(stalkAlpha * 0.6) : `rgba(100, 50, 180, ${stalkAlpha})`);
            const topColor = (palette.accentAlpha ? palette.accentAlpha(stalkAlpha * 0.75) : `rgba(255, 0, 127, ${stalkAlpha})`);

            stalkGradient.addColorStop(0, "rgba(5, 5, 15, 0.95)");
            stalkGradient.addColorStop(0.4, baseColor);
            stalkGradient.addColorStop(1.0, topColor);

            ctx.lineWidth = stalk.radius * 2;
            ctx.lineCap = "round";
            ctx.strokeStyle = stalkGradient;

            const midY = viewportHeight * 0.5;
            const midX = (startX + topX) * 0.5 + swayAmount * 0.45;

            ctx.beginPath();
            ctx.moveTo(startX, viewportHeight + 10);
            ctx.quadraticCurveTo(midX, midY, topX, -20);
            ctx.stroke();

            // Segment Nodes (luminous rings pulsing to bass)
            const segmentCount = stalk.segments.length;
            for (let s = 1; s < segmentCount; s++) {
                const seg = stalk.segments[s];
                const tFrac = (viewportHeight - seg.y) / viewportHeight;
                const nodeX = (1 - tFrac) * (1 - tFrac) * startX + 2 * (1 - tFrac) * tFrac * midX + tFrac * tFrac * topX;
                const nodeY = seg.y;

                const nodeWidth = stalk.radius * 2.3;
                const ringPulse = (0.3 + bass * 0.7) * stalkAlpha;
                ctx.save();
                ctx.lineWidth = 2.0;
                ctx.strokeStyle = palette.coreAlpha ? palette.coreAlpha(ringPulse) : "#ffffff";
                ctx.beginPath();
                ctx.moveTo(nodeX - nodeWidth * 0.5, nodeY);
                ctx.lineTo(nodeX + nodeWidth * 0.5, nodeY);
                ctx.stroke();
                ctx.restore();

                // Branch & Leaf cluster from node
                if (seg.hasBranch && depth > 0.45) {
                    const branchEndX = nodeX + Math.cos(seg.branchAngle) * seg.branchLen * seg.branchDir + swayAmount * 0.2;
                    const branchEndY = nodeY - Math.sin(Math.abs(seg.branchAngle)) * seg.branchLen;

                    ctx.save();
                    ctx.lineWidth = Math.max(1.0, stalk.radius * 0.25);
                    ctx.strokeStyle = stalkGradient;
                    ctx.beginPath();
                    ctx.moveTo(nodeX, nodeY);
                    ctx.quadraticCurveTo(nodeX + seg.branchDir * 15, nodeY - 10, branchEndX, branchEndY);
                    ctx.stroke();

                    this.renderLeafCluster(ctx, branchEndX, branchEndY, seg.branchAngle, seg.branchDir, palette, stalkAlpha);
                    ctx.restore();
                }
            }
        }
    }

    renderLeafCluster(ctx, x, y, baseAngle, direction, palette, alpha) {
        const clusterLeafCount = 3;
        for (let k = 0; k < clusterLeafCount; k++) {
            const angleOffset = (k - 1) * 0.28;
            const angle = baseAngle + angleOffset;
            const leafLength = 22 + k * 4;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle * direction);

            ctx.fillStyle = (k % 2 === 0 && palette.primaryAlpha)
                ? palette.primaryAlpha(alpha * 0.85)
                : (palette.accentAlpha ? palette.accentAlpha(alpha * 0.75) : "rgba(0, 240, 255, 0.5)");

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(leafLength * 0.4, -4, leafLength, 0);
            ctx.quadraticCurveTo(leafLength * 0.4, 4, 0, 0);
            ctx.fill();

            ctx.restore();
        }
    }
}
