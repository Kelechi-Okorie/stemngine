import { clamp } from './MathUtils';
import type { Matrix4 } from './Matrix4';
import type { Vector3 } from './Vector3';
import type { Euler } from './Euler';

/**
 * Class for representing quaternions.
 * Quatenions are used to represent rotations.
 *
 * @remarks
 * Quaternion rotation is more compact and efficient than matrix or Euler angle representations,
 * and avoids problems like gimbal lock.
 *
 * Iterating through a vector instance will yield its x, y, z, w components in the corresponding order.
 *
 * Note that quaternions are expected to be normalized to represent a valid rotation.
 *
 * ```
 * const quaternion = new Quaternion();
 * quaternion.setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2);
 *
 * const vector = new Vector3(1, 0, 0);
 * vector.applyQuaternion(quaternion)
 */
export class Quaternion {
  /**
   * This flag can be used for type checking.
   *
   * @type {boolean}
   * @readonly
   * @defaultValue true
   */
  public readonly isQuaternion: boolean = true;

  /**
   * Registers a callback to be called whenever this quaternion changes.
   *
   * @remarks
   * This is used to notify other objects that depend on this quaternion when it changes
   * like matrices, or other transformations
   *
   * @param callback - The function to be called on change.
   * @returns This quaternion (for chaining).
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
   * Create a new Quaternion instance.
   *
   * @param x - The x component. Default is `0`.
   * @param y - The y component. Default is `0`.
   * @param z - The z component. Default is `0`.
   * @param w - The w component. Default is `1`.
   */
  constructor(public x: number = 0, public y: number = 0, public z: number = 0, public w: number = 1) { }

  /**
   * Sets the components of this quaternion.
   *
   * @param x - The x component.
   * @param y - The y component.
   * @param z - The z component.
   * @param w - The w component.
   * @returns This quaternion.
   */
  public set(x: number, y: number, z: number, w: number): this {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;

    this._onChangeCallback();

    return this
  }

  /**
   * Gets the x value of this quaternion
   *
   * @returns The x component
   */
  public getX(): number {
    return this.x;
  }

  /**
   * Sets the x value of this quaternion
   *
   * @returns void
   */
  public setX(value: number): void {
    this.x = value;
    this._onChangeCallback()
  }

  /**
   * Gets the y value of this quaternion
   *
   * @returns void
   */
  public getY(): number {
    return this.y
  }

  /**
   * Sets the y value of this quaternion
   *
   * @returns void
   */
  public setY(value: number): void {
    this.y = value;
    this._onChangeCallback();
  }

  /**
   * Gets the z value of this quaternion
   *
   * @returns The z component
   */
  public getZ(): number {
    return this.z;
  }

  /**
   * Sets the z value of this quaternion
   */
  public setZ(value: number): void {
    this.z = value;
    this._onChangeCallback();
  }

  /**
   * Gets the w component of this quaternion
   *
   * @returns The w component
   */
  public getW(): number {
    return this.w;
  }

  /**
   * Sets the w component of this quaternion
   */
  public setW(value: number): void {
    this.w = value;
    this._onChangeCallback();
  }

  /**
   * Returns a new quaternion with copied values from this instance
   *
   * @returns A clone of this instance
   */
  public clone() {
    return new Quaternion(this.x, this.y, this.z, this.w);
  }

  /**
   * Copies the values of the given quaternion to this instance
   *
   * @param q - The quaternion to copy from
   * @returns A reference to this quaternion
   */
  public copy(q: Quaternion): this {
    this.x = q.x;
    this.y = q.y;
    this.z = q.z;
    this.w = q.w;

    this._onChangeCallback();

    return this;
  }

