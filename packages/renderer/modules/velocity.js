import { showNotification, showToast } from "./notifications";
import { installAddon } from "./actions";
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
    Plugin,
    Styling,
    Patcher,
    DataStore,
    Logger: logger,
    AddonManager: {
        ...addons,
        installAddon,
    },
    WebpackModules: webpack,
    Notifications: {
        showNotification,
        showToast,
    },
};
