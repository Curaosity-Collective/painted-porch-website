import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { publicBuildDefines } from "./scripts/lib/public-build-env.mjs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  define: publicBuildDefines(mode),
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(), 
    svgr(), 
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
