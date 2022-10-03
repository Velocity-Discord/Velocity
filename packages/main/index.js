import electron, { ipcMain } from "electron";
import _module from "module";
import path from "path";
import fs from "fs";

import BrowserWindow from "./modules/browserWindow";
import IPC_EVENTS from "../common/IPC_EVENTS";

import installExtension, { REACT_DEVELOPER_TOOLS } from "electron-devtools-installer";

process.env.VELOCITY_DIRECTORY = path.join(__dirname, "../../");

electron.app.commandLine.appendSwitch("no-force-async-hooks-checks");

electron.app.on("ready", () => {
    installExtension(REACT_DEVELOPER_TOOLS);

    electron.session.defaultSession.webRequest.onHeadersReceived(function ({ responseHeaders }, callback) {
        for (const iterator of Object.keys(responseHeaders)) if (iterator.includes("content-security-policy")) delete responseHeaders[iterator];

        callback({
            cancel: false,
            responseHeaders,
        });
    });

    ipcMain.handle(IPC_EVENTS.kill, () => {
        electron.dialog.showMessageBox({
            type: "warning",
            title: "Process Exited",
            message: "The Discord process has been killed.",
        });
        process.exit(1);
    });
});

function LoadDiscord() {
    const basePath = path.join(process.resourcesPath, "app.asar");
    const pkg = JSON.parse(fs.readFileSync(path.join(basePath, "package.json"), "utf8"));
    electron.app.setAppPath(basePath);
    electron.app.name = pkg.name;
    _module._load(path.join(basePath, pkg.main), null, true);
}

const electronPath = require.resolve("electron");
delete require.cache[electronPath]?.exports;
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
        if (prop === devToolsKey) return true;
        target[prop] = value;
        return true;
    },
});

LoadDiscord();
