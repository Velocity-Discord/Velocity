/**
 * @type {Api}
 */
const VApi = window.VApi;

const { AddonManager, React, WebpackModules, Logger } = VApi;
const { shell } = require("electron");

const Neptune = require("../../neptune");
const request = require("../../request");

const Card = require("./AddonCard");
const TabBar = WebpackModules.find("TabBar").default;
const TextInput = WebpackModules.find("TextInput").default;
const Button = WebpackModules.find(["ButtonColors"]).default;
const ButtonColors = WebpackModules.find(["ButtonColors"]).ButtonColors;
const ButtonSizes = WebpackModules.find(["ButtonSizes"]).ButtonSizes;
const FormTitle = WebpackModules.findByDisplayNameDefault("FormTitle");
const TabBarClasses = WebpackModules.findByProps("topPill");
const TabBarClasses1 = WebpackModules.findByProps("tabBar", "nowPlayingColumn");
const LeftCaret = WebpackModules.find("LeftCaret").default;
const Markdown = WebpackModules.find((m) => m.default?.displayName === "Markdown" && m.default?.rules).default;

const { Strings } = require("../../i18n");

function addonSort(x, y) {
    if (x.name < y.name) {
        return -1;
    }
    if (x.name > y.name) {
        return 1;
    }
    return 0;
}

function useForceUpdate() {
    const [value, setValue] = React.useState(false);
    return () => setValue((value) => !value);
}

let STORE_THEMES;
let STORE_PLUGINS;

request("https://velocity-discord.netlify.app/api/store/themes.json", (err, res, body) => {
    if (err) {
        Logger.log("Velocity Store", "Error fetching themes");
    } else {
        STORE_THEMES = JSON.parse(body);
    }
});

request("https://velocity-discord.netlify.app/api/store/plugins.json", (err, res, body) => {
    if (err) {
        Logger.log("Velocity Store", "Error fetching plugins");
    } else {
        STORE_PLUGINS = JSON.parse(body);
    }

    console.log(STORE_PLUGINS);
});

const AddonBody = (props) => {
    const { addon, setAddon } = props;

    return React.createElement("div", {
        id: "velocity-addon-store-body",
        children: [
            React.createElement("div", {
                className: "velocity-addon-store-body-breadcrumbs",
                onClick: () => {
                    setAddon(null);
                },
                children: [
                    React.createElement(LeftCaret, {
                        width: 20,
                        height: 20,
                        style: {
                            color: "var(--text-muted)",
                        },
                    }),
                    React.createElement(
                        FormTitle,
                        {
                            tag: "h3",
                            style: {
                                margin: "0",
                                cursor: "pointer",
                            },
                        },
                        "Store"
                    ),
                ],
            }),
            React.createElement("div", {
                className: "velocity-addon-store-body-header",
                children: [
                    React.createElement("div", {
                        className: "velocity-addon-store-body-header-title",
                        children: addon.NAME,
                    }),
                    React.createElement("div", {
                        className: "velocity-addon-store-body-header-separator",
                    }),
                    React.createElement("div", {
                        className: "velocity-addon-store-body-header-author",
                        children: addon.AUTHOR,
                    }),
                    React.createElement("div", {
                        className: "velocity-addon-store-body-header-separator",
                    }),
                    React.createElement("div", {
                        className: "velocity-addon-store-body-header-version",
                        children: addon.VERSION,
                    }),
                ],
            }),
            React.createElement("div", {
                className: "velocity-addon-store-body-description",
                children: addon.DESCRIPTION,
            }),
            !addon.IMAGE.includes("uploads/blank.png") &&
                React.createElement("img", {
                    className: "velocity-addon-store-body-image",
                    src: `https://velocity-discord.netlify.app${addon.IMAGE}`,
                    alt: addon.NAME,
                }),
            React.createElement("div", {
                className: "velocity-addon-store-body-actions",
                children: [
                    React.createElement(
                        FormTitle,
                        {
                            tag: "h1",
                        },
                        "Actions (NOT FUNCTIONAL)"
                    ),
                    React.createElement("div", {
                        className: "velocity-addon-store-body-actions-buttons",
                        children: [
                            React.createElement(
                                Button,
                                {
                                    id: "addon-install",
                                    color: ButtonColors.BRAND,
                                    size: ButtonSizes.SMALL,
                                },
                                "Install"
                            ),
                            React.createElement(
                                Button,
                                {
                                    id: "addon-source",
                                    color: ButtonColors.GREEN,
                                    size: ButtonSizes.SMALL,
                                    onClick: () => {
                                        try {
                                            shell.openExternal(addon.SOURCE.URL);
                                        } catch (e) {
                                            console.error(e);
                                        }
                                    },
                                },
                                "Source"
                            ),
                        ],
                    }),
                ],
            }),
        ],
    });
};

