import { KalturaLivePlugin } from "../kaltura-live-plugin";
import { getContribLogger } from "@playkit-js-contrib/common";

const HTTP_ERRORS = [1002, 1003, 3016, 3022];
enum EventTypes {
    ERROR = "error",
    ENDED = "ended",
    PLAYING = "playing",
    ABORT = "abort",
    PAUSED = "pause",
    METADATA = "timedmetadata",
    SEEKED = "seeked",
};

const logger = getContribLogger({
    class: "KalturaLiveDecorator",
    module: "kaltura-live-decorator"
});

export class KalturaLiveEngineDecorator implements KalturaPlayerTypes.IEngineDecorator {
    _plugin: KalturaLivePlugin;
    _engine: any;
    _dispatcher: Function;

    constructor(engine: any, plugin: KalturaLivePlugin, dispatcher: Function) {
        this._plugin = plugin;
        this._engine = engine;
        this._dispatcher = dispatcher;
    }

    get active(): boolean {
        return this._plugin.player.isLive();
    }

    dispatchEvent(event: any): any {
        if (event.type === EventTypes.METADATA) {
            this._plugin.handleTimedMetadata(event);
        }
        if (event.type === EventTypes.SEEKED) {
            // check _isOnLiveEdge property after 'SEEKING' event happened
            // https://github.com/kaltura/playkit-js/blob/master/src/player.js#L1696-L1700
            this._plugin.updateLiveTag();
        }
        if (
            event.type === EventTypes.ENDED ||
            event.type === EventTypes.ABORT
        ) {
            this._plugin.reloadMedia = true;
        }
        if (
            event.type === EventTypes.PLAYING ||
            event.type === EventTypes.PAUSED
        ) {
            this._plugin.updateLiveTag();
        }
        if (event.type === EventTypes.ENDED) {
            this._plugin.updateLiveStatus();
        }
        if (
            event.type === EventTypes.ERROR &&
            event.payload &&
            event.payload.code &&
            HTTP_ERRORS.indexOf(event.payload.code) > -1
        ) {
            logger.info(
                `Kaltura live-decorator prevented interrupted error ${event.payload.code}`,
                {
                    method: "dispatchEvent"
                }
            );
            this._plugin.updateLiveStatus();
            return true;
        }
        return this._dispatcher(event);
    }
}
