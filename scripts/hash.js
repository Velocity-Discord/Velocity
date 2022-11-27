/* Velocity Hash Bump Script */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const package = require("../../package.json");

console.log("\u001b[32m|--------------------------------------|\u001b[0m");
console.log("\u001b[32m| \u001b[1;94mVelocity\u001b[0m");
console.log("\u001b[32m|--------------------------------------|\u001b[0m");
console.log("");

const run = async () => {
    const hash = crypto.createHash("sha256").update(crypto.randomBytes(20)).digest("hex").slice(0, 6);

    package.hash = hash;

    console.log(`Generated hash: \u001b[1;32m${hash}\u001b[0m`);

    await fs.promises.writeFile(path.join(__dirname, "..", "package.json"), JSON.stringify(package, null, 4));
};

run();
