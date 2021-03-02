import { KalturaLivePlugin } from '../kaltura-live-plugin';
import { getContribLogger } from '@playkit-js-contrib/common';

const HTTP_ERRORS = [1002, 1003, 3016, 3022];

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

  constructor(engine: any, plugin: KalturaLivePlugin, dispatcher: Function) {
    this._plugin = plugin;
    this._engine = engine;
    this._hadError = false;
    this._dispatcher = dispatcher;

    this._plugin.player.addEventListener(
      this._plugin.player.Event.PLAYER_RESET,
      this._handleMediaLoaded
    );
    this._engine.addEventListener(
      this._plugin.player.Event.ERROR,
      this._handleError
    );
  }

  private _handleError = () => {
    this._plugin.reloadMedia = true;
    this._hadError = true;
  };

  private _handleMediaLoaded = () => {
    this._hadError = false;
  };

  get active(): boolean {
    return this._plugin.isMediaLive && this._hadError;
  }

  dispatchEvent(event: any): any {
    if (
      event.type === 'error' &&
      event.payload &&
      event.payload.code &&
      HTTP_ERRORS.indexOf(event.payload.code) > -1
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
