import { TailKinematicsPhysics } from './TailKinematicsPhysics.js';
import { TailRingFurRenderer } from './TailRingFurRenderer.js';

// src/models/redpanda/tail/RedPandaTail.js - Façade orchestrator for tail kinematics & fur rendering
// SOLID Architecture: Coordinates TailKinematicsPhysics and TailRingFurRenderer

export class RedPandaTail {
    constructor(segmentCount = 18) {
        this.segmentCount = segmentCount;
        this.physics = new TailKinematicsPhysics(segmentCount);
        this.renderer = new TailRingFurRenderer(8);
    }

    get points() {
        return this.physics.points;
    }

    get initialized() {
        return this.physics.initialized;
    }

    update(rootAnchor, scale, audio, deltaTime, time, deckY, isPlaying = true) {
        this.physics.update(rootAnchor, scale, audio, deltaTime, time, deckY, isPlaying);
    }

    render(ctx, palette, audio, scale, deckY) {
        if (!this.physics.initialized || this.physics.points.length < 2) return;
        this.renderer.render(ctx, this.physics.points, this.segmentCount, palette, audio, scale);
    }
}
