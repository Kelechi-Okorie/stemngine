import type { Vector2 } from "../math/Vector2";

import { Camera } from "./Camera";
import { RAD2DEG, DEG2RAD } from "../math/MathUtils";
import { Vector3 as Vector3Impl } from '../math/Vector3';
import { Vector2 as Vector2Impl } from '../math/Vector2';

const _v3 = /*@__PURE__*/ new Vector3Impl();
const _minTarget = /*@__PURE__*/ new Vector2Impl();
const _maxTarget = /*@__PURE__*/ new Vector2Impl();

interface View {
  enabled: boolean;
  fullWidth: number;
  fullHeight: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
}

/**
 * Camera that uses
 * [perspective projection]{@link https://en.wikipedia.org/wiki/Perspective_(graphical)}
 *
 * @remarks
 * This projection mode is designed to mimic the way human eye sees
 * It is the most common projection mode used for rendering a 3D scene
 *
 * ```ts
 * const camera = new PerspectiveCamera(45, width / height, 1, 1000);
 * scene.add(camera);
 * ```
 *
 * @augments Camera
 */
export class PerspectiveCamera extends Camera {
  /**
   * this flag can be used for type testing.
   *
   * @type {boolean}
   * @readonly
   * @defaultValue true
   */
  public readonly isPerspectiveCamera: boolean = true;

  /**
   * The type property is used for detecting the object type
   * in context of serialization/deserialization
   *
   * @readonly
  */
  public readonly type: string = 'PerspectiveCamera';

  /**
   * The vertical fov, from bottom of the screen to top
   * of the screen of view in degres
   *
   * @remarks
   * Larger fov -> wider view, more distortion toward edges (like a GoPro camera)
   * Smaller fov -> narrower/zoomed-in view (like a telephoto lens)
   *
   * Final screen space FOV also depends on {@link PerspectiveCamera#zoom}
   * Final FOV = fov / zoom
   * Final screen width = aspect * height = (fov / zoom) * aspect
   *
   * You choose vertical fov
   * You choose aspect ratio (usually canvas width/height)
   * The the camera calculates how wide the projection should be
   */
  public fov: number = 50;

  /**
   * The zoom factor of the camera
   *
   * @remarks
   * A multiplier that reduces the effective field of view (fov)
   *
   * The zoom does not change the camera position or orientation
   * It simply scales the projection matrix to make the image appear closer or further away
   * It simply makes the camera see a smaller (zoom > 1) or larger
   * (zoom < 1) portion of the scene
   *
   * When you call updateProjectionMatrix(), this happens conceptually:
   * effectiveFov = fov / zoom
   * So:
   * zoom = 1 -> effectiveFov = fov (normal view)
   * zoom = 2 -> effectiveFov = fov / 2 (zoomed in)
   * zoom = 0.5 -> effectiveFov = fov / 0.5 = fov * 2 (zoomed out)
   *
   * Why not jus change fov directly?
   * You could but zoom:
   * 1. Stacks neatly with camera animations (you can animate zoom without touching fov)
   * 2. Maintains the same baseline fov of the camera when zoom resets
   * 3. Mirrors how real cameras use zoom vs focal length
   *
   * Why do engines include a zoom property
   * 1. It lets you animate zoom-ins smoothly
   * 2. It seperates "optics" (fov) from "magnification" (zoom)
   * 3. It allows dolly zs zoom effects (think Hitchcock's Vertigo)
   */

  public zoom: number = 1;

  /**
   * The camera's near plane.
   *
   * @remarks
   * The valid range is greater than 0 and less than the current
   * value of {@link PerspectiveCamera#far}
   *
   * Setting a smaller near:
   * 1. Increases depth precision problems
   * 2. Makes z-buffer more unstable
   * 3. Can cause flickering / z-fighting artifacts
   *
   * Setting a larger near:
   * 1. Improves depth buffer precision
   * 2. Makes rendering more stable
   * 3. But you lose the ability to see objects that are very close to the camera
   *
   * Best practice:
   * Choose the largest near plane that still allows you to see your scene properly
   *
   * For example:
   * VR / FPS -> near = 0.1
   * large-scale world -> near = 1 or 5
   * planet-scale world/engine -> near = 100-1000
   * CAD / engineering -> near = 0.01 or smaller
   *
   * Unlike for the {@link OrthographicCamera} 0 is <em>not</em> a
   * valid value for perspective camera's near plane
   */
  public near: number = 0.1;

