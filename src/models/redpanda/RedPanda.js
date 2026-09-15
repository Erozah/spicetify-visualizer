import { PandaBodyRenderer } from './PandaBodyRenderer.js';
import { PandaDeformationPhysics } from './PandaDeformationPhysics.js';
import { PandaEarTwitchReflexes } from './PandaEarTwitchReflexes.js';
import { PandaEyesRenderer } from './PandaEyesRenderer.js';
import { PandaHeadMuzzleRenderer } from './PandaHeadMuzzleRenderer.js';
import { PandaPawsRenderer } from './PandaPawsRenderer.js';
import { RedPandaTail } from './tail/RedPandaTail.js';

export class RedPanda {
    constructor() {
        this.tail = new RedPandaTail(18);
        this.physics = new PandaDeformationPhysics();
        this.earReflexes = new PandaEarTwitchReflexes();
        this.eyes = new PandaEyesRenderer();
        this.bodyRenderer = new PandaBodyRenderer();
        this.pawsRenderer = new PandaPawsRenderer();
        this.headRenderer = new PandaHeadMuzzleRenderer();
    }

    get lastParams() {
        return this.physics.lastParameters;
    }

    get lastScale() {
        return this.physics.lastScale;
    }

    get lastDeckY() {
        return this.physics.lastDeckY;
    }

    update(deltaTimeSeconds, animationTimeSeconds, audioState, pandaCenterX, pandaCenterY, viewportWidth, viewportHeight, isPlaying = true) {
        const currentViewportWidth = viewportWidth || window.innerWidth || 800;
        const currentViewportHeight = viewportHeight || window.innerHeight || 600;

        this.eyes.update(deltaTimeSeconds, animationTimeSeconds);
        this.earReflexes.update(deltaTimeSeconds, audioState);

        const { tailAnchor, pandaScale, deckY } = this.physics.computeTransform(
            animationTimeSeconds,
            audioState,
            pandaCenterX,
            pandaCenterY,
            currentViewportWidth,
            currentViewportHeight,
            isPlaying
        );

        this.tail.update(tailAnchor, pandaScale, audioState, deltaTimeSeconds, animationTimeSeconds, deckY, isPlaying);
    }

    render(canvasRenderingContext, pandaCenterX, pandaCenterY, externalScale, animationTimeSeconds, audioState, paletteTheme, visualEffectsState = null, viewportWidth = 800, viewportHeight = 600) {
        const currentViewportHeight = viewportHeight || window.innerHeight || 600;
        const deckY = this.lastDeckY || (currentViewportHeight * 0.86);

        const isDrop = Boolean(audioState && typeof audioState === "object" && audioState.isDrop);
        const softFactor = audioState && typeof audioState === "object" ? (audioState.softFactor || (audioState.isSoft ? 1.0 : 0.0)) : 0.0;
        const dropFactor = audioState && typeof audioState === "object" ? (audioState.dropFactor || (isDrop ? 1.0 : 0.0)) : 0.0;

        const deformationParameters = this.lastParams || {
            cx: pandaCenterX,
            cy: deckY ? deckY - 140 : pandaCenterY,
            baseWidth: 260,
            scale: externalScale || 1.0,
            breath: 0,
            squashY: 0,
            stretchX: 0,
            bounceOffset: 0,
            deckY: deckY
        };

        const pandaScale = deformationParameters.scale * (externalScale || 1.0);
        const centerX = deformationParameters.cx;
        const centerY = deformationParameters.cy;

        this.tail.render(canvasRenderingContext, paletteTheme, audioState, pandaScale, deckY);

        canvasRenderingContext.save();
        canvasRenderingContext.translate(centerX, centerY);

        const scaleX = pandaScale * (1.0 + deformationParameters.breath + deformationParameters.stretchX);
        const scaleY = pandaScale * (1.0 - deformationParameters.breath * 0.5 + deformationParameters.squashY);
        canvasRenderingContext.scale(scaleX, scaleY);

        const swayAngle = Math.sin(animationTimeSeconds * 0.5) * 0.012;
        canvasRenderingContext.rotate(swayAngle);

        this.bodyRenderer.render(canvasRenderingContext, paletteTheme, audioState, softFactor, dropFactor, isDrop);
        this.pawsRenderer.render(canvasRenderingContext, paletteTheme, audioState);
        this.headRenderer.render(canvasRenderingContext, paletteTheme, audioState, animationTimeSeconds, this.eyes, this.earReflexes);

        canvasRenderingContext.restore();
    }
}
