export class CarrierToneLatencyTracker {
    constructor() {
        this.isEnabled = true;
        this.stableLatencySeconds = 0;
        this.audioContext = null;
        this.carrierOscillator = null;
        this.carrierGainNode = null;
        this.initializeAudioCarrierContext();
    }

    initializeAudioCarrierContext() {
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return;

            this.audioContext = new AudioContextClass();
            this.carrierOscillator = this.audioContext.createOscillator();
            this.carrierGainNode = this.audioContext.createGain();

            this.carrierOscillator.frequency.value = 20000;
            this.carrierGainNode.gain.value = 0.00005;

            this.carrierOscillator.connect(this.carrierGainNode);
            this.carrierGainNode.connect(this.audioContext.destination);
            this.carrierOscillator.start();
        } catch (initializationError) {
            console.warn("[CarrierToneLatencyTracker] Failed to initialize carrier tone context:", initializationError);
        }
    }

    setCorrectionEnabled(enabled) {
        this.isEnabled = Boolean(enabled);
        if (this.audioContext) {
            if (this.isEnabled && this.audioContext.state === "suspended") {
                this.audioContext.resume().catch(() => {});
            } else if (!this.isEnabled && this.audioContext.state === "running") {
                this.audioContext.suspend().catch(() => {});
            }
        }
    }

    isCorrectionEnabled() {
        return this.isEnabled;
    }

    getEffectiveLatencySeconds() {
        if (!this.isEnabled || !this.audioContext) return 0;

        const currentOutputLatency = this.audioContext.outputLatency || 0;
        if (Math.abs(this.stableLatencySeconds - currentOutputLatency) > 0.02) {
            this.stableLatencySeconds = currentOutputLatency;
        }
        return this.stableLatencySeconds;
    }

    getCompensatedProgressSeconds(rawProgressSeconds) {
        return Math.max(0, rawProgressSeconds - this.getEffectiveLatencySeconds());
    }
}
