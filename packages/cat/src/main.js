import './styles/root.css';
import './styles/canvas.css';
import './styles/transparency.css';
import './styles/mainView.css';
import './styles/dropdown.css';
import './styles/fullscreen.css';
import './styles/playbar.css';

import './ui/SpicetifyExtensionLifecycle.js';
import { CatVisualizerEngine } from './core/VisualizerEngine.js';
import { toggleCatSettingsDropdown } from './ui/SettingsDropdownBuilder.js';

if (typeof window !== 'undefined') {
    window.CatVisualizerEngine = CatVisualizerEngine;
    window.toggleCatSettingsDropdown = toggleCatSettingsDropdown;
}
