/* Velocity Inject Script */

const fs = require("fs");
const path = require("path");
const { mkdir, writeFile, rmdir, rm } = require("fs").promises;

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

    let proposedPath;

    if (platform === "win32") {
        let discordVersion;

        switch (channel) {
            case "stable":
                proposedPath = path.join(process.env.LOCALAPPDATA, "discord");
                break;
            case "ptb":
                proposedPath = path.join(process.env.LOCALAPPDATA, "discordptb");
                break;
            case "canary":
                proposedPath = path.join(process.env.LOCALAPPDATA, "discordcanary");
                break;
        }

        discordVersion = fs.readdirSync(proposedPath).filter((file) => file.startsWith("app-"))[0];
        proposedPath = path.join(proposedPath, discordVersion, "resources");

        console.log(`Found Discord installation at \u001b[1;32m${proposedPath}\u001b[0m`);
    } else if (platform === "darwin") {
        switch (channel) {
            case "stable":
                proposedPath = "/Applications/Discord.app/Contents/Resources/";
                break;
            case "ptb":
                proposedPath = "/Applications/Discord PTB.app/Contents/Resources/";
                break;
            case "canary":
                proposedPath = "/Applications/Discord Canary.app/Contents/Resources/";
                break;
        }

        console.log(`Found Discord installation at \u001b[1;32m${proposedPath}\u001b[0m`);
    } else if (platform === "linux") {
        switch (channel) {
            case "stable":
                proposedPath = "/usr/share/discord/";
                break;
            case "ptb":
                proposedPath = "/usr/share/discordptb/";
                break;
            case "canary":
                proposedPath = "/usr/share/discordcanary/";
                break;
        }

        console.log(`Found Discord installation at \u001b[1;32m${proposedPath}\u001b[0m`);
    }

    const filesAlreadyExist = fs.existsSync(path.join(proposedPath, "app"));

    if (filesAlreadyExist) {
        console.log("\u001b[1;33mClient Mod already injected into this location.\u001b[0m");
        console.log("\u001b[1;33mOverwriting...\u001b[0m");
        console.log("");

        await rm(path.join(proposedPath, "app"), { recursive: true });
    }

    try {
        mkdir(path.join(proposedPath, "app"));
        console.log("Created /app");

        writeFile(path.join(proposedPath, "app", "index.js"), `require("${path.join(__dirname, "../").replace(/\\/g, "\\\\")}");`);
        console.log("Created /app/index.js");
        writeFile(
            path.join(proposedPath, "app", "package.json"),
            JSON.stringify({
                name: "velocity",
                main: "index.js",
            })
        );
        console.log("Created /app/package.json");
    } catch (e) {
        console.error(`\u001b[1;31mFailed to inject files: ${e}\u001b[0m`);
    }

    console.log("");
    console.log("\u001b[1;32mSuccessfully injected Velocity.\u001b[0m");
};

run();
