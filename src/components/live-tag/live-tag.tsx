import { h, Component } from "preact";
import * as styles from "./live-tag.scss";

export interface props {
    isLive: boolean;
    isPreview: boolean;
    isOnLiveEdge: boolean;
}

export class LiveTag extends Component<props> {
    private _getStyles = () => {
        const { isOnLiveEdge, isPreview, isLive } = this.props;
        if (isOnLiveEdge && isLive) {
            return styles.live;
        }
        if (isOnLiveEdge && isPreview) {
            return styles.preview;
        }
        return styles.offline;
    };
    private _getLabel = () => {
        const { isPreview, isLive } = this.props;
        if (isPreview) {
            return "preview";
        }
        if (isLive) {
            return "live";
        }
        return "offline";
    };
    render() {
        return (
            <div className={[styles.liveTag, this._getStyles()].join(" ")}>{this._getLabel()}</div>
        );
    }
}
