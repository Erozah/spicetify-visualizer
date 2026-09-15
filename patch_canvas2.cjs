const fs = require('fs');
let content = fs.readFileSync('src/ui/CanvasMountManager.js', 'utf8');

const target1 = `/**
 * Verifies if the global visualizer canvas is currently attached to the DOM.
 * @returns {boolean}
 */
export function isGlobalCanvasMounted() {
    return !!document.getElementById("cyber-cat-canvas");
}`;

const target2 = `/**
 * Ensures canvas visibility matches active state without breaking DOM structure.
 * @param {boolean} isVisualizerForeground
 */
export function setGlobalCanvasVisibility(isVisualizerForeground) {
    const canvasElement = getGlobalMountedCanvas();
    if (canvasElement) {
        canvasElement.style.display = isVisualizerForeground ? "block" : "none";
    }
}`;

const target3 = `// Backward-compatible alias
export const initializeCanvas = mountGlobalCanvas;`;

content = content.replace(target1, "");
content = content.replace(target2, "");
content = content.replace(target3, "");

fs.writeFileSync('src/ui/CanvasMountManager.js', content.trim() + '\n');
console.log('Cleaned CanvasMountManager.js');
