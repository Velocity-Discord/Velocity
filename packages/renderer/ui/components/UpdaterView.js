import { injectComponentStyle } from "../../util/components";
import { useForceUpdate } from "../../util/hooks";
import { relative } from "../../util/time";
import Velocity from "../../modules/velocity";
import Section from "./settings/Section";
import EmptyState from "./EmptyState";

const { CoreUpdater, ThemeUpdater, PluginUpdater, WebpackModules, AddonManager } = Velocity;

injectComponentStyle("updater", {
    ".velocity-updater": {
        display: "flex",
        flexDirection: "column",
    },
    ".velocity-updater-banner": {
        backgroundColor: "var(--background-secondary)",
        borderRadius: "5px",
        padding: "12px",
        display: "flex",
        gap: "10px",
        marginBottom: "20px",
    },
    ".velocity-updater .velocity-setting-section + .velocity-setting-section": {
        marginTop: "12px",
    },
    ".velocity-updater-indicator": {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        aspectRatio: "1",
        height: "100px",
        borderRadius: "3px",
        backgroundColor: "var(--background-primary)",
    },
    ".velocity-updater-buttons": {
        display: "flex",
        gap: "5px",
        marginTop: "auto",
    },
    ".velocity-updater-icon": {
        fill: "currentColor",
        width: "100%",
        height: "100%",
    },
    ".velocity-updater-icon.available": {
        color: "#5B88FC",
    },
    ".velocity-updater-icon.no-updates": {
        color: "#43B581",
    },
    ".velocity-updater-icon.error": {
        color: "#F04747",
    },
    ".velocity-updater-icon.checking": {
        color: "#FAA61A",
    },
    ".velocity-updater-icon.check": {
        color: "#43B581",
    },
    ".velocity-updater-icon.idle": {
        color: "var(--text-muted)",
    },
    ".velocity-updater-content": {
        display: "flex",
        flexDirection: "column",
        gap: "5px",
    },
    ".velocity-updater-title": {
        fontSize: "18px",
        fontWeight: "500",
        color: "var(--header-primary)",
    },
    ".velocity-updater-subtitle": {
        fontSize: "14px",
        fontWeight: "400",
        color: "var(--text-normal)",
        display: "flex",
        gap: "3px",
    },
    ".velocity-updater-subtitle .velocity-updater-timestamp": {
        backgroundColor: "var(--background-modifier-accent)",
        borderRadius: "3px",
        padding: "0 2px",
    },
    ".velocity-updater-addons": {
        marginBottom: "12px",
        display: "flex",
        flexDirection: "column",
    },
    ".velocity-updater-empty": {
        display: "flex",
        alignItems: "center",
        marginBottom: "12px",
        gap: "5px",
    },
    ".velocity-updater-addon": {
        backgroundColor: "var(--background-secondary)",
        borderRadius: "5px",
        padding: "12px",
        display: "flex",
        gap: "10px",
        marginTop: "5px",
        justifyContent: "space-between",
    },
    ".velocity-updater-addon-info": {
        display: "flex",
        flexDirection: "column",
        gap: "5px",
    },
    ".velocity-updater-addon-title": {
        fontSize: "16px",
        fontWeight: "500",
        color: "var(--header-primary)",
    },
    ".velocity-updater-addon-diff": {
        fontSize: "14px",
        fontWeight: "400",
        color: "var(--text-normal)",
    },
});

const Icons = {
    available: (p) => {
        return (
            <svg {...p} className="velocity-updater-icon available" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z"></path>
            </svg>
        );
    },
    noUpdates: (p) => {
        return (
            <svg {...p} className="velocity-updater-icon no-updates" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"></path>
            </svg>
        );
    },
    checking: (p) => {
        return (
            <svg {...p} className="velocity-updater-icon checking" viewBox="0 0 24 24">
                <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path>
            </svg>
        );
    },
    error: (p) => {
        return (
            <svg {...p} className="velocity-updater-icon error" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z"></path>
            </svg>
        );
    },
    idle: (p) => {
        return (
            <svg {...p} className="velocity-updater-icon idle" viewBox="0 0 24 24">
                <path d="M9.27,4.49c-1.63,7.54,3.75,12.41,7.66,13.8C15.54,19.38,13.81,20,12,20c-4.41,0-8-3.59-8-8C4,8.55,6.2,5.6,9.27,4.49 M11.99,2.01C6.4,2.01,2,6.54,2,12c0,5.52,4.48,10,10,10c3.71,0,6.93-2.02,8.66-5.02c-7.51-0.25-12.09-8.43-8.32-14.97 C12.22,2.01,12.11,2.01,11.99,2.01L11.99,2.01z"></path>
            </svg>
        );
    },
    cross: (p) => {
        return (
            <svg {...p} className="velocity-updater-icon check" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path>
            </svg>
        );
    },
};

