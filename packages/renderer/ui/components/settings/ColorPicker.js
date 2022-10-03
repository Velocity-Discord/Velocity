import WebpackModules from "../../../modules/webpack";
import { Stream } from "../../../modules/datastore";
import { injectComponentStyle } from "../../../util/components";

import FormTitle from "../reworks/FormTitle";

injectComponentStyle("color-setting", {
    ".velocity-color-setting": {
        display: "flex",
        justifyContent: "space-between",
    },
});

export default (props) => {
    const { Components } = WebpackModules.common;

    const { default: Tooltip } = Components.TooltipContainer;
    const FormItem = Components.FormItem.default;
    const FormText = Components.FormText.default;
    const ColorPickerModules = Components.ColorPickerModules;
    const Popout = Components.Popout.default;
    const Swatch = ColorPickerModules?.CustomColorButton.prototype.render.call({ props: {} }).type;

    const { name, note, setting, action, defaultColor, palette = [], container = "config" } = props;

    const Settings = Stream(container);

    const [state, setState] = React.useState(Settings[setting]);

    const renderPopout = () => {
        return (
            <ColorPickerModules.CustomColorPicker
                value={state}
                onChange={(value) => {
                    if (typeof action == "function") action(value);
                    Settings[setting] = value;
                    setState(value);
                }}
            />
        );
    };

    return (
        <FormItem className="velocity-color-setting velocity-setting">
            <div className="velocity-setting-info">
                <FormTitle tag="h3" style={{ margin: "0" }}>
                    {name}
                </FormTitle>
                <FormText type="description">{note}</FormText>
            </div>
            <ColorPickerModules.default
                className="velocity-color-picker"
                value={state}
                colors={palette}
                onChange={(value) => {
                    if (typeof action == "function") action(value);
                    setState(value);
                    Settings[setting] = value;
                }}
                renderDefaultButton={() => {
                    return (
                        <Tooltip
                            position={"bottom"}
                            text={"Default"}
                            children={(tProps) => (
                                <ColorPickerModules.DefaultColorButton
                                    {...tProps}
                                    color={defaultColor}
                                    onChange={() => {
                                        if (typeof action == "function") action(defaultColor);
                                        setState(defaultColor);
                                        Settings[setting] = defaultColor;
                                    }}
                                />
                            )}
                        />
                    );
                }}
                renderCustomButton={() => {
                    return (
                        <Popout
                            renderPopout={renderPopout}
                            animation={"translate"}
                            align={"center"}
                            position={"top"}
                            children={(props) => (
                                <Tooltip
                                    position={"bottom"}
                                    text={"Pick a Color"}
                                    children={(tProps) => (
                                        <div {...tProps} {...props} className="color-button">
                                            <Swatch isCustom={true} color={state} />
                                        </div>
                                    )}
                                />
                            )}
                        ></Popout>
                    );
                }}
            ></ColorPickerModules.default>
        </FormItem>
    );
};
