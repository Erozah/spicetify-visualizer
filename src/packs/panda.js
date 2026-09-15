import { RedPanda } from '../models/redpanda/RedPanda.js';

const PANDA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M4 8.5C3.2 7.2 3.5 5 4.8 4.2C6.1 3.5 7.8 4 8.8 5.2C6.8 5.8 5.2 7 4 8.5Z"/><path d="M20 8.5C21.2 7 19.6 5.8 17.6 5.2C18.6 4 20.3 3.5 21.6 4.2C22.9 5 23.2 7.2 22.4 8.5C21.7 8.5 20.8 8.5 20 8.5Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M12 6C7.5 6 4 9.2 4 13.5C4 15.8 5 17.8 6.6 19.2C7.8 20.3 9.8 21 12 21C14.2 21 16.2 20.3 17.4 19.2C19 17.8 20 15.8 20 13.5C20 9.2 16.5 6 12 6ZM8.5 11C9.3 11 10 11.7 10 12.5C10 13.3 9.3 14 8.5 14C7.7 14 7 13.3 7 12.5C7 11.7 7.7 11 8.5 11ZM15.5 11C16.3 11 17 11.7 17 12.5C17 13.3 16.3 14 15.5 14C14.7 14 14 13.3 14 12.5C14 11.7 14.7 11 15.5 11ZM12 15C10.9 15 10 15.8 10 16.8C10 17.7 10.9 18.5 12 18.5C13.1 18.5 14 17.7 14 16.8C14 15.8 13.1 15 12 15Z"/></svg>`;

const pandaMeta = { groupId: 'cat', groupIcon: PANDA_SVG, groupName: 'Visualiseur Panda', name: 'Red Panda', icon: '🐼' };

if (window.SpicetifyVisualizerAPI) {
    window.SpicetifyVisualizerAPI.registerModel('redpanda', new RedPanda(), pandaMeta);
} else {
    window.SpicetifyVisualizerModels = window.SpicetifyVisualizerModels || {};
    window.SpicetifyVisualizerModelsMeta = window.SpicetifyVisualizerModelsMeta || {};
    window.SpicetifyVisualizerModels['redpanda'] = new RedPanda();
    window.SpicetifyVisualizerModelsMeta['redpanda'] = pandaMeta;
}
