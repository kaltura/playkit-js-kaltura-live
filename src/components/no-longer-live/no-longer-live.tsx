import { h, Component } from "preact";
import * as styles from "./no-longer-live.scss";

export interface NoLongerLiveProps {
    onClick: () => void;
}

export class NoLongerLive extends Component<NoLongerLiveProps> {
    render(props: NoLongerLiveProps) {
        return (
            <div className={styles.noLongerLiveWrapper}>
                <div className={`${styles.noLongerLiveIcon} kaltura-live__no-longer-live-icon`} />
                <a
                    className={styles.replayIconWrapper}
                    tabIndex={0}
                    aria-label="Start over"
                    onClick={props.onClick}
                >
                    <i className={styles.replayIcon} />
                </a>
                <p className={`${styles.primaryText} kaltura-live__primary-text`}>
                    Broadcast is no longer live
                </p>
            </div>
        );
    }
}
