export default class BaseMiddleware {
    /**
     * Calls the next handler in the middleware chain.
     * @param {Function} next - The next handler in the middleware chain.
     * @returns {void}
     */
    callNext(next: Function): void {
        if (next && typeof next === "function") {
            next();
        }
    }
}
