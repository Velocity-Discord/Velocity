const DataStore = require("../datastore");
const { ipcRenderer, shell } = require("electron");
const settingsquery = document.querySelector(".panels-3wFtMD > .container-YkUktl .flex-2S1XBF > :last-child");
const button = VApi.getModule.find(["ButtonColors"]).default;
const Text = VApi.getModule.find("Text").default;
const ButtonColors = VApi.getModule.find(["ButtonColors"]).ButtonColors;
const ButtonSizes = VApi.getModule.find(["ButtonColors"]).ButtonSizes;
const SwitchEle = VApi.getModule.find("Switch").default;
const Tooltip = VApi.getModule.find.prototypes("renderTooltip").default;
const { React, logger } = VApi;
const Markdown = VApi.getModule.find((m) => m.default?.displayName === "Markdown" && m.default.rules).default;
const Switche = VApi.getModule.find("Switch").default;
const TextInput = VApi.getModule.find("TextInput").default;
const path = require("path");
const closeIcon = VApi.getModule.find("CloseIconWithKeybind").default;
const { info } = require("../../package.json");
const updater = require("../updater");

async function pushLayer(element) {
    VApi.getModule.find(["pushLayer"]).pushLayer(() => element);
}

async function reloadPrompt(title, content) {
    const { React, getModule, modals } = VApi;
    const ConfirmationModal = getModule.find("ConfirmModal").default;
    const Button = getModule.find(["ButtonColors"]);
    const { Messages } = getModule.find((m) => m.default?.Messages?.OKAY).default;
    const Markdown = getModule.find((m) => m.default?.displayName === "Markdown" && m.default.rules).default;

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

const monaco = global.windowfunc.monaco;

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
                        React.createElement(
                            Text,
                            {
                                color: Text.Colors.HEADER_PRIMARY,
                                size: Text.Sizes.SIZE_16,
                            },
                            name,
                        ),
                        React.createElement(
                            Text,
                            {
                                color: Text.Colors.HEADER_SECONDARY,
                                size: Text.Sizes.SIZE_14,
                            },
                            note,
                        ),
                        React.createElement(
                            Text,
                            {
                                color: Text.Colors.ERROR,
                                size: Text.Sizes.SIZE_14,
                            },
                            warning,
                        ),
                    ],
                }),
                React.createElement(TextInput, {
                    value: value,
                    placeholder: placeholder,
                    type: type,
                    maxLength: maxLength,
                    onInput: ({ target }) => {
                        setValue(target.value);
                        DataStore.setData("VELOCITY_SETTINGS", setting, target.value);
                    },
                }),
            ],
        });
    } else {
        return React.createElement("div", {
            id: "velocity-settings-section",
            children: [
                React.createElement("div", {
                    id: "velocity-settings-section-info",
                    children: [
                        React.createElement(
                            Text,
                            {
                                color: Text.Colors.HEADER_PRIMARY,
                                size: Text.Sizes.SIZE_16,
                            },
                            name,
                        ),
                        React.createElement(
                            Text,
                            {
                                color: Text.Colors.HEADER_SECONDARY,
                                size: Text.Sizes.SIZE_14,
                            },
                            note,
                        ),
                        React.createElement(
                            Text,
                            {
                                color: Text.Colors.ERROR,
                                size: Text.Sizes.SIZE_14,
                            },
                            warning,
                        ),
                    ],
                }),
                React.createElement(TextInput, {
                    value: value,
                    placeholder: placeholder,
                    type: type,
                    maxLength: maxLength,
                    onInput: ({ target }) => {
                        setValue(target.value);
                        DataStore.setData("VELOCITY_SETTINGS", setting, target.value);
                    },
                }),
            ],
        });
    }
});

