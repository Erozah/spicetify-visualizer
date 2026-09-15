// src/models/redpanda/PandaEyesRenderer.js - Soulful amber eyes, pupil slit & sinusoidal blinking
// SOLID Architecture: Dedicated eye blink solver and amber iris / catchlight renderer

export class PandaEyesRenderer {
    constructor() {
        this.blinkProgress = 0;
        this.nextBlinkTime = 2.8;
        this.isBlinking = false;
    }

    update(deltaTime, time) {
        if (time > this.nextBlinkTime) {
            this.isBlinking = true;
            this.blinkProgress += deltaTime * 11;
            if (this.blinkProgress >= Math.PI) {
                this.blinkProgress = 0;
                this.isBlinking = false;
                this.nextBlinkTime = time + 2.5 + Math.random() * 3.5;
            }
        }
    }

    render(ctx, palette, audio) {
        const eyeX = 22;
        const eyeY = -8;
        const eyeWidth = 10;
        const eyeHeight = 12;

        const isBlink = this.isBlinking;
        const blinkFraction = isBlink ? Math.sin(this.blinkProgress) : 0;
        const currentHeight = Math.max(0.6, eyeHeight * (1.0 - blinkFraction));

        ctx.save();
        [-1, 1].forEach(side => {
            const ex = side * eyeX;
            const ey = eyeY;

            ctx.save();
            ctx.translate(ex, ey);

            // Eye socket dark outline
            ctx.beginPath();
            ctx.ellipse(0, 0, eyeWidth + 1.5, currentHeight + 1.5, side * 0.15, 0, Math.PI * 2);
            ctx.fillStyle = "#0a040e";
            ctx.fill();

            if (currentHeight > 2.0) {
                // Sclera / Iris: Deep amber / palette iris with radiant glow
                ctx.beginPath();
                ctx.ellipse(0, 0, eyeWidth, currentHeight, side * 0.15, 0, Math.PI * 2);
                const irisGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, eyeWidth);
                irisGrad.addColorStop(0, palette.primaryAlpha ? palette.primaryAlpha(0.95) : "#00f0ff");
                irisGrad.addColorStop(0.55, palette.accentAlpha ? palette.accentAlpha(0.8) : "#ff007f");
                irisGrad.addColorStop(1.0, "#08020a");
                ctx.fillStyle = irisGrad;
                ctx.fill();

                // Pupil (deep dark slit-oval)
                ctx.beginPath();
                ctx.ellipse(0, 0, eyeWidth * 0.45, currentHeight * 0.75, 0, 0, Math.PI * 2);
                ctx.fillStyle = "#040106";
                ctx.fill();

                // Starlight Catchlight reflections
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(-side * 2.5, -currentHeight * 0.35, 2.0, 0, Math.PI * 2);
                ctx.arc(side * 3.0, currentHeight * 0.25, 1.1, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Closed eyelid line
                ctx.strokeStyle = palette.primaryAlpha ? palette.primaryAlpha(0.9) : "#00f0ff";
                ctx.lineWidth = 1.8;
                ctx.beginPath();
                ctx.moveTo(-eyeWidth, 0);
                ctx.quadraticCurveTo(0, 3, eyeWidth, 0);
                ctx.stroke();
            }

            ctx.restore();
        });
        ctx.restore();
    }
}
