// src/backgrounds/CosmicSupernovaBurst.js - Radiant stellar explosion, stardust sparks & nova blast on musical drops

export class CosmicSupernovaBurst {
    constructor() {
        this.isBurstActive = false;
        this.elapsedLifetimeSeconds = 0;
        this.maximumLifetimeSeconds = 1.35;
        this.originCoordinateX = 0;
        this.originCoordinateY = 0;
        this.stardustSparks = [];
        this.radiantLightRays = [];

        for (let rayIndex = 0; rayIndex < 28; rayIndex++) {
            this.radiantLightRays.push({
                angleRadians: (rayIndex * Math.PI * 2) / 28 + (Math.random() - 0.5) * 0.15,
                lengthMultiplier: 0.8 + Math.random() * 0.7,
                beamWidth: 2.5 + Math.random() * 3.5
            });
        }
    }

    triggerBurst(felineCenterCoordinateX, felineCenterCoordinateY) {
        this.isBurstActive = true;
        this.elapsedLifetimeSeconds = 0;
        this.originCoordinateX = felineCenterCoordinateX;
        this.originCoordinateY = felineCenterCoordinateY;
        this.stardustSparks = [];

        for (let sparkIndex = 0; sparkIndex < 36; sparkIndex++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 180 + Math.random() * 520;
            this.stardustSparks.push({
                positionX: this.originCoordinateX, positionY: this.originCoordinateY,
                velocityX: Math.cos(angle) * speed, velocityY: Math.sin(angle) * speed,
                radius: 2.0 + Math.random() * 3.5, twinkleSpeed: 8 + Math.random() * 12,
                twinkleOffset: Math.random() * Math.PI * 2, isAccentColored: Math.random() > 0.5
            });
        }
    }

    update(deltaTimeSeconds, audioStateReference, felineCenterX, felineCenterY) {
        if (audioStateReference && audioStateReference.supernovaTrigger) {
            this.triggerBurst(felineCenterX, felineCenterY);
            audioStateReference.supernovaTrigger = false;
        }
        if (!this.isBurstActive) return;

        this.elapsedLifetimeSeconds += deltaTimeSeconds;
        if (this.elapsedLifetimeSeconds >= this.maximumLifetimeSeconds) {
            this.isBurstActive = false;
            this.stardustSparks = [];
        } else {
            const drag = Math.pow(0.92, deltaTimeSeconds * 60);
            for (let i = 0; i < this.stardustSparks.length; i++) {
                const sp = this.stardustSparks[i];
                sp.positionX += (sp.velocityX *= drag) * deltaTimeSeconds;
                sp.positionY += (sp.velocityY *= drag) * deltaTimeSeconds;
            }
        }
    }

    render(canvasRenderingContext, canvasViewportWidth, canvasViewportHeight, paletteTheme) {
        if (!this.isBurstActive) return;
        const progress = this.elapsedLifetimeSeconds / this.maximumLifetimeSeconds;
        const ringRadius = (1.0 - Math.pow(1.0 - progress, 3.2)) * Math.max(canvasViewportWidth, canvasViewportHeight) * 0.95;
        const alpha = Math.max(0, 1.0 - Math.pow(progress, 0.7));

        canvasRenderingContext.save();
        canvasRenderingContext.globalCompositeOperation = "screen";

        if (progress < 0.45) {
            canvasRenderingContext.fillStyle = `rgba(255, 255, 255, ${(1.0 - progress / 0.45) * 0.45})`;
            canvasRenderingContext.fillRect(0, 0, canvasViewportWidth, canvasViewportHeight);
        }

        const coreRadius = Math.min(350, ringRadius * 0.55);
        const coreGradient = canvasRenderingContext.createRadialGradient(this.originCoordinateX, this.originCoordinateY, 0, this.originCoordinateX, this.originCoordinateY, coreRadius);
        coreGradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.95})`); coreGradient.addColorStop(1.0, "transparent");
        coreGradient.addColorStop(0.3, paletteTheme.coreAlpha ? paletteTheme.coreAlpha(alpha * 0.85) : "#ffffff");
        coreGradient.addColorStop(0.65, paletteTheme.primaryAlpha ? paletteTheme.primaryAlpha(alpha * 0.6) : "#00f0ff");
        canvasRenderingContext.fillStyle = coreGradient;
        canvasRenderingContext.beginPath();
        canvasRenderingContext.arc(this.originCoordinateX, this.originCoordinateY, coreRadius, 0, Math.PI * 2);
        canvasRenderingContext.fill();

        canvasRenderingContext.strokeStyle = paletteTheme.coreAlpha ? paletteTheme.coreAlpha(alpha * 0.95) : "#ffffff";
        canvasRenderingContext.lineWidth = Math.max(1.5, (1.0 - progress) * 6.5);
        canvasRenderingContext.beginPath();
        canvasRenderingContext.arc(this.originCoordinateX, this.originCoordinateY, ringRadius, 0, Math.PI * 2); canvasRenderingContext.stroke();

        canvasRenderingContext.save();
        canvasRenderingContext.translate(this.originCoordinateX, this.originCoordinateY);
        for (let i = 0; i < this.radiantLightRays.length; i++) {
            const ray = this.radiantLightRays[i];
            const rayLen = ringRadius * 1.35 * ray.lengthMultiplier;
            canvasRenderingContext.strokeStyle = (i % 2 === 0)
                ? (paletteTheme.accentAlpha ? paletteTheme.accentAlpha(alpha * 0.85) : "#ff007f")
                : (paletteTheme.primaryAlpha ? paletteTheme.primaryAlpha(alpha * 0.85) : "#00f0ff");
            canvasRenderingContext.lineWidth = ray.beamWidth * (1.0 - progress);
            canvasRenderingContext.beginPath();
            canvasRenderingContext.moveTo(0, 0);
            canvasRenderingContext.lineTo(Math.cos(ray.angleRadians) * rayLen, Math.sin(ray.angleRadians) * rayLen);
            canvasRenderingContext.stroke();
        }
        canvasRenderingContext.restore();

        for (let i = 0; i < this.stardustSparks.length; i++) {
            const sp = this.stardustSparks[i];
            const twinkle = 0.6 + Math.sin(this.elapsedLifetimeSeconds * sp.twinkleSpeed + sp.twinkleOffset) * 0.4;
            const sparkAlpha = Math.max(0, 1.0 - progress) * twinkle;
            canvasRenderingContext.fillStyle = sp.isAccentColored
                ? (paletteTheme.accentAlpha ? paletteTheme.accentAlpha(sparkAlpha) : "#ff007f")
                : (paletteTheme.coreAlpha ? paletteTheme.coreAlpha(sparkAlpha) : "#ffffff");
            canvasRenderingContext.beginPath();
            canvasRenderingContext.arc(sp.positionX, sp.positionY, sp.radius * (1.0 - progress * 0.5), 0, Math.PI * 2); canvasRenderingContext.fill();
        }

        canvasRenderingContext.restore();
    }
}
