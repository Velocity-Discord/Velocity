import { injectComponentStyle } from "../../util/components";

injectComponentStyle("component-preview", {
    ".velocity-component-preview": {
        backgroundColor: "var(--background-secondary)",
        color: "var(--header-primary)",
        marginBlock: "8px 10px",
        padding: "20px",
        borderRadius: "5px",
        fontSize: "16px",
        fontWeight: "500",
        display: "flex",
        width: "100%",
        zIndex: "1",
    },
});

export default (props) => {
    const { children } = props;

    return <div className="velocity-component-preview">{children}</div>;
};
