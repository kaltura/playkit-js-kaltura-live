import {h, Component, Fragment} from 'preact';
import * as styles from './offline.scss';

const {withText, Text} = KalturaPlayer.ui.preacti18n;

export interface OfflineSlateUrls {
  preOfflineSlateUrl?: string;
  postOfflineSlateUrl?: string;
  poster?: string;
}

export interface OfflineProps {
  offlineTitle?: string;
  offlineBody?: string;
  noLongerLive?: string;
  postBroadcast: boolean;
  hideText: boolean;
  offlineSlateUrls: OfflineSlateUrls;
}

interface OfflineState {
  imageSrc?: string;
}

const translates = {
  offlineTitle: <Text id="kalturaLive.offline_title">Not broadcasting yet</Text>,
  offlineBody: <Text id="kalturaLive.offline_body">Video will play once broadcasting starts</Text>,
  noLongerLive: <Text id="kalturaLive.offline_body">Broadcast is no longer live</Text>
};

@withText(translates)
export class Offline extends Component<OfflineProps, OfflineState> {
  constructor({postBroadcast, offlineSlateUrls}: OfflineProps) {
    super();
    this.state = {
      imageSrc: (postBroadcast ? offlineSlateUrls.postOfflineSlateUrl : offlineSlateUrls.preOfflineSlateUrl) || offlineSlateUrls.poster
    };
  }

  get title() {
    return this.props.postBroadcast ? this.props.noLongerLive : this.props.offlineTitle;
  }
  get description() {
    return this.props.postBroadcast ? null : this.props.offlineBody;
  }

  private _handleImageError = (): void => {
    const {poster} = this.props.offlineSlateUrls;
    if (poster && this.state.imageSrc !== poster) {
      this.setState({
        imageSrc: poster
      });
    }
  };

  render() {
    return (
      <Fragment>
        <img
          src={this.state.imageSrc}
          className={styles.slateBackgroundImage}
          onError={this._handleImageError}
          alt={this.title}
          data-testid="kaltura-live_offlineImage"
        />
        {this.props.hideText ? null : (
          <div className={styles.offlineWrapper} role="banner" data-testid="kaltura-live_offlineSlate">
            <div role="contentinfo" className={styles.offlineContent}>
              <p className={['kaltura-live-title', styles.primaryText].join(' ')}>{this.title}</p>
              {this.description ? <p className={['kaltura-live-description', styles.secondaryText].join(' ')}>{this.description}</p> : null}
            </div>
          </div>
        )}
      </Fragment>
    );
  }
}
