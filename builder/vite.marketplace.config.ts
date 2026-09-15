import { defineConfig } from "vite";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

export default defineConfig({
  plugins: [cssInjectedByJsPlugin()],
  build: {
    outDir: "../dist",
    emptyOutDir: false,
    cssCodeSplit: false,
    lib: {
      entry: "../src/marketplace-entry.js",
      name: "SpicetifyVisualizerMarketplace",
      formats: ["iife"],
      fileName: () => "spicetify-visualizer.js",
    },
    rollupOptions: { output: { extend: false } },
  },
});
