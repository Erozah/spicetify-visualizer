// src/theme/PaletteColorHelpers.js - Dynamic color alpha decorators for visualizer palettes

export function decoratePaletteWithDynamicAlphaHelpers(rawPalette) {
    const rgb = rawPalette.rgb || {
        primary: [16, 185, 129],
        accent: [52, 211, 153],
        secondary: [5, 150, 105],
        deepNebula: [3, 22, 15],
        starlight: [236, 253, 245]
    };

    const decorated = { ...rawPalette };
    const clampAlpha = (alphaValue) => Math.max(0, Math.min(1, alphaValue));

    decorated.primaryAlpha = (alpha) => `rgba(${rgb.primary[0]}, ${rgb.primary[1]}, ${rgb.primary[2]}, ${clampAlpha(alpha)})`;
    decorated.accentAlpha = (alpha) => `rgba(${rgb.accent[0]}, ${rgb.accent[1]}, ${rgb.accent[2]}, ${clampAlpha(alpha)})`;
    decorated.secondaryAlpha = (alpha) => `rgba(${rgb.secondary[0]}, ${rgb.secondary[1]}, ${rgb.secondary[2]}, ${clampAlpha(alpha)})`;
    decorated.deepNebulaAlpha = (alpha) => `rgba(${rgb.deepNebula[0]}, ${rgb.deepNebula[1]}, ${rgb.deepNebula[2]}, ${clampAlpha(alpha)})`;
    decorated.starlightAlpha = (alpha) => `rgba(${rgb.starlight[0]}, ${rgb.starlight[1]}, ${rgb.starlight[2]}, ${clampAlpha(alpha)})`;
    decorated.coreAlpha = (alpha) => `rgba(${rgb.starlight[0]}, ${rgb.starlight[1]}, ${rgb.starlight[2]}, ${clampAlpha(alpha)})`;

    return decorated;
}

// Backward-compatible alias
export const decoratePalette = decoratePaletteWithDynamicAlphaHelpers;
