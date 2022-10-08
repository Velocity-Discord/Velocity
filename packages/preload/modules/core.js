import pkj from "../../../package.json";
import https from "https";

const supportedNodeModules = ["path", "fs", "https", "http", "os", "crypto", "zlib", "events", "original-fs"];

export default {
    Meta: {
        version: pkj.version,
        hash: pkj.hash,
    },
    pseudoRequire(path) {
        if (typeof path !== "string") throw new TypeError(`[INVALID_ARG_TYPE]: path must be a string, received '${typeof path}'`);

        const pathIsNodeModule = path.startsWith("node:");
        const pathIsUnsafe = path.startsWith("unsafe:");
        const pathIsVelocityModule = path.startsWith("v:");
        const pathIsRelative = path.startsWith("./") || path.startsWith("../") || path.startsWith("/");

        if (pathIsVelocityModule) {
            const modulePath = path.replace("v:", "");

            switch (modulePath) {
                case "dir":
                    return process.env.VELOCITY_DIRECTORY;
            }
        } else if (pathIsNodeModule) {
            const moduleName = path.replace("node:", "");
            if (supportedNodeModules.includes(moduleName)) {
                return require(moduleName);
            } else {
                throw new Error(`[MODULE_NOT_FOUND]: The module '${moduleName}' is not a supported node module. Try using the 'unsafe:' prefix.`);
            }
        } else if (pathIsRelative) {
            return require(path);
        } else if (pathIsUnsafe) {
            const unsafePath = path.replace("unsafe:", "");
            return require(unsafePath);
        }

        throw new Error(`[MODULE_NOT_FOUND]: The module '${path}' could not be found.`);
    },
    async request(url, options = {}, callback) {
        let err;
        let response;
        let body = "";
        let opt = typeof options === "function" ? {} : options;
        let cb = typeof options === "function" ? options : callback;

        const req = new Promise((resolve, reject) => {
            const r = https.request(url, opt, (res) => {
                response = res;

                res.on("data", (chunk) => {
                    body += chunk;
                });
                res.on("end", () => {
                    resolve();
                });
            });

            r.on("error", (e) => {
                err = true;
                reject();
            });

            r.end();
        });

        await req;

        if (cb) cb(err, response, body);
        return body;
    },
    get baseDir() {
        return process.env.VELOCITY_DIRECTORY;
    },
};
