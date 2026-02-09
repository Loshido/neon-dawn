import { defineConfig } from "vite"
import path from "path"

export default defineConfig({
    resolve: {
        alias: {
            "~": path.resolve(__dirname, "./src")
        }
    },
    build: {
        rolldownOptions: {
            input: {
                index: "./index.html",
                helper: "./helper/index.html"
            }
        }
    }
})