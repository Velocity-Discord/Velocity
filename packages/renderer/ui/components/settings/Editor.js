import { runSnippets, updateSnippets } from "../../../modules/snippets";
import { injectComponentStyle } from "../../../util/components";
import { showToast } from "../../../modules/notifications";
import { Stream } from "../../../modules/datastore";
import ObservableArray from "../../../structs/array";
import Velocity from "../../../modules/velocity";
import loader from "@monaco-editor/loader";

import FormTitle from "../reworks/FormTitle";

const Settings = Stream("config");

const fs = VelocityCore.pseudoRequire("fs");
const path = VelocityCore.pseudoRequire("path");
const VELOCITY_DIRECTORY = VelocityCore.baseDir;

const { WebpackModules } = Velocity;

const TYPES = fs.readFileSync(path.join(VELOCITY_DIRECTORY, "index.d.ts"), "utf8");

injectComponentStyle("editor", {
    ".velocity-editor-modal-body": {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
    },
    ".velocity-editor-modal-body > div": {
        width: "100%",
    },
    ".velocity-editor": {
        backgroundColor: "var(--background-secondary)",
        borderRadius: "4px",
        width: "100%",
        height: "600px",
        display: "flex",
        overflow: "hidden",
        flexDirection: "column",
    },
    ".editor-header": {
        display: "flex",
        height: "40px",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "24px 10px",
    },
    ".editor-header-buttons": {
        display: "flex",
        gap: "5px",
    },
    ".editor-body": {
        width: "100%",
        height: "100%",
        display: "flex",
    },
    ".editor-sidebar": {
        width: "200px",
        height: "100%",
        backgroundColor: "var(--background-secondary-alt)",
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        padding: "10px",
        overflow: "auto",
    },
    ".editor-sidebar-tab": {
        color: "var(--text-normal)",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "8px 10px",
        borderRadius: "4px",
        cursor: "pointer",
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
    },
    ".editor-sidebar-tab:hover": {
        backgroundColor: "var(--background-modifier-hover)",
    },
    ".editor-sidebar-tab.active": {
        backgroundColor: "var(--background-modifier-active)",
    },
    "#editor-container": {
        height: "100%",
        width: "100%",
    },
});

let monaco;

if (!Settings.editorTabs) Settings.editorTabs = [];

const EDITOR_TABS = new ObservableArray(...Settings.editorTabs);

new Promise((resolve) => {
    if (document.readyState === "complete") resolve();
    else window.addEventListener("load", resolve);
}).then(() => {
    loader.init().then((m) => {
        monaco = m;
        window.monaco = monaco;
        monaco.languages.typescript.javascriptDefaults.addExtraLib(TYPES, "velocity.d.ts");
        monaco.editor.create(document.getElementById("editor-container"), {});
    });
});

