import { VisualizerPalettes } from '../theme/VisualizerPalettesData.js';
import { updateSettingsDropdownUI } from './SettingsDropdownBuilder.js';

export function buildSettingsDropdownHtmlMarkup() {
    
    const models = window.SpicetifyVisualizerModels || {};
    const metas = window.SpicetifyVisualizerModelsMeta || {};
    const modelKeys = Object.keys(models);
    let modelsHtml = '';
    
    for (const key of modelKeys) {
        const meta = metas[key] || {};
        let name = meta.name || key;
        let icon = meta.icon || '✨';
        modelsHtml += `<button type="button" class="model-btn" data-model="${key}"><span class="model-icon">${icon}</span><span class="model-name">${name}</span></button>`;
    }

    return `
        <div class="dropdown-header">
            <div class="dropdown-title">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
                <span>Paramètres Visualiseur</span>
            </div>
            <button type="button" class="dropdown-close-btn" title="Fermer">✕</button>
        </div>
        <details class="dropdown-section" open><summary class="section-label">Modèle Actif (Packs installés)</summary>
            <div class="model-selector-grid">
                ${modelsHtml}
            </div>
        </details>
        <details class="dropdown-section" open><summary class="section-label">Palette de Couleurs (Exclusive)</summary>
            <div class="palette-swatches-row"></div>
        </details>
        <details class="dropdown-section"><summary class="section-label">Effets d'Arrière-Plan (Indépendants)</summary>
            <div class="effects-toggle-list">
                <label class="effect-toggle-item"><span class="effect-info"><span class="effect-icon">🪐</span><span class="effect-name">Singularity Halo (WebGL2)</span></span><input type="checkbox" data-effect="singularity" class="toggle-checkbox"><span class="toggle-switch"></span></label>
                <label class="effect-toggle-item"><span class="effect-info"><span class="effect-icon">📊</span><span class="effect-name">Ondes Spectrales au Sol</span></span><input type="checkbox" data-effect="spectrumFloor" class="toggle-checkbox"><span class="toggle-switch"></span></label>
                <label class="effect-toggle-item"><span class="effect-info"><span class="effect-icon">☸️</span><span class="effect-name">Fractales & Mandalas sacrés</span></span><input type="checkbox" data-effect="fractals" class="toggle-checkbox"><span class="toggle-switch"></span></label>
                <label class="effect-toggle-item"><span class="effect-info"><span class="effect-icon">✨</span><span class="effect-name">Particules & Étoiles célestes</span></span><input type="checkbox" data-effect="stars" class="toggle-checkbox"><span class="toggle-switch"></span></label>
                <label class="effect-toggle-item"><span class="effect-info"><span class="effect-icon">🌌</span><span class="effect-name">Nébuleuse & Aura volumétrique</span></span><input type="checkbox" data-effect="nebula" class="toggle-checkbox"><span class="toggle-switch"></span></label>
                <label class="effect-toggle-item"><span class="effect-info"><span class="effect-icon">🌐</span><span class="effect-name">Grille Cyber 3D Synthwave</span></span><input type="checkbox" data-effect="grid" class="toggle-checkbox"><span class="toggle-switch"></span></label>
                <label class="effect-toggle-item"><span class="effect-info"><span class="effect-icon">💥</span><span class="effect-name">Ondes de choc sur le beat</span></span><input type="checkbox" data-effect="shockwaves" class="toggle-checkbox"><span class="toggle-switch"></span></label>
                <label class="effect-toggle-item"><span class="effect-info"><span class="effect-icon">🪵</span><span class="effect-name">Deck en bois (Plateforme sol)</span></span><input type="checkbox" data-effect="deck" class="toggle-checkbox"><span class="toggle-switch"></span></label>
            </div>
        </details>
        <details class="dropdown-section"><summary class="section-label">Source & Analyse Audio</summary>
            <button type="button" class="audio-capture-btn" id="spicetify-visualizer-dropdown-live-audio-btn" title="Activer l'analyse FFT en temps réel via microphone ou carte son">
                <span class="audio-capture-icon">🎙️</span>
                <div class="audio-capture-info"><span class="audio-capture-title">Audio Réel (Micro / Carte Son)</span><span class="audio-capture-status" id="spicetify-visualizer-dropdown-audio-status">Analyse Spotify</span></div>
                <span class="audio-status-dot" id="spicetify-visualizer-dropdown-audio-dot"></span>
            </button>
            <button type="button" class="audio-capture-btn" id="spicetify-visualizer-dropdown-latency-btn" title="Activer la compensation dynamique de latence matérielle">
                <span class="audio-capture-icon">⚡</span>
                <div class="audio-capture-info"><span class="audio-capture-title">Compensation Latence (20ms auto)</span><span class="audio-capture-status" id="spicetify-visualizer-dropdown-latency-status">Actif</span></div>
                <span class="audio-status-dot active" id="spicetify-visualizer-dropdown-latency-dot"></span>
            </button>
        </details>
        <details class="dropdown-section"><summary class="section-label">Affichage & Immersion</summary>
            <button type="button" class="fullscreen-menu-btn" id="spicetify-visualizer-dropdown-fs-btn" title="Passer le visualiseur au premier plan plein écran">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
                <div class="fs-btn-content"><span class="fs-btn-title">Plein Écran (Premier Plan)</span><span class="fs-btn-sub">Cliquez n'importe où pour quitter</span></div>
            </button>
            <button type="button" class="fullscreen-menu-btn" id="spicetify-visualizer-dropdown-pip-btn" title="Ouvrir le visualiseur dans une fenêtre Picture-in-Picture">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 11h-8v6h8v-6zm4 8V4.98C23 3.88 22.1 3 21 3H3c-1.1 0-2 .88-2 1.98V19c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2zm-2 .02H3V4.97h18v14.05z"/></svg>
                <div class="fs-btn-content"><span class="fs-btn-title">Fenêtre Détachée (PiP)</span><span class="fs-btn-sub">Miniature flottante Always-On-Top</span></div>
            </button>
        </details>
        <div class="dropdown-footer">
            <span class="footer-hint"><kbd>C</kbd> On/Off &nbsp;|&nbsp; <kbd>M</kbd> Modèle &nbsp;|&nbsp; <kbd>T</kbd> Thème &nbsp;|&nbsp; <kbd>F</kbd> Plein Écran &nbsp;|&nbsp; <kbd>P</kbd> PiP</span>
        </div>
    `;
}

export function renderPaletteSwatches(swatchesContainer, engineGetter) {
    if (!swatchesContainer) return;
    const palettes = VisualizerPalettes;
    Object.keys(palettes).forEach((paletteKey) => {
        const palette = palettes[paletteKey];
        const swatchButton = document.createElement("button");
        swatchButton.type = "button";
        swatchButton.className = "dropdown-palette-btn";
        swatchButton.setAttribute("data-palette", paletteKey);
        swatchButton.title = palette.name;
        swatchButton.style.background = `linear-gradient(135deg, ${palette.primary}, ${palette.accent})`;
        swatchButton.style.color = palette.primary;

        swatchButton.addEventListener("click", (clickEvent) => {
            clickEvent.stopPropagation();
            const visualizerEngineInstance = engineGetter();
            if (visualizerEngineInstance) {
                visualizerEngineInstance.setPalette(paletteKey);
                updateSettingsDropdownUI(visualizerEngineInstance);
            }
        });

        swatchesContainer.appendChild(swatchButton);
    });
}
