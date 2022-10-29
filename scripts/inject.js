/* Velocity Inject Script */

const fs = require("fs");
const path = require("path");
const { mkdir, writeFile, rmdir, rm } = require("fs").promises;

const { inject } = require("@velocity-discord/scaffold");

console.log("\u001b[32m|--------------------------------------|\u001b[0m");
console.log("\u001b[32m| \u001b[1;94mVelocity\u001b[0m");
console.log("\u001b[32m|--------------------------------------|\u001b[0m");
console.log("");

const run = async () => {
    const channel = process.argv[2] || "stable";
    const platform = process.platform;

    if (channel !== "stable" && channel !== "ptb" && channel !== "canary") {
        console.error("Invalid channel specified. Please use 'stable', 'ptb', or 'canary'.");
        return process.exit(1);
    }

    console.log(`Injecting Velocity to \u001b[1;32m${platform}:${channel}\u001b[0m`);
    console.log("");

    inject(channel, path.join(__dirname, ".."), {
        name: "velocity",
        events: {
            onError: (e) => {
                console.log(`\u001b[1;31mFailed to inject: ${e}\u001b[0m`);
            },
            onDiscovered: (path) => {
                console.log(`Found Discord installation at \u001b[1;32m${path}\u001b[0m`);
            },
            onRenamed: () => {
                console.log(`Renamed Discord Asar`);
            },
            onInjected: () => {
                console.log("\u001b[1;32mSuccessfully injected Velocity.\u001b[0m");
            },
        },
    });

    console.log("");
    console.log("\u001b[1;32mSuccessfully injected Velocity.\u001b[0m");
};

run();
