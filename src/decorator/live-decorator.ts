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
  _isDecoratorActive: boolean;

  constructor(engine: any, plugin: KalturaLivePlugin, dispatcher: Function) {
    this._plugin = plugin;
    this._engine = engine;
    this._isDecoratorActive = false;
    this._dispatcher = dispatcher;
    
    this._engine.addEventListener(
      this._plugin.player.Event.MEDIA_LOADED,
      this._handleMediaLoaded
    );
    this._engine.addEventListener(
      this._plugin.player.Event.ERROR,
      this._handleError
    );
  }

  private _handleError = () => {
    this._plugin.reloadMedia = true;
    this._isDecoratorActive = true;
  };

  private _handleMediaLoaded = () => {
    this._isDecoratorActive = false;
  };

  get active(): boolean {
    return this._plugin.isActive() && this._isDecoratorActive;
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
