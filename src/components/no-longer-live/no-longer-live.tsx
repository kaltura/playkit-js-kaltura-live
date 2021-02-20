import { h, Component } from 'preact';
import * as styles from './no-longer-live.scss';

export class NoLongerLive extends Component {
  render() {
    return (
      <div className={styles.noLongerLiveWrapper}>
        <div className={`${styles.iconWrapper} kaltura-live__icon-wrapper`}>
          <div
            className={`${styles.noLongerLiveIcon} kaltura-live__no-longer-live-icon`}
          />
        </div>
        <div className={`${styles.textWrapper} kaltura-live__text-wrapper`}>
          <p className={styles.primaryText}>Broadcast is no longer live</p>
        </div>
      </div>
    );
  }
}
