const { join } = require("path");
const electron = { ipcMain, app } = require("electron");
const Module = require("module");
const request = require("./core/request");
const DataStore = require("./core/datastore");

const Settings = DataStore("VELOCITY_SETTINGS");

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

// New BrowserWindow constructor
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
        return win
    }
}

// Discord Asar
function LoadDiscord() {
    const basePath = join(process.resourcesPath, "app.asar");
    const pkg = require(join(basePath, "package.json"));
    electron.app.setAppPath(basePath);
    electron.app.name = pkg.name;
    Module._load(join(basePath, pkg.main), null, true);
}

// Vanilla
if (process.argv.includes("--vanilla")) return LoadDiscord();

// Kill CSP
electron.app.once("ready", () => {
    electron.session.defaultSession.webRequest.onHeadersReceived(function ({ responseHeaders }, callback) {
        for (const iterator of Object.keys(responseHeaders)) if (iterator.includes("content-security-policy")) delete responseHeaders[iterator];

        callback({
            cancel: false,
            responseHeaders,
        });
    });
    ipcMain.handle("reload-app", () => {
        app.relaunch();
        app.exit();
    });
});
// New electron
const Electron = new Proxy(electron, { get: (target, prop) => (prop === "BrowserWindow" ? BrowserWindow : target[prop]) });
// Replace electron with new proxy
const electronPath = require.resolve("electron");
delete require.cache[electronPath].exports;
require.cache[electronPath].exports = Electron;

// DevTools
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