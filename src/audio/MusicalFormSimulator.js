// src/audio/MusicalFormSimulator.js - Song form modeling (intro, verse, drop, outro) & drum envelope synthesis

export class MusicalFormSimulator {
    constructor() {
        this.isSoftSongSection = false;
        this.isDropSongSection = false;
        this.softAtmosphereFactor = 0.5;
        this.dropIntensityFactor = 0.0;
        this.bassImpactShake = 0.0;
        this.supernovaBurstTrigger = false;
        this.snareBackbeatImpulse = 0;
        this.previousDropState = false;
    }

    calculateSongSectionDynamics(trackProgressMs, trackDurationMs, deltaTimeSeconds) {
        let sectionVolumeMultiplier = 0.45;
        let isDropSection = false;
        let isSoftSection = false;

        if (trackDurationMs > 25000) {
            const r = Math.max(0, Math.min(1.0, trackProgressMs / trackDurationMs));
            if (r < 0.10) { sectionVolumeMultiplier = 0.14 + r * 1.5; isSoftSection = true; }
            else if (r < 0.24) { sectionVolumeMultiplier = 0.40; }
            else if (r < 0.28) { sectionVolumeMultiplier = 0.45 + ((r - 0.24) / 0.04) * 0.45; }
            else if (r < 0.45) { sectionVolumeMultiplier = 0.95; isDropSection = true; }
            else if (r < 0.60) { sectionVolumeMultiplier = 0.48; }
            else if (r < 0.66) { sectionVolumeMultiplier = 0.50 + ((r - 0.60) / 0.06) * 0.48; }
            else if (r < 0.84) { sectionVolumeMultiplier = 1.0; isDropSection = true; }
            else if (r < 0.92) { sectionVolumeMultiplier = 0.16; isSoftSection = true; }
            else { sectionVolumeMultiplier = Math.max(0.08, 0.28 - ((r - 0.92) / 0.08) * 0.22); isSoftSection = true; }
        }

        this.isDropSongSection = isDropSection;
        this.isSoftSongSection = isSoftSection;
        this.supernovaBurstTrigger = (isDropSection && !this.previousDropState);
        this.previousDropState = isDropSection;

        this.softAtmosphereFactor += ((isSoftSection ? 1.0 : 0.0) - this.softAtmosphereFactor) * Math.min(1.0, deltaTimeSeconds * 2.5);
        this.dropIntensityFactor += ((isDropSection ? 1.0 : 0.0) - this.dropIntensityFactor) * Math.min(1.0, deltaTimeSeconds * 4.0);

        return { sectionVolumeMultiplier, isDropSection, isSoftSection };
    }

    synthesizeRhythmicEnvelopes(audioEngineRef, elapsedSeconds, beatPhaseRatio, deltaTimeSeconds) {
        const beatInMeasureIndex = audioEngineRef.beatCount % 4;
        const { sectionVolumeMultiplier, isDropSection } = this.calculateSongSectionDynamics(
            audioEngineRef.progress, audioEngineRef.duration, deltaTimeSeconds
        );

        // Physical drum kick model
        const isKickBeat = (beatInMeasureIndex === 0 || beatInMeasureIndex === 2);
        const kickStrength = (beatInMeasureIndex === 0) ? 1.0 : (beatInMeasureIndex === 2 ? 0.82 : 0.20);
        const kickMembrane = Math.exp(-beatPhaseRatio * 6.5) * kickStrength;
        const subResonance = Math.sin(beatPhaseRatio * Math.PI * 3.2) * Math.exp(-beatPhaseRatio * 3.5) * 0.40 * kickStrength;
        const targetBassLevel = Math.min(1.0, (0.08 + (kickMembrane + subResonance) * 0.92) * sectionVolumeMultiplier);

        // Snare backbeat on beat 2 and beat 4
        if (audioEngineRef.isBeat && (beatInMeasureIndex === 1 || beatInMeasureIndex === 3)) {
            this.snareBackbeatImpulse = 0.95 * sectionVolumeMultiplier;
        } else {
            this.snareBackbeatImpulse *= Math.pow(0.80, deltaTimeSeconds * 60);
        }

        // Sixteenth-note hi-hat groove
        const sixteenthPhase = (beatPhaseRatio * 4) % 1.0;
        const hihatHit = Math.exp(-sixteenthPhase * 9.0) * 0.35;
        const targetTrebleLevel = Math.min(1.0, (0.06 + hihatHit + this.snareBackbeatImpulse * 0.5) * sectionVolumeMultiplier);

        // Harmonic mid-range breathing
        const measureBarProgress = (beatInMeasureIndex + beatPhaseRatio) / 4;
        const chordHarmonic = Math.sin(measureBarProgress * Math.PI * 2) * 0.22 + 0.38;
        const targetMidLevel = Math.min(1.0, (0.10 + chordHarmonic + (audioEngineRef.isBeat ? 0.15 : 0)) * sectionVolumeMultiplier);

        audioEngineRef.bass += (targetBassLevel - audioEngineRef.bass) * 0.38;
        audioEngineRef.mid += (targetMidLevel - audioEngineRef.mid) * 0.28;
        audioEngineRef.treble += (targetTrebleLevel - audioEngineRef.treble) * 0.34;
        audioEngineRef.energy = Math.min(1.0, (audioEngineRef.bass * 0.48 + audioEngineRef.mid * 0.30 + audioEngineRef.treble * 0.22) * 1.35 * sectionVolumeMultiplier);

        // Bass camera shake impulse
        if (audioEngineRef.isBeat && (beatInMeasureIndex === 0 || (isDropSection && beatInMeasureIndex === 2))) {
            const shakeHit = isDropSection ? 0.95 : (isKickBeat ? 0.55 : 0.25);
            this.bassImpactShake = Math.max(this.bassImpactShake, shakeHit * sectionVolumeMultiplier);
        }
        this.bassImpactShake *= Math.pow(0.78, deltaTimeSeconds * 60);

        audioEngineRef.isDrop = isDropSection;
        audioEngineRef.isSoft = this.isSoftSongSection;
        audioEngineRef.softFactor = this.softAtmosphereFactor;
        audioEngineRef.dropFactor = this.dropIntensityFactor;
        audioEngineRef.bassShake = this.bassImpactShake;
        audioEngineRef.supernovaTrigger = this.supernovaBurstTrigger;
        audioEngineRef.snareImpulse = this.snareBackbeatImpulse;

        return measureBarProgress;
    }

    applyRestingState(audioEngineRef) {
        const restingBreath = 0.08 + (Math.sin(audioEngineRef.liveTime * 0.7) * 0.5 + 0.5) * 0.05;
        audioEngineRef.bass += (restingBreath - audioEngineRef.bass) * 0.08;
        audioEngineRef.mid += (restingBreath * 0.7 - audioEngineRef.mid) * 0.08;
        audioEngineRef.treble += (restingBreath * 0.4 - audioEngineRef.treble) * 0.08;
        audioEngineRef.energy = restingBreath;
        audioEngineRef.snareImpulse = 0;
        audioEngineRef.isDrop = false;
        audioEngineRef.isSoft = true;
        audioEngineRef.softFactor = 1.0;
        audioEngineRef.dropFactor = 0.0;
        audioEngineRef.bassShake = 0.0;
        audioEngineRef.supernovaTrigger = false;
        this.bassImpactShake = 0.0;
    }
}
