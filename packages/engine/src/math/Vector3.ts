// Types - for type checking only
import { Matrix3 } from './Matrix3';
import { Euler } from './Euler';
import { Matrix4 } from './Matrix4';
import { Camera } from '../cameras/Camera';

import { clamp } from './MathUtils';
import { Quaternion } from './Quaternion';
import { BufferAttribute } from '../core/BufferAttribute';
import { InterleavedBufferAttribute } from '../core/InterleavedBufferAttribute';
import { Cylindrical } from './Cylindrical';
import { Spherical } from './Spherical';
import { Color } from './Color';

const _quaternion = /*@__PURE__*/ new Quaternion();

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
  public set(x: number, y: number, z?: number): this {
    if (z === undefined) z = this.z;  // sprite.scale.set(x,y)
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
  public setScalar(scalar: number): this {
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
  public setX(x: number): this {
    this.x = x;

    return this;
  }

  /**
   * Sets the vector's y component to a given value
   *
   * @param y - The y component.
   * @returns The current instance.
   */
  public setY(y: number): this {
    this.y = y;

    return this;
  }

  /**
   * Sets the vector's z component to a given value
   *
   * @param z - The z component.
   * @returns The current instance.
   */
  public setZ(z: number): this {
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
  public setComponent(index: number, value: number): this {
    switch (index) {
      case 0: this.x = value; break;
      case 1: this.y = value; break;
      case 2: this.z = value; break;
      default: throw new Error('index is out of range: ' + index);
    }

    return this;
  }

  public getComponent(index: number): number {
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
  public clone(): Vector3 {
    return new (this.constructor as any)(this.x, this.y, this.z);
  }

  /**
   * Copies the values of the given vector to this instance.
   *
   * @param v - The vector to copy from.
   * @returns The current instance.
   */
  public copy(v: Vector3): this {
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
  public add(v: Vector3): this {
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
  public addScalar(s: number): this {
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
  public addVectors(a: Vector3, b: Vector3): this {
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
  public addScaledVector(v: Vector3, s: number): this {
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
  public sub(v: Vector3): this {
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
  public subScalar(s: number): this {
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
  public subVectors(a: Vector3, b: Vector3): this {
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
  public multiply(v: Vector3): this {
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
  public multiplyScalar(s: number): this {
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
  public multiplyVectors(a: Vector3, b: Vector3): this {
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
  public divide(v: Vector3): this {

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
  public divideScalar(s: number): this {
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
  public applyEuler(euler: Euler): this {
    return this.applyQuaternion(_quaternion.setFromEuler(euler));
  }

  /**
   * Applies a rotation specified by an axis and an angle to this vector.
   *
   * @param axis - The axis to rotate around (assumed to be normalized).
   * @param angle - The angle in radians.
   * @returns The current instance.
   */
  public applyAxisAngle(axis: Vector3, angle: number): this {
    return this.applyQuaternion(_quaternion.setFromAxisAngle(axis, angle));
  }

  /**
   * Applies the given 3x3 matrix to this vector.
   *
   * @param m - The 3x3 matrix to apply.
   * @returns The current instance.
   */
  public applyMatrix3(m: Matrix3) {
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
  public applyNormalMatrix(m: Matrix3) {
    return this.applyMatrix3(m).normalize();
  }

  /**
   *  Multiplies this vector (with an implicit 1 in the 4th dimension) by m,
   * and divides by perspective
   *
   * @param m - tha matrix to apply
   * @return The current instance
   */
  public applyMatrix4(m: Matrix4) {
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
   * @remarks
   * Rotates this vector by the given quaternion
   * Assumes the quaternion is normalized. If quaternion is not normalized,
   * the rotation will scale the vector (incorrectly) as well
   *
   * @param q - The Quaternion to apply.
   * @return The current instance.
   */
  public applyQuaternion(q: any): this {
    // quaternion q is assumed to have unit length

    // Extract vector components
    const vx = this.x, vy = this.y, vz = this.z;
    // Extract quaternion components
    const qx = q.x, qy = q.y, qz = q.z, qw = q.w;

    // t = 2 * cross( q.xyz, v );
    // Twice the cross product of quaternion vector part and the vector
    const tx = 2 * (qy * vz - qz * vy);
    const ty = 2 * (qz * vx - qx * vz);
    const tz = 2 * (qx * vy - qy * vx);

    // v + q.w * t + cross( q.xyz, t );
    // qw * t -> rotates the vector along the quaternion's scalar part
    // cross( q.xyz, t ) -> rotates the vector along the quaternion's vector part
    this.x = vx + qw * tx + qy * tz - qz * ty;
    this.y = vy + qw * ty + qz * tx - qx * tz;
    this.z = vz + qw * tz + qx * ty - qy * tx;

    return this;
  }

  /**
   * Projects this vector from world space into the camera's renormalized
   * device coordinates (NDC) space
   *
   * @param camera - The camera.
   * @return The current instance
   */
  public project<T extends Camera>(camera: T): this {
    return this.applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);
  }

  /**
   * Unprojects this vector from the camera's normalized device coordinate (NDC)
   * space into the world space
   *
   * @param camera - The camera.
   * @return The current instance
   */
  public unproject<T extends Camera>(camera: T): this {
    return this.applyMatrix4(camera.projectionMatrixInverse).applyMatrix4(camera.matrixWorld);
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
  public transformDirection(m: Matrix4): this {
    // input: Matrix4 affine matrix
    // vector interpreted as a direction

    const x = this.x, y = this.y, z = this.z;
    const e = m.elements;

    this.x = e[0] * x + e[4] * y + e[8] * z;
    this.y = e[1] * x + e[5] * y + e[9] * z;
    this.z = e[2] * x + e[6] * y + e[10] * z;

    return this.normalize();
  }

  /**
   * If this vector's components values are greater than the given vector's component
   * values, set them to the given vector's component values.
   *
   * @param v - the vector to compare to.
   * @returns The current instance.
   */
  public min(v: Vector3): this {
    this.x = Math.min(this.x, v.x);
    this.y = Math.min(this.y, v.y);
    this.z = Math.min(this.z, v.z);

    return this;
  }

  /**
   * If this vector's component values are less than the given vector's component
   * values, set them to the given vector's component values.
   *
   * @param v - the vector to compare to.
   * @returns The current instance.
   */
  public max(v: Vector3): this {
    this.x = Math.max(this.x, v.x);
    this.y = Math.max(this.y, v.y);
    this.z = Math.max(this.z, v.z);

    return this;
  }

  /**
   * If any component of this vector is greater than the corresponding component
   * of the max vector, it is replaced by the value from the max vector
   * if any componentn of this vector is less than the corresponding component of
   * the min vector, it is replaced by the value from the min vector
   *
   * @param min - the min vector
   * @param max - the max vector
   * @return The current instance
   */
  public clamp(min: Vector3, max: Vector3) {
    // assume min < max, componentwise

    this.x = clamp(this.x, min.x, max.x);
    this.y = clamp(this.y, min.y, max.y);
    this.z = clamp(this.z, min.z, max.z);

    return this;
  }

  /**
   * If this vector's x, y, or z values are greater than the max value,
   * they are replaced by the max value
   * If this vector's x, y, or z values are less than min value,
   * they are replaced by the min value
   *
   * @param min - The mininum value the components will clamp to
   * @param max - The maximum value the components will clamp to
   * @returns A reference to this vector
   */
  public clampScalar(min: number, max: number): this {
    this.x = clamp(this.x, min, max);
    this.y = clamp(this.y, min, max);
    this.z = clamp(this.z, min, max);

    return this;
  }

  /**
   * Clamps this vectors length to be in the range defined by min
   * and max inclusive
   *
   * @param min - The minimum value the vector will clamp to
   * @param max - The maximum value the vector will clap to
   * @returns A reference to this vector
   */
  public clampLength(min: number, max: number): this {
    const length = this.length();

    return this.divideScalar(length || 1).multiplyScalar(clamp(length, min, max));
  }

  /**
   * The components of this vector are rounded down to the nearest
   * integer value
   *
   * @returns A reference to this vector
   */
  public floor(): this {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    this.z = Math.floor(this.z);

    return this;
  }

  /**
   * The components of this vector are rounded up to the nearest
   * integer value
   *
   * @returns A reference to this vector
   */
  public ceil(): this {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    this.z = Math.ceil(this.z);

    return this;
  }

  /**
   * The components of this vector are rounded to the nearest
   * integer value
   *
   * @returns A reference to this vector
   */
  public round(): this {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    this.z = Math.round(this.z);

    return this;
  }

  /**
   * The components of this vector are rounded towards zero
   * (up if negative, down if positive) to an integer value
   *
   * @returns A reference to this vector
   */
  public roundToZero(): this {
    this.x = Math.trunc(this.x);
    this.y = Math.trunc(this.y);
    this.z = Math.trunc(this.z);

    return this;
  }

  /**
   * Calculates the dot product of the vicen vector with this instance.
   *
   * @param v - The vector to compute the dot product with.
   * @returns The result of the dot product
   */
  public dot(v: Vector3): number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

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
  public lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  /**
   * Computes the Euclidean length (straight-line length) from (0, 0, 0) to (x, y, z)
   *
   * @return The length of this vector.
   */
  public length() {
    return Math.sqrt(this.lengthSq());
  }

  /**
   * Computes the Manhattan length of this vector.
   *
   * @returns The length of this vector
   */
  public manhattanLength(): number {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
  }

  /**
   * Converts this vector to a unit vector
   * That is sets it equal to a vector with same direction, but length 1
   *
   * @return The current instance
   */
  public normalize() {
    return this.divideScalar(this.length() || 1);
  }

  /**
   * Sets this vector to a vector with the same direction as this one, but
   * with the specified length
   *
   * @param length - The new length of this vector
   * @returns A reference to this vector
   */
  public setLength(length: number): this {
    return this.normalize().multiplyScalar(length);
  }

  /**
   * Linearly interpolates between the given vector and this instance
   *
   * @remarks
   * alpha is the percent distance along the line
   * alpha = 0 will be this vector
   * alpha = 1 will be the given vector, v
   *
   * @param v - The vector to interpolate towards.
   * @param alpha - The interpolation factor in the range [0, 1].
   * @returns A reference to this vector
   */
  public lerp(v: Vector3, alpha: number): this {
    this.x += (v.x - this.x) * alpha;
    this.y += (v.y - this.y) * alpha;
    this.z += (v.z - this.z) * alpha;

    return this;
  }

  /**
   * Linearly interpolates between two vectors and stores the result in this instance.
   *
   * @remarks
   * alpha is the percent distance along the line
   * alpha = 0 will be v1
   * alpha = 1 will be v2
   *
   * @param v1 - The starting vector.
   * @param v2 - The ending vector.
   * @param alpha - The interpolation factor in the range [0, 1].
   * @returns A reference to this vector
   */
  public lerpVectors(v1: Vector3, v2: Vector3, alpha: number): this {

    this.x = v1.x + (v2.x - v1.x) * alpha;
    this.y = v1.y + (v2.y - v1.y) * alpha;
    this.z = v1.z + (v2.z - v1.z) * alpha;

    return this;

  }

  /**
   * Calculates the cross product of this vector and the given vector and
   * stores the result in this instance.
   *
   * @param v - The vector to cross with.
   * @returns The current instance.
   */
  public cross(v: Vector3): this {
    return this.crossVectors(this, v);
  }

  /**
   * Calculates the cross product of the given vectors and stores the result in this instance.
   *
   * @param a - The first vector.
   * @param b - The second vector.
   * @returns The current instance.
   */
  public crossVectors(a: Vector3, b: Vector3): this {
    const ax = a.x, ay = a.y, az = a.z;
    const bx = b.x, by = b.y, bz = b.z;

    this.x = ay * bz - az * by;
    this.y = az * bx - ax * bz;
    this.z = ax * by - ay * bx;

    return this;
  }

  /**
   * Projects this vector onto the given vector.
   *
   * @param v - The vector to project onto.
   * @returns A reference to this vector.
   */
  public projectOnVector(v: Vector3): this {
    const denominator = v.lengthSq();

    if (denominator === 0) return this.set(0, 0, 0);

    const scalar = v.dot(this) / denominator;

    return this.copy(v).multiplyScalar(scalar);
  }

  /**
   * Projects this vector onto a plane by subtracting this vector projected onto
   * the plane's normal from this vector.
   *
   * @param planeNormal - The plane's normal vector (assumed to be normalized).
   * @returns A reference to this vector.
   */
  public projectOnPlane(planeNormal: Vector3): this {
    _vector.copy(this).projectOnVector(planeNormal);

    return this.sub(_vector);
  }

  /**
   * Reflects this vector off a plane orthognal to the given normal.
   *
   * @param normal - The (normalized) normal vector
   * @returns A reference to this vector
   */
  public reflect(normal: Vector3): this {
    return this.sub(_vector.copy(normal).multiplyScalar(2 * this.dot(normal)));
  }

  /**
   * Returns the angle between the given vector and this instance in radians
   *
   * @param v - The vector to compute the angle to
   * @returns The angle in radians
   */
  public angleTo(v: Vector3): number {
    const denominator = Math.sqrt(this.lengthSq() * v.lengthSq());

    if (denominator === 0) return Math.PI / 2;

    const theta = this.dot(v) / denominator;

    // clamp, to handle numerical problems

    return Math.acos(clamp(theta, - 1, 1));
  }

  /**
   * Computes the square of the Euclidean distance from this instance to the given vector.
   *
   * @remarks
   * If you are comparing distances, you should compare the distance squared
   * instead, as it is slightly more efficient to calculate
   *
   * @param v - The vector to compute the distance to.
   * @returns The square of the distance.
   */
  public distanceToSquared(v: Vector3): number {
    const dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;

    return dx * dx + dy * dy + dz * dz;
  }

  /**
   * Computes the Euclidean distance from this instance to the given vector.
   *
   * @param v - The vector to compute the distance to.
   * @returns The distance.
   */
  public distanceTo(v: Vector3): number {
    return Math.sqrt(this.distanceToSquared(v));
  }

  /**
   * Computes the Manhattan distance from this instance to the given vector.
   *
   * @param v - The vector to compute the distance to.
   * @returns The Manhattan distance.
   */
  public manhattanDistanceTo(v: Vector3): number {
    return Math.abs(this.x - v.x) + Math.abs(this.y - v.y) + Math.abs(this.z - v.z);
  }

  /**
   * Sets the vector components from the given Spherical coordinates.
   *
   * @param radius - The radius.
   * @param phi - The polar angle.
   * @param theta - The azimuthal angle.
   * @returns A reference to this vector.
   */
  public setFromSphericalCoords(radius: number, phi: number, theta: number): this {
    const sinPhiRadius = Math.sin(phi) * radius;

    this.x = sinPhiRadius * Math.sin(theta);
    this.y = Math.cos(phi) * radius;
    this.z = sinPhiRadius * Math.cos(theta);

    return this;
  }

  /**
   * Sets the vector components from the given Spherical coordinates.
   *
   * @param s - The Spherical coordinates.
   * @returns A reference to this vector.
   */
  public setFromSpherical(s: Spherical): this {
    return this.setFromSphericalCoords(s.radius, s.phi, s.theta);
  }

  /**
   * Sets the vector components from the given Cylindrical coordinates.
   *
   * @param radius - The radius.
   * @param theta - The azimuthal angle.
   * @param y - The y component.
   * @returns A reference to this vector.
   */
  public setFromCylindricalCoords(radius: number, theta: number, y: number): this {
    this.x = radius * Math.sin(theta);
    this.y = y;
    this.z = radius * Math.cos(theta);

    return this;
  }

  /**
   * Sets the vector components from the given Cylindrical coordinates.
   */
  public setFromCylindrical(c: Cylindrical): this {
    return this.setFromCylindricalCoords(c.radius, c.theta, c.y);
  }

  /**
   * Sets vector components from an array.
   *
   * @param array - The array to read from.
   * @param offset - The offset into the array where the vector components start. Default is `0`.
   * @returns A reference to this vector.
   */
  public fromArray(array: number[], offset: number = 0): this {
    this.x = array[offset];
    this.y = array[offset + 1];
    this.z = array[offset + 2];

    return this;
  }

  /**
   * Sets the vector components to the position elements of the given
   * transformation matrix
   *
   * @param m - The 4x4 matrix.
   * @returns A reference to this vector
   */
  public setFromMatrixPosition(m: Matrix4): this {
    const e = m.elements;

    this.x = e[12];
    this.y = e[13];
    this.z = e[14];

    return this;
  }

  /**
   * Sets the vector components to the scale elements of the given
   * transformation matrix
   *
   * @param m - The 4x4 matrix.
   * @returns A reference to this vector
   */
  public setFromMatrixScale(m: Matrix4): this {
    const sx = this.setFromMatrixColumn(m, 0).length();
    const sy = this.setFromMatrixColumn(m, 1).length();
    const sz = this.setFromMatrixColumn(m, 2).length();

    this.x = sx;
    this.y = sy;
    this.z = sz;

    return this;
  }

  /**
   * Sets the vector components from the specified matrix column.
   *
   * @param m - The 4x4 matrix
   * @param index - The column index (0, 1, 2, or 3)
   * @returns A reference to this vector
   */
  public setFromMatrixColumn(m: Matrix4, index: number): this {
    return this.fromArray(m.elements, index * 4);
  }

  /**
   * Sets the vector components from the specified matrix column.
   *
   * @param m - The 3x3 matrix
   * @param index - The column index (0, 1, or 2)
   * @returns A reference to this vector
   */
  public setFromMatrix3Column(m: Matrix3, index: number): this {
    return this.fromArray(m.elements, index * 3);
  }

  /**
   * Sets the vector components from the given Euler angles.
   *
   * @param e - The Euler angles.
   * @returns A reference to this vector
   */
  public setFromEuler(e: Euler): this {
    this.x = e.x;
    this.y = e.y;
    this.z = e.z;

    return this;
  }

  /**
   * Sets the vector components from the RGB components of the given color
   *
   * @param c - The color
   * @returns A reference to this vector
   */
  public setFromColor(c: Color): this {
    this.x = c.r;
    this.y = c.g;
    this.z = c.b;

    return this;
  }

  /**
   * Returns `true` if this vector is equal to the given vector.
   *
   * @param v - The vector to compare with.
   * @returns `true` if the vectors are equal, `false` otherwise.
   */
  public equals(v: Vector3): boolean {
    return ((v.x === this.x) && (v.y === this.y) && (v.z === this.z));
  }

  /**
   * Inverts this vector
   *
   * @returns A reference to this vector
   */
  public negate(): this {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;

    return this;
  }

  /**
   * Writes the components of this vector to the given array. If no array is provided,
   * the method returns a new instance
   *
   * @param array - The array to write to.
   * @param offset - Index of the first element in the array. Default is 0
   * @returns The vector components in an array
   */
  public toArray(array: number[] = [], offset: number = 0): number[] {
    array[offset] = this.x;
    array[offset + 1] = this.y;
    array[offset + 2] = this.z;

    return array;
  }

  /**
   * Sets the component of this vector from the given buffer attribute
   *
   * @param attribute - The buffer attribute holding the vector data
   * @param index - The index into the attribute
   * @return A reference to this vector
   */
  public fromBufferAttribute(attribute: BufferAttribute | InterleavedBufferAttribute, index: number): this {
    this.x = attribute.getX(index);
    this.y = attribute.getY(index);
    this.z = attribute.getZ(index);

    return this;
  }

  /**
   * Sets each component of this vector to a pseudo-random value
   * between 0 and 1, excluding 1
   *
   * @returns A reference to this vector
   */
  public random(): this {
    this.x = Math.random();
    this.y = Math.random();
    this.z = Math.random();

    return this;
  }

  /**
   * Sets this vector to a uniformly random point on a unit sphere
   *
   * @returns A reference to this vector
   */
  public randomDirection(): this {
    // https://mathworld.wolfram.com/SpherePointPicking.html

    const theta = Math.random() * Math.PI * 2;
    const u = Math.random() * 2 - 1;
    const c = Math.sqrt(1 - u * u);

    this.x = c * Math.cos(theta);
    this.y = u;
    this.z = c * Math.sin(theta);

    return this;
  }

  [Symbol.iterator](): Iterator<number> {
    return [this.x, this.y, this.z][Symbol.iterator]();
  }
}

const _vector = /*@__PURE__*/ new Vector3();
