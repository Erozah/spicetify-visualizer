export class MusicalFormSimulator {
    constructor() {
        this.currentSectionMultiplier = 1.0;
        this.isDropSection = false;
        this.isSoftSection = false;
        this.softFactor = 0.0;
        this.dropFactor = 0.0;
        this.snareImpulse = 0.0;
        this.bassImpactShake = 0.0;
        this.previousDropState = false;
        this.lastSupernovaTime = 0;
    }

    evaluateSectionState(trackProgressRatio) {
        let sectionMultiplier = 1.0;
        let isDrop = false;
        let isSoft = false;

        const normalizedProgress = Math.max(0.0, Math.min(1.0, trackProgressRatio));

        if (normalizedProgress < 0.08) {
            sectionMultiplier = 0.25 + (normalizedProgress / 0.08) * 0.45;
            isSoft = true;
        } else if (normalizedProgress < 0.24) {
            sectionMultiplier = 0.72;
        } else if (normalizedProgress < 0.32) {
            const buildupFraction = (normalizedProgress - 0.24) / 0.08;
            sectionMultiplier = 0.45 + buildupFraction * 0.50;
        } else if (normalizedProgress < 0.48) {
            sectionMultiplier = 1.0;
            isDrop = true;
        } else if (normalizedProgress < 0.60) {
            sectionMultiplier = 0.75;
        } else if (normalizedProgress < 0.66) {
            const buildupFraction = (normalizedProgress - 0.60) / 0.06;
            sectionMultiplier = 0.50 + buildupFraction * 0.48;
        } else if (normalizedProgress < 0.84) {
            sectionMultiplier = 1.0;
            isDrop = true;
        } else if (normalizedProgress < 0.92) {
            sectionMultiplier = 0.16;
            isSoft = true;
        } else {
            const outroFraction = (normalizedProgress - 0.92) / 0.08;
            sectionMultiplier = Math.max(0.08, 0.28 - outroFraction * 0.22);
            isSoft = true;
        }

        this.currentSectionMultiplier = sectionMultiplier;
        this.isDropSection = isDrop;
        this.isSoftSection = isSoft;

        return {
            sectionMultiplier,
            isDropSection: isDrop,
            isSoftSection: isSoft
        };
    }

    synthesizeRhythmicEnvelopes(engine, phase, deltaTimeSeconds) {
        const trackProgressRatio = (engine.progress % engine.trackDuration) / engine.trackDuration;
        const form = this.evaluateSectionState(trackProgressRatio);

        const previousDrop = engine.isDrop;
        engine.isDrop = form.isDropSection;
        engine.isSoft = form.isSoftSection;

        const cooldownElapsed = (engine.liveTime - this.lastSupernovaTime > 4.5);
        if (((engine.isDrop && !previousDrop) || (engine.isBeat && engine.bass > 0.70 && form.isDropSection)) && cooldownElapsed) {
            engine.supernovaTrigger = true;
            this.lastSupernovaTime = engine.liveTime;
        }

        this.softFactor += ((form.isSoftSection ? 1.0 : 0.0) - this.softFactor) * Math.min(1.0, deltaTimeSeconds * 2.5);
        this.dropFactor += ((form.isDropSection ? 1.0 : 0.0) - this.dropFactor) * Math.min(1.0, deltaTimeSeconds * 4.0);
        engine.softFactor = this.softFactor;
        engine.dropFactor = this.dropFactor;

        const isKickBeat = (phase.beatInMeasure === 0 || phase.beatInMeasure === 2);
        const kickStrength = (phase.beatInMeasure === 0) ? 1.0 : (phase.beatInMeasure === 2 ? 0.85 : 0.20);
        const kickMembrane = Math.exp(-phase.beatPhase * 6.5) * kickStrength;
        const subResonance = Math.sin(phase.beatPhase * Math.PI * 3.2) * Math.exp(-phase.beatPhase * 3.5) * 0.40 * kickStrength;
        const targetBass = Math.min(1.0, (0.08 + (kickMembrane + subResonance) * 0.92) * form.sectionMultiplier);

        if (engine.isBeat && (phase.beatInMeasure === 1 || phase.beatInMeasure === 3)) {
            this.snareImpulse = 0.95 * form.sectionMultiplier;
        } else {
            this.snareImpulse *= Math.pow(0.80, deltaTimeSeconds * 60);
        }
        engine.snareImpulse = this.snareImpulse;

        const sixteenthPhase = (phase.beatPhase * 4) % 1.0;
        const hihatHit = Math.exp(-sixteenthPhase * 9.0) * 0.35;
        const targetTreble = Math.min(1.0, (0.06 + hihatHit + (this.snareImpulse * 0.5)) * form.sectionMultiplier);

        const chordHarmonic = (Math.sin(phase.barPhase * Math.PI * 2) * 0.22 + 0.38);
        const targetMid = Math.min(1.0, (0.10 + chordHarmonic + (engine.isBeat ? 0.15 : 0)) * form.sectionMultiplier);

        engine.bass += (targetBass - engine.bass) * 0.38;
        engine.mid += (targetMid - engine.mid) * 0.28;
        engine.treble += (targetTreble - engine.treble) * 0.34;
        engine.energy = Math.min(1.0, (engine.bass * 0.48 + engine.mid * 0.30 + engine.treble * 0.22) * 1.35 * form.sectionMultiplier);

        if (engine.isBeat && (phase.beatInMeasure === 0 || (form.isDropSection && phase.beatInMeasure === 2))) {
            const shakeHit = form.isDropSection ? 1.0 : (isKickBeat ? 0.80 : 0.40);
            this.bassImpactShake = Math.max(this.bassImpactShake || 0, shakeHit * form.sectionMultiplier);
        }
        this.bassImpactShake = (this.bassImpactShake || 0) * Math.pow(0.85, deltaTimeSeconds * 60);
        engine.bassShake = this.bassImpactShake;

        engine.spectralBands = engine.spectralBandAnalyzer.synthesizeSpectralBands(
            engine.bass,
            engine.mid,
            engine.treble,
            engine.liveTime,
            phase.barPhase,
            sixteenthPhase
        );
    }

    applyRestingState(engine) {
        const breath = 0.08 + (Math.sin(engine.liveTime * 0.7) * 0.5 + 0.5) * 0.05;
        engine.bass += (breath - engine.bass) * 0.08;
        engine.mid += (breath * 0.7 - engine.mid) * 0.08;
        engine.treble += (breath * 0.4 - engine.treble) * 0.08;
        engine.snareImpulse = 0;
        engine.energy = breath;
        engine.isDrop = false;
        engine.isSoft = true;
        engine.softFactor = 1.0;
        engine.dropFactor = 0.0;
        engine.bassShake = 0.0;
        engine.supernovaTrigger = false;
        this.bassImpactShake = 0.0;
        for (let bandIndex = 0; bandIndex < 32; bandIndex++) {
            engine.spectralBands[bandIndex] += (0.02 - engine.spectralBands[bandIndex]) * 0.1;
        }
    }
}
