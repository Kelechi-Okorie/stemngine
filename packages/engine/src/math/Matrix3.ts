import type { Vector3 } from './Vector3.js';
import type { Vector2 } from './Vector2.js';
import type { Matrix4 } from './Matrix4.js';

/**
 * Represents a 3x3 matrix
 *
 * A note on Row-Major vs Column-Major storage:
 *
 * The constructor and {@link Matrix3#set} methods take arguments in
 * [row-major order]{@link https://en.wikipedia.org/wiki/Row-_and_column-major_order}
 * while internally they are stored in the {@link Matrix3#elements} array in column-major
 * order.
 * This is in line with WebGL/OpenGL which expects matrices to be provided in column-major order.
 *
 * This means that calling:
 * ```ts
 * const m = new Matrix3();
 * m.set(
 *  1, 2, 3,
 *  4, 5, 6,
 *  7, 8, 9
 * );
 * ```
 * will result in the following internal representation:
 * ```ts
 * m.elements === [
 *   1, 4, 7,
 *   2, 5, 8,
 *   3, 6, 9
 * ];
 * ```
 * Internally all calculations are performed in column-major order.
 * even though most people are used to thinking in row-major order, the actual
 * ordering makes no difference mathematically as long as one is consistent.
 *
 * Just bear in mind that if you are reading the source code, you'll have to take the
 * transpose of any matrices outlined here to make sense of the calculations
 */
export class Matrix3 {
  /**
   * This flag can be used for type testing.
   *
   * @type {boolean}
   * @readonly
   * @defaultValue true
   */
  public readonly isMatrix3: boolean = true;

  /**
   * A column-major list of matrix values
   *
   * @type {number[]}
   */
  public elements: number[];

  /**
   * Constructs a new Matrix3 instance.
   * The arguments are supposed to be in row-major order
   * If no arguments are provided, the identity matrix will be created.
   *
   * @param n11 - 1-1 matrix element (row 1, column 1).
   * @param n12 - 1-2 matrix element (row 1, column 2).
   * @param n13 - 1-3 matrix element (row 1, column 3).
   * @param n21 - 2-1 matrix element (row 2, column 1).
   * @param n22 - 2-2 matrix element (row 2, column 2).
   * @param n23 - 2-3 matrix element (row 2, column 3).
   * @param n31 - 3-1 matrix element (row 3, column 1).
   * @param n32 - 3-2 matrix element (row 3, column 2).
   * @param n33 - 3-3 matrix element (row 3, column 3).
   */
  constructor(
    n11: number = 1, n12: number = 0, n13: number = 0,
    n21: number = 0, n22: number = 1, n23: number = 0,
    n31: number = 0, n32: number = 0, n33: number = 1) {

    /**
     * A column-major list of matrix values
     *
     * @type {number[]}
     */
    this.elements = [
      n11, n21, n31,
      n12, n22, n32,
      n13, n23, n33
    ];

    this.set(n11, n12, n13, n21, n22, n23, n31, n32, n33);
  }

  /**
  * Sets the elements of the matrix. The arguments are supposed to be in
  * row-major order.
  *
  * @param n11 - 1-1 matrix element (row 1, column 1).
  * @param n12 - 1-2 matrix element (row 1, column 2).
  * @param n13 - 1-3 matrix element (row 1, column 3).
  * @param n21 - 2-1 matrix element (row 2, column 1).
  * @param n22 - 2-2 matrix element (row 2, column 2).
  * @param n23 - 2-3 matrix element (row 2, column 3).
  * @param n31 - 3-1 matrix element (row 3, column 1).
  * @param n32 - 3-2 matrix element (row 3, column 2).
  * @param n33 - 3-3 matrix element (row 3, column 3).
  * @returns This matrix.
  */
  public set(n11: number, n12: number, n13: number, n21: number, n22: number, n23: number, n31: number, n32: number, n33: number): this {
    const te = this.elements;

    te[0] = n11; te[1] = n21; te[2] = n31;
    te[3] = n12; te[4] = n22; te[5] = n32;
    te[6] = n13; te[7] = n23; te[8] = n33;

    return this;
  }

