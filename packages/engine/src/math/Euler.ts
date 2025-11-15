import { EulerDefaultOrder } from "../constants";

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

  private _order: string;


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
    order: string = EulerDefaultOrder
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
  public set(x: number, y: number, z: number, order: string = this._order): this {
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
  public set order(value: string) {
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
 * Iterator
 * @returns the components of this quaternion iterated in order
 */
  [Symbol.iterator](): Iterator<number | string> {
    return [this._x, this._y, this._z, this._order][Symbol.iterator]();
  }
}
