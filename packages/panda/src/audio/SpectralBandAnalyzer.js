// src/audio/SpectralBandAnalyzer.js - 32-band logarithmic decomposition and frequency grouping

export class SpectralBandAnalyzer {
    constructor() {
        this.spectralBands = new Float32Array(32);
        this.subBassEnergy = 0.0;
        this.bassEnergy = 0.0;
        this.midrangeEnergy = 0.0;
        this.trebleEnergy = 0.0;
        this.overallEnergy = 0.0;
    }

    decomposeByteFrequencyData(frequencyByteDataArray) {
        if (!frequencyByteDataArray || frequencyByteDataArray.length === 0) {
            return this.getEmptyAnalysisResult();
        }

        const dataLength = frequencyByteDataArray.length;
        const totalBands = 32;

        for (let bandIndex = 0; bandIndex < totalBands; bandIndex++) {
            const startFraction = Math.pow(bandIndex / totalBands, 2.2);
            const endFraction = Math.pow((bandIndex + 1) / totalBands, 2.2);
            const startIndex = Math.min(dataLength - 1, Math.floor(startFraction * dataLength));
            const endIndex = Math.max(startIndex + 1, Math.min(dataLength, Math.floor(endFraction * dataLength)));

            let frequencySum = 0;
            for (let index = startIndex; index < endIndex; index++) {
                frequencySum += frequencyByteDataArray[index];
            }
            const averageAmplitude = frequencySum / (endIndex - startIndex);
            const normalizedBandValue = Math.min(1.0, averageAmplitude / 255.0);

            // Temporal smoothing per band (attack 0.55, decay 0.28)
            const smoothingFactor = normalizedBandValue > this.spectralBands[bandIndex] ? 0.55 : 0.28;
            this.spectralBands[bandIndex] += (normalizedBandValue - this.spectralBands[bandIndex]) * smoothingFactor;
        }

        // Sub-bass: bins 0 to 2
        this.subBassEnergy = (this.spectralBands[0] * 0.5 + this.spectralBands[1] * 0.35 + this.spectralBands[2] * 0.15);
        // Bass: bins 1 to 7
        let bassSum = 0;
        for (let b = 1; b <= 7; b++) bassSum += this.spectralBands[b];
        this.bassEnergy = bassSum / 7;
        // Midrange: bins 8 to 20
        let midSum = 0;
        for (let m = 8; m <= 20; m++) midSum += this.spectralBands[m];
        this.midrangeEnergy = midSum / 13;
        // Treble: bins 21 to 31
        let trebleSum = 0;
        for (let t = 21; t < 32; t++) trebleSum += this.spectralBands[t];
        this.trebleEnergy = trebleSum / 11;

        this.overallEnergy = Math.min(1.0, this.subBassEnergy * 0.45 + this.bassEnergy * 0.30 + this.midrangeEnergy * 0.18 + this.trebleEnergy * 0.07);

        return {
            spectralBands: this.spectralBands,
            subBass: this.subBassEnergy,
            bass: this.bassEnergy,
            mid: this.midrangeEnergy,
            treble: this.trebleEnergy,
            energy: this.overallEnergy
        };
    }

    synthesizeSpectralBands(bass, mid, treble, timeSeconds, barProgress, sixteenthPhase) {
        for (let bandIndex = 0; bandIndex < 32; bandIndex++) {
            const normalizedIndex = bandIndex / 31.0;
            let targetValue = 0;

            if (normalizedIndex < 0.25) {
                targetValue = bass * (1.1 - normalizedIndex * 2.0) * (0.7 + Math.sin(bandIndex * 1.5 + timeSeconds * 4) * 0.3);
            } else if (normalizedIndex < 0.70) {
                targetValue = mid * (0.8 + Math.sin(bandIndex * 0.8 + barProgress * Math.PI * 4) * 0.4);
            } else {
                targetValue = treble * (0.6 + Math.sin(bandIndex * 1.2 + sixteenthPhase * Math.PI * 2) * 0.4);
            }

            const clampedTarget = Math.max(0.02, Math.min(1.0, targetValue));
            this.spectralBands[bandIndex] += (clampedTarget - this.spectralBands[bandIndex]) * 0.32;
        }

        return this.spectralBands;
    }

    getEmptyAnalysisResult() {
        return {
            spectralBands: this.spectralBands,
            subBass: 0.0,
            bass: 0.0,
            mid: 0.0,
            treble: 0.0,
            energy: 0.0
        };
    }
}
