import { injectComponentStyle } from "../../util/components";
import Velocity from "../../modules/velocity";

const { WebpackModules } = Velocity;

injectComponentStyle("empty-state", {
    ".velocity-empty-state-huge > div:first-child": {
        height: "186px",
    },
    ".velocity-empty-state-tiny > div:first-child": {
        height: "60px",
    },
});

export default (props) => {
    const { Components } = WebpackModules.common;

    const EmptyState = Components.EmptyState.default;

    const { artURL = "", header = "", description = "", size = "huge", CTAAction, CTALabel } = props;

    return <EmptyState className={`velocity-empty-state-${size}`} size={size} artURL={artURL} header={header} description={description} onCTAClick={CTAAction} callToAction={CTALabel} />;
};
