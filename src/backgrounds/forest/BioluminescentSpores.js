// src/backgrounds/forest/BioluminescentSpores.js - Rising glowing forest spores with harmonic pulsation
// SOLID Architecture: Dedicated particle simulation and radial glow renderer for spores

export class BioluminescentSpores {
    constructor(viewportWidth = 1200, viewportHeight = 800) {
        this.spores = [];
        this.initializeSpores(viewportWidth, viewportHeight);
    }

    initializeSpores(viewportWidth, viewportHeight) {
        this.spores = [];
        const sporeCount = 24;
        for (let i = 0; i < sporeCount; i++) {
            this.spores.push({
                x: Math.random() * viewportWidth,
                y: Math.random() * viewportHeight,
                size: 1.2 + Math.random() * 2.2,
                speedY: 12 + Math.random() * 24,
                swayAmp: 10 + Math.random() * 15,
                phase: Math.random() * Math.PI * 2,
                pulseSpeed: 2.0 + Math.random() * 3.0,
                baseAlpha: 0.3 + Math.random() * 0.5
            });
        }
    }

    update(deltaTime, energy) {
        const viewportWidth = window.innerWidth || 1200;
        const viewportHeight = window.innerHeight || 800;

        for (let i = 0; i < this.spores.length; i++) {
            const spore = this.spores[i];
            spore.y -= spore.speedY * deltaTime * (0.6 + energy * 0.8);
            spore.phase += deltaTime * 1.5;

            if (spore.y < -15) {
                spore.y = viewportHeight + 15;
                spore.x = Math.random() * viewportWidth;
            }
        }
    }

    render(ctx, time, energy, palette) {
        ctx.save();
        ctx.globalCompositeOperation = "screen";

        for (let i = 0; i < this.spores.length; i++) {
            const spore = this.spores[i];
            const sporeX = spore.x + Math.sin(spore.phase) * spore.swayAmp;
            const sporeY = spore.y;
            const pulse = Math.sin(time * spore.pulseSpeed + spore.phase) * 0.35 + 0.65;
            const sporeAlpha = Math.min(0.9, spore.baseAlpha * pulse * (0.8 + energy * 0.5));

            const sporeGradient = ctx.createRadialGradient(sporeX, sporeY, 0, sporeX, sporeY, spore.size * 3.5);
            sporeGradient.addColorStop(0, palette.coreAlpha ? palette.coreAlpha(sporeAlpha) : "#ffffff");
            sporeGradient.addColorStop(
                0.4,
                (i % 2 === 0 && palette.primaryAlpha)
                    ? palette.primaryAlpha(sporeAlpha * 0.7)
                    : (palette.accentAlpha ? palette.accentAlpha(sporeAlpha * 0.7) : "rgba(0, 240, 255, 0.5)")
            );
            sporeGradient.addColorStop(1, "transparent");

            ctx.fillStyle = sporeGradient;
            ctx.beginPath();
            ctx.arc(sporeX, sporeY, spore.size * 3.5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}
