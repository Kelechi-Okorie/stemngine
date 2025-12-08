import { Camera } from './Camera';

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
 * Camera that uses [orthographic projection]{@link https://en.wikipedia.org/wiki/Orthographic_projection}
 *
 * @remarks
 * In this projection mode, an object's size in the rendered imaage stays constant
 * regardless of its distance from the camera. This can be useful for rendering
 * 2D scenes or UI elements, amongs other things in a 3D environment.
 *
 * ```ts
 * const camera = new OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000);
 * scene.add(camera);
 * ```
 *
 * @augments Camera
 */
export class OrthographicCamera extends Camera {
  /**
 * this flag can be used for type testing.
 *
 * @type {boolean}
 * @readonly
 * @defaultValue true
 */
  public readonly isOrthographicCamera: boolean = true;

  /**
 * The type property is used for detecting the object type
 * in context of serialization/deserialization
 *
 * @readonly
*/
  public readonly type: string = 'OrthographicCamera';

  /**
 * The zoom factor of the camera
 */

  public zoom: number = 1;

  /**
 * Represents the frustum window specified
 *
 * @remarks
 * Lets you render a subset of the camera frustum rather than the whole scene
 * Think of it as "viewport inside the camera frustum"
 *
 * This is useful if:
 * 1. You want to render multiple parts of a scene seperately and stitch them together
 * 2. You have a multip-monitor setup where each monitor shows a part of a huge virtual scene
 * 3. You want a split-screen rendering in a game (each player sees a portion of the scene)
 *
 * So view is optional sub-frustum for multi-view rendering
 *
 * @remarks
 * This property should not be edited directly but via
 * {@link PerspectiveCamera#setViewOffset} and
 * {@link PerspectiveCamera#clearViewOffset}
 */
  public view?: View;

  /**
   * The left plane of the camera frustum
   */
  public left: number = -1;

  /**
   * The right plane of the camera frustum
   */
  public right: number = 1;

  /**
   * The top plane of the camera frustum
   */
  public top: number = 1;

  /**
   * The bottom plane of the camera frustum
   */
  public bottom: number = -1;

  /**
 * The camera's near plane.
 *
 * @remarks
 * The valid range is greater than 0 and less than the current
 * value of {@link OrthographicCamera#far}
 *
 * Unlike for the {@link PerspectiveCamera} 0 is is a
 * valid value for orthographic camera's near plane
 */
  public near: number = 0.1;

  /**
 * The camera's far plane
 *
 * @remarks
 * Must be greater than the current value of {@link OrthographicCamera#near}
 */
  public far: number = 2000;

  /**
   * Constructs a new OrthographicCamera
   *
   * @param left - The left plane of the camera frustum
   * @param right - The right plane of the camera frustum
   * @param top - The top plane of the camera frustum
   * @param bottom - The bottom plane of the camera frustum
   * @param near - The camera's near plane
   * @param far - The camera's far plane
   */
  constructor(
    left: number = -1,
    right: number = 1,
    top: number = 1,
    bottom: number = -1,
    near: number = 0.1,
    far: number = 2000
  ) {
    super();

    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;
    this.near = near;
    this.far = far;

    this.updateProjectionMatrix();
  }

  /**
   * Sets an offset in a larger frustum
   *
   * @remarks
   * This is useful for multi-window or multi-monitor/multi-machine setups.
   *
   * @param fullWidth - The full width of the multi-frustum setup
   * @param fullHeight - The full height of the multi-frustum setup
   * @param x - The horizontal offset of the sub-frustum
   * @param y - The vertical offset of the sub-frustum
   * @param width - The width of the sub-frustum
   * @param height - The height of the sub-frustum
   * @see {@link PerspectiveCamera#setViewOffset}
   */
  public setViewOffset(
    fullWidth: number,
    fullHeight: number,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {

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
   * Removes the view offset fromt the projection matrix
   *
   * @see {@link PerspectiveCamera#clearViewOffset}
   */
  public clearViewOffset(): void {
    if (this.view !== undefined) {
      this.view.enabled = false;
    }

    this.updateProjectionMatrix();
  }

  /**
   * Updates the camera's projection matrix
   *
   * @remarks
   * Must be called after any change of the camera properties
   */
  public updateProjectionMatrix(): void {
    const dx = (this.right - this.left) / (2 * this.zoom);
    const dy = (this.top - this.bottom) / (2 * this.zoom);
    const cx = (this.right + this.left) / 2;
    const cy = (this.top + this.bottom) / 2;

    let left = cx - dx;
    let right = cx + dx;
    let top = cy + dy;
    let bottom = cy - dy;

    const view = this.view;

    /**
     * The camera's project matrix is normally computed from left, right, top,
     * bottom, near, far
     *
     * If view is enabled, the camera adjusts the frustum to only cover the sub-region
     * of the full-scene
     */
    if (view?.enabled) {

      const scaleW = (this.right - this.left) / view.fullWidth / this.zoom;
      const scaleH = (this.top - this.bottom) / view.fullHeight / this.zoom;

      left += scaleW * view.offsetX;
      right = left + scaleW * view.width;
      top -= scaleH * view.offsetY;
      bottom = top - scaleH * view.height;

    }

    this.projectionMatrix.makeOrthographic(left, right, top, bottom, this.near, this.far, this.coordinateSystem, this.reversedDepth);

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

    data.node.left = this.left;
    data.node.right = this.right;
    data.node.top = this.top;
    data.node.bottom = this.bottom;
    data.node.near = this.near;
    data.node.far = this.far;
    data.node.zoom = this.zoom;

    if (this.view !== undefined) {
      data.node.view = { ...this.view };
    }

    return data;
  }


  public copy(source: OrthographicCamera, recursive: boolean): this {
    super.copy(source, recursive);

    this.left = source.left;
    this.right = source.right;
    this.top = source.top;
    this.bottom = source.bottom;
    this.near = source.near;
    this.far = source.far;
    this.zoom = source.zoom;

    if (source.view !== undefined) {
      this.view = { ...source.view };
    } else {
      this.view = undefined;
    }

    return this;
  }
}

export function isOrthographicCamera(
  cam: Camera
): cam is OrthographicCamera {
  return (cam as any).isOrthographicCamera === true;
}

