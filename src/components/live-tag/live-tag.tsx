import {h, Component} from 'preact';
import * as styles from './live-tag.scss';
import {LiveTagView} from './live-tag-view';

const PREVIEW_SEEKBAR_CLASSNAME = 'live-priview';

const {
  redux: {connect},
  reducers: {seekbar}
} = KalturaPlayer.ui;

const mapStateToProps = (state: Record<string, any>) => ({
  currentTime: state.engine.currentTime,
  duration: state.engine.duration
});

const mapDispatchToProps = (dispatch: any) => {
  return {
    addPreviewClass: () => dispatch(seekbar.actions.addSeekbarClass(PREVIEW_SEEKBAR_CLASSNAME)),
    removePreviewClass: () => dispatch(seekbar.actions.removeSeekbarClass(PREVIEW_SEEKBAR_CLASSNAME))
  };
};

export enum LiveTagStates {
  Offline = 'offline',
  Live = 'live',
  Preview = 'preview'
}

interface LiveTagProps {
  liveTagState: LiveTagStates;
  addPreviewClass?: () => void;
  removePreviewClass?: () => void;
}

interface LiveTagState {
  liveTagState: LiveTagStates;
  behindLiveEdge: boolean;
}

interface Context {
  player: any;
}

@connect(mapStateToProps, mapDispatchToProps, null, {forwardRef: true})
export class LiveTag extends Component<LiveTagProps, LiveTagState> {
  constructor(props: LiveTagProps, {player}: Context) {
    super();
    this.state = {
      liveTagState: props.liveTagState,
      behindLiveEdge: false
    };
  }

  componentWillUnmount(): void {
    this.props.removePreviewClass?.();
  }

  componentDidUpdate(previousProps: Readonly<LiveTagProps>, previousState: Readonly<LiveTagState>): void {
    if (previousState.liveTagState !== LiveTagStates.Preview && this.state.liveTagState === LiveTagStates.Preview) {
      this.props.addPreviewClass?.();
    } else if (previousState.liveTagState === LiveTagStates.Preview && this.state.liveTagState !== LiveTagStates.Preview) {
      this.props.removePreviewClass?.();
    }
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
      <LiveTagView behindLiveEdge={behindLiveEdge} liveTagState={liveTagState} seekToLiveEdge={this._seekToLiveEdge} getStyles={this._getStyles} />
    );
  }
}
