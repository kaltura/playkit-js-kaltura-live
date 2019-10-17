import BaseMiddleware from "./base-middleware"; // TODO: move it to contrib repo
import { KalturaLivePlugin } from "../plugin";

export class KalturaLiveMidddleware extends BaseMiddleware {
    private _context: KalturaLivePlugin;
    constructor(context: KalturaLivePlugin) {
        super();
        this._context = context;
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
