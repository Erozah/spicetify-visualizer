# 🎵 Spicetify Visualizer Engine

[![Spicetify](https://img.shields.io/badge/Spicetify-Extension-success.svg?style=flat-square&logo=spotify)](https://spicetify.app/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E.svg?style=flat-square&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

Un moteur de visualisation audio 60 FPS pour **Spotify** (via Spicetify), entièrement codé en JavaScript (Canvas 2D, Web Audio API), sans aucun framework lourd.

**🔗 [DÉMO EN LIGNE (Testez dans votre navigateur) ↗](https://erozah.github.io/spicetify-visualizer/)**

![Aperçu du Visualiseur](https://raw.githubusercontent.com/Erozah/spicetify-visualizer/main/assets/preview.gif) *(Si l'image n'est pas disponible, imaginez un superbe chat cosmique réagissant aux basses)*

---

## 🌟 Fonctionnalités

* **Architecture Modulaire (SOLID)** : Moteur graphique isolé (`spicetify-visualizer-engine.js`) pouvant charger dynamiquement différents *Mod Packs*.
* **Mod Packs Inclus** :
  * 🐱 **Cyber Cat / Cosmic Cat** : Dans l'espace, avec un halo de singularité, des nébuleuses, et une queue générée via une physique de Verlet.
  * 🐼 **Red Panda** : Perché sur une branche moussue au cœur d'une forêt de bambous mystique avec particules de spores lumineuses et lucioles.
* **Extraction dynamique de pochette d'album** : La couleur du visualiseur s'adapte en temps réel à l'album en cours de lecture.
* **Analyseur Spectral Audio (FFT)** : Réaction millimétrée aux basses (Kicks), percussions (Snares) et hautes fréquences.
* **Modes d'affichage** : Mode fenêtré, Plein Écran (`F`), et mini-lecteur flottant "Always On Top" (PiP, `P`).

---

## 🛠️ Installation pour Spotify (via Spicetify)

### Prérequis
Vous devez avoir [Spicetify](https://spicetify.app/) installé sur votre version de bureau de Spotify.

### Installation Manuel
1. Téléchargez les fichiers compilés depuis les [Releases](https://github.com/Erozah/spicetify-visualizer/releases) (ou via le dossier `dist/` si vous clonez le dépôt).
2. Placez les fichiers suivants dans votre dossier `Extensions` de Spicetify (généralement `~/.config/spicetify/Extensions/` ou `%appdata%\spicetify\Extensions\`) :
   * `spicetify-visualizer-engine.js` (Le Moteur Graphique - **Obligatoire**)
   * `visualizer-pack-cat.js` (Mod Pack Chat)
   * `visualizer-pack-panda.js` (Mod Pack Panda)
3. Activez le moteur et les packs dans Spicetify :
   ```bash
   spicetify config extensions spicetify-visualizer-engine.js
   spicetify config extensions visualizer-pack-cat.js
   spicetify config extensions visualizer-pack-panda.js
   spicetify apply
   ```

---

## ⌨️ Raccourcis Clavier

Une fois le visualiseur ouvert dans Spotify :
- **`C`** : Activer / Désactiver le visualiseur
- **`M`** : Changer de modèle (Cyber Cat -> Cosmic Cat -> Red Panda)
- **`T`** : Changer le thème de couleurs (Cyberpunk, Aurora, Album dynamique...)
- **`F` / `F11`** : Basculer en Plein Écran
- **`P`** : Ouvrir en mode PiP (Picture-in-Picture) flottant
- **`Echap`** : Quitter le Plein Écran

---

## 👨‍💻 Architecture & Développement (Pour les curieux)

Le projet a été entièrement refactorisé pour suivre les principes **SOLID**.
La compilation est gérée par **Vite**, cachée dans le dossier `builder/` pour maintenir la racine du projet parfaitement propre.

### Scripts de build

```bash
cd builder
npm install

# Tout compiler (Moteur + Tous les Packs) et injecter dans Spicetify :
npm run build
```

---

## 🤝 Contribution

Les pull requests sont les bienvenues ! Pour créer un nouveau "Mod Pack", il suffit d'utiliser la fonction globale exposée par le moteur `window.SpicetifyVisualizerAPI.registerModel(id, instance, metadata)`.

## 📜 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.
