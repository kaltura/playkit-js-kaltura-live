import {h, createRef} from 'preact';
import {KalturaLiveMiddleware} from './middleware/live-middleware';
import {KalturaLiveEngineDecorator} from './decorator/live-decorator';
import {OfflineSlate, OfflineTypes} from './components/offline-slate';
import {LiveTag, LiveTagStates} from './components/live-tag';
import {GetStreamDetailsLoader, KalturaLiveStreamBroadcastStatus} from './providers/get-stream-details-loader';
// @ts-ignore
import {core} from 'kaltura-player-js';

interface LivePluginConfig {
  checkLiveWithKs: boolean;
  isLiveInterval: number;
}

export enum LiveBroadcastStates {
  Unknown = 'Unknown',
  Error = 'Error',
  Live = 'Live',
  Offline = 'Offline'
}

// @ts-ignore
export class KalturaLivePlugin extends KalturaPlayer.core.BasePlugin implements IMiddlewareProvider, IEngineDecoratorProvider {
  private _player: KalturaPlayerTypes.Player;
  public isMediaLive = false;
  private _broadcastState: LiveBroadcastStates = LiveBroadcastStates.Unknown;
  private _wasPlayed = false;
  private _absolutePosition = null;
  private _isLiveApiCallTimeout: any = null;
  private _liveTagState: LiveTagStates = LiveTagStates.Live;
  private _activeRequest = false;
  public playerHasError = false;
  private _mediaDetached = false;
  private _liveTag = createRef<LiveTag>();
  private _offlineSlate = createRef<OfflineSlate>();

  /**
   * The default configuration of the plugin.
   * @type {VisibilityConfigObject}
   * @static
   */
  static defaultConfig: LivePluginConfig = {
    checkLiveWithKs: false,
    isLiveInterval: 10
  };

  constructor(name: string, player: KalturaPlayerTypes.Player, config: LivePluginConfig) {
    super(name, player, config);
    this._player = player;
    this._player.addEventListener(this._player.Event.SOURCE_SELECTED, this._activatePlugin);

    this._addLiveTag();
    this._addOfflineSlateToPlayerArea();
  }

  getMiddlewareImpl(): any {
    return new KalturaLiveMiddleware(this);
  }

  getEngineDecorator(engine: any, dispatcher: Function) {
    return new KalturaLiveEngineDecorator(engine, this, dispatcher, this.logger);
  }

  onMediaUnload(): void {
    this._resetTimeout();
    this.isMediaLive = false;
    this._player.removeEventListener(this._player.Event.FIRST_PLAY, this._handleFirstPlay);
    this._player.removeEventListener(this._player.Event.TIMED_METADATA, this.handleTimedMetadata);
    this._player.removeEventListener(this._player.Event.MEDIA_LOADED, this._handleMediaLoaded);
  }

  private _activatePlugin = () => {
    this.isMediaLive = this.player.isLive();
    if (this.isMediaLive) {
      this._player.addEventListener(this._player.Event.FIRST_PLAY, this._handleFirstPlay);
      this._player.addEventListener(this._player.Event.TIMED_METADATA, this.handleTimedMetadata);
      this._player.addEventListener(this._player.Event.MEDIA_LOADED, this._handleMediaLoaded);
    }
  };

  private _handleMediaLoaded = () => {
    this._player.configure({
      plugins: {kava: {tamperAnalyticsHandler: this._tamperAnalyticsHandler}}
    });
    this.updateLiveStatus();
  };

  private _addLiveTag = () => {
    this._player.ui.addComponent({
      label: 'kaltura-live-tag',
      presets: ['Live'],
      replaceComponent: 'LiveTag',
      container: 'BottomBarLeftControls',
      get: () => <LiveTag ref={this._liveTag} liveTagState={this._liveTagState} />
    });
  };

  private _addOfflineSlateToPlayerArea = () => {
    this._player.ui.addComponent({
      label: 'no-longer-live-overlay',
      presets: ['Live', 'Playback'],
      container: 'PlayerArea',
      get: () => {
        return <OfflineSlate ref={this._offlineSlate} />;
      }
    });
  };

  private _updateOfflineSlate = (type: OfflineTypes) => {
    this._offlineSlate?.current?.manageOfflineSlate(type);
  };

  private _updateLiveTag = (state: LiveTagStates) => {
    this._liveTagState = state;
    this._liveTag?.current?.updateLiveTagState(state);
  };

  public get broadcastState(): LiveBroadcastStates {
    return this._broadcastState;
  }

  public handleTimedMetadata = (e: any) => {
    if (!e || !e.payload || !e.payload.cues || !e.payload.cues.length) {
      this._absolutePosition = null;
      return;
    }
    try {
      this._absolutePosition = JSON.parse(e.payload.cues[e.payload.cues.length - 1].value.data).timestamp;
    } catch (error) {
      this._absolutePosition = null;
      this.logger.warn('Failed parsing timedmetadata payload cue ', error);
    }
  };

  private _tamperAnalyticsHandler = (e: any) => {
    if (this._absolutePosition) {
      e.absolutePosition = this._absolutePosition;
    }
    return true;
  };

  private _handleFirstPlay = () => {
    this._wasPlayed = true;
  };

  private _loadMedia = () => {
    this.playerHasError = false;
    this._player.configure({playback: {autoplay: true}});
    this._player.loadMedia({entryId: this._player.config.sources.id});
  };

  public detachMediaSource = () => {
    this._mediaDetached = true;
    this._player.detachMediaSource();
  };

  private _attachMediaSource = () => {
    this._mediaDetached = false;
    this._player.addEventListener(this._player.Event.CAN_PLAY, this._restoreLiveEdge);
    this._player.attachMediaSource();
    this._player.play();
  };

