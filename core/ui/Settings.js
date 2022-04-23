const { React, modals, logger, getModule, showToast, Utilities } = VApi;
const { ipcRenderer, shell } = require("electron");
const { internalPatches } = require("../Stores");
const { info } = require("../../package.json");
const DataStore = require("../datastore");
const request = require("../request");
const updater = require("../updater");
const path = require("path");
const fs = require("fs");

const Button = getModule.find(["ButtonColors"]).default;
const ButtonColors = getModule.find(["ButtonColors"]).ButtonColors;
const ButtonSizes = getModule.find(["ButtonColors"]).ButtonSizes;
const Text = getModule.find("Text").default;
const Tooltip = getModule.find.prototypes("renderTooltip").default;
const SwitchEle = getModule.find("Switch").default;
const TextInput = getModule.find("TextInput").default;
const CloseIcon = getModule.find("CloseIconWithKeybind").default;
const ModalComponents = getModule.find(["ModalRoot"]);
const Markdown = getModule.find((m) => m.default?.displayName === "Markdown" && m.default.rules).default;

async function pushLayer(element) {
    getModule.find(["pushLayer"]).pushLayer(() => element);
}

async function reloadPrompt(title, content) {
    const ConfirmationModal = getModule.find("ConfirmModal").default;
    const { Messages } = getModule.find((m) => m.default?.Messages?.OKAY).default;

    if (!Array.isArray(content)) content = [content];
    content = content.map((c) => (typeof c === "string" ? React.createElement(Markdown, null, c) : c));

    return new Promise((resolve) => {
        modals.open((props) => {
            if (props.transitionState === 3) resolve(false);
            return React.createElement(
                ConfirmationModal,
                Object.assign(
                    {
                        header: title,
                        confirmButtonColor: ButtonColors.BRAND,
                        confirmText: "Reload",
                        danger: true,
                        cancelText: Messages.CANCEL,
                        onConfirm: () => resolve(true),
                        onCancel: () => resolve(false),
                        children: content,
                    },
                    props
                )
            );
        });
    });
}

const monaco = global.windowfunc.monaco;

const SettingsInputSection = React.memo((props) => {
    const { setting, note, name, warning, placeholder, type, maxLength, vertical } = props;

    const [value, setValue] = React.useState(DataStore.getData("VELOCITY_SETTINGS", setting));
    if (vertical) {
        return React.createElement("div", {
            id: "velocity-settings-section",
            class: "vertical",
            children: [
                React.createElement("div", {
                    id: "velocity-settings-section-info",
                    children: [
                        React.createElement(
                            Text,
                            {
                                color: Text.Colors.HEADER_PRIMARY,
                                size: Text.Sizes.SIZE_16,
                            },
                            name
                        ),
                        React.createElement(
                            Text,
                            {
                                color: Text.Colors.HEADER_SECONDARY,
                                size: Text.Sizes.SIZE_14,
                            },
                            note
                        ),
                        React.createElement(
                            Text,
                            {
                                color: Text.Colors.ERROR,
                                size: Text.Sizes.SIZE_14,
                            },
                            warning
                        ),
                    ],
                }),
                React.createElement(TextInput, {
                    value: value,
                    placeholder: placeholder,
                    type: type,
                    maxLength: maxLength,
                    onInput: ({ target }) => {
                        setValue(target.value);
                        DataStore.setData("VELOCITY_SETTINGS", setting, target.value);
                    },
                }),
            ],
        });
    } else {
        return React.createElement("div", {
            id: "velocity-settings-section",
            children: [
                React.createElement("div", {
                    id: "velocity-settings-section-info",
                    children: [
                        React.createElement(
                            Text,
                            {
                                color: Text.Colors.HEADER_PRIMARY,
                                size: Text.Sizes.SIZE_16,
                            },
                            name
                        ),
                        React.createElement(
                            Text,
                            {
                                color: Text.Colors.HEADER_SECONDARY,
                                size: Text.Sizes.SIZE_14,
                            },
                            note
                        ),
                        React.createElement(
                            Text,
                            {
                                color: Text.Colors.ERROR,
                                size: Text.Sizes.SIZE_14,
                            },
                            warning
                        ),
                    ],
                }),
                React.createElement(TextInput, {
                    value: value,
                    placeholder: placeholder,
                    type: type,
                    maxLength: maxLength,
                    onInput: ({ target }) => {
                        setValue(target.value);
                        DataStore.setData("VELOCITY_SETTINGS", setting, target.value);
                    },
                }),
            ],
        });
    }
});

const SettingsTitle = React.memo((props) => {
    const { text, divider = false } = props;
    if (divider) {
        return [
            React.createElement("div", {
                className: "velocity-settings-title-container",
                children: [
                    React.createElement(
                        "div",
                        {
                            className: "velocity-settings-title",
                        },
                        text
                    ),
                    React.createElement("div", {
                        className: "velocity-settings-title-divider",
                    }),
                ],
            }),
        ];
    } else {
        return [
            React.createElement(
                "div",
                {
                    className: "velocity-settings-title",
                },
                text
            ),
        ];
    }
});

const SettingsSection = React.memo((props) => {
    const { setting, note, name, warning, action, reload = false } = props;

    const [enabled, setEnabled] = React.useState(DataStore.getData("VELOCITY_SETTINGS", setting));
    return React.createElement("div", {
        id: "velocity-settings-section",
        children: [
            React.createElement("div", {
                id: "velocity-settings-section-info",
                children: [
                    React.createElement(
                        Text,
                        {
                            color: Text.Colors.HEADER_PRIMARY,
                            size: Text.Sizes.SIZE_16,
                        },
                        name
                    ),
                    React.createElement(
                        Text,
                        {
                            color: Text.Colors.HEADER_SECONDARY,
                            size: Text.Sizes.SIZE_14,
                        },
                        note
                    ),
                    React.createElement(
                        Text,
                        {
                            color: Text.Colors.ERROR,
                            size: Text.Sizes.SIZE_14,
                            id: `velocity-settings-section-${setting.toLowerCase()}-warning`,
                        },
                        warning
                    ),
                ],
            }),
            React.createElement(SwitchEle, {
                checked: enabled,
                onChange: async () => {
                    if (action) {
                        action();
                    }
                    DataStore.setData("VELOCITY_SETTINGS", setting, !enabled);
                    setEnabled(!enabled);
                    if (reload) {
                        const re = await reloadPrompt("Restart Discord?", "This Setting Requires a full reload of discord.");
                        if (re) {
                            ipcRenderer.invoke("reload-app");
                        }
                    }
                },
            }),
        ],
    });
});

