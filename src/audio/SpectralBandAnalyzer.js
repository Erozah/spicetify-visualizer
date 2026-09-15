// src/audio/SpectralBandAnalyzer.js - Logarithmic 32-band spectral frequency decomposition & temporal smoothing

export class SpectralBandAnalyzer {
    constructor() {
        this.spectralBandCount = 32;
        this.instantaneousSpectralBands = new Float32Array(this.spectralBandCount);
        this.smoothedSpectralBands = new Float32Array(this.spectralBandCount);
    }

    computeLogarithmicBands(frequencyByteData, totalFrequencyBinCount) {
        const totalBands = this.spectralBandCount;
        for (let bandIndex = 0; bandIndex < totalBands; bandIndex++) {
            const startFraction = Math.pow(bandIndex / totalBands, 2.2);
            const endFraction = Math.pow((bandIndex + 1) / totalBands, 2.2);

            const startBinIndex = Math.min(
                totalFrequencyBinCount - 1,
                Math.floor(startFraction * totalFrequencyBinCount)
            );
            const endBinIndex = Math.max(
                startBinIndex + 1,
                Math.min(totalFrequencyBinCount, Math.floor(endFraction * totalFrequencyBinCount))
            );

            let frequencyEnergySum = 0;
            for (let binIndex = startBinIndex; binIndex < endBinIndex; binIndex++) {
                frequencyEnergySum += frequencyByteData[binIndex];
            }

            const binSpanCount = endBinIndex - startBinIndex;
            const normalizedBandEnergy = frequencyEnergySum / (binSpanCount * 255);
            this.instantaneousSpectralBands[bandIndex] = normalizedBandEnergy;

            // Temporal low-pass smoothing (exponential decay)
            this.smoothedSpectralBands[bandIndex] +=
                (normalizedBandEnergy - this.smoothedSpectralBands[bandIndex]) * 0.32;
        }

        return this.smoothedSpectralBands;
    }

    synthesizeSpectralDistribution(
        bassLevel,
        midLevel,
        trebleLevel,
        harmonicBarProgress,
        elapsedSongTimeSeconds
    ) {
        const totalBands = this.spectralBandCount;
        for (let bandIndex = 0; bandIndex < totalBands; bandIndex++) {
            const normalizedBandRatio = bandIndex / (totalBands - 1);
            let targetBandEnergy = 0;

            if (normalizedBandRatio < 0.25) {
                const subBassModifier = 1.1 - normalizedBandRatio * 2.0;
                const waveFluctuation = 0.7 + Math.sin(bandIndex * 1.5 + elapsedSongTimeSeconds * 4.0) * 0.3;
                targetBandEnergy = bassLevel * subBassModifier * waveFluctuation;
            } else if (normalizedBandRatio < 0.70) {
                const chordHarmonicMovement = 0.8 + Math.sin(bandIndex * 0.8 + harmonicBarProgress * Math.PI * 4.0) * 0.4;
                targetBandEnergy = midLevel * chordHarmonicMovement;
            } else {
                const sparkleAnimation = 0.6 + Math.sin(bandIndex * 1.2 + elapsedSongTimeSeconds * 8.0) * 0.4;
                targetBandEnergy = trebleLevel * sparkleAnimation;
            }

            const clampedTargetEnergy = Math.max(0.02, Math.min(1.0, targetBandEnergy));
            this.smoothedSpectralBands[bandIndex] +=
                (clampedTargetEnergy - this.smoothedSpectralBands[bandIndex]) * 0.32;
        }

        return this.smoothedSpectralBands;
    }

    resetToRestingState() {
        for (let bandIndex = 0; bandIndex < this.spectralBandCount; bandIndex++) {
            this.smoothedSpectralBands[bandIndex] +=
                (0.02 - this.smoothedSpectralBands[bandIndex]) * 0.1;
            this.instantaneousSpectralBands[bandIndex] = 0.02;
        }
        return this.smoothedSpectralBands;
    }

    get bands() {
        return this.smoothedSpectralBands;
    }
}
