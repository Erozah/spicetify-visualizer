import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "../dist",
    emptyOutDir: false,
    lib: {
      entry: "../src/packs/panda.js",
      name: "SpicetifyVisualizerPandaPack",
      formats: ["iife"],
      fileName: () => "visualizer-pack-panda.js",
    },
    rollupOptions: { output: { extend: false } },
  },
});