  /**
   * Set this quaternion from the rotation specified by the givenEuler angles
   *
   * @remarks
   * 	[see]{@link http://www.mathworks.com/matlabcentral/fileexchange/20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/content/SpinCalc.m}
   * Euler angles are like rotate 30deg around X, then 45deg aroung Y, then 90deg around Z
   * Quaternions are a compact way of string the same rotation without suffering from
   * gimbal lock and with easier interpolation
   *
   * @param euler - The Euler angles.
   * @param update - Whether the internal `onChange` callback should be executed or not.
   * @returns A reference to this quaternion
   */
  public setFromEuler(euler: Euler, update: boolean = true): this {
    // Rotation order matters because rotations are not commutative
    const x = euler.x, y = euler.y, z = euler.z, order = euler.order;

    const cos = Math.cos;
    const sin = Math.sin;

    // Calculate half angle cosine of each Euler angle
    const c1 = cos(x / 2);
    const c2 = cos(y / 2);
    const c3 = cos(z / 2);

    // Calculate half angle sine of each Euler angle
    const s1 = sin(x / 2);
    const s2 = sin(y / 2);
    const s3 = sin(z / 2);

    // Combine  the half angle trigonometric functions into a quaternion
    // depending on the specified rotation order
    switch (order) {

      case 'XYZ':
        this.x = s1 * c2 * c3 + c1 * s2 * s3;
        this.y = c1 * s2 * c3 - s1 * c2 * s3;
        this.z = c1 * c2 * s3 + s1 * s2 * c3;
        this.w = c1 * c2 * c3 - s1 * s2 * s3;
        break;

      case 'YXZ':
        this.x = s1 * c2 * c3 + c1 * s2 * s3;
        this.y = c1 * s2 * c3 - s1 * c2 * s3;
        this.z = c1 * c2 * s3 - s1 * s2 * c3;
        this.w = c1 * c2 * c3 + s1 * s2 * s3;
        break;

      case 'ZXY':
        this.x = s1 * c2 * c3 - c1 * s2 * s3;
        this.y = c1 * s2 * c3 + s1 * c2 * s3;
        this.z = c1 * c2 * s3 + s1 * s2 * c3;
        this.w = c1 * c2 * c3 - s1 * s2 * s3;
        break;

      case 'ZYX':
        this.x = s1 * c2 * c3 - c1 * s2 * s3;
        this.y = c1 * s2 * c3 + s1 * c2 * s3;
        this.z = c1 * c2 * s3 - s1 * s2 * c3;
        this.w = c1 * c2 * c3 + s1 * s2 * s3;
        break;

      case 'YZX':
        this.x = s1 * c2 * c3 + c1 * s2 * s3;
        this.y = c1 * s2 * c3 + s1 * c2 * s3;
        this.z = c1 * c2 * s3 - s1 * s2 * c3;
        this.w = c1 * c2 * c3 - s1 * s2 * s3;
        break;

      case 'XZY':
        this.x = s1 * c2 * c3 - c1 * s2 * s3;
        this.y = c1 * s2 * c3 - s1 * c2 * s3;
        this.z = c1 * c2 * s3 + s1 * s2 * c3;
        this.w = c1 * c2 * c3 + s1 * s2 * s3;
        break;

      default:
        console.warn('Quaternion: .setFromEuler() encountered an unknown order: ' + order);

    }

    // If update === true, trigger _onChangeCallback
    // often used by render systems to mark "dirty" transforms
    if (update === true) this._onChangeCallback();

    // A quaternion representing the same orientation as applying the given Euler angles
    // in the specified order
    return this;
  }

  /**
   * Sets this quaternion from the given axis and angle
   *
   * @remarks
   * 	[see]	{@link http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToQuaternion/index.htm}
   *
   * @param axis - The normalized axis
   * @param angle - The angle in radians
   * @returns A reference to this quaternion
   */
  public setFromAxisAngle(axis: Vector3, angle: number): this {
    const halfAngle = angle / 2, s = Math.sin(halfAngle);

    this.x = axis.x * s;
    this.y = axis.y * s;
    this.z = axis.z * s;
    this.w = Math.cos(halfAngle);

    return this
  }

