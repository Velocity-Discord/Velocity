"use strict";var e=require("electron"),r=require("path"),i=require("fs"),t=require("https");function n(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var s=n(e),o=n(r),c=n(i),a=n(t);const l=require("fs"),u=require("original-fs"),d=require("path"),y=require("sucrase"),f=require("electron"),p={openPath:f.shell.openPath},S=e=>{if(!e.startsWith(process.env.VELOCITY_DIRECTORY))throw new Error("Blocked access of files outside of Velocity directories.")};var w={Meta:{version:"2.0.2",hash:"a68e77"},modules:{fs:{rmSync:(...e)=>(S(e[0]),l.rmSync(...e)),mkdirSync:(...e)=>(S(e[0]),l.mkdirSync(...e)),existsSync:(...e)=>(S(e[0]),l.existsSync(...e)),readFileSync:(...e)=>(S(e[0]),l.readFileSync(...e)),writeFileSync:(...e)=>(S(e[0]),l.writeFileSync(...e)),readdir:(...e)=>(S(e[0]),l.readdir(...e)),writeFile:(...e)=>(S(e[0]),l.writeFile(...e)),promises:{rm:(...e)=>(S(e[0]),l.promises.rm(...e)),writeFile:(...e)=>(S(e[0]),l.promises.writeFile(...e))}},path:d,shell:p,sucrase:y,originalFs:{existsSync:(...e)=>(S(e[0]),u.existsSync(...e)),writeFileSync:(...e)=>(S(e[0]),u.writeFileSync(...e))},ipcRenderer:f.ipcRenderer},async request(e,r={},i){let t,n,s="",o="function"==typeof r?{}:r,c="function"==typeof r?r:i;const l=new Promise(((r,i)=>{const c=a.default.request(e,o,(e=>{n=e,e.on("data",(e=>{s+=e})),e.on("end",(()=>{r()}))}));c.on("error",(e=>{t=!0,i()})),c.end()}));return await l,c&&c(t,n,s),s},get baseDir(){return process.env.VELOCITY_DIRECTORY}};const h=process.env.DISCORD_PRELOAD;h&&require(h),s.default.contextBridge.exposeInMainWorld("VelocityCore",w),s.default.webFrame.executeJavaScript(`(async () => {try{${c.default.readFileSync(o.default.join(__dirname,"renderer.js"),"utf8")}}catch(e){console.error(e)}})(window)//# sourceURL=Velocity`);
