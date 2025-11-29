import { CoordinateSystem, WebGLCoordinateSystem, WebGPUCoordinateSystem } from "../constants";
import { Vector3 } from "./Vector3";
import type { Matrix3 } from "./Matrix3";
import type { Euler } from "./Euler";
import { Quaternion } from "./Quaternion";

/**
 * Represents a 4x4 matrix.
 *
 * The most common use of a 4x4 matrix in 3D computer graphics is as a transformation
 * matrix. For an introduction to transformation matrices as used in WebGL see
 * {@link https://www.opengl-tutorial.org/beginners-tutorials/tutorial-3-matrices/}
 *
 * This allows a 3D vector representing a point in 3D space to undergo transformation
 * such as translation, rotation, scaling, shear, reflection, projection, etc by being
 * multiplied with the matrix.
 *
 *  * A note on Row-Major vs Column-Major storage:
 *
 * The constructor and {@link Matrix4#set} methods take arguments in
 * [row-major order]{@link https://en.wikipedia.org/wiki/Row-_and_column-major_order}
 * while internally they are stored in the {@link Matrix4#elements} array in column-major
 * order.
 * This is in line with WebGL/OpenGL which expects matrices to be provided in column-major order.
 *
 * This means that calling:
 * ```ts
 * const m = new Matrix4();
 * m.set(
 *  1, 2, 3, 4,
 *  5, 6, 7, 8,
 *  9, 10, 11, 12,
 *  13, 14, 15, 16
 * );
 * ```
 * will result in the following internal representation:
 * ```js
 * m.elements === [
 *   1, 5, 9, 13,
 *   2, 6, 10, 14,
 *   3, 7, 11, 15,
 *   4, 8, 12, 16
 * ];
 * ```
 * Internlly all calculationrs are performed in column-major order.
 * even though most people are used to thinking in row-major order, the actual
 * ordering makes no difference mathematically as long as one is consistent.
 *
 */
export class Matrix4 {
  /**
   * This flag can be used for type testing.
   *
   * @type boolean
   * @readonly
   * @defaultValue true
   */
  public readonly isMatrix4: boolean = true;

  /**
   * A column-major list of matrix values
   *
   * @type {number[]}
   */
  public elements: number[];

  /**
   * Constructs a new 4x4 matrix
   * The arguments are supposed to be in row-major order.
   * If not arguments are provided, the constructor initializes the matrix
   * as an identity matrix
   *
   * @param n11 - 1-1 matrix element (row 1, column 1).
   * @param n12 - 1-2 matrix element (row 1, column 2).
   * @param n13 - 1-3 matrix element (row 1, column 3).
   * @param n14 - 1-4 matrix element (row 1, column 4).
   * @param n21 - 2-1 matrix element (row 2, column 1).
   * @param n22 - 2-2 matrix element (row 2, column 2).
   * @param n23 - 2-3 matrix element (row 2, column 3).
   * @param n24 - 2-4 matrix element (row 2, column 4).
   * @param n31 - 3-1 matrix element (row 3, column 1).
   * @param n32 - 3-2 matrix element (row 3, column 2).
   * @param n33 - 3-3 matrix element (row 3, column 3).
   * @param n34 - 3-4 matrix element (row 3, column 4).
   * @param n41 - 4-1 matrix element (row 4, column 1).
   * @param n42 - 4-2 matrix element (row 4, column 2).
   * @param n43 - 4-3 matrix element (row 4, column 3).
   * @param n44 - 4-4 matrix element (row 4, column 4).
   */
  constructor(
    n11: number = 1, n12: number = 0, n13: number = 0, n14: number = 0,
    n21: number = 0, n22: number = 1, n23: number = 0, n24: number = 0,
    n31: number = 0, n32: number = 0, n33: number = 1, n34: number = 0,
    n41: number = 0, n42: number = 0, n43: number = 0, n44: number = 1) {
    /**
     * A column-major list of matrix values
     *
     * @type {number[]}
     */
    this.elements = [
      n11, n21, n31, n41,
      n12, n22, n32, n42,
      n13, n23, n33, n43,
      n14, n24, n34, n44
    ];

    this.set(
      n11, n12, n13, n14,
      n21, n22, n23, n24,
      n31, n32, n33, n34,
      n41, n42, n43, n44
    );
  }

  /**
   * Sets the elements of the matrix. The arguments are supposed to be in
   * row-major order.
   *
   * @param n11 - 1-1 matrix element (row 1, column 1).
   * @param n12 - 1-2 matrix element (row 1, column 2).
   * @param n13 - 1-3 matrix element (row 1, column 3).
   * @param n14 - 1-4 matrix element (row 1, column 4).
   * @param n21 - 2-1 matrix element (row 2, column 1).
   * @param n22 - 2-2 matrix element (row 2, column 2).
   * @param n23 - 2-3 matrix element (row 2, column 3).
   * @param n24 - 2-4 matrix element (row 2, column 4).
   * @param n31 - 3-1 matrix element (row 3, column 1).
   * @param n32 - 3-2 matrix element (row 3, column 2).
   * @param n33 - 3-3 matrix element (row 3, column 3).
   * @param n34 - 3-4 matrix element (row 3, column 4).
   * @param n41 - 4-1 matrix element (row 4, column 1).
   * @param n42 - 4-2 matrix element (row 4, column 2).
   * @param n43 - 4-3 matrix element (row 4, column 3).
   * @param n44 - 4-4 matrix element (row 4, column 4).
   * @returns This matrix.
   */
  public set(
    n11: number, n12: number, n13: number, n14: number,
    n21: number, n22: number, n23: number, n24: number,
    n31: number, n32: number, n33: number, n34: number,
    n41: number, n42: number, n43: number, n44: number): this {
    const te = this.elements;

    te[0] = n11; te[1] = n21; te[2] = n31; te[3] = n41;
    te[4] = n12; te[5] = n22; te[6] = n32; te[7] = n42;
    te[8] = n13; te[9] = n23; te[10] = n33; te[11] = n43;
    te[12] = n14; te[13] = n24; te[14] = n34; te[15] = n44;

    return this;
  }

