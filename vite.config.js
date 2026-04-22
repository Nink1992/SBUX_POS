import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "node:path";
export default defineConfig({
    base: (function () {
        var _a, _b;
        var repo = (_b = (_a = process.env.GITHUB_REPOSITORY) === null || _a === void 0 ? void 0 : _a.split("/")) === null || _b === void 0 ? void 0 : _b[1];
        return repo ? "/".concat(repo, "/") : "/";
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
