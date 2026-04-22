import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  base: (() => {
    const repo = process.env.GITHUB_REPOSITORY?.split("/")?.[1];
    return repo ? `/${repo}/` : "/";
  })(),
  plugins: [vue()],
  server: {
    port: 5173,
    strictPort: true
  }
});
