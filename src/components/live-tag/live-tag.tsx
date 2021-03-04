import { h, Component } from 'preact';
import * as styles from './live-tag.scss';

export enum LiveTagStates {
  Offline = 'Offline',
  Live = 'Live',
  Preview = 'Preview',
}

interface LiveTagProps {
  liveTagState: LiveTagStates;
}

interface LiveTagState {
  liveTagState: LiveTagStates;
  behindLiveEdge: boolean;
}

interface Context {
  player: any;
}

export class LiveTag extends Component<LiveTagProps, LiveTagState> {
  constructor(props: LiveTagProps, { player }: Context) {
    super();
    this.state = {
      liveTagState: props.liveTagState,
      behindLiveEdge: false,
    };
  }

  shouldComponentUpdate(nextProps: LiveTagProps, nextState: LiveTagState) {
    return (
      nextState.liveTagState !== this.state.liveTagState ||
      nextState.behindLiveEdge !== this.state.behindLiveEdge
    );
  }

  componentDidMount() {
    this.context.player.addEventListener(
      this.context.player.Event.SEEKED,
      this._updateIsOnLiveEdge
    );
    this.context.player.addEventListener(
      this.context.player.Event.PAUSE,
      this._updateIsOnLiveEdge
    );
  }
  componentWillUnmount() {
    this.context.player.removeEventListener(
      this.context.player.Event.SEEKED,
      this._updateIsOnLiveEdge
    );
    this.context.player.removeEventListener(
      this.context.player.Event.PAUSE,
      this._updateIsOnLiveEdge
    );
  }

  public updateLiveTagState = (state: LiveTagStates) => {
    this.setState({
      liveTagState: state,
    });
  };

  private _updateIsOnLiveEdge = () => {
    this.setState({
      // condition taken from https://github.com/kaltura/playkit-js-ui/blob/master/src/components/live-tag/live-tag.js#L73
      behindLiveEdge:
        this.context.player.paused ||
        (this.context.player.isDvr && !this.context.player.isOnLiveEdge()),
    });
  };

  private _seekToLiveEdge = () => {
    if (!this.context.player.isOnLiveEdge()) {
      this.context.player.seekToLiveEdge();
    }
    if (this.context.player.paused) {
      this.context.player.play();
    }
  };

  private _getStyles = () => {
    const { behindLiveEdge, liveTagState } = this.state;
    if (!behindLiveEdge && liveTagState === LiveTagStates.Live) {
      return styles.liveEdge;
    }
    if (!behindLiveEdge && liveTagState === LiveTagStates.Preview) {
      return styles.previewEdge;
    }
    return styles.nonEdge;
  };

  render() {
    const { behindLiveEdge, liveTagState } = this.state;
    return (
      <div
        role="button"
        tab-index={0}
        className={[
          styles.liveTag,
          this._getStyles(),
          behindLiveEdge ? styles.clickable : '',
        ].join(' ')}
        onClick={this._seekToLiveEdge}>
        {liveTagState}
      </div>
    );
  }
}
