import type { Matrix3 } from "./Matrix3";

import { clamp } from "./MathUtils";
import { BufferAttribute } from "../core/BufferAttribute";
import { InterleavedBufferAttribute } from "../core/InterleavedBufferAttribute";


/**
 * Class representing a 2D vector.
 *
 * @remarks
 * A 2D vector is an ordered pair of numbers
 * (labeled x and y), which can be used to represent a number of things, such as:
 *
 * - A point in 2D space (i.e. a position on a plane).
 * - A direction and length across a plane. In this codebase the length will
 * always be the Euclidean distance(straight-line distance) from `(0, 0)` to `(x, y)`
 * and the direction is also measured from `(0, 0)` towards `(x, y)`.
 * - Any arbitrary ordered pair of numbers.
 *
 * There are other things a 2D vector can be used to represent, such as
 * momentum vectors, complex numbers and so on.
 *
 * Iterating through a vector instance will yield its components `(x, y)` in
 * the corresponding order.
 * ```ts
 * const a = new Vector2( 0, 1 );
 *
 * //no arguments; will be initialised to (0, 0)
 * const b = new Vector2( );
 *
 * const d = a.distanceTo( b );
 * ```
 */
export class Vector2 {
  /**
 * This flag can be used for type testing.
 *
 * @type boolean
 * @readonly
 * @defaultValue true
 */
  public readonly isVector2: boolean = true;

  constructor(public x: number = 0, public y: number = 0) {

  }

  /**
   * Alias for {@link Vector2#x}
   */
  public get width(): number {
    return this.x;
  }

  public set width(value: number) {
    this.x = value;
  }
  /**
   * Alias for {@link Vector2#y}
   */
  public get height(): number {
    return this.y;
  }

  public set height(value: number) {
    this.y = value;
  }

  /**
   * Sets the vector components
   *
   * @param x - The value of the x component
   * @param y - The value of the y component
   * @returns A reference to this vector
   */
  public set(x: number, y: number): this {
    this.x = x;
    this.y = y;

    return this;
  }

  /**
   * Sets the vector components to the same value
   *
   * @param scalar - The value to set for all vector components
   * @returns A reference to this vector
   */
  public setScalar(scalar: number): this {
    this.x = scalar;
    this.y = scalar;

    return this;
  }

  /**
   * Sets the vector's x component to the given value
   *
   * @param x - The value to set.
   * @return {Vector2} A reference to this vector.
   */
  public setX(x: number): this {

    this.x = x;

    return this;

  }

  /**
   * Sets the vector's y component to the given value
   *
   * @param y - The value to set.
   * @return A reference to this vector.
   */
  public setY(y: number): this {

    this.y = y;

    return this;

  }

  /**
   * Allows to set a vector component with an index
   *
   * @param index - The component index 0 -> x, 1 -> y
   * @param value - The value to set the component to
   * @returns A reference to this vector
   */
  public setComponent(index: number, value: number): this {
    switch (index) {
      case 0: this.x = value; break;
      case 1: this.y = value; break;
      default: throw new Error(`index is out of range ${index}`);
    }

    return this;
  }

  /**
   * Returns the value of the vector component which matches the given index
   *
   * @param index - The component index. 0 -> x, 1 -> y
   * @returns A vector component
   */
  public getComponent(index: number): number {
    switch (index) {
      case 0: return this.x;
      case 1: return this.y;
      default: throw new Error(`index is out of range ${index}`)
    }
  }

  /**
   * Adds the given vector to this instance.
   *
   * @param v - The vector to add
   * @returns A reference to this vector
   */
  public add(v: Vector2): this {
    this.x += v.x;
    this.y += v.y;

    return this;
  }

  /**
 * Adds the given scalar value to all components of this instance.
 *
 * @param s - the scalar to add
 * @returns A reference to this vector
 */
  public addScalar(s: number): this {
    this.x += s;
    this.y += s;

    return this;
  }

