const { React, modals, WebpackModules, showToast, Utilities, AddonManager, Components } = VApi;
const { shell } = require("electron");
const { internalPatches, InternalSecurityToken } = require("../stores");
const { info } = require("../../package.json");
const { SettingsSwitchSection, SettingsInputSection, SettingsTitle } = require("./SettingsSections");
const DataStore = require("../datastore");
const request = require("../request");
const updater = require("../updater");
const Card = require("./AddonCard");
const i18n = require("../i18n");
const path = require("path");

const { Strings, normalizeString } = i18n;

const Button = WebpackModules.find(["ButtonColors"]).default;
const ButtonColors = WebpackModules.find(["ButtonColors"]).ButtonColors;
const ButtonSizes = WebpackModules.find(["ButtonColors"]).ButtonSizes;
const Text = WebpackModules.find("LegacyText").default;
const Tooltip = WebpackModules.find.prototypes("renderTooltip").default;
const TextInput = WebpackModules.find("TextInput").default;
const CloseIcon = WebpackModules.find("CloseIconWithKeybind").default;
const ModalComponents = WebpackModules.find(["ModalRoot"]);
const Markdown = WebpackModules.find((m) => m.default?.displayName === "Markdown" && m.default.rules).default;

function addonSort(x, y) {
    if (x.name < y.name) {
        return -1;
    }
    if (x.name > y.name) {
        return 1;
    }
    return 0;
}

async function reloadPrompt() {
    const ConfirmationModal = WebpackModules.find("ConfirmModal").default;
    const { Messages } = WebpackModules.find((m) => m.default?.Messages?.OKAY).default;

    if (!Array.isArray(content)) content = [content];
    content = content.map((c) => (typeof c === "string" ? React.createElement(Markdown, null, c) : c));

    return new Promise((resolve) => {
        modals.open((props) => {
            if (props.transitionState === 3) resolve(false);
            return React.createElement(
                ConfirmationModal,
                Object.assign(
                    {
                        header: Strings.Modals.Restart.header,
                        confirmButtonColor: ButtonColors.BRAND,
                        confirmText: "Reload",
                        danger: true,
                        cancelText: Messages.CANCEL,
                        onConfirm: () => resolve(true),
                        onCancel: () => resolve(false),
                        children: Strings.Modals.Restart.content,
                    },
                    props
                )
            );
        });
    });
}

const monaco = global.windowObj.monaco;

const Settings = DataStore("VELOCITY_SETTINGS");
const headerClasses = "velocity-header-display";

