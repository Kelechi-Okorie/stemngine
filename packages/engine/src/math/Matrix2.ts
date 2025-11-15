/**
 * Represents a 2x2 matrix
 *
 * @remarks
 * A note on Row-Major vs Column-Major order:
 *
 * The constructor and {@link Matrix2#set} method take values in
 * [row-major]{@link https://en.wikipedia.org/wiki/Row-_and_column-major_order#Column-major_order}
 * order, while internally they are stored in the {@link Matrix2#elements} array in
 * column-major order.
 * This means that calling
 *
 * ```ts
 * const m = new Matrix2();
 * m.set(11, 22
 *       21, 22);
 * ```
 * will result in the internal element array containing
 * ```ts
 * m.elements === [11, 21,
 *                 12, 22];
 * ```
 *
 * and internally all calculations are performed using column-major ordering.
 * However, as the actual ordering makes no difference mathematically, and most
 * people are used to thinking about matrices in row-major order, we show matrices
 * in row-major order in the documentation.
 * Just bear in mind that if you are reading the source code, you'll have to take the
 * transpose of any matrices outlined here to make sense of the calculations
 */
export class Matrix2 {
  /**
   * This flag can be used for type testing
   *@readonly
   @default true
   */
  public readonly isMatrix2: boolean = true;

  /**
 * A column-major list of matrix values
 *
 * @type {number[]}
 */
  public elements: number[];

  /**
   * Constructs a new 2x2 matrix. The arguments are supposed to be in row-major order.
   * If no arguments are provided, the identity matrix will be created.
   *
   * @param n11 - 1-1 matrix element (row 1, column 1).
   * @param n12 - 1-2 matrix element (row 1, column 2).
   * @param n21 - 2-1 matrix element (row 2, column 1).
   * @param n22 - 2-2 matrix element (row 2, column 2).
   */
  constructor(
    public n11: number = 1, public n12: number = 0,
    public n21: number = 0, public n22: number = 1) {

    this.elements = [
      1, 0,
      0, 1,
    ];

    this.set(n11, n12, n21, n22);
  }

  /**
   * Sets the elements of the matrix. The arguments are supposed to be in
   * row-major order.
   *
   * @param n11 - 1-1 matrix element (row 1, column 1).
   * @param n12 - 1-2 matrix element (row 1, column 2).
   * @param n21 - 2-1 matrix element (row 2, column 1).
   * @param n22 - 2-2 matrix element (row 2, column 2).
   * @returns This matrix.
   */
  public set(n11: number, n12: number, n21: number, n22: number): this {
    const te = this.elements;

    te[0] = n11; te[2] = n12;
    te[1] = n21; te[3] = n22;

    return this;
  }

  /**
   * Sets this matrix to the 2x2 identity matrix.
   *
   * @returns A reference to this matrix
   */
  public identity(): this {
    this.set(
      1, 0,
      0, 1
    )

    return this;
  }

  /**
   * Sets the elements of the matrix from the given array.
   *
   * @param array - The array containing the matrix elements in row-major order.
   * @param offset - The offset into the array where the matrix elements start. Default is `0`.
   * @returns This matrix.
   */
  public fromArray(array: number[], offset: number = 0): this {
    const te = array;

    return this.set(
      te[offset + 0], te[offset + 2],
      te[offset + 1], te[offset + 3]
    );
  }
}
