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
                    DataStore.setData(plugin, setting, !enabled);
                    setEnabled(!enabled);
                },
            }),
        ],
    });
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
                                    "Done"
                                ),
                            ],
                        }),
                    ],
                })
            )
        );
    });
};

module.exports = { ShowAddonSettingsModal, SettingsSection };
