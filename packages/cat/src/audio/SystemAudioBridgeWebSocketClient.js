// src/audio/SystemAudioBridgeWebSocketClient.js - High-speed desktop audio loopback via Dr1mS WebSocket bridge

export class SystemAudioBridgeWebSocketClient {
    constructor(serverEndpointUrl = "ws://127.0.0.1:8787") {
        this.serverEndpointUrl = serverEndpointUrl;
        this.webSocketInstance = null;
        this.isConnected = false;
        this.latestAudioFrame = null;
        this.spectralBandsBuffer = new Float32Array(32);
        this.reconnectTimeoutIdentifier = null;
        this._lastKickId = -1;
        this._lastOnsetId = -1;
        this.beatCount = 0;
    }

    connect() {
        if (typeof WebSocket === "undefined") return;
        if (this.webSocketInstance && (this.webSocketInstance.readyState === WebSocket.OPEN || this.webSocketInstance.readyState === WebSocket.CONNECTING)) {
            return;
        }

        try {
            this.webSocketInstance = new WebSocket(this.serverEndpointUrl);
            this.webSocketInstance.binaryType = "arraybuffer";

            this.webSocketInstance.onopen = () => {
                this.isConnected = true;
                if (this.reconnectTimeoutIdentifier) {
                    clearTimeout(this.reconnectTimeoutIdentifier);
                    this.reconnectTimeoutIdentifier = null;
                }
            };

            this.webSocketInstance.onmessage = (messageEvent) => {
                this.parseIncomingAudioPayload(messageEvent.data);
            };

            this.webSocketInstance.onerror = () => {
                this.isConnected = false;
            };

            this.webSocketInstance.onclose = () => {
                this.isConnected = false;
                this.webSocketInstance = null;
                this.scheduleReconnection();
            };
        } catch (connectionError) {
            this.isConnected = false;
            this.scheduleReconnection();
        }
    }

    scheduleReconnection() {
        if (this.reconnectTimeoutIdentifier) return;
        this.reconnectTimeoutIdentifier = setTimeout(() => {
            this.reconnectTimeoutIdentifier = null;
            this.connect();
        }, 4000);
    }

    disconnect() {
        this.isConnected = false;
        if (this.reconnectTimeoutIdentifier) {
            clearTimeout(this.reconnectTimeoutIdentifier);
            this.reconnectTimeoutIdentifier = null;
        }
        if (this.webSocketInstance) {
            try { this.webSocketInstance.close(); } catch (err) {}
            this.webSocketInstance = null;
        }
    }

