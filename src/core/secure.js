const { createHash, randomBytes } = require("crypto");

let InternalSecurityTokenVar = createHash("sha512").update(randomBytes(30).toString()).digest("hex");

module.exports = new (class SecurityManager {
    get InternalSecurityToken() {
        return InternalSecurityTokenVar;
    }

    internalPatches = [];

    checkStatus() {
        if (this.InternalSecurityToken !== InternalSecurityTokenVar) {
            return 0;
        } else {
            return 1;
        }
    }

    async kill() {
        InternalSecurityTokenVar = 0;
        require("electron").ipcRenderer.invoke("killed-dialog");
        process.abort();
    }
})();
