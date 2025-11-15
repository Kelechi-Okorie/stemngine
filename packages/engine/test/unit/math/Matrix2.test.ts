import { describe, it, expect } from 'vitest';
import { Matrix2 } from '../../../src/math/Matrix2.js';

describe('Matrix2', () => {
  describe('constructor()', () => {
    it('constructs an identity matrix when no arguments are provided', () => {
      const m = new Matrix2();

      expect(m.isMatrix2).toBe(true);
      expect(m.elements).toEqual([
        1, 0,
        0, 1,
      ]);
    });

    it('sets custom matrix elements correctly (row-major input -> column-major storage)', () => {
      const m = new Matrix2(1, 2, 3, 4)

      // row-major (1, 2)
      //           (3, 4)
      // should become column-major [1, 3, 2, 4]
      expect(m.elements).toEqual([
        1, 3,
        2, 4,
      ]);
    });

    it('creates a unique elements array per instance', () => {
      const m1 = new Matrix2();
      const m2 = new Matrix2();

      expect(m1.elements).not.toBe(m2.elements);
    });

    it('calls set() inside the constructor', () => {
      const m = new Matrix2(2, 4, 6, 8);

      // Confirm the constructor's set logic applied properly
      expect(m.elements).toEqual([
        2, 6,
        4, 8,
      ]);
    });

    it('returns "this" for chaining when calling set()', () => {
      const m = new Matrix2();
      const result = m.set(5, 6, 7, 8);

      // Same object reference
      expect(result).toBe(m);
    });
  });

  describe('set()', () => {
    it('sets elements in column-major order from row-major arguments', () => {
      const m = new Matrix2();
      m.set(1, 2, 3, 4);

      // According to the implementation, the storage order is column-major:
      // [n11, n21, n12, n22]
      expect(m.elements).toEqual([
        1, 3,
        2, 4,
      ]);
    });

    it('overwrites previous values correctly', () => {
      const m = new Matrix2(1, 2, 3, 4);

      m.set(5, 6, 7, 8);
      expect(m.elements).toEqual([
        5, 7,
        6, 8,
      ]);
    });

    it('returns this for chaining', () => {
      const m = new Matrix2();
      const result = m.set(9, 8, 7, 6);

      expect(result).toBe(m);
    });
  });

  describe('identity()', () => {
    it('sets the matrix to the 2x2 identity matrix', () => {
      const m = new Matrix2(5, 6, 7, 8); // start with non-identity
      m.identity();

      expect(m.elements).toEqual([
        1, 0,
        0, 1,
      ]);
    });

    it('returns this for chaining', () => {
      const m = new Matrix2();
      const result = m.identity();

      expect(result).toBe(m);
    });
  });

  describe('fromArray()', () => {
    it('sets elements from array in column-major order', () => {
      const m = new Matrix2();
      const array = [
        1, 2,
        3, 4
      ];
      m.fromArray(array);

      // column-major: [n11, n21, n12, n22]
      expect(m.elements).toEqual([1, 2, 3, 4]);
    });

    it('applies offset correctly', () => {
      const m = new Matrix2();
      const array = [
        9, 9, 9, // noise
        11, 12, 13, 14, // actual matrix data starting at offset 3
        9, 9,
      ];
      m.fromArray(array, 3);

      expect(m.elements).toEqual([11, 12, 13, 14]);
    });

    it('returns "this" for chaining', () => {
      const m = new Matrix2();
      const array = [5, 6, 7, 8];

      const result = m.fromArray(array);

      expect(result).toBe(m);
    });

    it('does not modify unrelated elements in the source array', () => {
      const m = new Matrix2();
      const array = [10, 20, 30, 40, 50, 60];
      m.fromArray(array, 1);

      // It should have read elements starting at index 1 → [20, 30, 40, 50]
      expect(m.elements).toEqual([20, 30, 40, 50]);
      // But the source array itself remains unchanged
      expect(array).toEqual([10, 20, 30, 40, 50, 60]);
    });
  });
})
