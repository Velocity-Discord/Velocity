const DataStore = require("../datastore")
const { ipcRenderer, shell } = require("electron");
const settingsquery = document.querySelector(".panels-3wFtMD > .container-YkUktl .flex-2S1XBF > :last-child");
const button = VApi.getModule(["ButtonColors"]).default;
const Text = VApi.getModule("Text").default;
const ButtonColors = VApi.getModule(["ButtonColors"]).ButtonColors;
const ButtonSizes = VApi.getModule(["ButtonColors"]).ButtonSizes;
const SwitchEle = VApi.getModule("Switch").default;
const Tooltip = VApi.getModule.prototypes("renderTooltip").default;
const { React, logger } = VApi;
const Markdown = VApi.getModule((m) => m.default?.displayName === "Markdown" && m.default.rules).default;
const Switche = VApi.getModule("Switch").default
const TextInput = VApi.getModule("TextInput").default;
const path = require("path")
const closeIcon = VApi.getModule("CloseIconWithKeybind").default
const {info} = require("../../package.json")

async function pushLayer(element) { 
    VApi.getModule(["pushLayer"]).pushLayer(() => element);
}

async function reloadPrompt(title, content) {
    const { React, getModule, modals } = VApi;
    const ConfirmationModal = getModule("ConfirmModal").default;
    const Button = getModule(["ButtonColors"]);
    const { Messages } = getModule((m) => m.default?.Messages?.OKAY).default;
    const Markdown = getModule((m) => m.default?.displayName === "Markdown" && m.default.rules).default;

    if (!Array.isArray(content)) content = [content];
    content = content.map((c) => (typeof c === "string" ? React.createElement(Markdown, null, c) : c));

    return new Promise((resolve) => {
        modals.open((props) => {
            if (props.transitionState === 3) resolve(false);
            return React.createElement(
                ConfirmationModal,
                Object.assign(
                    {
                        header: title,
                        confirmButtonColor: Button.ButtonColors.BRAND,
                        confirmText: "Reload",
                        danger: true,
                        cancelText: Messages.CANCEL,
                        onConfirm: () => resolve(true),
                        onCancel: () => resolve(false),
                        children: content,
                    },
                    props,
                ),
            );
        });
    });
}

const monaco = global.windowfunc.monaco

const SettingsInputSection = React.memo((props) => {
const { setting, note, name, warning, placeholder, type, maxLength, vertical } = props;

const [value, setValue] = React.useState(DataStore.getData("VELOCITY_SETTINGS", setting));
if (vertical) {
    return React.createElement("div", {
        id: "velocity-settings-section",
        class: "vertical",
        children: [
            React.createElement("div", {
                id: "velocity-settings-section-info",
                children: [
                    React.createElement(Text, {
                        color: Text.Colors.HEADER_PRIMARY,
                        size: Text.Sizes.SIZE_16,
                    }, name),
                    React.createElement(Text, {
                        color: Text.Colors.HEADER_SECONDARY,
                        size: Text.Sizes.SIZE_14,
                    }, note),
                    React.createElement(Text, {
                        color: Text.Colors.ERROR,
                        size: Text.Sizes.SIZE_14,
                    }, warning),
                ],
            }),
            React.createElement(TextInput, {
                value: value,
                placeholder: placeholder,
                type: type,
                maxLength: maxLength,
                onInput: ({ target }) => {
                    setValue(target.value)
                    DataStore.setData("VELOCITY_SETTINGS", setting, target.value);
            }
            }),
        ],
    });
}
else {
    return React.createElement("div", {
        id: "velocity-settings-section",
        children: [
            React.createElement("div", {
                id: "velocity-settings-section-info",
                children: [
                    React.createElement(Text, {
                        color: Text.Colors.HEADER_PRIMARY,
                        size: Text.Sizes.SIZE_16,
                    }, name),
                    React.createElement(Text, {
                        color: Text.Colors.HEADER_SECONDARY,
                        size: Text.Sizes.SIZE_14,
                    }, note),
                    React.createElement(Text, {
                        color: Text.Colors.ERROR,
                        size: Text.Sizes.SIZE_14,
                    }, warning),
                ],
            }),
            React.createElement(TextInput, {
                value: value,
                placeholder: placeholder,
                type: type,
                maxLength: maxLength,
                onInput: ({ target }) => {
                    setValue(target.value)
                    DataStore.setData("VELOCITY_SETTINGS", setting, target.value);
            }
            }),
        ],
    });
}
})

