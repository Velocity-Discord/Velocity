const electron = { webFrame, contextBridge, ipcRenderer } = require("electron");
const logger = require("./core/logger");
const DataStore = require("./core/datastore");
const patch = require("./core/patch");

const path = process.env.DISCORD_PRELOAD;

if (path) {
    require(path);
    logger.log("Velocity","Discord Preloaded")
} else {
    logger.error("Velocity", "No preload path found!");
}

((window) => {
    // Simple add item to both 'global' and 'window'
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
    // DomLoaded event
    async function DomLoaded() {
        if (DataStore.getData("VELOCITY_SETTINGS", "DegubberKey")) {
            window.addEventListener("keydown", (event) =>
                    event.code === "F8" &&
                    (() => {
                        debugger;
                    })(),
            );
        }

        logger.log("Velocity", "DOM Loaded");

        const DevMode = DataStore("VELOCITY_SETTINGS").DevMode;

        const vhead = document.createElement("div");
        vhead.id = "velocity-head";
        const vbody = document.createElement("div");
        vbody.id = "velocity-body";
        const vtoasts = document.createElement("div");
        vtoasts.id = "velocity-toasts";

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

        function escapeID(id) {
            return id.replace(/^[^a-z]+|[^\w-]+/gi, "-");
        }

        const AddonManager = require("./core/addonManager");
        AddonManager
        const { themes, plugins, readMeta } = AddonManager
        if (DevMode) logger.log("Velocity", "AddonManager added");

        // Remove Discods devtools alert
        await window.DiscordNative.window.setDevtoolsCallbacks(null, null);

        const find = require("./core/webpack");
        const request = require("./core/request");

        t = find(["isDeveloper"]);
        Object.defineProperty(t, "isDeveloper", { get: (_) => 1, set: (_) => _, configurable: true });

        let Badges;
        request("https://raw.githubusercontent.com/TheCommieAxolotl/TheCommieAxolotl/main/v/Badges.json", (_, __, body) => (Badges = JSON.parse(body)));

        const React = await waitUntil(() => {
            if (!find(["createElement", "Component"])?.createElement) return false;
            return find(["createElement", "Component"]);
        });
        const ReactDOM = await waitUntil(() => {
            if (!find(["render", "hydrate"])?.render) return false;
            return find(["render", "hydrate"]);
        });

        const ModalFunctions = find(["openModal", "openModalLazy"]);
        const ModalElements = find(["ModalRoot", "ModalListContent"]);

        const VApi = {
            React: { ...React },
            ReactDOM: { ...ReactDOM },
            request,
            themes: themes(),
            getModule: find,
            waitFor,
            velocityElements: {
                head: document.getElementById("velocity-head"),
                body: document.getElementById("velocity-body"),
            },
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
                        document.getElementById("velocity-head").appendChild(style);
                    }
                },
                update: (css) => {
                    DataStore.setData("VELOCITY_SETTINGS", "CSS", css);
                },
            },
            Patcher: patch,
            joinServer: (code, goTo = true) => {
                const { transitionToGuild } = find(["transitionToGuild"]);
                const { acceptInvite } = find(["acceptInvite"]);

                const res = acceptInvite(code);
                if (goTo) res.then(({ guild, channel }) => transitionToGuild(guild.id, channel.id));
            },
            joinOfficialServer: () => {
                const { transitionToGuild } = find(["transitionToGuild"]);
                const { getGuilds } = find(["getGuilds"]);

                if (Boolean(getGuilds()["944858264909250590"])) transitionToGuild("944858264909250590", "944858265483886644");
                else {
                    const { acceptInvite } = find(["acceptInvite"]);

                    const res = acceptInvite("m86GKntVTS");
                    if (goTo) res.then(() => transitionToGuild("944858264909250590", "944858265483886644"));;
                };
            },
        };

        const FluxDispatcher = find(["_currentDispatchActionType", "_processingWaitQueue"]);
        VApi.FluxDispatcher = FluxDispatcher;

        VApi.showToast = async function (content, options = {}) {
            const container = document.getElementById("velocity-toasts");
            const { strong = "", type = "", timeout = 3000, color = "" } = options;

            const toast = document.createElement("div");
            toast.classList.add("velocity-toast");
            if (type) {
                toast.classList.add(`type-${type}`);
            }
            if (strong) {
                const Strong = document.createElement("strong");
                Strong.innerHTML = strong
                const Content = document.createTextNode(content);
                toast.appendChild(Content);
                toast.appendChild(Strong);
            } else {
                toast.innerHTML = content;
            }
            setTimeout(() => {
                toast.classList.add("closing");
                setTimeout(() => {
                    toast.remove();
                }, 700);
            }, timeout);
            if (color) {
                toast.style.color = color;
            }
            container.appendChild(toast);

            return;
        };

        VApi.triggerWebhook = async function (url, content, name) {
            const r = new XMLHttpRequest();
            r.open("POST", url);
            r.setRequestHeader("Content-type", "application/json");

            var params = {
                username: name,
                content: content,
            };

            r.send(JSON.stringify(params));
        };

        VApi.injectCSS = function (id, css) {
            var style = document.createElement("style");
            style.innerText = css;
            style.id = id;
            document.getElementById("velocity-head").appendChild(style);

            return;
        };

        VApi.uninjectCSS = function (id) {
            const style = document.querySelector("#" + id);
            style.remove();

            return;
        };

        VApi.appendScript = function (id, url) {
            const eid = escapeID(id);
            const script = document.createElement("script");
            script.src = url;
            script.id = eid;

            document.getElementById("velocity-head").appendChild(script);

            return;
        };

        VApi.removeScript = function (id) {
            const eid = escapeID(id);
            document.getElementById(eid).remove();

            return;
        };

        VApi.linkStyle = function (id, url) {
            const eid = escapeID(id);
            const style = document.createElement("link");
            style.rel = "stylesheet";
            style.href = url;
            style.id = eid;

            document.getElementById("velocity-head").appendChild(style);

            return;
        };

        VApi.removeStyle = function (id) {
            const eid = escapeID(id);
            document.getElementById(eid).remove();

            return;
        };

        VApi.logger = logger;

        toWindow("VApi", VApi);
        if (DevMode) logger.log("Velocity", "VApi Added");

        VApi.plugins = plugins()

        await VApi.injectCSS(
            "Velocity CSS",
            `
            #velocity-settings-section.vertical input {margin-top: 5px;}#velocity-customcss-warning, #velocity-script-warning {cursor: pointer;} .monaco-editor:not(.rename-box),.monaco-editor .overflow-guard,.monaco-editor .editor-scrollable,.monaco-editor .minimap-shadow-visible,.monaco-editor .decorationsOverviewRuler {height: 100% !important;}#editor {height: 300px;margin: 5px 0;}
            .velocity-card{max-width:383.531px;overflow:hidden}.velocity-card .paragraph-9M861H{overflow:hidden;text-overflow:ellipsis}.velocity-card{background:var(--background-secondary);border-radius:5px;padding:3%}.velocity-card-header-top{display:inline-flex}.velocity-card-header{margin-bottom:3px}.velocity-card-header-name{margin-right:3px;font-weight:550;color:var(--header-primary);font-size:large}.velocity-card-header-version{opacity:0.8;margin-right:3px;font-weight:600;color:var(--header-secondary);font-size:large}.velocity-card-header-author{margin-top:3px;font-weight:600;font-size:9pt;color:var(--brand-experiment)}.velocity-card-footer{display:flex;align-items:center}.velocity-card-footer-edit-button{border: none !important;}.velocity-card-footer-switch{margin-left:auto}.velocity-card-footer-license{font-weight:600;color:var(--text-muted)}#velocity-addons-grid{margin:20px 0 10px 0;display:grid;grid-gap:5%}
            @keyframes toastShow{from{opacity:0;transform:translateX(100px) scale(0.2)}to{opacity:1;transform:translateX(0) scale(1)}}@keyframes toastHide{from{opacity:1;transform:translateX(0) scale(1)}to{opacity:0;transform:translateX(100px) scale(0.3)}}.velocity-toast{max-width: 300px;overflow: hidden;text-overflow: ellipsis;margin-top:1%;margin-right:2.5%;animation:toastShow 0.15s ease-out;background-color:#2d2c2c66;backdrop-filter: blur(15px);padding: 12px 47px 12px 12px;font-size:11pt;border-radius:4px;z-index:99999;box-shadow:2px 2px 5px #00000075;color:white;position:relative;width:fit-content;top:5%;border-right:2px solid;border-right-color:var(--text-default)}.velocity-toast.closing{animation:toastHide 0.15s ease-in;opacity:0;transform:translateY(-30px) scale(0.3)}#velocity-toasts{display:flex;width:100%;height:100%;align-items:flex-end;flex-direction:column}.velocity-toast.type-error{border-right-color:#fd3a5f}.velocity-toast.type-success{border-right-color:#38bf5d}.velocity-toast.type-warn{border-right-color:#da8d14}.velocity-toast.type-velocity{border-right-color:var(--brand-experiment)}
            .Velocity-badge{cursor:pointer}#velocity-settings-section.vertical{flex-direction: column;}#velocity-settings-section{display:flex;padding:5%;border-bottom:thin solid var(--background-modifier-accent)}#velocity-settings-section:nth-child(1){border-top:thin solid var(--background-modifier-accent)}#velocity-settings-section > div:not([class^="input"]):nth-child(2){position:absolute;right:5%}#velocity-settings-section-info > div:nth-child(1){font-weight:500}#velocity-settings-section-info > div:nth-child(2){font-weight:400}.velocity-button-container{display:flex}.velocity-button{margin-right:10px;margin-top:5px}textarea.velocity-editor::-webkit-scrollbar-thumb{background:var(--background-tertiary);border-radius:50px}textarea.velocity-editor::-webkit-scrollbar{background:transparent;width:5px}textarea.velocity-editor{color:var(--text-normal) !important;height:200px;width:100%;overflow-y:scroll;align-items:start;justify-content:left;background:var(--background-secondary);border:none;resize:none}
            `,
        );

        let jsChecked = DataStore("VELOCITY_SETTINGS").JSEnabled;
        let js = DataStore("VELOCITY_SETTINGS").JS;

        if (jsChecked) {
            try {
                await waitFor(".guilds-2JjMmN");
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
            document.getElementById("velocity-head").appendChild(style);
        }

        if (DevMode) logger.log("Velocity", "Custom CSS Injected");

        // Patches & Addons
        await waitFor(".guilds-2JjMmN");

        const allThemes = VApi.themes.getAll();
        const allPlugins = VApi.plugins.getAll();

        for (let meta of Object.values(allThemes)) {
            VApi.showToast(`Loaded `, { strong: `${meta.name} ${meta.version}` });
        }
        for (let meta of Object.values(allPlugins)) {
            VApi.showToast(`Loaded `, { strong: `${meta.name} ${meta.version}` });
        }

        const enabledThemes = DataStore("VELOCITY_SETTINGS").enabledThemes;
        for (let [theme, data] of Object.entries(enabledThemes)) {
            if (DevMode) console.log(theme, data);
            if (data) {
                if (VApi.themes.get(theme)) {
                    logger.log("ThemeManager", `Enabled ${theme}`);
                    VApi.themes.enable(theme);
                    VApi.showToast(`Enabled `, { strong: `${theme}`, type: "success" });
                }
            }
        }

        const enabledPlugins = DataStore("VELOCITY_SETTINGS").enabledPlugins;
        for (let [plugin, data] of Object.entries(enabledPlugins)) {
            if (DevMode) console.log(plugin, data);
            if (data) {
                if (VApi.plugins.get(plugin)) {
                    try {
                        logger.log("PluginManager", `Enabled ${plugin}`);
                        VApi.plugins.enable(plugin);
                        VApi.showToast(`Enabled `, { strong: `${plugin}`, type: "success" });
                    } catch (e) {
                        VApi.showToast(`Failed to start `, { strong: `${plugin}`, type: "error" });
                        logger.error("Addon Manager", e);
                    }
                }
            }
        }

        if (DevMode) logger.log("Velocity", "Addons Loaded");

        patch("VelocityInternal-GuildTooltip-Patch", find("GuildTooltip"), "default", ([props], res) => {
            if (!(props.guild.id === "901774051318591508" || (props.guild.id === "944858264909250590" && !props.guild.features.has("VERIFIED")))) return;
            props.guild.features.add("VERIFIED");
        });
        patch("VelocityInternal-Badge-Patch", find("UserProfileBadgeList"), "default", ([{ user }], res) => {
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
                React.createElement(find("Tooltip").default, {
                    text: Badges[user.id].name,
                    children: (props) =>
                        React.createElement(find("Clickable").default, {
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

        global.windowfunc = window

        await waitFor(".panels-3wFtMD > .container-YkUktl .flex-2S1XBF > :last-child");
        await waitUntil(() => global.windowfunc.monaco);
        const settings = require("./core/ui/SettingsModal");
        settings

        if (DevMode) logger.log("Velocity", "Settings Added");
    }
    if (window.document.readyState === "loading") window.document.addEventListener("DOMContentLoaded", DomLoaded);
    else DomLoaded();
})(webFrame.top.context);