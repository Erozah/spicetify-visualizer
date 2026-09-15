import { CyberCat } from '../models/cyber/CyberCat.js';
import { CosmicCat } from '../models/cosmic/CosmicCat.js';

const CAT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2C9.5 2 7.4 3.8 7 6.2 4.6 7.8 3 10.7 3 14c0 5 4 9 9 9s9-4 9-9c0-3.3-1.6-6.2-4-7.8C16.6 3.8 14.5 2 12 2zm-3.2 1.8l1.6 2.4c-.6.4-1.1.9-1.4 1.5L6.5 6.6l2.3-2.8zm6.4 0l2.3 2.8-2.5 1.1c-.3-.6-.8-1.1-1.4-1.5l1.6-2.4z"/></svg>`;

const cyberMeta = { groupId: 'cat', groupIcon: CAT_SVG, groupName: 'Visualiseur Chat', name: 'Cyber Cat', icon: '🐱' };
const cosmicMeta = { groupId: 'cat', groupIcon: CAT_SVG, groupName: 'Visualiseur Chat', name: 'Cosmic Cat', icon: '🌌' };

if (window.SpicetifyVisualizerAPI) {
    window.SpicetifyVisualizerAPI.registerModel('cyber', new CyberCat(), cyberMeta);
    window.SpicetifyVisualizerAPI.registerModel('cosmic', new CosmicCat(), cosmicMeta);
} else {
    window.SpicetifyVisualizerModels = window.SpicetifyVisualizerModels || {};
    window.SpicetifyVisualizerModelsMeta = window.SpicetifyVisualizerModelsMeta || {};
    window.SpicetifyVisualizerModels['cyber'] = new CyberCat();
    window.SpicetifyVisualizerModelsMeta['cyber'] = cyberMeta;
    window.SpicetifyVisualizerModels['cosmic'] = new CosmicCat();
    window.SpicetifyVisualizerModelsMeta['cosmic'] = cosmicMeta;
}