const SettingsSection = React.memo((props) => {
const { setting, note, name, warning, action, reload = false } = props;

const [enabled, setEnabled] = React.useState(DataStore.getData("VELOCITY_SETTINGS", setting));
return React.createElement("div", {
    id: "velocity-settings-section",
    children: [
        React.createElement("div", {
            id: "velocity-settings-section-info",
            children: [
                React.createElement(Text, {
                    color: Text.Colors.HEADER_PRIMARY,
                    size: Text.Sizes.SIZE_16,
                }, name),
                React.createElement(Text, {
                    color: Text.Colors.HEADER_SECONDARY,
                    size: Text.Sizes.SIZE_14,
                }, note),
                React.createElement(Text, {
                    color: Text.Colors.ERROR,
                    size: Text.Sizes.SIZE_14,
                    id: `velocity-settings-section-${setting.toLowerCase()}-warning`
                }, warning),
            ],
        }),
        React.createElement(Switche, {
            checked: enabled,
            onChange: async () => {
                if (action) {
                    action()
                }
                DataStore.setData("VELOCITY_SETTINGS", setting, !enabled);
                setEnabled(!enabled);
                if (reload) {
                    const re = await reloadPrompt("Restart Discord?", "This Setting Requires a full reload of discord.");
                    if (re) {
                        ipcRenderer.invoke("reload-app");
                    }
                }
            },
        }),
    ],
});
})

const Card = React.memo((props) => {
const { meta, type } = props;

const [enabled, setEnabled] = React.useState(VApi[type].isEnabled(meta.name));
return React.createElement("div", {
    className: "velocity-card",
    type,
    id: meta.name,
    children: [
        React.createElement("div", {
            className: "velocity-card-header-wrapper",
            children: React.createElement("div", {
                className: "velocity-card-header",
                children: [
                    React.createElement("div", {
                        className: "velocity-card-header-top",
                        children: [
                            React.createElement("div", {
                                className: "velocity-card-header-name",
                                children: meta.name,
                            }),
                            React.createElement("div", {
                                className: "velocity-card-header-version",
                                children: `v${meta.version}`,
                            }),
                        ],
                    }),
                    React.createElement("div", {
                        className: "velocity-card-header-author",
                        children: meta.author,
                    }),
                ],
            }),
        }),
        React.createElement("div", {
            className: "velocity-card-content-wrapper",
            children: React.createElement(Markdown, {
                className: "velocity-content",
                children: meta.description,
            }),
        }),
        React.createElement("div", {
            className: "velocity-card-footer-wrapper",
            children: React.createElement("div", {
                className: "velocity-card-footer",
                children: [
                    React.createElement("div", {
                        className: "velocity-card-footer-left",
                        children: [
                            React.createElement(
                                button,
                                {
                                    color: ButtonColors.GREY,
                                    size: ButtonSizes.TINY,
                                    className: ["velocity-card-footer-edit-button"],
                                    onClick: () => {
                                        shell.openPath(meta.file);
                                    },
                                },
                                "Edit",
                            ),
                        ],
                    }),
                    React.createElement("div", {
                        className: "velocity-card-footer-switch",
                        children: React.createElement(Switche, {
                            checked: enabled,
                            onChange: () => {
                                try {
                                    VApi[type].toggle(meta.name);
                                    setEnabled(!enabled);
                                    if (!enabled) {
                                        VApi.showToast(`Enabled <strong>${meta.name}</strong>`, { type: "success" });
                                    }
                                    else {
                                        VApi.showToast(`Disabled <strong>${meta.name}</strong>`, { type: "success" });
                                    }
                                } catch (e) {
                                    if (!enabled) {
                                        VApi.showToast(`Failed to start <strong>${meta.name}</strong>`, { type: "error" });
                                    }
                                    else {
                                        VApi.showToast(`Failed to stop <strong>${meta.name}</strong>`, { type: "error" });
                                    }
                                    logger.error("Addon Manager", e);
                                }
                            },
                        }),
                    }),
                ],
            }),
        }),
    ],
});
});

