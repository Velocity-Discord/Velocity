const { React, WebpackModules, modals } = VApi;

const Text = WebpackModules.findByDisplayNameDefault("LegacyText");
const ModalComponents = WebpackModules.find(["ModalRoot"]);

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

module.exports = { ShowAddonSettingsModal };