async function settingsPrompt() {
    return new Promise((resolve) => {
        modals.open((props) =>
            React.createElement(
                ModalComponents.ModalRoot,
                Object.assign(props, {
                    size: "medium",
                    className: "velocity-modal",
                    children: [
                        React.createElement(
                            ModalComponents.ModalHeader,
                            null,
                            React.createElement(
                                Text,
                                {
                                    size: Text.Sizes.SIZE_20,
                                    color: Text.Colors.HEADER_PRIMARY,
                                    className: WebpackModules.find(["h1"]).h1,
                                },
                                Strings.Settings.Settings.title
                            )
                        ),
                        React.createElement(ModalComponents.ModalContent, {
                            children: [
                                React.createElement(SettingsTitle, {
                                    text: Strings.Settings.Settings.Sections.general.title,
                                    divider: true,
                                }),
                                React.createElement(SettingsSwitchSection, {
                                    setting: "CheckForUpdates",
                                    name: Strings.Settings.Settings.Sections.general.checkforupdates.name,
                                    note: Strings.Settings.Settings.Sections.general.checkforupdates.note,
                                }),
                                React.createElement(SettingsSwitchSection, {
                                    setting: "ReloadOnLogin",
                                    name: Strings.Settings.Settings.Sections.general.reloadonlogin.name,
                                    note: Strings.Settings.Settings.Sections.general.reloadonlogin.note,
                                }),
                                React.createElement(SettingsTitle, {
                                    text: Strings.Settings.Settings.Sections.window.title,
                                    divider: true,
                                }),
                                React.createElement(SettingsSwitchSection, {
                                    setting: "Transparency",
                                    name: Strings.Settings.Settings.Sections.window.transparency.name,
                                    note: Strings.Settings.Settings.Sections.window.transparency.note,
                                    reload: true,
                                    action: () => {
                                        DataStore.setData("VELOCITY_SETTINGS", "Vibrancy", false);
                                        const warning = document.getElementById("velocity-settings-section-transparency-warning");
                                        warning.innerHTML = Strings.Settings.requiresrestart;
                                    },
                                }),
                                React.createElement(SettingsSwitchSection, {
                                    setting: "Vibrancy",
                                    name: Strings.Settings.Settings.Sections.window.vibrancy.name,
                                    note: Strings.Settings.Settings.Sections.window.vibrancy.note,
                                    reload: true,
                                    action: () => {
                                        DataStore.setData("VELOCITY_SETTINGS", "Transparency", false);
                                        const warning = document.getElementById("velocity-settings-section-vibrancy-warning");
                                        warning.innerHTML = Strings.Settings.requiresrestart;
                                    },
                                }),
                                React.createElement(SettingsTitle, {
                                    text: Strings.Settings.Settings.Sections.tools.title,
                                    divider: true,
                                }),
                                React.createElement(SettingsSwitchSection, {
                                    setting: "CSSEnabled",
                                    name: Strings.Settings.Settings.Sections.tools.customcss.name,
                                    note: Strings.Settings.Settings.Sections.tools.customcss.note,
                                }),
                                React.createElement(SettingsSwitchSection, {
                                    setting: "JSEnabled",
                                    name: Strings.Settings.Settings.Sections.tools.startupscript.name,
                                    note: Strings.Settings.Settings.Sections.tools.startupscript.note,
                                    warning: Strings.Settings.Settings.Sections.tools.startupscript.warning,
                                }),
                                React.createElement(SettingsTitle, {
                                    text: Strings.Settings.Settings.Sections.developer.title,
                                    divider: true,
                                }),
                                React.createElement(SettingsSwitchSection, {
                                    setting: "DegubberKey",
                                    name: Strings.Settings.Settings.Sections.developer.debuggerkey.name,
                                    note: Strings.Settings.Settings.Sections.developer.debuggerkey.note,
                                    reload: true,
                                    action: () => {
                                        const warning = document.getElementById("velocity-settings-section-degubberkey-warning");
                                        warning.innerHTML = Strings.Settings.requiresrestart;
                                    },
                                }),
                                React.createElement(SettingsSwitchSection, {
                                    setting: "DevMode",
                                    name: Strings.Settings.Settings.Sections.developer.debugmode.name,
                                    note: Strings.Settings.Settings.Sections.developer.debugmode.note,
                                }),
                                React.createElement(SettingsSwitchSection, {
                                    setting: "CSSFeatures",
                                    name: Strings.Settings.Settings.Sections.developer.cssfeatures.name,
                                    note: Strings.Settings.Settings.Sections.developer.cssfeatures.note,
                                }),
                                React.createElement(SettingsInputSection, {
                                    setting: "FontSize",
                                    name: Strings.Settings.Settings.Sections.developer.fontsize.name,
                                    note: Strings.Settings.Settings.Sections.developer.fontsize.note,
                                    placeholder: "14",
                                    type: "number",
                                    vertical: true,
                                    maxLength: 2,
                                }),
                                React.createElement(SettingsSwitchSection, {
                                    setting: "DeveloperSettings",
                                    name: Strings.Settings.Settings.Sections.developer.developersettings.name,
                                    note: Strings.Settings.Settings.Sections.developer.developersettings.note,
                                }),
                            ],
                        }),
                        React.createElement(ModalComponents.ModalFooter, {
                            className: "velocity-modal-footer",
                            children: [
                                React.createElement(Text, {
                                    color: Text.Colors.HEADER_SECONDARY,
                                    size: Text.Sizes.SIZE_12,
                                    style: {
                                        marginTop: "5px",
                                    },
                                    children: [
                                        Strings.Settings.Settings.footer.text,
                                        React.createElement(
                                            "a",
                                            {
                                                onClick: () => {
                                                    Utilities.joinOfficialServer();
                                                    WebpackModules.find(["pushLayer"]).popLayer();
                                                    WebpackModules.find(["closeAllModals"]).closeAllModals();
                                                },
                                            },
                                            Strings.Settings.Settings.footer.link
                                        ),
                                    ],
                                }),
                                React.createElement(
                                    Button,
                                    {
                                        onClick: props.onClose,
                                        className: "velocity-button",
                                    },
                                    Strings.Settings.done
                                ),
                            ],
                        }),
                    ],
                })
            )
        );
    });
}

