import { defineConfig } from "vite"
import path from "path"

export default defineConfig({
    resolve: {
        alias: {
            "~": path.resolve(__dirname, "./simulation")
        }
    },
    build: {
        rolldownOptions: {
            input: {
                simulation: "./simulation/index.html",
                interface: "./index.html"
            }
        }
    }
})