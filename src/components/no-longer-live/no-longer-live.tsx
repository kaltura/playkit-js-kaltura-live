import {h, Component} from 'preact';
import NoLongerLiveBLogo from './assets/no-longer-live-big.svg';
import NoLongerLiveSLogo from './assets/no-longer-live-small.svg';
import * as styles from './no-longer-live.scss';

export class NoLongerLive extends Component {
  render() {
    return (
      <div className={styles.noLongerLiveWrapper}>
        <div className={styles.iconWrapper}>
          <div className={styles.noLongerLiveIcon}>
            <NoLongerLiveBLogo className={styles.noLongerLiveBigIcon} />
            <NoLongerLiveSLogo className={styles.noLongerLiveSmallIcon} />
          </div>
        </div>
        <div className={styles.textWrapper}>
          <p className={styles.primaryText}>Broadcast is no longer live</p>
        </div>
      </div>
    );
  }
}
