import { toggleSettingsDropdown } from './SettingsDropdownBuilder.js';

export const PandaSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M4 8.5C3.2 7.2 3.5 5 4.8 4.2C6.1 3.5 7.8 4 8.8 5.2C6.8 5.8 5.2 7 4 8.5Z"/><path d="M20 8.5C21.2 7 19.6 5.8 17.6 5.2C18.6 4 20.3 3.5 21.6 4.2C22.9 5 23.2 7.2 22.4 8.5C21.7 8.5 20.8 8.5 20 8.5Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M12 6C7.5 6 4 9.2 4 13.5C4 15.8 5 17.8 6.6 19.2C7.8 20.3 9.8 21 12 21C14.2 21 16.2 20.3 17.4 19.2C19 17.8 20 15.8 20 13.5C20 9.2 16.5 6 12 6ZM8.5 11C9.3 11 10 11.7 10 12.5C10 13.3 9.3 14 8.5 14C7.7 14 7 13.3 7 12.5C7 11.7 7.7 11 8.5 11ZM15.5 11C16.3 11 17 11.7 17 12.5C17 13.3 16.3 14 15.5 14C14.7 14 14 13.3 14 12.5C14 11.7 14.7 11 15.5 11ZM12 15C10.9 15 10 15.8 10 16.8C10 17.7 10.9 18.5 12 18.5C13.1 18.5 14 17.7 14 16.8C14 15.8 13.1 15 12 15Z"/></svg>`;
export const GearSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>`;

export let spicetifyToggleBtn = null;
export let spicetifySettingsBtn = null;
export let isInjectingPlaybar = false;

export function mountPlaybarButtons(engineGetter) {
    if (isInjectingPlaybar) return;
    isInjectingPlaybar = true;

    try {
        const extraControls = document.querySelector(".main-nowPlayingBar-extraControls");
        if (!extraControls) {
            setTimeout(() => mountPlaybarButtons(engineGetter), 500);
            return;
        }

        if (!document.getElementById("panda-visualizer-toggle-btn")) {
            const toggleBtn = document.createElement("button");
            toggleBtn.id = "panda-visualizer-toggle-btn";
            toggleBtn.className = "main-genericButton-button panda-playbar-btn";
            toggleBtn.setAttribute("aria-label", "Panda Visualizer : Activer / Désactiver");
            toggleBtn.innerHTML = PandaSvg;

            toggleBtn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                const eng = engineGetter();
                if (eng) eng.toggleActive();
            });

            extraControls.insertBefore(toggleBtn, extraControls.firstChild);
        }

        if (!document.getElementById("panda-visualizer-settings-btn")) {
            const settingsBtn = document.createElement("button");
            settingsBtn.id = "panda-visualizer-settings-btn";
            settingsBtn.className = "main-genericButton-button panda-playbar-btn";
            settingsBtn.setAttribute("aria-label", "Paramètres du Panda Visualizer");
            settingsBtn.innerHTML = GearSvg;
            const eng = engineGetter();
            settingsBtn.style.display = (eng && eng.isForeground) ? "inline-flex" : "none";

            settingsBtn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleSettingsDropdown(engineGetter);
            });

            const toggleBtn = document.getElementById("panda-visualizer-toggle-btn");
            if (toggleBtn && toggleBtn.nextSibling) {
                extraControls.insertBefore(settingsBtn, toggleBtn.nextSibling);
            } else {
                extraControls.appendChild(settingsBtn);
            }
        }
    } finally {
        isInjectingPlaybar = false;
    }
}

export function initPlaybarObserver(engineGetter) {
    const playbar = document.querySelector(".Root__now-playing-bar, .main-nowPlayingBar-container");
    if (playbar) {
        const obs = new MutationObserver(() => {
            if (!document.getElementById("panda-visualizer-toggle-btn") || !document.getElementById("panda-visualizer-settings-btn")) {
                mountPlaybarButtons(engineGetter);
            }
        });
        obs.observe(playbar, { childList: true, subtree: true });
    } else {
        setTimeout(() => initPlaybarObserver(engineGetter), 500);
    }
}
