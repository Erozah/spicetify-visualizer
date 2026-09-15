// src/backgrounds/ShockwaveRings.js - Audio beat-driven shockwave pulse rings (dual kick & snare)
// SOLID Architecture: Dedicated radial shockwave pulse renderer

export class ShockwaveRings {
    constructor(x, y, maxRadius, color, type = "kick") {
        this.x = x;
        this.y = y;
        this.type = type;
        this.maxRadius = maxRadius;
        this.color = color;
        this.life = 1.0;

        if (type === "snare") {
            this.radius = 26;
            this.speed = 6.2;
            this.decay = 2.2;
            this.baseLineWidth = 1.2;
        } else {
            // Kick / Bass shockwave
            this.radius = 16;
            this.speed = 3.6;
            this.decay = 1.35;
            this.baseLineWidth = 2.8;
        }
    }

    update(deltaTime) {
        this.radius += (this.maxRadius - this.radius) * (deltaTime * this.speed);
        this.life -= deltaTime * this.decay;
        return this.life > 0;
    }

    render(ctx) {
        if (this.life <= 0) return;
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = this.color;
        ctx.lineWidth = Math.max(0.6, this.baseLineWidth * this.life);
        ctx.globalAlpha = Math.max(0, this.life * (this.type === "snare" ? 0.75 : 0.65));
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();

        if (this.type === "kick" && this.radius > 35) {
            ctx.lineWidth = 1.0 * this.life;
            ctx.globalAlpha = Math.max(0, this.life * 0.35);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.75, 0, Math.PI * 2);
            ctx.stroke();
        } else if (this.type === "snare" && this.radius > 30) {
            ctx.lineWidth = 0.7 * this.life;
            ctx.globalAlpha = Math.max(0, this.life * 0.4);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.88, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
    }
}

// Backward compatibility alias
var Shockwave = ShockwaveRings;
