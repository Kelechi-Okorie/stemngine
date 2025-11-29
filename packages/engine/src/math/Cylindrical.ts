import { Vector3 } from './Vector3';

/**
 * This class can be used to represent points in 3D space as
 * [Cylindrical coordinates]{@link https://en.wikipedia.org/wiki/Cylindrical_coordinate_system}
 */
export class Cylindrical {
  /**
   * Constructs a new Cylindrical object.
   *
   * @param radius - The radius. Default is `1`.
   * @param theta - The polar angle. Default is `0`.
   * @param y - The height. Default is `0`.
   */
  constructor(
    public radius: number = 1,
    public theta: number = 0,
    public y: number = 0
  ) { }

  /**
   * Sets the cylindrical coordinates
   *
   * @param radius - The radius.
   * @param theta - The polar angle.
   * @param y - The height.
   * @returns This Cylindrical object.
   */
  public set(radius: number, theta: number, y: number): this {
    this.radius = radius;
    this.theta = theta;
    this.y = y;

    return this;
  }

    /**
   * Sets the cylindrical coordinates from a Vector3 object
   *
   * @remarks
   * The vector3 object it assumed to hold a  Cartesian coordinate
   *
   * @param vec3 - The Vector3 object.
   * @returns This Cylindrical object.
   */
  public setFromVector3(v: Vector3): this {
    return this.setFromCartesianCoords(v.x, v.y, v.z);
  }

  /**
   * Sets the cylindrical coordinates from Cartesian coordinates
   *
   * @param x - The x component.
   * @param y - The y component.
   * @param z - The z component.
   * @returns This Cylindrical object.
   */
  public setFromCartesianCoords(x: number, y: number, z: number): this {
    this.radius = Math.sqrt(x * x + z * z);
    this.theta = Math.atan2(x, z);
    this.y = y;

    return this;
  }


  /**
   * Copies the value of the given cylindrical coordinates to this instance
   *
   * @param other - The other cylindrical coordinates.
   * @returns This Cylindrical object.
   */
  public copy(other: Cylindrical): this {
    this.radius = other.radius;
    this.theta = other.theta;
    this.y = other.y;

    return this;
  }

  /**
   * Returns a new Cylindrical object with the same values as this one.
   *
   * @returns A new Cylindrical object.
   */
  public clone(): Cylindrical {
    // return new (this.constructor as new () => this)().copy(this);
    return new Cylindrical().copy(this);
  }
}
