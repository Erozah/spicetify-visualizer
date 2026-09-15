// src/backgrounds/CosmicStar.js - Twinkling cosmic starfield particle with hyperspace warp streaks

export class CosmicStar {
    constructor(w, h) {
        this.reset(w, h, true);
    }

    reset(w, h, initial = false) {
        this.x = Math.random() * w;
        this.y = initial ? Math.random() * h : -10;
        this.size = 0.6 + Math.random() * 1.8;
        this.speedY = 10 + Math.random() * 20;
        this.baseAlpha = 0.2 + Math.random() * 0.6;
        this.pulseSpeed = 1.0 + Math.random() * 3.0;
        this.phase = Math.random() * Math.PI * 2;
        this.hasCross = Math.random() > 0.82;
        this.crossSize = 4 + Math.random() * 7;
    }

    update(dt, w, h, audio) {
        const treble = typeof audio === "number" ? audio : (audio && audio.treble ? audio.treble : 0);
        const isDrop = audio && typeof audio === "object" && audio.isDrop;
        const energy = audio && typeof audio === "object" && audio.energy ? audio.energy : 0.4;

        // Drift slowly like calm celestial dust on chill music; rush on drops
        const speedMult = isDrop ? 4.0 : (energy > 0.7 ? 1.8 : (0.28 + energy * 0.72));
        this.y += this.speedY * dt * (1 + treble * 0.3) * speedMult;
        if (this.y > h + 20) {
            this.reset(w, h);
        }
    }

    render(ctx, time, audio, color) {
        const treble = typeof audio === "number" ? audio : (audio && audio.treble ? audio.treble : 0);
        const isDrop = audio && typeof audio === "object" && audio.isDrop;
        const energy = audio && typeof audio === "object" && audio.energy ? audio.energy : 0.4;
        const bpm = audio && typeof audio === "object" && audio.bpm ? audio.bpm : 120;

        const isWarping = isDrop || (bpm >= 130 && energy > 0.65);
        const twinkleSpeed = this.pulseSpeed * (0.4 + energy * 0.6);
        const twinkle = Math.sin(time * twinkleSpeed + this.phase) * 0.25 + 0.75;
        const alpha = Math.min(1, this.baseAlpha * twinkle * (0.8 + treble * 0.6));

        if (isWarping) {
            // Hyperspace warp streak
            const streakLen = Math.min(65, this.speedY * (isDrop ? 2.4 : 1.2));
            ctx.save();
            ctx.strokeStyle = color;
            ctx.lineWidth = Math.max(0.7, this.size * 0.85);
            ctx.globalAlpha = Math.min(1.0, alpha * 1.3);
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x, this.y - streakLen);
            ctx.stroke();

            // Bright star head
            ctx.fillStyle = "#ffffff";
            ctx.globalAlpha = Math.min(1.0, alpha * 1.5);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 1.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            return;
        }

        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // 4-point diffraction cross spikes on bright celestial stars (heritage Legacy)
        if (this.hasCross && alpha > 0.45) {
            const clen = this.crossSize * (0.8 + treble * 0.5);
            ctx.strokeStyle = color;
            ctx.lineWidth = 0.75;
            ctx.globalAlpha = alpha * 0.65;
            ctx.beginPath();
            ctx.moveTo(this.x - clen, this.y);
            ctx.lineTo(this.x + clen, this.y);
            ctx.moveTo(this.x, this.y - clen);
            ctx.lineTo(this.x, this.y + clen);
            ctx.stroke();
        }
    }
}
