import { buildSettingsDropdownHtmlMarkup, renderPaletteSwatches } from './SettingsDropdownTemplate.js';

export let activeSettingsDropdownElement = null;

export function toggleSettingsDropdown(engineGetter) {
    if (!activeSettingsDropdownElement) activeSettingsDropdownElement = mountSettingsDropdown(engineGetter);
    activeSettingsDropdownElement.classList.contains("open") ? closeSettingsDropdown() : openSettingsDropdown(engineGetter);
}

export function openSettingsDropdown(engineGetter) {
    const visualizerEngineInstance = engineGetter();
    if (!visualizerEngineInstance || !visualizerEngineInstance.isForeground) return;
    if (!activeSettingsDropdownElement) activeSettingsDropdownElement = mountSettingsDropdown(engineGetter);

    updateSettingsDropdownUI(visualizerEngineInstance);
    activeSettingsDropdownElement.classList.add("open");

    const settingsButton = document.getElementById("spicetify-visualizer-settings-btn");
    if (settingsButton) {
        const buttonRect = settingsButton.getBoundingClientRect();
        activeSettingsDropdownElement.style.right = `${Math.max(16, window.innerWidth - buttonRect.right - 10)}px`;
        activeSettingsDropdownElement.style.bottom = `${window.innerHeight - buttonRect.top + 10}px`;
    }
}

export function closeSettingsDropdown() {
    if (activeSettingsDropdownElement) activeSettingsDropdownElement.classList.remove("open");
}

export function mountSettingsDropdown(engineGetter) {
    let dropdownElement = document.getElementById("spicetify-visualizer-settings-dropdown");
    if (dropdownElement) return dropdownElement;

    dropdownElement = document.createElement("div");
    dropdownElement.id = "spicetify-visualizer-settings-dropdown";
    dropdownElement.className = "spicetify-visualizer-settings-dropdown";
    dropdownElement.innerHTML = buildSettingsDropdownHtmlMarkup();
    document.body.appendChild(dropdownElement);

    dropdownElement.querySelector(".dropdown-close-btn").addEventListener("click", closeSettingsDropdown);

    dropdownElement.querySelectorAll(".model-btn").forEach((modelButton) => {
        modelButton.addEventListener("click", (clickEvent) => {
            clickEvent.stopPropagation();
            const modelKey = modelButton.getAttribute("data-model");
            const engine = engineGetter();
            if (engine && modelKey) {
                engine.setModel(modelKey);
                updateSettingsDropdownUI(engine);
            }
        });
    });

    renderPaletteSwatches(dropdownElement.querySelector(".palette-swatches-row"), engineGetter);

    dropdownElement.querySelectorAll(".toggle-checkbox").forEach((checkbox) => {
        checkbox.addEventListener("change", (changeEvent) => {
            changeEvent.stopPropagation();
            const effectName = checkbox.getAttribute("data-effect");
            const engine = engineGetter();
            if (engine && effectName) {
                engine.setEffect(effectName, checkbox.checked);
            }
        });
    });

    const liveAudioButton = dropdownElement.querySelector("#spicetify-visualizer-dropdown-live-audio-btn");
    if (liveAudioButton) {
        liveAudioButton.addEventListener("click", async (clickEvent) => {
            clickEvent.stopPropagation();
            const engine = engineGetter();
            if (engine && engine.audio) {
                await engine.audio.toggleLiveAudio();
                updateSettingsDropdownUI(engine);
            }
        });
    }

    const latencyButton = dropdownElement.querySelector("#spicetify-visualizer-dropdown-latency-btn");
    if (latencyButton) {
        latencyButton.addEventListener("click", (clickEvent) => {
            clickEvent.stopPropagation();
            const engine = engineGetter();
            if (engine && engine.audio) {
                engine.audio.toggleLatencyCorrection();
                updateSettingsDropdownUI(engine);
            }
        });
    }

    const fullscreenButton = dropdownElement.querySelector("#spicetify-visualizer-dropdown-fs-btn");
    if (fullscreenButton) {
        fullscreenButton.addEventListener("click", (clickEvent) => {
            clickEvent.stopPropagation();
            const engine = engineGetter();
            if (engine) {
                closeSettingsDropdown();
                engine.toggleFullscreen(true);
            }
        });
    }

    const pipButton = dropdownElement.querySelector("#spicetify-visualizer-dropdown-pip-btn");
    if (pipButton) {
        pipButton.addEventListener("click", (clickEvent) => {
            clickEvent.stopPropagation();
            const engine = engineGetter();
            if (engine && typeof engine.togglePiP === "function") {
                closeSettingsDropdown();
                engine.togglePiP();
            }
        });
    }

    document.addEventListener("click", (clickEvent) => {
        if (!dropdownElement.classList.contains("open")) return;
        if (dropdownElement.contains(clickEvent.target) || clickEvent.target.closest("#spicetify-visualizer-settings-btn")) return;
        closeSettingsDropdown();
    });

    window.addEventListener("keydown", (keyboardEvent) => {
        if (keyboardEvent.key === "Escape" && dropdownElement.classList.contains("open")) {
            closeSettingsDropdown();
        }
    });

    return dropdownElement;
}

