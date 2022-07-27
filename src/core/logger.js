const { info } = require("../../../package.json");

module.exports = new (class Logger {
    print({ type = "info", title = info.name, input = "" }) {
        const i = console[type];
        return i(`%c${title}%c`, "background: #5B88FC; font-weight: 600; padding: 4px 6px; border-radius: 4px; color: white; font-family: Helvetica", "", ...input);
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
