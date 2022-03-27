/**
 * Shows a Toast
 * @param {string} content - The Toast Content.
 * @param {object} [options] - Type Color and Timeout=3000
 */
async function showToast(content, options = {}) {
    const container = document.querySelector("velocity-toasts");
    const { type = "", timeout = 3000, color = "" } = options;

    const toast = document.createElement("div");
    toast.classList.add("velocity-toast");
    if (type) {
        toast.classList.add(`type-${type}`);
    }

    toast.innerHTML = content;

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