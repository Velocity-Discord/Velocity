import { injectComponentStyle } from "../../../util/components";

injectComponentStyle("button-container", {
    ".velocity-button-container": {
        display: "flex",
        gap: "5px",
    },
});

export default (props) => {
    const { children } = props;

    return <div className="velocity-button-container">{children}</div>;
};
