import { Stream } from "./datastore";
import { body } from "../util/components";
import ColorUtils from "../util/color";

const Settings = Stream("config");

export const addVariables = () => {
    const NotifBackgroundHSl = ColorUtils.hexToHSL(ColorUtils.intToHex(Settings.NotificationBackground || 0x19191c));
    body.style.setProperty(
        "--velocity-notification-background",
        `hsla(${NotifBackgroundHSl[0]}, ${NotifBackgroundHSl[1]}%, ${NotifBackgroundHSl[2]}%, var(--velocity-notification-transparency,  100%))`
    );
    body.style.setProperty("--velocity-notification-transparency", Settings.NotificationTransparency ? `${Settings.NotificationTransparency}%` : "100%");
    body.style.setProperty("--velocity-notification-blur", Settings.NotificationBlur ? `${Settings.NotificationBlur}px` : "0px");
};

export const updateVariable = (variable, value) => {
    body.style.setProperty(variable, value);
};
