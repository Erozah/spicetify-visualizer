# 🎋 Red Panda & Mystic Forest Visualizer (Canvas 2D & Spicetify)

![Preview](dist/preview.png)

[![Live Demo](https://img.shields.io/badge/Live_Demo-GitHub_Pages-10b981?style=for-the-badge&logo=github)](https://erozah.github.io/spicetify-visualizer-redpanda/)
[![Canvas](https://img.shields.io/badge/Render-Canvas_2D_60FPS-059669?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
[![Audio](https://img.shields.io/badge/Audio-Spotify_Player_Events-10b981?style=for-the-badge)](https://spicetify.app/)
[![License](https://img.shields.io/badge/License-MIT-34d399?style=for-the-badge)](LICENSE)

Visualiseur musical immersif et arrière-plan animé haute performance pour Spotify via Spicetify (et utilisable directement en ligne dans votre navigateur Web).
Architecture modulaire respectant strictement les principes **SOLID**, modèle procédural vivant d'un adorable **Panda Roux**, forêt de bambous mystique multi-calques composable et intégration transparente à l'interface de Spotify.

---

### 🌐 [Tester le Visualiseur en Ligne (Live Demo)](https://erozah.github.io/spicetify-visualizer-redpanda/)

Vous pouvez tester le visualiseur sans installer Spotify ni Spicetify :
- **En ligne via GitHub Pages** : **[erozah.github.io/spicetify-visualizer-redpanda](https://erozah.github.io/spicetify-visualizer-redpanda/)**
- **En local** : Ouvrez simplement le fichier `index.html` dans votre navigateur Web (Chrome, Firefox, Edge).

Trois modes audio interactifs sont intégrés pour la démo autonome :
1. 🎵 **Beat Synth** : Boucle musicale 120 BPM générée en temps réel par la Web Audio API (kick basse fréquence, claquement de percussion en bambou, arpège de basse forestière mélodique).
2. 🎙️ **Micro** : Connectez votre microphone pour animer le panda roux avec votre voix ou la musique de votre pièce.
3. 📂 **Fichier** : Chargez n'importe quel fichier audio local (MP3, FLAC, WAV, OGG...).

---

## 🏗️ Architecture du Projet (`src/`)

L'ensemble de la logique est découpé en 29 modules JavaScript et 7 modules CSS dédiés selon les principes SOLID dans le répertoire `src/` :

```
src/
├── audio/
│   ├── AudioEngine.js        # Orchestration audio & synchronisation d'état de lecture
│   ├── envelopeFollower.js   # Suivi d'enveloppe, lissage des bandes & respiration
│   ├── spotifyAnalysis.js    # Analyseur audio avancé Spotify (segments, beats, tatums)
│   ├── spotifyHooks.js       # Écouteurs d'événements Spicetify Player (play, pause, track change)
│   ├── tempoEstimator.js     # Estimation algorithmique du tempo et BPM en temps réel
│   └── WebAudioBridge.js     # Pont Web Audio API (micro, synthétiseur, fichier local)
├── backgrounds/
│   ├── BackgroundManager.js  # Orchestration des calques de forêt & toggles indépendants
│   ├── CameraShake.js        # Secousses cinématiques d'impact de caméra sur les drops
│   ├── EqualizerWaves.js     # Vagues et ondes d'égaliseur aquatiques / brumeuses
│   ├── MossyPerch.js         # Branche moussue & perchoir naturel organique
│   ├── MysticForest.js       # Forêt de bambous, brume sylvestre, lucioles & feuillage
│   ├── Shockwave.js          # Ondes de choc radiales synchronisées sur les beats
│   ├── SupernovaBurst.js     # Éruptions et particules d'énergie lumineuse
│   └── VolumetricGodrays.js  # Rayons crépusculaires volumétriques traversant la canopée
├── core/
│   ├── fullscreenManager.js  # Bascule plein écran immersif & notifications toast
│   ├── keybindings.js        # Raccourcis clavier globaux (A, T, F, Esc)
│   ├── panelBounds.js        # Synchronisation DPR & dimensions sur la vue centrale
│   ├── renderPipeline.js     # Pipeline d'aiguillage des passes de rendu
│   ├── uiSync.js             # Synchronisation d'état avec les éléments du DOM
│   └── VisualizerEngine.js   # Boucle d'animation principale 60 FPS & cycle de vie
├── models/
│   └── redpanda/
│       ├── RedPanda.js       # Modèle procédural du Panda Roux (tête, museau, joues, oreilles, yeux)
│       └── RedPandaTail.js   # Queue annelée rousse avec cinématique pendulaire & physique d'inertie
├── styles/
│   ├── canvas.css            # Styles du canvas 100vw × 100vh fixé en arrière-plan
│   ├── dropdown.css          # Menu déroulant de configuration glassmorphic forestier
│   ├── fullscreen.css        # Styles d'immersion plein écran & toast de notification
│   ├── main.css              # Index des feuilles de styles
│   ├── mainView.css          # Occultation propre du contenu Spotify en mode actif
│   ├── playbar.css           # Boutons discrets de la barre de lecture Spotify
│   ├── root.css              # Variables racine & disposition générale
│   └── transparency.css      # Transparence glassmorphic des barres latérales et contrôles
├── theme/
│   ├── paletteHelpers.js     # Décorateurs alpha RGBA dynamiques
│   ├── PaletteManager.js     # Gestionnaire d'état et transitions des palettes
│   └── palettesData.js       # Définition des 8 palettes chromatiques thématiques
└── ui/
    ├── canvasMount.js        # Montage persistant du canvas global pleine fenêtre
    ├── extension.js          # Point d'entrée & cycle de vie Spicetify
    ├── playbarButtons.js     # Les 2 boutons discrets de la barre de lecture
    └── settingsDropdown.js   # Panneau déroulant de configuration (palettes, effets, perchoir)
```

---

## ✨ Fonctionnalités Clés

### 1. Deux Boutons Discrets & Menu Déroulant Glassmorphic
L'intégration dans Spotify s'intègre harmonieusement sans surcharger l'interface :
- **Bouton Panda (On / Off)** : Active le visualiseur en arrière-plan dynamique ou le met en veille (0% de charge CPU dès que la musique est en pause ou l'extension désactivée).
- **Bouton Paramètres ⚙️** : Ouvre un menu déroulant glassmorphic permettant de configurer en temps réel :
  - **Palettes de Couleurs** : Sélection exclusive instantanée parmi 8 palettes thématiques.
  - **Calques & Effets Sylvestres (Indépendants)** : Activez ou désactivez à la carte la forêt de bambous, les rayons volumétriques, les feuilles tombantes, les spores et lucioles lumineuses, l'égaliseur spectral fluide, les ondes de choc, le perchoir moussu et les secousses cinématiques de caméra.

### 2. Modèle Procédural Réactif du Panda Roux
- **Anatomie Expressive** : Silhouette soignée avec bajoues blanches, museau détaillé, oreilles touffues qui tressaillent subtilement sur les fréquences aiguës, et yeux animés réactifs aux médiums.
- **Queue Annelée Organique** : Queue volumineuse à anneaux contrastés animée par une cinématique pendulaire multi-segments et physique d'inertie calée sur le groove.
- **Respiration & Enveloppe** : Contraction et dilatation thoraciques naturelles pilotées par le suivi d'enveloppe audio.

### 3. Environnement Sylvestre Composable
- **🎋 Forêt de Bambous Multi-Plans** : Troncs texturés avec segments et nœuds en perspective atmosphérique.
- **☀️ Rayons Crépusculaires Volumétriques (Godrays)** : Faisceaux lumineux traversant la canopée et pulsant sur le rythme.
- **🍃 Feuilles Flottantes & Lucioles** : Particules organiques de feuilles de bambou tourbillonnantes et spores scintillantes.
- **🪨 Perchoir Moussu Naturel** : Plateforme rocheuse recouverte de mousse avec reflets spéculaires sous le panda (désactivable pour reposer directement sur le sol brumeux).
- **🌊 Vagues d'Égaliseur Fluides** : Ondulations sinusoïdales spectrales au bas de l'écran.
- **💥 Ondes de Choc & Camera Shake** : Impulsions explosives sur les kicks et vibrations de caméra sur les basses puissantes.

### 4. Huit Palettes Chromatiques
1. **🎋 Bambou Émeraude** : Nuances végétales de jade profond, vert menthe et rosée matinale.
2. **🍁 Automne Roux** : Teintes fauves, orange panda roux, ambre doré et pourpre érable.
3. **🌸 Sakura Zen** : Douceur florale rose pétale, lavande brumeuse et blanc starlight.
4. **⚡ Cyberpunk Neon** : Cyan laser électrique, rose fuchsia intense et violet sombre.
5. **🌌 Emerald Aurora** : Menthe polaire radieuse, violet mystique et aurore boréale.
6. **☀️ Solar Flare** : Or solaire éclatant, rose plasma et orange ardent.
7. **🌠 Celestial Galaxy** : Bleu astral, magenta galactique et violet cosmique.
8. **💎 Amethyst Prism** : Éclat d'améthyste néon, lilas cristallin et pourpre abyssal.

---

## ⌨️ Raccourcis Clavier & Contrôles

| Raccourci | Action |
| :---: | :--- |
| <kbd>P</kbd> | Activer / Mettre en pause le visualiseur Panda |
| <kbd>T</kbd> | Changer cycliquement de palette de couleurs (quand le Panda est actif) |
| <kbd>F</kbd> | Basculer en mode Plein Écran immersif (quand le Panda est actif) |
| <kbd>Échap</kbd> | Quitter le mode Plein Écran ou fermer le panneau de paramètres |

---

## 📦 Installation & Déploiement Spicetify

### Méthode 1 : Via Spicetify CLI (Recommandée)

1. Clonez ce dépôt ou téléchargez le fichier `dist/panda-visualizer.js` :
   ```bash
   git clone git@github.com:Erozah/spicetify-visualizer-redpanda.git
   ```

2. Copiez `dist/panda-visualizer.js` dans le dossier des extensions Spicetify :
   ```bash
   # Sur Linux / macOS :
   cp dist/panda-visualizer.js ~/.config/spicetify/Extensions/

   # Sur Windows (PowerShell) :
   # Copy-Item dist\panda-visualizer.js $env:APPDATA\spicetify\Extensions\
   ```

3. Activez l'extension et appliquez les modifications :
   ```bash
   spicetify config extensions panda-visualizer.js
   spicetify apply
   ```

### Méthode 2 : Spicetify Marketplace
Ce visualiseur inclut un fichier `manifest.json` standardisé pour être publié et installé directement depuis le **Spicetify Marketplace**.

---

## 🛠️ Compilation Locale

Pour recompiler le bundle après avoir modifié un module dans `src/` :

```bash
# Exécuter le script de build (concaténation CSS/JS & copie vers Spicetify)
python3 build.py

# Recharger Spotify
spicetify apply
```

---

## 📄 Licence

Projet distribué sous licence [MIT](LICENSE). Développé avec passion par [Erozah](https://github.com/Erozah).
