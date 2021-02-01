import {h, Component} from 'preact';
import * as styles from './live-tag.scss';

export enum LiveTagStates {
  Offline = 'Offline',
  Live = 'Live',
  Preview = 'Preview',
}

export interface LiveTagProps {
  state: LiveTagStates;
  isOnLiveEdge: boolean;
  onClick: () => void;
}

export class LiveTag extends Component<LiveTagProps> {
  shouldComponentUpdate(nextProps: LiveTagProps) {
    return (
      this.props.state !== nextProps.state ||
      this.props.isOnLiveEdge !== nextProps.isOnLiveEdge
    );
  }
  private _getStyles = () => {
    const {isOnLiveEdge, state} = this.props;
    if (isOnLiveEdge && state === LiveTagStates.Live) {
      return styles.live;
    }
    if (isOnLiveEdge && state === LiveTagStates.Preview) {
      return styles.preview;
    }
    return styles.offline;
  };

  private _onClick = (): void => {
    const {isOnLiveEdge, onClick} = this.props;
    if (!isOnLiveEdge) {
      onClick();
    }
  };

  render(props: LiveTagProps) {
    return (
      <div
        role="button"
        tab-index={0}
        className={[
          styles.liveTag,
          this._getStyles(),
          !props.isOnLiveEdge ? styles.clickable : '',
        ].join(' ')}
        onClick={this._onClick}>
        {props.state}
      </div>
    );
  }
}
