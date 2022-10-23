import { showToast } from "./notifications";
import * as addons from "./addons";
import logger from "../util/logger";

const fs = VelocityCore.pseudoRequire("fs");
const path = VelocityCore.pseudoRequire("path");

const Logger = new logger("Addon Actions");

export const getDataFromBase = async (baseURL) => {
    let url;
    let manifestURL;
    try {
        url = new URL(baseURL.endsWith("/") ? baseURL : baseURL + "/");

        manifestURL = new URL("velocity_manifest.json", url);
    } catch (e) {
        return showToast("Invalid URL", { type: "error" });
    }

    let resolve;

    try {
        const manifestData = JSON.parse(await VelocityCore.request(manifestURL.href));

        const mainData = await VelocityCore.request(new URL(manifestData.main, url).href);

        resolve = {
            manifest: manifestData,
            main: mainData,
        };
    } catch (e) {
        Logger.error("Failed to traverse addon paths:", e);
        showToast("Failed to traverse addon paths", { type: "error" });
    }

    return resolve;
};

export const traverseImports = async (data, baseURL) => {
    const imports = data.main.match(/require\("(.+)"\)/g);

    let resolve = [];

    if (imports) {
        for (const importPath of imports) {
            const path = importPath.match(/require\("(.+)"\)/)[1].replace(/\.\.\/plugins\/.*\//, "");

            const url = new URL(path, baseURL);

            resolve.push({ url: url.href, path: path });
        }
    }

    return resolve;
};

export const installAddon = async (baseURL) => {
    if (!baseURL) return showToast("Invalid URL", { type: "error" });

    const data = await getDataFromBase(baseURL);

    const type = data.manifest.main.endsWith(".js") ? "Plugins" : "Themes";
    const dir = path.join(addons[type].dir, data.manifest.name);

    Logger.log(`Installing ${type.substring(0, type.length - 1)} from ${baseURL}`);

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    } else {
        Logger.error(`Addon already exists: '${data.manifest.name}'`);
        showToast("Addon already exists", { type: "error" });
        return;
    }

    fs.writeFileSync(path.join(dir, "velocity_manifest.json"), JSON.stringify(data.manifest));
    fs.writeFileSync(path.join(dir, data.manifest.main), data.main);

    if (!data) return;

    const imports = await traverseImports(data, baseURL);

    imports.forEach(async (importData) => {
        try {
            fs.writeFileSync(path.join(dir, importData.path), await VelocityCore.request(importData.url));
        } catch (e) {
            Logger.error("Failed to install addon:", e);
            showToast(`Could not traverse imports for ${data.manifest.name}`, { type: "error" });
        }
    });

    Logger.log(`Installed ${data.manifest.name}`);
    showToast(`Installed ${data.manifest.name}`, { type: "success" });

    return true;
};
