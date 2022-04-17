const Buttons = VApi.getModule.find(["ButtonColors"]);

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
}

/**
 * Shows a Confirm Modal
 * @param {string} title - The Toast Content.
 * @param {object} [options] - Type Color and Timeout=3000
 */
function showConfirmationModal(title, content, options = {}) {
    const { React } = VApi;
    const Markdown = VApi.getModule.find((m) => m.default?.displayName === "Markdown" && m.default.rules).default;
    const ConfirmationModal = VApi.getModule.find("ConfirmModal").default;

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