module.exports = (props) => {
    const { type } = props;

    const [tab, setTab] = React.useState(0);
    const [addon, setAddon] = React.useState(null);
    const forceUpdate = useForceUpdate();

    const StoreCard = (props) => {
        const { meta, type } = props;
        const { NAME, AUTHOR, VERSION, DESCRIPTION, DATE_UPDATED, URL, IMAGE } = meta;

        return React.createElement("div", {
            className: "velocity-store-card",
            onClick: () => {
                setAddon(meta);
            },
            children: [
                React.createElement("div", {
                    className: "velocity-store-card-image",
                    children: [
                        React.createElement("img", {
                            src: `https://velocity-discord.netlify.app${IMAGE}`,
                            alt: NAME,
                        }),
                    ],
                }),
                React.createElement("div", {
                    className: "velocity-store-card-info",
                    children: [
                        React.createElement("div", {
                            className: "velocity-store-card-info-title",
                            children: [
                                React.createElement("div", {
                                    className: "velocity-store-card-info-title-name",
                                    children: NAME,
                                }),
                            ],
                        }),
                        React.createElement("div", {
                            className: "velocity-store-card-info-description",
                            children: DESCRIPTION,
                        }),
                        React.createElement("div", {
                            className: "velocity-store-card-info-footer",
                            children: [
                                React.createElement("div", {
                                    className: "velocity-store-card-info-footer-version",
                                    children: VERSION,
                                }),
                                React.createElement("div", {
                                    className: "velocity-store-card-info-title-author",
                                    children: AUTHOR,
                                }),
                            ],
                        }),
                    ],
                }),
            ],
        });
    };

    if (type === "themes") {
        return [
            React.createElement("div", {
                className: "velocity-addon-page-header",
                children: [
                    React.createElement(FormTitle, { tag: "h1" }, Strings.Settings.Themes.title),
                    React.createElement(TabBar, {
                        selectedItem: tab,
                        type: TabBarClasses.topPill,
                        className: `${TabBarClasses1.tabBar} velocity-addon-page-tabbar`,
                        onItemSelect: (id) => {
                            setTab(id);
                            setAddon(null);
                        },
                        children: [
                            React.createElement(
                                TabBar.Item,
                                {
                                    id: 0,
                                    className: TabBarClasses1.tabBarItem,
                                },
                                "Themes"
                            ),
                            React.createElement(
                                TabBar.Item,
                                {
                                    id: 1,
                                    className: TabBarClasses1.tabBarItem,
                                },
                                "Store"
                            ),
                        ],
                    }),
                ],
            }),
            !addon &&
                React.createElement("div", {
                    className: "velocity-addon-modal-body-header",
                    children: [
                        React.createElement(TextInput, {
                            placeholder: Strings.Settings.Themes.Buttons.remoteurlplaceholder,
                            type: "text",
                            onInput: ({ target }) => {
                                this.remoteUrl = target.value;
                            },
                        }),
                        React.createElement("div", {
                            className: "velocity-addon-modal-body-header-buttons",
                            children: [
                                React.createElement(
                                    Button,
                                    {
                                        id: "load-remote-theme",
                                        color: ButtonColors.BRAND,
                                        size: ButtonSizes.SMALL,
                                        className: ["velocity-button"],
                                        onClick: () => {
                                            AddonManager.remote.loadTheme(this.remoteUrl);
                                        },
                                    },
                                    Strings.Settings.Themes.Buttons.loadremote
                                ),
                                React.createElement(
                                    Button,
                                    {
                                        id: "themes-folder",
                                        color: ButtonColors.PRIMARY,
                                        size: ButtonSizes.SMALL,
                                        className: ["velocity-button"],
                                        onClick: () => {
                                            shell.openPath(AddonManager.themes.folder);
                                        },
                                    },
                                    Strings.Settings.Themes.Buttons.openfolder
                                ),
                            ],
                        }),
                    ],
                }),
            tab === 0
                ? React.createElement("div", {
                      id: "velocity-addons-grid",
                      children: [
                          AddonManager.themes
                              .getAll()
                              .sort(addonSort)
                              .map((theme) =>
                                  React.createElement(Card, {
                                      meta: theme,
                                      type: "themes",
                                  })
                              ),
                      ],
                  })
                : addon
                ? React.createElement(AddonBody, {
                      addon,
                      setAddon,
                  })
                : React.createElement("div", {
                      id: "velocity-store-grid",
                      children: [
                          STORE_THEMES.map((theme) => {
                              return React.createElement(StoreCard, {
                                  meta: theme,
                                  type: "themes",
                              });
                          }),
                      ],
                  }),
        ];
    } else if (type === "plugins") {
        return [
            React.createElement("div", {
                className: "velocity-addon-page-header",
                children: [
                    React.createElement(FormTitle, { tag: "h1" }, Strings.Settings.Plugins.title),
                    React.createElement(TabBar, {
                        selectedItem: tab,
                        type: TabBarClasses.topPill,
                        className: `${TabBarClasses1.tabBar} velocity-addon-page-tabbar`,
                        onItemSelect: (id) => {
                            setTab(id);
                            setAddon(null);
                        },
                        children: [
                            React.createElement(
                                TabBar.Item,
                                {
                                    id: 0,
                                    className: TabBarClasses1.tabBarItem,
                                },
                                "Plugins"
                            ),
                            React.createElement(
                                TabBar.Item,
                                {
                                    id: 1,
                                    className: TabBarClasses1.tabBarItem,
                                },
                                "Store"
                            ),
                        ],
                    }),
                ],
            }),
            !addon &&
                React.createElement("div", {
                    className: "velocity-addon-modal-body-header",
                    children: [
                        React.createElement("div", {
                            className: "velocity-addon-modal-body-header-buttons",
                            children: [
                                React.createElement(
                                    Button,
                                    {
                                        id: "plugins-folder",
                                        color: ButtonColors.BRAND,
                                        size: ButtonSizes.SMALL,
                                        className: ["velocity-button"],
                                        onClick: () => {
                                            shell.openPath(AddonManager.plugins.folder);
                                        },
                                    },
                                    Strings.Settings.Plugins.Buttons.openfolder
                                ),
                            ],
                        }),
                    ],
                }),
            tab === 0
                ? React.createElement("div", {
                      id: "velocity-addons-grid",
                      children: [
                          AddonManager.plugins
                              .getAll()
                              .sort(addonSort)
                              .map((plugin) =>
                                  React.createElement(Card, {
                                      meta: plugin,
                                      type: "plugins",
                                  })
                              ),
                      ],
                  })
                : addon
                ? React.createElement(AddonBody, {
                      addon,
                      setAddon,
                  })
                : React.createElement("div", {
                      id: "velocity-store-grid",
                      children: [
                          STORE_PLUGINS.map((plugin) => {
                              return React.createElement(StoreCard, {
                                  meta: plugin,
                                  type: "plugins",
                              });
                          }),
                      ],
                  }),
        ];
    }
};
