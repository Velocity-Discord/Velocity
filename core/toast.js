async function showToast(content, options = {}) {
    const container = document.getElementById("velocity-toasts");
    const { strong = "", type = "", timeout = 3000, color = "" } = options;

    const toast = document.createElement("div");
    toast.classList.add("velocity-toast");
    if (type) {
        toast.classList.add(`type-${type}`);
    }
    if (strong) {
        const Strong = document.createElement("strong");
        Strong.innerHTML = strong;
        const Content = document.createTextNode(content);
        toast.appendChild(Content);
        toast.appendChild(Strong);
    } else {
        toast.innerHTML = content;
    }
    setTimeout(() => {
        toast.classList.add("closing");
        setTimeout(() => {
            toast.remove();
        }, 700);
    }, timeout);
    if (color) {
        toast.style.color = color;
    }
    container.appendChild(toast);

    return;
};

module.exports = showToast;