"use strict";var e=require("fs"),n=require("path");e.existsSync(n.join(__dirname,"../../data"))||e.mkdirSync(n.join(__dirname,"../../data")),e.existsSync(n.join(__dirname,"../../data/config.json"))||e.writeFileSync(n.join(__dirname,"../../data/config.json"),JSON.stringify({}));const t=JSON.parse(e.readFileSync(n.join(__dirname,"../../data/config.json"),"utf8")),i=process.env.DISCORD_PRELOAD;i&&require(i);const o=()=>{const i=t.enabledThemes||[],o=t.editorTabs?.filter((e=>"css"===e.language));document.body.classList.add("velocity-splash"),i.forEach((t=>{console.log(`[Velocity] Injecting theme ${t.name}...`);const i=require(`../../themes/${t}/velocity_manifest.json`),o=e.readFileSync(n.join(__dirname,"../../themes",t,i.main),"utf8"),a=document.createElement("style");a.id="velocity-theme",a.innerHTML=o,document.head.appendChild(a)})),o.forEach((e=>{console.log(`[Velocity] Injecting snippet ${e.name}...`);const n=e.content,t=document.createElement("style");t.id="velocity-snippet",t.innerHTML=n,document.head.appendChild(t)}))};"loading"===document.readyState?document.addEventListener("DOMContentLoaded",o):o();
