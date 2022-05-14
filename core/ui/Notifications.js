const Buttons = VApi.WebpackModules.find(["ButtonColors"]);

/**
 * Shows a Toast
 * @param {string} content - The Toast Content.
 * @param {object} [options] - Type Color and Timeout=3000
 */
async function showToast(title, content, options = {}) {
    const container = document.querySelector("velocity-toasts");
    const { type = "", timeout = 3000, color = "" } = options;
    let time1, time2;

    const toast = document.createElement("div");
    toast.classList.add("velocity-toast");
    if (type) {
        toast.classList.add(`type-${type}`);
    }

    toast.innerHTML = `
    <button class="velocity-toast-close">X</button>
    <div class="velocity-toast-body">${content || ""}</div>
    <div class="velocity-toast-title">${title || ""}</div>
    `;

    const closeToast = () => {
        toast.classList.add("closing");
        time1 = setTimeout(() => {
            toast.remove();

            clearTimeout(time1);
        }, 160);
    };

    toast.firstChild.nextSibling.addEventListener("click", closeToast);

    time2 = setTimeout(() => {
        closeToast();
        clearTimeout(time2);
    }, timeout);

    if (color) {
        toast.style.color = color;
    }

    container.appendChild(toast);

    return;
}

/**
 * Shows a Confirm Modal
 * @param {string} title - The Toast Content.
 * @param {object} [options] - Type Color and Timeout=3000
 */
function showConfirmationModal(title, content, options = {}) {
    const { React } = VApi;
    const Markdown = VApi.WebpackModules.find((m) => m.default?.displayName === "Markdown" && m.default.rules).default;
    const ConfirmationModal = VApi.WebpackModules.find("ConfirmModal").default;

    const emptyFunction = () => {};
    const { onConfirm = emptyFunction, onCancel = emptyFunction, confirmText = "Okay", cancelText = "Cancel", danger = false, key = undefined } = options;

    if (!Array.isArray(content)) content = [content];
    content = content.map((c) => (typeof c === "string" ? React.createElement(Markdown, null, c) : c));

    return VApi.modals.open(
        (props) => {
            return React.createElement(
                ConfirmationModal,
                Object.assign(
                    {
                        header: title,
                        confirmButtonColor: danger ? Buttons.ButtonColors.RED : Buttons.ButtonColors.BRAND,
                        confirmText: confirmText,
                        cancelText: cancelText,
                        onConfirm: onConfirm,
                        onCancel: onCancel,
                        children: [content],
                    },
                    props
                )
            );
        },
        { modalKey: key }
    );
}

module.exports = { showToast, showConfirmationModal };
