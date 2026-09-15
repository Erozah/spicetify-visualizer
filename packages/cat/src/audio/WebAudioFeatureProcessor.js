// src/audio/WebAudioFeatureProcessor.js - Real-time FFT analysis & audio state payload processor

/**
 * Processes raw FFT frequency and time-domain byte arrays into structured audio features.
 */
export class WebAudioFeatureProcessor {
    constructor(featureExtractor, phaseTracker, bandAnalyzer) {
        this.featureExtractor = featureExtractor;
        this.phaseTracker = phaseTracker;
        this.bandAnalyzer = bandAnalyzer;

        this.bassCameraShakeImpulse = 0;
        this.dropIntensityFactor = 0;
        this.softAtmosphereFactor = 0.5;
        this.isSoftSectionActive = false;
        this.supernovaBurstTrigger = false;
        this.previousDropState = false;
    }

    processFrame(frequencyByteData, timeDomainByteData, currentTimestampMs, deltaTimeSeconds, isLiveCapturing) {
        const rmsLoudness = this.featureExtractor.calculateTimeDomainLoudness(timeDomainByteData);
        const bandBoundaries = this.featureExtractor.extractFrequencyBands(frequencyByteData);
        const onsets = this.featureExtractor.detectSpectralOnsets(frequencyByteData, bandBoundaries, deltaTimeSeconds);
        const rhythm = this.phaseTracker.updateFromOnsetInterval(onsets.isKickOnsetDetected, currentTimestampMs, deltaTimeSeconds);
        const spectralBands = this.bandAnalyzer.computeLogarithmicBands(frequencyByteData, frequencyByteData.length);

        this.supernovaBurstTrigger = (onsets.isDropDetected && !this.previousDropState);
        this.previousDropState = onsets.isDropDetected;

        const isCurrentlySoft = (this.featureExtractor.overallEnergy < 0.26 && this.featureExtractor.bassLevel < 0.30 && !onsets.isDropDetected);
        this.softAtmosphereFactor += ((isCurrentlySoft ? 1.0 : 0.0) - this.softAtmosphereFactor) * Math.min(1.0, deltaTimeSeconds * 2.5);
        this.isSoftSectionActive = this.softAtmosphereFactor > 0.52;
        this.dropIntensityFactor += ((onsets.isDropDetected ? 1.0 : 0.0) - this.dropIntensityFactor) * Math.min(1.0, deltaTimeSeconds * 4.0);

        if (onsets.isKickOnsetDetected) {
            const kickImpulse = Math.min(1.0, bandBoundaries.activeBass * 0.85 + (onsets.isDropDetected ? 0.35 : 0));
            if (kickImpulse > this.bassCameraShakeImpulse) this.bassCameraShakeImpulse = kickImpulse;
        }
        this.bassCameraShakeImpulse *= Math.pow(0.78, deltaTimeSeconds * 60);

        return {
            active: true,
            isCapturing: isLiveCapturing,
            subBass: this.featureExtractor.subBassLevel,
            bass: this.featureExtractor.bassLevel,
            lowMid: this.featureExtractor.lowMidLevel,
            mid: this.featureExtractor.midLevel,
            highMid: this.featureExtractor.highMidLevel,
            treble: this.featureExtractor.trebleLevel,
            energy: this.featureExtractor.overallEnergy,
            rms: rmsLoudness,
            isBeat: rhythm.isBeat,
            isBar: rhythm.isBar,
            beatImpulse: rhythm.beatImpulse,
            snareImpulse: onsets.snareImpulseLevel,
            isDrop: onsets.isDropDetected,
            isSoft: this.isSoftSectionActive,
            softFactor: this.softAtmosphereFactor,
            dropFactor: this.dropIntensityFactor,
            bassShake: this.bassCameraShakeImpulse,
            supernovaTrigger: this.supernovaBurstTrigger,
            spectralBands,
            bpm: rhythm.bpm,
            beatCount: rhythm.beatCount,
            beatPhase: rhythm.beatPhase,
            beatProgress: rhythm.beatPhase,
            barPhase: rhythm.barPhase
        };
    }
}
