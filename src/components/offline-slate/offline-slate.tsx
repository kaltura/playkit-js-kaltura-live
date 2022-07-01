import {h, Component} from 'preact';
import {Offline} from '../offline';
import {NoLongerLive} from '../no-longer-live';
import './offline-slate.scss';

export enum OfflineTypes {
  None = 'None',
  Offline = 'Offline',
  HttpError = 'HttpError',
  NoLongerLive = 'NoLongerLive'
}

interface OfflineSlateState {
  type: OfflineTypes;
}

interface OfflineSlateProps {
  addPlayerClass?: () => void;
  removePlayerClass?: () => void;
  removeSpinner?: () => void;
}

const LIVE_PLUGIN_HAS_OVERLAY_CLASSNAME = 'has-live-plugin-overlay';

const {
  redux: {connect},
  reducers: {shell, loading}
} = KalturaPlayer.ui;

const mapDispatchToProps = (dispatch: any) => {
  return {
    addPlayerClass: () => dispatch(shell.actions.addPlayerClass(LIVE_PLUGIN_HAS_OVERLAY_CLASSNAME)),
    removePlayerClass: () => dispatch(shell.actions.removePlayerClass(LIVE_PLUGIN_HAS_OVERLAY_CLASSNAME)),
    removeSpinner: () => dispatch(loading.actions.updateLoadingSpinnerState(false))
  };
};

@connect(null, mapDispatchToProps, null, {forwardRef: true})
export class OfflineSlate extends Component<OfflineSlateProps, OfflineSlateState> {
  state = {
    type: OfflineTypes.None
  };

  componentWillUnmount() {
    this.props.removePlayerClass!();
  }

  componentDidUpdate(prevProps: OfflineSlateProps, prevState: OfflineSlateState) {
    if (prevState.type !== this.state.type) {
      if (this.state.type !== OfflineTypes.None) {
        this.props.addPlayerClass!();
        this.props.removeSpinner!();
      } else {
        this.props.removePlayerClass!();
      }
    }
  }

  public manageOfflineSlate = (type: OfflineTypes) => {
    if (type !== this.state.type) {
      this.setState({type});
    }
  };

  render() {
    if (this.state.type === OfflineTypes.None) {
      return null;
    }
    if (this.state.type === OfflineTypes.NoLongerLive) {
      return <NoLongerLive />;
    }
    return <Offline httpError={this.state.type === OfflineTypes.HttpError} />;
  }
}
