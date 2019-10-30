import { KalturaLivePlugin } from "../plugin";
import IEngineDecorator = KalturaPlayerTypes.IEngineDecorator;

export class KalturaLiveEngineDecorator implements IEngineDecorator {
    _plugin: KalturaLivePlugin;
    _engine: any;

    constructor(engine: any, plugin: KalturaLivePlugin) {
        this._plugin = plugin;
        this._engine = engine;
    }

    get active(): boolean {
        return this._plugin.active();
    }

    dispatchEvent(event: any): any {
        return this._plugin.player.dispatchEvent(event);
    }
}
