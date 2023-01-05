import { showNotification, showToast, showConfirmationModal } from "./notifications";
import { Updater, AddonUpdater } from "./updater";
import { installAddon } from "./actions";
import { waitUntil } from "../util/time";
import * as ContextMenu from "../util/contextMenu";
import * as DataStore from "./datastore";
import * as Styling from "./styling";
import * as addons from "./addons";
import webpack from "../modules/webpack";
import logger from "../util/logger";
import Patcher from "./patcher";
import Plugin from "./pluginapi";

webpack.globalPromise.then(async () => {
    window.React = await webpack.waitFor(["createElement", "useEffect"]);
    window.ReactDOM = await webpack.waitFor(["render", "hydrate"]);
});

export default {
    CoreUpdater: new Updater(),
    ThemeUpdater: new AddonUpdater("themes"),
    PluginUpdater: new AddonUpdater("plugins"),
    Plugin,
    Styling,
    Patcher,
    DataStore,
    ContextMenu,
    Logger: logger,
    AddonManager: {
        ...addons,
        installAddon,
    },
    WebpackModules: webpack,
    Notifications: {
        showNotification,
        showToast,
        showConfirmationModal,
    },
    Utilities: {
        waitUntil,
    },
};