  /**
   * The camera's far plane
   *
   * @remarks
   * Must be greater than the current value of {@link PerspectiveCamera#near}
   *
   * How it affects depth precision
   * Depth precision is non-linear in perspective cameras:
   * -  More precision near the camera
   * -  Less precision far away
   * Depth buffer issues (z-fighting) worsen if:
   * 1. far / near ratio is too large
   * 2. near is too small and far is huge
   *
   * Best practice:
   * Keept far just enough to cover your scene
   * Avoid huge ratios like near = 0.01, far = 1000000
   * Consider using reversed-z rendering for huge-scale scenes (improves depth precisin)
   *
   */
  public far: number = 2000;

  /**
   * Object distance used for stereoscopy and depth-of-field effects.
   *
   * @remarks
   * This paramerter does not influence the projection matrix unless
   * a {@link StereoCamera} is being used
   *
   * Represents the distance from the camera where objects are in "focus".
   * It does not affect the standard projection matrix in a normal PerspectiveCamera
   * It is used by effects that rely on depth, like
   * -  Depth-of-field (DoF)
   * -  Stereocopic cameras (for 3D rendering)
   *
   * How it works:
   * 1. Depth-of-field effect:
   * -  If a DoF post-processing effect is applied, focus tells the effect where
   * the sharp plane is:
   *  - Objects at focus distance appear sharp
   *  - Objects closer or farther get blurred
   *
   * 2. StereoCamera:
   * -  For stereoscopic renderint (like VR or anaglyph 3D):
   *  - focus determines the convergence distnace where left/right camera views meet.
   *  - Objects at this distance appear at the correct depth the viewer
   *
   */
  public focus: number = 10;

  /**
   * The aspect ratio, usually the canvas width / canvas height
   *
   * @remarks
   * Controls the shape of the camera's view frustum:
   * -  A frustum is the pyramid-like volume of space the camera can see
   * -  Aspect affects how wide or narrow the horizontal fov is
   *    given the vertical fov ({@link PerspectiveCamera#fov})
   * -  aspect > 1 -> wide screen (landscape)
   * -  aspect < 1 -> tall screen (portrait)
   *
   * Effect on projection:
   * The horizontal fov is implicitly derived from the vertical fov and
   * the aspect ratio:
   * horizontalFov = 2 * atan(tan(verticalFov/2) * aspect)
   * So changing the aspect stretches or squashes the horizontal view,
   * but keeps the vertical fov constant
   */
  public aspect: number = 1;

  /**
   * Represents the frustum window specified
   *
   * @remarks
   * This property should not be edited diretly but via
   * {@link PerspectiveCamera#setViewOffset} and
   * {@link PerspectiveCamera#clearViewOffset}
   *
   * Optional configuration object that describes a sub-region of a larger
   * camera frustum
   *
   * Used for multi-monitor, tiled rendering, or distributed rendering (multiple
   * machines rendering parts of the same scene/image)
   *
   * It defines a sub-camera inside a larger camera
   *
   * So view literally describes the window of the large camera frustum that this
   * camera instance should render
   */
  public view?: View;

  /**
   * Film size used for the larger axis.
   *
   * @remarks
   * Default is 35 (millimeters) - the physical width of a full-frame camera sensor
   * This parameter does not influence the project matrix unless
   * {@link PerspectiveCamera#filmOffset} is set to a non zero value
   *
   * Represents the physical width of the camera's film or sensor, measured in millimeters
   * Default is 35mm, matching the physical width of a real-world full-frame DSLR sensor
   * It only affects your projection if you use filmOffset (horizontal shift / lens shift),
   * otherwise it's ignored
   * When you do use filmOffset, the sensor size is required to compute how much to shift
   * the projection, just like in real cameras
   */
  public filmGauge: number = 35;