  /**
   * Adds the given vectors and store the result in this instance.
   *
   * @param a - The first vector
   * @param b - The second vector
   * @returns A reference to this vector
   */
  public addVectors(a: Vector2, b: Vector2): this {
    this.x = a.x + b.x;
    this.y = a.y + b.y;

    return this;
  }

  /**
   * Adds the given vector scaled by the given factor to this instance.
   *
   * @param v - The vector
   * @param s - The factor that scales v
   * @returns A reference to this vector
   */
  public addScaledVector(v: Vector2, s: number): this {
    this.x += v.x * s;
    this.y += v.y * s;

    return this;
  }

  /**
   * Subtracts the given vector from this instance.
   *
   * @param v - The vector to subtract
   * @returns A reference to this vector
   */
  public sub(v: Vector2): this {
    this.x -= v.x;
    this.y -= v.y;

    return this;
  }

  /**
   * Subtracts the given scalar value from all components of this instance.
   *
   * @param s - The scalar to subtract.
   * @returns A reference to this vector
   */
  public subScalar(s: number): this {
    this.x -= s;
    this.y -= s;

    return this;
  }

  /**
   * Subtracts the given vectors and stores the result in this instance.
   *
   * @param a - The first vector
   * @param b - The second vector
   * @returns A reference to this vector
   */
  public subVectors(a: Vector2, b: Vector2): this {
    this.x = a.x - b.x;
    this.y = a.y - b.y;

    return this;
  }

  /**
   * Multiplies the given vector with this instance
   *
   * @param v - The vector to multiply
   * @returns A reference to this vector
   */
  public multiply(v: Vector2): this {
    this.x *= v.x;
    this.y *= v.y;

    return this;
  }

  /**
   * Multiplies the given scalar value with all components of this instance
   *
   * @param s - The scalar to multiply with
   * @returns A reference to this vector
   */
  public multiplyScalar(s: number): this {
    this.x *= s;
    this.y *= s;

    return this;
  }

  /**
   * Divides this instance by the given vector
   *
   * @param v - The vector to divide with
   * @returns A reference to this vector
   */
  public divide(v: Vector2): this {
    this.x /= v.x;
    this.y /= v.y;

    return this;
  }

  /**
   * Divides this vector by the given scalar
   *
   * @param s - The scalar to divide with
   * @returns A reference to this vector
   */
  public divideScalar(s: number): this {
    return this.multiplyScalar(1 / s);
  }

  /**
   * Multiplies this vector (with an implicit 1 as the 3rd component)
   * by the given 3x3 matrix
   *
   * @remarks
   * Treats this vector as a homogenous coordinate (x, y, 1)
   * This allows a Vector2 to be transformed by 2D affine transformations like:
   * -  Translation
   * -  Rotation
   * -  Scaling
   * -  Shearing
   *
   * Note that the last row (e[2], e[5], e[8]) is ignored because we are
   * projecting back to 2D
   *
   * Essentially, this method allows you to apply a 2D transforms encoded
   * in a 3x3 matrix to this vector
   *
   * @param m - The matrix to apply
   * @returns A reference to this vector
   */
  public applyMatrix3(m: Matrix3): this {
    const x = this.x, y = this.y;

    const e = m.elements;

    this.x = e[0] * x + e[3] * y + e[6];
    this.y = e[1] * x + e[4] * y + e[7];

    return this;
  }

  /**
   * If this vector's x or y value is greater than the given vector's x or y
   * value, replace that value with the corresponding min value;
   *
   * @remarks
   * Clamps this vector's component so that each component does not exceed the
   * corresponding component of another vector
   *
   * Use cases:
   * Limiting a vector to stay within a bounding rectangle
   * Clamping positions in a 2D game or UI to a maximum boundary
   * Component-wise comparison between vectors
   *
   * @param v - The given vector
   * @returns A reference to this instance
   */
  public min(v: Vector2): this {
    this.x = Math.min(this.x, v.x);
    this.y = Math.min(this.y, v.y);

    return this;
  }

