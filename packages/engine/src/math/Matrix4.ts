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
 * The constructor and {@link Matrix3#set} methods take arguments in
 * [row-major order]{@link https://en.wikipedia.org/wiki/Row-_and_column-major_order}
 * while internally they are stored in the {@link Matrix3#elements} array in column-major
 * order.
 * This is in line with WebGL/OpenGL which expects matrices to be provided in column-major order.
 *
 * This means that calling:
 * ```js
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
  }
}