  /**
   * Horizontal off-center offset in the same unit as
   * {@link PerspectiveCamera#filmGuage}
   *
   * This is the horizontal shift of the camera lens/sensor, measured in mm, using the
   * same scale as filmGuage.
   * It makes the peojection frustum move sideways without rotating the camera
   *
   * Shit simulates:
   * tilt-shift photograhpy
   * off-center rendering
   * stereoscopic (left/right eye) camera
   * movie camera sensor shifts
   * virtual sensor cropping
   * calibrated match-moving with real lenses
   */
  public filmOffset: number = 0;

  /**
   * Constructs a new PerspectiveCamera
   *
   * @parpam fov - The vertical field of view in degrees
   * @param aspect - The initial aspect ratio
   * @param near - The camera's near plane
   * @param far - The camera's far plane
   */
  constructor(fov: number = 50, aspect: number = 1, near: number = 0.1, far: number = 200) {
    super();

    this.fov = fov;
    this.aspect = aspect;
    this.near = near;
    this.far = far;

    this.updateProjectionMatrix();
  }

  /**
   * Sets the FOV by focal length in respect  to the current
   * {@link PerspectiveCamera#filmGuage}
   *
   * @remarks
   * The default film guage is 35, so that the focal length can be specified for
   * a 35 mm (full frame) camera
   *
   * Converts a focal length (like a real camera lens: 18mm, 35mm, 50mm, etc) into a
   * a vertical fov - then updates the projection matrix
   *
   * Why:
   * Because in photography, focal length determines the fov
   * But in most game engines, you directly set the fov, not the focal length
   *
   * This formula gives a realistic phography-style way to configure the camera
   *
   * @param focalLength - Values for the focal length and film guage must have
   * same unit
   */
  public setFocalLength(focalLength: number): void {
    /**
     * see {@link http://www.bobatkins.com/photography/technical/field_of_view.html}
     */
    // half angle of the sensor / tangent of the fov
    const vExtentSlope = 0.5 * this.getFilmHeight() / focalLength;

    // convert the slope into the fov angle
    this.fov = RAD2DEG * 2 * Math.atan(vExtentSlope);
    this.updateProjectionMatrix();
  }

  /**
   * Returns the focal length from the current
   * {@link PerspectiveCamera#fov} and
   * {@link PerspectiveCamera#filmGuage}
   *
   * @returns The computed focal length
   */
  public getFocalLength(): number {
    const vExtentSlope = Math.tan(DEG2RAD * 0.5 * this.fov);

    return 0.5 * this.getFilmHeight() / vExtentSlope;
  }

  /**
   * Returns the current vertical field of view angle in degrees considering
   * {@link PerspectiveCamera#zoom}
   *
   * @remarks
   * Returns the actual vertical fov of the camera after accounting for zoom
   *
   * @returns The effective FOV
   */
  public getEffectiveFOV() {
    return RAD2DEG * 2 * Math.atan(Math.tan(DEG2RAD * 0.5 * this.fov) / this.zoom);
  }

  /**
   * Returns the width of the image on the film
   *
   * @remarks
   * Determines how much of the film is actually exposed, depending on the aspect ratio
   * aspect >=1 (landscape mode) e.g. 16:9, 4:3, 2:1
   * aspect < 1 (portrait mode) e.g. 9:16, 3:4 etc
   *
   * If {@link PerspectiveCamera#aspect} is greater than or equal to one (landscape format),
   * the result equals {@link PerspectiveCamera#filmGuage}
   *
   * @returns The film width
   */
  public getFilmWidth(): number {
    // film not completely covered in portrait format (aspect < 1)

    /**
     * if aspect >= 1 (landscape mode)
     * e.g. 16:9, 4:3, 2:1
     * min(aspect, 1) = 1
     * filmWidth = filmGauge * 1 = filmGauge
     * Camera uses the full width of the film
     * This matches how real cameras behave: landscape uses full width
     *
     * if aspect < 1 (portrait mode)
     * min(aspect, 1) = aspect
     * filWidth = filmGauge * aspect
     * In portrait mode image is narrower than the film - so only part of
     * the film width is used
     */
    return this.filmGauge * Math.min(this.aspect, 1);
  }

