// src/audio/AudioFeatureExtractor.js - Detection of kicks, snares, spectral flux, onsets & energy thresholds

export class AudioFeatureExtractor {
    constructor() {
        this.subBassLevel = 0; this.bassLevel = 0;
        this.lowMidLevel = 0; this.midLevel = 0;
        this.highMidLevel = 0; this.trebleLevel = 0;
        this.overallEnergy = 0; this.rootMeanSquareLoudness = 0;
        this.snareImpulseLevel = 0;
        this.previousFrequencyData = null;
        this.fluxHistorySamples = [];
        this.energyHistorySamples = [];
    }

    calculateTimeDomainLoudness(timeDomainByteData) {
        let squaredSampleSum = 0;
        const totalSampleCount = timeDomainByteData.length;
        for (let i = 0; i < totalSampleCount; i++) {
            const normalizedSample = (timeDomainByteData[i] - 128) / 128;
            squaredSampleSum += normalizedSample * normalizedSample;
        }
        const instantaneousLoudness = Math.min(1.0, Math.sqrt(squaredSampleSum / totalSampleCount) * 2.2);
        this.rootMeanSquareLoudness += (instantaneousLoudness - this.rootMeanSquareLoudness) * 0.35;
        return this.rootMeanSquareLoudness;
    }

    extractFrequencyBands(frequencyByteData) {
        const totalBinCount = frequencyByteData.length;
        const subBassEndBin = Math.max(2, Math.floor(totalBinCount * 0.02));
        const bassEndBin = Math.floor(totalBinCount * 0.07);
        const lowMidEndBin = Math.floor(totalBinCount * 0.16);
        const midEndBin = Math.floor(totalBinCount * 0.40);
        const highMidEndBin = Math.floor(totalBinCount * 0.65);

        const averageBandRange = (startBin, endBin) => {
            let energySum = 0;
            const spanCount = Math.max(1, endBin - startBin);
            for (let i = startBin; i < endBin; i++) energySum += frequencyByteData[i];
            return energySum / (spanCount * 255);
        };

        const rawSubBass = averageBandRange(0, subBassEndBin);
        const rawBass = averageBandRange(subBassEndBin, bassEndBin);
        const rawLowMid = averageBandRange(bassEndBin, lowMidEndBin);
        const rawMid = averageBandRange(lowMidEndBin, midEndBin);
        const rawHighMid = averageBandRange(midEndBin, highMidEndBin);
        const rawTreble = averageBandRange(highMidEndBin, totalBinCount);

        const activeBass = Math.min(1.0, rawSubBass * 0.55 + rawBass * 0.65);
        const activeMid = Math.min(1.0, rawLowMid * 0.4 + rawMid * 0.7);
        const activeTreble = Math.min(1.0, rawHighMid * 0.5 + rawTreble * 0.6);

        this.subBassLevel += (rawSubBass - this.subBassLevel) * 0.45;
        this.bassLevel += (activeBass - this.bassLevel) * 0.40;
        this.midLevel += (activeMid - this.midLevel) * 0.35;
        this.trebleLevel += (activeTreble - this.trebleLevel) * 0.38;
        this.overallEnergy = Math.min(1.0, (this.bassLevel * 0.45 + this.midLevel * 0.30 + this.trebleLevel * 0.25) * 1.25);

        return { subBassEndBin, bassEndBin, midEndBin, highMidEndBin, activeBass };
    }

    detectSpectralOnsets(frequencyByteData, bandBoundaries, deltaTimeSeconds) {
        const { bassEndBin, midEndBin, highMidEndBin, activeBass } = bandBoundaries;
        if (!this.previousFrequencyData) {
            this.previousFrequencyData = new Float32Array(frequencyByteData.length);
        }

        let positiveBassFlux = 0;
        for (let i = 0; i < bassEndBin; i++) {
            const delta = frequencyByteData[i] - this.previousFrequencyData[i];
            if (delta > 0) positiveBassFlux += delta;
            this.previousFrequencyData[i] = frequencyByteData[i];
        }
        positiveBassFlux /= (bassEndBin * 255);

        let positiveHighFlux = 0;
        for (let i = midEndBin; i < highMidEndBin; i++) {
            const delta = frequencyByteData[i] - this.previousFrequencyData[i];
            if (delta > 0) positiveHighFlux += delta;
        }
        positiveHighFlux /= ((highMidEndBin - midEndBin) * 255);

        this.fluxHistorySamples.push(positiveBassFlux);
        if (this.fluxHistorySamples.length > 45) this.fluxHistorySamples.shift();

        const avgFlux = this.fluxHistorySamples.reduce((s, v) => s + v, 0) / this.fluxHistorySamples.length;
        const fluxVariance = this.fluxHistorySamples.reduce((s, v) => s + Math.pow(v - avgFlux, 2), 0) / this.fluxHistorySamples.length;
        const dynamicKickThreshold = Math.max(0.12, avgFlux + Math.sqrt(fluxVariance) * 1.25);
        const isKickOnsetDetected = (positiveBassFlux > dynamicKickThreshold) && (activeBass > 0.25);

        if (positiveHighFlux > 0.18 && (positiveHighFlux > positiveBassFlux * 0.75)) {
            this.snareImpulseLevel = Math.min(1.0, positiveHighFlux * 3.5);
        } else {
            this.snareImpulseLevel *= Math.pow(0.82, deltaTimeSeconds * 60);
        }

        this.energyHistorySamples.push(this.overallEnergy);
        if (this.energyHistorySamples.length > 60) this.energyHistorySamples.shift();
        const avgEnergy = this.energyHistorySamples.reduce((s, v) => s + v, 0) / this.energyHistorySamples.length;

        const isDropDetected = (this.overallEnergy > 0.65) &&
            (this.subBassLevel > 0.50 || this.bassLevel > 0.58) &&
            (this.overallEnergy > avgEnergy * 1.12);

        return { isKickOnsetDetected, isDropDetected, snareImpulseLevel: this.snareImpulseLevel };
    }
}
