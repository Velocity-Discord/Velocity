import logger from "../util/logger";
const Logger = new logger("Datastore");

const fs = VelocityCore.pseudoRequire("node:fs");
const path = VelocityCore.pseudoRequire("node:path");
const VELOCITY_DIRECTORY = VelocityCore.pseudoRequire("v:dir");

const validateDir = () => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
};

export const dir = path.join(VELOCITY_DIRECTORY, "data");

export const getAllData = (store) => {
    validateDir();
    try {
        if (!fs.existsSync(path.join(dir, `${store}.json`))) return {};
        return JSON.parse(fs.readFileSync(path.join(dir, `${store}.json`), "utf8"));
    } catch (e) {
        Logger.error(e);
    }
};

export const getData = (store, key) => {
    validateDir();
    try {
        const data = getAllData(store);
        return data[key] || null;
    } catch (e) {
        Logger.error(e);
    }
};

export const setData = (store, key, value) => {
    validateDir();
    try {
        const data = getAllData(store);
        data[key] = value;
        fs.writeFileSync(path.join(dir, `${store}.json`), JSON.stringify(data));
    } catch (e) {
        Logger.error(e);
    }
};

export const deleteData = (store, key) => {
    validateDir();
    try {
        const data = getAllData(store);
        delete data[key];
        fs.writeFileSync(path.join(dir, `${store}.json`), JSON.stringify(data));
    } catch (e) {
        Logger.error(e);
    }
};

const SreamCache = {};

export const Stream = (name) => {
    let cache;

    if (SreamCache[name]) {
        cache = SreamCache[name];
    } else {
        cache = getAllData(name);
        SreamCache[name] = cache;
    }

    return new Proxy(cache, {
        get(_, prop) {
            return cache[prop] || getData(name, prop);
        },

        set(_, prop, value) {
            cache[prop] = value;
            setData(name, prop, value);
            return true;
        },

        deleteProperty(_, prop) {
            cache[prop] = undefined;
            deleteData(name, prop);
            return true;
        },
    });
};
