import { KalturaLivePlugin } from "../plugin";

export class KalturaLiveEngineDecorator {
    _plugin: KalturaLivePlugin;
    _engine: any;

    constructor(engine: any, plugin: KalturaLivePlugin) {
        this._plugin = plugin;
        this._engine = engine;
    }

    get active(): boolean {
        return this._plugin.playOnMainVideoTag() && this._plugin.isAdPlaying();
    }

    dispatchEvent(event: any): boolean {
        return event.defaultPrevented;
    }

    get duration(): number {
        return this._plugin.getContentDuration();
    }

    get currentTime(): number {
        return this._plugin.getContentTime();
    }

    get paused(): boolean {
        return true;
    }
}