  /**
   * Clamps this vectors component values to the max of the component values
   * and the given vector component values
   *
   * @remarks
   * Clamp this vector's components so that each component is at least as large
   * as the corresponding comopnent of another vector v
   *
   * Use cases:
   * Ensuring a vector stays above a minimum boundary (opposed to min())
   * Component-wise comparison for bounding boxes, ensuring maximum coverage
   * Keeping positions or sizes above a certain threshold
   *
   * @param v - The given vector
   * @returns A reference to this vector
   */
  public max(v: Vector2): this {
    this.x = Math.max(this.x, v.x);
    this.y = Math.max(this.y, v.y);

    return this;
  }

  /**
   * If this vector's x or y value is greater than the max vector's x or y
   * value, it is replaced by the corresponding value, and vice versa for min
   *
   * @remarks
   * Restricts each component of this vector to a specific range, defined by
   * minV and maxV
   *
   * Use cases:
   * Ensuring a point stays withing a bounding box
   * Restricting movement or size in 2D game or graphics
   * Clamping values for UI elements or physics calculations
   *
   * @param minV - The min vector
   * @param maxV - The max vector
   * @returns A reference to this vector
   */
  public clamp(minV: Vector2, maxV: Vector2): this {
    // assume min < max, componentwise

    this.x = clamp(this.x, minV.x, maxV.x)
    this.y = clamp(this.y, minV.y, maxV.y);

    return this;
  }

  /**
   * If this vector's x or y values are greater than the max value, they
   * are replaced by the max value and vice versa for the min value
   *
   * @remarks
   * Restricts the x and y components of a vector to lie within a specific
   * scalar range
   *
   * Use cases:
   * Limiting a vector's maginitude indirectly by restricting each component
   * Ensuring positions, velocities, or sizes in 2D space do not exceed certain boundaries
   * Useful in physics or game mechanics to avoid values going out of range
   *
   * @param minS - The minimum scalar value the components will clamp to
   * @param maxS - The maximum scalar value the components will clamp to
   * @returns A reference to this vector
   */
  public clampScalar(minS: number, maxS: number): this {
    this.x = clamp(this.x, minS, maxS);
    this.y = clamp(this.y, minS, maxS);

    return this;
  }

  /**
   * Computes the square of the Euclidean length (straight-line length) from
   * (0, 0) to (x, y).
   *
   * @remarks
   * If you are comparing the lengths of vectors, you should compare length
   * squared instead as it is slightly more efficent to calculate
   *
   * Use cases:
   * Performance optimization
   * Distance comparisons
   * Physics or graphics calculations - collision detection, proximity checks,
   * or any case where relative distnaces are needed
   *
   * @returns The square length of this vector
   */
  public lengthSq(): number {
    return this.x * this.x + this.y * this.y;
  }

  /**
   * Computes the Euclidean length (straight-line length) from (0, 0) to (x, y)
   *
   * @remarks
   * Also called L2 norm of a vector
   *
   * Use cases:
   * Acutal distance measurement
   * Vector normalization
   * Physics / motion calculations
   * Graphics / game programming
   *
   * @returns The length of this vector
   */
  public length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * Computes the Manhattan length of this vector
   *
   * @remarks
   * Also called L1 norm of a vector
   * Measure distance if you can only move along the axis, like navigating a city grid
   *
   * Use cases
   * Pathfinding on grid-based maps (games, robotics)
   * Comparing distances in context where diagonal movements isn't allowed
   * Sparse vector computations or L1-regularized optimization in ML
   *
   * @returns The length of this vector
   */
  public manhattanLength(): number {
    return Math.abs(this.x) + Math.abs(this.y);
  }

