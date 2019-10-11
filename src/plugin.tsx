import { KalturaClient } from "kaltura-typescript-client";
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

        this._kalturaClient.setDefaultRequestOptions({
            ks: config.server.ks
        });
    }

    onRegisterUI(uiManager: UIManager): void {
        console.log("The plugin kaltura-live compiled. ");
    }

    onMediaLoad(config: OnMediaLoadConfig): void {}

    onMediaUnload(): void {}

    private _pauseVideo() {
        this.player.pause();
    }

    private _seekTo(time: number) {
        this.player.currentTime = time;
    }
}

KalturaPlayer.core.registerPlugin(pluginName, KalturaLivePlugin);
