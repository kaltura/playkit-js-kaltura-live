import { h, Component } from "preact";
import * as styles from "./offline.scss";

export interface props {
    httpError?: boolean;
}

export class Offline extends Component<props> {
    static defaultProps = {
        httpError: false
    };

    render(props: props) {
        return (
            <div className={styles.offlineWrapper}>
                <div className={`${styles.offlineIcon} kaltura-live__offline-icon`} />
                {!props.httpError && (
                    <div>
                        <p className={styles.primaryText}>Currently not broadcasting</p>
                        <p className={styles.secondaryText}>
                            video will play once broadcasting starts
                        </p>
                    </div>
                )}
                {props.httpError && (
                    <div>
                        <p className={styles.primaryText}>No Internet Connection</p>
                        <p className={styles.secondaryText}>
                            Check your network and refresh the page
                        </p>
                    </div>
                )}
            </div>
        );
    }
}
