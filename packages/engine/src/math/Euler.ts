import type { Matrix4 } from "./Matrix4.js";
import type { Quaternion} from './Quaternion.js';

import { EulerDefaultOrder } from "../constants";
import { clamp } from "../math/MathUtils.js";
import { EulerOrder } from "../constants";
import { Matrix4 as Matrix4Impl } from "./Matrix4.js";
import { Quaternion as QuaternionImpl } from "./Quaternion.js";
import { Vector3 } from "./Vector3";

const _matrix = /*@__PURE__*/ new Matrix4Impl();
const _quaternion = /*@__PURE__*/ new QuaternionImpl();

/**
 * A class representing Euler angles.
 *
 * @remarks
 * Euler angles describe a rotational transformation by rotating an object on
 * its various axes in specified amounts per axis, and a specified  axis order
 *
 * Iterating through an instance will  yield its components (x, y, z, order)
 * in the corresponding order.
 *
 * ```ts
 * const a = new Euler( Math.PI / 2, Math.PI / 2, 0, 'XYZ' );
 * const b = new Euler(1, 0, 1);
 * b.applyEuler(a);
 * ```
 */
export class Euler {

  public DEFAULT_ORDER: string = EulerDefaultOrder;

  /**
   * this flag can be used for type testing.
   *
   * @type {boolean}
   * @readonly
   * @defaultValue true
 */
  public readonly isEuler: boolean = true;

  /**
   * The order of the euler angles
   */
  private _order: EulerOrder;


  /**
   * Constructs a new euler instance
   *
   * @param x - The rotation around the x axis in radians. Default is 0.
   * @param y - The rotation around the y axis in radians. Default is 0.
   * @param z - The rotation around the z axis in radians. Default is 0.
   * @param order - The order of the euler angles. Default is 'XYZ'.
   */
  constructor(
    private _x: number = 0,
    private _y: number = 0,
    private _z: number = 0,
    order: EulerOrder = EulerDefaultOrder
  ) {
    this._order = order ?? EulerDefaultOrder; // make sure it always has a value
  }

  /**
   * Sets the Euler components
   *
   * @param x - The angle of the x axis in radians
   * @param y - The angle of the y axis in radians
   * @param z - The angle of the z axis in radians
   * @param order - The order of the euler angles
   * @returns The current instance.
   */
  public set(x: number, y: number, z: number, order: EulerOrder = this._order): this {
    this._x = x;
    this._y = y;
    this._z = z;
    this._order = order;

    this._onChangeCallback();
    return this;
  }

  /**
   * Gets the angle of the x axis in radians
   */
  public get x(): number {
    return this._x;
  }

  /**
   * Sets the angle of the x axis in radians
   */
  public set x(value: number) {
    this._x = value;
    this._onChangeCallback();
  }

  /**
   * Gets the angle of the y axis in radians
   */
  public get y(): number {
    return this._y;
  }

  /**
   * Sets the angle of the y axis in radians
   */
  public set y(value: number) {
    this._y = value;
    this._onChangeCallback();
  }

  /**
   * Gets the angle of the z axis in radians
   */
  public get z(): number {
    return this._z;
  }

  /**
   * Sets the angle of the z axis in radians
   */
  public set z(value: number) {
    this._z = value;
    this._onChangeCallback();
  }

  /**
   * Gets the order of the euler angles
   */
  public get order(): string {
    return this._order;
  }

  /**
   * Sets the order of the euler angles
   */
  public set order(value: EulerOrder) {
    this._order = value;
    this._onChangeCallback();
  }

  /**
   * Registers a callback to be called whenever this Euler changes.
   *
   * @remarks
   * This is used to notify other objects that depend on this Euler when it changes
   * like matrices, or other transformations
   *
   * @param callback - The function to be called on change.
   * @returns This Euler (for chaining).
 */
  public _onChange(callback: () => void): this {
    this._onChangeCallback = callback;

    return this;
  }

  /**
   * Default empty callback function used internally
   */
  private _onChangeCallback: () => void = () => { };

  /**
   * Returns a new Euler instancw with copied values from this instance
   *
   * @returns A clone of this instance
   */
  public clone(): Euler {
    return new Euler(this._x, this._y, this._z, this._order);
  }

  /**
   * Copies the values of the given Euler instance to this instance
   *
   * @param euler - The Euler instance to copy from
   * @returns This instance (for chaining)
   */
  public copy(euler: Euler): this {
    this._x = euler._x;
    this._y = euler._y;
    this._z = euler._z;
    this._order = euler._order;

    this._onChangeCallback();

    return this;
  }

