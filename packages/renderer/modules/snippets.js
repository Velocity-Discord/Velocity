import { showToast } from "./notifications";
import { snippets } from "../util/components";
import { Stream } from "./datastore";
import logger from "../util/logger";

const Settings = Stream("config");
const Logger = new logger("Snippets");

const sucrase = VelocityCore.pseudoRequire("sucrase");

export const runSnippets = (type) => {
    Settings.editorTabs.forEach((tab) => {
        switch (tab?.language) {
            case "js":
                if (type == "css") return;

                try {
                    const code = sucrase.transform(tab.content, {
                        transforms: ["jsx"],
                    }).code;

                    new Function("Velocity", "VelocityCore", code)(Velocity, VelocityCore);
                } catch (e) {
                    showToast(`Error running snippet '${tab.name}'`, { type: "error" });
                    Logger.error(`Error running snippet '${tab.name}'.`, e);
                }

                break;
            case "css":
                if (type == "js") return;

                const style = document.createElement("style");
                style.setAttribute("id", `velocity-snippet-${tab.name}-style`);
                style.innerHTML = tab.content;
                snippets.appendChild(style);
                break;
        }
    });
};

export const updateSnippets = () => {
    const cssSnippets = snippets.querySelectorAll("style[id^='velocity-snippet-'][id$='-style']");
    cssSnippets.forEach((snippet) => snippet.remove());

    runSnippets("css");
};