  /**
   * Sets this quaternion fromt he given rotation matrix.
   *
   * @remarks
   * 3D transformations often store rotation as a matrix (for applying to points) but quaternions
   * are more compact and numerically stable for:
   * -  smooth interpolation (slerp)
   * - avoiding gimbal lock
   * - combining rotations efficiently
   * so this method converts the rotation from matrix form -> quaternion form
   *
   * @param m - A 4x4 matrix of which the upper 3x3 of the matrix is a pure rotation matrix
   * (i.e. unscaled);
   * @returns A reference to this quaternion
   */
  public setFromRotationMatrix(m: Matrix4): this {
    // http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm

    // assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

    const te = m.elements,

      m11 = te[0], m12 = te[4], m13 = te[8],
      m21 = te[1], m22 = te[5], m23 = te[9],
      m31 = te[2], m32 = te[6], m33 = te[10],

      // uses the trace of the 3x3 matrix
      // depending on the value of the trace, the function picks a different formula to
      // compute (w, x, y, z) to ensure numerical stability
      // each bracnh corresponds to which diagonal element of the matrix is largest
      // this avoids precision loss when the trace is near zero or negative
      trace = m11 + m22 + m33;

    if (trace > 0) {

      const s = 0.5 / Math.sqrt(trace + 1.0);

      this.w = 0.25 / s;
      this.x = (m32 - m23) * s;
      this.y = (m13 - m31) * s;
      this.z = (m21 - m12) * s;

    } else if (m11 > m22 && m11 > m33) {

      const s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);

      this.w = (m32 - m23) / s;
      this.x = 0.25 * s;
      this.y = (m12 + m21) / s;
      this.z = (m13 + m31) / s;

    } else if (m22 > m33) {

      const s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);