  /**
   * Sets this matrix to the 4x4 identity matrix.
   *
   * @returns A reference to this matrix
   */
  public identity(): this {
    this.set(
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    );

    return this;
  }

  /**
   * Returns a matrix with copied values from this instance.
   *
   * @return A clone of this instance
   */
  public clone(): Matrix4 {
    return new Matrix4().fromArray(this.elements);
  }

  /**
   * Copies the values of the given matrix into this matrix.
   *
   * @param m - The matrix to copy from.
   * @returns A reference to this matrix
   */
  public copy(m: Matrix4): this {
    const te = this.elements;
    const me = m.elements;

    te[0] = me[0]; te[1] = me[1]; te[2] = me[2]; te[3] = me[3];
    te[4] = me[4]; te[5] = me[5]; te[6] = me[6]; te[7] = me[7];
    te[8] = me[8]; te[9] = me[9]; te[10] = me[10]; te[11] = me[11];
    te[12] = me[12]; te[13] = me[13]; te[14] = me[14]; te[15] = me[15];

    return this;
  }

  /**
   * Copies the translation component of the given matrix into this matrix.
   *
   * @param m - The matrix to copy the translation from.
   * @returns A reference to this matrix
   */
  public copyPosition(m: Matrix4): this {
    const te = this.elements, me = m.elements;

    te[12] = me[12];
    te[13] = me[13];
    te[14] = me[14];

    return this;
  }

  /**
   * Sets the upper 3x3 matrix of this matrix to the value of the given 3x3 matrix.
   *
   * @param m - The 3x3 matrix to set the upper 3x3 part from.
   * @returns A reference to this matrix
   */
  public setFromMatrix3(m: Matrix3): this {
    const me = m.elements;

    this.set(

      me[0], me[3], me[6], 0,
      me[1], me[4], me[7], 0,
      me[2], me[5], me[8], 0,
      0, 0, 0, 1

    );

    return this;
  }

  /**
   * Extracts the basis of this matrix into the three axis vectors provided.
   *
   * @param xAxis - The vector to store the X basis vector.
   * @param yAxis - The vector to store the Y basis vector.
   * @param zAxis - The vector to store the Z basis vector.
   * @returns A reference to this matrix
   */
  public extractBasis(xAxis: Vector3, yAxis: Vector3, zAxis: Vector3): this {
    xAxis.setFromMatrixColumn(this, 0);
    yAxis.setFromMatrixColumn(this, 1);
    zAxis.setFromMatrixColumn(this, 2);

    return this;
  }

  /**
   * Sets the given basis Vectors to this matrix
   *
   * @param xAxis - The basis's x axis
   * @param yAxis - The basis's y axis
   * @param zAxis - The basis's z axis
   * @return A refernce to this matrix
   */
  public makeBasis(xAxis: Vector3, yAxis: Vector3, zAxis: Vector3): this {
    this.set(
      xAxis.x, yAxis.x, zAxis.x, 0,
      xAxis.y, yAxis.y, zAxis.y, 0,
      xAxis.z, yAxis.z, zAxis.z, 0,
      0, 0, 0, 1
    );

    return this;
  }

  /**
   * Extracts the rotation components of the given matrix into this matrix's
   * rotation component
   *
   * @remarks
   * This methos does not support reflection matrices
   * Only extracts the rotation part of a rigid transformation
   *
   * @param m - The given matrix
   * @returns A reference to this matrix
   */
  public extractRotation(m: Matrix4): this {
    const te = this.elements;
    const me = m.elements;

    // Compute inverse scale
    const scaleX = 1 / _v1.setFromMatrixColumn(m, 0).length();
    const scaleY = 1 / _v1.setFromMatrixColumn(m, 1).length();
    const scaleZ = 1 / _v1.setFromMatrixColumn(m, 2).length();

    // Each axis vector is normalized by dividing by its length, effectively
    // removing any scaling - This gives pure rotations (unit length)
    te[0] = me[0] * scaleX;
    te[1] = me[1] * scaleX;
    te[2] = me[2] * scaleX;
    te[3] = 0;

    te[4] = me[4] * scaleY;
    te[5] = me[5] * scaleY;
    te[6] = me[6] * scaleY;
    te[7] = 0;

    te[8] = me[8] * scaleZ;
    te[9] = me[9] * scaleZ;
    te[10] = me[10] * scaleZ;
    te[11] = 0;

    // Reset translation and bottom row
    // Translation and the homogenous coordinate are cleared
    te[12] = 0;
    te[13] = 0;
    te[14] = 0;
    te[15] = 1;

    return this;
  }

