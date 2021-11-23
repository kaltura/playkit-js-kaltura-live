import {h, Component} from 'preact';
import * as styles from './live-tag.scss';
const {
  redux: {connect}
} = KalturaPlayer.ui;

const mapStateToProps = (state: Record<string, any>) => ({
  currentTime: state.engine.currentTime,
  duration: state.engine.duration
});

export enum LiveTagStates {
  Offline = 'Offline',
  Live = 'Live',
  Preview = 'Preview'
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

@connect(mapStateToProps, null, null, {forwardRef: true})
export class LiveTag extends Component<LiveTagProps, LiveTagState> {
  constructor(props: LiveTagProps, {player}: Context) {
    super();
    this.state = {
      liveTagState: props.liveTagState,
      behindLiveEdge: false
    };
  }

  componentWillReceiveProps = () => {
    const {player} = this.context;
    this.setState({
      behindLiveEdge: player.paused || (player.isDvr && !player.isOnLiveEdge())
    });
  };

  shouldComponentUpdate(nextProps: LiveTagProps, nextState: LiveTagState) {
    return nextState.liveTagState !== this.state.liveTagState || nextState.behindLiveEdge !== this.state.behindLiveEdge;
  }

  public updateLiveTagState = (state: LiveTagStates) => {
    this.setState({
      liveTagState: state
    });
  };

  private _seekToLiveEdge = () => {
    if (!this.context.player.isOnLiveEdge()) {
      this.context.player.seekToLiveEdge();
      if (this.context.player.paused) {
        this.context.player.play();
      }
    }
  };

  private _getStyles = () => {
    const {behindLiveEdge, liveTagState} = this.state;
    if (!behindLiveEdge && liveTagState === LiveTagStates.Live) {
      return styles.liveEdge;
    }
    if (!behindLiveEdge && liveTagState === LiveTagStates.Preview) {
      return styles.previewEdge;
    }
    return styles.nonEdge;
  };

  render() {
    const {behindLiveEdge, liveTagState} = this.state;
    return (
      <div
        role="button"
        tab-index={0}
        className={[styles.liveTag, this._getStyles(), behindLiveEdge ? styles.clickable : ''].join(' ')}
        onClick={this._seekToLiveEdge}>
        {liveTagState}
      </div>
    );
  }
}
