const path = require("path");
const fs = require("fs");
const { createHash } = require("crypto");

async function run() {
    const pkjPath = path.join(__dirname, "../", "package.json");
    if (!fs.existsSync(pkjPath)) return console.error("package.json not found");
    const data = fs.readFileSync(pkjPath, "utf8");

    let pkj = JSON.parse(data);
    console.log(`Writing New Hash to ${pkjPath}`);

    let newHash = createHash("sha512").update(data).digest("hex");
    newHash = newHash.slice(0, 6);

    if (typeof pkj.hash !== "undefined" && pkj.hash !== newHash) {
        pkj.hash = newHash;
        fs.writeFileSync(pkjPath, JSON.stringify(pkj, null, "\t"));
        console.log("Updated package.json hash to:", newHash);
    } else if (typeof pkj.info.hash !== "undefined" && pkj.info.hash !== newHash) {
        pkj.info.hash = newHash;
        fs.writeFileSync(pkjPath, JSON.stringify(pkj, null, "\t"));
        console.log("Updated package.json hash to:", newHash);
    }
}

run();
