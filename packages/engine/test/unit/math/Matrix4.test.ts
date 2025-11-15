import { describe, expect, it } from 'vitest';
import { Matrix4 } from '../../../src/math/Matrix4';
import { Matrix3 } from '../../../src/math/Matrix3';
import { Vector3 } from '../../../src/math/Vector3';
import { Euler } from '../../../src/math/Euler';
import { Quaternion } from '../../../src/math/Quaternion';
import { WebGLCoordinateSystem, WebGPUCoordinateSystem } from '../../../src/constants';

describe('Matrix4', () => {
  describe('constructor()', () => {
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

  describe('set()', () => {
    it('should set elements correctly in column-major order', () => {
      const m = new Matrix4();

      m.set(
        11, 12, 13, 14,
        21, 22, 23, 24,
        31, 32, 33, 34,
        41, 42, 43, 44
      );

      // Elements stored in column-major order
      expect(Array.from(m.elements)).toEqual([
        11, 21, 31, 41,
        12, 22, 32, 42,
        13, 23, 33, 43,
        14, 24, 34, 44
      ]);
    });

    it('should overwrite previous values', () => {
      const m = new Matrix4();

      m.set(
        9, 8, 7, 6,
        5, 4, 3, 2,
        1, 0, -1, -2,
        -3, -4, -5, -6
      );

      m.set(
        11, 12, 13, 14,
        21, 22, 23, 24,
        31, 32, 33, 34,
        41, 42, 43, 44
      );

      expect(Array.from(m.elements)).toEqual([
        11, 21, 31, 41,
        12, 22, 32, 42,
        13, 23, 33, 43,
        14, 24, 34, 44
      ]);
    });

    it('should return this for chaining', () => {
      const m = new Matrix4();
      const result = m.set(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      );

      expect(result).toBe(m);
    });
  });

  describe('identity()', () => {
    it('should set the matrix to identity', () => {
      const m = new Matrix4()

      // Fill it with non-identity values first
      m.set(
        2, 3, 4, 5,
        6, 7, 8, 9,
        10, 11, 12, 13,
        14, 15, 16, 17
      )

      // Call identity
      const result = m.identity()

      // Expect identity matrix
      const expected = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ]

      // Check values
      expect(Array.from(m.elements)).toEqual(expected)

      // Check it returns itself for chaining
      expect(result).toBe(m)
    })
  });

  describe('clone()', () => {
    it('should return a new Matrix4 instance with identical elements', () => {
      const m = new Matrix4();

      m.fromArray([
        11, 21, 31, 41,
        12, 22, 32, 42,
        13, 23, 33, 43,
        14, 24, 34, 44
      ]);

      const cloned = m.clone();

      expect(Array.from(cloned.elements)).toEqual(Array.from(m.elements));
    });

    it('should not return the same instance', () => {
      const m = new Matrix4();
      const cloned = m.clone();
      expect(cloned).not.toBe(m);
    });

    it('should create a deep copy (modifying the clone should not affect the original)', () => {
      const m = new Matrix4();

      m.fromArray([
        1, 2, 3, 4,
        5, 6, 7, 8,
        9, 10, 11, 12,
        13, 14, 15, 16
      ]);

      const cloned = m.clone();

      // modify the clone
      cloned.elements[0] = 999;

      expect(m.elements[0]).toBe(1);
      expect(cloned.elements[0]).toBe(999);
    });

    it('should clone an identity matrix correctly', () => {
      const m = new Matrix4().identity();
      const cloned = m.clone();

      expect(Array.from(cloned.elements)).toEqual([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ]);
    });
  });

  describe('copy()', () => {
    it('should copy all elements from another matrix', () => {
      const source = new Matrix4().fromArray([
        11, 21, 31, 41,
        12, 22, 32, 42,
        13, 23, 33, 43,
        14, 24, 34, 44
      ]);

      const target = new Matrix4();

      target.copy(source);

      expect(Array.from(target.elements)).toEqual(Array.from(source.elements));
    });

    it('should not be the same reference as the source', () => {
      const source = new Matrix4();
      const target = new Matrix4().copy(source);

      expect(target).not.toBe(source);
    });

    it('should overwrite existing values in the target', () => {
      const source = new Matrix4().fromArray([
        1, 2, 3, 4,
        5, 6, 7, 8,
        9, 10, 11, 12,
        13, 14, 15, 16
      ]);

      const target = new Matrix4().fromArray(new Array(16).fill(99));

      target.copy(source);

      expect(Array.from(target.elements)).toEqual([
        1, 2, 3, 4,
        5, 6, 7, 8,
        9, 10, 11, 12,
        13, 14, 15, 16
      ]);
    });

    it('should create a deep copy (changing source afterwards should not affect target)', () => {
      const source = new Matrix4().fromArray([
        1, 2, 3, 4,
        5, 6, 7, 8,
        9, 10, 11, 12,
        13, 14, 15, 16
      ]);

      const target = new Matrix4();
      target.copy(source);

      // modify the source
      source.elements[0] = 999;

      expect(target.elements[0]).toBe(1);
      expect(source.elements[0]).toBe(999);
    });

    it('should return this for chaining', () => {
      const m1 = new Matrix4();
      const m2 = new Matrix4();
      const result = m1.copy(m2);
      expect(result).toBe(m1);
    });
  });

  describe('copyPosition()', () => {
    it('should copy only the translation components (indices 12, 13, 14)', () => {
      const source = new Matrix4().fromArray([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        10, 20, 30, 1 // translation in last row (column-major layout)
      ]);

      const target = new Matrix4().fromArray([
        9, 8, 7, 6,
        5, 4, 3, 2,
        1, 0, -1, -2,
        -3, -4, -5, -6
      ]);

      target.copyPosition(source);

      // Indices 12, 13, 14 hold translation (x, y, z)
      const te = Array.from(target.elements);

      expect(te[12]).toBe(10);
      expect(te[13]).toBe(20);
      expect(te[14]).toBe(30);

      // All other elements should remain unchanged
      expect(te[0]).toBe(9);
      expect(te[1]).toBe(8);
      expect(te[2]).toBe(7);
      expect(te[3]).toBe(6);
      expect(te[15]).toBe(-6);
    });

    it('should not modify the w-component (index 15)', () => {
      const source = new Matrix4().fromArray([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        100, 200, 300, 400
      ]);

      const target = new Matrix4().identity();

      target.copyPosition(source);

      expect(target.elements[15]).toBe(1); // should remain unchanged
    });

    it('should copy zero translation correctly', () => {
      const source = new Matrix4().identity();
      const target = new Matrix4().fromArray(new Array(16).fill(9));

      target.copyPosition(source);

      expect(target.elements[12]).toBe(0);
      expect(target.elements[13]).toBe(0);
      expect(target.elements[14]).toBe(0);
    });

    it('should return this for chaining', () => {
      const m1 = new Matrix4();
      const m2 = new Matrix4();
      const result = m1.copyPosition(m2);
      expect(result).toBe(m1);
    });
  });

  describe('setFromMatrix3()', () => {
    it('should set the upper 3x3 part of the matrix from a Matrix3', () => {
      const m3 = new Matrix3().set(
        1, 2, 3,
        4, 5, 6,
        7, 8, 9
      );

      const m4 = new Matrix4();
      m4.setFromMatrix3(m3);

      expect(Array.from(m4.elements)).toEqual([
        1, 4, 7, 0,
        2, 5, 8, 0,
        3, 6, 9, 0,
        0, 0, 0, 1
      ]);
    });

    it('should overwrite any existing values in the matrix', () => {
      const m3 = new Matrix3().set(
        9, 8, 7,
        6, 5, 4,
        3, 2, 1
      );

      const m4 = new Matrix4().fromArray(new Array(16).fill(99));
      m4.setFromMatrix3(m3);

      expect(Array.from(m4.elements)).toEqual([
        9, 6, 3, 0,
        8, 5, 2, 0,
        7, 4, 1, 0,
        0, 0, 0, 1
      ]);
    });

    it('should return this for chaining', () => {
      const m3 = new Matrix3();
      const m4 = new Matrix4();
      const result = m4.setFromMatrix3(m3);
      expect(result).toBe(m4);
    });

    it('should correctly handle identity Matrix3', () => {
      const m3 = new Matrix3().set(
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
      );

      const m4 = new Matrix4();
      m4.setFromMatrix3(m3);

      expect(Array.from(m4.elements)).toEqual([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ]);
    });
  });

  describe('extractBasis()', () => {
    it('should extract the X, Y, Z basis vectors from the matrix columns', () => {
      const m = new Matrix4().fromArray([
        1, 2, 3, 0,   // column 0
        4, 5, 6, 0,   // column 1
        7, 8, 9, 0,   // column 2
        10, 11, 12, 1 // column 3
      ]);

      const xAxis = new Vector3();
      const yAxis = new Vector3();
      const zAxis = new Vector3();

      m.extractBasis(xAxis, yAxis, zAxis);

      expect([xAxis.x, xAxis.y, xAxis.z]).toEqual([1, 2, 3]);
      expect([yAxis.x, yAxis.y, yAxis.z]).toEqual([4, 5, 6]);
      expect([zAxis.x, zAxis.y, zAxis.z]).toEqual([7, 8, 9]);
    });

    it('should overwrite existing values in the provided vectors', () => {
      const m = new Matrix4().fromArray([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ]);

      const xAxis = new Vector3(9, 9, 9);
      const yAxis = new Vector3(8, 8, 8);
      const zAxis = new Vector3(7, 7, 7);

      m.extractBasis(xAxis, yAxis, zAxis);

      expect([xAxis.x, xAxis.y, xAxis.z]).toEqual([1, 0, 0]);
      expect([yAxis.x, yAxis.y, yAxis.z]).toEqual([0, 1, 0]);
      expect([zAxis.x, zAxis.y, zAxis.z]).toEqual([0, 0, 1]);
    });

    it('should return this for chaining', () => {
      const m = new Matrix4();
      const x = new Vector3();
      const y = new Vector3();
      const z = new Vector3();

      const result = m.extractBasis(x, y, z);

      expect(result).toBe(m);
    });
  });

  describe('makeBasis()', () => {
    it('should set the matrix columns from the given basis vectors', () => {
      const xAxis = new Vector3(1, 2, 3);
      const yAxis = new Vector3(4, 5, 6);
      const zAxis = new Vector3(7, 8, 9);

      const m = new Matrix4();
      m.makeBasis(xAxis, yAxis, zAxis);

      expect(Array.from(m.elements)).toEqual([
        1, 2, 3, 0,
        4, 5, 6, 0,
        7, 8, 9, 0,
        0, 0, 0, 1
      ]);
    });

    it('should overwrite existing matrix values', () => {
      const xAxis = new Vector3(1, 0, 0);
      const yAxis = new Vector3(0, 1, 0);
      const zAxis = new Vector3(0, 0, 1);

      const m = new Matrix4().fromArray(new Array(16).fill(99));
      m.makeBasis(xAxis, yAxis, zAxis);

      expect(Array.from(m.elements)).toEqual([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ]);
    });

    it('should correctly handle zero vectors', () => {
      const xAxis = new Vector3(0, 0, 0);
      const yAxis = new Vector3(0, 0, 0);
      const zAxis = new Vector3(0, 0, 0);

      const m = new Matrix4();
      m.makeBasis(xAxis, yAxis, zAxis);

      expect(Array.from(m.elements)).toEqual([
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 1
      ]);
    });

    it('should return this for chaining', () => {
      const xAxis = new Vector3();
      const yAxis = new Vector3();
      const zAxis = new Vector3();

      const m = new Matrix4();
      const result = m.makeBasis(xAxis, yAxis, zAxis);

      expect(result).toBe(m);
    });
  });

  describe('makeRotation()', () => {
    it('should extract rotation from a pure rotation matrix', () => {
      const angle = Math.PI / 4; // 45 degrees
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      // rotation around Z axis
      const rotation = new Matrix4().fromArray([
        cos, sin, 0, 0,
        -sin, cos, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ]);

      const m = new Matrix4();
      m.extractRotation(rotation);

      const elements = Array.from(m.elements);

      expect(elements.slice(0, 12)).toEqual([
        cos, sin, 0, 0,
        -sin, cos, 0, 0,
        0, 0, 1, 0
      ]);

      expect(elements[12]).toBe(0);
      expect(elements[13]).toBe(0);
      expect(elements[14]).toBe(0);
      expect(elements[15]).toBe(1);
    });

    it('should remove scale from the source matrix', () => {
      const scale = 2;
      const rotation = new Matrix4().fromArray([
        scale, 0, 0, 0,
        0, scale, 0, 0,
        0, 0, scale, 0,
        0, 0, 0, 1
      ]);

      const m = new Matrix4();
      m.extractRotation(rotation);

      const elements = Array.from(m.elements);

      // After removing scale, rotation axes should be unit length
      expect(elements[0]).toBeCloseTo(1);
      expect(elements[5]).toBeCloseTo(1);
      expect(elements[10]).toBeCloseTo(1);
    });

    it('should reset translation components to zero', () => {
      const mSrc = new Matrix4().fromArray([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        10, 20, 30, 1
      ]);

      const m = new Matrix4();
      m.extractRotation(mSrc);

      expect(m.elements[12]).toBe(0);
      expect(m.elements[13]).toBe(0);
      expect(m.elements[14]).toBe(0);
    });

    it('should return this for chaining', () => {
      const mSrc = new Matrix4();
      const m = new Matrix4();
      const result = m.extractRotation(mSrc);
      expect(result).toBe(m);
    });
  });

  describe('makeRotationFromEuler()', () => {
    it('should create a rotation matrix from Euler angles in XYZ order', () => {
      const euler = new Euler(Math.PI / 2, 0, 0, 'XYZ'); // 90 degrees rotation around X
      const m = new Matrix4().makeRotationFromEuler(euler);

      const elements = Array.from(m.elements);

      // Rotation around X by 90 degrees
      expect(elements[0]).toBeCloseTo(1);
      expect(elements[5]).toBeCloseTo(0);
      expect(elements[6]).toBeCloseTo(1);
      expect(elements[9]).toBeCloseTo(-1);
      expect(elements[10]).toBeCloseTo(0);

      // Bottom row and last column should be identity
      expect(elements[3]).toBe(0);
      expect(elements[7]).toBe(0);
      expect(elements[11]).toBe(0);
      expect(elements[12]).toBe(0);
      expect(elements[13]).toBe(0);
      expect(elements[14]).toBe(0);
      expect(elements[15]).toBe(1);
    });

    it('should handle zero Euler angles', () => {
      const euler = new Euler(0, 0, 0, 'XYZ');
      const m = new Matrix4().makeRotationFromEuler(euler);

      const expected = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ];

      // Compare each element using toBeCloseTo
      m.elements.forEach((val, i) => {
        expect(val).toBeCloseTo(expected[i]);
      });
    });

    it('should create a rotation matrix for YXZ order', () => {
      const x = Math.PI / 4;
      const y = Math.PI / 4;
      const z = 0;
      const euler = new Euler(x, y, z, 'YXZ');

      const m = new Matrix4().makeRotationFromEuler(euler);

      // Use descriptive variable names
      const cx = Math.cos(x), sx = Math.sin(x);
      const cy = Math.cos(y), sy = Math.sin(y);
      const cz = Math.cos(z), sz = Math.sin(z);

      // Based on the formula in makeRotationFromEuler for 'YXZ'
      const cycz = cy * cz;
      const cysz = cy * sz;
      const sycz = sy * cz;
      const sysz = sy * sz;

      expect(m.elements[0]).toBeCloseTo(cycz + sysz * sx);
      expect(m.elements[4]).toBeCloseTo(sycz * sx - cysz);
      expect(m.elements[8]).toBeCloseTo(cx * sy);

      expect(m.elements[1]).toBeCloseTo(cx * sz);
      expect(m.elements[5]).toBeCloseTo(cx * cz);
      expect(m.elements[9]).toBeCloseTo(-sx);

      expect(m.elements[2]).toBeCloseTo(cysz * sx - sycz);
      expect(m.elements[6]).toBeCloseTo(sysz + cycz * sx);
      expect(m.elements[10]).toBeCloseTo(cx * cy);
    });

    it('should return this for chaining', () => {
      const euler = new Euler(0, 0, 0, 'XYZ');
      const m = new Matrix4();
      const result = m.makeRotationFromEuler(euler);
      expect(result).toBe(m);
    });
  });

  describe('makeRotationFromQuaternion()', () => {
    it('should produce the identity matrix for the identity quaternion', () => {
      const q = new Quaternion(0, 0, 0, 1);
      const m = new Matrix4().makeRotationFromQuaternion(q);

      const expected = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ];

      m.elements.forEach((val, i) => {
        expect(val).toBeCloseTo(expected[i]);
      });
    });

    it('should produce a valid rotation matrix for a 90° rotation about X axis', () => {
      const angle = Math.PI / 2;
      const q = new Quaternion(Math.sin(angle / 2), 0, 0, Math.cos(angle / 2)); // 90° about X

      const m = new Matrix4().makeRotationFromQuaternion(q);

      // Expected rotation matrix around X-axis
      const expected = [
        1, 0, 0, 0,
        0, 0, 1, 0,
        0, -1, 0, 0,
        0, 0, 0, 1
      ];

      m.elements.forEach((val, i) => {
        expect(val).toBeCloseTo(expected[i]);
      });
    });

    it('should produce a valid rotation matrix for a 90° rotation about Y axis', () => {
      const angle = Math.PI / 2;
      const q = new Quaternion(0, Math.sin(angle / 2), 0, Math.cos(angle / 2)); // 90° about Y

      const m = new Matrix4().makeRotationFromQuaternion(q);

      // Expected rotation matrix around Y-axis
      const expected = [
        0, 0, -1, 0,
        0, 1, 0, 0,
        1, 0, 0, 0,
        0, 0, 0, 1
      ];

      m.elements.forEach((val, i) => {
        expect(val).toBeCloseTo(expected[i]);
      });
    });

    it('should produce a valid rotation matrix for a 90° rotation about Z axis', () => {
      const angle = Math.PI / 2;
      const q = new Quaternion(0, 0, Math.sin(angle / 2), Math.cos(angle / 2)); // 90° about Z

      const m = new Matrix4().makeRotationFromQuaternion(q);

      // Expected rotation matrix around Z-axis
      const expected = [
        0, 1, 0, 0,
        -1, 0, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ];

      m.elements.forEach((val, i) => {
        expect(val).toBeCloseTo(expected[i]);
      });
    });

    it('should not apply translation or scaling', () => {
      const q = new Quaternion(0, 0, 0, 1);
      const m = new Matrix4().makeRotationFromQuaternion(q);

      // Ensure no translation
      expect(m.elements[12]).toBe(0);
      expect(m.elements[13]).toBe(0);
      expect(m.elements[14]).toBe(0);

      // Ensure uniform scaling (1)
      expect(m.elements[0]).toBeCloseTo(1);
      expect(m.elements[5]).toBeCloseTo(1);
      expect(m.elements[10]).toBeCloseTo(1);
    });

    it('should return "this" (same instance)', () => {
      const matrix = new Matrix4();
      const q = new Quaternion(0, 0, 0, 1); // identity rotation

      const result = matrix.makeRotationFromQuaternion(q);
      expect(result).toBe(matrix);
    });
  });

  describe('multiply', () => {
    it('should post-multiply this matrix by another', () => {
      const a = new Matrix4().fromArray([
        1, 2, 3, 4,
        5, 6, 7, 8,
        9, 10, 11, 12,
        13, 14, 15, 16
      ]);

      const b = new Matrix4().fromArray([
        17, 18, 19, 20,
        21, 22, 23, 24,
        25, 26, 27, 28,
        29, 30, 31, 32
      ]);

      const result = a.clone().multiply(b);

      // Expected column-major product (matches multiplyMatrices implementation)
      const expected = [
        538, 612, 686, 760,
        650, 740, 830, 920,
        762, 868, 974, 1080,
        874, 996, 1118, 1240
      ];

      expect(Array.from(result.elements)).toEqual(expected);
    });

    it('should multiply identity by a matrix and return that matrix', () => {
      const identity = new Matrix4();
      const b = new Matrix4().fromArray([
        1, 2, 3, 4,
        5, 6, 7, 8,
        9, 10, 11, 12,
        13, 14, 15, 16
      ]);
      const result = identity.clone().multiply(b);

      expect(Array.from(result.elements)).toEqual(Array.from(b.elements));
    });

    it('should yield a zero matrix when multiplied by a zero matrix', () => {
      const a = new Matrix4().fromArray([
        1, 2, 3, 4,
        5, 6, 7, 8,
        9, 10, 11, 12,
        13, 14, 15, 16
      ]);

      const zero = new Matrix4().set(
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
      );

      const result = a.clone().multiply(zero);

      // Expected all zeros (16 elements)
      const expected = new Array(16).fill(0);

      expect(Array.from(result.elements)).toEqual(expected);
    });

    it('should be consistent with multiplyMatrices(this, m)', () => {
      const a = new Matrix4().makeRotationY(Math.PI / 4);
      const b = new Matrix4().makeScale(2, 2, 2);

      const result1 = a.clone().multiply(b);
      const result2 = new Matrix4().multiplyMatrices(a, b);

      expect(result1.equals(result2)).toBe(true);
    });

    it('should multiply by identity and return itself unchanged', () => {
      const a = new Matrix4().fromArray([
        2, 3, 5, 7,
        11, 13, 17, 19,
        23, 29, 31, 37,
        41, 43, 47, 53
      ]);
      const identity = new Matrix4(); // default is identity
      const result = a.clone().multiply(identity);

      expect(Array.from(result.elements)).toEqual(Array.from(a.elements));
    });

  });

  describe('premultiply()', () => {
    it('should pre-multiply this matrix by another', () => {
      const a = new Matrix4().fromArray([
        1, 2, 3, 4,
        5, 6, 7, 8,
        9, 10, 11, 12,
        13, 14, 15, 16
      ]);

      const b = new Matrix4().fromArray([
        2, 0, 0, 0,
        0, 2, 0, 0,
        0, 0, 2, 0,
        0, 0, 0, 2
      ]);

      // pre-multiply means: result = b * a
      const result = a.clone().premultiply(b);

      const expected = [
        2, 4, 6, 8,
        10, 12, 14, 16,
        18, 20, 22, 24,
        26, 28, 30, 32
      ];

      expect(Array.from(result.elements)).toEqual(expected);
    });

    it('should be equivalent to multiplyMatrices(m, this)', () => {
      const m1 = new Matrix4().makeScale(2, 3, 4);
      const m2 = new Matrix4().makeTranslation(10, 20, 30);

      const result1 = m2.clone().premultiply(m1);
      const result2 = new Matrix4().multiplyMatrices(m1, m2);

      expect(Array.from(result1.elements)).toEqual(Array.from(result2.elements));
    });

    it('should yield the same matrix when pre-multiplied by the identity matrix', () => {
      const m = new Matrix4().fromArray([
        1, 2, 3, 4,
        5, 6, 7, 8,
        9, 10, 11, 12,
        13, 14, 15, 16
      ]);

      const identity = new Matrix4().identity();

      const result = m.clone().premultiply(identity);

      expect(Array.from(result.elements)).toEqual(Array.from(m.elements));
    });

    it('should yield a zero matrix when pre-multiplied by a zero matrix', () => {
      const m = new Matrix4().fromArray([
        1, 2, 3, 4,
        5, 6, 7, 8,
        9, 10, 11, 12,
        13, 14, 15, 16
      ]);

      const zero = new Matrix4().set(
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
      );

      const result = m.clone().premultiply(zero);

      expect(Array.from(result.elements)).toEqual(new Array(16).fill(0));
    });

    it('should not modify the argument matrix', () => {
      const a = new Matrix4().makeTranslation(1, 2, 3);
      const b = new Matrix4().makeScale(2, 2, 2);

      const before = Array.from(b.elements);
      a.premultiply(b);
      expect(Array.from(b.elements)).toEqual(before);
    });
  });

  describe('multiplyMatrices()', () => {
    it('should correctly multiply two known matrices', () => {
      const a = new Matrix4().fromArray([
        1, 5, 9, 13,
        2, 6, 10, 14,
        3, 7, 11, 15,
        4, 8, 12, 16
      ]);

      const b = new Matrix4().fromArray([
        17, 21, 25, 29,
        18, 22, 26, 30,
        19, 23, 27, 31,
        20, 24, 28, 32
      ]);

      const result = new Matrix4().multiplyMatrices(a, b);

      expect(result.elements).toEqual([
        250, 618, 986, 1354,
        260, 644, 1028, 1412,
        270, 670, 1070, 1470,
        280, 696, 1112, 1528
      ]);
    });

    it('should return this (chainable)', () => {
      const a = new Matrix4().identity();
      const b = new Matrix4().identity();
      const m = new Matrix4();
      const result = m.multiplyMatrices(a, b);
      expect(result).toBe(m);
    });

    it('should multiply any matrix by the identity matrix correctly', () => {
      const a = new Matrix4().fromArray([
        2, 0, 0, 0,
        0, 3, 0, 0,
        0, 0, 4, 0,
        1, 2, 3, 1
      ]);

      const identity = new Matrix4().identity();

      const left = new Matrix4().multiplyMatrices(a, identity);
      const right = new Matrix4().multiplyMatrices(identity, a);

      // Multiplying by identity (on either side) should preserve a
      expect(left.elements).toEqual(a.elements);
      expect(right.elements).toEqual(a.elements);
    });

    it('should produce different results for A*B vs B*A (non-commutative)', () => {
      const a = new Matrix4().makeRotationX(Math.PI / 4);
      const b = new Matrix4().makeRotationY(Math.PI / 4);

      const ab = new Matrix4().multiplyMatrices(a, b);
      const ba = new Matrix4().multiplyMatrices(b, a);

      expect(ab.elements).not.toEqual(ba.elements);
    });

    it('should handle multiplying by a zero matrix', () => {
      const zero = new Matrix4().fromArray(new Array(16).fill(0));
      const m = new Matrix4().makeRotationZ(Math.PI / 3);

      const result = new Matrix4().multiplyMatrices(m, zero);
      expect(result.elements.every(v => v === 0)).toBe(true);
    });
  });

  describe('multiplyScalar()', () => {
    it('should multiply all elements by the given scalar', () => {
      const m = new Matrix4();
      m.set(
        1, 2, 3, 4,
        5, 6, 7, 8,
        9, 10, 11, 12,
        13, 14, 15, 16
      );

      const result = m.multiplyScalar(2);

      expect(result.elements).toEqual([
        2, 10, 18, 26,
        4, 12, 20, 28,
        6, 14, 22, 30,
        8, 16, 24, 32
      ]);
    });

    it('should multiply by zero resulting in a zero matrix', () => {
      const m = new Matrix4();
      m.set(
        1, 2, 3, 4,
        5, 6, 7, 8,
        9, 10, 11, 12,
        13, 14, 15, 16
      );

      m.multiplyScalar(0);

      expect(Array.from(m.elements)).toEqual(Array(16).fill(0));
    });

    it('should multiply by a negative scalar and flip the sign of all elements', () => {
      const m = new Matrix4();
      m.set(
        1, -2, 3, -4,
        5, -6, 7, -8,
        9, -10, 11, -12,
        13, -14, 15, -16
      );

      m.multiplyScalar(-1);

      expect(Array.from(m.elements)).toEqual([
        -1, -5, -9, -13,
        2, 6, 10, 14,
        -3, -7, -11, -15,
        4, 8, 12, 16
      ]);
    });

    it('should not modify the structure (remain 4x4 matrix)', () => {
      const m = new Matrix4();
      const beforeLength = m.elements.length;
      m.multiplyScalar(5);
      expect(m.elements.length).toBe(beforeLength);
    });

    it('should return the same matrix instance (in-place operation)', () => {
      const m = new Matrix4();
      const result = m.multiplyScalar(2);
      expect(result).toBe(m);
    });
  });

  describe('determinant()', () => {
    it('should return 1 for identity matrix', () => {
      const m = new Matrix4();
      expect(m.determinant()).toBeCloseTo(1);
    });

    it('should return 0 for a matrix with a zero row', () => {
      const m = new Matrix4();
      m.set(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 0 // last row is zero
      );
      expect(m.determinant()).toBeCloseTo(0);
    });

    it('should compute correct determinant for a simple scaled matrix', () => {
      const m = new Matrix4();
      m.set(
        2, 0, 0, 0,
        0, 3, 0, 0,
        0, 0, 4, 0,
        0, 0, 0, 1
      );
      // determinant = 2*3*4*1 = 24
      expect(m.determinant()).toBeCloseTo(24);
    });

    it('should handle negative scaling', () => {
      const m = new Matrix4();
      m.set(
        -1, 0, 0, 0,
        0, 2, 0, 0,
        0, 0, -3, 0,
        0, 0, 0, 1
      );
      // determinant = (-1) * 2 * (-3) * 1 = 6
      expect(m.determinant()).toBeCloseTo(6);
    });

    it('should return correct determinant for a rotation matrix', () => {
      const m = new Matrix4().makeRotationX(Math.PI / 4);
      // rotation matrices are orthogonal, determinant = ±1
      expect(Math.abs(m.determinant())).toBeCloseTo(1);
    });
  });

  describe('transpose()', () => {
    it('should transpose a known 4x4 matrix correctly', () => {
      const m = new Matrix4().fromArray([
        1, 2, 3, 4,
        5, 6, 7, 8,
        9, 10, 11, 12,
        13, 14, 15, 16
      ]);

      m.transpose();

      expect(m.elements).toEqual([
        1, 5, 9, 13,
        2, 6, 10, 14,
        3, 7, 11, 15,
        4, 8, 12, 16
      ]);
    });

    it('should transpose the identity matrix into itself', () => {
      const m = new Matrix4().identity();
      m.transpose();
      expect(m.elements).toEqual([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ]);
    });

    it('should transpose twice to return the original matrix', () => {
      const m = new Matrix4().fromArray([
        1, 2, 3, 4,
        5, 6, 7, 8,
        9, 10, 11, 12,
        13, 14, 15, 16
      ]);

      const original = [...m.elements];
      m.transpose().transpose(); // double transpose
      expect(m.elements).toEqual(original);
    });

    it('should return itself (this)', () => {
      const m = new Matrix4();
      const result = m.transpose();
      expect(result).toBe(m);
    });
  });

  describe('setPosition()', () => {
    it('should set the translation (position) components from a Vector3', () => {
      const m = new Matrix4();
      const v = new Vector3(10, 20, 30);

      m.setPosition(v);

      expect(m.elements[12]).toBe(10);
      expect(m.elements[13]).toBe(20);
      expect(m.elements[14]).toBe(30);
    });

    it('should set the translation components from numeric x, y, z values', () => {
      const m = new Matrix4();
      m.setPosition(1, 2, 3);

      expect(m.elements[12]).toBe(1);
      expect(m.elements[13]).toBe(2);
      expect(m.elements[14]).toBe(3);
    });

    it('should not affect the rest of the matrix elements', () => {
      const m = new Matrix4();
      m.set(
        1, 2, 3, 4,
        5, 6, 7, 8,
        9, 10, 11, 12,
        13, 14, 15, 16
      );

      const before = m.elements.slice();
      m.setPosition(100, 200, 300);

      // check translation updated
      expect(m.elements[12]).toBe(100);
      expect(m.elements[13]).toBe(200);
      expect(m.elements[14]).toBe(300);

      // all other elements remain identical
      for (let i = 0; i < 16; i++) {
        if (i === 12 || i === 13 || i === 14) continue;
        expect(m.elements[i]).toBe(before[i]);
      }
    });

    it('should correctly handle negative and floating-point values', () => {
      const m = new Matrix4();
      m.setPosition(-1.5, 0.25, 3.75);

      expect(m.elements[12]).toBeCloseTo(-1.5);
      expect(m.elements[13]).toBeCloseTo(0.25);
      expect(m.elements[14]).toBeCloseTo(3.75);
    });

    it('should handle zero position correctly', () => {
      const m = new Matrix4();
      m.setPosition(0, 0, 0);
      expect(m.elements[12]).toBe(0);
      expect(m.elements[13]).toBe(0);
      expect(m.elements[14]).toBe(0);
    });

    it('should return the same matrix instance (in-place)', () => {
      const m = new Matrix4();
      const result = m.setPosition(5, 6, 7);
      expect(result).toBe(m);
    });
  });

  describe('invert', () => {
    it('should invert the identity matrix to itself', () => {
      const m = new Matrix4(); // identity by default
      m.invert();

      const expected = new Matrix4(); // identity
      expect(m.elements).toEqual(expected.elements);
    });

    it('should correctly invert a simple translation matrix', () => {
      const m = new Matrix4().makeTranslation(10, -5, 2);
      const inv = m.clone().invert();

      // The inverse translation should be the negative offset
      const expected = new Matrix4().makeTranslation(-10, 5, -2);
      for (let i = 0; i < 16; i++) {
        expect(inv.elements[i]).toBeCloseTo(expected.elements[i]);
      }
    });

    it('should correctly invert a scale matrix', () => {
      const m = new Matrix4().makeScale(2, 3, 4);
      const inv = m.clone().invert();

      const expected = new Matrix4().makeScale(1 / 2, 1 / 3, 1 / 4);
      for (let i = 0; i < 16; i++) {
        expect(inv.elements[i]).toBeCloseTo(expected.elements[i]);
      }
    });

    it('should produce the identity matrix when multiplied by its inverse', () => {
      const m = new Matrix4()
        .makeRotationX(Math.PI / 4)
        .premultiply(new Matrix4().makeTranslation(3, 2, -1))
        .premultiply(new Matrix4().makeScale(2, 2, 2));

      const inv = m.clone().invert();
      const result = m.clone().multiply(inv);

      const identity = new Matrix4();
      for (let i = 0; i < 16; i++) {
        expect(result.elements[i]).toBeCloseTo(identity.elements[i], 5);
      }
    });

    it('should set to zero matrix if determinant is zero (non-invertible)', () => {
      // singular matrix: all rows are multiples of each other
      const m = new Matrix4().set(
        1, 2, 3, 4,
        2, 4, 6, 8,
        3, 6, 9, 12,
        4, 8, 12, 16
      );

      m.invert();

      // all elements should now be zero
      expect(m.elements.every(e => e === 0)).toBe(true);
    });

    it('should invert a random non-singular matrix correctly', () => {
      const m = new Matrix4().set(
        2, 3, 1, 5,
        4, 7, 2, 6,
        0, 5, 1, 3,
        2, 4, 1, 2
      );

      const inv = m.clone().invert();
      const result = m.clone().multiply(inv);

      // expect result ≈ identity
      const identity = new Matrix4();
      for (let i = 0; i < 16; i++) {
        expect(result.elements[i]).toBeCloseTo(identity.elements[i], 5);
      }
    });

    it('should return the same matrix instance (in-place)', () => {
      const m = new Matrix4().makeRotationZ(Math.PI / 6);
      const result = m.invert();
      expect(result).toBe(m);
    });
  });

  describe('scale()', () => {
    it('should scale the basis vectors (columns) correctly', () => {
      const m = new Matrix4().identity();
      const v = new Vector3(2, 3, 4);
      m.scale(v);

      const e = m.elements;

      // since identity basis vectors are (1,0,0), (0,1,0), (0,0,1)
      // after scaling, they should become (2,0,0), (0,3,0), (0,0,4)
      expect(e[0]).toBeCloseTo(2); // x basis x
      expect(e[5]).toBeCloseTo(3); // y basis y
      expect(e[10]).toBeCloseTo(4); // z basis z

      // translation should remain untouched
      expect(e[12]).toBe(0);
      expect(e[13]).toBe(0);
      expect(e[14]).toBe(0);
    });

    it('should scale a transformed matrix correctly', () => {
      const m = new Matrix4().makeTranslation(1, 2, 3).makeRotationX(Math.PI / 2);
      const before = m.clone();
      const v = new Vector3(2, 1, 0.5);
      m.scale(v);

      // rotation/scale columns should be scaled
      expect(m.elements[0]).toBeCloseTo(before.elements[0] * v.x);
      expect(m.elements[4]).toBeCloseTo(before.elements[4] * v.y);
      expect(m.elements[8]).toBeCloseTo(before.elements[8] * v.z);

      // translation should stay the same
      expect(m.elements[12]).toBeCloseTo(before.elements[12]);
      expect(m.elements[13]).toBeCloseTo(before.elements[13]);
      expect(m.elements[14]).toBeCloseTo(before.elements[14]);
    });

    it('should not modify the translation components', () => {
      const m = new Matrix4().makeTranslation(5, -3, 7);
      const v = new Vector3(10, 10, 10);
      const beforeTranslation = m.elements.slice(12, 15);
      m.scale(v);
      const afterTranslation = m.elements.slice(12, 15);

      expect(afterTranslation).toEqual(beforeTranslation);
    });

    it('should handle zero scale components correctly', () => {
      const m = new Matrix4().identity();
      const v = new Vector3(1, 0, 2);
      m.scale(v);

      const e = m.elements;
      // y-axis column should be zeroed out
      expect(e[4]).toBe(0);
      expect(e[5]).toBe(0);
      expect(e[6]).toBe(0);
      expect(e[7]).toBe(0);
    });

    it('should return the same matrix instance (in-place)', () => {
      const m = new Matrix4();
      const result = m.scale(new Vector3(2, 2, 2));
      expect(result).toBe(m);
    });
  });

  describe('getMaxScaleOnAxis()', () => {
    it('should return 1 for an identity matrix', () => {
      const m = new Matrix4().identity();
      expect(m.getMaxScaleOnAxis()).toBeCloseTo(1);
    });

    it('should return the largest scale component for a scaled matrix', () => {
      const m = new Matrix4().makeScale(2, 3, 4);
      expect(m.getMaxScaleOnAxis()).toBeCloseTo(4);
    });

    it('should ignore translation components', () => {
      const m = new Matrix4().makeScale(2, 3, 1).setPosition(100, 200, 300);
      expect(m.getMaxScaleOnAxis()).toBeCloseTo(3);
    });

    it('should handle non-uniform scales with rotation', () => {
      const m = new Matrix4()
        .makeRotationX(Math.PI / 4)
        .scale(new Vector3(2, 1, 3)); // rotated + scaled

      // The rotation affects the column lengths, but the max should still reflect the largest scale factor (≈ 3)
      const result = m.getMaxScaleOnAxis();
      expect(result).toBeCloseTo(3, 2);
    });

    it('should handle negative scales correctly', () => {
      const m = new Matrix4().makeScale(-2, -5, -1);
      expect(m.getMaxScaleOnAxis()).toBeCloseTo(5);
    });

    it('should return 0 for a zero matrix', () => {
      const m = new Matrix4().set(
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
      );
      expect(m.getMaxScaleOnAxis()).toBe(0);
    });

    it('should not modify the matrix', () => {
      const m = new Matrix4().makeScale(2, 2, 2);
      const before = m.clone();
      m.getMaxScaleOnAxis();
      expect(m.equals(before)).toBe(true);
    });
  });

  describe('makeTranslation()', () => {
    it('should create the correct translation matrix given scalar arguments', () => {
      const m = new Matrix4().makeTranslation(10, 20, 30);

      // Column-major order
      const expected = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        10, 20, 30, 1
      ];

      expect(Array.from(m.elements)).toEqual(expected);
    });

    it('should create the correct translation matrix given a Vector3', () => {
      const v = new Vector3(10, 20, 30);
      const m = new Matrix4().makeTranslation(v, 0, 0); // ty, tz ignored

      const expected = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        10, 20, 30, 1
      ];

      expect(Array.from(m.elements)).toEqual(expected);
    });

    it('should correctly translate a point in space', () => {
      const m = new Matrix4().makeTranslation(5, -3, 2);
      const v = new Vector3(1, 1, 1).applyMatrix4(m);

      expect(v.x).toBeCloseTo(6);
      expect(v.y).toBeCloseTo(-2);
      expect(v.z).toBeCloseTo(3);
    });

    it('should produce the identity matrix when translating by zero', () => {
      const m = new Matrix4().makeTranslation(0, 0, 0);

      const expected = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ];

      expect(Array.from(m.elements)).toEqual(expected);
    });

    it('should overwrite existing matrix values', () => {
      const m = new Matrix4().makeScale(2, 2, 2);
      m.makeTranslation(1, 2, 3);

      const expected = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        1, 2, 3, 1
      ];

      expect(Array.from(m.elements)).toEqual(expected);
    });
  });

  describe('makeRotationX', () => {
    it('should produce identity matrix for angle = 0', () => {
      const m = new Matrix4().makeRotationX(0);
      const expected = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ];

      // Compare element-wise, treating -0 and 0 as equal
      m.elements.forEach((v, i) => {
        expect(v).toBeCloseTo(expected[i], 6);
      });
    });

    it('should rotate Y-Z plane correctly for 90 degrees', () => {
      const m = new Matrix4().makeRotationX(Math.PI / 2);

      // Column-major indices
      expect(m.elements[5]).toBeCloseTo(Math.cos(Math.PI / 2)); // 0
      expect(m.elements[6]).toBeCloseTo(Math.sin(Math.PI / 2)); // 1
      expect(m.elements[9]).toBeCloseTo(-Math.sin(Math.PI / 2)); // -1
      expect(m.elements[10]).toBeCloseTo(Math.cos(Math.PI / 2)); // 0

      // Rotate vector (0, 1, 0) → should become (0, 0, 1)
      const v = new Vector3(0, 1, 0);
      v.applyMatrix4(m);
      expect(v.x).toBeCloseTo(0);
      expect(v.y).toBeCloseTo(0);
      expect(v.z).toBeCloseTo(1);
    });

    it('should rotate 180 degrees correctly', () => {
      const m = new Matrix4().makeRotationX(Math.PI);

      // Rotation around X by 180° should flip Y and Z
      const v = new Vector3(0, 1, 2);
      v.applyMatrix4(m);

      expect(v.x).toBeCloseTo(0);
      expect(v.y).toBeCloseTo(-1);
      expect(v.z).toBeCloseTo(-2);
    });

    it('should be orthogonal (Rᵀ * R = I)', () => {
      const m = new Matrix4().makeRotationX(Math.PI / 3);
      const mt = m.clone().transpose();
      const product = mt.multiply(m);

      // Check approximately identity
      const e = product.elements;
      const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
      e.forEach((val: number, i: number) => {
        expect(val).toBeCloseTo(identity[i], 6);
      });
    });

    it('should return this (be chainable)', () => {
      const m = new Matrix4();
      const result = m.makeRotationX(Math.PI / 4);
      expect(result).toBe(m);
    });
  });

  describe('makeRotationY', () => {
    it('should produce identity matrix for angle = 0', () => {
      const m = new Matrix4().makeRotationY(0);
      const expected = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ];
      m.elements.forEach((v, i) => expect(v).toBeCloseTo(expected[i], 6));
    });

    it('should rotate the X-Z plane correctly for 90 degrees around Y axis', () => {
      const m = new Matrix4().makeRotationY(Math.PI / 2);
      const e = m.elements;
      const c = Math.cos(Math.PI / 2); // ~0
      const s = Math.sin(Math.PI / 2); // 1

      // Column-major indices
      expect(e[0]).toBeCloseTo(c);    // m11
      expect(e[2]).toBeCloseTo(-s);   // m31
      expect(e[8]).toBeCloseTo(s);    // m13
      expect(e[10]).toBeCloseTo(c);   // m33

      // Rotating (1,0,0) around +Y by +90° → (0,0,-1)
      const v = new Vector3(1, 0, 0).applyMatrix4(m);
      expect(v.x).toBeCloseTo(0);
      expect(v.y).toBeCloseTo(0);
      expect(v.z).toBeCloseTo(-1); // <- negative Z
    });

    it('should rotate 180 degrees correctly', () => {
      const m = new Matrix4().makeRotationY(Math.PI);

      // Rotate vector (1, 0, 0) → should become (-1, 0, 0)
      const v = new Vector3(1, 0, 0);
      v.applyMatrix4(m);
      expect(v.x).toBeCloseTo(-1);
      expect(v.y).toBeCloseTo(0);
      expect(v.z).toBeCloseTo(0);
    });

    it('should be orthogonal (Rᵀ * R = I)', () => {
      const m = new Matrix4().makeRotationY(Math.PI / 3);
      const mt = m.clone().transpose();
      const product = mt.multiply(m);

      const e = product.elements;
      const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
      e.forEach((val: number, i: number) => {
        expect(val).toBeCloseTo(identity[i], 6);
      });
    });

    it('should return this (be chainable)', () => {
      const m = new Matrix4();
      const result = m.makeRotationY(Math.PI / 4);
      expect(result).toBe(m);
    });
  });

  describe('makeRotationZ', () => {
    it('should create identity matrix for 0 radians', () => {
      const m = new Matrix4().makeRotationZ(0);
      const expected = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
      ];

      m.elements.forEach((v, i) => expect(v).toBeCloseTo(expected[i], 6));
    });

    it('should create 90° rotation around Z axis (π/2 radians)', () => {
      const m = new Matrix4().makeRotationZ(Math.PI / 2);

      // transpose because matrix4 takes in arguments in row-major order
      // but stores them internally in m.element array in column-major order
      const expected = [
        0, 1, 0, 0,
        -1, 0, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
      ];

      m.elements.forEach((v, i) => expect(v).toBeCloseTo(expected[i], 6));
    });

    it('should create 180° rotation around Z axis (π radians)', () => {
      const m = new Matrix4().makeRotationZ(Math.PI);
      const expected = [
        -1, 0, 0, 0,
        0, -1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
      ];

      m.elements.forEach((v, i) => expect(v).toBeCloseTo(expected[i], 6));
    });

    it('should create 270° rotation around Z axis (3π/2 radians)', () => {
      const m = new Matrix4().makeRotationZ(3 * Math.PI / 2);

      // transpose because matrix4 takes in arguments in row-major order
      // but stores them internally in m.element array in column-major order

      const expected = [
        0, -1, 0, 0,
        1, 0, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
      ];

      m.elements.forEach((v, i) => expect(v).toBeCloseTo(expected[i], 6));
    });

    it('should return itself (chainable)', () => {
      const m = new Matrix4();
      const result = m.makeRotationZ(0);
      expect(result).toBe(m);
    });
  });

  describe('makeRotationAxis()', () => {
    it('should create the identity matrix when angle = 0', () => {
      const axis = new Vector3(1, 0, 0);
      const m = new Matrix4().makeRotationAxis(axis, 0);

      const identity = new Matrix4().identity();
      expect(m.equals(identity)).toBe(true);
    });

    it('should correctly rotate 90 degrees around the X axis', () => {
      const axis = new Vector3(1, 0, 0);
      const angle = Math.PI / 2;
      const m = new Matrix4().makeRotationAxis(axis, angle);

      const expected = new Matrix4().set(
        1, 0, 0, 0,
        0, 0, -1, 0,
        0, 1, 0, 0,
        0, 0, 0, 1
      );

      for (let i = 0; i < 16; i++) {
        expect(m.elements[i]).toBeCloseTo(expected.elements[i], 6);
      }
    });

    it('should correctly rotate 90 degrees around the Y axis', () => {
      const axis = new Vector3(0, 1, 0);
      const angle = Math.PI / 2;
      const m = new Matrix4().makeRotationAxis(axis, angle);

      const expected = new Matrix4().set(
        0, 0, 1, 0,
        0, 1, 0, 0,
        -1, 0, 0, 0,
        0, 0, 0, 1
      );

      for (let i = 0; i < 16; i++) {
        expect(m.elements[i]).toBeCloseTo(expected.elements[i], 6);
      }
    });

    it('should correctly rotate 90 degrees around the Z axis', () => {
      const axis = new Vector3(0, 0, 1);
      const angle = Math.PI / 2;
      const m = new Matrix4().makeRotationAxis(axis, angle);

      const expected = new Matrix4().set(
        0, -1, 0, 0,
        1, 0, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      );

      for (let i = 0; i < 16; i++) {
        expect(m.elements[i]).toBeCloseTo(expected.elements[i], 6);
      }
    });

    it('should correctly rotate around an arbitrary normalized axis', () => {
      const axis = new Vector3(1, 1, 1).normalize();
      const angle = Math.PI / 3; // 60 degrees
      const m = new Matrix4().makeRotationAxis(axis, angle);

      // Expected rotation matrix around (1,1,1) axis by 60°
      // Precomputed with a math tool or Three.js reference
      const expected = new Matrix4().set(
        0.6666667, -0.3333333, 0.6666667, 0,
        0.6666667, 0.6666667, -0.3333333, 0,
        -0.3333333, 0.6666667, 0.6666667, 0,
        0, 0, 0, 1
      );

      for (let i = 0; i < 16; i++) {
        expect(m.elements[i]).toBeCloseTo(expected.elements[i], 5);
      }
    });

    it('should not modify the axis vector', () => {
      const axis = new Vector3(1, 0, 0);
      const copy = axis.clone();
      new Matrix4().makeRotationAxis(axis, Math.PI / 4);
      expect(axis.equals(copy)).toBe(true);
    });

    it('should return this for chaining', () => {
      const m = new Matrix4();
      const result = m.makeRotationAxis(new Vector3(0, 1, 0), Math.PI / 2);
      expect(result).toBe(m);
    });
  });

  describe('makeScale()', () => {
    it('should create a correct scale matrix for uniform scaling', () => {
      const m = new Matrix4().makeScale(2, 2, 2);

      const expected = [
        2, 0, 0, 0,
        0, 2, 0, 0,
        0, 0, 2, 0,
        0, 0, 0, 1,
      ];

      expect(Array.from(m.elements)).toEqual(expected);
    });

    it('should create a correct non-uniform scale matrix', () => {
      const m = new Matrix4().makeScale(2, 3, 4);

      const expected = [
        2, 0, 0, 0,
        0, 3, 0, 0,
        0, 0, 4, 0,
        0, 0, 0, 1,
      ];

      expect(Array.from(m.elements)).toEqual(expected);
    });

    it('should scale a vector correctly (uniform scale)', () => {
      const m = new Matrix4().makeScale(2, 2, 2);
      const v = new Vector3(1, -2, 3).applyMatrix4(m);

      expect(v.x).toBeCloseTo(2);
      expect(v.y).toBeCloseTo(-4);
      expect(v.z).toBeCloseTo(6);
    });

    it('should scale a vector correctly (non-uniform scale)', () => {
      const m = new Matrix4().makeScale(2, 3, 4);
      const v = new Vector3(1, 1, 1).applyMatrix4(m);

      expect(v.x).toBeCloseTo(2);
      expect(v.y).toBeCloseTo(3);
      expect(v.z).toBeCloseTo(4);
    });

    it('should handle zero scale correctly', () => {
      const m = new Matrix4().makeScale(0, 0, 0);
      const v = new Vector3(5, -7, 2).applyMatrix4(m);

      expect(v.x).toBe(0);
      expect(v.y).toBe(0);
      expect(v.z).toBe(0);
    });

    it('should leave the homogeneous coordinate untouched', () => {
      const m = new Matrix4().makeScale(3, 4, 5);
      // The bottom-right element should always be 1
      expect(m.elements[15]).toBe(1);
    });

    it('should overwrite existing matrix values', () => {
      const m = new Matrix4().makeTranslation(10, 20, 30);
      m.makeScale(1, 2, 3);
      const expected = [
        1, 0, 0, 0,
        0, 2, 0, 0,
        0, 0, 3, 0,
        0, 0, 0, 1,
      ];
      expect(Array.from(m.elements)).toEqual(expected);
    });
  });

  describe('makeShear()', () => {
    it('should create an identity matrix when all shear factors are zero', () => {
      const m = new Matrix4().makeShear(0, 0, 0, 0, 0, 0);
      const identity = new Matrix4().identity();
      expect(m.equals(identity)).toBe(true);
    });

    it('should return this for chaining', () => {
      const m = new Matrix4();
      const result = m.makeShear(0.2, 0, 0, 0.1, 0, 0);
      expect(result).toBe(m);
    });

    it('should correctly shear Y by X (xy)', () => {
      const m = new Matrix4().makeShear(0.5, 0, 0, 0, 0, 0);
      const v = new Vector3(1, 0, 0).applyMatrix4(m);
      // y' = y + xy * x = 0.5
      expect(v.y).toBeCloseTo(0.5);
      expect(v.x).toBeCloseTo(1);
      expect(v.z).toBeCloseTo(0);
    });

    it('should correctly shear X by Y (yx)', () => {
      const m = new Matrix4().makeShear(0, 0, 0.3, 0, 0, 0);
      const v = new Vector3(0, 1, 0).applyMatrix4(m);
      // x' = x + yx * y = 0.3
      expect(v.x).toBeCloseTo(0.3);
      expect(v.y).toBeCloseTo(1);
      expect(v.z).toBeCloseTo(0);
    });

    it('should correctly shear Z by Y (yz)', () => {
      const m = new Matrix4().makeShear(0, 0, 0, 0.7, 0, 0);
      const v = new Vector3(0, 1, 0).applyMatrix4(m);
      // z' = z + yz * y = 0.7
      expect(v.z).toBeCloseTo(0.7);
    });

    it('should correctly combine multiple shear factors', () => {
      const m = new Matrix4().makeShear(0.2, 0.3, 0.4, 0.1, 0.5, 0.6);
      const v = new Vector3(1, 2, 3).applyMatrix4(m);

      // Derived from actual matrix math (column-major)
      const expected = new Vector3();
      expected.x = 1 + 0.4 * 2 + 0.5 * 3; // x + yx*y + zx*z
      expected.y = 0.2 * 1 + 2 + 0.6 * 3; // xy*x + y + zy*z
      expected.z = 0.3 * 1 + 0.1 * 2 + 3; // xz*x + yz*y + z

      expect(v.x).toBeCloseTo(expected.x);
      expect(v.y).toBeCloseTo(expected.y);
      expect(v.z).toBeCloseTo(expected.z);
    });

    it('should not alter translation components', () => {
      const m = new Matrix4().makeShear(0.5, 0.1, 0.2, 0.3, 0.4, 0.5);
      expect(m.elements[12]).toBe(0);
      expect(m.elements[13]).toBe(0);
      expect(m.elements[14]).toBe(0);
      expect(m.elements[15]).toBe(1);
    });
  });

  describe('compose()', () => {
    it('should create an identity matrix for zero rotation, unit scale, and zero position', () => {
      const position = new Vector3(0, 0, 0);
      const quaternion = new Quaternion(0, 0, 0, 1); // Identity rotation
      const scale = new Vector3(1, 1, 1);

      const m = new Matrix4().compose(position, quaternion, scale);

      const expected = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ];

      m.elements.forEach((val, i) => {
        expect(val).toBeCloseTo(expected[i]);
      });
    });

    it('should set translation correctly', () => {
      const position = new Vector3(5, -3, 2);
      const quaternion = new Quaternion(0, 0, 0, 1);
      const scale = new Vector3(1, 1, 1);

      const m = new Matrix4().compose(position, quaternion, scale);

      expect(m.elements[12]).toBeCloseTo(5);
      expect(m.elements[13]).toBeCloseTo(-3);
      expect(m.elements[14]).toBeCloseTo(2);
    });

    it('should apply scale correctly', () => {
      const position = new Vector3(0, 0, 0);
      const quaternion = new Quaternion(0, 0, 0, 1); // Identity rotation
      const scale = new Vector3(2, 3, 4);

      const m = new Matrix4().compose(position, quaternion, scale);

      expect(m.elements[0]).toBeCloseTo(2);  // sx
      expect(m.elements[5]).toBeCloseTo(3);  // sy
      expect(m.elements[10]).toBeCloseTo(4); // sz
    });

    it('should rotate correctly using a quaternion', () => {
      const position = new Vector3(0, 0, 0);
      // 90° rotation around X axis
      const angle = Math.PI / 2;
      const q = new Quaternion(Math.sin(angle / 2), 0, 0, Math.cos(angle / 2));
      const scale = new Vector3(1, 1, 1);

      const m = new Matrix4().compose(position, q, scale);

      // Rotation matrix for 90° around X
      const expected = [
        1, 0, 0, 0,
        0, 0, 1, 0,
        0, -1, 0, 0,
        0, 0, 0, 1
      ];

      m.elements.forEach((val, i) => {
        expect(val).toBeCloseTo(expected[i]);
      });
    });

    it('should combine translation, rotation, and scale correctly', () => {
      const position = new Vector3(1, 2, 3);
      const angle = Math.PI / 2;
      const q = new Quaternion(Math.sin(angle / 2), 0, 0, Math.cos(angle / 2));
      const scale = new Vector3(2, 3, 4);

      const m = new Matrix4().compose(position, q, scale);

      // Check some key elements
      expect(m.elements[0]).toBeCloseTo(2);   // scaled x-axis
      expect(m.elements[5]).toBeCloseTo(0);   // scaled y-axis rotated
      expect(m.elements[6]).toBeCloseTo(3);   // scaled z-axis rotated
      expect(m.elements[12]).toBeCloseTo(1);  // translation
      expect(m.elements[13]).toBeCloseTo(2);
      expect(m.elements[14]).toBeCloseTo(3);
    });

    it('should return "this" (the same instance)', () => {
      const matrix = new Matrix4();
      const position = new Vector3(1, 2, 3);
      const quaternion = new Quaternion(0, 0, 0, 1);
      const scale = new Vector3(1, 1, 1);

      const result = matrix.compose(position, quaternion, scale);

      // The method should return the same object (not a clone)
      expect(result).toBe(matrix);
    });
  });

  describe('decompose()', () => {
    it('should correctly decompose a translation matrix', () => {
      const m = new Matrix4().makeTranslation(10, 20, 30);
      const position = new Vector3();
      const quaternion = new Quaternion();
      const scale = new Vector3();

      m.decompose(position, quaternion, scale);

      expect(position.x).toBeCloseTo(10);
      expect(position.y).toBeCloseTo(20);
      expect(position.z).toBeCloseTo(30);

      // no rotation
      expect(quaternion.x).toBeCloseTo(0);
      expect(quaternion.y).toBeCloseTo(0);
      expect(quaternion.z).toBeCloseTo(0);
      expect(quaternion.w).toBeCloseTo(1);

      // uniform scale
      expect(scale.x).toBeCloseTo(1);
      expect(scale.y).toBeCloseTo(1);
      expect(scale.z).toBeCloseTo(1);
    });

    it('should correctly decompose a scale matrix', () => {
      const m = new Matrix4().makeScale(2, 3, 4);
      const position = new Vector3();
      const quaternion = new Quaternion();
      const scale = new Vector3();

      m.decompose(position, quaternion, scale);

      expect(position.x).toBeCloseTo(0);
      expect(position.y).toBeCloseTo(0);
      expect(position.z).toBeCloseTo(0);

      expect(quaternion.x).toBeCloseTo(0);
      expect(quaternion.y).toBeCloseTo(0);
      expect(quaternion.z).toBeCloseTo(0);
      expect(quaternion.w).toBeCloseTo(1);

      expect(scale.x).toBeCloseTo(2);
      expect(scale.y).toBeCloseTo(3);
      expect(scale.z).toBeCloseTo(4);
    });

    it('should correctly decompose a rotation matrix', () => {
      const angle = Math.PI / 2; // 90 degrees
      const m = new Matrix4().makeRotationX(angle);

      const position = new Vector3();
      const quaternion = new Quaternion();
      const scale = new Vector3();

      m.decompose(position, quaternion, scale);

      expect(position.length()).toBeCloseTo(0);
      expect(scale.x).toBeCloseTo(1);
      expect(scale.y).toBeCloseTo(1);
      expect(scale.z).toBeCloseTo(1);

      // rotation quaternion should represent a 90° rotation around X axis
      const expectedQuat = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), angle);

      expect(quaternion.x).toBeCloseTo(expectedQuat.x);
      expect(quaternion.y).toBeCloseTo(expectedQuat.y);
      expect(quaternion.z).toBeCloseTo(expectedQuat.z);
      expect(quaternion.w).toBeCloseTo(expectedQuat.w);
    });

    it('should correctly decompose a combined translation, rotation, and scale matrix', () => {
      const positionOriginal = new Vector3(5, -3, 10);
      const rotationQuat = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 4);
      const scaleOriginal = new Vector3(2, 3, 4);

      const m = new Matrix4()
        .compose(positionOriginal, rotationQuat, scaleOriginal);

      const position = new Vector3();
      const quaternion = new Quaternion();
      const scale = new Vector3();

      m.decompose(position, quaternion, scale);

      expect(position.x).toBeCloseTo(positionOriginal.x);
      expect(position.y).toBeCloseTo(positionOriginal.y);
      expect(position.z).toBeCloseTo(positionOriginal.z);

      expect(scale.x).toBeCloseTo(scaleOriginal.x);
      expect(scale.y).toBeCloseTo(scaleOriginal.y);
      expect(scale.z).toBeCloseTo(scaleOriginal.z);

      // rotation quaternion should match original (may differ in sign, but equivalent)
      expect(Math.abs(quaternion.x)).toBeCloseTo(Math.abs(rotationQuat.x));
      expect(Math.abs(quaternion.y)).toBeCloseTo(Math.abs(rotationQuat.y));
      expect(Math.abs(quaternion.z)).toBeCloseTo(Math.abs(rotationQuat.z));
      expect(Math.abs(quaternion.w)).toBeCloseTo(Math.abs(rotationQuat.w));
    });

    it('should handle negative determinant (reflected scale)', () => {
      // mirror in X axis (negative scale)
      const m = new Matrix4().makeScale(-2, 3, 4);
      const position = new Vector3();
      const quaternion = new Quaternion();
      const scale = new Vector3();

      m.decompose(position, quaternion, scale);

      expect(scale.x).toBeCloseTo(-2);
      expect(scale.y).toBeCloseTo(3);
      expect(scale.z).toBeCloseTo(4);

      // rotation should still be valid
      expect(quaternion.length()).toBeCloseTo(1);
    });

    it('should return a reference to itself', () => {
      const m = new Matrix4().makeScale(1, 1, 1);
      const position = new Vector3();
      const quaternion = new Quaternion();
      const scale = new Vector3();

      const result = m.decompose(position, quaternion, scale);
      expect(result).toBe(m);
    });
  });

  describe('makePerspective()', () => {
    it('creates a correct WebGL matrix (normal depth)', () => {
      const m = new Matrix4();
      m.makePerspective(-1, 1, 1, -1, 1, 100, WebGLCoordinateSystem, false);
      const te = m.elements;

      // Sanity checks
      expect(te[0]).toBeCloseTo(1);     // 2n / (r-l) = 1
      expect(te[5]).toBeCloseTo(1);     // 2n / (t-b) = 1
      expect(te[10]).toBeCloseTo(-1.0202, 3); // -(f+n)/(f-n)
      expect(te[14]).toBeCloseTo(-2.0202, 3); // -2fn/(f-n)
      expect(te[11]).toBeCloseTo(-1);
      expect(te[15]).toBeCloseTo(0);
    });

    it('creates a correct WebGPU matrix (normal depth)', () => {
      const m = new Matrix4();
      m.makePerspective(-1, 1, 1, -1, 1, 100, WebGPUCoordinateSystem, false);
      const te = m.elements;

      // WebGPU uses depth range 0..1
      expect(te[10]).toBeCloseTo(-1.0101, 3); // -f/(f-n)
      expect(te[14]).toBeCloseTo(-1.0101, 3); // -fn/(f-n)
      expect(te[11]).toBeCloseTo(-1);
    });

    it('creates a correct reversed depth matrix', () => {
      const m = new Matrix4();
      m.makePerspective(-1, 1, 1, -1, 1, 100, WebGLCoordinateSystem, true);
      const te = m.elements;

      // Reversed depth swaps near/far behavior
      expect(te[10]).toBeCloseTo(1 / (100 - 1), 4); // ≈ 0.0101
      expect(te[14]).toBeCloseTo((100 * 1) / (100 - 1), 3); // ≈ 1.0101
      expect(te[11]).toBeCloseTo(-1);
    });

    it('throws on invalid coordinate system', () => {
      const m = new Matrix4();
      expect(() =>
        m.makePerspective(-1, 1, 1, -1, 1, 100, 9999 as any, false)
      ).toThrowError(/Invalid coordinate system/);
    });
  });

  describe('makeOrthographicCamera()', () => {
    it('creates a correct WebGL orthographic matrix (normal depth)', () => {
      const m = new Matrix4();
      const result = m.makeOrthographic(-2, 2, 2, -2, 1, 100, WebGLCoordinateSystem, false);

      // returns itself (for chaining)
      expect(result).toBe(m);

      const te = m.elements;

      // Check scale
      expect(te[0]).toBeCloseTo(0.5);  // 2 / (r - l)
      expect(te[5]).toBeCloseTo(0.5);  // 2 / (t - b)

      // Check translation
      expect(te[12]).toBeCloseTo(0);   // center at 0
      expect(te[13]).toBeCloseTo(0);

      // Depth mapping for WebGL
      expect(te[10]).toBeCloseTo(-0.0202, 4); // -2 / (f - n)
      expect(te[14]).toBeCloseTo(-1.0202, 4); // -(f + n)/(f - n)

      expect(te[15]).toBe(1);
    });

    it('creates a correct WebGPU orthographic matrix (normal depth)', () => {
      const m = new Matrix4();
      const result = m.makeOrthographic(-2, 2, 2, -2, 1, 100, WebGPUCoordinateSystem, false);

      expect(result).toBe(m);
      const te = m.elements;

      expect(te[0]).toBeCloseTo(0.5);
      expect(te[5]).toBeCloseTo(0.5);

      // WebGPU differs in depth
      expect(te[10]).toBeCloseTo(-0.0101, 4); // -1 / (f - n)
      expect(te[14]).toBeCloseTo(-0.0101, 4); // -n / (f - n)
    });

    it('creates a correct reversed depth matrix', () => {
      const m = new Matrix4();
      const result = m.makeOrthographic(-2, 2, 2, -2, 1, 100, WebGLCoordinateSystem, true);

      expect(result).toBe(m);
      const te = m.elements;

      // reversed depth flips the Z range
      expect(te[10]).toBeCloseTo(1 / (100 - 1), 4); // ~0.0101
      expect(te[14]).toBeCloseTo(100 / (100 - 1), 3); // ~1.0101
    });

    it('throws on invalid coordinate system', () => {
      const m = new Matrix4();
      expect(() =>
        m.makeOrthographic(-1, 1, 1, -1, 1, 100, 9999 as any, false)
      ).toThrowError(/Invalid coordinate system/);
    });
  });

  describe('equals()', () => {
    it('should return true for two identical matrices', () => {
      const a = new Matrix4().makeScale(2, 3, 4);
      const b = new Matrix4().makeScale(2, 3, 4);

      expect(a.equals(b)).toBe(true);
    });

    it('should return true when comparing a matrix to itself', () => {
      const m = new Matrix4().makeRotationX(Math.PI / 4);
      expect(m.equals(m)).toBe(true);
    });

    it('should return false for matrices that differ by one element', () => {
      const a = new Matrix4().makeScale(2, 3, 4);
      const b = new Matrix4().makeScale(2, 3, 4);
      b.elements[5] = 9; // change one element
      expect(a.equals(b)).toBe(false);
    });

    it('should return false for identity vs non-identity matrices', () => {
      const identity = new Matrix4().identity();
      const rotated = new Matrix4().makeRotationZ(Math.PI / 2);

      expect(identity.equals(rotated)).toBe(false);
    });

    it('should return true for two independently cloned but equal matrices', () => {
      const a = new Matrix4().makeTranslation(5, -3, 2);
      const b = a.clone();

      expect(a.equals(b)).toBe(true);
    });

    it('should return false for very small floating-point differences', () => {
      const a = new Matrix4().makeScale(1, 1, 1);
      const b = new Matrix4().makeScale(1, 1, 1);

      // Introduce a tiny rounding difference
      b.elements[10] += 1e-10;

      // Since equals() uses strict equality (===), this should fail
      expect(a.equals(b)).toBe(false);
    });

    it('should handle completely zero matrices correctly', () => {
      const a = new Matrix4().set(
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
      );

      const b = new Matrix4().set(
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
      );

      expect(a.equals(b)).toBe(true);
    });
  });

  describe('fromArray()', () => {
    it('should set elements correctly from an array starting at offset 0', () => {
      const m = new Matrix4();

      const source = [
        11, 21, 31, 41,
        12, 22, 32, 42,
        13, 23, 33, 43,
        14, 24, 34, 44
      ];

      m.fromArray(source);

      expect(Array.from(m.elements)).toEqual(source);
    });

    it('should read elements correctly from an array with an offset', () => {
      const m = new Matrix4();

      const source = [
        // dummy data before the matrix
        0, 0, 0, 0,
        // actual matrix data starts here
        11, 21, 31, 41,
        12, 22, 32, 42,
        13, 23, 33, 43,
        14, 24, 34, 44,
        // extra dummy data after
        99, 99
      ];

      m.fromArray(source, 4);

      expect(Array.from(m.elements)).toEqual([
        11, 21, 31, 41,
        12, 22, 32, 42,
        13, 23, 33, 43,
        14, 24, 34, 44
      ]);
    });

    it('should overwrite previous values', () => {
      const m = new Matrix4();

      m.elements.fill(99);

      const source = [
        1, 2, 3, 4,
        5, 6, 7, 8,
        9, 10, 11, 12,
        13, 14, 15, 16
      ];

      m.fromArray(source);

      expect(Array.from(m.elements)).toEqual(source);
    });

    it('should return this for chaining', () => {
      const m = new Matrix4();
      const arr = new Array(16).fill(1);
      const result = m.fromArray(arr);
      expect(result).toBe(m);
    });
  });

  describe('toArray()', () => {
    it('should write matrix elements into a new array when no array is provided', () => {
      const m = new Matrix4();
      m.set(
        1, 2, 3, 4,
        5, 6, 7, 8,
        9, 10, 11, 12,
        13, 14, 15, 16
      );

      const result = m.toArray([]);
      expect(result).toEqual([
        1, 5, 9, 13,
        2, 6, 10, 14,
        3, 7, 11, 15,
        4, 8, 12, 16
      ]);
    });

    it('should write matrix elements into the provided array starting at offset 0', () => {
      const m = new Matrix4();
      m.set(
        11, 12, 13, 14,
        15, 16, 17, 18,
        19, 20, 21, 22,
        23, 24, 25, 26
      );

      const arr = new Array(16).fill(0);
      const result = m.toArray(arr);

      expect(result).toBe(arr); // should return the same array reference
      expect(result).toEqual([
        11, 15, 19, 23,
        12, 16, 20, 24,
        13, 17, 21, 25,
        14, 18, 22, 26
      ]);
    });

    it('should correctly write elements starting from a given offset', () => {
      const m = new Matrix4();
      m.set(
        1, 2, 3, 4,
        5, 6, 7, 8,
        9, 10, 11, 12,
        13, 14, 15, 16
      );

      const arr = new Array(20).fill(0);
      const offset = 4;
      const result = m.toArray(arr, offset);

      expect(result).toBe(arr);
      expect(result.slice(0, 4)).toEqual([0, 0, 0, 0]); // untouched before offset
      expect(result.slice(4, 20)).toEqual([
        1, 5, 9, 13,
        2, 6, 10, 14,
        3, 7, 11, 15,
        4, 8, 12, 16
      ]);
    });

    it('should not modify unrelated parts of the target array', () => {
      const m = new Matrix4().set(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      );

      const arr = [99, 99, 99, 99, ...new Array(16).fill(0), 88, 88];
      const result = m.toArray(arr, 4);

      expect(result.slice(0, 4)).toEqual([99, 99, 99, 99]); // unchanged before offset
      expect(result.slice(20)).toEqual([88, 88]);           // unchanged after writing
    });
  });
});
