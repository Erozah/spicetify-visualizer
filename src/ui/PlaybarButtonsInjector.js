import { toggleSettingsDropdown } from './SettingsDropdownBuilder.js';

export const SETTINGS_GEAR_SVG_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>`;

export let isInjectingPlaybarButtons = false;

export function mountPlaybarButtons(engineGetter) {
    if (isInjectingPlaybarButtons) return;
    isInjectingPlaybarButtons = true;

    try {
        const extraControls = document.querySelector(".main-nowPlayingBar-extraControls");
        if (!extraControls) {
            setTimeout(() => mountPlaybarButtons(engineGetter), 500);
            return;
        }

        const metas = window.SpicetifyVisualizerModelsMeta || {};
        const groups = {};
        Object.keys(metas).forEach(modelId => {
            const m = metas[modelId];
            if (!groups[m.groupId]) {
                groups[m.groupId] = { id: m.groupId, icon: m.groupIcon, name: m.groupName, defaultModel: modelId };
            }
        });

        let lastInjectedBtn = null;

        Object.values(groups).forEach(group => {
            const btnId = `spicetify-visualizer-group-${group.id}-btn`;
            if (!document.getElementById(btnId)) {
                const groupBtn = document.createElement("button");
                groupBtn.id = btnId;
                groupBtn.className = "main-genericButton-button cosmic-playbar-btn spicetify-visualizer-group-btn";
                groupBtn.setAttribute("data-group", group.id);
                groupBtn.setAttribute("aria-label", group.name);
                groupBtn.innerHTML = group.icon;

                groupBtn.addEventListener("click", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const eng = engineGetter();
                    if (eng) {
                        const currentMeta = metas[eng.activeModelId] || {};
                        const isCurrentGroup = eng.isForeground && currentMeta.groupId === group.id;
                        
                        if (isCurrentGroup) {
                            eng.toggleActive(false);
                        } else {
                            // Find if there's another model from this group that was previously active, otherwise use default
                            let targetModel = group.defaultModel;
                            Object.keys(metas).forEach(k => {
                                if (metas[k].groupId === group.id && eng.activeModelId === k) {
                                    targetModel = k; // It's already the active one, just hidden
                                }
                            });
                            // Actually, just set it to defaultModel for simplicity, unless it's already active
                            if (currentMeta.groupId !== group.id) {
                                eng.setModel(group.defaultModel);
                            }
                            eng.toggleActive(true);
                        }
                    }
                });

                if (lastInjectedBtn && lastInjectedBtn.nextSibling) {
                    extraControls.insertBefore(groupBtn, lastInjectedBtn.nextSibling);
                } else {
                    extraControls.insertBefore(groupBtn, extraControls.firstChild);
                }
                lastInjectedBtn = groupBtn;
            } else {
                lastInjectedBtn = document.getElementById(btnId);
            }
        });

        if (!document.getElementById("spicetify-visualizer-settings-btn")) {
            const settingsBtn = document.createElement("button");
            settingsBtn.id = "spicetify-visualizer-settings-btn";
            settingsBtn.className = "main-genericButton-button cosmic-playbar-btn";
            settingsBtn.setAttribute("aria-label", "Paramètres du Visualiseur");
            settingsBtn.innerHTML = SETTINGS_GEAR_SVG_ICON;
            const eng = engineGetter();
            if (eng && eng.isForeground) {
                settingsBtn.style.setProperty("display", "inline-flex", "important");
                settingsBtn.style.setProperty("visibility", "visible", "important");
                settingsBtn.style.removeProperty("width");
                settingsBtn.style.removeProperty("padding");
                settingsBtn.style.removeProperty("margin");
                settingsBtn.style.removeProperty("overflow");
                settingsBtn.style.removeProperty("border");
            } else {
                settingsBtn.style.setProperty("display", "none", "important");
                settingsBtn.style.setProperty("visibility", "hidden", "important");
                settingsBtn.style.setProperty("width", "0px", "important");
                settingsBtn.style.setProperty("padding", "0px", "important");
                settingsBtn.style.setProperty("margin", "0px", "important");
                settingsBtn.style.setProperty("overflow", "hidden", "important");
                settingsBtn.style.setProperty("border", "none", "important");
            }

            settingsBtn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleSettingsDropdown(engineGetter);
            });

            if (lastInjectedBtn && lastInjectedBtn.nextSibling) {
                extraControls.insertBefore(settingsBtn, lastInjectedBtn.nextSibling);
            } else {
                extraControls.appendChild(settingsBtn);
            }
        }
    } finally {
        isInjectingPlaybarButtons = false;
    }
}

export function initPlaybarObserver(engineGetter) {
    window.addEventListener('spicetify-visualizer-models-updated', () => {
        mountPlaybarButtons(engineGetter);
    });
    const playbar = document.querySelector(".Root__now-playing-bar, .main-nowPlayingBar-container");
    if (playbar) {
        const obs = new MutationObserver(() => {
            const metas = window.SpicetifyVisualizerModelsMeta || {};
            const groupIds = [...new Set(Object.values(metas).map(m => m.groupId))];
            
            let missingButton = false;
            groupIds.forEach(id => {
                if (!document.getElementById(`spicetify-visualizer-group-${id}-btn`)) missingButton = true;
            });
            
            if (missingButton) {
                mountPlaybarButtons(engineGetter);
            }
        });
        obs.observe(playbar, { childList: true, subtree: true });
    } else {
        setTimeout(() => initPlaybarObserver(engineGetter), 500);
    }
}
