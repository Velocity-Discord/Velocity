import { head } from "../util/components";

export const injectCSS = (id, css) => {
    let identifier = `velocity-style-${id.replace(/[^a-zA-Z0-9]/g, "-")}`;

    if (document.getElementById(identifier)) return;

    let style = document.createElement("style");
    style.id = identifier;
    style.innerHTML = css;
    head.appendChild(style);

    return identifier;
};

export const removeCSS = (id) => {
    let identifier = `velocity-style-${id.replace(/[^a-zA-Z0-9]/g, "-")}`;

    let style = document.getElementById(identifier);
    if (style) style.remove();
};
