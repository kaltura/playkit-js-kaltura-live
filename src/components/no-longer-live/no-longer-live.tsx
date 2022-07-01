import {h, Component} from 'preact';
import {NoLongerLiveBigIcon} from './no-lonter-live-big-icon';
import {NoLongerLiveSmallIcon} from './no-lonter-live-small-icon';
import * as styles from './no-longer-live.scss';

export class NoLongerLive extends Component {
  render() {
    return (
      <div className={styles.noLongerLiveWrapper}>
        <div className={styles.iconWrapper}>
          <div className={styles.noLongerLiveIcon}>
            <NoLongerLiveBigIcon className={styles.noLongerLiveBigIcon} />
            <NoLongerLiveSmallIcon className={styles.noLongerLiveSmallIcon} />
          </div>
        </div>
        <div className={styles.textWrapper}>
          <p className={styles.primaryText}>Broadcast is no longer live</p>
        </div>
      </div>
    );
  }
}
