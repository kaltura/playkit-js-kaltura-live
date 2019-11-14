import { h, Component } from "preact";
import * as styles from "./no-longer-live.scss";

export class NoLongerLive extends Component {
    render() {
        return (
            <div className={styles.noLongerLiveWrapper}>
                <div className={`${styles.noLongerLiveIcon} kaltura-live__no-longer-live-icon`} />
                <p className={`${styles.primaryText} kaltura-live__primary-text`}>
                    Broadcast is no longer live
                </p>
                <a className={styles.replayIconWrapper} tabIndex={0} aria-label="Start over">
                    <i className={styles.replayIcon} />
                </a>
            </div>
        );
    }
}
