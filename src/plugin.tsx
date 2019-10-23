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
import { UIManager } from "@playkit-js-contrib/ui";
import { KalturaLiveMidddleware } from "./middleware/live-middleware";
import { getContribLogger } from "@playkit-js-contrib/common";
import { KalturaLiveEngineDecorator } from "./decorator/live-decorator";
import { IEngineDecoratorProvider } from "./decorator/IEngineDecoratorProvider";

const logger = getContribLogger({
    class: "KalturaLivePlugin",
    module: "kaltura-live-plugin"
});

interface KalturaLivePluginConfig {
    checkLiveWithKs: boolean;
}

export class KalturaLivePlugin implements OnMediaUnload, OnRegisterUI, OnMediaLoad, OnPluginSetup {
    private _kalturaClient = new KalturaClient();
    // represents if the entry type is a live entry
    private _isLiveEntry = false;
    // represents if the entry is in live mode or unknown
    private _isLive: undefined | boolean = undefined;

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

    // implementations methods - todo - implement if necessary
    onPluginSetup(): void {}

    onRegisterUI(uiManager: UIManager): void {}

    onMediaLoad(): void {}

    onMediaUnload(): void {}

    public isLiveEntry(): boolean {
        return this._isLiveEntry;
    }

    // isLive value of last API call
    public isLive(): boolean | undefined {
        return this._isLive;
    }

    private _isEntryLiveType = () => {
        const { playerConfig } = this._configs;
        if (playerConfig && playerConfig.sources.type === "Live") {
            this._isLiveEntry = true;
            this._checkIsLive();
        }
    };

    private _checkIsLive = () => {
        const { pluginConfig } = this._configs;
        const protocol = KalturaPlaybackProtocol.hls;
        const id = this._player.config.sources.id; // todo - consider do this once on  media load
        const request = new LiveStreamIsLiveAction({ id, protocol });
        console.log(">>>> IS LIVE REQUEST");
        this._kalturaClient.request(request).then(
            data => {
                console.log(">>>> IS LIVE RESPONSE !");
                if (data) {
                    this._isLive = data;
                }
                logger.trace(
                    `Made API call ${
                        pluginConfig.checkLiveWithKs === true ? "with" : "without"
                    } KS`,
                    {
                        method: "_checkIsLive"
                    }
                );
            },
            error => {
                if (error instanceof KalturaClientException) {
                    logger.error("Network error etc", {
                        method: "_checkIsLive",
                        data: {
                            error
                        }
                    });
                } else if (error instanceof KalturaAPIException) {
                    logger.error("Api exception", {
                        method: "_checkIsLive",
                        data: {
                            error
                        }
                    });
                }
            }
        );
        // interval - todo handle clear and cancel
        setTimeout(this._checkIsLive, 10000);
    };

    // TODO - implement destroy
}

export class KalturaLiveCorePlugin extends CorePlugin<KalturaLivePlugin>
    implements IEngineDecoratorProvider {
    private _active: boolean = false;
    private _activeCounter: number = 0;

    getMiddlewareImpl(): any {
        return new KalturaLiveMidddleware(this._contribPlugin);
    }
    getEngineDecorator(engine: any): any {
        return new KalturaLiveEngineDecorator(engine, this);
    }
    public active() {
        return this._contribPlugin.isLiveEntry();
    }
}

ContribPluginManager.registerPlugin(
    "kaltura-live",
    (data: ContribPluginData<KalturaLivePluginConfig>) => {
        return new KalturaLivePlugin(data.contribServices, data.configs, data.player);
    },
    {
        defaultConfig: {
            checkLiveWithKs: false
        },
        corePluginFactory(...args: any[]) {
            return new KalturaLiveCorePlugin(...args);
        }
    }
);
