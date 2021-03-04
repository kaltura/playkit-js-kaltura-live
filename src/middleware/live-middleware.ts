import { KalturaLivePlugin, LiveBroadcastStates } from "../kaltura-live-plugin";
import { getContribLogger } from "@playkit-js-contrib/common";

const logger = getContribLogger({
    class: "KalturaLiveMiddleWare",
    module: "kaltura-live-plugin"
});

export class KalturaLiveMiddleware extends KalturaPlayer.core.BaseMiddleware {
    private _livePlugin: KalturaLivePlugin;
    private _isFirstPlayedLive = true;
    private _nextLoad: Function | null = null;
    private _nextPlay: Function | null = null;

    constructor(plugin: KalturaLivePlugin) {
        super();
        this._livePlugin = plugin;
    }

    // plugin does not have reference/direct API to the middleware - so we are sampling this.
    // once we understand that we have a positive isLive - we clean and release the middleware
    // if not - try again
    initialPlayHandling() {
        // no need to apply this unless we are in the firstPlay
        if (!this._isFirstPlayedLive) {
            return;
        }
        if (this._nextPlay && this._nextLoad && this.isPlayerLive()) {
            // clear flag and release 2 methods
            this._isFirstPlayedLive = false;
            this.callNext(this._nextLoad);
            this.callNext(this._nextPlay);
            this._nextLoad = null;
            this._nextPlay = null;
            logger.info("interrupt play", { method: "play" });
        } else {
            // TODO - manage this (stop the timeout when the plugin / class is destroyed)
            setTimeout(() => {
                this.initialPlayHandling();
            }, 250);
        }
    }

    // check if the entry live status is 'live'
    private isPlayerLive() {
        return this._livePlugin.broadcastState === LiveBroadcastStates.Live;
    }

    public load(next: Function): void {
        if (this._livePlugin.isMediaLive && !this.isPlayerLive()) {
            this._livePlugin.updateLiveStatus();
            this._nextLoad = next;
            this.initialPlayHandling();
            logger.info("interrupt load", { method: "load" });
        } else {
            this.callNext(next);
        }
    }

    public play(next: Function): void {
        if (this._isFirstPlayedLive && this._livePlugin.isMediaLive && !this.isPlayerLive()) {
            this._nextPlay = next;
            logger.info("interrupt play", { method: "play" });
        } else {
            this.callNext(next);
        }
    }

    public pause(next: Function): void {
        super.callNext(next);
    }
}
