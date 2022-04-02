const DataStore = require("../datastore")
const { ipcRenderer, shell } = require("electron");
const settingsquery = document.querySelector(".panels-3wFtMD > .container-YkUktl .flex-2S1XBF > :last-child");
const button = VApi.getModule.find(["ButtonColors"]).default;
const ButtonColors = VApi.getModule.find(["ButtonColors"]).ButtonColors;
const ButtonSizes = VApi.getModule.find(["ButtonColors"]).ButtonSizes;
const Text = VApi.getModule.find("Text").default;
const SwitchEle = VApi.getModule.find("Switch").default;
const Tooltip = VApi.getModule.find.prototypes("renderTooltip").default;
const { React, logger } = VApi;
const Markdown = VApi.getModule.find((m) => m.default?.displayName === "Markdown" && m.default.rules).default;
const Switche = VApi.getModule.find("Switch").default
const TextInput = VApi.getModule.find("TextInput").default;
const path = require("path")
const fs = require("fs")
const closeIcon = VApi.getModule.find("CloseIconWithKeybind").default
const {info} = require("../../package.json")
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

const SettingsTitle = React.memo((props) => {
    const {text, divider = false} = props
    if (divider) {
        return [
            React.createElement("div", {
                className: "velocity-settings-title-container",
                children: [
                    React.createElement("div", {
                        className: "velocity-settings-title"
                    }, text),
                    React.createElement("div", {
                        className: "velocity-settings-title-divider"
                    })
                ]
            })
        ]
    } else {
        return [
            React.createElement("div", {
                className: "velocity-settings-title"
            }, text)
        ]
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
    let buttons = []
    if (meta.license) buttons = [
        ...buttons,
        React.createElement(Tooltip, {
            text: meta.license || "No License",
            children: (props) =>
                React.createElement(VApi.getModule.find("Clickable").default, {
                    ...props,
                    className: "velocity-clickable",
                    children: [
                        React.createElement("svg", {
                            className: "velocity-card-footer-license",
                            width: "18", height: "18", viewBox: "0 0 24 24",
                            children: [
                                React.createElement("path", {
                                    d:"M3.75 3C3.33579 3 3 3.33579 3 3.75C3 4.16421 3.33579 4.5 3.75 4.5H4.792L2.05543 11.217C2.01882 11.3069 2 11.403 2 11.5C2 13.433 3.567 15 5.5 15C7.433 15 9 13.433 9 11.5C9 11.403 8.98118 11.3069 8.94457 11.217L6.208 4.5H11.25L11.25 16.5H7.25293C6.01029 16.5 5.00293 17.5074 5.00293 18.75C5.00293 19.9926 6.01029 21 7.25293 21H16.75C17.9926 21 19 19.9926 19 18.75C19 17.5074 17.9926 16.5 16.75 16.5H12.75L12.75 4.5H17.792L15.0554 11.217C15.0188 11.3069 15 11.403 15 11.5C15 13.433 16.567 15 18.5 15C20.433 15 22 13.433 22 11.5C22 11.403 21.9812 11.3069 21.9446 11.217L19.208 4.5H20.25C20.6642 4.5 21 4.16421 21 3.75C21 3.33579 20.6642 3 20.25 3H3.75ZM5.5 6.73782L7.13459 10.75H3.86541L5.5 6.73782ZM16.8654 10.75L18.5 6.73782L20.1346 10.75H16.8654Z",
                                    fill: "var(--text-normal)"
                                })
                            ],
                        }),
                    ],
                }),
        }), 
    ]
    if (meta.source) buttons = [
        ...buttons,
        React.createElement(Tooltip, {
            text: "Source",
            children: (props) =>
                React.createElement(VApi.getModule.find("Clickable").default, {
                    ...props,
                    className: "velocity-clickable",
                    children: [
                        React.createElement("svg", {
                            className: "velocity-card-footer-source",
                            width: "18", height: "18", viewBox: "0 0 256 250",
                            children: [
                                React.createElement("path", {
                                    d:"M128.00106,0 C57.3172926,0 0,57.3066942 0,128.00106 C0,184.555281 36.6761997,232.535542 87.534937,249.460899 C93.9320223,250.645779 96.280588,246.684165 96.280588,243.303333 C96.280588,240.251045 96.1618878,230.167899 96.106777,219.472176 C60.4967585,227.215235 52.9826207,204.369712 52.9826207,204.369712 C47.1599584,189.574598 38.770408,185.640538 38.770408,185.640538 C27.1568785,177.696113 39.6458206,177.859325 39.6458206,177.859325 C52.4993419,178.762293 59.267365,191.04987 59.267365,191.04987 C70.6837675,210.618423 89.2115753,204.961093 96.5158685,201.690482 C97.6647155,193.417512 100.981959,187.77078 104.642583,184.574357 C76.211799,181.33766 46.324819,170.362144 46.324819,121.315702 C46.324819,107.340889 51.3250588,95.9223682 59.5132437,86.9583937 C58.1842268,83.7344152 53.8029229,70.715562 60.7532354,53.0843636 C60.7532354,53.0843636 71.5019501,49.6441813 95.9626412,66.2049595 C106.172967,63.368876 117.123047,61.9465949 128.00106,61.8978432 C138.879073,61.9465949 149.837632,63.368876 160.067033,66.2049595 C184.49805,49.6441813 195.231926,53.0843636 195.231926,53.0843636 C202.199197,70.715562 197.815773,83.7344152 196.486756,86.9583937 C204.694018,95.9223682 209.660343,107.340889 209.660343,121.315702 C209.660343,170.478725 179.716133,181.303747 151.213281,184.472614 C155.80443,188.444828 159.895342,196.234518 159.895342,208.176593 C159.895342,225.303317 159.746968,239.087361 159.746968,243.303333 C159.746968,246.709601 162.05102,250.70089 168.53925,249.443941 C219.370432,232.499507 256,184.536204 256,128.00106 C256,57.3066942 198.691187,0 128.00106,0 Z M47.9405593,182.340212 C47.6586465,182.976105 46.6581745,183.166873 45.7467277,182.730227 C44.8183235,182.312656 44.2968914,181.445722 44.5978808,180.80771 C44.8734344,180.152739 45.876026,179.97045 46.8023103,180.409216 C47.7328342,180.826786 48.2627451,181.702199 47.9405593,182.340212 Z M54.2367892,187.958254 C53.6263318,188.524199 52.4329723,188.261363 51.6232682,187.366874 C50.7860088,186.474504 50.6291553,185.281144 51.2480912,184.70672 C51.8776254,184.140775 53.0349512,184.405731 53.8743302,185.298101 C54.7115892,186.201069 54.8748019,187.38595 54.2367892,187.958254 Z M58.5562413,195.146347 C57.7719732,195.691096 56.4895886,195.180261 55.6968417,194.042013 C54.9125733,192.903764 54.9125733,191.538713 55.713799,190.991845 C56.5086651,190.444977 57.7719732,190.936735 58.5753181,192.066505 C59.3574669,193.22383 59.3574669,194.58888 58.5562413,195.146347 Z M65.8613592,203.471174 C65.1597571,204.244846 63.6654083,204.03712 62.5716717,202.981538 C61.4524999,201.94927 61.1409122,200.484596 61.8446341,199.710926 C62.5547146,198.935137 64.0575422,199.15346 65.1597571,200.200564 C66.2704506,201.230712 66.6095936,202.705984 65.8613592,203.471174 Z M75.3025151,206.281542 C74.9930474,207.284134 73.553809,207.739857 72.1039724,207.313809 C70.6562556,206.875043 69.7087748,205.700761 70.0012857,204.687571 C70.302275,203.678621 71.7478721,203.20382 73.2083069,203.659543 C74.6539041,204.09619 75.6035048,205.261994 75.3025151,206.281542 Z M86.046947,207.473627 C86.0829806,208.529209 84.8535871,209.404622 83.3316829,209.4237 C81.8013,209.457614 80.563428,208.603398 80.5464708,207.564772 C80.5464708,206.498591 81.7483088,205.631657 83.2786917,205.606221 C84.8005962,205.576546 86.046947,206.424403 86.046947,207.473627 Z M96.6021471,207.069023 C96.7844366,208.099171 95.7267341,209.156872 94.215428,209.438785 C92.7295577,209.710099 91.3539086,209.074206 91.1652603,208.052538 C90.9808515,206.996955 92.0576306,205.939253 93.5413813,205.66582 C95.054807,205.402984 96.4092596,206.021919 96.6021471,207.069023 Z",
                                    fill: "var(--text-normal)"
                                })
                            ],
                        }),
                    ],
                    onClick: () => {
                        if (meta.source !== "") window.open(meta.source || "about:blank", "_blank");
                    }
                }),
        }),
    ] 
    if (meta.website) buttons = [
        ...buttons,
        React.createElement(Tooltip, {
            text: "Website",
            children: (props) =>
                React.createElement(VApi.getModule.find("Clickable").default, {
                    ...props,
                    className: "velocity-clickable",
                    children: [
                        React.createElement("svg", {
                            className: "velocity-card-footer-site",
                            width: "18", height: "18", viewBox: "0 0 32 32",
                            children: [
                                React.createElement("path", {
                                    d:"M11 16C11 14.6074 11.0779 13.2657 11.2219 12H20.7781C20.9221 13.2657 21 14.6074 21 16C21 17.3926 20.9221 18.7343 20.7781 20H11.2219C11.0779 18.7343 11 17.3926 11 16ZM9.20981 20C9.07254 18.7196 9 17.3786 9 16C9 14.6214 9.07253 13.2804 9.2098 12H2.57976C2.20255 13.2674 2 14.6101 2 16C2 17.39 2.20255 18.7326 2.57976 20H9.20981ZM3.34726 22H9.48459C9.79887 23.8596 10.2564 25.5469 10.8289 26.978C11.1976 27.8997 11.6221 28.7358 12.1012 29.4499C8.23033 28.3298 5.04983 25.584 3.34726 22ZM11.5149 22H20.4851C20.1955 23.5993 19.7954 25.0322 19.3142 26.2352C18.7992 27.5227 18.2109 28.4975 17.6089 29.1341C17.0089 29.7686 16.4649 30 16 30C15.5351 30 14.9911 29.7686 14.3911 29.1341C13.7891 28.4975 13.2008 27.5227 12.6858 26.2352C12.2046 25.0322 11.8045 23.5993 11.5149 22ZM22.5154 22C22.2011 23.8596 21.7436 25.5469 21.1711 26.978C20.8024 27.8997 20.3779 28.7358 19.8988 29.4499C23.7697 28.3298 26.9502 25.584 28.6527 22H22.5154ZM29.4202 20C29.7974 18.7326 30 17.39 30 16C30 14.6101 29.7974 13.2674 29.4202 12H22.7902C22.9275 13.2804 23 14.6214 23 16C23 17.3786 22.9275 18.7196 22.7902 20H29.4202ZM19.3142 5.76479C19.7954 6.96781 20.1955 8.40075 20.4851 10H11.5149C11.8045 8.40075 12.2046 6.96781 12.6858 5.76479C13.2008 4.47728 13.7891 3.50246 14.3911 2.86588C14.989 2.2336 15.5314 2.0016 15.9952 2.00001L16 2L16.0027 2C16.467 2.0009 17.0101 2.23265 17.6089 2.86588C18.2109 3.50246 18.7992 4.47728 19.3142 5.76479ZM22.5154 10H28.6527C26.9502 6.41602 23.7697 3.67018 19.8988 2.55008C20.3779 3.26419 20.8024 4.10032 21.1711 5.022C21.7436 6.45315 22.2011 8.14037 22.5154 10ZM3.34726 10H9.48459C9.79887 8.14037 10.2564 6.45315 10.8289 5.022C11.1976 4.10032 11.6221 3.26419 12.1012 2.55008C8.23032 3.67018 5.04983 6.41602 3.34726 10Z",
                                    fill: "var(--text-normal)"
                                })
                            ],
                        }),
                    ],
                    onClick: () => {
                        if (meta.website !== "") window.open(meta.website || "about:blank", "_blank");
                    }
                }),
        }),
    ]

    const [enabled, setEnabled] = React.useState(VApi.AddonManager[type].isEnabled(meta.name));
    return React.createElement("div", {
        className: "velocity-card",
        type,
        id: meta.name,
        children: [
            React.createElement("div", {
                className: "velocity-card-header-wrapper",
                children: [
                    React.createElement("div", {
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
                                className: "velocity-card-header-author-wrapper",
                                children: [
                                    React.createElement("div", {
                                        className: "velocity-card-header-author-text",
                                        children: "By ",
                                    }),
                                    React.createElement("div", {
                                        className: "velocity-card-header-author",
                                        children: meta.author,
                                    }),
                                ],
                            }),
                        ],
                    }),
                    React.createElement("div", {
                        className: "velocity-card-header-switch",
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
                            className: "velocity-card-footer-right",
                            children: [
                                ...buttons
                            ],
                        }),
                        React.createElement("div", {
                            className: "velocity-card-footer-left",
                            children: [
                                React.createElement(
                                    button,
                                    {
                                        size: ButtonSizes.SMALL,
                                        className: ["velocity-card-footer-edit-button"],
                                        onClick: () => {
                                            shell.openPath(meta.file);
                                        },
                                    },
                                    "Edit",
                                ),
                                React.createElement(
                                    button,
                                    {
                                        color: ButtonColors.RED,
                                        size: ButtonSizes.SMALL,
                                        className: ["velocity-card-footer-delete-button"],
                                        onClick: () => {
                                            fs.unlink(meta.file, () => {
                                                VApi.showToast(`Deleted ${meta.name}`, { type: "error" });
                                            });
                                        },
                                    },
                                    "Delete",
                                ),
                            ],
                        }),
                    ],
                }),
            }),
        ],
    });
});

