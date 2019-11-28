import { h, Component } from "preact";
import * as styles from "./no-longer-live.scss";

export interface NoLongerLiveProps {
    onClick: () => void;
    showReplay: boolean;
}

export class NoLongerLive extends Component<NoLongerLiveProps> {
    render(props: NoLongerLiveProps) {
        return (
            <div className={styles.noLongerLiveWrapper}>
                <div className={`${styles.iconWrapper} kaltura-live__icon-wrapper`}>
                    <div
                        className={`${styles.noLongerLiveIcon} kaltura-live__no-longer-live-icon`}
                    />
                    {props.showReplay && (
                        <a
                            className={styles.replayIconWrapper}
                            tabIndex={0}
                            aria-label="Start over"
                            onClick={props.onClick}
                        >
                            <i className={styles.replayIcon} />
                        </a>
                    )}
                </div>
                <div className={`${styles.textWrapper} kaltura-live__text-wrapper`}>
                    <p className={styles.primaryText}>Broadcast is no longer live</p>
                    {props.showReplay && (
                        <p className={styles.secondaryText}>Replay to view the recording</p>
                    )}
                </div>
            </div>
        );
    }
}
