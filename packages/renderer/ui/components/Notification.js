import { injectComponentStyle } from "../../util/components";
import webpack from "../../modules/webpack";

injectComponentStyle("notification", {
    ".velocity-notification": {
        backgroundColor: "var(--velocity-notification-background, var(--background-floating))",
        borderRadius: "5px",
        padding: "15px",
        color: "var(--header-primary)",
        backdropFilter: "blur(var(--velocity-notification-blur))",
        zIndex: "1",
        maxWidth: "325px",
        width: "fit-content",
        borderLeft: "5px solid #fff",
        transition: "all 0.2s ease",
        pointerEvents: "all",
    },
    ".velocity-notification.color-velocity": {
        borderColor: "#5B88FC",
    },
    ".velocity-notification.color-success": {
        borderColor: "#43B581",
    },
    ".velocity-notification.color-error": {
        borderColor: "#F04747",
    },
    ".velocity-notification.color-warning": {
        borderColor: "#FAA61A",
    },
    ".notification-title": {
        fontSize: "16px",
        fontWeight: "600",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    ".notification-close": {
        cursor: "pointer",
        fontSize: "16px",
        backgroundColor: "transparent",
        border: "none",
        color: "var(--interactive-normal)",
        transition: "color 0.2s ease",
    },
    ".notification-close:hover": {
        color: "var(--interactive-hover)",
    },
    ".notification-content": {
        fontSize: "14px",
        marginTop: "5px",
        color: "var(--header-secondary)",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    ".notification-buttons": {
        display: "grid",
        marginTop: "10px",
        gap: "5px",
        gridTemplateColumns: "repeat(var(--buttons, 1), 1fr )",
    },
});

export default () => {
    return React.forwardRef((props, ref) => {
        const { title, color, children, buttons, id, onContextMenu, close } = props;

        const Button = webpack.common.Components.ButtonModules.default;
        const ButtonColors = webpack.common.Components.ButtonModules.ButtonColors;
        const ButtonSizes = webpack.common.Components.ButtonModules.ButtonSizes;

        return (
            <div onContextMenu={onContextMenu} className={`velocity-notification color-${color}`} ref={ref}>
                <div className="notification-title">
                    {title}
                    <button
                        className="notification-close"
                        onClick={() => {
                            close();
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z"></path>
                        </svg>
                    </button>
                </div>
                <div className="notification-content">{children}</div>
                {buttons.length ? (
                    <div
                        className="notification-buttons"
                        style={{
                            "--buttons": buttons.length,
                        }}
                    >
                        {buttons.map((btn) => {
                            return (
                                <Button size={ButtonSizes.TINY} color={ButtonColors[btn.color] || ButtonColors["BRAND"]} onClick={btn.action} disabled={btn.disabled}>
                                    {btn.label}
                                </Button>
                            );
                        })}
                    </div>
                ) : null}
            </div>
        );
    });
};
