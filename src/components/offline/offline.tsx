import {h, Component} from 'preact';
import * as styles from './offline.scss';
import {OfflineIcon} from './offline-icon';
import {NetworkIssueIcon} from './network-issue-icon';
const {withText, Text} = KalturaPlayer.ui.preacti18n;


export interface props {
  httpError?: boolean;
  noInternetTitle?: string;
  noInternetBody?: string;
  offlineTitle?: string;
  offlineBody?: string;
  httpProblemTitle?: string;
  httpProblemBody?: string;
}

const translates = {
    noInternetTitle: <Text id="kalturaLive.no_internet_title">No Internet Connection</Text>,
    noInternetBody: <Text id="kalturaLive.no_internet_body">Check your network</Text>,
    offlineTitle: <Text id="kalturaLive.offline_title">Currently not broadcasting</Text>,
    offlineBody: <Text id="kalturaLive.offline_body">Video will play once broadcasting starts</Text>,
    httpProblemTitle: <Text id="kalturaLive.http_problem_title">Something went wrong</Text>,
    httpProblemBody: <Text id="kalturaLive.http_problem_body">Try refreshing the page</Text>

};
@withText(translates)
export class Offline extends Component<props> {
  static defaultProps = {
    httpError: false
  };

  render(props: props) {
    return (
      <div className={styles.offlineWrapper}>
        <div className={styles.offlineIcon}>{navigator.onLine ? <OfflineIcon /> : <NetworkIssueIcon />}</div>
        <div>
          <p className={styles.primaryText}>{props.httpError ? (navigator.onLine ? props.httpProblemTitle : props.noInternetTitle) : props.offlineTitle}</p>
          <p className={styles.secondaryText}>{props.httpError ? (navigator.onLine ? props.httpProblemBody : props.noInternetBody) : props.offlineBody}</p>
        </div>
      </div>
    );
  }
}