  /**
   * Sets the rotation component (the upper left 3x3 matrix) of this matrix to the
   * rotation specified by the given Euler angles. The rest of the matrix
   * is set to the identity matrix. Depending on the {@link Euler#order},
   * there are 6 possible outcomes.
   * See [this page]{@link https://en.wikipedia.org/wiki/Euler_angles#Rotation_matrix}
   * for a complete list
   *
   * @remarks
   * Converts  Euler angle into a 4x4 matrix rotation with no translation or scaling
   * Rotation matrix can be applied to vectors or combined with other transformations
   *
   * @param euler - The Euler angles representing the rotation
   * @returns A reference to this matrix
   */
  public makeRotationFromEuler(euler: Euler): this {
    // const te = this.elements;

    // // Euler angles in radians
    // const x = euler.x, y = euler.y, z = euler.z;

    // // Calculate the sine (sin) and cosine (cos) of the three Euler angles
    // const cx = Math.cos(x), sx = Math.sin(x);
    // const cy = Math.cos(y), sy = Math.sin(y);
    // const cz = Math.cos(z), sz = Math.sin(z);

    // // Use formulas for the chosen rotation order to fill the
    // // upper-left 3x3 portion of the 4x4 matrix
    // // these portion represents the rotation in 3D space
    // // the rest of the matrix is set to identity
    // // last column [12, 13, 14] = translation = 0
    // // bottom row [3, 7, 11] = homogenous coordinates = 0
    // // bottom-right [15] = 1
    // if (euler.order === 'XYZ') {

    //   const cxcz = cx * cz, cxsz = cx * sz, sxcz = sx * cz, sxsz = sx * sz;

    //   te[0] = cy * cz;
    //   te[4] = -cy * sz;
    //   te[8] = sy;

    //   te[1] = cxsz + sxcz * sy;
    //   te[5] = cxcz - sxsz * sy;
    //   te[9] = -sx * cy;

    //   te[2] = sxsz - sxcz * sy;
    //   te[6] = sxcz + cxsz * sy;
    //   te[10] = cx * cy;

    // } else if (euler.order === 'YXZ') {

    //   const cycz = cy * cz, cysz = cy * sz, sycz = sy * cz, sysz = sy * sz;

    //   te[0] = cycz + sysz * sx;
    //   te[4] = sycz * sx - cysz;
    //   te[8] = cx * sy;

    //   te[1] = cx * sz;
    //   te[5] = cx * cz;
    //   te[9] = -sx;

    //   te[2] = cysz * sx - sycz;
    //   te[6] = sysz + cycz * sx;
    //   te[10] = cx * cy;

    // } else if (euler.order === 'ZXY') {

    //   const cycz = cy * cz, cysz = cy * sz, sycz = sy * cz, sysz = sy * sz;

    //   te[0] = cycz - sysz * sx;
    //   te[4] = -cx * sz;
    //   te[8] = sycz + cysz * sx;

    //   te[1] = cysz + sycz * sx;
    //   te[5] = cx * cz;
    //   te[9] = sysz - cycz * sx;

    //   te[2] = -cx * sy;
    //   te[6] = sx;
    //   te[10] = cx * cy;

    // } else if (euler.order === 'ZYX') {

    //   const cxcz = cx * cz, cxsz = cx * sz, sxcz = sx * cz, sxsz = sx * sz;

    //   te[0] = cy * cz;
    //   te[4] = sx * sy - cxsz;
    //   te[8] = cx * sy + sxsz;

    //   te[1] = cy * sz;
    //   te[5] = sx * sy + cxcz;
    //   te[9] = cxsz * sy - sxcz;

    //   te[2] = -sy;
    //   te[6] = sx * cy;
    //   te[10] = cx * cy;

    // } else if (euler.order === 'YZX') {

    //   const ac = cx * cy, ad = cx * sy, bc = sx * cy, bd = sx * sy;

    //   te[0] = cy * cz;
    //   te[4] = bd - ac * sz;
    //   te[8] = bc * sz + ad;

    //   te[1] = sz;
    //   te[5] = cx * cz;
    //   te[9] = -sx * cz;

    //   te[2] = -sy * cz;
    //   te[6] = ad * sz + bc;
    //   te[10] = ac - bd * sz;

    // } else if (euler.order === 'XZY') {

    //   const ac = cx * cy, ad = cx * sy, bc = sx * cy, bd = sx * sy;

    //   te[0] = cy * cz;
    //   te[4] = -sz;
    //   te[8] = cz * sy;

    //   te[1] = ac * sz + bd;
    //   te[5] = cx * cz;
    //   te[9] = ad * sz - bc;

    //   te[2] = bc * sz - ad;
    //   te[6] = sx * cz;
    //   te[10] = bd * sz + ac;

    // }

    // // bottom row
    // te[3] = 0;
    // te[7] = 0;
    // te[11] = 0;

    // // last column
    // te[12] = 0;
    // te[13] = 0;
    // te[14] = 0;
    // te[15] = 1;

    // return this;

    const te = this.elements;

    const x = euler.x, y = euler.y, z = euler.z;
    const a = Math.cos(x), b = Math.sin(x);
    const c = Math.cos(y), d = Math.sin(y);
    const e = Math.cos(z), f = Math.sin(z);

    if (euler.order === 'XYZ') {

      const ae = a * e, af = a * f, be = b * e, bf = b * f;

      te[0] = c * e;
      te[4] = - c * f;
      te[8] = d;

      te[1] = af + be * d;
      te[5] = ae - bf * d;
      te[9] = - b * c;

      te[2] = bf - ae * d;
      te[6] = be + af * d;
      te[10] = a * c;

    } else if (euler.order === 'YXZ') {

      const ce = c * e, cf = c * f, de = d * e, df = d * f;

      te[0] = ce + df * b;
      te[4] = de * b - cf;
      te[8] = a * d;

      te[1] = a * f;
      te[5] = a * e;
      te[9] = - b;

      te[2] = cf * b - de;
      te[6] = df + ce * b;
      te[10] = a * c;

    } else if (euler.order === 'ZXY') {

      const ce = c * e, cf = c * f, de = d * e, df = d * f;

      te[0] = ce - df * b;
      te[4] = - a * f;
      te[8] = de + cf * b;

      te[1] = cf + de * b;
      te[5] = a * e;
      te[9] = df - ce * b;

      te[2] = - a * d;
      te[6] = b;
      te[10] = a * c;

    } else if (euler.order === 'ZYX') {

      const ae = a * e, af = a * f, be = b * e, bf = b * f;

      te[0] = c * e;
      te[4] = be * d - af;
      te[8] = ae * d + bf;

      te[1] = c * f;
      te[5] = bf * d + ae;
      te[9] = af * d - be;

      te[2] = - d;
      te[6] = b * c;
      te[10] = a * c;

    } else if (euler.order === 'YZX') {

      const ac = a * c, ad = a * d, bc = b * c, bd = b * d;

      te[0] = c * e;
      te[4] = bd - ac * f;
      te[8] = bc * f + ad;

      te[1] = f;
      te[5] = a * e;
      te[9] = - b * e;

      te[2] = - d * e;
      te[6] = ad * f + bc;
      te[10] = ac - bd * f;

    } else if (euler.order === 'XZY') {

      const ac = a * c, ad = a * d, bc = b * c, bd = b * d;

      te[0] = c * e;
      te[4] = - f;
      te[8] = d * e;

      te[1] = ac * f + bd;
      te[5] = a * e;
      te[9] = ad * f - bc;

      te[2] = bc * f - ad;
      te[6] = b * e;
      te[10] = bd * f + ac;

    }

    // bottom row
    te[3] = 0;
    te[7] = 0;
    te[11] = 0;

    // last column
    te[12] = 0;
    te[13] = 0;
    te[14] = 0;
    te[15] = 1;

    return this;

  }

