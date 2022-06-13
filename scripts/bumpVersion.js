const path = require("path");
const fs = require("fs");

async function run() {
    console.log("\x1b[1;94mVelocity \x1b[0m");
    console.log(`--------------------------------------------------------------------------------`);

    const pkjPath = path.join(__dirname, "../", "package.json");
    if (!fs.existsSync(pkjPath)) return console.error("package.json not found");
    const data = fs.readFileSync(pkjPath, "utf8");

    let pkj = JSON.parse(data);
    console.log(`Writing new Version to ${pkjPath}`);
    let newVersion;

    if (process.argv.includes("--major")) {
        newVersion = parseFloat(pkj.version.replace(/(?<=\d\.\d)\./, "")) + 1;
    } else if (process.argv.includes("--minor")) {
        newVersion = parseFloat(pkj.version.replace(/(?<=\d\.\d)\./, "")) + 0.01;
    } else {
        newVersion = parseFloat(pkj.version.replace(/(?<=\d\.\d)\./, "")) + 0.1;
    }

    if (newVersion.toString().length == 4) {
        newVersion = `${newVersion.toString().slice(0, 3)}.${newVersion.toString().slice(3)}`;
    }

    try {
        pkj.version = newVersion;
        pkj.info.version = newVersion;
        fs.writeFileSync(pkjPath, JSON.stringify(pkj, null, "    "));
        console.log("Updated package.json version to:", newVersion);
    } catch (e) {
        console.error(`\x1b[1;91mError while updating package.json: ${e} \x1b[0m `);
    }
    console.log(`--------------------------------------------------------------------------------`);
}

run();
