const electron = ({ webFrame, contextBridge, ipcRenderer } = require("electron"));
const logger = require("./core/logger");
const styling = require("./core/styling");
const scripting = require("./core/scripting");
const toasts = require("./core/toast");
const DataStore = require("./core/datastore");
const patch = require("./core/patch");
const fs = require("fs/promises");
const path = require("path");
const { info } = require("./package.json");

const dPath = process.env.DISCORD_PRELOAD;

if (dPath) {
    require(dPath);
    logger.log("Velocity", "Discord Preloaded");
} else {
    logger.error("Velocity", "No preload path found!");
}

((window) => {
    const toWindow = (key, value) => {
        if (key.name === undefined) {
            window[key] = value;
            global[key] = value;
        } else {
            window[key.name] = key;
            global[key.name] = key;
        }
    };

    window.global = global;
    toWindow(require);
    async function DomLoaded() {
        if (DataStore.getData("VELOCITY_SETTINGS", "DegubberKey")) {
            window.addEventListener(
                "keydown",
                (event) =>
                    event.code === "F8" &&
                    (() => {
                        debugger;
                    })(),
            );
        }

        logger.log("Velocity", "DOM Loaded");

        window.DiscordSentry.close();
        window.DiscordSentry.getCurrentHub().getClient().close();
        logger.log("Velocity", "Killed Sentry");

        const DevMode = DataStore("VELOCITY_SETTINGS").DevMode;

        const vhead = document.createElement("velocity-head");
        const vthemes = document.createElement("velocity-themes");
        const vbody = document.createElement("velocity-body");
        const vtoasts = document.createElement("velocity-toasts");

        vhead.appendChild(vthemes)
        document.head.appendChild(vhead);
        vbody.appendChild(vtoasts);
        document.body.appendChild(vbody);

        const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));
        async function waitFor(querySelector) {
            return await waitUntil(() => window.document.querySelector(querySelector));
        }

        async function waitUntil(condition) {
            let item;
            while (!(item = condition())) await sleep(1);
            return item;
        }

        const AddonManager = require("./core/addonManager");
        AddonManager;
        const { themes, plugins, readMeta } = AddonManager;
        if (DevMode) logger.log("Velocity", "AddonManager added");

        await window.DiscordNative.window.setDevtoolsCallbacks(null, null);

        const find = require("./core/webpack");
        const request = require("./core/request");
        const updater = require("./core/updater")

        if (DataStore.getData("VELOCITY_SETTINGS", "CheckForUpdates")) {
            updater.checkForUpdates();
        }

        t = find.find(["isDeveloper"]);
        Object.defineProperty(t, "isDeveloper", { get: (_) => 1, set: (_) => _, configurable: true });

        let Badges;
        request("https://raw.githubusercontent.com/TheCommieAxolotl/TheCommieAxolotl/main/v/Badges.json", (_, __, body) => (Badges = JSON.parse(body)));

        const React = await waitUntil(() => {
            if (!find.find(["createElement", "Component"])?.createElement) return false;
            return find.find(["createElement", "Component"]);
        });
        const ReactDOM = await waitUntil(() => {
            if (!find.find(["render", "hydrate"])?.render) return false;
            return find.find(["render", "hydrate"]);
        });

        const ModalFunctions = find.find(["openModal", "openModalLazy"]);
        const ModalElements = find.find(["ModalRoot", "ModalListContent"]);

        const VApi = {
            Meta: {
                Discord: `${await DiscordNative.app.getReleaseChannel()} ${await DiscordNative.app.getVersion()}`,
                Velocity: info.version,
                VApi: `${info.api.channel} ${info.api.version}`,
            },
            React: { ...React },
            ReactDOM: { ...ReactDOM },
            request,
            getModule: find,
            showChangelog: () => {updater.changelogModal()},
            Utilities: {
                waitFor,
                waitUntil,
                joinServer: (code, goTo = true) => {
                    const { transitionToGuild } = find.find(["transitionToGuild"]);
                    const { acceptInvite } = find.find(["acceptInvite"]);

                    const res = acceptInvite(code);
                    if (goTo) res.then(({ guild, channel }) => transitionToGuild(guild.id, channel.id));
                },
                joinOfficialServer: () => {
                    const { transitionToGuild } = find.find(["transitionToGuild"]);
                    const { getGuilds } = find.find(["getGuilds"]);

                    if (Boolean(getGuilds()["901774051318591508"])) transitionToGuild("901774051318591508", "901774052199391246");
                    else {
                        const { acceptInvite } = find.find(["acceptInvite"]);

                        const res = acceptInvite("5BSWtSM3XU");
                        if (goTo) res.then(() => transitionToGuild("901774051318591508", "901774052199391246"));
                    }
                },
            },
            velocityElements: {
                head: document.querySelector("velocity-head"),
                body: document.querySelector("velocity-body"),
            },
            Logger: logger,
            Styling: styling,
            Scripting: scripting,
            showToast: toasts,
            modals: {
                open: (reactElement, modalOpts) => ModalFunctions.openModal(reactElement, modalOpts),
                close: (modalId, way) => ModalFunctions.closeModal(modalId, way),
                root: ModalElements.ModalRoot,
                header: ModalElements.ModalHeader,
                closeButton: ModalElements.ModalCloseButton,
                content: ModalElements.ModalContent,
                listContent: ModalElements.ModalListContent,
                footer: ModalElements.ModalFooter,
                size: ModalElements.ModalSize,
            },
            DataStore: DataStore,
            customCSS: {
                reload: () => {
                    document.querySelector("#customcss").remove();
                    const css = DataStore("VELOCITY_SETTINGS").CSS;

                    if (DataStore("VELOCITY_SETTINGS").CSSEnabled) {
                        let style = document.createElement("style");
                        style.innerText = css;
                        style.id = "customcss";
                        document.querySelector("velocity-head").appendChild(style);
                    }
                },
                update: (css) => {
                    DataStore.setData("VELOCITY_SETTINGS", "CSS", css);
                },
            },
            Patcher: patch,
        };

        const FluxDispatcher = find.find(["_currentDispatchActionType", "_processingWaitQueue"]);
        VApi.FluxDispatcher = FluxDispatcher;

        toWindow("VApi", VApi);
        if (DevMode) logger.log("Velocity", "VApi Added");

        VApi.AddonManager = {
            plugins: plugins(),
            themes: themes(),
        };

        const InfoModal = require("./core/ui/InfoModal");
        VApi.showInfoModal = function() {
            InfoModal.prompt("Velocity");
        }

        const data = fs.readFile(path.join(__dirname, "./core/ui/styles.css"), "utf-8");

        VApi.Styling.injectInternalCSS("velocity_internal_styles", await data);

        let jsChecked = DataStore("VELOCITY_SETTINGS").JSEnabled;
        let js = DataStore("VELOCITY_SETTINGS").JS;

        if (jsChecked) {
            try {
                await waitFor('[class*="guilds"]');
                eval(js);
            } catch (e) {
                VApi.showToast("Error Compiling Startup Script. See Console For More Details", { type: "error", timeout: 4000 });

                logger.error("Startup Script", e);
            }
        }
        if (DevMode) logger.log("Velocity", "Startup JS Run");

        let cssChecked = DataStore("VELOCITY_SETTINGS").CSSEnabled;
        let customCSS = DataStore("VELOCITY_SETTINGS").CSS;

        if (cssChecked) {
            var style = document.createElement("style");
            style.innerText = customCSS;
            style.id = "customcss";
            document.querySelector("velocity-head").appendChild(style);
        }

        if (DevMode) logger.log("Velocity", "Custom CSS Injected");

        // Patches & Addons
        await waitFor('[class*="guilds"]');

        const allThemes = VApi.AddonManager.themes.getAll();
        const allPlugins = VApi.AddonManager.plugins.getAll();

        for (let meta of Object.values(allThemes)) {
            VApi.showToast(`Loaded <strong>${meta.name} ${meta.version}</strong>`);
        }
        for (let meta of Object.values(allPlugins)) {
            VApi.showToast(`Loaded <strong>${meta.name} ${meta.version}</strong>`);
        }

        const enabledThemes = DataStore("VELOCITY_SETTINGS").enabledThemes;
        for (let [theme, data] of Object.entries(enabledThemes)) {
            if (DevMode) console.log(theme, data);
            if (data) {
                if (VApi.AddonManager.themes.get(theme)) {
                    logger.log("ThemeManager", `Enabled ${theme}`);
                    VApi.AddonManager.themes.enable(theme);
                    VApi.showToast(`Enabled <strong>${theme}</strong>`, { type: "success" });
                }
            }
        }

        const enabledPlugins = DataStore("VELOCITY_SETTINGS").enabledPlugins;
        for (let [plugin, data] of Object.entries(enabledPlugins)) {
            if (DevMode) console.log(plugin, data);
            if (data) {
                if (VApi.AddonManager.plugins.get(plugin)) {
                    try {
                        logger.log("PluginManager", `Enabled ${plugin}`);
                        VApi.AddonManager.plugins.enable(plugin);
                        VApi.showToast(`Enabled <strong>${plugin}</strong>`, { type: "success" });
                    } catch (e) {
                        VApi.showToast(`Failed to start <strong>${plugin}</strong>`, { type: "error" });
                        logger.error("Addon Manager", e);
                    }
                }
            }
        }

        if (DevMode) logger.log("Velocity", "Addons Loaded");

        patch("VelocityInternal-GuildTooltip-Patch", find.find("GuildTooltip"), "default", ([props], res) => {
            if (!(props.guild.id === "901774051318591508" || (props.guild.id === "944858264909250590" && !props.guild.features.has("VERIFIED")))) return;
            props.guild.features.add("VERIFIED");
        });
        patch("VelocityInternal-Badge-Patch", find.find("UserProfileBadgeList"), "default", ([{ user }], res) => {
            const Badge = Badges[user.id];
            if (!Badge) return;
            function makeChildren(children) {
                return !children?.map
                    ? null
                    : children.map((child) =>
                          React.createElement(child.tag, {
                              ...child,
                              fill: child.color,
                              children: makeChildren(child?.children),
                          }),
                      );
            }
            res.props.children.push(
                React.createElement(find.find("Tooltip").default, {
                    text: Badges[user.id].name,
                    children: (props) =>
                        React.createElement(find.find("Clickable").default, {
                            ...props,
                            className: "Velocity-badge",
                            children: React.createElement(Badge.icon.tag, {
                                ...Badge.icon,
                                children: makeChildren(Badge.icon.children),
                            }),
                        }),
                }),
            );
        });

        if (DevMode) logger.log("Velocity", "Patches Run");

        request("https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.1/require.min.js", async (err, _, body) => {
            if (Object.keys(window).includes("monaco") || err) return;
            window.eval(body);
            if (Object.keys(window).includes("requirejs") && !window.requirejs?.config) return;
            require.config = window.requirejs.config;
            window.requirejs.config({
                paths: { vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.16.2/min/vs" },
            });
            window.MonacoEnvironment = {
                getWorkerUrl: function (workerId, label) {
                    return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
              self.MonacoEnvironment = {
                baseUrl: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.16.2/min/"
              };
              importScripts("https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.16.2/min/vs/base/worker/workerMain.js");`)}`;
                },
            };
            await window.requirejs(["vs/editor/editor.main"], function () {});
        });

        global.windowfunc = window;

        await waitFor(".panels-3wFtMD > .container-YkUktl .flex-2S1XBF > :last-child");
        await waitUntil(() => global.windowfunc.monaco);
        const settings = require("./core/ui/SettingsModal");
        settings;

        if (DevMode) logger.log("Velocity", "Settings Added");

        if (DataStore.getData("VELOCITY_SETTINGS", "ReloadOnLogin")) {
            VApi.getModule.find(["dirtyDispatch"]).subscribe("LOGIN", (event) => {
                location.reload();
            });
        }
    }
    if (window.document.readyState === "loading") window.document.addEventListener("DOMContentLoaded", DomLoaded);
    else DomLoaded();
})(webFrame.top.context);
