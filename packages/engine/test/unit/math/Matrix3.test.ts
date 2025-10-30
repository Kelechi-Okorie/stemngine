import { describe, it, expect } from 'vitest';
import { Matrix3 } from '../../../src/math/Matrix3';

describe('Matrix3', () => {
  it('should create an identity matrix by default', () => {
    const m = new Matrix3();

    expect(m.isMatrix3).toBe(true);
    expect(m.elements).toEqual([
      1, 0, 0,  // first column,
      0, 1, 0,  // second column,
      0, 0, 1   // third column
    ]);
  });

  it('should correctly set elements from constructor arguments', () => {
    // row-major inputs
    const m = new Matrix3(
      1, 2, 3,  // first row
      4, 5, 6,  // second row
      7, 8, 9   // third row
    );

    // column-major storage
    expect(m.elements).toEqual([
      1, 4, 7,  // first column
      2, 5, 8,  // second column
      3, 6, 9   // third column
    ]);
  });

});
