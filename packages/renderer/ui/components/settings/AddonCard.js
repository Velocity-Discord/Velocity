import Velocity from "../../../modules/velocity";
import { injectComponentStyle } from "../../../util/components";
import { useContextMenu } from "../../../util/contextMenu";
import { showToast } from "../../../modules/notifications";

import Switch from "../../../ui/components/settings/Switch";
import Slider from "../../../ui/components/settings/Slider";
import TextInput from "../../../ui/components/settings/TextInput";
import ColorPicker from "../../../ui/components/settings/ColorPicker";
import FormTitle from "../reworks/FormTitle";

const { WebpackModules, AddonManager } = Velocity;

injectComponentStyle("addon-card", {
    ".velocity-addon-card": {
        display: "flex",
        flexDirection: "column",
        width: "100%",
        gap: "10px",
        padding: "15px",
        borderRadius: "5px",
        backgroundColor: "var(--background-secondary)",
        marginBottom: "10px",
    },
    ".addon-card-header": {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        color: "var(--text-normal)",
        cursor: "pointer",
    },
    ".addon-card-header-left": {
        display: "flex",
        gap: "5px",
        alignItems: "flex-end",
    },
    ".addon-card-header-title": {
        fontSize: "20px",
        fontWeight: "500",
        color: "var(--header-primary)",
    },
    ".addon-card-header-subtitle": {
        fontSize: "14px",
        fontWeight: "400",
        color: "var(--header-secondary)",
    },
    ".addon-card-lower": {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        gap: "10px",
    },
    ".addon-card-description": {
        fontSize: "14px",
        fontWeight: "400",
    },
    ".addon-card-footer": {
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: "5px",
    },
    ".addon-card-footer > span > button": {
        width: "32px !important",
    },
    ".addon-card-settings-header": {
        display: "flex",
        alignItems: "center",
        color: "var(--text-normal)",
        cursor: "pointer",
        marginBottom: "10px",
        gap: "5px",
    },
    ".addon-card-settings-header svg:hover": {
        color: "var(--interactive-hover)",
    },
});

export default (props) => {
    const { Components, Icons } = WebpackModules.common;

    const SwitchEle = Components.Switch.default;
    const Markdown = Components.Markdown.default;
    const PanelButton = Components.PanelButton.default;

    const { name, description, version, author, license, social, _type } = props;

    const [enabled, setEnabled] = React.useState(AddonManager[_type].isEnabled(name));
    const [settingsOpen, setSettingsOpen] = React.useState(false);

    return (
        <div className="velocity-addon-card">
            <div
                className="addon-card-header"
                onClick={() => {
                    AddonManager[_type].toggle(name);
                    setEnabled(!enabled);
                    setSettingsOpen(false);
                }}
                onContextMenu={(e) => {
                    useContextMenu(e, [
                        {
                            label: "Enable",
                            type: "check",
                            checked: enabled,
                            onChange: (val) => {
                                AddonManager[_type].toggle(name);
                                setEnabled(val);
                            },
                        },
                        {
                            type: "separator",
                        },
                        {
                            label: "Unlink",
                            action: () => {
                                AddonManager[_type].unlink(name);
                            },
                            icon: Icons.Trash.default,
                            color: "Danger",
                        },
                    ]);
                }}
            >
                <div className="addon-card-header-left">
                    <div className="addon-card-header-title">{name}</div>
                    <div className="addon-card-header-subtitle">
                        {version} by {typeof author == "string" ? author : author.name}
                    </div>
                </div>
                <div className="addon-card-header-right">
                    <SwitchEle checked={enabled} />
                </div>
            </div>
            <div className="addon-card-lower">
                <div className="addon-card-description">
                    <Markdown>{description}</Markdown>
                </div>
                <div className="addon-card-footer">
                    {props.instance?.renderSettings && (
                        <PanelButton
                            disabled={!enabled}
                            tooltipText="Settings"
                            innerClassName="addon-card-panelbutton"
                            icon={Icons.Gear.default}
                            onClick={() => {
                                setSettingsOpen(!settingsOpen);
                            }}
                        />
                    )}
                    {(social?.invite || social?.github || social?.website || social?.donate) && (
                        <PanelButton
                            tooltipText="Social"
                            icon={Icons.Link.default}
                            onClick={(e) => {
                                useContextMenu(e, [
                                    social.invite && {
                                        label: "Invite",
                                        action: () => {
                                            window.open(new URL(social.invite, "https://discord.gg/").href);
                                        },
                                    },
                                    social.github && {
                                        label: "GitHub",
                                        action: () => {
                                            window.open(new URL(social.github).href);
                                        },
                                    },
                                    social.website && {
                                        label: "Website",
                                        action: () => {
                                            window.open(new URL(social.website).href);
                                        },
                                    },
                                    social.donate && {
                                        label: "Donate",
                                        action: () => {
                                            window.open(new URL(social.donate).href);
                                        },
                                    },
                                ]);
                            }}
                        />
                    )}
                    <PanelButton
                        tooltipText="Open Folder"
                        innerClassName="addon-card-panelbutton"
                        icon={Icons.Folder.default}
                        onClick={() => {
                            AddonManager[_type].openFolder(name);
                        }}
                    />
                    <PanelButton
                        tooltipText="Unlink"
                        innerClassName="addon-card-panelbutton"
                        icon={Icons.Trash.default}
                        onClick={() => {
                            AddonManager[_type].unlink(name);
                        }}
                    />
                </div>
            </div>
            {settingsOpen && enabled && (
                <div className="addon-card-settings">
                    <div className="addon-card-settings-header">
                        <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            onClick={() => {
                                setSettingsOpen(false);
                            }}
                        >
                            <path fill="currentColor" d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z"></path>
                        </svg>
                        <FormTitle style={{ marginBottom: "0" }} tag="h5">
                            Settings
                        </FormTitle>
                    </div>
                    {props.instance?.renderSettings &&
                        props.instance.renderSettings().map((setting) => {
                            if (!setting) return null;
                            try {
                                const useSetting = (value) => {
                                    if (typeof setting.action === "function") setting.action(value);

                                    props.instance.settings[setting.id] = value;
                                };

                                switch (setting.type) {
                                    case "switch":
                                        return <Switch container={name} setting={setting.id} name={setting.name} note={setting.note} action={useSetting} />;
                                    case "slider":
                                        return (
                                            <Slider
                                                container={name}
                                                setting={setting.id}
                                                name={setting.name}
                                                note={setting.note}
                                                minValue={setting.min | 0}
                                                maxValue={setting.max | 100}
                                                units={setting.units | ""}
                                                handleSize={setting.handleSize | 10}
                                                action={useSetting}
                                            />
                                        );
                                    case "text":
                                        return <TextInput container={name} setting={setting.id} name={setting.name} note={setting.note} action={useSetting} />;
                                    case "color":
                                        return <ColorPicker container={name} defaultColor={setting.default} setting={setting.id} name={setting.name} note={setting.note} action={useSetting} />;
                                }
                            } catch (e) {
                                showToast("Error rendering settings for " + name, { type: "error" });
                            }
                        })}
                </div>
            )}
        </div>
    );
};