const Card = React.memo((props) => {
    const { meta, type } = props;
    let buttons = [];

    const [enabled, setEnabled] = React.useState(VApi.AddonManager[type].isEnabled(meta.name));
    return React.createElement("div", {
        className: "velocity-card",
        type,
        id: meta.name,
        children: [
            React.createElement("div", {
                className: "velocity-card-header-wrapper",
                children: [
                    React.createElement("div", {
                        className: "velocity-card-header",
                        children: [
                            React.createElement("div", {
                                className: "velocity-card-header-top",
                                children: [
                                    React.createElement("div", {
                                        className: "velocity-card-header-name",
                                        children: meta.name,
                                    }),
                                    React.createElement("div", {
                                        className: "velocity-card-header-version",
                                        children: `v${meta.version}`,
                                    }),
                                ],
                            }),
                            React.createElement("div", {
                                className: "velocity-card-header-author-wrapper",
                                children: [
                                    React.createElement("div", {
                                        className: "velocity-card-header-author-text",
                                        children: "By ",
                                    }),
                                    React.createElement("div", {
                                        className: "velocity-card-header-author",
                                        children: meta.author,
                                    }),
                                ],
                            }),
                        ],
                    }),
                    React.createElement("div", {
                        className: "velocity-card-header-switch",
                        children: React.createElement(SwitchEle, {
                            checked: enabled,
                            onChange: () => {
                                try {
                                    VApi.AddonManager[type].toggle(meta.name);
                                    setEnabled(!enabled);
                                    if (!enabled) {
                                        showToast(`Enabled <strong>${meta.name}</strong>`, { type: "success" });
                                    } else {
                                        showToast(`Disabled <strong>${meta.name}</strong>`, { type: "success" });
                                    }
                                } catch (e) {
                                    if (!enabled) {
                                        showToast(`Failed to start <strong>${meta.name}</strong>`, { type: "error" });
                                        logger.error("Addon Manager", `Failed to start ${meta.name}`, e);
                                    } else {
                                        showToast(`Failed to stop <strong>${meta.name}</strong>`, { type: "error" });
                                        logger.error("Addon Manager", `Failed to stop ${meta.name}`, e);
                                    }
                                }
                            },
                        }),
                    }),
                ],
            }),
            React.createElement("div", {
                className: "velocity-card-content-wrapper",
                children: React.createElement(Markdown, {
                    className: "velocity-content",
                    children: meta.description,
                }),
            }),
            React.createElement("div", {
                className: "velocity-card-footer-wrapper",
                children: React.createElement("div", {
                    className: "velocity-card-footer",
                    children: [
                        React.createElement("div", {
                            className: "velocity-card-footer-right",
                            children: [
                                meta.source &&
                                    React.createElement(Tooltip, {
                                        text: "Source",
                                        children: (props) =>
                                            React.createElement(getModule.find("Clickable").default, {
                                                ...props,
                                                className: "velocity-clickable",
                                                children: [
                                                    React.createElement("svg", {
                                                        className: "velocity-card-footer-source velocity-addon-card-source",
                                                        width: "16",
                                                        height: "16",
                                                        viewBox: "0 0 256 250",
                                                        children: [
                                                            React.createElement("path", {
                                                                d: "M128.00106,0 C57.3172926,0 0,57.3066942 0,128.00106 C0,184.555281 36.6761997,232.535542 87.534937,249.460899 C93.9320223,250.645779 96.280588,246.684165 96.280588,243.303333 C96.280588,240.251045 96.1618878,230.167899 96.106777,219.472176 C60.4967585,227.215235 52.9826207,204.369712 52.9826207,204.369712 C47.1599584,189.574598 38.770408,185.640538 38.770408,185.640538 C27.1568785,177.696113 39.6458206,177.859325 39.6458206,177.859325 C52.4993419,178.762293 59.267365,191.04987 59.267365,191.04987 C70.6837675,210.618423 89.2115753,204.961093 96.5158685,201.690482 C97.6647155,193.417512 100.981959,187.77078 104.642583,184.574357 C76.211799,181.33766 46.324819,170.362144 46.324819,121.315702 C46.324819,107.340889 51.3250588,95.9223682 59.5132437,86.9583937 C58.1842268,83.7344152 53.8029229,70.715562 60.7532354,53.0843636 C60.7532354,53.0843636 71.5019501,49.6441813 95.9626412,66.2049595 C106.172967,63.368876 117.123047,61.9465949 128.00106,61.8978432 C138.879073,61.9465949 149.837632,63.368876 160.067033,66.2049595 C184.49805,49.6441813 195.231926,53.0843636 195.231926,53.0843636 C202.199197,70.715562 197.815773,83.7344152 196.486756,86.9583937 C204.694018,95.9223682 209.660343,107.340889 209.660343,121.315702 C209.660343,170.478725 179.716133,181.303747 151.213281,184.472614 C155.80443,188.444828 159.895342,196.234518 159.895342,208.176593 C159.895342,225.303317 159.746968,239.087361 159.746968,243.303333 C159.746968,246.709601 162.05102,250.70089 168.53925,249.443941 C219.370432,232.499507 256,184.536204 256,128.00106 C256,57.3066942 198.691187,0 128.00106,0 Z M47.9405593,182.340212 C47.6586465,182.976105 46.6581745,183.166873 45.7467277,182.730227 C44.8183235,182.312656 44.2968914,181.445722 44.5978808,180.80771 C44.8734344,180.152739 45.876026,179.97045 46.8023103,180.409216 C47.7328342,180.826786 48.2627451,181.702199 47.9405593,182.340212 Z M54.2367892,187.958254 C53.6263318,188.524199 52.4329723,188.261363 51.6232682,187.366874 C50.7860088,186.474504 50.6291553,185.281144 51.2480912,184.70672 C51.8776254,184.140775 53.0349512,184.405731 53.8743302,185.298101 C54.7115892,186.201069 54.8748019,187.38595 54.2367892,187.958254 Z M58.5562413,195.146347 C57.7719732,195.691096 56.4895886,195.180261 55.6968417,194.042013 C54.9125733,192.903764 54.9125733,191.538713 55.713799,190.991845 C56.5086651,190.444977 57.7719732,190.936735 58.5753181,192.066505 C59.3574669,193.22383 59.3574669,194.58888 58.5562413,195.146347 Z M65.8613592,203.471174 C65.1597571,204.244846 63.6654083,204.03712 62.5716717,202.981538 C61.4524999,201.94927 61.1409122,200.484596 61.8446341,199.710926 C62.5547146,198.935137 64.0575422,199.15346 65.1597571,200.200564 C66.2704506,201.230712 66.6095936,202.705984 65.8613592,203.471174 Z M75.3025151,206.281542 C74.9930474,207.284134 73.553809,207.739857 72.1039724,207.313809 C70.6562556,206.875043 69.7087748,205.700761 70.0012857,204.687571 C70.302275,203.678621 71.7478721,203.20382 73.2083069,203.659543 C74.6539041,204.09619 75.6035048,205.261994 75.3025151,206.281542 Z M86.046947,207.473627 C86.0829806,208.529209 84.8535871,209.404622 83.3316829,209.4237 C81.8013,209.457614 80.563428,208.603398 80.5464708,207.564772 C80.5464708,206.498591 81.7483088,205.631657 83.2786917,205.606221 C84.8005962,205.576546 86.046947,206.424403 86.046947,207.473627 Z M96.6021471,207.069023 C96.7844366,208.099171 95.7267341,209.156872 94.215428,209.438785 C92.7295577,209.710099 91.3539086,209.074206 91.1652603,208.052538 C90.9808515,206.996955 92.0576306,205.939253 93.5413813,205.66582 C95.054807,205.402984 96.4092596,206.021919 96.6021471,207.069023 Z",
                                                                fill: "currentColor",
                                                            }),
                                                        ],
                                                    }),
                                                ],
                                                onClick: () => {
                                                    if (meta.source !== "") window.open(meta.source || "about:blank", "_blank");
                                                },
                                            }),
                                    }),
                                meta.website &&
                                    React.createElement(Tooltip, {
                                        text: "Website",
                                        children: (props) =>
                                            React.createElement(getModule.find("Clickable").default, {
                                                ...props,
                                                className: "velocity-clickable velocity-addon-card-site",
                                                children: [
                                                    React.createElement("svg", {
                                                        className: "velocity-card-footer-site velocity-addon-card-site",
                                                        width: "16",
                                                        height: "16",
                                                        viewBox: "0 0 20 20",
                                                        children: [
                                                            React.createElement("path", {
                                                                d: "M 6.9044 14.5008 H 13.0958 C 12.4759 17.7722 11.2345 19.999 10.0001 19.999 C 8.8031 19.999 7.5995 17.9051 6.9624 14.7953 L 6.9044 14.5008 H 13.0958 H 6.9044 Z M 1.0659 14.501 L 5.3715 14.5008 C 5.7363 16.583 6.3546 18.3545 7.1637 19.5942 C 4.6009 18.8373 2.4672 17.0825 1.2122 14.7799 L 1.0659 14.501 Z M 14.6286 14.5008 L 18.9343 14.501 C 17.703 16.9406 15.5018 18.8071 12.8375 19.5939 C 13.592 18.4362 14.1807 16.8162 14.5524 14.9129 L 14.6286 14.5008 L 18.9343 14.501 L 14.6286 14.5008 Z M 14.9315 8.0008 L 19.8016 8.0002 C 19.9328 8.6465 20.0016 9.3155 20.0016 10.0005 C 20.0016 11.0458 19.8413 12.0537 19.5438 13.0009 H 14.8412 C 14.9465 12.0433 15.0016 11.0372 15.0016 10.0005 C 15.0016 9.5462 14.991 9.0977 14.9703 8.6567 L 14.9315 8.0008 L 19.8016 8.0002 L 14.9315 8.0008 Z M 0.1986 8.0002 L 5.0686 8.0008 C 5.0224 8.6508 4.9985 9.319 4.9985 10.0005 C 4.9985 10.8299 5.0339 11.6396 5.1019 12.4207 L 5.159 13.0009 H 0.4564 C 0.1589 12.0537 -0.0015 11.0458 -0.0015 10.0005 C -0.0015 9.3155 0.0674 8.6465 0.1986 8.0002 Z M 6.5756 8.0002 H 13.4246 C 13.4748 8.6459 13.5016 9.3147 13.5016 10.0005 C 13.5016 10.8381 13.4617 11.6505 13.3878 12.4262 L 13.3261 13.0009 H 6.674 C 6.561 12.0551 6.4985 11.0476 6.4985 10.0005 C 6.4985 9.4862 6.5136 8.9814 6.5423 8.4887 L 6.5756 8.0002 H 13.4246 H 6.5756 Z M 12.9444 0.5771 L 12.8365 0.4068 C 15.8548 1.2978 18.2788 3.5744 19.372 6.5002 L 14.7811 6.5005 C 14.4656 4.0835 13.8246 2.0079 12.9444 0.5771 L 12.8365 0.4068 L 12.9444 0.5771 Z M 7.0419 0.4436 L 7.1636 0.4069 C 6.2829 1.7564 5.6283 3.736 5.2806 6.0606 L 5.2191 6.5005 L 0.6282 6.5002 C 1.7066 3.6139 4.0802 1.3594 7.0419 0.4436 L 7.1636 0.4069 L 7.0419 0.4436 Z M 10.0001 0.0019 C 11.3189 0.0019 12.6457 2.5437 13.2141 6.1854 L 13.2609 6.5002 H 6.7393 C 7.2787 2.691 8.6436 0.0019 10.0001 0.0019 Z",
                                                                fill: "currentColor",
                                                            }),
                                                        ],
                                                    }),
                                                ],
                                                onClick: () => {
                                                    if (meta.website !== "") window.open(meta.website || "about:blank", "_blank");
                                                },
                                            }),
                                    }),
                                meta.invite &&
                                    React.createElement(Tooltip, {
                                        text: "Server Invite",
                                        children: (props) =>
                                            React.createElement(getModule.find("Clickable").default, {
                                                ...props,
                                                className: "velocity-clickable",
                                                children: [
                                                    React.createElement("svg", {
                                                        className: "velocity-card-footer-server velocity-addon-card-server",
                                                        width: "16",
                                                        height: "16",
                                                        viewBox: "0 0 20 20",
                                                        children: [
                                                            React.createElement("path", {
                                                                d: "M 10 20 C 4.4771 20 0 15.5228 0 10 C 0 4.4771 4.4771 0 10 0 C 15.5228 0 20 4.4771 20 10 C 20 15.5228 15.5228 20 10 20 Z M 15 11.5 C 15 10.6716 14.3284 10 13.5 10 H 6.5 C 5.6716 10 5 10.6716 5 11.5 V 12 C 5 13.9714 6.8595 16 10 16 C 13.1405 16 15 13.9714 15 12 V 11.5 Z M 12.75 6.25 C 12.75 4.7312 11.5188 3.5 10 3.5 C 8.4812 3.5 7.25 4.7312 7.25 6.25 C 7.25 7.7688 8.4812 9 10 9 C 11.5188 9 12.75 7.7688 12.75 6.25 Z",
                                                                fill: "currentColor",
                                                            }),
                                                        ],
                                                    }),
                                                ],
                                                onClick: () => {
                                                    if (meta.invite !== "") Utilities.joinServer(meta.invite);
                                                    getModule.find(["pushLayer"]).popLayer();
                                                    getModule.find(["closeAllModals"]).closeAllModals();
                                                },
                                            }),
                                    }),
                                meta.license &&
                                    React.createElement(Tooltip, {
                                        text: meta.license || "No License",
                                        children: (props) =>
                                            React.createElement(getModule.find("Clickable").default, {
                                                ...props,
                                                className: "velocity-clickable",
                                                children: [
                                                    React.createElement("svg", {
                                                        className: "velocity-card-footer-license velocity-addon-card-license",
                                                        width: "16",
                                                        height: "16",
                                                        viewBox: "0 0 24 24",
                                                        children: [
                                                            React.createElement("path", {
                                                                d: "M3.75 3C3.33579 3 3 3.33579 3 3.75C3 4.16421 3.33579 4.5 3.75 4.5H4.792L2.05543 11.217C2.01882 11.3069 2 11.403 2 11.5C2 13.433 3.567 15 5.5 15C7.433 15 9 13.433 9 11.5C9 11.403 8.98118 11.3069 8.94457 11.217L6.208 4.5H11.25L11.25 16.5H7.25293C6.01029 16.5 5.00293 17.5074 5.00293 18.75C5.00293 19.9926 6.01029 21 7.25293 21H16.75C17.9926 21 19 19.9926 19 18.75C19 17.5074 17.9926 16.5 16.75 16.5H12.75L12.75 4.5H17.792L15.0554 11.217C15.0188 11.3069 15 11.403 15 11.5C15 13.433 16.567 15 18.5 15C20.433 15 22 13.433 22 11.5C22 11.403 21.9812 11.3069 21.9446 11.217L19.208 4.5H20.25C20.6642 4.5 21 4.16421 21 3.75C21 3.33579 20.6642 3 20.25 3H3.75ZM5.5 6.73782L7.13459 10.75H3.86541L5.5 6.73782ZM16.8654 10.75L18.5 6.73782L20.1346 10.75H16.8654Z",
                                                                fill: "currentColor",
                                                            }),
                                                        ],
                                                    }),
                                                ],
                                            }),
                                    }),
                            ],
                        }),
                        React.createElement("div", {
                            className: "velocity-card-footer-left",
                            children: [
                                meta.sponsor &&
                                    React.createElement(Tooltip, {
                                        text: "Sponsor the Developer",
                                        children: (props) =>
                                            React.createElement(getModule.find("Clickable").default, {
                                                ...props,
                                                className: "velocity-clickable",
                                                children: [
                                                    React.createElement(
                                                        Button,
                                                        {
                                                            size: ButtonSizes.SMALL,
                                                            className: ["velocity-card-footer-sponsor-button"],
                                                            onClick: () => {
                                                                meta.sponsor.indexOf("http") == 0 ? window.open(meta.sponsor, "_blank") : window.open(`https://${meta.sponsor}`);
                                                            },
                                                        },
                                                        "Sponsor"
                                                    ),
                                                ],
                                            }),
                                    }),
                                React.createElement(
                                    Button,
                                    {
                                        size: ButtonSizes.SMALL,
                                        className: ["velocity-card-footer-edit-button"],
                                        onClick: () => {
                                            shell.openPath(meta.file);
                                        },
                                    },
                                    "Edit"
                                ),
                                React.createElement(
                                    Button,
                                    {
                                        color: ButtonColors.RED,
                                        size: ButtonSizes.SMALL,
                                        className: ["velocity-card-footer-delete-button"],
                                        onClick: () => {
                                            fs.unlink(meta.file, () => {
                                                showToast(`Deleted ${meta.name}`, { type: "error" });
                                            });
                                        },
                                    },
                                    "Delete"
                                ),
                            ],
                        }),
                    ],
                }),
            }),
        ],
    });
});

