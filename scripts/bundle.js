/* Velocity Asar Bundle Script */

const fs = require("fs");
const path = require("path");
const asar = require("asar");

console.log("\u001b[32m|--------------------------------------|\u001b[0m");
console.log("\u001b[32m| \u001b[1;94mVelocity\u001b[0m");
console.log("\u001b[32m|--------------------------------------|\u001b[0m");
console.log("");

const run = async () => {
    await asar.createPackageWithOptions(path.join(__dirname, "../packages/out/"), path.join(__dirname, "../dist", "velocity.asar"), {});

    console.log("Successfully created asar file");

    if (fs.existsSync(path.join(__dirname, "../dist", "velocity.asar.unpacked"))) {
        await fs.promises.rm(path.join(__dirname, "../dist", "velocity.asar.unpacked"), { recursive: true });
        console.log("Completed cleanup");
    }
};

run();