export default () => {
    const { Components } = WebpackModules.common;

    const forceUpdate = useForceUpdate();

    const { state, updateInfo, updateAvailable, lastChecked } = CoreUpdater;

    const icon = state === "checking" ? Icons.checking() : state === "available" ? Icons.available() : state === "no-updates" ? Icons.noUpdates() : state === "error" ? Icons.error() : Icons.idle();
    const title = state === "checking" ? "Checking for updates..." : state === "available" ? "Update available" : state === "no-updates" ? "No updates available" : state === "error" ? "An Error Occurred!" : "Idle";

    const timestamp = relative(lastChecked);

    const FormText = Components.FormText.default;
    const ButtonModules = Components.ButtonModules;
    const Tooltip = Components.TooltipContainer.default;

    const Addons = { ...PluginUpdater.updateInfo, ...ThemeUpdater.updateInfo };

    const lcDate = new Date(lastChecked);

    return (
        <div className="velocity-updater">
            <div className="velocity-updater-banner">
                <div className="velocity-updater-indicator">{icon}</div>
                <div className="velocity-updater-content">
                    <div className="velocity-updater-title">{title}</div>
                    <div className="velocity-updater-subtitle">
                        {state === "available"
                            ? `Version ${updateInfo.version} is available.`
                            : [
                                  `Last checked`,
                                  <Tooltip
                                      text={lcDate.toLocaleString("en-US", {
                                          weekday: "long",
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                          hour: "numeric",
                                          minute: "numeric",
                                          hour12: true,
                                      })}
                                      children={(props) => (
                                          <div {...props} className="velocity-updater-timestamp">
                                              {timestamp}
                                          </div>
                                      )}
                                  ></Tooltip>,
                              ]}
                    </div>
                    <div className="velocity-updater-buttons">
                        {state === "available" ? (
                            <ButtonModules.default
                                color={ButtonModules.ButtonColors.GREEN}
                                onClick={() => {
                                    CoreUpdater.downloadUpdate();
                                    forceUpdate();
                                }}
                            >
                                Update
                            </ButtonModules.default>
                        ) : (
                            <ButtonModules.default
                                color={ButtonModules.ButtonColors.BRAND}
                                onClick={async () => {
                                    await CoreUpdater.checkForUpdates();
                                    await PluginUpdater.checkForUpdates();
                                    await ThemeUpdater.checkForUpdates();

                                    forceUpdate();
                                }}
                            >
                                Check for updates
                            </ButtonModules.default>
                        )}
                    </div>
                </div>
            </div>
            <Section title="Addons">
                <div className={`velocity-updater-${Object.keys(Addons || {}).length ? "addons" : "empty"}`}>
                    {Object.keys(Addons || {})?.length ? (
                        Object.keys(Addons).map((addon) => (
                            <div className="velocity-updater-addon">
                                <div className="velocity-updater-addon-info">
                                    <div className="velocity-updater-addon-title">{addon}</div>
                                    <div className="velocity-updater-addon-diff">
                                        {Addons[addon].manifest.main.endsWith(".js") ? AddonManager.Plugins.get(addon).version : AddonManager.Themes.get(addon).version} &gt; {Addons[addon].manifest.version}
                                    </div>
                                </div>
                                <div className="velocity-updater-addon-buttons">
                                    <ButtonModules.default
                                        color={ButtonModules.ButtonColors.GREEN}
                                        onClick={() => {
                                            const manager = Addons[addon].manifest.main.endsWith(".js") ? PluginUpdater : ThemeUpdater;
                                            manager.downloadUpdate(addon);
                                            forceUpdate();
                                        }}
                                    >
                                        Update
                                    </ButtonModules.default>
                                </div>
                            </div>
                        ))
                    ) : (
                        <EmptyState artURL="/assets/b669713872b43ca42333264abf9c858e.svg" header="Couldn't find any addon updates" description="Now go and enjoy your day!" />
                    )}
                </div>
            </Section>
        </div>
    );
};
