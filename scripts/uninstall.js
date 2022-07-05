const path = require("path");
const fs = require("fs");
const { readdir, unlink, rmdir } = require("fs").promises;

console.log("\x1b[1;94mVelocity \x1b[0m");
console.log("Starting uninstallation...");

async function run() {
    const readline = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    let appPath;

    if (process.argv.includes("--mac")) {
        if (process.argv.includes("--canary")) {
            appPath = "/Applications/Discord Canary.app/Contents/Resources/";
        } else if (process.argv.includes("--ptb")) {
            appPath = "/Applications/Discord PTB.app/Contents/Resources/";
        } else {
            appPath = "/Applications/Discord.app/Contents/Resources/";
        }

        console.log(`Preparing to uninstall from '${appPath}'`);

        readline.question("Is this ok? (y/n) ", async (answer) => {
            if (answer == "y") {
                if (fs.existsSync(path.join(appPath, "app"))) {
                    await unlink(path.join(appPath, "app", "index.js"));
                    await unlink(path.join(appPath, "app", "package.json"));
                    await rmdir(path.join(appPath, "app"));
                } else {
                    console.error("No Discord Client Modification is installed in this directory.");
                    readline.close();
                }

                console.log("Done!");
                readline.close();
            } else {
                console.log("Exiting Uninstall.");
                process.exit();
            }
        });

        return true;
    } else if (process.argv.includes("--win")) {
        if (process.argv.includes("--canary")) {
            const discordPath = path.join(process.env.LOCALAPPDATA, "Discord Canary");
            const discordDirectory = await readdir(discordPath);

            const currentBuild = discordDirectory.filter((paths) => paths.startsWith("app-")).reverse()[0];
            appPath = path.join(discordPath, currentBuild, "resources");
        } else if (process.argv.includes("--ptb")) {
            const discordPath = path.join(process.env.LOCALAPPDATA, "DiscordPTB");
            const discordDirectory = await readdir(discordPath);

            const currentBuild = discordDirectory.filter((paths) => paths.startsWith("app-")).reverse()[0];
            appPath = path.join(discordPath, currentBuild, "resources");
        } else {
            const discordPath = path.join(process.env.LOCALAPPDATA, "Discord");
            const discordDirectory = await readdir(discordPath);

            const currentBuild = discordDirectory.filter((paths) => paths.startsWith("app-")).reverse()[0];
            appPath = path.join(discordPath, currentBuild, "resources");
        }

        console.log(`Preparing to uninstall from '${appPath}'`);

        readline.question("Is this ok? (y/n) ", async (answer) => {
            if (answer == "y") {
                if (fs.existsSync(path.join(appPath, "app"))) {
                    await unlink(path.join(appPath, "app", "index.js"));
                    await unlink(path.join(appPath, "app", "package.json"));
                    await rmdir(path.join(appPath, "app"));
                } else {
                    console.error("No Discord Client Modification is installed in this directory.");
                    readline.close();
                }

                console.log("Done!");
                readline.close();
            } else {
                console.log("Exiting Uninstall.");
                process.exit();
            }
        });

        return true;
    }

    readline.question("Please enter the absolute path to the discord folder you would like to uninstall Velocity from. (filePath) ", (paths) => {
        const proposedPath = path.resolve(paths);
        if (!fs.existsSync(proposedPath)) {
            console.error("Requested path does not exist.");

            return readline.close();
        }

        const selected = path.basename(proposedPath);
        let channelName;
        if (proposedPath.toLowerCase().includes("canary")) channelName = "Discord Canary";
        else if (proposedPath.toLowerCase().includes("ptb")) channelName = "Discord PTB";
        else channelName = "Discord";

        if (process.platform == "win32") {
            const isBaseDir = Boolean(selected === channelName);
            if (isBaseDir) {
                const version = fs
                    .readdirSync(proposedPath)
                    .filter((f) => fs.lstatSync(path.join(proposedPath, f)).isDirectory() && f.split(".").length > 1)
                    .sort()
                    .reverse()[0];
                if (!version) return "";
                appPath = path.join(proposedPath, version, "resources");
            } else if (selected.startsWith("app-") && selected.split(".").length > 2) appPath = path.join(proposedPath, "resources");
            else if (selected === "resources") appPath = proposedPath;
            else appPath = proposedPath;
        } else if (process.platform == "darwin") {
            if (selected === `${channelName}.app`) appPath = path.join(proposedPath, "Contents", "Resources");
            else if (selected === "Contents") appPath = path.join(proposedPath, "Resources");
            else if (selected === "Resources") appPath = proposedPath;
            else appPath = proposedPath;
        }

        console.log(`Preparing to uninstall from '${appPath}'`);

        readline.question("Is this ok? (y/n) ", async (answer) => {
            if (answer == "y") {
                if (fs.existsSync(path.join(appPath, "app"))) {
                    await unlink(path.join(appPath, "app", "index.js"));
                    await unlink(path.join(appPath, "app", "package.json"));
                    await rmdir(path.join(appPath, "app"));
                } else {
                    console.error("No Discord Client Modification is installed in this directory.");
                    readline.close();
                }

                console.log("Done!");
                readline.close();
            } else {
                console.log("Exiting Uninstall.");
                process.exit();
            }
        });
    });
}

run();