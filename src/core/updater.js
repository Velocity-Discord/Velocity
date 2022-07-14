const { info } = require("../../../package.json");
const request = require("./request");
const logger = require("./logger");
const path = require("path");
const Config = require("../common/config.json");
const { exec } = require("child_process");
const { shell } = require("electron");

const { Strings } = require("./i18n");

const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));

async function waitUntil(condition) {
    let item;
    while (!(item = condition())) await sleep(1);
    return item;
}

let updateURL = Config.backend.updates.url;

async function failModal(title, content) {
    const { React, WebpackModules, modals } = VApi;

    const ConfirmationModal = WebpackModules.find("ConfirmModal").default;
    const Button = WebpackModules.find(["ButtonColors"]);
    const { Messages } = WebpackModules.find((m) => m.default?.Messages?.OKAY).default;
    const Markdown = WebpackModules.find((m) => m.default?.displayName === "Markdown" && m.default.rules).default;

    if (!Array.isArray(content)) content = [content];
    content = content.map((c) => (typeof c === "string" ? React.createElement(Markdown, null, c) : c));

    return new Promise((resolve) => {
        modals.open((props) => {
            if (props.transitionState === 3) resolve(false);
            return React.createElement(
                ConfirmationModal,
                Object.assign(
                    {
                        header: title,
                        confirmButtonColor: Button.ButtonColors.BRAND,
                        confirmText: Strings.Settings.done,
                        danger: true,
                        onConfirm: () => resolve(true),
                        onCancel: () => resolve(false),
                        children: content,
                    },
                    props
                )
            );
        });
    });
}

