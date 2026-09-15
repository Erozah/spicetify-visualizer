import { buildTailClosedPath } from './TailCatmullRomBuilder.js';
import { renderTailCompositeLayers } from './TailRenderer.js';
import { updateTailKinematicsPhysics } from './TailKinematicsPhysics.js';
import { updateTailSparksEmitter } from './TailSparksEmitter.js';

// src/models/cosmic/tail/TailPhysicsFacade.js - Tail physics orchestrator facade

/**
 * Orchestrator facade for feline tail kinematics, spine deformation, spark particles, and rendering.
 */
export class TailPhysicsFacade {
    /**
     * @param {number} segmentCount
     */
    constructor(segmentCount = 20) {
        this.segmentCount = segmentCount;
        this.nodes = [];
        this.leftPoints = [];
        this.rightPoints = [];

        for (let index = 0; index < this.segmentCount; index++) {
            this.nodes.push({ x: 0, y: 0, thickness: 1.0 });
            this.leftPoints.push({ x: 0, y: 0 });
            this.rightPoints.push({ x: 0, y: 0 });
        }

        this.swayPhase = 0;
        this.tipTwitch = 0;
        this.deckTapImpulse = 0;
        this.initialized = false;
        this.sparkTrail = [];
    }

    /**
     * Updates tail kinematics and sparks emitter state.
     * @param {Array<number>} anchorPointCoordinates
     * @param {number} baseRenderScale
     * @param {Object} audioFeatureState
     * @param {number} deltaTimeSeconds
     * @param {number} animationTimeSeconds
     * @param {number} deckHorizonCoordinateY
     * @param {boolean} isMusicPlaying
     */
    update(
        anchorPointCoordinates,
        baseRenderScale,
        audioFeatureState,
        deltaTimeSeconds,
        animationTimeSeconds,
        deckHorizonCoordinateY,
        isMusicPlaying = true
    ) {
        updateTailKinematicsPhysics(
            this,
            anchorPointCoordinates,
            baseRenderScale,
            audioFeatureState,
            deltaTimeSeconds,
            animationTimeSeconds,
            deckHorizonCoordinateY,
            isMusicPlaying
        );

        const tipNode = this.nodes[this.segmentCount - 1];
        updateTailSparksEmitter(
            this.sparkTrail,
            tipNode,
            baseRenderScale,
            audioFeatureState,
            deltaTimeSeconds,
            isMusicPlaying
        );
    }

    /**
     * Constructs a closed Catmull-Rom spline path of the tail.
     * @param {CanvasRenderingContext2D} canvasRenderingContext
     * @param {number} baseRenderScale
     */
    buildTailPath(canvasRenderingContext, baseRenderScale) {
        buildTailClosedPath(
            canvasRenderingContext,
            this.nodes,
            this.leftPoints,
            this.rightPoints,
            this.segmentCount,
            baseRenderScale
        );
    }

    /**
     * Renders all visual layers of the tail onto the canvas context.
     * @param {CanvasRenderingContext2D} canvasRenderingContext
     * @param {Object} visualizerPalette
     * @param {Object} audioFeatureState
     * @param {number} baseRenderScale
     * @param {number} deckHorizonCoordinateY
     */
    render(
        canvasRenderingContext,
        visualizerPalette,
        audioFeatureState,
        baseRenderScale,
        deckHorizonCoordinateY
    ) {
        renderTailCompositeLayers(
            canvasRenderingContext,
            this,
            visualizerPalette,
            audioFeatureState,
            baseRenderScale,
            deckHorizonCoordinateY
        );
    }
}

// Backward-compatible alias
export const TailPhysics = TailPhysicsFacade;
