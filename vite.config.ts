import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

// Vite adds `crossorigin` to script/link tags for ES modules. In Electron's
// file:// context this forces CORS-mode requests, which fail because file://
// carries no CORS headers. Stripping the attribute switches back to no-cors,
// which Electron allows for same-origin file:// resources.
const removeElectronCrossorigin = (): Plugin => ({
  name: "electron-remove-crossorigin",
  transformIndexHtml(html: string) {
    return html.replace(/ crossorigin(?:="[^"]*")?/g, "");
  },
});

export default defineConfig({
  plugins: [react(), tailwindcss(), removeElectronCrossorigin()],
  base: "./",
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    host: "0.0.0.0",
  },
});
