"use strict";var e=require("electron"),a=require("module"),n=require("path"),t=require("fs"),r=require("electron-devtools-installer");function s(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var o=s(e),i=s(a),l=s(n),d=s(t),c=s(r);d.default.existsSync(n.join(__dirname,"../../data"))||d.default.mkdirSync(n.join(__dirname,"../../data")),d.default.existsSync(n.join(__dirname,"../../data/config.json"))||d.default.writeFileSync(n.join(__dirname,"../../data/config.json"),JSON.stringify({}));const p=JSON.parse(d.default.readFileSync(n.join(__dirname,"../../data/config.json"),"utf8"));class u extends o.default.BrowserWindow{constructor(e){if(!e||!e.webPreferences||!e.webPreferences.preload||process.argv.includes("--vanilla"))return super(e);const a=e.webPreferences.preload;return process.env.DISCORD_PRELOAD=a,e={...e,webPreferences:{...e.webPreferences,preload:e.title&&e.webPreferences&&e.webPreferences.nativeWindowOpen?n.join(__dirname,"preload.js"):n.join(__dirname,"preloadSplash.js"),devTools:!0},transparent:!!p.Transparency,backgroundColor:"#00000000",vibrancy:p.Vibrancy?"hud":void 0,visualEffectState:p.Vibrancy?"active":void 0},new o.default.BrowserWindow(e)}}var f="velocity:handle-kill";process.env.VELOCITY_DIRECTORY=l.default.join(__dirname,"../../"),o.default.app.commandLine.appendSwitch("no-force-async-hooks-checks"),o.default.app.on("ready",(()=>{c.default(r.REACT_DEVELOPER_TOOLS),o.default.session.defaultSession.webRequest.onHeadersReceived((function({responseHeaders:e},a){for(const a of Object.keys(e))a.includes("content-security-policy")&&delete e[a];a({cancel:!1,responseHeaders:e})})),e.ipcMain.handle(f,(()=>{o.default.dialog.showMessageBox({type:"warning",title:"Process Exited",message:"The Discord process has been killed."}),process.exit(1)}))}));const _=require.resolve("electron");delete require.cache[_]?.exports,require.cache[_].exports={...o.default,BrowserWindow:u};const g="DANGEROUS_ENABLE_DEVTOOLS_ONLY_ENABLE_IF_YOU_KNOW_WHAT_YOURE_DOING";global.appSettings||(global.appSettings={}),global.appSettings?.settings||(global.appSettings.settings={});const S=global.appSettings.settings;global.appSettings.settings=new Proxy(S,{get:(e,a)=>a===g||e[a],set:(e,a,n)=>(a===g||(e[a]=n),!0)}),function(){const e=l.default.join(process.resourcesPath,"app.asar"),a=JSON.parse(d.default.readFileSync(l.default.join(e,"package.json"),"utf8"));o.default.app.setAppPath(e),o.default.app.name=a.name,i.default._load(l.default.join(e,a.main),null,!0)}();
