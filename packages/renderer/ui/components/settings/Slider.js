import WebpackModules from "../../../modules/webpack";
import { Stream } from "../../../modules/datastore";

import FormTitle from "../reworks/FormTitle";

export default (props) => {
    const { Components } = WebpackModules.common;

    const FormItem = Components.FormItem.default;
    const FormText = Components.FormText.default;
    const Slider = Components.Slider.default;

    const { name, note, setting, action, disabled = false, minValue = 0, maxValue = 100, handleSize = 10, units = "", container = "config", stickToMarkers } = props;

    const Settings = Stream(container);

    const [state, setState] = React.useState(Settings[setting]);

    // Don't ask me why template literals are needed here, but they are otherwise discord dies.
    let onMarkerRender = (val) => `${Math.round(val)}`;
    let onValueRender = (val) => `${Math.round(val)}`;

    if (units) {
        const renderValueLabel = (val) => `${Math.round(val)}${units}`;
        onMarkerRender = renderValueLabel;
        onValueRender = renderValueLabel;
    }

    return (
        <FormItem className="velocity-slider-setting velocity-setting">
            <div className="velocity-setting-info">
                <FormTitle tag="h3" style={{ margin: "0" }}>
                    {name}
                </FormTitle>
                <FormText type="description">{note}</FormText>
            </div>
            <Slider
                onValueChange={(value) => {
                    if (typeof action == "function") action(value);
                    Settings[setting] = value;
                    setState(value);
                }}
                value={state}
                disabled={disabled}
                minValue={minValue}
                maxValue={maxValue}
                handleSize={handleSize}
                initialValue={state}
                onMarkerRender={onMarkerRender}
                onValueRender={onValueRender}
                stickToMarkers={stickToMarkers}
            />
        </FormItem>
    );
};
