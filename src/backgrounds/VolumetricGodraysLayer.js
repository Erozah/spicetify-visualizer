export class VolumetricGodraysLayer {
    constructor() {
        this.angle = 0;
        this.beamCount = 12;
        this.beamWidths = new Float32Array([1.1, 0.8, 1.3, 0.9, 1.4, 0.7, 1.2, 0.85, 1.35, 0.75, 1.15, 0.95]);
    }

    update(deltaTime, audio, isPlaying = true) {
        const tempoNormalized = Math.max(0.4, Math.min(2.0, (audio.bpm || 120) / 120));
        const dropFactor = audio.dropFactor || (audio.isDrop ? 1.0 : 0.0);
        const softFactor = audio.softFactor || (audio.isSoft ? 1.0 : 0.0);
        const vocalBoost = audio.isVocalActive ? 0.02 : 0.0;

        const rotationSpeed = isPlaying
            ? (0.015 * softFactor + (0.04 + tempoNormalized * 0.04 + (audio.mids || 0) * 0.06 + vocalBoost) * (1.0 + dropFactor * 1.5))
            : 0.008;

        this.angle = (this.angle + deltaTime * rotationSpeed) % (Math.PI * 2);
    }

    render(ctx, viewportWidth, viewportHeight, centerX, centerY, audio, palette) {
        const energy = audio.energy || 0.3;
        const mids = audio.mids || 0.2;
        const dropFactor = audio.dropFactor || (audio.isDrop ? 1.0 : 0.0);
        const softFactor = audio.softFactor || (audio.isSoft ? 1.0 : 0.0);
        const vocalGlow = audio.isVocalActive ? 0.22 : 0.0;

        const maxRadius = Math.max(viewportWidth, viewportHeight) * (0.65 + dropFactor * 0.25);
        const baseAlpha = (0.06 * softFactor + (0.12 + energy * 0.16 + mids * 0.12 + vocalGlow) * (1.0 - softFactor * 0.5) + dropFactor * 0.22);

        ctx.save();
        ctx.globalCompositeOperation = "screen";
        ctx.translate(centerX, centerY);
        ctx.rotate(this.angle);

        const step = (Math.PI * 2) / this.beamCount;
        for (let i = 0; i < this.beamCount; i++) {
            const beamAngle = i * step;
            const widthMult = this.beamWidths[i % this.beamWidths.length];
            const halfSpread = (step * 0.28 * widthMult) * (1.0 + dropFactor * 0.35 + (audio.isVocalActive ? 0.15 : 0.0));

            ctx.save();
            ctx.rotate(beamAngle);

            const beamGradient = ctx.createRadialGradient(0, 0, 15, 0, 0, maxRadius);
            const beamColor = (i % 2 === 0)
                ? (palette.primaryAlpha ? palette.primaryAlpha(baseAlpha) : "rgba(0, 240, 255, 0.2)")
                : (palette.accentAlpha ? palette.accentAlpha(baseAlpha * 0.85) : "rgba(255, 0, 127, 0.18)");

            beamGradient.addColorStop(0, palette.coreAlpha ? palette.coreAlpha(baseAlpha * (audio.isVocalActive ? 1.8 : 1.4)) : "rgba(255, 255, 255, 0.3)");
            beamGradient.addColorStop(0.25, beamColor);
            beamGradient.addColorStop(0.8, (i % 2 === 0 && palette.secondaryAlpha) ? palette.secondaryAlpha(baseAlpha * 0.3) : "transparent");
            beamGradient.addColorStop(1.0, "transparent");

            ctx.fillStyle = beamGradient;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, maxRadius, -halfSpread, halfSpread);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }

        ctx.restore();
    }
}

var VolumetricGodrays = VolumetricGodraysLayer;
