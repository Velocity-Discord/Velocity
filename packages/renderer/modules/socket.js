import { showNotification } from "./notifications";

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
            });
        });
    },
};
