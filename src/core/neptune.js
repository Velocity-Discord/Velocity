const { createHash, randomBytes } = require("crypto");
const { EventEmitter } = require("events");
const path = require("path");
const fs = require("fs/promises");
const request = require("./request");

let InternalSecurityTokenVar = createHash("sha512").update(randomBytes(30).toString()).digest("hex");

const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));

const NeptuneLog = (...logs) => {
    return console.log(`%c[Neptune]%c`, "font-weight: bold; color: #fcae5a", "", ...logs);
};

async function waitUntil(condition) {
    let item;
    while (!(item = condition())) await sleep(1);
    return item;
}

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

    async checkValidity() {
        NeptuneLog("Checking Validity...");

        const { showConfirmationModal, showToast, WebpackModules, React, DataStore } = VApi;
        const { Strings } = require("./i18n");

        const Markdown = WebpackModules.find((m) => m.default?.displayName === "Markdown" && m.default?.rules).default;
        const Anchor = WebpackModules.find("Anchor").default;

        const currentAsar = (await fs.readFile(path.resolve(__dirname, "../../velocity.asar/preload.js"), { encoding: "utf8" })).trim().normalize();
        let remoteAsar;

        request("https://raw.githubusercontent.com/Velocity-Discord/Velocity/main/src/preload.js", async (err, _, body) => {
            remoteAsar = body.trim().normalize();
        });

        waitUntil(() => remoteAsar);

        if (currentAsar !== remoteAsar) {
            NeptuneLog("Installation invalid.");
            const key = showConfirmationModal(
                "Velocity Installation Invalid!",

                React.createElement("div", {
                    className: `velocity-modal-flex-content ${WebpackModules.find(["markdown"]).markdown}`,
                    children: [
                        React.createElement("span", null, "Your installation of Velocity is invalid. Please be cautious!"),
                        React.createElement("span", null, [
                            "Tip: You can disable this warning by clicking ",
                            React.createElement(
                                Anchor,
                                {
                                    className: "velocity-anchor",
                                    onClick: (event) => {
                                        try {
                                            event.preventDefault();
                                            showToast("Neptune", Strings.Toasts.Neptune.disabledvaliditychecks, { type: "velocity" });
                                            DataStore.setData("VELOCITY_SETTINGS", "ValidityChecks", false);
                                            NeptuneLog("Disabled Validity Checks.");
                                            WebpackModules.find(["closeModal"]).closeModal(key);
                                        } catch (e) {
                                            console.error(e);
                                        }
                                    },
                                },
                                "here"
                            ),
                        ]),
                    ],
                }),

                {
                    confirmText: "Kill Process",
                    cancelText: "Proceed",
                    danger: true,
                    onConfirm: () => {
                        NeptuneLog("Invoking Kill.");
                        this.kill();
                    },
                }
            );
            return;
        }

        NeptuneLog("Installation valid.");
    }

    initialiseChecks() {
        this.checkValidity();
        setInterval(() => this.checkValidity(), 1800000);
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
