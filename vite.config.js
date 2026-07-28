import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Photo Booth Odoi",
        short_name: "Photo Booth",
        description: "Photo booth digital — foto, video, GIF, dan boomerang langsung dari browser.",
        theme_color: "#2B0A10",
        background_color: "#2B0A10",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          {
            src: "icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // cache the app shell so it opens instantly (and works offline)
        // after the first visit — camera access itself still needs the
        // device's camera, which doesn't need internet anyway.
        globPatterns: ["**/*.{js,css,html,png,jpg,jpeg,svg,gif,webm}"],
      },
    }),
  ],
});