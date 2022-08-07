declare interface Api {
    /**
     * @name Meta
     * @description Information about the Velocity/Discord installation
     */
    Meta: {
        Discord: string;
        Velocity: string;
        VApi: string;
    };
    /**
     * @name React
     * @description Access to Discord's ReactJS module
     */
    React: any;
    /**
     * @name ReactDOM
     * @description Access to Discord's ReactDOM module
     */
    ReactDOM: any;
    /**
     * @name showChangelog
     * @desription Shows Velocity's changelog modal
     */
    showChangelog: () => void;
    /**
     * @name Utilities
     */
    Utilities: {
        /**
         * @name waitFor
         * @description Waits for a querySelector to be fufilled
         * @param {string} query - The selector to be placed into the querySelector
         * @returns Promise<void>
         */
        waitFor: (query: string) => Promise<void>;
        /**
         * @name waitUntil
         * @description Waits for a condition to be true
         * @param {any} condition - A callback that returns a truthy/falsy value
         * @returns Promise<void>
         */
        waitUntil: (condition: any) => Promise<void>;
        /**
         * @name joinServer
         * @description Joins a server with the specified invite and optionally transitions to it
         * @param {string} code - The invite code
         * @param {boolean} goTo - Whether or not to transition to the guild
         */
        joinServer: (code: string, goTo: boolean) => void;
        /**
         * @name joinOfficialServer
         * @description Joins the official Velocity discord server
         */
        joinOfficialServer: () => void;
    };
    /**
     * @name VelocityElements
     * @description References to the HTMLElements Velocity uses
     */
    VelocityElements: {
        /**
         * @name head
         * @type {HTMLElement}
         */
        head: HTMLElement;
        /**
         * @name body
         * @type {HTMLElement}
         */
        body: HTMLElement;
    };
    /**
     * @name Logger
     * @description Methods for printing to console
     */
    Logger: {
        /**
         * @name log
         * @description Logs a message to console with a title and message
         * @param {string} title - The title to be displayed with the log
         * @param {...any} message - The message(s) to be printed
         */
        log: (title: string, ...message: any) => void;
        /**
         * @name error
         * @description Logs an error to console with a title and message
         * @param {string} title - The title to be displayed with the log
         * @param {...any} message - The message(s) to be printed
         */
        error: (title: string, ...message: any) => void;
        /**
         * @name warn
         * @description Logs a warning to console with a title and message
         * @param {string} title - The title to be displayed with the log
         * @param {...any} message - The message(s) to be printed
         */
        warn: (title: string, ...message: any) => void;
        print: (any) => void;
    };
    /**
     * @name Styling
     * @description Utilities to add and remove styles
     */
    Styling: {
        /**
         * @name escapeID
         * @description Takes an ID and formats it for use in the DOM
         * @param {string} id - The ID to format
         */
        escapeID: (id: string) => string;
        /**
         * @name injectCSS
         * @description Injects css into the head of the DOM
         * @param {string} id - The ID to be used later to remove the css
         * @param {string} css - The css to inject
         */
        injectCSS: (id: string, css: string) => void;
        /**
         * @name clearCSS
         * @description Removes css added with injectCSS
         * @param {string} id - The ID of the css to clear
         */
        clearCSS: (id: string) => void;
        /**
         * @name linkStyle
         * @description Adds a link to a remote stylesheet to the head of the DOM
         * @param {string} id - The ID to be used later to remove the link
         * @param {string} url - The url to reference
         */
        linkStyle: (id: string, url: string) => void;
        /**
         * @name removeStyle
         * @description Removes a stylesheet added with linkStyle
         * @param {string} id - The ID of the stylesheet to remove
         */
        removeStyle: (id: string) => void;
    };
    /**
     * @name Scripting
     * @description Utilities to add and remove scripts
     */
    Scripting: {
        /**
         * @name escapeID
         * @description Takes an ID and formats it for use in the DOM
         * @param {string} id - The ID to format
         */
        escapeID: (id: string) => string;
        /**
         * @name appendScript
         * @description Adds a link to a remote script
         * @param {string} id - The ID to be used later to remove the script
         * @param [string] url - The url of the script to link to
         */
        appendScript: (id: string, url: string) => void;
        /**
         * @name removeScript
         * @description Removes a script added with appendScript
         * @param {string} id - The ID of the script to remove
         */
        removeScript: (id: string) => void;
    };
    /**
     * @name modals
     * @description Access to Discord's Modal elements and methods
     */
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
    /**
     * @name DataStore
     * @description Utilities to store/access data
     */
    DataStore: {
        getAllData: (name: string) => object | undefined;
        getData: (name: string, key: string) => any;
        setData: (name: string, key: string, value: any) => void;
        deleteData: (name: string, key: string) => void;
    };
    /**
     * @name CustomCSS
     * @description Tools to access Velocity's Custom CSS
     */
    CustomCSS: {
        /**
         * @name reload
         * @description Reloads all CustomCSS
         */
        reload: () => void;
    };
    /**
     * @name StartupScript
     * @description Tools to access Velocity's Startup Script
     */
    StartupScript: {
        /**
         * @name get
         * @deprecated
         */
        get: () => string;
        /**
         * @name update
         * @deprecated
         */
        update: (script: string) => void;
    };
    /**
     * @name Patcher
     */
    Patcher: {
        before: (patchName: string, moduleToPatch: any, functionToPatch: string, callback: () => any, opts?: any) => any;
        after: (patchName: string, moduleToPatch: any, functionToPatch: string, callback: () => any, opts?: any) => any;
        instead: (patchName: string, moduleToPatch: any, functionToPatch: string, callback: () => any, opts?: any) => any;
        unpatchAll: (name: string, verification?: any) => void;
    };
    /**
     * @name Components
     * @description Components Velocity provides for use by plugins
     */
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
    /**
     * @name showToast
     * @description Shows a Veloity toast
     * @param {string} title - The title of the toast
     * @param {HTMLElement|string|ReactComponent} content - The main content of the toast
     * @param {object} [options] - Options about the toast
     */
    showToast: (
        title: string,
        content: string,
        options: {
            type: "success" | "error" | "velocity" | "warn";
            timeout: number;
        }
    ) => void;
    /**
     * @name showConfirmationModal
     * @description Shows a simple or detailed Discord modal
     */
    showConfirmationModal: (
        title: string,
        content: string,
        options: {
            onConfirm: any;
            onCancel: any;
            confirmText: string;
            cancelText: string;
            danger: boolean;
            key: any;
        }
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
