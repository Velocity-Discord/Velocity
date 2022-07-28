/**
 * @type {Api}
 */
const VApi = window.VApi;

const { React, modals, WebpackModules, showToast, Utilities, AddonManager } = VApi;
const { shell } = require("electron");
const { info } = require("../../../../package.json");
const { SettingsSwitchSection, SettingsInputSection, SettingsCollection } = require("./components/SettingsSections");
const DataStore = require("../datastore");
const request = require("../request");
const updater = require("../updater");
const Neptune = require("../neptune");
const AddonPage = require("./components/AddonPage");
const StatusTable = require("./components/StatusTable");
const UpdaterDisplay = require("./components/Updater");
const Editor = require("./components/Editor");
const Components = require("../components");
const i18n = require("../i18n");
const path = require("path");
const fs = require("fs");

const Config = require("../../common/config.json");
const { ErrorBoundary } = require("../components");

const { Strings, normalizeString } = i18n;

const Button = WebpackModules.find(["ButtonColors"]).default;
const ButtonColors = WebpackModules.find(["ButtonColors"]).ButtonColors;
const ButtonSizes = WebpackModules.find(["ButtonColors"]).ButtonSizes;
const Text = WebpackModules.find("LegacyText").default;
const Tooltip = WebpackModules.find.prototypes("renderTooltip").default;
const TextInput = WebpackModules.find("TextInput").default;
const FormTitle = WebpackModules.find("FormTitle").default;
const TabBar = WebpackModules.find("TabBar").default;

function addonSort(x, y) {
    if (x.name < y.name) {
        return -1;
    }
    if (x.name > y.name) {
        return 1;
    }
    return 0;
}

const monaco = global.windowObj.monaco;

monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: false,
});

monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES6,
    allowNonTsExtensions: true,
});

monaco.languages.css.cssDefaults.setDiagnosticsOptions({ lint: { universalSelector: "warn" } });

const VApiTypings = fs.readFileSync(path.join(__dirname, "../../", "common", "typings", "monaco.d.ts"), "utf8");

const libSource = [VApiTypings].join("\n");

const libUri = "ts:filename/monaco.d.ts";
monaco.languages.typescript.javascriptDefaults.addExtraLib(libSource, libUri);

monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES6,
    allowNonTsExtensions: true,
});

const Settings = DataStore("VELOCITY_SETTINGS");
const headerClasses = "velocity-header-display";

let fontsize = DataStore.getData("VELOCITY_SETTINGS", "FontSize") || 14;
if (fontsize > 14) {
    fontsize = 14;
    DataStore.setData("VELOCITY_SETTINGS", "FontSize", 14);
}
if (fontsize < 2) {
    fontsize = 2;
    DataStore.setData("VELOCITY_SETTINGS", "FontSize", 2);
}

const UserSettings = WebpackModules.find("SettingsView").default;

// class MonacoEditor extends React.Component {
//     constructor(props) {
//         super(props);

