import { KalturaLivePlugin, LiveBroadcastStates } from "../kaltura-live-plugin";
import { getContribLogger } from "@playkit-js-contrib/common";

const logger = getContribLogger({
    class: "KalturaLiveMiddleWare",
    module: "kaltura-live-plugin"
});

export class KalturaLiveMiddleware extends KalturaPlayer.core.BaseMiddleware {
    private _livePlugin: KalturaLivePlugin;
    private _nextLoad: Function | null = null;

    constructor(plugin: KalturaLivePlugin) {
        super();
        this._livePlugin = plugin;
    }

    // plugin does not have reference/direct API to the middleware - so we are sampling this.
    // once we understand that we have a positive isLive - we clean and release the middleware
    // if not - try again
    initialPlayHandling() {
        if (this._nextLoad && this.isLive()) {
            // clear flag and release 2 methods
            // this._isFirstPlay = false;
            this.callNext(this._nextLoad);
            // this.callNext(this._nextPlay);
            this._nextLoad = null;
            logger.info("interrupt play", { method: "play" });
        } else {
            // TODO - manage this (stop the timeout when the plugin / class is destroyed)
            setTimeout(() => {
                this.initialPlayHandling();
            }, 250);
        }
    }

    // check if the entry live status is 'live'
    private isLive() {
        return this._livePlugin.broadcastState === LiveBroadcastStates.Live;
    }

    public load(next: Function): void {
        // if plugin is not active (E.G. in VOD) the middleware will not work
        if (!this._livePlugin.isLiveEntry()) {
            this.callNext(next);
            return;
        }
        // halt the load lifecycle method if we are in the 1st play or if we are not online
        if (this.isLive()) {
            // we know that we are live (isLive returned true)
            this.callNext(next);
        } else {
            this._nextLoad = next;
            this.initialPlayHandling();
            logger.info("interrupt load", { method: "load" });
        }
    }
}
