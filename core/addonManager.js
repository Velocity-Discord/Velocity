const fs = require("fs");
const path = require("path");
const DataStore = require("./datastore");
const request = require("./request");
const { parse } = require("./styleParser");
const cssBeta = DataStore("VELOCITY_SETTINGS").CSSFeatures;

const Velocity = DataStore("VELOCITY_SETTINGS")
Velocity.enabledThemes = Velocity.enabledThemes || {};
Velocity.enabledPlugins = Velocity.enabledPlugins || {};

const filters = {
    themes: /(\.theme.css)$/,
    plugins: /(\.plugin.js)$/,
};

const addons = {
    themes: [],
    plugins: [],
};
const addonsInit = {
    themes: [],
    plugins: [],
};

function getKeyByValue(object, value) {
    return Object.keys(object).find((key) => object[key].name === value);
}

function readMeta(contents) {
    let meta = {};
    let jsdoc = contents.match(/\/\*\*([\s\S]*?)\*\//);
    if (!jsdoc?.[1]) return meta;
    for (let ite of jsdoc[1].match(/\*\s([^\n]*)/g)) {
        ite = ite.replace(/\*( +|)@/, "");
        let split = ite.split(" ");
        let key = split[0];
        let value = split.slice(1).join(" ");
        meta[key] = value;
    }
    return meta;
}

const themeDir = path.join(__dirname, "..", "themes");
if (!fs.existsSync(themeDir)) fs.mkdirSync(themeDir);

fs.readdir(themeDir, (err, files) => {
    if (err) throw new Error(`Error reading '${themeDir}'`);
    files = files.filter((file) => filters.themes.test(file));
    for (const file of files) {
        const filePath = path.join(themeDir, file);
        fs.readFile(filePath, "utf8", (err, data) => {
            if (err) throw new Error(`Error reading '${filePath}'`);
            const meta = readMeta(data);
            meta.file = filePath;
            meta.css = cssBeta ? parse(data) : data
            addons.themes.push(meta);
        });
    }
});

const Themes = new (class {
    delete(name) {
        return delete(addons.themes.find((p) => p?.name === name));
    }
    get(name) {
        return addons.themes.find((p) => p?.name === name);
    }
    getAll() {
        return addons.themes;
    }
    getEnabled() {
        return addons.themes.filter((p) => this.isEnabled[p?.name]);
    }
    isEnabled(name) {
        return Velocity.enabledThemes[name] || false;
    }
    enable(name) {
        const meta = this.get(name);
        if (!meta) return;
        DataStore.setData("VELOCITY_SETTINGS", "enabledThemes", { ...Velocity.enabledThemes, [meta.name]: true });
        const style = document.createElement("style");
        style.innerHTML = meta.css;
        style.setAttribute("velocity-theme-id", meta.name);
        document.querySelector("velocity-themes").appendChild(style);
    }
    disable(name) {
        try {
            const meta = this.get(name);
            if (!meta) return;
            DataStore.setData("VELOCITY_SETTINGS", "enabledThemes", { ...Velocity.enabledThemes, [meta.name]: false });
            const ele = document.querySelectorAll(`[velocity-theme-id="${meta.name}"]`);
            for (let ele1 of ele) {
                if (ele1) ele1.remove();
            }
        } catch (error) {
            console.error(error);
        }
    }
    toggle(name) {
        return this.isEnabled(name) ? this.disable(name) : this.enable(name);
    }
    getByFileName(name) {
        return this.getAll().find((p) => p?.file.endsWith(name));
    }
})();

fs.watch(themeDir, { persistent: false }, async (eventType, filename) => {
    if (!eventType || !filename) return;

    const absolutePath = path.resolve(themeDir, filename);
    if (!filters.themes.test(filename)) return;

    const name = filename.replace(".theme.css", "");

    let meta;
    
    try {
    fs.readFile(absolutePath, "utf8", (err, data) => {
        if (err) throw new Error(`Error reading '${absolutePath}'`);
        meta = readMeta(data);
        meta.file = absolutePath;
        meta.css = cssBeta ? parse(data) : data;

        if (Themes.get(meta.name)) {
            const enabled = Velocity.enabledThemes[meta.name] || false;

            delete(addons.themes[getKeyByValue(addons.themes, meta.name)]);

            VApi.showToast(`Unloaded <strong>${meta.name}</strong>`);

            addons.themes.push(meta);
            VApi.showToast(`Loaded <strong>${meta.name}</strong>`);

            if (enabled) {
                const ele = document.querySelectorAll(`[velocity-theme-id="${meta.name}"]`);
                for (let ele1 of ele) {
                    if (ele1) {
                        ele1.remove();
                        VApi.showToast(`Disabled <strong>${meta.name}</strong>`, { type: "success" });
                    }
                }
                const style = document.createElement("style");
                style.innerHTML = meta.css;
                style.setAttribute("velocity-theme-id", meta.name);
                document.querySelector("velocity-themes").appendChild(style);
                VApi.showToast(`Enabled <strong>${meta.name}</strong>`, { type: "success" });
            }
        } else {
            addons.themes.push(meta);
        }
    });
    } catch (e) {
        Logger.error("Addon Manager", e)
        VApi.showToast("Error Reading Theme Directory", {type: "error"})
    }
});

const pluginDir = path.join(__dirname, "..", "plugins");
if (!fs.existsSync(pluginDir)) fs.mkdirSync(pluginDir);

fs.readdir(pluginDir, (err, files) => {
    if (err) throw new Error(`Error reading '${pluginDir}'`);
    files = files.filter((file) => filters.plugins.test(file));
    for (const file of files) {
        const filePath = path.join(pluginDir, file);
        fs.readFile(filePath, "utf8", (err, data) => {
            if (err) throw new Error(`Error reading '${filePath}'`);
            const meta = readMeta(data);
            let plugin = require(filePath);
            meta.export = plugin;
            meta.type = "plugin"
            meta.file = filePath;
            addons.plugins.push(meta);
            function load() {
                if (plugin.default) plugin = plugin.default;
                if (typeof plugin.Plugin === "function") {
                    setTimeout(() => {
                        if (plugin.Plugin().onLoad) plugin.Plugin().onLoad();
                    }, 2000)
                }
                else {
                    setTimeout(() => {
                        if (plugin.Plugin.onLoad) plugin.Plugin.onLoad();
                    }, 2000);
                }
                return plugin;
            }
            load();
            addonsInit.plugins.push(() => {
                function load() {
                    if (plugin.default) plugin = plugin.default;
                    if (plugin.onLoad) plugin.onLoad();
                    return plugin;
                }
                load();
            });
        });
    }
});

const Plugins = new (class {
    delete(name) {
        return delete(addons.plugins.find((p) => p.name === name));
    }
    get(name) {
        return addons.plugins.find((p) => p.name === name);
    }
    getAll() {
        return addons.plugins;
    }
    getEnabled() {
        return addons.plugins.filter((p) => this.isEnabled[p.name]);
    }
    isEnabled(name) {
        return Velocity.enabledPlugins[name] ?? false;
    }
    enable(name) {
        const meta = this.get(name);
        DataStore.setData("VELOCITY_SETTINGS", "enabledPlugins", { ...Velocity.enabledPlugins, [meta.name]: true });
        try {
            if (typeof meta.export.Plugin === "function") { 
                return meta.export.Plugin().onStart();
            }
            meta.export.Plugin.onStart();
        } catch (error) {
            console.error(error);
        }
    }
    disable(name) {
        const meta = this.get(name);
        DataStore.setData("VELOCITY_SETTINGS", "enabledPlugins", { ...Velocity.enabledPlugins, [meta.name]: false });
        try {
            if (typeof meta.export.Plugin === "function") {
                return meta.export.Plugin().onStop();
            }
            meta.export.Plugin.onStop();
        } catch (error) {
            console.error(error);
        }
    }
    toggle(name) {
        return this.isEnabled(name) ? this.disable(name) : this.enable(name);
    }
    getByFileName(name) {
        return this.getAll().find((p) => p.file.endsWith(name));
    }
})();

module.exports = {
    readMeta,
    themes: () => {
        for (const theme of addonsInit.themes) theme();
        return {
            delete: (name) => Themes.delete(name),
            getByFileName: (name) => Themes.getByFileName(name),
            get: (name) => Themes.get(name),
            getAll: () => Themes.getAll(),
            getEnabled: () => Themes.getEnabled(),
            isEnabled: (name) => Themes.isEnabled(name),
            enable: (name) => Themes.enable(name),
            disable: (name) => Themes.disable(name),
            toggle: (name) => Themes.toggle(name),
            folder: themeDir,
        };
    },
    plugins: () => {
        for (const plugin of addonsInit.plugins) plugin();
        return {
            delete: (name) => Plugins.delete(name),
            getByFileName: (name) => Plugins.getByFileName(name),
            get: (name) => Plugins.get(name),
            getAll: () => Plugins.getAll(),
            getEnabled: () => Plugins.getEnabled(),
            isEnabled: (name) => Plugins.isEnabled(name),
            enable: (name) => Plugins.enable(name),
            disable: (name) => Plugins.disable(name),
            toggle: (name) => Plugins.toggle(name),
            folder: pluginDir,
        };
    },
};