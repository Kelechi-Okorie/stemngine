import { PerspectiveCamera } from './PerspectiveCamera.js';

/**
 * This type of camera can be used in order to efficiently render a scene with a
 * predefined set of cameras. This is an important performance aspect for
 * rendering VR scenes.
 *
 * An instance of `ArrayCamera` always has an array of sub cameras. It's mandatory
 * to define for each sub camera the `viewport` property which determines the
 * part of the viewport that is rendered with this camera.
 *
 * @augments PerspectiveCamera
 */
export class ArrayCamera extends PerspectiveCamera {
  /**
   * This flag can be used for type testing.
   *
   * @readonly
   * @default true
   */
  public isArrayCamera = true;

  /**
   * Whether this camera is used with multiview rendering or not.
   *
   * @readonly
   * @default false
   */
  public isMultiViewCamera = false;

  /**
   * An array of perspective sub cameras.
   *
   * @type {Array<PerspectiveCamera>}
   */
  public cameras: PerspectiveCamera[];



  /**
   * Constructs a new array camera.
   *
   * @param {Array<PerspectiveCamera>} [array=[]] - An array of perspective sub cameras.
   */
  constructor(array = []) {

    super();
    this.cameras = array;

  }

}
