import { KalturaLivePlugin } from "../kaltura-live-plugin";
import { getContribLogger } from "@playkit-js-contrib/common";

const HTTP_ERRORS = [1002, 1003];
const EVENT_ERROR_TYPE = "error";

const logger = getContribLogger({
    class: "KalturaLiveDecorator",
    module: "kaltura-live-decorator"
});

export class KalturaLiveEngineDecorator implements KalturaPlayerTypes.IEngineDecorator {
    _plugin: KalturaLivePlugin;
    _engine: any;

    constructor(engine: any, plugin: KalturaLivePlugin) {
        this._plugin = plugin;
        this._engine = engine;
    }

    get active(): boolean {
        return this._plugin.isLiveEntry();
    }

    dispatchEvent(event: any): any {
        if (
            event.type === EVENT_ERROR_TYPE &&
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
            this._plugin.handleHttpError();
            return true;
        }
        return this._plugin.player.dispatchEvent(event);
    }
}
