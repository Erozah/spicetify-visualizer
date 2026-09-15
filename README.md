# 🎵 Spicetify Visualizers

Monorepo of audio visualizer extensions for [Spicetify](https://spicetify.app/) — reactive live wallpapers that animate to your music.

## Packages

| Extension | Description | Dist |
|---|---|---|
| [🐱 Cat Visualizer](packages/cat/) | Cyber & Cosmic cats with reactive audio effects | `dist/cat-visualizer.js` |
| [🐼 Panda Visualizer](packages/panda/) | Mystic Red Panda in an enchanted forest | `dist/panda-visualizer.js` |

## Installation (Spicetify Marketplace)

Search for **"Cat Visualizer"** or **"Panda Visualizer"** in the Spicetify Marketplace.

## Manual Installation

Copy the compiled extension to Spicetify's Extensions folder:

```bash
# Linux / macOS
cp dist/cat-visualizer.js ~/.config/spicetify/Extensions/
cp dist/panda-visualizer.js ~/.config/spicetify/Extensions/

spicetify apply
```

## Development

```bash
npm install

# Build all extensions
npm run build

# Build a single extension
npm run build:cat
npm run build:panda

# Dev server (hot reload)
npm run dev:cat
npm run dev:panda
```

## Project Structure

```
spicetify-visualizers/
├── packages/
│   ├── cat/        ← Cyber & Cosmic Cat source
│   │   └── src/    (audio, core, backgrounds, models, ui, theme, styles)
│   └── panda/      ← Red Panda source
│       └── src/    (audio, core, backgrounds, models, ui, theme, styles)
├── dist/
│   ├── cat-visualizer.js    ← compiled, ready for Spicetify
│   └── panda-visualizer.js
├── vite.cat.config.ts
├── vite.panda.config.ts
└── copy-to-spicetify.js     ← auto-deploys after build
```

## Adding a New Extension

1. Create `packages/<name>/src/main.js`
2. Add `vite.<name>.config.ts`
3. Add build scripts in `package.json`
4. Add `packages/<name>/manifest.json`

## License

MIT — see [LICENSE](LICENSE)
