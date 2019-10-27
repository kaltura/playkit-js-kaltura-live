import { KalturaLivePlugin } from "../plugin";
import { IEngineDecorator } from "./IEngineDecoratorProvider";

export class KalturaLiveEngineDecorator implements IEngineDecorator {
    _plugin: KalturaLivePlugin;
    _engine: any;

    constructor(engine: any, plugin: KalturaLivePlugin) {
        this._plugin = plugin;
        this._engine = engine;
    }

    // this is part of the engine decorator -
    get active(): boolean {
        return this._plugin.active();
    }

    dispatchEvent(event: any): boolean {
        // todo - TS this better
        // for now - naive decorator that does not interfere with events logic
        return (this._plugin.player as any).dispatchEvent(event);
    }
}
