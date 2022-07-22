const _fs = require("fs");
const _path = require("path");
const { make, Events } = require("nests");

const Logger = require("./logger");
const logger = require("./logger");

const storage = new (class DataStore {
    get dir() {
        return _path.join(__dirname, "../../../", "settings");
    }
    getFile(name) {
        return _path.join(this.dir, `${name}.json`);
    }
    getAllData(name) {
        try {
            if (!_fs.existsSync(_path.join(__dirname, "../../../", "settings"))) _fs.mkdirSync(_path.join(__dirname, "../../../", "settings"));
            const file = this.getFile(name);
            if (!_fs.existsSync(file)) return {};
            return JSON.parse(_fs.readFileSync(file));
        } catch (error) {
            Logger.error("Velocity", error);
        }
    }
    getData(name, key) {
        try {
            const data = this.getAllData(name);
            if (data[key] === "") return "";
            if (data[key] === 0) return 0;
            if (data[key]) return data[key];
            else return null;
        } catch (error) {
            Logger.error("Velocity", error);
        }
    }
    setData(name, key, value) {
        try {
            const file = this.getFile(name);
            const data = this.getAllData(name);
            data[key] = value;
            _fs.writeFileSync(file, JSON.stringify(data, null, 2));
        } catch (error) {
            Logger.error("Velocity", error);
        }
    }
    deleteData(name, key) {
        try {
            const file = this.getFile(name);
            const data = this.getAllData(name);
            delete data[key];
            _fs.writeFileSync(file, JSON.stringify(data));
        } catch (error) {
            Logger.error("Velocity", error);
        }
    }
})();

const nestCache = {};
const Storage = (pluginName) => {
    if (!nestCache[pluginName]) {
        const update = (data) => {
            try {
                _fs.writeFileSync(storage.getFile(pluginName), JSON.stringify(data, null, 2));
            } catch (e) {
                Logger.error("Velocity", e);
            }
        };
        const nest = make(storage.getAllData(pluginName));
        nest.on(Events.SET, () => update(nest.ghost));
        nest.on(Events.DELETE, () => update(nest.ghost));
        nest.on(Events.UPDATE, () => update(nest.ghost));
        nestCache[pluginName] = nest;
    }
    return nestCache[pluginName];
};

Object.assign(Storage, {
    getData: (name, key) => storage.getData(name, key),
    getAllData: (name) => storage.getAllData(name),
    setData: (name, key, value) => storage.setData(name, key, value),
    deleteData: (name, key) => storage.deleteData(name, key),
});

module.exports = Storage;
