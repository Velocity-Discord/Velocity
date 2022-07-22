// This Client Mod was originally based on DrDiscord version 1.0.0 as found here: https://github.com/Dr-Discord/DrDiscord (now unavailable, an archived version can be found here https://github.com/unknown81311/DrDiscord)
// Original license: MIT License
// https://github.com/Dr-Discord/DrDiscord/blob/main/LICENSE.md (now: https://github.com/unknown81311/DrDiscord/blob/main/LICENSE.md)

const { join } = require("path");
const electron = ({ ipcMain, app, session, dialog } = require("electron"));
const Module = require("module");
const DataStore = require("./core/datastore");
const { ghost: settingsGhost } = DataStore("VELOCITY_SETTINGS");

process.env.VELOCITY_DIRECTORY = join(__dirname, "..");

app.commandLine.appendSwitch("no-force-async-hooks-checks");

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

        if (settingsGhost.Transparency) {
            opt = Object.assign(opt, {
                transparent: true,
                backgroundColor: "#00000000",
            });
        }

        if (settingsGhost.Vibrancy) {
            opt = Object.assign(opt, {
                transparent: true,
                backgroundColor: "#00000000",
                vibrancy: "dark",
            });
        }

        let win = new electron.BrowserWindow(opt);

        win.webContents.on("dom-ready", () => {
            if (!hasCrashed) return;

            dialog.showMessageBox({
                type: "warning",
                title: "Velocity",
                message: `The Velocity process has crashed. (${hasCrashed?.details?.reason || "Unknown"})`,
                detail: "This may be due to a Plugin or Module. Try restarting Discord in vanilla mode and try again. \n ERR_CODE:" + (hasCrashed?.details?.exitCode || "1"),
                buttons: ["OK"],
            });
            hasCrashed = false;
        });
        win.webContents.on("render-process-gone", (e) => {
            hasCrashed = e;
        });

        return win;
    }
}

function LoadDiscord() {
    const basePath = join(process.resourcesPath, "app.asar");
    const pkg = require(join(basePath, "package.json"));
    app.setAppPath(basePath);
    app.name = pkg.name;
    Module._load(join(basePath, pkg.main), null, true);
}

if (process.argv.includes("--vanilla")) {
    return LoadDiscord();
}

app.once("ready", () => {
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
    ipcMain.handle("killed-dialog", () => {
        dialog.showMessageBox({
            type: "warning",
            message: "The Velocity process has been killed. This may indicate a security issue so we have Disabled Velocity temporarily.",
            buttons: ["OK"],
        });
        process.argv.push("--vanilla");
    });
    ipcMain.handle("crashed-dialog", (e, a) => {
        dialog.showMessageBox({
            type: "warning",
            title: "Velocity",
            message: `The Velocity process has crashed. ("${a.reason || "Unknown"}")`,
            detail: "This may be due to a Plugin or Module. Try restarting Discord in vanilla mode and try again. \n ERR_CODE:" + (a.code || "1"),
            buttons: ["OK"],
        });
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
