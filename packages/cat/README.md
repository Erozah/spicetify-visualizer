# 🐱 Cyber & Cosmic Cat Visualizer (Canvas 2D & Spicetify)

[![Live Demo](https://img.shields.io/badge/Live_Demo-GitHub_Pages-00f0ff?style=for-the-badge&logo=github)](https://erozah.github.io/cosmic-cat-visualizer/)
[![Canvas](https://img.shields.io/badge/Render-Canvas_2D_60FPS-blueviolet?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
[![Audio](https://img.shields.io/badge/Audio-Spotify_Player_Events-ff007f?style=for-the-badge)](https://spicetify.app/)
[![License](https://img.shields.io/badge/License-MIT-00f0ff?style=for-the-badge)](LICENSE)

Visualiseur musical immersif haute performance pour Spotify via Spicetify (et utilisable directement en ligne dans votre navigateur).
Architecture modulaire SOLID, modèles félins interchangeables, décors composables paramétrables et intégration transparente.

---

### 🌐 [Tester le Visualiseur en Ligne (Live Demo)](https://erozah.github.io/cosmic-cat-visualizer/)

Vous pouvez tester le visualiseur directement sans installer Spotify ni Spicetify :
- **En ligne via GitHub Pages** : **[erozah.github.io/cosmic-cat-visualizer](https://erozah.github.io/cosmic-cat-visualizer/)**
- **En local** : Ouvrez simplement le fichier `index.html` dans votre navigateur Web (Chrome, Firefox, Edge).

Trois modes audio interactifs sont intégrés pour la démo autonome :
1. 🎵 **Beat Synth** : Boucle musicale synthwave 124 BPM générée en temps réel par la Web Audio API (kick, caisse claire, basse cyber).
2. 🎙️ **Micro** : Connectez votre microphone pour animer le chat avec votre voix ou vos haut-parleurs.
3. 📂 **Fichier** : Chargez n'importe quel fichier audio local (MP3, FLAC, WAV...).

---

## 🏗️ Architecture du Projet (`src/`)

L'ensemble de la logique est découpé en modules dédiés selon les principes SOLID dans le répertoire `src/` :

```
src/
├── audio/
│   ├── AudioEngine.js        # Orchestration audio & synchronisation d'état
│   ├── envelopeFollower.js   # Suivi d'enveloppe, lissage des bandes & respiration
│   ├── spotifyHooks.js       # Écouteurs d'événements Spicetify Player
│   ├── tempoEstimator.js     # Estimation algorithmique du BPM
│   └── WebAudioBridge.js     # Pont Web Audio API (synthétiseur, micro, flux média)
├── backgrounds/
│   ├── BackgroundManager.js  # Orchestration des calques composables & toggles indépendants
│   ├── CosmicNebula.js       # Nébuleuse atmosphérique volumétrique
│   ├── CosmicStar.js         # Particules stellaires & scintillation
│   ├── CyberGrid.js          # Grille 3D synthwave en perspective
│   ├── SacredFractals.js     # Mandalas de géométrie sacrée rotatifs
│   └── Shockwave.js          # Ondes de choc radiales sur les beats
├── core/
│   ├── fullscreenManager.js  # Bascule plein écran immersif & notifications
│   ├── keybindings.js        # Raccourcis clavier globaux (C, M, T, F)
│   ├── panelBounds.js        # Synchronisation DPR & dimensions sur la vue centrale
│   ├── renderPipeline.js     # Pipeline d'aiguillage des passes de rendu
│   ├── uiSync.js             # Synchronisation de l'état avec l'interface DOM
│   └── VisualizerEngine.js   # Boucle d'animation principale 60 FPS
├── models/
│   ├── cosmic/
│   │   ├── catBodyPath.js          # Courbes de Bézier du corps félin vu de dos
│   │   ├── catContourRenderer.js   # Contours néon multi-passes ultra-lumineux
│   │   ├── catDeformation.js       # Déformation audio-réactive & respiration
│   │   ├── catEarRenderer.js       # Contours d'oreilles & touffes lumineuses
│   │   ├── CatGeometry.js          # Façade géométrique & repères anatomiques
│   │   ├── catInteriorRenderer.js  # Corps stellaire, cœur pulsar & colonne vertébrale
│   │   ├── CosmicCat.js            # Modèle polymorphe Cosmic Cat
│   │   ├── deckLighting.js         # Ligne d'horizon, reflets spéculaires & ombre
│   │   ├── deckPlanks.js           # Lattes de bois, veinage texturé & clous
│   │   ├── tailKinematics.js       # Cinématique féline en S & contrainte du sol
│   │   ├── tailPathBuilder.js      # Courbe Catmull-Rom fermée sans allocations
│   │   ├── TailPhysics.js          # Façade physique de la queue
│   │   ├── tailRenderer.js         # Rendu néon de la queue & touffe lumineuse
│   │   ├── tailSparks.js           # Particules d'étincelles du bout de queue
│   │   └── WoodenDeck.js           # Plateforme sol indépendante (découplée)
│   └── cyber/
│       ├── constellationData.js    # Nœuds & liens de la constellation
│       ├── cyberAura.js            # Aura diffuse du corps cyber
│       ├── CyberCat.js             # Modèle polymorphe Cyber Cat (vu de face)
│       ├── cyberConstellation.js   # Étoiles, liens & pulsation cardiaque
│       ├── cyberContours.js        # Lignes néon du corps & chevrons
│       ├── cyberEyes.js            # Yeux clignotants & pupilles réactives
│       ├── cyberHead.js            # Polygone de tête, oreilles réactives & diamant
│       ├── cyberTail.js            # Queue néon segmentée & faisceau lumineux
│       └── cyberWhiskers.js        # Moustaches vibrantes audio-réactives
├── styles/
│   ├── canvas.css            # Styles du canvas 100vw × 100vh à la racine
│   ├── dropdown.css          # Menu déroulant de paramètres glassmorphic
│   ├── fullscreen.css        # Styles d'immersion plein écran & toast
│   ├── main.css              # Index des styles
│   ├── mainView.css          # Occultation propre du contenu Spotify en mode actif
│   ├── playbar.css           # Boutons de la barre de lecture
│   ├── root.css              # Variables racine & disposition Spotify
│   └── transparency.css      # Transparence glassmorphic des sidebars et barres
├── theme/
│   ├── paletteHelpers.js     # Décorateurs alpha RGBA dynamiques
│   ├── PaletteManager.js     # Gestionnaire d'état des palettes
│   └── palettesData.js       # Définition des palettes chromatiques
└── ui/
    ├── canvasMount.js        # Montage persistant du canvas global pleine fenêtre
    ├── extension.js          # Point d'entrée & cycle de vie Spicetify
    ├── playbarButtons.js     # Les 2 boutons discrets de la barre de lecture
    └── settingsDropdown.js   # Panneau déroulant de configuration (modèle, couleurs, effets)
```

---

## ✨ Fonctionnalités Clés

### 1. Deux Boutons Discrets & Menu Déroulant Glassmorphic
L'interface utilisateur dans Spotify se compose exclusivement de **2 boutons discrets** situés dans la barre de lecture en bas à droite :
- **Bouton On / Off** : Active le visualiseur en plein écran d'arrière-plan ou le met en pause (0% de charge CPU).
- **Bouton Paramètres ⚙️** : Ouvre un panneau déroulant glassmorphic permettant de configurer en temps réel :
  - **Modèle de Chat (Exclusif)** : Choisir entre `🐱 Cyber Cat` et `🌌 Cosmic Cat` (activer l'un désactive l'autre).
  - **Palette de Couleurs (Exclusive)** : Sélectionner instantanément le thème chromatique souhaité.
  - **Effets d'Arrière-Plan (Indépendants)** : Activer/désactiver à la carte les fractales, les étoiles, la nébuleuse, la grille 3D synthwave, les ondes de choc et le deck en bois.

### 2. Deux Modèles Félins Polymorphes
- **🐱 Cyber Cat** : Silhouette cyberpunk vue de face avec tête polygonale, oreilles tressaillantes, yeux clignotants réactifs aux médiums, moustaches vibrantes et constellation corporelle avec pulsation cardiaque synchronisée au beat.
- **🌌 Cosmic Cat** : Chat assis vu de dos avec colonne vertébrale lumineuse, oreilles néon éclatantes et queue cinématique organique ondulant avec la physique de rythme.

### 3. Effets Visuels d'Arrière-Plan Découplés
- **☸️ Fractales & Mandalas sacrés** : Géométrie sacrée rotative réagissant aux fréquences.
- **✨ Particules & Étoiles célestes** : Scintillement stellaire audio-réactif.
- **🌌 Nébuleuse & Aura volumétrique** : Brumes cosmiques vaporeuses et anneaux d'énergie.
- **🌐 Grille Cyber 3D Synthwave** : Lignes de fuite perspective en mouvement.
- **💥 Ondes de choc sur le beat** : Pulsations radiales explosives synchronisées sur les drops.
- **🪵 Deck en bois (Plateforme sol)** : Plancher de bois texturé avec reflets spéculaires et ombre de contact sous le chat, activable aussi bien sur Cosmic Cat que sur Cyber Cat.

---

## ⌨️ Raccourcis Clavier & Contrôles

| Raccourci | Action |
| :--- | :--- |
| <kbd>C</kbd> | Activer / Mettre en pause le visualiseur (On / Off) |
| <kbd>M</kbd> | Alterner le modèle félin (**Cyber Cat** ⇄ **Cosmic Cat**) |
| <kbd>T</kbd> | Changer de palette de couleurs |
| <kbd>F</kbd> | Basculer en mode Plein Écran immersif |
| <kbd>Échap</kbd> | Quitter le mode Plein Écran ou fermer les paramètres |

---

## 🛠️ Compilation & Déploiement

Le script `build.py` assemble automatiquement tous les modules de `src/` en un seul bundle optimisé `dist/cat-visualizer.js` et le synchronise dans les extensions Spicetify :

```bash
# Compiler le bundle et l'injecter dans Spicetify
python3 build.py

# Appliquer à Spotify
spicetify apply
```
