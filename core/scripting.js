function escapeID(id) {
    return id.replace(/^[^a-z]+|[^\w-]+/gi, "-");
}

/**
 * Append Script
 * @param {string} id - Identifier of the Script.
 * @param {string} url - URL to link to.
 */
function appendScript(id, url) {
    const eid = escapeID(id);
    const script = document.createElement("script");
    script.src = url;
    script.id = eid;

    document.getElementById("velocity-head").appendChild(script);

    return;
}

/**
 * Remove Script
 * @param {string} id - Identifier of the Script to remove.
 */
function removeScript(id) {
    const eid = escapeID(id);
    document.getElementById(eid).remove();

    return;
}

module.exports = { appendScript, removeScript };
