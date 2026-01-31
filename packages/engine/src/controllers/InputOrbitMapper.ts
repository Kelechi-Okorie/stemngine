import { Vector2 } from "../engine.core";
import { MOUSE, TOUCH } from "../constants";

import { BrowserInputManager } from "../engine.core";
import { OrbitControls } from "./OrbitControls";

export class InputOrbitMapper {

  private readonly input: BrowserInputManager;
  private readonly controls: OrbitControls;

  private state: number;

  public readonly element: HTMLElement | SVGElement;

  /**
   * pointers is an array tracking all active pointers
   * (for multitouch support)
   *
   * @remarks
   * If no pointers are currently active, this is the first pointer
   * (like the first finger touching the screen)
   */
  public pointers: number[] = [];

  private pointerPositions: Vector2[] = [];

  /**
   * Enable or disable horizontal and vertical rotation of the camera.
   *
   * Note that it is possible to disable a single axis by setting the min and max of the
   * `minPolarAngle` or `minAzimuthAngle` to the same value, which will cause the vertical
   * or horizontal rotation to be fixed at that value.
   *
   */
  public enableRotate = true;


  /**
   * Enable or disable camera panning.
   *
   * @default true
   */
  private enablePan = true;

  constructor(
    // element: HTMLElement | SVGElement
    controls: OrbitControls
  ) {

    this.controls = controls;

    const element = controls.domElement;
    this.element = element;
    this.input = new BrowserInputManager(element);

    this.state = controls._STATE.NONE;

    this.connect();

  }

  public connect = () => {

    this.input.connect();

    this.input.on<PointerEvent>('pointerdown', this.onPointerDown);
    this.input.on<PointerEvent>('pointermove', this.onPointerMove);
    this.input.on<PointerEvent>('pointerup', this.onPointerUp);
    this.input.on<PointerEvent>('pointercancel', this.onPointerUp);
    this.input.on<WheelEvent>('wheel', this.onMouseWheel);
    this.input.on<MouseEvent>('contextmenu', this.onContextMenu);
    this.input.on<KeyboardEvent>('keydown', this.interceptControlDown);

  }

  private disconnect() {

    this.input.remove<PointerEvent>('pointerdown', this.onPointerDown);
    this.input.remove<PointerEvent>('pointermove', this.onPointerMove);
    this.input.remove<PointerEvent>('pointerup', this.onPointerUp);
    this.input.remove<PointerEvent>('pointercancel', this.onPointerUp);
    this.input.remove<WheelEvent>('wheel', this.onMouseWheel);
    this.input.remove<MouseEvent>('contextmenu', this.onContextMenu);
    this.input.remove<KeyboardEvent>('keydown', this.interceptControlDown);

  }

  public dispose() {

    this.disconnect();

    this.input.dispose();
  }

  private addPointer(event: PointerEvent) {

    this.pointers.push(event.pointerId);

  }

  private removePointer(event: PointerEvent) {

    delete this.pointerPositions[event.pointerId];

    for (let i = 0; i < this.pointers.length; i++) {

      if (this.pointers[i] === event.pointerId) {

        this.pointers.splice(i, 1);
        return;

      }
    }
  }

  private isTrackingPointer(event: PointerEvent): boolean {

    for (let i = 0; i < this.pointers.length; i++) {

      if (this.pointers[i] === event.pointerId) return true;

    }

    return false;

  }

  private trackPointer(event: PointerEvent) {

    let position = this.pointerPositions[event.pointerId];

    if (position === undefined) {

      position = new Vector2();
      this.pointerPositions[event.pointerId] = position

    }

    position.set(event.pageX, event.pageY)

  }

  public getSecondPointerPosition(event: PointerEvent) {

    const pointerId = (event.pointerId === this.pointers[0]) ? this.pointers[1] : this.pointers[0];

    return this.pointerPositions[pointerId]
  }

