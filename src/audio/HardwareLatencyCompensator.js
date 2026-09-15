// src/audio/HardwareLatencyCompensator.js - Hardware audio clock keep-alive & output latency compensation

export class HardwareLatencyCompensator {
    constructor() {
        this.audioContextInstance = null;
        this.keepAliveOscillator = null;
        this.keepAliveGainNode = null;
        this.isClockActive = false;

        this.initializeAudioContextClock();
    }

    initializeAudioContextClock() {
        try {
            const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextConstructor) return;

            this.audioContextInstance = new AudioContextConstructor();

            // Create silent ultra-high frequency oscillator to keep hardware buffer active
            this.keepAliveOscillator = this.audioContextInstance.createOscillator();
            this.keepAliveGainNode = this.audioContextInstance.createGain();

            this.keepAliveOscillator.type = "sine";
            this.keepAliveOscillator.frequency.value = 20000;
            this.keepAliveGainNode.gain.value = 0.0001;

            this.keepAliveOscillator.connect(this.keepAliveGainNode);
            this.keepAliveGainNode.connect(this.audioContextInstance.destination);

            this.keepAliveOscillator.start();
            this.isClockActive = true;
        } catch (initializationError) {
            console.warn("[HardwareLatencyCompensator] Clock init skipped:", initializationError);
        }
    }

    getHardwareOutputLatencySeconds() {
        if (!this.audioContextInstance) return 0;
        const outputLatency = this.audioContextInstance.outputLatency || 0;
        const baseLatency = this.audioContextInstance.baseLatency || 0;
        return outputLatency + baseLatency;
    }

    getCompensatedPlaybackPositionSeconds(rawProgressSeconds = null) {
        let progressInSeconds = rawProgressSeconds;
        if (progressInSeconds === null && typeof Spicetify !== "undefined" && Spicetify.Player) {
            const reportedProgressMilliseconds = Spicetify.Player.getProgress();
            progressInSeconds = (typeof reportedProgressMilliseconds === "number")
                ? reportedProgressMilliseconds / 1000
                : 0;
        }
        if (typeof progressInSeconds !== "number" || isNaN(progressInSeconds)) {
            return 0;
        }

        const hardwareLatencySeconds = this.getHardwareOutputLatencySeconds();
        return Math.max(0, progressInSeconds - hardwareLatencySeconds);
    }

    resumeAudioClock() {
        if (this.audioContextInstance && this.audioContextInstance.state === "suspended") {
            this.audioContextInstance.resume().catch(() => {});
        }
    }

    destroy() {
        try {
            if (this.keepAliveOscillator) {
                this.keepAliveOscillator.stop();
                this.keepAliveOscillator.disconnect();
            }
            if (this.keepAliveGainNode) {
                this.keepAliveGainNode.disconnect();
            }
            if (this.audioContextInstance) {
                this.audioContextInstance.close().catch(() => {});
            }
        } catch (cleanupError) {
            console.warn("[HardwareLatencyCompensator] Cleanup error:", cleanupError);
        }
    }
}
