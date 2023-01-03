import {h, Component} from 'preact';
import {NoLongerLiveBigIcon} from './no-lonter-live-big-icon';
import {NoLongerLiveSmallIcon} from './no-lonter-live-small-icon';
import * as styles from './no-longer-live.scss';
const {withText, Text} = KalturaPlayer.ui.preacti18n;

export interface props {
  noLongerLive?: string;
}

const translates = {
  noLongerLive: <Text id="kalturaLive.no_longer_live">Broadcast is no longer live</Text>
};

@withText(translates)
export class NoLongerLive extends Component<props> {
  render(props: props) {
    return (
      <div className={styles.noLongerLiveWrapper} role="banner">
        <div className={styles.iconWrapper} aria-hidden="true">
          <div className={styles.noLongerLiveIcon}>
            <NoLongerLiveBigIcon className={styles.noLongerLiveBigIcon} />
            <NoLongerLiveSmallIcon className={styles.noLongerLiveSmallIcon} />
          </div>
        </div>
        <div className={styles.textWrapper} role="contentinfo">
          <p className={styles.primaryText}>{props.noLongerLive}</p>
        </div>
      </div>
    );
  }
}
