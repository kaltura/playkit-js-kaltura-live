import { h, Component } from 'preact';
import { threadId } from 'worker_threads';
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
  isOnLiveEdge: boolean;
}

interface Context {
  player: any;
}

export class LiveTag extends Component<LiveTagProps, LiveTagState> {
  constructor(props: LiveTagProps, context: Context) {
    super();
    this.state = {
      liveTagState: props.liveTagState,
      isOnLiveEdge: context.player.isOnLiveEdge(),
    };
  }

  shouldComponentUpdate(nextProps: LiveTagProps, nextState: LiveTagState) {
    return (
      nextState.liveTagState !== this.state.liveTagState ||
      nextState.isOnLiveEdge !== this.state.isOnLiveEdge
    );
  }

  componentWillMount() {
    this.context.player.addEventListener(
      this.context.player.Event.SEEKED,
      this._updateIsOnLiveEdge
    );
    this.context.player.addEventListener(
      this.context.player.Event.PLAYING,
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
      this.context.player.Event.PLAYING,
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
      isOnLiveEdge: this.context.player.paused
        ? false
        : this.context.player.isOnLiveEdge(),
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
    const { isOnLiveEdge, liveTagState } = this.state;
    if (isOnLiveEdge && liveTagState === LiveTagStates.Live) {
      return styles.live;
    }
    if (isOnLiveEdge && liveTagState === LiveTagStates.Preview) {
      return styles.preview;
    }
    return styles.offline;
  };

  render() {
    const { isOnLiveEdge, liveTagState } = this.state;
    return (
      <div
        role="button"
        tab-index={0}
        className={[
          styles.liveTag,
          this._getStyles(),
          !isOnLiveEdge ? styles.clickable : '',
        ].join(' ')}
        onClick={this._seekToLiveEdge}>
        {liveTagState}
      </div>
    );
  }
}
