import { KalturaLivePlugin } from "../kaltura-live-plugin";
import { getContribLogger } from "@playkit-js-contrib/common";

const HTTP_ERRORS = [1002, 1003, 3016, 3022];
enum EventTypes {
    ERROR = "error",
    ENDED = "ended"
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
        return this._plugin.isLiveEntry();
    }

    dispatchEvent(event: any): any {
        console.log('event', event)
        if (event.type === "abort") {
            console.log(">>>>>> set ABORT");
            this._plugin.abortEventHappend = true;
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
