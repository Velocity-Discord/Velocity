import Velocity from "../../../modules/velocity";
import { injectComponentStyle } from "../../../util/components";

import FormTitle from "../reworks/FormTitle";
import Caret from "../reworks/Caret";

injectComponentStyle("setting-section", {
    ".velocity-setting-section": {
        display: "flex",
        color: "var(--header-secondary)",
        alignItems: "center",
        gap: "5px",
    },
    ".velocity-setting-section svg": {
        transition: "all 0.2s ease",
    },
    ".velocity-setting:not(.velocity-switch-setting)": {
        paddingBlock: "15px",
        borderBottom: "thin solid var(--background-modifier-accent)",
    },
    ".velocity-switch-setting": {
        paddingTop: "15px",
    },
    ".velocity-setting:not(.velocity-switch-setting):last-child": {
        borderBottom: "none",
        paddingBottom: "0",
    },
});

const { WebpackModules } = Velocity;

export default (props) => {
    const { title, children, collapsable = true } = props;

    const [collapsed, setCollapsed] = React.useState(false);

    return [
        <div
            className="velocity-setting-section"
            onClick={() => {
                setCollapsed(!collapsed);
            }}
        >
            {collapsable && <Caret type="right" width={12} height={12} style={{ transform: `rotate(${collapsed ? 0 : 90}deg)` }} />}
            <FormTitle tag="h5" style={{ margin: "0" }}>
                {title}
            </FormTitle>
        </div>,
        collapsed ? null : children,
    ];
};
