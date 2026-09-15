import os from 'os';
import fs from 'fs';
import path from 'path';

const homeDir = os.homedir();
const configExtDest = path.join(homeDir, '.config/spicetify/Extensions');
const spiceExtDest = path.join(homeDir, '.spicetify/Extensions');

const packages = [
  { src: 'dist/cat-visualizer.js',   name: 'cat-visualizer.js' },
  { src: 'dist/panda-visualizer.js', name: 'panda-visualizer.js' },
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