  /**
   * If this vector's length is greater than the max value, it is replaced
   * by the max value, and vice versa for min value
   *
   * @remarks
   * Used to restrict the length (magnitude) of a vector to a specified range
   *
   * v < min -> v = min
   * v > max -> v = max
   * min < v < max -> v = v
   *
   * Preserves the direction of the vector but modifies its magnitude
   *
   * @param min - The minimum value the vector length will be clamped to
   * @param max - The maximum value the vector length will be clamped to
   * @returns A reference to this vector
   */
  public clampLength(min: number, max: number): this {
    const length = this.length();

    return this.divideScalar(length || 1).multiplyScalar(clamp(length, min, max));
  }

  /**
   * The components of this vector are rounded down to the nearest interger value
   *
   * @remarks
   * Useful when you need integer coordinate (e.g. for grid-based calculations,
   * pixel positions, or tile maps)
   * Preserves the vector's direction only if it's in the first quadrant, otherwise,
   * it simple floors each component individually
   *
   * @returns A reference to this vector
   */
  public floor(): this {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);

    return this;
  }

  /**
   * The components of this vector are rounded up to the nearest integer value
   *
   * @remarks
   * Useful when you need integer coordinates that never fall below the original
   * values, e.g., for bounding boxes, grid placement, or pixel alignment
   *
   * @returns A reference to this vector
   */
  public ceil(): this {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);

    return this;
  }

  /**
   * The components of this vecto are rounded to the neares integer value
   *
   * @remarks
   * Useful when you need integer coordinates closes to the original values,
   * e.g., for grid snapping, pixel alignment, or discretizing positions
   *
   * @returns A reference to this vector
   */
  public round(): this {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);

    return this;
  }

  /**
   * The components of this vector are rounded towards zero (up if negative,
   * down if positive) to an integer value
   *
   * @remarks
   * Essentially removes the fractional part without changing the sign
   *
   * Use cases:
   * Converting a vector to integer coordinates without rounding away from zero
   * Useful for grid alignment where you want to keep positions "inside" a cell
   * rather than rounding up
   * Fast alternative to floor() or ceil() when directionality matters
   *
   * @returns A reference to this vector
   */
  public roundToZero(): this {
    this.x = Math.trunc(this.x);
    this.y = Math.trunc(this.y);

    return this;
  }

  /**
   * Inverts this vector - i.e. sets x = -x and y = -y
   *
   * @remarks
   * Invert the direction of this vector by multiplying both components by -1
   *
   * Use cases:
   * Flipping a direction vector (e.g., reversing motion)
   * Useful in physics calculations when you need opposite force or velocity
   * Inverting coordinates in certain algorithms (like reflections)
   *
   * @returns A reference to this vector
   */
  public negate(): this {
    this.x = -this.x;
    this.y = -this.y;

    return this;
  }

  /**
   * Caculates the dot product of the given vector with this instance.
   *
   * @remarks
   * Use cases:
   * Angle calculation
   * Projection
   * Checking perpendicularity
   * Physics and graphics - Work, light calculations, reflections
   *
   * @param v - The vector to compute the dot product with
   * @returns The result of the dot product
   */
  public dot(v: Vector2): number {
    return this.x * v.x + this.y * v.y;
  }

  /**
   * Calculates the cross product of the given vector with this instance
   *
   * @remarks
   * Calculate the 2D analog of the 3D cross product, which is a scalar value
   * representing the magnitude of the vector perpendicular to the 2D plane
   * (essentially, the "z-component" if you imagine the vectors lying in the XY plane)
   *
   * Use cases:
   * Determining orientation/winding order: for vectors a, b; cross(a, b)
   * If the result > 0, b is counter-clockwise from a, if < 0, clockwise
   * Area of parallelogram: The magnitude gives the area of the parallelogram
   * spanned by the vectors
   * Physics and graphics: Rotational calculations in 2D
   *
   * @param v - The vector to compute the cross product with
   * @returns The result of the cross product
   */
  public cross(v: Vector2): number {
    return this.x * v.y - this.y * v.x;
  }

  /**
   * Converts this vector to a unit vector
   *
   * @returns A reference to this vector
   */
  public normalize(): this {
    return this.divideScalar(this.length() || 1);
  }

  /**
   * Computes tha angle in radians of this vector wrt the +ve x-axis
   *
   * @remarks
   * Use cases:
   * Finding direction of a vector in 2D
   * Rotating objects toward the vector
   * Angle-based comparisons in physics, games and graphics
   *
   * @returns The angle in radians
   */
  public angle(): number {
    /**
     * Math.atan2(y, x)
     *  - Returns the angle b/w +ve x-axis and the point (x, y ) in radians
     *    measured counterclockwise
     *  - Range [-PI, PI]
     * Negating both components (-this.y, -this.x)
     *  - Eseentially flips the vector direction 180 degrees
     * Adding Math.PI
     *  - Compensates for the negation
     *  - Effectivel computes the angle from the +ve x-axis to the vector
     *    in the range [0, 2 * PI]
     */
    const angle = Math.atan2(-this.y, -this.x) + Math.PI;

    return angle;
  }

  /**
   * Returns the angle between the given vector and this instance in radians
   *
   * @remarks
   * Use cases:
   * Finding angle between directions in 2D
   * Rotate object to align with another vector
   * Physics calculations, e.g., collission response, steering behaiours
   *
   * @param v - The vector to compute the angle with
   * @returns The angle in radians
   */
  public angleTo(v: Vector2): number {
    // used to normalize the dot product
    const denominator = Math.sqrt(this.lengthSq() * v.lengthSq());

    // if either v or this vector has length 0, the andle is undefined,
    // return 90deg or PI/2 rad
    if (denominator === 0) return Math.PI / 2;

    // compute the cosine of the angle using the dop product formula
    const theta = this.dot(v) / denominator;

    // clamp, to handle numerical problems
    // ensure theta is within vald range for acos,
    // preventing floating-point errors
    return Math.acos(clamp(theta, - 1, 1));
  }

  /**
   * Computes the squared distance drom the given vector to this instance.
   * If you are just comparing the distance with another distance, you should compare
   * the distance squared instead as it is slightly more efficient to calculate
   *
   * @param v - The vector to compute the squared distance to
   * @returns The squared distance
   */
  public distanceToSquared(v: Vector2): number {
    const dx = this.x - v.x, dy = this.y - v.y;

    return dx * dx + dy * dy;
  }

  /**
   * Computes the distance from the given vector to this instance
   *
   * @param v - The vector to compute distance to
   * @returns The distance
   */
  public distanceTo(v: Vector2): number {
    return Math.sqrt(this.distanceToSquared(v));
  }

  /**
   * Computes the Manhattan distance from the given vector to this instance
   *
   * @param v - The vector to compute the Manhattan distance to
   * @returns The manhattan distance
   */
  public manhattanDistanceTo(v: Vector2): number {
    return Math.abs(this.x - v.x) + Math.abs(this.y - v.y);
  }

  /**
   * Sets this vector to a vector with the same direction as this one,
   * but with specified length
   *
   * @param length - The new length of this vector
   * @returns A reference to this vector
   */
  public setLength(length: number): this {
    return this.normalize().multiplyScalar(length);
  }

  /**
   * Linearly interpolates between the given vector and this instance, where
   * alpha is the percent distance along the line
   *
   * @remarks
   * alpha = 0 will be this vector
   * alpha = 1 will be the given vector
   *
   * @param v - The vector to interpolate towards
   * @param alpha - The interpolation factor, typically in the closed interval
   * [0, 1]
   * @returns A reference to this vector
   */
  public lerp(v: Vector2, alpha: number): this {
    this.x += (v.x - this.x) * alpha;
    this.y += (v.y - this.y) * alpha;

    return this;
  }

  /**
   * Linearly interpolates between the given vectors, where alpha is the percent
   * distance along the line
   *
   * @remarks
   * alpha = 0 will be first vector
   * alpha = 1 will be the second vector
   * The result is stored in this instance
   *
   * @param v1 - The first vector
   * @param v2 - The second vector
   * @param alpha - the interpolstion factor, typically in closed interval [0, 1]
   * @rerutns A reference to this vector
   */
  public lerpVectors(v1: Vector2, v2: Vector2, alpha: number): this {
    this.x = v1.x + (v2.x - v1.x) * alpha;
    this.y = v1.y + (v2.y - v1.y) * alpha;

    return this;
  }

  /**
   * Returns true if this vector is equal with the given one
   *
   * @param v - The vector to test for equality
   * @returns true if this vector is same as given vector, false otherwise
   */
  public equals(v: Vector2): boolean {
    return ((v.x === this.x) && (v.y === this.y));
  }

  /**
   * Sets this vector's components to be same as given array
   *
   * @param array - An array holding the vector component values
   * @param offset - The offset into the array
   * @returns A reference to this vector
   */
  public fromArray(array: number[], offset: number = 0): this {
    this.x = array[offset];
    this.y = array[offset + 1];

    return this;
  }

  /**
   * Writes the components of this vector to the given array
   *
   * @remarks
   * If not array is provided, the methods returns a new array instance
   *
   * @param array - The target array to write to
   * @param offset - Index to the array to start writing
   * @returns Array containing the vector components
   */
  public toArray(array: number[] = [], offset: number = 0): number[] {
    array[offset] = this.x;
    array[offset + 1] = this.y;

    return array;
  }

  /**
   * Sets the components of thid vector fromt he given buffer attributes
   *
   * @param attribute - The buffer attribute holding the vector data
   * @param index - The index into the attribute to start reading
   * @returns A reference to this vector
   */
  public fromBufferAttribute(attribute: BufferAttribute | InterleavedBufferAttribute, index: number): this {
    this.x = attribute.getX(index);
    this.y = attribute.getY(index);

    return this;
  }

  /**
   * Rotates this vector around the given center by the given angle
   *
   * @remarks
   * Rotating points around a pivote in 2D graphics
   * Rotating sprites or objects in a game
   * Geometric transformations in simulations
   *
   * @param center - the point around which to rotate
   * @param angle - The angle to rotate, in radians
   * @returns A reference to this vector
   */
  public rotateAround(center: Vector2, angle: number): this {
    const c = Math.cos(angle), s = Math.sin(angle);

    // Translate the vector so center is at the origin
    const x = this.x - center.x;
    const y = this.y - center.y;

    // Apply the 2D rotation matrix
    // Translate back by adding center.x and center.y
    this.x = x * c - y * s + center.x;
    this.y = x * s + y * c + center.y;

    return this;
  }

  /**
   * Sets each component of this vector to a pseudo-random number in the range [0, 1)
   *
   * @returns A reference to this vector
   */
  public random(): this {
    this.x = Math.random();
    this.y = Math.random();

    return this;
  }

  /**
   * Returns a new vector with copied values from this instance.
   *
   * @returns A clone of this instance
   */
  public clone(): Vector2 {
    return new (this.constructor as { new(x: number, y: number): Vector2 })(this.x, this.y);
  }

  /**
   * Copies the values of the given vector to this instance
   *
   * @param v - The vector to copy
   * @returns A reference to this vector
   */
  public copy(v: Vector2): this {
    this.x = v.x;
    this.y = v.y;

    return this;
  }

  /**
    * Iterator
    *
    * @returns the components of this vector iterated in order
    */
  [Symbol.iterator](): Iterator<number | string> {
    return [this.x, this.y][Symbol.iterator]();
  }

}

export function isVector2(
  vector: any
): vector is Vector2 {
  return (vector as any).isVector2 === true;
}

