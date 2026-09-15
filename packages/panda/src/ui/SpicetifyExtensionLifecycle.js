import { PandaVisualizerEngine } from '../core/VisualizerEngine.js';
import { initPlaybarObserver, mountPlaybarButtons } from './PlaybarButtonsInjector.js';
import { mountGlobalCanvas } from './CanvasMountManager.js';
import { toggleSettingsDropdown, mountSettingsDropdown } from './SettingsDropdownBuilder.js';
import { updateVisualizerUI } from '../core/UiStateSynchronizer.js';

// src/ui/SpicetifyExtensionLifecycle.js - Spicetify Extension Entry Point for Panda Visualizer

(function () {
    let globalVisualizerEngineInstance = null;
    const getVisualizerEngine = () => globalVisualizerEngineInstance;

    function initializePandaVisualizerExtension() {
        if (typeof Spicetify === "undefined" || !Spicetify.Player || !Spicetify.Platform) {
            setTimeout(initializePandaVisualizerExtension, 250);
            return;
        }

        // 1. Mount Persistent Full-Window Wallpaper Canvas
        const globalCanvasElement = mountGlobalCanvas();

        // 2. Initialize Master Panda Visualizer Engine
        if (!globalVisualizerEngineInstance && globalCanvasElement) {
            try {
                globalVisualizerEngineInstance = new PandaVisualizerEngine(globalCanvasElement);
                window.pandaVisualizerEngine = globalVisualizerEngineInstance;
                window.PandaVisualizerEngineInstance = globalVisualizerEngineInstance;
            } catch (engineError) {
                console.error("[PandaVisualizer] Engine instantiation error:", engineError);
            }
        }

        // 3. Mount UI Controls (Playbar Buttons & Settings Dropdown)
        try {
            mountPlaybarButtons(getVisualizerEngine);
            initPlaybarObserver(getVisualizerEngine);
            mountSettingsDropdown(getVisualizerEngine);
        } catch (uiError) {
            console.error("[PandaVisualizer] UI mount error:", uiError);
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
                console.error("[PandaVisualizer] Initial state sync error:", syncError);
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
                new Spicetify.Menu.Item("Panda Visualizer : Activer / Désactiver (P)", false, () => {
                    if (globalVisualizerEngineInstance) globalVisualizerEngineInstance.toggleActive();
                }).register();
                new Spicetify.Menu.Item("Panda Visualizer : Thème Suivant (T)", false, () => {
                    if (globalVisualizerEngineInstance) globalVisualizerEngineInstance.nextPalette();
                }).register();
                new Spicetify.Menu.Item("Panda Visualizer : Immersion Plein Écran (F)", false, () => {
                    if (globalVisualizerEngineInstance) globalVisualizerEngineInstance.toggleFullscreen();
                }).register();
            } catch (registrationError) {
                console.warn("[PandaVisualizer] Menu item registration skipped:", registrationError);
            }
        }

        console.log("[PandaVisualizer] Global wallpaper visualizer safely initialized.");
    }

    if (document.readyState === "complete" || document.readyState === "interactive") {
        initializePandaVisualizerExtension();
    } else {
        document.addEventListener("DOMContentLoaded", initializePandaVisualizerExtension);
    }
})();
