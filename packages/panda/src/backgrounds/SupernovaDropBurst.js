// src/backgrounds/SupernovaDropBurst.js - Stellar explosion & radiant nova flash on sudden drops and transitions
// SOLID Architecture: Dedicated drop explosion and stardust spark burst renderer

export class SupernovaDropBurst {
    constructor() {
        this.active = false;
        this.life = 0;
        this.maxLife = 1.35; // seconds
        this.x = 0;
        this.y = 0;
        this.sparks = [];
        this.numSparks = 36;
        this.rays = [];
        const numRays = 28;
        for (let i = 0; i < numRays; i++) {
            this.rays.push({
                angle: (i * Math.PI * 2) / numRays + (Math.random() - 0.5) * 0.15,
                lengthMult: 0.8 + Math.random() * 0.7,
                width: 2.5 + Math.random() * 3.5
            });
        }
    }

    trigger(originX, originY) {
        this.active = true;
        this.life = 0;
        this.x = originX;
        this.y = originY;

        this.sparks = [];
        for (let i = 0; i < this.numSparks; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 180 + Math.random() * 520;
            this.sparks.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 2.0 + Math.random() * 3.5,
                twinkleSpeed: 8 + Math.random() * 12,
                twinkleOffset: Math.random() * Math.PI * 2,
                isAccent: Math.random() > 0.5
            });
        }
    }

    update(deltaTime, audio, centerX, centerY) {
        if (audio && audio.supernovaTrigger) {
            this.trigger(centerX, centerY);
            audio.supernovaTrigger = false;
        }

        if (this.active) {
            this.life += deltaTime;
            if (this.life >= this.maxLife) {
                this.active = false;
                this.sparks = [];
            } else {
                const drag = Math.pow(0.92, deltaTime * 60);
                for (let i = 0; i < this.sparks.length; i++) {
                    const sp = this.sparks[i];
                    sp.x += sp.vx * deltaTime;
                    sp.y += sp.vy * deltaTime;
                    sp.vx *= drag;
                    sp.vy *= drag;
                }
            }
        }
    }

    render(ctx, viewportWidth, viewportHeight, palette) {
        if (!this.active) return;

        const progress = this.life / this.maxLife;
        const easeOut = 1.0 - Math.pow(1.0 - progress, 3.2);
        const maxRadius = Math.max(viewportWidth, viewportHeight) * 0.95;
        const currentRadius = easeOut * maxRadius;
        const alpha = Math.max(0, 1.0 - Math.pow(progress, 0.7));

        ctx.save();
        ctx.globalCompositeOperation = "screen";

        // 1. Radiant Full-Screen Nova Flash Pulse (0.0s to 0.45s)
        if (progress < 0.45) {
            const flashProgress = progress / 0.45;
            const flashAlpha = (1.0 - flashProgress) * 0.45;
            ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
            ctx.fillRect(0, 0, viewportWidth, viewportHeight);

            const bloomGrad = ctx.createRadialGradient(this.x, this.y, 10, this.x, this.y, maxRadius * 0.8);
            bloomGrad.addColorStop(0, palette.coreAlpha ? palette.coreAlpha(flashAlpha * 0.8) : `rgba(255, 255, 255, ${flashAlpha})`);
            bloomGrad.addColorStop(0.35, palette.primaryAlpha ? palette.primaryAlpha(flashAlpha * 0.7) : `rgba(16, 185, 129, ${flashAlpha})`);
            bloomGrad.addColorStop(0.75, palette.accentAlpha ? palette.accentAlpha(flashAlpha * 0.4) : `rgba(52, 211, 153, ${flashAlpha})`);
            bloomGrad.addColorStop(1.0, "transparent");
            ctx.fillStyle = bloomGrad;
            ctx.fillRect(0, 0, viewportWidth, viewportHeight);
        }

        // 2. Blinding Core Radiant Flash
        const coreRadius = Math.min(350, currentRadius * 0.55);
        const coreGrad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, coreRadius);
        coreGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.95})`);
        coreGrad.addColorStop(0.25, palette.coreAlpha ? palette.coreAlpha(alpha * 0.85) : `rgba(255, 255, 255, ${alpha})`);
        coreGrad.addColorStop(0.55, palette.primaryAlpha ? palette.primaryAlpha(alpha * 0.70) : "rgba(16, 185, 129, 0.6)");
        coreGrad.addColorStop(0.85, palette.accentAlpha ? palette.accentAlpha(alpha * 0.35) : "rgba(52, 211, 153, 0.3)");
        coreGrad.addColorStop(1.0, "transparent");

        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, coreRadius, 0, Math.PI * 2);
        ctx.fill();

        // 3. Primary Luminous Shockwave Ring
        ctx.strokeStyle = palette.coreAlpha ? palette.coreAlpha(alpha * 0.95) : "#ffffff";
        ctx.lineWidth = Math.max(1.5, (1.0 - progress) * 6.5);
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
        ctx.stroke();

        // 4. Secondary Harmonic Shockwave Ring
        if (progress > 0.08) {
            const echoProgress = (progress - 0.08) / 0.92;
            const echoEase = 1.0 - Math.pow(1.0 - echoProgress, 3);
            const echoRadius = echoEase * maxRadius * 0.82;
            const echoAlpha = Math.max(0, 1.0 - echoProgress) * 0.75;
            ctx.strokeStyle = palette.accentAlpha ? palette.accentAlpha(echoAlpha) : "rgba(52, 211, 153, 0.6)";
            ctx.lineWidth = Math.max(1.0, (1.0 - echoProgress) * 4.0);
            ctx.beginPath();
            ctx.arc(this.x, this.y, echoRadius, 0, Math.PI * 2);
            ctx.stroke();
        }

        // 5. Expanding Radiant Star Rays
        ctx.save();
        ctx.translate(this.x, this.y);
        for (let i = 0; i < this.rays.length; i++) {
            const r = this.rays[i];
            const rayLen = currentRadius * 1.35 * r.lengthMult;
            const rx = Math.cos(r.angle) * rayLen;
            const ry = Math.sin(r.angle) * rayLen;

            ctx.strokeStyle = (i % 2 === 0)
                ? (palette.accentAlpha ? palette.accentAlpha(alpha * 0.85) : "rgba(52, 211, 153, 0.7)")
                : (palette.primaryAlpha ? palette.primaryAlpha(alpha * 0.85) : "rgba(16, 185, 129, 0.7)");
            ctx.lineWidth = r.width * (1.0 - progress);

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(rx, ry);
            ctx.stroke();
        }
        ctx.restore();

        // 6. Exploding Stardust Sparks
        for (let i = 0; i < this.sparks.length; i++) {
            const sp = this.sparks[i];
            const sparkFade = Math.max(0, 1.0 - progress);
            const twinkle = 0.6 + Math.sin(this.life * sp.twinkleSpeed + sp.twinkleOffset) * 0.4;
            const sparkAlpha = sparkFade * twinkle;

            ctx.fillStyle = sp.isAccent
                ? (palette.accentAlpha ? palette.accentAlpha(sparkAlpha) : "#34d399")
                : (palette.coreAlpha ? palette.coreAlpha(sparkAlpha) : "#ffffff");

            ctx.beginPath();
            ctx.arc(sp.x, sp.y, sp.size * (1.0 - progress * 0.5), 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

// Backward compatibility alias
var SupernovaBurst = SupernovaDropBurst;
