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

    if (process.argv.includes("--mac") || (process.platform === "darwin" && !process.argv.includes("--manual"))) {
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
    } else if (process.argv.includes("--win") || (process.platform === "win32" && !process.argv.includes("--manual"))) {
        if (process.argv.includes("--canary")) {
            const discordPath = path.join(process.env.LOCALAPPDATA, "discordcanary");
            const discordDirectory = await readdir(discordPath);

            const currentBuild = discordDirectory.filter((paths) => paths.startsWith("app-")).reverse()[0];
            appPath = path.join(discordPath, currentBuild, "resources");
        } else if (process.argv.includes("--ptb")) {
            const discordPath = path.join(process.env.LOCALAPPDATA, "discordptb");
            const discordDirectory = await readdir(discordPath);

            const currentBuild = discordDirectory.filter((paths) => paths.startsWith("app-")).reverse()[0];
            appPath = path.join(discordPath, currentBuild, "resources");
        } else {
            const discordPath = path.join(process.env.LOCALAPPDATA, "discord");
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
    } else if (process.argv.includes("--linux") || (process.platform === "linux" && !process.argv.includes("--manual"))) {
        if (process.argv.includes("--canary")) {
            const discordPath = path.join("/usr/share/", "discordcanary");
            const discordDirectory = await readdir(discordPath);

            appPath = path.join(discordPath, "resources");
        } else if (process.argv.includes("--ptb")) {
            const discordPath = path.join("/usr/share/", "discordptb");
            const discordDirectory = await readdir(discordPath);

            appPath = path.join(discordPath, "resources");
        } else {
            const discordPath = path.join("/usr/share/", "discord");
            const discordDirectory = await readdir(discordPath);
            appPath = path.join(discordPath, "resources");
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
        appPath = proposedPath;

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
