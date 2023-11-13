import {h} from 'preact';
import * as styles from './mute-button.scss';
import {OnClick} from '@playkit-js/common/dist/hoc/a11y-wrapper';
import {Button, ButtonType} from '@playkit-js/common/dist/components/button';
const {Text} = KalturaPlayer.ui.preacti18n;

export interface MuteButtonProps {
  onClick: OnClick;
  muted: boolean;
}

export const MuteButton = (props: MuteButtonProps) => {
  return (
    <div className={styles.muteButtonContainer}>
      <Button testId="kaltura-live_mute-button" type={ButtonType.translucent} onClick={props.onClick} icon={props.muted ? 'volumeMute' : 'volumeOn'}>
        <Text id={props.muted ? 'kalturaLive.unmute' : 'kalturaLive.mute'}>{props.muted ? 'Unmute' : 'Mute'}</Text>
      </Button>
    </div>
  );
};
