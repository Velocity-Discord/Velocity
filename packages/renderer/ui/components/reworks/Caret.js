export default (props) => {
    const { type = "right", width = 24, height = 24, style } = props;

    switch (type) {
        case "down":
            return (
                <svg viewBox="-2 -2 16 16" width={width} height={height} style={style}>
                    <path fill="currentColor" d="M10.59 2.59 6 7.17 1.41 2.59 0 4 6 10 12 4 10.59 2.59Z" />
                </svg>
            );
        case "up":
            return (
                <svg viewBox="-2 -2 16 16" width={width} height={height} style={style}>
                    <path fill="currentColor" d="M1.41 9.41 6 4.83 10.59 9.41 12 8 6 2 0 8 1.41 9.41Z" />
                </svg>
            );
        case "left":
            return (
                <svg viewBox="-2 -2 16 16" width={width} height={height} style={style}>
                    <path fill="currentColor" d="M9.41 1.41 4.83 6 9.41 10.59 8 12 2 6 8 0 9.41 1.41Z" />
                </svg>
            );
        case "right":
            return (
                <svg viewBox="-2 -2 16 16" width={width} height={height} style={style}>
                    <path fill="currentColor" d="M2.59 10.59 7.17 6 2.59 1.41 4 0 10 6 4 12 2.59 10.59Z" />
                </svg>
            );
    }
};
