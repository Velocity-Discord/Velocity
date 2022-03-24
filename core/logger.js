const { info } = require("../package.json");

function print({ type = "info", title = info.name, input = "" }) {
    const i = console[type];
    return i(`%c[${title}]%c`, ["font-weight: bold", "color: #3b62d6"].join(";"), "", ...input);
}
/**
 * @name log
 * @param {string} title
 * @param  {...any} content
 */
function log(title, ...logs) {
    return print({ type: "info", title: title, input: logs });
}
/**
 * @name warn
 * @param {string} title
 * @param  {...any} warning
 */
function warn(title, ...warnings) {
    return print({ type: "warn", title: title, input: warnings });
}
/**
 * @name error
 * @param {string} title
 * @param  {...any} error
 */
function error(title, ...errors) {
    return print({ type: "error", title: title, input: errors });
}

module.exports = { log, warn, error, print };