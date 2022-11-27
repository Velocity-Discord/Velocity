import { ToastContainer, NotificationContainer } from "../ui/components/NotificationContainers";
import { notifications, toasts, injectComponentStyle } from "../util/components";
import { useContextMenu } from "../util/contextMenu";
import ObservableArray from "../structs/array";
import WebpackModules from "./webpack";

injectComponentStyle("notifications", {
    ".velocity-notification-wrapper": {
        position: "fixed",
        right: "15px",
        top: "15px",
        zIndex: "1001",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        transition: "all 0.2s ease",
        pointerEvents: "none",
    },
    ".velocity-toast-wrapper": {
        position: "fixed",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "15px",
        width: "100%",
        zIndex: "3000",
        pointerEvents: "none",
        transition: "all 0.2s ease",
        pointerEvents: "none",
    },
});

let ToastId = 0;
const Toasts = new ObservableArray();

export const initialiseToasts = () => {
    ReactDOM.render(<ToastContainer toasts={Toasts} />, toasts);
};

export const showToast = (content, options = {}) => {
    const { type = "", timeout = 3000 } = options;

    ToastId++;

    const id = ToastId;

    const newToast = {
        color: type,
        id: id,
        children: content,
        timeout,
    };

    Toasts.push(newToast);
};

let NotifId = 0;
const Notifs = new ObservableArray();

export const initialiseNotifications = () => {
    ReactDOM.render(<NotificationContainer notifications={Notifs} />, notifications);
};

export const showNotification = (props = {}) => {
    const { title = "", content = "", buttons = [], type = "" } = props;

    NotifId++;

    const id = NotifId;

    const newNotif = {
        id: id,
        color: type,
        title: title,
        buttons: buttons,
        children: content,
        close: () => {
            Notifs.splice(Notifs.indexOf(newNotif), 1);
        },
        onContextMenu: (e) =>
            useContextMenu(e, [
                {
                    label: "Close",
                    action: () => {
                        Notifs.splice(Notifs.indexOf(newNotif), 1);
                    },
                },
                {
                    label: "Close All",
                    color: "Danger",
                    action: () => {
                        Notifs.splice(0, Notifs.length);
                    },
                },
            ]),
    };

    Notifs.push(newNotif);
};

export const showConfirmationModal = (options = {}) => {
    const { Components, Actions, Classes } = WebpackModules.common;

    const { title = "", content = "", confirmText = "Confirm", cancelText = "Cancel", onConfirm = () => {}, onCancel = () => {}, danger = false } = options;

    const Text = Components.Text.default;
    const ModalActions = Actions.ModalActions;
    const Markdown = Components.Markdown.default;
    const ModalElements = Components.ModalElements;
    const Button = Components.ButtonModules.default;
    const ButtonLooks = Components.ButtonModules.ButtonLooks;
    const ButtonColors = Components.ButtonModules.ButtonColors;

    return ModalActions.openModal((props) => (
        <ModalElements.ModalRoot {...props}>
            <ModalElements.ModalHeader separator={false}>
                <Text size={Text.Sizes.SIZE_20} color={Text.Colors.HEADER_PRIMARY} className={Classes.Titles.h1}>
                    {title}
                </Text>
            </ModalElements.ModalHeader>
            <ModalElements.ModalContent className="velocity-modal-content">{typeof content == "string" ? <Markdown className="velocity-modal-content">{content}</Markdown> : content}</ModalElements.ModalContent>
            <ModalElements.ModalFooter>
                <Button
                    color={danger ? ButtonColors.RED : ButtonColors.BRAND}
                    onClick={(e) => {
                        onConfirm(e);
                        props.onClose();
                    }}
                >
                    {confirmText}
                </Button>
                <Button
                    color={ButtonColors.PRIMARY}
                    look={ButtonLooks.LINK}
                    onClick={(e) => {
                        onCancel(e);
                        props.onClose();
                    }}
                >
                    {cancelText}
                </Button>
            </ModalElements.ModalFooter>
        </ModalElements.ModalRoot>
    ));
};
