import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "../dist",
    emptyOutDir: false,
    lib: {
      entry: "../src/packs/cat.js",
      name: "SpicetifyVisualizerCatPack",
      formats: ["iife"],
      fileName: () => "visualizer-pack-cat.js",
    },
    rollupOptions: { output: { extend: false } },
  },
});
