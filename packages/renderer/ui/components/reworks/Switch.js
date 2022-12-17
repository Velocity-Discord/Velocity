import { injectComponentStyle } from "../../../util/components";

injectComponentStyle("switch", {
    ".velocity-switch": {
        position: "relative",
        width: "40px",
        height: "24px",
        borderRadius: "14px",
        cursor: "pointer",
        opacity: "1",
        backgroundColor: "rgb(114, 118, 125)",
        transition: "250ms cubic-bezier(0, 0.3, 0.7, 1) background-color",
    },
    ".velocity-switch-disabled": {
        opacity: "0.5",
        backgroundColor: "rgb(114, 118, 125)",
    },
    ".velocity-switch-checked": {
        opacity: "1",
        backgroundColor: "rgb(59, 165, 92)",
    },
    ".velocity-switch input": {
        position: "absolute",
        opacity: "0",
        width: "100%",
        height: "100%",
        borderRadius: "14px",
        cursor: "pointer",
    },
    ".velocity-switch svg": {
        pointerEvents: "none",
        display: "block",
        position: "absolute",
        left: "-5px",
        width: "28px",
        height: "18px",
        margin: "3px",
        transition: "250ms cubic-bezier(0, 0.3, 0.7, 1)",
    },
    ".velocity-switch-checked svg": {
        left: "12px",
    },
    ".velocity-switch svg path": {
        color: "rgb(114, 118, 125)",
        transition: "250ms cubic-bezier(0, 0.3, 0.7, 1)",
    },
    ".velocity-switch-checked svg path": {
        color: "rgb(59, 165, 92)",
    },
});

export default (props) => {
    const { checked, disabled } = props;

    const [state, setState] = React.useState(checked);

    return (
        <div className={`velocity-switch ${disabled ? "velocity-switch-disabled" : ""} ${state ? "velocity-switch-checked" : ""}`}>
            <input
                type="checkbox"
                disabled={disabled}
                checked={state}
                onChange={() => {
                    if (disabled) return;
                    setState(!state);
                    props.action?.(!state);
                }}
            />
            <svg className="velocity-switch-slider" viewBox="0 0 28 20">
                <rect fill="white" x="4" y="0" height="20" width="20" rx="10" />
                <svg viewBox="0 0 20 20" fill="none">
                    {state ? (
                        <path fill="currentColor" d="M7.89561 14.8538L6.30462 13.2629L14.3099 5.25755L15.9009 6.84854L7.89561 14.8538Z M4.08643 11.0903L5.67742 9.49929L9.4485 13.2704L7.85751 14.8614L4.08643 11.0903Z" />
                    ) : (
                        <path
                            fill="currentColor"
                            d="M5.13231 6.72963L6.7233 5.13864L14.855 13.2704L13.264 14.8614L5.13231 6.72963Z M13.2704 5.13864L14.8614 6.72963L6.72963 14.8614L5.13864 13.2704L13.2704 5.13864Z"
                        ></path>
                    )}
                </svg>
            </svg>
        </div>
    );
};
