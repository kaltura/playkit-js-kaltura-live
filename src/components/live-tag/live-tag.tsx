import { h, Component } from "preact";
import * as styles from "./live-tag.scss";

export interface props {
    isLive: boolean;
    isDvr: boolean;
    isPreview: boolean;
    isOnLiveEdge: boolean;
}

export class LiveTag extends Component<props> {
    private _getStyles = () => {
        const { isDvr, isOnLiveEdge, isPreview } = this.props;
        if (isDvr && !isOnLiveEdge) {
            return styles.offline;
        }
        if (isPreview && isOnLiveEdge) {
            return styles.preview;
        }
        return styles.live;
    };
    private _getLabel = () => {
        const { isPreview, isDvr } = this.props;
        if (isPreview) {
            return "preview";
        }
        if (isDvr) {
            return "offline";
        }
        return "live";
    };
    render() {
        return (
            <div className={[styles.liveTag, this._getStyles()].join(" ")}>{this._getLabel()}</div>
        );
    }
}
