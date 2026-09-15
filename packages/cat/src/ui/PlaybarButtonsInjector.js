import { toggleSettingsDropdown } from './SettingsDropdownBuilder.js';

export const FELINE_CAT_SVG_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2C9.5 2 7.4 3.8 7 6.2 4.6 7.8 3 10.7 3 14c0 5 4 9 9 9s9-4 9-9c0-3.3-1.6-6.2-4-7.8C16.6 3.8 14.5 2 12 2zm-3.2 1.8l1.6 2.4c-.6.4-1.1.9-1.4 1.5L6.5 6.6l2.3-2.8zm6.4 0l2.3 2.8-2.5 1.1c-.3-.6-.8-1.1-1.4-1.5l1.6-2.4z"/></svg>`;
export const SETTINGS_GEAR_SVG_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>`;

export let spicetifyToggleBtn = null;
export let spicetifySettingsBtn = null;
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

        if (!document.getElementById("cosmic-cat-toggle-btn")) {
            const toggleBtn = document.createElement("button");
            toggleBtn.id = "cosmic-cat-toggle-btn";
            toggleBtn.className = "main-genericButton-button cosmic-playbar-btn";
            toggleBtn.setAttribute("aria-label", "Visualiseur Chat : Activer / Désactiver");
            toggleBtn.innerHTML = FELINE_CAT_SVG_ICON;

            toggleBtn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                const eng = engineGetter();
                if (eng) eng.toggleActive();
            });

            extraControls.insertBefore(toggleBtn, extraControls.firstChild);
        }

        if (!document.getElementById("cosmic-cat-settings-btn")) {
            const settingsBtn = document.createElement("button");
            settingsBtn.id = "cosmic-cat-settings-btn";
            settingsBtn.className = "main-genericButton-button cosmic-playbar-btn";
            settingsBtn.setAttribute("aria-label", "Paramètres du Visualiseur");
            settingsBtn.innerHTML = SETTINGS_GEAR_SVG_ICON;
            const eng = engineGetter();
            settingsBtn.style.display = (eng && eng.isForeground) ? "inline-flex" : "none";

            settingsBtn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleSettingsDropdown(engineGetter);
            });

            const toggleBtn = document.getElementById("cosmic-cat-toggle-btn");
            if (toggleBtn && toggleBtn.nextSibling) {
                extraControls.insertBefore(settingsBtn, toggleBtn.nextSibling);
            } else {
                extraControls.appendChild(settingsBtn);
            }
        }
    } finally {
        isInjectingPlaybarButtons = false;
    }
}

export function initPlaybarObserver(engineGetter) {
    const playbar = document.querySelector(".Root__now-playing-bar, .main-nowPlayingBar-container");
    if (playbar) {
        const obs = new MutationObserver(() => {
            if (!document.getElementById("cosmic-cat-toggle-btn") || !document.getElementById("cosmic-cat-settings-btn")) {
                mountPlaybarButtons(engineGetter);
            }
        });
        obs.observe(playbar, { childList: true, subtree: true });
    } else {
        setTimeout(() => initPlaybarObserver(engineGetter), 500);
    }
}
