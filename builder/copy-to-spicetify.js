import os from 'os';
import fs from 'fs';
import path from 'path';

const homeDir = os.homedir();
const configExtDest = path.join(homeDir, '.config/spicetify/Extensions');
const spiceExtDest = path.join(homeDir, '.spicetify/Extensions');

const packages = [
  { src: '../dist/spicetify-visualizer-engine.js', name: 'spicetify-visualizer-engine.js' },
  { src: '../dist/visualizer-pack-cat.js', name: 'visualizer-pack-cat.js' },
  { src: '../dist/visualizer-pack-panda.js', name: 'visualizer-pack-panda.js' },
];

for (const pkg of packages) {
  const srcFile = path.join(process.cwd(), pkg.src);
  if (!fs.existsSync(srcFile)) {
    console.warn(`[copy] ${pkg.src} not found, skipping.`);
    continue;
  }
  for (const dest of [configExtDest, spiceExtDest]) {
    if (fs.existsSync(dest)) {
      fs.copyFileSync(srcFile, path.join(dest, pkg.name));
      console.log(`[copy] ${pkg.name} → ${dest}`);
    }
  }
}
