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
    OnPluginSetup,
    OnRegisterUI
} from "@playkit-js-contrib/plugin";
import { OverlayPositions } from "@playkit-js-contrib/ui";
import { KalturaLiveMiddleware } from "./middleware/live-middleware";
import { getContribLogger } from "@playkit-js-contrib/common";
import { KalturaLiveEngineDecorator } from "./decorator/live-decorator";
import { Offline } from "./components/offline";
import { OverlayItem } from "@playkit-js-contrib/ui";

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

export class KalturaLivePlugin implements OnMediaUnload, OnRegisterUI, OnMediaLoad, OnPluginSetup {
    private _kalturaClient = new KalturaClient();
    // represents if the entry type is a live entry
    private _isLiveEntry = false;
    // represents if the entry is in live mode or unknown
    private _broadcastState: LiveBroadcastStates = LiveBroadcastStates.Unknown;

    private _isLiveApiCallTimeout: any = null;
    private _overlayItem: OverlayItem | null = null;

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
        // once we have the source we can tell if this is a live entry
        this._player.addEventListener(this._player.Event.SOURCE_SELECTED, this._isEntryLiveType);
        this._player.addEventListener(this._player.Event.FIRST_PLAY, this._handleFirstPlay);
        // handle end of the video
        this._player.addEventListener(this._player.Event.ENDED, this._handleOnEnd);
    }

    onRegisterUI(): void {
        this._contribServices.overlayManager;
    }

    onPluginSetup(): void {}

    onMediaLoad(): void {}

    onMediaUnload(): void {
        this._resetTimeout();
    }

    public isLiveEntry(): boolean {
        return this._isLiveEntry;
    }

    public get player() {
        return this._player;
    }

    // value of last 'isLive' API call
    public get broadcastState(): LiveBroadcastStates {
        return this._broadcastState;
    }

    private _isEntryLiveType = () => {
        if (this._player.isLive()) {
            this._isLiveEntry = true;
            this.updateLiveStatus();
        }
    };

    // TODO - check with player if player.firstPlay is valid to use as it looks like flipped logic
    private _firstPlay: boolean = false;
    private _handleFirstPlay = () => {
        this._firstPlay = true;
    };

    // use this method so that engine-decorator can notify the plugin of an error
    private _httpError: boolean = false;

    public handleHttpError() {
        this._httpError = true;
    }

    private _seekedtoLiveEdge = () => {
        // todo TS and add contrib type
        (this._player as any).seekToLiveEdge();
        this._player.removeEventListener(this._player.Event.PLAYING, this._seekedtoLiveEdge);
    };

    private _reloadVideo = (seekToLiveEdge: boolean = false) => {
        // TODO - fix once FEC-9488 implemented by core team
        this._player._detachMediaSource();
        this._player._attachMediaSource();
        if (seekToLiveEdge) {
            // not using this now - but will probably use in future
            this._player.addEventListener(this._player.Event.PLAYING, this._seekedtoLiveEdge);
        }
        this._player.play();
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
        // todo - TS and add isDvr to contrib types
        if (!(this._player as any).isDvr()) {
            // no DVR - show offline slate - TODO - test!!!
            this._addSlate();
            logger.info("No DVR entry reached end", {
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
        }
    };

    // this functions is called whenever isLive receives any value.
    // This is where the magic happens
    private handleLiveStatusReceived(receivedState: LiveBroadcastStates) {
        const hasDVR = (this._player as any).isDvr(); // TODO - TS and contrib types
        const ended = (this.player as any).ended;
        const firstPlay = this._firstPlay;
        this._broadcastState = receivedState;
        logger.info("Got a new isLive results with value " + receivedState, {
            method: "handleLiveStatusReceived",
            data: {
                hasDVR: hasDVR,
                firstPlay: firstPlay,
                ended: ended
            }
        });

        // Note1 - while DVR playback - even after playback ended - we get false on player.ended
        // Note2 - (this.player as any)._firstPlay = true means that player had not played yet - this is confusing. We will use our own flag

        if (receivedState === LiveBroadcastStates.Offline) {
            // offline before firstPlay, or offline on video-end with no DVR - show offline slate

            if ((ended && !hasDVR) || !firstPlay) {
                this._addSlate();
            }
            logger.info("Showing offline slate ", {
                method: "handleLiveStatusReceived"
            });
            return;
        }

        if (receivedState === LiveBroadcastStates.Live) {
            // Live. Remove slate
            if (this._overlayItem) {
                this._contribServices.overlayManager.remove(this._overlayItem);
                this._overlayItem = null;
                return;
            }
            if (ended) {
                // we are online and player is ended - reset player engine
                // this resumes from latest position - it does not go back to liveEdge !
                logger.info("Video ended and isLive is true. Reset player engine", {
                    method: "handleLiveStatusReceived"
                });
                this._reloadVideo();
            }
            if (this._httpError) {
                logger.info("httpError", {
                    method: "handleLiveStatusReceived"
                });
                // Dead end. reset video does not help here. v2 is not recovering from such error either.
                // consider showing an error slate for the user - or not block the natural player error (phase2)
                // or work with KMS to reload entire player (consult product)
                // this._httpError = false;
                // location.reload();
            }
        }
    }

    private _addSlate() {
        this._overlayItem = this._contribServices.overlayManager.add({
            label: "offline-overlay",
            position: OverlayPositions.PlayerArea,
            renderContent: () => <Offline />
        });
        logger.info("Show offline slate", {
            method: "_addSlate"
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
