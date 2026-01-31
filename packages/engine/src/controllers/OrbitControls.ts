import { Plane } from '../math/Plane';
import { Quaternion } from '../math/Quaternion';
import { Ray } from '../math/Ray';
import { Spherical } from "../math/Spherical";
import { Vector2 } from "../math/Vector2";
import { Vector3 } from "../math/Vector3";
import { MathUtils } from "../math/MathUtils";
import { Controls } from "./Controls";
import { MOUSE, TOUCH } from "../constants";
import { Matrix4 } from "../math/Matrix4";
import { isPerspectiveCamera, PerspectiveCamera } from "../cameras/PerspectiveCamera";
import { isOrthographicCamera, OrthographicCamera } from "../cameras/OrthographicCamera";
import { InputOrbitMapper } from './InputOrbitMapper';

// Controller orchestration (optional but powerful)
// For larger systems:

// export class ControllerSystem {
//   private controllers: Controller<any>[] = [];

//   add(controller: Controller<any>) {
//     this.controllers.push(controller);
//   }

//   update(dt: number) {
//     for (const c of this.controllers) {
//       if (c.enabled) c.update(dt);
//     }
//   }

//   dispose() {
//     for (const c of this.controllers) c.dispose();
//   }
// }

// This mirrors ECS-style thinking without forcing ECS.

/**
 * Fires when the camera has been transformed by the controls.
 *
 */
const changeEvent = { type: 'change' };

/**
 * Fires when an interaction was initiated.
 *
 */
const startEvent = { type: 'start' };

/**
 * Fires when an interaction has finished.
 *
 */
const endEvent = { type: 'end' };

const _ray = new Ray();
const _plane = new Plane();
const _TILT_LIMIT = Math.cos(70 * MathUtils.DEG2RAD);

const _v = new Vector3();
const _twoPI = 2 * Math.PI;

const EPS = 0.000001;

/**
 * Orbit controls allow the camera to orbit around a target.
 *
 * OrbitControls performs orbiting, dollying (zooming), and panning. Unlike {@link TrackballControls},
 * it maintains the "up" direction `object.up` (+Y by default).
 *
 * - Orbit: Left mouse / touch: one-finger move.
 * - Zoom: Middle mouse, or mousewheel / touch: two-finger spread or squish.
 * - Pan: Right mouse, or left mouse + ctrl/meta/shiftKey, or arrow keys / touch: two-finger move.
 *
 * ```js
 * const controls = new OrbitControls( camera, renderer.domElement );
 *
 * // controls.update() must be called after any manual changes to the camera's transform
 * camera.position.set( 0, 20, 100 );
 * controls.update();
 *
 * function animate() {
 *
 * 	// required if controls.enableDamping or controls.autoRotate are set to true
 * 	controls.update();
 *
 * 	renderer.render( scene, camera );
 *
 * }
 * ```
 *
 * @augments Controls
 */
export class OrbitControls extends Controls<PerspectiveCamera | OrthographicCamera> {
  public target: Vector3 = new Vector3();

  public enabled = true;

  public _STATE = {
    NONE: - 1,
    ROTATE: 0,
    DOLLY: 1,
    PAN: 2,
    TOUCH_ROTATE: 3,
    TOUCH_PAN: 4,
    TOUCH_DOLLY_PAN: 5,
    TOUCH_DOLLY_ROTATE: 6
  };

  /**
   * The internal state of the controls.
   *
   * @default -1
   */
  public state: number = this._STATE.NONE;

  /**
   * The focus point of the `minTargetRadius` and `maxTargetRadius` limits
   * It can be update manually at any point to change the center of interest
   * for the `focus`
   */
  public cursor = new Vector3();

  /**
   * How far you can dolly in (perspective camera only)
   */
  public minDistance = 0;

  /**
   * How far you can dolly out (perspective camera only)
   */
  public maxDistance = Infinity;

  /**
   * How far you can zoom in (orthographic camera only)
   */
  public minZoom = 0;

  /**
   * How far you can zoom out (orthographic camera only)
   */
  public maxZoom = 0;

  /**
   * How close you can get the target to the 3D cursor
   */
  public minTargetRadius = 0;

  /**
   * How far y ou can mvoe the target from the 3d cursor
   */
  public maxTargetRadius = Infinity;

  /**
   * How far you can orbit vertically, lower limit.
   * Range is [0, Math.PI] radians
   */
  public minPolarAngle = 0;

  /**
   * How far you can orbit vertically, upper limit
   * Range is [0, Math.PI] radians
   */
  public maxPolarAngle = Math.PI;

  /**
   * How far you can orbit horizontally, lower limit
   * If set, the interval [min, max] must be a sub-interval of
   * [-2 PI, 2 PI] with (max - min < 2 PI)
   */
  public minAzimuthAngle = -Infinity;

  /**
   * How far you can orbit horizontally, upper limit.
   * If set, the interval [min, max] must be a sub-interval of
   * [-2 PI, 2 PI], with (max - min < 2 PI)
   */
  public maxAzimuthAngle = Infinity;

  /**
   * Set to true to enable damping (inertia), which can be used to give a sense
   * of weight to the controls.
   *
   * @remarks
   * If this is enabled, you must call update() in your animation loop
   */
  public enableDamping = false;

  /**
   * The damping inertia used if enableDamping is set to true
   *
   * @remarks
   * For this to work, you must call update() in your animation loop
   */
  public dampingFactor = 0.05;

  /**
   * Enable or disable zooming (dollying) of the camera
   *
   */
  public enableZoom = true;

  /**
   * Speed of zooming / dollying
   *
   */
  public zoomSpeed = 1.0;

  /**
   * Enable or disable horizontal and vertical rotation of the camera
   *
   * Note that it is possible to disable a single axis by setting the
   * min and max of the minPolarAngle or minAzimuthAngle to the same value,
   * which will cause the vertical or horizontal rotation to be fixed at
   * that value
   */
  public enableRotate = true;

  /**
   * Speed of rotation
   *
   */
  public rotateSpeed = 1.0;

  /**
   * How fast to rotate the camera when the keyboard is used
   *
   */
  public keyRotateSpeed = 1.0;

  /**
   * Enable or disable camera panning
   *
   */
  public enablePan = true;

  /**
   * Speed of panning
   */
  public panSpeed = 1.0;

  /**
   * Defines how the camera's position is translated when panning. If `true`, the camera pans
   * in screen space. Otherwise, the camera pans in the plane orthogonal to the camera's up
   * direction.
   *
   */
  public screenSpacePanning = true;

  /**
   * How fast to pan the camera when the keyboard is used in pixels per keypress
   *
   */
  public keyPanSpeed = 7.0;

  /**
   * Setting this property to true allows to zoom to the cursor's position
   *
   */
  public zoomToCursor = false;

