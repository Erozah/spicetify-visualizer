import { DynamicAlbumColorExtractor } from './DynamicAlbumColorExtractor.js';
import { VisualizerPalettes } from './VisualizerPalettesData.js';
import { decorateVisualizerPalette } from './PaletteColorHelpers.js';

// src/theme/PaletteManager.js - State manager for visualizer color themes

export class PaletteManager {
    constructor() {
        this.availablePaletteKeys = Object.keys(VisualizerPalettes);
        this.activePaletteIndex = 0;
        this.activeDecoratedPalette = decorateVisualizerPalette(
            VisualizerPalettes[this.availablePaletteKeys[0]]
        );
        this.albumColorExtractor = new DynamicAlbumColorExtractor(this);
    }

    setPalette(paletteIdentifier, shouldApplyImmediately = true) {
        if (!VisualizerPalettes[paletteIdentifier]) {
            return;
        }
        this.activePaletteIndex = this.availablePaletteKeys.indexOf(paletteIdentifier);
        this.activeDecoratedPalette = decorateVisualizerPalette(
            VisualizerPalettes[paletteIdentifier]
        );
    }

    nextPalette() {
        this.activePaletteIndex = (this.activePaletteIndex + 1) % this.availablePaletteKeys.length;
        const nextPaletteIdentifier = this.availablePaletteKeys[this.activePaletteIndex];
        this.setPalette(nextPaletteIdentifier, true);
        return this.activeDecoratedPalette;
    }

    getPaletteById(paletteIdentifier) {
        if (!VisualizerPalettes[paletteIdentifier]) {
            return null;
        }
        return decorateVisualizerPalette(VisualizerPalettes[paletteIdentifier]);
    }

    getActivePaletteName() {
        if (!this.activeDecoratedPalette) {
            return "Default";
        }
        return this.activeDecoratedPalette.name;
    }

    get active() {
        return this.activeDecoratedPalette;
    }

    get current() {
        return this.activeDecoratedPalette;
    }

    get paletteKeys() {
        return this.availablePaletteKeys;
    }
}
