const logger = require("./logger")

function injectCSS(id, css) {
    var style = document.createElement("style");
    style.innerText = css;
    style.id = id;
    document.getElementById("velocity-head").appendChild(style);

    return;
};

function injectInternalCSS(id, css) {
    var style = document.createElement("style");
    style.innerText = css;
    style.id = id;
    style.setAttribute("internal", true)
    document.getElementById("velocity-head").appendChild(style);

    return;
};

function clearCSS(id) {
    const style = document.querySelector("#" + id);
    if (!style.hasAttribute("internal")) return style.remove();

    logger.warn("Velocity", "Refused to clear internal styles.");

    return;
};

function linkStyle(id, url) {
    const eid = escapeID(id);
    const style = document.createElement("link");
    style.rel = "stylesheet";
    style.href = url;
    style.id = eid;

    document.getElementById("velocity-head").appendChild(style);

    return;
};

function removeStyle(id) {
    const eid = escapeID(id);
    document.getElementById(eid).remove();

    return;
};

module.exports = { injectCSS, injectInternalCSS, clearCSS, linkStyle, removeStyle };