  /**
   * Sets this matrix to the 3x3 identity matrix.
   *
   * @returns A reference to this matrix
   */
  public identity(): this {
    return this.set(
      1, 0, 0,
      0, 1, 0,
      0, 0, 1
    );
  }

  /**
   * Copies the values of the given matrix to this instance
   *
   * @param m - The matrix to copy from
   * @returns A reference to this matrix
   */
  public copy(m: Matrix3): this {
    const te = this.elements;
    const me = m.elements;

    te[0] = me[0]; te[1] = me[1]; te[2] = me[2];
    te[3] = me[3]; te[4] = me[4]; te[5] = me[5];
    te[6] = me[6]; te[7] = me[7]; te[8] = me[8];

    return this;
  }

  /**
   * Extracts the basis of this matrix into the three axis vectors provided.
   *
   * @param xAxis - The vector to store the x axis in
   * @param yAxis - The vector to store the y axis in
   * @param zAxis - The vector to store the z axis in
   * @returns A reference to this matrix
   */
  public extractBasis(xAxis: Vector3, yAxis: Vector3, zAxis: Vector3): this {

    xAxis.setFromMatrix3Column(this, 0);
    yAxis.setFromMatrix3Column(this, 1);
    zAxis.setFromMatrix3Column(this, 2);

    return this;
  }

  /**
   * Set this matrix to the upper 3x3 matrix of the given 4x4 matrix.
   *
   * @param m - The given 4x4 matrix
   * @returns A reference to this matrix
   */
  public setFromMatrix4(m: Matrix4) {
    const me = m.elements;

    this.set(
      me[0], me[4], me[8],
      me[1], me[5], me[9],
      me[2], me[6], me[10]
    );

    return this;
  }

  /**
 * Multiplies two matrices and sets this matrix to the result.
 *
 * @param a - The first matrix
 * @param b - The second matrix
 * @returns A reference to this matrix
 */
  public multiplyMatrices(a: Matrix3, b: Matrix3): this {
    const ae = a.elements;
    const be = b.elements;
    const te = this.elements;

    const a11 = ae[0], a12 = ae[3], a13 = ae[6];
    const a21 = ae[1], a22 = ae[4], a23 = ae[7];
    const a31 = ae[2], a32 = ae[5], a33 = ae[8];

    const b11 = be[0], b12 = be[3], b13 = be[6];
    const b21 = be[1], b22 = be[4], b23 = be[7];
    const b31 = be[2], b32 = be[5], b33 = be[8];

    te[0] = a11 * b11 + a12 * b21 + a13 * b31;
    te[3] = a11 * b12 + a12 * b22 + a13 * b32;
    te[6] = a11 * b13 + a12 * b23 + a13 * b33;

    te[1] = a21 * b11 + a22 * b21 + a23 * b31;
    te[4] = a21 * b12 + a22 * b22 + a23 * b32;
    te[7] = a21 * b13 + a22 * b23 + a23 * b33;

    te[2] = a31 * b11 + a32 * b21 + a33 * b31;
    te[5] = a31 * b12 + a32 * b22 + a33 * b32;
    te[8] = a31 * b13 + a32 * b23 + a33 * b33;

    return this;
  }

  /**
   * Post-multiplies this matrix by the given 3x3 matrix
   *
   * @param m - The matrix to multiply by
   * @returns A reference to this matrix
   */
  public multiply(m: Matrix3): this {
    return this.multiplyMatrices(this, m);
  }

  /**
   * Pre-multiplies this matrix by the given 3x3 matrix
   *
   * @param m - The matrix to pre-multiply by
   * @returns A referencet to this matrix.
   */
  public premultiply(m: Matrix3): this {
    return this.multiplyMatrices(m, this);
  }

  /**
   * Multiplies this matrix by a scalar value.
   *
   * @param s - The scalar value
   * @returns A reference to this matrix
   */
  public multiplyScalar(s: number): this {
    const te = this.elements;

    te[0] *= s; te[3] *= s; te[6] *= s;
    te[1] *= s; te[4] *= s; te[7] *= s;
    te[2] *= s; te[5] *= s; te[8] *= s;

    return this;
  }

  /**
   * Computes and returns the determinant of this matrix.
   *
   * @returns The determinant.
   */

