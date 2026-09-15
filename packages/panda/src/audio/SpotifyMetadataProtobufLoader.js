export class SpotifyMetadataProtobufLoader {
    constructor() {
        this.activeTrackUri = "";
        this.threebandWaveforms = null;
        this.vocalActivity = [];
        this.audioAttributes = null;
        this.isVocalActive = false;
    }

    clear() {
        this.activeTrackUri = "";
        this.threebandWaveforms = null;
        this.vocalActivity = [];
        this.audioAttributes = null;
        this.isVocalActive = false;
    }

    async loadMetadataForTrack(trackUri) {
        if (!trackUri || trackUri === this.activeTrackUri) return;
        this.clear();
        this.activeTrackUri = trackUri;

        if (typeof Spicetify === "undefined") return;

        try {
            if (Spicetify.Platform && Spicetify.Platform.MetadataService) {
                const metadataService = Spicetify.Platform.MetadataService;

                try {
                    const waveformsResponse = await metadataService.fetch(
                        "THREEBAND_WAVEFORMS",
                        trackUri
                    );
                    if (waveformsResponse && waveformsResponse.value) {
                        this.threebandWaveforms = waveformsResponse.value;
                    }
                } catch (waveformsError) {}

                try {
                    const vocalResponse = await metadataService.fetch(
                        "VOCAL_ACTIVITY",
                        trackUri
                    );
                    if (vocalResponse && vocalResponse.value && Array.isArray(vocalResponse.value.segments)) {
                        this.vocalActivity = vocalResponse.value.segments;
                    }
                } catch (vocalError) {}
            }
        } catch (serviceError) {
            console.warn("[SpotifyMetadataProtobufLoader] MetadataService query failed:", serviceError);
        }
    }

    queryVocalActivity(playbackPositionSeconds) {
        if (!this.vocalActivity || this.vocalActivity.length === 0) {
            this.isVocalActive = false;
            return false;
        }

        const segments = this.vocalActivity;
        for (let index = 0; index < segments.length; index++) {
            const segment = segments[index];
            const startTime = (segment.startTimeMs || 0) / 1000;
            const endTime = (segment.endTimeMs || 0) / 1000;
            if (playbackPositionSeconds >= startTime && playbackPositionSeconds <= endTime) {
                const confidence = segment.confidence !== undefined ? segment.confidence : 1.0;
                this.isVocalActive = confidence > 0.4;
                return this.isVocalActive;
            }
        }
        this.isVocalActive = false;
        return false;
    }

    sampleThreebandWaveforms(progressRatio) {
        if (!this.threebandWaveforms) return null;
        const waveforms = this.threebandWaveforms;
        const lowBand = waveforms.low || waveforms.bass;
        const midBand = waveforms.mid;
        const highBand = waveforms.high || waveforms.treble;

        if (!lowBand || !lowBand.length) return null;

        const clampedRatio = Math.max(0, Math.min(1, progressRatio));
        const index = Math.floor(clampedRatio * (lowBand.length - 1));

        return {
            low: (lowBand[index] || 0) / 255,
            mid: midBand && midBand[index] ? midBand[index] / 255 : 0,
            high: highBand && highBand[index] ? highBand[index] / 255 : 0
        };
    }
}
