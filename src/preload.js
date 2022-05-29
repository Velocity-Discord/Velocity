const { webFrame, contextBridge, ipcRenderer } = require("electron");
const logger = require("./core/logger");
const StylingManager = require("./core/DOM/styling");
const ScriptingManager = require("./core/DOM/scripting");
const DataStore = require("./core/datastore");
const patch = require("./core/patch");
const fs = require("fs/promises");
const path = require("path");
const Module = require("module");
const Config = require("../common/config.json");
const { info } = require("../package.json");
const { parse } = require("./core/styleParser");

const dPath = process.env.DISCORD_PRELOAD;

if (dPath) {
    require(dPath);
    logger.log("Velocity", "Discord Preloaded");
} else {
    logger.error("Velocity", "No Preload Found!");
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
            if (typeof window.webpackJsonp !== "undefined") return;

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
        const { themes, plugins, readMeta, remote } = AddonManager;
        if (DevMode) logger.log("Velocity", "AddonManager added");

        await window.DiscordNative.window.setDevtoolsCallbacks(null, null);

        const WebpackModules = require("./core/webpack");
        const request = require("./core/request");
        const updater = require("./core/updater");

        if (DataStore.getData("VELOCITY_SETTINGS", "CheckForUpdates")) {
            updater.checkForUpdates();
        }

        let t = WebpackModules.find(["isDeveloper"]);
        Object.defineProperty(t, "isDeveloper", { get: (_) => 1, set: (_) => _, configurable: true });

        let Badges;
        if (Config.backend.badges.type === 0) {
            request(Config.backend.badges.url, (_, __, body) => (Badges = JSON.parse(body)));
        } else if (Config.backend.badges.type === 1) {
            Badges = require(Config.backend.badges.url);
        }

        const React = await waitUntil(() => {
            if (!WebpackModules.find(["createElement", "Component"])?.createElement) return false;
            return WebpackModules.find(["createElement", "Component"]);
        });
        const ReactDOM = await waitUntil(() => {
            if (!WebpackModules.find(["render", "hydrate"])?.render) return false;
            return WebpackModules.find(["render", "hydrate"]);
        });

        const ModalFunctions = WebpackModules.find(["openModal", "openModalLazy"]);
        const ModalElements = WebpackModules.find(["ModalRoot", "ModalListContent"]);

        global.webpackChunkdiscord_app = window.webpackChunkdiscord_app;

        /**
         * @type {Api}
         */
        const VApi = {
            Meta: {
                Discord: `${await DiscordNative.app.getReleaseChannel()} ${await DiscordNative.app.getVersion()}`,
                Velocity: info.version,
                VApi: `${info.api.channel} ${info.api.version}`,
            },
            React: { ...React },
            ReactDOM: { ...ReactDOM },
            request,
            WebpackModules: WebpackModules,
            showChangelog: () => {
                return updater.changelogModal();
            },
            Utilities: {
                waitFor,
                waitUntil,
                joinServer: (code, goTo = true) => {
                    const { transitionToGuild } = WebpackModules.find(["transitionToGuild"]);
                    const { acceptInvite } = WebpackModules.find(["acceptInvite"]);

                    const res = acceptInvite(code);
                    if (goTo) return res.then(({ guild, channel }) => transitionToGuild(guild.id, channel.id));
                },
                joinOfficialServer: () => {
                    const { transitionToGuild } = WebpackModules.find(["transitionToGuild"]);
                    const { getGuilds } = WebpackModules.find(["getGuilds"]);

                    if (Boolean(getGuilds()["959035496707817502"])) return transitionToGuild("959035496707817502", "959035497462759436");
                    else {
                        const { acceptInvite } = WebpackModules.find(["acceptInvite"]);

                        const res = acceptInvite("dATuY2F3Bd");
                        if (goTo) return res.then(() => transitionToGuild("959035496707817502", "959035497462759436"));
                    }
                },
            },
            VelocityElements: {
                head: document.querySelector("velocity-head"),
                body: document.querySelector("velocity-body"),
            },
            Logger: logger,
            Styling: StylingManager,
            Scripting: ScriptingManager,
            modals: {
                open: (reactElement, modalOpts) => ModalFunctions.openModal(reactElement, modalOpts),
                close: (modalId, way) => ModalFunctions.closeModal(modalId, way),
                ModalRoot: ModalElements.ModalRoot,
                ModalHeader: ModalElements.ModalHeader,
                ModalCloseButton: ModalElements.ModalCloseButton,
                ModalContent: ModalElements.ModalContent,
                ModalListContent: ModalElements.ModalListContent,
                ModalFooter: ModalElements.ModalFooter,
                ModalSize: ModalElements.ModalSize,
            },
            DataStore: DataStore,
            customCSS: {
                reload: () => {
                    if (document.querySelector("#customcss")) document.querySelector("#customcss").remove();
                    const css = DataStore("VELOCITY_SETTINGS").CSS;
                    const cssBeta = DataStore("VELOCITY_SETTINGS").CSSFeatures;

                    if (DataStore("VELOCITY_SETTINGS").CSSEnabled) {
                        let style = document.createElement("style");
                        style.innerText = cssBeta ? parse(css) : css;
                        style.id = "customcss";
                        return document.querySelector("velocity-head").appendChild(style);
                    }
                },
                get: () => {
                    const css = DataStore("VELOCITY_SETTINGS").CSS;

                    return parse(css);
                },
                update: (css) => {
                    return DataStore.setData("VELOCITY_SETTINGS", "CSS", css);
                },
            },
            Patcher: patch,
        };

        const FluxDispatcher = WebpackModules.find(["_currentDispatchActionType", "_processingWaitQueue"]);
        VApi.FluxDispatcher = FluxDispatcher;

        toWindow("VApi", VApi);
        if (DevMode) logger.log("Velocity", "VApi Added");

        const i18nManager = require("./core/i18n");
        i18nManager.initialize();
        const { Strings, normalizeString } = i18nManager;
        if (DevMode) logger.log("Velocity", "i18n Initialized");

        const ExperimentManager = require("./core/experiments");
        ExperimentManager.initialize();
        if (DevMode) logger.log("Velocity", "Experiments Initialized");

        const { showToast, showConfirmationModal } = require("./core/ui/Notifications");
        const Components = require("./core/components");

        VApi.Components = Components;
        VApi.showToast = showToast;
        VApi.showConfirmationModal = showConfirmationModal;

        VApi.AddonManager = {
            plugins: plugins(),
            themes: themes(),
            remote: remote(),
        };

        const { InfoModal } = require("./core/ui/InfoModal");
        const { SponsorModal } = require("./core/ui/SponsorModal");
        VApi.showInfoModal = InfoModal;
        VApi.showSponsorModal = SponsorModal;

        Object.freeze(VApi);

        const load = Module._load;

        // Thanks BD
        Module._load = function (request) {
            if (request === "process") {
                return process;
            }

            if (path.resolve(__dirname, request) === path.resolve(__dirname, "./core/secure.js") || path.resolve(__dirname, request) === path.resolve(__dirname, "./core/secure")) {
                return null; // Limit access to the security token. all modules that need it will have it by this time.
            }

            if (request === "@velocity/api") {
                return VApi;
            }

            return load.apply(this, arguments);
        };

        const data = fs.readFile(path.join(__dirname, "./core/ui/styles.css"), "utf-8");

        VApi.Styling.injectInternalCSS("velocity_internal_styles", await data);

        let jsChecked = DataStore("VELOCITY_SETTINGS").JSEnabled;
        let js = DataStore("VELOCITY_SETTINGS").JS;

        if (jsChecked) {
            try {
                await waitFor('[class*="guilds"]');
                eval(js);
            } catch (e) {
                VApi.showToast("Startup Script", Strings.Toasts.StartupScript.error, { type: "error", timeout: 4000 });

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

        // Wait for Discord to Finish Loading
        await waitFor('[class*="guilds"]');

        if (!DataStore.getData("VELOCITY_SETTINGS", "hasShownChangelog")) {
            VApi.showChangelog();
            DataStore.setData("VELOCITY_SETTINGS", "hasShownChangelog", true);
        }

        const allThemes = VApi.AddonManager.themes.getAll();
        const allPlugins = VApi.AddonManager.plugins.getAll();

        for (let meta of Object.values(allThemes)) {
            VApi.showToast("Addon Manager", `${Strings.Toasts.AddonManager.loaded} <strong>${meta.name} ${meta.version}</strong>`);
        }
        for (let meta of Object.values(allPlugins)) {
            VApi.showToast("Addon Manager", `${Strings.Toasts.AddonManager.loaded} <strong>${meta.name} ${meta.version}</strong>`);
        }

        const enabledThemes = DataStore("VELOCITY_SETTINGS").enabledThemes;
        for (let [theme, data] of Object.entries(enabledThemes)) {
            if (DevMode) logger.log(theme, data);
            if (data) {
                if (VApi.AddonManager.themes.get(theme)) {
                    logger.log("Addon Manager", `Enabled ${theme}`);
                    VApi.AddonManager.themes.enable(theme);
                    VApi.showToast("Addon Manager", `${Strings.Toasts.AddonManager.enabled} <strong>${theme}</strong>`, { type: "success" });
                }
            }
        }

        const enabledPlugins = DataStore("VELOCITY_SETTINGS").enabledPlugins;
        for (let [plugin, data] of Object.entries(enabledPlugins)) {
            if (DevMode) logger.log(plugin, data);
            if (data) {
                if (VApi.AddonManager.plugins.get(plugin)) {
                    try {
                        logger.log("Addon Manager", `Enabled ${plugin}`);
                        VApi.AddonManager.plugins.enable(plugin);
                        VApi.showToast("Addon Manager", `${Strings.Toasts.AddonManager.enabled} <strong>${plugin}</strong>`, { type: "success" });
                    } catch (e) {
                        VApi.showToast("Addon Manager", `${Strings.Toasts.AddonManager.failedstart} <strong>${plugin}</strong>`, { type: "error" });
                        logger.error("Addon Manager", `Failed to start ${plugin}:`, e);
                    }
                }
            }
        }

        if (DevMode) logger.log("Velocity", "Addons Loaded");

        const MessageContent = WebpackModules.find("MessageContent").default;
        const Alert = WebpackModules.find("Alert").default;
        const ButtonEle = WebpackModules.find(["ButtonColors"]).default;
        const ButtonColors = WebpackModules.find(["ButtonColors"]).ButtonColors;
        const ButtonSizes = WebpackModules.find(["ButtonColors"]).ButtonSizes;

        patch(
            "VelocityInternal-Protocol-Patch",
            MessageContent,
            "type",
            ([props], res) => {
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
                                                Strings.Titles.about
                                            ),
                                            React.createElement(WebpackModules.find("Tooltip").default, {
                                                text: Strings.Tooltips.whatsthis,
                                                children: (props) =>
                                                    React.createElement(WebpackModules.find("Clickable").default, {
                                                        ...props,
                                                        className: "velocity-about-card-header-info",
                                                        onClick: () => {
                                                            try {
                                                                VApi.modals.open((p) =>
                                                                    React.createElement(Alert, {
                                                                        ...p,
                                                                        title: Strings.Modals.WhatsThis.header,
                                                                        body: React.createElement(
                                                                            "p",
                                                                            {
                                                                                className: "velocity-about-alert-text",
                                                                            },
                                                                            Strings.Modals.WhatsThis.content[0],
                                                                            React.createElement("br"),
                                                                            Strings.Modals.WhatsThis.content[1]
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
                                                `${Strings.Modals.Info.version} ${info.version} (${info.hash})`
                                            ),
                                            React.createElement(
                                                "span",
                                                {
                                                    className: "velocity-about-card-body-author",
                                                },
                                                `${Strings.Modals.Info.api} ${info.api.channel} ${info.api.version}`
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
                                                    `${Strings.Toasts.Updater.updateto} v${vNum[1]}`
                                                ),

                                                React.createElement(WebpackModules.find("Tooltip").default, {
                                                    text: Strings.Tooltips.whatsthis,
                                                    children: (props) =>
                                                        React.createElement(WebpackModules.find("Clickable").default, {
                                                            ...props,
                                                            className: "velocity-about-card-header-info",
                                                            onClick: () => {
                                                                try {
                                                                    VApi.modals.open((p) =>
                                                                        React.createElement(Alert, {
                                                                            ...p,
                                                                            title: Strings.Modals.WhatsThis.header,
                                                                            body: React.createElement(
                                                                                "p",
                                                                                {
                                                                                    className: "velocity-about-alert-text",
                                                                                },
                                                                                Strings.Modals.WhatsThis.content[0],
                                                                                React.createElement("br"),
                                                                                Strings.Modals.WhatsThis.content[1]
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
                                            className: "velocity-update-card-body",
                                            children: [React.createElement("span", null, Strings.Modals.Updater.wanttoinstall)],
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
                                                                        title: Strings.Titles.awkward,
                                                                        body: React.createElement(
                                                                            "p",
                                                                            {
                                                                                className: "velocity-update-alert-text",
                                                                            },
                                                                            Strings.Modals.Updater.notimplemented
                                                                        ),
                                                                    })
                                                                );
                                                            } catch (error) {
                                                                logger.error(error);
                                                            }
                                                        },
                                                    },
                                                    Strings.Toasts.Updater.install
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
                                                    Strings.Toasts.Updater.invalidURL
                                                ),
                                                React.createElement(WebpackModules.find("Tooltip").default, {
                                                    text: Strings.Tooltips.whatsthis,
                                                    children: (props) =>
                                                        React.createElement(WebpackModules.find("Clickable").default, {
                                                            ...props,
                                                            className: "velocity-about-card-header-info",
                                                            onClick: () => {
                                                                try {
                                                                    VApi.modals.open((p) =>
                                                                        React.createElement(Alert, {
                                                                            ...p,
                                                                            title: Strings.Modals.WhatsThis.header,
                                                                            body: React.createElement(
                                                                                "p",
                                                                                {
                                                                                    className: "velocity-about-alert-text",
                                                                                },
                                                                                Strings.Modals.WhatsThis.content[0],
                                                                                React.createElement("br"),
                                                                                Strings.Modals.WhatsThis.content[1]
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
                                            children: [React.createElement("span", null, Strings.Toasts.Updater.cannot)],
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
                                                    Strings.Toasts.Updater.invalid
                                                ),
                                            ],
                                        }),
                                    ],
                                }),
                            ]);
                        }
                    }
                }
            },
            { beta: true, warning: true }
        );

        patch("VelocityInternal-GuildTooltip-Patch", WebpackModules.find("GuildTooltip"), "default", ([props], res) => {
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
        patch("VelocityInternal-Badge-Patch", WebpackModules.find("UserProfileBadgeList"), "default", ([{ user }], res) => {
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
                React.createElement(WebpackModules.find("Tooltip").default, {
                    text: Badges[user.id].name,
                    children: (props) =>
                        React.createElement(WebpackModules.find("Clickable").default, {
                            ...props,
                            className: "velocity-badge",
                            onClick: () => {
                                VApi.showSponsorModal();
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

        global.windowObj = window;

        await waitFor(`[class^="panels"] > [class^="container"] [class^="flex"] > :last-child`);
        await waitUntil(() => global.windowObj.monaco);
        const settings = require("./core/ui/Settings");
        settings;

        if (DevMode) logger.log("Velocity", "Settings Added");

        if (DataStore.getData("VELOCITY_SETTINGS", "ReloadOnLogin")) {
            VApi.WebpackModules.find(["dirtyDispatch"]).subscribe("LOGIN", (event) => {
                location.reload();
            });
        }
    }
    if (window.document.readyState === "loading") window.document.addEventListener("DOMContentLoaded", DomLoaded);
    else DomLoaded();
})(webFrame.top.context);
