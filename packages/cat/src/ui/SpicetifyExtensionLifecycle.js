import { CatVisualizerEngine } from '../core/VisualizerEngine.js';
import { initPlaybarObserver, mountPlaybarButtons } from './PlaybarButtonsInjector.js';
import { mountGlobalCanvas } from './CanvasMountManager.js';
import { mountSettingsDropdown } from './SettingsDropdownBuilder.js';
import { updateVisualizerUI } from '../core/UiStateSynchronizer.js';

// src/ui/SpicetifyExtensionLifecycle.js - Spicetify Extension Entry Point for Cyber & Cosmic Cat Visualizer

(function () {
    let globalVisualizerEngineInstance = null;
    const getVisualizerEngine = () => globalVisualizerEngineInstance;

    function initializeCatVisualizerExtension() {
        if (typeof Spicetify === "undefined" || !Spicetify.Player || !Spicetify.Platform) {
            setTimeout(initializeCatVisualizerExtension, 250);
            return;
        }

        // 1. Mount Persistent Full-Window Wallpaper Canvas
        const globalCanvasElement = mountGlobalCanvas();

        // 2. Initialize Master Cat Visualizer Engine
        if (!globalVisualizerEngineInstance && globalCanvasElement) {
            try {
                globalVisualizerEngineInstance = new CatVisualizerEngine(globalCanvasElement);
                window.catVisualizerEngine = globalVisualizerEngineInstance;
                window.cyberCatEngine = globalVisualizerEngineInstance;
            } catch (engineError) {
                console.error("[CatVisualizer] Engine instantiation error:", engineError);
            }
        }

        // 3. Mount UI Controls (Playbar Buttons & Settings Dropdown)
        try {
            mountPlaybarButtons(getVisualizerEngine);
            initPlaybarObserver(getVisualizerEngine);
            mountSettingsDropdown(getVisualizerEngine);
        } catch (uiError) {
            console.error("[CatVisualizer] UI mount error:", uiError);
        }

        // 4. Immediate state synchronisation if previously enabled
        if (globalVisualizerEngineInstance && globalVisualizerEngineInstance.isForeground) {
            try {
                updateVisualizerUI(globalVisualizerEngineInstance);
                const isMusicCurrentlyPlaying = Spicetify.Player.isPlaying();
                if (isMusicCurrentlyPlaying) {
                    globalVisualizerEngineInstance.unfreeze();
                } else {
                    globalVisualizerEngineInstance.freeze();
                }
            } catch (syncError) {
                console.error("[CatVisualizer] Initial state sync error:", syncError);
            }
        }

        // 4. Click canvas in fullscreen mode to exit immersion
        if (globalCanvasElement) {
            globalCanvasElement.addEventListener("click", () => {
                if (globalVisualizerEngineInstance && globalVisualizerEngineInstance.isFullscreen) {
                    globalVisualizerEngineInstance.toggleFullscreen(false);
                }
            });
        }

        // 5. Register Spicetify Context Menu Items
        if (typeof Spicetify !== "undefined" && Spicetify.Menu && Spicetify.Menu.Item) {
            try {
                new Spicetify.Menu.Item("Cat Visualizer : Activer / Désactiver (C)", false, () => {
                    if (globalVisualizerEngineInstance) globalVisualizerEngineInstance.toggleActive();
                }).register();
                new Spicetify.Menu.Item("Cat Visualizer : Modèle Suivant (M)", false, () => {
                    if (globalVisualizerEngineInstance) globalVisualizerEngineInstance.nextCat();
                }).register();
                new Spicetify.Menu.Item("Cat Visualizer : Thème Suivant (T)", false, () => {
                    if (globalVisualizerEngineInstance) globalVisualizerEngineInstance.nextPalette();
                }).register();
                new Spicetify.Menu.Item("Cat Visualizer : Plein Écran (F)", false, () => {
                    if (globalVisualizerEngineInstance) globalVisualizerEngineInstance.toggleFullscreen();
                }).register();
            } catch (registrationError) {
                console.warn("[CatVisualizer] Menu item registration skipped:", registrationError);
            }
        }

        console.log("[CatVisualizer] Global wallpaper visualizer safely initialized.");
    }

    if (document.readyState === "complete" || document.readyState === "interactive") {
        initializeCatVisualizerExtension();
    } else {
        document.addEventListener("DOMContentLoaded", initializeCatVisualizerExtension);
    }
})();