  /**
   * Returns the height of the image on the film
   *
   * @remarks
   * Computes how tall the camera's film is - Meaning the height of the image plane
   * inside the virtual camera
   * The camera has a physical-ish parameter called filmGuage (usually 35mm)
   * The aspect ratio determines how much of that filmguage is used
   * If {@link PerspectiveCamera#aspect} is greater than or equal to one (landscape format),
   * the result equals {@link PerspectiveCamera#filmGuage}
   *
   * @returns The film height
   */
  public getFilmHeight(): number {
    // film not completely covered in landscape formate (aspect > 1)
    /**
     * Landscape mode (aspect >= 1)
     * Width is the limiting dimension
     * Height shrinks to keep the aspect ratio correct
     * Example: aspect = 2 => film height = filGauge / 2
     *
     * Portrait mode (aspect < 1)
     * Height uses the full filmGauge
     * Example: aspect = 0.5
     * Math.max(0.5, 1) = 1 -> film height = filmGauge / 1 = filmGauge
     *
     * So filmHeight =
     *          filmGauge           when portrait (aspect < 1)
     *          filmGauge / aspect  when landscape (aspect >=1)
     *
     * So this is a compact way to ensure the film plane has the correct proportions
     */
    return this.filmGauge / Math.max(this.aspect, 1);
  }

  /**
   * Computes a 2D bounds of the camera's viewable rectangle at a given distance along the
   * viewing direction
   *
   * @remarks
   * Sets `minTarget` and `maxTarget` to the coordinates of the lower-left and upper-right
   * corners of the viewable rectangle
   *
   * Computes the 2D rectangle in the camera space that is visible at a given distance
   * in front of the camera
   *
   * Put differently:
   * At distance D from the camera, what is the width/height of the frustum there?
   * This returns the lower-left and the upper-right 2D bounds of that rectangle
   *
   * This is extremely useful for ray picking, culling, tile-based renderers, voxel grids, etc
   *
   * @param distance - The viewable distance
   * @param minTarget - The left-lower corner of the view rectangle is written into this vector
   * @param maxTarget - The upper-right corner of the view rectangle is written into this vector
   */
  public getViewBounds(distance: number, minTarget: Vector2, maxTarget: Vector2): void {
    /**
     * Step 1 — It evaluates two NDC points:
     * (-1, -1, 0.5)  // bottom-left in Normalized Device Coordinates
     * ( 1,  1, 0.5)  // top-right in Normalized Device Coordinates
     * X,Y = corners of the screen
     * Z = 0.5 means the middle of the clip space depth (not near, not far)
     *
     * Step 2 - Convert them into camera space
     * applyMatrix4(this.projectionMatrixInverse);
     * This transforms the NDC corners back into camera space vectors
     * by applying the inverse projection matrix
     * Now the _v3 contains a direction pointing from the camera center
     * toward that NDC corner
     *
     * Step 3 — Scale that direction so it intersects the plane at:
     * z = -distance
     * Because in camera space +Z is behind the camera -Z is forward
     * into the screen, we use -distance using
     * multiplyScalar(-distance / _v3.z);
     * This scales the vector so its z-value becomes -distance
     *
     * Step 4 — Write the resulting x,y rectangle bounds:
     * minTarget = bottom left
     * maxTarget = top right
     *
     * Returns the rctangle at a depth distance that bounds the part of
     * the world visible by the camera
     *
     * For perspective camera:
     * min = (-width/2, -height/2)
     * max = (width/2, height/2)
     */
    _v3.set(-1, -1, 0.5).applyMatrix4(this.projectionMatrixInverse);

    minTarget.set(_v3.x, _v3.y).multiplyScalar(-distance / _v3.z);

    _v3.set(1, 1, 0.5).applyMatrix4(this.projectionMatrixInverse);

    maxTarget.set(_v3.x, _v3.y).multiplyScalar(-distance / _v3.z);
  }

