import { getDataFromBase, traverseImports } from "./actions";
import * as AddonManager from "./addons";
import * as Notifications from "./notifications";
import logger from "../util/logger";

const fs = VelocityCore.modules.originalFs;
const path = VelocityCore.modules.path;

const Logger = new logger("Updater");

export const Updater = class {
    constructor() {
        this.updateAvailable = false;
        this.lastChecked = null;
        this.updateInfo = null;
        this.state = "idle";

        this.endpoint = "https://api.github.com/repos/Velocity-Discord/Velocity/releases";
    }

    fail(reason) {
        this.state = "error";
        Logger.error(`Failed to check for updates: ${reason}`);
        Notifications.showNotification({
            title: "Update Failed",
            content: reason,
            type: "error",
        });
    }

    async checkForUpdates() {
        this.lastChecked = Date.now();
        this.state = "checking";

        let res, obj;

        try {
            res = await VelocityCore.request(this.endpoint + "/latest", {
                headers: { "User-Agent": "Velocity-Discord" },
            });
            obj = JSON.parse(res);
        } catch (e) {
            return this.fail(`Failed to fetch latest release. ${e}`);
        }

        const data = {
            version: obj.name.replace("[Release] ", "").replace(/^v/, ""),
            tag_name: obj.tag_name,
            name: obj.name,
            notes: obj.body,
            asar: obj.assets.find((a) => a.name.endsWith(".asar")),
            timestamp: new Date(obj.published_at),
        };

        if (!data.asar) return this.fail("Failed to find asar in latest release.");

        this.updateInfo = data;
        this.state = "available";

        if (data.version !== VelocityCore.Meta.version) {
            this.updateAvailable = true;
            Notifications.showNotification({
                title: "Update Available",
                content: `A new update is available! Click here to download it.`,
                buttons: [
                    {
                        label: "Download",
                        action: () => {
                            this.downloadUpdate();
                        },
                    },
                ],
            });
        }

        return data;
    }

    async downloadUpdate() {
        const { asar } = this.updateInfo;

        VelocityCore.request(asar.browser_download_url, (err, _, body) => {
            if (err) return this.fail("Failed to get asar data.");

            const asarPath = path.join(VelocityCore.baseDir, "dist/velocity.asar");

            try {
                fs.writeFileSync(asarPath, body);
                Notifications.showNotification({
                    title: "Update Downloaded",
                    content: "Velocity has been updated. Please relaunch Velocity to apply the update.",
                    buttons: [
                        {
                            label: "Relaunch",
                            action: () => {
                                DiscordNative.app.relaunch();
                            },
                        },
                    ],
                });
                this.state = "no-updates";
            } catch (e) {
                this.fail("Failed to write asar to disk.");
            }
        });
    }
};

export const AddonUpdater = class {
    constructor(type) {
        this.type = type;

        this.state = "idle";
        this.lastChecked = null;
        this.updatesAvailable = false;
        this.updateInfo = null;
    }

    fail(reason) {
        this.state = "error";
        Logger.error(`Failed to check for addon update: ${reason}`);
        Notifications.showToast("Failed to check for addon updates.", "error");
    }

    async checkForUpdates() {
        this.lastChecked = Date.now();
        this.state = "checking";

        AddonManager.Registry[this.type].forEach((addon) => {
            if (addon.updates) {
                switch (typeof addon.updates) {
                    case "string":
                        this.checkForUpdatesFromUrl(addon);
                        break;
                    case "object":
                        this.checkForUpdatesFromObject(addon);
                        break;
                }
            }
        });

        this.state = "idle";
    }

    async checkForUpdatesFromUrl(addon) {
        const data = await getDataFromBase(addon.updates);

        if (!data) return this.fail(`Failed to fetch update data for ${addon.name}.`);

        if (data.manifest.version !== addon.version) {
            this.updatesAvailable = true;
            this.state = "available";
            this.updateInfo = {
                ...this.updateInfo,
                [addon.name]: data,
            };
        }

        return data;
    }

    async checkForUpdatesFromObject(addon) {
        const { url } = addon.updates;

        const data = await getDataFromBase(url);

        if (!data) return this.fail(`Failed to fetch update data for ${addon.name}.`);

        if (data.manifest.version !== addon.version) {
            this.updatesAvailable = true;
            this.state = "available";
            this.updateInfo = {
                ...this.updateInfo,
                [addon.name]: data,
            };
        }
    }

    async downloadUpdate(addonName) {
        if (!this.updateInfo[addonName]) return this.fail(`Failed to find update data for ${addonName}.`);

        const data = this.updateInfo[addonName];

        const type = data.manifest.main.endsWith(".js") ? "Plugins" : "Themes";
        const dir = path.join(AddonManager[type].dir, data.manifest.name);

        if (!fs.existsSync(dir)) return this.fail(`Failed to find addon directory for ${addonName}.`);

        const files = await traverseImports(data.manifest.main, data);

        fs.writeFileSync(path.join(dir, "velocity_manifest.json"), JSON.stringify(data.manifest));

        files.forEach(async (file) => {
            fs.writeFileSync(path.join(dir, file.path), await VelocityCore.request(file.url));
        });

        delete this.updateInfo[addonName];

        return data;
    }

    async downloadAllUpdates() {
        const updates = Object.keys(this.updateInfo);

        for (const update of updates) {
            await this.downloadUpdate(update);
        }
    }
};