      this.w = (m13 - m31) / s;
      this.x = (m12 + m21) / s;
      this.y = 0.25 * s;
      this.z = (m23 + m32) / s;

    } else {

      const s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);

      this.w = (m21 - m12) / s;
      this.x = (m13 + m31) / s;
      this.y = (m23 + m32) / s;
      this.z = 0.25 * s;

    }

    this._onChangeCallback();

    return this;
  }

  /**
   * Sets this quaternion to the rotation required to rotate the direction vector
   * `vFrom` to the direction vector `vTo`.
   *
   * @param vFrom - The initial direction vector (normalized).
   * @param vTo - The target direction vector (normalized).
   * @returns A reference to this quaternion
   */
  public setFromUnitVectors(vFrom: Vector3, vTo: Vector3): this {
    // assume direction vectors vFrom and vTo are normalized
    let r = vFrom.dot(vTo) + 1;

    if (r < 1e-8) { // the epsilon value has been discussed in #31286

      // vFrom and vTo point in opposite directions

      r = 0;

      if (Math.abs(vFrom.x) > Math.abs(vFrom.z)) {

        this.x = - vFrom.y;
        this.y = vFrom.x;
        this.z = 0;
        this.w = r;

      } else {

        this.x = 0;
        this.y = - vFrom.z;
        this.z = vFrom.y;
        this.w = r;

      }

    } else {

      // crossVectors( vFrom, vTo ); // inlined to avoid cyclic dependency on Vector3

      this.x = vFrom.y * vTo.z - vFrom.z * vTo.y;
      this.y = vFrom.z * vTo.x - vFrom.x * vTo.z;
      this.z = vFrom.x * vTo.y - vFrom.y * vTo.x;
      this.w = r;

    }

    return this.normalize();
  }

  /**
   * Returns the angle between this quaternion and the given quaternion in radians
   *
   * @param q - The quaternion to compute the angle to
   * @returns The angle in radians
   */
  public angleTo(q: Quaternion): number {
    return 2 * Math.acos(Math.abs(clamp(this.dot(q), -1, 1)));
  }

  /**
   * Rotates this quaternion by a given angular step to the given quaternion.
   *
   * @remarks
   * The method ensures that the final quaternion will not overshoot the target quaternion.
   *
   * @param q - The target quaternion
   * @param step - The angular step in radians
   * @returns A reference to this quaternion
   */
  public rotateTowards(q: Quaternion, step: number): this {
    // compute the angle between this quaternion and the given quaternion
    const angle = this.angleTo(q);

    // if the angle is 0, the quaternions are identical, return this quaternion
    if (angle === 0) return this;

    // computes a normalized interpolation factor
    const t = Math.min(1, step / angle);

    // calls slerp with the factor to move towards the given quaternion
    // without overshooting
    this.slerp(q, t);

    // So effectively wals the quaternion toward the target by a limited angular
    // step, which is usefull for smooth incremental rotations
    return this;
  }

  /**
   * Sets this quaternion to the identity quaternion; that is, to the quaternion
   * that represents a "no rotation"
   *
   * @returns A reference to this quaternion
   */
  public identity(): this {
    return this.set(0, 0, 0, 1);
  }

  /**
   * Inverts this quaternion via {@link Quaternion#conjugate}.
   * The quaternion is assumed to be unit length
   *
   * @remarks
   * For a unit quaternion, the inverse is equal to the conjugate
   * if the quaternion is not normalized, the correct inverse is:
   * q^-1 = q* / ||q||^2
   *
   * Conjugate flips the rotation direction
   * Inverse undoes the rotation. For a unit quaternion, these are exactly the same
   *
   * Geometrically, inverting a quaternion produces the rotation that undoes the original rotation
   *
   * @return A reference to this quaternion
   */
  public invert(): this {
    return this.conjugate();
  }

  /**
   * Returns the rotational conjugate of this quaternion.
   *
   * @remarks
   * The conjugate of a quaternion represents the same rotation in the opposite
   * direction about the same rotational axis.
   * If original quaternion rotates an object clockwise around an axis, the conjugate
   * rotates the object counter-clockwise around the same axis.
   * Think of it as undoing the rotation locally, but without scaling
   *
   * q = (x, y, z, w) => q* = (-x, -y, -z, w)
   * The vector part (x, y, z) is negated
   * The scalar part (w) stays the same
   *
   * @returns A reference
   */
  public conjugate(): this {
    this.x *= -1;
    this.y *= -1;
    this.z *= -1;

    this._onChangeCallback();

    return this;
  }

  /**
   * Calculates the dot product of this quaternion with the given quaternion
   *
   * @param v - The quaternion to compute the dot product with.
   * @returns The result of the dot product
   */
  public dot(v: Quaternion): number {
    return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
  }

  /**
   * Computes the squared Euclidean length (straight-line length) of this quaternion,
   *
   * @remarks
   * This quaternion is treated as a 4D vector (x, y, z, w)
   * this can be useful for comparing the lengths of two quaternions, as this is slightly more
   * efficent to compute than the actual length {@link Quaternion#length}.
   *
   * @returns The squared length of this quaternion.
   */
  public lengthSq(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
  }

  /**
   * Computes the Euclidean length (straight-line length) of this quaternion.
   *
   * @remarks
   * This quaternion is treated as a 4D vector (x, y, z, w)
   *
   * @returns The Euclidean length
   */
  public length() {
    return Math.sqrt(this.lengthSq());
  }

  /**
   * Normalizes this quaternon
   *
   * @remarks
   * Calculates the quaternion with the same direction but with a length of 1
   * or calculates the quaternion that performs the same rotation as this one,
   * but has a length equal to 1
   *
   * @returns A reference to this quaternion
   */
  public normalize(): this {
    let l = this.length();

    if (l === 0) {

      this.x = 0;
      this.y = 0;
      this.z = 0;
      this.w = 1;

    } else {

      l = 1 / l;

      this.x = this.x * l;
      this.y = this.y * l;
      this.z = this.z * l;
      this.w = this.w * l;

    }

    this._onChangeCallback();

    return this;
  }

  /**
   * Multiplies this quaternion by the given quaternion `q`.
   *
   * @param q - The quaternion to multiply with.
   * @returns A reference to this quaternion
   */
  public multiply(q: Quaternion): this {
    return this.multiplyQuaternions(this, q);
  }

  /**
   * Pre-multiplies this quaternion by the given quaternion `q`.
   *
   * @param q - The quaternion to pre-multiply with.
   * @returns A reference to this quaternion
   */
  public premultiply(q: Quaternion): this {
    return this.multiplyQuaternions(q, this);
  }

  /**
   * Multiplies two quaternions `a` and `b` and sets this quaternion to the result.
   *
   * @remarks
   * This is a non-commutation operation; that is, in general `a * b` does not equal `b * a`.
   * that's because rotation order matters
   *
   * Physically, if you rotate an object by quaternion `b`, then by quaternion `a`, then the
   * combined rotation is represented by q = a * b
   * so this function computes the composed rotation, i.e. chaining two rotations together
   *
   * This is exactly how camera and object orientation are accumulated in game engines
   *
   * @param a - The first quaternion.
   * @param b - The second quaternion.
   * @returns A reference to this quaternion
   */
  public multiplyQuaternions(a: Quaternion, b: Quaternion): this {
    // from http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/code/index.htm

    const qax = a.x, qay = a.y, qaz = a.z, qaw = a.w;
    const qbx = b.x, qby = b.y, qbz = b.z, qbw = b.w;

    this.x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
    this.y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
    this.z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
    this.w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

    this._onChangeCallback();

    return this;
  }

  /**
   * Multiplies two quaternions.
   *
   * @remarks
   * This implementation assumes the quaternion data are managed in flat arrays
   * Performs quaternion multiplication (Hamiltonian product) directly on flat numeric arrays,
   * without creating quaternion objects.
   *
   * It computes:
   * dst = src0 x src1      // Hamiltonian product
   *
   * @param dst - The destination array where the resulting multiplication will be written
   * @param dstOffset - The starting index in dst where the result should be stored
   * @param src0 - The first source array containing the first quaternion
   * @param srcOffset0 - The starting index in src0 where the first quaternion is stored
   * @param src1 - The source array of the second quaternion
   * @param srcOffset1 - The offset into the second source array
   * @returns The destination array containing the result
   * @see {@link Quaternion#multiplyQuaternions}
   */
  static multiplyQuaternionsFlat(dst: number[], dstOffset: number, src0: number[], srcOffset0: number, src1: number[], srcOffset1: number): number[] {
    const x0 = src0[srcOffset0];
    const y0 = src0[srcOffset0 + 1];
    const z0 = src0[srcOffset0 + 2];
    const w0 = src0[srcOffset0 + 3];

    const x1 = src1[srcOffset1];
    const y1 = src1[srcOffset1 + 1];
    const z1 = src1[srcOffset1 + 2];
    const w1 = src1[srcOffset1 + 3];

    dst[dstOffset] = x0 * w1 + w0 * x1 + y0 * z1 - z0 * y1;
    dst[dstOffset + 1] = y0 * w1 + w0 * y1 + z0 * x1 - x0 * z1;
    dst[dstOffset + 2] = z0 * w1 + w0 * z1 + x0 * y1 - y0 * x1;
    dst[dstOffset + 3] = w0 * w1 - x0 * x1 - y0 * y1 - z0 * z1;

    return dst;
  }

  /**
   * Performs a spherical linear interpolation between this quaternion and the given quaternion `qb`
   * by the given factor `t` (where `t` is in the range `[0, 1]`).
   *
   * @remarks
   * t = 0 will result in no change (this quaternion),
   * t = 1 will result in this quaternion being equal to qb`
   * 0 < t < 1 = smoothly interpolates between current quaternion and `qb`
   * along the shortest path on a 4D unit sphere
   *
   * @param qb - The target quaternion.
   * @param t - The interpolation factor in the range `[0, 1]`.
   * @returns A reference to this quaternion
   */
  public slerp(qb: Quaternion, t: number): this {
    // t === 0 -> this
    if (t === 0) return this;
    // t === 1 -> qb
    if (t === 1) return this.copy(qb);

    const x = this.x, y = this.y, z = this.z, w = this.w;

    // http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/

    // compute cosine of half angle between the quaternions
    let cosHalfTheta = w * qb.w + x * qb.x + y * qb.y + z * qb.z;

    // if cosHalfTheta < 0, the interpolation will take the long way around the sphere
    // to fix this, one quaternion must be flipped
    if (cosHalfTheta < 0) {

      this.w = - qb.w;
      this.x = - qb.x;
      this.y = - qb.y;
      this.z = - qb.z;

      cosHalfTheta = - cosHalfTheta;

    } else {

      this.copy(qb);

    }

    // Handle quaternions that are almost identical
    // to avoid division by zero errors
    // if cossHalfTheta >= 1.0, the quaternions are nearly identical,
    // return the original quaternion
    if (cosHalfTheta >= 1.0) {

      this.w = w;
      this.x = x;
      this.y = y;
      this.z = z;

      return this;

    }

    const sqrSinHalfTheta = 1.0 - cosHalfTheta * cosHalfTheta;

    // Handle small angles
    // if sin^2(halfTheta) <= EPSILON, use linear interpolation
    // to avoid division by zero/numerical instability
    if (sqrSinHalfTheta <= Number.EPSILON) {

      const s = 1 - t;
      this.w = s * w + t * this.w;
      this.x = s * x + t * this.x;
      this.y = s * y + t * this.y;
      this.z = s * z + t * this.z;

      this.normalize(); // normalize calls _onChangeCallback()

      return this;

    }

    // Perform true slerp
    // compute ratioA and ratioB based on sin((1-t)* halfTheta) and sin(t*halfTheta)/sin(halfTheta)
    // interpolate each component
    const sinHalfTheta = Math.sqrt(sqrSinHalfTheta);
    const halfTheta = Math.atan2(sinHalfTheta, cosHalfTheta);
    const ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta,
      ratioB = Math.sin(t * halfTheta) / sinHalfTheta;

    this.w = (w * ratioA + this.w * ratioB);
    this.x = (x * ratioA + this.x * ratioB);
    this.y = (y * ratioA + this.y * ratioB);
    this.z = (z * ratioA + this.z * ratioB);

    this._onChangeCallback();

    return this;
  }

  /**
   * Interpolates between two quaternions via SLERP. This implementation assumes the quaternion
   * data are managed in flat array
   *
   * @remarks
   * This implements a low-level, array-based implementation of the quaternion slerp operation
   * It's basically a way to interpolate smoothly between two quaternions (rotations)
   * withouth creating full Quaternion objects - Instead it operates on flat numeric arrays
   *
   * @param dst - The destination array where the resulting interpolation will be written
   * @param dstOffset - The starting index in dst where the result should be stored
   * @param src0 - The source array containing the first quaternion.
   * @param srcOffset0 - The offset into the source array for the first quaternion.
   * @param src1 - The source array containing the second quaternion.
   * @param srcOffset1 - The offset into the source array for the second quaternion.
   * @param t - The interpolation factor in the range `[0, 1]`.
   */
  static slerpFlat(dst: number[], dstOffset: number, src0: number[], srcOffset0: number, src1: number[], srcOffset1: number, t: number): void {
    // fuzz-free, array-based Quaternion SLERP operation

    // Extract quaternion components from the source arrays
    let x0 = src0[srcOffset0 + 0],
      y0 = src0[srcOffset0 + 1],
      z0 = src0[srcOffset0 + 2],
      w0 = src0[srcOffset0 + 3];

    const x1 = src1[srcOffset1 + 0],
      y1 = src1[srcOffset1 + 1],
      z1 = src1[srcOffset1 + 2],
      w1 = src1[srcOffset1 + 3];

    // If t ==== 0, copy src0 to dst
    if (t === 0) {

      dst[dstOffset + 0] = x0;
      dst[dstOffset + 1] = y0;
      dst[dstOffset + 2] = z0;
      dst[dstOffset + 3] = w0;
      return;

    }

    // If t === 1, copy src1 to dst
    if (t === 1) {

      dst[dstOffset + 0] = x1;
      dst[dstOffset + 1] = y1;
      dst[dstOffset + 2] = z1;
      dst[dstOffset + 3] = w1;
      return;

    }

    if (w0 !== w1 || x0 !== x1 || y0 !== y1 || z0 !== z1) {

      let s = 1 - t;
      // Compute cos of the angle between the quaternions
      const cos = x0 * x1 + y0 * y1 + z0 * z1 + w0 * w1,
        // Determin dir (1 or -1) to choose shortest path
        dir = (cos >= 0 ? 1 : - 1),
        // Compute sqrSin to find sine of angle
        sqrSin = 1 - cos * cos;

      // Skip the Slerp for tiny steps to avoid numeric problems:
      if (sqrSin > Number.EPSILON) {

        const sin = Math.sqrt(sqrSin),
          len = Math.atan2(sin, cos * dir);

        s = Math.sin(s * len) / sin;
        t = Math.sin(t * len) / sin;

      }

      const tDir = t * dir;

      x0 = x0 * s + x1 * tDir;
      y0 = y0 * s + y1 * tDir;
      z0 = z0 * s + z1 * tDir;
      w0 = w0 * s + w1 * tDir;

      // Normalize in case we just did a lerp:
      if (s === 1 - t) {

        const f = 1 / Math.sqrt(x0 * x0 + y0 * y0 + z0 * z0 + w0 * w0);

        x0 *= f;
        y0 *= f;
        z0 *= f;
        w0 *= f;

      }

    }

    dst[dstOffset] = x0;
    dst[dstOffset + 1] = y0;
    dst[dstOffset + 2] = z0;
    dst[dstOffset + 3] = w0;
  }

  /**
   * Performs a spherical linear interpolation between two quaternions
   * and stores the result in this quaternion.
   *
   * @param qa -  The source quaternion.
   * @param qb - The target quaternion.
   * @param t - The interpolation factor in the range `[0, 1]`.
   * @returns A reference to this quaternion
 */
  public slerpQuaternion(qa: Quaternion, qb: Quaternion, t: number): this {

    // this.copy -> copies qa into this so we start from qa
    // this.slerp(qb, t) -> interpolate towards qb by factor t
    // essentially, its equivalent to qa.slerp(qb, t) but avoids creating a temporary object
    return this.copy(qa).slerp(qb, t);
  }

  /**
   * Sets this quaternion to a uniformly random, normalized quaternion.
   *
   * @remarks
   * Ken Shoemake's method from  Graphics Gems III ensures:
   * -  Uniform distribution over the space of all rotations (SO(3))
   * -  No clustering or bias
   * -  Always unit length
   *
   * It works by sampling:
   * -  Two random angles (theta1, theta2)
   * -  A random "split" variable x_0
   * - Building a quaternion from two circles of different radii
   * This avoids bias that naive random quaternions produce
   *
   * @returns A reference to this quaternion
   */
  public random(): this {
    // Ken Shoemake
    // Uniform random rotations
    // D. Kirk, editor, Graphics Gems III, pages 124-132. Academic Press, New York, 1992.

    const theta1 = 2 * Math.PI * Math.random();
    const theta2 = 2 * Math.PI * Math.random();

    const x0 = Math.random();
    const r1 = Math.sqrt(1 - x0);
    const r2 = Math.sqrt(x0);

    return this.set(
      r1 * Math.sin(theta1),
      r1 * Math.cos(theta1),
      r2 * Math.sin(theta2),
      r2 * Math.cos(theta2),
    );
  }

  /**
   * Returns `true` if this quaternion is equal to the given quaternion.
   *
   * @param q - The quaternion to compare with.
   * @returns `true` if the quaternions are equal, `false` otherwise.
   */
  public equals(q: Quaternion): boolean {
    return ((q.x === this.x) && (q.y === this.y) && (q.z === this.z) && (q.w === this.w));
  }

  /**
   * Sets this quaternion's component's from the given array.
   *
   * @param array - An array holding the quaternion component values
   * @param offset - The offset into the array
   * @returns A reference to this quaternion
   */
  public fromArray(array: number[], offset: number = 0): this {
    this.x = array[offset];
    this.y = array[offset + 1];
    this.z = array[offset + 2];
    this.w = array[offset + 3];

    this._onChangeCallback();

    return this;
  }

  /**
   * Writes the components of this quaternion to the given array. If no array is provided,
   * the method returns a new instance
   *
   * @param array - The target array to write to
   * @param offset - The index to start writing from
   * @returns The quaternion components
   */
  public toArray(array: number[], offset: number = 0): number[] {
    array[offset] = this.x;
    array[offset + 1] = this.y;
    array[offset + 2] = this.z;
    array[offset + 3] = this.w;

    return array;
  }

  /**
   * Sets the components of this quaternion from the given buffer attribute
   *
   * @param attribute - The buffer attribute containing the quaternion data
   * @param index - The index into the attribure to read from
   * @returns A reference to this quaternion
 */
  public fromBufferAttribute(attribute: any, index: number): this {
    this.x = attribute.getX(index);
    this.y = attribute.getY(index);
    this.z = attribute.getZ(index);
    this.w = attribute.getW(index);

    this._onChangeCallback();

    return this;
  }

  /**
   * This method defines the serialization result of this class. Returns the
   * numerical elements of this quaternion in an array of format `[x, y, z, w]`.
   *
   * @returns The serialized quaternion
   */
  public ToJSON(): number[] {
    return this.toArray([]);
  }

  /**
   * Iterator
   * @returns the components of this quaternion iterated in order
   */
  [Symbol.iterator](): Iterator<number> {
    return [this.x, this.y, this.z, this.w][Symbol.iterator]();
  }
}
