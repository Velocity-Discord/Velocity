import WebpackModules from "../../../modules/webpack";
import { Stream } from "../../../modules/datastore";

import FormTitle from "../reworks/FormTitle";

export default (props) => {
    const { Components } = WebpackModules.common;

    const FormItem = Components.FormItem.default;
    const FormText = Components.FormText.default;
    const TextInput = Components.TextInput.default;

    const { name, note, setting, action, disabled, maxLength, type, placeholder, container = "config" } = props;

    const Settings = Stream(container);

    const [state, setState] = React.useState(Settings[setting]);

    return (
        <FormItem className="velocity-textinput-setting velocity-setting">
            <div className="velocity-setting-info">
                <FormTitle tag="h3" style={{ margin: "0" }}>
                    {name}
                </FormTitle>
                <FormText type="description">{note}</FormText>
            </div>
            <TextInput
                value={state}
                onChange={(value) => {
                    if (typeof action == "function") action(value);
                    Settings[setting] = value;
                    setState(value);
                }}
                disabled={disabled}
                maxLength={maxLength}
                type={type}
                placeholder={placeholder}
            />
        </FormItem>
    );
};
