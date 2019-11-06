import { KalturaLivePlugin } from "../plugin";

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
        if (event.type === this._plugin.player.Event.ENDED) {
            this._plugin.handleOnEnd();
        }
        return this._plugin.player.dispatchEvent(event);
    }
}
