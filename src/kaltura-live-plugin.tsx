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
    Offline = "offline-overlay",
    NoLongerLive = "no-longer-live-overlay"
}

export class KalturaLivePlugin implements OnMediaUnload, OnMediaLoad, OnPluginSetup {
    private _kalturaClient = new KalturaClient();
    private _isLiveEntry = false;
    private _broadcastState: LiveBroadcastStates = LiveBroadcastStates.Unknown;
    private _wasPlayed: boolean = false;
    private _isLiveApiCallTimeout: any = null;
    private _overlayItems: Record<OverlayItemTypes, OverlayItem | null> = {
        [OverlayItemTypes.Offline]: null,
        [OverlayItemTypes.NoLongerLive]: null
    };

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
        this._player.addEventListener(this._player.Event.FIRST_PLAY, this._handleFirstPlay);
        // this._player.addEventListener(this._player.Event.UI.USER_CLICKED_LIVE_TAG, this._handleClickOnLiveTag);
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
        if (this._player.isLive()) {
            this._isLiveEntry = true;
            this._player.addEventListener(this._player.Event.ENDED, this._handleOnEnd);
            this.updateLiveStatus();
        }
    };

    private _handleFirstPlay = () => {
        this._wasPlayed = true;
    };

    // use this method so that engine-decorator can notify the plugin of an error
    public handleHttpError() {
        logger.info("got httpError - adding network-error slate", {
            method: "handleHttpError"
        });
        // TODO: Temporary added offlineSlate, here should be added new slate about network issue
        this._addOfflineSlate();
    }

    private _seektoLiveEdge = () => {
        this._player.removeEventListener(this._player.Event.PLAYING, this._seektoLiveEdge);
        this._player.seekToLiveEdge();
    };

    private _reloadVideo = (seekToLiveEdge: boolean = false) => {
        // TODO - fix once FEC-9488 implemented by core team
        this._player._detachMediaSource();
        this._player._attachMediaSource();
        if (seekToLiveEdge) {
            // not using this now - but will probably use in future
            this._player.addEventListener(this._player.Event.PLAYING, this._seektoLiveEdge);
        }
        this._player.play();
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
            this._addNoLongerLiveSlate();
            logger.info("DVR entry reached end", {
                method: "_handleOnEnd"
            });
            return;
        }
        this._addOfflineSlate();
        logger.info("No DVR entry reached end", {
            method: "_handleOnEnd"
        });
    };

    // this functions is called whenever isLive receives any value.
    // This is where the magic happens
    private handleLiveStatusReceived(receivedState: LiveBroadcastStates) {
        const hasDVR = this._player.isDvr();
        const ended = this.player.ended;
        this._broadcastState = receivedState;
        logger.info("isLive with value: " + receivedState, {
            method: "handleLiveStatusReceived",
            data: {
                hasDVR: hasDVR,
                wasPlayed: this._wasPlayed,
                ended: ended
            }
        });

        if (
            receivedState === LiveBroadcastStates.Offline &&
            ((ended && !hasDVR) || !this._wasPlayed)
        ) {
            this._addOfflineSlate();
            logger.info("Showing offline slate ", {
                method: "handleLiveStatusReceived"
            });
            return;
        }

        if (receivedState === LiveBroadcastStates.Live) {
            // Live. Remove slate
            this._removeSlates();
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

    private _handleClickOnLiveTag() {
        if (this._broadcastState === LiveBroadcastStates.Offline) {
            this._addNoLongerLiveSlate();
            this._player.pause();
        }
    }

    private _handleReplayClick = () => {
        this._removeSlates();
        this._player.play();
    };

    private _removeSlates() {
        if (this._overlayItems[OverlayItemTypes.Offline]) {
            this._contribServices.overlayManager.remove(this._overlayItems[
                OverlayItemTypes.Offline
            ] as OverlayItem);
            this._overlayItems[OverlayItemTypes.Offline] = null;
        }
        if (this._overlayItems[OverlayItemTypes.NoLongerLive]) {
            this._contribServices.overlayManager.remove(this._overlayItems[
                OverlayItemTypes.NoLongerLive
            ] as OverlayItem);
            this._overlayItems[OverlayItemTypes.NoLongerLive] = null;
        }
    }

    private _addOfflineSlate() {
        if (this._overlayItems[OverlayItemTypes.Offline] || !this._isLiveEntry) {
            return;
        }
        this._overlayItems[OverlayItemTypes.Offline] = this._contribServices.overlayManager.add({
            label: OverlayItemTypes.Offline,
            position: OverlayPositions.PlayerArea,
            renderContent: () => <Offline />
        });
        logger.info("Show offline slate", {
            method: "_addOfflineSlate"
        });
    }

    private _addNoLongerLiveSlate() {
        if (this._overlayItems[OverlayItemTypes.NoLongerLive] || !this._isLiveEntry) {
            return;
        }
        this._overlayItems[
            OverlayItemTypes.NoLongerLive
        ] = this._contribServices.overlayManager.add({
            label: OverlayItemTypes.NoLongerLive,
            position: OverlayPositions.PlayerArea,
            renderContent: () => <NoLongerLive onClick={this._handleReplayClick} />
        });
        logger.info("Show NoLongerLiveSlate slate", {
            method: "_addNoLongerLiveSlate"
        });
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
