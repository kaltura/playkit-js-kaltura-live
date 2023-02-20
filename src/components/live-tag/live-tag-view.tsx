import {h, Component} from 'preact';
import * as styles from './live-tag.scss';
import {LiveTagStates} from './live-tag';
import {A11yWrapper} from '@playkit-js/common';
const {withText, Text} = KalturaPlayer.ui.preacti18n;

export interface props {
  seekToLiveEdge: Function;
  getStyles: Function;
  behindLiveEdge: boolean;
  liveTagState: LiveTagStates;
  offline?: string;
  live?: string;
  preview?: string;
}

const translates = {
  live: <Text id="kalturaLive.live">Live</Text>,
  offline: <Text id="kalturaLive.offline">Offline</Text>,
  preview: <Text id="kalturaLive.preview">Preview</Text>
};

@withText(translates)
export class LiveTagView extends Component<props> {
  render(props: props) {
    return (
      <A11yWrapper onClick={() => props.seekToLiveEdge()}>
        <div
          aria-live="polite"
          tabIndex={0}
          className={[styles.liveTag, props.getStyles(), props.behindLiveEdge ? styles.clickable : ''].join(' ')}
          aria-label={props.liveTagState}>
          {props[props.liveTagState]}
        </div>
      </A11yWrapper>
    );
  }
}
