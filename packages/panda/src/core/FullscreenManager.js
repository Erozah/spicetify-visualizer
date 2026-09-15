import { PanelBoundsSynchronizer } from './PanelBoundsSynchronizer.js';

// src/core/FullscreenManager.js - Fullscreen immersion mode, OS integration and Spotify button interception
// SOLID Architecture: Dedicated manager for fullscreen state, hint notification, and click interception

export class FullscreenManager {
    static hintTimer = null;

    static showFullscreenHint() {
        let hint = document.getElementById('panda-visualizer-fs-hint');
        if (!hint) {
            hint = document.createElement('div');
            hint.id = 'panda-visualizer-fs-hint';
            hint.textContent = 'Cliquez n\'importe où pour quitter le plein écran';
            document.body.appendChild(hint);
        }
        hint.classList.add('visible');
        clearTimeout(FullscreenManager.hintTimer);
        FullscreenManager.hintTimer = setTimeout(() => {
            hint.classList.remove('visible');
        }, 3200);
    }

    static isSpotifyFullscreenButton(target) {
        if (!target) return false;

        // Never intercept clicks on our own visualizer UI controls
        if (target.closest('#panda-visualizer-settings-dropdown, .panda-visualizer-settings-dropdown, #panda-visualizer-toggle-btn, #panda-visualizer-settings-btn, #panda-visualizer-fs-hint')) {
            return false;
        }

        // Direct click on right-panel Canvas video
        if (target.tagName === 'VIDEO' && target.closest('.Root__right-sidebar, .main-nowPlayingView-container, .main-trackInfo-container')) {
            return true;
        }

        const btn = target.closest('button, a, [role="button"]');
        if (!btn) return false;

        const testId = btn.getAttribute('data-testid') || '';
        if (testId === 'fullscreen-button' || testId === 'npv-fullscreen-button' || testId === 'video-player-fullscreen-button') {
            return true;
        }

        const ariaLabel = (btn.getAttribute('aria-label') || '').toLowerCase();
        if (ariaLabel.includes('plein écran') || ariaLabel.includes('fullscreen')) {
            return true;
        }

        const title = (btn.getAttribute('title') || '').toLowerCase();
        if (title.includes('plein écran') || title.includes('fullscreen')) {
            return true;
        }

        const className = (btn.className || '');
        if (typeof className === 'string' && (className.includes('fullscreen-button') || className.includes('main-fullscreen-button') || className.includes('npv-fullscreen-button'))) {
            return true;
        }

        return false;
    }

    static setupFullscreenClickHandler(engine) {
        // 1. Intercept click anywhere while visualizer is in fullscreen to exit
        window.addEventListener('click', (e) => {
            if (engine && engine.isFullscreen && engine.isForeground) {
                e.preventDefault();
                e.stopPropagation();
                engine.toggleFullscreen(false);
                return;
            }

            // 2. Intercept Spotify native fullscreen button when visualizer is active
            if (engine && engine.isForeground && FullscreenManager.isSpotifyFullscreenButton(e.target)) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                engine.toggleFullscreen(true);
            }
        }, true);

        // 3. Listen for OS native fullscreen change
        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement && engine && engine.isFullscreen && engine.isForeground) {
                engine.toggleFullscreen(false);
            }
        });
    }

    static toggleVisualizerFullscreen(engine, forceState) {
        engine.isFullscreen = typeof forceState === 'boolean' ? forceState : !engine.isFullscreen;

        if (engine.isFullscreen && !engine.isForeground) {
            engine.toggleActive(true);
        }

        document.body.classList.toggle('panda-visualizer-fullscreen-active', engine.isFullscreen);

        try {
            if (engine.isFullscreen) {
                if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen().catch(() => {});
                }
            } else {
                if (document.fullscreenElement && document.exitFullscreen) {
                    document.exitFullscreen().catch(() => {});
                }
            }
        } catch (e) {}

        if (typeof PanelBoundsSynchronizer !== 'undefined') {
            PanelBoundsSynchronizer.syncPanelBounds(engine);
        } else if (typeof syncPanelBounds === 'function') {
            syncPanelBounds(engine);
        }

        if (engine.isFullscreen) {
            FullscreenManager.showFullscreenHint();
        }
    }
}

// Backward compatibility functional aliases
var showFullscreenHint = FullscreenManager.showFullscreenHint;
var isSpotifyFullscreenButton = FullscreenManager.isSpotifyFullscreenButton;
var setupFullscreenClickHandler = FullscreenManager.setupFullscreenClickHandler;
var toggleVisualizerFullscreen = FullscreenManager.toggleVisualizerFullscreen;
