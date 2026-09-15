// src/theme/PaletteColorHelpers.js - Dynamic color alpha decorators for palettes

/**
 * Clamps opacity ratio to valid [0, 1] range.
 * @param {number} opacityValueRatio
 * @returns {number}
 */
export function clampOpacityValue(opacityValueRatio) {
    return Math.max(0, Math.min(1, opacityValueRatio));
}

/**
 * Builds standard CSS rgba string from RGB color array and opacity.
 * @param {Array<number>} rgbChannels
 * @param {number} opacityValueRatio
 * @returns {string}
 */
export function buildRgbaString(rgbChannels, opacityValueRatio) {
    const clampedLevel = clampOpacityValue(opacityValueRatio);
    return `rgba(${rgbChannels[0]}, ${rgbChannels[1]}, ${rgbChannels[2]}, ${clampedLevel})`;
}

/**
 * Decorates a raw palette configuration object with dynamic alpha generator methods.
 * @param {Object} rawPaletteSpecification
 * @returns {Object}
 */
export function decorateVisualizerPalette(rawPaletteSpecification) {
    const colorChannels = rawPaletteSpecification.rgb || {
        primary: [0, 240, 255],
        accent: [255, 0, 127],
        secondary: [157, 78, 221],
        deepNebula: [12, 6, 28],
        starlight: [255, 255, 255]
    };

    const decoratedPalette = { ...rawPaletteSpecification };

    decoratedPalette.primaryAlpha = (opacityValueRatio) => {
        return buildRgbaString(colorChannels.primary, opacityValueRatio);
    };

    decoratedPalette.accentAlpha = (opacityValueRatio) => {
        return buildRgbaString(colorChannels.accent, opacityValueRatio);
    };

    decoratedPalette.secondaryAlpha = (opacityValueRatio) => {
        return buildRgbaString(colorChannels.secondary, opacityValueRatio);
    };

    decoratedPalette.coreAlpha = (opacityValueRatio) => {
        return buildRgbaString(colorChannels.starlight, opacityValueRatio);
    };

    decoratedPalette.deepNebulaAlpha = (opacityValueRatio) => {
        return buildRgbaString(colorChannels.deepNebula, opacityValueRatio);
    };

    decoratedPalette.starlightAlpha = (opacityValueRatio) => {
        return buildRgbaString(colorChannels.starlight, opacityValueRatio);
    };

    return decoratedPalette;
}

// Backward-compatible alias
export const decoratePalette = decorateVisualizerPalette;
