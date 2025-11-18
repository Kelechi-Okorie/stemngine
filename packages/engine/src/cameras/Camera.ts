import { WebGLCoordinateSystem } from "../constants";
import { Matrix4 } from '../math/Matrix4';
import { Node3D } from "../core/Node3D";

/**
 * Abstract base class for cameras.
 *
 * @remarks
 * This class should always be inherited when you build a new camera
 *
 * @abstract
 * @augments Object3D
 */
export abstract class Camera extends Node3D {
  /**
   * this flag can be used for type testing.
   *
   * @type {boolean}
   * @readonly
   * @defaultValue true
   */
  public readonly isCamera: boolean = true;
}
