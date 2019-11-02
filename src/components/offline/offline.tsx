import { h, Component } from "preact";
import * as styles from "./offline.scss";

export class Offline extends Component {
    render() {
        return (
            <div className={styles.offlineWrapper}>
                <div className={styles.offlineIcon} />
                <p className={styles.primaryText}>Currently not broadcasting</p>
                <p className={styles.secondaryText}>video will play once broadcasting starts</p>
            </div>
        );
    }
}
