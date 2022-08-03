const WebpackModules = require("./webpack");
const Locales = require("../common/i18n/");
const Logger = require("./logger");
const DataStore = require("./datastore");

const Dispatcher = WebpackModules.find(["subscribe", "dispatch"]);
const UserSettingsStore = WebpackModules.find(["guildPositions"]);

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
        return DataStore.getData("VELOCITY_SETTINGS", "locale") == "en-AUS" ? "en-AUS" : UserSettingsStore.locale;
    }
    get defaultLocale() {
        return "en-US";
    }

    get Strings() {
        // TODO - Placeholders
        return this.rawStrings;
    }

    constructor() {
        this.rawStrings = extend({}, Locales[this.defaultLocale]);
    }

    initialize() {
        this.setLocale(this.currentLocale);
        Dispatcher.subscribe("USER_SETTINGS_UPDATE", ({ settings }) => {
            const update = settings.locale;
            if (update) this.setLocale(update);

            if (update == "en-GB" && DataStore.getData("VELOCITY_SETTINGS", "locale") !== "en-AUS") {
                const { showConfirmationModal } = require("./ui/Notifications");

                showConfirmationModal(
                    "Super Duper Secret Locale",
                    "You've chosen en-GB as your discord language, boring!! \n\n But worry no more: Velocity's gotcha covered, press \"Proceed\" below to anable the **en-AUS** locale!",
                    {
                        confirmText: "Proceed",
                        onConfirm: () => {
                            this.setLocale("en-AUS");
                            DataStore.setData("VELOCITY_SETTINGS", "locale", "en-AUS");
                            location.reload();
                        },
                    }
                );
            } else {
                DataStore.setData("VELOCITY_SETTINGS", "locale", update);
            }
        });
    }

    normalizeString(string) {
        return string.replace(/^[^a-z]+|[^\w-]+/gi, "").toLowerCase();
    }

    setLocale(locale) {
        if (Locales[locale]) {
            this.rawStrings = extend(Locales[this.defaultLocale], Locales[locale]);
            Logger.log("Velocity", `Locale set to ${locale}`);
        } else {
            Logger.error("Velocity", `Locale ${locale} does not exist.`);
            this.rawStrings = Locales[this.defaultLocale];
        }
    }
})();
