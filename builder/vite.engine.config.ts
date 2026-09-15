import { defineConfig } from "vite";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

export default defineConfig({
  plugins: [cssInjectedByJsPlugin()],
  build: {
    outDir: "../dist",
    emptyOutDir: false,
    cssCodeSplit: false,
    lib: {
      entry: "../src/main.js",
      name: "SpicetifyVisualizer",
      formats: ["iife"],
      fileName: () => "spicetify-visualizer-engine.js",
    },
    rollupOptions: { output: { extend: false } },
  },
});
