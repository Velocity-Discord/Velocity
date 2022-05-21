const fs = require("fs");
const path = require("path");
const DataStore = require("./datastore");
const request = require("./request");
const Logger = require("./logger");
const { parse } = require("./styleParser");
const cssBeta = DataStore("VELOCITY_SETTINGS").CSSFeatures;

const { Strings } = require("./i18n");

const Velocity = DataStore("VELOCITY_SETTINGS");
const DevMode = Velocity.DevMode;

Velocity.enabledThemes = Velocity.enabledThemes || {};
Velocity.enabledPlugins = Velocity.enabledPlugins || {};

Velocity.remoteThemes = Velocity.remoteThemes || [];
Velocity.remotePlugins = Velocity.remotePlugins || [];

const filters = {
    themes: /(\.theme.css)$/,
    plugins: /(\.plugin.js)$/,
};

const remoteAddons = {
    themes: [],
    plugins: [],
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

function readManifest(file) {
    const contents = require(file);
    if (typeof contents.main !== "string") {
        return Logger.error("Addon Manager", `${file} is missing an entrypoint.`);
    }
    return contents;
}

function readMeta(contents) {
    if (typeof contents == "undefined") return null;
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

const RemoteActions = new (class {
    loadTheme(url) {
        if (!filters.themes.test(url)) {
            Logger.error("Remote Addon Manager", "Requested File Does not match Theme Filters");
            return VApi.showToast("Remote Addon Manager", Strings.Toasts.AddonManager.failedremote, { type: "error" });
        }

        request(url, async (err, _, body) => {
            const data = body;

            const meta = readMeta(data);
            meta.remote = true;
            meta.sessionId = remoteAddons.themes.length + 1;
            meta.css = cssBeta ? parse(data) : data;

            remoteAddons.themes.push(meta);
            addons.themes.push(meta);

            VApi.showToast("Remote Addon Manager", `${Strings.Toasts.AddonManager.loaded} <strong>${meta.name}</strong>`);

            if (!Velocity.remoteThemes.find((m) => m.name === meta.name)) {
                DataStore.setData("VELOCITY_SETTINGS", "remoteThemes", [...Velocity.remoteThemes, { name: meta.name, url: url }]);
            }
        });
    }

    unloadTheme(name) {
        const entry = remoteAddons.themes.filter((m) => m.name == name);

        if (entry[0]) {
            Themes.disable(name);
            remoteAddons.themes = remoteAddons.themes.filter((m) => m.name !== name);
            addons.themes = addons.themes.filter((m) => {
                return Boolean(m !== entry[0]);
            });
            DataStore.setData(
                "VELOCITY_SETTINGS",
                "remoteThemes",
                Velocity.remoteThemes.filter((m) => {
                    const val = m.name !== name;
                    return val;
                })
            );

            VApi.showToast("Remote Addon Manager", `${Strings.Toasts.AddonManager.unloaded} <strong>${name}</strong>`);
        }
    }
})();

function loadRemoteAddons() {
    Velocity.remoteThemes.forEach((theme) => {
        RemoteActions.loadTheme(theme.url);
    });
    Velocity.remotePlugins.forEach((plugin) => {
        RemoteActions.loadPlugin(plugin.url);
    });
}

const themeDir = path.join(__dirname, "../../", "themes");
if (!fs.existsSync(themeDir)) fs.mkdirSync(themeDir);

fs.readdir(themeDir, (err, files) => {
    if (err) throw new Error(`Error reading '${themeDir}'`);
    folders = files.filter((file) => !file.includes("/") && !file.includes("."));
    folders.sort().map((folder) => {
        if (DevMode) Logger.log("Addon Manager", `Loading ${folder}`);
        const filePath = path.join(themeDir, folder, "velocity_manifest.json");

        const meta = readManifest(filePath);
        fs.readFile(path.join(themeDir, folder, meta.main), "utf8", (err, data) => {
            if (err) throw new Error(`Error reading '${filePath}'`);
            meta.file = filePath;
            meta.type = "module";
            meta.css = cssBeta ? parse(data) : data;
            addons.themes.push(meta);
        });
    });

    files = files.filter((file) => filters.themes.test(file));
    files.sort().map((file) => {
        if (DevMode) Logger.log("Addon Manager", `Loading ${file}`);
        const filePath = path.join(themeDir, file);
        fs.readFile(filePath, "utf8", (err, data) => {
            if (err) throw new Error(`Error reading '${filePath}'`);
            const meta = readMeta(data);
            meta.file = filePath;
            meta.css = cssBeta ? parse(data) : data;
            addons.themes.push(meta);
        });
    });
});

const Themes = new (class {
    delete(name) {
        return delete addons.themes.find((p) => p?.name === name);
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

                delete addons.themes[getKeyByValue(addons.themes, meta.name)];

                VApi.showToast("Addon Manager", `${Strings.Toasts.AddonManager.unloaded} <strong>${meta.name}</strong>`);

                addons.themes.push(meta);
                VApi.showToast("Addon Manager", `${Strings.Toasts.AddonManager.loaded} <strong>${meta.name}</strong>`);

                if (enabled) {
                    const ele = document.querySelectorAll(`[velocity-theme-id="${meta.name}"]`);
                    for (let ele1 of ele) {
                        if (ele1) {
                            ele1.remove();
                            VApi.showToast("Addon Manager", `${Strings.Toasts.AddonManager.disabled} <strong>${meta.name}</strong>`, { type: "success" });
                        }
                    }
                    const style = document.createElement("style");
                    style.innerHTML = meta.css;
                    style.setAttribute("velocity-theme-id", meta.name);
                    document.querySelector("velocity-themes").appendChild(style);
                    VApi.showToast("Addon Manager", `${Strings.Toasts.AddonManager.enabled} <strong>${meta.name}</strong>`, { type: "success" });
                }
            } else {
                addons.themes.push(meta);
            }
        });
    } catch (e) {
        Logger.error("Addon Manager", "Error Reading Theme Directory:", e);
        VApi.showToast("Addon Manager", Strings.Toasts.AddonManager.errorreadingtheme, { type: "error" });
    }
});

