const { info } = require("../package.json");
const request = require("./request");
const logger = require("./logger");
const path = require("path");
const { ipcRenderer, shell } = require("electron");

const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));

async function waitUntil(condition) {
    let item;
    while (!(item = condition())) await sleep(1);
    return item;
}

const updateURL = "https://raw.githubusercontent.com/TheCommieAxolotl/TheCommieAxolotl/main/v/update.json";

async function failModal(title, content) {
    const { React, getModule, modals } = VApi;
    const ConfirmationModal = getModule.find("ConfirmModal").default;
    const Button = getModule.find(["ButtonColors"]);
    const { Messages } = getModule.find((m) => m.default?.Messages?.OKAY).default;
    const Markdown = getModule.find((m) => m.default?.displayName === "Markdown" && m.default.rules).default;

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
                        confirmText: "Done",
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

async function checkForUpdates() {
    logger.log("Velocity", "Checking for updates");
    let updateData;
    request(updateURL, async (_, __, body) => {
        updateData = JSON.parse(body);

        await waitUntil(() => window.document.querySelector('[class*="guilds"]'));
        VApi.showToast("Requesting Update Data");

        if (updateData) {
            if (updateData.version !== info.version) {
                async function updatePrompt() {
                    const { React, getModule, modals, showToast } = VApi;
                    const ConfirmationModal = getModule.find("ConfirmModal").default;
                    const Button = getModule.find(["ButtonColors"]);
                    const ButtonEle = Button.default;
                    const Text = getModule.find("Text").default;
                    const { Messages } = getModule.find((m) => m.default?.Messages?.OKAY).default;

                    return new Promise((resolve) => {
                        modals.open((props) => {
                            if (props.transitionState === 3) resolve(false);
                            return React.createElement(
                                ConfirmationModal,
                                Object.assign(
                                    {
                                        header: "Velocity Update Available",
                                        confirmButtonColor: Button.ButtonColors.BRAND,
                                        confirmText: "Update",
                                        cancelText: Messages.CANCEL,
                                        onConfirm: () => {
                                            resolve(true);

                                            const VDir = path.join(__dirname, "..");

                                            let targetPackage;
                                            showToast("Requesting package...");
                                            request("https://raw.githubusercontent.com/Velocity-Discord/Velocity/main/package.json", (err, _, body) => {
                                                if (err) {
                                                    showToast("Request Failed", { type: "error" });
                                                } else {
                                                    try {
                                                        targetPackage = JSON.parse(body);
                                                    } catch (error) {
                                                        showToast("Failed to Parse Package", { type: "error" });
                                                        failModal("Update Failed", [
                                                            "You can manually update Velocity by opening the Velocity Folder and doing one of the following,",
                                                            "- Run `git pull` in the terminal (inside the folder)",
                                                            "- Download the **ZIP** from GitHub and replace the old folder with it uncompressed.",
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
                                                                "Open Velocity Folder"
                                                            ),
                                                        ]);
                                                    }
                                                }
                                            });

                                            // changelogModal({ subtitle: updateData.changelog.subtitle, description: updateData.changelog.description });
                                        },
                                        onCancel: () => resolve(false),
                                        children: [
                                            React.createElement(
                                                Text,
                                                {
                                                    color: Text.Colors.HEADER_SECONDARY,
                                                    size: Text.Sizes.SIZE_16,
                                                },
                                                `Would you like to Update to v${updateData.version}?`
                                            ),
                                            React.createElement(
                                                Text,
                                                {
                                                    color: Text.Colors.HEADER_SECONDARY,
                                                    size: Text.Sizes.SIZE_16,
                                                },
                                                `Currently v${info.version}`
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
                VApi.showToast("No Updates Found");
            }
        }
    });
}

async function changelogModal(options = {}) {
    let updateJson;
    request(updateURL, (_, __, body) => {
        updateJson = JSON.parse(body);

        const {
            image = updateJson.changelog.image || "https://velocity-discord.netlify.app/assets/3.png",
            subtitle = updateJson.changelog.subtitle,
            description = updateJson.changelog.description,
        } = options;

        const { React, getModule, modals } = VApi;
        const ConfirmationModal = getModule.find("ConfirmModal").default;
        const Button = getModule.find(["ButtonColors"]);
        const ChangelogClasses = getModule.find(["fixed", "improved"]);
        const Text = getModule.find("Text").default;
        const Titles = getModule.find(["Tags", "default"]);
        const dateClass = getModule.find(["size12", "size32"]).size12;
        const closeModals = getModule.find(["closeAllModals"]).closeAllModals;
        const closeClasses = getModule.find(["root", "close"]);
        const contentsClasses = getModule.find(["spinnerItem", "submitting"]);

        const { Messages } = getModule.find((m) => m.default?.Messages?.OKAY).default;
        const Markdown = getModule.find((m) => m.default?.displayName === "Markdown" && m.default.rules).default;

        return new Promise((resolve) => {
            modals.open((props) => {
                if (props.transitionState === 3) resolve(false);
                return React.createElement(
                    ConfirmationModal,
                    Object.assign(
                        {
                            bodyClassName: "velocity-changelog",
                            header: [
                                React.createElement("div", {
                                    class: "velocity-modal-header-flex",
                                    children: [
                                        React.createElement("div", {
                                            class: "velocity-modal-header-container",
                                            children: [
                                                React.createElement("h2", null, "What's New"),
                                                React.createElement("div", { style: { fontWeight: "400" }, className: `${dateClass} ${ChangelogClasses.date}` }, subtitle),
                                            ],
                                        }),
                                        React.createElement("button", {
                                            type: "button",
                                            className: `${closeClasses.close} ${contentsClasses.button} ${contentsClasses.lookBlank} ${contentsClasses.colorBrand} ${contentsClasses.grow}`,
                                            onClick: () => {
                                                closeModals();
                                            },
                                            children: [
                                                React.createElement("div", {
                                                    class: `${contentsClasses.contents}`,
                                                    children: [
                                                        React.createElement("svg", {
                                                            class: `${closeClasses.closeIcon}`,
                                                            width: "24",
                                                            height: "24",
                                                            viewBox: "0 0 24 24",
                                                            children: [
                                                                React.createElement("path", {
                                                                    fill: "currentColor",
                                                                    d: "M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z",
                                                                }),
                                                            ],
                                                        }),
                                                    ],
                                                }),
                                            ],
                                        }),
                                    ],
                                }),
                            ],
                            onCancel: () => resolve(false),
                            children: [React.createElement("img", { src: image }), React.createElement(Markdown, { className: Text.Colors.HEADER_SECONDARY }, description)],
                        },
                        props
                    )
                );
            });
        });
    });
}

module.exports = { checkForUpdates, changelogModal };
