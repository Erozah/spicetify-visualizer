import { updateSettingsDropdownUI } from '../ui/SettingsDropdownBuilder.js';

export class UiStateSynchronizer {
    static updateVisualizerUI(visualizerEngine) {
        const currentActivePalette = visualizerEngine.paletteManager.active;

        const playbarToggleButton = document.getElementById("panda-visualizer-toggle-btn");
        if (playbarToggleButton) {
            if (visualizerEngine.isForeground) {
                playbarToggleButton.classList.add("active");
                playbarToggleButton.style.color = currentActivePalette.primary;
                playbarToggleButton.title = "Panda Visualizer : ACTIF (Clic pour désactiver)";
            } else {
                playbarToggleButton.classList.remove("active");
                playbarToggleButton.style.color = "var(--spice-subtext, rgba(255,255,255,0.6))";
                playbarToggleButton.title = "Panda Visualizer : INACTIF (Clic pour activer)";
            }
        }

        const playbarSettingsButton = document.getElementById("panda-visualizer-settings-btn");
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
            document.body.classList.toggle("panda-visualizer-active", visualizerEngine.isForeground);
            document.body.classList.toggle("panda-fullscreen-active", visualizerEngine.isFullscreen);
        }
    }
}
export const updateVisualizerUI = UiStateSynchronizer.updateVisualizerUI;
