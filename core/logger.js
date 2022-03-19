const { info } = require("../package.json");

function logging({ type = "info", title = info.name, input = undefined }) {
    const con = console[type].__sentry_original__ ? console[type].__sentry_original__ : console[type];
    return con(`%c[${title}]%c`, ["font-weight: bold", "color: #3b62d6"].join(";"), "", ...input);
}
/**
 * @name log
 * @param {string} title
 * @param  {...any} logs
 */
function log(title, ...logs) {
    return logging({ type: "info", title: title, input: logs });
}
/**
 * @name warn
 * @param {string} title
 * @param  {...any} warns
 */
function warn(title, ...warnings) {
    return logging({ type: "warn", title: title, input: warnings });
}
/**
 * @name error
 * @param {string} title
 * @param  {...any} errors
 */
function error(title, ...errors) {
    return logging({ type: "error", title: title, input: errors });
}
module.exports = { log, warn, error, logging };

//#sourceURL=Velocity Logger