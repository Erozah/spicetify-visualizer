// src/backgrounds/forest/DriftingBambooLeaves.js - Drifting bamboo leaves with flutter, rotation & sway
// SOLID Architecture: Dedicated particle simulation and screen-blend renderer for falling leaves

export class DriftingBambooLeaves {
    constructor(viewportWidth = 1200, viewportHeight = 800) {
        this.leaves = [];
        this.initializeLeaves(viewportWidth, viewportHeight);
    }

    initializeLeaves(viewportWidth, viewportHeight) {
        this.leaves = [];
        const leafCount = 26;
        for (let i = 0; i < leafCount; i++) {
            this.leaves.push({
                x: Math.random() * viewportWidth,
                y: Math.random() * viewportHeight,
                size: 9 + Math.random() * 12,
                speedY: 18 + Math.random() * 32,
                swayAmp: 25 + Math.random() * 35,
                swaySpeed: 1.5 + Math.random() * 2.0,
                phase: Math.random() * Math.PI * 2,
                rot: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 2.5,
                depth: 0.4 + Math.random() * 0.6
            });
        }
    }

    update(deltaTime, windIntensity, isPlaying = true) {
        const viewportWidth = window.innerWidth || 1200;
        const viewportHeight = window.innerHeight || 800;

        for (let i = 0; i < this.leaves.length; i++) {
            const leaf = this.leaves[i];
            const speedMultiplier = isPlaying ? (0.6 + windIntensity * 0.7) : 0.4;
            leaf.y += leaf.speedY * deltaTime * speedMultiplier;
            leaf.phase += deltaTime * leaf.swaySpeed * (0.7 + windIntensity * 0.5);
            leaf.rot += deltaTime * leaf.rotSpeed;

            if (leaf.y > viewportHeight + 25) {
                leaf.y = -20;
                leaf.x = Math.random() * viewportWidth;
            }
        }
    }

    render(ctx, energy, palette) {
        ctx.save();
        ctx.globalCompositeOperation = "screen";

        for (let i = 0; i < this.leaves.length; i++) {
            const leaf = this.leaves[i];
            const currentX = leaf.x + Math.sin(leaf.phase) * leaf.swayAmp;
            const currentY = leaf.y;
            const leafAlpha = Math.min(0.75, (0.25 + leaf.depth * 0.45) * (0.7 + energy * 0.4));

            ctx.save();
            ctx.translate(currentX, currentY);
            ctx.rotate(leaf.rot + Math.sin(leaf.phase) * 0.4);

            const leafGradient = ctx.createLinearGradient(-leaf.size * 0.5, 0, leaf.size * 0.5, 0);
            leafGradient.addColorStop(0, palette.primaryAlpha ? palette.primaryAlpha(leafAlpha) : "rgba(0, 240, 255, 0.4)");
            leafGradient.addColorStop(0.5, palette.accentAlpha ? palette.accentAlpha(leafAlpha * 0.85) : "rgba(255, 0, 127, 0.35)");
            leafGradient.addColorStop(1, "transparent");

            ctx.fillStyle = leafGradient;
            ctx.beginPath();
            ctx.moveTo(0, -leaf.size * 0.3);
            ctx.quadraticCurveTo(leaf.size * 0.6, 0, 0, leaf.size * 0.3);
            ctx.quadraticCurveTo(-leaf.size * 0.6, 0, 0, -leaf.size * 0.3);
            ctx.fill();

            // Center leaf spine
            ctx.strokeStyle = palette.coreAlpha ? palette.coreAlpha(leafAlpha * 0.9) : "rgba(255, 255, 255, 0.5)";
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(-leaf.size * 0.5, 0);
            ctx.lineTo(leaf.size * 0.5, 0);
            ctx.stroke();

            ctx.restore();
        }

        ctx.restore();
    }
}