async function pluginPrompt() {
    const Plugins = AddonManager.plugins.getAll();

    return new Promise((resolve) => {
        modals.open((props) =>
            React.createElement(
                ModalComponents.ModalRoot,
                Object.assign(props, {
                    size: "medium",
                    className: "velocity-modal",
                    children: [
                        React.createElement(
                            ModalComponents.ModalHeader,
                            null,
                            React.createElement(
                                Text,
                                {
                                    size: Text.Sizes.SIZE_20,
                                    color: Text.Colors.HEADER_PRIMARY,
                                    className: WebpackModules.find(["h1"]).h1,
                                },
                                Strings.Settings.Plugins.title
                            )
                        ),
                        React.createElement(ModalComponents.ModalContent, {
                            children: [
                                React.createElement("div", { className: "velocity-modal-spacer" }),
                                React.createElement("div", {
                                    className: "velocity-addon-modal-body-header",
                                    children: [
                                        React.createElement("div", {
                                            className: "velocity-addon-modal-body-header-buttons",
                                            children: [
                                                React.createElement(
                                                    Button,
                                                    {
                                                        id: "plugins-folder",
                                                        color: ButtonColors.BRAND,
                                                        size: ButtonSizes.SMALL,
                                                        className: ["velocity-button"],
                                                        onClick: () => {
                                                            shell.openPath(AddonManager.plugins.folder);
                                                        },
                                                    },
                                                    Strings.Settings.Plugins.Buttons.openfolder
                                                ),
                                            ],
                                        }),
                                    ],
                                }),
                                React.createElement("div", {
                                    id: "velocity-addons-grid",
                                    children: [
                                        Plugins.sort(addonSort).map((plugin) =>
                                            React.createElement(Card, {
                                                meta: plugin,
                                                type: "plugins",
                                            })
                                        ),
                                    ],
                                }),
                            ],
                        }),
                        React.createElement(ModalComponents.ModalFooter, {
                            className: "velocity-modal-footer",
                            children: [
                                React.createElement(
                                    Button,
                                    {
                                        onClick: props.onClose,
                                        className: "velocity-button",
                                    },
                                    Strings.Settings.done
                                ),
                            ],
                        }),
                    ],
                })
            )
        );
    });
}

async function themePrompt() {
    const Themes = AddonManager.themes.getAll();

    return new Promise((resolve) => {
        modals.open((props) =>
            React.createElement(
                ModalComponents.ModalRoot,
                Object.assign(props, {
                    size: "medium",
                    className: "velocity-modal",
                    children: [
                        React.createElement(
                            ModalComponents.ModalHeader,
                            null,
                            React.createElement(
                                Text,
                                {
                                    size: Text.Sizes.SIZE_20,
                                    color: Text.Colors.HEADER_PRIMARY,
                                    className: WebpackModules.find(["h1"]).h1,
                                },
                                Strings.Settings.Themes.title
                            )
                        ),
                        React.createElement(ModalComponents.ModalContent, {
                            children: [
                                React.createElement("div", { className: "velocity-modal-spacer" }),
                                React.createElement("div", {
                                    className: "velocity-addon-modal-body-header",
                                    children: [
                                        React.createElement(TextInput, {
                                            placeholder: Strings.Settings.Themes.Buttons.remoteurlplaceholder,
                                            type: "text",
                                            onInput: ({ target }) => {
                                                this.remoteUrl = target.value;
                                            },
                                        }),
                                        React.createElement("div", {
                                            className: "velocity-addon-modal-body-header-buttons",
                                            children: [
                                                React.createElement(
                                                    Button,
                                                    {
                                                        id: "load-remote-theme",
                                                        color: ButtonColors.BRAND,
                                                        size: ButtonSizes.SMALL,
                                                        className: ["velocity-button"],
                                                        onClick: () => {
                                                            AddonManager.remote.loadTheme(this.remoteUrl);
                                                        },
                                                    },
                                                    Strings.Settings.Themes.Buttons.loadremote
                                                ),
                                                React.createElement(
                                                    Button,
                                                    {
                                                        id: "themes-folder",
                                                        color: ButtonColors.PRIMARY,
                                                        size: ButtonSizes.SMALL,
                                                        className: ["velocity-button"],
                                                        onClick: () => {
                                                            shell.openPath(AddonManager.themes.folder);
                                                        },
                                                    },
                                                    Strings.Settings.Themes.Buttons.openfolder
                                                ),
                                            ],
                                        }),
                                    ],
                                }),
                                React.createElement("div", {
                                    id: "velocity-addons-grid",
                                    children: [
                                        Themes.sort(addonSort).map((theme) =>
                                            React.createElement(Card, {
                                                meta: theme,
                                                type: "themes",
                                            })
                                        ),
                                    ],
                                }),
                            ],
                        }),
                        React.createElement(ModalComponents.ModalFooter, {
                            className: "velocity-modal-footer",
                            children: [
                                React.createElement(
                                    Button,
                                    {
                                        onClick: props.onClose,
                                        className: "velocity-button",
                                    },
                                    Strings.Settings.done
                                ),
                            ],
                        }),
                    ],
                })
            )
        );
    });
}