const Settings = DataStore("VELOCITY_SETTINGS");
const headerClasses = "velocity-header-display";

async function settingsPrompt() {
    return new Promise((resolve) => {
        modals.open((props) =>
            React.createElement(
                ModalComponents.ModalRoot,
                Object.assign(props, {
                    size: "medium",
                    className: "velocity-modal",
                    children: [
                        React.createElement(
                            ModalComponents.ModalHeader,
                            null,
                            React.createElement(
                                Text,
                                {
                                    size: Text.Sizes.SIZE_20,
                                    color: Text.Colors.HEADER_PRIMARY,
                                    className: getModule.find(["h1"]).h1,
                                },
                                "Velocity Settings"
                            )
                        ),
                        React.createElement(ModalComponents.ModalContent, {
                            children: [
                                React.createElement(SettingsTitle, {
                                    text: "General",
                                    divider: true,
                                }),
                                React.createElement(SettingsSection, {
                                    setting: "CheckForUpdates",
                                    name: "Check For Updates",
                                    note: "Checks for updates on start.",
                                }),
                                React.createElement(SettingsSection, {
                                    setting: "ReloadOnLogin",
                                    name: "Reload On Login",
                                    note: "Fixes some issues with logins.",
                                }),
                                React.createElement(SettingsTitle, {
                                    text: "Window",
                                    divider: true,
                                }),
                                React.createElement(SettingsSection, {
                                    setting: "Transparency",
                                    name: "Window Transparency",
                                    note: "Makes the main window transparent.",
                                    reload: true,
                                    action: () => {
                                        DataStore.setData("VELOCITY_SETTINGS", "Vibrancy", false);
                                        const warning = document.getElementById("velocity-settings-section-transparency-warning");
                                        warning.innerHTML = "Requires Restart.";
                                    },
                                }),
                                React.createElement(SettingsSection, {
                                    setting: "Vibrancy",
                                    name: "Window Vibrancy",
                                    note: "Makes the main window have Vibrancy. (MacOS)",
                                    reload: true,
                                    action: () => {
                                        DataStore.setData("VELOCITY_SETTINGS", "Transparency", false);
                                        const warning = document.getElementById("velocity-settings-section-vibrancy-warning");
                                        warning.innerHTML = "Requires Restart.";
                                    },
                                }),
                                React.createElement(SettingsTitle, {
                                    text: "Tools",
                                    divider: true,
                                }),
                                React.createElement(SettingsSection, {
                                    setting: "CSSEnabled",
                                    name: "Custom Css",
                                    note: "Enables Custom Css.",
                                }),
                                React.createElement(SettingsSection, {
                                    setting: "JSEnabled",
                                    name: "Startup Script",
                                    note: "Loads Startup Script.",
                                    warning: "You can easily add malicious scripts! Be careful!",
                                }),
                                React.createElement(SettingsTitle, {
                                    text: "Developer",
                                    divider: true,
                                }),
                                React.createElement(SettingsSection, {
                                    setting: "DegubberKey",
                                    name: "Debugger Hotkey",
                                    note: "Press f8 to freeze discord with DevTools open.",
                                    reload: true,
                                    action: () => {
                                        const warning = document.getElementById("velocity-settings-section-degubberkey-warning");
                                        warning.innerHTML = "Requires Restart.";
                                    },
                                }),
                                React.createElement(SettingsSection, {
                                    setting: "DevMode",
                                    name: "Debugging Mode",
                                    note: "Sends startup logs to the console.",
                                }),
                                React.createElement(SettingsSection, {
                                    setting: "CSSFeatures",
                                    name: "Beta CSS Features",
                                    note: "Adds Velocity's beta CSS @ Rules.",
                                }),
                                React.createElement(SettingsInputSection, {
                                    setting: "FontSize",
                                    name: "Editor Font Size",
                                    note: "A value between 2-14 is best.",
                                    placeholder: "14",
                                    type: "number",
                                    vertical: true,
                                    maxLength: 2,
                                }),
                                React.createElement(SettingsSection, {
                                    setting: "DeveloperSettings",
                                    name: "Developer Settings",
                                    note: "Only Enbale if you know what you are doing.",
                                }),
                            ],
                        }),
                        React.createElement(ModalComponents.ModalFooter, {
                            className: "velocity-modal-footer",
                            children: [
                                React.createElement(Text, {
                                    color: Text.Colors.HEADER_SECONDARY,
                                    size: Text.Sizes.SIZE_12,
                                    style: {
                                        marginTop: "5px",
                                    },
                                    children: [
                                        "psst, need some help? Join our ",
                                        React.createElement(
                                            "a",
                                            {
                                                onClick: () => {
                                                    Utilities.joinOfficialServer();
                                                    showToast("Exit settings and have a look!", {
                                                        title: "Joined Official Server",
                                                        type: "success",
                                                        timeout: 5000,
                                                    });
                                                },
                                            },
                                            "Official Server"
                                        ),
                                    ],
                                }),
                                React.createElement(
                                    Button,
                                    {
                                        onClick: props.onClose,
                                        className: "velocity-button",
                                    },
                                    "Done"
                                ),
                            ],
                        }),
                    ],
                })
            )
        );
    });
}

