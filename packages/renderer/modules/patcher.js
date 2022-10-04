import logger from "../util/logger";

const Logger = new logger("Patcher");

const patchSymbol = Symbol("Velocity.Patcher");
const internalSymbol = Symbol("VelocityInternal");
export let allPatches = {};

function patch(patchId, moduleToPatch, functionToPatch, callback, opts = {}) {
    let { method = "after" } = opts;
    let originalFunction = moduleToPatch[functionToPatch];
    if (!originalFunction) {
        moduleToPatch[functionToPatch] = () => {};
        originalFunction = moduleToPatch[functionToPatch];
    }
    method = method.toLowerCase();
    if (!(method === "before" || method === "after" || method === "instead")) throw new Error(`'${method}' is a invalid patch type`);
    let patches = moduleToPatch?.[functionToPatch]?.[patchSymbol]?.patches ?? { before: [], after: [], instead: [] };
    let CallbackSymbol = Symbol();
    let patchInfo = { unpatch, patchName: patchId, moduleToPatch, functionToPatch, callback, method, Symbol: CallbackSymbol };
    patches[method].unshift(Object.assign(callback, { unpatch, Symbol: CallbackSymbol }));
    let DidUnpatch = false;

    function unpatch(auth) {
        if (DidUnpatch) return;
        DidUnpatch = true;

        patches[method] = patches[method].filter((patch) => patch.Symbol !== CallbackSymbol);
        allPatches[patchId] = allPatches[patchId].filter((patch) => patch.Symbol !== CallbackSymbol);

        if (patches.before.length === 0 && patches.after.length === 0 && patches.instead.length === 0) {
            delete moduleToPatch[functionToPatch][patchSymbol];
            delete moduleToPatch[functionToPatch].unpatch;
        }
    }

    if (!moduleToPatch[functionToPatch][patchSymbol]) {
        moduleToPatch[functionToPatch] = function () {
            for (const patch of patches.before) patch([...arguments], this);
            let insteadFunction = originalFunction;
            for (const patch of patches.instead) insteadFunction = patch([...arguments], insteadFunction, this);
            let res = insteadFunction.apply(this, [...arguments]);
            for (const patch of patches.after) patch([...arguments], res, this);
            return res;
        };
        moduleToPatch[functionToPatch][patchSymbol] = {
            original: originalFunction,
            module: moduleToPatch,
            function: functionToPatch,
            patches,
            unpatchAll: () => {
                for (const patch of patches.before) patch.unpatch();
                for (const patch of patches.instead) patch.unpatch();
                for (const patch of patches.after) patch.unpatch();
                moduleToPatch[functionToPatch] = originalFunction;
            },
        };
        Object.assign(moduleToPatch[functionToPatch], originalFunction, {
            toString: () => originalFunction.toString(),
        });
    }

    if (!allPatches[patchId]) allPatches[patchId] = [];
    allPatches[patchId].push({ ...patchInfo, unpatch });

    return unpatch;
}

export default class Patcher {
    constructor(name) {
        this.name = name;
    }

    after(moduleToPatch, functionToPatch, callback) {
        return patch(this.name, moduleToPatch, functionToPatch, callback, { method: "after" });
    }

    before(moduleToPatch, functionToPatch, callback) {
        return patch(this.name, moduleToPatch, functionToPatch, callback, { method: "before" });
    }

    instead(moduleToPatch, functionToPatch, callback) {
        return patch(this.name, moduleToPatch, functionToPatch, callback, { method: "instead" });
    }

    unpatchAll() {
        allPatches[this.name]?.forEach((p) => p.unpatch());
    }
}