  public determinant() {
    const te = this.elements;

    const a = te[0], b = te[1], c = te[2],
      d = te[3], e = te[4], f = te[5],
      g = te[6], h = te[7], i = te[8];

    return a * e * i - a * f * h - b * d * i + b * f * g + c * d * h - c * e * g;
  }

  /**
   * Inverts this matrix, using the [analytic method]{@link https://en.wikipedia.org/wiki/Invertible_matrix#Analytic_solution}.
   *
   * @remarks
   * You can not invert a matrix with determinant 0. If you attempt this, the method
   * will produce a zero matrix instead.
   *
   @returns A reference to this matrix
   */
  public invert(): this {
    const te = this.elements,

      n11 = te[0], n21 = te[1], n31 = te[2],
      n12 = te[3], n22 = te[4], n32 = te[5],
      n13 = te[6], n23 = te[7], n33 = te[8],

      t11 = n33 * n22 - n32 * n23,
      t12 = n32 * n13 - n33 * n12,
      t13 = n23 * n12 - n22 * n13,

      det = n11 * t11 + n21 * t12 + n31 * t13;

    if (det === 0) {
      console.warn("Matrix3: .invert() can't invert matrix, determinant is 0");

      return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
    }

    const detInv = 1 / det;

    te[0] = t11 * detInv;
    te[1] = (n31 * n23 - n33 * n21) * detInv;
    te[2] = (n32 * n21 - n31 * n22) * detInv;

    te[3] = t12 * detInv;
    te[4] = (n33 * n11 - n31 * n13) * detInv;
    te[5] = (n31 * n12 - n32 * n11) * detInv;

    te[6] = t13 * detInv;
    te[7] = (n21 * n13 - n23 * n11) * detInv;
    te[8] = (n22 * n11 - n21 * n12) * detInv;

    return this;
  }

  /**
   * Transpose this matrix in place.
   *
   * @returns A reference to this matrix
   */
  public transpose(): this {
    let tmp: number;
    const m = this.elements;

    tmp = m[1]; m[1] = m[3]; m[3] = tmp;
    tmp = m[2]; m[2] = m[6]; m[6] = tmp;
    tmp = m[5]; m[5] = m[7]; m[7] = tmp;

    return this;
  }

  /**
   * Computes the normal matrix which is the inverse transpose of the upper
   * left 3x3 portion of the given 4x4 matrix
   *
   * @param m - The source 4x4 matrix
   * @returns A reference to this matrix
   */
  public getNormalMatrix(m: Matrix4): this {
    return this.setFromMatrix4(m).invert().transpose();
  }

  /**
   * Transpose this matrix into the supplied array, and returns self unchanged.
   *
   * @param r - The array to store the transposed matrix in
   * @returns A reference to this matrix
   */
  public transposeIntoArray(r: number[]): this {
    const m = this.elements;

    r[0] = m[0];
    r[1] = m[3];
    r[2] = m[6];

    r[3] = m[1];
    r[4] = m[4];
    r[5] = m[7];

    r[6] = m[2];
    r[7] = m[5];
    r[8] = m[8];

    return this;
  }

  /**
   * Sets the UV transform matrix from offset, repeat, rotation and center.
   *
   * @remarks
   * This is a UV transform matrix generator, commonly used for texture mapping.
   * You often want to do the following
   * 1. Translate (offset) the texture in UV space -> (u + tx, v + ty)
   * 2. Scale (repeat) the texture -> (u * sx, v * sy)
   * 3. Rotate the texture around a center point -> rotation
   *
   * These transformations can all be represented as a 3x3 matrix in homogeneous
   * coordinates
   *
   * [
   *  sx * cosθ    -sy * sinθ    tx
   *  sx * sinθ     sy * cosθ    ty
   *      0              0        1
   * ]
   *
   * and this method sets this matrix from the given parameters.
   *
   * Combines translation, scaling, rotation, and pivoting in a
   * single 3x3 homogenous matrix
   *
   * @param tx - offset x.
   * @param ty - offset y.
   * @param sx - repeat x.
   * @param sy - repeat y.
   * @param rotation - rotation, in radians. +ve values rotate counter-clockwise.
   * @param cx - center x.
   * @param cy - center y.
   * @returns A reference to this matrix
   */
  public setUvTransform(tx: number, ty: number, sx: number, sy: number, rotation: number, cx: number, cy: number): this {
    const c = Math.cos(rotation);
    const s = Math.sin(rotation);

    this.set(
      sx * c, sx * s, -sx * (c * cx + s * cy) + cx + tx,
      -sy * s, sy * c, -sy * (-s * cx + c * cy) + cy + ty,
      0, 0, 1
    );

    return this;
  }

