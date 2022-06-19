const { createHash, randomBytes } = require("crypto");
const { EventEmitter } = require("events");

let InternalSecurityTokenVar = createHash("sha512").update(randomBytes(30).toString()).digest("hex");

module.exports = new (class Neptune {
    get InternalSecurityToken() {
        // TODO: run checks in the getter
        return InternalSecurityTokenVar;
    }

    Interface = new EventEmitter();
    InternalPatches = [];

    initialise() {
        Object.defineProperty(this, "InternalSecurityToken", {
            value: InternalSecurityTokenVar,
            writable: false,
        });

        this.Interface.on("NEPTUNE::HANDLE_DEAD_PROCESS", () => {
            this.crash();
        });
        this.Interface.on("NEPTUNE::HANDLE_KILL_PROCESS", () => {
            this.kill();
        });
        this.Interface.on("NEPTUNE::GET_SECURITY_TOKEN", (rb) => {
            this.Interface.emit(`NEPTUNE::SECURITY_TOKEN::${rb}`, this.InternalSecurityToken);
        });
    }

    kill() {
        InternalSecurityTokenVar = 0;
        require("electron").ipcRenderer.invoke("killed-dialog");
        process.abort();
    }
    crash() {
        require("electron").ipcRenderer.invoke("crashed-dialog", { code: "N:0", reason: "Neptune N:0" });
        process.abort();
    }
})();
