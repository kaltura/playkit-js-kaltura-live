import {KalturaLivePlugin} from '../kaltura-live-plugin';

const {Error} = KalturaPlayer.core as any;
const HANDLED_ERRORS = [
  Error.Code.HTTP_ERROR,
  Error.Code.TIMEOUT,
  Error.Code.LIVE_MANIFEST_REFRESH_ERROR,
  Error.Code.VIDEO_ERROR,
  Error.Code.NATIVE_ADAPTER_LOAD_FAILED
];

export class KalturaLiveEngineDecorator implements KalturaPlayerTypes.IEngineDecorator {
  _plugin: KalturaLivePlugin;
  _engine: any;
  _dispatcher: Function;
  _hadError: boolean;
  _ended: boolean;
  _logger: KalturaPlayerTypes.Logger;

  constructor(engine: any, plugin: KalturaLivePlugin, dispatcher: Function, logger: KalturaPlayerTypes.Logger) {
    this._plugin = plugin;
    this._engine = engine;
    this._hadError = false;
    this._ended = false;
    this._dispatcher = dispatcher;
    this._logger = logger;

    this._plugin.player.addEventListener(this._plugin.player.Event.PLAYER_RESET, this._handleMediaLoaded);

    this._engine.addEventListener(this._plugin.player.Event.ERROR, this._handleError);

    this._engine.addEventListener(this._plugin.player.Event.ENDED, this._handleEnd);
  }

  private _handleError = (e: any) => {
    if (e.payload.severity === this._plugin.player.Error.Severity.CRITICAL) {
      this._plugin.playerHasError = true;
    }
    this._hadError = true;
  };

  private _handleEnd = () => {
    if (this._plugin.isMediaLive) {
      this._plugin.detachMediaSource();
      this._plugin.updateLiveStatus();
      this._ended = true;
    }
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
      if (this._plugin.allStreamsStopped){
        // primary and secondary streams are stopped - live has ended and the player should dispatch the playbackended event
        this._ended = true;
      } else {
        // at least one stream is still broadcasting (maybe switch between primary / secondary streams) - keep alive
        this._ended = false;
        return true; // this prevents the ended event propagation to the player thus preventing the playbackended event from being dispatched
      }
    }
    if (event.type === 'error' && event.payload && event.payload.code && HANDLED_ERRORS.indexOf(event.payload.code) > -1) {
      this._logger.info(`Kaltura live-decorator prevented interrupted error ${event.payload.code}`);
      this._plugin.updateLiveStatus();
      return true;
    }
    return this._dispatcher(event);
  }
}
