/**
 * @type {Api}
 */
const VApi = window.VApi;

const { React, WebpackModules } = VApi;
const { ipcRenderer } = require("electron");
const DataStore = require("../../datastore");

const Text = WebpackModules.find("LegacyText").default;
const SwitchEle = WebpackModules.find("Switch").default;
const FormTitle = WebpackModules.findByDisplayNameDefault("FormTitle");
const TextInput = WebpackModules.find("TextInput").default;
const LeftCaret = WebpackModules.find("LeftCaret").default;
const RightCaret = WebpackModules.find("RightCaret").default;

const { Strings } = require("../../i18n");

module.exports = new (class SettingsSections {
    SettingsColorSection = (props) => {
        const { setting, note, name, warning = "", action } = props;

        const [color, setColor] = React.useState(DataStore.getData("VELOCITY_SETTINGS", setting));

        const ColorPicker = VApi.WebpackModules.find((m) => m.CustomColorButton && m.default?.displayName === "ColorPicker");

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
                                id: `velocity-settings-section-${setting.toLowerCase()}-warning`,
                            },
                            warning
                        ),
                    ],
                }),
                React.createElement(ColorPicker.CustomColorPicker, {
                    color: color,
                    onChange: (color) => {
                        setColor(color);
                        if (action) action(color);
                    },
                }),
            ],
        });
    };
    SettingsSwitchSection = (props) => {
        const { setting, note, name, warning, action, reload = false } = props;

        const [enabled, setEnabled] = React.useState(DataStore.getData("VELOCITY_SETTINGS", setting));

        const [initial] = React.useState(Boolean(enabled));

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
                        reload
                            ? initial !== enabled &&
                              React.createElement(
                                  Text,
                                  {
                                      color: Text.Colors.ERROR,
                                      size: Text.Sizes.SIZE_14,
                                      id: `velocity-settings-section-${setting.toLowerCase()}-warning`,
                                  },
                                  Strings.Settings.requiresrestart
                              )
                            : React.createElement(
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
                        DataStore.setData("VELOCITY_SETTINGS", setting, !enabled);
                        setEnabled(!enabled);
                        if (action) {
                            action();
                        }
                    },
                }),
            ],
        });
    };

    SettingsInputSection = (props) => {
        const { setting, note, name, warning, placeholder, type, maxLength, vertical, reload = false } = props;

        const [value, setValue] = React.useState(DataStore.getData("VELOCITY_SETTINGS", setting));

        const [initial] = React.useState(value);

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
                            reload
                                ? initial !== value &&
                                  React.createElement(
                                      Text,
                                      {
                                          color: Text.Colors.ERROR,
                                          size: Text.Sizes.SIZE_14,
                                          id: `velocity-settings-section-${setting.toLowerCase()}-warning`,
                                      },
                                      Strings.Settings.requiresrestart
                                  )
                                : React.createElement(
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
    };

    SettingsCollection = (props) => {
        const [collapsed, setCollapsed] = React.useState(false);
        const { title, children } = props;

        return [
            React.createElement("div", {
                className: `velocity-settings-collection`,
                children: [
                    React.createElement("div", {
                        className: "velocity-settings-collection-header",
                        onClick: () => setCollapsed(!collapsed),
                        children: [
                            React.createElement(RightCaret, {
                                width: 12,
                                height: 12,
                                style: {
                                    transform: `rotate(${collapsed ? 0 : 90}deg)`,
                                },
                            }),
                            React.createElement(FormTitle, {
                                tag: "h5",
                                children: title,
                                style: {
                                    margin: "0",
                                },
                            }),
                        ],
                    }),
                    React.createElement("div", {
                        className: `velocity-settings-collection-body${collapsed ? " collapsed" : ""}`,
                        children: collapsed ? null : children,
                    }),
                ],
            }),
        ];
    };
})();
