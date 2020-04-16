import { h, Component } from "preact";
import * as styles from "./live-tag.scss";

export interface props {
    isLive: boolean;
    isPreview: boolean;
    isOnLiveEdge: boolean;
    onClick: () => void;
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

    private _onClick = (): void => {
        const { isOnLiveEdge, onClick } = this.props;
        if (!isOnLiveEdge) {
            onClick();
        }
    };

    render(props: props) {
        return (
            <div
                role="button"
                tab-index={0}
                className={[
                    styles.liveTag,
                    this._getStyles(),
                    !props.isOnLiveEdge ? styles.clickable : ""
                ].join(" ")}
                onClick={this._onClick}
            >
                {this._getLabel()}
            </div>
        );
    }
}
