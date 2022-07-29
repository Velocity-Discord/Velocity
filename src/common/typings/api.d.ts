declare interface Api {
    Meta: {
        Discord: string;
        Velocity: string;
        VApi: string;
    };
    React: any;
    ReactDOM: any;
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
        log: (title: string, ...message: any) => void;
        error: (title: string, ...message: any) => void;
        warn: (title: string, ...message: any) => void;
        print: (any) => void;
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
    };
    StartupScript: {
        /**
         * @deprecated
         */
        get: () => string;
        /**
         * @deprecated
         */
        update: (script: string) => void;
    };
    Patcher: {
        before: (patchName: string, moduleToPatch: any, functionToPatch: string, callback: () => any, opts?: any) => any;
        after: (patchName: string, moduleToPatch: any, functionToPatch: string, callback: () => any, opts?: any) => any;
        instead: (patchName: string, moduleToPatch: any, functionToPatch: string, callback: () => any, opts?: any) => any;
        unpatchAll: (name: string, verification?: any) => void;
    };
    Components: {
        SettingsSection: (props: { plugin: string; setting: string; note: string; name: string; warning: string; action: any }) => void;
        SettingsInput: (props: {
            plugin: string;
            setting: string;
            note: string;
            name: string;
            warning: string;
            action: any;
            placeholder: string;
            type: string;
            maxLength: number;
            vertical: boolean;
        }) => void;
        ErrorBoundary: any;
    };
    showToast: (title: string, content: string, options: { type: "success" | "error" | "velocity" | "warn"; timeout: number }) => void;
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
        findAll: (filter: any) => any[];
        findByDisplayName: (query: string) => any;
        findByDisplayNameDefault: (query: string) => any;
        findByProps: (props: any) => any;
        findByPropsDefault: (props: any) => any;
        util: {
            findInReactTree: (tree: any, filter: any) => any;
        };
    };
    FluxDispatcher: any;
}
