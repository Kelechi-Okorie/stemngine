// Event type definition
export interface BaseEvent<TTarget = any> {
  type: string;
  target?: any;
  [key: string]: any;
}



type EventListener<E extends BaseEvent> = (event: E) => void;

/**
 * Class EventDispatcher allows to dispatch event objects on custom Javascript objects.
 *
 * @see https://doc.babylonjs.com/features/featuresDeepDive/events/eventDispatcher
 */
export class EventDispatcher<TEvents extends  Record<string, BaseEvent<any>> = any> {
  private _listeners?: { [K in keyof TEvents]?: EventListener<TEvents[K]>[] };


  /**
   * Adds the given event listener to the given event type
   *
   * @param type The event type to listen to
   * @param listener The callback to call when the event is dispatched
   */
  addEventListener<K extends keyof TEvents>(type: K, listener: EventListener<TEvents[K]>): void {
    if (this._listeners === undefined) {
      this._listeners = {};
    }

    const listeners = this._listeners;
    if(listeners[type] === undefined) {
      listeners[type] = [];
    }

    const array = listeners[type]!;
    if (array.indexOf(listener) === -1) {
      array.push(listener);
    }
  }

  /**
   * Returns true if the given event listener has been registered to the given event type
   *
   * @param type The event type to listen to
   * @param listener The callback to call when the event is dispatched
   * @returns true if the listener was registered
   */
  hasEventListener<K extends keyof TEvents>(type: K, listener: EventListener<TEvents[K]>): boolean {
    const listeners = this._listeners;
    if (listeners === undefined) {
      return false;
    }

    const array = listeners[type];
    return array !== undefined && array.indexOf(listener) !== -1;

  }

  /**
   * Removes the given event listener from the given event type
   *
   * @param type The event type to listen to
   * @param listener The listener to remove
   */
  removeEventListener<K extends keyof TEvents>(type: K, listener: EventListener<TEvents[K]>): void {
    const listeners = this._listeners;
    if(listeners == undefined) {
      return;
    }

    const array = listeners[type];
    if (array !== undefined) {
      const index = array.indexOf(listener);
      if (index !== -1) {
        array.splice(index, 1);
      }
    }
  }

  /**
   * Dispatches the given event to all registered event listeners
   *
   * @param event The event to dispatch
   */
  dispatchEvent<K extends keyof TEvents>(event: TEvents[K]): void {
    const listeners = this._listeners;
    if (listeners === undefined) {
      return;
    }

    const array = listeners[event.type as K];
    if (array !== undefined) {
      (event as BaseEvent).target = this;

      const copy = array.slice(0);
      for (let i = 0, l = copy.length; i < l; i++) {
        copy[i].call(this, event);
      }

      // (event as BaseEvent).target = null;
    }
  }

  /**
   * Getter for _listeners
   *
   * for testing purposes only
   */
  get listeners() {
    return this._listeners;
  }
}
