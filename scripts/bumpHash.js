const path = require("path");
const fs = require("fs");
const { createHash } = require("crypto");

async function run() {
    console.log("\x1b[1;94mVelocity \x1b[0m");
    console.log(`--------------------------------------------------------------------------------`);

    const pkjPath = path.join(__dirname, "../", "package.json");
    if (!fs.existsSync(pkjPath)) return console.error("package.json not found");
    const data = fs.readFileSync(pkjPath, "utf8");

    let pkj = JSON.parse(data);
    console.log(`Writing new Hash to ${pkjPath}`);

    let newHash = createHash("sha512").update(data).digest("hex");
    newHash = newHash.slice(0, 6);

    try {
        pkj.info.hash = newHash;
        fs.writeFileSync(pkjPath, JSON.stringify(pkj, null, "    "));
        console.log("Updated package.json hash to:", newHash);
    } catch (e) {
        console.error(`\x1b[1;91mError while updating package.json: ${e} \x1b[0m `);
    }
    console.log(`--------------------------------------------------------------------------------`);
}

run();
