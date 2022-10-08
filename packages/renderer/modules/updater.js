import logger from "../util/logger";
import Velocity from "./velocity";

const fs = VelocityCore.pseudoRequire("node:original-fs");
const path = VelocityCore.pseudoRequire("node:path");

const Logger = new logger("Updater");

const { Notifications } = Velocity;

export const checkForUpdates = async () => {
    Logger.log("Checking for updates...");

    const releaseData = await VelocityCore.request("https://api.github.com/repos/Velocity-Discord/Velocity/releases/latest");
    let release;

    try {
        release = JSON.parse(releaseData);
    } catch {
        return Notifications.showNotification({
            title: "Update Failed",
            content: "Velocity failed to check for updates. Please try again later.",
            type: "error",
        });
    }

    if (!release.tag_name) {
        return Notifications.showNotification({
            title: "Update Failed",
            content: "Velocity failed to check for updates. Please try again later.",
            type: "error",
        });
    }

    if (release.tag_name !== VelocityCore.Meta.version) {
        Notifications.showConfirmationModal({
            title: "Update Available",
            content: `A new version of Velocity is available. Would you like to download it now?`,
            confirmText: "Download",
            onConfirm: () => {
                VelocityCore.request(release.assets[0].browser_download_url, (err, _, data) => {
                    if (err) {
                        fs.writeFileSync(path.join(VelocityCore.baseDir, "dist/velocity.asar"), data);
                        Notifications.showNotification({
                            title: "Update Downloaded",
                            content: "Velocity has been updated. Please relaunch Velocity to apply the update.",
                            type: "success",
                            buttons: [
                                {
                                    label: "Relaunch",
                                    onClick: () => {
                                        DiscordNative.app.relaunch();
                                    },
                                },
                            ],
                        });
                    } else {
                        Notifications.showNotification({
                            title: "Update Failed",
                            content: "Velocity failed to download the update. Please try again later.",
                            type: "error",
                        });
                    }
                });
            },
        });
    }
};