async function pluginPrompt() {
    const Plugins = VApi.AddonManager.plugins.getAll();

    return new Promise((resolve) => {
        modals.open((props) =>
            React.createElement(
                ModalComponents.ModalRoot,
                Object.assign(props, {
                    size: "medium",
                    className: "velocity-modal",
                    children: [
                        React.createElement(
                            ModalComponents.ModalHeader,
                            null,
                            React.createElement(
                                Text,
                                {
                                    size: Text.Sizes.SIZE_20,
                                    color: Text.Colors.HEADER_PRIMARY,
                                    className: getModule.find(["h1"]).h1,
                                },
                                "Velocity Plugins"
                            )
                        ),
                        React.createElement(ModalComponents.ModalContent, {
                            children: [
                                React.createElement("div", { className: "velocity-modal-spacer" }),
                                React.createElement(
                                    Button,
                                    {
                                        id: "plugins-folder",
                                        color: ButtonColors.BRAND,
                                        size: ButtonSizes.SMALL,
                                        className: ["velocity-button"],
                                        onClick: () => {
                                            shell.openPath(VApi.AddonManager.plugins.folder);
                                        },
                                    },
                                    "Open Plugins Folder"
                                ),
                                React.createElement("div", {
                                    id: "velocity-addons-grid",
                                    children: [
                                        Plugins.map((plugin) =>
                                            React.createElement(Card, {
                                                meta: plugin,
                                                type: "plugins",
                                            })
                                        ),
                                    ],
                                }),
                            ],
                        }),
                        React.createElement(ModalComponents.ModalFooter, {
                            className: "velocity-modal-footer",
                            children: [
                                React.createElement(
                                    Button,
                                    {
                                        onClick: props.onClose,
                                        className: "velocity-button",
                                    },
                                    "Done"
                                ),
                            ],
                        }),
                    ],
                })
            )
        );
    });
}

