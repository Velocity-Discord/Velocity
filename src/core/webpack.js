const { webFrame } = require("electron");
const logger = require("./logger");

const { webpackChunkdiscord_app } = webFrame.top.context;

// REMINDER: Do not blacklist _modules
const Blacklisted = ["setToken", "getToken", "showToken", "removeToken", "hideToken", "getEmail"];

if (Boolean(webpackChunkdiscord_app.Velocity_getModule)) module.exports = webpackChunkdiscord_app.Velocity_getModule;
else {
    const webpackExports = webpackChunkdiscord_app.push([[Symbol("Velocity")], {}, (e) => e]);

    function getModule(filter, first = true) {
        let modules = [];
        for (let ite in webpackExports.c) {
            if (!Object.hasOwnProperty.call(webpackExports.c, ite)) return;
            let ele = webpackExports.c[ite].exports;
            if (!ele) continue;
            if (filter(ele)) modules.push(ele);
        }
        let safeExports = [];
        modules.forEach((ite) => {
            if (typeof ite !== "object") {
                return safeExports.push(ite);
            }
            const isFlagged = Blacklisted.some((m) => {
                return Boolean(ite[m] || ite.default?.[m]);
            });
            if (isFlagged) {
                if (ite.default) {
                    return safeExports.push(
                        new Proxy(ite.default, {
                            get: (t, p, r) => {
                                try {
                                    let shadow = undefined;
                                    if (t[p]) shadow = new t[p].constructor();

                                    if (Blacklisted.includes(p)) return shadow;
                                    return Reflect.get(t, p, r);
                                } catch (e) {
                                    return Reflect.get(t, p, r);
                                }
                            },
                            getOwnPropertyDescriptor: (t, p, r) => {
                                if (Blacklisted.includes(p)) return undefined;
                                return Reflect.getOwnPropertyDescriptor(t, p, r);
                            },
                        })
                    );
                }
                return safeExports.push(
                    new Proxy(ite, {
                        get: (t, p, r) => {
                            try {
                                let shadow = undefined;
                                if (t[p]) shadow = new t[p].constructor();

                                if (Blacklisted.includes(p)) return shadow;
                                return Reflect.get(t, p, r);
                            } catch (e) {
                                return Reflect.get(t, p, r);
                            }
                        },
                        getOwnPropertyDescriptor: (t, p, r) => {
                            if (Blacklisted.includes(p)) return undefined;
                            return Reflect.getOwnPropertyDescriptor(t, p, r);
                        },
                    })
                );
            }
            return safeExports.push(ite);
        });

        if (first) return safeExports[0];
        return safeExports;
    }

    function find(filter) {
        if (typeof filter === "string") return byDisplayName(filter);
        if (typeof filter === "number") return webpackExports.c[filter];
        if (Array.isArray(filter)) return byProps(...filter);
        return getModule(filter, true);
    }

    function byProps(...props) {
        return getModule((m) => props.every((prop) => typeof m[prop] !== "undefined")) || byPropsDefault(props);
    }
    function byPropsDefault([...props]) {
        return getModule((m) => props.every((prop) => typeof m.default?.[prop] !== "undefined"))?.default;
    }

    function byPropsAll(...props) {
        const norm = getModule((m) => props.every((prop) => typeof m[prop] !== "undefined"), false);
        const def = byPropsDefaultAll(props);
        return [...norm, ...def];
    }
    function byPropsDefaultAll([...props]) {
        return getModule((m) => props.every((prop) => typeof m.default?.[prop] !== "undefined"), false);
    }

    let listeners = new Set();

    function addListener(listener) {
        listeners.add(listener);
        return removeListener.bind(this, listener);
    }

    function removeListener(listener) {
        return listeners.delete(listener);
    }

    function getLazy(filter) {
        const fromCache = getModule(filter);
        if (fromCache) return Promise.resolve(fromCache);

        return new Promise((resolve) => {
            const cancel = () => {
                removeListener(listener);
            };
            const listener = function (m) {
                const directMatch = filter(m);

                if (directMatch) {
                    cancel();
                    return resolve(directMatch);
                }

                const defaultMatch = filter(m.default);
                if (!defaultMatch) return;

                cancel();
                resolve(m.default);
            };

            addListener(listener);
        });
    }

    Object.assign(byPropsAll, {
        default: byPropsDefaultAll,
    });
    Object.assign(byProps, {
        default: byPropsDefault,
        all: byPropsAll,
    });

    function byPrototypes(...protos) {
        return getModule((m) => protos.every((proto) => typeof m?.default?.prototype?.[proto] !== "undefined"));
    }
    Object.assign(byPrototypes, {
        all: (...protos) => getModule((m) => protos.every((proto) => typeof m?.default?.prototype?.[proto] !== "undefined"), false),
    });

    function byDisplayName(displayName) {
        return getModule((m) => m.default?.displayName === displayName) || byDisplayNameType(displayName) || byDisplayNameTypeRender(displayName);
    }
    function byDisplayNameDefault(displayName) {
        return getModule((m) => m.default?.displayName === displayName)?.default;
    }
    function byDisplayNameType(displayName) {
        return getModule((m) => m.default?.type?.displayName === displayName);
    }
    function byDisplayNameTypeRender(displayName) {
        return getModule((m) => m.default?.type?.render?.displayName === displayName);
    }
    function findAll(filter) {
        return getModule(filter, false);
    }
    Object.assign(byDisplayName, {
        type: byDisplayNameType,
        typeRender: byDisplayNameTypeRender,
    });

    Object.assign(find, {
        displayName: byDisplayName,
        props: byProps,
        prototypes: byPrototypes,
        all: (filter) => getModule(filter, false),
        getId: (module) => find.exports((m) => m === module || m.default === module)?.[0]?.id,
        webpackExports,
        exports: (filter, first = false) => {
            let modules = [];
            for (let ite in webpackExports.c) {
                if (!Object.hasOwnProperty.call(webpackExports.c, ite)) return;
                let ele = webpackExports.c[ite];
                if (!ele) continue;
                if (filter(ele)) modules.push(ele);
            }
            if (first) return modules[0];
            return modules;
        },
        byName: (name) => {
            return find.all((m) => {
                if (!m) return;
                if (typeof name === "string") name = name.toLowerCase();
                return Object.keys(m).some((n) => n && n.toLowerCase().search(name) > -1);
            });
        },
    });
    webpackChunkdiscord_app.Velocity_getModule = { find, getLazy };
    module.exports = {
        find,
        findAll,
        getLazy,
        findByDisplayName: byDisplayName,
        findByDisplayNameDefault: byDisplayNameDefault,
        findByProps: byProps,
        findByPropsDefault: byPropsDefault,
    };
}