    parseIncomingAudioPayload(rawPayloadData) {
        try {
            // Case 1: High-performance binary frame from Dr1mS viz-bridge (Float32Array, 51 values)
            if (rawPayloadData instanceof ArrayBuffer) {
                const f32 = new Float32Array(rawPayloadData);
                if (f32.length >= 51) {
                    // Dr1mS layout:
                    // 0: SEQ, 1: T_FRAME, 2: RMS, 3: PEAK, 4: FLUX, 5: CENTROID, 6: FLATNESS,
                    // 7: ENERGY, 8: KEY_HUE, 9: ONSET_STR, 10: ONSET_ID, 11: KICK, 12: KICK_ID,
                    // 13: SNARE, 14: SNARE_ID, 15: HATS, 16: HATS_ID, 17: STEREO, 18: PITCH,
                    // 19..50: 32 Mel frequency bands
                    for (let i = 0; i < 32; i++) {
                        this.spectralBandsBuffer[i] = f32[19 + i] || 0;
                    }

                    const rms = f32[2] || 0;
                    const flux = f32[4] || 0;
                    const energy = f32[7] || 0.2;
                    const kick = f32[11] || 0;
                    const kickId = Math.round(f32[12]);
                    const snare = f32[13] || 0;
                    const onsetId = Math.round(f32[10]);

                    const isKickOnset = (this._lastKickId >= 0 && kickId !== this._lastKickId);
                    const isGeneralOnset = (this._lastOnsetId >= 0 && onsetId !== this._lastOnsetId);
                    this._lastKickId = kickId;
                    this._lastOnsetId = onsetId;

                    const isBeat = isKickOnset || kick > 0.45;
                    if (isBeat) this.beatCount++;

                    const bassEnergy = Math.max(kick, this.spectralBandsBuffer[0], this.spectralBandsBuffer[1], this.spectralBandsBuffer[2]);
                    const midEnergy = (this.spectralBandsBuffer[8] + this.spectralBandsBuffer[12] + this.spectralBandsBuffer[16]) / 3 || 0.2;
                    const trebleEnergy = (this.spectralBandsBuffer[24] + this.spectralBandsBuffer[28] + this.spectralBandsBuffer[31]) / 3 || 0.1;

                    const nowSec = performance.now() / 1000;
                    const isDrop = energy > 0.65 && isBeat;
                    const isSoft = energy < 0.22 && !isDrop;

                    this.latestAudioFrame = {
                        active: true,
                        subBass: this.spectralBandsBuffer[0] || bassEnergy,
                        bass: bassEnergy,
                        mid: midEnergy,
                        treble: trebleEnergy,
                        energy: energy,
                        rms: rms,
                        isBeat: isBeat,
                        isBar: isBeat && (this.beatCount % 4 === 0),
                        beatImpulse: isBeat ? Math.max(0.85, kick) : (kick * 0.4),
                        snareImpulse: snare,
                        isDrop: isDrop,
                        isSoft: isSoft,
                        softFactor: isSoft ? 1.0 : 0.0,
                        dropFactor: isDrop ? 1.0 : 0.0,
                        bassShake: isBeat ? Math.max(0.5, kick * 0.9) : 0,
                        supernovaTrigger: energy > 0.72 && isBeat,
                        spectralBands: this.spectralBandsBuffer,
                        bpm: 120,
                        beatCount: this.beatCount,
                        beatPhase: (nowSec * 2.0) % 1.0,
                        beatProgress: (nowSec * 2.0) % 1.0,
                        barPhase: (nowSec * 0.5) % 1.0
                    };
                    return;
                }
            }

            // Case 2: JSON payload fallback
            const parsedPacket = typeof rawPayloadData === "string" ? JSON.parse(rawPayloadData) : null;
            if (!parsedPacket) return;

            if (Array.isArray(parsedPacket.bands)) {
                const bandsCount = Math.min(32, parsedPacket.bands.length);
                for (let index = 0; index < bandsCount; index++) {
                    this.spectralBandsBuffer[index] = parsedPacket.bands[index];
                }
            }

            this.latestAudioFrame = {
                active: true,
                subBass: parsedPacket.subBass || parsedPacket.bass || 0.1,
                bass: parsedPacket.bass || 0.1,
                mid: parsedPacket.mid || parsedPacket.mids || 0.1,
                treble: parsedPacket.treble || parsedPacket.highs || 0.1,
                energy: parsedPacket.energy || 0.2,
                rms: parsedPacket.rms || parsedPacket.energy || 0.2,
                isBeat: !!parsedPacket.isBeat,
                isBar: !!parsedPacket.isBar,
                beatImpulse: parsedPacket.beatImpulse || (parsedPacket.isBeat ? 1.0 : 0.0),
                snareImpulse: parsedPacket.snareImpulse || 0.0,
                isDrop: !!parsedPacket.isDrop,
                isSoft: (parsedPacket.energy || 0.2) < 0.25,
                softFactor: (parsedPacket.energy || 0.2) < 0.25 ? 1.0 : 0.0,
                dropFactor: parsedPacket.isDrop ? 1.0 : 0.0,
                bassShake: parsedPacket.bassShake || (parsedPacket.isBeat ? 0.7 : 0.0),
                supernovaTrigger: !!parsedPacket.supernovaTrigger,
                spectralBands: this.spectralBandsBuffer,
                bpm: parsedPacket.bpm || 120,
                beatCount: parsedPacket.beatCount || 0,
                beatPhase: parsedPacket.beatPhase || 0,
                beatProgress: parsedPacket.beatProgress || 0,
                barPhase: parsedPacket.barPhase || 0
            };
        } catch (parsingError) {
            // Silently ignore corrupted frames
        }
    }

    isBridgeActive() {
        return this.isConnected && this.latestAudioFrame !== null;
    }

    getAudioFrame() {
        return this.latestAudioFrame;
    }
}
