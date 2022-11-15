import WebpackModules from "../../../modules/webpack";
import { Stream } from "../../../modules/datastore";

import FormItem from "../reworks/FormItem";

export default (props) => {
    const { Components } = WebpackModules.common;

    const SwitchItem = Components.SwitchItem.default;

    const { name, note, setting, action, container = "config" } = props;

    const Settings = Stream(container);

    const [state, setState] = React.useState(Settings[setting]);

    return (
        <FormItem className="velocity-switch-setting">
            <SwitchItem
                note={note}
                value={state}
                onChange={(value) => {
                    if (typeof action == "function") action(value);
                    Settings[setting] = value;
                    setState(value);
                }}
            >
                {name}
            </SwitchItem>
        </FormItem>
    );
};
