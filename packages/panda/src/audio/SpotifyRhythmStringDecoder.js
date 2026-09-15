export class SpotifyRhythmStringDecoder {
    constructor() {
        this.onsetTimestampsSeconds = [];
        this.channels = [];
        this.lastTriggeredIndex = -1;
        this.hasActiveData = false;
        this.sampleRate = 44100;
        this.stepDuration = 0.01;
    }

    hasRhythmData() {
        return this.hasActiveData && this.onsetTimestampsSeconds.length > 0;
    }

    clear() {
        this.onsetTimestampsSeconds = [];
        this.channels = [];
        this.lastTriggeredIndex = -1;
        this.hasActiveData = false;
    }

    async loadRhythmString(encodedRhythmString) {
        if (!encodedRhythmString || typeof encodedRhythmString !== "string") {
            this.clear();
            return false;
        }

        try {
            const normalizedBase64 = encodedRhythmString.replace(/-/g, "+").replace(/_/g, "/");
            const binaryString = atob(normalizedBase64);
            const byteLength = binaryString.length;
            const compressedBytes = new Uint8Array(byteLength);
            for (let index = 0; index < byteLength; index++) {
                compressedBytes[index] = binaryString.charCodeAt(index);
            }

            let decompressedText = null;

            if (typeof DecompressionStream !== "undefined") {
                try {
                    const stream = new Response(compressedBytes).body.pipeThrough(new DecompressionStream("deflate"));
                    decompressedText = await new Response(stream).text();
                } catch (streamError) {
                    try {
                        const rawStream = new Response(compressedBytes).body.pipeThrough(new DecompressionStream("deflate-raw"));
                        decompressedText = await new Response(rawStream).text();
                    } catch (rawStreamError) {}
                }
            }

            if (!decompressedText) {
                return this.parseLegacyDeltaFallback(binaryString);
            }

            const tokens = decompressedText.trim().split(/\s+/).map((token) => parseInt(token, 10));
            if (tokens.length < 3 || isNaN(tokens[0])) {
                return this.parseLegacyDeltaFallback(binaryString);
            }

            this.sampleRate = tokens.shift();
            const stepSize = tokens.shift();
            this.stepDuration = stepSize / this.sampleRate;

            const channelCount = tokens.shift();
            const parsedChannels = [];
            const allOnsets = [];

            for (let channelIndex = 0; channelIndex < channelCount; channelIndex++) {
                const channel = [];
                const entryCount = tokens.shift();
                if (tokens.length < entryCount) break;

                let cumulativeSeconds = 0;
                for (let entryIndex = 0; entryIndex < entryCount; entryIndex++) {
                    const deltaUnits = tokens.shift();
                    cumulativeSeconds += deltaUnits * this.stepDuration;
                    channel.push(cumulativeSeconds);
                    allOnsets.push(cumulativeSeconds);
                }
                parsedChannels.push(channel);
            }

            allOnsets.sort((timeA, timeB) => timeA - timeB);
            this.channels = parsedChannels;
            this.onsetTimestampsSeconds = allOnsets;
            this.hasActiveData = allOnsets.length > 0;
            return this.hasActiveData;
        } catch (decodingError) {
            console.warn("[SpotifyRhythmStringDecoder] Failed to decode rhythm string:", decodingError);
            this.clear();
            return false;
        }
    }

    parseLegacyDeltaFallback(binaryString) {
        const binaryLength = binaryString.length;
        const decodedOnsets = [];
        let accumulatedMilliseconds = 0;

        for (let byteIndex = 0; byteIndex < binaryLength - 1; byteIndex += 2) {
            const deltaMilliseconds = (binaryString.charCodeAt(byteIndex) << 8) | binaryString.charCodeAt(byteIndex + 1);
            if (deltaMilliseconds > 0 && deltaMilliseconds < 10000) {
                accumulatedMilliseconds += deltaMilliseconds;
                decodedOnsets.push(accumulatedMilliseconds / 1000);
            }
        }

        if (decodedOnsets.length > 0) {
            this.onsetTimestampsSeconds = decodedOnsets;
            this.channels = [decodedOnsets];
            this.hasActiveData = true;
            return true;
        }
        this.clear();
        return false;
    }

    queryRhythmOnset(playbackPositionSeconds, windowToleranceSeconds = 0.045) {
        if (!this.hasRhythmData()) {
            return { isOnsetActive: false, onsetImpulseStrength: 0, timeToNextOnsetSeconds: 0 };
        }

        const timestamps = this.onsetTimestampsSeconds;
        let lowerBound = 0;
        let upperBound = timestamps.length - 1;
        let nearestIndex = 0;

        while (lowerBound <= upperBound) {
            const middleIndex = Math.floor((lowerBound + upperBound) / 2);
            if (timestamps[middleIndex] < playbackPositionSeconds) {
                nearestIndex = middleIndex;
                lowerBound = middleIndex + 1;
            } else {
                upperBound = middleIndex - 1;
            }
        }

        const currentTimestamp = timestamps[nearestIndex];
        const timeDifference = Math.abs(playbackPositionSeconds - currentTimestamp);
        const isOnsetActive = timeDifference <= windowToleranceSeconds && nearestIndex !== this.lastTriggeredIndex;

        if (isOnsetActive) {
            this.lastTriggeredIndex = nearestIndex;
        }

        const onsetImpulseStrength = isOnsetActive ? Math.max(0, 1.0 - (timeDifference / windowToleranceSeconds)) : 0;
        const nextTimestamp = timestamps[nearestIndex + 1] || currentTimestamp + 1.0;
        const timeToNextOnsetSeconds = Math.max(0, nextTimestamp - playbackPositionSeconds);

        return { isOnsetActive, onsetImpulseStrength, timeToNextOnsetSeconds };
    }

    queryChannelOnset(channelIndex, playbackPositionSeconds, windowToleranceSeconds = 0.05) {
        if (!this.hasActiveData || !this.channels[channelIndex] || this.channels[channelIndex].length === 0) {
            return { isOnsetActive: false, onsetImpulseStrength: 0 };
        }

        const timestamps = this.channels[channelIndex];
        let lowerBound = 0;
        let upperBound = timestamps.length - 1;
        let nearestIndex = 0;

        while (lowerBound <= upperBound) {
            const middleIndex = Math.floor((lowerBound + upperBound) / 2);
            if (timestamps[middleIndex] < playbackPositionSeconds) {
                nearestIndex = middleIndex;
                lowerBound = middleIndex + 1;
            } else {
                upperBound = middleIndex - 1;
            }
        }

        const currentTimestamp = timestamps[nearestIndex];
        const timeDifference = Math.abs(playbackPositionSeconds - currentTimestamp);
        const isOnsetActive = timeDifference <= windowToleranceSeconds;
        const onsetImpulseStrength = isOnsetActive ? Math.max(0, 1.0 - (timeDifference / windowToleranceSeconds)) : 0;

        return { isOnsetActive, onsetImpulseStrength };
    }
}
