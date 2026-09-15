export class RenderPipelineRouter {
    static renderVisualizerFrame(engine, deltaTimeSeconds, isStatic = false) {
        this.renderFrameToContext(
            engine,
            engine.ctx,
            engine.width,
            engine.height,
            deltaTimeSeconds,
            isStatic,
            engine.dpr
        );
    }

    static renderFrameToContext(engine, canvasRenderingContext, width, height, deltaTimeSeconds, isStatic = false, dpr = 1) {
        if (!canvasRenderingContext) return;
        const paletteTheme = engine.paletteManager.active;
        const centerX = width * 0.5;
        const centerY = height * 0.52;

        if (!isStatic) {
            engine.audio.update(deltaTimeSeconds);
            engine.env.update(
                deltaTimeSeconds,
                width,
                height,
                engine.audio,
                paletteTheme,
                centerX,
                centerY
            );
        }

        canvasRenderingContext.save();
        canvasRenderingContext.setTransform(dpr, 0, 0, dpr, 0, 0);

        if (!isStatic && engine.env.effects && engine.env.effects.shake && engine.env.cameraShake) {
            engine.env.cameraShake.apply(canvasRenderingContext, centerX, centerY);
        }

        engine.env.render(
            canvasRenderingContext,
            width,
            height,
            engine.liveTime,
            engine.audio,
            paletteTheme,
            centerX,
            centerY
        );

        if (engine.env.effects && engine.env.effects.perch && engine.env.perch) {
            const deckHorizonCoordinateY = height * 0.86;
            engine.env.perch.render(
                canvasRenderingContext,
                width,
                height,
                deckHorizonCoordinateY,
                paletteTheme,
                engine.audio,
                centerX
            );
        }

        const pandaScale = Math.min(1.2, Math.max(0.65, Math.min(width / 950, height / 700)));

        if (!isStatic && engine.model && engine.model.update) {
            engine.model.update(
                deltaTimeSeconds,
                engine.liveTime,
                engine.audio,
                centerX,
                centerY,
                width,
                height,
                engine.audio.isPlaying
            );
        } else if (isStatic && engine.model && engine.model.update) {
            engine.model.update(
                0.016,
                engine.liveTime,
                engine.audio,
                centerX,
                centerY,
                width,
                height,
                false
            );
        }

        if (engine.model && engine.model.render) {
            engine.model.render(
                canvasRenderingContext,
                centerX,
                centerY,
                pandaScale,
                engine.liveTime,
                engine.audio,
                paletteTheme,
                engine.env.effects,
                width,
                height
            );
        }

        if (!isStatic && engine.env.effects && engine.env.effects.supernova && engine.env.supernova) {
            engine.env.supernova.render(canvasRenderingContext, width, height, paletteTheme);
        }

        if (!isStatic && engine.env.effects && engine.env.effects.shake && engine.env.cameraShake) {
            engine.env.cameraShake.renderChromaticFlash(
                canvasRenderingContext,
                width,
                height,
                paletteTheme,
                engine.audio
            );
        }

        canvasRenderingContext.restore();
    }
}

export const renderVisualizerFrame = (engine, dt, isStatic) => RenderPipelineRouter.renderVisualizerFrame(engine, dt, isStatic);
