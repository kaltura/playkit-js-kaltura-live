import { h, createRef } from 'preact';
import { KalturaClient } from 'kaltura-typescript-client';
import { LiveStreamGetDetailsAction } from 'kaltura-typescript-client/api/types/LiveStreamGetDetailsAction';
import {
  ContribPluginConfigs,
  ContribPluginData,
  ContribPluginManager,
  CorePlugin,
  OnMediaLoad,
  OnMediaUnload,
  OnPluginSetup,
} from '@playkit-js-contrib/plugin';
import { ReservedPresetAreas } from '@playkit-js-contrib/ui';
import { KalturaLiveMiddleware } from './middleware/live-middleware';
import { getContribLogger } from '@playkit-js-contrib/common';
import { OfflineSlate, OfflineTypes } from './components/offline-slate';
import { LiveTag, LiveTagStates } from './components/live-tag';
import { KalturaLiveStreamBroadcastStatus } from 'kaltura-typescript-client/api/types/KalturaLiveStreamBroadcastStatus';

const logger = getContribLogger({
  class: 'KalturaLivePlugin',
  module: 'kaltura-live-plugin',
});

interface KalturaLivePluginConfig {
  checkLiveWithKs: boolean;
  isLiveInterval: number;
}

export enum LiveBroadcastStates {
  Unknown = 'Unknown',
  Error = 'Error',
  Live = 'Live',
  Offline = 'Offline',
}

export class KalturaLivePlugin implements OnMediaUnload, OnMediaLoad {
  private _kalturaClient = new KalturaClient();
  private _isActive = false;
  private _broadcastState: LiveBroadcastStates = LiveBroadcastStates.Unknown;
  private _wasPlayed = false;
  private _absolutePosition = null;
  private _isLiveApiCallTimeout: any = null;
  private _activeRequest = false;
  private _needReloadMedia = false;
  private _liveTagState: LiveTagStates = LiveTagStates.Offline;
  private _removeNoLongerLiveSlate: Function | null = null;

  private _liveTag = createRef<LiveTag>();
  private _offlineSlate = createRef<OfflineSlate>();

  constructor(
    private _configs: ContribPluginConfigs<KalturaLivePluginConfig>,
    private _player: any
  ) {
    const { playerConfig, pluginConfig } = this._configs;
    this._kalturaClient.setOptions({
      clientTag: 'playkit-js-kaltura-live',
      endpointUrl: playerConfig.provider.env.serviceUrl,
    });
    if (pluginConfig.checkLiveWithKs) {
      this._kalturaClient.setDefaultRequestOptions({
        ks: playerConfig.provider.ks,
      });
    }

    this._addLiveTag();
    this._addOfflineSlateToErrorOverlay();
  }

  onMediaLoad(): void {
    if (this._player.isLive()) {
      this._isActive = true;
      this._player.configure({
        plugins: {
          kava: { tamperAnalyticsHandler: this._tamperAnalyticsHandler },
        },
      });
      // add listeners
      this._player.addEventListener(
        this._player.Event.FIRST_PLAY,
        this._handleFirstPlay
      );
      this._player.addEventListener(
        this._player.Event.TIMED_METADATA,
        this.handleTimedMetadata
      );
      this._player.addEventListener(this._player.Event.ENDED, this._handleEnd);
      this._player.addEventListener(
        this._player.Event.ABORT,
        this.updateLiveStatus
      );
      this.updateLiveStatus();
    }
  }

  onMediaUnload(): void {
    this._isActive = false;
    this._resetTimeout();
    this._player.removeEventListener(
      this._player.Event.FIRST_PLAY,
      this._handleFirstPlay
    );
    this._player.removeEventListener(
      this._player.Event.TIMED_METADATA,
      this.handleTimedMetadata
    );
    this._player.removeEventListener(this._player.Event.ENDED, this._handleEnd);
    this._player.removeEventListener(
      this._player.Event.ABORT,
      this.updateLiveStatus
    );
  }