let fontsize = DataStore.getData("VELOCITY_SETTINGS", "FontSize") || 14;
if (fontsize > 14) {
    fontsize = 14;
    DataStore.setData("VELOCITY_SETTINGS", "FontSize", 14);
}
if (fontsize < 2) {
    fontsize = 2;
    DataStore.setData("VELOCITY_SETTINGS", "FontSize", 2);
}
async function jsPrompt() {
    return new Promise((resolve) => {
        modals.open((props) =>
            React.createElement(
                ModalComponents.ModalRoot,
                Object.assign(props, {
                    size: "medium",
                    className: "velocity-modal",
                    children: [
                        React.createElement(
                            ModalComponents.ModalHeader,
                            null,
                            React.createElement(
                                Text,
                                {
                                    size: Text.Sizes.SIZE_20,
                                    color: Text.Colors.HEADER_PRIMARY,
                                    className: WebpackModules.find(["h1"]).h1,
                                },
                                Strings.Settings.StartupScript.title
                            )
                        ),
                        React.createElement(ModalComponents.ModalContent, {
                            children: [
                                React.createElement("div", { className: "velocity-modal-spacer" }),
                                React.createElement(
                                    "h1",
                                    {
                                        class: headerClasses,
                                    },
                                    Strings.Settings.StartupScript.title
                                ),
                                React.createElement("div", {
                                    id: "editor",
                                }),
                                React.createElement(Tooltip, {
                                    text: Strings.Settings.StartupScript.Warning.tooltip,
                                    children: (props) =>
                                        React.createElement(WebpackModules.find("Clickable").default, {
                                            ...props,
                                            className: "warning-clickable",
                                            children: [
                                                React.createElement(
                                                    Text,
                                                    {
                                                        color: Text.Colors.ERROR,
                                                        size: Text.Sizes.SIZE_14,
                                                        id: `velocity-script-warning`,
                                                    },
                                                    ""
                                                ),
                                            ],
                                            onClick: () => {
                                                const coreDir = path.join(__dirname, "..");
                                                const settingsDir = path.join(coreDir, "..", "settings");
                                                shell.openPath(settingsDir);
                                            },
                                        }),
                                }),
                                (this.save = React.createElement("div", {
                                    class: "velocity-button-container",
                                    children: [
                                        React.createElement(
                                            Button,
                                            {
                                                id: "startup-script-save",
                                                disabled: false,
                                                className: [ButtonColors.BRAND, "velocity-button"],
                                                onClick: ({ target }) => {
                                                    const content = window.editor.getValue();
                                                    if (!target.disabled) {
                                                        DataStore.setData("VELOCITY_SETTINGS", "JS", content);
                                                        showToast("Startup Script", Strings.Toasts.StartupScript.saved, { type: "success" });
                                                    }
                                                },
                                            },
                                            Strings.Settings.StartupScript.Buttons.save
                                        ),
                                        React.createElement(
                                            Button,
                                            {
                                                id: "startup-script-clear",
                                                className: [ButtonColors.RED, "velocity-button"],
                                                onClick: () => {
                                                    window.editor.setValue("");
                                                    DataStore.setData("VELOCITY_SETTINGS", "JS", "");

                                                    showToast("Startup Script", Strings.Toasts.StartupScript.cleared, { type: "success" });
                                                },
                                            },
                                            Strings.Settings.StartupScript.Buttons.clear
                                        ),
                                    ],
                                })),
                                React.createElement("div", { className: "velocity-modal-spacer" }),
                            ],
                        }),
                        React.createElement(ModalComponents.ModalFooter, {
                            className: "velocity-modal-footer",
                            children: [
                                React.createElement(
                                    Button,
                                    {
                                        onClick: props.onClose,
                                        className: "velocity-button",
                                    },
                                    Strings.Settings.done
                                ),
                            ],
                        }),
                    ],
                })
            )
        );
    });
}

