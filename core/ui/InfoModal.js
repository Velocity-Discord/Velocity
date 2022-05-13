const DataStore = require("../datastore");
const { info } = require("../../package.json");
const button = VApi.WebpackModules.find(["ButtonColors"]).default;
const Text = VApi.WebpackModules.find("LegacyText").default;
const ButtonColors = VApi.WebpackModules.find(["ButtonColors"]).ButtonColors;

const { Strings } = require("../i18n");

async function prompt(title) {
    const { React, WebpackModules, modals } = VApi;
    const ConfirmationModal = WebpackModules.find("ConfirmModal").default;
    const Button = WebpackModules.find(["ButtonColors"]);
    const { Messages } = WebpackModules.find((m) => m.default?.Messages?.OKAY).default;

    return new Promise((resolve) => {
        modals.open((props) => {
            if (props.transitionState === 3) resolve(null);
            return React.createElement(
                ConfirmationModal,
                Object.assign(
                    {
                        header: title,
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

module.exports = { prompt };
