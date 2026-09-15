import { updateSettingsDropdownUI } from '../ui/SettingsDropdownBuilder.js';

export class UiStateSynchronizer {
    static updateVisualizerUI(visualizerEngine) {
        const currentActivePalette = visualizerEngine.paletteManager.active;

        const metas = window.SpicetifyVisualizerModelsMeta || {};
        const activeMeta = metas[visualizerEngine.activeModelId] || {};

        const groupButtons = document.querySelectorAll(".spicetify-visualizer-group-btn");
        groupButtons.forEach(btn => {
            const btnGroup = btn.getAttribute("data-group");
            const isGroupActive = visualizerEngine.isForeground && activeMeta.groupId === btnGroup;
            
            if (isGroupActive) {
                btn.classList.add("active");
                btn.style.color = currentActivePalette.primary;
            } else {
                btn.classList.remove("active");
                btn.style.color = "var(--spice-subtext, rgba(255,255,255,0.6))";
            }
        });

        const playbarSettingsButtons = document.querySelectorAll("#spicetify-visualizer-settings-btn");
        playbarSettingsButtons.forEach(btn => {
            if (visualizerEngine.isForeground) {
                btn.style.setProperty("display", "inline-flex", "important");
                btn.style.setProperty("visibility", "visible", "important");
                btn.style.removeProperty("width");
                btn.style.removeProperty("padding");
                btn.style.removeProperty("margin");
                btn.style.removeProperty("overflow");
                btn.style.removeProperty("border");
                btn.style.color = "var(--spice-subtext, rgba(255,255,255,0.6))";
            } else {
                btn.style.setProperty("display", "none", "important");
                btn.style.setProperty("visibility", "hidden", "important");
                btn.style.setProperty("width", "0px", "important");
                btn.style.setProperty("padding", "0px", "important");
                btn.style.setProperty("margin", "0px", "important");
                btn.style.setProperty("overflow", "hidden", "important");
                btn.style.setProperty("border", "none", "important");
            }
        });

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
