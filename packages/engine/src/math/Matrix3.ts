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
 * ```js
 * const m = new Matrix3();
 * m.set(
 *  1, 2, 3,
 *  4, 5, 6,
 *  7, 8, 9
 * );
 * ```
 * will result in the following internal representation:
 * ```js
 * m.elements === [
 *   1, 4, 7,
 *   2, 5, 8,
 *   3, 6, 9
 * ];
 * ```
 * Internlly all calculationrs are performed in column-major order.
 * even though most people are used to thinking in row-major order, the actual
 * ordering makes no difference mathematically as long as one is consistent.
 * 
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
  }

}
