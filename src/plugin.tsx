import {
    KalturaClient,
    KalturaClientException,
    KalturaAPIException
} from "kaltura-typescript-client";
import {
    LiveStreamIsLiveAction,
    KalturaPlaybackProtocol
} from "kaltura-typescript-client/api/types";

import {
    ContribConfig,
    OnMediaLoad,
    OnMediaLoadConfig,
    OnMediaUnload,
    OnPluginSetup,
    OnRegisterUI,
    PlayerContribPlugin
} from "@playkit-js-contrib/plugin";
import { UIManager } from "@playkit-js-contrib/ui";
import { KalturaLiveMiddleware } from "./middleware/live-middleware";
import { KalturaLiveEngineDecorator } from "./decorator/live-engine-decorator";
import { getContribLogger } from "@playkit-js-contrib/common";
import { IEngineDecorator } from "./decorator/iEngineDecorator";

const isDev = true; // TODO - should be provided by Omri Katz as part of the cli implementation
const pluginName = `kaltura-live${isDev ? "-local" : ""}`;

const logger = getContribLogger({
    class: "KalturaLivePlugin",
    module: "kaltura-live-plugin"
});

export class KalturaLivePlugin extends PlayerContribPlugin
    implements OnMediaUnload, OnRegisterUI, OnMediaLoad, OnPluginSetup {
    static defaultConfig = {};

    private _kalturaClient = new KalturaClient();

    onPluginSetup(config: ContribConfig): void {
        this._kalturaClient.setOptions({
            clientTag: "playkit-js-kaltura-live",
            endpointUrl: config.server.serviceUrl
        });

        if (this.config.checkLiveWithKs === true) {
            this._kalturaClient.setDefaultRequestOptions({
                ks: config.server.ks
            });
        }
        this.eventManager.listen(
            this.player,
            this.player.Event.SOURCE_SELECTED,
            this._isEntryLiveType
        );
        this._isEntryLiveType();
    }

    onRegisterUI(uiManager: UIManager): void {}

    onMediaLoad(config: OnMediaLoadConfig): void {}

    onMediaUnload(): void {}

    getMiddlewareImpl(): any {
        return new KalturaLiveMiddleware(this);
    }

    getEngineDecorator(engine: any): IEngineDecorator {
        return new KalturaLiveEngineDecorator(engine, this);
    }

    private _isEntryLiveType = () => {
        if (this.player.config.sources.type === this.player.MediaType.LIVE) {
            // this is Live
            this._checkIsLive(this.player.config.sources.id);
        }
    };

    private _checkIsLive = (id: string) => {
        const protocol = KalturaPlaybackProtocol.auto;
        const request = new LiveStreamIsLiveAction({ id, protocol });
        this._kalturaClient.request(request).then(
            () => {
                logger.trace(
                    `Made API call ${this.config.checkLiveWithKs === true ? "with" : "without"} KS`,
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

KalturaPlayer.core.registerPlugin(pluginName, KalturaLivePlugin);