  /**
   * Set to true to automatically rotate around the target
   *
   * Note that if this is enabled, you must call `update()` in your animation loop.
   * If you want the auto-rotate speed to be independent of the frame rate (the refresh
   * rate of the display), you must pass the time `deltaTime`, in seconds, to `update()`.
   *
   */
  public autoRotate = false;

  /**
   * How fast to rotate around the target if autoRotate is true
   * The default equates to 30 seconds per orbit at 60fps.
   *
   * @remarks
   * If autoRotate is enabled, you must call update() in your animation loop
   */
  public autoRotateSpeed = 2.0;

  /**
    * This object contains references to the keycodes for controlling camera panning.
    *
    * ```js
    * controls.keys = {
    * 	LEFT: 'ArrowLeft', //left arrow
    * 	UP: 'ArrowUp', // up arrow
    * 	RIGHT: 'ArrowRight', // right arrow
    * 	BOTTOM: 'ArrowDown' // down arrow
    * }
    * ```
    */
  private keys = { LEFT: 'ArrowLeft', UP: 'ArrowUp', RIGHT: 'ArrowRight', BOTTOM: 'ArrowDown' };

  /**
   * This object contains references to the mouse actions used by the controls.
   *
   * ```js
   * controls.mouseButtons = {
   * 	LEFT: MOUSE.ROTATE,
   * 	MIDDLE: MOUSE.DOLLY,
   * 	RIGHT: MOUSE.PAN
   * }
   * ```
   */
  public mouseButtons = { LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN };

  /**
* This object contains references to the touch actions used by the controls.
*
* ```js
* controls.mouseButtons = {
* 	ONE: TOUCH.ROTATE,
* 	TWO: TOUCH.DOLLY_PAN
* }
* ```
*/
  public touches = { ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN };

  /**
   * Used internally by saveState() and reset()
   *
   */
  private target0 = this.target.clone();

  /**
   * Used internally by saveState() and reset()
   *
   */
  private position0: Vector3;

  /**
   * Used internally by saveState() and reset()
   *
   */
  private zoom0: number;

  // the target DOM element for key events
  private domElementKeyEvents: HTMLElement | null = null;



  // internals
  private lastPosition = new Vector3();
  private lastQuaternion = new Quaternion();
  private lastTargetPosition = new Vector3();

  // so camera.up is the orbit axis
  private quat: Quaternion;
  private quatInverse: Quaternion;

  // current position in spherical coordinates
  private spherical = new Spherical();
  private sphericalDelta = new Spherical();

  private scale = 1;
  private panOffset = new Vector3();

  private rotateStart = new Vector2();
  private rotateEnd = new Vector2();
  private rotateDelta = new Vector2();

  private panStart = new Vector2();
  private panEnd = new Vector2();
  private panDelta = new Vector2();

  private dollyStart = new Vector2();
  private dollyEnd = new Vector2();
  private dollyDelta = new Vector2();

  private dollyDirection = new Vector3();
  private mouse = new Vector2();
  private performCursorZoom = false;

  public controlActive = false;

  private readonly mapper: InputOrbitMapper;

  /**
   * Constructs a new OrbitControl
   *
   * @param object - The camera to control
   * @param domElement - The DOM element to use for event listening
   * @param input
   */
  constructor(
    object: PerspectiveCamera | OrthographicCamera,
    domElement: HTMLElement
  ) {

    super(object, domElement);

    this.object = object;

    this.position0 = this.object.position.clone();

    this.zoom0 = object.zoom;


    this.quat = new Quaternion().setFromUnitVectors(object.up, new Vector3(0, 1, 0));
    this.quatInverse = this.quat.clone().invert();

    // TODO: check if this is necessary
    if (this.domElement !== null) {

      // this.connect();
    }

    this.mapper = new InputOrbitMapper(this);

    this.update();
  }

  public connect(): void {

    this.mapper.connect();

  }

  // public disconnect(): void { }

  public dispose(): void {

    // this.disconnect();

    this.mapper.dispose();
  }

  /**
   * Gets the current vertical rotation, in radians.
   *
   * @returns The current vertical rotation, in radians
   */
  public getPolarAngle(): number {

    return this.spherical.phi;

  }

  /**
   * Gets the current horizontal rotation, in radians
   *
   * @returns the current horizontal rotation, in radians.
   */
  public getAzimuthAngle(): number {

    return this.spherical.theta;

  }

  /**
   * Returns the distance from the camera to the target.
   *
   * @returns The distance from the camera to the target
   */
  public getDistance(): number {

    return this.object.position.distanceTo(this.target);

  }

  // TODO: these touch the DOM - check if there should be here
  // /**
  //  * Adds key event listeners to the given DOM element
  //  * window is a recommended argument for using this method
  //  *
  //  * @param domElement - The DOM element
  //  */
  // public listenToKeyEvents(domElement: HTMLElement): void {

  //   domElement.addEventListener('keydown', this.onKeyDown);
  //   this.domElementKeyEvents = domElement;
  // }

  // public stopListenToKeyEvents() {

  //   if (this.domElementKeyEvents !== null) {

  //     this.domElementKeyEvents.removeEventListener('keydown', this.onKeyDown);
  //     this._domElementKeyEvents = null;
  //   }
  // }

  /**
   * Save the current state of the controls
   * This can later be recovered with reset()
   *
   */
  public saveState() {

    this.target0.copy(this.target);
    this.position0.copy(this.object.position);
    this.zoom0 = this.object.zoom;

  }

  /**
   * Reset the controls to their state from either the last time
   * the setState() was called, or the initial state
   *
   */
  public reset() {

    this.target.copy(this.target0);
    this.object.position.copy(this.position0);
    this.object.zoom = this.zoom0;

    this.object.updateProjectionMatrix();
    this.dispatchEvent(changeEvent);

    this.update();

    this.state = this._STATE.NONE;
  }



  // /**
  //  * Programmatically pan the camera
  //  *
  //  * @param deltaX - The horizontal pan amount in pixels
  //  * @param deltaY - The vertical pan amount in pixels
  //  */
  // public pan(deltaX: number, deltaY: number): void {

  //   this._pan(deltaX, deltaY);
  //   this.update();

  // }

  // /**
  //  * Programmatically dolly in (zoom in for perspective camera)
  //  *
  //  * @param dollyScale - The dolly scale factor
  //  */
  // public dollyIn(dollyScale: number): void {

  //   this._dollyIn(dollyScale);
  //   this.update();

  // }

  // /**
  //  * Programmatically dolly out (zoom out for perspective camera)
  //  *
  //  * @param dollyScale - The dolly scale factor
  //  */
  // public dollyOut(dollyScale: number): void {

  //   this._dollyOut(dollyScale);
  //   this.update();

  // }

  // /**
  //  * Programmatically rotate the camera left (around the vertical axis)
  //  *
  //  * @param angle - The rotation angle in radians
  //  */
  // public rotateLeft(angle: number): void {

  //   this._rotateLeft(angle);
  //   this.update();

  // }

