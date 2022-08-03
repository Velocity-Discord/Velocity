/**
 * @type {Api}
 */
const VApi = window.VApi;

const { React, WebpackModules, request } = VApi;

const Button = WebpackModules.find(["ButtonColors"]).default;
const ButtonColors = WebpackModules.find(["ButtonColors"]).ButtonColors;

const i18n = require("../../i18n");

const { Strings } = i18n;

class StatusTable extends React.Component {
    constructor(props) {
        super(props);

        this.props = props;
        this.props.originalItems = props.items;

        this.state = {
            requested: false,
            items: props.items,
            first: true,
        };
    }
    render() {
        if (this.state.requesting) {
            this.state.requesting = false;
            this.state.items.forEach((item) => {
                request(item.url, (_, res, body) => {
                    if (res.statusCode >= 200 && res.statusCode <= 299) {
                        item.statusCode = res.statusCode;
                        item.status = Strings.Settings.Developer.Sections.backendstatus.status.fine;
                    } else {
                        item.statusCode = res.statusCode;
                        item.status = Strings.Settings.Developer.Sections.backendstatus.status.unknown;
                    }

                    this.forceUpdate();
                });
            });
        }

        if (this.state.toClear) {
            this.state.items.forEach((item) => {
                delete item.statusCode;
                delete item.status;
            });
        }

        return [
            React.createElement("div", {
                className: "velocity-developer-status-buttons-container",
                children: [
                    React.createElement(
                        Button,
                        {
                            color: ButtonColors.BRAND,
                            onClick: () => {
                                this.state.requesting = true;
                                this.state.toClear = false;
                                this.state.first = false;
                                this.forceUpdate();
                            },
                        },
                        this.state.first ? Strings.Settings.Developer.Sections.backendstatus.request : Strings.Settings.Developer.Sections.backendstatus.rerequest
                    ),
                    !this.state.first &&
                        React.createElement(
                            Button,
                            {
                                color: ButtonColors.RED,
                                onClick: () => {
                                    this.state.requesting = false;
                                    this.state.toClear = true;
                                    this.state.first = true;
                                    this.forceUpdate();
                                },
                            },
                            Strings.Settings.Developer.Sections.backendstatus.clearcache
                        ),
                ],
            }),
            React.createElement("table", {
                className: "velocity-developer-status-table",
                children: [
                    React.createElement("thead", {
                        children: [
                            React.createElement("tr", {
                                children: [
                                    React.createElement("th", {
                                        children: Strings.Settings.Developer.Sections.backendstatus.table.name,
                                    }),
                                    React.createElement("th", {
                                        children: Strings.Settings.Developer.Sections.backendstatus.table.status,
                                    }),
                                ],
                            }),
                        ],
                    }),
                    this.state.items.map((item) =>
                        React.createElement("tbody", {
                            children: [
                                React.createElement("tr", {
                                    children: [
                                        React.createElement("td", {
                                            className: "velocity-developer-status-header",
                                            children: item.name,
                                        }),
                                        React.createElement("td", {
                                            className: "velocity-developer-status-table-text",
                                            children: React.createElement("span", {
                                                className: `velocity-developer-status-${item.name.toLowerCase()}-text`,
                                                style: {
                                                    color: item.statusCode
                                                        ? item.statusCode >= 200 && item.statusCode <= 299
                                                            ? "var(--text-positive)"
                                                            : "var(--text-danger)"
                                                        : "var(--text-muted)",
                                                },
                                                children: item.status ? `${item.status} (${item.statusCode})` : "-",
                                            }),
                                        }),
                                    ],
                                }),
                            ],
                        })
                    ),
                ],
            }),
        ];
    }
}

module.exports = StatusTable;
