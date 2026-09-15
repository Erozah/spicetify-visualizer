import './styles/root.css';
import './styles/canvas.css';
import './styles/transparency.css';
import './styles/mainView.css';
import './styles/dropdown.css';
import './styles/fullscreen.css';
import './styles/playbar.css';

import './ui/SpicetifyExtensionLifecycle.js';
import { PandaVisualizerEngine } from './core/VisualizerEngine.js';
import { togglePandaSettingsDropdown } from './ui/SettingsDropdownBuilder.js';

if (typeof window !== 'undefined') {
    window.PandaVisualizerEngine = PandaVisualizerEngine;
    window.togglePandaSettingsDropdown = togglePandaSettingsDropdown;
}
