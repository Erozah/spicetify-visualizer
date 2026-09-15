export const DEFAULT_BACKGROUND_EFFECTS = {
    stars: true,
    fractals: true,
    nebula: true,
    shockwaves: true,
    grid: false,
    deck: true,
    singularity: true,
    spectrumFloor: false
};

export const CURATED_BACKGROUND_PRESETS = [
    {
        name: "Cosmic Voyage",
        effects: { stars: true, fractals: true, nebula: true, shockwaves: true, grid: false, deck: true, singularity: true, spectrumFloor: false }
    },
    {
        name: "Cyber Grid",
        effects: { stars: true, fractals: false, nebula: true, shockwaves: true, grid: true, deck: false, singularity: false, spectrumFloor: true }
    },
    {
        name: "Sacred Mandalas",
        effects: { stars: true, fractals: true, nebula: false, shockwaves: true, grid: false, deck: false, singularity: false, spectrumFloor: false }
    },
    {
        name: "Full Immersion",
        effects: { stars: true, fractals: true, nebula: true, shockwaves: true, grid: true, deck: true, singularity: true, spectrumFloor: true }
    },
    {
        name: "Minimal Stars",
        effects: { stars: true, fractals: false, nebula: false, shockwaves: true, grid: false, deck: false, singularity: false, spectrumFloor: false }
    }
];

export function loadPersistedBackgroundEffects() {
    try {
        if (typeof localStorage !== "undefined") {
            const savedJson = localStorage.getItem("spicetify-visualizer-effects");
            if (savedJson) {
                return { ...DEFAULT_BACKGROUND_EFFECTS, ...JSON.parse(savedJson) };
            }
        }
    } catch (storageError) {
        console.warn("[BackgroundPresetsRegistry] Failed to load effects settings:", storageError);
    }
    return { ...DEFAULT_BACKGROUND_EFFECTS };
}

export function persistBackgroundEffects(effectsState) {
    try {
        if (typeof localStorage !== "undefined") {
            localStorage.setItem("spicetify-visualizer-effects", JSON.stringify(effectsState));
        }
    } catch (storageError) {
        console.warn("[BackgroundPresetsRegistry] Failed to save effects settings:", storageError);
    }
}

