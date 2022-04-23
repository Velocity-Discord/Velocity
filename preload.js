const electron = ({ webFrame, contextBridge, ipcRenderer } = require("electron"));
const logger = require("./core/logger");
const styling = require("./core/styling");
const scripting = require("./core/scripting");
const DataStore = require("./core/datastore");
const patch = require("./core/patch");
const fs = require("fs/promises");
const path = require("path");
const { info } = require("./package.json");
const { parse } = require("./core/styleParser");

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
                    })()
            );
        }

        logger.log("Velocity", "DOM Loaded");

        if (window.DiscordSentry) {
            window.DiscordSentry.close();
            window.DiscordSentry.getCurrentHub().getClient().close();
            logger.log("Velocity", "Killed Sentry");
        }

        function polyfillWebpack() {
            if (typeof webpackJsonp !== "undefined") return;

            window.webpackJsonp = [];
            window.webpackJsonp.length = 10000;
            window.webpackJsonp.flat = () => window.webpackJsonp;
            window.webpackJsonp.push = ([[], module, [[id]]]) => {
                return module[id]({}, {}, WebpackModules.require);
            };
        }
        polyfillWebpack();

        const DevMode = DataStore("VELOCITY_SETTINGS").DevMode;

        const vhead = document.createElement("velocity-head");
        const vthemes = document.createElement("velocity-themes");
        const vbody = document.createElement("velocity-body");
        const vtoasts = document.createElement("velocity-toasts");

        vhead.appendChild(vthemes);
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
        const updater = require("./core/updater");

        if (DataStore.getData("VELOCITY_SETTINGS", "CheckForUpdates")) {
            updater.checkForUpdates();
        }

        t = find.find(["isDeveloper"]);
        Object.defineProperty(t, "isDeveloper", { get: (_) => 1, set: (_) => _, configurable: true });

        let Badges;
        request("https://raw.githubusercontent.com/Velocity-Discord/Backend/main/api/Badges.json", (_, __, body) => (Badges = JSON.parse(body)));

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

        global.webpackChunkdiscord_app = window.webpackChunkdiscord_app;
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
            showChangelog: () => {
                updater.changelogModal();
            },
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

                    if (Boolean(getGuilds()["959035496707817502"])) transitionToGuild("959035496707817502", "959035497462759436");
                    else {
                        const { acceptInvite } = find.find(["acceptInvite"]);

                        const res = acceptInvite("dATuY2F3Bd");
                        if (goTo) res.then(() => transitionToGuild("959035496707817502", "959035497462759436"));
                    }
                },
            },
            VelocityElements: {
                head: document.querySelector("velocity-head"),
                body: document.querySelector("velocity-body"),
            },
            Logger: logger,
            Styling: styling,
            Scripting: scripting,
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
                    const cssBeta = DataStore("VELOCITY_SETTINGS").CSSFeatures;

                    if (DataStore("VELOCITY_SETTINGS").CSSEnabled) {
                        let style = document.createElement("style");
                        style.innerText = cssBeta ? parse(css) : css;
                        style.id = "customcss";
                        document.querySelector("velocity-head").appendChild(style);
                    }
                },
                get: () => {
                    const css = DataStore("VELOCITY_SETTINGS").CSS;

                    return parse(css);
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

        const { showToast, showConfirmationModal } = require("./core/ui/Notifications");

        VApi.showToast = showToast;
        VApi.showConfirmationModal = showConfirmationModal;

        VApi.AddonManager = {
            plugins: plugins(),
            themes: themes(),
        };

        const InfoModal = require("./core/ui/InfoModal");
        VApi.showInfoModal = function () {
            InfoModal.prompt("Velocity");
        };

        Object.freeze(VApi);

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

                logger.error("Startup Script", "Error Compiling Startup Script:", e);
            }
        }
        if (DevMode) logger.log("Velocity", "Startup JS Run");

        let cssChecked = DataStore("VELOCITY_SETTINGS").CSSEnabled;
        let customCSS = DataStore("VELOCITY_SETTINGS").CSS;
        const cssBeta = DataStore("VELOCITY_SETTINGS").CSSFeatures;

        if (cssChecked) {
            var style = document.createElement("style");
            style.innerText = cssBeta ? parse(customCSS) : customCSS;
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
                        logger.error("Addon Manager", `Failed to start ${plugin}:`, e);
                    }
                }
            }
        }

        if (DevMode) logger.log("Velocity", "Addons Loaded");

        const MessageContent = find.find("MessageContent").default;
        const Alert = find.find("Alert").default;
        const ButtonEle = find.find(["ButtonColors"]).default;
        const ButtonColors = find.find(["ButtonColors"]).ButtonColors;
        const ButtonSizes = find.find(["ButtonColors"]).ButtonSizes;

        patch("VelocityInternal-Protocol-Patch", MessageContent, "type", ([props], res) => {
            const regex = /velocity\:\/\/(about)?(update)?/gi;
            const aboutRegex = /velocity\:\/\/(about)/gi;
            const updateRegex = /velocity\:\/\/(update)/gi;
            const getVersionRegex = /velocity\:\/\/update\?v(.*)>(.*)/gi;
            const updateVersionRegex = /velocity\:\/\/(update\?v[0-9].[0-9].[0-9])/gi;
            let containsProtocol = regex.test(props.message.content);

            if (containsProtocol) {
                if (aboutRegex.test(props.message.content)) {
                    delete res.props.children[0];
                    res.props.children.push([
                        React.createElement("div", {
                            className: "velocity-about-card",
                            children: [
                                React.createElement("div", {
                                    className: "velocity-about-card-header",
                                    children: [
                                        React.createElement(
                                            "h1",
                                            {
                                                className: "velocity-about-card-header-title",
                                            },
                                            "About Velocity"
                                        ),
                                        React.createElement(find.find("Tooltip").default, {
                                            text: "What's This?",
                                            children: (props) =>
                                                React.createElement(find.find("Clickable").default, {
                                                    ...props,
                                                    className: "velocity-about-card-header-info",
                                                    onClick: () => {
                                                        try {
                                                            VApi.modals.open((p) =>
                                                                React.createElement(Alert, {
                                                                    ...p,
                                                                    title: "What is this?",
                                                                    body: React.createElement(
                                                                        "p",
                                                                        {
                                                                            className: "velocity-about-alert-text",
                                                                        },
                                                                        "This is a Velocity Feature. It allows you to install ",
                                                                        React.createElement("br"),
                                                                        "updates and get info about Velocity directly from the client."
                                                                    ),
                                                                })
                                                            );
                                                        } catch (error) {
                                                            logger.error(error);
                                                        }
                                                    },
                                                    children: [
                                                        React.createElement("svg", {
                                                            class: "velocity-about-card-header-info-svg",
                                                            width: "16",
                                                            height: "16",
                                                            viewBox: "0 0 12 12",
                                                            children: [
                                                                React.createElement("path", {
                                                                    fill: "currentColor",
                                                                    d: "M6 1C3.243 1 1 3.244 1 6c0 2.758 2.243 5 5 5s5-2.242 5-5c0-2.756-2.243-5-5-5zm0 2.376a.625.625 0 110 1.25.625.625 0 010-1.25zM7.5 8.5h-3v-1h1V6H5V5h1a.5.5 0 01.5.5v2h1v1z",
                                                                }),
                                                            ],
                                                        }),
                                                    ],
                                                }),
                                        }),
                                    ],
                                }),
                                React.createElement("div", {
                                    className: "velocity-about-card-body",
                                    children: [
                                        React.createElement(
                                            "span",
                                            {
                                                className: "velocity-about-card-body-version",
                                            },
                                            `Version ${info.version} (${info.hash})`
                                        ),
                                        React.createElement(
                                            "span",
                                            {
                                                className: "velocity-about-card-body-author",
                                            },
                                            `API ${info.api.channel} ${info.api.version}`
                                        ),
                                    ],
                                }),
                            ],
                        }),
                    ]);
                }
                if (updateRegex.test(props.message.content)) {
                    if (updateVersionRegex.test(props.message.content)) {
                        const vNum = getVersionRegex.exec(props.message.content);
                        delete res.props.children[0];
                        res.props.children.push([
                            React.createElement("div", {
                                className: "velocity-update-card",
                                children: [
                                    React.createElement("div", {
                                        className: "velocity-update-card-header",
                                        children: [
                                            React.createElement(
                                                "h1",
                                                {
                                                    className: "velocity-update-card-header-title",
                                                },
                                                `Update Velocity to v${vNum[1]}`
                                            ),
                                            React.createElement(find.find("Tooltip").default, {
                                                text: "What's This?",
                                                children: (props) =>
                                                    React.createElement(find.find("Clickable").default, {
                                                        ...props,
                                                        className: "velocity-update-card-header-info",
                                                        onClick: () => {
                                                            try {
                                                                VApi.modals.open((p) =>
                                                                    React.createElement(Alert, {
                                                                        ...p,
                                                                        title: "What is this?",
                                                                        body: React.createElement(
                                                                            "p",
                                                                            {
                                                                                className: "velocity-update-alert-text",
                                                                            },
                                                                            "This is a Velocity Feature. It allows you to install ",
                                                                            React.createElement("br"),
                                                                            "updates and get info about Velocity directly from the client."
                                                                        ),
                                                                    })
                                                                );
                                                            } catch (error) {
                                                                logger.error(error);
                                                            }
                                                        },
                                                        children: [
                                                            React.createElement("svg", {
                                                                class: "velocity-update-card-header-info-svg",
                                                                width: "16",
                                                                height: "16",
                                                                viewBox: "0 0 12 12",
                                                                children: [
                                                                    React.createElement("path", {
                                                                        fill: "currentColor",
                                                                        d: "M6 1C3.243 1 1 3.244 1 6c0 2.758 2.243 5 5 5s5-2.242 5-5c0-2.756-2.243-5-5-5zm0 2.376a.625.625 0 110 1.25.625.625 0 010-1.25zM7.5 8.5h-3v-1h1V6H5V5h1a.5.5 0 01.5.5v2h1v1z",
                                                                    }),
                                                                ],
                                                            }),
                                                        ],
                                                    }),
                                            }),
                                        ],
                                    }),
                                    React.createElement("div", {
                                        className: "velocity-update-card-body",
                                        children: [React.createElement("span", null, "Would you like to install this update?")],
                                    }),
                                    React.createElement("div", {
                                        className: "velocity-update-card-footer",
                                        children: [
                                            React.createElement(
                                                ButtonEle,
                                                {
                                                    color: ButtonColors.GREEN,
                                                    onClick: () => {
                                                        try {
                                                            VApi.modals.open((p) =>
                                                                React.createElement(Alert, {
                                                                    ...p,
                                                                    title: "Sorry",
                                                                    body: React.createElement(
                                                                        "p",
                                                                        {
                                                                            className: "velocity-update-alert-text",
                                                                        },
                                                                        "Yeah so... This isn't implemented yet. It probably won't be for a while... this is awkward l:"
                                                                    ),
                                                                })
                                                            );
                                                        } catch (error) {
                                                            logger.error(error);
                                                        }
                                                    },
                                                },
                                                `Install`
                                            ),
                                        ],
                                    }),
                                ],
                            }),
                        ]);
                    } else {
                        delete res.props.children[0];
                        res.props.children.push([
                            React.createElement("div", {
                                className: "velocity-update-card",
                                children: [
                                    React.createElement("div", {
                                        className: "velocity-update-card-header",
                                        children: [
                                            React.createElement(
                                                "h1",
                                                {
                                                    className: "velocity-update-card-header-title",
                                                },
                                                `Invalid Update URL`
                                            ),
                                            React.createElement(find.find("Tooltip").default, {
                                                text: "What's This?",
                                                children: (props) =>
                                                    React.createElement(find.find("Clickable").default, {
                                                        ...props,
                                                        className: "velocity-update-card-header-info",
                                                        onClick: () => {
                                                            try {
                                                                VApi.modals.open((p) =>
                                                                    React.createElement(Alert, {
                                                                        ...p,
                                                                        title: "What is this?",
                                                                        body: React.createElement(
                                                                            "p",
                                                                            {
                                                                                className: "velocity-update-alert-text",
                                                                            },
                                                                            "This is a Velocity Feature. It allows you to install ",
                                                                            React.createElement("br"),
                                                                            "updates and get info about Velocity directly from the client."
                                                                        ),
                                                                    })
                                                                );
                                                            } catch (error) {
                                                                logger.error(error);
                                                            }
                                                        },
                                                        children: [
                                                            React.createElement("svg", {
                                                                class: "velocity-update-card-header-info-svg",
                                                                width: "16",
                                                                height: "16",
                                                                viewBox: "0 0 12 12",
                                                                children: [
                                                                    React.createElement("path", {
                                                                        fill: "currentColor",
                                                                        d: "M6 1C3.243 1 1 3.244 1 6c0 2.758 2.243 5 5 5s5-2.242 5-5c0-2.756-2.243-5-5-5zm0 2.376a.625.625 0 110 1.25.625.625 0 010-1.25zM7.5 8.5h-3v-1h1V6H5V5h1a.5.5 0 01.5.5v2h1v1z",
                                                                    }),
                                                                ],
                                                            }),
                                                        ],
                                                    }),
                                            }),
                                        ],
                                    }),
                                    React.createElement("div", {
                                        className: "velocity-update-card-body",
                                        children: [React.createElement("span", null, "You cannot install this. (Cause it's invalid...)")],
                                    }),
                                    React.createElement("div", {
                                        className: "velocity-update-card-footer",
                                        children: [
                                            React.createElement(
                                                ButtonEle,
                                                {
                                                    color: ButtonColors.GREY,
                                                    disabled: true,
                                                },
                                                `Invalid`
                                            ),
                                        ],
                                    }),
                                ],
                            }),
                        ]);
                    }
                }
            }
        });

        patch("VelocityInternal-GuildTooltip-Patch", find.find("GuildTooltip"), "default", ([props], res) => {
            if (
                !(
                    props.guild.id === "901774051318591508" ||
                    props.guild.id === "959035496707817502" ||
                    (props.guild.id === "944858264909250590" && !props.guild.features.has("VERIFIED"))
                )
            )
                return;
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
                          })
                      );
            }
            res.props.children.push(
                React.createElement(find.find("Tooltip").default, {
                    text: Badges[user.id].name,
                    children: (props) =>
                        React.createElement(find.find("Clickable").default, {
                            ...props,
                            className: "Velocity-badge",
                            onClick: () => {
                                VApi.showInfoModal();
                            },
                            children: React.createElement(Badge.icon.tag, {
                                ...Badge.icon,
                                children: makeChildren(Badge.icon.children),
                            }),
                        }),
                })
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
        const settings = require("./core/ui/Settings");
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