async function cssPrompt() {
    return new Promise((resolve) => {
        modals.open((props) =>
            React.createElement(
                ModalComponents.ModalRoot,
                Object.assign(props, {
                    size: "medium",
                    className: "velocity-modal",
                    children: [
                        React.createElement(
                            ModalComponents.ModalHeader,
                            null,
                            React.createElement(
                                Text,
                                {
                                    size: Text.Sizes.SIZE_20,
                                    color: Text.Colors.HEADER_PRIMARY,
                                    className: WebpackModules.find(["h1"]).h1,
                                },
                                Strings.Settings.CustomCSS.title
                            )
                        ),
                        React.createElement(ModalComponents.ModalContent, {
                            children: [
                                React.createElement("div", { className: "velocity-modal-spacer" }),
                                React.createElement(
                                    "h1",
                                    {
                                        class: headerClasses,
                                    },
                                    Strings.Settings.CustomCSS.title
                                ),
                                React.createElement("div", {
                                    id: "editor",
                                }),
                                React.createElement(Tooltip, {
                                    text: Strings.Settings.CustomCSS.Warning.tooltip,
                                    children: (props) =>
                                        React.createElement(WebpackModules.find("Clickable").default, {
                                            ...props,
                                            className: "warning-clickable",
                                            children: [
                                                React.createElement(
                                                    Text,
                                                    {
                                                        color: Text.Colors.ERROR,
                                                        size: Text.Sizes.SIZE_14,
                                                        id: `velocity-customcss-warning`,
                                                    },
                                                    ""
                                                ),
                                            ],
                                            onClick: () => {
                                                shell.openPath(AddonManager.themes.folder);
                                            },
                                        }),
                                }),
                                React.createElement("div", {
                                    class: "velocity-button-container",
                                    children: [
                                        React.createElement(
                                            Button,
                                            {
                                                id: "custom-css-save",
                                                className: [ButtonColors.BRAND, "velocity-button"],
                                                onClick: () => {
                                                    try {
                                                        const content = window.editor.getValue();
                                                        DataStore.setData("VELOCITY_SETTINGS", "CSS", content);
                                                        VApi.customCSS.reload();

                                                        showToast("Custom CSS", Strings.Toasts.CustomCSS.saved, { type: "success" });
                                                    } catch (error) {
                                                        console.error(error);
                                                    }
                                                },
                                            },
                                            Strings.Settings.CustomCSS.Buttons.save
                                        ),
                                        React.createElement(
                                            Button,
                                            {
                                                id: "custom-css-clear",
                                                className: [ButtonColors.RED, "velocity-button"],
                                                onClick: () => {
                                                    window.editor.setValue("");
                                                    DataStore.setData("VELOCITY_SETTINGS", "CSS", "");
                                                    VApi.customCSS.reload();

                                                    showToast("Custom CSS", Strings.Toasts.CustomCSS.cleard, { type: "success" });
                                                },
                                            },
                                            Strings.Settings.CustomCSS.Buttons.clear
                                        ),
                                    ],
                                }),
                                React.createElement("div", { className: "velocity-modal-spacer" }),
                            ],
                        }),
                        React.createElement(ModalComponents.ModalFooter, {
                            className: "velocity-modal-footer",
                            children: [
                                React.createElement(
                                    Button,
                                    {
                                        onClick: props.onClose,
                                        className: "velocity-button",
                                    },
                                    Strings.Settings.done
                                ),
                            ],
                        }),
                    ],
                })
            )
        );
    });
}

const UserSettings = WebpackModules.find("SettingsView").default;

