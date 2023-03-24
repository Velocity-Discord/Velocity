import ButtonContainer from "./components/reworks/ButtonContainer";
import ComponentPreview from "./components/ComponentPreview";
import AddonHeader from "./components/settings/AddonHeader";
import ColorPicker from "./components/settings/ColorPicker";
import AddonCard from "./components/settings/AddonCard";
import TextInput from "./components/settings/TextInput";
import Notification from "./components/Notification";
import SettingPage from "./components/settings/Page";
import FormItem from "./components/reworks/FormItem";
import Section from "./components/settings/Section";
import UpdaterView from "./components/UpdaterView";
import Switch from "./components/settings/Switch";
import Slider from "./components/settings/Slider";
import Editor from "./components/settings/Editor";
import EmptyState from "./components/EmptyState";
import Toast from "./components/Toast";

import Velocity from "../modules/velocity";
import ColorUtils from "../util/color";
import logger from "../util/logger";

import IPC_EVENTS from "../../common/IPC_EVENTS";

import { showNotification, showToast } from "../modules/notifications";
import { updateVariable } from "../modules/variables";
import { Stream } from "../modules/datastore";
import { Registry } from "../modules/addons";
import { useFilter } from "../util/hooks";

const ipcRenderer = VelocityCore.modules.ipcRenderer;

const Logger = new logger("Settings");
const Settings = Stream("config");

