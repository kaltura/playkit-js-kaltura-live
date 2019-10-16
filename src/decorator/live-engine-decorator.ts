import { KalturaLivePlugin } from "../plugin";
import { IEngineDecorator } from "./iEngineDecorator";

export class KalturaLiveEngineDecorator implements IEngineDecorator {
    _plugin: KalturaLivePlugin;
    _engine: any;

    constructor(engine: any, plugin: KalturaLivePlugin) {
        this._plugin = plugin;
        this._engine = engine;
    }

    get active(): boolean {
        return true;
    }

    set currentTime(to: number) {
        // Do nothing
    }

    dispatchEvent(event: any): boolean {
        return event.defaultPrevented;
    }

    get duration(): number {
        return this._engine.duration || 0;
    }

    get currentTime(): number {
        return this._engine.currentTime;
    }

    get paused(): boolean {
        console.log("Pause");
        return this._engine.paused;
    }

    get ended(): boolean {
        console.log("End");
        return this._engine.ended;
    }
}
