import { defineConfig } from "vite";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

export default defineConfig({
  plugins: [cssInjectedByJsPlugin()],
  build: {
    outDir: "dist",
    emptyOutDir: false,
    cssCodeSplit: false,
    lib: {
      entry: "packages/cat/src/main.js",
      name: "CatVisualizer",
      formats: ["iife"],
      fileName: () => "cat-visualizer.js",
    },
    rollupOptions: {
      output: {
        extend: false,
      },
    },
  },
});
