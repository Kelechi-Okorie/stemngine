// Types - for type checking only
import type { Matrix3 } from './Matrix3';
import type { Matrix4 } from './Matrix4';

// Implementations
// import { Matrix3 as Matrix3Impl } from './Matrix3'; // actual class at runtime


/**
 * Class representing a 3D vector.
 *
 * A 3D vector is an ordered triplet of numbers (labeled x, y, and z) that can represent
 * a number things including
 *
 * - A point in 3D space
 * - A direction and magnitude in 3D space (in engine length is the Euclidean distance)
 * - Any arbitrary ordered triplet of numbers
 *
 * Iterating through a vector instance will yield its components in the order x, y, z.
 *
 * ```js
 * const a = new Vector3(1, 2, 3);
 *
 * // no arguments will be initialized to (0, 0, 0)
 * const b = new Vector3();
 * ```
 */
export class Vector3 {
  /**
   * this flag can be used for type testing.
   *
   * @type {boolean}
   * @readonly
   * @defaultValue true
   */
  public readonly isVector3: boolean = true;

  /**
   * Creates a new Vector3 instance.
   *
   * @param [x=0] - The x component.
   * @param [y=0] - The y component.
   * @param [z=0] - The z component.
   */
  constructor(public x: number = 0, public y: number = 0, public z: number = 0) {
  }

  /**
   * Sets the vector components.
   *
   * @param x - The x component.
   * @param y - The y component.
   * @param z - The z component.
   * @returns The current instance.
   */
  set(x: number, y: number, z?: number): this {
    if (z === undefined) z = this.z;
    this.x = x;
    this.y = y;
    this.z = z;

    return this;
  }

  /**
   * Sets the vector components to the same value.
   *
   * @param scalar - The value to set for all components.
   * @returns A reference to this vector
   */
  setScalar(scalar: number): this {
    this.x = scalar;
    this.y = scalar;
    this.z = scalar;

    return this;
  };

  /**
   * Sets the vector's x component to a given value
   *
   * @param x - The x component.
   * @returns The current instance.
   */
  setX(x: number): this {
    this.x = x;

    return this;
  }

  /**
   * Sets the vector's y component to a given value
   *
   * @param y - The y component.
   * @returns The current instance.
   */
  setY(y: number): this {
    this.y = y;

    return this;
  }

  /**
   * Sets the vector's z component to a given value
   *
   * @param z - The z component.
   * @returns The current instance.
   */
  setZ(z: number): this {
    this.z = z;

    return this;
  }

  /**
   * Allows to set a vector component with an index
   *
   * @param index - The index of the component (0 = x, 1 = y, 2 = z).
   * @param value - The value to set.
   * @returns The current instance.
   */
  setComponent(index: number, value: number): this {
    switch (index) {
      case 0: this.x = value; break;
      case 1: this.y = value; break;
      case 2: this.z = value; break;
      default: throw new Error('index is out of range: ' + index);
    }

    return this;
  }

  getComponent(index: number): number {
    switch (index) {
      case 0: return this.x;
      case 1: return this.y;
      case 2: return this.z;
      default: throw new Error('index is out of range: ' + index);
    }
  }

  /**
   * Returns a new vector with copied values from this instance.
   *
   * @returns A clone of this instance.
   */
  clone(): Vector3 {
    return new (this.constructor as any)(this.x, this.y, this.z);
  }

  /**
   * Copies the values of the given vector to this instance.
   *
   * @param v - The vector to copy from.
   * @returns The current instance.
   */
  copy(v: Vector3): this {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;

    return this;
  }

  /**
   * Adds the given vector to this instance.
   *
   * @param v - The vector to add.
   * @returns The current instance.
   */
  add(v: Vector3): this {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;

    return this;
  }

  /**
   * Adds the given scalar to this instance.
   *
   * @param s - The scalar to add.
   * @returns The current instance.
   */
  addScalar(s: number): this {
    this.x += s;
    this.y += s;
    this.z += s;

    return this;
  }

