import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  envDir: path.resolve(__dirname, ".."),
  server: {
    port: 3000,
    host: true, // listen on all interfaces for network access (localhost + LAN IP)
  },
  build: {
    outDir: "dist",
  },
  publicDir: "public",
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./src/test-setup.ts"],
  },
});
