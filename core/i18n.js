const WebpackModules = require("./webpack");
const Locales = require("../common/i18n/");
const Logger = require("./logger");

const Dispatcher = WebpackModules.find(["subscribe", "dirtyDispatch"]);
const UserSettingsStore = WebpackModules.findByProps("guildPositions");

function extend(extendee, ...extenders) {
    for (let i = 0; i < extenders.length; i++) {
        for (const key in extenders[i]) {
            if (extenders[i].hasOwnProperty(key)) {
                if (typeof extendee[key] === "object" && typeof extenders[i][key] === "object") {
                    extend(extendee[key], extenders[i][key]);
                } else if (typeof extenders[i][key] === "object") {
                    extendee[key] = {};
                    extend(extendee[key], extenders[i][key]);
                } else if (extenders[i][key]) {
                    extendee[key] = extenders[i][key];
                }
            }
        }
    }
    return extendee;
}

module.exports = new (class i18nManager {
    get currentLocale() {
        return UserSettingsStore.locale;
    }
    get defaultLocale() {
        return "en-US";
    }

    constructor() {
        this.Strings = extend({}, Locales[this.defaultLocale]);
    }

    initialize() {
        this.setLocale(this.currentLocale);
        Dispatcher.subscribe("USER_SETTINGS_UPDATE", ({ settings }) => {
            const update = settings.locale;
            if (update) this.setLocale(update);
        });
    }

    normalizeString(string) {
        return string.replace(/^[^a-z]+|[^\w-]+/gi, "").toLowerCase();
    }

    setLocale(locale) {
        if (Locales[locale]) {
            this.Strings = extend(Locales[this.defaultLocale], Locales[locale]);
            Logger.log("Velocity", `Locale set to ${locale}`);
        } else {
            Logger.error("Velocity", `Locale ${locale} does not exist.`);
            this.Strings = Locales[this.defaultLocale];
        }
    }
})();
