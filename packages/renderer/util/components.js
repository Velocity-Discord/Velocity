export const head = document.createElement("velocity-head");
export const components = document.createElement("velocity-component-styles");
export const themes = document.createElement("velocity-themes");
export const snippets = document.createElement("velocity-snippets");
export const toasts = document.createElement("velocity-toasts");
export const notifications = document.createElement("velocity-notifications");
export const body = document.createElement("velocity-body");

new Promise((resolve) => {
    if (document.readyState === "complete") resolve();
    else window.addEventListener("load", resolve);
}).then(() => {
    document.head.appendChild(head);
    document.body.appendChild(body);
    head.appendChild(components);
    head.appendChild(themes);
    head.appendChild(snippets);
    body.appendChild(notifications);
    body.appendChild(toasts);
});

const formatProperty = (property) => {
    return property.replace(/([A-Z])/g, (match) => `-${match[0].toLowerCase()}`);
};

export const injectComponentStyle = (name, styles) => {
    let style = document.createElement("style");
    style.setAttribute("id", `velocity-component-${name}-style`);

    for (const className in styles) {
        let css = "";
        for (const property in styles[className]) {
            css += `${formatProperty(property)}: ${styles[className][property]};`;
        }
        style.innerHTML += `${className} { ${css} }`;
    }
    components.appendChild(style);
};
