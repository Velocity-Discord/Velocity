const { Strings } = require("./i18n");

const { React, ReactDOM, WebpackModules, modals, DataStore } = VApi;

const Text = WebpackModules.findByDisplayNameDefault("LegacyText");
const ModalComponents = WebpackModules.find(["ModalRoot"]);

const SettingsSection = React.memo((props) => {
    const { plugin, setting, note, name, warning, action } = props;

    const SwitchEle = WebpackModules.find("Switch").default;

    const [enabled, setEnabled] = React.useState(DataStore.getData(plugin, setting));
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
                        name
                    ),
                    React.createElement(
                        Text,
                        {
                            color: Text.Colors.HEADER_SECONDARY,
                            size: Text.Sizes.SIZE_14,
                        },
                        note
                    ),
                    React.createElement(
                        Text,
                        {
                            color: Text.Colors.ERROR,
                            size: Text.Sizes.SIZE_14,
                            id: `velocity-settings-section-${setting.toLowerCase()}-warning`,
                        },
                        warning
                    ),
                ],
            }),
            React.createElement(SwitchEle, {
                checked: enabled,
                onChange: async () => {
                    if (action) {
                        action();
                    }
                    const { AddonManager } = VApi;
                    DataStore.setData(plugin, setting, !enabled);
                    const PluginClass = AddonManager.plugins.get(plugin).export.Plugin;
                    typeof PluginClass === "function" ? (PluginClass().settings = DataStore.getAllData(plugin)) : (PluginClass.settings = DataStore.getAllData(plugin));

                    setEnabled(!enabled);
                },
            }),
        ],
    });
});

const SettingsInput = React.memo((props) => {
    const { plugin, setting, note, name, warning, action, placeholder, type, maxLength, vertical } = props;

    const TextInput = WebpackModules.find("TextInput").default;

    const [value, setValue] = React.useState(React.useState(DataStore.getData(plugin, setting)));
    console.log(value[0]);
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
                            name
                        ),
                        React.createElement(
                            Text,
                            {
                                color: Text.Colors.HEADER_SECONDARY,
                                size: Text.Sizes.SIZE_14,
                            },
                            note
                        ),
                        React.createElement(
                            Text,
                            {
                                color: Text.Colors.ERROR,
                                size: Text.Sizes.SIZE_14,
                            },
                            warning
                        ),
                    ],
                }),
                React.createElement(TextInput, {
                    value: Array.isArray(value) ? value[0] || "" : value || "",
                    placeholder: placeholder || "",
                    type: type || "text",
                    maxLength: maxLength || undefined,
                    onInput: ({ target }) => {
                        try {
                            setValue(target.value);
                            DataStore.setData(plugin, setting, target.value);
                            if (action) {
                                action();
                            }
                            const { AddonManager } = VApi;
                            const PluginClass = AddonManager.plugins.get(plugin).export.Plugin;
                            typeof PluginClass === "function" ? (PluginClass().settings = DataStore.getAllData(plugin)) : (PluginClass.settings = DataStore.getAllData(plugin));
                        } catch (e) {
                            console.error(e);
                        }
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
                            name
                        ),
                        React.createElement(
                            Text,
                            {
                                color: Text.Colors.HEADER_SECONDARY,
                                size: Text.Sizes.SIZE_14,
                            },
                            note
                        ),
                        React.createElement(
                            Text,
                            {
                                color: Text.Colors.ERROR,
                                size: Text.Sizes.SIZE_14,
                            },
                            warning
                        ),
                    ],
                }),
                React.createElement(TextInput, {
                    value: value[0] || "",
                    placeholder: placeholder || "",
                    type: type || "text",
                    maxLength: maxLength || undefined,
                    onInput: ({ target }) => {
                        setValue(target.value);
                        DataStore.setData(plugin, setting, target.value);
                        if (action) {
                            action();
                        }
                        const { AddonManager } = VApi;
                        const PluginClass = AddonManager.plugins.get(plugin).export.Plugin;
                        typeof PluginClass === "function" ? (PluginClass().settings = DataStore.getAllData(plugin)) : (PluginClass.settings = DataStore.getAllData(plugin));
                    },
                }),
            ],
        });
    }
});

const ShowAddonSettingsModal = (p) => {
    const Button = WebpackModules.find(["ButtonColors"]).default;
    const ButtonColors = WebpackModules.find(["ButtonColors"]).ButtonColors;

    return new Promise((resolve) => {
        modals.open((props) =>
            React.createElement(
                ModalComponents.ModalRoot,
                Object.assign(props, {
                    size: "medium",
                    className: "velocity-addon-settings-modal",
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
                                `${p?.name || "Addon"} Plugin Settings`
                            )
                        ),
                        React.createElement(ModalComponents.ModalContent, {
                            children: p?.children || React.createElement("h1", null, "e"),
                        }),
                        React.createElement(ModalComponents.ModalFooter, {
                            className: "velocity-modal-footer",
                            children: [
                                React.createElement(
                                    Button,
                                    {
                                        color: ButtonColors.BRAND,
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
};

module.exports = { ShowAddonSettingsModal, SettingsSection, SettingsInput };
