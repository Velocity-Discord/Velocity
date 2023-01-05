import { injectComponentStyle } from "./components";
import WebpackModules from "../modules/webpack";

injectComponentStyle("context-menu", {
    ".velocity-context-menu": {
        flexDirection: "column",
    },
    ".velocity-menu-item:hover": {
        backgroundColor: "var(--brand-experiment-560)",
        color: "#fff",
    },
    ".velocity-menu-item .velocity-menu-checkbox": {
        color: "#fff",
    },
    ".velocity-menu-item .velocity-menu-check": {
        color: "var(--brand-experiment-560)",
    },
});

const Menu = (props) => {
    const { Classes } = WebpackModules.common;

    const ContextMenuClasses = Classes.ContextMenu;

    return <div className={`velocity-context-menu ${ContextMenuClasses.scroller} ${ContextMenuClasses.menu} ${ContextMenuClasses.flexible}`}>{props.children}</div>;
};

export const MenuItem = (props) => {
    const { Classes, Actions } = WebpackModules.common;

    const ContextMenuActions = Actions.ContextMenuActions;
    const ContextMenuClasses = Classes.ContextMenu;

    const { type, label, action, color, checked, disabled, onChange, icon } = props;

    const [active, setActive] = React.useState(checked);

    switch (type) {
        case "separator":
            return <div role="separator" className={ContextMenuClasses.separator} />;
        case "check":
            return (
                <div
                    role="menuitem"
                    className={`velocity-menu-item ${disabled ? ContextMenuClasses.disabled : ""} ${ContextMenuClasses.item} ${ContextMenuClasses.labelContainer} ${ContextMenuClasses[`color${color || "Default"}`]}`}
                    onClick={(e) => {
                        if (!disabled && action) action(e);
                        if (onChange) onChange(!active);
                        setActive(!active);
                    }}
                >
                    <div className={ContextMenuClasses.label}>{label}</div>
                    <div className={ContextMenuClasses.iconContainer}>
                        <svg className={ContextMenuClasses.icon} aria-hidden="true" role="img" width="24" height="24" viewBox="0 0 24 24">
                            {active ? (
                                [
                                    <path
                                        fill-rule="evenodd"
                                        clip-rule="evenodd"
                                        d="M5.37499 3H18.625C19.9197 3 21.0056 4.08803 21 5.375V18.625C21 19.936 19.9359 21 18.625 21H5.37499C4.06518 21 3 19.936 3 18.625V5.375C3 4.06519 4.06518 3 5.37499 3Z"
                                        class={`velocity-menu-checkbox ${ContextMenuClasses.checkbox}`}
                                        fill="currentColor"
                                    />,
                                    <path
                                        d="M9.58473 14.8636L6.04944 11.4051L4.50003 12.9978L9.58473 18L19.5 8.26174L17.9656 6.64795L9.58473 14.8636Z"
                                        className={`velocity-menu-check ${ContextMenuClasses.check}`}
                                        fill="currentColor"
                                    />,
                                ]
                            ) : (
                                <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M18.625 3H5.375C4.06519 3 3 4.06519 3 5.375V18.625C3 19.936 4.06519 21 5.375 21H18.625C19.936 21 21 19.936 21 18.625V5.375C21.0057 4.08803 19.9197 3 18.625 3ZM19 19V5H4.99999V19H19Z"
                                    fill="currentColor"
                                />
                            )}
                        </svg>
                    </div>
                </div>
            );
        default:
            return (
                <div
                    role="menuitem"
                    className={`velocity-menu-item ${disabled ? ContextMenuClasses.disabled : ""} ${ContextMenuClasses.item} ${ContextMenuClasses.labelContainer} ${ContextMenuClasses[`color${color || "Default"}`]}`}
                    onClick={(e) => {
                        if (!disabled && action) action(e);
                        ContextMenuActions.closeContextMenu();
                    }}
                >
                    <div className={ContextMenuClasses.label}>{label}</div>
                    {icon && (
                        <div className={ContextMenuClasses.iconContainer}>
                            <icon className={ContextMenuClasses.icon} />
                        </div>
                    )}
                </div>
            );
    }
};

export const buildMenuItem = (options = {}) => {
    const { type, label, action, color, checked, disabled, onChange, icon } = options;

    return <MenuItem type={type} label={label} action={action} color={color} checked={checked} disabled={disabled} onChange={onChange} icon={icon} />;
};

export const buildContextMenu = (items) => {
    return (
        <Menu>
            {items.map((item) => (
                <MenuItem {...item} />
            ))}
        </Menu>
    );
};

export const useContextMenu = (event, items) => {
    const { Actions } = WebpackModules.common;

    const ContextMenuActions = Actions.ContextMenuActions;

    const menu = buildContextMenu(items);

    ContextMenuActions.openContextMenu(event, () => menu);

    return menu;
};
