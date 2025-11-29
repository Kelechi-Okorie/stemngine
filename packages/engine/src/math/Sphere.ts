import { Box3 } from "./Box3";
import { Vector3 } from "./Vector3";

const _box = /*@__PURE__*/ new Box3();
const _v1 = /*@__PURE__*/ new Vector3();
const _v2 = /*@__PURE__*/ new Vector3();

/**
 * An analytical 3D sphere defined by a center and a radius
 *
 * @remarks
 * This class is mainly used as a Bounding Sphere for 3D objects
 */
export class Sphere {
  /**
   * this flag can be used for type testing.
   *
   * @type {boolean}
   * @readonly
   * @defaultValue true
  */
  public readonly isSphere: boolean = true;

  /**
   * The center of the spere
   */
  public center: Vector3;

  /**
   * The radius of the sphere
   */
  public radius: number;

  /**
   * Constructs a new Sphere
   *
   * @param center - The center of the sphere
   * @param radius - The radius of the sphere
   */
  constructor(center?: Vector3, radius: number = -1) {
    this.center = (center !== undefined) ? center : new Vector3(0, 0, 0);
    this.radius = radius;
  }

  /**
   * Sets the sphere's components by copying the given values
   *
   * @param center - The center of the sphere
   * @param radius - The radius of the sphere
   * @returns A reference to this sphere
   */
  public set(center: Vector3, radius: number): Sphere {
    this.center.copy(center);
    this.radius = radius;

    return this;
  }

  /**
   * Returns true if this sphere is equal with the given one
   *
   * @param sphere - The sphere to compare with
   * @returns Whether this bounding sphere is equal with the given one
   */
  public equals(sphere: Sphere): boolean {
    return sphere.center.equals(this.center) && (sphere.radius === this.radius);
  }

  /**
   * Copies the values of the given sphere to this instance
   *
   * @param sphere - The sphere to copy
   * @returns A reference to this sphere
   */
  public copy(sphere: Sphere): Sphere {
    this.center.copy(sphere.center);
    this.radius = sphere.radius;

    return this;
  }

  /**
   * Returns a new sphere that is a clone of this sphere
   *
   * @returns A clone of this instance
   */
  public clone(): Sphere {
    return new Sphere().copy(this);
  }

  	/**
	 * Returns a serialized structure of the bounding sphere.
	 *
	 * @return Serialized structure with fields representing the object state.
	 */
	public toJSON(): object {

		return {
			radius: this.radius,
			center: this.center.toArray()
		};

	}
}