  private onPointerDown = (event: PointerEvent) => {
    // if (!this.enabled) return;

    /**
     * Pointers is an array tracking all active pointers (for multitouch support)
     * If no pointers are currently active, this is the first pointer
     * (like the first finger touch on the screen)
     */
    if (this.pointers.length === 0) {
      /**
       * Capture the pointer
       *
       * @remarks
       * setPointerCapture(pointerId) - tells the browser to sent all future pointer
       * events (move, up) for this pointer to this element, even if the pointer moves
       * outside of it.
       *  Essential for dragging
       */
      this.element.setPointerCapture(event.pointerId);

      /**
       * Adding global event listeners
       *
       * @remarks
       * Adds pointermove and pointerup listeners to the entire document, not just
       * the canvas.
       * This ensures the drag continues even if the pointer moves outside the canvas.
       * onPointerMove and onPointerUp are internal functions that handle dragging and
       * releasing the pointer
       */
      this.element.ownerDocument.addEventListener('pointermove', this.onPointerMove);
      this.element.ownerDocument.addEventListener('pointerup', this.onPointerUp);
    }

    /**
     * Checks if this pointer is already being tracked (e.g. in pointers)
     * prevents adding same poiner twice
     */
    if (this.isTrackingPointer(event)) return;

    /**
     * Stores the pointer info (id, type, position) in pointers
     * This is important for multi-touch gestures, like pinch-to-zoom
     */
    this.addPointer(event);

    /**
     * Handles touch vs mouse/pen seperation
     *
     * @remarks
     * pointerType distinguishes the input type
     * -  "touch"
     * -  "mouse"
     * -  "pen"
     */
    if (event.pointerType === 'touch') {

      this.onTouchStart(event);

    } else {

      this.onMouseDown(event);

    }

  }

  /**
   * Given a generic PointerEvent, forward it to the correct handler
   *
   * @remarks
   * - Mouse -> Buttons + movement
   * - Pen -> Buttons + movement (stylus behaves like pen)
   * - Touch -> Gestures
   *
   * @param event - PointerEvent
   */
  private onPointerMove = (event: PointerEvent): void => {
    // if (!this.enabled) return;

    if (event.pointerType === 'touch') {

      this.onTouchMove(event);

    } else {

      this.onMouseMove(event);

    }
  }

  private onPointerUp = (event: PointerEvent) => {

    /**
     * It updates the internal model of “which pointers are currently active”.
     *
     * @remarks
     * Why this must happen first
     * - Everything that happens next depends on how many pointers remain
     *
     */
    this.removePointer(event);

    // swtiching on how many pointers that are still down
    switch (this.pointers.length) {

      // all pointers released
      // - the last finger lifted
      // - the mouse button released
      // - the interaction is over
      case 0:

        // release pointer capture
        this.element.releasePointerCapture(event.pointerId);

        // remove global listeners
        this.element.ownerDocument.removeEventListener('pointermove', this.onPointerMove);
        this.element.ownerDocument.removeEventListener('pointerup', this.onPointerUp);

        // this.dispatchEvent(endEvent);

        // end interaction state
        this.state = this.controls._STATE.NONE;

        break;

      /**
       * one pointer remains
       *
       * @remark
       * Scenario
       * - two fingers are down (pinch)
       * - one finger lifts
       * - one finger remains
       */
      case 1:

        /**
         * Get the remaining pointer
         *
         * @remarks
         * Retrieves
         * - the remaining pointer's identity
         * - the last known position
         *
         * this is state recovery, not event handling
         */
        const pointerId = this.pointers[0];
        const position = this.pointerPositions[pointerId];

        /**
         * Fake new touch
         *
         * @remarks
         * not responding to new browser event
         * synthesizing a semantic event
         * treat the remaining finger as if it started a new gesture
         * this prevents
         * - sudden jumps
         * - broken deltas
         * - gesture discontinuities
         */
        // minimal placeholder event - allows state correction on pointer-up
        // this.onTouchStart({ pointerId, pageX: position.x, pageY: position.y });
        this.onTouchStart(event);
    }
  }

