// src/models/cosmic/tail/TailSparksEmitter.js - Tail tip cosmic sparkle emitter and renderer

/**
 * Updates tail tip spark particle kinematics, audio reactivity, and lifespan.
 * @param {Array<Object>} sparkParticlesList
 * @param {Object} tipNode
 * @param {number} baseRenderScale
 * @param {Object} audioFeatureState
 * @param {number} deltaTimeSeconds
 * @param {boolean} isMusicPlaying
 */
export function updateTailSparksEmitter(
    sparkParticlesList,
    tipNode,
    baseRenderScale,
    audioFeatureState,
    deltaTimeSeconds,
    isMusicPlaying
) {
    const trebleIntensity = audioFeatureState.highs || 0;
    const beatImpulse = audioFeatureState.beatImpulse || 0;
    const snareImpulse = audioFeatureState.snareImpulse || 0;
    const isDropActive = !!audioFeatureState.isDrop;

    // 1. Burst of sparks on snare / clap hit
    if (isMusicPlaying && snareImpulse > 0.40) {
        const burstCount = Math.floor(3 + snareImpulse * 4 + (isDropActive ? 3 : 0));
        for (let burstIndex = 0; burstIndex < burstCount; burstIndex++) {
            const burstAngle = Math.random() * Math.PI * 2;
            const burstSpeed = 30 + Math.random() * 60;
            sparkParticlesList.push({
                x: tipNode.x,
                y: tipNode.y,
                velocityX: Math.cos(burstAngle) * burstSpeed,
                velocityY: Math.sin(burstAngle) * burstSpeed,
                lifeRemaining: 1.0,
                decayRate: 1.2 + Math.random() * 1.5,
                particleSize: (2.0 + Math.random() * 3.0) * baseRenderScale,
                colorType: Math.random() < 0.5 ? "accent" : "starlight"
            });
        }
    }

    // 2. Continuous trailing starlight sparks
    const sparkEmissionProbability = 0.35 + trebleIntensity * 0.50 + beatImpulse * 0.35 + (isDropActive ? 0.30 : 0);
    if (isMusicPlaying && Math.random() < sparkEmissionProbability) {
        sparkParticlesList.push({
            x: tipNode.x + (Math.random() - 0.50) * 8,
            y: tipNode.y + (Math.random() - 0.50) * 8,
            velocityX: (Math.random() - 0.50) * 25 - 12,
            velocityY: (Math.random() - 0.50) * 25 - 12,
            lifeRemaining: 1.0,
            decayRate: 1.1 + Math.random() * 1.4,
            particleSize: (1.5 + Math.random() * 2.8) * baseRenderScale,
            colorType: Math.random() < 0.6 ? "accent" : "starlight"
        });
    }

    // 3. Update physics and lifecycle of sparks
    for (let index = sparkParticlesList.length - 1; index >= 0; index--) {
        const particle = sparkParticlesList[index];
        particle.x += (particle.velocityX || particle.vx || 0) * deltaTimeSeconds;
        particle.y += (particle.velocityY || particle.vy || 0) * deltaTimeSeconds;
        particle.lifeRemaining -= (particle.decayRate || particle.decay || 1.0) * deltaTimeSeconds;
        if (particle.lifeRemaining <= 0 || !isMusicPlaying) {
            sparkParticlesList.splice(index, 1);
        }
    }
}

/**
 * Renders cosmic tail sparks onto the canvas context.
 * @param {CanvasRenderingContext2D} canvasRenderingContext
 * @param {Array<Object>} sparkParticlesList
 * @param {Object} visualizerPalette
 */
export function renderTailSparksEmitter(canvasRenderingContext, sparkParticlesList, visualizerPalette) {
    for (let index = 0; index < sparkParticlesList.length; index++) {
        const particle = sparkParticlesList[index];
        const lifeAlpha = Math.max(0, particle.lifeRemaining !== undefined ? particle.lifeRemaining : particle.life);
        const particleRadius = (particle.particleSize || particle.size || 2.0) * lifeAlpha;

        canvasRenderingContext.fillStyle = particle.colorType === "starlight" || particle.color === "starlight"
            ? `rgba(255, 255, 255, ${lifeAlpha})`
            : visualizerPalette.accentAlpha(lifeAlpha);

        canvasRenderingContext.beginPath();
        canvasRenderingContext.arc(particle.x, particle.y, particleRadius, 0, Math.PI * 2);
        canvasRenderingContext.fill();
    }
}

// Backward-compatible aliases
export const updateTailSparks = updateTailSparksEmitter;
export const renderTailSparks = renderTailSparksEmitter;
