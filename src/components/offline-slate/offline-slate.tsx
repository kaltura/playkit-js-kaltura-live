import { h, Component } from 'preact';
import { Offline } from '../offline';
import { NoLongerLive } from '../no-longer-live';

export enum OfflineTypes {
  Offline = 'Offline',
  HttpError = 'HttpError',
  NoLongerLive = 'NoLongerLive',
}

interface OfflineSlateState {
  type: OfflineTypes;
}

interface OfflineSlateProps {
  type?: OfflineTypes;
}

export class OfflineSlate extends Component<
  OfflineSlateProps,
  OfflineSlateState
> {
  constructor(props: OfflineSlateProps) {
    super();
    this.state = {
      type: props.type || OfflineTypes.HttpError,
    };
  }

  public manageOfflineSlate = (type: OfflineTypes) => {
    if (type !== this.state.type) {
      this.setState({ type });
    }
  };

  render() {
    if (this.state.type === OfflineTypes.NoLongerLive) {
      return <NoLongerLive />;
    }
    return <Offline httpError={this.state.type === OfflineTypes.HttpError} />;
  }
}
