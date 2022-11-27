export default class {
    constructor(title) {
        this.title = title;
        this.logs = [];
    }

    _print = (type, ...args) => {
        switch (type) {
            case "log":
                console.log(
                    `%cVelocity %c ${this.title} %c`,
                    "background: #5B88FC; font-weight: 600; padding: 4px 6px; border-radius: 4px; color: white; font-family: Helvetica; margin-right: 5px",
                    "background: #5B88FC; font-weight: 600; padding: 4px 6px; border-radius: 4px; color: white; font-family: Helvetica",
                    "",
                    ...args
                );
                break;
            case "warn":
                console.warn(
                    `%cVelocity %c ${this.title} %c`,
                    "background: #FFC107; font-weight: 600; padding: 4px 6px; border-radius: 4px; color: white; font-family: Helvetica; margin-right: 5px",
                    "background: #FFC107; font-weight: 600; padding: 4px 6px; border-radius: 4px; color: white; font-family: Helvetica",
                    "",
                    ...args
                );
                break;
            case "error":
                console.error(
                    `%cVelocity %c ${this.title} %c`,
                    "background: #F44336; font-weight: 600; padding: 4px 6px; border-radius: 4px; color: white; font-family: Helvetica; margin-right: 5px",
                    "background: #F44336; font-weight: 600; padding: 4px 6px; border-radius: 4px; color: white; font-family: Helvetica",
                    "",
                    ...args
                );
                break;
        }
    };

    log = (message, ...args) => {
        this._print("log", message, ...args);
        this.logs.push(args);
    };

    warn = (message, ...args) => {
        this._print("warn", message, ...args);
        this.logs.push(args);
    };

    error = (message, ...args) => {
        this._print("error", message, ...args);
        this.logs.push(args);
    };
}
