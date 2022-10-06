import { showNotification, showConfirmationModal } from "./notifications";
import { installAddon } from "./actions";
import webpack from "./webpack";

export default {
    get websockets() {
        return DiscordNative.nativeModules.requireModule("discord_rpc").RPCWebSocket.ws;
    },
    init() {
        this.socket = new this.websockets.Server({ port: 1842 });

        this.socket.on("connection", (client) => {
            const dismis = showNotification({
                title: "New Socket Connection",
                content: `A new socket connection has been established.`,
                buttons: [
                    {
                        label: "Okay",
                        action: () => {
                            dismis();
                        },
                    },
                    {
                        label: "Disconnect",
                        color: "RED",
                        action: () => {
                            client.close();
                            dismis();
                        },
                    },
                ],
            });

            client.on("message", (data) => {
                switch (data) {
                    case "velocity:get-client-data":
                        client.send(
                            "velocity:data" +
                                JSON.stringify({
                                    platform: DiscordNative.process.platform,
                                    version: DiscordNative.app.getVersion(),
                                    channel: DiscordNative.app.getReleaseChannel(),
                                })
                        );
                        break;
                    case "velocity:reload":
                        location.reload();
                        break;
                    case "velocity:relaunch":
                        DiscordNative.app.relaunch();
                        break;
                }

                if (data.startsWith("velocity:install-addon")) {
                    DiscordNative.window.focus();

                    const addon = data.split("|")[1];
                    const name = data.split("|")[2];

                    if (addon) {
                        showConfirmationModal({
                            title: `Install ${name || "Addon"}?`,
                            content: "Are you sure you want to install this addon? Addons can be dangerous and can break your Discord client.",
                            confirmText: "Install",
                            danger: true,
                            onConfirm: () => {
                                installAddon(addon);
                            },
                        });
                    }
                }
            });
        });
    },
};
