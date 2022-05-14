module.exports = new (class ScriptingManager {
    escapeID(id) {
        return id.replace(/^[^a-z]+|[^\w-]+/gi, "-");
    }

    /**
     * Append Script
     * @param {string} id - Identifier of the Script.
     * @param {string} url - URL to link to.
     */
    appendScript(id, url) {
        id = this.escapeID(id);
        const script = document.createElement("script");
        script.src = url;
        script.id = id;

        return document.querySelector("velocity-head").appendChild(script);
    }

    /**
     * Remove Script
     * @param {string} id - Identifier of the Script to remove.
     */
    removeScript(id) {
        id = this.escapeID(id);
        return document.getElementById(id).remove();
    }
})();
