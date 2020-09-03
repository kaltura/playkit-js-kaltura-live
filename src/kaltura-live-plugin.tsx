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
import { KalturaLiveMiddleware } from "./middleware/live-middleware";
import { getContribLogger } from "@playkit-js-contrib/common";
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
    private _absolutePosition = null;
    private _isLiveApiCallTimeout: any = null;
    public reloadMedia = false;

    constructor(
        private _contribServices: ContribServices,
        private _configs: ContribPluginConfigs<KalturaLivePluginConfig>,
        private _player: KalturaPlayerTypes.Player
    ) {
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
        // presetManager.add({
        //     label: "kaltura-live-tag",
        //     renderChild: this._renderLiveTag,
        //     isolateComponent: true,
        //     relativeTo: { type: RelativeToTypes.Replace, name: "LiveTag" },
        //     presetAreas: { [ReservedPresetNames.Live]: ReservedPresetAreas.BottomBarLeftControls }
        // });
    }

    onPluginSetup(): void {}

    onMediaLoad(): void {
        this._isEntryLiveType();
        // TODO - Eitan - find out if on this phase we can access the 2 different streams and
        // store locally their URL.
    }

    onMediaUnload(): void {
        this._resetTimeout();
        this._player.removeEventListener(this._player.Event.FIRST_PLAY, this._handleFirstPlay);
        this._player.removeEventListener(
            this._player.Event.TIMED_METADATA,
            this._handleTimedMetadata
        );
    }

    // public updateLiveTag() {
    //     if (!this._componentRef) {
    //         return;
    //     }
    //     this._componentRef.update();
    // }

    // private _seekToLiveEdge = () => {
    //     this._player.seekToLiveEdge();
    //     if (this._player.paused) {
    //         this._player.play();
    //     }
    // };

    // private _renderLiveTag = () => {
    //     return (
    //         <ManagedComponent
    //             label={"live-indicator"}
    //             isShown={() => true}
    //             renderChildren={() => (
    //                 <LiveTag
    //                     isLive={this._isLive}
    //                     isPreview={this._isPreview}
    //                     isOnLiveEdge={this._player.isOnLiveEdge()}
    //                     onClick={this._seekToLiveEdge}
    //                 />
    //             )}
    //             ref={node => {
    //                 this._componentRef = node;
    //             }}
    //         />
    //     );
    // };

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
            // this._isLiveEntry = true;
            // this._player.addEventListener(this._player.Event.FIRST_PLAY, this._handleFirstPlay);
            // this._player.addEventListener(
            //     this._player.Event.TIMED_METADATA,
            //     this._handleTimedMetadata
            // );
            // this._player.configure({
            //     plugins: { kava: { tamperAnalyticsHandler: this._tamperAnalyticsHandler } }
            // });
            // this.updateLiveStatus();
        }
    };

    private _handleTimedMetadata = (e: any) => {
        // this.updateLiveTag();
        if (!e || !e.payload || !e.payload.cues || !e.payload.cues.length) {
            this._absolutePosition = null;
            return;
        }
        try {
            this._absolutePosition = JSON.parse(
                e.payload.cues[e.payload.cues.length - 1].value.data
            ).timestamp;
        } catch (error) {
            this._absolutePosition = null;
            logger.warn("Failed parsing timedmetadata payload cue " + error, {
                method: "_timedmetadataReceived ",
                data: e.payload
            });
        }
    };

    private _tamperAnalyticsHandler = (e: any) => {
        if (this._absolutePosition) {
            e.absolutePosition = this._absolutePosition;
        }
        return true;
    };

    private _handleFirstPlay = () => {
        this._wasPlayed = true;
    };

    // private _reloadMedia = () => {
    //     this.reloadMedia = false;
    //     const player: any = KalturaPlayer.getPlayer(this._player.config.targetId);
    //     const entryId = this._player.config.sources.id;
    //     player?.configure({ playback: { autoplay: true }});
    //     player?.loadMedia({ entryId });
    // }

    private _resetTimeout = () => {
        if (this._isLiveApiCallTimeout) {
            clearTimeout(this._isLiveApiCallTimeout);
            this._isLiveApiCallTimeout = null;
        }
    };


    // private _handleReplayClick = () => {
    //     this._player.play();
    // };

}

export class KalturaLiveCorePlugin extends CorePlugin<KalturaLivePlugin>
    implements KalturaPlayerTypes.IEngineDecoratorProvider {
    getMiddlewareImpl(): any {
        return new KalturaLiveMiddleware(this._contribPlugin);
    }

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
