import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "node:path";

export default defineConfig({
  base: (() => {
    const repo = process.env.GITHUB_REPOSITORY?.split("/")?.[1];
    return repo ? `/${repo}/` : "/";
  })(),
  plugins: [vue()],
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        notFound: resolve(__dirname, "404.html")
      }
    }
  },
  server: {
    port: 5173,
    strictPort: true
  }
});
