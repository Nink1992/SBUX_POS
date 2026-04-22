import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
export default defineConfig({
    base: (function () {
        var _a, _b;
        var repo = (_b = (_a = process.env.GITHUB_REPOSITORY) === null || _a === void 0 ? void 0 : _a.split("/")) === null || _b === void 0 ? void 0 : _b[1];
        return repo ? "/".concat(repo, "/") : "/";
    })(),
    plugins: [vue()],
    server: {
        port: 5173,
        strictPort: true
    }
});
