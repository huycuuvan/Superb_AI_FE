import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3001,
    proxy: {
      "/api": {
        target: "https://aiemployee.site/api",
        changeOrigin: true,
      },
    },
  },
  plugins: [react() /*, mode === "development" && componentTagger()*/].filter(
    Boolean
  ),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
