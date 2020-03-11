import { h, Component } from "preact";
import * as styles from "./live-tag.scss";

export interface props {
    isLive: boolean;
    isDvr: boolean;
    currentTime?: number;
    duration?: number;
}

export class LiveTag extends Component<props> {
    private _getStyles = () => {
        const { isLive } = this.props;
        if (isLive) {
            return styles.live;
        }
        return styles.offline;
    };
    render(props: props) {
        return (
            <div className={[styles.liveTag, this._getStyles()].join(" ")}>
                {props.isLive ? "live" : "offline"}
            </div>
        );
    }
}
