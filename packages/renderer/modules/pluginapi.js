import { getAllData } from "./datastore";

export default class Plugin {
    constructor(manifest) {
        this.manifest = manifest;
        this.settings = getAllData(manifest.name);
    }
    onStart() {}
    onStop() {}
}
