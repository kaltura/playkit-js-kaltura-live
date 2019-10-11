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
import { KalturaLiveMidddleware } from "./middleware/live-middleware";

const isDev = true; // TODO - should be provided by Omri Katz as part of the cli implementation
const pluginName = `kaltura-live${isDev ? "-local" : ""}`;

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
        this.eventManager.listen(this.player, this.player.Event.SOURCE_SELECTED, this.checkIsLive);
        this.checkIsLive();
    }

    onRegisterUI(uiManager: UIManager): void {}

    onMediaLoad(config: OnMediaLoadConfig): void {}

    onMediaUnload(): void {}

    getMiddlewareImpl(): any {
        return new KalturaLiveMidddleware(this);
    }

    public checkIsLive = () => {
        if (this.player.config.sources.type === this.player.MediaType.LIVE) {
            // this is Live
            this.makeIsLiveApiCall(this.player.config.sources.id);
        } else {
            // this is VOD
            console.log("I am VOD entry", this.player.config.sources);
        }
    };

    public makeIsLiveApiCall = (id: string) => {
        const protocol = KalturaPlaybackProtocol.auto;
        const request = new LiveStreamIsLiveAction({ id, protocol });
        this._kalturaClient.request(request).then(
            response => {
                console.log(
                    `Made API call ${this.config.checkLiveWithKs === true ? "with" : "without"} KS`,
                    response
                );
            },
            error => {
                if (error instanceof KalturaClientException) {
                    console.log("network error etc");
                } else if (error instanceof KalturaAPIException) {
                    console.log("api exception");
                }
            }
        );
    };
}

KalturaPlayer.core.registerPlugin(pluginName, KalturaLivePlugin);