  /**
   * Sets theh rotation component of this matrix to the rotation specified by
   * the given  Quaternion as outlined
   * [here]{@link https://en.wikipedia.org/wiki/Rotation_matrix#Quaternion}
   * The rest of the matrix is set to the identity.
   *
   * @param q - The quaternion representing the rotation
   * @returns A reference to this matrix
   */
  public makeRotationFromQuaternion(q: Quaternion): this {
    return this.compose(_zero, q, _one);
  }

  /**
   * Sets the rotation component of this transformation matrix, looking from `eye` towards
   * `target`, and oriented by the up-direction.
   *
   * @remarks
   * This function constructs a rotation matrix that orients an object so that:
   * -  it forward axis (the -Z axis in OpenGL/WebGL convention) points from eye -> targe
   * -  its right axis (the +X axis) is perpendicular to both forward and up
   * -  its up axis (the +Y axis) becomes the corrected orthogonal up direction
   *
   * It generates the orientatino matrix of a camera or object that is "looking"
   * at a point.
   * It does not set translation. Only rotation
   *
   * @param eye - The position of the viewer.
   * @param target - The point to look at.
   * @param up - The up direction.
   * @returns A reference to this matrix
   */
  public lookAt(eye: Vector3, target: Vector3, up: Vector3): this {
    const te = this.elements;

    /**
     * Compute the orthogonal basis of this matrix _x, _y, _z
    */

    // _z = eye - target
    _z.subVectors(eye, target);

    // eye == target
    if (_z.lengthSq() === 0) {

      // eye and target are in the same position
      _z.z = 1;
    }

    _z.normalize();
    _x.crossVectors(up, _z);

    if (_x.lengthSq() === 0) {

      // up and z are parallel

      if (Math.abs(up.z) === 1) {

        _z.x += 0.0001;

      } else {

        _z.z += 0.0001;

      }

      _z.normalize();
      _x.crossVectors(up, _z);
    }

    _x.normalize();
    _y.crossVectors(_z, _x);

    /**
     * Write the orthogonal basis into this matrix (column-major)
     */
    te[0] = _x.x; te[4] = _y.x; te[8] = _z.x;
    te[1] = _x.y; te[5] = _y.y; te[9] = _z.y;
    te[2] = _x.z; te[6] = _y.z; te[10] = _z.z;

    return this;
  }

  /**
   * Post-multiplies this matrix by the given 4x4 matrix.
   *
   * @param m - The matrix to multiply with.
   * @returns A reference to this matrix
   */
  public multiply(m: Matrix4): this {
    return this.multiplyMatrices(this, m);
  }

  /**
   * Pre-multiplies this matrix by the given 4x4 matrix.
   *
   * @param m - The matrix to pre-multiply with.
   * @returns A reference to this matrix
   */
  public premultiply(m: Matrix4): this {
    return this.multiplyMatrices(m, this);
  }

  /**
   * Mulitiplies the given 4x4 matrices and stores the result in this matrix.
   *
   * @param a - The first matrix.
   * @param b - The second matrix.
   * @returns A reference to this matrix
   */
  public multiplyMatrices(a: Matrix4, b: Matrix4): this {
    const ae = a.elements;
    const be = b.elements;
    const te = this.elements;

    const a11 = ae[0], a12 = ae[4], a13 = ae[8], a14 = ae[12];
    const a21 = ae[1], a22 = ae[5], a23 = ae[9], a24 = ae[13];
    const a31 = ae[2], a32 = ae[6], a33 = ae[10], a34 = ae[14];
    const a41 = ae[3], a42 = ae[7], a43 = ae[11], a44 = ae[15];

    const b11 = be[0], b12 = be[4], b13 = be[8], b14 = be[12];
    const b21 = be[1], b22 = be[5], b23 = be[9], b24 = be[13];
    const b31 = be[2], b32 = be[6], b33 = be[10], b34 = be[14];
    const b41 = be[3], b42 = be[7], b43 = be[11], b44 = be[15];

    te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
    te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
    te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
    te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

    te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
    te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
    te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
    te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

    te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
    te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
    te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
    te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

    te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
    te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
    te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
    te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

    return this;
  }

  /**
   * Multiplies every component of this matrix by the given scalar.
   *
   * @param s - The scalar to multiply with.
   * @returns A reference to this matrix
   */
  public multiplyScalar(s: number): this {
    const te = this.elements;

    te[0] *= s; te[4] *= s; te[8] *= s; te[12] *= s;
    te[1] *= s; te[5] *= s; te[9] *= s; te[13] *= s;
    te[2] *= s; te[6] *= s; te[10] *= s; te[14] *= s;
    te[3] *= s; te[7] *= s; te[11] *= s; te[15] *= s;

    return this;
  }

