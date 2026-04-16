import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { miaodaDevPlugin } from "miaoda-sc-plugin";
import svgr from "vite-plugin-svgr";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  // ✅ Vercel/Netlify ke liye root path
  base: "/",

  plugins: [
    react(),

    // ✅ Sirf local dev mein chalega, Netlify build mein nahi
    process.env.NODE_ENV !== "production" && miaodaDevPlugin(),

    svgr({
      svgrOptions: {
        icon: true,
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ].filter(Boolean), // ✅ false values hata deta hai

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // ✅ Production build settings
  build: {
    outDir: "dist",
    sourcemap: false,
  },

  server: {
    port: 5173,
    open: true,
  },
});
