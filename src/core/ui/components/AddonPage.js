/**
 * @type {Api}
 */
const VApi = window.VApi;

const { Patcher, AddonManager, React, WebpackModules, Logger, showConfirmationModal } = VApi;
const { shell } = require("electron");

const Neptune = require("../../neptune");
const request = require("../../request");

const Card = require("./AddonCard");
const TabBar = WebpackModules.find("TabBar").default;
const TextInput = WebpackModules.find("TextInput").default;
const PanelButton = WebpackModules.find("PanelButton").default;
const Button = WebpackModules.find(["ButtonColors"]).default;
const ButtonColors = WebpackModules.find(["ButtonColors"]).ButtonColors;
const ButtonSizes = WebpackModules.find(["ButtonSizes"]).ButtonSizes;
const FormTitle = WebpackModules.findByDisplayNameDefault("FormTitle");
const TabBarClasses = WebpackModules.findByProps("topPill");
const TabBarClasses1 = WebpackModules.findByProps("tabBar", "nowPlayingColumn");
const LeftCaret = WebpackModules.find("LeftCaret").default;
const Markdown = WebpackModules.find((m) => m.default?.displayName === "Markdown" && m.default?.rules).default;
const SearchIcon = WebpackModules.find("Search").default;
const EmptyStateImage = WebpackModules.find(["EmptyStateImage"]).EmptyStateImage;

const ContextMenuModules = WebpackModules.find("Menu");
const ContextMenuActions = WebpackModules.find(["openContextMenu"]);