  private _restoreLiveEdge = () => {
    this._player.seekToLiveEdge();
    this._player.removeEventListener(this._player.Event.CAN_PLAY, this._restoreLiveEdge);
  };

  private _resetTimeout = () => {
    if (this._isLiveApiCallTimeout) {
      clearTimeout(this._isLiveApiCallTimeout);
      this._isLiveApiCallTimeout = null;
    }
  };

  private _initTimeout = () => {
    const {isLiveInterval} = this.config;
    this._resetTimeout();
    this._isLiveApiCallTimeout = setTimeout(this.updateLiveStatus, isLiveInterval * 1000);
  };

  // this functions is called whenever isLive receives any value.
  // This is where the magic happens
  private handleLiveStatusReceived(receivedState: LiveBroadcastStates) {
    this._broadcastState = receivedState;
    const hasDVR = this._player.isDvr();
    this.logger.info('Received isLive with value: ' + receivedState);
    if (receivedState === LiveBroadcastStates.Error && this._player.paused) {
      this._manageOfflineSlate(OfflineTypes.HttpError);
      return;
    }

    if (!this._wasPlayed && receivedState === LiveBroadcastStates.Offline) {
      this._manageOfflineSlate(OfflineTypes.Offline);
      this.logger.info('Offline before first play - show offline slate');
      return;
    }

    if (receivedState === LiveBroadcastStates.Offline) {
      this._manageOfflineSlate(OfflineTypes.NoLongerLive);
      if (this._mediaDetached) {
        this._player.dispatchEvent(new (KalturaPlayer.core as any).FakeEvent(this._player.Event.ENDED));
      }
      this.logger.info('Received isLive false after ended - show no longer live slate');
      return;
    }

    if (receivedState === LiveBroadcastStates.Live) {
      if (this.playerHasError) {
        this.logger.info('Player got error but stream is Live now. Reload media');
        this._loadMedia();
      }
      if (this._mediaDetached) {
        this.logger.info('Media ended but stream is Live now. Attach media');
        this._attachMediaSource();
      }
      // Live. Remove slate
      this._manageOfflineSlate(OfflineTypes.None);
    }
  }

  private _manageOfflineSlate(type: OfflineTypes) {
    if (type === OfflineTypes.None) {
      this._updateOfflineSlate(OfflineTypes.None);
      if (this.config.checkLiveWithKs) {
        // keep poll data for admins
        this._initTimeout();
      }
      return;
    }
    this._initTimeout();
    switch (type) {
      case OfflineTypes.NoLongerLive:
        if (!this._player.isDvr() || this._mediaDetached || this.playerHasError) {
          this._updateOfflineSlate(OfflineTypes.NoLongerLive);
        }
        break;
      case OfflineTypes.Offline:
        this._updateOfflineSlate(OfflineTypes.Offline);
        break;
      case OfflineTypes.HttpError:
        this._updateOfflineSlate(OfflineTypes.HttpError);
        break;
    }
  }

  // The function calls 'isLive' api and then repeats the call every X seconds (10 by default)
  public updateLiveStatus = () => {
    this.logger.info(`Calling LiveStreamGetDetailsAction ${this.config.checkLiveWithKs ? 'with' : 'without'} KS`);
    const {id} = this._player.config.sources;
    const ks = this.config.checkLiveWithKs ? this._player.config.session?.ks : null;
    if (this._activeRequest) {
      return; // prevent new API call if current is pending
    }
    this._resetTimeout();
    this._activeRequest = true;
    this._player.provider
      .doRequest([{loader: GetStreamDetailsLoader, params: {ks, id}}])
      .then((data: Map<string, any>) => {
        if (data && data.has(GetStreamDetailsLoader.id)) {
          const streamDetailsLoader = data.get(GetStreamDetailsLoader.id);
          const streamDetails = streamDetailsLoader?.response;

          this._activeRequest = false;
          this._liveTagState = LiveTagStates.Offline;
          if (!streamDetails.broadcastStatus) {
            // bad response
            this._initTimeout();
            return;
          }
          switch (streamDetails.broadcastStatus) {
            case KalturaLiveStreamBroadcastStatus.live:
              this._updateLiveTag(LiveTagStates.Live);
              this.handleLiveStatusReceived(LiveBroadcastStates.Live);
              break;
            case KalturaLiveStreamBroadcastStatus.offline:
              this._updateLiveTag(LiveTagStates.Offline);
              this.handleLiveStatusReceived(LiveBroadcastStates.Offline);
              break;
            case KalturaLiveStreamBroadcastStatus.preview:
              if (this.config.checkLiveWithKs) {
                this._updateLiveTag(LiveTagStates.Preview);
                this.handleLiveStatusReceived(LiveBroadcastStates.Live);
              } else {
                this._updateLiveTag(LiveTagStates.Offline);
                this.handleLiveStatusReceived(LiveBroadcastStates.Offline);
              }
              break;
          }
          this.logger.info('LiveStreamGetDetails received. data.broadcastStatus ' + streamDetails.broadcastStatus);
        }
      })
      .catch((e: any) => {
        this._activeRequest = false;
        this._updateLiveTag(LiveTagStates.Offline);
        this.handleLiveStatusReceived(LiveBroadcastStates.Error);
        this.logger.error('Failed to call isLive API', e);
        this._initTimeout();
      });
  };

  /**
   * @static
   * @public
   * @returns {boolean} - Whether the plugin is valid.
   */
  static isValid(): boolean {
    return true;
  }

  destroy(): void {
    this._player.removeEventListener(this._player.Event.SOURCE_SELECTED, this._activatePlugin);
  }
}
