/**
 * @type {Api}
 */
const VApi = window.VApi;

const { WebpackModules, React, Logger, DataStore, showConfirmationModal } = VApi;
const { useState, useEffect } = React;
const StyleManager = require("../../styleParser");

const monaco = global.windowObj.monaco;
const Settings = DataStore("VELOCITY_SETTINGS");

let activeIndex = 0;

const importRemoteModule = async (modulePath) => {
    return eval(await (await fetch(modulePath)).text());
};

function useForceUpdate() {
    const [value, setValue] = useState(false);
    return () => setValue((value) => !value);
}

const PanelButton = WebpackModules.find("PanelButton").default;
const Tooltip = WebpackModules.find("Tooltip").default;
const Text = WebpackModules.find("LegacyText").default;
const Interactive = WebpackModules.find("Interactive").default;
const Clickable = WebpackModules.find("Clickable").default;
const TextInput = WebpackModules.find("TextInput").default;
const SingleSelect = WebpackModules.find("Select").SingleSelect;
const FormItem = WebpackModules.find("FormItem").default;
const FormDivider = WebpackModules.find("FormDivider").default;
const Gear = WebpackModules.find("Gear").default;
const Trash = WebpackModules.find("Trash").default;
const Plus = WebpackModules.find("Plus").default;

let fontsize = Settings.FontSize || 14;
if (fontsize > 14) {
    fontsize = 14;
    Settings.FontSize = 14;
}
if (fontsize < 2) {
    fontsize = 2;
    Settings.FontSize = 2;
}

class MonacoEditor extends React.Component {
    constructor(props) {
        super(props);

        this.props = props;
    }
    componentWillUnmount() {
        this.props.onUnload?.();
    }
    componentDidMount() {
        this.props.onLoad?.();
    }
    render() {
        return React.createElement("div", {
            className: "velocity-editor-body-monaco",
        });
    }
}

let CSSTabsToRender = Settings.CSSTabs;
let JSTabsToRender = Settings.JSTabs;

if (CSSTabsToRender === null || CSSTabsToRender === undefined) {
    Settings.CSSTabs = [];
    CSSTabsToRender = Settings.CSSTabs;
}

if (JSTabsToRender === null || JSTabsToRender === undefined) {
    Settings.JSTabs = [];
    JSTabsToRender = Settings.JSTabs;
}

const updateTabsInSettings = () => {
    Settings.CSSTabs = CSSTabsToRender;
    Settings.JSTabs = JSTabsToRender;
};

