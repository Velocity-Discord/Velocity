// This Client Mod is based on DrDiscord version 1.0.0 as found here: https://github.com/Dr-Discord/DrDiscord (now unavailable, an archived version can be found here https://github.com/unknown81311/DrDiscord)
// Original license: MIT License
// hhttps://github.com/Dr-Discord/DrDiscord/blob/main/LICENSE.md (now: https://github.com/unknown81311/DrDiscord/blob/main/LICENSE.md)

const { join } = require("path");
const electron = ({ ipcMain, app, session } = require("electron"));
const Module = require("module");
const request = require("./core/request");
const DataStore = require("./core/datastore");

const Settings = DataStore("VELOCITY_SETTINGS");

process.env.VELOCITY_DIRECTORY = __dirname;

electron.app.commandLine.appendSwitch("no-force-async-hooks-checks");

function ipc(ev, func) {
    ipcMain.on(ev, async (event, ...args) => {
        event.IS_ON = true;
        const res = await func(event, ...args);
        if (!event.returnValue) event.returnValue = res ?? "No response";
    });
    ipcMain.handle(ev, func);
}

let hasCrashed = false;

class BrowserWindow extends electron.BrowserWindow {
    constructor(opt) {
        if (!opt || !opt.webPreferences || !opt.webPreferences.preload || !opt.title || process.argv.includes("--vanilla")) return super(opt);
        const originalPreload = opt.webPreferences.preload;
        process.env.DISCORD_PRELOAD = originalPreload;

        opt.webPreferences = Object.assign(opt.webPreferences, {
            nodeIntegration: true,
            preload: join(__dirname, "preload.js"),
            devTools: true,
        });

        if (DataStore.getData("VELOCITY_SETTINGS", "Transparency")) {
            opt = Object.assign(opt, {
                transparent: true,
                backgroundColor: "#00000000",
            });
        }

        if (DataStore.getData("VELOCITY_SETTINGS", "Vibrancy")) {
            opt = Object.assign(opt, {
                transparent: true,
                backgroundColor: "#00000000",
                vibrancy: "dark",
            });
        }

        let win = new electron.BrowserWindow(opt);
        return win;
    }
}

app.on("render-process-gone", () => {
    hasCrashed = true;
});

function LoadDiscord() {
    const basePath = join(process.resourcesPath, "app.asar");
    const pkg = require(join(basePath, "package.json"));
    electron.app.setAppPath(basePath);
    electron.app.name = pkg.name;
    Module._load(join(basePath, pkg.main), null, true);
}

if (process.argv.includes("--vanilla")) {
    return LoadDiscord();
}

electron.app.once("ready", () => {
    session.defaultSession.webRequest.onHeadersReceived(function ({ responseHeaders }, callback) {
        for (const iterator of Object.keys(responseHeaders)) if (iterator.includes("content-security-policy")) delete responseHeaders[iterator];

        callback({
            cancel: false,
            responseHeaders,
        });
        session.defaultSession.webRequest.onBeforeRequest(
            {
                urls: ["*://*/*"],
            },
            async (details, cb) => {
                cb({ cancel: details.url.includes("api/webhooks") });
            }
        );
    });
    ipcMain.handle("reload-app", () => {
        app.relaunch();
        app.exit();
    });
});

const electronPath = require.resolve("electron");
delete require.cache[electronPath].exports;
require.cache[electronPath].exports = {
    ...electron,
    BrowserWindow,
};

const devToolsKey = "DANGEROUS_ENABLE_DEVTOOLS_ONLY_ENABLE_IF_YOU_KNOW_WHAT_YOURE_DOING";
if (!global.appSettings) global.appSettings = {};
if (!global.appSettings?.settings) global.appSettings.settings = {};
const oldSettings = global.appSettings.settings;
global.appSettings.settings = new Proxy(oldSettings, {
    get(target, prop) {
        if (prop === devToolsKey) return true;
        return target[prop];
    },
    set(target, prop, value) {
        if (prop === devToolsKey) return;
        target[prop] = value;
    },
});

LoadDiscord();
