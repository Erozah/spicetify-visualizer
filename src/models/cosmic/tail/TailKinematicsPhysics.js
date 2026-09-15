// src/models/cosmic/tail/TailKinematicsPhysics.js - Realistic feline tail kinematics and spine physics

export function updateTailKinematicsPhysics(
    tailPhysicsInstance,
    anchorPointCoordinates,
    baseRenderScale,
    audioFeatureState,
    deltaTimeSeconds,
    animationTimeSeconds,
    deckHorizonCoordinateY,
    isMusicPlaying
) {
    const beatsPerMinute = audioFeatureState.bpm || 120;
    const energyLevel = audioFeatureState.energy || 0;
    const bassIntensity = audioFeatureState.bass || 0;
    const trebleIntensity = audioFeatureState.highs || 0;
    const beatImpulse = audioFeatureState.beatImpulse || 0;
    const isMeasureDownbeat = audioFeatureState.isBar || beatImpulse > 0.70;

    const rootCoordinateX = anchorPointCoordinates[0];
    const rootCoordinateY = anchorPointCoordinates[1];

    // 1. Natural Feline Sway Rhythm
    const normalizedTempo = Math.max(0.40, Math.min(2.0, beatsPerMinute / 120));
    const tempoHertz = isMusicPlaying ? (0.15 + normalizedTempo * 0.35 * (0.35 + energyLevel * 0.65)) : 0.10;
    const swaySpeed = isMusicPlaying ? (tempoHertz * (0.75 + energyLevel * 0.50)) : 0.10;
    tailPhysicsInstance.swayPhase += swaySpeed * deltaTimeSeconds;

    // 2. Measure Downbeat Tap & Dynamic Tip Whip
    if (isMusicPlaying && (isMeasureDownbeat || (beatImpulse > 0.45 && energyLevel > 0.30))) {
        const whipPower = isMeasureDownbeat ? 1.85 : 1.0;
        tailPhysicsInstance.tipTwitch += (beatImpulse * 1.40 * (0.4 + energyLevel * 0.6) * whipPower) * (Math.sin(tailPhysicsInstance.swayPhase) > 0 ? 1 : -1);
        tailPhysicsInstance.deckTapImpulse = Math.min(1.0, tailPhysicsInstance.deckTapImpulse + beatImpulse * 0.70 * whipPower);
    } else if (!isMusicPlaying) {
        tailPhysicsInstance.tipTwitch = 0;
        tailPhysicsInstance.deckTapImpulse = 0;
    }
    const decayMultiplier = Math.pow(0.86, deltaTimeSeconds * 60);
    tailPhysicsInstance.tipTwitch = (tailPhysicsInstance.tipTwitch || 0) * decayMultiplier;
    tailPhysicsInstance.deckTapImpulse = (tailPhysicsInstance.deckTapImpulse || 0) * Math.pow(0.88, deltaTimeSeconds * 60);

    // 3. Feline Tail Spine Kinematics
    const totalTailLength = 175 * baseRenderScale;
    const segmentLength = totalTailLength / (tailPhysicsInstance.segmentCount - 1);

    if (!tailPhysicsInstance.initialized) {
        for (let index = 0; index < tailPhysicsInstance.segmentCount; index++) {
            tailPhysicsInstance.nodes[index].x = rootCoordinateX - index * segmentLength * 0.80;
            tailPhysicsInstance.nodes[index].y = rootCoordinateY + index * segmentLength * 0.30;
            tailPhysicsInstance.nodes[index].thickness = 11.0 * baseRenderScale;
        }
        tailPhysicsInstance.initialized = true;
    }

    tailPhysicsInstance.nodes[0].x = rootCoordinateX;
    tailPhysicsInstance.nodes[0].y = rootCoordinateY;
    tailPhysicsInstance.nodes[0].thickness = 11.0 * baseRenderScale;

    const maxSwayAngle = isMusicPlaying ? (0.16 + energyLevel * 0.24 + bassIntensity * 0.15) : 0.05;

    for (let index = 1; index < tailPhysicsInstance.segmentCount; index++) {
        const fraction = index / (tailPhysicsInstance.segmentCount - 1);
        const wavePhase = tailPhysicsInstance.swayPhase - fraction * 2.20;
        const horizontalSway = Math.sin(wavePhase) * maxSwayAngle * (fraction * 1.20);
        const secondaryHarmonic = (isMusicPlaying && energyLevel > 0.35) ? (Math.sin(wavePhase * 1.60) * 0.10 * fraction * energyLevel) : 0;
        const tipCurl = tailPhysicsInstance.tipTwitch * Math.pow(fraction, 2.50) * 1.20;

        const currentAngle = (Math.PI * 0.88) + horizontalSway + secondaryHarmonic + tipCurl;
        const previousNode = tailPhysicsInstance.nodes[index - 1];
        let targetX = previousNode.x + Math.cos(currentAngle) * segmentLength;
        let targetY = previousNode.y + Math.sin(currentAngle) * segmentLength;

        if (deckHorizonCoordinateY && targetY > deckHorizonCoordinateY + 12 * baseRenderScale) {
            targetY = deckHorizonCoordinateY + 12 * baseRenderScale;
        }

        if (isMusicPlaying && fraction > 0.75) {
            const tipSpeed = 0.80 + normalizedTempo * 1.20 * (0.40 + energyLevel * 0.60);
            const tipLift = Math.sin(animationTimeSeconds * tipSpeed + fraction * 4) * (4 * baseRenderScale * trebleIntensity * (0.30 + energyLevel * 0.70)) - (tailPhysicsInstance.deckTapImpulse * 6 * baseRenderScale);
            targetY += tipLift;
        }

        const blendWeight = 0.32 + (1.0 - fraction) * 0.22;
        tailPhysicsInstance.nodes[index].x += (targetX - tailPhysicsInstance.nodes[index].x) * blendWeight;
        tailPhysicsInstance.nodes[index].y += (targetY - tailPhysicsInstance.nodes[index].y) * blendWeight;
        tailPhysicsInstance.nodes[index].thickness = (1.0 - Math.pow(fraction, 1.40) * 0.65) * (11.0 * baseRenderScale);
    }

    // 4. Precalculate Envelope Normal Vectors
    for (let index = 0; index < tailPhysicsInstance.segmentCount; index++) {
        const curr = tailPhysicsInstance.nodes[index];
        const next = index < tailPhysicsInstance.segmentCount - 1 ? tailPhysicsInstance.nodes[index + 1] : curr;
        const prev = index > 0 ? tailPhysicsInstance.nodes[index - 1] : curr;
        const dx = next.x - prev.x, dy = next.y - prev.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1.0;
        const nx = -dy / len, ny = dx / len;

        tailPhysicsInstance.leftPoints[index].x = curr.x + nx * curr.thickness;
        tailPhysicsInstance.leftPoints[index].y = curr.y + ny * curr.thickness;
        tailPhysicsInstance.rightPoints[index].x = curr.x - nx * curr.thickness;
        tailPhysicsInstance.rightPoints[index].y = curr.y - ny * curr.thickness;
    }
}

