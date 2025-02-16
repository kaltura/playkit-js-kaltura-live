import {h, createRef} from 'preact';
import {LiveViewers} from './live-viewers';

const API_CALL_INTERVAL_MS = 20000;
const URL_JSON_FORMAT = 'format/1';
const ENTRY_ID_URL_PLACEHOLDER = '{entryId}';
const REQUEST_URL_TEMPLATE = 'service/LiveStream/action/getLiveStreamStats/entryId';

export class LiveViewersManager {
  private _player: any;
  private _isLiveApiCallInterval: any = null;
  private _liveViewersRef = createRef<LiveViewers>();
  private _baseRequestUrl: string = '';
  private _logger: KalturaPlayerTypes.Logger;

  constructor(player: any, logger: KalturaPlayerTypes.Logger) {
    this._player = player;
    this._logger = logger;
    this._addLiveViewers();
    this._buildBaseRequestUrl();
  }

  public loadMedia(): void {
    if (this._player.isLive()) {
      this.initInterval();
    }
    else {
      this.resetInterval();
    }
  }

  private _buildBaseRequestUrl = () => {
    const {serviceUrl} = this._player.provider.env;
    this._baseRequestUrl = `${serviceUrl}/${REQUEST_URL_TEMPLATE}/${ENTRY_ID_URL_PLACEHOLDER}/${URL_JSON_FORMAT}`;
  };

  private _addLiveViewers = () => {
    this._player.ui.addComponent({
      label: 'kaltura-live-viewers',
      presets: ['Live'],
      container: 'BottomBarLeftControls',
      get: () => <LiveViewers ref={this._liveViewersRef} />
    });
  };

  public initInterval = () => {
    this.resetInterval();
    this._isLiveApiCallInterval = setInterval(this._updateLiveViewers, API_CALL_INTERVAL_MS);
  };

  public resetInterval = () => {
    if (this._isLiveApiCallInterval) {
      clearInterval(this._isLiveApiCallInterval);
      this._isLiveApiCallInterval = null;
    }
  };

  private _updateLiveViewers = async () => {
    const entryId = this._player.config.sources.id;
    const requestUrl: string = this._baseRequestUrl.replace(ENTRY_ID_URL_PLACEHOLDER, entryId);
    const liveViewers: number | null = await this._getLiveViewers(requestUrl);
    if (typeof liveViewers === 'number' && liveViewers > 0) {
      this._liveViewersRef?.current?.updateLiveViewers(liveViewers);
    }
  };

  private _getLiveViewers = async (requestUrl: string): Promise<number | null> => {
    try {
      const response = await fetch(requestUrl);
      const liveViewersParsed = await response.json();
      return Number(liveViewersParsed?.liveViewers);
    } catch (e) {
      this._logger.debug(`There was an issue with getting the number of live viewers. The request has failed: ${requestUrl}. error:`, e);
      return null;
    }
  }

  reset(): void {
    this.resetInterval();
  }
}