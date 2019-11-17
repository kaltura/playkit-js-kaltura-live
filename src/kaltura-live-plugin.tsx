import { h } from "preact";
import { KalturaClient } from "kaltura-typescript-client";
import { KalturaPlaybackProtocol } from "kaltura-typescript-client/api/types/KalturaPlaybackProtocol";
import { LiveStreamIsLiveAction } from "kaltura-typescript-client/api/types/LiveStreamIsLiveAction";

import {
    ContribPluginConfigs,
    ContribPluginData,
    ContribPluginManager,
    ContribServices,
    CorePlugin,
    OnMediaLoad,
    OnMediaUnload,
    OnPluginSetup
} from "@playkit-js-contrib/plugin";
import { OverlayPositions } from "@playkit-js-contrib/ui";
import { KalturaLiveMiddleware } from "./middleware/live-middleware";
import { getContribLogger } from "@playkit-js-contrib/common";
import { KalturaLiveEngineDecorator } from "./decorator/live-decorator";
import { OverlayItem } from "@playkit-js-contrib/ui";
import { Offline } from "./components/offline";
import { NoLongerLive } from "./components/no-longer-live";

const logger = getContribLogger({
    class: "KalturaLivePlugin",
    module: "kaltura-live-plugin"
});

interface KalturaLivePluginConfig {
    checkLiveWithKs: boolean;
    isLiveInterval: number;
}

export enum LiveBroadcastStates {
    Unknown = "Unknown",
    Live = "Live",
    Offline = "Offline"
}

export enum OverlayItemTypes {
    None = "None",
    Offline = "Offline",
    NoLongerLive = "NoLongerLive"
}

export class KalturaLivePlugin implements OnMediaUnload, OnMediaLoad, OnPluginSetup {
    private _kalturaClient = new KalturaClient();
    private _isLiveEntry = false;
    private _broadcastState: LiveBroadcastStates = LiveBroadcastStates.Unknown;
    private _wasPlayed: boolean = false;
    private _httpError: boolean = false;
    private _isLiveApiCallTimeout: any = null;
    private _currentOverlay: OverlayItem | null = null;
    private _currentOverlayType: OverlayItemTypes = OverlayItemTypes.None;

    constructor(
        private _contribServices: ContribServices,
        private _configs: ContribPluginConfigs<KalturaLivePluginConfig>,
        private _player: KalturaPlayerTypes.Player
    ) {
        const { playerConfig, pluginConfig } = this._configs;
        this._kalturaClient.setOptions({
            clientTag: "playkit-js-kaltura-live",
            endpointUrl: playerConfig.provider.env.serviceUrl
        });
        if (pluginConfig.checkLiveWithKs === true) {
            this._kalturaClient.setDefaultRequestOptions({
                ks: playerConfig.provider.ks
            });
        }
        this._player.addEventListener(this._player.Event.SOURCE_SELECTED, this._isEntryLiveType);
    }

    onPluginSetup(): void {}

    onMediaLoad(): void {}

    onMediaUnload(): void {
        this._resetTimeout();
        this._player.removeEventListener(this._player.Event.ENDED, this._handleOnEnd);
    }

    public isLiveEntry(): boolean {
        return this._isLiveEntry;
    }

    public get player() {
        return this._player;
    }

    public get broadcastState(): LiveBroadcastStates {
        return this._broadcastState;
    }

    private _isEntryLiveType = () => {
        this._player.removeEventListener(this._player.Event.SOURCE_SELECTED, this._isEntryLiveType);
        if (this._player.isLive()) {
            this._isLiveEntry = true;
            this._player.addEventListener(this._player.Event.ENDED, this._handleOnEnd);
            this._player.addEventListener(this._player.Event.FIRST_PLAY, this._handleFirstPlay);
            this.updateLiveStatus();
        }
    };

    private _handleFirstPlay = () => {
        this._wasPlayed = true;
    };

    // use this method so that engine-decorator can notify the plugin of an error
    public handleHttpError() {
        this._httpError = true;
        logger.info("got httpError - adding network-error slate", {
            method: "handleHttpError"
        });
        // TODO: Temporary added offlineSlate, here should be added new slate about network issue
        this._manageOfflineSlate(OverlayItemTypes.Offline);
    }

    // private _seektoLiveEdge = () => {
    //     this._player.removeEventListener(this._player.Event.PLAYING, this._seektoLiveEdge);
    //     this._player.seekToLiveEdge();
    // };

    private _reloadVideo = () => {
        // TODO - fix once FEC-9488 implemented by core team
        this._player._detachMediaSource();
        this._player._attachMediaSource();
        // if (seekToLiveEdge) {
        //     // not using this now - but will probably use in future
        //     this._player.addEventListener(this._player.Event.PLAYING, this._seektoLiveEdge);
        // }
        this._player.play();
        // TODO - open a story with autoplay=false issue
        // if (!this.player.config.playback.autoplay) {
        // handle autoplay=false
        // }
    };

    private _resetTimeout = () => {
        clearTimeout(this._isLiveApiCallTimeout);
        this._isLiveApiCallTimeout = null;
    };

    private _initTimeout = () => {
        const { pluginConfig } = this._configs;
        this._isLiveApiCallTimeout = setTimeout(
            this.updateLiveStatus,
            pluginConfig.isLiveInterval * 1000
        );
    };

