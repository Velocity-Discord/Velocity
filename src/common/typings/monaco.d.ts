declare class VApi {
    Meta: {
        Discord: string;
        Velocity: string;
        VApi: string;
    };
    showChangelog: () => void;
    Utilities: {
        waitFor: (query: string) => Promise<void>;
        waitUntil: (condition: any) => Promise<void>;
        joinServer: (id: string, goTo: boolean) => void;
        joinOfficialServer: () => void;
    };
    VelocityElements: {
        head: HTMLElement;
        body: HTMLElement;
    };
    Logger: {
        log: (title: string, message: any) => void;
        error: (title: string, message: any) => void;
        warn: (title: string, message: any) => void;
    };
    Styling: {
        escapeID: (id: string) => string;
        injectCSS: (id: string, css: string) => void;
        clearCSS: (id: string) => void;
        linkStyle: (id: string, url: string) => void;
        removeStyle: (id: string) => void;
    };
    Scripting: {
        escapeID: (id: string) => string;
        appendScript: (id: string, url: string) => void;
        removeScript: (id: string) => void;
    };
    modals: {
        open: (reactElement: any, modalOpts: object) => string;
        close: (reactElement: any, modalOpts: object) => void;
        ModalRoot: any;
        ModalHeader: any;
        ModalCloseButton: any;
        ModalContent: any;
        ModalListContent: any;
        ModalFooter: any;
        ModalSize: any;
    };
    DataStore: {
        getAllData: (name: string) => object | undefined;
        getData: (name: string, key: string) => any;
        setData: (name: string, key: string, value: any) => void;
        deleteData: (name: string, key: string) => void;
    };
    CustomCSS: {
        reload: () => void;
        get: () => string;
        update: (css: string) => void;
    };
    StartupScript: {
        get: () => string;
        update: (script: string) => void;
    };
    Patcher: {
        before: (patchName: string, moduleToPatch: any, functionToPatch: string, callback: () => any, opts?: any) => any;
        after: (patchName: string, moduleToPatch: any, functionToPatch: string, callback: () => any, opts?: any) => any;
        instead: (patchName: string, moduleToPatch: any, functionToPatch: string, callback: () => any, opts?: any) => any;
        unpatchAll: (name: string, verification?: any) => void;
    };
    Components: {
        ShowAddonSettingsModal: (name: string, children: any) => void;
        SettingsSection: (plugin: string, setting: string, note: string, name: string, warning: string, action: any) => void;
        SettingsInput: (
            plugin: string,
            setting: string,
            note: string,
            name: string,
            warning: string,
            action: any,
            placeholder: string,
            type: string,
            maxLength: number,
            vertical: boolean
        ) => void;
    };
    showToast: (title: string, content: string, options: { type: string; timeout: number; color: string }) => void;
    showConfirmationModal: (
        title: string,
        content: string,
        options: { onConfirm: any; onCancel: any; confirmText: string; cancelText: string; danger: boolean; key: any }
    ) => string;
    AddonManager: {
        plugins: {
            delete: (name: string) => void;
            getByFileName: (name: string) => void;
            get: (name: string) => void;
            isEnabled: (name: string) => void;
            enable: (name: string) => void;
            disable: (name: string) => void;
            toggle: (name: string) => void;
            getAll: () => void;
            getEnabled: () => void;
            folder: string;
        };
        themes: {
            delete: (name: string) => void;
            getByFileName: (name: string) => void;
            get: (name: string) => void;
            isEnabled: (name: string) => void;
            enable: (name: string) => void;
            disable: (name: string) => void;
            toggle: (name: string) => void;
            getAll: () => void;
            getEnabled: () => void;
            folder: string;
        };
        remote: {
            loadTheme: (url: string) => void;
            unloadTheme: (name: string) => void;
        };
    };
    showInfoModal: () => void;
    showSponsorModal: () => void;
    WebpackModules: {
        find: (filter: any) => any;
        findByDisplayName: (query: string) => any;
        findByDisplayNameDefault: (query: string) => any;
        findByProps: (props: any) => any;
        findByPropsDefault: (props: any) => any;
    };
    FluxDispatcher: any;
}
