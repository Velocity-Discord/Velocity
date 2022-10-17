import { initPlugins, initThemes } from "./modules/addons";
import { initialiseSettings } from "./ui/settings";
import { addVariables } from "./modules/variables";
import { runSnippets } from "./modules/snippets";
import { Stream } from "./modules/datastore";
import { waitUntil } from "./util/time";
import webpack from "./modules/webpack";
import socket from "./modules/socket";

import logger from "./util/logger";
import Velocity from "./modules/velocity";

const Settings = Stream("config");
const Logger = new logger("Renderer");

const initialise = async () => {
    const s = Date.now();
    Logger.log("Initialising...");

    await webpack.globalPromise;

    window.Velocity = Velocity;

    Object.freeze(window.Velocity);
    Logger.log(`API Added in ${Date.now() - s}ms`);

    if (window.DiscordSentry && Settings.KillSentry) {
        window.DiscordSentry.getCurrentHub().getClient().close();
        Logger.log("Killed Sentry");
    }

    if (Settings.StopWarnings) {
        DiscordNative.window.setDevtoolsCallbacks(null, null);
        Logger.log("Disabled Devtools Warnings");
    }

    socket.init();
    Logger.log("Socket Initialised");

    addVariables();
    Logger.log(`Variables Added`);

    initialiseSettings();
    Logger.log(`Settings Added`);

    // wait for React to be loaded
    await waitUntil(() => webpack.common.React);

    Logger.log(`React Loaded`);

    webpack.remapDefaults();

    initPlugins();
    initThemes();

    Logger.log(`Plugins & Themes Initialised`);

    runSnippets();
    Logger.log(`Snippets Run`);

    webpack.remapDefaults();

    setTimeout(() => {
        Velocity.CoreUpdater.checkForUpdates();
        Velocity.PluginUpdater.checkForUpdates();
        Velocity.ThemeUpdater.checkForUpdates();
    }, 1000);
};

initialise();
