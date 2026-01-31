import { MOUSE } from "../constants";

// input-types.ts
export type InputEventType =
  | 'pointerdown'
  | 'pointermove'
  | 'pointerup'
  | 'pointercancel'
  | 'wheel'
  | 'keydown'
  | 'contextmenu';

export type Listener<T = any> = (event: T) => void;

/**
 * This is the only place where DOM exists
 */
export class BrowserInputManager {

  public readonly domElement: HTMLElement | SVGElement;
  public listeners = new Map<InputEventType, Listener[]>();
  // public listeners: Map<InputEventType, Listener> = new Map();

  private lastX = 0;
  private lastY = 0;

  /**
   * The html element used for event listening
   * @param domElement
   */
  constructor(element: HTMLElement | SVGElement) {

    this.domElement = element;

    this.connect();

  }

  public on<T extends Event>(type: InputEventType, fn: Listener<T>): void {

    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }

    this.listeners.get(type)!.push(fn);

  }

  public emit<T extends Event>(type: InputEventType, event: T): void {

    // console.log(this.listeners)

    const list = this.listeners.get(type);

    if (!list) return;

    for (const fn of list) fn(event);

  }

  public remove<T extends Event>(type: InputEventType, fn: Listener<T>): void {

    const list = this.listeners.get(type);

    if (!list) return;

    const index = list.indexOf(fn);

    if (index !== -1) {
      list.splice(index, 1);
    }

  }

  public connect(): void {

    this.domElement.tabIndex = 0;
    this.domElement.focus();

    this.domElement.addEventListener('pointerdown', this._pointerDownListener);
    this.domElement.addEventListener('pointermove', this._pointerMoveListener);
    this.domElement.addEventListener('pointerup', this._pointerUpListener);
    this.domElement.addEventListener('pointercancel', this._pointerCancelListener);

    this.domElement.addEventListener(
      'wheel',
      this._wheelListener,
      { passive: false }
    );

    this.domElement.addEventListener('contextmenu', this._contextMenuListener);

    // const document = this.domElement.getRootNode(); // offscreen canvas compatibility
    // document.addEventListener('keydown', e => this.emit('keydown', e));

    const doc = this.domElement.ownerDocument ?? document;
    doc.addEventListener('keydown', this._keyDownListener, { passive: true, capture: true});

    this.domElement.style.touchAction = 'none'; // disable touch scroll

  }

  private disconnect(): void {

    this.domElement.removeEventListener('pointerdown', this._pointerDownListener);
    this.domElement.removeEventListener('pointermove', this._pointerMoveListener);
    this.domElement.removeEventListener('pointerup', this._pointerUpListener);
    this.domElement.removeEventListener('pointercancel', this._pointerCancelListener);

    this.domElement.removeEventListener('wheel', this._wheelListener);

    this.domElement.removeEventListener('contextmenu', this._contextMenuListener);

    const doc = this.domElement.ownerDocument ?? document;
    doc.removeEventListener('keydown', this._keyDownListener);

  }

  public dispose(): void {

    this.disconnect();

  }

  private _pointerDownListener = (e: Event) => this.emit('pointerdown', e);

  private _pointerMoveListener = (e: Event) => this.emit('pointermove', e);

  private _pointerUpListener = (e: Event) => this.emit('pointerup', e);

  private _pointerCancelListener = (e: Event) => this.emit('pointercancel', e);

  private _contextMenuListener = (e: Event) => this.emit('contextmenu', e);

  private _wheelListener = (e: Event) => {
    e.preventDefault();
    this.emit('wheel', e);
  };

  private _keyDownListener = (e: KeyboardEvent) => this.emit('keydown', e);

}
