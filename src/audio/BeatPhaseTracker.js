// src/audio/BeatPhaseTracker.js - Musical tempo estimation, beat phase & rhythmic progression tracker

export class BeatPhaseTracker {
    constructor() {
        this.beatsPerMinute = 120;
        this.lastBeatTimestampMs = 0;
        this.beatOccurrenceCount = 0;
        this.continuousBeatPhaseRatio = 0;
        this.measureBarPhaseRatio = 0;
        this.beatImpulseMagnitude = 0;
        this.isCurrentFrameBeat = false;
        this.isFourBeatMeasureBar = false;

        this.interBeatIntervalHistoryMs = [];
    }

    updateFromOnsetInterval(isKickOnsetDetected, currentTimestampMs, deltaTimeSeconds) {
        const timeElapsedSinceLastBeatMs = currentTimestampMs - this.lastBeatTimestampMs;

        if (isKickOnsetDetected && timeElapsedSinceLastBeatMs > 185) {
            this.isCurrentFrameBeat = true;
            this.beatImpulseMagnitude = 1.0;
            this.beatOccurrenceCount++;

            if (this.lastBeatTimestampMs > 0 && timeElapsedSinceLastBeatMs >= 240 && timeElapsedSinceLastBeatMs <= 1500) {
                this.interBeatIntervalHistoryMs.push(timeElapsedSinceLastBeatMs);
                if (this.interBeatIntervalHistoryMs.length > 8) {
                    this.interBeatIntervalHistoryMs.shift();
                }

                // Median filter for robust tempo extraction
                const sortedIntervals = [...this.interBeatIntervalHistoryMs].sort((a, b) => a - b);
                const medianIntervalMs = sortedIntervals[Math.floor(sortedIntervals.length / 2)];
                let estimatedInstantBpm = 60000 / medianIntervalMs;

                while (estimatedInstantBpm < 70) estimatedInstantBpm *= 2;
                while (estimatedInstantBpm > 165) estimatedInstantBpm /= 2;

                this.beatsPerMinute += (estimatedInstantBpm - this.beatsPerMinute) * 0.25;
            }
            this.lastBeatTimestampMs = currentTimestampMs;
        } else {
            this.isCurrentFrameBeat = false;
        }

        // Exponential decay of beat transient
        this.beatImpulseMagnitude *= Math.pow(0.84, deltaTimeSeconds * 60);

        const beatIntervalSeconds = 60 / (this.beatsPerMinute || 120);
        const secondsSinceLastBeat = (currentTimestampMs - this.lastBeatTimestampMs) / 1000;
        this.continuousBeatPhaseRatio = Math.max(0, Math.min(1.0, secondsSinceLastBeat / beatIntervalSeconds));
        this.measureBarPhaseRatio = ((this.beatOccurrenceCount % 4) + this.continuousBeatPhaseRatio) / 4;
        this.isFourBeatMeasureBar = this.isCurrentFrameBeat && (this.beatOccurrenceCount % 4 === 0);

        return {
            isBeat: this.isCurrentFrameBeat,
            isBar: this.isFourBeatMeasureBar,
            bpm: Math.round(this.beatsPerMinute),
            beatCount: this.beatOccurrenceCount,
            beatPhase: this.continuousBeatPhaseRatio,
            barPhase: this.measureBarPhaseRatio,
            beatImpulse: Math.min(1.0, this.beatImpulseMagnitude)
        };
    }

    syncWithCalculatedPhase(calculatedBeatPhase, beatCount, isBeat) {
        this.continuousBeatPhaseRatio = calculatedBeatPhase;
        this.beatOccurrenceCount = beatCount;
        this.isCurrentFrameBeat = isBeat;
        this.measureBarPhaseRatio = ((beatCount % 4) + calculatedBeatPhase) / 4;
        this.isFourBeatMeasureBar = isBeat && (beatCount % 4 === 0);
    }
}
