import * as nodePolyfills from "../polyfill";
import pkj from "../../../package.json";
import https from "https";

export default {
    Meta: {
        version: pkj.version,
        hash: pkj.hash,
    },
    modules: nodePolyfills,
    pseudoRequire(path) {
        if (typeof path !== "string") throw new TypeError(`[INVALID_ARG_TYPE]: path must be a string, received '${typeof path}'`);

        const pathIsVelocity = path.startsWith("v:");

        if (pathIsVelocity) {
            const modulePath = path.replace("v:", "");

            switch (modulePath) {
                case "dir":
                    return process.env.VELOCITY_DIRECTORY;
            }
        }

        try {
            return require(path);
        } catch (e) {
            throw new Error(`[MODULE_NOT_FOUND]: The module '${path}' could not be found.`);
        }
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
