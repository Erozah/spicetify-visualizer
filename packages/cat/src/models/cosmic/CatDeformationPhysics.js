// src/models/cosmic/CatDeformationPhysics.js - Feline audio-reactive respiration & squash/stretch physics

export function calculateCatBreathingExpansionRatio(
    totalElapsedSeconds,
    musicPlaybackSpeedRatio,
    isCurrentSectionSoft,
    currentTrackEnergyLevel
) {
    const breathingCycleFrequency = (0.75 + musicPlaybackSpeedRatio * 0.45) * (1.0 - (isCurrentSectionSoft ? 1.0 : 0.0) * 0.7);
    const breathingOscillationMagnitude = 0.015 + currentTrackEnergyLevel * 0.025;
    return Math.sin(totalElapsedSeconds * breathingCycleFrequency) * breathingOscillationMagnitude;
}

export function computeCatDeformationPhysics(
    felineCenterCoordinateX,
    felineCenterCoordinateY,
    felineFrameWidth,
    felineFrameHeight,
    audioStateReference,
    elapsedSongTimeSeconds,
    deckHorizonCoordinateY,
    isPlaybackActive = true
) {
    const bassLevel = Number.isFinite(audioStateReference?.bass) ? audioStateReference.bass : 0.2;
    const midLevel = Number.isFinite(audioStateReference?.mids || audioStateReference?.mid) ? (audioStateReference.mids || audioStateReference.mid) : 0.2;
    const trebleLevel = Number.isFinite(audioStateReference?.highs || audioStateReference?.treble) ? (audioStateReference.highs || audioStateReference.treble) : 0.2;
    const beatImpulse = Number.isFinite(audioStateReference?.beatImpulse) ? audioStateReference.beatImpulse : 0.0;
    const beatsPerMinute = Number.isFinite(audioStateReference?.bpm) ? audioStateReference.bpm : 120;
    const isSongDrop = !!audioStateReference?.isDrop;
    const snareImpulse = Number.isFinite(audioStateReference?.snareImpulse) ? audioStateReference.snareImpulse : 0.0;
    const currentTrackEnergyLevel = Number.isFinite(audioStateReference?.energy) ? audioStateReference.energy : 0.4;
    const isCurrentSectionSoft = !!audioStateReference?.isSoft;

    const musicPlaybackSpeedRatio = Math.max(0.4, Math.min(2.0, beatsPerMinute / 120));

    // Breathing expansion
    const breathingExpansionRatio = calculateCatBreathingExpansionRatio(
        elapsedSongTimeSeconds,
        musicPlaybackSpeedRatio,
        isCurrentSectionSoft,
        currentTrackEnergyLevel
    );

    // Dynamic Feline Squash & Stretch
    const dropMultiplier = isSongDrop ? 1.45 : 1.0;
    const energyScaleFactor = 0.35 + currentTrackEnergyLevel * 0.65;
    const squashCompressY = isPlaybackActive ? (-beatImpulse * 0.07 * dropMultiplier * energyScaleFactor + bassLevel * 0.04 * energyScaleFactor) : 0;
    const stretchWidenX = isPlaybackActive ? (beatImpulse * 0.09 * dropMultiplier * energyScaleFactor + bassLevel * 0.05 * energyScaleFactor) : 0;

    // Treble micro-vibrations
    const microVibration = (isPlaybackActive && trebleLevel > 0.35)
        ? Math.sin(elapsedSongTimeSeconds * 35) * (trebleLevel - 0.35) * 0.015
        : 0;

    const currentScaleX = (1.0 + breathingExpansionRatio + stretchWidenX + microVibration) * (felineFrameWidth * 0.5);
    const currentScaleY = (1.0 - breathingExpansionRatio * 0.5 + squashCompressY) * (felineFrameHeight * 0.5);

    // Spine organic swaying
    const spineSwaySpeed = isPlaybackActive ? (0.35 + musicPlaybackSpeedRatio * 0.45 * (0.4 + currentTrackEnergyLevel * 0.6)) : 0.25;
    const spineSwayAmplitude = (0.012 + midLevel * 0.035 * dropMultiplier) * energyScaleFactor;
    const spineSwayDisplacement = isPlaybackActive
        ? (Math.sin(elapsedSongTimeSeconds * spineSwaySpeed) * spineSwayAmplitude)
        : (Math.sin(elapsedSongTimeSeconds * 0.4) * 0.005);

    // Ear perk on high frequency transients
    const earPerkIntensity = isPlaybackActive
        ? (trebleLevel * 0.06 + snareImpulse * 0.10 + beatImpulse * 0.05) * energyScaleFactor
        : 0;

    // Deck bounce cushioning
    const bounceOffset = isPlaybackActive
        ? (-Math.sin((audioStateReference?.beatProgress || 0) * Math.PI) * (2.5 * bassLevel + 5.5 * beatImpulse) * dropMultiplier * energyScaleFactor)
        : 0;
    const actualCenterY = deckHorizonCoordinateY
        ? (deckHorizonCoordinateY - currentScaleY * 0.96 + bounceOffset)
        : (felineCenterCoordinateY + bounceOffset);

    return {
        centerX: felineCenterCoordinateX,
        centerY: actualCenterY,
        scaleX: currentScaleX,
        scaleY: currentScaleY,
        spineSway: spineSwayDisplacement,
        earPerk: earPerkIntensity,
        breathingRatio: breathingExpansionRatio,
        bass: bassLevel,
        beat: beatImpulse,
        highs: trebleLevel,
        mids: midLevel,
        isDrop: isSongDrop,
        deckY: deckHorizonCoordinateY
    };
}

// Backward-compatible alias
export const computeCatDeformation = computeCatDeformationPhysics;