  /**
   * Computes and returns the determinant of this matrix.
   *
   * @remarks
   * Determinant is a scalar that tells you things like
   * -  If the matrix is invertible (det != 0)
   * -  If the matrix includes a reflection (det < 0)
   * -  Volume scaling for transformation
   *
   * Based on the method outlined
   * [here]{@link http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.html}
   * @returns The determinant
   */
  public determinant() {
    const te = this.elements;

    const n11 = te[0], n12 = te[4], n13 = te[8], n14 = te[12];
    const n21 = te[1], n22 = te[5], n23 = te[9], n24 = te[13];
    const n31 = te[2], n32 = te[6], n33 = te[10], n34 = te[14];
    const n41 = te[3], n42 = te[7], n43 = te[11], n44 = te[15];

    //TODO: make this more efficient

    return (
      n41 * (
        + n14 * n23 * n32
        - n13 * n24 * n32
        - n14 * n22 * n33
        + n12 * n24 * n33
        + n13 * n22 * n34
        - n12 * n23 * n34
      ) +
      n42 * (
        + n11 * n23 * n34
        - n11 * n24 * n33
        + n14 * n21 * n33
        - n13 * n21 * n34
        + n13 * n24 * n31
        - n14 * n23 * n31
      ) +
      n43 * (
        + n11 * n24 * n32
        - n11 * n22 * n34
        - n14 * n21 * n32
        + n12 * n21 * n34
        + n14 * n22 * n31
        - n12 * n24 * n31
      ) +
      n44 * (
        - n13 * n22 * n31
        - n11 * n23 * n32
        + n11 * n22 * n33
        + n13 * n21 * n32
        - n12 * n21 * n33
        + n12 * n23 * n31
      )

    );
  }

  /**
   * Transposes this matrix in place.
   *
   * @remarks
   * Swaps elements in place
   *
   * @returns A reference to this matrix
   */
  public transpose(): this {
    const te = this.elements;
    let tmp;

    tmp = te[1]; te[1] = te[4]; te[4] = tmp;
    tmp = te[2]; te[2] = te[8]; te[8] = tmp;
    tmp = te[6]; te[6] = te[9]; te[9] = tmp;

    tmp = te[3]; te[3] = te[12]; te[12] = tmp;
    tmp = te[7]; te[7] = te[13]; te[13] = tmp;
    tmp = te[11]; te[11] = te[14]; te[14] = tmp;

    return this;
  }

  /**
   * Sets the position component for this matrix from the given Vector3.
   * without affecting the rest of the matrix.
   *
   * @param v - The x component of the vector or alternatively a Vector3
   * @param y - The y component of the vector
   * @param z - The z component of the vector
   * @returns A reference to this matrix
   */
  public setPosition(v: Vector3 | number, y?: number, z?: number): this {
    const te = this.elements;

    if (v instanceof Vector3) {
      te[12] = v.x;
      te[13] = v.y;
      te[14] = v.z;
    } else {
      te[12] = v;
      te[13] = y as number;
      te[14] = z as number;
    }

    return this
  }

