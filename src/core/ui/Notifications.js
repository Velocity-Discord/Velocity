/**
 * @type {Api}
 */
const VApi = window.VApi;

const { WebpackModules, React, modals } = VApi;

const Buttons = WebpackModules.find(["ButtonColors"]);

module.exports = new (class NotificationManager {
    /**
     * Shows a Toast
     * @param {string} content - The Toast Content.
     * @param {object} [options] - Type Color and Timeout=3000
     */
    async showToast(title, content, options = {}) {
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
    showConfirmationModal(title, content, options = {}) {
        const Markdown = WebpackModules.find((m) => m.default?.displayName === "Markdown" && m.default.rules).default;
        const ConfirmationModal = WebpackModules.find("ConfirmModal").default;

        const emptyFunction = () => {};
        const { onConfirm = emptyFunction, onCancel = emptyFunction, confirmText = "Okay", cancelText = "Cancel", danger = false, key = undefined } = options;

        if (!Array.isArray(content)) content = [content];
        content = content.map((c) => (typeof c === "string" ? React.createElement(Markdown, null, c) : c));

        return modals.open(
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
})();