const SettingsTitle = React.memo((props) => {
    const { text, divider = false } = props;
    if (divider) {
        return [
            React.createElement("div", {
                className: "velocity-settings-title-container",
                children: [
                    React.createElement(
                        "div",
                        {
                            className: "velocity-settings-title",
                        },
                        text,
                    ),
                    React.createElement("div", {
                        className: "velocity-settings-title-divider",
                    }),
                ],
            }),
        ];
    } else {
        return [
            React.createElement(
                "div",
                {
                    className: "velocity-settings-title",
                },
                text,
            ),
        ];
    }
});

const SettingsSection = React.memo((props) => {
    const { setting, note, name, warning, action, reload = false } = props;

    const [enabled, setEnabled] = React.useState(DataStore.getData("VELOCITY_SETTINGS", setting));
    return React.createElement("div", {
        id: "velocity-settings-section",
        children: [
            React.createElement("div", {
                id: "velocity-settings-section-info",
                children: [
                    React.createElement(
                        Text,
                        {
                            color: Text.Colors.HEADER_PRIMARY,
                            size: Text.Sizes.SIZE_16,
                        },
                        name,
                    ),
                    React.createElement(
                        Text,
                        {
                            color: Text.Colors.HEADER_SECONDARY,
                            size: Text.Sizes.SIZE_14,
                        },
                        note,
                    ),
                    React.createElement(
                        Text,
                        {
                            color: Text.Colors.ERROR,
                            size: Text.Sizes.SIZE_14,
                            id: `velocity-settings-section-${setting.toLowerCase()}-warning`,
                        },
                        warning,
                    ),
                ],
            }),
            React.createElement(Switche, {
                checked: enabled,
                onChange: async () => {
                    if (action) {
                        action();
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
});

const Card = React.memo((props) => {
    const { meta, type } = props;

    const [enabled, setEnabled] = React.useState(VApi.AddonManager[type].isEnabled(meta.name));
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
                                        VApi.AddonManager[type].toggle(meta.name);
                                        setEnabled(!enabled);
                                        if (!enabled) {
                                            VApi.showToast(`Enabled <strong>${meta.name}</strong>`, { type: "success" });
                                        } else {
                                            VApi.showToast(`Disabled <strong>${meta.name}</strong>`, { type: "success" });
                                        }
                                    } catch (e) {
                                        if (!enabled) {
                                            VApi.showToast(`Failed to start <strong>${meta.name}</strong>`, { type: "error" });
                                        } else {
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

const settings = DataStore("VELOCITY_SETTINGS");
const Settings = DataStore("VELOCITY_SETTINGS");
const headerClasses = "velocity-header-display";

async function settingsPrompt(title) {
    const { getModule, modals } = VApi;
    const ConfirmationModal = getModule.find("ConfirmModal").default;
    const Button = getModule.find(["ButtonColors"]);
    const { Messages } = getModule.find((m) => m.default?.Messages?.OKAY).default;
    const TextInput = VApi.getModule.find("TextInput").default;
    const Switch = VApi.getModule.find("Switch").default;

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
                        onConfirm: () => resolve(true),
                        onCancel: () => resolve(false),
                        children: [
                            React.createElement(SettingsTitle, { text: "General", divider: true }),
                            React.createElement(SettingsSection, {
                                setting: "CheckForUpdates",
                                name: "Check For Updates",
                                note: "Checks for updates on start.",
                            }),
                            React.createElement(SettingsSection, {
                                setting: "ReloadOnLogin",
                                name: "Reload On Login",
                                note: "Fixes some issues with logins.",
                            }),
                            React.createElement(SettingsTitle, { text: "Window", divider: true }),
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
                            React.createElement(SettingsTitle, { text: "Tools", divider: true }),
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
                            React.createElement(SettingsTitle, { text: "Developer", divider: true }),
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
                                                VApi.Utilities.joinOfficialServer();
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

async function pluginPrompt(title) {
    const Plugins = VApi.AddonManager.plugins.getAll();
    const { getModule, modals } = VApi;
    const ConfirmationModal = getModule.find("ConfirmModal").default;
    const Button = getModule.find(["ButtonColors"]);
    const { Messages } = getModule.find((m) => m.default?.Messages?.OKAY).default;
    const TextInput = VApi.getModule.find("TextInput").default;

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
                                        shell.openPath(VApi.AddonManager.plugins.folder);
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

async function themePrompt(title) {
    const Themes = VApi.AddonManager.themes.getAll();
    const { getModule, modals } = VApi;
    const ConfirmationModal = getModule.find("ConfirmModal").default;
    const Button = getModule.find(["ButtonColors"]);
    const { Messages } = getModule.find((m) => m.default?.Messages?.OKAY).default;
    const TextInput = VApi.getModule.find("TextInput").default;

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
                                        shell.openPath(VApi.AddonManager.themes.folder);
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
async function jsPrompt(title) {
    const { getModule, modals } = VApi;
    const ConfirmationModal = getModule.find("ConfirmModal").default;
    const Button = getModule.find(["ButtonColors"]);
    const { Messages } = getModule.find((m) => m.default?.Messages?.OKAY).default;
    const TextInput = VApi.getModule.find("TextInput").default;

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
                                    React.createElement(VApi.getModule.find("Clickable").default, {
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
                                                "",
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
                                        button,
                                        {
                                            id: "startup-script-save",
                                            disabled: false,
                                            className: [ButtonColors.BRAND, "velocity-button"],
                                            onClick: ({ target }) => {
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

const customCSS = DataStore.getData("VELOCITY_SETTINGS", "CSS");
async function cssPrompt(title) {
    const { getModule, modals } = VApi;
    const ConfirmationModal = getModule.find("ConfirmModal").default;
    const Button = getModule.find(["ButtonColors"]);
    const { Messages } = getModule.find((m) => m.default?.Messages?.OKAY).default;
    const TextInput = VApi.getModule.find("TextInput").default;

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
                                    React.createElement(VApi.getModule.find("Clickable").default, {
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
                                                "",
                                            ),
                                        ],
                                        onClick: () => {
                                            shell.openPath(VApi.AddonManager.themes.folder);
                                        },
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

const UserSettings = VApi.getModule.find("SettingsView").default;

VApi.Patcher("VelocityInternal-Settings-Patch", UserSettings.prototype, "getPredicateSections", ([args], returnValue) => {
    let location = returnValue.findIndex((s) => s.section.toLowerCase() == "connections") + 1;
    if (location < 0) return;
    const insert = (section) => {
        returnValue.splice(location, 0, section);
        location++;
    };

    insert({ section: "DIVIDER" });
    // Header
    insert({ section: "HEADER", label: "Velocity" });
    insert({
        section: "updates",
        label: "Check for Updates",
        className: `velocity-updates-tab`,
        onClick: () => {
            updater.checkForUpdates();
        },
    });
    insert({
        section: "settings",
        label: "Settings",
        className: `velocity-settings-tab`,
        onClick: () => {
            settingsPrompt("Velocity Settings");
        },
    });

    if (Settings.CSSEnabled) {
        insert({
            section: "customcss",
            label: "Custom CSS",
            className: `velocity-customcss-tab`,
            onClick: () => {
                cssPrompt("Custom CSS");
                setTimeout(() => {
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
                    });
                }, 50);
            },
        });
    }
    if (Settings.JSEnabled) {
        insert({
            section: "ssscript",
            label: "Startup Script",
            className: `velocity-ssscript-tab`,
            onClick: () => {
                jsPrompt("Startup Script");
                setTimeout(() => {
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
                }, 50);
            },
        });
    }
    insert({
        section: "plugins",
        label: "Plugins",
        className: `velocity-plugins-tab`,
        onClick: () => {
            pluginPrompt("Plugins");
        },
    });
    insert({
        section: "themes",
        label: "Themes",
        className: `velocity-themes-tab`,
        onClick: () => {
            themePrompt("Themes");
        },
    });
});
