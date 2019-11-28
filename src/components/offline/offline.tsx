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
                <div>
                    <p className={styles.primaryText}>
                        {props.httpError ? "No Internet Connection" : "Currently not broadcasting"}
                    </p>
                    <p className={styles.secondaryText}>
                        {props.httpError
                            ? "Check your network and refresh the page"
                            : "Video will play once broadcasting starts"}
                    </p>
                </div>
            </div>
        );
    }
}
