import { initializeDeckPlankProfiles, renderDeckWoodPlanks } from './DeckWoodPlanks.js';
import { renderDeckHorizonLighting } from './DeckHorizonLighting.js';

// src/backgrounds/deck/WoodenDeckPlatform.js - Grounded wooden deck orchestrator facade

/**
 * Environmental platform facade coordinating plank geometry, wood grain textures,
 * horizon rim lighting, contact shadow, and ambient light bounce.
 */
export class WoodenDeckPlatform {
    constructor() {
        this.deckPlankProfiles = initializeDeckPlankProfiles(4);
    }

    /**
     * Renders the complete wooden deck platform onto the canvas.
     * @param {CanvasRenderingContext2D} canvasRenderingContext
     * @param {number} canvasViewportWidth
     * @param {number} canvasViewportHeight
     * @param {number} deckHorizonCoordinateY
     * @param {Object} paletteTheme
     * @param {Object} audioStateReference
     * @param {number|null} [felineCenterCoordinateX=null]
     */
    render(
        canvasRenderingContext,
        canvasViewportWidth,
        canvasViewportHeight,
        deckHorizonCoordinateY,
        paletteTheme,
        audioStateReference,
        felineCenterCoordinateX = null
    ) {
        if (deckHorizonCoordinateY >= canvasViewportHeight) return;

        const centerHorizontalCoordinateX = felineCenterCoordinateX !== null
            ? felineCenterCoordinateX
            : canvasViewportWidth * 0.50;

        canvasRenderingContext.save();

        // Pass 1: Draw wooden planks, seams, grain and fastener nails
        renderDeckWoodPlanks(
            canvasRenderingContext,
            canvasViewportWidth,
            canvasViewportHeight,
            deckHorizonCoordinateY,
            this.deckPlankProfiles
        );

        // Pass 2: Draw horizon laser rim, polished floor reflections & feline contact shadow
        renderDeckHorizonLighting(
            canvasRenderingContext,
            canvasViewportWidth,
            canvasViewportHeight,
            deckHorizonCoordinateY,
            paletteTheme,
            audioStateReference,
            centerHorizontalCoordinateX
        );

        canvasRenderingContext.restore();
    }

    /**
     * Optional update step for dynamic wood lighting or wetness state.
     */
    update() {
        // Platform maintains static texture with dynamic lighting in render pass
    }
}

// Backward-compatible alias
