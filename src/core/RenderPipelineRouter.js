export class RenderPipelineRouter {
    static renderVisualizerFrame(visualizerEngine, deltaTimeSeconds, isStatic = false) {
        const canvasRenderingContext = visualizerEngine.ctx;
        const visualizerPalette = visualizerEngine.paletteManager.active;

        if (!visualizerEngine.activeModelId && Object.keys(visualizerEngine.models).length > 0) {
            visualizerEngine.activeModelId = Object.keys(visualizerEngine.models)[0];
        }

        const isPanda = visualizerEngine.activeModelId === 'redpanda';
        const activeEnv = isPanda && visualizerEngine.forestEnv ? visualizerEngine.forestEnv : visualizerEngine.env;

        if (!isStatic) {
            visualizerEngine.audio.update(deltaTimeSeconds);

            if (isPanda && visualizerEngine.forestEnv) {
                visualizerEngine.forestEnv.update(
                    deltaTimeSeconds,
                    visualizerEngine.width,
                    visualizerEngine.height,
                    visualizerEngine.audio,
                    visualizerPalette,
                    visualizerEngine.modelCenterX,
                    visualizerEngine.modelCenterY
                );
            } else {
                visualizerEngine.env.update(
                    deltaTimeSeconds,
                    visualizerEngine.liveTime,
                    visualizerEngine.audio,
                    visualizerEngine.width,
                    visualizerEngine.height,
                    visualizerEngine.modelCenterX,
                    visualizerEngine.modelCenterY
                );
            }

            if (!isPanda && visualizerEngine.env.effects && visualizerEngine.env.effects.fractals) {
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

        try {
            if (isPanda && visualizerEngine.forestEnv) {
                visualizerEngine.forestEnv.render(
                    canvasRenderingContext,
                    visualizerEngine.width,
                    visualizerEngine.height,
                    visualizerEngine.liveTime,
                    visualizerEngine.audio,
                    visualizerPalette,
                    visualizerEngine.modelCenterX,
                    visualizerEngine.modelCenterY
                );
            } else {
                visualizerEngine.env.render(
                    canvasRenderingContext,
                    visualizerEngine.width,
                    visualizerEngine.height,
                    visualizerEngine.liveTime,
                    visualizerEngine.audio,
                    visualizerPalette,
                    visualizerEngine.modelCenterX,
                    visualizerEngine.modelCenterY,
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
                        visualizerEngine.modelCenterX
                    );
                }
            }

            const activeModel = visualizerEngine.models[visualizerEngine.activeModelId];
            if (!activeModel) return;
            const modelRenderScale = Math.min(1.20, Math.max(0.65, Math.min(visualizerEngine.width / 950, visualizerEngine.height / 700)));

            if (!isStatic && activeModel.update) {
                activeModel.update(
                    deltaTimeSeconds,
                    visualizerEngine.liveTime,
                    visualizerEngine.audio,
                    visualizerEngine.modelCenterX,
                    visualizerEngine.modelCenterY,
                    visualizerEngine.width,
                    visualizerEngine.height,
                    visualizerEngine.audio.isPlaying
                );
            } else if (isStatic && activeModel.update && !activeModel.lastDeformedParams && !activeModel.lastDeformedParameters) {
                activeModel.update(
                    0.016,
                    visualizerEngine.liveTime,
                    visualizerEngine.audio,
                    visualizerEngine.modelCenterX,
                    visualizerEngine.modelCenterY,
                    visualizerEngine.width,
                    visualizerEngine.height,
                    false
                );
            }

            activeModel.render(
                canvasRenderingContext,
                visualizerEngine.modelCenterX,
                visualizerEngine.modelCenterY,
                modelRenderScale,
                visualizerEngine.liveTime,
                visualizerEngine.audio,
                visualizerPalette,
                activeEnv.effects,
                visualizerEngine.width,
                visualizerEngine.height
            );

        } catch (err) {
            console.error(err);
            if (visualizerEngine.ctx && visualizerEngine.canvas) {
                visualizerEngine.ctx.save();
                visualizerEngine.ctx.setTransform(1,0,0,1,0,0);
                visualizerEngine.ctx.fillStyle = 'red';
                visualizerEngine.ctx.font = '20px sans-serif';
                visualizerEngine.ctx.fillText(err.toString() + " | " + err.stack, 20, 50);
                visualizerEngine.ctx.restore();
            }
        } finally {
            canvasRenderingContext.restore();
        }
    }
}

export const renderVisualizerFrame = (engine, dt, isStatic) => RenderPipelineRouter.renderVisualizerFrame(engine, dt, isStatic);