  /**
   * Computes the width and height of the camera's viewable rectangle at a given distance along
   * the viewing direction
   *
   * @remarks
   * Does not comute the bounds itself
   * Instead, it uses {@link PerspectiveCamera#getViewBounds} internally to get the bounds
   * then computes the width and height from those bounds {min, max}
   *
   * width = max.x - min.x
   * height = max.y - min.y
   * target = (width, height)
   *
   * Geometrically, this is the size of the rectangle at distance D in front of the camera
   * At distance D down the camera' view direction:
   * It asks: how big is the frustum slice there?
   * The size depends on FOV and aspect ratio
   *
   * Example for FOV = 60deg, apect = 1, distance = 1
   * height = 2 * tan(60deg/2) * distance = 1.1547
   * width = height * aspect = 1.1547 * 1 = 1.1547
   *
   * @param distance - The viewing distance
   * @param target - The target vector that is used to store the result, whre x is width
   * and y is height
   * @returns The view size
   */
  public getViewSize(distance: number, target: Vector2): Vector2 {
    this.getViewBounds(distance, _minTarget, _maxTarget);

    return target.subVectors(_maxTarget, _minTarget);
  }

  /**
   * Sets an offset in a larger frustum
   *
   * @remarks
   * This is useful for multi-window or multi-monitor/multi-machine setups
   *
   * For example, if you have a 3x2 monitors and each monitor is 1920x1080
   * and the monitors are in grid like this
   * ```
   *   +---+---+---+
   *   | A | B | C |
   *   +---+---+---+
   *   | D | E | F |
   *   +---+---+---+
   *```
   * then for each monitor you would call it like this:
   * ```ts
   * const w = 1920;
   * const h = 1080;
   * const fullWidth = w * 3;
   * const fullHeight = h * 2;
   * 	 * // --A--
   * camera.setViewOffset( fullWidth, fullHeight, w * 0, h * 0, w, h );
   * // --B--
   * camera.setViewOffset( fullWidth, fullHeight, w * 1, h * 0, w, h );
   * // --C--
   * camera.setViewOffset( fullWidth, fullHeight, w * 2, h * 0, w, h );
   * // --D--
   * camera.setViewOffset( fullWidth, fullHeight, w * 0, h * 1, w, h );
   * // --E--
   * camera.setViewOffset( fullWidth, fullHeight, w * 1, h * 1, w, h );
   * // --F--
   * camera.setViewOffset( fullWidth, fullHeight, w * 2, h * 1, w, h );
   * ```
   *
   * Note there is no reason monitors have to be the same size or in a grid
   *
   * This function allows to render a sub-region of a larger virtual viewport
   * Think of a big scneeeeee that you want to split into smaller pieces to render
   * on multiple screens. Each "subcamera" sees only it's portion
   *
   * Effects on the camera
   * Adjusts aspect to match the full virtual frustum, not the subcamera
   * Stores view object internally with subcamera parameters
   * Calls updateProjectionMatrix() so the camera frustum reflects this offset+
   *
   * @param fullWidth - The full width of the full viewport / multiview setup
   * @param fullHeight - The full height of the full viewport / multiview setup
   * @param x - The horizontal offset of the subcamera inside the full viewport
   * @param y - The vertical offset of the subcamera inside the full viewport
   * @param width - The width of the subcamera
   * @param height - The height of the subcamera
   */
  public setViewOffset(
    fullWidth: number,
    fullHeight: number,
    x: number, y: number,
    width: number,
    height: number): void {

    this.aspect = fullWidth / fullHeight;

    if (this.view === null || this.view === undefined) {
      this.view = {
        enabled: true,
        fullWidth: 1,
        fullHeight: 1,
        offsetX: 0,
        offsetY: 0,
        width: 1,
        height: 1
      };
    }

    this.view.enabled = true;
    this.view.fullWidth = fullWidth;
    this.view.fullHeight = fullHeight;
    this.view.offsetX = x;
    this.view.offsetY = y;
    this.view.width = width;
    this.view.height = height;

    this.updateProjectionMatrix();
  }