  /**
   * Adds the given vectors and stores the result in this instance.
   *
   * @param a - The first vector to add.
   * @param b - The second vector to add.
   * @returns The current instance.
   */
  addVectors(a: Vector3, b: Vector3): this {
    this.x = a.x + b.x;
    this.y = a.y + b.y;
    this.z = a.z + b.z;

    return this;
  }

  /**
   * Adds the given vector scaled by the given scalar to this instance.
   *
   * @param v - The vector to add.
   * @param s - The scalar to scale the vector by before adding.
   * @returns The current instance.
   */
  addScaledVector(v: Vector3, s: number): this {
    this.x += v.x * s;
    this.y += v.y * s;
    this.z += v.z * s;

    return this;
  }

  /**
   * Subtracts the given vector from this instance.
   *
   * @param v - The vector to subtract.
   * @returns The current instance.
   */
  sub(v: Vector3): this {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;

    return this;
  }

  /**
   * Subtracts the given scalar from this instance.
   *
   * @param s - The scalar to subtract.
   * @returns The current instance.
   */
  subScalar(s: number): this {
    this.x -= s;
    this.y -= s;
    this.z -= s;

    return this;
  }

  /**
   * Subtracts the given vectors and stores the result in this instance.
   *
   * @param a - The first vector to subtract.
   * @param b - The second vector to subtract.
   * @returns The current instance.
   */
  subVectors(a: Vector3, b: Vector3): this {
    this.x = a.x - b.x;
    this.y = a.y - b.y;
    this.z = a.z - b.z;

    return this;
  }

  /**
   * Multiplies this instance by the given vector.
   *
   * @param v - The vector to multiply by.
   * @returns The current instance.
   */
  multiply(v: Vector3): this {
    this.x *= v.x;
    this.y *= v.y;
    this.z *= v.z;

    return this;
  }

  /**
   * Multiplies this instance by the given scalar.
   *
   * @param s - The scalar to multiply by.
   * @returns The current instance.
   */
  multiplyScalar(s: number): this {
    this.x *= s;
    this.y *= s;
    this.z *= s;

    return this;
  }

  /**
   * Multiplies the given vectors and stores the result in this instance.
   *
   * @param a - The first vector to multiply.
   * @param b - The second vector to multiply.
   * @returns The current instance.
   */
  multiplyVectors(a: Vector3, b: Vector3): this {
    this.x = a.x * b.x;
    this.y = a.y * b.y;
    this.z = a.z * b.z;

    return this;
  }

  /**
   * Divides this instance by the given vector.
   *
   * @param v - The vector to divide by.
   * @returns The current instance.
   */
  divide(v: Vector3): this {

    if (v.x === 0 || v.y === 0 || v.z === 0) {
      throw new Error('division by zero');
    }

    this.x /= v.x;
    this.y /= v.y;
    this.z /= v.z;

    return this;
  }

  /**
   * Divides this instance by the given scalar.
   *
   * @param s - The scalar to divide by.
   * @returns The current instance.
   */
  divideScalar(s: number): this {
    if (s === 0) {
      throw new Error('division by zero');
    }

    return this.multiplyScalar(1 / s);
  }

  /**
   * Applies the given Euler rotation to this vector.
   *
   * @param euler - The Euler rotation to apply.
   * @return The current instance.
   */
  applyEuler(euler: any): this {
    // TODO: implement once Euler and Quaternion are available
    throw new Error('applyEuler is not implemented yet');
  }

  /**
   * Applies a rotation specified by an axis and an angle to this vector.
   *
   * @param axis - The axis to rotate around (assumed to be normalized).
   * @param angle - The angle in radians.
   * @returns The current instance.
   */
  applyAxisAngle(axis: Vector3, angle: number): this {
    // TODO: implement once Quaternion is available
    throw new Error('applyAxisAngle is not implemented yet');
  }

  /**
   * Applies the given 3x3 matrix to this vector.
   *
   * @param m - The 3x3 matrix to apply.
   * @returns The current instance.
   */
  applyMatrix3(m: Matrix3) {
    const x = this.x, y = this.y, z = this.z;
    const e = m.elements;

    this.x = e[0] * x + e[3] * y + e[6] * z;
    this.y = e[1] * x + e[4] * y + e[7] * z;
    this.z = e[2] * x + e[5] * y + e[8] * z;

    return this;
  }

