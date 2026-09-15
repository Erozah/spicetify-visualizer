import { buildSettingsDropdownHtmlMarkup, renderPaletteSwatches } from './SettingsDropdownTemplate.js';

export let activeSettingsDropdownElement = null;

export function toggleSettingsDropdown(engineGetter) {
    if (!activeSettingsDropdownElement) activeSettingsDropdownElement = mountSettingsDropdown(engineGetter);
    activeSettingsDropdownElement.classList.contains("open") ? closeSettingsDropdown() : openSettingsDropdown(engineGetter);
}

export function openSettingsDropdown(engineGetter) {
    const engine = engineGetter();
    if (!engine || !engine.isForeground) return;

    if (!activeSettingsDropdownElement) {
        activeSettingsDropdownElement = mountSettingsDropdown(engineGetter);
    }

    updateSettingsDropdownUI(engine);
    activeSettingsDropdownElement.classList.add("open");

    const btn = document.getElementById("panda-visualizer-settings-btn");
    if (btn) {
        const rect = btn.getBoundingClientRect();
        const rightOffset = Math.max(16, window.innerWidth - rect.right - 10);
        activeSettingsDropdownElement.style.right = `${rightOffset}px`;
        activeSettingsDropdownElement.style.bottom = `${window.innerHeight - rect.top + 10}px`;
    }
}

export function closeSettingsDropdown() {
    if (activeSettingsDropdownElement) {
        activeSettingsDropdownElement.classList.remove("open");
    }
}

export function mountSettingsDropdown(engineGetter) {
    let dropdown = document.getElementById("panda-visualizer-settings-dropdown");
    if (dropdown) return dropdown;

    dropdown = document.createElement("div");
    dropdown.id = "panda-visualizer-settings-dropdown";
    dropdown.className = "panda-visualizer-settings-dropdown";
    dropdown.innerHTML = buildSettingsDropdownHtmlMarkup();

    document.body.appendChild(dropdown);

    dropdown.querySelector(".dropdown-close-btn").addEventListener("click", closeSettingsDropdown);

    const swatchesRow = dropdown.querySelector(".palette-swatches-row");
    renderPaletteSwatches(swatchesRow, engineGetter);

    dropdown.querySelectorAll(".toggle-checkbox").forEach((chk) => {
        chk.addEventListener("change", (e) => {
            e.stopPropagation();
            const effectName = chk.getAttribute("data-effect");
            const engine = engineGetter();
            if (!engine || !effectName) return;

            if (effectName === "spectrumMode") {
                engine.setEffect("spectrumMode", chk.checked ? "bars" : "wave");
            } else {
                engine.setEffect(effectName, chk.checked);
            }
        });
    });

    const liveAudioBtn = dropdown.querySelector("#panda-dropdown-live-audio-btn");
    if (liveAudioBtn) {
        liveAudioBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            const engine = engineGetter();
            if (engine && engine.audio) {
                if (engine.audio.toggleLiveAudio) {
                    await engine.audio.toggleLiveAudio();
                } else if (engine.audio.webAudioBridge) {
                    if (engine.audio.webAudioBridge.isAudioSourceConnected) {
                        engine.audio.disconnectLiveSource();
                    } else if (typeof navigator !== "undefined" && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                        try {
                            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                            engine.audio.connectLiveSource(stream);
                        } catch (err) {}
                    }
                }
                updateSettingsDropdownUI(engine);
            }
        });
    }

    const latencyBtn = dropdown.querySelector("#panda-dropdown-latency-btn");
    if (latencyBtn) {
        latencyBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const engine = engineGetter();
            if (engine && engine.audio && typeof engine.audio.toggleLatencyCorrection === "function") {
                engine.audio.toggleLatencyCorrection();
                updateSettingsDropdownUI(engine);
            }
        });
    }

    const fsBtn = dropdown.querySelector("#panda-dropdown-fs-btn");
    if (fsBtn) {
        fsBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const engine = engineGetter();
            if (engine) {
                closeSettingsDropdown();
                engine.toggleFullscreen(true);
            }
        });
    }

    const pipBtn = dropdown.querySelector("#panda-dropdown-pip-btn");
    if (pipBtn) {
        pipBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const engine = engineGetter();
            if (engine && typeof engine.togglePictureInPicture === "function") {
                closeSettingsDropdown();
                engine.togglePictureInPicture();
            }
        });
    }

    document.addEventListener("click", (e) => {
        if (!dropdown.classList.contains("open")) return;
        if (dropdown.contains(e.target) || e.target.closest("#panda-visualizer-settings-btn")) return;
        closeSettingsDropdown();
    });

    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && dropdown.classList.contains("open")) {
            closeSettingsDropdown();
        }
    });

    return dropdown;
}

export function updateSettingsDropdownUI(engine) {
    if (!activeSettingsDropdownElement || !engine) return;

    const activePaletteId = engine.paletteManager.active ? engine.paletteManager.active.id : "bamboo";
    activeSettingsDropdownElement.querySelectorAll(".dropdown-palette-btn").forEach((btn) => {
        const key = btn.getAttribute("data-palette");
        btn.classList.toggle("active", key === activePaletteId);
    });

    const effects = engine.env.effects || {};
    activeSettingsDropdownElement.querySelectorAll(".toggle-checkbox").forEach((chk) => {
        const key = chk.getAttribute("data-effect");
        if (key === "spectrumMode") {
            chk.checked = effects.spectrumMode === "bars";
        } else {
            chk.checked = Boolean(effects[key]);
        }
    });

    const isLive = engine.audio ? engine.audio.isLiveAudioActive() : false;
    const audioStatusEl = activeSettingsDropdownElement.querySelector("#panda-dropdown-audio-status");
    const audioDotEl = activeSettingsDropdownElement.querySelector("#panda-dropdown-audio-dot");
    const audioBtnEl = activeSettingsDropdownElement.querySelector("#panda-dropdown-live-audio-btn");
    if (audioStatusEl && audioDotEl && audioBtnEl) {
        audioBtnEl.classList.toggle("active", isLive);
        audioStatusEl.textContent = isLive ? "FFT Temps Réel (Actif)" : "Analyse Locale Spotify";
        audioDotEl.className = isLive ? "audio-status-dot active" : "audio-status-dot";
    }

    const isLatencyActive = engine.audio && typeof engine.audio.isLatencyCorrectionActive === "function"
        ? engine.audio.isLatencyCorrectionActive()
        : false;
    const latencyStatusEl = activeSettingsDropdownElement.querySelector("#panda-dropdown-latency-status");
    const latencyDotEl = activeSettingsDropdownElement.querySelector("#panda-dropdown-latency-dot");
    const latencyBtnEl = activeSettingsDropdownElement.querySelector("#panda-dropdown-latency-btn");
    if (latencyStatusEl && latencyDotEl && latencyBtnEl) {
        latencyBtnEl.classList.toggle("active", isLatencyActive);
        latencyStatusEl.textContent = isLatencyActive ? "Actif (20ms auto)" : "Désactivé";
        latencyDotEl.className = isLatencyActive ? "audio-status-dot active" : "audio-status-dot";
    }
}

export const togglePandaSettingsDropdown = toggleSettingsDropdown;