export const initialiseSettings = async () => {
    const { WebpackModules, Utilities } = Velocity;

    const Patcher = new Velocity.Patcher("VelocityInternal_Settings");

    const UserSettings = await WebpackModules.waitFor((m) => m.default?.prototype?.getPredicateSections);

    Patcher.after(UserSettings.default.prototype, "getPredicateSections", (_, returnValue) => {
        let location = returnValue.findIndex((s) => s.section.toLowerCase() == "discord nitro") - 2;
        if (location < 0) return;
        const insert = (section) => {
            returnValue.splice(location, 0, section);
            location++;
        };

        const { Components, Classes, Actions } = WebpackModules.common;

        const FormDivider = Components.FormDivider;
        const ButtonModules = Components.ButtonModules;
        const FormText = Components.FormText.default;
        const ModalActions = Actions.ModalActions;

        insert({ section: "DIVIDER" });
        insert({ section: "HEADER", label: "Velocity" });
        // Settings
        insert({
            section: "settings",
            label: "Settings",
            className: `velocity-settings-tab`,
            element: () => [
                <SettingPage title="Settings">
                    <Section title="General">
                        <Switch name="Stop DevTools Warnings" note="Stops Discord from showing warnings when you open devtools." setting="StopWarnings" />
                        <Switch name="Kill Sentry" note="Kills Sentry, a tool used by Discord to track your client." setting="KillSentry" />
                        <Switch name="Developer Mode" note="Adds a settings tab with utilities for development." setting="DeveloperTab" />
                    </Section>
                    <Section title="Window">
                        <Switch name="Transparency" note="Makes the window transparent." setting="Transparency" />
                        <Switch name="MacOS Vibrancy" note="Makes the window have a vibrancy effect on MacOS." setting="Vibrancy" />
                    </Section>
                    <Section title="Notifications">
                        <ButtonContainer>
                            <ButtonModules.default
                                onClick={() => {
                                    const close = showNotification({
                                        title: "Notification",
                                        content: "This is a test notification",
                                        buttons: [
                                            {
                                                label: "Button",
                                                action: () => {
                                                    showToast("Toast");
                                                },
                                            },
                                            {
                                                label: "Dangerous Button",
                                                color: "RED",
                                                action: () => {
                                                    close();
                                                },
                                            },
                                        ],
                                    });
                                }}
                                style={{ marginBlock: "10px" }}
                            >
                                Open Preview Notification
                            </ButtonModules.default>
                        </ButtonContainer>
                        <ColorPicker
                            defaultColor={Number(ColorUtils.getVariable("background-floating", "hex").replace("#", "0x")) || 0x18191c}
                            name="Background Color"
                            note="The background color of notifications"
                            setting="NotificationBackground"
                            action={(value) => {
                                const NotifBackgroundHSl = ColorUtils.hexToHSL(ColorUtils.intToHex(value));

                                updateVariable(
                                    "--velocity-notification-background",
                                    `hsla(${NotifBackgroundHSl[0]}, ${NotifBackgroundHSl[1]}%, ${NotifBackgroundHSl[2]}%, var(--velocity-notification-transparency,  100%))`
                                );
                            }}
                        />
                        <Slider
                            name="Background Opacity"
                            note="The opacity of the notification background"
                            setting="NotificationTransparency"
                            action={(value) => {
                                updateVariable("--velocity-notification-transparency", `${value}%`);
                            }}
                            units="%"
                        />
                        <Slider
                            name="Background Blur"
                            note="The blur of the notification background"
                            setting="NotificationBlur"
                            action={(value) => {
                                updateVariable("--velocity-notification-blur", `${Math.round(value)}px`);
                            }}
                            maxValue={20}
                            units="px"
                        />
                    </Section>
                </SettingPage>,
            ],
        });

        // Plugins
        insert({
            section: "plugins",
            label: "Plugins",
            className: `velocity-plugins-tab`,
            element: () => {
                const [plugins, setPlugins] = React.useState(Registry.plugins);
                const [search, setSearch] = React.useState("");
                const [rerender, setRerender] = React.useState(false);

                React.useEffect(() => {
                    const l = (val) => {
                        setPlugins(val);
                        setRerender(!rerender);
                    };

                    Registry.plugins.addListener(l);

                    return () => {
                        Registry.plugins._removeListener(l);
                    };
                });

                return [
                    <SettingPage title="Plugins">
                        <AddonHeader type="plugins" onSearch={setSearch} />
                        {useFilter(plugins, search).length ? (
                            useFilter(plugins, search).map((plugin) => {
                                return <AddonCard {...plugin} />;
                            })
                        ) : (
                            <EmptyState artURL="/assets/b669713872b43ca42333264abf9c858e.svg" header="Couldn't find any plugins" description="Make sure they're installed and your search is correct" />
                        )}
                    </SettingPage>,
                ];
            },
        });

        // Themes
        insert({
            section: "themes",
            label: "Themes",
            className: `velocity-themes-tab`,
            element: () => {
                const [themes, setThemes] = React.useState(Registry.themes);
                const [search, setSearch] = React.useState("");
                const [rerender, setRerender] = React.useState(false);

                React.useEffect(() => {
                    const l = (val) => {
                        setThemes(val);
                        setRerender(!rerender);
                    };

                    Registry.themes.addListener(l);

                    return () => {
                        Registry.themes._removeListener(l);
                    };
                });

                return [
                    <SettingPage title="Themes">
                        <AddonHeader type="themes" onSearch={setSearch} />
                        {useFilter(themes, search).length ? (
                            useFilter(themes, search).map((theme) => {
                                return <AddonCard {...theme} />;
                            })
                        ) : (
                            <EmptyState artURL="/assets/b669713872b43ca42333264abf9c858e.svg" header="Couldn't find any themes" description="Make sure they're installed and your search is correct" />
                        )}
                    </SettingPage>,
                ];
            },
        });

        // Snippets
        insert({
            section: "snippets",
            label: "Snippets",
            className: `velocity-snippets-tab`,
            element: () => {
                return (
                    <SettingPage title="Snippets">
                        <Editor />
                    </SettingPage>
                );
            },
        });

        insert({
            section: "updater",
            label: "Updater",
            className: `velocity-updater-tab`,
            element: () => {
                return (
                    <SettingPage title="Updater">
                        <UpdaterView />
                    </SettingPage>
                );
            },
        });

        if (Settings.DeveloperTab) {
            insert({
                section: "developer",
                label: "Developer",
                className: `velocity-developer-tab`,
                element: () => {
                    const [toastColor, setToastColor] = React.useState("");
                    const [notificationColor, setNotificationColor] = React.useState("");

                    const Notif = Notification();

                    return (
                        <SettingPage title="Developer">
                            <FormItem>
                                <Section title="Developer Tools" collapsable={false}>
                                    <FormText style={{ marginBlock: "8px 20px" }}>A collection of utilities for you to use in development.</FormText>
                                    <FormDivider style={{ marginBottom: "20px" }} />
                                    <ButtonContainer>
                                        <ButtonModules.default
                                            color={ButtonModules.ButtonColors.RED}
                                            onClick={() => {
                                                ipcRenderer.invoke(IPC_EVENTS.kill);
                                            }}
                                        >
                                            Kill Process
                                        </ButtonModules.default>
                                        <ButtonModules.default
                                            onClick={() => {
                                                const ModalRoot = Components.ModalElements.ModalRoot;
                                                ModalActions.openModal(<ModalRoot children={{}}></ModalRoot>);
                                            }}
                                        >
                                            React Crash
                                        </ButtonModules.default>
                                    </ButtonContainer>
                                    <FormDivider style={{ marginBlock: "20px" }} />
                                </Section>
                                <Section title="Velocity Components">
                                    <ComponentPreview>
                                        <Notif
                                            title="Notification Title"
                                            color={notificationColor}
                                            buttons={[
                                                {
                                                    label: "Change Color",
                                                    action: () => {
                                                        // cycle through "", "danger", "success", "warning", "velocity"
                                                        if (notificationColor === "") setNotificationColor("error");
                                                        else if (notificationColor === "error") setNotificationColor("success");
                                                        else if (notificationColor === "success") setNotificationColor("warning");
                                                        else if (notificationColor === "warning") setNotificationColor("velocity");
                                                        else if (notificationColor === "velocity") setNotificationColor("");
                                                    },
                                                },
                                                {
                                                    label: "Change Toast Color",
                                                    action: () => {
                                                        // cycle through "", "danger", "success", "warning", "velocity"
                                                        if (toastColor === "") setToastColor("error");
                                                        else if (toastColor === "error") setToastColor("success");
                                                        else if (toastColor === "success") setToastColor("warning");
                                                        else if (toastColor === "warning") setToastColor("velocity");
                                                        else if (toastColor === "velocity") setToastColor("");
                                                    },
                                                },
                                            ]}
                                            id="velocity-notification-9999"
                                        >
                                            Notification Content
                                        </Notif>
                                    </ComponentPreview>
                                    <ComponentPreview>
                                        <Toast color={toastColor}>Toast Content</Toast>
                                    </ComponentPreview>
                                </Section>
                            </FormItem>
                        </SettingPage>
                    );
                },
            });
        }
    });
};
