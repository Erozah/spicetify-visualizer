import { GeometricConstellationTopology } from './GeometricConstellationNodes.js';
import { renderCyberConstellationHeart } from './CyberConstellationHeart.js';
import { renderCyberEyesAndPupils } from './CyberEyesPupils.js';
import { renderCyberHeadPolygon } from './CyberHeadPolygon.js';
import { renderCyberNeonContours } from './CyberNeonContours.js';
import { renderCyberSilhouetteAura } from './CyberAuraRenderer.js';
import { renderCyberTailSegmented } from './CyberTailSegmented.js';

export class CyberCat {
    constructor() {
        this.blinkProgress = 0;
        this.nextBlinkTime = 3.0;
        this.isBlinking = false;

        this.leftEarTwitch = 0;
        this.rightEarTwitch = 0;
        this.currentLeftEarAngle = 0;
        this.currentRightEarAngle = 0;

        this.tailSegments = 14;
        this.tailPoints = [];
        for (let index = 0; index < this.tailSegments; index++) {
            this.tailPoints.push({ x: 0, y: 0 });
        }

        this.constellationTopology = new GeometricConstellationTopology();
        this.constellationNodes = this.constellationTopology.getNodes();
        this.constellationLinks = this.constellationTopology.getLinks();
    }

    update(deltaTimeSeconds, animationTimeSeconds, audioFeatureState) {
        if (animationTimeSeconds > this.nextBlinkTime) {
            this.isBlinking = true;
            this.blinkProgress += deltaTimeSeconds * 12;
            if (this.blinkProgress >= Math.PI) {
                this.blinkProgress = 0;
                this.isBlinking = false;
                this.nextBlinkTime = animationTimeSeconds + 2.5 + Math.random() * 4.0;
            }
        }

        const energyLevel = audioFeatureState.energy || 0.35;
        const energyScale = 0.35 + energyLevel * 0.65;
        const snareImpulse = audioFeatureState.snareImpulse || 0;

        if (snareImpulse > 0.45 && energyLevel > 0.30) {
            this.leftEarTwitch = (Math.random() - 0.50) * 0.35 * snareImpulse * energyScale;
            this.rightEarTwitch = (Math.random() - 0.50) * 0.35 * snareImpulse * energyScale;
        } else {
            const decayMultiplier = Math.pow(0.88, deltaTimeSeconds * 60);
            this.leftEarTwitch *= decayMultiplier;
            this.rightEarTwitch *= decayMultiplier;
        }

        const earBeatBounce = ((audioFeatureState.mid || audioFeatureState.mids || 0) * 0.04 + snareImpulse * 0.05) * energyScale;
        this.currentLeftEarAngle = this.leftEarTwitch - earBeatBounce;
        this.currentRightEarAngle = this.rightEarTwitch + earBeatBounce;
    }

    render(
        canvasRenderingContext,
        felineCenterCoordinateX,
        felineCenterCoordinateY,
        renderScale,
        animationTimeSeconds,
        audioFeatureState,
        visualizerPalette,
        visualEffectsState = null,
        viewportWidth = 800,
        viewportHeight = 600
    ) {
        canvasRenderingContext.save();
        canvasRenderingContext.translate(felineCenterCoordinateX, felineCenterCoordinateY);

        const energyLevel = audioFeatureState.energy || 0.35;
        const energyScale = 0.35 + energyLevel * 0.65;
        const normalizedTempo = Math.max(0.40, Math.min(2.0, (audioFeatureState.bpm || 120) / 120));
        const dropMultiplier = audioFeatureState.isDrop ? 1.50 : 1.0;
        const beatImpulse = audioFeatureState.beatImpulse || 0;
        const bassIntensity = audioFeatureState.bass || 0;

        const squashX = 1.0 + (beatImpulse * 0.06 + bassIntensity * 0.03) * dropMultiplier * energyScale;
        const squashY = 1.0 - (beatImpulse * 0.045) * dropMultiplier * energyScale;
        canvasRenderingContext.scale(renderScale * squashX, renderScale * squashY);

        const breathFrequency = 0.65 + normalizedTempo * 0.45 * (0.35 + energyLevel * 0.65);
        const breathOffset = Math.sin(animationTimeSeconds * breathFrequency) * (1.6 + energyLevel * 2.0);
        const bassBounce = (bassIntensity * 5.0 + beatImpulse * 7.5) * dropMultiplier * energyScale;
        canvasRenderingContext.translate(0, -bassBounce + breathOffset);

        const swayFrequency = 0.35 + normalizedTempo * 0.45 * (0.40 + energyLevel * 0.60);
        const swayAngle = Math.sin(animationTimeSeconds * swayFrequency) * ((0.008 + (audioFeatureState.mid || audioFeatureState.mids || 0) * 0.016) * energyScale);
        canvasRenderingContext.rotate(swayAngle);

        renderCyberTailSegmented(canvasRenderingContext, this.tailPoints, this.tailSegments, animationTimeSeconds, audioFeatureState, visualizerPalette);
        renderCyberSilhouetteAura(canvasRenderingContext, audioFeatureState, visualizerPalette);
        renderCyberConstellationHeart(canvasRenderingContext, this.constellationNodes, this.constellationLinks, animationTimeSeconds, audioFeatureState, visualizerPalette);
        renderCyberNeonContours(canvasRenderingContext, audioFeatureState, visualizerPalette);
        renderCyberHeadPolygon(canvasRenderingContext, this.currentLeftEarAngle, this.currentRightEarAngle, animationTimeSeconds, audioFeatureState, visualizerPalette);
        renderCyberEyesAndPupils(canvasRenderingContext, this.isBlinking, this.blinkProgress, audioFeatureState, visualizerPalette);

        canvasRenderingContext.restore();
    }
}
