import { updateSettingsDropdownUI } from '../ui/SettingsDropdownBuilder.js';

export class UiStateSynchronizer {
    static updateVisualizerUI(visualizerEngine) {
        const currentActivePalette = visualizerEngine.paletteManager.active;

        const playbarToggleButton = document.getElementById("cosmic-cat-toggle-btn");
        if (playbarToggleButton) {
            const modelLabel = visualizerEngine.activeCat === "cyber" ? "Cyber Cat" : "Cosmic Cat";
            if (visualizerEngine.isForeground) {
                playbarToggleButton.classList.add("active");
                playbarToggleButton.style.color = currentActivePalette.primary;
                playbarToggleButton.title = `Visualiseur Chat : ACTIF (Clic pour désactiver | Modèle : ${modelLabel})`;
            } else {
                playbarToggleButton.classList.remove("active");
                playbarToggleButton.style.color = "var(--spice-subtext, rgba(255,255,255,0.6))";
                playbarToggleButton.title = "Visualiseur Chat : INACTIF (Clic pour activer)";
            }
        }

        const playbarSettingsButton = document.getElementById("cosmic-cat-settings-btn");
        if (playbarSettingsButton) {
            playbarSettingsButton.style.display = visualizerEngine.isForeground ? "inline-flex" : "none";
            if (visualizerEngine.isForeground) {
                playbarSettingsButton.style.color = "var(--spice-subtext, rgba(255,255,255,0.6))";
            }
        }

        if (typeof updateSettingsDropdownUI === "function") {
            updateSettingsDropdownUI(visualizerEngine);
        }

        if (typeof document !== "undefined" && document.body) {
            document.body.classList.toggle("cyber-cat-visualizer-active", visualizerEngine.isForeground);
            document.body.classList.toggle("cyber-cat-fullscreen-active", visualizerEngine.isFullscreen);
        }
    }
}
export const updateVisualizerUI = UiStateSynchronizer.updateVisualizerUI;
