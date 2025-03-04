import {h, Component, Fragment, createRef} from 'preact';
//@ts-ignore
import {ui, core} from '@playkit-js/kaltura-player-js';
import {MuteButton} from '../mute-button';
import * as styles from './offline.scss';

//@ts-ignore
const {withPlayer} = ui.Components;
const {withText, Text} = ui.preacti18n;

export interface OfflineSlateUrls {
  preOfflineSlateUrl?: string;
  postOfflineSlateUrl?: string;
  poster?: string;
  preOfflinePlayer?: any;
  postOfflinePlayer?: any;
}

export interface OfflineProps {
  offlineTitle?: string;
  offlineBody?: string;
  noLongerLive?: string;
  postBroadcast: boolean;
  hideText: boolean;
  offlineSlateUrls: OfflineSlateUrls;
  player?: any;
}

interface OfflineState {
  imageSrc?: string;
}

const translates = {
  offlineTitle: <Text id="kalturaLive.offline_title">Not broadcasting yet</Text>,
  offlineBody: <Text id="kalturaLive.offline_body">Video will play once broadcasting starts</Text>,
  noLongerLive: <Text id="kalturaLive.no_longer_live">Broadcast is no longer live</Text>
};

@withPlayer
@withText(translates)
export class Offline extends Component<OfflineProps, OfflineState> {
  private _videoContainerRef = createRef<HTMLDivElement>();
  private _backgroundPlayer: any;
  private _originalVideoElementParent?: HTMLDivElement;

  constructor({postBroadcast, offlineSlateUrls}: OfflineProps) {
    super();
    this._backgroundPlayer = postBroadcast ? offlineSlateUrls?.postOfflinePlayer : offlineSlateUrls?.preOfflinePlayer;
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

  private disableControls() {
    const guiContainer = document.querySelector('.playkit-gui-area');
    if (guiContainer) {
        guiContainer.classList.add('controls-hidden');
    }
  }

  private restoreControls() {
    const guiContainer = document.querySelector('.playkit-gui-area');
    if (guiContainer) {
        guiContainer.classList.remove('controls-hidden');
    }
  }

  componentDidMount(): void {
    if (this._videoContainerRef && this._backgroundPlayer) {
      const {player} = this.props;
      const videoElement = this._backgroundPlayer.getVideoElement();
      this._originalVideoElementParent = videoElement.parentElement;
      videoElement.tabIndex = -1;
      this._videoContainerRef.current!.prepend(videoElement);
      this._backgroundPlayer.volume = player.volume;
      this._backgroundPlayer.muted = player.muted;
      this._backgroundPlayer.play();
    }
    this.disableControls();
  }

  componentWillUnmount(): void {
    if (this._backgroundPlayer) {
      this._backgroundPlayer.pause();
      this._originalVideoElementParent!.prepend(this._backgroundPlayer.getVideoElement());
    }
    this.restoreControls();
  }

  private _handleMute = (): void => {
    this._backgroundPlayer.muted = !this._backgroundPlayer.muted;
    this.props.player.muted = this._backgroundPlayer.muted;
    this.forceUpdate();
  };

  private _handleImageError = (): void => {
    const {poster} = this.props.offlineSlateUrls;
    if (poster && this.state.imageSrc !== poster) {
      this.setState({
        imageSrc: poster
      });
    }
  };

  private _renderMuteButton = () => {
    if (this._backgroundPlayer?.sources?.type === core.MediaType.IMAGE) {
      return null;
    }
    return <MuteButton onClick={this._handleMute} muted={this.props.player.muted} />;
  };

  private _renderBackground = () => {
    const {postBroadcast, offlineSlateUrls} = this.props;
    const {preOfflinePlayer, postOfflinePlayer} = offlineSlateUrls;
    if ((!postBroadcast && preOfflinePlayer) || (postBroadcast && postOfflinePlayer)) {
      return (
        <Fragment>
          <div ref={this._videoContainerRef} className={styles.videoContainer} data-testid="kaltura-live_videoContainer" />
          {this._renderMuteButton()}
        </Fragment>
      );
    }
    return (
      <img
        src={this.state.imageSrc}
        className={styles.slateBackgroundImage}
        onError={this._handleImageError}
        alt={this.title}
        data-testid="kaltura-live_offlineImage"
      />
    );
  };

  render() {
    return (
      <Fragment>
        {this._renderBackground()}
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