module.exports = new (class Updater {
    async getUpdateStatus() {
        logger.log("Velocity", "Checking for updates");
        let updateData;
        return new Promise((resolve) => {
            request(updateURL, async (_, __, body) => {
                updateData = JSON.parse(body);
                if (updateData) {
                    if (updateData.version !== info.version) {
                        logger.log("Velocity", "Update available");
                        if (updateData.version > info.version) {
                            resolve("up");
                            process.env.willUpgrade = true;
                        } else if (updateData.version < info.version) {
                            resolve("down");
                            process.env.willDowngrade = true;
                        }
                    } else if (updateData.hash !== info.hash) {
                        resolve("hash");
                        process.env.willUpgrade = true;
                    } else {
                        resolve("none");
                        process.env.willDowngrade = "";
                        process.env.willUpgrade = "";
                    }
                } else {
                    resolve("error");
                }
            });
        });
    }

    async checkForUpdates() {
        logger.log("Velocity", "Checking for updates");
        let updateData;
        request(updateURL, async (_, __, body) => {
            updateData = JSON.parse(body);

            await waitUntil(() => window.document.querySelector('[class*="guilds"]'));
            VApi.showToast("Updater", Strings.Toasts.Updater.requestingdata, { type: "velocity" });

            if (updateData) {
                if (updateData.version !== info.version) {
                    logger.log("Velocity", "Update available");
                    if (updateData.version > info.version) {
                        process.env.willUpgrade = true;
                    } else if (updateData.version < info.version) {
                        process.env.willDowngrade = true;
                    }

                    async function updatePrompt() {
                        const { React, WebpackModules, modals, showToast } = VApi;
                        const ConfirmationModal = WebpackModules.find("ConfirmModal").default;
                        const Button = WebpackModules.find(["ButtonColors"]);
                        const ButtonEle = Button.default;
                        const Text = WebpackModules.find("LegacyText").default;
                        const { Messages } = WebpackModules.find((m) => m.default?.Messages?.OKAY).default;

                        return new Promise((resolve) => {
                            modals.open((props) => {
                                if (props.transitionState === 3) resolve(false);
                                return React.createElement(
                                    ConfirmationModal,
                                    Object.assign(
                                        {
                                            header: Strings.Modals.Updater.header,
                                            confirmButtonColor: Button.ButtonColors.BRAND,
                                            confirmText: Strings.Modals.Updater.update,
                                            cancelText: Messages.CANCEL,
                                            onConfirm: () => {
                                                resolve(true);

                                                showToast("Updater", Strings.Toasts.Updater.startingpull, { type: "velocity" });
                                                try {
                                                    exec(`cd ${process.env.VELOCITY_DIRECTORY} && cd ../ && git pull`, (error, stdout, stderr) => {
                                                        if (error || stderr) {
                                                            const VDir = path.join(__dirname, "../../../");
                                                            logger.error("Updater", error);
                                                            showToast("Updater", Strings.Toasts.Updater.failedpull, { type: "error" });
                                                            failModal(Strings.Modals.Updater.failedheader, [
                                                                ...Array.from(Object.values(Strings.Modals.Updater.failed)),
                                                                React.createElement(
                                                                    ButtonEle,
                                                                    {
                                                                        id: "velocity-folder",
                                                                        color: Button.ButtonColors.BRAND,
                                                                        className: ["velocity-button"],
                                                                        onClick: () => {
                                                                            shell.openPath(VDir);
                                                                        },
                                                                    },
                                                                    Strings.Modals.Updater.openfolder
                                                                ),
                                                            ]);
                                                            return;
                                                        }
                                                    });

                                                    VApi.DataStore.setData("VELOCITY_SETTINGS", "hasShownChangelog", false);
                                                } catch (e) {
                                                    logger.error("Updater", e);
                                                    showToast("Updater", Strings.Toasts.Updater.failedpull, { type: "error" });
                                                }
                                            },
                                            onCancel: () => resolve(false),
                                            children: [
                                                React.createElement(
                                                    Text,
                                                    {
                                                        color: Text.Colors.HEADER_SECONDARY,
                                                        size: Text.Sizes.SIZE_16,
                                                    },
                                                    `${Strings.Modals.Updater.content[0]} v${updateData.version}?`
                                                ),
                                                React.createElement(
                                                    Text,
                                                    {
                                                        color: Text.Colors.HEADER_SECONDARY,
                                                        size: Text.Sizes.SIZE_16,
                                                    },
                                                    `${Strings.Modals.Updater.content[1]} v${info.version}`
                                                ),
                                            ],
                                        },
                                        props
                                    )
                                );
                            });
                        });
                    }

                    updatePrompt();
                } else if (updateData.hash !== info.hash) {
                    async function updatePrompt() {
                        const { React, WebpackModules, modals, showToast } = VApi;
                        const ConfirmationModal = WebpackModules.find("ConfirmModal").default;
                        const Button = WebpackModules.find(["ButtonColors"]);
                        const ButtonEle = Button.default;
                        const Text = WebpackModules.find("LegacyText").default;
                        const { Messages } = WebpackModules.find((m) => m.default?.Messages?.OKAY).default;

                        return new Promise((resolve) => {
                            modals.open((props) => {
                                if (props.transitionState === 3) resolve(false);
                                return React.createElement(
                                    ConfirmationModal,
                                    Object.assign(
                                        {
                                            header: Strings.Modals.Updater.header,
                                            confirmButtonColor: Button.ButtonColors.BRAND,
                                            confirmText: Strings.Modals.Updater.update,
                                            cancelText: Messages.CANCEL,
                                            onConfirm: () => {
                                                resolve(true);

                                                showToast("Updater", Strings.Toasts.Updater.startingpull, { type: "velocity" });
                                                try {
                                                    exec("git pull", (error, stdout, stderr) => {
                                                        if (error || stderr) {
                                                            const VDir = path.join(__dirname, "../../../");
                                                            logger.error("Updater", error);
                                                            showToast("Updater", Strings.Toasts.Updater.failedpull, { type: "error" });
                                                            failModal(Strings.Modals.Updater.failedheader, [
                                                                ...Array.from(Object.values(Strings.Modals.Updater.failed)),
                                                                React.createElement(
                                                                    ButtonEle,
                                                                    {
                                                                        id: "velocity-folder",
                                                                        color: Button.ButtonColors.BRAND,
                                                                        className: ["velocity-button"],
                                                                        onClick: () => {
                                                                            shell.openPath(VDir);
                                                                        },
                                                                    },
                                                                    Strings.Modals.Updater.openfolder
                                                                ),
                                                            ]);
                                                            return;
                                                        }
                                                    });

                                                    VApi.DataStore.setData("VELOCITY_SETTINGS", "hasShownChangelog", false);
                                                } catch (e) {
                                                    logger.error("Updater", e);
                                                    showToast("Updater", Strings.Toasts.Updater.failedpull, { type: "error" });
                                                }
                                            },
                                            onCancel: () => resolve(false),
                                            children: [
                                                React.createElement(
                                                    Text,
                                                    {
                                                        color: Text.Colors.HEADER_SECONDARY,
                                                        size: Text.Sizes.SIZE_16,
                                                    },

                                                    `${Strings.Modals.Updater.content[2]} ${updateData.hash}?`
                                                ),
                                                React.createElement(
                                                    Text,
                                                    {
                                                        color: Text.Colors.HEADER_SECONDARY,
                                                        size: Text.Sizes.SIZE_16,
                                                    },
                                                    `${Strings.Modals.Updater.content[1]} ${info.hash}`
                                                ),
                                            ],
                                        },
                                        props
                                    )
                                );
                            });
                        });
                    }

                    updatePrompt();
                } else {
                    VApi.showToast("Updater", Strings.Toasts.Updater.noupdates, { type: "velocity" });
                }
            }
        });
    }

    async changelogModal(options = {}) {
        let updateJson;
        request(updateURL, (_, __, body) => {
            updateJson = JSON.parse(body);

            const {
                image = updateJson.changelog.image || "https://velocity-discord.netlify.app/assets/icon.png",
                subtitle = updateJson.changelog.subtitle,
                description = updateJson.changelog.description,
            } = options;

            const { React, WebpackModules, modals } = VApi;

            const ChangelogClasses = WebpackModules.find(["fixed", "improved"]);
            const Text = WebpackModules.find("LegacyText").default;
            const dateClass = WebpackModules.find(["size12", "size32"]).size12;
            const contentsClasses = WebpackModules.find(["spinnerItem", "submitting"]);
            const Tooltip = WebpackModules.find.prototypes("renderTooltip").default;

            const Markdown = WebpackModules.find((m) => m.default?.displayName === "Markdown" && m.default.rules).default;

            return new Promise((resolve) => {
                const closeModal = modals.open((props) => {
                    return React.createElement(
                        modals.ModalRoot,
                        Object.assign(props, {
                            size: "small",
                            className: "velocity-changelog",
                            children: [
                                React.createElement(
                                    modals.ModalHeader,
                                    null,
                                    React.createElement("div", {
                                        class: "velocity-modal-header-flex",
                                        children: [
                                            React.createElement("div", {
                                                class: "velocity-modal-header-container",
                                                children: [
                                                    React.createElement(
                                                        Text,
                                                        {
                                                            size: Text.Sizes.SIZE_20,
                                                            color: Text.Colors.HEADER_PRIMARY,
                                                            className: WebpackModules.find(["h1"]).h1,
                                                        },
                                                        Strings.Titles.whatsnew
                                                    ),
                                                    React.createElement("div", { style: { fontWeight: "400" }, className: `${dateClass} ${ChangelogClasses.date}` }, subtitle),
                                                ],
                                            }),
                                            React.createElement(modals.ModalCloseButton, {
                                                onClick: () => {
                                                    modals.close(closeModal);
                                                },
                                            }),
                                        ],
                                    })
                                ),
                                React.createElement(modals.ModalContent, {
                                    children: [React.createElement("img", { src: image }), React.createElement(Markdown, { className: Text.Colors.HEADER_SECONDARY }, description)],
                                }),
                                React.createElement(modals.ModalFooter, {
                                    className: "velocity-changelog-modal-footer",
                                    children: [
                                        React.createElement(
                                            Text,
                                            {
                                                size: Text.Sizes.SIZE_12,
                                                color: Text.Colors.STANDARD,
                                            },
                                            Strings.Titles.checkusout
                                        ),
                                        React.createElement(Tooltip, {
                                            text: "Velocity",
                                            children: (props) =>
                                                React.createElement("a", {
                                                    ...props,
                                                    href: "https://velocity-discord.netlify.app/",
                                                    rel: "noreferrer noopener",
                                                    target: "_blank",
                                                    className: "velocity-logo",
                                                    children: [
                                                        React.createElement("svg", {
                                                            width: "16",
                                                            height: "16",
                                                            viewBox: "0.4326 0.7052 359.1 341.6",
                                                            children: [
                                                                React.createElement("path", {
                                                                    d: "M180 342.295C128.695 251.204 26.085 137.341.4326 137.341 77.39 46.251.4326 137.341 77.39 46.251 77.39 114.568 128.695 137.341 180 205.659 231.305 137.341 282.61 114.568 282.61 46.251 359.567 137.341 282.61 46.251 359.567 137.341 333.915 137.341 231.305 251.204 179 342ZM180 142.808C205.653 120.036 231.305 91.796 256.958 23.478L231.305.7052C205.653 69.023 191 81.121 180 91.796 168.5 81.121 154.348 69.023 128.695.7052L103.043 23.478C128.695 91.796 154.348 120.036 180 142.808Z",
                                                                    fill: "currentColor",
                                                                }),
                                                            ],
                                                        }),
                                                    ],
                                                }),
                                        }),
                                    ],
                                }),
                            ],
                        })
                    );
                });
            });
        });
    }
})();
