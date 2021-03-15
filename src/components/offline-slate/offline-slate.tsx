import { h, Component } from 'preact';
import { Offline } from '../offline';
import { NoLongerLive } from '../no-longer-live';

export enum OfflineTypes {
  None = 'None',
  Offline = 'Offline',
  HttpError = 'HttpError',
  NoLongerLive = 'NoLongerLive',
}

interface OfflineSlateState {
  type: OfflineTypes;
}

interface OfflineSlateProps {}

export class OfflineSlate extends Component<
  OfflineSlateProps,
  OfflineSlateState
> {
  state = {
    type: OfflineTypes.None,
  };

  public manageOfflineSlate = (type: OfflineTypes) => {
    if (type !== this.state.type) {
      this.setState({ type });
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
