import BaseMiddleware from "./base-middleware"; // TODO: move it to contrib repo
import { KalturaLivePlugin } from "../plugin";

export class KalturaLiveMidddleware extends BaseMiddleware {
    private _context: KalturaLivePlugin;
    constructor(context: KalturaLivePlugin) {
        super();
        this._context = context;
        context.player.addEventListener(context.player.Event.SOURCE_SELECTED, (e: any) => {
            // find out if the entry is live or VOD.
            if (context.player.config.sources.type === context.player.MediaType.LIVE) {
                // this is Live
                console.log("I am a live entry", context.player.config.sources);
            } else {
                // this is VOD
                console.log("I am VOD entry", context.player.config.sources);
            }
        });
    }

    /**
     * Load middleware handler.
     * @param {Function} next - The load play handler in the middleware chain.
     * @returns {void}
     * @memberof KalturaLiveMidddleware
     */
    public load(next: Function): void {
        console.log("load");
        this.callNext(next);
    }

    /**
     * Play middleware handler.
     * @param {Function} next - The next play handler in the middleware chain.
     * @returns {void}
     * @memberof KalturaLiveMidddleware
     */
    public play(next: Function): void {
        console.log("Requested to play");
        setTimeout(() => {
            console.log("play with delay");
            this.callNext(next);
        }, 1000);
    }

    /**
     * Pause middleware handler.
     * @param {Function} next - The next pause handler in the middleware chain.
     * @returns {void}
     * @memberof KalturaLiveMidddleware
     */
    public pause(next: Function): void {
        console.log("pause");
        this.callNext(next);
    }
}
