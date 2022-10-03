import Velocity from "../../../modules/velocity";

import FormTitle from "../reworks/FormTitle";

const { WebpackModules } = Velocity;

export default (props) => {
    const { title, children } = props;

    return [<FormTitle tag="h1">{title}</FormTitle>, children];
};
