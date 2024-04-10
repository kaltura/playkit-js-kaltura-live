import {GetLiveStatsLoader} from '../../providers/get-live-stats';
import {h, createRef} from 'preact';
import {LiveViewers} from './live-viewers';

const API_CALL_TIMEOUT_MS = 10000;

export class LiveViewersManager {
  private _player: any;
  private _isLiveApiCallInterval: any = null;
  private _liveViewersRef = createRef<LiveViewers>();

  constructor(player: any) {
    this._player = player;
    this._addLiveViewers();
    this.initInterval();
  }

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
    this._isLiveApiCallInterval = setInterval(this._updateLiveViewers, API_CALL_TIMEOUT_MS);
  };

  public resetInterval = () => {
    if (this._isLiveApiCallInterval) {
      clearInterval(this._isLiveApiCallInterval);
      this._isLiveApiCallInterval = null;
    }
  };

  private _updateLiveViewers = () => {
    const entryId = this._player.config.sources.id;
    const ks = this._player.config.session?.ks || null;
    // make api call to get live viewers
    this._player.provider.doRequest([{loader: GetLiveStatsLoader, params: {ks, entryId}}])
      .then((data: Map<string, any>) => {
        if (data && data.has(GetLiveStatsLoader.id)) {
          const liveStatsLoader = data.get(GetLiveStatsLoader.id);
          const liveStats = liveStatsLoader?.response;
          // liveViewers from response is possibly false (in case of 0 viewers)
          this._liveViewersRef?.current?.updateLiveViewers(liveStats.liveViewers || 0);
        }
      });
  };

  reset(): void {
    this.resetInterval();
  }
}