async function themePrompt() {
    const Themes = VApi.AddonManager.themes.getAll();

    return new Promise((resolve) => {
        modals.open((props) =>
            React.createElement(
                ModalComponents.ModalRoot,
                Object.assign(props, {
                    size: "medium",
                    className: "velocity-modal",
                    children: [
                        React.createElement(
                            ModalComponents.ModalHeader,
                            null,
                            React.createElement(
                                Text,
                                {
                                    size: Text.Sizes.SIZE_20,
                                    color: Text.Colors.HEADER_PRIMARY,
                                    className: getModule.find(["h1"]).h1,
                                },
                                "Velocity Plugins"
                            )
                        ),
                        React.createElement(ModalComponents.ModalContent, {
                            children: [
                                React.createElement("div", { className: "velocity-modal-spacer" }),
                                React.createElement(
                                    Button,
                                    {
                                        id: "themes-folder",
                                        color: ButtonColors.BRAND,
                                        size: ButtonSizes.SMALL,
                                        className: ["velocity-button"],
                                        onClick: () => {
                                            shell.openPath(VApi.AddonManager.themes.folder);
                                        },
                                    },
                                    "Open Themes Folder"
                                ),
                                React.createElement("div", {
                                    id: "velocity-addons-grid",
                                    children: [
                                        Themes.map((theme) =>
                                            React.createElement(Card, {
                                                meta: theme,
                                                type: "themes",
                                            })
                                        ),
                                    ],
                                }),
                            ],
                        }),
                        React.createElement(ModalComponents.ModalFooter, {
                            className: "velocity-modal-footer",
                            children: [
                                React.createElement(
                                    Button,
                                    {
                                        onClick: props.onClose,
                                        className: "velocity-button",
                                    },
                                    "Done"
                                ),
                            ],
                        }),
                    ],
                })
            )
        );
    });
}

