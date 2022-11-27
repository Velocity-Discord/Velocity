import logger from "../util/logger";

const Logger = new logger("Patcher");

export default class Patcher {
    constructor(id) {
        this.id = id;
    }

    patches = [];

    _buildPatch(type, module, method, options) {
        const patch = {
            type,
            module,
            method,
            options,
            id: this.id,
            revert: () => {
                this.unpatch(module, method);
            },
            proxy: null,
            originalMethod: module[method],
        };

        patch.proxy = this._buildProxy(patch);

        const descriptor = Object.getOwnPropertyDescriptor(module, method);

        if (descriptor && descriptor.get) {
            patch.overWritten = true;
            try {
                Object.defineProperty(module, method, {
                    ...descriptor,
                    configurable: true,
                    enumerable: true,
                    get: () => patch.proxy,
                    set: (value) => {
                        patch.originalMethod = value;
                    },
                });
            } catch (e) {
                Logger.error("Failed to overwrite getter", e);
            }
        } else {
            module[method] = patch.proxy;
        }

        this.patches.push(patch);

        return patch;
    }

    _buildProxy(patch) {
        return function () {
            const { type, options, originalMethod } = patch;

            let toReturn = originalMethod.apply(this, arguments);

            switch (type) {
                case "before":
                    try {
                        options.callback(arguments);
                    } catch (e) {
                        Logger.error("Failed to call before patch", e);
                    }
                case "instead":
                    try {
                        toReturn = options.callback(arguments, originalMethod.bind(this));
                    } catch (e) {
                        Logger.error("Failed to call instead patch", e);
                    }
                case "after":
                    try {
                        options.callback(arguments, toReturn);
                    } catch (e) {
                        Logger.error("Failed to call after patch", e);
                    }
            }

            return toReturn;
        };
    }

    unpatch(module, method) {
        const patch = this.patches.find((p) => p.module === module && p.method === method);

        if (!patch) return;

        if (patch.overWritten) {
            Object.defineProperty(module, method, {
                ...Object.getOwnPropertyDescriptor(module, method),
                get: () => patch.originalMethod,
                set: undefined,
            });
        } else {
            module[method] = patch.originalMethod;
        }

        this.patches.splice(this.patches.indexOf(patch), 1);
    }

    unpatchAll() {
        this.patches.forEach((patch) => {
            this.unpatch(patch.module, patch.method);
        });
    }

    before(module, method, callback, options) {
        return this._buildPatch("before", module, method, { ...options, callback });
    }

    instead(module, method, callback, options) {
        return this._buildPatch("instead", module, method, { ...options, callback });
    }

    after(module, method, callback, options) {
        return this._buildPatch("after", module, method, { ...options, callback });
    }
}
