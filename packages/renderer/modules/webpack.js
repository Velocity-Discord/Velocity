// partially modified from https://github.com/kernel-addons/webpack

import { sleep } from "../util/time";
import logger from "../util/logger";

const Logger = new logger("Webpack");

const chunkName = "webpackChunkdiscord_app";

const globalPromise = new Promise(async (resolve) => {
    while (!window[chunkName]) await sleep(1);

    resolve();
});

const Filters = {
    byDisplayName: (name) => {
        return (m) => m.default?.displayName === name;
    },
    byProps: (...props) => {
        return (m) => {
            const topLevel = props.every((prop) => typeof m[prop] !== "undefined");
            if (topLevel) return true;
            const _default = props.every((prop) => {
                return typeof m.default?.[prop] !== "undefined" || typeof m.Z?.[prop] !== "undefined" || typeof m.ZP?.[prop] !== "undefined";
            });
            if (_default) return true;
        };
    },
    byPrototypeFields: (fields) => {
        return (m) => {
            const topLevel = fields.every((field) => typeof m.prototype?.[field] !== "undefined");
            if (topLevel) return true;
            const _default = fields.every((field) => {
                return typeof m.default?.prototype?.[field] !== "undefined" || typeof m.Z?.prototype?.[field] !== "undefined" || typeof m.ZP?.prototype?.[field] !== "undefined";
            });
            if (_default) return true;
        };
    },
    byStrings: (...strings) => {
        return (m) => {
            Object.keys(m).forEach((k) => {
                return strings.every((s) => m[k].toString().includes(s));
            });
        };
    },
    byPrototypeStrings(field, ...strings) {
        return (m) => {
            const topLevel = strings.every((str) => m.prototype?.[field]?.toString().includes(str));
            if (topLevel) return true;
            const _default = strings.every((str) => {
                return m.default?.prototype?.[field]?.toString().includes(str) || m.Z?.prototype?.[field]?.toString().includes(str) || m.ZP?.prototype?.[field]?.toString().includes(str);
            });
            if (_default) return true;
        };
    },
    byAllPrototypeStrings(...strings) {
        return (m) => {
            Object.keys(m.prototype).forEach((field) => {
                return strings.every((str) => m.prototype?.[field]?.toString().includes(str));
            });
        };
    },
};

let __webpack_require__ = undefined;

const webpackRequire = () => {
    if (__webpack_require__) return __webpack_require__;

    __webpack_require__ = window[chunkName].push([[Symbol("Velocity")], {}, (e) => e]);

    return __webpack_require__;
};

const mapped = [];

const remapDefaults = () => {
    const __webpack_require__ = webpackRequire();

    let c = 0;

    for (const ite in __webpack_require__.c) {
        if (mapped.includes(ite)) continue;
        if (!Object.hasOwnProperty.call(__webpack_require__.c, ite)) return;
        let ele = __webpack_require__.c[ite].exports;
        if (!ele) continue;
        if (ele.default) continue;

        ["Z", "ZP"].forEach((key) => {
            if (ele[key]) {
                ele.default = ele[key];
                c++;
            }
        });

        mapped.push(ite);
    }

    Logger.log(`Remapped ${c} default exports`);
};

const findModule = (filter, all = false) => {
    let errorThrown = false;

    switch (typeof filter) {
        case "string":
            filter = Filters.byDisplayName(filter);
            break;
        case "object":
            if (Array.isArray(filter)) {
                filter = Filters.byProps(...filter);
            }
            break;
    }

    const __webpack_require__ = webpackRequire();

    let modules = [];

    for (let ite in __webpack_require__.c) {
        if (!Object.hasOwnProperty.call(__webpack_require__.c, ite)) return;
        let ele = __webpack_require__.c[ite].exports;
        if (ele === window) continue;
        if (!ele) continue;

        if ((ele.Z || ele.ZP) && !ele.default) {
            remapDefaults();
        }

        try {
            if (filter(ele)) modules.push(ele);
        } catch (e) {
            errorThrown = e;
        }
    }

    if (errorThrown) Logger.warn("Filter threw an error:", errorThrown);

    return all ? modules : modules[0];
};

