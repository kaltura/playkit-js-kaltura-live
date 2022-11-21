import {h, createRef} from 'preact';
import {KalturaLiveMiddleware} from './middleware/live-middleware';
import {KalturaLiveEngineDecorator} from './decorator/live-decorator';
import {OfflineSlate, OfflineTypes} from './components/offline-slate';
import {LiveTag, LiveTagStates} from './components/live-tag';
import {GetStreamDetailsLoader, KalturaLiveStreamBroadcastStatus} from './providers/get-stream-details-loader';

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

export enum KalturaEntryServerNodeStatus {
  authenticated = 3,
  broadcasting = 2,
  error = -1,
  markedForDeletion = 4,
  playable = 1,
  stopped = 0,
  taskFinished = 9,
  taskPending = 5,
  taskProcessing = 7,
  taskQueued = 6,
  taskUploading = 8
}

// @ts-ignore
export class KalturaLivePlugin extends KalturaPlayer.core.BasePlugin implements IMiddlewareProvider, IEngineDecoratorProvider {
  public player: KalturaPlayerTypes.Player;
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

  static defaultConfig: LivePluginConfig = {
    checkLiveWithKs: false,
    isLiveInterval: 10
  };

  constructor(name: string, player: KalturaPlayerTypes.Player, config: LivePluginConfig) {
    super(name, player, config);
    this.player = player;
    this.eventManager.listen(this.player, this.player.Event.SOURCE_SELECTED, this._activatePlugin);

    this._addLiveTag();
    this._addOfflineSlateToPlayerArea();
  }

  getMiddlewareImpl(): any {
    return new KalturaLiveMiddleware(this);
  }

  getEngineDecorator(engine: any, dispatcher: Function) {
    return new KalturaLiveEngineDecorator(engine, this, dispatcher, this.logger);
  }

  loadMedia(): void {
    this.player.configure({
      network: {
        maxStaleLevelReloads: 19 // more details in https://kaltura.atlassian.net/browse/FEV-1205
      },
      playback: {
        options: {
          html5: {
            hls: {
              levelLoadingMaxRetryTimeout: 750
            },
            native: {
              heartbeatTimeout: 10000
            },
            dash: {
              streaming: {
                jumpLargeGaps: true
              }
            }
          }
        }
      }
    });
  }

  private _activatePlugin = () => {
    this.isMediaLive = this.player.isLive();
    if (this.isMediaLive) {
      this.eventManager.listen(this.player, this.player.Event.FIRST_PLAY, this._handleFirstPlay);
      this.eventManager.listen(this.player, this.player.Event.TIMED_METADATA, this.handleTimedMetadata);
      this.eventManager.listen(this.player, this.player.Event.MEDIA_LOADED, this._handleMediaLoaded);
    }
  };

  private _handleMediaLoaded = () => {
    this.player.configure({
      plugins: {kava: {tamperAnalyticsHandler: this._tamperAnalyticsHandler}}
    });
    this.updateLiveStatus();
  };

  private _addLiveTag = () => {
    this.player.ui.addComponent({
      label: 'kaltura-live-tag',
      presets: ['Live'],
      replaceComponent: 'LiveTag',
      container: 'BottomBarLeftControls',
      get: () => <LiveTag ref={this._liveTag} liveTagState={this._liveTagState} />
    });
  };

  private _addOfflineSlateToPlayerArea = () => {
    this.player.ui.addComponent({
      label: 'no-longer-live-overlay',
      presets: ['Live', 'Playback'],
      container: 'VideoArea',
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

  public handleTimedMetadata = ({payload}: any) => {
    if (!payload || !payload.cues) {
      this._absolutePosition = null;
      return;
    }
    const id3TagCues = payload.cues.filter((cue: any) => cue.value && cue.value.key === 'TEXT');
    if (id3TagCues.length) {
      try {
        this._absolutePosition = JSON.parse(id3TagCues[id3TagCues.length - 1].value.data).timestamp;
      } catch (error) {
        this._absolutePosition = null;
        this.logger.warn('Failed parsing timedmetadata payload cue ', error);
      }
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
    this.player.configure({playback: {autoplay: true}});
    this.player.loadMedia({entryId: this.player.config.sources.id});
  };

  public detachMediaSource = () => {
    this._mediaDetached = true;
    this.player.detachMediaSource();
  };

  private _attachMediaSource = () => {
    this._mediaDetached = false;
    this.player.addEventListener(this.player.Event.CAN_PLAY, this._restoreLiveEdge);
    this.player.attachMediaSource();
    this.player.play();
  };

  private _restoreLiveEdge = () => {
    this.player.seekToLiveEdge();
    this.player.removeEventListener(this.player.Event.CAN_PLAY, this._restoreLiveEdge);
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
    this.logger.info('Received isLive with value: ' + receivedState);
    if (receivedState === LiveBroadcastStates.Error && this.player.paused) {
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
        this.player.dispatchEvent(new (KalturaPlayer.core as any).FakeEvent(this.player.Event.ENDED));
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

  get sidePanelsManager() {
    return this.player.getService('sidePanelsManager') as any;
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
        if (!this.player.isDvr() || this._mediaDetached || this.playerHasError) {
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
    this.sidePanelsManager?.componentsRegistry?.forEach((plugin: any, key: number) => {
      if (plugin.isActive) {
        this.sidePanelsManager.deactivateItem(key);
      }
    });
  }

  // The function calls 'isLive' api and then repeats the call every X seconds (10 by default)
  public updateLiveStatus = () => {
    this.logger.info(`Calling LiveStreamGetDetailsAction ${this.config.checkLiveWithKs ? 'with' : 'without'} KS`);
    const {id} = this.player.config.sources;
    const ks = this.config.checkLiveWithKs ? this.player.config.session?.ks : null;
    if (this._activeRequest) {
      return; // prevent new API call if current is pending
    }
    this._resetTimeout();
    this._activeRequest = true;
    this.player.provider
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
          const {primaryStreamStatus, secondaryStreamStatus, broadcastStatus} = streamDetails;
          this.logger.info(
            `LiveStreamGetDetails received:
              Primary stream: ${primaryStreamStatus};
              Secondary stream: ${secondaryStreamStatus};
              Broadcast Status: ${broadcastStatus};
            `
          );

          const streamPlayable = [primaryStreamStatus, secondaryStreamStatus].some(
            streamStatus => streamStatus === KalturaEntryServerNodeStatus.playable
          );

          const isSimulive = !streamPlayable && broadcastStatus === KalturaLiveStreamBroadcastStatus.live;
          const isSimuliveEnded = isSimulive && this._mediaDetached;

          if (isSimuliveEnded && broadcastStatus === KalturaLiveStreamBroadcastStatus.offline) {
            this._updateLiveTag(LiveTagStates.Offline);
            this.handleLiveStatusReceived(LiveBroadcastStates.Offline);
            return;
          }

          switch (broadcastStatus) {
            case KalturaLiveStreamBroadcastStatus.live:
              this._updateLiveTag(LiveTagStates.Live);
              this.handleLiveStatusReceived(LiveBroadcastStates.Live);
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

  reset(): void {
    this.player.attachMediaSource();
    this._resetTimeout();
    this.isMediaLive = false;
    this.eventManager.unlisten(this.player, this.player.Event.FIRST_PLAY, this._handleFirstPlay);
    this.eventManager.unlisten(this.player, this.player.Event.TIMED_METADATA, this.handleTimedMetadata);
    this.eventManager.unlisten(this.player, this.player.Event.MEDIA_LOADED, this._handleMediaLoaded);
  }

  destroy(): void {
    this.reset();
    this.eventManager.destroy();
  }
}
