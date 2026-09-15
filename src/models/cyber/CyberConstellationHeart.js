// src/models/cyber/CyberConstellationHeart.js - Constellation nodes, links, and pulsar heart

export function renderCyberConstellationHeart(
    canvasRenderingContext,
    constellationNodesList,
    constellationLinksList,
    animationTimeSeconds,
    audioFeatureState,
    visualizerPalette
) {
    canvasRenderingContext.save();
    canvasRenderingContext.globalCompositeOperation = "lighter";

    const bassIntensity = audioFeatureState.bass || 0;
    const midsIntensity = audioFeatureState.mids || audioFeatureState.mid || 0;
    const trebleIntensity = audioFeatureState.treble || audioFeatureState.highs || 0;
    const beatImpulse = audioFeatureState.beatImpulse || 0;
    const snareImpulse = audioFeatureState.snareImpulse || 0;
    const isDropActive = !!audioFeatureState.isDrop;
    const dropMultiplier = isDropActive ? 1.5 : 1.0;

    const nodeLookupMap = {};
    for (let index = 0; index < constellationNodesList.length; index++) {
        const node = constellationNodesList[index];
        nodeLookupMap[node.id] = node;
    }

    // 1. Render constellation connection links
    const linkAlpha = Math.min(1.0, (0.45 + midsIntensity * 0.35 + beatImpulse * 0.20) * dropMultiplier);
    canvasRenderingContext.strokeStyle = isDropActive && visualizerPalette.accentAlpha
        ? visualizerPalette.accentAlpha(linkAlpha)
        : (visualizerPalette.primaryAlpha ? visualizerPalette.primaryAlpha(linkAlpha) : visualizerPalette.primary);
    canvasRenderingContext.lineWidth = 1.0 + snareImpulse * 0.80 + (isDropActive ? 0.60 : 0);

    for (let index = 0; index < constellationLinksList.length; index++) {
        const [firstNodeId, secondNodeId] = constellationLinksList[index];
        const firstNode = nodeLookupMap[firstNodeId], secondNode = nodeLookupMap[secondNodeId];
        if (firstNode && secondNode) {
            canvasRenderingContext.beginPath();
            canvasRenderingContext.moveTo(firstNode.relX, firstNode.relY);
            canvasRenderingContext.lineTo(secondNode.relX, secondNode.relY);
            canvasRenderingContext.stroke();
        }
    }

    // 2. Frequency-mapped star nodes and central heart
    const energyLevel = audioFeatureState.energy || 0.35;
    const normalizedTempo = Math.max(0.40, Math.min(2.0, (audioFeatureState.bpm || 120) / 120));
    const nodePulseSpeed = 0.80 + normalizedTempo * 0.60 * (0.35 + energyLevel * 0.65);

    for (let index = 0; index < constellationNodesList.length; index++) {
        const currentNode = constellationNodesList[index];
        const pulseRatio = Math.sin(animationTimeSeconds * nodePulseSpeed + index * 0.80) * 0.18 + 0.82;

        let anatomicalFrequencyBand = midsIntensity;
        if (currentNode.relY >= 35) {
            anatomicalFrequencyBand = bassIntensity * 1.30 + beatImpulse * 0.60;
        } else if (currentNode.relY <= -20) {
            anatomicalFrequencyBand = trebleIntensity * 1.20 + snareImpulse * 0.80;
        } else {
            anatomicalFrequencyBand = midsIntensity * 1.10 + beatImpulse * 0.30;
        }

        const nodeRenderSize = currentNode.size * (pulseRatio + anatomicalFrequencyBand * 0.50) * dropMultiplier;

        if (currentNode.isHeart) {
            const heartPulseFactor = (1.0 + bassIntensity * 0.90 + beatImpulse * 0.50) * dropMultiplier;
            const heartCoronaRadius = 18 * heartPulseFactor;

            const grad = canvasRenderingContext.createRadialGradient(
                currentNode.relX, currentNode.relY, 1,
                currentNode.relX, currentNode.relY, heartCoronaRadius
            );
            grad.addColorStop(0, visualizerPalette.core);
            grad.addColorStop(0.35, visualizerPalette.accentAlpha ? visualizerPalette.accentAlpha(0.90) : visualizerPalette.accent);
            grad.addColorStop(0.70, visualizerPalette.primaryAlpha ? visualizerPalette.primaryAlpha(0.40) : visualizerPalette.primary);
            grad.addColorStop(1.0, "rgba(255, 0, 127, 0)");

            canvasRenderingContext.fillStyle = grad;
            canvasRenderingContext.globalAlpha = Math.min(1.0, 0.85 + bassIntensity * 0.20);
            canvasRenderingContext.beginPath();
            canvasRenderingContext.arc(currentNode.relX, currentNode.relY, heartCoronaRadius, 0, Math.PI * 2);
            canvasRenderingContext.fill();

            canvasRenderingContext.fillStyle = visualizerPalette.core;
            canvasRenderingContext.globalAlpha = 1.0;
            canvasRenderingContext.beginPath();
            canvasRenderingContext.arc(currentNode.relX, currentNode.relY, 4.5 * heartPulseFactor, 0, Math.PI * 2);
            canvasRenderingContext.fill();

            if (isDropActive || beatImpulse > 0.70) {
                canvasRenderingContext.fillStyle = "#ffffff";
                canvasRenderingContext.beginPath();
                canvasRenderingContext.arc(currentNode.relX, currentNode.relY, 2.5 * heartPulseFactor, 0, Math.PI * 2);
                canvasRenderingContext.fill();
            }
        } else {
            canvasRenderingContext.fillStyle = (anatomicalFrequencyBand > 0.45 || isDropActive) ? visualizerPalette.core : visualizerPalette.accent;
            canvasRenderingContext.globalAlpha = Math.min(1.0, 0.70 + anatomicalFrequencyBand * 0.30);
            canvasRenderingContext.beginPath();
            canvasRenderingContext.arc(currentNode.relX, currentNode.relY, nodeRenderSize, 0, Math.PI * 2);
            canvasRenderingContext.fill();
        }
    }

    canvasRenderingContext.restore();
}

