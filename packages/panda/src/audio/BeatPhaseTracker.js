// src/audio/BeatPhaseTracker.js - Estimation of tempo (BPM) and bar/beat phase progression

export class BeatPhaseTracker {
    constructor() {
        this.tempoBeatsPerMinute = 120;
        this.beatCount = 0;
        this.barCount = 0;
        this.beatPhase = 0.0;
        this.barPhase = 0.0;
        this.lastBeatTimestamp = 0;
    }

    estimateTrackTempoFromMetadata(trackUri = "", trackName = "", artistName = "") {
        const fullText = `${trackName} ${artistName}`.toLowerCase();

        if (fullText.match(/\b(lofi|lo-fi|chill|chillhop|ambient|relax|sleep|peaceful|meditation|slow|ballad|acoustic|piano|night|calm|quiet|sad)\b/)) {
            return 74;
        }
        if (fullText.match(/\b(dnb|drum and bass|drum & bass|hardstyle|speedcore|nightcore|gabber|jungle)\b/)) {
            return 172;
        }
        if (fullText.match(/\b(house|techno|trance|edm|club|dance|disco|future bounce|slap house|bounce)\b/)) {
            return 126;
        }
        if (fullText.match(/\b(trap|drill|phonk|hip hop|hip-hop|rap|r&b|soul|funk)\b/)) {
            return 92;
        }
        if (fullText.match(/\b(rock|metal|punk|indie|alternative|pop)\b/)) {
            return 118;
        }

        const characters = (trackUri + trackName).split("");
        const characterCodeSum = characters.reduce((accumulator, character) => accumulator + character.charCodeAt(0), 0);
        const plausibleTempos = [76, 82, 88, 95, 105, 112, 118, 122, 126, 128, 134, 140];
        return plausibleTempos[characterCodeSum % plausibleTempos.length];
    }

    updatePhaseProgression(currentPlaybackSeconds, tempoBpm) {
        this.tempoBeatsPerMinute = tempoBpm || this.tempoBeatsPerMinute || 120;
        const secondsPerBeat = 60.0 / this.tempoBeatsPerMinute;
        const normalizedSeconds = Math.max(0, currentPlaybackSeconds);

        const currentTotalBeats = normalizedSeconds / secondsPerBeat;
        const currentBeatIndex = Math.floor(currentTotalBeats);
        const currentBeatFraction = currentTotalBeats - currentBeatIndex;

        const isNewBeatOnset = currentBeatIndex !== this.beatCount;
        this.beatCount = currentBeatIndex;
        this.beatPhase = Math.max(0, Math.min(1.0, currentBeatFraction));

        const beatInMeasure = this.beatCount % 4;
        this.barPhase = (beatInMeasure + this.beatPhase) / 4.0;
        this.barCount = Math.floor(this.beatCount / 4);

        return {
            isBeatOnset: isNewBeatOnset,
            beatPhase: this.beatPhase,
            barPhase: this.barPhase,
            beatCount: this.beatCount,
            barCount: this.barCount,
            beatInMeasure: beatInMeasure
        };
    }
}

// Backward-compatible function alias
export function estimateTrackTempo(trackUri = "", trackName = "", artistName = "") {
    const tracker = new BeatPhaseTracker();
    return tracker.estimateTrackTempoFromMetadata(trackUri, trackName, artistName);
}
