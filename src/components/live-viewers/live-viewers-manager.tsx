import {h, createRef} from 'preact';
import {LiveViewers} from './live-viewers';

const API_CALL_INTERVAL_MS = 20000;

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
    this._baseRequestUrl = `${serviceUrl}/service/LiveStream/action/getLiveStreamStats/entryId`;
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

  private _updateLiveViewers = () => {
    const entryId = this._player.config.sources.id;
    // make api call to get live viewers
    const requestUrl = `${this._baseRequestUrl}/${entryId}`
    try {
      fetch(requestUrl)
        .then(response => response.text())
        .then((textResponse: any) => {
          if (textResponse) {
            const domParser: DOMParser = new DOMParser();
            const xml: any = domParser.parseFromString(textResponse, 'text/xml');
            const liveViewersElement = xml.querySelector("liveViewers");
            if (liveViewersElement) {
              this._liveViewersRef?.current?.updateLiveViewers(liveViewersElement.innerHTML || 0);
            }
          }
      })
    } catch (e) {
      this._logger.debug(`There was an issue with getting the number of live viewers. The request has failed: ${requestUrl}. error:`, e);
    }
  };

  reset(): void {
    this.resetInterval();
  }
}