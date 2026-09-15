import { VisualizerPalettes } from './VisualizerPalettesData.js';
import { decoratePaletteWithDynamicAlphaHelpers } from './PaletteColorHelpers.js';

// src/theme/PaletteManager.js - State manager for visualizer color themes and transitions

export class PaletteManager {
    constructor() {
        this.availablePaletteIdentifiers = Object.keys(VisualizerPalettes);
        this.currentPaletteIndex = 0;
        const initialPaletteIdentifier = this.availablePaletteIdentifiers[0] || "bamboo";
        this.activePalette = decoratePaletteWithDynamicAlphaHelpers(VisualizerPalettes[initialPaletteIdentifier]);
    }

    setPalette(paletteIdentifier, isImmediateTransition = true) {
        if (!VisualizerPalettes[paletteIdentifier]) return;
        this.currentPaletteIndex = this.availablePaletteIdentifiers.indexOf(paletteIdentifier);
        this.activePalette = decoratePaletteWithDynamicAlphaHelpers(VisualizerPalettes[paletteIdentifier]);
    }

    nextPalette() {
        this.currentPaletteIndex = (this.currentPaletteIndex + 1) % this.availablePaletteIdentifiers.length;
        const nextPaletteIdentifier = this.availablePaletteIdentifiers[this.currentPaletteIndex];
        this.setPalette(nextPaletteIdentifier, true);
        return this.activePalette;
    }

    get active() {
        return this.activePalette;
    }

    get current() {
        return this.activePalette;
    }
}
