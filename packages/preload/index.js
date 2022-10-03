import electron from "electron";
import path from "path";
import fs from "fs";

import core from "./modules/core";

const originalPreload = process.env.DISCORD_PRELOAD;

if (originalPreload) require(originalPreload);

electron.contextBridge.exposeInMainWorld("VelocityCore", core);

electron.webFrame.executeJavaScript(`(async () => {try{${fs.readFileSync(path.join(__dirname, "renderer.js"), "utf8")}}catch(e){console.error(e)}})(window)//# sourceURL=Velocity`);
