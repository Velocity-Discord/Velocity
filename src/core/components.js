/**
 * @type {Api}
 */
const VApi = window.VApi;

const { React, WebpackModules, modals, DataStore, Logger } = VApi;
const { Strings } = require("./i18n");

const Text = WebpackModules.findByDisplayNameDefault("LegacyText");
const FormTitle = WebpackModules.findByDisplayNameDefault("FormTitle");
const DropdownArrow = WebpackModules.findByDisplayNameDefault("DropdownArrow");

module.exports = new (class Components {
    ErrorBoundary = class ErrorBoundary extends React.PureComponent {
        get Button() {
            return WebpackModules.findByProps("Sizes", "Colors", "Looks", "DropdownSizes");
        }
        get Markdown() {
            return WebpackModules.find((m) => m.default?.displayName === "Markdown" && m.default?.rules).default;
        }

        constructor(props) {
            super(props);

            this.state = {
                error: false,
            };

            if (!props.children) {
                this.state = {
                    error: true,

                    errorStack: Strings.Components.ErrorBoundary.errors.nochildren,
                };
            }

            this.props.originalChildren = props.children;

            if (props.error) {
                this.state = {
                    error: true,
                };
            }
        }

        static getDerivedStateFromError(error) {
            return {
                error: true,

                errorStack: error,
            };
        }

        componentDidCatch(error, errorInfo) {
            this.setState({
                error: true,

                errorStack: error.stack,
            });
        }

        render() {
            if (this.state.toRetry) {
                this.state.error = false;
            }

            let header = this.state.header || Strings.Components.ErrorBoundary.headers.uncaught;

            if (this.props.originalChildren?.type) {
                header = `${Strings.Components.ErrorBoundary.headers.uncaught} ${
                    this.props.originalChildren.type.displayName ?? this.props.originalChildren.type.name ?? this.props.originalChildren.type
                }`;
            }

            if (this.state.error) {
                return React.createElement(
                    "div",
                    {
                        className: "velocity-error-boundary",
                    },
                    React.createElement(
                        "div",
                        {
                            className: "velocity-error-boundary-title",
                        },
                        React.createElement(
                            FormTitle,
                            {
                                tag: "h1",
                            },
                            header
                        )
                    ),

                    React.createElement(
                        "div",
                        {
                            className: "velocity-error-boundary-actions",
                        },
                        React.createElement(
                            this.Button,
                            {
                                size: this.Button.Sizes.SMALL,
                                onClick: () => {
                                    this.state.toRetry = true;
                                    this.forceUpdate();
                                },
                            },
                            Strings.Components.ErrorBoundary.buttons.retry
                        ),

                        React.createElement(
                            this.Button,
                            {
                                color: this.Button.Colors.RED,
                                size: this.Button.Sizes.SMALL,

                                onClick: () => {
                                    location.reload();
                                },
                            },
                            Strings.Components.ErrorBoundary.buttons.refresh
                        )
                    ),

                    React.createElement(
                        "div",
                        {
                            onClick: () => {
                                this.state.toRetry = false;
                                this.state.showDetails = !this.state.showDetails;
                                this.forceUpdate();
                            },
                            className: "velocity-error-boundary-details",
                        },
                        this.state.showDetails ? Strings.Components.ErrorBoundary.headers.hidedetails : Strings.Components.ErrorBoundary.headers.showdetails,
                        React.createElement(
                            "div",
                            {
                                style: {
                                    transform: `rotate(${this.state.showDetails ? "0" : "90"}deg)`,
                                },
                                className: "velocity-error-boundary-dropdown",
                            },
                            React.createElement(DropdownArrow, {
                                width: 24,
                                height: 24,
                            })
                        )
                    ),

                    this.state.showDetails
                        ? React.createElement(
                              "div",
                              {
                                  className: "velocity-error-boundary-markdown",
                              },
                              React.createElement(this.Markdown, {}, `# ${Strings.Components.ErrorBoundary.headers.errorstack}`),
                              React.createElement(
                                  this.Markdown,
                                  {},
                                  `
\`\`\`ts
${this.state.errorStack}
\`\`\`
                                    `
                              )
                          )
                        : null
                );
            }

            return this.props.children;
        }
    };

    SettingsSection = (props) => {
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
                                onClick: (e) => {
                                    e.target.parentElement.parentElement.querySelector("input").focus();
                                },
                            },
                            name
                        ),
                        React.createElement(
                            Text,
                            {
                                color: Text.Colors.HEADER_SECONDARY,
                                size: Text.Sizes.SIZE_14,
                                onClick: (e) => {
                                    e.target.parentElement.parentElement.querySelector("input").focus();
                                },
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
                        const { AddonManager } = VApi;
                        DataStore.setData(plugin, setting, !enabled);
                        const PluginClass = AddonManager.plugins.get(plugin).export.Plugin;
                        typeof PluginClass === "function" ? (PluginClass().settings = DataStore.getAllData(plugin)) : (PluginClass.settings = DataStore.getAllData(plugin));

                        if (action) {
                            action();
                        }

                        setEnabled(!enabled);
                    },
                }),
            ],
        });
    };

    SettingsInput = (props) => {
        const { plugin, setting, note, name, warning, action, placeholder, type, maxLength, vertical } = props;

        const TextInput = WebpackModules.find("TextInput").default;

        const [value, setValue] = React.useState(React.useState(DataStore.getData(plugin, setting)));
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
                                    onClick: (e) => {
                                        e.target.parentElement.parentElement.querySelector("input").focus();
                                    },
                                },
                                name
                            ),
                            React.createElement(
                                Text,
                                {
                                    color: Text.Colors.HEADER_SECONDARY,
                                    size: Text.Sizes.SIZE_14,
                                    onClick: (e) => {
                                        e.target.parentElement.parentElement.querySelector("input").focus();
                                    },
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
                                const { AddonManager } = VApi;
                                const PluginClass = AddonManager.plugins.get(plugin).export.Plugin;
                                typeof PluginClass === "function" ? (PluginClass().settings = DataStore.getAllData(plugin)) : (PluginClass.settings = DataStore.getAllData(plugin));

                                if (action) {
                                    action();
                                }
                            } catch (e) {
                                Logger.error("Velocity", e);
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
                                    onClick: (e) => {
                                        e.target.parentElement.parentElement.querySelector("input").focus();
                                    },
                                },
                                name
                            ),
                            React.createElement(
                                Text,
                                {
                                    color: Text.Colors.HEADER_SECONDARY,
                                    size: Text.Sizes.SIZE_14,
                                    onClick: (e) => {
                                        e.target.parentElement.parentElement.querySelector("input").focus();
                                    },
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
                            const { AddonManager } = VApi;
                            const PluginClass = AddonManager.plugins.get(plugin).export.Plugin;
                            typeof PluginClass === "function" ? (PluginClass().settings = DataStore.getAllData(plugin)) : (PluginClass.settings = DataStore.getAllData(plugin));
                            if (action) {
                                action();
                            }
                        },
                    }),
                ],
            });
        }
    };
})();
