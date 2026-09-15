// src/audio/AudioFeatureExtractor.js - Detection of kicks, snares, onsets, drops, and camera shake

export class AudioFeatureExtractor {
    constructor() {
        this.energyHistory = [];
        this.historyCapacity = 60;
        this.previousDropState = false;
        this.lastSupernovaTimestamp = 0;
        this.beatImpulse = 0.0;
        this.snareImpulse = 0.0;
        this.bassShakeImpulse = 0.0;
        this.isDropActive = false;
        this.isSupernovaTriggered = false;
        this.softPassageFactor = 0.0;
        this.dropIntensityFactor = 0.0;
    }

    extractFeatures(deltaTimeSeconds, currentSeconds, currentEnergy, currentBass, currentMid, currentTreble, isKickOnset, isSnareOnset) {
        // Track energy history for relative moving average
        this.energyHistory.push(currentEnergy);
        if (this.energyHistory.length > this.historyCapacity) {
            this.energyHistory.shift();
        }
        const averageEnergy = this.energyHistory.reduce((sum, value) => sum + value, 0) / (this.energyHistory.length || 1);

        // Dynamic drop detection
        const isEnergySpike = (currentEnergy > 0.35 && currentEnergy > averageEnergy * 1.20);
        const isHeavyBassDrop = (currentBass > 0.45 && currentEnergy > 0.32);
        const isSustainedDrop = (currentEnergy > 0.48 && currentBass > 0.40);
        this.isDropActive = isSustainedDrop || (isEnergySpike && isHeavyBassDrop);

        // Supernova trigger on drop arrival or heavy bass drops (minimum 4.5s cooldown)
        const cooldownElapsed = (currentSeconds - this.lastSupernovaTimestamp > 4.5);
        if (((this.isDropActive && !this.previousDropState) || (isKickOnset && currentBass > 0.65 && currentEnergy > 0.42)) && cooldownElapsed) {
            this.isSupernovaTriggered = true;
            this.lastSupernovaTimestamp = currentSeconds;
        } else {
            this.isSupernovaTriggered = false;
        }
        this.previousDropState = this.isDropActive;

        // Smooth soft passage and drop factors
        const isCurrentlySoft = (currentEnergy < 0.26 && currentBass < 0.30 && !this.isDropActive);
        this.softPassageFactor += ((isCurrentlySoft ? 1.0 : 0.0) - this.softPassageFactor) * Math.min(1.0, deltaTimeSeconds * 2.5);
        this.dropIntensityFactor += ((this.isDropActive ? 1.0 : 0.0) - this.dropIntensityFactor) * Math.min(1.0, deltaTimeSeconds * 4.0);

        // Beat impulse decay
        if (isKickOnset) {
            this.beatImpulse = 1.0;
            const kickImpulse = Math.min(1.0, currentBass * 1.15 + (this.isDropActive ? 0.4 : 0));
            if (kickImpulse > this.bassShakeImpulse) {
                this.bassShakeImpulse = kickImpulse;
            }
        } else {
            this.beatImpulse *= Math.pow(0.84, deltaTimeSeconds * 60);
        }

        // Snare impulse decay
        if (isSnareOnset) {
            this.snareImpulse = Math.min(1.0, (currentMid + currentTreble) * 0.85);
        } else {
            this.snareImpulse *= Math.pow(0.80, deltaTimeSeconds * 60);
        }

        this.bassShakeImpulse *= Math.pow(0.85, deltaTimeSeconds * 60);

        return {
            isDrop: this.isDropActive,
            supernovaTrigger: this.isSupernovaTriggered,
            softFactor: this.softPassageFactor,
            dropFactor: this.dropIntensityFactor,
            beatImpulse: this.beatImpulse,
            snareImpulse: this.snareImpulse,
            bassShake: this.bassShakeImpulse
        };
    }
}