  /**
   * Inverts this matrix, using the
   * [analytic method]{@link https://en.wikipedia.org/wiki/Invertible_matrix#Analytic_solution}
   *
   * @remarks
   * You can not invert with a determinant of 0. If you attempt this,
   * the method produces a zero matrix instead.
   *
   *
   * @returns A reference to this matrix
   */
  public invert(): this {
    // based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
    const te = this.elements,

      n11 = te[0], n21 = te[1], n31 = te[2], n41 = te[3],
      n12 = te[4], n22 = te[5], n32 = te[6], n42 = te[7],
      n13 = te[8], n23 = te[9], n33 = te[10], n43 = te[11],
      n14 = te[12], n24 = te[13], n34 = te[14], n44 = te[15],

      t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44,
      t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44,
      t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44,
      t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;

    const det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;

    if (det === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

    const detInv = 1 / det;

    te[0] = t11 * detInv;
    te[1] = (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * detInv;
    te[2] = (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * detInv;
    te[3] = (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * detInv;

    te[4] = t12 * detInv;
    te[5] = (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * detInv;
    te[6] = (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * detInv;
    te[7] = (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * detInv;

    te[8] = t13 * detInv;
    te[9] = (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * detInv;
    te[10] = (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * detInv;
    te[11] = (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * detInv;

    te[12] = t14 * detInv;
    te[13] = (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * detInv;
    te[14] = (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * detInv;
    te[15] = (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * detInv;

    return this;
  }

  /**
   * Multiplies the columns of this matrix by the given vector.
   *
   * @param v - The vector to multiply with.
   * @returns A reference to this matrix
   */
  public scale(v: Vector3): this {
    const te = this.elements;
    const x = v.x, y = v.y, z = v.z;

    te[0] *= x; te[4] *= y; te[8] *= z;
    te[1] *= x; te[5] *= y; te[9] *= z;
    te[2] *= x; te[6] *= y; te[10] *= z;
    te[3] *= x; te[7] *= y; te[11] *= z;

    return this;
  }

  /**
   * Gets the maximum scale value of the three axes.
   *
   * @remarks
   * Computes the largest scaling factor encoded in the 4x4 transformation matrix
   * In a transformation matrix that contains rotation and scale (and possibly translation),
   * each of the first three columns corresponds to one of the local axes (X, Y, Z)
   * of the transformed space.
   * Each column's length is the scale along the axis
   * So this function
   * 1. Extracts the first three columns of the matrix
   * 2. Computes the length of each column vector (scale factor along that axis)
   * 3. Compares the three lengths and returns the maximum value
   *
   * Why it's useful - This is typically used when:
   * 1. You need to normalize direction vectors extracted from a transformation matrix
   * 2. You want to determine non-uniform scale (e.g. bounding sphere radius scaling)
   * 3. You're doing operations like inverse-transpose for normals in 3D graphics
   *
   * @returns The maximum scale factor
   */
  public getMaxScaleOnAxis(): number {
    const te = this.elements;

    const scaleXSq = te[0] * te[0] + te[1] * te[1] + te[2] * te[2];
    const scaleYSq = te[4] * te[4] + te[5] * te[5] + te[6] * te[6];
    const scaleZSq = te[8] * te[8] + te[9] * te[9] + te[10] * te[10];

    return Math.sqrt(Math.max(scaleXSq, scaleYSq, scaleZSq));
  }

  /**
 * Sets this matrix as a translation transform from the given vector
 *
 * @param tx - The amount to translate in the X axis or alternatively a translation vector
 * @param ty - The amountn to translate in the Y axis
 * @param tz - The amount to translate in the Z axis
 * @return A reference to this matrix
 */
  public makeTranslation(tx: number | Vector3, ty: number, tz: number): this {
    if (typeof tx !== 'number') {
      // tx is a vector 3 here
      this.set(

        1, 0, 0, tx.x,
        0, 1, 0, tx.y,
        0, 0, 1, tx.z,
        0, 0, 0, 1

      );
    } else {
      this.set(

        1, 0, 0, tx,
        0, 1, 0, ty,
        0, 0, 1, tz,
        0, 0, 0, 1

      );
    }

    return this;
  }

  /**
   * Sets this matrix as a rotational transform around the X axis by the given angle
   *
   * @param theta - The rotation in  radians
   * @returns A reference to this matrix
   */
  public makeRotationX(theta: number): this {
    const c = Math.cos(theta), s = Math.sin(theta);

    this.set(

      1, 0, 0, 0,
      0, c, - s, 0,
      0, s, c, 0,
      0, 0, 0, 1

    );

    return this;
  }

  /**
   * Sets this matrix as a rotational transformation around the Y axis by the given angle
   *
   * @param theta - The rotation in radians
   * @returns A reference to this matrix
   */
  public makeRotationY(theta: number): this {
    const c = Math.cos(theta), s = Math.sin(theta);

    this.set(

      c, 0, s, 0,
      0, 1, 0, 0,
      - s, 0, c, 0,
      0, 0, 0, 1

    );

    return this;
  }

  /**
   * Sets this matrix as a rotational transformation around the Z axis by the given angle
   *
   * @remarks
   * Uses the standard right-handed rotation matrix around the Z axis
   * -  Positive theta rotates counter clockwise when looking down the +z axis
   * -  Same convention used in OpenGL, WebGL, and Three.js
   *
   * @param theta - The rotation in radians.
   * @returns A reference to this matrix
   */
  public makeRotationZ(theta: number): this {
    const c = Math.cos(theta), s = Math.sin(theta);

    this.set(

      c, -s, 0, 0,
      s, c, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1

    );

    return this;
  }

  /**
   * Sets this matrix as a rotational transformation around the given axis by the given angle
   *
   * @remarks
   * This is somewhat controversial but mathematically sound alternative to rotating via Quaternion.
   * see the discussion [here]{@link https://www.gamedev.net/articles/programming/math-and-physics/do-we-really-need-quaternions-r1199}
   *
   * Sets the matrix to represent a rotation around an arbitrary axis (a unit vector)
   * by a given angle in radians.
   * It implements the Rodrigues' rotation formula, which builds a rotation matrix directly
   * from an axis-angle representation
   *
   * @param axis - The axis to rotate around (assumed to be normalized)
   * @param angle - The rotation angle in radians
   * @returns A reference to this matrix
   */
  makeRotationAxis(axis: Vector3, angle: number): this {
    // Based on http://www.gamedev.net/reference/articles/article1199.asp

    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const t = 1 - c;
    const x = axis.x, y = axis.y, z = axis.z;
    const tx = t * x, ty = t * y;

    this.set(

      tx * x + c, tx * y - s * z, tx * z + s * y, 0,
      tx * y + s * z, ty * y + c, ty * z - s * x, 0,
      tx * z - s * y, ty * z + s * x, t * z * z + c, 0,
      0, 0, 0, 1

    );

    return this;
  }

  /**
 * Sets this matrix as a scale transformation
 *
 * @param x - The amount to scale in the X axis
 * @param y - The amount to scale in the Y axis
 * @param z - The amount to scale in the Z axis
 * @returns A reference to this matrix
 */
  public makeScale(x: number, y: number, z: number): this {
    this.set(

      x, 0, 0, 0,
      0, y, 0, 0,
      0, 0, z, 0,
      0, 0, 0, 1

    );

    return this;
  }

  /**
   * Sets this matrix as a shear transformation
   *
   * @remarks
   * A shear transformation slants or skews an object so that its axes are no longer
   * orthogonal.
   * Its like sliding layers of the shape parallel to one another, depending on the
   * shear factors
   *
   * For example
   * -  A shear in X wrt Y makes X coordinates depend on Y
   * -  A shear in Y wrt Z makes Y coordinates depend on Z
   *
   * @param xy - The shear factor in the X direction in proportion to Y
   * @param xz - The shear factor in the X direction in proportion to Z
   * @param yx - The shear factor in the Y direction in proportion to X
   * @param yz - The shear factor in the Y direction in proportion to Z
   * @param zx - The shear factor in the Z direction in proportion to X
   * @param zy - The shear factor in the Z direction in proportion to Y
   * @returns A reference to this matrix
   */
  public makeShear(xy: number, xz: number, yx: number, yz: number, zx: number, zy: number): this {
    this.set(
      // 1, xy, xz, 0,
      // yx, 1, yz, 0,
      // zx, zy, 1, 0,
      // 0, 0, 0, 1
      1, yx, zx, 0,
      xy, 1, zy, 0,
      xz, yz, 1, 0,
      0, 0, 0, 1
    );
    return this;
  }

  /**
   * Sets this matrix to the transformation composed of the given position,
   * rotation (Quaternion) and scale.
   *
   * @remarks
   * Create a 4x4 transformation matrix from three components: position, rotation, and scale.
   *
   * 1. position: A Vector3 representing the translation in 3D space.
   *    - sets the last column of the matrix (te[12], te[13], te[14]) to the position's x, y, z values.
   * 2. quaternion: A Quaternion representing the rotation.
   *   - the function converts the quaternon into a 3x3 rotation matrix, placeed in the upper-left
   *   - 3x3 part of the 4x4 matrix (te[0]...te[10])
   *   - The math uses the standard quaternion-to-matrix formula
   * 3. scale: A Vector3 representing scale along each axis
   *   - Each element of the rotation matrix is multiplied by the corresponding scale component
   *   - First row *sx
   *   - Second row * sy
   *   - Third row * sz
   * 4. Result: The resulting matrinx is a standard 4x4 transformation matrix combinning
   *   - Translation
   *   - Rotation
   *   - Scale
   *   - M = T * R * S        (Translastion * Rotation * Scale)
   *
   * @param position - The position vector
   * @param quaternion - The rotation quaternion
   * @param scale - The scale vector
   * @returns A reference to this matrix
   */
  public compose(position: Vector3, quaternion: Quaternion, scale: Vector3): this {
    const te = this.elements;

    const x = quaternion.x, y = quaternion.y, z = quaternion.z, w = quaternion.w;
    const x2 = x + x, y2 = y + y, z2 = z + z;
    const xx = x * x2, xy = x * y2, xz = x * z2;
    const yy = y * y2, yz = y * z2, zz = z * z2;
    const wx = w * x2, wy = w * y2, wz = w * z2;

    const sx = scale.x, sy = scale.y, sz = scale.z;

    te[0] = (1 - (yy + zz)) * sx;
    te[1] = (xy + wz) * sx;
    te[2] = (xz - wy) * sx;
    te[3] = 0;

    te[4] = (xy - wz) * sy;
    te[5] = (1 - (xx + zz)) * sy;
    te[6] = (yz + wx) * sy;
    te[7] = 0;

    te[8] = (xz + wy) * sz;
    te[9] = (yz - wx) * sz;
    te[10] = (1 - (xx + yy)) * sz;
    te[11] = 0;

    te[12] = position.x;
    te[13] = position.y;
    te[14] = position.z;
    te[15] = 1;

    return this;
  }

  /**
   * Decomposes this matrix into its position, rotation and scale components
   * and profuces the result in the given objects.
   *
   * @remarks
   * Not all matrices are decomposable in this way. For example, if an object has
   * a non-uniformly scaled parent, then the object's world matrix may not be decomposable,
   * and this method may not behave as expected.
   *
   * This function decomposes a 4x4 transformation matrix into:
   * 1. Position: Extracts the translation component from the last column of the matrix.
   * 2. Scale: Calculates the scale factors along each axis by measuring the length of the
   *    column vectors in the upper-left 3x3 portion of the matrix.
   * 3. Rotation: Removes the scale from the rotation submatrix and converts it into a Quaternion.
   *
   * @param position - The vector to store the position component.
   * @param quaternion - The quaternion to store the rotation component.
   * @param scale - The vector to store the scale component.
   * @returns A reference to this matrix
   */
  public decompose(position: Vector3, quaternion: Quaternion, scale: Vector3): this {
    const te = this.elements;

    // Extract scale
    // measures the length of each column vector in the upper 3x3 portion of the matrix
    // the column lengths correspond to the scale factors along the X, Y, and Z axes
    let sx = _v1.set(te[0], te[1], te[2]).length();
    const sy = _v1.set(te[4], te[5], te[6]).length();
    const sz = _v1.set(te[8], te[9], te[10]).length();

    // if determine is negative, we need to invert one scale
    // if the determinant is negative, the matrix includes a reflection (a flip)
    // so the function negates one scale value to preserve the orientation correctly
    const det = this.determinant();
    if (det < 0) sx = - sx;

    // Extract translation (position)
    // the last column of the matrix (indeces 12, 13, 14)
    position.x = te[12];
    position.y = te[13];
    position.z = te[14];

    // scale the rotation part
    // before extracting the rotation, we need to remove the scale from
    // rotation submatrix (upper-left 3x3 portion of the 4x4 matrix)
    _m1.copy(this);

    const invSX = 1 / sx;
    const invSY = 1 / sy;
    const invSZ = 1 / sz;

    _m1.elements[0] *= invSX;
    _m1.elements[1] *= invSX;
    _m1.elements[2] *= invSX;

    _m1.elements[4] *= invSY;
    _m1.elements[5] *= invSY;
    _m1.elements[6] *= invSY;

    _m1.elements[8] *= invSZ;
    _m1.elements[9] *= invSZ;
    _m1.elements[10] *= invSZ;

    // converts the rotation submatrix into a Quaternion
    quaternion.setFromRotationMatrix(_m1);

    // Set scaled vector
    scale.x = sx;
    scale.y = sy;
    scale.z = sz;

    return this;
  }

  /**
   * Create a perspective projection matrix. This is uses internally by
   * {@link PerspectiveCamera#updateProjectionMatrix}
   *
   * @remarks
   * Constructs a 4x4 projection matrix that maps 3D world coordinates into clip
   * space (the space the GPU uses before the final divide by w)
   * It is used by perspective camera to simulate the way a human eye (or real camera)
   * perceives depth - objects father away appear smaller
   *
   * coordinate system {WebGLCoordinateSystem | WebGPUCoordinateSystem} - This determines
   * how the depth range (z-values) are handled
   *
   * @param left - Left boundary of the viewing frustum at the near plane
   * @param right - Right boundary of the viewing frustum at the near plane
   * @param top - Top boundary of the viewing frustum at the near plane
   * @param bottom - Bottom boundary of the viewing frustum near the near plane
   * @param near - The distance from the camera to the near plane
   * @param far - The distance from the camera to the far plane
   * @param coordinateSystem - The coordinate system
   * @param reversedDepth - Whether to use a reversed depth
   * @returns A reference to this matrix
   */
  public makePerspective(
    left: number,
    right: number,
    top: number,
    bottom: number,
    near: number,
    far: number,
    coordinateSystem: CoordinateSystem = WebGLCoordinateSystem,
    reversedDepth: boolean = true) {
    const te = this.elements;

    const x = 2 * near / (right - left);
    const y = 2 * near / (top - bottom);

    const a = (right + left) / (right - left);
    const b = (top + bottom) / (top - bottom);

    let c, d;

    if (reversedDepth) {
      // if reversedDepth then reverses the depth range
      // useful in modern graphics APIs for better precision
      // Near = 1, Far = 0
      c = near / (far - near);
      d = (far * near) / (far - near);

    } else {

      if (coordinateSystem === WebGLCoordinateSystem) {
        // Near = -1, Far = +1
        c = - (far + near) / (far - near);
        d = (- 2 * far * near) / (far - near);

      } else if (coordinateSystem === WebGPUCoordinateSystem) {
        // Near = 0, Far = +1
        c = - far / (far - near);
        d = (- far * near) / (far - near);

      } else {

        throw new Error('Matrix4.makePerspective(): Invalid coordinate system: ' + coordinateSystem);

      }

    }

    te[0] = x; te[4] = 0; te[8] = a; te[12] = 0;
    te[1] = 0; te[5] = y; te[9] = b; te[13] = 0;
    te[2] = 0; te[6] = 0; te[10] = c; te[14] = d;
    te[3] = 0; te[7] = 0; te[11] = - 1; te[15] = 0;

    return this;
  }

  /**
   * Creates an orthographic projection matrix. This is used internally by
   * {@link OrthographicCamera#updateProjectionMatrix}
   *
   * @remarks
   * This builds a 4x4 orthographic project matrix, used by orthographic cameras to
   * project 3D points onto a 2D plane without perspective distortion
   * (e.g. objects dont get smaller as they get farther away)
   *
   * @param left - Left boundary of the viewing frustum at the near plane
   * @param right - Right boundary of the viewing frustum at the near plane
   * @param top - Top boundary of the viewing frustum at the near plane
   * @param bottom - Bottom boundary of the viewing frustum near the near plane
   * @param near - The distance from the camera to the near plane
   * @param far - The distance from the camera to the far plane
   * @param coordinateSystem - The coordinate system
   * @param reversedDepth - Whether to use a reversed depth
   * @returns A reference to this matrix
   */
  public makeOrthographic(
    left: number,
    right: number,
    top: number,
    bottom: number,
    near: number,
    far: number,
    coordinateSystem: CoordinateSystem = WebGLCoordinateSystem,
    reversedDepth: boolean = true) {
    const te = this.elements;

    const x = 2 / (right - left);
    const y = 2 / (top - bottom);

    const a = - (right + left) / (right - left);
    const b = - (top + bottom) / (top - bottom);

    let c, d;

    if (reversedDepth) {

      c = 1 / (far - near);
      d = far / (far - near);

    } else {

      if (coordinateSystem === WebGLCoordinateSystem) {

        c = - 2 / (far - near);
        d = - (far + near) / (far - near);

      } else if (coordinateSystem === WebGPUCoordinateSystem) {

        c = - 1 / (far - near);
        d = - near / (far - near);

      } else {

        throw new Error('THREE.Matrix4.makeOrthographic(): Invalid coordinate system: ' + coordinateSystem);

      }

    }

    te[0] = x; te[4] = 0; te[8] = 0; te[12] = a;
    te[1] = 0; te[5] = y; te[9] = 0; te[13] = b;
    te[2] = 0; te[6] = 0; te[10] = c; te[14] = d;
    te[3] = 0; te[7] = 0; te[11] = 0; te[15] = 1;

    return this;
  }

  /**
   * Creates an orthographic project matrix. This is used internally by
   * {@link }
   */

  /**
   * Returns `true` if this matrix is equal with the given one.
   *
   * @parm matrix - The matrix to test for equality
   * @returns `true` if the two matrices are equal, `false` otherwise
   */
  public equals(matrix: Matrix4): boolean {
    const te = this.elements;
    const me = matrix.elements;

    for (let i = 0; i < 16; i++) {

      if (te[i] !== me[i]) return false;

    }

    return true;
  }

  /**
   * Sets the elements of this matrix from the given array.
   *
   * @param array - An array containing at least 16 elements.
   * @param offset - An optional offset into the array where the elements start. Default is 0.
   * @returns A reference to this matrix
   */
  public fromArray(array: number[], offset: number = 0): this {
    for (let i = 0; i < 16; i++) {
      this.elements[i] = array[i + offset];
    }

    return this;
  }

  /**
   * Writes the elements of this matrix into the given array. If no array is provided,
   * the method returns a new instance.
   *
   * @param array - The target array holding the matrix elements in column-major order
   * @param offset - Index of the element in the array to start writing
   * @return The the array containing matrix elements in column-major order
   */
  public toArray(array: number[], offset: number = 0): number[] {
    const te = this.elements;

    array[offset] = te[0];
    array[offset + 1] = te[1];
    array[offset + 2] = te[2];
    array[offset + 3] = te[3];

    array[offset + 4] = te[4];
    array[offset + 5] = te[5];
    array[offset + 6] = te[6];
    array[offset + 7] = te[7];

    array[offset + 8] = te[8];
    array[offset + 9] = te[9];
    array[offset + 10] = te[10];
    array[offset + 11] = te[11];

    array[offset + 12] = te[12];
    array[offset + 13] = te[13];
    array[offset + 14] = te[14];
    array[offset + 15] = te[15];

    return array;
  }
}

const _v1 = /*@__PURE__*/ new Vector3();
const _zero = /*@__PURE__*/ new Vector3(0, 0, 0);
const _one = /*@__PURE__*/ new Vector3(1, 1, 1);
const _m1 = /*@__PURE__*/ new Matrix4();
const _x = /*@__PURE__*/ new Vector3();
const _y = /*@__PURE__*/ new Vector3();
const _z = /*@__PURE__*/ new Vector3();