  // /**
  //  * Programmatically rotate the camera up (around the horizontal axis)
  //  *
  //  * @param angle - The rotation angle in radians
  //  */
  // public rotateUp(angle: number): void {

  //   this._rotateUp(angle);
  //   this.update();

  // }

  /**
   * Takes all the intent accumulated since the last frame
   * - rotation deltas
   * - pan offsets
   * - zoom scale
   * - damping
   * - inertia
   * - constraints
   * - unified update loop
   * - auto rotate
   * and resolves it into a new camera position + orientation
   *
   * @remarks
   * Think of it as commit all pending control inputs to the camera
   *
   * @param deltaTime
   * @returns true if anything actually changed, false otherwise
   */
  public update(deltaTime: number | null = null): boolean {

    /** update does exactly this pipeline every frame */
    //   camera position
    //   ↓
    // offset from target
    //   ↓
    // convert to spherical
    //   ↓
    // apply rotation / pan / zoom intents
    //   ↓
    // clamp & stabilize
    //   ↓
    // convert back to cartesian
    //   ↓
    // set camera position + lookAt
    //   ↓
    // decay deltas
    //   ↓
    // emit change event if needed

    /**
     * Compute camera offset relative to target
     * _v = cameraPosion - target
     */
    const position = this.object.position;

    _v.copy(position).sub(this.target);

    // rotate offset to "y-axis-is-up" space
    // orbitcontrols assume Y is up
    // _quat rotates from camera-up space to Y-up space
    // this simplifies spherical math
    // convert to a clean reference frame before math
    _v.applyQuaternion(this.quat);

    // angle from z-axis around y-axis
    /**
     * Convert cartesian offset -> spherical coordinates
     *
     * Now we have:
     * - radius = distance to target
     * - phi = vertical angle
     * - theta = horizontal angle
     *
     * This is the core representation used for orbiting
     */
    this.spherical.setFromVector3(_v);

    /**
     * Auto-rotation (idle spin)
     *
     * - if autorotate is enabled
     * - user is not interacting
     * - slowly adjust theta
     *
     * This does not move camera yet - It only updates deltas
     */
    if (this.autoRotate && this.state === this._STATE.NONE) {

      this._rotateLeft(this.getAutoRotationAngle(deltaTime));

    }

    /**
     * Apply rotation deltas (with or without damping)
     *
     * - user input modifies sphericalDelta
     * - update() consumes part of that delta per frame
     *
     * - damping = inertia
     * - no damping = immediate response
     */
    if (this.enableDamping) {

      this.spherical.theta += this.sphericalDelta.theta * this.dampingFactor;
      this.spherical.phi += this.sphericalDelta.phi * this.dampingFactor;

    } else {

      this.spherical.theta += this.sphericalDelta.theta;
      this.spherical.phi += this.sphericalDelta.phi;

    }

    // restrict theta to be between desired limits
    /**
     * Clamp horizontal rotation (azimuth limits)
     *
     * Ensures theta E [minAzimuthAngle, maxAzimuthAngle]
     *
     * Special care is taken because:
     * - angles wrap at +/- PI
     * - range may cross wrap boundary
     *
     * this prevents weird snapping
     */
    let min = this.minAzimuthAngle;
    let max = this.maxAzimuthAngle;

    if (isFinite(min) && isFinite(max)) {

      if (min < - Math.PI) min += _twoPI; else if (min > Math.PI) min -= _twoPI;

      if (max < - Math.PI) max += _twoPI; else if (max > Math.PI) max -= _twoPI;

      if (min <= max) {

        this.spherical.theta = Math.max(min, Math.min(max, this.spherical.theta));

      } else {

        this.spherical.theta = (this.spherical.theta > (min + max) / 2) ?
          Math.max(min, this.spherical.theta) :
          Math.min(max, this.spherical.theta);

      }

    }

    // restrict phi to be between desired limits
    /**
     * Clamp vertical rotation (polar limits)
     *
     * - prevents flipping over the poles
     * - avoids gimbal singularities at phi = 0 or PI
     *
     * Critical for camera stability
     */
    this.spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this.spherical.phi));

    this.spherical.makeSafe();


    // move target to panned location
    /**
     * Apply panning to the target
     *
     * @remarks
     * panning moves the target, not the camera
     * the camera later repositions itself around the new target
     */
    if (this.enableDamping === true) {

      this.target.addScaledVector(this.panOffset, this.dampingFactor);

    } else {

      this.target.add(this.panOffset);

    }

    // Limit the target distance from the cursor to create a sphere around the center of interest
    /**
     * Clamp target withing a radius around cursor
     *
     * - this limits how far the focus point can drift
     *
     * - don't let the orbit center fly away
     */
    this.target.sub(this.cursor);
    this.target.clampLength(this.minTargetRadius, this.maxTargetRadius);
    this.target.add(this.cursor);

    let zoomChanged = false;

    // adjust the camera position based on zoom only if we're not zooming to the cursor or if it's an ortho camera
    // we adjust zoom later in these cases
    /**
     * Handle zoom
     *
     * case A: normal zoom
     * - zoom is justs scaling the orbit radius
     * - clamping min/max distance
     *
     * case B: zoom-to-cursor (hard part)
     * Perspective camera:
     * - move camera along the mouse ray
     * - preserver cursor focus
     * - avoid floating-point drift
     *
     * Orthographic camera:
     * - change zoom
     * - re-project mouse position before and after
     * - offset camera to keep cursor stable
     */
    if (this.zoomToCursor && this.performCursorZoom || isOrthographicCamera(this.object)) {

      this.spherical.radius = this.clampDistance(this.spherical.radius);

    } else {

      const prevRadius = this.spherical.radius;
      this.spherical.radius = this.clampDistance(this.spherical.radius * this.scale);
      zoomChanged = prevRadius != this.spherical.radius;

    }

    /**
     * Convert spherical -> cartesian offset
     */
    _v.setFromSpherical(this.spherical);

    // rotate offset back to "camera-up-vector-is-up" space
    _v.applyQuaternion(this.quatInverse);

    position.copy(this.target).add(_v);

    /**
     * Orient camera toward target
     */
    this.object.lookAt(this.target);

    /**
     * Decay deltas (damping cleanup)
     * or zeroed if damping is off
     *
     * This is what creates smooth stopping
     */
    if (this.enableDamping === true) {

      this.sphericalDelta.theta *= (1 - this.dampingFactor);
      this.sphericalDelta.phi *= (1 - this.dampingFactor);

      this.panOffset.multiplyScalar(1 - this.dampingFactor);

    } else {

      this.sphericalDelta.set(0, 0, 0);

      this.panOffset.set(0, 0, 0);

    }

    // adjust camera position
    if (this.zoomToCursor && this.performCursorZoom) {

      let newRadius = null;
      if (isPerspectiveCamera(this.object)) {

        // move the camera down the pointer ray
        // this method avoids floating point error
        const prevRadius = _v.length();
        newRadius = this.clampDistance(prevRadius * this.scale);

        const radiusDelta = prevRadius - newRadius;
        this.object.position.addScaledVector(this.dollyDirection, radiusDelta);
        this.object.updateMatrixWorld();

        zoomChanged = !!radiusDelta;

      } else if (isOrthographicCamera(this.object)) {

        // adjust the ortho camera position based on zoom changes
        const mouseBefore = new Vector3(this.mouse.x, this.mouse.y, 0);
        mouseBefore.unproject(this.object);

        const prevZoom = this.object.zoom;
        this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this.scale));
        this.object.updateProjectionMatrix();

        zoomChanged = prevZoom !== this.object.zoom;

        const mouseAfter = new Vector3(this.mouse.x, this.mouse.y, 0);
        mouseAfter.unproject(this.object);

        this.object.position.sub(mouseAfter).add(mouseBefore);
        this.object.updateMatrixWorld();

        newRadius = _v.length();

      } else {

        console.warn('WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled.');
        this.zoomToCursor = false;

      }

      // handle the placement of the target
      if (newRadius !== null) {

        if (this.screenSpacePanning) {

          // position the orbit target in front of the new camera position
          this.target.set(0, 0, - 1)
            .transformDirection(this.object.matrix)
            .multiplyScalar(newRadius)
            .add(this.object.position);

        } else {

          // get the ray and translation plane to compute target
          _ray.origin.copy(this.object.position);
          _ray.direction.set(0, 0, - 1).transformDirection(this.object.matrix);

          // if the camera is 20 degrees above the horizon then don't adjust the focus target to avoid
          // extremely large values
          if (Math.abs(this.object.up.dot(_ray.direction)) < _TILT_LIMIT) {

            this.object.lookAt(this.target);

          } else {

            _plane.setFromNormalAndCoplanarPoint(this.object.up, this.target);
            _ray.intersectPlane(_plane, this.target);

          }

        }

      }

    } else if (isOrthographicCamera(this.object)) {

      const prevZoom = this.object.zoom;
      this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this.scale));

      if (prevZoom !== this.object.zoom) {

        this.object.updateProjectionMatrix();
        zoomChanged = true;

      }

    }

    /**
     * Update zoom state & reset accumulators
     *
     * deltas are one-frame intents, not persitent state
     */
    this.scale = 1;
    this.performCursorZoom = false;

    // update condition is:
    // min(camera displacement, camera rotation in radians)^2 > EPS
    // using small-angle approximation cos(x/2) = 1 - x^2 / 8

    if (zoomChanged ||
      this.lastPosition.distanceToSquared(this.object.position) > EPS ||
      8 * (1 - this.lastQuaternion.dot(this.object.quaternion)) > EPS ||
      this.lastTargetPosition.distanceToSquared(this.target) > EPS) {

      this.dispatchEvent(changeEvent);

      this.lastPosition.copy(this.object.position);
      this.lastQuaternion.copy(this.object.quaternion);
      this.lastTargetPosition.copy(this.target);

      return true;

    }

    return false;

  }

  /**
   * Defines how fast auto-rotation happens and what speed actually means
   *
   * @remarks
   * - returns an angle later used as this.rotateLeft(angle);
   * - that directly changes theta (the azimuth)
   *
   * - autoRotationSpeed is rotations per minute
   *
   * - how much should the camera rotate this frame when auto-rotate is on
   *
   * @param deltaTime
   * @returns an angle in radians. that angle is how much the camera should
   * rotate this frame when auto-rotation is enabled
   */
  private getAutoRotationAngle(deltaTime: number | null): number {

    /**
     * _twoPI = 2 * Math.PI = full circle
     *
     * code is expressing rotation speed in terms of full revolution
     */

    if (deltaTime !== null) { // frame based rotation

      return (_twoPI / 60 * this.autoRotateSpeed) * deltaTime;

    } else {

      return _twoPI / 60 / 60 * this.autoRotateSpeed;
    }

  }

  /**
   * Converts a raw wheel / gesture delta into a smooth multiplicative zoom factor
   *
   * returns a scale factor
   * the value later affects this.scale = zoomScale,
   * so zooming is multiplicative, not additive
   *
   * converts an input delta into a logarithmic zoom multiplier that feels
   * natural and device-independent
   *
   * @remarks
   * why multiplicative zoom matters
   * - zoom speed feels consistent at all distances
   * - no fast near / slow far problem
   * - works well for both perspective and orthographic cameras
   *
   * @param delta - input energy
   * @returns
   */
  private getZoomScale(delta: number): number {

    /**
     * delta - input energy
     * normalizedDelta - device normalization
     * 0.95^x - perceptual smooth zoom
     * zoomSpeed - user control
     */

    /**
     * Normalize delta because wheels and trackpads produce
     * - different delta magnitudes
     * - different units (lines, pixels, arbitrary steps)
     * - different signs (+ / -)
     *
     * - Math.abs removes direction
     * - compresses magnitude (* 0.01)
     * - makes values manageable and device agnostic
     *
     * so:
     * - delta = 100 -> normalizedDelta = 1
     * - delta 10 -> normalizedDelta = 0.1
     */
    const normalizedDelta = Math.abs(delta * 0.01);

    /**
     * Exponential scaling - why
     * because zoom perception is logarithmic, not linear
     * - humans percieve scale changes multiplicatively
     * - camera zoom should feel smooth at all scales
     *
     * using: base ^ amount -> creates exponential decay
     *
     * why 0.95?:
     * - 0.95 means 5% zoom per unit
     * - camera distance shrinks to 95% (zoom in)
     * - or expands to 1 / 0.95 = 1.052 (zoom out)
     * - small, smooth changes
     *
     * role of zoomSpeed
     * - makes zoom speed adjustable
     * - keeps exponential behaviour intact
     *
     */
    return Math.pow(0.95, this.zoomSpeed * normalizedDelta);

  }

  /**
   * Accumulates a change in the azimuth angle (theta) to be applied
   * later during udpate()
   *
   * @remarks
   * coordinate-system convention in threejs says
   * - positive theta rotates to the right
   * - rotating left means decreasing theta
   *
   *
   *
   * @param angle
   */
  private _rotateLeft(angle: number): void {

    this.sphericalDelta.theta -= angle;

  }

  private _rotateUp(angle: number): void {

    this.sphericalDelta.phi -= angle

  }

  /**
   * Screen-space panning -> world-space motion
   *
   * in which world-space direction should movement happen
   *
   * @remarks
   * converts:
   * - 2D screen input -> camera-relative axis -> world-space translation
   * - -> deffered application
   *
   * @param distance
   * @param objectMatrix - camera.matrix (0 - right, 1 - up, 2 - forward/backward, 3 - position)
   */
  private _panLeft(distance: number, objectMatrix: Matrix4) {

    _v.setFromMatrixColumn(objectMatrix, 0);
    _v.multiplyScalar(-distance);

    /**
     * panOffset is another accumulator, just like sphericalDelta
     * - how much the target should move due to panning this frame
     */
    this.panOffset.add(_v);
  }

  /**
   * This function answers -
   * When user drags vertically, what does up mean?
   *
   * in which world-space direction shuld movement happen
   *
   * @param distance
   * @param objectMatrix
   */
  private _panUp(distance: number, objectMatrix: Matrix4) {

    // screen-space panning
    // screen-space up -> what the user sees on the screen
    if (this.screenSpacePanning === true) {

      _v.setFromMatrixColumn(objectMatrix, 1);

      // world-space panning
      // world-space up -> gravity / global Y-up
    } else {

      _v.setFromMatrixColumn(objectMatrix, 0);
      _v.crossVectors(this.object.up, _v);

    }

    _v.multiplyScalar(distance);

    this.panOffset.add(_v);
  }

  /**
   * Answers how far should we pan for a given mouse movement
   *
   * Given how far the mouse moved on screen, how far should the
   * orbit center move in world space
   *
   * @remarks
   * converts pixels -> world units
   *
   * deltaX and deltaY are screen space
   *
   * @param deltaX
   * @param deltaY
   */
  private _pan(deltaX: number, deltaY: number): void {

    const element = this.domElement;

    if (isPerspectiveCamera(this.object)) {

      // perspective
      /**
       * Perspective cameras are distance-dependent
       * - pan speed whould increase when zoomed out
       * - decrease when zoomed in
       */

      const position = this.object.position;
      _v.copy(position).sub(this.target);
      let targetDistance = _v.length(); // depth of what you're looking at

      // half of the fov is center to top of screen
      /**
       * project dept to screen space using FOV
       * - perspective camera sees a frustum
       * - half the vertical fov corresponds to half the screen height
       * tan(fov/2) converts depth -> visible height at that depth
       *
       * Now:
       * targetDistance = world units per half-screen-height
       */
      targetDistance *= Math.tan((this.object.fov / 2) * Math.PI / 180.0);

      // use use only clientHeight here so aspect ratio does not distort speed
      /**
       * Convert pixel movement to world movement
       */
      this._panLeft(2 * deltaX * targetDistance / element.clientHeight, this.object.matrix);
      this._panUp(2 * deltaY * targetDistance / element.clientHeight, this.object.matrix);

    } else if (isOrthographicCamera(this.object)) {

      // orthographic
      /**
       * Orthographic cameras are simplier
       * - no perspective distortion
       * - size does not depend on depth
       */

      this._panLeft(deltaX * (this.object.right - this.object.left) / this.object.zoom / element?.clientWidth, this.object.matrix);
      this._panUp(deltaY * (this.object.top - this.object.bottom) / this.object.zoom / element?.clientHeight, this.object.matrix);
    } else {

      // camera neither perspective nor orthographic
      console.warn('OrbitControls: warning - encountered an unkown camera type - pan disabled');
      this.enablePan = false;
    }
  }

  /**
   * In Camera terminology:
   * Dolly = move the camera closer/farther from the target
   * Zoom = change the focal length (FOV)
   *
   * OrbitControls uses dolly semantics for both camera types, but:
   * Perspective camera -> chage distance
   * Orthographic camera -> change zoom
   *
   * This function handles both by manipulating a shared variable
   * @param dollyScale - multiplicative factor, usually computed from wheel or pinch input
   * typical values:
   * - scroll up -> dollyScale > 1
   * - scroll down -> dollyScale < 1
   */
  private _dollyOut(dollyScale: number): void {

    if (isPerspectiveCamera(this.object) || isOrthographicCamera(this.object)) {

      /**
       * Divide because sacle starts at 1
       * - dividing by a number > 1 makes scale smaller
       * - smaller scale -> camera moves closer
       */
      this.scale /= dollyScale;

    } else {

      console.warn('OrbitControls: encountered an unkown camera type - dolly/zoom disabled');
      this.enableZoom = false;

    }
  }

  /**
   * @remarks
   * for comments see {@link OrbitControls#_dollyOut}
   * @param dollyScale
   */
  private _dollyIn(dollyScale: number): void {

    if (isPerspectiveCamera(this.object) || isOrthographicCamera(this.object)) {

      this.scale *= dollyScale;

    } else {

      console.warn('OrbitControls: encountered an unknown camera type - dooly/zoom disabled');
      this.enableZoom = false;

    }
  }

  /**
   * Foundation of zoom to cursor.
   * with it, zoom goes toward what the user is pointing at,
   * instead of toward the target
   *
   * x and y are screen space, usually event.clientX, event.clientY
   *
   * @remarks
   * This function does three things
   * 1. converts mouse position -> NDC
   * 2. converts NDC -> world-space ray
   * 3. stores that ray for later zoom application
   *
   * @param x - screen space coordinate
   * @param y - screen space coordinate
   * @returns void
   */
  private updateZoomParameters(x: number, y: number) {

    if (!this.zoomToCursor) {

      return;

    }

    // marks that a cursor-based zoom should occur
    // flag talls update() when you apply zoom to this frame,
    // do it toward the cursor ray
    this.performCursorZoom = true;

    // get element bounds
    const rect = this.domElement.getBoundingClientRect();

    // convert screen coordinates -> element-local coordinates
    // now (dx, dy) is the mouse position inside the canvas
    const dx = x - rect?.left;
    const dy = y - rect?.top;
    const w = rect?.width;
    const h = rect?.height;

    /**
     * normalize to NDC
     *
     * left = -1
     * right = +1
     * top = +1
     * bottom = -1
     */
    this.mouse.x = (dx / w) * 2 - 1;
    this.mouse.y = -(dy / h) * 2 + 1; // y flipped. screen grows downwards

    /**
     * build a ray directon from the camera through the cursor
     *
     * Create a point in clip space:
     * - (mouse.x, mouse.y, 1)
     * - x, y => cursor position in NDC
     * - z = 1 => far plane direction
     * - this represents a point straight through the cursor into the scene
     *
     * unproject into world space:
     * - .unproject(this.object)
     * - applies inverse projection matrix and inverse view matrix
     *
     * Result:
     * - A world-space point on the view ray
     *
     * Turn that into a direction vector:
     * - .sub(this.object.positon)
     * - .normalize()
     * - this converts world-space point -> direction from camera
     * - normalized to unit length
     *
     * Now: dollyDirection = ray direction through the cursor
     *
     * Why store dollyDirection
     * later in update:
     * - this.object.position.addScaledVector(this.dollyDirection, radiusDelta)
     *
     * That's how the zoom moves:
     * - along the ray under the mouse
     * - instead of stright toward the target
     */
    this.dollyDirection.set(this.mouse.x, this.mouse.y, 1).unproject(this.object).sub(this.object.position).normalize();
  }

  /**
   * Keeps the camera from zooming too far in or too far out
   *
   * forces dist to stay betweeen safe bounds
   *
   * @param dist
   * @returns
   */
  private clampDistance(dist: number): number {

    return Math.max(this.minDistance, Math.min(this.maxDistance, dist));

  }

  //
  // event callbacks - update the object state
  //

  /**
   * Store the position where the rotation gesture began
   *
   * @remarks
   * Remember where the user first clicked so we can compute movement
   * deltas when they drag
   *
   * Rotation in OrbitControl depends on how far the pointer moves
   * from its starting point
   *
   * @param input
   */
  public handleMouseDownRotate(event: PointerEvent): void {

    this.rotateStart.set(event.clientX, event.clientY);

  }

  /**
   * see {@link OrbitControls#handleMouseDownRotate }
   *
   * @param input
   */
  public handleMouseDownDolly(event: PointerEvent): void {

    /**
     * - computes zoom direction if you are zooming toward the cursor
     * - stores information about where on the screen the zoom originates,
     *   which is crucial for 'zoom to cursor' behaviour
     */
    this.updateZoomParameters(event.clientX, event.clientY);
    this.dollyStart.set(event.clientX, event.clientY);

  }

  /**
   * see {@link OrbitControls#handleMouseDownRotate}
   *
   * @param input
   */
  public handleMouseDownPan(event: PointerEvent) {

    this.panStart.set(event.clientX, event.clientY);

  }

  /**
   *
   * 1. Track current pointer position
   * 2. compute how far it moved since last event
   * 3. convert pixel movement -> rotation angles
   * 4. apply horizontal and vertical rotation
   * 5. update the start pointer for next move
   * 6. push changes to the camera via update
   *
   * @param input
   */
  public handleMouseMoveRotate(event: PointerEvent): void {

    // current pointer position while dragging
    this.rotateEnd.set(event.clientX, event.clientY);

    // distance the pointer moved since the last frame scaled according to desired sensitivity
    this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart).multiplyScalar(this.rotateSpeed);

    const element = this.domElement;

    this._rotateLeft(_twoPI * this.rotateDelta.x / element.clientHeight); // yes, height
    this._rotateUp(_twoPI * this.rotateDelta.y / element.clientHeight);

    this.rotateStart.copy(this.rotateEnd);

    this.update();

  }

  /**
   * see {@link OrbitControls#handleMouseMoveRotate}
   * @param input
   */
  public handleMouseMoveDolly(event: PointerEvent): void {

    this.dollyEnd.set(event.clientX, event.clientY);

    this.dollyDelta.subVectors(this.dollyEnd, this.dollyStart);

    if (this.dollyDelta.y > 0) {

      this._dollyOut(this.getZoomScale(this.dollyDelta.y));

    } else if (this.dollyDelta.y < 0) {

      this._dollyIn(this.getZoomScale(this.dollyDelta.y));

    }

    this.dollyStart.copy(this.dollyEnd);

    this.update

  }

  /**
   * see {@link OrbitControls#handleMouseMoveRotate}
   * @param input
   */
  public handleMouseMovePan(event: PointerEvent): void {

    this.panEnd.set(event.clientX, event.clientY);

    this.panDelta.subVectors(this.panEnd, this.panStart).multiplyScalar(this.panSpeed);

    this._pan(this.panDelta.x, this.panDelta.y);

    this.panStart.copy(this.panEnd);

    this.update();

  }

  /**
   *
   * @param input
   */
  public handleMouseWheel(event: WheelEvent): void {

    /**
     * computes where on the screen the zoom is happening, especially
     * if using zoom-to-cursor
     *
     * this sets the internal dollyDirection
     * (direction in world space to zoom along)
     *
     * figures out the ray from the cursor into the 3D scene so the camera
     * can zoom toward that point
     */
    this.updateZoomParameters(event.clientX, event.clientY);

    /**
     * determine the scroll direction
     *
     * 1. compute zoom direction from poiner location
     * 2. determine if wheel scroll means zoom in or zoom out
     * 3. apply the zoom scale via _dollyIn and _dollyOut
     * 4. update camera state with update()
     *
     * - negative -> scrolling up (zoom in)
     * - positive -> scrolling down (zoom out)
     *
     * getZoomScale(Delta) - converts the raw delta into scale factor for smooth zooming
     *
     * _dollyIn(scale) and _dollyOut(scale) - adjust the camera distance
     * (perspective radius or orthographic zoom) based on ths scale
     */
    if (event.deltaY < 0) {
      this._dollyIn(this.getZoomScale(event.deltaY));

    } else if (event.deltaY > 0) {

      this._dollyOut(this.getZoomScale(event.deltaY));

    }

    this.update();

  }

  /**
   * Listen for keydown events
   * - determine whether an arrow key was pressed (up, down, left, right)
   * - perform camera rotation if modifier keys (Ctrl, Meta, Shift) are held
   * - otherwise, perform camera panning
   * - finally update the camera
   *
   * _twoPI * keyRotateSpeed / domElement.clientHeight. This ensures
   *  rotation speed is relative to the screen height
   *
   * @param event KeyboardEvent
   */
  public handleKeyDown(event: KeyboardEvent) {

    // tracks whether any camera movement occured
    // if true we call update and prevent default browser behaviour (scrolling)
    let needsUpdate = false;

    switch (event.code) {

      case this.keys.UP:

        if (event.ctrlKey || event.metaKey || event.shiftKey) {

          if (this.enableRotate) {

            this._rotateUp(_twoPI * this.keyRotateSpeed / this.domElement.clientHeight);

          }
        } else {

          if (this.enablePan) {

            this._pan(0, this.keyPanSpeed);

          }

        }

        needsUpdate = true;
        break;

      case this.keys.BOTTOM:
        if (event.ctrlKey || event.metaKey || event.shiftKey) {

          if (this.enableRotate) {

            this._rotateUp(-_twoPI * this.keyRotateSpeed / this.domElement.clientHeight);

          }

        } else {

          if (this.enablePan) {

            this._pan(0, -this.keyPanSpeed);

          }

        }

        needsUpdate = true;
        break;

      case this.keys.LEFT:

        if (event.ctrlKey || event.metaKey || event.shiftKey) {

          if (this.enableRotate) {

            this._rotateLeft(_twoPI * this.keyRotateSpeed / this.domElement.clientHeight);

          }

        } else {

          if (this.enablePan) {

            this._pan(this.keyPanSpeed, 0);

          }

        }

        needsUpdate = true;
        break;

      case this.keys.RIGHT:

        if (event.ctrlKey || event.metaKey || event.shiftKey) {

          if (this.enableRotate) {

            this._rotateLeft(-_twoPI * this.keyRotateSpeed / this.domElement.clientHeight);

          }
        } else {

          if (this.enablePan) {

            this._pan(-this.keyPanSpeed, 0);

          }

        }

        needsUpdate = true;
        break;

    }

    if (needsUpdate) {

      // prevent the browser from scrolling on cursor keys
      event.preventDefault();

      this.update();

    }

  }

  /**
   * Is called when a touch (pointer) interaction begins and the control mode is rotate
   *
   * @remarks
   * It establishes a reference point (rotateStart) that future pointer movements will
   * compare against to compute rotation deltas
   * - In other words - where did the rotation gesture start
   *
   * Why do we care about rotationStart - OrbitController usually works like this:
   * 1. On touch start / pointer down
   * - store starting position (rotationStart)
   * 2. On pointer move
   * - compute delta = currentPosition - rotateStart
   * 3. Convert that delta into:
   * - azimuth angle change (horizontal)
   * - polar angle change (vertical)
   *
   * @param event
   */
  public handleTouchStartRotate(event: PointerEvent) {

    if (this.mapper.pointers.length === 1) {

      /**
       * Case 1: single pointer (one finger)
       *
       * - only one pointer is active
       * - this is a single-finger rotate gesture
       * - the starting position is simply
       *   x = finger's pageX
       *   y = finger's pageY
       * - rotation starts at exactly where the finger touched
       */

      this.rotateStart.set(event.pageX, event.pageY);

    } else {

      /**
       * Case 2: two pointers (two fingers)
       *
       * with two fingers, rotation is defined aroung the center of the gesture,
       * not either finger individually
       *
       * so instead of tracking finger A or finger B, we track the midpoint between them
       *
       * - finger 1 -> event.pageX, event.pageY
       * - finger 2-> position.x, position.y
       *
       * downstream something like this will happen:
       * - rotationDelta.subVectors(rotateEnd, rotateStart);
       */

      const position = this.mapper.getSecondPointerPosition(event);

      const x = 0.5 * (event.pageX + position.x);
      const y = 0.5 * (event.pageY + position.y);

      this.rotateStart.set(x, y);

    }

  }

  /**
   * same as {@link OrbitControls#handleTouchStartRotate}
   * but for panning
   *
   * @param event
   */
  public handleTouchStartPan(event: PointerEvent) {

    if (this.mapper.pointers.length === 1) {

      this.panStart.set(event.pageX, event.pageY);

    } else {

      const position = this.mapper.getSecondPointerPosition(event);

      const x = 0.5 * (event.pageX + position.x);
      const y = 0.5 * (event.pageY + position.y);

      this.panStart.set(x, y);
    }

  }

  /**
   * Pinch-to-zoom (dolly) initializer
   *
   * Runs when a two finger gesture begins and the controll mode
   * is dolly / zoom
   *
   * Its job is to measure the initial distance between the two touch points
   * and store it as a reference so future changes in that distance can be
   * turned into zoom
   *
   * - for dolly the absolute position of the gesture does not matter
   * only the relative distance between the fingers matter
   *
   * - rotate/pan -> position based
   * - dolly -> distance based
   *
   * @param event
   */
  public handleTouchStartDolly(event: PointerEvent) {

    const position = this.mapper.getSecondPointerPosition(event);

    const dx = event.pageX - position.x;
    const dy = event.pageY - position.y;

    const distance = Math.sqrt(dx * dx + dy * dy);

    /**
     * Note that only y is used, x is set to 0
     * - this is because dolly is 1-dimensional:
     * - you're zooming in or out
     * - you don't need a 2D vector
     * - you only need one scalar value (distance)
     *
     * so why use Vector2 at all
     * - same pattern is used everywhere else
     * delta.subVectors(end, start);
     *
     * why not use x
     * - pure convention
     * - x is ignored
     * - y is used because
     *   - vertical movement traditionally map to zoom
     *   - wheel events also use deltaY
     *   - it matches the mental and API conventions
     */
    this.dollyStart.set(0, distance); // not that only y is used. x is set to 0

  }

  /**
   * Used for a two-finger gesture that simultaneously support:
   * - dolly (zoom) -> pinch distance
   * - pan -> movement of the gesture center
   *
   * In other words:
   * when the user places two fingers on the screen, we may want to
   * both zoom and pan at the same time
   *
   * this matches how touchpads and mobile apps behave
   *
   * why both at the same time:
   * Because with two figners, the user is actually doint two independent motions
   * 1. change distance between fingers -> zoom
   * 2. move both fingers together -> pan
   *
   * these are orthogonal degrees of freedom:
   * - relative motion -> dolly
   * - collective motion -> pan
   *
   * So orbitControl does not force a choice between them
   *
   * The code is not saying:
   * - initialize whatever modes are currently enabled
   *
   * if:
   * enableZoom === false -> pinch distance is ignored
   * enablePan === false -> midpoint motion is ignored
   *
   * this allows flexible configurations:
   * - zoom only
   * - pan only
   * - both
   * - neither
   *
   * what happens later
   * - dolly logic => dollyDelta.y = dollyEnd.y - dollyStart.y
   * - pan logic => panDelta = panEnd - panStart
   *
   * @param event
   */
  public handleTouchStartDollyPan(event: PointerEvent) {

    // dolly initialization (pinch distance)
    if (this.enableZoom) this.handleTouchStartDolly(event);

    // pan initialization (gesture center)
    if (this.enablePan) this.handleTouchStartPan(event);

  }

  /**
   * same as {@link OrbitControls#handleTouchStartDollyPan}
   *
   * @param event
   */
  public handleTouchStartDollyRotate(event: PointerEvent) {

    if (this.enableZoom) this.handleTouchStartDolly(event);

    if (this.enableRotate) this.handleTouchStartRotate(event);

  }

  /**
   * Applies touch rotation for one frame
   *
   * Each pointer move does:
   * 1. measure current gesture position
   * 2. compute delta since last frame
   * 3. convert delta -> angular change
   * 4. update camera angles
   * 5. reset reference for next frame
   *
   * @param event
   */
  public handleTouchMoveRotate(event: PointerEvent) {

    if (this.mapper.pointers.length === 1) {

      this.rotateEnd.set(event.pageX, event.pageY);

    } else {

      const position = this.mapper.getSecondPointerPosition(event);

      const x = 0.5 * (event.pageX + position.x);
      const y = 0.5 * (event.pageY + position.y);

      this.rotateEnd.set(x, y);

    }

    // compute the rotation delta
    this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart).multiplyScalar(this.rotateSpeed);

    /**
     * Normalize motion by viewport size
     *
     * why divide by clientHeight - OrbitControls want:
     * Dragging across the entire screen = rotating = 360deg
     * By dividing by screen size, rotation becomes:
     * - resolution independent
     * - device independent
     * - aspect ratio stable
     *
     * using height for both X and Y ensures:
     * - rotation speed feels consistent
     * - horizontal motion doesn't change with wide screens
     *
     * why multiply by 2PI - because rotation is expressed in radians, so:
     * - drag distance -> fraction of screen height
     * - fraction x 2PI -> angle in radians
     *
     * _rotateLeft(angle) -> theta -= angle (azimuth - around y (up) axis)
     * _rotateUp(angle) -> phi -= angle (polar angle - up / down)
     *
     */
    const element = this.domElement;

    this._rotateLeft(_twoPI * this.rotateDelta.x / element.clientHeight); // yes height

    this._rotateUp(_twoPI * this.rotateDelta.y / element.clientHeight);

    /**
     * advance the reference point
     *
     * instead of always measuring from the original touch-down point,
     * OrbitControls uses incremental deltas:
     * - last frame -> this frame
     * - this frame -> next frame
     *
     * Why this matters:
     * - smooth continuous motion
     * - no accumulated large deltas
     * - stable even if pionter count chagnes
     *
     * This turns rotation into a discrete-time integrator
     */
    this.rotateStart.copy(this.rotateEnd);

  }

  /**
   * similar to {@link OrbitControls#handleTouchMoveRotate}
   *
   * rotate divides by clientHeight, but pan doesn't, because:
   * - rotation is dimensionless
   * - pan is distance based
   *
   * _pan internally:
   * - accounts for  viewport size
   * - accounts for camera distance
   * - handles projection type
   * so normalization is delegated downstream
   *
   * @param event
   */
  public handleTouchMovePan(event: PointerEvent) {

    if (this.mapper.pointers.length === 1) {

      this.panEnd.set(event.pageX, event.pageY);

    } else {

      const position = this.mapper.getSecondPointerPosition(event);

      const x = 0.5 * (event.pageX + position.x);
      const y = 0.5 * (event.pageY + position.y);

      this.panEnd.set(x, y);
    }

    // compute pan screen-space delta (gesture math)
    this.panDelta.subVectors(this.panEnd, this.panStart).multiplyScalar(this.panSpeed);

    // convert screen motion - world motion (camera mapping)
    this._pan(this.panDelta.x, this.panDelta.y);

    // advance the reference point (state update)
    this.panStart.copy(this.panEnd);

  }

  /**
   * Answers two questions every frame of a two-finger pinch:
   * 1. How much did the distance between fingers change?
   * 2. How should that change map to camera zoom/dolly
   *
   * It does not care about finger positions individually - only:
   * - their seperation
   * - their center (for zoom-to-cursor behaviour)
   *
   * - continuously measures finger seperation
   * - converts the ratio of change into a smooth multiplicative zoom factor
   * - applies it to the camera
   * - updates the reference distance
   * - and adjusts the zoom center so the camera zooms toward the gesture midpoint
   *
   * @param event
   */
  public handleTouchMoveDolly(event: PointerEvent) {

    // recompute finger seperation
    const position = this.mapper.getSecondPointerPosition(event);

    const dx = event.pageX - position.x;
    const dy = event.pageY - position.y;

    const distance = Math.sqrt(dx * dx + dy * dy);

    // store current distance
    this.dollyEnd.set(0, distance);

    /**
     * compute the zoom factor
     *
     * Interpretation
     * - fingers move apart -> ratio > 1 -> zoom out
     * - fingers move together -> ratio < 1 -> zoom in
     * - no movement -> ratio = 1 -> no zoom
     *
     * why use a ratio instead of a differnce?
     * because zoom should feel multiplicative, not linear.
     *
     * human perception of scale is logarithmic - this avoids:
     * - zoom feeling too fast when close
     * - too slow when far
     */
    this.dollyDelta.set(0, Math.pow(this.dollyEnd.y / this.dollyStart.y, this.zoomSpeed));

    this._dollyOut(this.dollyDelta.y);

    // advance the reference distances
    this.dollyStart.copy(this.dollyEnd);

    /**
     * computes gesture center
     *
     * This finds the midpoint between the fingers
     *
     * unlike rotate/pan, dolly also needs to know:
     * - where on the screen is the user zooming towards
     */
    const centerX = (event.pageX + position.x) * 0.5;
    const centerY = (event.pageY + position.y) * 0.5;

    /**
     * this enables zoom toward gesture center, not screen center
     *
     * conceptually, this does:
     * - cast a ray from (centerX, centerY)
     * - adjust the target so zoom feels anchored under the finger
     *
     * without this:
     * - zoom always pulls toward the center of the screen
     * - pinch gestures feel slippery
     */
    this.updateZoomParameters(centerX, centerY);

  }

  /**
   * Applies pinch-to-zoom and pan simultaneously if those features
   * are enabled
   *
   * updates both the pinch-to-zoom and two-finger pan for a combined
   * gesture, applying the corresponding deltas to the camera each frame
   * in an orthogonal, smooth and incremental way
   *
   * similar to {@link OrbitControls#handleTouchStartDollyPan}
   *
   * @param event
   */
  public handleTouchMoveDollyPan(event: PointerEvent) {

    /**
     * - updates dollyEnd
     * - computes dollyDelta
     * - applies zoom via _doolyOut()
     * - updates startDolly
     * - updates zoom center for pinch-to-zoom
     */
    if (this.enableZoom) this.handleTouchMoveDolly(event);

    /**
     * - updates panEnd
     * - computes panDelta
     * - applies translation via _pan()
     * - updates panStart
     */
    if (this.enablePan) this.handleTouchMovePan(event);

  }

  /**
   * updates both the pinch-to-zoom and two-finger rotation during a gesture,
   * applying each delta incrementally and independently so the camera responds
   * smoothly to combined motions
   *
   * similar to {@link OrbitControls#handleTouchMoveDollyPan}
   * @param event
   */
  public handleTouchMoveDollyRotate(event: PointerEvent) {

    /**
     * - updates dollyEnd
     * - computes dollyDelta
     * - applies zoom via _doolyOut()
     * - updates startDolly
     * - updates zoom center for pinch-to-zoom
     */
    if (this.enableZoom) this.handleTouchMoveDolly(event);

    /**
     * - updates rotateEnd (finger or midpoint)
     * - computes rotateDelta = (rotateEnd - rotateStart) * rotateSpeed
     * - applies angular change via _rotateLeft/_rotateUp
     * - updates rotateStart <- rotateEnd
     */
    if (this.enableRotate) this.handleTouchMoveRotate(event);

  }

  public customWheelEvent(event: WheelEvent) {

    const mode = event.deltaMode;

    // minimal wheel event altered to meet delta-zoom demand
    const newEvent = {
      clientX: event.clientX,
      clientY: event.clientY,
      deltaY: event.deltaY
    };

    switch (mode) {

      case 1: // LINE_MODE

        newEvent.deltaY *= 16;
        break;

      case 2: // PAGE_MODE

        newEvent.deltaY *= 100;
        break;
    }

    // detect if event was triggered by pinching
    if (event.ctrlKey && !this.controlActive) {

      newEvent.deltaY *= 10;

    }

    const newWheelEVent = new WheelEvent(event.type, { ...newEvent })

    return newWheelEVent;

  }

}
