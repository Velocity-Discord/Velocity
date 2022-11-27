export default class ObservableArray extends Array {
    constructor(...args) {
        super(...args);
        this._listeners = [];
    }

    addListener(listener) {
        this._listeners.push(listener);
        return () => this._removeListener(listener);
    }

    _removeListener(listener) {
        this._listeners = this._listeners.filter((l) => l !== listener);
    }

    _notifyListeners() {
        this._listeners.forEach((listener) => listener(this));
    }

    push(...args) {
        const result = super.push(...args);
        this._notifyListeners();
        return result;
    }

    pop() {
        const result = super.pop();
        this._notifyListeners();
        return result;
    }

    shift() {
        const result = super.shift();
        this._notifyListeners();
        return result;
    }

    unshift(...args) {
        const result = super.unshift(...args);
        this._notifyListeners();
        return result;
    }

    splice(...args) {
        const result = super.splice(...args);
        this._notifyListeners();
        return result;
    }

    sort(...args) {
        const result = super.sort(...args);
        this._notifyListeners();
        return result;
    }

    filter(...args) {
        const result = super.filter(...args);
        this._notifyListeners();
        return result;
    }

    activeFilter(...args) {
        const result = super.filter(...args);
        this.splice(0, this.length, ...result);
        this._notifyListeners();
        return result;
    }

    insertNew(value, type) {
        let index = 0;

        switch (type) {
            case "object":
                index = this.findIndex((item) => item[0] === value[0]);
                break;
            case "string":
                index = this.findIndex((item) => item === value);
                break;
            default:
                break;
        }

        this._notifyListeners();

        if (!index) {
            return this.push(value);
        }

        this.splice(index, 0, value);

        return this.push(value);
    }
}
