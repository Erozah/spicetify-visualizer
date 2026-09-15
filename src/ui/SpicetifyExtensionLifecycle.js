import { VisualizerEngine } from '../core/VisualizerEngine.js';
import { initPlaybarObserver, mountPlaybarButtons } from './PlaybarButtonsInjector.js';
import { mountGlobalCanvas } from './CanvasMountManager.js';
import { toggleSettingsDropdown, mountSettingsDropdown } from './SettingsDropdownBuilder.js';
import { updateVisualizerUI } from '../core/UiStateSynchronizer.js';

// src/ui/SpicetifyExtensionLifecycle.js - Spicetify Extension Entry Point for Spicetify Visualizer

(function () {
    let globalVisualizerEngineInstance = null;
    const getVisualizerEngine = () => globalVisualizerEngineInstance;

    function initializeSpicetifyVisualizerExtension() {
        if (typeof Spicetify === "undefined" || !Spicetify.Player || !Spicetify.Platform) {
            setTimeout(initializeSpicetifyVisualizerExtension, 250);
            return;
        }

        // 1. Mount Persistent Full-Window Wallpaper Canvas
        const globalCanvasElement = mountGlobalCanvas();

        // 2. Initialize Master Spicetify Visualizer Engine
        if (!globalVisualizerEngineInstance && globalCanvasElement) {
            try {
                globalVisualizerEngineInstance = new VisualizerEngine(globalCanvasElement);
                window.visualizerEngine = globalVisualizerEngineInstance;
            } catch (engineError) {
                console.error("[SpicetifyVisualizer] Engine instantiation error:", engineError);
            }
        }

        // 3. Mount UI Controls (Playbar Buttons & Settings Dropdown)
        try {
            mountPlaybarButtons(getVisualizerEngine);
            initPlaybarObserver(getVisualizerEngine);
        } catch (uiError) {
            console.error("[SpicetifyVisualizer] UI mount error:", uiError);
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
                console.error("[SpicetifyVisualizer] Initial state sync error:", syncError);
            }
        }

        // 5. Click canvas in fullscreen mode to exit immersion
        if (globalCanvasElement) {
            globalCanvasElement.addEventListener("click", () => {
                if (globalVisualizerEngineInstance && globalVisualizerEngineInstance.isFullscreen) {
                    globalVisualizerEngineInstance.toggleFullscreen(false);
                }
            });
        }

        // 6. Register Spicetify Context Menu Items
        if (typeof Spicetify !== "undefined" && Spicetify.Menu && Spicetify.Menu.Item) {
            try {
                new Spicetify.Menu.Item("Spicetify Visualizer : Activer / Désactiver (C)", false, () => {
                    if (globalVisualizerEngineInstance) globalVisualizerEngineInstance.toggleActive();
                }).register();
                new Spicetify.Menu.Item("Spicetify Visualizer : Modèle Suivant (M)", false, () => {
                    if (globalVisualizerEngineInstance) globalVisualizerEngineInstance.nextModel();
                }).register();
                new Spicetify.Menu.Item("Spicetify Visualizer : Thème Suivant (T)", false, () => {
                    if (globalVisualizerEngineInstance) globalVisualizerEngineInstance.nextPalette();
                }).register();
                new Spicetify.Menu.Item("Spicetify Visualizer : Plein Écran (F)", false, () => {
                    if (globalVisualizerEngineInstance) globalVisualizerEngineInstance.toggleFullscreen();
                }).register();
            } catch (registrationError) {
                console.warn("[SpicetifyVisualizer] Menu item registration skipped:", registrationError);
            }
        }

        console.log("[SpicetifyVisualizer] Global wallpaper visualizer safely initialized.");
    }

    if (document.readyState === "complete" || document.readyState === "interactive") {
        initializeSpicetifyVisualizerExtension();
    } else {
        document.addEventListener("DOMContentLoaded", initializeSpicetifyVisualizerExtension);
    }
})();
