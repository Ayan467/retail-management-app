import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { miaodaDevPlugin } from "miaoda-sc-plugin";
import svgr from "vite-plugin-svgr";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  // 🔴 IMPORTANT: GitHub Pages repo name
  base: "/retail-management-app/",

  plugins: [
    react(),
    miaodaDevPlugin(),
    svgr({
      svgrOptions: {
        icon: true,
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // ✅ Optional but good practice
  build: {
    outDir: "dist",
    sourcemap: false,
  },

  server: {
    port: 5173,
    open: true,
  },
});


