import { PandaAnatomyCoordinates } from './PandaAnatomyCoordinates.js';

// src/models/redpanda/PandaDeformationPhysics.js - Harmonic breathing, squash-and-stretch & posture dynamics
// SOLID Architecture: Dedicated physics transformer for organic posture, breathing cycles, and beat bounces

export class PandaDeformationPhysics {
    constructor() {
        this.lastParameters = null;
        this.lastScale = 1.0;
        this.lastDeckY = 0;
    }

    computeTransform(time, audio, centerX, centerY, viewportWidth, viewportHeight, isPlaying = true) {
        const deckY = viewportHeight * 0.86;

        const energy = audio && typeof audio === "object" && audio.energy ? audio.energy : 0.35;
        const bpm = audio && typeof audio === "object" && audio.bpm ? audio.bpm : 120;
        const beat = audio && typeof audio === "object" && audio.beatImpulse ? audio.beatImpulse : 0;
        const bass = audio && typeof audio === "object" && audio.bass ? audio.bass : 0.2;
        const isDrop = audio && typeof audio === "object" && audio.isDrop;
        const softFactor = audio && typeof audio === "object" ? (audio.softFactor || (audio.isSoft ? 1.0 : 0.0)) : 0.0;
        const dropFactor = audio && typeof audio === "object" ? (audio.dropFactor || (isDrop ? 1.0 : 0.0)) : 0.0;

        const tempoNormalized = Math.max(0.4, Math.min(2.0, bpm / 120));
        const energyScale = 0.35 + energy * 0.65;

        // Dimensions
        const { baseWidth, pandaScale, bodyHeight } = PandaAnatomyCoordinates.calculateBaseDimensions(viewportWidth, viewportHeight);

        // Breathing cycle
        const breathSpeed = isPlaying
            ? ((0.35 * softFactor + (0.75 + tempoNormalized * 0.45) * (1.0 - softFactor * 0.7)) * (0.4 + energy * 0.6))
            : 0.35;
        const breathAmplitude = isPlaying
            ? (0.012 + (1.0 - softFactor * 0.5) * energy * 0.024)
            : 0.008;
        const breath = Math.sin(time * breathSpeed) * breathAmplitude;

        // Squash & Stretch on drum kicks and supernova drop arrivals
        const supernovaBoost = (audio && audio.supernovaTrigger) ? 0.50 : 0.0;
        const dropMultiplier = 1.0 + dropFactor * 1.35 + (isDrop ? 0.45 : 0) + supernovaBoost;
        const kickImpulse = beat * (audio && audio.bass ? Math.max(0.75, audio.bass * 1.25) : 1.0);

        const squashY = isPlaying
            ? (-kickImpulse * 0.11 * dropMultiplier * energyScale + bass * 0.05 * energyScale)
            : 0;
        const stretchX = isPlaying
            ? (kickImpulse * 0.12 * dropMultiplier * energyScale + bass * 0.06 * energyScale)
            : 0;

        // Springy bounce
        const bounceOffset = isPlaying
            ? (-Math.sin((audio && audio.beatProgress ? audio.beatProgress : 0) * Math.PI) * (2.8 * bass + 6.0 * beat) * dropMultiplier * energyScale)
            : 0;

        // Effective center & tail anchor
        const effectiveCenterY = deckY
            ? (deckY - (bodyHeight * 0.5) * (1.0 + squashY) + bounceOffset)
            : (centerY + bounceOffset);

        const tailAnchor = {
            x: centerX - (baseWidth * 0.28) * (1.0 + stretchX),
            y: effectiveCenterY + (bodyHeight * 0.32) * (1.0 + squashY)
        };

        this.lastParameters = {
            cx: centerX,
            cy: effectiveCenterY,
            baseWidth: baseWidth,
            scale: pandaScale,
            breath: breath,
            squashY: squashY,
            stretchX: stretchX,
            bounceOffset: bounceOffset,
            deckY: deckY
        };
        this.lastScale = pandaScale;
        this.lastDeckY = deckY;

        return {
            tailAnchor,
            pandaScale,
            params: this.lastParameters,
            deckY
        };
    }
}
