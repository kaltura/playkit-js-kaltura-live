import { h } from "preact";
import { KalturaClient } from "kaltura-typescript-client";
import { LiveStreamGetDetailsAction } from "kaltura-typescript-client/api/types/LiveStreamGetDetailsAction";
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
    OverlayPositions,
    RelativeToTypes,
    ReservedPresetNames,
    PresetManager,
    ReservedPresetAreas,
    ManagedComponent,
    OverlayItem
} from "@playkit-js-contrib/ui";
import { KalturaLiveMiddleware } from "./middleware/live-middleware";
import { getContribLogger } from "@playkit-js-contrib/common";
import { KalturaLiveEngineDecorator } from "./decorator/live-decorator";
import { Offline } from "./components/offline";
import { NoLongerLive } from "./components/no-longer-live";
import { LiveTag } from "./components/live-tag";
import { KalturaLiveStreamBroadcastStatus } from "kaltura-typescript-client/api/types/KalturaLiveStreamBroadcastStatus";

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

export enum OverlayItemTypes {
    None = "None",
    Offline = "Offline",
    HttpError = "HttpError",
    NoLongerLive = "NoLongerLive"
}

export class KalturaLivePlugin
    implements OnMediaUnload, OnMediaLoad, OnPluginSetup, OnRegisterPresetsComponents {
    private _kalturaClient = new KalturaClient();
    private _isLiveEntry = false;
    private _broadcastState: LiveBroadcastStates = LiveBroadcastStates.Unknown;
    private _wasPlayed = false;
    private _ie11Win7Block = false;
    private _absolutePosition = null;
    private _isLiveApiCallTimeout: any = null;
    private _currentOverlay: OverlayItem | null = null;
    private _currentOverlayType: OverlayItemTypes = OverlayItemTypes.None;
    readonly _ie11Windows7: boolean = false;
    private _componentRef: ManagedComponent | null = null;
    private _isPreview = false;
    private _isLive = false;
    private _activeRequest = false;

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
        if (pluginConfig.checkLiveWithKs) {
            this._kalturaClient.setDefaultRequestOptions({
                ks: playerConfig.provider.ks
            });
        }
        this._player.addEventListener(this._player.Event.SOURCE_SELECTED, this._isEntryLiveType);
        // cache ie11Win7 check
        this._ie11Windows7 = this._isIE11Win7();
    }

    onRegisterPresetsComponents(presetManager: PresetManager): void {
        presetManager.add({
            label: "kaltura-live-tag",
            renderChild: this._renderLiveTag,
            isolateComponent: true,
            relativeTo: { type: RelativeToTypes.Replace, name: "LiveTag" },
            presetAreas: { [ReservedPresetNames.Live]: ReservedPresetAreas.BottomBarLeftControls }
        });
    }

    onPluginSetup(): void {}

    onMediaLoad(): void {}

    onMediaUnload(): void {
        this._resetTimeout();
        this._player.removeEventListener(this._player.Event.FIRST_PLAY, this._handleFirstPlay);
        this._player.removeEventListener(
            this._player.Event.TIMED_METADATA,
            this._handleTimedMetadata
        );
    }

    private _updateLiveTag() {
        if (!this._componentRef) {
            return;
        }
        this._componentRef.update();
    }

    private _seekToLiveEdge = () => {
        this._player.seekToLiveEdge();
        if (this._player.paused) {
            this._player.play();
        }
    };

    private _renderLiveTag = () => {
        return (
            <ManagedComponent
                label={"live-indicator"}
                isShown={() => true}
                renderChildren={() => (
                    <LiveTag
                        isLive={this._isLive}
                        isPreview={this._isPreview}
                        isOnLiveEdge={this._player.isOnLiveEdge()}
                        onClick={this._seekToLiveEdge}
                    />
                )}
                ref={node => {
                    this._componentRef = node;
                }}
            />
        );
    };

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
        this._player.removeEventListener(this._player.Event.SOURCE_SELECTED, this._isEntryLiveType);
        if (this._player.isLive()) {
            this._isLiveEntry = true;
            this._player.addEventListener(this._player.Event.FIRST_PLAY, this._handleFirstPlay);
            this._player.addEventListener(
                this._player.Event.TIMED_METADATA,
                this._handleTimedMetadata
            );
            this._player.configure({
                plugins: { kava: { tamperAnalyticsHandler: this._tamperAnalyticsHandler } }
            });
            this._updateLiveStatus();
        }
    };

    private _handleTimedMetadata = (e: any) => {
        this._updateLiveTag();
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

    // use this method so that engine-decorator can notify the plugin of an error
    // this is triggered after player had not got internet back and this is non-recoverable problem
    public handleHttpError() {
        this._updateLiveStatus()
            .then(null)
            .catch(() => {
                logger.info("got httpError - adding network-error slate", {
                    method: "handleHttpError"
                });
                // TODO - do not remove this line !
                this._manageOfflineSlate(OverlayItemTypes.HttpError);
            });
    }

    private _reloadVideo = () => {
        // TODO - fix once FEC-9523 implemented by core team
        // IE11-Win7 edge case - cannot reload video engine. Show non-recoverable slate and prevent future changes
        if (this._ie11Windows7) {
            this._manageOfflineSlate(OverlayItemTypes.HttpError);
            this._ie11Win7Block = true;
            logger.warn("IE11 Windows7 cannot reload video ! non-recoverable error", {
                method: "_reloadVideo"
            });
            return;
        }

        try {
            // TODO - fix once FEC-9519 implemented by core team
            if (this.player.env.browser.name === "Safari") {
                // Safari did not get a valid handle for detach and attach the media sources.
                const video = this.player.getVideoElement();
                if (video) {
                    this.player.getVideoElement().load();
                }
                logger.info("Reloading in Safari", {
                    method: "_reloadVideo"
                });
            } else {
                // TODO - fix once FEC-9488 implemented by core team
                this._player._detachMediaSource();
                this._player._attachMediaSource();
                logger.info("Reloading video with detach/attach media functions", {
                    method: "_reloadVideo"
                });
            }
            this._player.play();
        } catch (e) {
            // failed resetting video engine - apply non-recoverable slate
            this._manageOfflineSlate(OverlayItemTypes.HttpError);
            logger.info("Failed to reload video", {
                method: "_reloadVideo",
                data: e
            });
        }
    };

    private _reloadMedia = () => {
        // TODO: add getPlayer TS type to KalturaPlayer in contrib repo
        const player: any = (KalturaPlayer as any).getPlayer(this._player.config.targetId);
        const { id } = this._player.config.sources;
        player?.configure({ playback: { autoplay: true }});
        player?.loadMedia({ entryId: id });
    }

    private _isIE11Win7() {
        const ua = window.navigator.userAgent;
        return (
            this.player.env.os.name === "Windows" &&
            this.player.env.os.version === "7" &&
            this.player.env.browser.name === "IE" &&
            ua.indexOf("Trident/7.0") > -1
        );
    }

    private _resetTimeout = () => {
        if (this._isLiveApiCallTimeout) {
            clearTimeout(this._isLiveApiCallTimeout);
            this._isLiveApiCallTimeout = null;
        }
    };

    private _initTimeout = () => {
        const { pluginConfig } = this._configs;
        this._resetTimeout();
        this._isLiveApiCallTimeout = setTimeout(
            this._updateLiveStatus,
            pluginConfig.isLiveInterval * 1000
        );
    };

    // once reached ended - check status and react accordingly
    public handleOnEnd = () => {
        this._updateLiveStatus();
    };

    // this functions is called whenever isLive receives any value.
    // This is where the magic happens
    private handleLiveStatusReceived(receivedState: LiveBroadcastStates) {
        this._updateLiveTag();
        this._broadcastState = receivedState;
        const hasDVR = this._player.isDvr();
        const ended = this.player.ended;
        logger.info("Received isLive with value: " + receivedState, {
            method: "handleLiveStatusReceived",
            data: {
                hasDVR: hasDVR,
                wasPlayed: this._wasPlayed,
                ended: ended
            }
        });
        if (receivedState === LiveBroadcastStates.Error) {
            this._manageOfflineSlate(OverlayItemTypes.HttpError);
            return;
        }

        if (!this._wasPlayed && receivedState === LiveBroadcastStates.Offline) {
            this._manageOfflineSlate(OverlayItemTypes.Offline);
            logger.info("Offline before first play - show offline slate ", {
                method: "handleLiveStatusReceived"
            });
            return;
        }

        if (receivedState === LiveBroadcastStates.Live) {
            // Live. Remove slate
            if (ended || this._currentOverlayType === OverlayItemTypes.HttpError) {
                // we are online and player is ended - reset player engine OR
                // we network connection restored - reset player engine
                // this resumes from latest position - it does not go back to liveEdge !
                logger.info("Video ended and isLive is true. Reset player engine", {
                    method: "handleLiveStatusReceived"
                });
                this._reloadMedia();
            }
            this._manageOfflineSlate(OverlayItemTypes.None);
            return;
        }

        if (receivedState === LiveBroadcastStates.Offline) {
            this._manageOfflineSlate(OverlayItemTypes.NoLongerLive);
            logger.info("Received isLive false after ended - show no longer live slate", {
                method: "handleLiveStatusReceived"
            });
        }
    }

    private _handleReplayClick = () => {
        this._manageOfflineSlate(OverlayItemTypes.None);
        this._player.play();
    };

    private _manageOfflineSlate(type: OverlayItemTypes) {
        if (type === this._currentOverlayType && this._ie11Win7Block) {
            if (type === OverlayItemTypes.None && !this._configs.pluginConfig.checkLiveWithKs) {
                return;
            }
            this._initTimeout();
            return;
        }
        if (this._currentOverlay) {
            this._contribServices.overlayManager.remove(this._currentOverlay);
            this._currentOverlay = null;
        }
        this._currentOverlayType = type;
        switch (type) {
            case OverlayItemTypes.NoLongerLive:
                this._initTimeout();
                this._currentOverlay = this._contribServices.overlayManager.add({
                    label: "no-longer-live-overlay",
                    position: OverlayPositions.PlayerArea,
                    renderContent: () => (
                        <NoLongerLive
                            onClick={this._handleReplayClick}
                            showReplay={this._player.isDvr()}
                        />
                    )
                });
                break;
            case OverlayItemTypes.Offline:
                this._initTimeout();
                this._currentOverlay = this._contribServices.overlayManager.add({
                    label: "offline-overlay",
                    position: OverlayPositions.PlayerArea,
                    renderContent: () => <Offline />
                });
                break;
            case OverlayItemTypes.HttpError:
                this._initTimeout();
                this._currentOverlay = this._contribServices.overlayManager.add({
                    label: "http-problem-overlay",
                    position: OverlayPositions.PlayerArea,
                    renderContent: () => <Offline httpError={true} />
                });
                break;
            case OverlayItemTypes.None:
            default:
                if (this._configs.pluginConfig.checkLiveWithKs) {
                    this._initTimeout();
                }
                this._currentOverlay = null;
                break;
        }
    }

    // The function calls 'isLive' api and then repeats the call every X seconds (10 by default)
    private _updateLiveStatus = () => {
        const { pluginConfig } = this._configs;
        const { id } = this._player.config.sources;
        const request = new LiveStreamGetDetailsAction({ id });

        logger.info(
            `Calling LiveStreamGetDetailsAction ${
                pluginConfig.checkLiveWithKs ? "with" : "without"
            } KS`,
            {
                method: "updateLiveStatus"
            }
        );
        return new Promise((resolve, reject) => {
            if (this._activeRequest) {
                return resolve(); // prevent new API call if current is pending
            }
            this._resetTimeout();
            this._activeRequest = true;
            this._kalturaClient.request(request).then(
                (data) => {
                    this._activeRequest = false;
                    this._isLive = false;
                    this._isPreview = false;
                    if (!data || !data.broadcastStatus) {
                        // bad response
                        this._initTimeout();
                        return;
                    }
                    switch (data.broadcastStatus) {
                        case KalturaLiveStreamBroadcastStatus.live:
                            this._isLive = true;
                            this.handleLiveStatusReceived(LiveBroadcastStates.Live);
                            break;
                        case KalturaLiveStreamBroadcastStatus.offline:
                            this.handleLiveStatusReceived(LiveBroadcastStates.Offline);
                            break;
                        case KalturaLiveStreamBroadcastStatus.preview:
                            if (pluginConfig.checkLiveWithKs) {
                                this._isPreview = true;
                                this.handleLiveStatusReceived(LiveBroadcastStates.Live);
                            } else {
                                this.handleLiveStatusReceived(LiveBroadcastStates.Offline);
                            }
                            break;
                    }
                    logger.info(
                        "LiveStreamGetDetails received. data.broadcastStatus " + data.broadcastStatus,
                        {
                            method: "updateLiveStatus",
                            data: {
                                data
                            }
                        }
                    );
                    resolve();
                },
                (error) => {
                    this._activeRequest = false;
                    this._isLive = false;
                    this._isPreview = false;
                    this.handleLiveStatusReceived(LiveBroadcastStates.Error);
                    logger.error("Failed to call isLive API", {
                        method: "updateLiveStatus",
                        data: {
                            error
                        }
                    });
                    this._initTimeout();
                    reject();
                }
            );
        })
    };
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