const settings = DataStore("VELOCITY_SETTINGS");
const Settings = DataStore("VELOCITY_SETTINGS");
const headerClasses = "velocity-header-display"

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
                            React.createElement(SettingsSection, {
                                setting: "CSSFeatures",
                                name: "Beta CSS Features",
                                note: "Adds Velocity's beta CSS @ Rules.",
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
                                                const content = window.editor.getValue();
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
                                                window.editor.setValue("");
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
                                        React.createElement(Text, {
                                            color: Text.Colors.ERROR,
                                            size: Text.Sizes.SIZE_14,
                                            id: `velocity-customcss-warning`,
                                        }, ""),
                                    ],
                                    onClick: () => {
                                        shell.openPath(VApi.AddonManager.themes.folder);
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
                                                try {
                                                    const content = window.editor.getValue();
                                                    DataStore.setData("VELOCITY_SETTINGS", "CSS", content);
                                                    VApi.customCSS.reload();

                                                    VApi.showToast("Saved", { type: "success" });
                                                } catch (error) {
                                                    console.error(error)
                                                }
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
                                                window.editor.setValue("");
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
    let location = returnValue.findIndex((s) => s.section.toLowerCase() == "discord nitro") - 2;
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
        }
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
                const customCSS = DataStore.getData("VELOCITY_SETTINGS", "CSS");
                cssPrompt("Custom CSS");
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
                const startupJS = DataStore.getData("VELOCITY_SETTINGS", "JS");
                jsPrompt("Startup Script");
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
    let changeLocation = returnValue.findIndex((s) => s.section.toLowerCase() == "changelog") + 1;
    if (changeLocation < 0) return;
    const insertChange = (section) => {
        returnValue.splice(changeLocation, 0, section);
        changeLocation++;
    };

    insertChange({
        section: "velocity-changelog",
        label: "Velocity Change Log",
        className: `velocity-velocity-changelog-tab`,
        onClick: () => {
            updater.changelogModal()
        },
    });
});
