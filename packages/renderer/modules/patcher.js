import logger from "../util/logger";

const Logger = new logger("Patcher");

export default class Patcher {
    constructor(id) {
        this.id = id;
    }

    patches = [];

    _buildPatch(type, mod, method, options) {
        const patch = {
            type,
            module: mod,
            method,
            options,
            id: this.id,
            revert: () => {
                this.unpatch(mod, method);
            },
            proxy: null,
            originalMethod: mod[method],
        };

        patch.proxy = this._buildProxy(patch);

        const descriptor = Object.getOwnPropertyDescriptor(mod, method);

        if (descriptor && descriptor.get) {
            patch.overWritten = true;
            try {
                Object.defineProperty(mod, method, {
                    configurable: true,
                    enumerable: true,
                    ...descriptor,
                    get: () => patch.proxy,
                    set: (value) => (patch.originalMethod = value),
                });
            } catch (e) {
                Logger.error("Failed to overwrite getter", e);
            }
        } else {
            mod[method] = patch.proxy;
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

    unpatch(mod, method) {
        const patch = this.patches.find((p) => p.module === mod && p.method === method);

        if (!patch) return;

        if (patch.overWritten) {
            Object.defineProperty(mod, method, {
                ...Object.getOwnPropertyDescriptor(mod, method),
                get: () => patch.originalMethod,
                set: undefined,
            });
        } else {
            mod[method] = patch.originalMethod;
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
