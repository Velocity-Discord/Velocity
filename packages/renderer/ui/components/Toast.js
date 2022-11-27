import { injectComponentStyle } from "../../util/components";

injectComponentStyle("toast", {
    ".velocity-toast": {
        backgroundColor: "var(--background-floating)",
        borderRadius: "5px",
        padding: "10px 15px",
        color: "var(--header-primary)",
        zIndex: "1",
        fontSize: "16px",
        fontWeight: "500",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        pointerEvents: "all",
        width: "fit-content",
    },
    ".velocity-toast.color-velocity": {
        backgroundColor: "#5B88FC",
    },
    ".velocity-toast.color-success": {
        backgroundColor: "#43B581",
    },
    ".velocity-toast.color-error": {
        backgroundColor: "#F04747",
    },
    ".velocity-toast.color-warning": {
        backgroundColor: "#FAA61A",
    },
});

export default (props) => {
    const { children, color } = props;

    return <div className={`velocity-toast color-${color}`}>{children}</div>;
};
