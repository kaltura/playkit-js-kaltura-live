import { KalturaLiveCorePlugin } from "../plugin";
import { IEngineDecorator } from "./IEngineDecoratorProvider";

export class KalturaLiveEngineDecorator implements IEngineDecorator {
    _plugin: KalturaLiveCorePlugin;
    _engine: any;

    constructor(engine: any, plugin: KalturaLiveCorePlugin) {
        console.log(">>>> plugin", plugin);
        this._plugin = plugin;
        this._engine = engine;
    }

    get active(): boolean {
        return this._engine.currentTime;
    }

    dispatchEvent(event: any): boolean {
        console.log(">>>> KalturaLiveEngineDecorator dispatchEvent ", event);
        return event.defaultPrevented;
    }

    get duration(): number {
        console.log(">>>> KalturaLiveEngineDecorator duration ", this._engine.duration);
        return this._engine.duration;
    }

    get currentTime(): number {
        console.log(">>>> KalturaLiveEngineDecorator currentTime ", this._engine.currentTime);
        return this._engine.currentTime;
    }

    get paused(): boolean {
        console.log(">>>> KalturaLiveEngineDecorator paused ", this._engine.paused);
        return this._engine.paused;
    }
}
