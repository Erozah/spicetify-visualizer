// src/audio/SystemAudioBridgeWebSocketClient.js - Optional WebSocket client streaming system audio spectral bands
// SOLID Architecture: Dedicated WebSocket client for real-time 32-band spectral energy, PipeWire bridge & spectral flux ingestion

export class SystemAudioBridgeWebSocketClient {
    constructor(serverEndpointAddress = "ws://127.0.0.1:8787") {
        this.serverEndpointAddress = serverEndpointAddress;
        this.webSocketConnection = null;
        this.isConnectionActive = false;
        this.reconnectionTimerIdentifier = null;

        this.spectralBands = new Float32Array(32);
        this.spectralFlux = 0.0;
        this.receivedAudioEnergy = 0.0;
        this.receivedBassEnergy = 0.0;
        this.isBeat = false;
        this.beatImpulse = 0.0;
        this.snareImpulse = 0.0;
        this._lastKickId = -1;
        this._lastOnsetId = -1;
        this.beatCount = 0;
    }

    initializeConnection() {
        if (typeof WebSocket === "undefined") return;
        if (this.webSocketConnection && (this.webSocketConnection.readyState === WebSocket.OPEN || this.webSocketConnection.readyState === WebSocket.CONNECTING)) {
            return;
        }

        try {
            this.webSocketConnection = new WebSocket(this.serverEndpointAddress);
            this.webSocketConnection.binaryType = "arraybuffer";

            this.webSocketConnection.onopen = () => {
                this.isConnectionActive = true;
                if (this.reconnectionTimerIdentifier) {
                    clearTimeout(this.reconnectionTimerIdentifier);
                    this.reconnectionTimerIdentifier = null;
                }
            };

            this.webSocketConnection.onmessage = (messageEvent) => {
                this.handleIncomingAudioData(messageEvent.data);
            };

            this.webSocketConnection.onerror = () => {
                this.isConnectionActive = false;
            };

            this.webSocketConnection.onclose = () => {
                this.isConnectionActive = false;
                this.webSocketConnection = null;
                this.scheduleReconnectionAttempt();
            };
        } catch (connectionError) {
            this.isConnectionActive = false;
            this.scheduleReconnectionAttempt();
        }
    }

    connect() {
        this.initializeConnection();
    }

    scheduleReconnectionAttempt() {
        if (this.reconnectionTimerIdentifier) return;
        this.reconnectionTimerIdentifier = setTimeout(() => {
            this.reconnectionTimerIdentifier = null;
            this.initializeConnection();
        }, 4000);
    }

    handleIncomingAudioData(rawPayload) {
        // Case 1: High-performance binary frame from Dr1mS viz-bridge (PipeWire loopback Float32Array, 51 values)
        if (rawPayload instanceof ArrayBuffer) {
            const f32 = new Float32Array(rawPayload);
            if (f32.length >= 51) {
                // Dr1mS Mel frequency bands (19..50)
                for (let bandIdx = 0; bandIdx < 32; bandIdx++) {
                    this.spectralBands[bandIdx] = f32[19 + bandIdx] || 0;
                }

                const flux = f32[4] || 0;
                const energy = f32[7] || 0.2;
                const kick = f32[11] || 0;
                const kickId = Math.round(f32[12]);
                const snare = f32[13] || 0;
                const onsetId = Math.round(f32[10]);

                const isKickOnset = (this._lastKickId >= 0 && kickId !== this._lastKickId);
                this._lastKickId = kickId;
                this._lastOnsetId = onsetId;

                this.spectralFlux = flux;
                this.receivedAudioEnergy = energy;
                this.receivedBassEnergy = Math.max(kick, this.spectralBands[0], this.spectralBands[1], this.spectralBands[2]);
                this.isBeat = isKickOnset || kick > 0.45;
                if (this.isBeat) {
                    this.beatCount++;
                    this.beatImpulse = Math.max(0.85, kick);
                } else {
                    this.beatImpulse = kick * 0.4;
                }
                this.snareImpulse = snare;
                return;
            }
        }

        // Case 2: JSON payload fallback
        if (typeof rawPayload !== "string") return;

        try {
            const parsedPayload = JSON.parse(rawPayload);
            const sourceBands = parsedPayload.spectralBands || parsedPayload.bands;

            if (Array.isArray(sourceBands) && sourceBands.length >= 32) {
                for (let bandIndex = 0; bandIndex < 32; bandIndex++) {
                    this.spectralBands[bandIndex] = Number(sourceBands[bandIndex]) || 0;
                }
            }

            if (typeof parsedPayload.spectralFlux === "number") {
                this.spectralFlux = parsedPayload.spectralFlux;
            } else if (typeof parsedPayload.flux === "number") {
                this.spectralFlux = parsedPayload.flux;
            }

            if (typeof parsedPayload.energy === "number") {
                this.receivedAudioEnergy = parsedPayload.energy;
            }

            if (typeof parsedPayload.bass === "number") {
                this.receivedBassEnergy = parsedPayload.bass;
            }

            this.isBeat = !!parsedPayload.isBeat;
            if (this.isBeat) {
                this.beatCount++;
                this.beatImpulse = parsedPayload.beatImpulse || 1.0;
            }
            if (typeof parsedPayload.snareImpulse === "number") {
                this.snareImpulse = parsedPayload.snareImpulse;
            }
        } catch (parsingError) {}
    }

    isBridgeConnected() {
        return this.isConnectionActive;
    }

    disconnect() {
        if (this.reconnectionTimerIdentifier) {
            clearTimeout(this.reconnectionTimerIdentifier);
            this.reconnectionTimerIdentifier = null;
        }
        if (this.webSocketConnection) {
            try { this.webSocketConnection.close(); } catch (e) {}
            this.webSocketConnection = null;
        }
        this.isConnectionActive = false;
    }
}