async function add() {
await VApi.utils.waitFor(".sidebar-nqHbhN");

const Settings = DataStore("VELOCITY_SETTINGS");

const infoele = document.querySelector(".info-3pQQBb > span");
const infoClasses = infoele.classList;
const connectionsTab = document.querySelector(`[aria-controls="connections-tab"]`);
const connectionsTabAfter = document.querySelector(`[aria-controls="connections-tab"] + div`);
const classes = connectionsTab.classList;
const seperatorClasses = connectionsTabAfter.classList;
const headerClasses = document.querySelector(`.side-2ur1Qk > [class^="header"]`).classList;

const vInfo = document.createElement("span")
vInfo.classList.add(...infoClasses)
vInfo.style.textTransform = "none"
vInfo.innerHTML = `Velocity ${info.version} (${info.hash})`;
infoele.parentNode.insertBefore(vInfo, infoele);

const seperator = document.createElement("div");
seperator.classList.add(...seperatorClasses);
const header = document.createElement("div");
const headerText = document.createTextNode("Velocity");
header.appendChild(headerText);
header.classList.add(...headerClasses);
const settingsTab = document.createElement("div");
const settingsTabText = document.createTextNode("Settings");
settingsTab.appendChild(settingsTabText);
settingsTab.classList.add("velocity-settings", ...classes);
const cssTab = document.createElement("div");
const cssTabText = document.createTextNode("Custom CSS");
cssTab.appendChild(cssTabText);
cssTab.classList.add("velocity-custom-css", ...classes);
const ssTab = document.createElement("div");
const ssTabText = document.createTextNode("Startup Script");
ssTab.appendChild(ssTabText);
ssTab.classList.add("velocity-startup-script", ...classes);
const pluginsTab = document.createElement("div");
const pluginsTabText = document.createTextNode("Plugins");
pluginsTab.appendChild(pluginsTabText);
pluginsTab.classList.add("velocity-plugins", ...classes);
const themesTab = document.createElement("div");
const themesTabText = document.createTextNode("Themes");
themesTab.appendChild(themesTabText);
themesTab.classList.add("velocity-themes", ...classes);

connectionsTabAfter.parentNode.insertBefore(seperator, connectionsTabAfter);
connectionsTabAfter.parentNode.insertBefore(header, connectionsTabAfter);
connectionsTabAfter.parentNode.insertBefore(settingsTab, connectionsTabAfter);
if (Settings.CSSEnabled) connectionsTabAfter.parentNode.insertBefore(cssTab, connectionsTabAfter);
if (Settings.JSEnabled) connectionsTabAfter.parentNode.insertBefore(ssTab, connectionsTabAfter);
connectionsTabAfter.parentNode.insertBefore(pluginsTab, connectionsTabAfter);
connectionsTabAfter.parentNode.insertBefore(themesTab, connectionsTabAfter);

const tabSelector = document.querySelector(".velocity-settings");
const cssSelector = document.querySelector(".velocity-custom-css");
const ssSelector = document.querySelector(".velocity-startup-script");
const pluginsSelector = document.querySelector(".velocity-plugins");
const themesSelector = document.querySelector(".velocity-themes");

pluginsSelector.addEventListener("click", () => {
    (async () => {
        async function prompt(title) {
            const Plugins = VApi.plugins.getAll();
            const { getModule, modals } = VApi;
            const ConfirmationModal = getModule("ConfirmModal").default;
            const Button = getModule(["ButtonColors"]);
            const { Messages } = getModule((m) => m.default?.Messages?.OKAY).default;
            const TextInput = VApi.getModule("TextInput").default;

            const csschecked = settings.CSSEnabled;
            const startupJS = DataStore.getData("VELOCITY_SETTINGS", "JS");

            return new Promise((resolve) => {
                modals.open((props) => {
                    if (props.transitionState === 3) resolve(null);
                    return React.createElement(
                        ConfirmationModal,
                        Object.assign(
                            {
                                header: title,
                                confirmButtonColor: Button.ButtonColors.BRAND,
                                confirmText: "Done",
                                cancelText: " ",
                                onConfirm: () => resolve(true),
                                onCancel: () => resolve(false),
                                children: [
                                    React.createElement(
                                        button,
                                        {
                                            id: "plugins-folder",
                                            color: ButtonColors.BRAND,
                                            size: ButtonSizes.SMALL,
                                            className: ["velocity-button"],
                                            onClick: () => {
                                                shell.openPath(VApi.plugins.folder);
                                            },
                                        },
                                        "Open Plugins Folder",
                                    ),
                                    React.createElement("div", {
                                        id: "velocity-addons-grid",
                                        children: [
                                            Plugins.map((plugin) =>
                                                React.createElement(Card, {
                                                    meta: plugin,
                                                    type: "plugins",
                                                }),
                                            ),
                                        ],
                                    }),
                                ],
                            },
                            props,
                        ),
                    );
                });
            });
        }
        prompt("Plugins");
    })();
});

themesSelector.addEventListener("click", () => {
    (async () => {
        async function prompt(title) {
            const Themes = VApi.themes.getAll();
            const { getModule, modals } = VApi;
            const ConfirmationModal = getModule("ConfirmModal").default;
            const Button = getModule(["ButtonColors"]);
            const { Messages } = getModule((m) => m.default?.Messages?.OKAY).default;
            const TextInput = VApi.getModule("TextInput").default;

            const csschecked = settings.CSSEnabled;
            const startupJS = DataStore.getData("VELOCITY_SETTINGS", "JS");

            return new Promise((resolve) => {
                modals.open((props) => {
                    if (props.transitionState === 3) resolve(null);
                    return React.createElement(
                        ConfirmationModal,
                        Object.assign(
                            {
                                header: title,
                                confirmButtonColor: Button.ButtonColors.BRAND,
                                confirmText: "Done",
                                cancelText: " ",
                                onConfirm: () => resolve(true),
                                onCancel: () => resolve(false),
                                children: [
                                    React.createElement(
                                        button,
                                        {
                                            id: "themes-folder",
                                            color: ButtonColors.BRAND,
                                            size: ButtonSizes.SMALL,
                                            className: ["velocity-button"],
                                            onClick: () => {
                                                shell.openPath(VApi.themes.folder);
                                            },
                                        },
                                        "Open Themes Folder",
                                    ),
                                    React.createElement("div", {
                                        id: "velocity-addons-grid",
                                        children: [
                                            Themes.map((theme) =>
                                                React.createElement(Card, {
                                                    meta: theme,
                                                    type: "themes",
                                                }),
                                            ),
                                        ],
                                    }),
                                ],
                            },
                            props,
                        ),
                    );
                });
            });
        }
        prompt("Themes");
    })();
});

if (Settings.JSEnabled) {
    ssSelector.addEventListener("click", () => {
        (async () => {
            const startupJS = DataStore.getData("VELOCITY_SETTINGS", "JS");
            let fontsize = DataStore.getData("VELOCITY_SETTINGS", "FontSize") || 14;
            if (fontsize > 14) {
                fontsize = 14;
                DataStore.setData("VELOCITY_SETTINGS", "FontSize", 14);
            }
            if (fontsize < 2) {
                fontsize = 2;
                DataStore.setData("VELOCITY_SETTINGS", "FontSize", 2);
            }
            async function prompt(title) {
                const { getModule, modals } = VApi;
                const ConfirmationModal = getModule("ConfirmModal").default;
                const Button = getModule(["ButtonColors"]);
                const { Messages } = getModule((m) => m.default?.Messages?.OKAY).default;
                const TextInput = VApi.getModule("TextInput").default;

                const csschecked = settings.CSSEnabled;
                const startupJS = DataStore.getData("VELOCITY_SETTINGS", "JS");
                return new Promise((resolve) => {
                    modals.open((props) => {
                        if (props.transitionState === 3) resolve(null);
                        return React.createElement(
                            ConfirmationModal,
                            Object.assign(
                                {
                                    header: title,
                                    confirmButtonColor: Button.ButtonColors.BRAND,
                                    confirmText: "Done",
                                    cancelText: " ",
                                    onConfirm: () => resolve(true),
                                    onCancel: () => resolve(false),
                                    children: [
                                        React.createElement(
                                            "h1",
                                            {
                                                class: headerClasses,
                                            },
                                            "Startup Script",
                                        ),
                                        React.createElement("div", {
                                            id: "editor",
                                        }),
                                        React.createElement(Tooltip, {
                                            text: "You can still manually add the script...",
                                            children: (props) => 
                                            React.createElement(VApi.getModule("Clickable").default, {
                                                ...props,
                                                className: "warning-clickable",
                                                children: [
                                                    React.createElement(Text, {
                                                        color: Text.Colors.ERROR,
                                                        size: Text.Sizes.SIZE_14,
                                                        id: `velocity-script-warning`,
                                                    }, ""),
                                                ],
                                                onClick: () => {
                                                    const coreDir = path.join(__dirname, "..");
                                                    const settingsDir = path.join(coreDir, "..", "settings")
                                                    shell.openPath(settingsDir);
                                                }
                                            }),
                                        }),
                                        (this.save = React.createElement("div", {
                                            class: "velocity-button-container",
                                            children: [
                                                React.createElement(
                                                    button,
                                                    {
                                                        id: "startup-script-save",
                                                        disabled: false,
                                                        className: [ButtonColors.BRAND, "velocity-button"],
                                                        onClick: ({target}) => {
                                                            const content = this.editor.getValue();
                                                            if (!target.disabled) {
                                                                DataStore.setData("VELOCITY_SETTINGS", "JS", content);
                                                                VApi.showToast("Saved", { type: "success" });
                                                            }
                                                        },
                                                    },
                                                    "Save",
                                                ),
                                                React.createElement(
                                                    button,
                                                    {
                                                        id: "startup-script-clear",
                                                        className: [ButtonColors.RED, "velocity-button"],
                                                        onClick: () => {
                                                            this.editor.setValue("");
                                                            DataStore.setData("VELOCITY_SETTINGS", "JS", "");

                                                            VApi.showToast("Cleared", { type: "success" });
                                                        },
                                                    },
                                                    "Clear",
                                                ),
                                            ],
                                        })),
                                    ],
                                },
                                props,
                            ),
                        );
                    });
                });
            }
            prompt("Startup Script");
            this.editor = monaco.editor.create(document.getElementById("editor"), {
                language: "javascript",
                theme: document.documentElement.classList.contains("theme-dark") ? "vs-dark" : "vs-light",
                value: startupJS,
                fontSize: fontsize,
            });
            this.editor.onDidChangeModelContent(() => {
                const content = this.editor.getValue();
                const button = document.getElementById("startup-script-save");
                if (content.includes("getToken" || "getEmail")) {
                    const warn = document.querySelector("#velocity-script-warning");
                    warn.innerHTML = "Be careful what you put in here, this script looks malicious.";
                    if (button) button.disabled = true;
                } else {
                    const warn = document.querySelector("#velocity-script-warning");
                    warn.innerHTML = "";
                    if (button) button.disabled = false;
                }
            });
        })();
    });
}

if (Settings.CSSEnabled) {
    cssSelector.addEventListener("click", () => {
        (async () => {
            const customCSS = DataStore.getData("VELOCITY_SETTINGS", "CSS");
            let fontsize = DataStore.getData("VELOCITY_SETTINGS", "FontSize") || 14;
            if (fontsize > 14) {
                fontsize = 14;
                DataStore.setData("VELOCITY_SETTINGS", "FontSize", 14);
            }
            if (fontsize < 2) {
                fontsize = 2;
                DataStore.setData("VELOCITY_SETTINGS", "FontSize", 2);
            }
            async function prompt(title) {
                const { getModule, modals } = VApi;
                const ConfirmationModal = getModule("ConfirmModal").default;
                const Button = getModule(["ButtonColors"]);
                const { Messages } = getModule((m) => m.default?.Messages?.OKAY).default;
                const TextInput = VApi.getModule("TextInput").default;

                const csschecked = settings.CSSEnabled;
                const customCSS = DataStore.getData("VELOCITY_SETTINGS", "CSS");

                return new Promise((resolve) => {
                    modals.open((props) => {
                        if (props.transitionState === 3) resolve(null);
                        return React.createElement(
                            ConfirmationModal,
                            Object.assign(
                                {
                                    header: title,
                                    confirmButtonColor: Button.ButtonColors.BRAND,
                                    confirmText: "Done",
                                    cancelText: " ",
                                    onConfirm: () => resolve(true),
                                    onCancel: () => resolve(false),
                                    children: [
                                        React.createElement(
                                            "h1",
                                            {
                                                class: headerClasses,
                                            },
                                            "Custom Css",
                                        ),
                                        React.createElement("div", {
                                            id: "editor",
                                        }),
                                        React.createElement(Tooltip, {
                                            text: "Click me to open the folder!",
                                            children: (props) => 
                                            React.createElement(VApi.getModule("Clickable").default, {
                                                ...props,
                                                className: "warning-clickable",
                                                children: [
                                                    React.createElement(Text, {
                                                        color: Text.Colors.ERROR,
                                                        size: Text.Sizes.SIZE_14,
                                                        id: `velocity-customcss-warning`,
                                                    }, ""),
                                                ],
                                                onClick: () => {
                                                    shell.openPath(VApi.themes.folder);
                                                }
                                            }),
                                        }),
                                        React.createElement("div", {
                                            class: "velocity-button-container",
                                            children: [
                                                React.createElement(
                                                    button,
                                                    {
                                                        id: "custom-css-save",
                                                        className: [ButtonColors.BRAND, "velocity-button"],
                                                        onClick: () => {
                                                            const content = this.editor.getValue();
                                                            DataStore.setData("VELOCITY_SETTINGS", "CSS", content);
                                                            VApi.customCSS.reload();

                                                            VApi.showToast("Saved", { type: "success" });
                                                        },
                                                    },
                                                    "Save",
                                                ),
                                                React.createElement(
                                                    button,
                                                    {
                                                        id: "custom-css-clear",
                                                        className: [ButtonColors.RED, "velocity-button"],
                                                        onClick: () => {
                                                            this.editor.setValue("");
                                                            DataStore.setData("VELOCITY_SETTINGS", "CSS", "");
                                                            VApi.customCSS.reload();

                                                            VApi.showToast("Cleared", { type: "success" });
                                                        },
                                                    },
                                                    "Clear",
                                                ),
                                            ],
                                        }),
                                    ],
                                },
                                props,
                            ),
                        );
                    });
                });
            }
            prompt("Custom CSS");
            this.editor = monaco.editor.create(document.getElementById("editor"), {
                language: "css",
                theme: document.documentElement.classList.contains("theme-dark") ? "vs-dark" : "vs-light",
                value: customCSS,
                fontSize: fontsize,
            });
            this.editor.onDidChangeModelContent(() => {
                const content = this.editor.getValue();

                if (content.includes("/**" && "@name")) {
                    const warn = document.getElementById("velocity-customcss-warning");
                    warn.innerHTML = "This looks like a theme... you should put themes in your theme folder, not here.";
                } else {
                    const warn = document.getElementById("velocity-customcss-warning");
                    warn.innerHTML = "";
                }
            })
        })();
    });
}

    tabSelector.addEventListener("click", () => {
        (async () => {
            async function prompt(title) {
                const { getModule, modals } = VApi;
                const ConfirmationModal = getModule("ConfirmModal").default;
                const Button = getModule(["ButtonColors"]);
                const { Messages } = getModule((m) => m.default?.Messages?.OKAY).default;
                const TextInput = VApi.getModule("TextInput").default;
                const Switch = VApi.getModule("Switch").default;

                const csschecked = settings.CSSEnabled;
                const jschecked = settings.JSEnabled;

                return new Promise((resolve) => {
                    modals.open((props) => {
                        if (props.transitionState === 3) resolve(null);
                        return React.createElement(
                            ConfirmationModal,
                            Object.assign(
                                {
                                    header: title,
                                    confirmButtonColor: Button.ButtonColors.BRAND,
                                    confirmText: "Done",
                                    cancelText: " ",
                                    onConfirm: () => resolve(true),
                                    onCancel: () => resolve(false),
                                    children: [
                                        React.createElement(SettingsSection, {
                                            setting: "Transparency",
                                            name: "Window Transparency",
                                            note: "Makes the main window transparent.",
                                            reload: true,
                                            action: () => {
                                                DataStore.setData("VELOCITY_SETTINGS", "Vibrancy", false);
                                                const warning = document.getElementById("velocity-settings-section-transparency-warning");
                                                warning.innerHTML = "Requires Restart.";
                                            },
                                        }),
                                        React.createElement(SettingsSection, {
                                            setting: "Vibrancy",
                                            name: "Window Vibrancy",
                                            note: "Makes the main window have Vibrancy. (MacOS)",
                                            reload: true,
                                            action: () => {
                                                DataStore.setData("VELOCITY_SETTINGS", "Transparency", false);
                                                const warning = document.getElementById("velocity-settings-section-vibrancy-warning");
                                                warning.innerHTML = "Requires Restart.";
                                            },
                                        }),
                                        React.createElement(SettingsSection, {
                                            setting: "CSSEnabled",
                                            name: "Custom Css",
                                            note: "Enables Custom Css.",
                                        }),
                                        React.createElement(SettingsSection, {
                                            setting: "JSEnabled",
                                            name: "Startup Script",
                                            note: "Loads Startup Script.",
                                            warning: "You can easily add malicious scripts! Be careful!",
                                        }),
                                        React.createElement(SettingsSection, {
                                            setting: "ReloadOnLogin",
                                            name: "Reload On Login",
                                            note: "Fixes some issues with logins.",
                                        }),
                                        React.createElement(SettingsSection, {
                                            setting: "DegubberKey",
                                            name: "Debugger Hotkey",
                                            note: "Press f8 to freeze discord with DevTools open.",
                                            reload: true,
                                            action: () => {
                                                const warning = document.getElementById("velocity-settings-section-degubberkey-warning");
                                                warning.innerHTML = "Requires Restart.";
                                            },
                                        }),
                                        React.createElement(SettingsSection, {
                                            setting: "DevMode",
                                            name: "Debugging Mode",
                                            note: "Sends startup logs to the console.",
                                        }),
                                        React.createElement(SettingsInputSection, {
                                            setting: "FontSize",
                                            name: "Editor Font Size",
                                            note: "A value between 2-14 is best.",
                                            placeholder: "14",
                                            type: "number",
                                            vertical: true,
                                            maxLength: 2,
                                        }),
                                        React.createElement(Text, {
                                            color: Text.Colors.HEADER_SECONDARY,
                                            size: Text.Sizes.SIZE_12,
                                            style: { marginTop: "5px" },
                                            children: [
                                                "psst, need some help? Join our ",
                                                React.createElement(
                                                    "a",
                                                    {
                                                        onClick: () => {
                                                            VApi.joinOfficialServer();
                                                            VApi.showToast("Exit settings and have a look!", { title: "Joined Official Server", type: "success", timeout: 5000 });
                                                        },
                                                    },
                                                    "Official Server",
                                                ),
                                            ],
                                        }),
                                    ],
                                },
                                props,
                            ),
                        );
                    });
                });
            }
            prompt("Velocity Settings");
            let fontsize = DataStore.getData("VELOCITY_SETTINGS", "FontSize") || 14;
            if (fontsize > 14) {
                fontsize = 14;
                DataStore.setData("VELOCITY_SETTINGS", "FontSize", 14);
            }
            if (fontsize < 2) {
                fontsize = 2;
                DataStore.setData("VELOCITY_SETTINGS", "FontSize", 2);
            }
        })();
    });
}

const settings = DataStore("VELOCITY_SETTINGS");
if (process.platform === "darwin") {
    window.addEventListener("keydown", (e) =>
        (async  () => {
            const i = e.metaKey && e.code === "Comma";
            if (i) {
                add();
            }
        })(),
    );
}
else {
    window.addEventListener("keydown", (e) =>
        (async () => {
            const i = e.ctrlKey && e.code === "Comma";
            if (i) {
                add();
            }
        })(),
    );
}
settingsquery.addEventListener("click", async () => {
    add();
});
