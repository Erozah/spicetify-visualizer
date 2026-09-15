// src/audio/HardwareLatencyCompensator.js - Hardware audio output latency compensation for frame-accurate sync
// SOLID Architecture: Dedicated compensator measuring output and base latency to align visual beats with acoustic attacks

export class HardwareLatencyCompensator {
    constructor(audioContextInstance = null) {
        this.audioContextInstance = audioContextInstance;
        this.fallbackHardwareLatencySeconds = 0.020;
    }

    setAudioContext(audioContextInstance) {
        this.audioContextInstance = audioContextInstance;
    }

    getMeasuredHardwareOutputLatencySeconds() {
        if (!this.audioContextInstance) {
            return this.fallbackHardwareLatencySeconds;
        }

        let totalLatencySeconds = 0;

        if (typeof this.audioContextInstance.outputLatency === "number") {
            totalLatencySeconds += this.audioContextInstance.outputLatency;
        }

        if (typeof this.audioContextInstance.baseLatency === "number") {
            totalLatencySeconds += this.audioContextInstance.baseLatency;
        }

        if (totalLatencySeconds > 0) {
            return totalLatencySeconds;
        }

        return this.fallbackHardwareLatencySeconds;
    }

    calculateCompensatedProgressSeconds(rawPlaybackProgressSeconds) {
        const hardwareOutputLatencySeconds = this.getMeasuredHardwareOutputLatencySeconds();
        const compensatedProgressSeconds = rawPlaybackProgressSeconds - hardwareOutputLatencySeconds;
        return Math.max(0, compensatedProgressSeconds);
    }

    isLatencyCompensationActive() {
        return Boolean(this.audioContextInstance);
    }
}
