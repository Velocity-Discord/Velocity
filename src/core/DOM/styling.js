const logger = require("../logger.js");
const DataStore = require("../datastore");
const { parse } = require("../styleParser.js");
const cssBeta = DataStore("VELOCITY_SETTINGS").CSSFeatures;

module.exports = new (class StylingManager {
    escapeID(id) {
        return id.replace(/^[^a-z]+|[^\w-]+/gi, "-");
    }

    /**
     * Inject CSS
     * @param {string} id - Identifier of the Style.
     * @param {string} css - CSS to inject.
     */
    injectCSS(id, css) {
        var style = document.createElement("style");
        style.innerText = cssBeta ? parse(css) : css;
        style.id = id;
        return document.querySelector("velocity-head").appendChild(style);
    }

    /**
     * Inject CSS
     * @param {string} id - Identifier of the Style.
     * @param {string} css - CSS to inject.
     */
    injectInternalCSS(id, css) {
        var style = document.createElement("style");
        style.innerText = parse(css);
        style.id = this.escapeID(id);
        style.setAttribute("internal", true);
        return document.querySelector("velocity-head").appendChild(style);
    }

    /**
     * Clear CSS
     * @param {string} id - Identifier of the Style to remove.
     */
    clearCSS(id) {
        const style = document.querySelector("#" + this.escapeID(id));
        if (!style) return;
        if (!style.hasAttribute("internal")) return style.remove();

        return logger.warn("Velocity", "Refused to clear internal styles.");
    }

    /**
     * Link Style
     * @param {string} id - Identifier of the Style.
     * @param {string} url - URL to link to.
     */
    linkStyle(id, url) {
        const eid = this.escapeID(id);
        const style = document.createElement("link");
        style.rel = "stylesheet";
        style.href = url;
        style.id = eid;

        return document.querySelector("velocity-head").appendChild(style);
    }

    /**
     * Remove Style
     * @param {string} id - Identifier of the Style to remove.
     */
    removeStyle(id) {
        id = this.escapeID(id);
        let element = document.getElementById(id);
        if (element.getAttribute("internal") == "true") return logger.warn("Velocity", "Refused to remove internal styles.");
        return element.remove();
    }
})();
