const path = require("path");
const asar = require("asar");

let startTime = Date.now();

(async () => {
    console.log("\x1b[1;94mVelocity \x1b[0m");
    console.log(`--------------------------------------------------------------------------------`);
    console.log(`Building asar...`);
    try {
        await asar.createPackage(path.join(__dirname, "../src"), path.join(__dirname, "../dist/velocity.asar"));
        console.log(`\x1b[1;92mDone! Generated new asar in ${Date.now() - startTime}ms \x1b[0m `);
    } catch (e) {
        console.error(`\x1b[1;91mError while rebuilding asar: ${e} \x1b[0m `);
    }
    console.log(`--------------------------------------------------------------------------------`);
})();