  /**
   * Sets the angles of this Euler instance from a pure rotation matrix.
   *
   * @remarks
   * Takes a rotation matrix (a 3x3 matrix embedded inside a Matrix4) and extracts the
   * Euler angles (x, y, z) that represent the same rotation as the matrix.
   *
   * You usually build rotations in 3D using either:
   * - Euler (x, y, z) applied in a chosen order
   * - Quaternions (rotation axis + angle)
   * - Rotation matrices (3x3 orthogonal matrix representing orientation)
   *
   * They must all convert to one another without losing information.
   *
   * @param m - A 4x4 matrix of which the upper 3x3 matrix is a pure rotation matrix (i.e. unscaled).
   * @param order - The order of the euler angles
   * @param update - Whether the internal `onChange` callback should be called or not
   * @returns This instance (for chaining)
   */
  public setFromRotationMatrix(m: Matrix4, order: EulerOrder = this._order, update: boolean = true): this {
    const te = m.elements;
    const m11 = te[0], m12 = te[4], m13 = te[8];
    const m21 = te[1], m22 = te[5], m23 = te[9];
    const m31 = te[2], m32 = te[6], m33 = te[10];

    switch (order) {

      case 'XYZ':

        this._y = Math.asin(clamp(m13, - 1, 1));

        if (Math.abs(m13) < 0.9999999) {

          this._x = Math.atan2(- m23, m33);
          this._z = Math.atan2(- m12, m11);

        } else {

          this._x = Math.atan2(m32, m22);
          this._z = 0;

        }

        break;

      case 'YXZ':

        this._x = Math.asin(- clamp(m23, - 1, 1));

        if (Math.abs(m23) < 0.9999999) {

          this._y = Math.atan2(m13, m33);
          this._z = Math.atan2(m21, m22);

        } else {

          this._y = Math.atan2(- m31, m11);
          this._z = 0;

        }

        break;

      case 'ZXY':

        this._x = Math.asin(clamp(m32, - 1, 1));

        if (Math.abs(m32) < 0.9999999) {

          this._y = Math.atan2(- m31, m33);
          this._z = Math.atan2(- m12, m22);

        } else {

          this._y = 0;
          this._z = Math.atan2(m21, m11);

        }

        break;

      case 'ZYX':

        this._y = Math.asin(- clamp(m31, - 1, 1));

        if (Math.abs(m31) < 0.9999999) {

          this._x = Math.atan2(m32, m33);
          this._z = Math.atan2(m21, m11);

        } else {

          this._x = 0;
          this._z = Math.atan2(- m12, m22);

        }
        break;

      case 'YZX':

        this._z = Math.asin(clamp(m21, - 1, 1));

        if (Math.abs(m21) < 0.9999999) {

          this._x = Math.atan2(- m23, m22);
          this._y = Math.atan2(- m31, m11);

        } else {

          this._x = 0;
          this._y = Math.atan2(m13, m33);
        }

        break;

      case 'XZY':

        this._z = Math.asin(- clamp(m12, - 1, 1));

        if (Math.abs(m12) < 0.9999999) {

          this._x = Math.atan2(m32, m22);
          this._y = Math.atan2(m13, m11);

        } else {

          this._x = Math.atan2(- m23, m33);
          this._y = 0;
        }

        break;

      default:

        console.warn('Euler: .setFromRotationMatrix() encountered an unknown order: ' + order);
    }

    this._order = order;

    if (update === true) this._onChangeCallback();

    return this;
  }

  /**
   * Sets the angles of this Euler instance from a normalize quaternion.
   *
   * @param q - A normalized quaternion
   * @param order - The order of the euler angles
   * @param update - Whether the internal `onChange` callback should be called or not
   * @returns This instance (for chaining)
   */
  public setFromQuaternion(q: Quaternion, order: EulerOrder = this._order, update: boolean = true): this {
    _matrix.makeRotationFromQuaternion(q);
    return this.setFromRotationMatrix(_matrix, order, update);
  }

  /**
   * Sets the angles of this Euler instance from the given vector3
   *
   * @param v - The vector
   * @param order - A string representing the order of the euler angles
   * @returns This instance (for chaining)
   */
  public setFromVector3(v: Vector3, order: EulerOrder = this._order): this {
    return this.set(v.x, v.y, v.z, order);
  }

  /**
   * Resets the euler angle with a new order by creating a quaternion from this
   * euler angle and then setting this euler angles with the quaternion and the new order
   *
   * Warning: This discards revolution information
   *
   * @param newOrder - A string representing the new order that the rotations are applied
   * @returns A reference to this Euler
   */
  public reorder(newOrder: EulerOrder): this {
    _quaternion.setFromEuler(this);

    return this.setFromQuaternion(_quaternion, newOrder);
  }

  /**
   * Returns `true` if this Euler instance is equal to the given euler instance.
   *
   * @param euler - The euler instance to compare with
   * @returns `true` if the two euler instances are equal, `false` otherwise
   */
  public equals(euler: Euler): boolean {
    return (euler._x === this._x) && (euler._y === this._y) && (euler._z === this._z) && (euler._order === this._order);
  }

  /**
   * Sets this Euler instance's components from the given array.
   *
   * @remarks
   * The first three entries of the array are used to set the x, y, and z components
   * respectively. The fourth entry, if present, is used to set the order.
   *
   * @param array - The array to read the components from
   * @param offset - The offset into the array where the components start. Default is 0.
   * @returns This instance (for chaining)
   */
  public fromArray(array: (number)[], order?: EulerOrder): this {
    this._x = array[0];
    this._y = array[1];
    this._z = array[2];
    this._order = order || this._order;

    this._onChangeCallback();

    return this;
  }

  /**
   * Writes the components of this Euler instance to the given array. If no array is provided
   * a new array will be created and returned
   *
   * @remarks
   * This returns an array of components.
   * If the order is needed it is returned seperately
   *
   * @param array - The array to write the components to
   * @param offset - The offset into the array where the components should be written.
   * @returns The array with the Euler components
   */
  public toArray(array: number[] =[], offset: number = 0): number[] {
    array[offset] = this._x;
    array[offset + 1] = this._y;
    array[offset + 2] = this._z;

    return array;
  }

  /**
 * Iterator
 * @returns the components of this quaternion iterated in order
 */
  [Symbol.iterator](): Iterator<number | string> {
    return [this._x, this._y, this._z, this._order][Symbol.iterator]();
  }
}
