const fs = require('fs');
let content = fs.readFileSync('src/ui/CanvasMountManager.js', 'utf8');

// Use proper non-greedy regex to delete the specific blocks
content = content.replace(/\/\*\*[\s\S]*?isGlobalCanvasMounted[\s\S]*?}/, "");
content = content.replace(/\/\*\*[\s\S]*?setGlobalCanvasVisibility[\s\S]*?}/, "");
content = content.replace(/\/\/ Backward-compatible alias\s*export const initializeCanvas = mountGlobalCanvas;/, "");

fs.writeFileSync('src/ui/CanvasMountManager.js', content.trim() + '\n');
console.log('Cleaned CanvasMountManager.js');
