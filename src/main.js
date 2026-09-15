import './styles/root.css';
import './styles/canvas.css';
import './styles/transparency.css';
import './styles/mainView.css';
import './styles/dropdown.css';
import './styles/fullscreen.css';
import './styles/playbar.css';

window.SpicetifyVisualizerModels = window.SpicetifyVisualizerModels || {};
window.SpicetifyVisualizerModelsMeta = window.SpicetifyVisualizerModelsMeta || {};
window.SpicetifyVisualizerPalettes = window.SpicetifyVisualizerPalettes || {};

window.SpicetifyVisualizerAPI = {
    registerModel: (id, modelInstance, metadata) => {
        window.SpicetifyVisualizerModels[id] = modelInstance;
        if (metadata) {
            window.SpicetifyVisualizerModelsMeta[id] = metadata;
        }
        if (window.visualizerEngine) window.visualizerEngine.updateAllUI();
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('spicetify-visualizer-models-updated'));
    },
    registerPalette: (id, paletteData) => {
        window.SpicetifyVisualizerPalettes[id] = paletteData;
        if (window.visualizerEngine) window.visualizerEngine.updateAllUI();
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('spicetify-visualizer-models-updated'));
    }
};

import './ui/SpicetifyExtensionLifecycle.js';
import { toggleVisualizerSettingsDropdown } from './ui/SettingsDropdownBuilder.js';

if (typeof window !== 'undefined') {
    window.toggleVisualizerSettingsDropdown = toggleVisualizerSettingsDropdown;
}
