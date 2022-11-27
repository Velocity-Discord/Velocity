import webpack from "../../../modules/webpack";

export default (props) => {
    const { options, value, onChange } = props;
    const { Components, Classes } = webpack.common;

    const [active, setActive] = React.useState(value || 0);

    const Text = Components.VarientText.x;
    const ItemClasses = Classes.RadioItems;
    const PositionClasses = Classes.Position;

    return (
        <div className="radio-group" role="radiogroup" style={{ textAlign: "left" }}>
            {options.map((option, index) => {
                return (
                    <div
                        className={`${ItemClasses.item} ${PositionClasses.directionRow} ${ItemClasses.itemFilled}`}
                        role="radio"
                        tabindex={index}
                        aria-checked={active == index}
                        onClick={() => {
                            setActive(index);
                            onChange(options[index].value);
                        }}
                    >
                        <div className={ItemClasses.radioBar} style={{ padding: "10px" }}>
                            <div>
                                <svg aria-hidden="true" role="img" width="24" height="24" viewBox="0 0 24 24">
                                    <path
                                        fill-rule="evenodd"
                                        clip-rule="evenodd"
                                        d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                                        fill="currentColor"
                                    ></path>
                                    {active == index && <circle cx="12" cy="12" r="5" className={ItemClasses.radioIconForeground} fill="currentColor"></circle>}
                                </svg>
                            </div>
                            <div className={ItemClasses.info}>
                                <Text color="none" variant="text-md/medium">
                                    {option.name}
                                </Text>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