export default (props) => {
    const { Components, Icons, Actions } = WebpackModules.common;

    const [active, setActive] = React.useState(0);
    const [tabs, setTabs] = React.useState(EDITOR_TABS);

    React.useEffect(() => {
        window.editor = monaco.editor.create(document.getElementById("editor-container"), {
            value: selected ? selected?.content : "/* No File Selected. */\n/* Select a file from the sidebar to edit it. */",
            language: selected ? (selected?.language == "js" ? "javascript" : "css") : "javascript",
            theme: "vs-dark",
            minimap: {
                enabled: false,
            },
        });

        window.editor.onDidChangeModelContent((e) => {
            if (selected) {
                if (e.changes?.[0]?.forceMoveMarkers !== false) return;

                EDITOR_TABS.splice(active, 1, {
                    ...EDITOR_TABS[active],
                    content: window.editor.getValue(),
                });
            }

            updateSnippets();
        });

        return () => {
            window.editor.dispose();
        };
    });

    EDITOR_TABS.addListener((e) => {
        setTabs(e);
        Settings.editorTabs = e;
    });

    let selected = Settings.editorTabs[active];

    const PanelButton = Components.PanelButton.default;
    const TextInput = Components.TextInput.default;
    const ModalActions = Actions.ModalActions;
    const Alert = Components.Alert.default;

    return (
        <div className="velocity-editor">
            <div className="editor-header">
                <FormTitle tag="h5" style={{ margin: "0" }}>
                    {selected ? `${selected?.name}.${selected?.language}` : "None Selected"}
                </FormTitle>
                <div className="editor-header-buttons">
                    {selected?.language == "js" && (
                        <PanelButton
                            tooltipText="Run"
                            icon={Icons.Play.default}
                            onClick={() => {
                                runSnippets("js");
                            }}
                        />
                    )}
                    <PanelButton
                        tooltipText="New File"
                        icon={Icons.Plus.default}
                        onClick={() => {
                            let name = "";
                            let language = "js";

                            ModalActions.openModal((p) => (
                                <Alert
                                    {...p}
                                    title="New File"
                                    body={
                                        <div className="velocity-editor-modal-body">
                                            <FormTitle tag="h5">Name</FormTitle>
                                            <TextInput
                                                style={{
                                                    marginBottom: "10px",
                                                }}
                                                onChange={(e) => {
                                                    name = e;
                                                }}
                                                placeholder="Name"
                                            />
                                            <FormTitle tag="h5">Language</FormTitle>
                                            <TextInput
                                                onChange={(e) => {
                                                    language = e;
                                                }}
                                                placeholder="js/css"
                                            />
                                        </div>
                                    }
                                    onConfirm={() => {
                                        if (!name) return;
                                        if (!["js", "css"].includes(language)) return;

                                        EDITOR_TABS.push({
                                            name,
                                            language,
                                            content: "",
                                        });

                                        setActive(EDITOR_TABS.length - 1);

                                        window.editor.setValue(selected?.content || "");
                                        monaco.editor.setModelLanguage(window.editor.getModel(), selected?.language == "js" ? "javascript" : "css");
                                        selected = Settings.editorTabs[active];
                                    }}
                                />
                            ));
                        }}
                    />
                    <PanelButton
                        tooltipText="Options"
                        icon={Icons.Gear.default}
                        onClick={() => {
                            if (!selected) return showToast("No File Selected", { type: "error" });

                            let name = selected.name;

                            ModalActions.openModal((p) => (
                                <Alert
                                    {...p}
                                    title="Options"
                                    body={
                                        <div className="velocity-editor-modal-body">
                                            <FormTitle tag="h5">Name</FormTitle>
                                            <TextInput
                                                onChange={(e) => {
                                                    name = e;
                                                }}
                                                placeholder="Name"
                                            />
                                        </div>
                                    }
                                    onConfirm={() => {
                                        if (!name) return;

                                        EDITOR_TABS.splice(active, 1, {
                                            name,
                                            language: selected?.language,
                                            content: selected?.content,
                                        });

                                        setActive(EDITOR_TABS.findIndex((e) => e.name == name));

                                        window.editor.setValue(selected?.content || "");
                                        monaco.editor.setModelLanguage(window.editor.getModel(), selected?.language == "js" ? "javascript" : "css");
                                        selected = Settings.editorTabs[active];
                                    }}
                                />
                            ));
                        }}
                    />
                    <PanelButton
                        tooltipText="Delete File"
                        icon={Icons.Trash.default}
                        onClick={() => {
                            if (!selected) return showToast("No File Selected", { type: "error" });

                            EDITOR_TABS.activeFilter((t, i) => i !== active);
                            setActive(0);
                            setTabs(EDITOR_TABS);
                        }}
                    />
                </div>
            </div>
            <div className="editor-body">
                <div className="editor-sidebar">
                    {tabs.map((tab, i) => (
                        <div
                            key={i}
                            className={`editor-sidebar-tab ${i == active ? "active" : ""}`}
                            onClick={() => {
                                setActive(i);

                                editor.setValue(tab.content);
                                monaco.editor.setModelLanguage(window.editor.getModel(), selected?.language == "js" ? "javascript" : "css");
                                selected = Settings.editorTabs[active];
                            }}
                        >
                            {tab?.name}.{tab?.language}
                        </div>
                    ))}
                </div>
                <div id="editor-container" />
            </div>
        </div>
    );
};
