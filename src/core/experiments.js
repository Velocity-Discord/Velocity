/**
 * @type {Api}
 */
const VApi = window.VApi;

const Config = require("../../../common/config.json");
const request = require("./request");

const { WebpackModules } = VApi;

module.exports = new (class ExperimentManager {
    async initialize() {
        let Experiments;
        request(Config.backend.experiments.url, (_, __, body) => {
            Experiments = JSON.parse(body).experiments;

            Experiments.forEach((experiment) => {
                this.createExperiment(experiment);
            });
        });
    }

    createExperiment(experiment) {
        WebpackModules.findByProps("createExperiment").createExperiment(experiment);
    }
})();
