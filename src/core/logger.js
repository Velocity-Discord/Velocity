const { info } = require("../../../package.json");

module.exports = new (class Logger {
    print({ type = "info", title = info.name, input = "" }) {
        const i = console[type];
        return i(`%c[${title}]%c`, ["font-weight: bold", "color: #3b62d6"].join(";"), "", ...input);
    }
    /**
     * Logger.log
     * @param {string} title
     * @param {...any} content
     */
    log(title, ...logs) {
        return this.print({ type: "info", title: title, input: logs });
    }
    /**
     * Logger.warn
     * @param {string} title
     * @param {...any} warning
     */
    warn(title, ...warnings) {
        return this.print({ type: "warn", title: title, input: warnings });
    }
    /**
     * Logger.error
     * @param {string} title
     * @param {...any} error
     */
    error(title, ...errors) {
        return this.print({ type: "error", title: title, input: errors });
    }
})();
