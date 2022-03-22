const DataStore = require("../datastore");
const { info } = require("../../package.json");
const button = VApi.getModule(["ButtonColors"]).default;
const Text = VApi.getModule("Text").default;
const ButtonColors = VApi.getModule(["ButtonColors"]).ButtonColors;
// const { React } = VApi

// React.createElement("div", {
//     id: "velocity-popout",
//     children: [
//         React.createElement("div", {
//             id: "velocity-info",
//             children: [
//         React.createElement(Text, {
//             size: Text.Sizes.SIZE_34,
//             color: Text.Colors.HEADER_PRIMARY,
//             id: "velocity-title"
//         }, "Velocity"),
//         React.createElement(Text, {
//             size: Text.Sizes.SIZE_24,
//             color: Text.Colors.HEADER_SECONDARY,
//             id: "velocity-version"
//         }, info.version),
//         React.createElement(Text, {
//             size: Text.Sizes.SIZE_24,
//             color: Text.Colors.HEADER_SECONDARY,
//             id: "velocity-description"
//         }, info.description),
//         React.createElement(Text, {
//             id: "velocity-author",
//             size: Text.Sizes.SIZE_16,
//             color: Text.colors.HEADER_SECONDARY
//         }, info.author)]
//     })
//     ]
// })

(async () => {
    async function prompt(title) {
        const { React, getModule, modals } = VApi;
        const ConfirmationModal = getModule("ConfirmModal").default;
        const Button = getModule(["ButtonColors"]);
        const { Messages } = getModule((m) => m.default?.Messages?.OKAY).default;
        const TextInput = VApi.getModule("TextInput").default;
        const Switch = VApi.getModule("Switch").default;

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
                            cancelText: " ",
                            onConfirm: () => resolve(true),
                            onCancel: () => resolve(false),
                            children: [
                                React.createElement(
                                    Text,
                                    {
                                        size: Text.Sizes.SIZE_34,
                                        color: Text.Colors.HEADER_PRIMARY,
                                        id: "velocity-title",
                                    },
                                    "Velocity",
                                ),
                                React.createElement(
                                    Text,
                                    {
                                        size: Text.Sizes.SIZE_24,
                                        color: Text.Colors.HEADER_SECONDARY,
                                        id: "velocity-version",
                                    },
                                    info.version,
                                ),
                                React.createElement(
                                    Text,
                                    {
                                        size: Text.Sizes.SIZE_24,
                                        color: Text.Colors.HEADER_SECONDARY,
                                        id: "velocity-description",
                                    },
                                    info.description,
                                ),
                                React.createElement(
                                    Text,
                                    {
                                        id: "velocity-author",
                                        size: Text.Sizes.SIZE_16,
                                        color: Text.colors.HEADER_SECONDARY,
                                    },
                                    info.author,
                                ),
                            ],
                        },
                        props,
                    ),
                );
            });
        });
    }
    prompt("Velocity");
})();
