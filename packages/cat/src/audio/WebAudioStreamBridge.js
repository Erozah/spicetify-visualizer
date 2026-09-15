import { WebAudioFeatureProcessor } from './WebAudioFeatureProcessor.js';

// src/audio/WebAudioStreamBridge.js - AudioContext, AnalyserNode & real-time audio input stream management

export class WebAudioStreamBridge {
    constructor(featureExtractor, phaseTracker, bandAnalyzer) {
        this.processor = new WebAudioFeatureProcessor(featureExtractor, phaseTracker, bandAnalyzer);
        this.audioContextInstance = null;
        this.analyserNode = null;
        this.mediaSourceNode = null;
        this.microphoneMediaStream = null;
        this.frequencyByteData = null;
        this.timeDomainByteData = null;
        this.isAudioCaptureActive = false;
        this.isLiveInputCapturing = false;

        try {
            this.autoConnectSavedPreference = (typeof localStorage !== "undefined")
                ? localStorage.getItem("cosmic-cat-live-audio") === "true"
                : false;
        } catch (storageException) {
            this.autoConnectSavedPreference = false;
        }
    }

    async startMicrophoneCapture() {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return false;
            const audioStream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: 2 }
            });
            this.microphoneMediaStream = audioStream;
            const isConnected = this.connectAudioSource(audioStream);
            if (isConnected) {
                this.isLiveInputCapturing = true;
                try { if (typeof localStorage !== "undefined") localStorage.setItem("cosmic-cat-live-audio", "true"); } catch (err) {}
            }
            return isConnected;
        } catch (captureError) {
            console.warn("[WebAudioStreamBridge] Mic error:", captureError);
            this.isLiveInputCapturing = false;
            return false;
        }
    }

    stopMicrophoneCapture() {
        if (this.microphoneMediaStream) {
            try { this.microphoneMediaStream.getTracks().forEach((t) => t.stop()); } catch (err) {}
            this.microphoneMediaStream = null;
        }
        this.disconnectAudioSource();
        this.isLiveInputCapturing = false;
        try { if (typeof localStorage !== "undefined") localStorage.setItem("cosmic-cat-live-audio", "false"); } catch (err) {}
    }

    connectAudioSource(sourceNodeOrStream) {
        try {
            const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextConstructor) return false;
            if (!this.audioContextInstance) this.audioContextInstance = new AudioContextConstructor();
            if (this.audioContextInstance.state === "suspended") this.audioContextInstance.resume();

            this.analyserNode = this.audioContextInstance.createAnalyser();
            Object.assign(this.analyserNode, { fftSize: 1024, smoothingTimeConstant: 0.68, minDecibels: -90, maxDecibels: -10 });
            this.frequencyByteData = new Uint8Array(this.analyserNode.frequencyBinCount);
            this.timeDomainByteData = new Uint8Array(this.analyserNode.fftSize);

            if (sourceNodeOrStream instanceof HTMLMediaElement) {
                this.mediaSourceNode = this.audioContextInstance.createMediaElementSource(sourceNodeOrStream);
                this.mediaSourceNode.connect(this.analyserNode);
                this.analyserNode.connect(this.audioContextInstance.destination);
            } else if (sourceNodeOrStream instanceof MediaStream) {
                this.mediaSourceNode = this.audioContextInstance.createMediaStreamSource(sourceNodeOrStream);
                this.mediaSourceNode.connect(this.analyserNode);
            } else if (sourceNodeOrStream && typeof sourceNodeOrStream.connect === "function") {
                sourceNodeOrStream.connect(this.analyserNode);
            }

            // Konsl audio-sync upgrade: create inaudible tone to keep AudioContext active and prevent CEF from auto-suspending it
            if (!this.keepAliveOscillator) {
                try {
                    this.keepAliveOscillator = this.audioContextInstance.createOscillator();
                    this.keepAliveGain = this.audioContextInstance.createGain();
                    this.keepAliveOscillator.frequency.value = 20000;
                    this.keepAliveGain.gain.value = 0.0001;
                    this.keepAliveOscillator.connect(this.keepAliveGain).connect(this.audioContextInstance.destination);
                    this.keepAliveOscillator.start();
                } catch (e) {}
            }

            this.isAudioCaptureActive = true;
            return true;
        } catch (err) {
            this.isAudioCaptureActive = false;
            return false;
        }
    }

    disconnectAudioSource() {
        this.isAudioCaptureActive = false;
        if (this.mediaSourceNode) { try { this.mediaSourceNode.disconnect(); } catch (err) {} this.mediaSourceNode = null; }
        if (this.analyserNode) { try { this.analyserNode.disconnect(); } catch (err) {} this.analyserNode = null; }
    }

    processAudioStreamFrame(currentTimestampMs, deltaTimeSeconds) {
        if (!this.isAudioCaptureActive || !this.analyserNode || !this.frequencyByteData) return null;
        try {
            if (this.audioContextInstance && this.audioContextInstance.state === "suspended") this.audioContextInstance.resume();
            this.analyserNode.getByteFrequencyData(this.frequencyByteData);
            this.analyserNode.getByteTimeDomainData(this.timeDomainByteData);
            return this.processor.processFrame(
                this.frequencyByteData, this.timeDomainByteData,
                currentTimestampMs, deltaTimeSeconds, this.isLiveInputCapturing
            );
        } catch (err) {
            return null;
        }
    }
}
