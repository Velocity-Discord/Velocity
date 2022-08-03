/**
 * @type {Api}
 */
const VApi = window.VApi;

const { WebpackModules } = VApi;

const { createBotMessage } = WebpackModules.find(["createBotMessage"]);
const { getChannelId } = WebpackModules.find(["getLastSelectedChannelId"]);
const { receiveMessage } = WebpackModules.find(["sendMessage", "editMessage"]);

module.exports = new (class ClydeManager {
    sendMessage(text, embeds, channelId = getChannelId()) {
        const toSend = createBotMessage({
            channelId: channelId,
            content: text,
            embeds: embeds || [],
        });

        receiveMessage(channelId, toSend);

        return toSend;
    }
})();
