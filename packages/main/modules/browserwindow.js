import electron from "electron";
import _module from "module";
import { join } from "path";
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
                preload: opts.title && opts.webPreferences && opts.webPreferences.nativeWindowOpen ? join(__dirname, "preload.js") : join(__dirname, "preloadSplash.js"),
                devTools: true,
            },
            transparent: !!Settings.Transparency,
            backgroundColor: "#00000000",
            vibrancy: Settings.Vibrancy ? "hud" : undefined,
            visualEffectState: Settings.Vibrancy ? "active" : undefined,
        };

        let win = new electron.BrowserWindow(opts);

        return win;
    }
}
