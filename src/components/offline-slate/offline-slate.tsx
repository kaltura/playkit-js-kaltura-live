import {h, Component} from 'preact';
import {Offline, OfflineSlateUrls} from '../offline';
import * as styles from './offline-slate.scss';

// @ts-ignore
const {ErrorOverlay} = KalturaPlayer.ui.components;

export enum OfflineTypes {
  None = 'None',
  Offline = 'Offline',
  Error = 'Error',
  NoLongerLive = 'NoLongerLive'
}

interface OfflineSlateState {
  type: OfflineTypes;
}

interface OfflineSlateProps {
  getGuiAreaNode: () => Element | null;
  addPlayerClass?: () => void;
  removePlayerClass?: () => void;
  removeSpinner?: () => void;
  offlineSlateUrls: OfflineSlateUrls;
  hideText: boolean;
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
  private _offlineWrapperRef: HTMLDivElement | null = null;
  state = {
    type: OfflineTypes.None
  };

  get _isPostBroadcast() {
    return this.state.type === OfflineTypes.NoLongerLive;
  }

  componentWillUnmount() {
    this.props.removePlayerClass!();
  }

  componentDidUpdate(prevProps: OfflineSlateProps, prevState: OfflineSlateState) {
    if (prevState.type !== this.state.type) {
      if (this.state.type !== OfflineTypes.None) {
        this.props.addPlayerClass!();
        this.props.removeSpinner!();
        if (this._offlineWrapperRef) {
          this._offlineWrapperRef.focus();
          this._offlineWrapperRef.tabIndex = 0;
        }
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

  private _renderSlate = () => {
    if (this.state.type === OfflineTypes.None) {
      return null;
    }
    if (this.state.type === OfflineTypes.Error) {
      return <ErrorOverlay permanent />;
    }
    return <Offline postBroadcast={this._isPostBroadcast} hideText={this.props.hideText} offlineSlateUrls={this.props.offlineSlateUrls} />;
  };

  render() {
    return (
      <div
        aria-live="polite"
        tabIndex={-1}
        ref={node => {
          this._offlineWrapperRef = node;
        }}
        data-testid="kaltura-live_offlineWrapper"
        className={[styles.slateWrapper, this.state.type !== OfflineTypes.None ? styles.active : ''].join(' ')}>
        {this._renderSlate()}
      </div>
    );
  }
}
