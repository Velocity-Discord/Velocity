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
    const ConfirmationModal = getModule("ConfirmModal").default;
    const Button = getModule(["ButtonColors"]);
    const { Messages } = getModule((m) => m.default?.Messages?.OKAY).default;
    const Markdown = getModule((m) => m.default?.displayName === "Markdown" && m.default.rules).default;

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
                    props,
                ),
            );
        });
    });
}

async function checkForUpdates() {
    logger.log("Velocity", "Checking for updates");
    let updateData;
    request(updateURL, (_, __, body) => (updateData = JSON.parse(body)));

    VApi.showToast("Requesting Update Data");
    setTimeout(() => {
        if (updateData) {
            if (updateData.version !== info.version) {
                async function updatePrompt() {
                    const { React, getModule, modals, showToast } = VApi;
                    const ConfirmationModal = getModule("ConfirmModal").default;
                    const Button = getModule(["ButtonColors"]);
                    const ButtonEle = Button.default;
                    const Text = getModule("Text").default;
                    const { Messages } = getModule((m) => m.default?.Messages?.OKAY).default;
                    const Markdown = getModule((m) => m.default?.displayName === "Markdown" && m.default.rules).default;

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
                                                                "Open Velocity Folder",
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
                                                `Would you like to Update to v${updateData.version}?`,
                                            ),
                                            React.createElement(
                                                Text,
                                                {
                                                    color: Text.Colors.HEADER_SECONDARY,
                                                    size: Text.Sizes.SIZE_16,
                                                },
                                                `Currently v${info.version}`,
                                            ),
                                        ],
                                    },
                                    props,
                                ),
                            );
                        });
                    });
                }

                updatePrompt();

                async function changelogModal(options = {}) {
                    const { title = "What's New", description, subtitle } = options;
                    const { React, getModule, modals } = VApi;
                    const ConfirmationModal = getModule("ConfirmModal").default;
                    const Button = getModule(["ButtonColors"]);
                    const ChangelogClasses = getModule(["fixed", "improved"]);
                    const ModalCloseButton = getModule(["ModalCloseButton"]).default;
                    const Text = getModule("Text").default;
                    const Titles = getModule(["Tags", "default"]);
                    const { Messages } = getModule((m) => m.default?.Messages?.OKAY).default;
                    const MarkdownParser = getModule(["defaultRules", "parse"]);

                    return new Promise((resolve) => {
                        modals.open((props) => {
                            if (props.transitionState === 3) resolve(false);
                            return React.createElement(
                                ConfirmationModal,
                                Object.assign(
                                    {
                                        header: [
                                            React.createElement(Titles.default, { tag: Titles.Tags.H4 }, title),
                                            React.createElement(Text, { size: Text.Sizes.SMALL, color: Text.Colors.STANDARD, className: ChangelogClasses.date }, subtitle),
                                        ],
                                        onCancel: () => resolve(false),
                                        children: [React.createElement("p", { className: Text.Colors.HEADER_SECONDARY }, MarkdownParser.parse(description))],
                                    },
                                    props,
                                ),
                            );
                        });
                    });
                }
            } else {
                VApi.showToast("No Updates Found");
            }
        }
    }, 1500);
}

module.exports = { checkForUpdates };