  /**
   * Removes the view offset from the project matrix
   *
   * @remarks
   * If you previously set a subcamera to render a portion of the scene,
   * this restores the camera to full viewport rendering / entire scene rendering
   */
  public clearViewOffset(): void {
    if (this.view !== null && this.view !== undefined) {
      this.view.enabled = false;
    }

    this.updateProjectionMatrix();
  }

  /**
   * Updates the camera's projection matrix.
   *
   * @remarks
   * Recomputes the camera's projection matrix whenever any relevant property changes
   *
   *
   * @remarks
   * Must be called after any change of camera properties
   */
  public updateProjectionMatrix(): void {
    // Computes the basic frustum bounds from camera parameters
    const near = this.near;
    let top = near * Math.tan(DEG2RAD * 0.5 * this.fov) / this.zoom;
    let height = 2 * top;
    let width = this.aspect * height;
    let left = - 0.5 * width;
    const view = this.view!;

    /**
     * Apply view offset if enabled
     *
     * Useful for multi-window/multi-monitor setups
     * Adjusts frustum to a subregion of the full camera frustum
     *
     * Shrinks and offsets the projection plane based on the view
     *
     * So the projection matrix becomes:
     * A slice of the full frustum
     * Correctly positioned for multi-monitor setups
     */
    if (this.view?.enabled) {

      const fullWidth = view.fullWidth,
        fullHeight = view.fullHeight;

      left += view.offsetX * width / fullWidth;
      top -= view.offsetY * height / fullHeight;
      width *= view.width / fullWidth;
      height *= view.height / fullHeight;

    }

    // Apply film offset (skew) if any
    const skew = this.filmOffset;
    if (skew !== 0) left += near * skew / this.getFilmWidth();

    // Recompute the perspective projection matrix
    this.projectionMatrix.makePerspective(left, left + width, top, top - height, near, this.far, this.coordinateSystem, this.reversedDepth);

    // Compute its inverse
    this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
  }

  /**
   * Serializes this camera to a JSON object.
   *
   * @param meta - Optional metadata for the serialization process
   * @returns The serialized JSON object
   */
  public toJSON(meta?: object | string) {
    const data = super.toJSON(meta);

    // return data;

    // store camera-specific properties
    data.node.fov = this.fov;
    data.node.zoom = this.zoom;

    data.node.near = this.near;
    data.node.far = this.far;
    data.node.focus = this.focus;

    data.node.aspect = this.aspect;

    // serialize view and film parameters if defined
    if (this.view !== null && this.view !== undefined) {
      data.node.view = Object.assign({}, this.view);

      data.node.filmGauge = this.filmGauge;
      data.node.filmOffset = this.filmOffset;
    }

    return data;
  }

  /**
 * Returns a new vector with copied values from this instance.
 *
 * @returns A clone of this instance
 */
  public clone(): this {
    return new PerspectiveCamera().copy(this) as this;
  }

  /**
 * Copies the values of the given camera to this instance.
 *
 * @param source - The camera to copy from
 * @param recursive - If true, child nodes will also be copied
 * @returns A reference to this instance
 */
  public copy(source: PerspectiveCamera, recursive: boolean = true): this {
    super.copy(source, recursive);

    this.fov = source.fov;
    this.zoom = source.zoom;

    this.near = source.near;
    this.far = source.far;
    this.focus = source.focus;

    this.aspect = source.aspect;

    if (source.view !== null && source.view !== undefined) {
      this.view = Object.assign({}, source.view);
    } else {
      this.view = undefined;
    }

    this.filmGauge = source.filmGauge;
    this.filmOffset = source.filmOffset;

    return this;
  }
}
