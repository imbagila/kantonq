// @ts-check
import { defineConfig } from "astro/config";

import svelte from "@astrojs/svelte";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://kantonq.com",
  base: "/",
  integrations: [svelte()],
  vite: {
    plugins: [tailwindcss()],
    build: {
      // Optimize chunk size
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        output: {
          manualChunks: {
            "svelte-runtime": ["svelte"],
            "ui-icons": ["@lucide/svelte"],
            "ui-components": ["bits-ui"],
            utils: ["clsx", "tailwind-merge", "tailwind-variants"],
          },
        },
      },
    },
    // Optimize dependency pre-bundling
    optimizeDeps: {
      include: ["svelte", "bits-ui", "mode-watcher"],
    },
  },
  devToolbar: {
    enabled: false,
  },
  // Optimize output
  compressHTML: true,
});
