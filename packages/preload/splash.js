import { existsSync, writeFileSync, readFileSync } from "fs";
import { join } from "path";

if (!existsSync(join(__dirname, "../../data/config.json"))) writeFileSync(join(__dirname, "../../data/config.json"), JSON.stringify({}));
const Settings = JSON.parse(readFileSync(join(__dirname, "../../data/config.json"), "utf8"));

const originalPreload = process.env.DISCORD_PRELOAD;

if (originalPreload) require(originalPreload);

const initialise = () => {
    const themesToInject = Settings.enabledThemes;
    const snippetsToInject = Settings.editorTabs.filter((tab) => tab.language === "css");

    document.body.classList.add("velocity-splash");

    themesToInject.forEach((themeToInject) => {
        console.log(`[Velocity] Injecting theme ${themeToInject.name}...`);
        const themeManifest = require(`../../themes/${themeToInject}/velocity_manifest.json`);

        const _data = readFileSync(join(__dirname, "../../themes", themeToInject, themeManifest.main), "utf8");

        const style = document.createElement("style");
        style.id = "velocity-theme";
        style.innerHTML = _data;
        document.head.appendChild(style);
    });

    snippetsToInject.forEach((snippetToInject) => {
        console.log(`[Velocity] Injecting snippet ${snippetToInject.name}...`);

        const _data = snippetToInject.content;

        const style = document.createElement("style");
        style.id = "velocity-snippet";
        style.innerHTML = _data;
        document.head.appendChild(style);
    });
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialise);
} else {
    initialise();
}