  /**
   * Scales this matrix with the given scalar values.
   *
   * @param sx - Scale in x direction.
   * @param sy - Scale in y direction.
   * @returns A reference to this matrix
   */
  public scale(sx: number, sy: number): this {
    this.premultiply(_m3.makeScale(sx, sy));
    return this;
  }

  /**
   * Rotates this matrix by the given angle.
   *
   * @param theta - The rotation angle in radians. +ve values rotate counter-clockwise.
   * @returns A reference to this matrix
   */
  public rotate(theta: number): this {
    this.premultiply(_m3.makeRotation(theta));
    return this;
  }

  /**
   * Translates this matrix by the given values.
   *
   * @param tx - The translation in x direction, or alternatively a translation vector.
   * @param ty - The translation in y direction.
   * @returns A reference to this matrix
   */
  public translate(tx: number | Vector2, ty?: number): this {
    this.premultiply(_m3.makeTranslation(tx, ty));

    return this;
  }

  /**
   * Sets this matrix as a 2D scale transform.
   *
   * @param xs - Scale in x direction.
   * @param ys - Scale in y direction.
   * @returns A reference to this matrix
   */
  public makeScale(xs: number, ys: number): this {
    return this.set(
      xs, 0, 0,
      0, ys, 0,
      0, 0, 1
    );
  }

  /**
   * Sets this matrix as a 2D rotation transform.
   *
   * @param theta - The rotation angle in radians. +ve values rotate counter-clockwise.
   * @returns A reference to this matrix
   */
  public makeRotation(theta: number): this {
    // counter-clockwise rotation
    const c = Math.cos(theta);
    const s = Math.sin(theta);

    return this.set(
      c, -s, 0,
      s, c, 0,
      0, 0, 1
    );
  }

  /**
   * Sets this matrix as a 2D translation transform.
   *
   * @param tx - The translation in x direction, or alternatively a translation vector.
   * @param ty - The translation in y direction.
   * @returns A reference to this matrix
   */
  public makeTranslation(tx: number | Vector2, ty?: number): this {
    if (typeof tx !== "number") {
      // tx is a Vector2 here
      this.set(
        1, 0, tx.x,
        0, 1, tx.y,
        0, 0, 1
      );
    } else {
      // tx is a number, ty must be provided

      if (ty === undefined) {
        throw new Error("ty must be provided when tx is a number")
      }
      this.set(
        1, 0, tx,
        0, 1, ty,
        0, 0, 1
      );
    }

    return this;
  }

  /**
   * Returns `true` if this matrix is equal to the given one
   *
   * @param m - The matrix to compare with
   * @returns `true` if the matrices are equal, `false` otherwise
   */
  public equals(m: Matrix3): boolean {
    const te = this.elements;
    const me = m.elements;

    for (let i = 0; i < 9; i++) {
      if (te[i] !== me[i]) return false;
    }

    return true;
  }

  /**
   * Sets the elements of the matrix from the given array.
   *
   * @param array - The array to read the matrix elements from
   * @param offset - The offset into the array where the matrix elements start
   * @returns A reference to this matrix
   */
  public fromArray(array: number[], offset: number = 0): this {
    for (let i = 0; i < 9; i++) {
      this.elements[i] = array[i + offset];
    }

    return this;
  }

  /**
   * Writes the elements of this matrix into the given array.
   * If no array is provided, a new array will be created.
   *
   * @param array - The array to write the matrix elements to
   * @param offset - The offset into the array where to start writing
   * @returns The array with the matrix elements
   */
  public toArray(array: number[] = [], offset: number = 0): number[] {
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

    return array;
  }

  /**
   * Returns a matrix with copied values from this instance.
   *
   * @return A clone of this instance
   */
  public clone(): Matrix3 {
    return new Matrix3().fromArray(this.elements)
  }
}

const _m3 = /*@__PURE__*/ new Matrix3();
