import { KalturaLivePlugin, LiveBroadcastStates } from "../plugin";

export class KalturaLiveMiddleware extends KalturaPlayer.core.BaseMiddleware {
    private _livePlugin: KalturaLivePlugin;
    // false means that this is not the 1st play ever
    private _isFirstPlay = true;
    private _nextLoad: Function | null = null;
    private _nextPlay: Function | null = null;

    constructor(plugin: KalturaLivePlugin) {
        super();
        this._livePlugin = plugin;
    }

    // plugin does not have reference/direct API to the middleware - so we are sampling this.
    // once we understand that we have a positive isLive - we clean and release the middleware
    // if not - try again
    checkLiveStatus() {
        if (this._nextPlay && this._nextLoad && this._checkIfLive()) {
            // clear flag and release 2 methods
            this._isFirstPlay = false;
            this.callNext(this._nextLoad);
            this.callNext(this._nextPlay);
            this._nextLoad = null;
            this._nextPlay = null;
        } else {
            // TODO - manage this (stop the timeout when the plugin / class is destroyed)
            setTimeout(() => {
                this.checkLiveStatus();
            }, 250);
        }
    }

    // sample the plugin if it live
    private _checkIfLive() {
        return this._livePlugin.broadcastState === LiveBroadcastStates.Live;
    }

    public load(next: Function): void {
        // if plugin is not active (E.G. in VOD) the middleware will not work
        if (!this._livePlugin.isLiveEntry()) {
            this.callNext(next);
        }
        //we want to halt the load lifecycle method if we are in the 1st play or if we are not online
        if (this._isFirstPlay || this._checkIfLive()) {
            this.checkLiveStatus();
            this._nextLoad = next;
        } else {
            this.callNext(next);
        }
    }

    public play(next: Function): void {
        // if plugin is not active (E.G. in VOD) the middleware will not work
        if (!this._livePlugin.isLiveEntry()) {
            this.callNext(next);
        }
        //Todo: Eitan - try simplifying or make more readable.
        if (this._isFirstPlay || this._checkIfLive()) {
            this._nextPlay = next;
        } else {
            this.callNext(next);
        }
    }

    public pause(next: Function): void {
        super.callNext(next);
    }
}
