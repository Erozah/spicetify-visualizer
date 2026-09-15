// src/audio/SpotifyAnalysisTrackLoader.js - Remote and local audio analysis loader for Spotify tracks
// SOLID Architecture: Dedicated track audio analysis fetcher and data parser

export class SpotifyAnalysisTrackLoader {
    constructor() {
        this.currentTrackIdentifier = null;
        this.parsedAnalysisData = null;
        this.isAnalysisLoading = false;
    }

    async loadTrackAnalysis(trackUriOrIdentifier) {
        if (!trackUriOrIdentifier) return null;
        const sanitizedTrackIdentifier = trackUriOrIdentifier.replace("spotify:track:", "").trim();
        if (!sanitizedTrackIdentifier) return null;

        if (this.currentTrackIdentifier === sanitizedTrackIdentifier && this.parsedAnalysisData) {
            return this.parsedAnalysisData;
        }

        this.currentTrackIdentifier = sanitizedTrackIdentifier;
        this.isAnalysisLoading = true;
        this.parsedAnalysisData = null;

        try {
            // 1. Direct fetch with platform access token
            let platformAccessToken = "";
            if (typeof Spicetify !== "undefined") {
                if (typeof Spicetify.getAccessToken === "function") {
                    try { platformAccessToken = await Spicetify.getAccessToken(); } catch (error) {}
                }
                if (!platformAccessToken && Spicetify.Platform && Spicetify.Platform.AuthorizationAPI) {
                    try { platformAccessToken = await Spicetify.Platform.AuthorizationAPI.getAccessToken(); } catch (error) {}
                }
            }

            if (platformAccessToken) {
                try {
                    const response = await fetch(`https://api.spotify.com/v1/audio-analysis/${sanitizedTrackIdentifier}`, {
                        headers: { Authorization: `Bearer ${platformAccessToken}` }
                    });
                    if (response.ok) {
                        const analysisJson = await response.json();
                        if (analysisJson && (analysisJson.beats || analysisJson.track || analysisJson.sections)) {
                            this.parsedAnalysisData = analysisJson;
                            this.isAnalysisLoading = false;
                            return this.parsedAnalysisData;
                        }
                    }
                } catch (tokenFetchError) {}
            }

            // 2. Spicetify CosmosAsync standard endpoint fallback
            if (typeof Spicetify !== "undefined" && Spicetify.CosmosAsync) {
                try {
                    const cosmosResponse = await Spicetify.CosmosAsync.get(`https://api.spotify.com/v1/audio-analysis/${sanitizedTrackIdentifier}`);
                    if (cosmosResponse && (cosmosResponse.beats || cosmosResponse.track || cosmosResponse.sections)) {
                        this.parsedAnalysisData = cosmosResponse;
                        this.isAnalysisLoading = false;
                        return this.parsedAnalysisData;
                    }
                } catch (cosmosError) {
                    try {
                        const pathwayResponse = await Spicetify.CosmosAsync.get(`https://api-partner.spotify.com/pathway/v1/web-player/analysis/${sanitizedTrackIdentifier}`);
                        if (pathwayResponse && (pathwayResponse.beats || pathwayResponse.track || pathwayResponse.sections)) {
                            this.parsedAnalysisData = pathwayResponse;
                            this.isAnalysisLoading = false;
                            return this.parsedAnalysisData;
                        }
                    } catch (pathwayError) {}
                }
            }
        } catch (generalError) {
            console.warn("[SpotifyAnalysisTrackLoader] Audio analysis fetch unavailable, fallback active:", generalError);
        } finally {
            this.isAnalysisLoading = false;
        }

        return this.parsedAnalysisData;
    }

    getAnalysisData() {
        return this.parsedAnalysisData;
    }

    isLoading() {
        return this.isAnalysisLoading;
    }
}
