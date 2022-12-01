import {h, Component} from 'preact';
import {Offline} from '../offline';
import {NoLongerLive} from '../no-longer-live';
import * as styles from './offline-slate.scss';

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
  getGuiAreaNode: () => Element | null;
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
  private _offlineWrapperRef: HTMLDivElement | null = null;
  state = {
    type: OfflineTypes.None
  };

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
    if (this.state.type === OfflineTypes.NoLongerLive) {
      return <NoLongerLive />;
    }
    return <Offline httpError={this.state.type === OfflineTypes.HttpError} />;
  };

  private _handleFocusChange = (e: FocusEvent) => {
    const playerGuiWrapper = this.props.getGuiAreaNode();
    if (playerGuiWrapper?.contains(e.target as Node | null)) {
      // prevent focus on playe gui area
      this._offlineWrapperRef?.focus();
    }
  };

  render() {
    return (
      <div
        aria-live="polite"
        tabIndex={-1}
        ref={node => {
          this._offlineWrapperRef = node;
        }}
        className={[styles.slateWrapper, this.state.type !== OfflineTypes.None ? styles.active : ''].join(' ')}>
        {this._renderSlate()}
      </div>
    );
  }
}