  private _addLiveTag = () => {
    this._player.ui.addComponent({
      label: 'kaltura-live-tag',
      presets: ['Live'],
      replaceComponent: 'LiveTag',
      container: ReservedPresetAreas.BottomBarLeftControls,
      get: () => (
        <LiveTag ref={this._liveTag} liveTagState={this._liveTagState} />
      ),
    });
  };

  private _addOfflineSlateToErrorOverlay = () => {
    this._player.ui.addComponent({
      label: 'offline-overlay',
      presets: ['Error'],
      container: 'GuiArea',
      replaceComponent: 'ErrorOverlay',
      get: () => {
        this._needReloadMedia = true;
        this.updateLiveStatus();
        return <OfflineSlate ref={this._offlineSlate} />;
      },
    });
  };

  private _addOfflineSlateToPlayerArea = () => {
    this._needReloadMedia = true;
    this._removeNoLongerLiveSlate = this._player.ui.addComponent({
      label: 'no-longer-live-overlay',
      presets: ['Live'],
      container: 'PlayerArea',
      get: () => {
        return (
          <OfflineSlate
            ref={this._offlineSlate}
            type={OfflineTypes.NoLongerLive}
          />
        );
      },
    });
  };

  private _handleEnd = () => {
    if (this._removeNoLongerLiveSlate) {
      return;
    }
    this.updateLiveStatus();
    this._addOfflineSlateToPlayerArea();
  };

  private _updateLiveTag = (state: LiveTagStates) => {
    this._liveTagState = state;
    this._liveTag?.current?.updateLiveTagState(state);
  };

  private _updateOfflineSlate = (type: OfflineTypes) => {
    this._needReloadMedia = true;
    this._offlineSlate?.current?.manageOfflineSlate(type);
    this._initTimeout();
  };

  public isActive(): boolean {
    return this._isActive;
  }

  public get broadcastState(): LiveBroadcastStates {
    return this._broadcastState;
  }

