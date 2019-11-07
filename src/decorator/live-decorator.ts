import { KalturaLivePlugin } from "../plugin";

const HTTP_ERROR = 1002;
const EVENT_ERROR_TYPE = "error";

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
        if (event.type === EVENT_ERROR_TYPE && event.payload && event.payload.code === HTTP_ERROR) {
            console.log(event);
        }
        return this._plugin.player.dispatchEvent(event);
    }
}
