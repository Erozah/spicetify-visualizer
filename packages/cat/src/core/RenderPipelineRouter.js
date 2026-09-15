export class RenderPipelineRouter {
    static renderVisualizerFrame(visualizerEngine, deltaTimeSeconds, isStatic = false) {
        const canvasRenderingContext = visualizerEngine.ctx;
        const visualizerPalette = visualizerEngine.paletteManager.active;

        if (!isStatic) {
            visualizerEngine.audio.update(deltaTimeSeconds);
            visualizerEngine.env.update(
                deltaTimeSeconds,
                visualizerEngine.liveTime,
                visualizerEngine.audio,
                visualizerEngine.width,
                visualizerEngine.height,
                visualizerEngine.catCenterX,
                visualizerEngine.catCenterY
            );

            if (visualizerEngine.env.effects && visualizerEngine.env.effects.fractals) {
                visualizerEngine.cosmicFractals.update(
                    deltaTimeSeconds,
                    visualizerEngine.liveTime,
                    visualizerEngine.audio,
                    visualizerEngine.audio.isPlaying
                );
            }
        }

        canvasRenderingContext.save();
        canvasRenderingContext.setTransform(
            visualizerEngine.dpr, 0, 0,
            visualizerEngine.dpr, 0, 0
        );

        visualizerEngine.env.render(
            canvasRenderingContext,
            visualizerEngine.width,
            visualizerEngine.height,
            visualizerEngine.liveTime,
            visualizerEngine.audio,
            visualizerPalette,
            visualizerEngine.catCenterX,
            visualizerEngine.catCenterY,
            visualizerEngine.cosmicFractals
        );

        if (visualizerEngine.env.effects && visualizerEngine.env.effects.deck) {
            const deckHorizonCoordinateY = visualizerEngine.height * 0.86;
            visualizerEngine.woodenDeck.render(
                canvasRenderingContext,
                visualizerEngine.width,
                visualizerEngine.height,
                deckHorizonCoordinateY,
                visualizerPalette,
                visualizerEngine.audio,
                visualizerEngine.catCenterX
            );
        }

        const activeModel = visualizerEngine.models[visualizerEngine.activeCat] || visualizerEngine.models.cyber;
        const catRenderScale = Math.min(1.20, Math.max(0.65, Math.min(visualizerEngine.width / 950, visualizerEngine.height / 700)));

        if (!isStatic && activeModel.update) {
            activeModel.update(
                deltaTimeSeconds,
                visualizerEngine.liveTime,
                visualizerEngine.audio,
                visualizerEngine.catCenterX,
                visualizerEngine.catCenterY,
                visualizerEngine.width,
                visualizerEngine.height,
                visualizerEngine.audio.isPlaying
            );
        } else if (isStatic && activeModel.update && !activeModel.lastDeformedParams && !activeModel.lastDeformedParameters) {
            activeModel.update(
                0.016,
                visualizerEngine.liveTime,
                visualizerEngine.audio,
                visualizerEngine.catCenterX,
                visualizerEngine.catCenterY,
                visualizerEngine.width,
                visualizerEngine.height,
                false
            );
        }

        activeModel.render(
            canvasRenderingContext,
            visualizerEngine.catCenterX,
            visualizerEngine.catCenterY,
            catRenderScale,
            visualizerEngine.liveTime,
            visualizerEngine.audio,
            visualizerPalette,
            visualizerEngine.env.effects,
            visualizerEngine.width,
            visualizerEngine.height
        );

        canvasRenderingContext.restore();
    }
}

export const renderVisualizerFrame = (engine, dt, isStatic) => RenderPipelineRouter.renderVisualizerFrame(engine, dt, isStatic);
