const { webFrame } = require("electron");

const { webpackChunkdiscord_app } = webFrame.top.context;

if (Boolean(webpackChunkdiscord_app.Velocity_getModule)) module.exports = webpackChunkdiscord_app.Velocity_getModule;
else {
    const webpackExports = webpackChunkdiscord_app.push([[Symbol("Velocity")], {}, (e) => e]);

    /**
     * @name getModule
     * @description Gets the module from the webpack exports.
     * @param {Function} filter
     * @param {boolean} first
     * @returns {any}
     */

    function getModule(filter, first = true) {
        let modules = [];
        for (let ite in webpackExports.c) {
            if (!Object.hasOwnProperty.call(webpackExports.c, ite)) return;
            let ele = webpackExports.c[ite].exports;
            if (!ele) continue;
            if (filter(ele)) modules.push(ele);
        }
        if (first) return modules[0];
        return modules;
    }

    /**
     * @name find
     * @description Uses getModule to get the module.
     * @param {Function|Array|String} filter
     * @returns {any}
     */

    function find(filter) {
        if (typeof filter === "string") return byDisplayName(filter);
        if (typeof filter === "number") return webpackExports.c[filter];
        if (Array.isArray(filter)) return byProps(...filter);
        return getModule(filter, true);
    }

    /**
     * @name byProps
     * @description Uses properties to find the module.
     * @param {Array} properties
     * @returns {any}
     */

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

    Object.assign(byPropsAll, {
        default: byPropsDefaultAll,
    });
    Object.assign(byProps, {
        default: byPropsDefault,
        all: byPropsAll,
    });

    /**
     * @name byPrototypes
     * @description Uses prototypes to find the module.
     * @param {Array} prototypes
     * @returns {any}
     */

    function byPrototypes(...protos) {
        return getModule((m) => protos.every((proto) => typeof m?.default?.prototype?.[proto] !== "undefined"));
    }
    Object.assign(byPrototypes, {
        all: (...protos) => getModule((m) => protos.every((proto) => typeof m?.default?.prototype?.[proto] !== "undefined"), false),
    });

    /**
     * @name byDisplayName
     * @description Uses a displayName to find the module.
     * @param {String} displayName
     * @returns {any}
     */

    function byDisplayName(displayName) {
        return getModule((m) => m.default?.displayName === displayName) || byDisplayNameType(displayName) || byDisplayNameTypeRender(displayName);
    }
    function byDisplayNameType(displayName) {
        return getModule((m) => m.default?.type?.displayName === displayName);
    }
    function byDisplayNameTypeRender(displayName) {
        return getModule((m) => m.default?.type?.render?.displayName === displayName);
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
    webpackChunkdiscord_app.Velocity_getModule = find;
    module.exports = find;
}
