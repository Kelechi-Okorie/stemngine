import { clamp } from "./MathUtils";

/**
 * This class can be used to represent points in 3D space as
 * [Spherical coordinates]{@link https://en.wikipedia.org/wiki/Spherical_coordinate_system}
 */
export class Spherical {
  /**
   * Constructs a new Spherical object.
   *
   * @param radius - The radius. Default is `1`.
   * @param phi - The polar angle. Default is `0`.
   * @param theta - The azimuthal angle. Default is `0`.
   */
  constructor(
    public radius: number = 1,
    public phi: number = 0,
    public theta: number = 0
  ) { }

  /**
   * Sets the spherical coordinates by copying the given values
   *
   * @param radius - The radius.
   * @param phi - The polar angle.
   * @param theta - The azimuthal angle.
   * @returns This Spherical object.
   */
  public set(radius: number, phi: number, theta: number): this {
    this.radius = radius;
    this.phi = phi;
    this.theta = theta;

    return this;
  }

  /**
   * Restricts the polar angle `phi` to be between 0.0000001 and pi -
   * 0.000001 to avoid problems with poles.
   *
   * @returns This Spherical object.
   */
  public makeSafe(): this {
    const EPS = 0.000001;
    this.phi = clamp(this.phi, EPS, Math.PI - EPS);

    return this;
  }

  /**
   * Sets the spherical components from the given Cartesian coordinates.
   *
   * @param x - The x component.
   * @param y - The y component.
   * @param z - The z component.
   * @returns This Spherical object.
   */
  public setFromCartesianCoords(x: number, y: number, z: number): this {
    this.radius = Math.sqrt(x * x + y * y + z * z);

    if (this.radius === 0) {

      this.theta = 0;
      this.phi = 0;

    } else {

      this.theta = Math.atan2(x, z);
      this.phi = Math.acos(clamp(y / this.radius, - 1, 1));

    }

    return this;
  }

  /**
   * Sets the spherical components from the given vector which is assumed to hold
   * Cartesian coordinates.
   *
   * @param v - The Vector3 object.
   * @returns This Spherical object.
   */
  public setFromVector3(v: import('./Vector3').Vector3): this {
    return this.setFromCartesianCoords(v.x, v.y, v.z);
  }

  /**
   * Copies the values of the given Spherical object to this instance
   *
   * @param s - The Spherical object to copy from.
   * @returns This Spherical object.
   */
  public copy(s: Spherical): this {
    this.radius = s.radius;
    this.phi = s.phi;
    this.theta = s.theta;

    return this;
  }

  /**
   * Returns a new Spherical object with the same values as this one.
   *
   * @returns A new Spherical object.
   */
  public clone(): Spherical {
    return new Spherical().copy(this);
  }
}
