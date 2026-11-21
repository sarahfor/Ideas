import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/Ideas/",
  build: { outDir: "docs", emptyOutDir: true },
});
