import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const backend = (process.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, "");

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "src"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/proxy": {
        target: backend,
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/proxy/, ""),
      },
    },
  },
  preview: {
    port: 3000,
    proxy: {
      "/proxy": {
        target: backend,
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/proxy/, ""),
      },
    },
  },
});
