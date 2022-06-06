const { info } = require("../../../../package.json");
const Text = VApi.WebpackModules.find("LegacyText").default;

const { Strings } = require("../i18n");

async function InfoModal() {
    const { React, WebpackModules, modals } = VApi;
    const ConfirmationModal = WebpackModules.find("ConfirmModal").default;
    const Button = WebpackModules.find(["ButtonColors"]);

    return new Promise((resolve) => {
        modals.open((props) => {
            if (props.transitionState === 3) resolve(null);
            return React.createElement(
                ConfirmationModal,
                Object.assign(
                    {
                        header: "Velocity",
                        confirmButtonColor: Button.ButtonColors.BRAND,
                        confirmText: Strings.Settings.done,
                        onConfirm: () => resolve(true),
                        onCancel: () => resolve(false),
                        children: [
                            React.createElement(
                                Text,
                                {
                                    size: Text.Sizes.SIZE_16,
                                    color: Text.Colors.HEADER_SECONDARY,
                                    id: "velocity-version",
                                },
                                `${Strings.Modals.Info.version} ${info.version} (${info.hash})`
                            ),
                            React.createElement(
                                Text,
                                {
                                    size: Text.Sizes.SIZE_16,
                                    color: Text.Colors.HEADER_SECONDARY,
                                    id: "velocity-description",
                                },
                                info.description
                            ),
                            React.createElement(
                                Text,
                                {
                                    id: "velocity-author",
                                    size: Text.Sizes.SIZE_16,
                                    color: Text.Colors.HEADER_SECONDARY,
                                },
                                info.author
                            ),
                        ],
                    },
                    props
                )
            );
        });
    });
}

module.exports = { InfoModal };
