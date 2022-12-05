import { fs, path, shell, sucrase, electron, originalFs } from "./nodeModules";
import pkj from "../../../package.json";
import https from "https";

export default {
    Meta: {
        version: pkj.version,
        hash: pkj.hash,
    },
    modules: {
        fs,
        path,
        shell,
        sucrase,
        originalFs,
        ipcRenderer: electron.ipcRenderer,
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
