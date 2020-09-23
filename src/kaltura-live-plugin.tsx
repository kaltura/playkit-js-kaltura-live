import { h } from "preact";
import { KalturaClient } from "kaltura-typescript-client";
import {
    ContribPluginConfigs,
    ContribPluginData,
    ContribPluginManager,
    ContribServices,
    CorePlugin,
    OnMediaLoad,
    OnMediaUnload,
    OnPluginSetup,
    OnRegisterPresetsComponents
} from "@playkit-js-contrib/plugin";



import {
    PresetManager,
} from "@playkit-js-contrib/ui";
// import { KalturaLiveMiddleware } from "./middleware/live-middleware";
import { getContribLogger, ObjectUtils } from "@playkit-js-contrib/common";
import { KalturaLiveEngineDecorator } from "./decorator/live-decorator";

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
    Error = "Error",
    Live = "Live",
    Offline = "Offline"
}

// export enum OverlayItemTypes {
//     None = "None",
//     Offline = "Offline",
//     HttpError = "HttpError",
//     NoLongerLive = "NoLongerLive"
// }



export class KalturaLivePlugin
    implements OnMediaUnload, OnMediaLoad, OnPluginSetup, OnRegisterPresetsComponents {
    private _kalturaClient = new KalturaClient();
    private _isLiveEntry = false;
    private _broadcastState: LiveBroadcastStates = LiveBroadcastStates.Unknown;
    private _wasPlayed = false;
    private _secondaryUrl = "";
    private _absolutePosition = null;
    private _isLiveApiCallTimeout: any = null;
    public reloadMedia = false;

    constructor(
        private _contribServices: ContribServices,
        private _configs: ContribPluginConfigs<KalturaLivePluginConfig>,
        private _player: KalturaPlayerTypes.Player
    ) {
        console.log(">>>> CTOR",)
        const { playerConfig } = this._configs;
        this._kalturaClient.setOptions({
            clientTag: "playkit-js-kaltura-live",
            endpointUrl: playerConfig.provider.env.serviceUrl
        });
        // if (pluginConfig.checkLiveWithKs) {
        //     this._kalturaClient.setDefaultRequestOptions({
        //         ks: playerConfig.provider.ks
        //     });
        // }
    }

    onRegisterPresetsComponents(presetManager: PresetManager): void {

    }

    onPluginSetup(): void {}

    onMediaLoad(): void {
        // TODO - handle user joining in while primary is down !!!
        this._isEntryLiveType();
            const metadata = ObjectUtils.get(this.player.config,"sources.metadata",null);
            if(metadata && metadata.Prop1){
                this._secondaryUrl = metadata.Prop1;
            }

    }

    onMediaUnload(): void {
        this._isLiveEntry = false;
        this._secondaryUrl = "";
    }

    public handleError() {
      this._reloadMedia()


        if (!this._secondaryUrl) {
            return;
        }
        // replace logic here


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
        }
    };



    //mediaLoaded / mediaLoadStart
    // get sources
    // store (see metadata with the sec URL
    // SOURCES - see
    // replace the URL of the 1st
    // prefer do reset + setMedia  so analytics is easier



    private _tamperAnalyticsHandler = (e: any) => {
        if (this._absolutePosition) {
            e.absolutePosition = this._absolutePosition;
        }
        return true;
    };


    private _reloadMedia = () => {
      let config : any = {...this.player.config};
      (this.player as any).reset();
      config.sources.hls[0].url = "https://d3fsfcyq8li5vy.cloudfront.net/out/v1/49969538493c40d8887f44079e3bee01/index.m3u8";
      (this.player as any).setMedia(config);
      (this.player as any).play();
    }


    // private _handleReplayClick = () => {
    //     this._player.play();
    // };

}

export class KalturaLiveCorePlugin extends CorePlugin<KalturaLivePlugin>
    implements KalturaPlayerTypes.IEngineDecoratorProvider {
    // getMiddlewareImpl(): any {
    //     return new KalturaLiveMiddleware(this._contribPlugin);
    // }

    getEngineDecorator(engine: any, dispatcher: Function): any {
        return new KalturaLiveEngineDecorator(engine, this._contribPlugin, dispatcher);
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
