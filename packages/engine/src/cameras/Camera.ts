import type { Node3D } from "../core/Node3D";
import { CoordinateSystem } from '../constants';

import { WebGLCoordinateSystem } from "../constants";
import { Node3D as Node3DImpl } from '../core/Node3D';
import { Matrix4 } from '../math/Matrix4';
import { Vector3 } from '../math/Vector3';

/**
 * Abstract base class for cameras.
 *
 * @remarks
 * This class should always be inherited when you build a new camera
 *
 * @abstract
 * @augments Object3D
 */
export abstract class Camera extends Node3DImpl {
  /**
   * this flag can be used for type testing.
   *
   * @type {boolean}
   * @readonly
   * @defaultValue true
   */
  public readonly isCamera: boolean = true;

  /**
   * The type property is used for detecting the object type
   * in context of serialization/deserialization
   *
   * @readonly
 */
  public readonly type: string = 'Camera';

  /**
   * The inverse of the camera's world matrix
   */
  public matrixWorldInverse: Matrix4 = new Matrix4();

  /**
   * The camera's project matrix
   */
  public projectionMatrix: Matrix4 = new Matrix4();

  /**
   * The inverse of the camera's projection matrix
   */
  public projectionMatrixInverse: Matrix4 = new Matrix4();

  /**
   * The coordinate system in which the camera is uded
   */
  public coordinateSystem: CoordinateSystem = WebGLCoordinateSystem;

  /**
   * Relates to how depth buffer (z buffer) works
   *
   * @remarks
   * Normally, the depth buffer maps near objects to smaller values and far
   * objects to larger values
   * If reversedDepth is true, it flips this mapping. often for improved
   * floating-point precision at far distances.
   * common in modern rendering techniques
   *
   * By setting it to false, the class is indicating normal depth mapping
   */
  private _reverseDepth: boolean = false;

  /**
   * Constructs a new Camera
   */
  constructor() {
    super();
  }

  /**
   * The flag that indicates whether the camera uses a reversed depth buffer
   */
  public get reversedDepth(): boolean {
    return this._reverseDepth;
  }

  /**
   * Returns a vector representing the ("look") direction of the 3D object in world space
   *
   * @remarks
   * This method is overwritten since cameras have a different forward vector compared to
   * other 3D objects. A camera looks down its local, negative z-axis by default.
   *
   * @param target - The target vector the result is stored to
   * @returns The 3D object's direction in world space
   */
  public getWorldDirection(target: Vector3): Vector3 {
    return super.getWorldDirection(target).negate();
  }

  /**
   * Updates the matrix world
   *
   * @param force - Whether to force an update
   */
  public updateMatrixWorld(force: boolean = true): void {
    super.updateMatrixWorld(force);

    this.matrixWorldInverse.copy(this.matrixWorld).invert();
  }

  /**
   * Updates world matrix
   *
   * @param force - Whether to force an update
   */
  public updateWorldMatrix(updateParents?: boolean, updateChildren?: boolean): void {
    super.updateWorldMatrix(updateParents, updateChildren);

    this.matrixWorldInverse.copy(this.matrixWorld).invert();
  }


  /**
 * Returns a new Node with copied values from this instance.
 *
 * @param recursive - If true, child nodes will also be cloned
 * @returns The cloned node
 */
  // public clone(recursive: boolean = true): this {
  //   // Define the constructor type
  //   // const Ctor = this.constructor as { new(): this };

  //   // return new Ctor().copy(this, recursive)
  //   // this.super.clone(recursive);

  //   return new Camera().copy(this, recursive) as this;
  // }





  /*
 * Copies the values of the given Camera to this instance.
 *
 * @param source - The camera to copy from
 * @param recursive - If true, child nodes will also be copied
 * @returns A reference to this instance
 */
  public copy(source: Node3D, recursive: boolean = true): this {
    super.copy(source, recursive);

    if (source instanceof Camera) {
      this.matrixWorldInverse.copy(source.matrixWorldInverse);

      this.projectionMatrix.copy(source.projectionMatrix);
      this.projectionMatrixInverse.copy(source.projectionMatrixInverse);

      this.coordinateSystem = source.coordinateSystem;
    }

    return this;
  }
}