export function updateSettingsDropdownUI(engine) {
    if (!activeSettingsDropdownElement || !engine) return;

    activeSettingsDropdownElement.querySelectorAll(".model-btn").forEach((button) => {
        button.classList.toggle("active", button.getAttribute("data-model") === engine.activeModelId);
    });

    const activePaletteId = engine.paletteManager.active ? engine.paletteManager.active.id : "cyberpunk";
    activeSettingsDropdownElement.querySelectorAll(".dropdown-palette-btn").forEach((button) => {
        button.classList.toggle("active", button.getAttribute("data-palette") === activePaletteId);
    });

    const effects = engine.env.effects || {};
    activeSettingsDropdownElement.querySelectorAll(".toggle-checkbox").forEach((checkbox) => {
        checkbox.checked = Boolean(effects[checkbox.getAttribute("data-effect")]);
    });

    const isLive = engine.audio ? engine.audio.isLiveAudioActive() : false;
    const audioStatusElement = activeSettingsDropdownElement.querySelector("#spicetify-visualizer-dropdown-audio-status");
    const audioDotElement = activeSettingsDropdownElement.querySelector("#spicetify-visualizer-dropdown-audio-dot");
    const audioButtonElement = activeSettingsDropdownElement.querySelector("#spicetify-visualizer-dropdown-live-audio-btn");
    if (audioStatusElement && audioDotElement && audioButtonElement) {
        audioButtonElement.classList.toggle("active", isLive);
        audioStatusElement.textContent = isLive ? "FFT Temps Réel (Actif)" : "Analyse Locale Spotify";
        audioDotElement.className = isLive ? "audio-status-dot active" : "audio-status-dot";
    }

    const isLatencyCorrected = engine.audio ? engine.audio.isLatencyCorrectionActive() : true;
    const latencyStatusElement = activeSettingsDropdownElement.querySelector("#spicetify-visualizer-dropdown-latency-status");
    const latencyDotElement = activeSettingsDropdownElement.querySelector("#spicetify-visualizer-dropdown-latency-dot");
    const latencyButtonElement = activeSettingsDropdownElement.querySelector("#spicetify-visualizer-dropdown-latency-btn");
    if (latencyStatusElement && latencyDotElement && latencyButtonElement) {
        latencyButtonElement.classList.toggle("active", isLatencyCorrected);
        latencyStatusElement.textContent = isLatencyCorrected ? "Actif (20ms auto)" : "Standard";
        latencyDotElement.className = isLatencyCorrected ? "audio-status-dot active" : "audio-status-dot";
    }
}

export const toggleVisualizerSettingsDropdown = toggleSettingsDropdown;
