const join = (...args) => {
    let toJoin = [];

    args.forEach((arg, i) => {
        if (typeof arg === "undefined") return;
        if (typeof arg !== "string") throw new TypeError(`Path argument ${i} must be a string`);

        if (arg.startsWith("/") || arg.startsWith("\\")) {
            args[i] = arg.substring(1);
        }

        if (arg.endsWith("/") || arg.endsWith("\\")) {
            args[i] = arg.substring(0, arg.length - 1);
        }

        toJoin.push(arg);
    });

    if (process) return process.platform === "win32" ? toJoin.join("\\") : toJoin.join("/");
    return toJoin.join("/");
};

const basename = (path, ext) => {
    if (path.endsWith("/") || path.endsWith("\\")) {
        path = path.substring(0, path.length - 1);
    }

    if (ext) {
        if (path.endsWith(ext)) {
            path = path.substring(0, path.length - ext.length);
        }
    }

    return path.split("/").pop();
};

const dirname = (path) => {
    if (path.endsWith("/") || path.endsWith("\\")) {
        path = path.substring(0, path.length - 1);
    }

    return path.split("/").slice(0, -1).join("/");
};

const extname = (path) => {
    if (path.endsWith("/") || path.endsWith("\\")) {
        path = path.substring(0, path.length - 1);
    }

    return path.split(".").pop();
};

const resolve = (basepath, ...args) => {
    let ind;
    let toReturn = ``;

    args.forEach((arg, i) => {
        if (arg.startsWith("./")) arg = arg.substring(2);
        arg = arg.replaceAll("./", "/").replaceAll("//", "/");
        if (arg.startsWith("../")) {
            ind = basepath.lastIndexOf("/");
            if (ind === -1) ind = basepath.lastIndexOf("\\");
            if (ind === -1) {
                toReturn += arg;
            } else {
                toReturn += basepath.substring(0, ind + 1) + arg.substring(3);
            }
        }

        toReturn += arg;
    });

    return join(basepath, toReturn);
};

module.exports = {
    join,
    basename,
    dirname,
    extname,
    resolve,
};
