import {
    KalturaClient,
    KalturaClientException,
    KalturaAPIException
} from "kaltura-typescript-client";
import { KalturaPlaybackProtocol } from "kaltura-typescript-client/api/types/KalturaPlaybackProtocol";
import { LiveStreamIsLiveAction } from "kaltura-typescript-client/api/types/LiveStreamIsLiveAction";

import {
    ContribConfig,
    ContribPluginData,
    ContribPluginManager,
    ContribServices,
    CorePlugin,
    OnMediaLoad,
    OnMediaLoadConfig,
    OnMediaUnload,
    OnPluginSetup,
    OnRegisterUI
} from "@playkit-js-contrib/plugin";
import { UIManager } from "@playkit-js-contrib/ui";
import { KalturaLiveMidddleware } from "./middleware/live-middleware";
import { getContribLogger } from "@playkit-js-contrib/common";

const logger = getContribLogger({
    class: "KalturaLivePlugin",
    module: "kaltura-live-plugin"
});

export class KalturaLivePlugin implements OnMediaUnload, OnRegisterUI, OnMediaLoad, OnPluginSetup {
    private _kalturaClient = new KalturaClient();

    constructor(private _corePlugin: CorePlugin, private _contribServices: ContribServices) {}

    onPluginSetup(config: ContribConfig): void {
        this._kalturaClient.setOptions({
            clientTag: "playkit-js-kaltura-live",
            endpointUrl: config.server.serviceUrl
        });

        if (this._corePlugin.config.checkLiveWithKs === true) {
            this._kalturaClient.setDefaultRequestOptions({
                ks: config.server.ks
            });
        }
        this._corePlugin.player.addEventListener(
            this._corePlugin.player.Event.SOURCE_SELECTED,
            this._isEntryLiveType
        );
        this._isEntryLiveType();
    }

    onRegisterUI(uiManager: UIManager): void {}

    onMediaLoad(config: OnMediaLoadConfig): void {}

    onMediaUnload(): void {}

    getMiddlewareImpl(): any {
        return new KalturaLiveMidddleware(this);
    }

    private _isEntryLiveType = () => {
        const config = this._contribServices.getContribConfig();
        // TODO serhii please update the contrib this._contribServices.getContribConfig() with relevant information

        // if (config.sources && config.sources.type === this._corePlugin.player.MediaType.LIVE) {
        //     // this is Live
        //     this._checkIsLive(use here the config object);
        // }
    };

    private _checkIsLive = (id: string) => {
        const protocol = KalturaPlaybackProtocol.auto;
        const request = new LiveStreamIsLiveAction({ id, protocol });
        this._kalturaClient.request(request).then(
            () => {
                logger.trace(
                    `Made API call ${
                        this._corePlugin.config.checkLiveWithKs === true ? "with" : "without"
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
    };
}

ContribPluginManager.registerPlugin(
    "kaltura-live",
    (data: ContribPluginData) => {
        return new KalturaLivePlugin(data.corePlugin, data.contribServices);
    },
    {
        defaultConfig: {}
    }
);