  /**
   * Where raw mouse moves turn into orbit-control intent
   *
   * from mouse syntax to camera semantics
   * - mouse speaks in buttons
   * - camera understands motions
   *
   * @remarks
   * The problem this solves
   * The mouse gives love-level facts
   * - which button was pressed (event.button)
   * - which modifier keys are held (ctrl, shift, meta)
   *
   * But an orbit controller needs intent
   * - rotate the camera
   * - pan the camera
   * - zoom the camera
   *
   * This function is a translation layer between
   * physical device state - camera manipulation intent
   *
   * @param event - MouseEvent
   * @returns void
   */
  private onMouseDown(event: PointerEvent) {

    let mouseAction: number;

    /**
     * Physical input -> logical action
     *
     * @remarks
     * This switch answers:
     * what logical action does the physical button represent,
     * not what button was pressed
     */
    switch (event.button) {

      case 0:

        mouseAction = this.controls.mouseButtons.LEFT;
        break;

      case 1:
        mouseAction = this.controls.mouseButtons.MIDDLE;
        break;

      case 2:
        mouseAction = this.controls.mouseButtons.RIGHT;
        break;

      default:
        mouseAction = -1;
    }

    /**
     * Logical action -> control (intent) mode
     */
    switch (mouseAction) {

      /**
       * User intends to zoom
       * - check capability
       * - initialize dolly gesture
       * - enter DOLLY state
       *
       * After this
       * - mouse movement will be interpreted as zoom deltas
       * - this state persists until mouse up
       */
      case MOUSE.DOLLY:

        if (this.controls.enableZoom == false) return;

        this.controls.handleMouseDownDolly(event);

        this.state = this.controls._STATE.DOLLY;

        break

      /**
       * Rotation is default intent but modifier keys override
       * meaning to pan
       */
      case MOUSE.ROTATE:

        // with modifiers -> pan
        if (event.ctrlKey || event.metaKey || event.shiftKey) {

          if (this.enablePan === false) return;

          this.controls.handleMouseDownPan(event);

          this.state = this.controls._STATE.PAN;

          // without modifiers -> rotate
        } else {

          if (this.enableRotate === false) return;

          this.controls.handleMouseDownRotate(event);

          this.state = this.controls._STATE.ROTATE;
        }

        break;

      // mirrors rotation but inverted
      case MOUSE.PAN:

        if (event.ctrlKey || event.metaKey || event.shiftKey) {

          if (this.enableRotate === false) return;

          this.controls.handleMouseDownRotate(event);

          this.state = this.controls._STATE.ROTATE;

        } else {

          if (this.enablePan === false) return;

          this.controls.handleMouseDownPan(event);

          this.state = this.controls._STATE.PAN
        }

        break;

      default:

        this.state = this.controls._STATE.NONE
    }

    // did anything actually start?
    if (this.state !== this.controls._STATE.NONE) {

      // TODO: dispatch event
      // this.dispatchEvent(startEvent);
    }
  }

  /**
   * Where onMoueseDown decides intent, onMouseMove executes that intent
   * based on the current state
   *
   * @remarks
   * The problem this solves:
   * Given a mouse movement, perform the correct camera manipulation according
   * to the current interaction state
   *
   * - it does not care about buttons or modifiers
   * - those were handled in the onMouseDown
   *
   * @param event
   * @returns
   */
  private onMouseMove(event: PointerEvent) {

    // state set by onMouseDown
    switch (this.state) {

      case this.controls._STATE.ROTATE:

        if (this.enableRotate === false) return;

        this.controls.handleMouseMoveRotate(event);

        break;

      case this.controls._STATE.DOLLY:

        if (this.controls.enableZoom === false) return;

        this.controls.handleMouseMoveDolly(event);

        break;

      case this.controls._STATE.PAN:

        if (this.enablePan === false) return;

        this.controls.handleMouseMovePan(event);

        break;
    }
  }

