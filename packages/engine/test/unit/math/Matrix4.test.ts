import { describe, expect, it } from 'vitest';
import { Matrix4 } from '../../../src/math/Matrix4';

describe('Matrix4', () => {
  it('should create an identity matrix by default', () => {
    const m = new Matrix4();

    expect(m.isMatrix4).toBe(true);

    expect(m.elements).toEqual([
      1, 0, 0, 0,  // first column,
      0, 1, 0, 0,  // second column,
      0, 0, 1, 0,  // third column,
      0, 0, 0, 1   // fourth column
    ]);
  });

  it('should correctlly assign elements when values are provided', () => {
    const m = new Matrix4(
      1, 2, 3, 4,
      5, 6, 7, 8,
      9, 10, 11, 12,
      13, 14, 15, 16
    );

    // Column-major order
    expect(m.elements).toEqual([
      1, 5, 9, 13,  // first column
      2, 6, 10, 14, // second column
      3, 7, 11, 15, // third column
      4, 8, 12, 16  // fourth column
    ]);
  });
  
  it('should have elements array length of 16', () => {
    const m = new Matrix4();
    expect(m.elements).toHaveLength(16);
  });
});
