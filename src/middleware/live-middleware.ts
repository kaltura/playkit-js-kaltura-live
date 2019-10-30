import { KalturaLivePlugin } from "../plugin";

export class KalturaLiveMidddleware extends KalturaPlayer.core.BaseMiddleware {
    private _livePlugin: KalturaLivePlugin;

    constructor(plugin: KalturaLivePlugin) {
        super();
        this._livePlugin = plugin;
    }

    public load(next: Function): void {
        super.callNext(next);
    }

    public play(next: Function): void {
        super.callNext(next);
    }

    public pause(next: Function): void {
        super.callNext(next);
    }
}
