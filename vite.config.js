import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  css: {
    postcss: "./postcss.config.js",
  },
  base:
    process.env.NODE_ENV === "production"
      ? "/Website/" // 你的仓库名
      : "/",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
