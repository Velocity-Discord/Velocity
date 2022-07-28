/**
 * @type {Api}
 */
const VApi = window.VApi;

const { React, WebpackModules, showChangelog } = VApi;

const { ipcRenderer } = require("electron");
const fs = require("fs");
const path = require("path");
const i18n = require("../../i18n");
const request = require("../../request");
const updater = require("../../updater");

const { Strings, normalizeString } = i18n;
const Config = require("../../../common/config.json");

const Text = WebpackModules.find("LegacyText").default;
const Anchor = WebpackModules.find("Anchor").default;
const ButtonModules = WebpackModules.find(["ButtonColors"]);
const Spinner = WebpackModules.find("Spinner").default;

const UpstreamUrlPortions = Config.backend.upstream.url.split("/");

const exec = async (command, callback) => {
    const e = await ipcRenderer.invoke("exec", command);
    return callback({ ...e });
};

module.exports = () => {
    const [status, setStatus] = React.useState("uptodate");
    const [latestCommit, setLatestCommit] = React.useState("");
    const [currentCommit, setCurrentCommit] = React.useState("");

    React.useEffect(async () => {
        request(Config.backend.upstream.url, { headers: { "User-Agent": "GitHub" } }, (error, response, body) => {
            if (error) {
                setStatus("error");
            } else {
                const json = JSON.parse(body);
                const latestCommit = json.sha;
                setLatestCommit(latestCommit);
            }
        });

        const gitDirPath = path.resolve(__dirname, "../../../../../.git");
        if (!fs.existsSync(gitDirPath)) {
            setCurrentCommit("NOT_GIT");
            setStatus("error");
            return;
        }

        exec(`cd ${process.env.VELOCITY_DIRECTORY.replace("/dist", "")} && git rev-parse HEAD`, ({ stdout }) => {
            setCurrentCommit(stdout);
        });

        if (currentCommit === latestCommit) {
            return setStatus("uptodate");
        }

        setStatus("update");
    });

    return [
        React.createElement("div", {
            className: "velocity-updater-banner",
            children: [
                React.createElement("div", {
                    className: "velocity-updater-banner-icon",
                    children: [
                        React.createElement("img", {
                            src: "https://velocity-discord.netlify.app/assets/logo/Velocity-Blue.svg",
                        }),
                    ],
                }),
                React.createElement("div", {
                    className: "velocity-updater-banner-info",
                    children: [
                        React.createElement(Text, {
                            size: Text.Sizes.SIZE_32,
                            color: Text.Colors.HEADER_PRIMARY,
                            children:
                                currentCommit === "NOT_GIT"
                                    ? Strings.Settings.Updater.Titles.nogit
                                    : status === "uptodate"
                                    ? Strings.Settings.Updater.Titles.uptodate
                                    : Strings.Settings.Updater.Titles.available,
                            className: "velocity-updater-banner-info-title",
                        }),
                        React.createElement(Text, {
                            size: Text.Sizes.SIZE_16,
                            color: Text.Colors.MUTED,
                            children: [
                                `${Strings.Settings.Updater.Descriptions.fetchingupstream}: `,
                                React.createElement(
                                    Anchor,
                                    { href: `https://github.com/${UpstreamUrlPortions[4]}/${UpstreamUrlPortions[5]}/tree/${UpstreamUrlPortions[8]}` },
                                    `${UpstreamUrlPortions[4]}/${UpstreamUrlPortions[5]}:${UpstreamUrlPortions[8]}`
                                ),
                            ],
                            className: "velocity-updater-banner-info-description",
                        }),
                        React.createElement(Text, {
                            size: Text.Sizes.SIZE_16,
                            color: Text.Colors.MUTED,
                            children: [
                                `${Strings.Settings.Updater.Descriptions.latestcommit}: `,
                                React.createElement(
                                    Anchor,
                                    { href: `https://github.com/${UpstreamUrlPortions[4]}/${UpstreamUrlPortions[5]}/commits/${latestCommit}` },
                                    `${latestCommit?.substring(0, 6)}`
                                ),
                            ],
                            className: "velocity-updater-banner-info-description",
                        }),
                        currentCommit !== "NOT_GIT"
                            ? React.createElement(Text, {
                                  size: Text.Sizes.SIZE_16,
                                  color: Text.Colors.MUTED,
                                  children: [
                                      `${Strings.Settings.Updater.Descriptions.currentcommit}: `,
                                      React.createElement(
                                          Anchor,
                                          {
                                              href: `https://github.com${UpstreamUrlPortions[4]}/${UpstreamUrlPortions[5]}/commits/${currentCommit}`,
                                          },
                                          `${currentCommit?.substring(0, 6)}`
                                      ),
                                  ],
                                  className: "velocity-updater-banner-info-description",
                              })
                            : React.createElement(Text, {
                                  size: Text.Sizes.SIZE_16,
                                  color: Text.Colors.MUTED,
                                  children: `${Strings.Settings.Updater.Descriptions.currentcommit}: Not a git repository.`,
                                  className: "velocity-updater-banner-info-description",
                              }),

                        React.createElement(
                            ButtonModules.default,
                            {
                                color: ButtonModules.ButtonColors.GREEN,
                                size: ButtonModules.ButtonSizes.SMALL,
                                className: "velocity-updater-banner-info-button",
                                disabled: status === "uptodate" || status === "error",
                                onClick: (e) => {
                                    updater.dangerousPull();
                                },
                            },
                            Strings.Settings.Updater.Buttons.update
                        ),
                    ],
                }),
            ],
        }),
        React.createElement("div", {
            className: "velocity-updater-buttons",
            children: [
                React.createElement(
                    ButtonModules.default,
                    {
                        color: ButtonModules.ButtonColors.PRIMARY,
                        onClick: () => {
                            showChangelog();
                        },
                    },
                    Strings.Settings.Updater.Buttons.changelog
                ),
            ],
        }),
    ];
};
