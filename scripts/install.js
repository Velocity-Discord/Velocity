const path = require("path");
const fs = require("fs");
const { mkdir, writeFile, readdir } = require("fs").promises;

console.log("\x1b[1;94mVelocity \x1b[0m");
console.log("Starting installation process...");

async function run() {
    const readline = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    let appPath;

    if (process.argv.includes("--mac") || process.platform === "darwin") {
        if (process.argv.includes("--canary")) {
            appPath = "/Applications/Discord Canary.app/Contents/Resources/";
        } else if (process.argv.includes("--ptb")) {
            appPath = "/Applications/Discord PTB.app/Contents/Resources/";
        } else {
            appPath = "/Applications/Discord.app/Contents/Resources/";
        }

        console.log(`Preparing to install to '${appPath}'`);

        readline.question("Is this ok? (y/n) ", async (answer) => {
            if (answer == "y") {
                if (fs.existsSync(path.join(appPath, "app"))) {
                    console.error("A Discord Client Modification is already installed in this directory.");
                    console.log("Overwriting existing files...");
                } else {
                    await mkdir(path.join(appPath, "app"));
                }
                await Promise.all([
                    writeFile(path.join(appPath, "app", "index.js"), `require(\`${path.join(__dirname, "../").replace(RegExp(path.sep.repeat(2), "g"), "/")}\`)`),
                    writeFile(
                        path.join(appPath, "app", "package.json"),
                        JSON.stringify({
                            main: "index.js",
                            name: "discord",
                        })
                    ),
                ]);
                console.log("Done!");
                readline.close();
            } else {
                console.log("Exiting Install.");
                process.exit();
            }
        });

        return true;
    } else if (process.argv.includes("--win") || process.platform === "win32") {
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

        console.log(`Preparing to install to '${appPath}'`);

        readline.question("Is this ok? (y/n) ", async (answer) => {
            if (answer == "y") {
                if (fs.existsSync(path.join(appPath, "app"))) {
                    console.error("A Discord Client Modification is already installed in this directory.");
                    console.log("Overwriting existing files...");
                } else {
                    await mkdir(path.join(appPath, "app"));
                }
                await Promise.all([
                    writeFile(path.join(appPath, "app", "index.js"), `require(\`${path.join(__dirname, "../").replace(RegExp(path.sep.repeat(2), "g"), "/")}\`)`),
                    writeFile(
                        path.join(appPath, "app", "package.json"),
                        JSON.stringify({
                            main: "index.js",
                            name: "discord",
                        })
                    ),
                ]);
                console.log("Done!");
                readline.close();
            } else {
                console.log("Exiting Install.");
                process.exit();
            }
        });

        return true;
    } else if (process.argv.includes("--linux") || process.platform === "linux") {
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

        console.log(`Preparing to install to '${appPath}'`);

        readline.question("Is this ok? (y/n) ", async (answer) => {
            if (answer == "y") {
                if (!fs.existsSync(path.join(appPath))) {
                    console.error(`Discord is not installed in the requested path (${appPath}).`);
                    console.log("Exiting Install.");
                    readline.close();
                }

                if (fs.existsSync(path.join(appPath, "app"))) {
                    console.error("A Discord Client Modification is already installed in this directory.");
                    console.log("Overwriting existing files...");
                } else {
                    await mkdir(path.join(appPath, "app"));
                }
                await Promise.all([
                    writeFile(path.join(appPath, "app", "index.js"), `require(\`${path.join(__dirname, "../").replace(RegExp(path.sep.repeat(2), "g"), "/")}\`)`),
                    writeFile(
                        path.join(appPath, "app", "package.json"),
                        JSON.stringify({
                            main: "index.js",
                            name: "discord",
                        })
                    ),
                ]);
                console.log("Done!");
                readline.close();
            } else {
                console.log("Exiting Install.");
                process.exit();
            }
        });

        return true;
    }

    readline.question("Please enter the absolute path to the discord folder you would like to install Velocity. (filePath) ", (paths) => {
        const proposedPath = path.resolve(paths);
        if (!fs.existsSync(proposedPath)) {
            console.error("Requested path does not exist.");

            return readline.close();
        }

        appPath = proposedPath;

        console.log(`Preparing to install to '${appPath}'`);

        readline.question("Is this ok? (y/n) ", async (answer) => {
            if (answer == "y") {
                if (fs.existsSync(path.join(appPath, "app"))) {
                    console.error("A Discord Client Modification is already installed in this directory.");
                    console.log("Overwriting existing files...");
                } else {
                    await mkdir(path.join(appPath, "app"));
                }
                await Promise.all([
                    writeFile(path.join(appPath, "app", "index.js"), `require(\`${path.join(__dirname, "../").replace(RegExp(path.sep.repeat(2), "g"), "/")}\`)`),
                    writeFile(
                        path.join(appPath, "app", "package.json"),
                        JSON.stringify({
                            main: "index.js",
                            name: "discord",
                        })
                    ),
                ]);
                console.log("Done!");
                readline.close();
            } else {
                console.log("Exiting Install.");
                process.exit();
            }
        });
    });
}

run();
