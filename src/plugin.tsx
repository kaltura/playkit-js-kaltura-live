import { h } from "preact";
import {
    KalturaClient,
    KalturaClientException,
    KalturaAPIException
} from "kaltura-typescript-client";
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
import { UIManager, OverlayManager, OverlayPositions } from "@playkit-js-contrib/ui";
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
    private _overlayManager: OverlayManager | null = null;

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
    }

    onRegisterUI(uiManager: UIManager) {
        this._overlayManager = this._contribServices.overlayManager;
    }

    // implementations methods - todo - implement if necessary
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
        const { playerConfig } = this._configs;
        // TODO S.M.- check if this is a safer way to check if this entry is a live-entry
        // E.G. (this._player as any).isLive();
        // TODO: can we check it with this._player.isLive() ?
        if (playerConfig && playerConfig.sources.type === "Live") {
            this._isLiveEntry = true;
            this.updateLiveStatus();
        }
    };

    private _setLive = () => {
        if (this._overlayItem) {
            this._contribServices.overlayManager.remove(this._overlayItem);
            this._overlayItem = null;
        }
        this._broadcastState = LiveBroadcastStates.Live;
    };

    private _setOffline = () => {
        this._broadcastState = LiveBroadcastStates.Offline;
        if (this._overlayItem) {
            return;
        }
        this._overlayItem = this._contribServices.overlayManager.add({
            label: "offline-overlay",
            position: OverlayPositions.PlayerArea,
            renderContent: () => <Offline />
        });
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

    // The function calls 'isLive' api and then repeats the call every X seconds (10 by default)
    private updateLiveStatus = () => {
        // TODO: should we check isLive till first play happens?
        const { pluginConfig } = this._configs;
        const protocol = KalturaPlaybackProtocol.hls;
        const id = this._player.config.sources.id; // todo - consider do this once on  media load
        const request = new LiveStreamIsLiveAction({ id, protocol });
        this._kalturaClient.request(request).then(
            data => {
                if (data === true) {
                    this._setLive();
                }
                logger.trace(
                    `Made API call ${
                        pluginConfig.checkLiveWithKs === true ? "with" : "without"
                    } KS`,
                    {
                        method: "updateLiveStatus"
                    }
                );
                // re-check isLive on timeout
                this._initTimeout();
            },
            error => {
                if (error instanceof KalturaClientException) {
                    logger.error("Network error etc", {
                        method: "updateLiveStatus",
                        data: {
                            error
                        }
                    });
                } else if (error instanceof KalturaAPIException) {
                    // TODO - remove to the success part once TS client is fixed
                    this._setOffline();
                    logger.error("Api exception", {
                        method: "updateLiveStatus",
                        data: {
                            error
                        }
                    });
                }
                // re-check isLive on timeout
                this._initTimeout();
            }
        );
    };
    // TODO - implement destroy
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
            isLiveInterval: 5
        },
        corePluginFactory(...args: any[]) {
            return new KalturaLiveCorePlugin(...args);
        }
    }
);
