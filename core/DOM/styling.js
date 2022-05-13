const logger = require("../logger");
const DataStore = require("../DataStore");
const { parse } = require("../styleParser");
const cssBeta = DataStore("VELOCITY_SETTINGS").CSSFeatures;

function escapeID(id) {
    return id.replace(/^[^a-z]+|[^\w-]+/gi, "-");
}

/**
 * Inject CSS
 * @param {string} id - Identifier of the Style.
 * @param {string} css - CSS to inject.
 */
function injectCSS(id, css) {
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
function injectInternalCSS(id, css) {
    var style = document.createElement("style");
    style.innerText = parse(css);
    style.id = escapeID(id);
    style.setAttribute("internal", true);
    return document.querySelector("velocity-head").appendChild(style);
}

/**
 * Clear CSS
 * @param {string} id - Identifier of the Style to remove.
 */
function clearCSS(id) {
    const style = document.querySelector("#" + escapeID(id));
    if (!style.hasAttribute("internal")) return style.remove();

    return logger.warn("Velocity", "Refused to clear internal styles.");
}

/**
 * Link Style
 * @param {string} id - Identifier of the Style.
 * @param {string} url - URL to link to.
 */
function linkStyle(id, url) {
    const eid = escapeID(id);
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
function removeStyle(id) {
    const eid = escapeID(id);
    return document.getElementById(eid).remove();
}

module.exports = { injectCSS, injectInternalCSS, clearCSS, linkStyle, removeStyle };