import { SpotifyAnalysisTrackLoader } from './SpotifyAnalysisTrackLoader.js';

export class SpotifyAnalysisEngine {
    constructor() {
        this.trackLoader = new SpotifyAnalysisTrackLoader();
        this.lastBeatIndex = -1;
        this.lastBarIndex = -1;
        this.lastSectionIndex = -1;

        this.bpm = 120;
        this.sectionEnergy = 0.5;
        this.sectionLoudness = -10;
        this.isDrop = false;
    }

    async load(trackUriOrIdentifier) {
        this.lastBeatIndex = -1;
        this.lastBarIndex = -1;
        this.lastSectionIndex = -1;

        const analysisData = await this.trackLoader.loadTrackAnalysis(trackUriOrIdentifier);
        if (analysisData && analysisData.track && analysisData.track.tempo) {
            this.bpm = analysisData.track.tempo;
        }
    }

    get isLoading() {
        return this.trackLoader.isLoading();
    }

    get data() {
        return this.trackLoader.getAnalysisData();
    }

    getRhythmString() {
        const data = this.data;
        if (!data) return null;
        return data.rhythmstring || (data.track && data.track.rhythmstring) || null;
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

    query(playbackPositionSeconds) {
        const analysisData = this.data;
        if (!analysisData || !analysisData.beats || analysisData.beats.length === 0) {
            return null;
        }

        const sanitizedSeconds = Math.max(0, playbackPositionSeconds);

        const { item: currentBeat, index: currentBeatIndex } = this.binarySearchIndex(analysisData.beats, sanitizedSeconds);
        let beatPhase = 0;
        let beatImpulse = 0;
        let isBeat = false;

        if (currentBeat) {
            const beatDuration = Math.max(0.1, currentBeat.duration || 0.5);
            beatPhase = Math.max(0, Math.min(1, (sanitizedSeconds - currentBeat.start) / beatDuration));
            isBeat = (currentBeatIndex !== this.lastBeatIndex && currentBeatIndex >= 0);
            if (isBeat) {
                this.lastBeatIndex = currentBeatIndex;
            }
            beatImpulse = Math.max(0, 1.0 - Math.pow(beatPhase, 0.45) * 1.6);
        }

        const { item: currentBar, index: currentBarIndex } = this.binarySearchIndex(analysisData.bars, sanitizedSeconds);
        let barPhase = 0;
        let isBar = false;

        if (currentBar) {
            const barDuration = Math.max(0.4, currentBar.duration || 2.0);
            barPhase = Math.max(0, Math.min(1, (sanitizedSeconds - currentBar.start) / barDuration));
            isBar = (currentBarIndex !== this.lastBarIndex && currentBarIndex >= 0);
            if (isBar) {
                this.lastBarIndex = currentBarIndex;
            }
        }

        const { item: currentSection, index: currentSectionIndex } = this.binarySearchIndex(analysisData.sections, sanitizedSeconds);
        if (currentSection) {
            if (currentSectionIndex !== this.lastSectionIndex) {
                this.lastSectionIndex = currentSectionIndex;
                if (currentSection.tempo) {
                    this.bpm = currentSection.tempo;
                }
            }
            this.sectionLoudness = currentSection.loudness || -10;
            this.sectionEnergy = Math.max(0.1, Math.min(1.0, (this.sectionLoudness + 28) / 25));
            this.isDrop = this.sectionEnergy > 0.72 || (this.sectionLoudness > -6.5);
        }

        const { item: currentSegment } = this.binarySearchIndex(analysisData.segments, sanitizedSeconds);
        let bassEnergy = 0.2;
        let midEnergy = 0.2;
        let trebleEnergy = 0.2;
        let snareImpulse = 0.0;
        let segmentLoudness = this.sectionEnergy;

        if (currentSegment) {
            const segmentDuration = Math.max(0.05, currentSegment.duration || 0.25);
            const segmentPhase = Math.max(0, Math.min(1, (sanitizedSeconds - currentSegment.start) / segmentDuration));
            const loudnessStart = currentSegment.loudness_start || -20;
            const loudnessMax = currentSegment.loudness_max || -8;
            const maxTimeNormalized = (currentSegment.loudness_max_time || 0.05) / segmentDuration;

            let currentDecibels = loudnessStart;
            if (segmentPhase <= maxTimeNormalized && maxTimeNormalized > 0) {
                currentDecibels = loudnessStart + (loudnessMax - loudnessStart) * (segmentPhase / maxTimeNormalized);
            } else if (maxTimeNormalized < 1) {
                currentDecibels = loudnessMax + (loudnessStart - loudnessMax) * ((segmentPhase - maxTimeNormalized) / (1 - maxTimeNormalized));
            }
            segmentLoudness = Math.max(0.1, Math.min(1.0, (currentDecibels + 32) / 28));

            if (currentSegment.pitches && currentSegment.pitches.length === 12) {
                const pitchValues = currentSegment.pitches;
                const lowPitchAverage = (pitchValues[0] + pitchValues[1] + pitchValues[2] + pitchValues[3]) / 4;
                const midPitchAverage = (pitchValues[4] + pitchValues[5] + pitchValues[6] + pitchValues[7] + pitchValues[8]) / 5;
                const highPitchAverage = (pitchValues[9] + pitchValues[10] + pitchValues[11]) / 3;

                const timbreBrightness = currentSegment.timbre ? Math.max(0, Math.min(1, (currentSegment.timbre[1] + 80) / 160)) : 0.5;

                bassEnergy = Math.min(1.0, lowPitchAverage * 0.45 + beatImpulse * 0.55 + (this.isDrop ? 0.2 : 0));
                midEnergy = Math.min(1.0, midPitchAverage * 0.55 + segmentLoudness * 0.45);
                trebleEnergy = Math.min(1.0, highPitchAverage * 0.5 + timbreBrightness * 0.4 + beatImpulse * 0.2);

                if (isBeat && (currentBeatIndex % 2 === 1) && (timbreBrightness > 0.45 || highPitchAverage > 0.55)) {
                    snareImpulse = Math.min(1.0, (highPitchAverage + timbreBrightness) * 0.85);
                }
            }
        }

        return {
            isBeat,
            isBar,
            is4BeatPulse: isBeat && (currentBeatIndex % 4 === 0),
            beatPhase,
            beatProgress: beatPhase,
            beatImpulse,
            barPhase,
            beatCount: currentBeatIndex,
            barCount: currentBarIndex,
            bpm: this.bpm,
            isDrop: this.isDrop,
            sectionEnergy: this.sectionEnergy,
            bass: bassEnergy,
            mid: midEnergy,
            mids: midEnergy,
            treble: trebleEnergy,
            highs: trebleEnergy,
            energy: Math.min(1.0, (bassEnergy * 0.45 + midEnergy * 0.3 + trebleEnergy * 0.25) * (0.7 + segmentLoudness * 0.3)),
            snareImpulse
        };
    }
}

var SpotifyAnalysis = SpotifyAnalysisEngine;