const Icons = {
    Upload: WebpackModules.find("Upload").default,
    Search: WebpackModules.find("Search").default,
    Folder: WebpackModules.find("Folder").default,
    Trash: WebpackModules.find("Trash").default,
    Retry: WebpackModules.find("Retry").default,
    PersonShield: WebpackModules.find("PersonShield").default,
    EmojiSmile: WebpackModules.find("EmojiSmile").default,
    Overflow: WebpackModules.find("OverflowMenu").default,
    Cloud: (props) => {
        return React.createElement("svg", {
            ...props,
            viewBox: "-2 -2 34 24",
            fill: "currentColor",
            children: [
                React.createElement("path", {
                    d: "M29.9736 12.1344c0 3.8664-3 7.0344-6.7992 7.296H6.2448c-3.42 0-6.192-2.772-6.192-6.192s2.772-6.192 6.192-6.192c.264 0 .5208.0168.7752.0504.2448-3.9168 3.4968-7.0176 7.476-7.0176 3.192 0 5.9184 1.9968 6.996 4.8096.3792-.0624.768-.0936 1.164-.0936 4.0416 0 7.3176 3.276 7.3176 7.3176Z",
                }),
            ],
        });
    },
    Filter: (props) => {
        return React.createElement("svg", {
            ...props,
            viewBox: "0 0 24 24",
            fill: "currentColor",
            children: [
                React.createElement("path", {
                    d: "M3.5 6A1 1 0 003.5 9L4.5 9 4.5 20.5A1 1 0 007.5 20.5L7.5 9 8.5 9A1 1 0 008.5 6L7.5 6 7.5 3.5A1 1 0 004.5 3.5L4.5 6 3.5 6M16.5 15 15.5 15A1 1 0 0015.5 18L16.5 18 16.5 20.5A1 1 0 0019.5 20.5L19.5 18 20.5 18A1 1 0 0020.5 15L19 15 19 3.5A1 1 0 0016.5 3.5",
                }),
            ],
        });
    },
};

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
                    src: addon.IMAGE.startsWith("http") ? addon.IMAGE : `https://velocity-discord.netlify.app${addon.IMAGE}`,
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

    const [search, setSearch] = React.useState("");
    const [filters, setFilters] = React.useState({ name: true, description: true, author: true, version: true });

    const filterItems = (items) => {
        if (!search) return items;
        return items.filter((item) => {
            if (item.name) {
                return (
                    item.name.toLowerCase().includes(search.toLowerCase()) ||
                    item.author.toLowerCase().includes(search.toLowerCase()) ||
                    item.description.toLowerCase().includes(search.toLowerCase()) ||
                    item.version.toLowerCase().includes(search.toLowerCase())
                );
            } else {
                return (
                    item.NAME.toLowerCase().includes(search.toLowerCase()) ||
                    item.AUTHOR.toLowerCase().includes(search.toLowerCase()) ||
                    item.DESCRIPTION.toLowerCase().includes(search.toLowerCase()) ||
                    item.VERSION.toLowerCase().includes(search.toLowerCase())
                );
            }
        });
    };

    const FilterButton = (props) => {
        return React.createElement(PanelButton, {
            id: "search-filter",
            icon: Icons.Filter,
            tooltipText: Strings.Settings.Plugins.Buttons.filter,
            onClick: (e) => {
                ContextMenuActions.openContextMenu(e, function () {
                    const menu = React.createElement(
                        ContextMenuModules.default,
                        Object.assign({}, e, {
                            onClose: ContextMenuActions.closeContextMenu,
                            children: [
                                React.createElement(ContextMenuModules.MenuCheckboxItem, {
                                    label: "Name",
                                    id: "name",
                                    extended: true,
                                    checked: filters.name,
                                    action: () => {
                                        setFilters({ ...filters, name: !filters.name });
                                        menu.props.onClose();
                                    },
                                }),
                                React.createElement(ContextMenuModules.MenuCheckboxItem, {
                                    label: "Author",
                                    id: "author",
                                    extended: true,
                                    checked: filters.author,
                                    action: () => {
                                        setFilters({ ...filters, author: !filters.author });
                                        menu.props.onClose();
                                    },
                                }),
                                React.createElement(ContextMenuModules.MenuCheckboxItem, {
                                    label: "Version",
                                    id: "version",
                                    extended: true,
                                    checked: filters.version,
                                    action: () => {
                                        setFilters({ ...filters, version: !filters.version });
                                        menu.props.onClose();
                                    },
                                }),
                                React.createElement(ContextMenuModules.MenuCheckboxItem, {
                                    label: "Description",
                                    id: "description",
                                    extended: true,
                                    checked: filters.description,
                                    action: () => {
                                        setFilters({ ...filters, description: !filters.description });
                                        menu.props.onClose();
                                    },
                                }),
                            ],
                        })
                    );
                    return menu;
                });
            },
        });
    };

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
                    React.createElement(
                        FormTitle,
                        { tag: "h1" },
                        `${Strings.Settings.Themes.title} - ${tab == 0 ? filterItems(AddonManager.themes.getAll()).length : filterItems(STORE_THEMES).length}`
                    ),
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
                                "Installed"
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
                    className: "velocity-addon-modal-body-header-buttons",
                    children: [
                        React.createElement("div", {
                            className: "velocity-addon-modal-body-header-search",
                            children: [
                                React.createElement("input", {
                                    className: "velocity-addon-modal-body-header-search-input",
                                    type: "text",
                                    placeholder: "Search",
                                    onChange: (e) => {
                                        const { value } = e.target;
                                        setSearch(value);
                                    },
                                }),
                                React.createElement(SearchIcon),
                            ],
                        }),
                        tab == 1 &&
                            React.createElement(PanelButton, {
                                id: "remote-theme-install",
                                icon: Icons.Cloud,
                                tooltipText: Strings.Settings.Themes.Buttons.installremote,
                                onClick: () => {
                                    let remoteUrl;
                                    showConfirmationModal(
                                        "Install Remote Theme",
                                        [
                                            "Enter the URL of the remote theme you want to install.",
                                            React.createElement(TextInput, {
                                                placeholder: Strings.Settings.Themes.Buttons.remoteurlplaceholder,
                                                type: "text",
                                                onInput: ({ target }) => {
                                                    remoteUrl = target.value;
                                                },
                                            }),
                                        ],
                                        {
                                            onConfirm: () => {
                                                AddonManager.themes.loadRemote(remoteUrl);
                                            },
                                            confirmText: "Install",
                                        }
                                    );
                                },
                            }),
                        tab == 0 &&
                            React.createElement(PanelButton, {
                                id: "themes-folder",
                                icon: Icons.Folder,
                                tooltipText: Strings.Settings.Themes.Buttons.openfolder,
                                onClick: () => {
                                    shell.openPath(AddonManager.themes.folder);
                                },
                            }),
                        React.createElement(FilterButton),
                    ],
                }),
            tab === 0
                ? React.createElement("div", {
                      id: "velocity-addons-grid",
                      children: [
                          filterItems(AddonManager.themes.getAll()).map((theme) => {
                              return React.createElement(Card, {
                                  meta: theme,
                                  type: "themes",
                              });
                          }),
                          filterItems(AddonManager.themes.getAll()).length < 1 &&
                              React.createElement(EmptyStateImage, {
                                  height: 200,
                                  width: 415,
                                  darkSrc: "/assets/b669713872b43ca42333264abf9c858e.svg",
                                  lightSrc: "/assets/c84361b810ca7c10d6e8ddb6ea722ebe.svg",
                                  style: { flex: "none", marginInline: "auto" },
                              }),
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
                          filterItems(STORE_THEMES).map((theme) => {
                              return React.createElement(StoreCard, {
                                  meta: theme,
                                  type: "themes",
                              });
                          }),
                          filterItems(STORE_THEMES).length < 1 &&
                              React.createElement(EmptyStateImage, {
                                  height: 200,
                                  width: 415,
                                  darkSrc: "/assets/b669713872b43ca42333264abf9c858e.svg",
                                  lightSrc: "/assets/c84361b810ca7c10d6e8ddb6ea722ebe.svg",
                                  style: { flex: "none", marginInline: "auto" },
                              }),
                      ],
                  }),
        ];
    } else if (type === "plugins") {
        return [
            React.createElement("div", {
                className: "velocity-addon-page-header",
                children: [
                    React.createElement(
                        FormTitle,
                        { tag: "h1" },
                        `${Strings.Settings.Plugins.title} - ${
                            tab == 0
                                ? AddonManager.plugins.getAll().filter((m) => m.name.toLowerCase().includes(search.toLowerCase()) || !search).length
                                : STORE_PLUGINS.filter((m) => m.NAME.toLowerCase().includes(search.toLowerCase()) || !search).length
                        }`
                    ),
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
                                "Installed"
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
            React.createElement("div", {
                className: "velocity-addon-modal-body-header",
                children: [
                    !addon &&
                        React.createElement("div", {
                            className: "velocity-addon-modal-body-header-buttons",
                            children: [
                                React.createElement("div", {
                                    className: "velocity-addon-modal-body-header-search",
                                    children: [
                                        React.createElement("input", {
                                            className: "velocity-addon-modal-body-header-search-input",
                                            type: "text",
                                            placeholder: "Search",
                                            onChange: (e) => {
                                                const { value } = e.target;
                                                setSearch(value);
                                            },
                                        }),
                                        React.createElement(SearchIcon),
                                    ],
                                }),
                                tab == 0 &&
                                    React.createElement(PanelButton, {
                                        id: "plugins-folder",
                                        icon: Icons.Folder,
                                        tooltipText: Strings.Settings.Plugins.Buttons.openfolder,
                                        onClick: () => {
                                            shell.openPath(AddonManager.plugins.folder);
                                        },
                                    }),
                                React.createElement(FilterButton),
                            ],
                        }),
                ],
            }),
            tab === 0
                ? React.createElement("div", {
                      id: "velocity-addons-grid",
                      children: [
                          filterItems(AddonManager.plugins.getAll()).map((plugin) => {
                              return React.createElement(Card, {
                                  meta: plugin,
                                  type: "plugins",
                              });
                          }),
                          filterItems(AddonManager.plugins.getAll()).length < 1 &&
                              React.createElement(EmptyStateImage, {
                                  height: 200,
                                  width: 415,
                                  darkSrc: "/assets/b669713872b43ca42333264abf9c858e.svg",
                                  lightSrc: "/assets/c84361b810ca7c10d6e8ddb6ea722ebe.svg",
                                  style: { flex: "none", marginInline: "auto" },
                              }),
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
                          filterItems(STORE_PLUGINS).map((plugin) => {
                              return React.createElement(StoreCard, {
                                  meta: plugin,
                                  type: "plugins",
                              });
                          }),
                          filterItems(STORE_PLUGINS).length < 1 &&
                              React.createElement(EmptyStateImage, {
                                  height: 200,
                                  width: 415,
                                  darkSrc: "/assets/b669713872b43ca42333264abf9c858e.svg",
                                  lightSrc: "/assets/c84361b810ca7c10d6e8ddb6ea722ebe.svg",
                                  style: { flex: "none", marginInline: "auto" },
                              }),
                      ],
                  }),
        ];
    }
};
