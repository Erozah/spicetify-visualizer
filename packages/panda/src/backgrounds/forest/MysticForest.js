import { BambooGroveStalks } from './BambooGroveStalks.js';
import { BioluminescentSpores } from './BioluminescentSpores.js';
import { DriftingBambooLeaves } from './DriftingBambooLeaves.js';
import { MysticFireflySwarmLayer } from '../MysticFireflySwarmLayer.js';
import { MysticForestTonemapCompositor } from '../MysticForestTonemapCompositor.js';

export class MysticForest {
    constructor(viewportWidth = 1200, viewportHeight = 800) {
        this.bambooStalks = new BambooGroveStalks(viewportWidth, viewportHeight);
        this.driftingLeaves = new DriftingBambooLeaves(viewportWidth, viewportHeight);
        this.bioluminescentSpores = new BioluminescentSpores(viewportWidth, viewportHeight);
        this.fireflySwarm = new MysticFireflySwarmLayer();
        this.tonemapCompositor = new MysticForestTonemapCompositor();

        this.windPhase = 0;
        this.windIntensity = 1.0;
    }

    resize(viewportWidth, viewportHeight) {
        this.bambooStalks.initializeStalks(viewportWidth, viewportHeight);
        this.driftingLeaves.initializeLeaves(viewportWidth, viewportHeight);
        this.bioluminescentSpores.initializeSpores(viewportWidth, viewportHeight);
        if (this.fireflySwarm && typeof this.fireflySwarm.resize === "function") {
            this.fireflySwarm.resize(viewportWidth, viewportHeight);
        }
    }

    update(deltaTime, audio, isPlaying = true) {
        const energy = audio && typeof audio === "object" && audio.energy ? audio.energy : 0.35;
        const bpm = audio && typeof audio === "object" && audio.bpm ? audio.bpm : 120;
        const isDrop = audio && typeof audio === "object" && audio.isDrop;
        const softFactor = audio && typeof audio === "object" ? (audio.softFactor || (audio.isSoft ? 1.0 : 0.0)) : 0.0;
        const dropFactor = audio && typeof audio === "object" ? (audio.dropFactor || (isDrop ? 1.0 : 0.0)) : 0.0;
        const windImpulse = audio && typeof audio === "object" && audio.windGustImpulse ? audio.windGustImpulse * 1.5 : 0.0;

        const tempoNormalized = Math.max(0.4, Math.min(2.0, bpm / 120));

        const targetWind = isPlaying
            ? (0.4 * softFactor + (0.8 + energy * 0.9) * (1.0 - softFactor * 0.7) + dropFactor * 1.6 + windImpulse)
            : 0.3;
        this.windIntensity += (targetWind - this.windIntensity) * Math.min(1.0, deltaTime * 3.0);
        this.windPhase = (this.windPhase + deltaTime * (0.8 + this.windIntensity * 1.2) * tempoNormalized) % (Math.PI * 200);

        this.driftingLeaves.update(deltaTime, this.windIntensity, isPlaying);
        this.bioluminescentSpores.update(deltaTime, energy);
        if (this.fireflySwarm) {
            this.fireflySwarm.update(deltaTime);
        }
    }

    render(ctx, viewportWidth, viewportHeight, time, audio, palette, centerX, centerY, effects = null) {
        ctx.save();

        const energy = audio && typeof audio === "object" && audio.energy ? audio.energy : 0.35;
        const isDrop = audio && typeof audio === "object" && audio.isDrop;
        const softFactor = audio && typeof audio === "object" ? (audio.softFactor || (audio.isSoft ? 1.0 : 0.0)) : 0.0;
        const dropFactor = audio && typeof audio === "object" ? (audio.dropFactor || (isDrop ? 1.0 : 0.0)) : 0.0;

        const groundLevelY = viewportHeight * 0.90;

        const ridgeAlpha = Math.min(0.35, 0.08 * softFactor + (0.12 + energy * 0.12) * (1.0 - softFactor * 0.5) + dropFactor * 0.10);
        ctx.fillStyle = palette.secondaryAlpha ? palette.secondaryAlpha(ridgeAlpha) : "rgba(80, 20, 120, 0.15)";
        ctx.beginPath();
        ctx.moveTo(0, groundLevelY);
        ctx.bezierCurveTo(viewportWidth * 0.25, groundLevelY - 140, viewportWidth * 0.45, groundLevelY - 80, viewportWidth * 0.70, groundLevelY - 160);
        ctx.bezierCurveTo(viewportWidth * 0.85, groundLevelY - 110, viewportWidth * 0.95, groundLevelY - 130, viewportWidth, groundLevelY - 70);
        ctx.lineTo(viewportWidth, viewportHeight);
        ctx.lineTo(0, viewportHeight);
        ctx.closePath();
        ctx.fill();

        this.bambooStalks.render(ctx, viewportWidth, viewportHeight, this.windPhase, this.windIntensity, audio, palette);

        if (!effects || effects.leaves !== false) {
            this.tonemapCompositor.applyAtmosphericPass(ctx, "screen", () => {
                this.driftingLeaves.render(ctx, energy, palette);
            });
        }

        const isWebGlSwarmActive = effects && effects.webglSwarm;
        if (isWebGlSwarmActive && this.fireflySwarm && this.fireflySwarm.isSupported) {
            this.fireflySwarm.render(ctx, viewportWidth, viewportHeight, audio, palette);
        } else if (!effects || effects.spores !== false) {
            this.tonemapCompositor.applyAtmosphericPass(ctx, "screen", () => {
                this.bioluminescentSpores.render(ctx, time, energy, palette);
            });
        }

        const fogGradient = ctx.createLinearGradient(0, groundLevelY - 60, 0, viewportHeight);
        const fogAlpha = Math.min(0.55, 0.15 * softFactor + (0.25 + energy * 0.15) * (1.0 - softFactor * 0.5) + dropFactor * 0.2);
        fogGradient.addColorStop(0, "transparent");
        fogGradient.addColorStop(0.5, palette.deepNebulaAlpha ? palette.deepNebulaAlpha(fogAlpha) : "rgba(10, 5, 25, 0.4)");
        fogGradient.addColorStop(1.0, "transparent");

        ctx.fillStyle = fogGradient;
        ctx.fillRect(0, groundLevelY - 60, viewportWidth, viewportHeight - (groundLevelY - 60));

        ctx.restore();
    }
}