let fontsize = DataStore.getData("VELOCITY_SETTINGS", "FontSize") || 14;
if (fontsize > 14) {
    fontsize = 14;
    DataStore.setData("VELOCITY_SETTINGS", "FontSize", 14);
}
if (fontsize < 2) {
    fontsize = 2;
    DataStore.setData("VELOCITY_SETTINGS", "FontSize", 2);
}
async function jsPrompt() {
    return new Promise((resolve) => {
        modals.open((props) =>
            React.createElement(
                ModalComponents.ModalRoot,
                Object.assign(props, {
                    size: "medium",
                    className: "velocity-modal",
                    children: [
                        React.createElement(
                            ModalComponents.ModalHeader,
                            null,
                            React.createElement(
                                Text,
                                {
                                    size: Text.Sizes.SIZE_20,
                                    color: Text.Colors.HEADER_PRIMARY,
                                    className: getModule.find(["h1"]).h1,
                                },
                                "Startup Script"
                            )
                        ),
                        React.createElement(ModalComponents.ModalContent, {
                            children: [
                                React.createElement("div", { className: "velocity-modal-spacer" }),
                                React.createElement(
                                    "h1",
                                    {
                                        class: headerClasses,
                                    },
                                    "Startup Script"
                                ),
                                React.createElement("div", {
                                    id: "editor",
                                }),
                                React.createElement(Tooltip, {
                                    text: "You can still manually add the script...",
                                    children: (props) =>
                                        React.createElement(getModule.find("Clickable").default, {
                                            ...props,
                                            className: "warning-clickable",
                                            children: [
                                                React.createElement(
                                                    Text,
                                                    {
                                                        color: Text.Colors.ERROR,
                                                        size: Text.Sizes.SIZE_14,
                                                        id: `velocity-script-warning`,
                                                    },
                                                    ""
                                                ),
                                            ],
                                            onClick: () => {
                                                const coreDir = path.join(__dirname, "..");
                                                const settingsDir = path.join(coreDir, "..", "settings");
                                                shell.openPath(settingsDir);
                                            },
                                        }),
                                }),
                                (this.save = React.createElement("div", {
                                    class: "velocity-button-container",
                                    children: [
                                        React.createElement(
                                            Button,
                                            {
                                                id: "startup-script-save",
                                                disabled: false,
                                                className: [ButtonColors.BRAND, "velocity-button"],
                                                onClick: ({ target }) => {
                                                    const content = window.editor.getValue();
                                                    if (!target.disabled) {
                                                        DataStore.setData("VELOCITY_SETTINGS", "JS", content);
                                                        showToast("Saved", { type: "success" });
                                                    }
                                                },
                                            },
                                            "Save"
                                        ),
                                        React.createElement(
                                            Button,
                                            {
                                                id: "startup-script-clear",
                                                className: [ButtonColors.RED, "velocity-button"],
                                                onClick: () => {
                                                    window.editor.setValue("");
                                                    DataStore.setData("VELOCITY_SETTINGS", "JS", "");

                                                    showToast("Cleared", { type: "success" });
                                                },
                                            },
                                            "Clear"
                                        ),
                                    ],
                                })),
                                React.createElement("div", { className: "velocity-modal-spacer" }),
                            ],
                        }),
                        React.createElement(ModalComponents.ModalFooter, {
                            className: "velocity-modal-footer",
                            children: [
                                React.createElement(
                                    Button,
                                    {
                                        onClick: props.onClose,
                                        className: "velocity-button",
                                    },
                                    "Done"
                                ),
                            ],
                        }),
                    ],
                })
            )
        );
    });
}

async function cssPrompt() {
    return new Promise((resolve) => {
        modals.open((props) =>
            React.createElement(
                ModalComponents.ModalRoot,
                Object.assign(props, {
                    size: "medium",
                    className: "velocity-modal",
                    children: [
                        React.createElement(
                            ModalComponents.ModalHeader,
                            null,
                            React.createElement(
                                Text,
                                {
                                    size: Text.Sizes.SIZE_20,
                                    color: Text.Colors.HEADER_PRIMARY,
                                    className: getModule.find(["h1"]).h1,
                                },
                                "Startup Custom CSS"
                            )
                        ),
                        React.createElement(ModalComponents.ModalContent, {
                            children: [
                                React.createElement("div", { className: "velocity-modal-spacer" }),
                                React.createElement(
                                    "h1",
                                    {
                                        class: headerClasses,
                                    },
                                    "Custom Css"
                                ),
                                React.createElement("div", {
                                    id: "editor",
                                }),
                                React.createElement(Tooltip, {
                                    text: "Click me to open the folder!",
                                    children: (props) =>
                                        React.createElement(getModule.find("Clickable").default, {
                                            ...props,
                                            className: "warning-clickable",
                                            children: [
                                                React.createElement(
                                                    Text,
                                                    {
                                                        color: Text.Colors.ERROR,
                                                        size: Text.Sizes.SIZE_14,
                                                        id: `velocity-customcss-warning`,
                                                    },
                                                    ""
                                                ),
                                            ],
                                            onClick: () => {
                                                shell.openPath(VApi.AddonManager.themes.folder);
                                            },
                                        }),
                                }),
                                React.createElement("div", {
                                    class: "velocity-button-container",
                                    children: [
                                        React.createElement(
                                            Button,
                                            {
                                                id: "custom-css-save",
                                                className: [ButtonColors.BRAND, "velocity-button"],
                                                onClick: () => {
                                                    try {
                                                        const content = window.editor.getValue();
                                                        DataStore.setData("VELOCITY_SETTINGS", "CSS", content);
                                                        VApi.customCSS.reload();

                                                        showToast("Saved", { type: "success" });
                                                    } catch (error) {
                                                        console.error(error);
                                                    }
                                                },
                                            },
                                            "Save"
                                        ),
                                        React.createElement(
                                            Button,
                                            {
                                                id: "custom-css-clear",
                                                className: [ButtonColors.RED, "velocity-button"],
                                                onClick: () => {
                                                    window.editor.setValue("");
                                                    DataStore.setData("VELOCITY_SETTINGS", "CSS", "");
                                                    VApi.customCSS.reload();

                                                    showToast("Cleared", { type: "success" });
                                                },
                                            },
                                            "Clear"
                                        ),
                                    ],
                                }),
                                React.createElement("div", { className: "velocity-modal-spacer" }),
                            ],
                        }),
                        React.createElement(ModalComponents.ModalFooter, {
                            className: "velocity-modal-footer",
                            children: [
                                React.createElement(
                                    Button,
                                    {
                                        onClick: props.onClose,
                                        className: "velocity-button",
                                    },
                                    "Done"
                                ),
                            ],
                        }),
                    ],
                })
            )
        );
    });
}

