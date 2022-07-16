const { WebpackModules, Patcher, React } = VApi;

const { BUILT_IN_COMMANDS } = WebpackModules.find(["BUILT_IN_COMMANDS"]);
const { BOT_AVATARS } = WebpackModules.find(["BOT_AVATARS"]);
const { createBotMessage } = WebpackModules.find(["createBotMessage"]);
const { getChannelId } = WebpackModules.find(["getLastSelectedChannelId"]);
const { receiveMessage } = WebpackModules.find(["sendMessage", "editMessage"]);

BOT_AVATARS.velocity = "https://velocity-discord.netlify.app/assets/favicon.png";

module.exports = new (class CommandManager {
    registerCommand(name, description, callback) {
        let toPush = {
            applicationId: "-1",
            description: description,
            displayDescription: description,
            displayName: name,
            id: `-${BUILT_IN_COMMANDS.length + 1}`,
            execute: () => {
                const result = callback();

                if (!result || !result.text) return;

                const toSend = createBotMessage({
                    channelId: getChannelId(),
                    content: result.text,
                    author: {
                        username: "Velocity",
                        avatar: "velocity",
                    },
                    embeds: result.embeds || [],
                });

                toSend.author.avatar = "velocity";
                toSend.author.username = "Velocity";

                receiveMessage(getChannelId(), toSend);
            },
            name: name,
            inputType: 0,
            type: 1,
        };

        BUILT_IN_COMMANDS.push(toPush);

        return toPush.id;
    }
    unregisterCommand(id) {
        BUILT_IN_COMMANDS.splice(
            BUILT_IN_COMMANDS.findIndex((c) => c.id === id),
            1
        );
    }
})();
