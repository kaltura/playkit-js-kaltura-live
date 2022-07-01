import {h, Component} from 'preact';
import * as styles from './offline.scss';
import {OfflineIcon} from './offline-icon';
import {NetworkIssueIcon} from './network-issue-icon';

export interface props {
  httpError?: boolean;
}

const noInternetTitle = 'No Internet Connection';
const noInternetBody = 'Check your network';
const offlineTitle = 'Currently not broadcasting';
const offlineBody = 'Video will play once broadcasting starts';
const httpProblemTitle = 'Something went wrong';
const httpProblemBody = 'Try refreshing the page';

export class Offline extends Component<props> {
  static defaultProps = {
    httpError: false
  };

  render(props: props) {
    return (
      <div className={styles.offlineWrapper}>
        <div className={styles.offlineIcon}>{navigator.onLine ? <OfflineIcon /> : <NetworkIssueIcon />}</div>
        <div>
          <p className={styles.primaryText}>{props.httpError ? (navigator.onLine ? httpProblemTitle : noInternetTitle) : offlineTitle}</p>
          <p className={styles.secondaryText}>{props.httpError ? (navigator.onLine ? httpProblemBody : noInternetBody) : offlineBody}</p>
        </div>
      </div>
    );
  }
}
