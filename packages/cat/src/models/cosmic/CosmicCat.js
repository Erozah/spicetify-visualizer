import { CatAnatomyCoordinates } from './CatAnatomyCoordinates.js';
import { TailPhysicsFacade } from './tail/TailPhysicsFacade.js';
import { computeCatDeformation } from './CatDeformationPhysics.js';
import { renderCatContourMultiPass } from './CatContourMultiPass.js';
import { renderCatEarContours } from './CatEarContourRenderer.js';
import { renderCatInteriorStellarSpine } from './CatInteriorStellarSpine.js';
import { traceCatBodyBezierCurve } from './CatBodyBezierCurve.js';

export class CosmicCat {
    constructor() {
        this.anatomy = new CatAnatomyCoordinates();
        this.geometry = this.anatomy;
        this.tail = new TailPhysicsFacade(20);
        this.lastDeformedParameters = null;
        this.lastRenderScale = 1.0;
        this.lastDeckHorizonCoordinateY = 0;
    }

    update(
        deltaTimeSeconds,
        animationTimeSeconds,
        audioFeatureState,
        felineCenterCoordinateX,
        felineCenterCoordinateY,
        viewportWidth,
        viewportHeight,
        isMusicPlaying = true
    ) {
        const currentViewportWidth = viewportWidth || (typeof window !== "undefined" ? window.innerWidth : 800);
        const currentViewportHeight = viewportHeight || (typeof window !== "undefined" ? window.innerHeight : 600);
        const deckHorizonCoordinateY = currentViewportHeight * 0.86;

        const felineWidth = Math.min(270, Math.min(currentViewportWidth * 0.32, currentViewportHeight * 0.44));
        const felineHeight = felineWidth * 1.35;
        const felineScale = felineWidth / 260;

        const deformationParameters = computeCatDeformation(
            felineCenterCoordinateX,
            felineCenterCoordinateY,
            felineWidth,
            felineHeight,
            audioFeatureState,
            animationTimeSeconds,
            deckHorizonCoordinateY,
            isMusicPlaying
        );

        this.tail.update(
            this.anatomy.landmarks.tailAnchor,
            felineScale,
            audioFeatureState,
            deltaTimeSeconds,
            animationTimeSeconds,
            deckHorizonCoordinateY,
            isMusicPlaying
        );

        this.lastDeformedParameters = deformationParameters;
        this.lastRenderScale = felineScale;
        this.lastDeckHorizonCoordinateY = deckHorizonCoordinateY;
    }

    render(
        canvasRenderingContext,
        felineCenterCoordinateX,
        felineCenterCoordinateY,
        renderScale,
        animationTimeSeconds,
        audioFeatureState,
        visualizerPalette,
        visualEffectsState = null,
        viewportWidth = 800,
        viewportHeight = 600
    ) {
        const currentViewportWidth = viewportWidth || (typeof window !== "undefined" ? window.innerWidth : 800);
        const currentViewportHeight = viewportHeight || (typeof window !== "undefined" ? window.innerHeight : 600);
        const deckHorizonCoordinateY = this.lastDeckHorizonCoordinateY || (currentViewportHeight * 0.86);

        const felineWidth = Math.min(270, Math.min(currentViewportWidth * 0.32, currentViewportHeight * 0.44)) * (renderScale || 1.0);
        const felineHeight = felineWidth * 1.35;
        const felineScale = felineWidth / 260;

        const deformationParameters = this.lastDeformedParameters || computeCatDeformation(
            felineCenterCoordinateX,
            felineCenterCoordinateY,
            felineWidth,
            felineHeight,
            audioFeatureState,
            animationTimeSeconds,
            deckHorizonCoordinateY,
            audioFeatureState.isPlaying
        );

        this.tail.render(canvasRenderingContext, visualizerPalette, audioFeatureState, felineScale, deckHorizonCoordinateY);

        traceCatBodyBezierCurve(canvasRenderingContext, deformationParameters, this.anatomy);
        renderCatInteriorStellarSpine(canvasRenderingContext, deformationParameters, this.anatomy.landmarks, visualizerPalette, animationTimeSeconds);
        renderCatEarContours(canvasRenderingContext, deformationParameters, this.anatomy.landmarks, visualizerPalette);

        traceCatBodyBezierCurve(canvasRenderingContext, deformationParameters, this.anatomy);
        renderCatContourMultiPass(canvasRenderingContext, deformationParameters, visualizerPalette);
    }
}
