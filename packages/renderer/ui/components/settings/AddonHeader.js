import { injectComponentStyle } from "../../../util/components";
import { useContextMenu } from "../../../util/contextMenu";
import Velocity from "../../../modules/velocity";

const { WebpackModules, AddonManager } = Velocity;

injectComponentStyle("addon-header", {
    ".velocity-addon-header": {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        gap: "5px",
        marginBottom: "15px",
    },
    ".addon-searchbar": {
        width: "100%",
        height: "32px",
        background: "var(--background-tertiary)",
        borderRadius: "4px",
        padding: "0 10px",
        color: "var(--text-muted)",
        display: "flex",
        alignItems: "center",
        gap: "10px",
    },
    ".addon-searchbar input": {
        width: "100%",
        height: "100%",
        background: "transparent",
        border: "none",
        color: "var(--text-normal)",
        fontSize: "14px",
        fontWeight: "500",
    },
    ".addon-searchbar svg": {
        width: "20px",
        height: "20px",
    },
    ".addon-buttons": {
        display: "flex",
        alignItems: "center",
    },
});

export default (props) => {
    const { type, onSearch } = props;

    const [search, setSearch] = React.useState("");

    const _type = type === "plugins" ? "Plugins" : "Themes";

    const { Components, Icons } = WebpackModules.common;

    const PanelButton = Components.PanelButton.default;

    return (
        <div className="velocity-addon-header">
            <div
                onContextMenu={(e) => {
                    useContextMenu(e, [
                        {
                            label: "Install from URL",
                            action: () => {
                                AddonManager.installAddon(search);
                            },
                        },
                    ]);
                }}
                className="addon-searchbar"
            >
                <input
                    onChange={(e) => {
                        setSearch(e);
                        onSearch(e);
                    }}
                    placeholder="Search..."
                />
                <Icons.Search.default />
            </div>
            <div className="addon-buttons">
                <PanelButton tooltipText={`Open ${type == "themes" ? "Theme" : "Plugin"} Folder`} icon={Icons.Folder.default} onClick={() => AddonManager[_type].openDir()} />
                <PanelButton tooltipText={`Reload ${_type}`} icon={Icons.Retry.default} onClick={() => AddonManager[_type].reload()} />
            </div>
        </div>
    );
};
