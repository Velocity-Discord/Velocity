import { nodeResolve } from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import { defineConfig } from "rollup";
import json from "@rollup/plugin-json";
import sucrase from "@rollup/plugin-sucrase";

export default defineConfig([
    {
        input: "packages/renderer/index.js",
        output: {
            file: "packages/out/renderer.js",
            format: "cjs",
        },
        plugins: [
            sucrase({
                exclude: ["node_modules/**"],
                transforms: ["jsx"],
                jsxPragma: "window.React.createElement",
                jsxFragmentPragma: "window.React.Fragment",
                production: true,
            }),
            terser(),
            nodeResolve(),
        ],
    },
    {
        input: "packages/main/index.js",
        output: {
            file: "packages/out/main.js",
            format: "cjs",
        },
        external: ["electron", "electron-devtools-installer"],
        plugins: [terser(), nodeResolve(), json()],
    },
    {
        input: "packages/preload/index.js",
        output: {
            file: "packages/out/preload.js",
            format: "cjs",
        },
        external: ["electron"],
        plugins: [terser(), nodeResolve(), json()],
    },
    {
        input: "packages/preload/splash.js",
        output: {
            file: "packages/out/preloadSplash.js",
            format: "cjs",
        },
        external: ["electron"],
        plugins: [terser(), nodeResolve(), json()],
    },
]);