const UserSettings = getModule.find("SettingsView").default;

VApi.Patcher("VelocityInternal-Settings-Patch", UserSettings.prototype, "getPredicateSections", ([args], returnValue) => {
    let location = returnValue.findIndex((s) => s.section.toLowerCase() == "discord nitro") - 2;
    if (location < 0) return;
    const insert = (section) => {
        returnValue.splice(location, 0, section);
        location++;
    };

    insert({ section: "DIVIDER" });
    insert({ section: "HEADER", label: "Velocity" });
    insert({
        section: "updates",
        label: "Check for Updates",
        className: `velocity-updates-tab`,
        onClick: () => {
            updater.checkForUpdates();
        },
    });
    insert({
        section: "settings",
        label: "Settings",
        className: `velocity-settings-tab`,
        onClick: () => {
            settingsPrompt();
        },
    });

    if (Settings.CSSEnabled) {
        insert({
            section: "customcss",
            label: "Custom CSS",
            className: `velocity-customcss-tab`,
            onClick: () => {
                const customCSS = DataStore.getData("VELOCITY_SETTINGS", "CSS");
                cssPrompt();
                setTimeout(() => {
                    window.editor = monaco.editor.create(document.getElementById("editor"), {
                        language: "css",
                        theme: document.documentElement.classList.contains("theme-dark") ? "vs-dark" : "vs-light",
                        value: customCSS,
                        fontSize: fontsize,
                    });
                    window.editor.onDidChangeModelContent(() => {
                        const content = window.editor.getValue();

                        if (content.includes("/**" && "@name")) {
                            const warn = document.getElementById("velocity-customcss-warning");
                            warn.innerHTML = "This looks like a theme... you should put themes in your theme folder, not here.";
                        } else {
                            const warn = document.getElementById("velocity-customcss-warning");
                            warn.innerHTML = "";
                        }
                    });
                }, 50);
            },
        });
    }
    if (Settings.JSEnabled) {
        insert({
            section: "ssscript",
            label: "Startup Script",
            className: `velocity-ssscript-tab`,
            onClick: () => {
                const startupJS = DataStore.getData("VELOCITY_SETTINGS", "JS");
                jsPrompt();
                setTimeout(() => {
                    window.editor = monaco.editor.create(document.getElementById("editor"), {
                        language: "javascript",
                        theme: document.documentElement.classList.contains("theme-dark") ? "vs-dark" : "vs-light",
                        value: startupJS,
                        fontSize: fontsize,
                    });
                    window.editor.onDidChangeModelContent(() => {
                        const content = window.editor.getValue();
                        const button = document.getElementById("startup-script-save");
                        if (content.includes("getToken" || "getEmail")) {
                            const warn = document.querySelector("#velocity-script-warning");
                            warn.innerHTML = "Be careful what you put in here, this script looks malicious.";
                            if (button) button.disabled = true;
                        } else {
                            const warn = document.querySelector("#velocity-script-warning");
                            warn.innerHTML = "";
                            if (button) button.disabled = false;
                        }
                    });
                }, 50);
            },
        });
    }
    insert({
        section: "plugins",
        label: "Plugins",
        className: `velocity-plugins-tab`,
        onClick: () => {
            pluginPrompt();
        },
    });
    insert({
        section: "themes",
        label: "Themes",
        className: `velocity-themes-tab`,
        onClick: () => {
            themePrompt();
        },
    });
    if (Settings.DeveloperSettings) {
        insert({
            section: "developer",
            label: "Developer",
            className: `velocity-developer-tab`,
            onClick: () => {
                try {
                    getModule.find(["pushLayer"]).pushLayer(() => [
                        React.createElement("div", {
                            className: "velocity-close-conteainer",
                            style: { top: "60px", right: "60px", position: "absolute" },
                            children: [
                                React.createElement(CloseIcon, {
                                    closeAction: () => {
                                        getModule.find(["popLayer"]).popLayer();
                                    },
                                    keybind: "ESC",
                                }),
                            ],
                        }),
                        React.createElement("div", {
                            className: "velocity-developer-container",
                            children: [
                                React.createElement(
                                    Text,
                                    {
                                        size: Text.Sizes.SIZE_14,
                                        className: `velocity-developer-header ${getModule.find(["h1"]).h1}`,
                                    },
                                    "Internal Patches"
                                ),
                                React.createElement("div", {
                                    className: "velocity-developer-items-container",
                                    children: [
                                        internalPatches.map((patch) =>
                                            React.createElement("div", {
                                                className: "velocity-developer-internal-patch",
                                                children: [
                                                    React.createElement(TextInput, {
                                                        value: patch.name,
                                                        disabled: true,
                                                    }),
                                                    React.createElement("div", {
                                                        className: "velocity-developer-internal-patch-info",
                                                        children: [
                                                            patch.warning &&
                                                                React.createElement(
                                                                    "div",
                                                                    {
                                                                        className: "velocity-developer-internal-warning",
                                                                    },
                                                                    "WARNING - Killing this patch is dangerous and can cause issues."
                                                                ),
                                                            patch.beta &&
                                                                React.createElement(
                                                                    "div",
                                                                    {
                                                                        className: "velocity-developer-internal-beta-tag",
                                                                    },
                                                                    "BETA"
                                                                ),
                                                            React.createElement(
                                                                Button,
                                                                {
                                                                    size: ButtonSizes.SMALL,
                                                                    color: ButtonColors.RED,
                                                                    onClick: (target) => {
                                                                        target.target.tagName == "BUTTON"
                                                                            ? target.target.setAttribute("disabled", "true")
                                                                            : target.target.parentElement.setAttribute("disabled", "true");
                                                                        VApi.Patcher.unpatchAll(patch.name);
                                                                        showToast(`Killed <strong>${patch.name}</strong>`, { type: "error" });
                                                                    },
                                                                },
                                                                "Kill"
                                                            ),
                                                        ],
                                                    }),
                                                ],
                                            })
                                        ),
                                    ],
                                }),
                                React.createElement(
                                    Text,
                                    {
                                        size: Text.Sizes.SIZE_14,
                                        className: `velocity-developer-header ${getModule.find(["h1"]).h1}`,
                                    },
                                    "Backend Status"
                                ),
                                React.createElement("div", {
                                    className: "velocity-developer-status-buttons-container",
                                    children: [
                                        React.createElement(
                                            Button,
                                            {
                                                color: ButtonColors.BRAND,
                                                onClick: async (target) => {
                                                    request("https://raw.githubusercontent.com/Velocity-Discord/Backend/main/api/Badges.json", (_, res, body) => {
                                                        if (res.statusCode == 200) {
                                                            const statusBadgeElement = document.querySelector(".velocity-developer-status-badges-text");
                                                            statusBadgeElement.innerHTML = `Status - Fine (${res.statusCode})`;
                                                            statusBadgeElement.style.color = "var(--text-positive)";
                                                        } else {
                                                            const statusUpdateElement = document.querySelector(".velocity-developer-status-badges-text");
                                                            statusUpdateElement.innerHTML = `Status - Unknown (${res.statusCode})`;
                                                            statusUpdateElement.style.color = "var(--text-danger)";
                                                        }
                                                    });

                                                    request("https://raw.githubusercontent.com/Velocity-Discord/Backend/main/api/Updates.json", (_, res, body) => {
                                                        if (res.statusCode == 200) {
                                                            const statusUpdateElement = document.querySelector(".velocity-developer-status-update-text");
                                                            statusUpdateElement.innerHTML = `Status - Fine (${res.statusCode})`;
                                                            statusUpdateElement.style.color = "var(--text-positive)";
                                                        } else {
                                                            const statusUpdateElement = document.querySelector(".velocity-developer-status-update-text");
                                                            statusUpdateElement.innerHTML = `Status - Unknown (${res.statusCode})`;
                                                            statusUpdateElement.style.color = "var(--text-danger)";
                                                        }
                                                    });
                                                },
                                            },
                                            "Re-Request"
                                        ),
                                        React.createElement(
                                            Button,
                                            {
                                                color: ButtonColors.RED,
                                                onClick: () => {
                                                    const statusBadgeElement = document.querySelector(".velocity-developer-status-badges-text");
                                                    const statusUpdateElement = document.querySelector(".velocity-developer-status-update-text");
                                                    statusUpdateElement.innerHTML = "Status";
                                                    statusBadgeElement.innerHTML = "Status";
                                                    statusUpdateElement.style.color = null;
                                                    statusBadgeElement.style.color = null;
                                                },
                                            },
                                            "Clear Cache"
                                        ),
                                    ],
                                }),
                                React.createElement(
                                    Text,
                                    {
                                        size: Text.Sizes.SIZE_16,
                                        className: "velocity-developer-status-header",
                                    },
                                    "Badges"
                                ),
                                React.createElement(
                                    Text,
                                    {
                                        size: Text.Sizes.SIZE_14,
                                        color: Text.Colors.MUTED,
                                        className: "velocity-developer-status-badges-text",
                                    },
                                    "Status"
                                ),
                                React.createElement(
                                    Text,
                                    {
                                        size: Text.Sizes.SIZE_16,
                                        className: "velocity-developer-status-header",
                                    },
                                    "Updates"
                                ),
                                React.createElement(
                                    Text,
                                    {
                                        size: Text.Sizes.SIZE_14,
                                        color: Text.Colors.MUTED,
                                        className: "velocity-developer-status-update-text",
                                    },
                                    "Status"
                                ),
                                React.createElement(getModule.find(["EmptyStateImage"]).EmptyStateImage, {
                                    height: 200,
                                    width: 415,
                                    darkSrc: "/assets/c115d59ca13c0f942965a82a0f05bf01.svg",
                                    lightSrc: "/assets/ad530d02033b87bb89752f915c2fbe3c.svg",
                                    style: { flex: "none", marginInline: "auto" },
                                }),
                            ],
                        }),
                    ]);
                } catch (error) {
                    console.error(error);
                }
            },
        });
    }
    let changeLocation = returnValue.findIndex((s) => s.section.toLowerCase() == "changelog") + 1;
    if (changeLocation < 0) return;
    const insertChange = (section) => {
        returnValue.splice(changeLocation, 0, section);
        changeLocation++;
    };

    insertChange({
        section: "velocity-changelog",
        label: "Velocity Change Log",
        className: `velocity-velocity-changelog-tab`,
        onClick: () => {
            updater.changelogModal();
        },
    });
});

const TabBar = getModule.find("TabBar").default;
VApi.Patcher("VelocityInternal-Settings-Info-Patch", TabBar.prototype, "render", ([args], returnValue) => {
    let children = returnValue.props.children;
    if (!children || !children.length || children.length < 3) return;
    if (children[children.length - 3].type.displayName !== "Separator") return;
    if (!children[children.length - 2].type.toString().includes("socialLinks")) return;
    let infoClasses = getModule.find(["versionHash"]);

    const infoEle = React.createElement("span", {
        className: `${Text.Colors.MUTED} ${Text.Sizes.SIZE_12} ${infoClasses.line}`,
        children: [
            `velocity ${info.version} `,
            React.createElement(
                "span",
                {
                    className: infoClasses.versionHash,
                },
                `(${info.hash})`
            ),
        ],
    });

    const originalVersions = children[children.length - 1].type;
    children[children.length - 1].type = function () {
        const returnVal = originalVersions(...arguments);
        returnVal.props.children.splice(1, 0, infoEle);
        return returnVal;
    };
});