  /**
   * Mouse wheel zoom is not a drag gesture:
   * - no pointer capture
   * - no continuous pressed state
   * - no start -> move -> end lifecycle in the same sense ad mouse/touch
   *
   * It's more like a stateles impulse
   * - apply an instantaneous zoom delta right now, if allowed
   * - not enter dolly mode
   * - not track movement
   * - not capture pointer
   *
   * That's why this function does not use _STATE.DOLLY or pointer tracking
   *
   * @param event - MouseEvent
   */
  private onMouseWheel = (event: WheelEvent): void => {

    // TODO: check if this line should be uncommented
    // if (this.enabled === false || this.enableZoom == false || this.state !== _STATE.NONE) return;

    /**
     * stops browser scroll / page zoom
     * required for:
     * - canvas interactions
     * - webgl viewers
     * - fullscreen scenes
     *
     * without this:
     * - page scrolls instead of zooming camera
     * - trackpads feel broken
     */
    event.preventDefault();

    // TODO: check if to uncomment
    // this.controls.dispatchEvent(startEvent);

    this.controls.handleMouseWheel(this.controls.customWheelEvent(event));

    // this.dispatchEvent(_endEvent);

  }

  private onKeyDown(event: KeyboardEvent) {
    // if (this.enabled == false) return;

    this.controls.handleKeyDown(event);
  }

  /**
   * Maps raw touches to high-level gestures
   *
   * The user touched the screen; now decide what interaction is intended
   * and initialize correct state
   *
   * @remarks
   * Unlike the mouse, touch can have
   * - 1 finger -> rotate or pan
   * - 2 fingers -> dolly + pan, dolly + rotate, pinch/zoom
   * - 3+ fingers -> maybe ignored or custom gestures
   *
   * So this function is gesture interpretation + state amchine entry point
   *
   * @param event: PointerEvent
   * @returns void
   */
  private onTouchStart(event: PointerEvent) {

    /**
     * Track the pointer
     *
     * @remarks
     * this function:
     * - stores the pointer ID
     * - stores current coordinates
     * - allows multi-touch tracking
     * - essential for pinch/zoom, pan gestures
     *
     * Without it, you cannot know which fingers are active
     */
    this.trackPointer(event);

    // switch on number of pointers
    // similar to _STATE logic in the mouse, but touch requires
    // gesture multiplexing
    switch (this.pointers.length) {

      // simple gestures
      case 1:

        switch (this.controls.touches.ONE) {

          case TOUCH.ROTATE:

            if (this.enableRotate === false) return;

            this.controls.handleTouchStartRotate(event);

            this.state = this.controls._STATE.TOUCH_ROTATE;

            break;

          case TOUCH.PAN:

            if (this.enablePan === false) return;

            this.controls.handleTouchStartPan(event);

            this.state = this.controls._STATE.TOUCH_PAN;

            break;

          default:

            this.state = this.controls._STATE.NONE;
        }

        break;

      // multi-touch gestures
      // Note: Two-finger gestures requires tracking both pointers and delta computation
      // the trackPointer function ensures you can compute
      // distance delta (zoom) and average motion delta (pan/rotate)
      case 2:

        switch (this.controls.touches.TWO) {

          case TOUCH.DOLLY_PAN:

            if (this.controls.enableZoom === false && this.enablePan === false) return;

            this.controls.handleTouchStartDollyPan(event);

            this.state = this.controls._STATE.TOUCH_DOLLY_PAN;

            break;

          case TOUCH.DOLLY_ROTATE:

            if (this.controls.enableZoom === false && this.enableRotate === false) return;

            this.controls.handleTouchStartDollyRotate(event);

            this.state = this.controls._STATE.TOUCH_DOLLY_ROTATE;

            break;

          default:

            this.state = this.controls._STATE.NONE;
        }

        break;

      default:

        this.state = this.controls._STATE.NONE;
    }

    if (this.state !== this.controls._STATE.NONE) {

      // TODO: dispatch the event
      // this.dispatchEvent(startEvent);
    }
  }