const waitFor = async (filter, all = false) => {
    while (!webpackRequire()) await sleep(1);
    while (!findModule(filter, all)) await sleep(1);
    return findModule(filter, all);
};

let common = {};

globalPromise.then(async () => {
    const _ModalElements = await waitFor((m) => {
        for (const k of Object.keys(m)) {
            if (m[k]?.DYNAMIC) return true;
        }
    });

    const _ModalActions = await waitFor((m) => {
        for (const k of Object.keys(m)) {
            if (!m[k]) continue;
            if (typeof m[k].toString !== "function") continue;
            if (m[k].toString().includes("onCloseCallback()")) return true;
        }
    });

    const _ButtonModules = await waitFor((m) => {
        for (const k of Object.keys(m)) {
            if (!m[k]) continue;
            if (typeof m[k].toString !== "function") continue;
            if (m[k].toString().includes("borderColor") && m[k].toString().includes("e.grow")) return true;
        }
    });

    const _FormModules = await waitFor((m) => {
        if (m.default) return false;

        for (const k of Object.keys(m)) {
            if (!m[k]) continue;
            if (typeof m[k].toString !== "function") continue;
            if (m[k].toString().includes("().divider") && m[k].toString().includes("className")) return true;
        }
    });

    const _FormModulesAgain = await waitFor((m) => {
        if (m.default) return false;

        for (const k of Object.keys(m)) {
            if (!m[k]) continue;
            if (typeof m[k].toString !== "function") continue;
            if (m[k].toString().includes("sortedMarkers") && m[k].toString().includes("moveGrabber")) return true;
        }
    });

    const _ColorPickerModules = await waitFor((m) => m.default?.toString().includes("customColor"));

    const ContextMenuActions = {};

    findModule((m) => {
        let matched = false;

        for (const func of Object.values(m)) {
            if (typeof func !== "function") continue;

            if (func.toString().includes("CONTEXT_MENU_CLOSE")) {
                ContextMenuActions.closeContextMenu = func;
                matched = true;
            } else if (matched && func.toString().includes("renderLazy")) {
                ContextMenuActions.openContextMenu = func;
                matched = true;
            }
        }

        return matched;
    });

    common = {
        get Dispatcher() {
            return findModule(["dispatch", "isDispatching"]).default;
        },
        get React() {
            return findModule(["createElement", "useEffect"]);
        },
        get ReactDOM() {
            return findModule(["render", "hydrate"]);
        },
        get ReactSpring() {
            return findModule(["useSpring", "animated"]);
        },
        Stores: {
            get MessageStore() {
                return findModule(["getMessage", "getMessages"]).default;
            },
            get SelectedGuildStore() {
                return findModule(["getLastSelectedGuildId"]).default;
            },
            get SelectedChannelStore() {
                return findModule(["getLastSelectedChannelId"]).default;
            },
            get UserStore() {
                return findModule(["getCurrentUser"]).default;
            },
            get RelationshipStore() {
                return findModule(["isBlocked"]).default;
            },
            get GuildStore() {
                return findModule(["getGuild"]).default;
            },
            get GuildMemberStore() {
                return findModule(["getMember"]).default;
            },
            get ChannelStore() {
                return findModule(["hasChannel"]).default;
            },
            get InviteStore() {
                return findModule(["getInvites"]).default;
            },
        },
        Components: {
            _FormModules,
            _FormModulesAgain,
            get FormText() {
                return findModule((m) => m.default?.Sizes?.SIZE_32 && m.default?.Colors);
            },
            get FormDivider() {
                return Object.values(_FormModules).find((k) => k?.toString().includes("divider"));
            },
            get TextInput() {
                return findModule((m) => {
                    for (const i of Object.values(m)) {
                        if (i.Sizes?.MINI && i.defaultProps) return true;
                    }
                });
            },
            get Slider() {
                return Object.values(_FormModulesAgain).find((k) => k?.toString?.().includes("moveGrabber") && k?.toString?.().includes("sortedMarkers"));
            },
            get SwitchItem() {
                return Object.values(_FormModulesAgain).find((k) => k?.toString?.().includes("e.note") && k?.toString?.().includes("focusTarget"));
            },
            get Popout() {
                return findModule((m) => m.default?.prototype?.render?.toString().includes("shouldShowPopout"));
            },
            get ConfirmModal() {
                return findModule((m) => m.default?.toString().includes("confirmText"));
            },
            get TooltipContainer() {
                return findModule((m) => m.default?.toString().includes("shouldShowTooltip") && m.default?.Positions);
            },
            ButtonModules: {
                _ButtonModules,
                get default() {
                    return Object.values(_ButtonModules).find((m) => m.toString().includes("borderColor") && m.toString().includes("e.grow"));
                },
                get ButtonColors() {
                    return Object.values(_ButtonModules).find((m) => m.BRAND_NEW);
                },
                get ButtonLooks() {
                    return Object.values(_ButtonModules).find((m) => m.FILLED);
                },
                get ButtonSizes() {
                    return Object.values(_ButtonModules).find((m) => m.TINY);
                },
            },
            ColorPickerModules: {
                _ColorPickerModules,
                get default() {
                    return _ColorPickerModules.default;
                },
            },
            get CustomColorPicker() {
                return Object.values(_ColorPickerModules).find((m) => typeof m === "object");
            },
            get CustomColorButton() {
                return Object.values(_ColorPickerModules).find((m) => m.prototype?.render?.toString().includes("customColor") && m.prototype?.render?.toString().includes("isCustom"));
            },
            get DefaultColorButton() {
                return Object.values(_ColorPickerModules).find((m) => m.prototype?.render?.toString().includes("isDefault"));
            },
            get PanelButton() {
                return findModule((m) => m.default?.toString().includes("onContextMenu") && m.default?.toString().includes("tooltipText"));
            },
            get Anchor() {
                return findModule((m) => m.P3?.contextType && m.P3?.defaultProps && m.P3?.prototype?.renderNonInteractive);
            },
            get Markdown() {
                return findModule((m) => m.default?.rules && m.default?.defaultProps?.parser);
            },
            get Text() {
                return findModule((m) => m.default?.Sizes?.SIZE_10);
            },

            ModalElements: {
                _ModalElements,
                get ModalHeader() {
                    return Object.values(_ModalElements).find((m) => m.toString().includes("wrap") && m.toString().includes("header"));
                },
                get ModalFooter() {
                    return Object.values(_ModalElements).find((m) => m.toString().includes("wrap") && m.toString().includes("footer"));
                },
                get ModalRoot() {
                    return Object.values(_ModalElements).find((m) => m.toString().includes("size") && m.toString().includes("dialog"));
                },
                get ModalContent() {
                    return Object.values(_ModalElements).find((m) => m.toString().includes("scrollerRef") && m.toString().includes("content"));
                },
                get CloseButton() {
                    return Object.values(_ModalElements).find((m) => m.toString().includes("BLANK") && m.toString().includes("withCircleBackground"));
                },
            },
            get EmptyState() {
                return findModule(
                    (m) => m.default?.toString().includes("onCTAClick") && m.default?.toString().includes("description") && m.default?.toString().includes("artURL") && !m.default?.toString().includes("stream")
                );
            },
            get Alert() {
                return findModule(
                    (m) => m.default?.toString().includes("title") && m.default?.toString().includes("body") && m.default?.toString().includes("secondaryConfirmText") && !m.default?.toString().includes("DONT_ASK_AGAIN")
                );
            },
        },
        Constants: {},
        Icons: {
            get Pin() {
                return findModule((m) => m.default?.toString().includes("M22 12L12.101 2.10101L10.686 3.51401L12.101"));
            },
            get Gear() {
                return findModule((m) => m.default?.toString().includes("M14 7V9C14 9 12.5867 9 12.5733 9.00667C12.42 9.58667 12.1733 10.1267 11.84 10.6067L12.74 11.5067L11"));
            },
            get Plus() {
                return findModule((m) => m.default?.toString().includes("15 10 10 10 10 15 8 15 8 1"));
            },
            get Pencil() {
                return findModule((m) => m.default?.toString().includes("M19.2929 9.8299L19.9409 9.18278C21.353"));
            },
            get Play() {
                return findModule((m) => m.default?.toString().includes("0 0 0 14 11 7"));
            },
            get Trash() {
                return findModule((m) => m.default?.toString().includes("M15 3.999V2H9V3.999H3V5.999H21V3.999H15Z"));
            },
            get Rocket() {
                return findModule((m) => m.default?.toString().includes("M4.92871 13.4149L10.5857 19.0709L18.363"));
            },
            get Link() {
                return findModule((m) => m.default?.toString().includes("M10.59 13.41c.41.39.41 1.03 0 1.42-.39.39-1.0"));
            },
            get PersonAdd() {
                return findModule((m) => m.default?.toString().includes("M6.5 8.00667C7.88 8.00667 9 6.88667 9 5.50667C9 4.12667 7.88 3.00667 6.5 3.00667C5.12 3.00667 4 4.12667 4 5.50667C4 6.88667 5.12 8.00667"));
            },
            get Upload() {
                return findModule((m) => m.default?.toString().includes("M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v"));
            },
            get Search() {
                return findModule((m) => m.default?.toString().includes("M21.707 20.293L16.314 14.9C17.403 13.504 18 11.79"));
            },
            get Folder() {
                return findModule((m) => m.default?.toString().includes("M20 7H12L10.553 5.106C10.214 4.428 9"));
            },
            get Retry() {
                return findModule((m) => m.default?.toString().includes("M12 2C6.485 2 2 6.485 2 12H5.33333C5.33333 8.32"));
            },
            get Overflow() {
                return findModule((m) => m.default?.toString().includes("M7 12.001C7 10.8964 6.10457 10.001 5 10.001C3.89543 10.001 3 10.8964"));
            },
        },
        Classes: {
            get Anchor() {
                return findModule(["anchorUnderlineOnHover"]);
            },
            get ContextMenu() {
                return findModule(["menu", "iconContainer"]);
            },
            get Titles() {
                return findModule(["h1", "h2"]);
            },
            get RadioItems() {
                return findModule(["item", "collapsibleItem"]);
            },
            get Position() {
                return findModule(["directionRow"]);
            },
        },
        Actions: {
            ContextMenuActions,
            ModalActions: {
                _ModalActions,
                get openModal() {
                    return Object.values(_ModalActions).find((m) => m?.toString()?.includes("onCloseCallback") && m?.toString()?.includes("Layer"));
                },
                get closeModal() {
                    return Object.values(_ModalActions).find((m) => m?.toString()?.includes("onCloseCallback()"));
                },
            },
            get Invites() {
                return findModule(["acceptInvite"]).default;
            },
        },
    };
});

export default {
    chunkName,
    Filters,

    globalPromise,

    findModule,
    waitFor,
    remapDefaults,

    find: findModule,
    findByDisplayName: (name) => findModule(Filters.byDisplayName(name)),
    findByProps: (...props) => findModule(Filters.byProps(...props)),
    findByPrototypes: (...props) => findModule(Filters.byPrototypeFields(props)),

    get __ORIGINAL_CHUNKS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED() {
        return window[chunkName];
    },
    get summon() {
        return __webpack_require__;
    },
    get common() {
        return common;
    },
};
