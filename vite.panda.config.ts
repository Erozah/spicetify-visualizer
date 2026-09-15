import { defineConfig } from "vite";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

export default defineConfig({
  plugins: [cssInjectedByJsPlugin()],
  build: {
    outDir: "dist",
    emptyOutDir: false,
    cssCodeSplit: false,
    lib: {
      entry: "packages/panda/src/main.js",
      name: "PandaVisualizer",
      formats: ["iife"],
      fileName: () => "panda-visualizer.js",
    },
    rollupOptions: {
      output: {
        extend: false,
      },
    },
  },
});
