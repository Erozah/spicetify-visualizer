[Français](README.md) | [English](README.en.md)

# 🎵 Spicetify Visualizer Engine

[![Spicetify](https://img.shields.io/badge/Spicetify-Extension-success.svg?style=flat-square&logo=spotify)](https://spicetify.app/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E.svg?style=flat-square&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

A high-performance 60 FPS audio visualizer engine for **Spotify** (via Spicetify), built with vanilla JavaScript (Canvas 2D, Web Audio API), without heavy third-party frameworks.

**🔗 [LIVE WEB DEMO (Try in your browser) ↗](https://erozah.github.io/spicetify-visualizer/)**

![Visualizer Preview](https://raw.githubusercontent.com/Erozah/spicetify-visualizer/main/assets/preview.jpg) *(Generated preview of Cosmic Cat and Red Panda)*

---

## 🌟 Key Features

* **Modular Architecture (SOLID)**: Standalone graphics engine (`spicetify-visualizer-engine.js`) capable of dynamically loading custom *Mod Packs*.
* **Included Mod Packs**:
  * 🐱 **Cyber Cat / Cosmic Cat**: Drifting in deep space, featuring singularity halos, nebulae, and tail physics simulated via Verlet integration.
  * 🐼 **Red Panda**: Perched on a mossy branch in a mystical bamboo forest with glowing spores and fireflies.
* **Dynamic Album Art Palette**: Visualizer colors adapt in real time to the current Spotify playing track artwork.
* **Audio Spectral Analyzer (FFT)**: Fine-tuned frequency detection responding to kicks, snares, and high-frequency harmonics.
* **Display Modes**: Windowed mode, Fullscreen (`F`), and floating "Always On Top" mini-player (PiP, `P`).

---

## 🛠️ Spotify Installation (via Spicetify)

### Prerequisites
You must have [Spicetify](https://spicetify.app/) installed and configured on your desktop Spotify client.

### Manual Installation
1. Download compiled artifacts from [Releases](https://github.com/Erozah/spicetify-visualizer/releases) (or from the `dist/` folder if cloning the repository).
2. Copy the following files into your Spicetify `Extensions` directory (usually `~/.config/spicetify/Extensions/` or `%appdata%\spicetify\Extensions\`):
   * `spicetify-visualizer-engine.js` (Core Engine - **Required**)
   * `visualizer-pack-cat.js` (Cat Mod Pack)
   * `visualizer-pack-panda.js` (Red Panda Mod Pack)
3. Enable the extension and packs in Spicetify:
   ```bash
   spicetify config extensions spicetify-visualizer-engine.js
   spicetify config extensions visualizer-pack-cat.js
   spicetify config extensions visualizer-pack-panda.js
   spicetify apply
   ```

---

## ⌨️ Keyboard Shortcuts

When the visualizer is open inside Spotify:
- **`C`**: Toggle visualizer on / off
- **`M`**: Cycle models (Cyber Cat -> Cosmic Cat -> Red Panda)
- **`T`**: Change color themes (Cyberpunk, Aurora, Dynamic Album...)
- **`F` / `F11`**: Toggle Fullscreen
- **`P`**: Open floating Picture-in-Picture window
- **`Escape`**: Exit Fullscreen

---

## 👨‍💻 Architecture & Development

The project is structured according to **SOLID** principles.
Build packaging is powered by **Vite**, located inside the `builder/` directory to keep the repository root clean.

### Build Scripts

```bash
cd builder
npm install

# Compile engine and all mod packs and inject into local Spicetify:
npm run build
```

---

## 🤝 Contributing

Contributions and pull requests are welcome. To implement a new "Mod Pack", simply call the engine API: `window.SpicetifyVisualizerAPI.registerModel(id, instance, metadata)`.

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
