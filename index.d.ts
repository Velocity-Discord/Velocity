interface VelocityCore {
    pseudoRequire(path: string): any;
    request(url: string | object | any, options: object, callback: (err: any | undefined, response: any, body: any) => void): Promise<any>;
}

interface PluginConstruct {
    new (name: string): PluginConstruct;
    manifest: any;
    settings: any;
    onStart: () => void;
    onStop: () => void;
    renderSettings: () => undefined | (() => any[]);
}

interface LoggerConstruct {
    new (title: string): LoggerConstruct;
    title: string;
    log: (...message: any) => void;
    warn: (...message: any) => void;
    error: (...message: any) => void;
}

interface PatcherConstruct {
    new (name: string): PatcherConstruct;
    name: string;
    after: (module: any, method: string, callback: (...args: any[]) => void) => void;
    before: (module: any, method: string, callback: (...args: any[]) => void) => void;
    instead: (module: any, method: string, callback: (...args: any[]) => void) => void;
    unpatchAll: () => void;
}

interface Velocity {
    Logger: LoggerConstruct;
    Patcher: PatcherConstruct;
    Plugin: PluginConstruct;
    Notifications: {
        showNotification: (props?: {}) => void;
        showToast: (content: any, options?: {}) => void;
    };
    AddonManager: {
        Themes: {
            get: (name: string) => any;
            getAll: () => any[];
            getEnabled: () => any[];
            isEnabled: (name: string) => boolean;
            toggle: (name: string) => void;
            enable: (name: string) => void;
            disable: (name: string) => void;
            unlink: (name: string) => void;
            delete: (name: string) => void;
            openFolder: (name: string) => void;
            openDir: () => void;
            readonly dir: string;
        };
        Plugins: {
            get: (name: string) => any;
            getAll: () => any[];
            getEnabled: () => any[];
            isEnabled: (name: string) => boolean;
            toggle: (name: string) => void;
            enable: (name: string) => void;
            disable: (name: string) => void;
            unlink: (name: string) => void;
            delete: (name: string) => void;
            openFolder: (name: string) => void;
            openDir: () => void;
            readonly dir: string;
        };
    };
    WebpackModules: {
        find: (filter: (m) => any, all: boolean) => any;
        findModule: (filter: (m) => any, all: boolean) => any;
        findByDisplayName: (name: string) => any;
        findByProps: (...props: any[]) => any;
        waitFor: (filter: (m) => any, all: boolean) => Promise<any>;
        globalPromise: Promise<any>;
        Filters: any;
        chunkName: string;
        common: any;
        readonly __ORIGINAL_CHUNKS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: any;
    };
    DataStore: {
        dir: string;
        getAllData: (name: string) => any;
        getData: (name: string, key: string) => any;
        setData: (name: string, key: string, value: any) => void;
        deleteData: (name: string, key: string) => void;
        Stream: (name: string) => any;
    };
    Styling: {
        injectCSS: (id: string, css: string) => string;
        removeCSS: (id: string) => string;
    };
}

declare const Velocity: Velocity;
declare const VelocityCore: VelocityCore;
