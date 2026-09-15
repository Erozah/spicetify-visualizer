// src/backgrounds/SacredFractalMandalas.js - Procedural sacred geometry mandalas & harmonic resonance rings

export class SacredFractalMandalas {
    constructor() {
        this.currentRotationAngleRadians = 0;
        this.tickCosineTable = new Float32Array(36);
        this.tickSineTable = new Float32Array(36);
        for (let i = 0; i < 36; i++) {
            const angle = (i * Math.PI * 2) / 36;
            this.tickCosineTable[i] = Math.cos(angle);
            this.tickSineTable[i] = Math.sin(angle);
        }

        this.petalCosineTable = new Float32Array(6);
        this.petalSineTable = new Float32Array(6);
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI * 2) / 6;
            this.petalCosineTable[i] = Math.cos(angle);
            this.petalSineTable[i] = Math.sin(angle);
        }

        this.hexagramTriangles = [0, Math.PI / 3].map(offset =>
            [0, 1, 2, 3].map(i => {
                const a = offset + (i * Math.PI * 2) / 3;
                return { cos: Math.cos(a), sin: Math.sin(a) };
            })
        );
    }

    update(deltaTimeSeconds, elapsedSongTimeSeconds, audioStateReference, isPlaybackActive = true) {
        const bpm = audioStateReference ? (audioStateReference.bpm || 120) : 120;
        const midEnergy = audioStateReference ? (audioStateReference.mids || audioStateReference.mid || 0) : 0;
        const overallEnergy = audioStateReference ? (audioStateReference.energy || 0.35) : 0.35;
        const isSongDrop = audioStateReference ? (audioStateReference.isDrop || false) : false;

        const dropVelocityBoost = isSongDrop ? 2.4 : 1.0;
        const normalizedTempoRatio = Math.max(0.4, Math.min(2.0, bpm / 120));
        const rotationVelocity = isPlaybackActive
            ? ((0.025 + normalizedTempoRatio * 0.045 + midEnergy * 0.08) * (0.35 + overallEnergy * 0.65) * dropVelocityBoost)
            : 0.012;
        this.currentRotationAngleRadians += rotationVelocity * deltaTimeSeconds;
    }

    render(canvasRenderingContext, felineCenterCoordinateX, felineCenterCoordinateY, baseRadiusPixels, paletteTheme, audioStateReference) {
        const bassLevel = audioStateReference ? (audioStateReference.bass || 0) : 0;
        const beatImpulse = audioStateReference ? (audioStateReference.beatImpulse || 0) : 0;
        const snareImpulse = audioStateReference ? (audioStateReference.snareImpulse || 0) : 0;
        const energy = audioStateReference ? (audioStateReference.energy || 0.4) : 0.4;
        const isDrop = audioStateReference ? (audioStateReference.isDrop || false) : false;

        const mandalaScale = baseRadiusPixels * (1.18 + bassLevel * 0.22 + beatImpulse * 0.14) * (isDrop ? 1.25 : 1.0);
        const baseAlpha = Math.min(0.60, (0.24 + energy * 0.22 + bassLevel * 0.14 + (isDrop ? 0.15 : 0)) * 0.85);

        canvasRenderingContext.save();
        canvasRenderingContext.globalCompositeOperation = "screen";
        canvasRenderingContext.translate(felineCenterCoordinateX, felineCenterCoordinateY);
        canvasRenderingContext.rotate(this.currentRotationAngleRadians);

        // 1. Celestial outer tick marks ring
        const outerTickRadius = mandalaScale * (1.08 + snareImpulse * 0.06);
        const innerTickRadius = mandalaScale * 1.03;
        canvasRenderingContext.beginPath();
        for (let i = 0; i < 36; i++) {
            const rIn = (i % 3 === 0) ? (mandalaScale * 0.99) : innerTickRadius;
            canvasRenderingContext.moveTo(this.tickCosineTable[i] * rIn, this.tickSineTable[i] * rIn);
            canvasRenderingContext.lineTo(this.tickCosineTable[i] * outerTickRadius, this.tickSineTable[i] * outerTickRadius);
        }
        canvasRenderingContext.strokeStyle = snareImpulse > 0.4 ? (paletteTheme.core || "#ffffff") : (paletteTheme.accentAlpha ? paletteTheme.accentAlpha(baseAlpha * (0.75 + snareImpulse * 0.4)) : "#ff007f");
        canvasRenderingContext.lineWidth = 1.0 + snareImpulse * 0.8;
        canvasRenderingContext.stroke();

        // 2. Concentric sacred harmonic rings
        canvasRenderingContext.beginPath();
        canvasRenderingContext.arc(0, 0, mandalaScale * 1.08, 0, Math.PI * 2);
        canvasRenderingContext.arc(0, 0, mandalaScale * 1.0, 0, Math.PI * 2);
        canvasRenderingContext.strokeStyle = isDrop ? (paletteTheme.core || "#ffffff") : (paletteTheme.accentAlpha ? paletteTheme.accentAlpha(baseAlpha * 0.75) : "#ff007f");
        canvasRenderingContext.lineWidth = 1.4 + (isDrop ? 0.8 : 0);
        canvasRenderingContext.stroke();

        // 3. Flower of life 6-fold petals
        const petalRadius = mandalaScale * 0.48;
        canvasRenderingContext.beginPath();
        for (let i = 0; i < 6; i++) {
            const px = this.petalCosineTable[i] * petalRadius, py = this.petalSineTable[i] * petalRadius;
            canvasRenderingContext.moveTo(px + petalRadius, py);
            canvasRenderingContext.arc(px, py, petalRadius, 0, Math.PI * 2);
        }
        canvasRenderingContext.strokeStyle = paletteTheme.accentAlpha ? paletteTheme.accentAlpha(baseAlpha * 0.75) : "#ff007f";
        canvasRenderingContext.lineWidth = 1.6;
        canvasRenderingContext.stroke();

        // 4. Counter-rotating hexagram chords
        canvasRenderingContext.save();
        canvasRenderingContext.rotate(-this.currentRotationAngleRadians * 1.5);
        canvasRenderingContext.beginPath();
        const hexRadius = mandalaScale * 0.72;
        this.hexagramTriangles.forEach(tri => {
            tri.forEach((pt, i) => {
                i === 0 ? canvasRenderingContext.moveTo(pt.cos * hexRadius, pt.sin * hexRadius) : canvasRenderingContext.lineTo(pt.cos * hexRadius, pt.sin * hexRadius);
            });
        });
        canvasRenderingContext.strokeStyle = paletteTheme.accentAlpha ? paletteTheme.accentAlpha(baseAlpha * 0.6) : "#ff007f";
        canvasRenderingContext.lineWidth = 1.2;
        canvasRenderingContext.stroke();
        canvasRenderingContext.restore();

        // 5. Radiant central aura
        const centralGlow = canvasRenderingContext.createRadialGradient(0, 0, 0, 0, 0, mandalaScale * 0.35);
        centralGlow.addColorStop(0, `rgba(255, 255, 255, ${baseAlpha * (0.65 + (isDrop ? 0.35 : 0))})`);
        centralGlow.addColorStop(0.35, paletteTheme.accentAlpha ? paletteTheme.accentAlpha(baseAlpha * 0.55) : "rgba(255, 0, 127, 0.4)");
        centralGlow.addColorStop(1.0, "transparent");
        canvasRenderingContext.fillStyle = centralGlow;
        canvasRenderingContext.beginPath();
        canvasRenderingContext.arc(0, 0, mandalaScale * 0.35, 0, Math.PI * 2); canvasRenderingContext.fill();

        canvasRenderingContext.restore();
    }
}

