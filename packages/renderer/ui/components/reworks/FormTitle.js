import webpack from "../../../modules/webpack";

export default (props) => {
    const { children, tag, className, style } = props;

    const TitleClassNames = webpack.find(["h1", "title"]);

    const appliedProps = {
        style,
        className: `${TitleClassNames.defaultColor} ${TitleClassNames[tag]} ${TitleClassNames[`defaultMargin${tag}`]} ${className}`,
    };

    switch (tag) {
        case "h1":
            return <h1 {...appliedProps}>{children}</h1>;
        case "h2":
            return <h2 {...appliedProps}>{children}</h2>;
        case "h3":
            return <h3 {...appliedProps}>{children}</h3>;
        case "h4":
            return <h4 {...appliedProps}>{children}</h4>;
        case "h5":
            return <h5 {...appliedProps}>{children}</h5>;
        case "h6":
            return <h6 {...appliedProps}>{children}</h6>;
        default:
            return <h1 {...appliedProps}>{children}</h1>;
    }
};
