import { VisualizerPalettes } from './VisualizerPalettesData.js';

// src/theme/DynamicAlbumColorExtractor.js - Real-time extraction of dominant album cover colors into adaptive palette

export class DynamicAlbumColorExtractor {
    constructor(paletteManagerReference) {
        this.paletteManager = paletteManagerReference;
        this.lastExtractedImageUrl = "";
        this.offscreenCanvas = document.createElement("canvas");
        this.offscreenCanvas.width = 32;
        this.offscreenCanvas.height = 32;
        this.offscreenContext = this.offscreenCanvas.getContext("2d", { willReadFrequently: true });

        this.setupSongChangeListener();
    }

    setupSongChangeListener() {
        if (typeof Spicetify === "undefined" || !Spicetify.Player) return;

        Spicetify.Player.addEventListener("songchange", () => {
            this.extractCoverPalette();
        });

        // Initial extraction if music is already loaded
        setTimeout(() => this.extractCoverPalette(), 1000);
    }

    extractCoverPalette() {
        if (typeof Spicetify === "undefined" || !Spicetify.Player || !Spicetify.Player.data) return;

        const trackMetadata = Spicetify.Player.data.item ? Spicetify.Player.data.item.metadata : null;
        let albumCoverImageUrl = trackMetadata ? (trackMetadata.image_xlarge_url || trackMetadata.image_large_url || trackMetadata.image_url) : "";
        if (albumCoverImageUrl && albumCoverImageUrl.startsWith("spotify:image:")) {
            albumCoverImageUrl = "https://i.scdn.co/image/" + albumCoverImageUrl.split(":")[2];
        }
        if (!albumCoverImageUrl || albumCoverImageUrl === this.lastExtractedImageUrl) return;

        this.lastExtractedImageUrl = albumCoverImageUrl;

        const coverImageElement = new Image();
        coverImageElement.crossOrigin = "Anonymous";
        coverImageElement.onload = () => {
            try {
                this.offscreenContext.drawImage(coverImageElement, 0, 0, 32, 32);
                const imageData = this.offscreenContext.getImageData(0, 0, 32, 32).data;

                let redSum = 0, greenSum = 0, blueSum = 0, countedPixels = 0;
                for (let pixelIndex = 0; pixelIndex < imageData.length; pixelIndex += 16) {
                    const r = imageData[pixelIndex], g = imageData[pixelIndex + 1], b = imageData[pixelIndex + 2];
                    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                    if (brightness > 30 && brightness < 230) {
                        redSum += r; greenSum += g; blueSum += b;
                        countedPixels++;
                    }
                }

                if (countedPixels > 0) {
                    const avgRed = Math.round(redSum / countedPixels);
                    const avgGreen = Math.round(greenSum / countedPixels);
                    const avgBlue = Math.round(blueSum / countedPixels);
                    this.applyAdaptivePaletteColors(avgRed, avgGreen, avgBlue);
                }
            } catch (samplingError) {
                console.warn("[DynamicAlbumColorExtractor] Sampling failed:", samplingError);
            }
        };
        coverImageElement.src = albumCoverImageUrl;
    }

    applyAdaptivePaletteColors(redChannel, greenChannel, blueChannel) {
        if (typeof VisualizerPalettes === "undefined" || !VisualizerPalettes["album-adaptive"]) return;

        const toHex = (c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, "0");
        const primaryHex = `#${toHex(redChannel)}${toHex(greenChannel)}${toHex(blueChannel)}`;
        const accentHex = `#${toHex(255 - blueChannel)}${toHex(Math.min(255, redChannel + 40))}${toHex(255 - greenChannel)}`;
        const secondaryHex = `#${toHex(Math.min(255, greenChannel + 60))}${toHex(Math.min(255, blueChannel + 50))}${toHex(redChannel)}`;

        const adaptivePalette = VisualizerPalettes["album-adaptive"];
        adaptivePalette.primary = primaryHex;
        adaptivePalette.accent = accentHex;
        adaptivePalette.secondary = secondaryHex;
        adaptivePalette.glow = `rgba(${redChannel}, ${greenChannel}, ${blueChannel}, 0.45)`;
        adaptivePalette.starGlow = `rgba(${255 - blueChannel}, ${Math.min(255, redChannel + 40)}, ${255 - greenChannel}, 0.35)`;
        adaptivePalette.shockwave = primaryHex;
        adaptivePalette.rgb.primary = [redChannel, greenChannel, blueChannel];
        adaptivePalette.rgb.accent = [255 - blueChannel, Math.min(255, redChannel + 40), 255 - greenChannel];
        adaptivePalette.rgb.secondary = [Math.min(255, greenChannel + 60), Math.min(255, blueChannel + 50), redChannel];

        const swatchBtn = document.querySelector("#spicetify-visualizer-settings-dropdown [data-palette='album-adaptive'], [data-palette='album-adaptive']");
        if (swatchBtn) {
            swatchBtn.style.background = `linear-gradient(135deg, ${primaryHex}, ${accentHex})`;
        }

        if (this.paletteManager && this.paletteManager.active && this.paletteManager.active.id === "album-adaptive") {
            this.paletteManager.setPalette("album-adaptive", true);
        }
    }
}
