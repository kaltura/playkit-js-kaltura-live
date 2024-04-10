import {h, Component} from 'preact';
import * as styles from './live-viewers.scss';
import {VisibleIcon} from './visible-icon';

const {redux: {connect}} = KalturaPlayer.ui;

interface LiveViewersProps {
  liveViewers: number;
}

interface LiveViewersState {
  liveViewers: number;
}

@connect(null, null, null, {forwardRef: true})
export class LiveViewers extends Component<LiveViewersProps, LiveViewersState> {
  constructor(props: LiveViewersProps) {
    super();
    this.state = {
      liveViewers: props.liveViewers
    };
  }

  shouldComponentUpdate(nextProps: LiveViewersProps, nextState: LiveViewersState) {
    return nextState.liveViewers !== this.state.liveViewers;
  }

  public updateLiveViewers = (liveViewersState: number) => {
    this.setState({
      liveViewers: liveViewersState
    });
  };

  private _formatLiveViewers = (numberOfViewers: number): string => {
    return numberOfViewers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  render() {
    const {liveViewers} = this.state;
    const formattedLiveViewers = liveViewers ? this._formatLiveViewers(liveViewers) : '0';
    return (
      <div className={styles.liveViewersContainer}>
        <div className={styles.liveViewers} data-testid="kaltura-live_liveViewers">
          <VisibleIcon/>
          <span data-testid="kaltura-live_liveViewersNumber">{formattedLiveViewers}</span>
        </div>
      </div>
    );
  }
}
