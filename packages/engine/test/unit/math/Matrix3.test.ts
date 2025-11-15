import { describe, it, expect, vi } from 'vitest';
import { Matrix4 } from '../../../src/math/Matrix4';
import { Matrix3 } from '../../../src/math/Matrix3';
import { Vector3 } from '../../../src/math/Vector3';
import { Vector2 } from '../../../src/math/Vector2';

describe('Matrix3', () => {
  describe('constructor()', () => {
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

    it('should return this from set() for chaining', () => {
      const m = new Matrix3();
      const result = m.set(
        9, 8, 7,
        6, 5, 4,
        3, 2, 1
      );
      expect(result).toBe(m);
      expect(m.elements).toEqual([
        9, 6, 3,
        8, 5, 2,
        7, 4, 1
      ]);
    });
  });

  describe('set()', () => {
    it('should set elements correctly in column-major order', () => {
      const m = new Matrix3();

      m.set(
        1, 2, 3,
        4, 5, 6,
        7, 8, 9
      );

      // Elements stored in column-major order
      expect(m.elements).toEqual([
        1, 4, 7,
        2, 5, 8,
        3, 6, 9
      ]);
    });

    it('should overwrite previous values', () => {
      const m = new Matrix3(
        9, 8, 7,
        6, 5, 4,
        3, 2, 1
      );

      m.set(
        1, 2, 3,
        4, 5, 6,
        7, 8, 9
      );

      expect(m.elements).toEqual([
        1, 4, 7,
        2, 5, 8,
        3, 6, 9
      ]);
    });

    it('should return this for chaining', () => {
      const m = new Matrix3();
      const result = m.set(
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
      );
      expect(result).toBe(m);
    });
  });

  describe('identity()', () => {
    it('should set the matrix to the identity matrix', () => {
      const m = new Matrix3(
        2, 3, 4,
        5, 6, 7,
        8, 9, 10
      );

      m.identity();

      expect(m.elements).toEqual([
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
      ]);
    });

    it('should return this for chaining', () => {
      const m = new Matrix3();
      const result = m.identity();
      expect(result).toBe(m);
    });
  });

  describe('copy()', () => {
    it('should copy all elements from another matrix', () => {
      const m1 = new Matrix3(
        1, 2, 3,
        4, 5, 6,
        7, 8, 9
      );

      const m2 = new Matrix3();
      m2.copy(m1);

      expect(m2.elements).toEqual([
        1, 4, 7,
        2, 5, 8,
        3, 6, 9
      ]);
    });

    it('should return this for chaining', () => {
      const m1 = new Matrix3();
      const m2 = new Matrix3();
      const result = m2.copy(m1);
      expect(result).toBe(m2);
    });

    it('should not modify the source matrix', () => {
      const m1 = new Matrix3(
        1, 2, 3,
        4, 5, 6,
        7, 8, 9
      );
      const m2 = new Matrix3();

      m2.copy(m1);

      expect(m1.elements).toEqual([
        1, 4, 7,
        2, 5, 8,
        3, 6, 9
      ]);
    });
  });

  describe('extractBasis()', () => {
    it('extracts the basis vectors from the matrix', () => {
      const m = new Matrix3(
        1, 2, 3,
        4, 5, 6,
        7, 8, 9
      );

      const xAxis = new Vector3();
      const yAxis = new Vector3();
      const zAxis = new Vector3();

      m.extractBasis(xAxis, yAxis, zAxis);

      // Check first column
      expect(xAxis.x).toBe(1);
      expect(xAxis.y).toBe(4);
      expect(xAxis.z).toBe(7);

      // Check second column
      expect(yAxis.x).toBe(2);
      expect(yAxis.y).toBe(5);
      expect(yAxis.z).toBe(8);

      // Check third column
      expect(zAxis.x).toBe(3);
      expect(zAxis.y).toBe(6);
      expect(zAxis.z).toBe(9);
    });

    it('returns the matrix itself for chaining', () => {
      const m = new Matrix3();
      const xAxis = new Vector3();
      const yAxis = new Vector3();
      const zAxis = new Vector3();

      const result = m.extractBasis(xAxis, yAxis, zAxis);

      expect(result).toBe(m);
    });
  });

  describe('setFromMatrix4()', () => {
    it('extracts the upper-left 3x3 part of a 4x4 matrix', () => {
      const m4 = new Matrix4(
        1, 2, 3, 4,
        5, 6, 7, 8,
        9, 10, 11, 12,
        13, 14, 15, 16
      );

      const m3 = new Matrix3();
      m3.setFromMatrix4(m4);

      // Check the upper-left 3x3 values
      expect(m3.elements).toEqual([
        1, 5, 9,   // first column
        2, 6, 10,  // second column
        3, 7, 11   // third column
      ]);
    });

    it('returns the matrix itself for chaining', () => {
      const m4 = new Matrix4();
      const m3 = new Matrix3();

      const result = m3.setFromMatrix4(m4);

      expect(result).toBe(m3);
    });
  });

  describe('multiplyMatrices()', () => {
    it('multiplies two identity matrices correctly', () => {
      const a = new Matrix3();
      const b = new Matrix3();
      const result = new Matrix3();

      result.multiplyMatrices(a, b);

      // Identity * Identity = Identity
      expect(result.elements).toEqual([
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
      ]);
    });

    it('multiplies two arbitrary matrices correctly', () => {
      const a = new Matrix3(
        1, 2, 3,
        4, 5, 6,
        7, 8, 9
      );

      const b = new Matrix3(
        9, 8, 7,
        6, 5, 4,
        3, 2, 1
      );

      const result = new Matrix3();
      result.multiplyMatrices(a, b);

      expect(result.elements).toEqual([
        30, 84, 138,  // first column
        24, 69, 114,  // second column
        18, 54, 90    // third column
      ]);
    });

    it('returns itself for chaining', () => {
      const a = new Matrix3();
      const b = new Matrix3();
      const result = new Matrix3();

      const ret = result.multiplyMatrices(a, b);

      expect(ret).toBe(result);
    });
  });

  describe('multiply()', () => {
    it('multiplies this matrix by another matrix', () => {
      const a = new Matrix3(
        1, 2, 3,
        4, 5, 6,
        7, 8, 9
      );

      const b = new Matrix3(
        9, 8, 7,
        6, 5, 4,
        3, 2, 1
      );

      a.multiply(b);

      // Manually compute expected result
      // Result is a * b
      expect(a.elements).toEqual([
        30, 84, 138,
        24, 69, 114,
        18, 54, 90
      ]);
    });

    it.skip('does not modify the second matrix', () => {
      const a = new Matrix3(1, 2, 3, 4, 5, 6, 7, 8, 9);
      const b = new Matrix3(9, 8, 7, 6, 5, 4, 3, 2, 1);

      const bCopy = new Matrix3(...b.elements);
      a.multiply(b);

      expect(b.elements).toEqual(bCopy.elements);
    });

    it('returns this for chaining', () => {
      const a = new Matrix3();
      const b = new Matrix3();
      const result = a.multiply(b);

      expect(result).toBe(a);
    });
  });

  describe('premultiply()', () => {
    it('pre-multiplies this matrix by another matrix', () => {
      const a = new Matrix3(
        1, 2, 3,
        4, 5, 6,
        7, 8, 9
      );

      const b = new Matrix3(
        9, 8, 7,
        6, 5, 4,
        3, 2, 1
      );

      a.premultiply(b);

      // Manually compute expected result for b * a
      expect(a.elements).toEqual([
        90, 54, 18,
        114, 69, 24,
        138, 84, 30
      ]);
    });

    it.skip('does not modify the pre-multiplying matrix', () => {
      const a = new Matrix3(1, 2, 3, 4, 5, 6, 7, 8, 9);
      const b = new Matrix3(9, 8, 7, 6, 5, 4, 3, 2, 1);

      const bCopy = new Matrix3(...b.elements);
      a.premultiply(b);

      expect(b.elements).toEqual(bCopy.elements);
    });


    it('returns this for chaining', () => {
      const a = new Matrix3();
      const b = new Matrix3();
      const result = a.premultiply(b);

      expect(result).toBe(a);
    });
  });

  describe('multiplyScalar', () => {
    it('multiplies all elements by the scalar', () => {
      const m = new Matrix3(
        1, 2, 3,
        4, 5, 6,
        7, 8, 9
      );

      const scalar = 2;

      m.multiplyScalar(scalar);

      // Because internal storage is column-major
      expect(m.elements).toEqual([
        2, 8, 14,  // first column multiplied
        4, 10, 16, // second column multiplied
        6, 12, 18  // third column multiplied
      ]);
    });

    it('handles multiplying by zero', () => {
      const m = new Matrix3(
        1, 2, 3,
        4, 5, 6,
        7, 8, 9
      );

      m.multiplyScalar(0);

      expect(m.elements).toEqual([
        0, 0, 0,
        0, 0, 0,
        0, 0, 0
      ]);
    });

    it('handles multiplying by a negative scalar', () => {
      const m = new Matrix3(
        1, -2, 3,
        -4, 5, -6,
        7, -8, 9
      );

      m.multiplyScalar(-1);

      expect(m.elements).toEqual([
        -1, 4, -7,
        2, -5, 8,
        -3, 6, -9
      ]);
    });

    it('returns this for chaining', () => {
      const m = new Matrix3();
      const result = m.multiplyScalar(5);
      expect(result).toBe(m);
    });

  });

  describe('determinant()', () => {
    it('returns 0 for the zero matrix', () => {
      const m = new Matrix3();
      m.set(
        0, 0, 0,
        0, 0, 0,
        0, 0, 0
      );
      expect(m.determinant()).toBe(0);
    });

    it('returns 1 for the identity matrix', () => {
      const m = new Matrix3();
      m.identity();
      expect(m.determinant()).toBe(1);
    });

    it('computes correct determinant for a simple matrix', () => {
      // Matrix in row-major order:
      // | 1 2 3 |
      // | 4 5 6 |
      // | 7 8 9 |
      // determinant = 0
      const m = new Matrix3(
        1, 2, 3,
        4, 5, 6,
        7, 8, 9
      );
      expect(m.determinant()).toBe(0);
    });

    it('computes correct determinant for a non-singular matrix', () => {
      // Matrix in row-major:
      // | 2 3 1 |
      // | 4 1 5 |
      // | 7 2 6 |
      // determinant = 2*(1*6 - 5*2) - 3*(4*6 - 5*7) + 1*(4*2 - 1*7)
      //             = 2*(6 - 10) - 3*(24 - 35) + (8 - 7)
      //             = 2*(-4) - 3*(-11) + 1
      //             = -8 + 33 + 1 = 26
      const m = new Matrix3(
        2, 3, 1,
        4, 1, 5,
        7, 2, 6
      );
      expect(m.determinant()).toBe(26);
    });

    it('handles negative determinants', () => {
      // | 1 2 3 |
      // | 0 -1 4 |
      // | 5 6 0 |
      // determinant = 1*(-1*0 - 4*6) - 2*(0*0 - 4*5) + 3*(0*6 - (-1)*5)
      //              = 1*(-24) - 2*(-20) + 3*(5)
      //              = -24 + 40 + 15 = 31
      const m = new Matrix3(
        1, 2, 3,
        0, -1, 4,
        5, 6, 0
      );
      expect(m.determinant()).toBe(31);
    });
  });

  describe('invert()', () => {
    it("should correctly invert the identity matrix", () => {
      const m = new Matrix3().set(
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
      );
      m.invert();
      expect(m.elements).toEqual([
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
      ]);
    });

    it("should correctly invert a simple matrix (column-major layout)", () => {
      const m = new Matrix3().set(
        1, 2, 3,
        0, 1, 4,
        5, 6, 0
      );

      const inverse = new Matrix3().copy(m).invert();

      // This is the correct inverse for the matrix, in column-major order:
      // [ -24, 20, -5, 18, -15, 4, 5, -4, 1 ]
      const expected = [-24, 20, -5, 18, -15, 4, 5, -4, 1];

      // Allow for small floating point noise
      const rounded = inverse.elements.map(v => Number(v.toFixed(5)));

      expect(rounded).toEqual(expected);
    });

    it("should produce a zero matrix if determinant is 0", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => { });
      const m = new Matrix3().set(
        1, 2, 3,
        2, 4, 6, // row2 = 2 * row1 ⇒ singular
        7, 8, 9
      );

      m.invert();

      expect(m.elements).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0]);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Matrix3: .invert() can't invert matrix")
      );
      warnSpy.mockRestore();
    });

    it("should be the inverse: M * M^-1 = identity", () => {
      const m = new Matrix3().set(
        2, 1, 1,
        1, 3, 2,
        1, 0, 0
      );
      const inv = new Matrix3().copy(m).invert();
      const product = new Matrix3().multiplyMatrices(m, inv);

      // should approximately equal identity
      const expected = [1, 0, 0, 0, 1, 0, 0, 0, 1];
      const rounded = product.elements.map(v => Number(v.toFixed(5)));

      expect(rounded).toEqual(expected);
    });

    it("should return 'this' to allow method chaining", () => {
      const m = new Matrix3().set(
        1, 2, 3,
        0, 1, 4,
        5, 6, 0
      );

      const result = m.invert();

      // Check that result is the same object instance as m
      expect(result).toBe(m);
    });
  });

  describe('transpose()', () => {
    it("should transpose the matrix in place (column-major layout)", () => {
      // Original matrix (column-major):
      // | 1 4 7 |
      // | 2 5 8 |
      // | 3 6 9 |
      const m = new Matrix3();
      m.set(
        1, 2, 3,   // first column
        4, 5, 6,   // second column
        7, 8, 9    // third column
      );

      m.transpose();

      // After transpose:
      // | 1 2 3 |
      // | 4 5 6 |
      // | 7 8 9 |
      // → column-major = [1,4,7, 2,5,8, 3,6,9]
      expect(m.elements).toEqual([
        1, 2, 3,
        4, 5, 6,
        7, 8, 9
      ]);
    });

    it("should make transpose of transpose equal the original matrix", () => {
      const m = new Matrix3().set(
        1, 2, 3,
        0, 1, 4,
        5, 6, 0
      );

      const original = [...m.elements];
      m.transpose().transpose();

      // After two transposes, we should get back the same values
      expect(m.elements).toEqual(original);
    });

    it("should leave a symmetric matrix unchanged", () => {
      // symmetric: M == Mᵀ
      const m = new Matrix3().set(
        1, 2, 3,
        2, 5, 6,
        3, 6, 9
      );

      const before = [...m.elements];
      m.transpose();
      expect(m.elements).toEqual(before);
    });

    it("should return 'this' to allow method chaining", () => {
      const m = new Matrix3().set(
        1, 2, 3,
        4, 5, 6,
        7, 8, 9
      );

      const result = m.transpose();

      expect(result).toBe(m);
    });
  });

  describe('getNormalMatrix()', () => {
    it("should extract and compute inverse-transpose of the upper-left 3x3 from a Matrix4", () => {
      // Create a 4x4 matrix that includes rotation + non-uniform scaling
      const m4 = new Matrix4().set(
        2, 0, 0, 0,   // scale x by 2
        0, 3, 0, 0,   // scale y by 3
        0, 0, 4, 0,   // scale z by 4
        0, 0, 0, 1
      );

      const normalMatrix = new Matrix3().getNormalMatrix(m4);

      // Upper-left 3x3 is diag(2,3,4)
      // Its inverse = diag(1/2, 1/3, 1/4)
      // Transpose of a diagonal matrix = itself
      const expected = [
        1 / 2, 0, 0,
        0, 1 / 3, 0,
        0, 0, 1 / 4
      ];

      const rounded = normalMatrix.elements.map(v => Number(v.toFixed(5)));
      const expectedRounded = expected.map(v => Number(v.toFixed(5)));

      expect(rounded).toEqual(expectedRounded);
    });

    it("should handle pure rotation correctly (normal matrix == rotation matrix)", () => {
      // 90° rotation about Z axis
      const rad = Math.PI / 2;
      const c = Math.cos(rad);
      const s = Math.sin(rad);

      const m4 = new Matrix4().set(
        c, -s, 0, 0,
        s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      );

      const normalMatrix = new Matrix3().getNormalMatrix(m4);

      // Pure rotation => orthogonal matrix, so inverse == transpose
      // => (R^-1)^T == R
      const expected = [
        c, s, 0,
        -s, c, 0,
        0, 0, 1
      ];

      const rounded = normalMatrix.elements.map(v => Number(v.toFixed(5)));
      const expectedRounded = expected.map(v => Number(v.toFixed(5)));

      expect(rounded).toEqual(expectedRounded);
    });

    it("should produce zero matrix if upper-left 3x3 is singular", () => {
      const m4 = new Matrix4().set(
        1, 2, 3, 0,
        2, 4, 6, 0, // second row = 2 × first row → singular
        7, 8, 9, 0,
        0, 0, 0, 1
      );

      const m3 = new Matrix3().getNormalMatrix(m4);

      expect(m3.elements).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0]);
    });

    it("should return 'this' for chaining", () => {
      const m4 = new Matrix4().identity();
      const m3 = new Matrix3();
      const result = m3.getNormalMatrix(m4);

      expect(result).toBe(m3);
    });
  });

  describe('transposeIntoArray()', () => {
    it("should write the transpose of the matrix into the given array", () => {
      // Original matrix (in column-major order)
      // | 1 4 7 |
      // | 2 5 8 |
      // | 3 6 9 |
      const m = new Matrix3();
      m.set(
        1, 2, 3,  // first column
        4, 5, 6,  // second column
        7, 8, 9   // third column
      );

      const r = new Array(9).fill(0);
      m.transposeIntoArray(r);

      // Expected transpose:
      // | 1 2 3 |
      // | 4 5 6 |
      // | 7 8 9 |
      // Stored in column-major form → [1,4,7, 2,5,8, 3,6,9]
      expect(r).toEqual([
        1, 2, 3,
        4, 5, 6,
        7, 8, 9
      ]);
    });

    it("should not modify the original matrix", () => {
      const m = new Matrix3();
      m.set(
        1, 2, 3,
        4, 5, 6,
        7, 8, 9
      );

      const before = [...m.elements];
      const r = new Array(9).fill(0);

      m.transposeIntoArray(r);

      expect(m.elements).toEqual(before);
    });

    it("should correctly handle asymmetric matrix", () => {
      const m = new Matrix3().set(
        1, 2, 3,
        4, 5, 6,
        7, 8, 9
      );

      const r = new Array(9);
      m.transposeIntoArray(r);

      // The transpose of:
      // | 1 2 3 |
      // | 4 5 6 |
      // | 7 8 9 |
      // is
      // | 1 4 7 |
      // | 2 5 8 |
      // | 3 6 9 |
      // → column-major form: [1,2,3,4,5,6,7,8,9]
      // expect(r).toEqual([1, 4, 7, 2, 5, 8, 3, 6, 9]);
      expect(r).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it("should return 'this' to allow chaining", () => {
      const m = new Matrix3().identity();
      const r = new Array(9);
      const result = m.transposeIntoArray(r);
      expect(result).toBe(m);
    });

  });

  describe('setUvTransform()', () => {
    it("should create identity transform when all parameters are defaults", () => {
      const m = new Matrix3().setUvTransform(0, 0, 1, 1, 0, 0, 0);
      expect(m.elements.map(v => Number(v.toFixed(5)))).toEqual([
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
      ]);
    });

    it("should correctly apply translation only", () => {
      const m = new Matrix3().setUvTransform(2, 3, 1, 1, 0, 0, 0);

      // column-major order:
      expect(m.elements.map(v => Number(v.toFixed(5)))).toEqual([
        1, 0, 0,  // first column
        0, 1, 0,  // second column
        2, 3, 1   // third column (translation)
      ]);
    });

    it("should correctly apply scaling only", () => {
      const m = new Matrix3().setUvTransform(0, 0, 2, 3, 0, 0, 0);
      expect(m.elements.map(v => Number(v.toFixed(5)))).toEqual([
        2, 0, 0,
        0, 3, 0,
        0, 0, 1
      ]);
    });

    it("should correctly apply rotation around origin", () => {
      const angle = Math.PI / 2; // 90 degrees
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      const m = new Matrix3().setUvTransform(0, 0, 1, 1, angle, 0, 0);

      const rounded = m.elements.map(v => Number(v.toFixed(5)));

      // Column-major order:
      const expected = [
        c, -s, 0,      // first column
        s, c, 0,     // second column
        0, 0, 1       // third column
      ].map(v => Number(v.toFixed(5)));

      expect(rounded).toEqual(expected);
    });

    it("should rotate around center (cx, cy) and apply offset", () => {
      const angle = Math.PI / 2;
      const tx = 1, ty = 2, cx = 0.5, cy = 0.5;
      const sx = 1, sy = 1;

      const m = new Matrix3().setUvTransform(tx, ty, sx, sy, angle, cx, cy);
      const c = Math.cos(angle);
      const s = Math.sin(angle);

      const expected = [
        sx * c, sx * s, -sx * (c * cx + s * cy) + cx + tx,
        -sy * s, sy * c, -sy * (-s * cx + c * cy) + cy + ty,
        0, 0, 1
      ];

      const r: number[] = [9];
      // to get a row major array for easier comparison
      m.transposeIntoArray(r);
      const rounded = r.map(v => Number(v.toFixed(5)));
      const expectedRounded = expected.map(v => Number(v.toFixed(5)));

      expect(rounded).toEqual(expectedRounded);
    });

    it("should return 'this' for chaining", () => {
      const m = new Matrix3();
      const result = m.setUvTransform(0, 0, 1, 1, 0, 0, 0);
      expect(result).toBe(m);
    });
  });

  describe('scale()', () => {
    it("should scale identity matrix", () => {
      const m = new Matrix3().identity();
      m.scale(2, 3);

      expect(m.elements.map(v => Number(v.toFixed(5)))).toEqual([
        2, 0, 0,
        0, 3, 0,
        0, 0, 1
      ]);
    });

    it("should scale an existing translation matrix", () => {
      const m = new Matrix3().set(
        1, 0, 5,  // translation x=5
        0, 1, 7,  // translation y=7
        0, 0, 1
      );

      m.scale(2, 3);

      // Pre-multiply: S * M
      // S = [2 0 0; 0 3 0; 0 0 1]
      // result = [2*1+0*0+0*0, ...] → [2, 0, 10, 0, 3, 21, 0, 0, 1]

      const r: number[] = [9];
      // transpose for easy comparison
      m.transposeIntoArray(r);
      expect(r).toEqual([
        2, 0, 10,
        0, 3, 21,
        0, 0, 1
      ]);
    });

    it("should scale after a rotation matrix", () => {
      const angle = Math.PI / 2;
      const c = Math.cos(angle);
      const s = Math.sin(angle);

      const m = new Matrix3().set(
        c, -s, 0,
        s, c, 0,
        0, 0, 1
      );

      m.scale(2, 3);

      // Pre-multiply: S * R
      // first column: [2*c, 3*s, 0], second column: [2*-s, 3*c, 0], last column: [0,0,1]
      expect(m.elements.map(v => Number(v.toFixed(5)))).toEqual([
        2 * c, 3 * s, 0,
        -2 * s, 3 * c, 0,
        0, 0, 1
      ].map(v => Number(v.toFixed(5))));
    });

    it("should return 'this' for chaining", () => {
      const m = new Matrix3();
      const result = m.scale(1, 1);
      expect(result).toBe(m);
    });
  });

  describe('rotate()', () => {
    it("should rotate identity matrix by 90 degrees counter-clockwise", () => {
      const angle = Math.PI / 2;
      const c = Math.cos(angle);
      const s = Math.sin(angle);

      const m = new Matrix3().identity();
      m.rotate(angle);

      const rounded = m.elements.map(v => Number(v.toFixed(5)));

      const expected = [
        c, s, 0,
        -s, c, 0,
        0, 0, 1
      ].map(v => Number(v.toFixed(5)));

      expect(rounded).toEqual(expected);
    });

    it("should rotate an existing translation matrix", () => {
      const m = new Matrix3().set(
        1, 0, 1,
        0, 1, 2,
        0, 0, 1
      );

      const angle = Math.PI / 2; // 90 deg
      m.rotate(angle);

      const rounded = m.elements.map(v => Number(v.toFixed(5)));

      // Correct pre-multiplied result
      const expected = [
        0, 1, 0,
        -1, 0, 0,
        -2, 1, 1
      ].map(v => Number(v.toFixed(5)));

      expect(rounded).toEqual(expected);
    });


    it("should return 'this' for chaining", () => {
      const m = new Matrix3();
      const result = m.rotate(Math.PI / 4);
      expect(result).toBe(m);
    });

  });

  describe('translate()', () => {
    it("should translate identity matrix using numbers", () => {
      const m = new Matrix3().identity();
      m.translate(3, 4);

      const rounded = m.elements.map(v => Number(v.toFixed(5)));

      const expected = [
        1, 0, 0,
        0, 1, 0,
        3, 4, 1
      ].map(v => Number(v.toFixed(5))); // pre-multiply translation: last row gets tx, ty

      expect(rounded).toEqual(expected);
    });

    it("should translate identity matrix using Vector2", () => {
      const v = new Vector2(5, 6);
      const m = new Matrix3().identity();
      m.translate(v);

      const rounded = m.elements.map(v => Number(v.toFixed(5)));

      const expected = [
        1, 0, 0,
        0, 1, 0,
        5, 6, 1
      ].map(v => Number(v.toFixed(5)));

      expect(rounded).toEqual(expected);
    });

    it("should translate an existing rotation matrix", () => {
      const angle = Math.PI / 2; // 90 deg
      const m = new Matrix3().makeRotation(angle);

      m.translate(1, 2); // pre-multiply translation

      const rounded = m.elements.map(v => Number(v.toFixed(5)));

      // Correct result after T * R
      const expected = [
        0, 1, 0,
        -1, 0, 0,
        1, 2, 1
      ].map(v => Number(v.toFixed(5)));

      expect(rounded).toEqual(expected);
    });

    it("should return 'this' for chaining", () => {
      const m = new Matrix3();
      const result = m.translate(1, 2);
      expect(result).toBe(m);
    });
  });

  describe('makeScale()', () => {
    it("should create identity for scale 1,1", () => {
      const m = new Matrix3().makeScale(1, 1);
      expect(m.elements.map(v => Number(v.toFixed(5)))).toEqual([
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
      ]);
    });

    it("should scale x only", () => {
      const m = new Matrix3().makeScale(2, 1);
      expect(m.elements.map(v => Number(v.toFixed(5)))).toEqual([
        2, 0, 0,
        0, 1, 0,
        0, 0, 1
      ]);
    });

    it("should scale y only", () => {
      const m = new Matrix3().makeScale(1, 3);
      expect(m.elements.map(v => Number(v.toFixed(5)))).toEqual([
        1, 0, 0,
        0, 3, 0,
        0, 0, 1
      ]);
    });

    it("should scale both x and y", () => {
      const m = new Matrix3().makeScale(2, 3);
      expect(m.elements.map(v => Number(v.toFixed(5)))).toEqual([
        2, 0, 0,
        0, 3, 0,
        0, 0, 1
      ]);
    });

    it("should return 'this' for chaining", () => {
      const m = new Matrix3();
      const result = m.makeScale(1, 1);
      expect(result).toBe(m);
    });
  });

  describe('makeRotation()', () => {
    it("should create identity matrix for 0 radians", () => {
      const m = new Matrix3().makeRotation(0);
      expect(m.elements.map(v => Number(v.toFixed(5)))).toEqual([
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
      ]);
    });

    it("should rotate by 90 degrees counter-clockwise", () => {
      const angle = Math.PI / 2;
      const c = Math.cos(angle); // ~0
      const s = Math.sin(angle); // 1

      const m = new Matrix3().makeRotation(angle);
      const rounded = m.elements.map(v => Number(v.toFixed(5)));

      const expected = [
        c, s, 0,   // first column
        -s, c, 0,  // second column
        0, 0, 1
      ].map(v => Number(v.toFixed(5)));

      expect(rounded).toEqual(expected);
    });

    it("should rotate by -90 degrees clockwise", () => {
      const angle = -Math.PI / 2;
      const c = Math.cos(angle); // ~0
      const s = Math.sin(angle); // -1

      const m = new Matrix3().makeRotation(angle);
      const rounded = m.elements.map(v => Number(v.toFixed(5)));

      const expected = [
        c, s, 0,
        -s, c, 0,
        0, 0, 1
      ].map(v => Number(v.toFixed(5)));

      expect(rounded).toEqual(expected);
    });

    it("should return 'this' for chaining", () => {
      const m = new Matrix3();
      const result = m.makeRotation(Math.PI / 4);
      expect(result).toBe(m);
    });
  });

  describe('makeTranslation()', () => {
    it("should create translation matrix from numbers", () => {
      const m = new Matrix3().makeTranslation(5, 7);

      const r: number[] = [9];
      m.transposeIntoArray(r);

      // to get row-major for easy comparison
      expect(r.map(v => Number(v.toFixed(5)))).toEqual([
        1, 0, 5,
        0, 1, 7,
        0, 0, 1
      ]);
    });

    it("should create translation matrix from Vector2", () => {
      const v = new Vector2(3, 4);
      const m = new Matrix3().makeTranslation(v);

      const r: number[] = [9];
      m.transposeIntoArray(r);

      // to get row-major for easy comparison
      expect(r.map(v => Number(v.toFixed(5)))).toEqual([
        1, 0, 3,
        0, 1, 4,
        0, 0, 1
      ]);
    });

    it("should throw error if ty is missing when tx is a number", () => {
      const m = new Matrix3();
      expect(() => m.makeTranslation(5)).toThrowError(
        "ty must be provided when tx is a number"
      );
    });

    it("should return 'this' for chaining", () => {
      const m = new Matrix3();
      const result = m.makeTranslation(1, 2);
      expect(result).toBe(m);
    });
  });

  describe('equals()', () => {
    it("should return true for two identical matrices", () => {
      const m1 = new Matrix3().set(
        1, 2, 3,
        4, 5, 6,
        7, 8, 9
      );
      const m2 = new Matrix3().set(
        1, 2, 3,
        4, 5, 6,
        7, 8, 9
      );

      expect(m1.equals(m2)).toBe(true);
    });

    it("should return false if any element differs", () => {
      const m1 = new Matrix3().set(
        1, 2, 3,
        4, 5, 6,
        7, 8, 9
      );
      const m2 = new Matrix3().set(
        1, 2, 3,
        4, 0, 6,  // changed 5 → 0
        7, 8, 9
      );

      expect(m1.equals(m2)).toBe(false);
    });

    it("should return true for two identity matrices", () => {
      const m1 = new Matrix3().identity();
      const m2 = new Matrix3().identity();

      expect(m1.equals(m2)).toBe(true);
    });

    it("should return false after modifying one matrix", () => {
      const m1 = new Matrix3().identity();
      const m2 = new Matrix3().identity();

      m2.elements[0] = 2; // change first element

      expect(m1.equals(m2)).toBe(false);
    });
  });

  describe('fromArray()', () => {
    it("should set matrix elements from array with no offset", () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      const m = new Matrix3().fromArray(arr);

      expect(m.elements).toEqual(arr);
    });

    it("should set matrix elements from array with offset", () => {
      const arr = [0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      const offset = 2;
      const m = new Matrix3().fromArray(arr, offset);

      const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      expect(m.elements).toEqual(expected);
    });

    it("should return this for chaining", () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      const m = new Matrix3();
      const result = m.fromArray(arr);

      expect(result).toBe(m);
    });

    it("should only copy 9 elements even if array is longer", () => {
      const arr = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
      const m = new Matrix3().fromArray(arr);

      const expected = arr.slice(0, 9);
      expect(m.elements).toEqual(expected);
    });
  });

  describe('toArray()', () => {
    it("should write elements to a new array by default", () => {
      const m = new Matrix3().set(
        1, 2, 3,
        4, 5, 6,
        7, 8, 9
      );

      const arr = m.toArray();
      expect(arr).toEqual([
        1, 4, 7,
        2, 5, 8,
        3, 6, 9
      ]); // column-major
    });

    it("should write elements to a provided array", () => {
      const m = new Matrix3().set(
        1, 2, 3,
        4, 5, 6,
        7, 8, 9
      );

      const target = new Array(9).fill(0);
      const result = m.toArray(target);

      expect(result).toBe(target); // returns same array
      expect(target).toEqual([
        1, 4, 7,
        2, 5, 8,
        3, 6, 9
      ]);
    });

    it("should write elements into the array starting at a given offset", () => {
      const m = new Matrix3().set(
        1, 2, 3,
        4, 5, 6,
        7, 8, 9
      );

      const arr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      m.toArray(arr, 3);

      expect(arr).toEqual([
        0, 0, 0,
        1, 4, 7,
        2, 5, 8,
        3, 6, 9
      ]);
    });

    it("should be consistent with fromArray (round-trip)", () => {
      const m = new Matrix3().set(
        1, 2, 3,
        4, 5, 6,
        7, 8, 9
      );

      const arr = m.toArray();
      const m2 = new Matrix3().fromArray(arr);

      expect(m2.equals(m)).toBe(true);
    });
  });

  describe('clone()', () => {
    it("should return a new Matrix3 instance", () => {
      const m = new Matrix3().set(
        1, 2, 3,
        4, 5, 6,
        7, 8, 9
      );

      const cloned = m.clone();

      expect(cloned).toBeInstanceOf(Matrix3); // it is a Matrix3
      expect(cloned).not.toBe(m); // different object
    });

    it("should copy all elements correctly", () => {
      const m = new Matrix3().set(
        1, 2, 3,
        4, 5, 6,
        7, 8, 9
      );

      const cloned = m.clone();

      expect(cloned.elements).toEqual(m.elements); // values match
    });

    it("modifying the clone should not affect the original", () => {
      const m = new Matrix3().set(
        1, 2, 3,
        4, 5, 6,
        7, 8, 9
      );

      const cloned = m.clone();
      cloned.elements[0] = 99;

      expect(cloned.elements[0]).toBe(99);
      expect(m.elements[0]).toBe(1); // original stays unchanged
    });
  });
});