VApi.Patcher(
    "VelocityInternal-Settings-Patch",
    UserSettings.prototype,
    "getPredicateSections",
    ([args], returnValue) => {
        let location = returnValue.findIndex((s) => s.section.toLowerCase() == "discord nitro") - 2;
        if (location < 0) return;
        const insert = (section) => {
            returnValue.splice(location, 0, section);
            location++;
        };

        insert({ section: "DIVIDER" });
        insert({ section: "HEADER", label: "Velocity" });
        insert({
            section: normalizeString(Strings.Titles.updater),
            label: Strings.Titles.updater,
            className: `velocity-updater-tab ${process.env.willDowngrade || process.env.willUpgrade ? "notification" : ""}`,
            onClick: () => {
                updater.checkForUpdates();
            },
        });
        insert({
            section: normalizeString(Strings.Titles.settings),
            label: Strings.Titles.settings,
            className: `velocity-settings-tab`,
            onClick: () => {
                settingsPrompt();
            },
        });

        if (Settings.CSSEnabled) {
            insert({
                section: normalizeString(Strings.Titles.customcss),
                label: Strings.Titles.customcss,
                className: `velocity-customcss-tab`,
                onClick: () => {
                    const customCSS = DataStore.getData("VELOCITY_SETTINGS", "CSS");
                    cssPrompt();
                    setTimeout(() => {
                        window.editor = monaco.editor.create(document.getElementById("editor"), {
                            language: "css",
                            theme: document.documentElement.classList.contains("theme-dark") ? "vs-dark" : "vs-light",
                            value: customCSS,
                            fontSize: fontsize,
                        });
                        window.editor.onDidChangeModelContent(() => {
                            const content = window.editor.getValue();

                            if (content.includes("/**" && "@name")) {
                                const warn = document.getElementById("velocity-customcss-warning");
                                warn.innerHTML = Strings.Settings.CustomCSS.Warning.text;
                            } else {
                                const warn = document.getElementById("velocity-customcss-warning");
                                warn.innerHTML = "";
                            }
                        });
                    }, 50);
                },
            });
        }
        if (Settings.JSEnabled) {
            insert({
                section: normalizeString(Strings.Titles.startupscript),
                label: Strings.Titles.startupscript,
                className: `velocity-startupscript-tab`,
                onClick: () => {
                    const startupJS = DataStore.getData("VELOCITY_SETTINGS", "JS");
                    jsPrompt();
                    setTimeout(() => {
                        window.editor = monaco.editor.create(document.getElementById("editor"), {
                            language: "javascript",
                            theme: document.documentElement.classList.contains("theme-dark") ? "vs-dark" : "vs-light",
                            value: startupJS,
                            fontSize: fontsize,
                        });
                        window.editor.onDidChangeModelContent(() => {
                            const content = window.editor.getValue();
                            const button = document.getElementById("startup-script-save");
                            if (content.includes("getToken" || "getEmail")) {
                                const warn = document.querySelector("#velocity-script-warning");
                                warn.innerHTML = Strings.Settings.StartupScript.Warning.text;
                                if (button) {
                                    button.disabled = true;
                                    button.classList.add("disabled");
                                }
                            } else {
                                const warn = document.querySelector("#velocity-script-warning");
                                warn.innerHTML = "";
                                if (button) {
                                    button.disabled = false;
                                    button.classList.remove("disabled");
                                }
                            }
                        });
                    }, 50);
                },
            });
        }
        insert({
            section: normalizeString(Strings.Titles.plugins),
            label: Strings.Titles.plugins,
            className: `velocity-plugins-tab`,
            onClick: () => {
                pluginPrompt();
            },
        });
        insert({
            section: normalizeString(Strings.Titles.themes),
            label: Strings.Titles.themes,
            className: `velocity-themes-tab`,
            onClick: () => {
                themePrompt();
            },
        });
        if (Settings.DeveloperSettings) {
            insert({
                section: normalizeString(Strings.Titles.developer),
                label: Strings.Titles.developer,
                className: `velocity-developer-tab`,
                onClick: () => {
                    try {
                        WebpackModules.find(["pushLayer"]).pushLayer(() => [
                            React.createElement("div", {
                                className: "velocity-close-conteainer",
                                style: { top: "60px", right: "60px", position: "absolute" },
                                children: [
                                    React.createElement(CloseIcon, {
                                        closeAction: () => {
                                            WebpackModules.find(["popLayer"]).popLayer();
                                        },
                                        keybind: "ESC",
                                    }),
                                ],
                            }),
                            React.createElement("div", {
                                className: "velocity-developer-container",
                                children: [
                                    React.createElement(
                                        Text,
                                        {
                                            size: Text.Sizes.SIZE_14,
                                            className: `velocity-developer-header ${WebpackModules.find(["h1"]).h1}`,
                                        },
                                        Strings.Settings.Developer.Sections.internalpatches.title
                                    ),
                                    React.createElement("div", {
                                        className: "velocity-developer-items-container",
                                        children: [
                                            internalPatches.map((patch) =>
                                                React.createElement("div", {
                                                    className: "velocity-developer-internal-patch",
                                                    children: [
                                                        React.createElement(TextInput, {
                                                            value: patch.name,
                                                            disabled: true,
                                                        }),
                                                        React.createElement("div", {
                                                            className: "velocity-developer-internal-patch-info",
                                                            children: [
                                                                patch.warning &&
                                                                    React.createElement(
                                                                        "div",
                                                                        {
                                                                            className: "velocity-developer-internal-warning",
                                                                        },
                                                                        Strings.Settings.Developer.Sections.internalpatches.warning
                                                                    ),
                                                                patch.beta &&
                                                                    React.createElement(
                                                                        "div",
                                                                        {
                                                                            className: "velocity-developer-internal-beta-tag",
                                                                        },
                                                                        "BETA"
                                                                    ),
                                                                React.createElement(
                                                                    Button,
                                                                    {
                                                                        size: ButtonSizes.SMALL,
                                                                        color: ButtonColors.RED,
                                                                        onClick: (target) => {
                                                                            target.target.tagName == "BUTTON"
                                                                                ? target.target.setAttribute("disabled", "true")
                                                                                : target.target.parentElement.setAttribute("disabled", "true");
                                                                            VApi.Patcher.unpatchAll(patch.name, InternalSecurityToken);
                                                                            showToast("Velocity", `${Strings.Toasts.Developer.killed} <strong>${patch.name}</strong>`, {
                                                                                type: "error",
                                                                            });
                                                                        },
                                                                    },
                                                                    "Kill"
                                                                ),
                                                            ],
                                                        }),
                                                    ],
                                                })
                                            ),
                                        ],
                                    }),
                                    React.createElement(
                                        Text,
                                        {
                                            size: Text.Sizes.SIZE_14,
                                            className: `velocity-developer-header ${WebpackModules.find(["h1"]).h1}`,
                                        },
                                        Strings.Settings.Developer.Sections.backendstatus.title
                                    ),
                                    React.createElement("div", {
                                        className: "velocity-developer-status-buttons-container",
                                        children: [
                                            React.createElement(
                                                Button,
                                                {
                                                    color: ButtonColors.BRAND,
                                                    onClick: async (target) => {
                                                        request("https://raw.githubusercontent.com/Velocity-Discord/Backend/main/api/Badges.json", (_, res, body) => {
                                                            if (res.statusCode.between(200, 299)) {
                                                                const statusBadgeElement = document.querySelector(".velocity-developer-status-badges-text");
                                                                statusBadgeElement.innerHTML = `${Strings.Settings.Developer.Sections.backendstatus.status.status} - ${Strings.Settings.Developer.Sections.backendstatus.status.fine} (${res.statusCode})`;
                                                                statusBadgeElement.style.color = "var(--text-positive)";
                                                            } else {
                                                                const statusUpdateElement = document.querySelector(".velocity-developer-status-badges-text");
                                                                statusBadgeElement.innerHTML = `${Strings.Settings.Developer.Sections.backendstatus.status.status} - ${Strings.Settings.Developer.Sections.backendstatus.status.unknown} (${res.statusCode})`;
                                                                statusUpdateElement.style.color = "var(--text-danger)";
                                                            }
                                                        });

                                                        request("https://raw.githubusercontent.com/Velocity-Discord/Backend/main/api/Updates.json", (_, res, body) => {
                                                            if (res.statusCode.between(200, 299)) {
                                                                const statusBadgeElement = document.querySelector(".velocity-developer-status-badges-text");
                                                                statusBadgeElement.innerHTML = `${Strings.Settings.Developer.Sections.backendstatus.status.status} - ${Strings.Settings.Developer.Sections.backendstatus.status.fine} (${res.statusCode})`;
                                                                statusBadgeElement.style.color = "var(--text-positive)";
                                                            } else {
                                                                const statusUpdateElement = document.querySelector(".velocity-developer-status-badges-text");
                                                                statusBadgeElement.innerHTML = `${Strings.Settings.Developer.Sections.backendstatus.status.status} - ${Strings.Settings.Developer.Sections.backendstatus.status.unknown} (${res.statusCode})`;
                                                                statusUpdateElement.style.color = "var(--text-danger)";
                                                            }
                                                        });
                                                    },
                                                },
                                                Strings.Settings.Developer.Sections.backendstatus.rerequest
                                            ),
                                            React.createElement(
                                                Button,
                                                {
                                                    color: ButtonColors.RED,
                                                    onClick: () => {
                                                        const statusBadgeElement = document.querySelector(".velocity-developer-status-badges-text");
                                                        const statusUpdateElement = document.querySelector(".velocity-developer-status-update-text");
                                                        statusUpdateElement.innerHTML = Strings.Settings.Developer.Sections.backendstatus.status.status;
                                                        statusBadgeElement.innerHTML = Strings.Settings.Developer.Sections.backendstatus.status.status;
                                                        statusUpdateElement.style.color = null;
                                                        statusBadgeElement.style.color = null;
                                                    },
                                                },
                                                Strings.Settings.Developer.Sections.backendstatus.clearcache
                                            ),
                                        ],
                                    }),
                                    React.createElement(
                                        Text,
                                        {
                                            size: Text.Sizes.SIZE_16,
                                            className: "velocity-developer-status-header",
                                        },
                                        Strings.Settings.Developer.Sections.backendstatus.urls.badges
                                    ),
                                    React.createElement(
                                        Text,
                                        {
                                            size: Text.Sizes.SIZE_14,
                                            color: Text.Colors.MUTED,
                                            className: "velocity-developer-status-badges-text",
                                        },
                                        Strings.Settings.Developer.Sections.backendstatus.status.status
                                    ),
                                    React.createElement(
                                        Text,
                                        {
                                            size: Text.Sizes.SIZE_16,
                                            className: "velocity-developer-status-header",
                                        },
                                        Strings.Settings.Developer.Sections.backendstatus.urls.updates
                                    ),
                                    React.createElement(
                                        Text,
                                        {
                                            size: Text.Sizes.SIZE_14,
                                            color: Text.Colors.MUTED,
                                            className: "velocity-developer-status-update-text",
                                        },
                                        Strings.Settings.Developer.Sections.backendstatus.status.status
                                    ),
                                    React.createElement(WebpackModules.find(["EmptyStateImage"]).EmptyStateImage, {
                                        height: 200,
                                        width: 415,
                                        darkSrc: "/assets/c115d59ca13c0f942965a82a0f05bf01.svg",
                                        lightSrc: "/assets/ad530d02033b87bb89752f915c2fbe3c.svg",
                                        style: { flex: "none", marginInline: "auto" },
                                    }),
                                ],
                            }),
                        ]);
                    } catch (error) {
                        console.error(error);
                    }
                },
            });
        }

        AddonManager.plugins.getAll().forEach((plugin) => {
            if (plugin.hasSettings) {
                insert({
                    section: normalizeString(plugin.name),
                    label: plugin.name,
                    className: `velocity-plugin-${normalizeString(plugin.name)}-tab`,
                    onClick: () => {
                        if (typeof plugin.export.Plugin == "function") {
                            let settingsItems = [];
                            if (Array.isArray(plugin.export.Plugin().getSettingsPanel())) {
                                plugin.export
                                    .Plugin()
                                    .getSettingsPanel()
                                    .forEach((item) => {
                                        switch (item.type) {
                                            case "switch":
                                                return settingsItems.push(
                                                    React.createElement(Components.SettingsSection, {
                                                        plugin: item.plugin,
                                                        setting: item.setting,
                                                        name: item.name,
                                                        note: item.note,
                                                    })
                                                );
                                        }
                                    });
                            } else {
                                settingsItems = plugin.export.Plugin().getSettingsPanel();
                            }
                            Components.ShowAddonSettingsModal({
                                name: plugin.name,
                                children: settingsItems,
                            });
                        } else {
                            let settingsItems = [];
                            if (Array.isArray(plugin.export.Plugin.getSettingsPanel())) {
                                plugin.export.Plugin.getSettingsPanel().forEach((item) => {
                                    settingsItems.push(
                                        React.createElement(Components.SettingsSection, {
                                            plugin: item.plugin,
                                            setting: item.setting,
                                            name: item.name,
                                            note: item.note,
                                        })
                                    );
                                });
                            } else {
                                settingsItems = plugin.export.Plugin.getSettingsPanel();
                            }
                            Components.ShowAddonSettingsModal({
                                name: plugin.name,
                                children: settingsItems,
                            });
                        }
                    },
                });
            }
        });

        let changeLocation = returnValue.findIndex((s) => s.section.toLowerCase() == "changelog") + 1;
        if (changeLocation < 0) return;
        const insertChange = (section) => {
            returnValue.splice(changeLocation, 0, section);
            changeLocation++;
        };

        insertChange({
            section: normalizeString(Strings.Titles.velocitychangelog).replace(normalizeString(Strings.Titles.changelog), "-" + normalizeString(Strings.Titles.changelog)),
            label: Strings.Titles.velocitychangelog,
            className: `velocity-changelog-tab`,
            onClick: () => {
                updater.changelogModal();
            },
        });
    },
    { warning: true }
);

const TabBar = WebpackModules.find("TabBar").default;

VApi.Patcher("VelocityInternal-SettingsInfo-Patch", TabBar.prototype, "render", ([args], returnValue) => {
    let children = returnValue.props.children;
    if (!children || !children.length || children.length < 3) return;
    if (children[children.length - 3].type.displayName !== "Separator") return;
    if (!children[children.length - 2].type.toString().includes("socialLinks")) return;
    let infoClasses = WebpackModules.find(["versionHash"]);

    const infoEle = React.createElement("span", {
        className: `${Text.Colors.MUTED} ${Text.Sizes.SIZE_12} ${infoClasses.line}`,
        children: [
            `velocity ${info.version} `,
            React.createElement(
                "span",
                {
                    className: infoClasses.versionHash,
                },
                `(${info.hash})`
            ),
        ],
    });

    const originalVersions = children[children.length - 1].type;
    children[children.length - 1].type = function () {
        const returnVal = originalVersions(...arguments);
        returnVal.props.children.splice(1, 0, infoEle);
        return returnVal;
    };
});
