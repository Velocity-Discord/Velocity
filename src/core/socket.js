module.exports = new (class Socket {
    get WebSocket() {
        return window.DiscordNative.nativeModules.requireModule("discord_rpc").RPCWebSocket.ws;
    }

    initialise() {
        this.socket = new this.WebSocket.Server({ port: 1742 });

        this.socket.on("connection", (client) => {
            client.on("message", (message) => {
                switch (message) {
                    case "velocity:reload":
                        location.reload();
                        break;
                    case "velocity:getData":
                        client.send("velocity:data" + JSON.stringify(VApi.Meta));
                        break;
                    case "velocity:relaunch":
                        DiscordNative.app.relaunch();
                        break;
                }
            });
        });
    }
})();
