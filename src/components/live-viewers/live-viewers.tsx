import {h, Component} from 'preact';
import * as styles from './live-viewers.scss';
import {LiveViewersIcon} from './live-viewers-icon';

interface LiveViewersState {
  liveViewers: string;
}

export class LiveViewers extends Component<{}, LiveViewersState> {
  constructor() {
    super();
    this.state = {
      liveViewers: '0'
    };
  }

  shouldComponentUpdate(nextProps: any, nextState: LiveViewersState) {
    return nextState.liveViewers !== this.state.liveViewers;
  }

  public updateLiveViewers = (liveViewersState: number) => {
    this.setState({
      liveViewers: this._formatLiveViewers(liveViewersState)
    });
  };

  private _formatLiveViewers = (numberOfViewers: number): string => {
    return numberOfViewers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  render() {
    return (
      <div className={styles.liveViewersContainer}>
        {this.state.liveViewers !== "0" && (
            <div className={styles.liveViewers} data-testid="kaltura-live_liveViewers">
              <LiveViewersIcon />
              <span data-testid="kaltura-live_liveViewersNumber">{this.state.liveViewers}</span>
            </div>
        )}
      </div>
    );
  }
}
