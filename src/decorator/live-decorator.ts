import { KalturaLiveCorePlugin } from "../plugin";
import { IEngineDecorator } from "./IEngineDecoratorProvider";

export class KalturaLiveEngineDecorator implements IEngineDecorator {
    _plugin: KalturaLiveCorePlugin;
    _engine: any;

    constructor(engine: any, plugin: KalturaLiveCorePlugin) {
        this._plugin = plugin;
        this._engine = engine;
    }

    get active(): boolean {
        return this._plugin.active();
    }

    dispatchEvent(event: any): boolean {
        // todo - TS this better
        // for now - naive decorator that does not interfere with events logic
        return (this._plugin.player as any).dispatchEvent(event);
    }
}