  public handleTimedMetadata = (e: any) => {
    if (!e || !e.payload || !e.payload.cues || !e.payload.cues.length) {
      this._absolutePosition = null;
      return;
    }
    try {
      this._absolutePosition = JSON.parse(
        e.payload.cues[e.payload.cues.length - 1].value.data
      ).timestamp;
    } catch (error) {
      this._absolutePosition = null;
      logger.warn('Failed parsing timedmetadata payload cue ' + error, {
        method: '_timedmetadataReceived ',
        data: e.payload,
      });
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

  private _reloadMedia = () => {
    // remove NoLongerLive slate if it exists
    if (this._removeNoLongerLiveSlate) {
      this._removeNoLongerLiveSlate();
      this._removeNoLongerLiveSlate = null;
    }
    this._needReloadMedia = false;
    const player: any = KalturaPlayer.getPlayer(this._player.config.targetId);
    const entryId = this._player.config.sources.id;
    player?.configure({ playback: { autoplay: true } });
    player?.loadMedia({ entryId });
  };

  private _resetTimeout = () => {
    if (this._isLiveApiCallTimeout) {
      clearTimeout(this._isLiveApiCallTimeout);
      this._isLiveApiCallTimeout = null;
    }
  };

  private _initTimeout = () => {
    const { pluginConfig } = this._configs;
    this._resetTimeout();
    this._isLiveApiCallTimeout = setTimeout(
      this.updateLiveStatus,
      pluginConfig.isLiveInterval * 1000
    );
  };

  // this functions is called whenever isLive receives any value.
  // This is where the magic happens
  private handleLiveStatusReceived(receivedState: LiveBroadcastStates) {
    this._broadcastState = receivedState;

    logger.info('Received isLive with value: ' + receivedState, {
      method: 'handleLiveStatusReceived',
      data: {
        wasPlayed: this._wasPlayed,
        ended: this._player.ended,
      },
    });

    if (receivedState === LiveBroadcastStates.Error) {
      this._updateOfflineSlate(OfflineTypes.HttpError);
      return;
    }

    if (!this._wasPlayed && receivedState === LiveBroadcastStates.Offline) {
      this._updateOfflineSlate(OfflineTypes.Offline);
      logger.info('Offline before first play - show offline slate ', {
        method: 'handleLiveStatusReceived',
      });
      return;
    }

    if (receivedState === LiveBroadcastStates.Live) {
      if (this._needReloadMedia) {
        // if playback ended OR player got "abort" event
        logger.info('Video ended and isLive is true. Reset player engine', {
          method: 'handleLiveStatusReceived',
        });
        this._reloadMedia();
      }
      return;
    }

    if (receivedState === LiveBroadcastStates.Offline) {
      this._updateOfflineSlate(OfflineTypes.NoLongerLive);
      logger.info(
        'Received isLive false after ended - show no longer live slate',
        {
          method: 'handleLiveStatusReceived',
        }
      );
    }
  }

  // The function calls 'isLive' api and then repeats the call every X seconds (10 by default)
  public updateLiveStatus = () => {
    const { pluginConfig } = this._configs;
    const { id } = this._player.config.sources;
    const request = new LiveStreamGetDetailsAction({ id });

    logger.info(
      `Calling LiveStreamGetDetailsAction ${
        pluginConfig.checkLiveWithKs ? 'with' : 'without'
      } KS`,
      {
        method: 'updateLiveStatus',
      }
    );
    if (this._activeRequest) {
      return; // prevent new API call if current is pending
    }
    this._resetTimeout();
    this._activeRequest = true;
    this._kalturaClient.request(request).then(
      data => {
        this._activeRequest = false;
        if (!data || !data.broadcastStatus) {
          // bad response
          this._initTimeout();
          return;
        }
        logger.info(
          'LiveStreamGetDetails received. data.broadcastStatus ' +
            data.broadcastStatus,
          {
            method: 'updateLiveStatus',
            data: {
              data,
            },
          }
        );

        if (data.broadcastStatus === KalturaLiveStreamBroadcastStatus.live) {
          if (pluginConfig.checkLiveWithKs) {
            // continue poll broadcast status data to define if live mode changed to preview mode
            this._initTimeout();
          }
          this._updateLiveTag(LiveTagStates.Live);
          this.handleLiveStatusReceived(LiveBroadcastStates.Live);
          return;
        }

        this._initTimeout();

        if (data.broadcastStatus === KalturaLiveStreamBroadcastStatus.offline) {
          this._updateLiveTag(LiveTagStates.Offline);
          this.handleLiveStatusReceived(LiveBroadcastStates.Offline);
          return;
        }
        if (data.broadcastStatus === KalturaLiveStreamBroadcastStatus.preview) {
          if (pluginConfig.checkLiveWithKs) {
            this._updateLiveTag(LiveTagStates.Preview);
            this.handleLiveStatusReceived(LiveBroadcastStates.Live);
          } else {
            this._updateLiveTag(LiveTagStates.Offline);
            this.handleLiveStatusReceived(LiveBroadcastStates.Offline);
          }
        }
      },
      error => {
        this._activeRequest = false;
        this._updateLiveTag(LiveTagStates.Offline);
        this.handleLiveStatusReceived(LiveBroadcastStates.Error);
        logger.error('Failed to call isLive API', {
          method: 'updateLiveStatus',
          data: {
            error,
          },
        });
        this._initTimeout();
      }
    );
  };
}

export class KalturaLiveCorePlugin extends CorePlugin<KalturaLivePlugin> {
  getMiddlewareImpl(): any {
    return new KalturaLiveMiddleware(this._contribPlugin);
  }
}

ContribPluginManager.registerPlugin(
  'kaltura-live',
  (data: ContribPluginData<KalturaLivePluginConfig>) => {
    return new KalturaLivePlugin(data.configs, data.player);
  },
  {
    defaultConfig: {
      checkLiveWithKs: false,
      isLiveInterval: 10,
    },
    corePluginFactory(...args: any[]) {
      return new KalturaLiveCorePlugin(...args);
    },
  }
);
