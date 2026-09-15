export class EqualizerSpectralWaves {
    constructor() {
        this.wavePhase = 0;
        this.numPoints = 32;
        this.points = new Float32Array(this.numPoints);
        this.displayMode = "wave";
    }

    setMode(mode) {
        if (mode === "bars" || mode === "wave") {
            this.displayMode = mode;
        }
    }

    update(deltaTime, audio, isPlaying = true) {
        const energy = audio.energy || 0.3;
        const speed = isPlaying ? (1.5 + energy * 2.5) : 0.6;
        this.wavePhase = (this.wavePhase + deltaTime * speed) % (Math.PI * 2);

        const bands = audio.spectralBands;
        if (bands && bands.length >= this.numPoints) {
            for (let i = 0; i < this.numPoints; i++) {
                this.points[i] += (bands[i] - this.points[i]) * 0.28;
            }
        }
    }

    render(ctx, viewportWidth, viewportHeight, baseY, audio, palette, modeOverride = null) {
        const activeMode = modeOverride || this.displayMode;
        if (activeMode === "bars") {
            this.renderSpectralBars(ctx, viewportWidth, viewportHeight, baseY, audio, palette);
        } else {
            this.renderOrganicWave(ctx, viewportWidth, viewportHeight, baseY, audio, palette);
        }
    }

    renderOrganicWave(ctx, viewportWidth, viewportHeight, baseY, audio, palette) {
        const y = baseY || (viewportHeight * 0.82);
        const energy = audio.energy || 0.3;
        const dropFactor = audio.dropFactor || (audio.isDrop ? 1.0 : 0.0);
        const softFactor = audio.softFactor || (audio.isSoft ? 1.0 : 0.0);

        const waveHeight = (viewportHeight * 0.16) * (0.35 * softFactor + (0.7 + energy * 0.8) * (1.0 - softFactor * 0.6) + dropFactor * 0.5);
        const stepX = viewportWidth / (this.numPoints - 1);

        ctx.save();
        ctx.globalCompositeOperation = "screen";

        ctx.beginPath();
        ctx.moveTo(0, y);

        for (let i = 0; i < this.numPoints; i++) {
            const px = i * stepX;
            const amp = this.points[i] || 0.05;
            const undulation = Math.sin(this.wavePhase + i * 0.3) * (5 + energy * 8);
            const py = y - (amp * waveHeight + undulation);

            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                const prevX = (i - 1) * stepX;
                const prevAmp = this.points[i - 1] || 0.05;
                const prevUndulation = Math.sin(this.wavePhase + (i - 1) * 0.3) * (5 + energy * 8);
                const prevY = y - (prevAmp * waveHeight + prevUndulation);
                const midX = (prevX + px) * 0.5;
                const midY = (prevY + py) * 0.5;
                ctx.quadraticCurveTo(prevX, prevY, midX, midY);
            }
        }
        ctx.lineTo(viewportWidth, y);

        const waveGradient = ctx.createLinearGradient(0, y - waveHeight - 15, 0, y + 20);
        const alpha = Math.min(0.45, 0.10 * softFactor + (0.18 + energy * 0.22 + dropFactor * 0.15));
        waveGradient.addColorStop(0, palette.primaryAlpha ? palette.primaryAlpha(alpha * 1.2) : "rgba(0, 240, 255, 0.3)");
        waveGradient.addColorStop(0.5, palette.accentAlpha ? palette.accentAlpha(alpha * 0.7) : "rgba(255, 0, 127, 0.15)");
        waveGradient.addColorStop(1, "transparent");

        ctx.fillStyle = waveGradient;
        ctx.fill();

        ctx.strokeStyle = palette.primaryAlpha ? palette.primaryAlpha(alpha * 1.8) : "#00f0ff";
        ctx.lineWidth = 1.6 + dropFactor * 1.0;
        ctx.stroke();

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let i = 0; i < this.numPoints; i++) {
            const px = i * stepX;
            const amp = this.points[i] || 0.05;
            const py = y + (amp * waveHeight * 0.35);
            ctx.lineTo(px, py);
        }
        ctx.lineTo(viewportWidth, y);
        ctx.strokeStyle = palette.accentAlpha ? palette.accentAlpha(alpha * 0.4) : "rgba(255, 0, 127, 0.15)";
        ctx.lineWidth = 1.0;
        ctx.stroke();
        ctx.restore();

        ctx.restore();
    }

    renderSpectralBars(ctx, viewportWidth, viewportHeight, baseY, audio, palette) {
        const floorY = baseY || (viewportHeight * 0.88);
        const energy = audio.energy || 0.35;
        const dropFactor = audio.dropFactor || (audio.isDrop ? 1.0 : 0.0);
        const barCount = this.numPoints;
        const totalSpacing = viewportWidth * 0.02;
        const availableWidth = viewportWidth - totalSpacing * 2;
        const barWidth = Math.max(3, (availableWidth / barCount) * 0.65);
        const stepX = availableWidth / barCount;
        const maxHeight = viewportHeight * 0.18 * (0.8 + energy * 0.6 + dropFactor * 0.4);

        ctx.save();
        ctx.globalCompositeOperation = "screen";

        for (let i = 0; i < barCount; i++) {
            const x = totalSpacing + i * stepX + (stepX - barWidth) * 0.5;
            const amplitude = this.points[i] || 0.05;
            const barHeight = Math.max(4, amplitude * maxHeight);
            const topY = floorY - barHeight;

            const barGradient = ctx.createLinearGradient(x, floorY, x, topY);
            barGradient.addColorStop(0, palette.secondaryAlpha ? palette.secondaryAlpha(0.2) : "rgba(100, 50, 180, 0.2)");
            barGradient.addColorStop(0.6, palette.primaryAlpha ? palette.primaryAlpha(0.65) : "rgba(0, 240, 255, 0.65)");
            barGradient.addColorStop(1.0, palette.accentAlpha ? palette.accentAlpha(0.95) : "rgba(255, 110, 40, 0.95)");

            ctx.fillStyle = barGradient;
            ctx.beginPath();
            ctx.roundRect(x, topY, barWidth, barHeight, [barWidth * 0.4, barWidth * 0.4, 0, 0]);
            ctx.fill();

            ctx.fillStyle = palette.coreAlpha ? palette.coreAlpha(0.9) : "#ffffff";
            ctx.beginPath();
            ctx.arc(x + barWidth * 0.5, topY + 2, barWidth * 0.35, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

var EqualizerWaves = EqualizerSpectralWaves;
