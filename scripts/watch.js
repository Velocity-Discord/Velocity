/* Velocity Asar Watch Script */

const fs = require("fs");
const path = require("path");
const asar = require("asar");

console.log("\u001b[32m|--------------------------------------|\u001b[0m");
console.log("\u001b[32m| \u001b[1;94mVelocity\u001b[0m");
console.log("\u001b[32m|--------------------------------------|\u001b[0m");
console.log("");

const run = async () => {
    console.log("Watching for changes...");
    console.log("");

    let timeout;

    fs.watch(path.join(__dirname, "../packages/"), { recursive: true }, async (event, filename) => {
        if (timeout) return;
        timeout = setTimeout(async () => {
            timeout = null;
        }, 100);

        let start = Date.now();
        console.log(`--------------------------------------------------------------------------------`);
        console.log(`Change detected in ${filename}. Rebuilding asar...`);

        try {
            await asar.createPackageWithOptions(path.join(__dirname, "../packages/out/"), path.join(__dirname, "../dist", "velocity.asar"), {});

            console.log(`\u001b[1;32mSuccessfully created asar file in ${Date.now() - start}ms\u001b[0m`);

            if (fs.existsSync(path.join(__dirname, "../dist", "velocity.asar.unpacked"))) {
                await fs.promises.rm(path.join(__dirname, "../dist", "velocity.asar.unpacked"), { recursive: true });
                console.log("Completed cleanup");
            }
        } catch (error) {
            console.log(`\u001b[1;31mFailed to create asar file in ${Date.now() - start}ms\u001b[0m`);
        }
        console.log(`--------------------------------------------------------------------------------`);
    });
};

run();