    // once reached ended - check status and react accordingly
    private _handleOnEnd = () => {
        if (this._httpError) {
            this._manageOfflineSlate(OverlayItemTypes.Offline);
            logger.warn("Kaltura player triggered http error ! non-recoverable", {
                method: "_handleOnEnd"
            });
            return;
        }
        if (this._broadcastState === LiveBroadcastStates.Live) {
            // we reached the end of video but stream went back online meanwhile - reset player
            // this gets the player back to the current position and does not seek to liveEdge
            logger.info("DVR entry reached end while last isLive is true. Reload the video", {
                method: "_handleOnEnd"
            });
            this._reloadVideo();
            return;
        }
        if (this._player.isDvr()) {
            this._manageOfflineSlate(OverlayItemTypes.NoLongerLive);
            logger.info("DVR entry reached end - show offline slate with replay button", {
                method: "_handleOnEnd"
            });
            return;
        }
        this._manageOfflineSlate(OverlayItemTypes.Offline);
        logger.info("No DVR entry reached end - show offline slate", {
            method: "_handleOnEnd"
        });
    };

    // this functions is called whenever isLive receives any value.
    // This is where the magic happens
    private handleLiveStatusReceived(receivedState: LiveBroadcastStates) {
        this._broadcastState = receivedState;
        const hasDVR = this._player.isDvr();
        const ended = this.player.ended;
        logger.info("received isLive with value: " + receivedState, {
            method: "handleLiveStatusReceived",
            data: {
                hasDVR: hasDVR,
                wasPlayed: this._wasPlayed,
                ended: ended
            }
        });

        if (!this._wasPlayed && receivedState === LiveBroadcastStates.Offline) {
            this._manageOfflineSlate(OverlayItemTypes.Offline);
            logger.info("Offline before first play - show offline slate ", {
                method: "handleLiveStatusReceived"
            });
            return;
        }

        if (receivedState === LiveBroadcastStates.Live) {
            // Live. Remove slate
            this._manageOfflineSlate(OverlayItemTypes.None);
            if (ended) {
                // we are online and player is ended - reset player engine
                // this resumes from latest position - it does not go back to liveEdge !
                logger.info("Video ended and isLive is true. Reset player engine", {
                    method: "handleLiveStatusReceived"
                });
                this._reloadVideo();
            }
        }
    }

    private _handleReplayClick = () => {
        this._manageOfflineSlate(OverlayItemTypes.None);
        this._player.play();
    };

    private _manageOfflineSlate(type: OverlayItemTypes) {
        logger.info("Show offline slate", {
            method: "_manageOfflineSlate"
        });

        if (type === this._currentOverlayType) {
            return;
        }

        if (this._currentOverlay) {
            this._contribServices.overlayManager.remove(this._currentOverlay);
            this._currentOverlay = null;
        }
        this._currentOverlayType = type;
        switch (type) {
            case OverlayItemTypes.NoLongerLive:
                this._currentOverlay = this._contribServices.overlayManager.add({
                    label: "no-longer-live-overlay",
                    position: OverlayPositions.PlayerArea,
                    renderContent: () => <NoLongerLive onClick={this._handleReplayClick} />
                });
                break;
            case OverlayItemTypes.Offline:
                this._currentOverlay = this._contribServices.overlayManager.add({
                    label: "offline-overlay",
                    position: OverlayPositions.PlayerArea,
                    renderContent: () => <Offline />
                });
                break;
            case OverlayItemTypes.None:
            default:
                this._currentOverlay = null;
                break;
        }
    }

    // The function calls 'isLive' api and then repeats the call every X seconds (10 by default)
    private updateLiveStatus = () => {
        const { pluginConfig } = this._configs;
        const protocol = KalturaPlaybackProtocol.hls;
        const { id } = this._player.config.sources;
        const request = new LiveStreamIsLiveAction({ id, protocol });
        logger.info(
            `Calling isLive ${pluginConfig.checkLiveWithKs === true ? "with" : "without"} KS`,
            {
                method: "updateLiveStatus"
            }
        );
        this._kalturaClient.request(request).then(
            data => {
                if (data === true) {
                    this.handleLiveStatusReceived(LiveBroadcastStates.Live);
                } else if (data === false) {
                    this.handleLiveStatusReceived(LiveBroadcastStates.Offline);
                }
                // re-check isLive on timeout
                this._initTimeout();
            },
            error => {
                logger.error("Failed to call isLive API", {
                    method: "updateLiveStatus",
                    data: {
                        error
                    }
                });
                this.handleLiveStatusReceived(LiveBroadcastStates.Offline);
                // re-check isLive on timeout
                this._initTimeout();
            }
        );
    };
}

export class KalturaLiveCorePlugin extends CorePlugin<KalturaLivePlugin>
    implements KalturaPlayerTypes.IEngineDecoratorProvider {
    getMiddlewareImpl(): any {
        return new KalturaLiveMiddleware(this._contribPlugin);
    }
    getEngineDecorator(engine: any): any {
        return new KalturaLiveEngineDecorator(engine, this._contribPlugin);
    }
}

ContribPluginManager.registerPlugin(
    "kaltura-live",
    (data: ContribPluginData<KalturaLivePluginConfig>) => {
        return new KalturaLivePlugin(data.contribServices, data.configs, data.player);
    },
    {
        defaultConfig: {
            checkLiveWithKs: false,
            isLiveInterval: 10
        },
        corePluginFactory(...args: any[]) {
            return new KalturaLiveCorePlugin(...args);
        }
    }
);
