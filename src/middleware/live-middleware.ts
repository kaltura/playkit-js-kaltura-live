import BaseMiddleware from "./base-middleware"; // TODO: move it to contrib repo
import { KalturaLivePlugin } from "../plugin";

export class KalturaLiveMidddleware extends BaseMiddleware {
    private _livePlugin: KalturaLivePlugin;

    constructor(plugin: KalturaLivePlugin) {
        super();
        this._livePlugin = plugin;
    }

    public load(next: Function): void {
        this.callNext(next);
    }

    public play(next: Function): void {
        this.callNext(next);
    }

    public pause(next: Function): void {
        this.callNext(next);
    }
}
