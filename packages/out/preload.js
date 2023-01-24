"use strict";var e=require("electron"),r=require("path"),t=require("fs"),i=require("https");function n(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var o=n(e),c=n(r),s=n(t),a=n(i);const l=require("fs"),u=require("original-fs"),d=require("path"),f=require("sucrase"),p=require("electron"),y={openPath:p.shell.openPath},w=e=>{if(!e.startsWith(process.env.VELOCITY_DIRECTORY))throw new Error("Blocked access of files outside of Velocity directories.")};var h={Meta:{version:"2.0.7",hash:"ef038b"},modules:{fs:{rmSync:(...e)=>(w(e[0]),l.rmSync(...e)),mkdirSync:(...e)=>(w(e[0]),l.mkdirSync(...e)),existsSync:(...e)=>(w(e[0]),l.existsSync(...e)),readFileSync:(...e)=>(w(e[0]),l.readFileSync(...e)),writeFileSync:(...e)=>(w(e[0]),l.writeFileSync(...e)),readdir:(...e)=>(w(e[0]),l.readdir(...e)),writeFile:(...e)=>(w(e[0]),l.writeFile(...e)),promises:{rm:(...e)=>(w(e[0]),l.promises.rm(...e)),writeFile:(...e)=>(w(e[0]),l.promises.writeFile(...e))}},path:d,shell:y,sucrase:f,originalFs:{existsSync:(...e)=>(w(e[0]),u.existsSync(...e)),writeFileSync:(...e)=>(w(e[0]),u.writeFileSync(...e))},ipcRenderer:p.ipcRenderer},async request(e,r={},t){let i,n,o="",c="function"==typeof r?{}:r,s="function"==typeof r?r:t;const l=new Promise(((r,t)=>{const s=a.default.request(e,c,(e=>{n=e,e.on("data",(e=>{o+=e})),e.on("end",(()=>{r()}))}));s.on("error",(e=>{i=!0,t()})),s.end()}));return await l,s&&s(i,n,o),o},get baseDir(){return process.env.VELOCITY_DIRECTORY}};const S=process.env.DISCORD_PRELOAD;S&&require(S),e.webFrame.top.executeJavaScript(`(${function(){const e="webpackChunkdiscord_app",r=function(e,r,t){const i=e[r];Object.defineProperty(e,r,{get:()=>i,set(i){Object.defineProperty(e,r,{value:i,configurable:!0,enumerable:!0,writable:!0});try{t(i)}catch(e){console.error(e)}return i},configurable:!0})};Reflect.has(window,e)||r(window,e,(e=>{r(e,"push",(()=>{e.push([[Symbol()],{},e=>{e.d=(e,r)=>{for(const t in r)Reflect.has(r,t)&&!e[t]&&Object.defineProperty(e,t,{get:()=>r[t](),set:e=>{r[t]=()=>e},enumerable:!0,configurable:!0})}}]),e.pop()}))}))}})()`),o.default.contextBridge.exposeInMainWorld("VelocityCore",h),o.default.webFrame.executeJavaScript(`(async () => {try{${s.default.readFileSync(c.default.join(__dirname,"renderer.js"),"utf8")}}catch(e){console.error(e)}})(window)//# sourceURL=Velocity`);
