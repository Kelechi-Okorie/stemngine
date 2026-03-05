import { EventDispatcher } from "./EventDispatcher";

/**
 * Global event dispatcher.
 * Saves as a system-wide event bus
 */
export class GlobalEventDispatcher {

    private static _instance: EventDispatcher;

    private constructor() {}

    public static get instance(): EventDispatcher {

        if (!this._instance) {
            this._instance = new EventDispatcher();
        }

        return this._instance;

    }

}
