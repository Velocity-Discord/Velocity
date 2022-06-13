const path = require("path");
const fs = require("fs");
const asar = require("asar");

console.log("\x1b[1;94mVelocity \x1b[0m");
console.log("Watching for changes...");

// beacause fs -_-
let timeout;

fs.watch(path.join(__dirname, "../src"), { recursive: true }, async (eventType, filename) => {
    if (timeout) return;
    timeout = setTimeout(() => {
        timeout = null;
    }, 100);

    let startTime = Date.now();
    if (filename.endsWith(".js") || filename.endsWith(".css")) {
        console.log(`--------------------------------------------------------------------------------`);
        console.log(`Change detected in ${filename}. Rebuilding asar...`);
        try {
            await asar.createPackage(path.join(__dirname, "../src"), path.join(__dirname, "../dist/velocity.asar"));
            console.log(`\x1b[1;92mDone! Generated new asar in ${Date.now() - startTime}ms \x1b[0m `);
        } catch (e) {
            console.error(`\x1b[1;91mError while rebuilding asar: ${e} \x1b[0m `);
        }
        console.log(`--------------------------------------------------------------------------------`);
    }
});
