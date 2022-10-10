import { notifications, toasts, injectComponentStyle } from "../util/components";
import Notif from "../ui/components/Notification";
import Toast from "../ui/components/Toast";
import WebpackModules from "./webpack";

const { spring } = VelocityCore.pseudoRequire("unsafe:react-flip-toolkit");

injectComponentStyle("notifications", {
    "velocity-notifications": {
        position: "fixed",
        right: "15px",
        top: "15px",
        zIndex: "3000",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "10px",
        transition: "all 0.2s ease",
        pointerEvents: "none",
    },
    "velocity-toasts": {
        position: "fixed",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        alignItems: "center",
        marginTop: "15px",
        width: "100%",
        zIndex: "3000",
        pointerEvents: "none",
        transition: "all 0.2s ease",
        pointerEvents: "none",
    },
});

let NotifId = 0;

export const showNotification = (props = {}) => {
    const { title = "", content = "", buttons = [], type = "" } = props;

    NotifId++;

    const _id = NotifId;

    const newNotif = document.createElement("div");
    newNotif.classList.add("velocity-notification-container");
    newNotif.setAttribute("id", `velocity-notification-${_id}`);
    notifications.appendChild(newNotif);

    ReactDOM.render(
        <Notif id={_id} color={type} title={title} buttons={buttons}>
            {content}
        </Notif>,
        newNotif
    );

    newNotif.style.opacity = 0;

    spring({
        config: "noWobble",
        values: {
            translateY: [-15, 0],
            opacity: [0, 1],
        },
        delay: Array.from(document.querySelectorAll(".velocity-notification-container")).findIndex((n) => n.id == `velocity-notification-${_id}`) * 35,
        onUpdate: ({ translateY, opacity }) => {
            newNotif.style.opacity = opacity;
            newNotif.style.transform = `translateY(${translateY}px)`;
        },
    });

    return () => {
        const ele = document.getElementById(`velocity-notification-${_id}`);
        spring({
            config: "noWobble",
            values: {
                translateY: [0, -15],
                opacity: [1, 0],
            },
            onUpdate: ({ translateY, opacity }) => {
                ele.style.opacity = opacity;
                ele.style.transform = `translateY(${translateY}px)`;
            },
            delay: Array.from(document.querySelectorAll(".velocity-notification-container")).findIndex((n) => n.id == `velocity-notification-${_id}`) * 35,
            onComplete: () => {
                ReactDOM.unmountComponentAtNode(ele);
                ele.remove();
            },
        });
    };
};

let ToastId = 0;

export const showToast = (content, options = {}) => {
    const { type = "", timeout = 1200 } = options;

    ToastId++;

    const newToast = document.createElement("div");
    newToast.setAttribute("id", `velocity-toast-${ToastId}`);
    newToast.classList.add("velocity-toast-container");
    toasts.appendChild(newToast);

    ReactDOM.render(
        <Toast id={ToastId} color={type}>
            {content}
        </Toast>,
        newToast
    );

    newToast.style.opacity = 0;

    spring({
        config: "noWobble",
        values: {
            translateY: [-15, 0],
            opacity: [0, 1],
        },
        delay: Array.from(document.querySelectorAll(".velocity-toast-container")).findIndex((n) => n.id == `velocity-toast-${ToastId}`) * 35,
        onUpdate: ({ translateY, opacity }) => {
            newToast.style.opacity = opacity;
            newToast.style.transform = `translateY(${translateY}px)`;
        },
    });

    setTimeout(() => {
        spring({
            config: "noWobble",
            values: {
                translateY: [0, -15],
                opacity: [1, 0],
            },
            onUpdate: ({ translateY, opacity }) => {
                newToast.style.opacity = opacity;
                newToast.style.transform = `translateY(${translateY}px)`;
            },
            delay: Array.from(document.querySelectorAll(".velocity-toast-container")).findIndex((n) => n.id == `velocity-toast-${ToastId}`) * 35,
            onComplete: () => {
                ReactDOM.unmountComponentAtNode(newToast);
                newToast.remove();
            },
        });
    }, timeout);
};

export const showConfirmationModal = (options = {}) => {
    const { Components, Actions } = WebpackModules.common;

    const { danger, title = "", content = "", confirmText = "Confirm", cancelText = "Cancel", onConfirm = () => {}, onCancel = () => {} } = options;

    let children = content;

    const ButtonColors = Components.ButtonModules.ButtonColors;
    const ConfirmModal = Components.ConfirmModal.default;
    const Markdown = Components.Markdown.default;
    const ModalActions = Actions.ModalActions;

    if (!Array.isArray(children)) children = [content];
    children = children.map((c) => (typeof c === "string" ? <Markdown>{c}</Markdown> : c));

    return ModalActions.openModal((props) => (
        <ConfirmModal {...props} header={title} confirmText={confirmText} cancelText={cancelText} onConfirm={onConfirm} onCancel={onCancel} confirmButtonColor={danger ? ButtonColors.RED : ButtonColors.BRAND}>
            {children}
        </ConfirmModal>
    ));
};
