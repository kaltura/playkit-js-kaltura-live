import {h, Component} from 'preact';
import * as styles from './offline.scss';

const {withText, Text} = KalturaPlayer.ui.preacti18n;

export interface OfflineProps {
  offlineTitle?: string;
  offlineBody?: string;
  noLongerLive?: string;
  postBroadcast: boolean;
  hideText: boolean;
}

const translates = {
  offlineTitle: <Text id="kalturaLive.offline_title">Not broadcasting yet</Text>,
  offlineBody: <Text id="kalturaLive.offline_body">Video will play once broadcasting starts</Text>,
  noLongerLive: <Text id="kalturaLive.offline_body">Broadcast is no longer live</Text>
};

@withText(translates)
export class Offline extends Component<OfflineProps> {
  get title() {
    return this.props.postBroadcast ? this.props.noLongerLive : this.props.offlineTitle;
  }
  get description() {
    return this.props.postBroadcast ? null : this.props.offlineBody;
  }

  render() {
    if (this.props.hideText) {
      return null;
    }
    return (
      <div className={styles.offlineWrapper} role="banner" data-testid="kaltura-live_offlineSlate">
        <div role="contentinfo" className={styles.offlineContent}>
          <p className={['kaltura-live-title', styles.primaryText].join(' ')}>{this.title}</p>
          {this.description ? <p className={['kaltura-live-description', styles.secondaryText].join(' ')}>{this.description}</p> : null}
        </div>
      </div>
    );
  }
}
