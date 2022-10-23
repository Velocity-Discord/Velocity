import webpack from "../../modules/webpack";
import Notification from "./Notification";
import Toast from "./Toast";

export const ToastContainer = (props) => {
    const { toasts } = props;

    const [realToasts, setRealToasts] = React.useState(toasts);

    const { useTransition, animated } = webpack.common.ReactSpring;

    const update = (value) => {
        setRealToasts([...value]);
    };

    React.useEffect(() => {
        toasts.addListener(update);

        toasts.forEach((toast) => {
            if (toast.timeout) {
                toast.timeSet = true;
                const time = setTimeout(() => {
                    toasts.splice(
                        toasts.findIndex((i) => i.id === toast.id),
                        1
                    );

                    setRealToasts(toasts);
                    clearTimeout(time);
                }, toast.timeout);
            }
        });

        return () => {
            toasts._removeListener(update);
        };
    });

    const t = useTransition(realToasts, {
        from: { translateY: -15, opacity: 0, height: 0, marginTop: 0 },
        enter: { translateY: 0, opacity: 1, height: 36, marginTop: 10 },
        leave: { translateY: -15, opacity: 0, height: 0, marginTop: 0 },
        config: {
            mass: 1,
            tension: 185,
            friction: 26,
        },
    });

    return (
        <div className="velocity-toast-wrapper">
            {t((style, item) => {
                return (
                    <animated.div className="velocity-toast-container-item" style={style}>
                        <Toast {...item} />
                    </animated.div>
                );
            })}
        </div>
    );
};

export default ToastContainer;

export const NotificationContainer = (props) => {
    const { notifications } = props;

    const { useTransition, animated } = webpack.common.ReactSpring;

    const [realNotifications, setRealNotifications] = React.useState(notifications);

    const Notif = Notification();

    const update = (value) => {
        setRealNotifications([...value]);
    };

    const ref = React.useRef(null);

    React.useEffect(() => {
        notifications.addListener(update);

        notifications.forEach((notification) => {
            if (notification.timeout) {
                notification.timeSet = true;
                const time = setTimeout(() => {
                    notifications.splice(
                        notifications.findIndex((i) => i.id === notification.id),
                        1
                    );

                    setRealNotifications(notifications);
                    clearTimeout(time);
                }, notification.timeout);
            }
        });

        return () => {
            notifications._removeListener(update);
        };
    });

    const t = useTransition(realNotifications, {
        from: { translateY: -15, opacity: 0, height: 0, marginTop: 0 },
        enter: (item) => async (next) => {
            await next({ translateY: 0, opacity: 1, height: ref.current ? ref.current.clientHeight : 0, marginTop: 10 });
        },
        leave: { translateY: -15, opacity: 0, height: 0, marginTop: 0 },
        config: {
            mass: 1,
            tension: 185,
            friction: 26,
        },
    });

    return (
        <div className="velocity-notification-wrapper">
            {t((style, item) => {
                return (
                    <animated.div className="velocity-notification-container-item" style={style}>
                        <Notif {...item} ref={ref} />
                    </animated.div>
                );
            })}
        </div>
    );
};