module.exports = function Editor(props) {
    const { type } = props;

    const [active, setActive] = useState(activeIndex);

    const forceUpdate = useForceUpdate();

    if (type == "customcss")
        return React.createElement("div", {
            className: "velocity-editor css",
            children: [
                React.createElement("div", {
                    className: "velocity-editor-header",
                    children: [
                        React.createElement("div", {
                            className: "velocity-editor-header-title",
                            children: [
                                React.createElement(PanelButton, {
                                    tooltipText: "New Tab",
                                    icon: Plus,
                                    onClick: () => {
                                        let newTab = {
                                            name: "newFile",
                                            content: "",
                                            ext: "css",
                                        };
                                        showConfirmationModal(
                                            "New Tab",
                                            [
                                                "Creating new tab, please fill in the following details:",
                                                React.createElement(FormItem, {
                                                    title: "Tab Name (newTab)",
                                                    children: React.createElement(TextInput, {
                                                        placeholder: "newTab",
                                                        onChange: (e) => {
                                                            newTab.name = e;
                                                        },
                                                    }),
                                                }),
                                                React.createElement(FormDivider, { style: { marginBlock: "10px" } }),
                                                React.createElement(FormItem, {
                                                    title: "Tab Format (css)",
                                                    children: (window.dropdown = React.createElement(SingleSelect, {
                                                        disabled: true,
                                                        options: [
                                                            {
                                                                label: "CSS",
                                                                value: 0,
                                                            },
                                                            // {
                                                            //     label: "SCSS",
                                                            //     value: 1,
                                                            // },
                                                        ],
                                                        defaultValue: 0,
                                                        onChange: (e) => {
                                                            try {
                                                                window.dropdown.props.value = e === 0 ? "css" : "scss";
                                                                newTab.ext = e === 0 ? "css" : "scss";
                                                                // window.dropdown.forceUpdate();
                                                            } catch (error) {
                                                                Logger.error(error);
                                                            }
                                                        },
                                                    })),
                                                }),
                                            ],
                                            {
                                                confirmText: "Create",
                                                onConfirm: () => {
                                                    CSSTabsToRender.push(newTab);
                                                    updateTabsInSettings();
                                                    forceUpdate();
                                                },
                                            }
                                        );
                                    },
                                }),
                                React.createElement(
                                    Text,
                                    {
                                        size: Text.Sizes.SIZE_14,
                                        className: `velocity-editor-header-title-text ${WebpackModules.find(["h1"]).h2}`,
                                    },
                                    CSSTabsToRender[active]?.name || "No Active Tab"
                                ),
                            ],
                        }),
                        React.createElement(PanelButton, {
                            tooltipText: "Clear",
                            icon: Trash,
                            iconClassName: "velocity-editor-header-clear",
                            onClick: () => {
                                CSSTabsToRender[active].content = "";
                                window.editor.setValue("");
                                updateTabsInSettings();
                            },
                        }),
                    ],
                }),
                React.createElement("div", {
                    className: "velocity-editor-body",
                    children: [
                        React.createElement("div", {
                            className: "velocity-editor-body-sidebar",
                            children: CSSTabsToRender[0]
                                ? CSSTabsToRender.map((props) => {
                                      const { name = "", ext = "" } = props;

                                      const index = CSSTabsToRender.indexOf(props);

                                      const Tab = React.createElement(Interactive, {
                                          selected: !!(active === index),
                                          className: `velocity-editor-body-sidebar-item ${active === index ? "selected" : ""}`,
                                          index: index,
                                          children: [
                                              React.createElement(
                                                  "div",
                                                  {
                                                      className: "velocity-editor-body-sidebar-item-text",
                                                  },
                                                  `${name}.${ext}`
                                              ),
                                              React.createElement(Tooltip, {
                                                  text: "Delete Tab",
                                                  children: (p) =>
                                                      React.createElement(Clickable, {
                                                          ...p,
                                                          onClick: () => {
                                                              showConfirmationModal(
                                                                  "Delete Tab",

                                                                  "Are you sure you want to delete this tab?",

                                                                  {
                                                                      confirmText: "Delete",
                                                                      danger: true,
                                                                      onConfirm: () => {
                                                                          try {
                                                                              CSSTabsToRender = CSSTabsToRender.filter((m) => {
                                                                                  return m !== props;
                                                                              });
                                                                              updateTabsInSettings();
                                                                              forceUpdate();
                                                                          } catch (error) {
                                                                              Logger.error(error);
                                                                          }
                                                                      },
                                                                  }
                                                              );
                                                          },
                                                          children: React.createElement(Trash, {
                                                              width: 12,
                                                              height: 12,
                                                          }),
                                                          className: "velocity-editor-body-sidebar-item-options",
                                                      }),
                                              }),
                                          ],
                                          onClick: () => {
                                              setActive(index);
                                              activeIndex = index;
                                              forceUpdate();

                                              window.editor.setValue(CSSTabsToRender[index].content);
                                          },
                                      });
                                      return Tab;
                                  })
                                : React.createElement(
                                      Text,
                                      {
                                          size: Text.Sizes.SIZE_12,
                                          className: `velocity-editor-body-sidebar-text`,
                                      },
                                      "No Tabs :("
                                  ),
                        }),
                        (window.editorComponent = React.createElement(MonacoEditor, {
                            onUnload: () => {
                                activeIndex = 0;
                            },
                            onLoad: () => {
                                window.editor = monaco.editor.create(document.querySelector(".velocity-editor-body-monaco"), {
                                    language: "css",
                                    theme: document.documentElement.classList.contains("theme-dark") ? "vs-dark" : "vs-light",
                                    value: CSSTabsToRender[activeIndex]?.content || "/* Add a tab and start coding! */",
                                    fontSize: fontsize,
                                });
                                window.editor.onDidChangeModelContent((e) => {
                                    if (CSSTabsToRender[activeIndex]) {
                                        if (e.changes?.[0]?.forceMoveMarkers !== false) return;
                                        const value = window.editor.getValue();
                                        CSSTabsToRender[activeIndex].content = value;
                                        updateTabsInSettings();

                                        const cssBeta = DataStore("VELOCITY_SETTINGS").CSSFeatures;

                                        const currentCustomCSSInjected = document.querySelectorAll(`[id*="customcss-tab-"]`);
                                        currentCustomCSSInjected.forEach((el) => {
                                            el.remove();
                                        });

                                        let index = 0;
                                        CSSTabsToRender.forEach((css) => {
                                            var style = document.createElement("style");
                                            style.innerText = cssBeta ? StyleManager.parse(css.content) : css.content;
                                            style.id = `customcss-tab-${index}`;
                                            document.querySelector("velocity-head").appendChild(style);

                                            index++;
                                        });
                                    }
                                });
                            },
                        })),
                    ],
                }),
            ],
        });
    else if (type == "startupjs")
        return React.createElement("div", {
            className: "velocity-editor js",
            children: [
                React.createElement("div", {
                    className: "velocity-editor-header",
                    children: [
                        React.createElement("div", {
                            className: "velocity-editor-header-title",
                            children: [
                                React.createElement(PanelButton, {
                                    tooltipText: "New Tab",
                                    icon: Plus,
                                    onClick: () => {
                                        let newTab = {
                                            name: "newFile",
                                            content: "",
                                            ext: "js",
                                        };
                                        showConfirmationModal(
                                            "New Tab",
                                            [
                                                "Creating new tab, please fill in the following details:",
                                                React.createElement(FormItem, {
                                                    title: "Tab Name (newTab)",
                                                    children: React.createElement(TextInput, {
                                                        placeholder: "newTab",
                                                        onChange: (e) => {
                                                            newTab.name = e;
                                                        },
                                                    }),
                                                }),
                                                React.createElement(FormDivider, { style: { marginBlock: "10px" } }),
                                                React.createElement(FormItem, {
                                                    title: "Tab Format (js)",
                                                    children: (window.dropdown = React.createElement(SingleSelect, {
                                                        disabled: true,
                                                        options: [
                                                            {
                                                                label: "JS",
                                                                value: 0,
                                                            },
                                                            // {
                                                            //     label: "JSX",
                                                            //     value: 1,
                                                            // },
                                                        ],
                                                        defaultValue: 0,
                                                        onChange: (e) => {
                                                            try {
                                                                window.dropdown.props.value = e === 0 ? "js" : "jsx";
                                                                newTab.ext = e === 0 ? "js" : "jsx";
                                                                // window.dropdown.forceUpdate();
                                                            } catch (error) {
                                                                Logger.error(error);
                                                            }
                                                        },
                                                    })),
                                                }),
                                            ],
                                            {
                                                confirmText: "Create",
                                                onConfirm: () => {
                                                    JSTabsToRender.push(newTab);
                                                    updateTabsInSettings();
                                                    forceUpdate();
                                                },
                                            }
                                        );
                                    },
                                }),
                                React.createElement(
                                    Text,
                                    {
                                        size: Text.Sizes.SIZE_14,
                                        className: `velocity-editor-header-title-text ${WebpackModules.find(["h1"]).h2}`,
                                    },
                                    JSTabsToRender[active]?.name || "No Active Tab"
                                ),
                            ],
                        }),
                        React.createElement(PanelButton, {
                            tooltipText: "Clear",
                            icon: Trash,
                            iconClassName: "velocity-editor-header-clear",
                            onClick: () => {
                                JSTabsToRender[active].content = "";
                                window.editor.setValue("");
                                updateTabsInSettings();
                            },
                        }),
                    ],
                }),
                React.createElement("div", {
                    className: "velocity-editor-body",
                    children: [
                        React.createElement("div", {
                            className: "velocity-editor-body-sidebar",
                            children: JSTabsToRender[0]
                                ? JSTabsToRender.map((props) => {
                                      const { name = "", ext = "" } = props;

                                      const index = JSTabsToRender.indexOf(props);

                                      const Tab = React.createElement(Interactive, {
                                          selected: !!(active === index),
                                          className: `velocity-editor-body-sidebar-item ${active === index ? "selected" : ""}`,
                                          index: index,
                                          children: [
                                              React.createElement(
                                                  "div",
                                                  {
                                                      className: "velocity-editor-body-sidebar-item-text",
                                                  },
                                                  `${name}.${ext}`
                                              ),
                                              React.createElement(Tooltip, {
                                                  text: "Delete Tab",
                                                  children: (p) =>
                                                      React.createElement(Clickable, {
                                                          ...p,
                                                          onClick: () => {
                                                              showConfirmationModal(
                                                                  "Delete Tab",

                                                                  "Are you sure you want to delete this tab?",

                                                                  {
                                                                      confirmText: "Delete",
                                                                      danger: true,
                                                                      onConfirm: () => {
                                                                          try {
                                                                              JSTabsToRender = JSTabsToRender.filter((m) => {
                                                                                  return m !== props;
                                                                              });
                                                                              updateTabsInSettings();
                                                                              forceUpdate();
                                                                          } catch (error) {
                                                                              Logger.error(error);
                                                                          }
                                                                      },
                                                                  }
                                                              );
                                                          },
                                                          children: React.createElement(Trash, {
                                                              width: 12,
                                                              height: 12,
                                                          }),
                                                          className: "velocity-editor-body-sidebar-item-options",
                                                      }),
                                              }),
                                          ],
                                          onClick: () => {
                                              setActive(index);
                                              activeIndex = index;
                                              forceUpdate();

                                              window.editor.setValue(JSTabsToRender[index].content);
                                              monaco.editor.setModelLanguage(
                                                  window.editor.getModel(),
                                                  JSTabsToRender[activeIndex]?.content?.includes("@ts-check") ? "typescript" : "javascript"
                                              );
                                          },
                                      });
                                      return Tab;
                                  })
                                : React.createElement(
                                      Text,
                                      {
                                          size: Text.Sizes.SIZE_12,
                                          className: `velocity-editor-body-sidebar-text`,
                                      },
                                      "No Tabs :("
                                  ),
                        }),
                        (window.editorComponent = React.createElement(MonacoEditor, {
                            onUnload: () => {
                                activeIndex = 0;
                            },
                            onLoad: () => {
                                window.editor = monaco.editor.create(document.querySelector(".velocity-editor-body-monaco"), {
                                    language: JSTabsToRender[activeIndex]?.content?.includes("@ts-check") ? "typescript" : "javascript",
                                    theme: document.documentElement.classList.contains("theme-dark") ? "vs-dark" : "vs-light",
                                    value: JSTabsToRender[activeIndex]?.content || "/* Add a tab and start coding! */",
                                    fontSize: fontsize,
                                });
                                window.editor.onDidChangeModelContent((e) => {
                                    if (JSTabsToRender[activeIndex]) {
                                        if (e.changes?.[0]?.forceMoveMarkers !== false) return;
                                        const value = window.editor.getValue();
                                        JSTabsToRender[activeIndex].content = value;
                                        monaco.editor.setModelLanguage(
                                            window.editor.getModel(),
                                            JSTabsToRender[activeIndex]?.content?.includes("@ts-check") ? "typescript" : "javascript"
                                        );
                                        updateTabsInSettings();
                                    }
                                });
                            },
                        })),
                    ],
                }),
            ],
        });
    return null;
};