  /**
   * Multiplies this vector by the given normal matrix and normalizes
   *
   * @param m - normal matrix.
   * @return The current instance
   */
  applyNormalMatrix(m: Matrix3) {
    return this.applyMatrix3(m).normalize();
  }

  /**
   *  Multiplies this vector (with an implicit 1 in the 4th dimension) by m,
   * and divides by perspective
   *
   * @param m - tha matrix to apply
   * @return The current instance
   */
  applyMatrix4(m: Matrix4) {
    const x = this.x, y = this.y, z = this.z;
    const e = m.elements;

    const w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);

    this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
    this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
    this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;

    return this;
  }

  /**
   * Applies the given Quaternion rotation to this vector.
   *
   * @param q - The Quaternion to apply.
   * @return The current instance.
   */
  applyQuaternion(q: any): this {
    // TODO: implement once Quaternion is available
    throw new Error('applyQuaternion is not implemented yet');
  }

  /**
   * Projects this vector from world space into the camera's renormalized
   * device coordinates (NDC) space
   *
   * @param camera - The camera.
   * @return The current instance
   */
  project(camera: any): this {
    // TODO: implement once Camera is available
    throw new Error('project is not implemented yet');
  }

  /**
   * Unprojects this vector from the camera's normalized device coordinate (NDC)
   * space into the world space
   *
   * @param camera - The camera.
   * @return The current instance
   */
  unproject(camera: any): this {
    // TODO: implement once camera is available
    throw new Error('unproject is not yet implemented');
  }

  /**
   * Transforms the direction of this vector by a given matrix
   * (the upper left 3x3 subset of the given 4x4 matrix) and
   * then normalizes the result.
   *
   * @remarks
   * - Using applyMatrix4 would treat this vector like a point — it would apply
   *   translation and possibly perspective divide — not what we want for directions
   * - Multiplying a direction vector by a transformation matrix should
   *   completely ignore the translation part, because directions are not
   *   affected by translations - so we use only the upper 3x3 part of the matrix.
   * - Normalize because multiplying by the 3×3 part can introduce
   *   scaling or skewing, depending on the matrix.
   *   But a direction vector should usually remain a unit vector —
   *   e.g. camera forward vectors, normals, light directions, etc.
   *
   * @param m - The matrix.
   * @return The current instance
   */
  transformDirection(m: Matrix4): this {
    // input: Matrix4 affine matrix
    // vector interpreted as a direction

    const x = this.x, y = this.y, z = this.z;
    const e = m.elements;

    this.x = e[0] * x + e[4] * y + e[8] * z;
    this.y = e[1] * x + e[5] * y + e[9] * z;
    this.z = e[2] * x + e[6] * y + e[10] * z;

    return this.normalize();
  }


  ////////////////////////////////////////////////////////////////
  /* End of linear timeline */
  // TODO: Remove this after implementing the rest of the class

  /**
   * Computes the square of the Euclidean length (straight-line length) from
   * (0, 0, 0) to (x, y, z).
   *
   * @remark
   * If you are comparing the lengths of vectors, you should compare the length squared
   * instead, as it is slightly more efficient to calculate
   *
   * @return The square of the length of this vector
   */
  lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  /**
   * Computes the Euclidean length (straight-line length) from (0, 0, 0) to (x, y, z)
   *
   * @return The length of this vector.
   */
  length() {
    return Math.sqrt(this.lengthSq());
  }

  /**
   * Converts this vector to a unit vector
   * That is sets it equal to a vector with same direction, but length 1
   *
   * @return The current instance
   */
  normalize() {
    return this.divideScalar(this.length() || 1);
  }

}


// Why import type?
// It tells TypeScript: “only import the type, don’t emit any JavaScript import code.”
// Prevents circular dependency issues between Vector3.ts and Matrix3.ts.
// Keeps tree-shaking clean.

// import type { Matrix3 } from './Matrix3';
// import { Matrix3 as Matrix3Impl } from './Matrix3';


// [Symbol.iterator](): Iterator<number> {
//   return [this.x, this.y, this.z][Symbol.iterator]();
// }