const pluginDir = path.join(__dirname, "../../", "plugins");
if (!fs.existsSync(pluginDir)) fs.mkdirSync(pluginDir);

fs.readdir(pluginDir, (err, files) => {
    if (err) throw new Error(`Error reading '${pluginDir}'`);

    folders = files.filter((file) => !file.includes("/") && !file.includes("."));
    folders.sort().map((folder) => {
        if (DevMode) Logger.log("Addon Manager", `Loading ${folder}`);
        const filePath = path.join(pluginDir, folder, "velocity_manifest.json");

        const meta = readManifest(filePath);
        let plugin = require(path.join(pluginDir, folder, meta.main));
        meta.export = plugin;
        meta.type = "module";
        meta.file = filePath;

        const PluginExport = typeof plugin.Plugin === "function" ? plugin.Plugin() : plugin.Plugin;
        if (PluginExport.getSettingsPanel) {
            meta.hasSettings = true;
            PluginExport.settings = DataStore.getAllData(meta.name);
        }

        addons.plugins.push(meta);
        function load() {
            setTimeout(() => {
                if (PluginExport.onLoad) PluginExport.onLoad();
            }, 2000);

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

    files = files.filter((file) => filters.plugins.test(file));
    files.sort().map((file) => {
        if (DevMode) Logger.log("Addon Manager", `Loading ${file}`);
        const filePath = path.join(pluginDir, file);
        fs.readFile(filePath, "utf8", (err, data) => {
            if (err) throw new Error(`Error reading '${filePath}'`);
            const meta = readMeta(data);
            let plugin = require(filePath);
            typeof plugin.Plugin === "function" && (plugin.Plugin = plugin.Plugin());
            meta.export = plugin;
            meta.type = "plugin";
            meta.file = filePath;

            const PluginExport = typeof plugin.Plugin === "function" ? plugin.Plugin() : plugin.Plugin;
            if (PluginExport.getSettingsPanel) {
                meta.hasSettings = true;
                PluginExport.settings = DataStore.getAllData(meta.name);
            }

            addons.plugins.push(meta);
            function load() {
                if (plugin.default) plugin = plugin.default;
                setTimeout(() => {
                    if (PluginExport.onLoad) PluginExport.onLoad();
                }, 2000);
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
    });
});

const Plugins = new (class {
    delete(name) {
        return delete addons.plugins.find((p) => p.name === name);
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
            const PluginExport = typeof meta.export.Plugin === "function" ? meta.export.Plugin() : meta.export.Plugin;

            return PluginExport.onStart();
        } catch (error) {
            console.error(error);
        }
    }
    disable(name) {
        const meta = this.get(name);
        DataStore.setData("VELOCITY_SETTINGS", "enabledPlugins", { ...Velocity.enabledPlugins, [meta.name]: false });
        try {
            const PluginExport = typeof meta.export.Plugin === "function" ? meta.export.Plugin() : meta.export.Plugin;
            return PluginExport.onStop();
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
    remote: () => {
        loadRemoteAddons();
        return {
            loadTheme: (url) => {
                RemoteActions.loadTheme(url);
            },
            loadPlugin: (url) => {
                RemoteActions.loadPlugin(url);
            },
        };
    },
    readMeta,
    readManifest,
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
