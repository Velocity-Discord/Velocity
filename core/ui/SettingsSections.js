const { React, WebpackModules } = VApi;
const { ipcRenderer } = require("electron");
const DataStore = require("../datastore");

const Text = WebpackModules.find("LegacyText").default;
const SwitchEle = WebpackModules.find("Switch").default;
const TextInput = WebpackModules.find("TextInput").default;

const SettingsSwitchSection = React.memo((props) => {
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
                    DataStore.setData("VELOCITY_SETTINGS", setting, !enabled);
                    setEnabled(!enabled);
                    if (reload) {
                        const re = await reloadPrompt();
                        if (re) {
                            ipcRenderer.invoke("reload-app");
                        }
                    }
                },
            }),
        ],
    });
});

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
                        text
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
                text
            ),
        ];
    }
});

module.exports = { SettingsInputSection, SettingsSwitchSection, SettingsTitle };