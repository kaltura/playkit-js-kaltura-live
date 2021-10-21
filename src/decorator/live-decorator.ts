import { KalturaLivePlugin } from '../kaltura-live-plugin';
import { getContribLogger } from '@playkit-js-contrib/common';

const { Error } = KalturaPlayer.core as any;
const HANDLED_ERRORS = [
  Error.Code.HTTP_ERROR,
  Error.Code.TIMEOUT,
  Error.Code.LIVE_MANIFEST_REFRESH_ERROR,
  Error.Code.VIDEO_ERROR,
  Error.Code.NATIVE_ADAPTER_LOAD_FAILED,
];

const logger = getContribLogger({
  class: 'KalturaLiveDecorator',
  module: 'kaltura-live-decorator',
});

export class KalturaLiveEngineDecorator
  implements KalturaPlayerTypes.IEngineDecorator {
  _plugin: KalturaLivePlugin;
  _engine: any;
  _dispatcher: Function;
  _hadError: boolean;
  _ended: boolean;

  constructor(engine: any, plugin: KalturaLivePlugin, dispatcher: Function) {
    this._plugin = plugin;
    this._engine = engine;
    this._hadError = false;
    this._ended = false;
    this._dispatcher = dispatcher;

    this._plugin.player.addEventListener(
      this._plugin.player.Event.PLAYER_RESET,
      this._handleMediaLoaded
    );

    this._engine.addEventListener(
      this._plugin.player.Event.ERROR,
      this._handleError
    );

    this._engine.addEventListener(
      this._plugin.player.Event.ENDED,
      this._handleEnd
    );
  }

  private _handleError = (e: any) => {
    if (e.payload.severity === this._plugin.player.Error.Severity.CRITICAL) {
      this._plugin.reloadMedia = true;
    }
    this._hadError = true;
  };

  private _handleEnd = () => {
    this._plugin.detachMediaSource();
    this._plugin.updateLiveStatus();
    this._ended = true;
  };

  private _handleMediaLoaded = () => {
    this._hadError = false;
    this._ended = false;
  };

  get active(): boolean {
    return this._plugin.isMediaLive && (this._hadError || this._ended);
  }

  dispatchEvent(event: any): any {
    if (event.type === this._plugin.player.Event.ENDED) {
      this._ended = false;
      return true;
    }
    if (
      event.type === 'error' &&
      event.payload &&
      event.payload.code &&
      HANDLED_ERRORS.indexOf(event.payload.code) > -1
    ) {
      logger.info(
        `Kaltura live-decorator prevented interrupted error ${event.payload.code}`,
        {
          method: 'dispatchEvent',
        }
      );
      this._plugin.updateLiveStatus();
      return true;
    }
    return this._dispatcher(event);
  }
}
