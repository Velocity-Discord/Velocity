import electron from "electron";
import _module from "module";
import path from "path";
import fs from "fs";

if (!fs.existsSync(join(__dirname, "../../data"))) fs.mkdirSync(join(__dirname, "../../data"));
if (!fs.existsSync(join(__dirname, "../../data/config.json"))) fs.writeFileSync(join(__dirname, "../../data/config.json"), JSON.stringify({}));
const Settings = JSON.parse(fs.readFileSync(join(__dirname, "../../data/config.json"), "utf8"));

export default class BrowserWindow extends electron.BrowserWindow {
    constructor(opts) {
        if (!opts || !opts.webPreferences || !opts.webPreferences.preload || process.argv.includes("--vanilla")) return super(opts);

        const originalPreload = opts.webPreferences.preload;
        process.env.DISCORD_PRELOAD = originalPreload;

        opts = {
            ...opts,
            webPreferences: {
                ...opts.webPreferences,
                preload: opts.title && opts.webPreferences && opts.webPreferences.nativeWindowOpen ? path.join(__dirname, "preload.js") : path.join(__dirname, "preloadSplash.js"),
                nodeIntegration: true,
                devTools: true,
            },
            transparent: !!Settings.Transparency,
            vibrancy: Settings.Vibrancy ? "hud" : undefined,
            backgroundColor: "#00000000",
            visualEffectState: "active",
        };

        let win = new electron.BrowserWindow(opts);

        return win;
    }
}
