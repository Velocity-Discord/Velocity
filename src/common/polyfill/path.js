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

    return process.platform === "win32" ? toJoin.join("\\") : toJoin.join("/");
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

module.exports = {
    join,
    basename,
    dirname,
    extname,
};
