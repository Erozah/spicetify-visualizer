// src/models/redpanda/PandaEarTwitchReflexes.js - Audio-reactive ear twitches, angles & fluffy ear rendering
// SOLID Architecture: Dedicated solver and renderer for independent ear movement and inner white fur tufts

export class PandaEarTwitchReflexes {
    constructor() {
        this.leftEarTwitch = 0;
        this.rightEarTwitch = 0;
        this.currentLeftEarAngle = 0;
        this.currentRightEarAngle = 0;
    }

    update(deltaTime, audio) {
        const energy = audio && typeof audio === "object" && audio.energy ? audio.energy : 0.35;
        const snare = audio && typeof audio === "object" && audio.snareImpulse ? audio.snareImpulse : 0;
        const energyScale = 0.35 + energy * 0.65;

        // Snare transient detection for sharp alert ear frisson
        if (snare > 0.40) {
            const snareVelocity = Math.min(1.0, snare * 1.35);
            this.leftEarTwitch = (Math.random() - 0.45) * 0.48 * snareVelocity * energyScale;
            this.rightEarTwitch = (Math.random() - 0.55) * 0.48 * snareVelocity * energyScale;
        } else {
            this.leftEarTwitch *= Math.pow(0.82, deltaTime * 60);
            this.rightEarTwitch *= Math.pow(0.82, deltaTime * 60);
        }

        const earBeatBounce = ((audio && audio.mid ? audio.mid : 0) * 0.05 + (snare * 0.06)) * energyScale;
        this.currentLeftEarAngle = this.leftEarTwitch - earBeatBounce;
        this.currentRightEarAngle = this.rightEarTwitch + earBeatBounce;
    }

    render(ctx, palette) {
        this.renderSingleEar(ctx, -1, this.currentLeftEarAngle, palette);
        this.renderSingleEar(ctx, 1, this.currentRightEarAngle, palette);
    }

    renderSingleEar(ctx, side, twitchAngle, palette) {
        ctx.save();
        const baseEarX = side * 36;
        const baseEarY = -34;
        ctx.translate(baseEarX, baseEarY);
        ctx.rotate(twitchAngle);

        // Triangular rounded red panda ear
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(side * 8, -42, side * 34, -36);
        ctx.quadraticCurveTo(side * 28, -12, side * 14, 6);
        ctx.closePath();

        // Dark back of ear
        ctx.fillStyle = "rgba(12, 6, 16, 0.98)";
        ctx.fill();

        // Vibrant reddish-orange outer rim
        ctx.fillStyle = palette.accentAlpha ? palette.accentAlpha(0.85) : "rgba(255, 90, 45, 0.85)";
        ctx.fill();

        // Fluffy luminous white inner ear tufts
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        ctx.beginPath();
        ctx.moveTo(side * 4, -4);
        ctx.quadraticCurveTo(side * 10, -32, side * 26, -28);
        ctx.quadraticCurveTo(side * 20, -12, side * 12, 2);
        ctx.closePath();
        ctx.fillStyle = palette.coreAlpha ? palette.coreAlpha(0.92) : "#ffffff";
        ctx.fill();

        // Neon outline
        ctx.strokeStyle = palette.primaryAlpha ? palette.primaryAlpha(0.85) : "#00f0ff";
        ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.restore();

        ctx.restore();
    }
}
