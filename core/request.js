// Modification from OpenAsar's request polyfill to support http and not log the request
// Original license: MIT License (c) GooseMod
// https://github.com/GooseMod/OpenAsar/blob/main/LICENSE

const querystring = require("querystring"),
    https = require("https"),
    http = require("http");

function requ({ request }, resolve, { method, url, headers, qs, timeout, body, stream }) {
    const fullUrl = `${url}${qs != null ? `?${querystring.stringify(qs)}` : ""}`;
    return request(fullUrl, { method, headers, timeout }, async (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
            return resolve(
                await nodeReq({
                    url: res.headers.location,
                    qs: null,
                    method,
                    headers,
                    timeout,
                    body,
                    stream,
                }),
            );
        }
        resolve(res);
    });
}

async function nodeReq({ method, url, headers, qs, timeout, body, stream }) {
    return await new Promise((resolve) => {
        let req;
        let args = [resolve, { method, url, headers, qs, timeout, body, stream }];
        if (/^https/g.test(url))
            try {
                req = requ(https, ...args);
            } catch (e) {
                return resolve(e);
            }
        else
            try {
                req = requ(http, ...args);
            } catch (e) {
                return resolve(e);
            }
        req.on("error", resolve);
        if (body) req.write(body);
        req.end();
    });
}

function request(...args) {
    let options, callback;
    switch (args.length) {
        case 3:
            options = { url: args[0], ...args[1] };
            callback = args[2];
            break;
        default:
            options = args[0];
            callback = args[1];
    }
    if (typeof options === "string") options = { url: options };
    const listeners = {};
    nodeReq(options).then(async (res) => {
        const isError = !res.statusCode;
        if (isError) {
            listeners["error"]?.(res);
            callback?.(res, null, null);
            return;
        }
        listeners["response"]?.(res);
        let body = "";
        res.on("data", (chunk) => {
            body += chunk;
            listeners["data"]?.(chunk);
        });
        await new Promise((resolve) => res.on("end", resolve));
        callback?.(undefined, res, body);
    });
    const ret = {
        on: (type, handler) => {
            listeners[type] = handler;
            return ret;
        },
    };
    return ret;
}

for (const method of ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS", "PATCH"]) request[method] = (url, callback) => request({ url, method }, callback);
request.del = request.DELETE;

module.exports = request;
