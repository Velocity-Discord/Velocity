/**
 * @name ActiviyStatus
 * @description 
 * @author TheCommieAxolotl
 * @authorId 538487970408300544
 * @version 1.0.0
 * @license MIT
 */

const {logger, showToast, getModule} = VApi
const a = getModule(["getActivity"]);

module.exports = {
    onStart: async () => {
        let act = await a.getActivity();
        let socket = await a.getActiveSocketAndDevice();
        if (act) showToast(`Playing ${act.name} on ${socket.device.name}`, {type: "velocity"});
    },

    onStop: () => {
    },
};