  /**
   * Wehre raw movement deltas are converted into camera or scene actions
   *
   * Run whatever gesture is currently active based on the pointer movement
   *
   * @remarks
   * Given the current active touch pointers and current gesture state,
   * perform the correct camera action (rotate, pan, dolly, etc.)
   * and update the system
   *
   * - It's not deciding intent - that was do ne in onTouchStart
   * - It's executing the action
   *
   *
   * @param event
   * @returns
   */
  private onTouchMove(event: PointerEvent) {

    /**
     * Updates the stored position of the pointer(s)
     *
     * - Essential for multii-finger gestures
     * - Lets subsequent handlers compute deltas (movement, distance changes)
     * - Without these, gestures would jump or break
     */
    this.trackPointer(event);

    // Actions determined entirely by _STATE, not button/modifiers
    //  or number of touches
    // _STATE was set by onTouchStart based on gesture intent
    switch (this.state) {

      case this.controls._STATE.TOUCH_ROTATE:

        if (this.enableRotate === false) return;

        this.controls.handleTouchMoveRotate(event);

        this.controls.update();

        break;

      case this.controls._STATE.TOUCH_PAN:

        if (this.enablePan === false) return false;

        this.controls.handleTouchMovePan(event);

        this.controls.update();

        break;

      case this.controls._STATE.TOUCH_DOLLY_PAN:

        if (this.controls.enableZoom === false && this.enablePan === false) return;

        this.controls.handleTouchMoveDollyPan(event);

        this.controls.update();

        break;

      case this.controls._STATE.TOUCH_DOLLY_ROTATE:

        if (this.controls.enableZoom === false && this.enableRotate === false) return;

        this.controls.handleTouchMoveDollyRotate(event);

        this.controls.update();

        break;

      default:

        this.state = this.controls._STATE.NONE;
    }
  }

  /**
   * Prevents browser context menu from appearing
   * Ensure uninterrupted camera interactions on
   * - right click
   * - touch long press
   * - stylus press
   * @param event
   */
  private onContextMenu(event: Event) {

    // if (this.enabled === false) return;

    event.preventDefault();
  }

  /**
   * Detects when the Control key is pressed
   *
   * Why not just use event.ctrlKey
   * - event.ctrlKey only reflects this event
   * - pointer events need to know if Control is still held
   * - focus may move
   * - pointer capture may be active
   * @param event
   */
  private interceptControlDown = (event: KeyboardEvent) => {

    if (event.key === 'Control') {

      this.controls.controlActive = true;

      /**
       * Why getRootNode() matters
       * This ensures compactibility with
       * - shadow DOM
       * - offscreen canvas
       * - embedded rendering
       *
       * instead of assuming window.document, you attach to the correct event root
       */
      // offscreen canvas compactibility
      const document = this.element.getRootNode();

      /**
       * Why {capture: true} is essential
       * - ensures keyup is caught before propagation is stopped
       * - prevents control stuck down forever bug
       *
       * Why {passive: true}
       * - signals no preventDefault() will be used
       * - allow browser optimization
       */
      document.addEventListener('keyup', this.interceptControlUp,
        { passive: true, capture: true }
      );
    }
  }

  private interceptControlUp = (event: Event) => {

    if (!(event instanceof KeyboardEvent)) return;

    if (event.key === 'Control') {

      this.controls.controlActive = false;

      // offscreen canvas compactibility
      const document = this.element.getRootNode();

      document.removeEventListener('keyup', this.interceptControlUp,
        {/* passive: true, */ capture: true }
      );
    }
  }


}
