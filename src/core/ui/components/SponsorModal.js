/**
 * @type {Api}
 */
const VApi = window.VApi;

const { React, WebpackModules, modals, Logger } = VApi;
const Text = WebpackModules.findByDisplayNameDefault("LegacyText");

const { Strings } = require("../../i18n");
const InfoModal = require("./InfoModal");

module.exports = async function SponsorModal() {
    if (!WebpackModules.find("PremiumUpsellPerkRow")) {
        InfoModal();
        return Logger.warn("Velocity", "Premium Upsell Perk Row not found");
    }

    const Button = WebpackModules.find(["ButtonColors"]).default;
    const ButtonColors = WebpackModules.find(["ButtonColors"]).ButtonColors;
    const PremiumUpsellPerkRow = WebpackModules.find("PremiumUpsellPerkRow").default;

    return new Promise((resolve) => {
        const closeModal = modals.open((props) =>
            React.createElement(
                modals.ModalRoot,
                Object.assign(props, {
                    size: "medium",
                    className: "velocity-addon-settings-modal",
                    children: [
                        React.createElement(modals.ModalHeader, null, [
                            React.createElement(
                                Text,
                                {
                                    size: Text.Sizes.SIZE_20,
                                    color: Text.Colors.HEADER_PRIMARY,
                                    className: WebpackModules.find(["h1"]).h1,
                                },
                                Strings.Modals.Sponsor.header
                            ),
                            React.createElement(modals.ModalCloseButton, {
                                onClick: () => {
                                    modals.close(closeModal);
                                },
                            }),
                        ]),
                        React.createElement(modals.ModalContent, {
                            children: [
                                React.createElement(PremiumUpsellPerkRow, {
                                    description: Strings.Modals.Sponsor.rows[0],
                                    icon: WebpackModules.find("PersonShield").default,
                                    color: "hsl(305, calc(var(--saturation-factor, 1) * 100%), 75.1%)",
                                }),
                                React.createElement(PremiumUpsellPerkRow, {
                                    description: Strings.Modals.Sponsor.rows[1],
                                    icon: WebpackModules.find("EmojiSmile").default,
                                    color: "hsl(55, calc(var(--saturation-factor, 1) * 100%), 75.1%)",
                                }),
                                React.createElement("div", {
                                    className: "velocity-sponsor-modal-center",
                                    children: [
                                        React.createElement(WebpackModules.find("ShinyButton").default, {
                                            color: ButtonColors.BRAND,
                                            children: [
                                                React.createElement("span", {
                                                    className: "velocity-sponsor-modal-button-text",
                                                    children: Strings.Modals.Sponsor.button,
                                                }),
                                            ],
                                            onClick: () => {
                                                modals.close(closeModal);
                                                window.open("https://github.com/Velocity-Discord");
                                            },
                                        }),
                                    ],
                                }),
                            ],
                        }),
                    ],
                })
            )
        );
    });
};