//         this.props = props;
//     }
//     componentDidMount() {
//         this.props.onLoad?.();
//     }
//     render() {
//         return React.createElement("div", {
//             id: "editor",
//         });
//     }
// }

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
            element: () => [React.createElement(FormTitle, { tag: "h1" }, Strings.Settings.Updater.title), React.createElement(UpdaterDisplay)],
        });
        insert({
            section: normalizeString(Strings.Titles.settings),
            label: Strings.Titles.settings,
            className: `velocity-settings-tab`,
            element: () => [
                React.createElement(FormTitle, { tag: "h1" }, Strings.Settings.Settings.title),
                React.createElement(SettingsCollection, {
                    title: Strings.Settings.Settings.Sections.general.title,
                    children: [
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
                    ],
                }),

                React.createElement(SettingsCollection, {
                    title: Strings.Settings.Settings.Sections.window.title,
                    children: [
                        React.createElement(SettingsSwitchSection, {
                            setting: "Transparency",
                            name: Strings.Settings.Settings.Sections.window.transparency.name,
                            note: Strings.Settings.Settings.Sections.window.transparency.note,
                            reload: true,
                        }),
                        React.createElement(SettingsSwitchSection, {
                            setting: "Vibrancy",
                            name: Strings.Settings.Settings.Sections.window.vibrancy.name,
                            note: Strings.Settings.Settings.Sections.window.vibrancy.note,
                            reload: true,
                        }),
                    ],
                }),

                React.createElement(SettingsCollection, {
                    title: Strings.Settings.Settings.Sections.tools.title,
                    children: [
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
                    ],
                }),

                React.createElement(SettingsCollection, {
                    title: Strings.Settings.Settings.Sections.developer.title,
                    children: [
                        React.createElement(SettingsSwitchSection, {
                            setting: "DebuggerKey",
                            name: Strings.Settings.Settings.Sections.developer.debuggerkey.name,
                            note: Strings.Settings.Settings.Sections.developer.deb,
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

                React.createElement(SettingsCollection, {
                    title: Strings.Settings.Settings.Sections.advanced.title,
                    children: [
                        React.createElement(SettingsSwitchSection, {
                            setting: "ValidityChecks",
                            name: Strings.Settings.Settings.Sections.advanced.validitychecks.name,
                            note: Strings.Settings.Settings.Sections.advanced.validitychecks.note,
                            warning: Strings.Settings.Settings.Sections.advanced.validitychecks.warning,
                        }),
                    ],
                }),

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
            ],
        });

        if (Settings.CSSEnabled) {
            insert({
                section: normalizeString(Strings.Titles.customcss),
                label: Strings.Titles.customcss,

                className: `velocity-customcss-tab`,
                element: () => [React.createElement(FormTitle, { tag: "h1" }, Strings.Settings.CustomCSS.title), React.createElement(Editor, { type: "customcss" })],
            });
        }
        if (Settings.JSEnabled) {
            insert({
                section: normalizeString(Strings.Titles.startupscript),
                label: Strings.Titles.startupscript,
                className: `velocity-startupscript-tab`,
                element: () => [React.createElement(FormTitle, { tag: "h1" }, Strings.Settings.StartupScript.title), React.createElement(Editor, { type: "startupjs" })],
            });
        }
        insert({
            section: normalizeString(Strings.Titles.plugins),
            label: Strings.Titles.plugins,
            className: `velocity-plugins-tab`,
            element: () => [
                React.createElement(AddonPage, {
                    type: "plugins",
                }),
            ],
        });
        insert({
            section: normalizeString(Strings.Titles.themes),
            label: Strings.Titles.themes,
            className: `velocity-themes-tab`,
            element: () => [
                React.createElement(AddonPage, {
                    type: "themes",
                }),
            ],
        });
        if (Settings.DeveloperSettings) {
            insert({
                section: normalizeString(Strings.Titles.developer),
                label: Strings.Titles.developer,
                className: `velocity-developer-tab`,
                element: () => [
                    React.createElement(FormTitle, { tag: "h1" }, Strings.Settings.Developer.title),
                    React.createElement("div", {
                        className: "velocity-developer-container",
                        children: [
                            React.createElement(
                                Text,
                                {
                                    size: Text.Sizes.SIZE_14,
                                    className: `velocity-developer-header ${WebpackModules.find(["h1"]).h3}`,
                                },
                                Strings.Settings.Developer.Sections.internalpatches.title
                            ),
                            React.createElement("div", {
                                className: "velocity-developer-items-container",
                                children: [
                                    Neptune.InternalPatches.map((patch) =>
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
                                                            React.createElement(Tooltip, {
                                                                text: Strings.Settings.Developer.Sections.internalpatches.tooltip,
                                                                children: (props) =>
                                                                    React.createElement(
                                                                        "div",
                                                                        {
                                                                            ...props,
                                                                            className: "velocity-developer-internal-warning",
                                                                        },
                                                                        Strings.Settings.Developer.Sections.internalpatches.warning
                                                                    ),
                                                            }),
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
                                                                    VApi.Patcher.unpatchAll(patch.name, Neptune.InternalSecurityToken);
                                                                    showToast("Velocity", `${Strings.Toasts.Developer.killed} ${patch.name}`, {
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
                                    className: `velocity-developer-header ${WebpackModules.find(["h1"]).h3}`,
                                },
                                Strings.Settings.Developer.Sections.backendstatus.title
                            ),
                            React.createElement(StatusTable, {
                                items: [
                                    {
                                        name: "Updates",
                                        url: Config.backend.updates.url,
                                    },
                                    {
                                        name: "Badges",
                                        url: Config.backend.badges.url,
                                    },
                                    {
                                        name: "Experiments",
                                        url: Config.backend.experiments.url,
                                    },
                                ],
                            }),
                            React.createElement(WebpackModules.find(["EmptyStateImage"]).EmptyStateImage, {
                                height: 200,
                                width: 415,
                                darkSrc: "/assets/c115d59ca13c0f942965a82a0f05bf01.svg",
                                lightSrc: "/assets/ad530d02033b87bb89752f915c2fbe3c.svg",
                                style: { flex: "none", marginInline: "auto" },
                            }),
                        ],
                    }),
                ],
            });
        }

        const pluginsHaveSettings = AddonManager.plugins.getAll().filter((m) => m.hasSettings && AddonManager.plugins.isEnabled(m.name)).length > 0;

        if (pluginsHaveSettings) {
            insert({ section: "DIVIDER" });
            insert({ section: "HEADER", label: "Velocity Addon Settings" });
        }

        AddonManager.plugins.getAll().forEach((plugin) => {
            if (plugin.hasSettings && AddonManager.plugins.isEnabled(plugin.name)) {
                insert({
                    section: normalizeString(plugin.name),
                    label: plugin.name,
                    className: `velocity-plugin-${normalizeString(plugin.name)}-tab`,
                    element: () => {
                        const PluginExport = typeof plugin.export.Plugin === "function" ? plugin.export.Plugin() : plugin.export.Plugin;
                        let settingsItems = [];
                        if (Array.isArray(PluginExport.getSettingsPanel())) {
                            PluginExport.getSettingsPanel().forEach((item) => {
                                switch (item.type) {
                                    case "switch":
                                        return settingsItems.push(
                                            React.createElement(Components.SettingsSection, {
                                                plugin: item.plugin,
                                                setting: item.setting,
                                                name: item.name,
                                                note: item.note,
                                                warning: item.warning,
                                                action: item.action,
                                            })
                                        );
                                    case "input":
                                        return settingsItems.push(
                                            React.createElement(Components.SettingsInput, {
                                                plugin: item.plugin,
                                                setting: item.setting,
                                                name: item.name,
                                                note: item.note,
                                                warning: item.warning,
                                                action: item.action,
                                                placeholder: item.placeholder,
                                                maxLength: item.maxLength,
                                                vertical: item.vertical || false,
                                            })
                                        );
                                }
                            });
                        } else {
                            settingsItems = PluginExport.getSettingsPanel();
                        }

                        return [React.createElement(FormTitle, { tag: "h1" }, plugin.name), React.createElement(ErrorBoundary, { children: settingsItems })];
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
