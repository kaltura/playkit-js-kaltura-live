import {h, Component} from 'preact';
import {Offline} from '../offline';
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
  preOfflineSlateUrl?: string;
  postOfflineSlateUrl?: string;
  poster?: string;
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

  get _backgroundSrc() {
    return this._isPostBroadcast ? this.props.postOfflineSlateUrl : this.props.preOfflineSlateUrl ;
  }

  componentWillUnmount() {
    this.props.removePlayerClass!();
    document.removeEventListener('focusin', this._handleFocusChange, true);
  }

  componentDidUpdate(prevProps: OfflineSlateProps, prevState: OfflineSlateState) {
    if (prevState.type !== this.state.type) {
      if (this.state.type !== OfflineTypes.None) {
        this.props.addPlayerClass!();
        this.props.removeSpinner!();
        this._offlineWrapperRef?.focus();
        document.addEventListener('focusin', this._handleFocusChange, true);
      } else {
        this.props.removePlayerClass!();
        document.removeEventListener('focusin', this._handleFocusChange, true);
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
    return (
      <Offline
        postBroadcast={this._isPostBroadcast}
        hideText={this.props.hideText}
        backgroundSrc={this._backgroundSrc}
        fallbackSrc={this.props.poster}
      />
    );
  };

  private _handleFocusChange = (e: FocusEvent) => {
    const playerGuiWrapper = this.props.getGuiAreaNode();
    if (playerGuiWrapper?.contains(e.target as Node | null)) {
      // prevent focus on playe gui area
      this._offlineWrapperRef?.focus();
    }
  };

  render() {
    const isActive = this.state.type !== OfflineTypes.None;
    const offlineSlateStyles: Record<string, string> = {};

    return (
      <div
        aria-live="polite"
        tabIndex={-1}
        ref={node => {
          this._offlineWrapperRef = node;
        }}
        data-testid="kaltura-live_offlineWrapper"
        className={[styles.slateWrapper, isActive ? styles.active : ''].join(' ')}
        style={offlineSlateStyles}>
        {this._renderSlate()}
      </div>
    );
  }
}
