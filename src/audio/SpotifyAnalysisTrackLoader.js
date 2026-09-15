export class SpotifyAnalysisTrackLoader {
    constructor() {
        this.trackId = null;
        this.analysisData = null;
        this.isLoading = false;
        this.beatCursor = 0;
        this.barCursor = 0;
        this.sectionCursor = 0;
        this.lastBeatIndex = -1;
        this.lastBarIndex = -1;
        this.bpm = 120;
    }

    async load(trackUriOrId) {
        if (!trackUriOrId) return;
        let cleanTrackId = trackUriOrId;
        if (typeof Spicetify !== "undefined" && Spicetify.URI) {
            try {
                const parsedUri = Spicetify.URI.fromString(trackUriOrId);
                if (parsedUri && parsedUri.id) cleanTrackId = parsedUri.id;
            } catch (e) {}
        }
        cleanTrackId = cleanTrackId.replace("spotify:track:", "").split("?")[0].trim();
        if (!cleanTrackId || this.trackId === cleanTrackId) return;

        this.trackId = cleanTrackId;
        this.isLoading = true;
        this.analysisData = null;
        this.lastBeatIndex = -1;
        this.lastBarIndex = -1;

        try {
            if (typeof Spicetify !== "undefined" && Spicetify.CosmosAsync) {
                const endpointUrl = `https://spclient.wg.spotify.com/audio-attributes/v1/audio-analysis/${cleanTrackId}?format=json`;
                this.analysisData = await Spicetify.CosmosAsync.get(endpointUrl);
            }
        } catch (cosmosError) {
            try {
                const accessToken = (typeof Spicetify !== "undefined" && Spicetify.getAccessToken)
                    ? await Spicetify.getAccessToken()
                    : "";
                const response = await fetch(`https://api.spotify.com/v1/audio-analysis/${cleanTrackId}`, {
                    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
                });
                if (response.ok) this.analysisData = await response.json();
            } catch (fallbackError) {
                console.warn("[SpotifyAnalysisTrackLoader] Analysis fetch failed:", fallbackError);
            }
        } finally {
            this.isLoading = false;
        }
    }

    getRhythmString() {
        return this.analysisData && this.analysisData.track ? this.analysisData.track.rhythmstring : null;
    }

    binarySearchIndex(itemsArray, playbackPositionSeconds) {
        if (!itemsArray || itemsArray.length === 0) return { item: null, index: -1 };

        let lowIndex = 0;
        let highIndex = itemsArray.length - 1;
        let matchedIndex = -1;

        while (lowIndex <= highIndex) {
            const middleIndex = Math.floor((lowIndex + highIndex) / 2);
            const currentItem = itemsArray[middleIndex];

            if (currentItem.start <= playbackPositionSeconds) {
                matchedIndex = middleIndex;
                lowIndex = middleIndex + 1;
            } else {
                highIndex = middleIndex - 1;
            }
        }

        if (matchedIndex >= 0) {
            return { item: itemsArray[matchedIndex], index: matchedIndex };
        }

        return { item: itemsArray[0], index: 0 };
    }

    query(trackPositionSeconds) {
        if (!this.analysisData || !this.analysisData.beats || this.analysisData.beats.length === 0) return null;
        const currentSeconds = Math.max(0, trackPositionSeconds);

        const { item: beat, index: beatIndex } = this.binarySearchIndex(this.analysisData.beats, currentSeconds);
        let beatPhase = 0;
        let beatImpulse = 0;
        let isBeat = false;
        if (beat) {
            const beatDuration = Math.max(0.1, beat.duration || 0.5);
            beatPhase = Math.max(0, Math.min(1, (currentSeconds - beat.start) / beatDuration));
            isBeat = (beatIndex !== this.lastBeatIndex && beatIndex >= 0);
            if (isBeat) this.lastBeatIndex = beatIndex;
            beatImpulse = Math.max(0, 1.0 - Math.pow(beatPhase, 0.45) * 1.6);
        }

        const { item: bar, index: barIndex } = this.binarySearchIndex(this.analysisData.bars, currentSeconds);
        let barPhase = 0;
        let isBar = false;
        if (bar) {
            const barDuration = Math.max(0.4, bar.duration || 2.0);
            barPhase = Math.max(0, Math.min(1, (currentSeconds - bar.start) / barDuration));
            isBar = (barIndex !== this.lastBarIndex && barIndex >= 0);
            if (isBar) this.lastBarIndex = barIndex;
        }

        const { item: section } = this.binarySearchIndex(this.analysisData.sections, currentSeconds);
        if (section && section.tempo) this.bpm = section.tempo;
        const loudness = section ? (section.loudness || -10) : -10;
        const sectionEnergy = Math.max(0.1, Math.min(1.0, (loudness + 28) / 25));
        const isDrop = sectionEnergy > 0.72 && isBeat;

        return {
            bpm: this.bpm,
            beatProgress: beatPhase,
            beatPhase,
            isBeat,
            isBar,
            beatCount: beatIndex,
            barCount: barIndex,
            barPhase,
            isDrop,
            sectionEnergy,
            snareImpulse: isBar ? 0.9 : 0.2,
            beatImpulse,
            bass: 0.3 + beatImpulse * 0.7,
            mid: 0.3 + sectionEnergy * 0.4,
            treble: 0.3 + beatImpulse * 0.3,
            energy: sectionEnergy
        };
    }
}

export const SpotifyAnalysis = SpotifyAnalysisTrackLoader;
