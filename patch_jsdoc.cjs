const fs = require('fs');
let content = fs.readFileSync('src/ui/CanvasMountManager.js', 'utf8');

content = content.replace(/\/\*\*[\s\S]*?\* Verifies if the global visualizer canvas is currently attached to the DOM\.[\s\S]*?\*\/[\s\n]*/, "");
content = content.replace(/\/\*\*[\s\S]*?\* Ensures canvas visibility matches active state without breaking DOM structure\.[\s\S]*?\*\/[\s\n]*/, "");
content = content.replace(/\/\/ Backward-compatible alias[\s\n]*/, "");

fs.writeFileSync('src/ui/CanvasMountManager.js', content.trim() + '\n');
console.log('Cleaned CanvasMountManager.js');
