import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Vector3 } from '../../../src/math/Vector3';
import { Matrix3 } from '../../../src/math/Matrix3';
import { Matrix4 } from '../../../src/math/Matrix4';
import { Quaternion } from '../../../src/math/Quaternion';
import { Euler } from '../../../src/math/Euler';
import { PerspectiveCamera } from '../../../src/cameras/PerspectiveCamera';
import { OrthographicCamera } from '../../../src/cameras/OrthographicCamera';
import { Cylindrical } from '../../../src/math/Cylindrical';
import { Spherical } from '../../../src/math/Spherical';
import { Color } from '../../../src/math/Color';
import { BufferAttribute } from '../../../src/core/BufferAttribute';
import { InterleavedBufferAttribute } from '../../../src/core/InterleavedBufferAttribute';
import { InterleavedBuffer } from '../../../src/core/InterleavedBuffer';

describe('Vector3', () => {
  describe('constructor()', () => {

    it('schould create with default values (0, 0, 0)', () => {
      const v = new Vector3();

      expect(v.x).toBe(0);
      expect(v.y).toBe(0);
      expect(v.z).toBe(0);
      expect(v.isVector3).toBe(true);
    });

    it('schould create with given values', () => {
      const v = new Vector3(1, 2, 3);

      expect(v.x).toBe(1);
      expect(v.y).toBe(2);
      expect(v.z).toBe(3);
    });
  });

  describe('set()', () => {
    it('should set x, y, z components correctly', () => {
      const v = new Vector3();
      v.set(4, 5, 6);

      expect(v.x).toBe(4);
      expect(v.y).toBe(5);
      expect(v.z).toBe(6);
    });

    it('should preserve z when z is not provided', () => {
      const v = new Vector3(1, 2, 3);
      v.set(7, 8); // z should remain 3

      expect(v.x).toBe(7);
      expect(v.y).toBe(8);
      expect(v.z).toBe(3);
    });

    it('should return this for chaining', () => {
      const v = new Vector3();
      const returned = v.set(1, 1, 1);

      expect(returned).toBe(v);
    });
  });

  describe('setScalar()', () => {
    it('should set all components to the same scalar value', () => {
      const v = new Vector3();
      v.setScalar(5);

      expect(v.x).toBe(5);
      expect(v.y).toBe(5);
      expect(v.z).toBe(5);
    });

    it('should return this for chaining', () => {
      const v = new Vector3();
      const returned = v.setScalar(2);

      expect(returned).toBe(v);
    });
  });

  describe('Vector3 setX(), setY() setZ()', () => {
    it('setX should update the component and return this', () => {
      const v = new Vector3(1, 2, 3);
      const result = v.setX(10);

      expect(v.x).toBe(10);
      expect(v.y).toBe(2);
      expect(v.z).toBe(3);
      expect(result).toBe(v);
    });

    it('setY should update the component and return this', () => {
      const v = new Vector3(1, 2, 3);
      const result = v.setY(20);

      expect(v.x).toBe(1);
      expect(v.y).toBe(20);
      expect(v.z).toBe(3);
      expect(result).toBe(v);
    });

    it('setZ should update the component and return this', () => {
      const v = new Vector3(1, 2, 3);
      const result = v.setZ(30);

      expect(v.x).toBe(1);
      expect(v.y).toBe(2);
      expect(v.z).toBe(30);
      expect(result).toBe(v);
    });

    it('should support chaining of setX, setY, setZ together', () => {
      const v = new Vector3();
      v.setX(5).setY(6).setZ(7);

      expect(v.x).toBe(5);
      expect(v.y).toBe(6);
      expect(v.z).toBe(7);
    });
  });

  describe('setComponent(), getComponent()', () => {
    it('setComponent should correctly set x, y, z by index', () => {
      const v = new Vector3();

      v.setComponent(0, 10);  // x
      v.setComponent(1, 20);  // y
      v.setComponent(2, 30);  // z

      expect(v.getComponent(0)).toBe(10);
      expect(v.getComponent(1)).toBe(20);
      expect(v.getComponent(2)).toBe(30);
    });

    it('setComponent should return this for chaining', () => {
      const v = new Vector3();
      const result = v.setComponent(0, 5);

      expect(result).toBe(v);
    });

    it('setComponent should throw for out-of-range index', () => {
      const v = new Vector3();

      expect(() => v.setComponent(3, 100)).toThrow(/index is out of range/);
      expect(() => v.setComponent(-1, 100)).toThrow(/index is out of range/);
    });

    it('getComponent should correctly retrieve, component by index', () => {
      const v = new Vector3(1, 2, 3);

      expect(v.getComponent(0)).toBe(1);
      expect(v.getComponent(1)).toBe(2);
      expect(v.getComponent(2)).toBe(3);
    });

    it('getComponent should throw for out-of-range index', () => {
      const v = new Vector3();

      expect(() => v.getComponent(3)).toThrow(/index is out of range/);
      expect(() => v.getComponent(-1)).toThrow(/index is out of range/);
    });

    it('setComponent and getComponent should work together correctly', () => {
      const v = new Vector3();

      v.setComponent(0, 7)
        .setComponent(1, 8)
        .setComponent(2, 9);

      expect(v.getComponent(0)).toBe(7);
      expect(v.getComponent(1)).toBe(8);
      expect(v.getComponent(2)).toBe(9);
    });
  });

  describe('clone()', () => {
    it('should create a new Vector3 with the same component values', () => {
      const v = new Vector3(1, 2, 3);
      const c = v.clone();

      expect(c.x).toBe(1);
      expect(c.y).toBe(2);
      expect(c.z).toBe(3);
      expect(c).not.toBe(v); // different references
    });

    it('mutating clone should not affect the original', () => {
      const v = new Vector3(1, 1, 1);
      const c = v.clone();

      c.set(9, 9, 9); // mutate clone

      expect(v.x).toBe(1);
      expect(v.y).toBe(1);
      expect(v.z).toBe(1);

      expect(c.x).toBe(9);
      expect(c.y).toBe(9);
      expect(c.z).toBe(9);
    });

    it('mutating original should not affect the clone', () => {
      const v = new Vector3(1, 2, 3);
      const c = v.clone();

      v.set(10, 20, 30);  // mutate original

      expect(c.x).toBe(1);
      expect(c.y).toBe(2);
      expect(c.z).toBe(3);

      expect(v.x).toBe(10);
      expect(v.y).toBe(20);
      expect(v.z).toBe(30);
    });

    it('should preserve subclass type when cloning', () => {
      class SubVector3 extends Vector3 {
        extra = 42;
      }

      const v = new SubVector3(7, 8, 9);
      const c = v.clone();

      expect(c).toBeInstanceOf(SubVector3);
      expect(c.x).toBe(7);
      expect(c.y).toBe(8);
      expect(c.z).toBe(9);
      expect((c as SubVector3).extra).toBe(42);
    });
  });

  describe('copy()', () => {
    it('should copy the values from another vector', () => {
      const v1 = new Vector3(1, 2, 3);
      const v2 = new Vector3();

      v2.copy(v1);

      expect(v2.x).toBe(1);
      expect(v2.y).toBe(2);
      expect(v2.z).toBe(3);
    });

    it('should return the same instance for chaining', () => {
      const v1 = new Vector3(4, 5, 6);
      const v2 = new Vector3();

      const result = v2.copy(v1);

      expect(result).toBe(v2);
    });

    it('mutating the source after copy should not affect the target', () => {
      const source = new Vector3(7, 8, 9);
      const target = new Vector3();

      target.copy(source);
      source.set(100, 200, 300); // mutate source

      expect(target.x).toBe(7);
      expect(target.y).toBe(8);
      expect(target.z).toBe(9);
    });

    it('mutating the target after copy should not affect the source', () => {
      const source = new Vector3(10, 20, 30);
      const target = new Vector3();

      target.copy(source);
      target.set(1, 1, 1); // mutate target

      expect(source.x).toBe(10);
      expect(source.y).toBe(20);
      expect(source.z).toBe(30);
    });
  });

  describe('add()', () => {
    it('should correctly add another vector this vector', () => {
      const v1 = new Vector3(1, 2, 3);
      const v2 = new Vector3(4, 5, 6);

      v1.add(v2);

      expect(v1.x).toBe(5);
      expect(v1.y).toBe(7);
      expect(v1.z).toBe(9);
    });

    it('should support chaining by returning this', () => {
      const v1 = new Vector3(1, 1, 1);
      const v2 = new Vector3(2, 2, 2);
      const v3 = new Vector3(3, 3, 3);

      const result = v1.add(v2).add(v3);

      expect(result).toBe(v1);
      expect(v1.x).toBe(6);
      expect(v1.y).toBe(6);
      expect(v1.z).toBe(6);
    });

    it('should not mutate the added vector', () => {
      const v1 = new Vector3(10, 20, 30);
      const v2 = new Vector3(1, 2, 3);

      v1.add(v2);

      expect(v2.x).toBe(1);
      expect(v2.y).toBe(2);
      expect(v2.z).toBe(3);
    });

    it('should work correctly when adding zero vector', () => {
      const v1 = new Vector3(5, -5, 10);
      const zero = new Vector3(0, 0, 0);

      v1.add(zero);

      expect(v1.x).toBe(5);
      expect(v1.y).toBe(-5);
      expect(v1.z).toBe(10);
    });

    it('should correctly vectors with negative components', () => {
      const v1 = new Vector3(-1, -2, -3);
      const v2 = new Vector3(4, -5, -6);

      v1.add(v2);

      expect(v1.x).toBe(3); // -1 + 4
      expect(v1.y).toBe(-7);  // -2 + (-5)
      expect(v1.z).toBe(-9);  // -3 + (-6)
    });
  });

  describe('negate()', () => {
    it('should return the same instance', () => {
      const vector = new Vector3(1, -2, 3);
      const result = vector.negate();
      expect(result).toBe(vector);
    });

    it('should invert all components', () => {
      const vector = new Vector3(1, -2, 3);
      vector.negate();

      expect(vector.x).toBeCloseTo(-1);
      expect(vector.y).toBeCloseTo(2);
      expect(vector.z).toBeCloseTo(-3);
    });

    it('should invert zero components correctly', () => {
      const vector = new Vector3(0, 0, 0);
      vector.negate();

      expect(vector.x).toBeCloseTo(0);
      expect(vector.y).toBeCloseTo(0);
      expect(vector.z).toBeCloseTo(0);
    });

    it('should work for negative initial values', () => {
      const vector = new Vector3(-1, -2, -3);
      vector.negate();

      expect(vector.x).toBeCloseTo(1);
      expect(vector.y).toBeCloseTo(2);
      expect(vector.z).toBeCloseTo(3);
    });

    it('should work for mixed positive and negative values', () => {
      const vector = new Vector3(5, -10, 0.5);
      vector.negate();

      expect(vector.x).toBeCloseTo(-5);
      expect(vector.y).toBeCloseTo(10);
      expect(vector.z).toBeCloseTo(-0.5);
    });
  });

  describe('addScalar()', () => {
    it('should add a scalar to all components', () => {
      const v = new Vector3(1, 2, 3);
      v.addScalar(5);

      expect(v.x).toBe(6);
      expect(v.y).toBe(7);
      expect(v.z).toBe(8);
    });

    it('should handle negative scalars correctly', () => {
      const v = new Vector3(10, 20, 30);
      v.addScalar(-5);

      expect(v.x).toBe(5);
      expect(v.y).toBe(15);
      expect(v.z).toBe(25);
    });

    it('should do nothing if scalar is 0', () => {
      const v = new Vector3(3, -2, 7);
      v.addScalar(0);

      expect(v.x).toBe(3);
      expect(v.y).toBe(-2);
      expect(v.z).toBe(7);
    });

    it('should return itself for chaining', () => {
      const v = new Vector3(1, 1, 1);
      const result = v.addScalar(2);

      expect(result).toBe(v);
    });
  });

  describe('addVectors()', () => {
    it('should set this vector to the sum of two other vectors', () => {
      const a = new Vector3(1, 2, 3);
      const b = new Vector3(4, 5, 6);
      const v = new Vector3();

      v.addVectors(a, b);

      expect(v.x).toBe(5); // 1 + 4
      expect(v.y).toBe(7); // 2 + 5
      expect(v.z).toBe(9); // 3 + 6
    });

    it('should handle negative components correctly', () => {
      const a = new Vector3(-1, 2, -3);
      const b = new Vector3(4, -5, 6);
      const v = new Vector3();

      v.addVectors(a, b);

      expect(v.x).toBe(3);
      expect(v.y).toBe(-3);
      expect(v.z).toBe(3);
    });

    it('should handle zero vectors correctly', () => {
      const a = new Vector3(0, 0, 0);
      const b = new Vector3(5, -5, 10);
      const v = new Vector3();

      v.addVectors(a, b);

      expect(v.x).toBe(5);
      expect(v.y).toBe(-5);
      expect(v.z).toBe(10);
    });

    it('should return itself for chaining', () => {
      const a = new Vector3(1, 1, 1);
      const b = new Vector3(2, 2, 2);
      const v = new Vector3();

      const result = v.addVectors(a, b);

      expect(result).toBe(v);
    });

    it('should not mutate the input vectors', () => {
      const a = new Vector3(1, 2, 3);
      const b = new Vector3(4, 5, 6);
      const v = new Vector3();

      v.addVectors(a, b);

      expect(a.x).toBe(1);
      expect(a.y).toBe(2);
      expect(a.z).toBe(3);

      expect(b.x).toBe(4);
      expect(b.y).toBe(5);
      expect(b.z).toBe(6);
    });
  });

  describe('addScaledVector()', () => {
    it('should add the vector scaled by the scalar to this vector', () => {
      const v = new Vector3(1, 1, 1);
      const w = new Vector3(2, 3, 4);

      v.addScaledVector(w, 2); // v += w * 2

      expect(v.x).toBe(1 + 2 * 2); // 1 + 4 = 5
      expect(v.y).toBe(1 + 3 * 2); // 1 + 6 = 7
      expect(v.z).toBe(1 + 4 * 2); // 1 + 8 = 9
    });

    it('should handle negative scalars correctly', () => {
      const v = new Vector3(5, 5, 5);
      const w = new Vector3(1, 2, 3);

      v.addScaledVector(w, -2); // v += w * -2

      expect(v.x).toBe(5 - 2 * 1); // 5 - 2 = 3
      expect(v.y).toBe(5 - 2 * 2); // 5 - 4 = 1
      expect(v.z).toBe(5 - 2 * 3); // 5 - 6 = -1
    });

    it('should do nothing if scalar is 0', () => {
      const v = new Vector3(10, 20, 30);
      const w = new Vector3(5, 6, 7);

      v.addScaledVector(w, 0); // v += w * 0

      expect(v.x).toBe(10);
      expect(v.y).toBe(20);
      expect(v.z).toBe(30);
    });

    it('should return itself for chaining', () => {
      const v = new Vector3();
      const w = new Vector3(1, 1, 1);

      const result = v.addScaledVector(w, 3);

      expect(result).toBe(v);
    });

    it('should not mutate the added vector', () => {
      const v = new Vector3(0, 0, 0);
      const w = new Vector3(2, 4, 6);

      v.addScaledVector(w, 3); // v += w * 3

      expect(w.x).toBe(2);
      expect(w.y).toBe(4);
      expect(w.z).toBe(6);
    });
  });

  describe('sub()', () => {
    it('should subtract the given vector from this vector', () => {
      const v = new Vector3(5, 7, 9);
      const w = new Vector3(1, 2, 3);

      v.sub(w); // v = v - w

      expect(v.x).toBe(4); // 5 - 1
      expect(v.y).toBe(5); // 7 - 2
      expect(v.z).toBe(6); // 9 - 3
    });

    it('should handle negative components correctly', () => {
      const v = new Vector3(5, -5, 10);
      const w = new Vector3(-2, 3, -4);

      v.sub(w); // v = v - w

      expect(v.x).toBe(7);  // 5 - (-2)
      expect(v.y).toBe(-8); // -5 - 3
      expect(v.z).toBe(14); // 10 - (-4)
    });

    it('should do nothing when subtracting a zero vector', () => {
      const v = new Vector3(3, 4, 5);
      const zero = new Vector3(0, 0, 0);

      v.sub(zero); // v = v - 0

      expect(v.x).toBe(3);
      expect(v.y).toBe(4);
      expect(v.z).toBe(5);
    });

    it('should return itself for chaining', () => {
      const v = new Vector3(1, 1, 1);
      const w = new Vector3(1, 1, 1);

      const result = v.sub(w);

      expect(result).toBe(v);
    });

    it('should not mutate the subtracted vector', () => {
      const v = new Vector3(10, 10, 10);
      const w = new Vector3(1, 2, 3);

      v.sub(w); // v = v - w

      expect(w.x).toBe(1);
      expect(w.y).toBe(2);
      expect(w.z).toBe(3);
    });
  });

  describe('subScalar()', () => {
    it('should subtract the scalar from all components', () => {
      const v = new Vector3(10, 20, 30);

      v.subScalar(5);

      expect(v.x).toBe(5); // 10 - 5
      expect(v.y).toBe(15); // 20 - 5
      expect(v.z).toBe(25); // 30 - 5
    });

    it('should handle negative scalars correctly', () => {
      const v = new Vector3(1, 2, 3);

      v.subScalar(-2);

      expect(v.x).toBe(3); // 1 - (-2)
      expect(v.y).toBe(4); // 2 - (-2)
      expect(v.z).toBe(5); // 3 - (-2)
    });

    it('should do nothing if scalar is 0', () => {
      const v = new Vector3(5, 6, 7);

      v.subScalar(0);

      expect(v.x).toBe(5);  // 5 - 0
      expect(v.y).toBe(6);  // 6 - 0
      expect(v.z).toBe(7);  // 7 - 0
    });

    it('should return itself for chaining', () => {
      const v = new Vector3(10, 10, 10);

      const result = v.subScalar(5);

      expect(result).toBe(v);
    });
  });

  describe('subVectors()', () => {
    it('should set this vector to the difference of two other vectors', () => {
      const a = new Vector3(10, 20, 30);
      const b = new Vector3(1, 2, 3);
      const v = new Vector3();

      v.subVectors(a, b); // v = a - b

      expect(v.x).toBe(9);  // 10 - 1
      expect(v.y).toBe(18); // 20 - 2
      expect(v.z).toBe(27); // 30 - 3
    });

    it('should handle negative components correctly', () => {
      const a = new Vector3(-5, 10, -15);
      const b = new Vector3(5, -10, 15);
      const v = new Vector3();

      v.subVectors(a, b); // v = a - b

      expect(v.x).toBe(-10); // -5 - 5
      expect(v.y).toBe(20);  // 10 - (-10)
      expect(v.z).toBe(-30); // -15 - 15
    });

    it('should handle zero vectors correctly', () => {
      const a = new Vector3(3, 4, 5);
      const b = new Vector3(0, 0, 0);
      const v = new Vector3();

      v.subVectors(a, b); // v = a - 0

      expect(v.x).toBe(3);
      expect(v.y).toBe(4);
      expect(v.z).toBe(5);
    });

    it('should return itself for chaining', () => {
      const a = new Vector3(1, 1, 1);
      const b = new Vector3(2, 2, 3);
      const v = new Vector3();

      const result = v.subVectors(a, b);

      expect(result).toBe(v);
    });

    it('should not mutate the input vectors', () => {
      const a = new Vector3(7, 8, 9);
      const b = new Vector3(1, 2, 3);
      const v = new Vector3();

      v.subVectors(a, b); // v = a - b

      expect(a.x).toBe(7);
      expect(a.y).toBe(8);
      expect(a.z).toBe(9);

      expect(b.x).toBe(1);
      expect(b.y).toBe(2);
      expect(b.z).toBe(3);
    });
  });

  describe('multiply()', () => {
    it('should multiply corresponding components of this vector and given vector', () => {
      const v = new Vector3(2, 3, 4);
      const w = new Vector3(5, 6, 7);

      v.multiply(w); // v = v * w

      expect(v.x).toBe(10); // 2 * 5
      expect(v.y).toBe(18); // 3 * 6
      expect(v.z).toBe(28); // 4 * 7
    });

    it('should handle negative components correctly', () => {
      const v = new Vector3(-2, 3, -4);
      const w = new Vector3(5, -6, 7);

      v.multiply(w); // v = v * w

      expect(v.x).toBe(-10); // -2 * 5
      expect(v.y).toBe(-18); // 3 * -6
      expect(v.z).toBe(-28); // -4 * 7
    });

    it('should handle zero components correctly', () => {
      const v = new Vector3(1, 2, 3);
      const w = new Vector3(0, 1, 0);

      v.multiply(w); // v = v * w

      expect(v.x).toBe(0); // 1 * 0
      expect(v.y).toBe(2); // 2 * 1
      expect(v.z).toBe(0); // 3 * 0
    });

    it('should return itself for chaining', () => {
      const v = new Vector3(1, 1, 1);
      const w = new Vector3(2, 2, 2);

      const result = v.multiply(w);

      expect(result).toBe(v);
    });

    it('should not mutate the multiplied vector', () => {
      const v = new Vector3(2, 3, 4);
      const w = new Vector3(5, 6, 7);

      v.multiply(w); // v = v * w

      expect(w.x).toBe(5);
      expect(w.y).toBe(6);
      expect(w.z).toBe(7);
    });
  });

  describe('multiplyScalar()', () => {
    it('should multiply all components by a positive scalar', () => {
      const v = new Vector3(2, 3, 4);
      v.multiplyScalar(2);

      expect(v.x).toBe(4); // 2 * 2
      expect(v.y).toBe(6); // 3 * 2
      expect(v.z).toBe(8); // 4 * 2
    });

    it('should multiply all components by a negative scalar', () => {
      const v = new Vector3(2, -3, 4);
      v.multiplyScalar(-3);

      expect(v.x).toBe(-6); // 2 * -3
      expect(v.y).toBe(9);  // -3 * -3
      expect(v.z).toBe(-12); // 4 * -3
    });

    it('should set all components to zero when multiplied by 0', () => {
      const v = new Vector3(5, -7, 9);
      v.multiplyScalar(0);

      expect(v.x).toBe(0);
      expect(v.y).toBe(-0); // -0 is a thing in JS/TS (IEEE 754)
      expect(v.z).toBe(0);
    });

    it('should multiply all components by a fractional scalar', () => {
      const v = new Vector3(10, 20, 30);
      v.multiplyScalar(0.5);

      expect(v.x).toBe(5); // 10 * 0.5
      expect(v.y).toBe(10); // 20 * 0.5
      expect(v.z).toBe(15); // 30 * 0.5
    });

    it('should return itself for chaining', () => {
      const v = new Vector3(1, 1, 1);
      const result = v.multiplyScalar(3);

      expect(result).toBe(v);
    });
  });

  describe('multiplyVectors()', () => {
    it('should correctly multiply two vectors component-wise and store the result in this vector', () => {
      const v = new Vector3(2, 3, 4);
      const w = new Vector3(5, 6, 7);
      const result = new Vector3().multiplyVectors(v, w);

      expect(result.x).toBe(10); // 2 * 5
      expect(result.y).toBe(18); // 3 * 6
      expect(result.z).toBe(28); // 4 * 7
    });

    it('should handle negative components correctly', () => {
      const v = new Vector3(-2, 3, -4);
      const w = new Vector3(5, -6, -7);
      const result = new Vector3().multiplyVectors(v, w);

      expect(result.x).toBe(-10); // -2 * 5
      expect(result.y).toBe(-18); // 3 * -6
      expect(result.z).toBe(28); // -4 * -7
    });

    it('should handle zero components correctly', () => {
      const v = new Vector3(0, 3, 0);
      const w = new Vector3(5, 0, -7);
      const result = new Vector3().multiplyVectors(v, w);

      expect(result.x).toBe(0); // 0 * 5
      expect(result.y).toBe(0); // 3 * 0
      expect(result.z).toBe(-0); // 0 * -7 (-0 is a thing in JS/TS (IEEE 754))
    });

    it('should return itself for chaining', () => {
      const v = new Vector3(1, 2, 3);
      const w = new Vector3(4, 5, 6);
      const z = new Vector3();

      const result = z.multiplyVectors(v, w);

      expect(result).toBe(z);
    });

    it('should not mutate the input vectors', () => {
      const v = new Vector3(2, 3, 4);
      const w = new Vector3(5, 6, 7);
      const z = new Vector3();

      z.multiplyVectors(v, w);

      expect(v.x).toBe(2);
      expect(v.y).toBe(3);
      expect(v.z).toBe(4);

      expect(w.x).toBe(5);
      expect(w.y).toBe(6);
      expect(w.z).toBe(7);
    });

    it('should overwrite previous values in this vector', () => {
      const v = new Vector3(2, 2, 2);
      const w = new Vector3(3, 3, 3);
      const z = new Vector3(100, 100, 100);

      z.multiplyVectors(v, w); // z = v * w

      expect(z.x).toBe(6); // 2 * 3
      expect(z.y).toBe(6); // 2 * 3
      expect(z.z).toBe(6); // 2 * 3
    });
  });

  describe('divide()', () => {
    it('should divide corresponding components of this vector by given vector', () => {
      const v = new Vector3(10, 20, 30);
      const w = new Vector3(2, 4, 5);

      v.divide(w); // v = v / w

      expect(v.x).toBe(5);  // 10 / 2
      expect(v.y).toBe(5);  // 20 / 4
      expect(v.z).toBe(6);  // 30 / 5
    });

    it('should handle negative components correctly', () => {
      const v = new Vector3(-10, 20, -30);
      const w = new Vector3(2, -4, 5);

      v.divide(w); // v = v / w

      expect(v.x).toBe(-5);  // -10 / 2
      expect(v.y).toBe(-5);  // 20 / -4
      expect(v.z).toBe(-6);  // -30 / 5
    });

    it('should handle fractional results correctly', () => {
      const v = new Vector3(3, 5, 7);
      const w = new Vector3(2, 2, 2);

      v.divide(w); // v = v / w

      expect(v.x).toBe(1.5);  // 3 / 2
      expect(v.y).toBe(2.5);  // 5 / 2
      expect(v.z).toBe(3.5);  // 7 / 2
    });

    it('should return itself for chaining', () => {
      const v = new Vector3(1, 1, 1);
      const w = new Vector3(2, 2, 2);

      const result = v.divide(w);

      expect(result).toBe(v);
    });

    it('should not mutate the input vector', () => {
      const v = new Vector3(10, 20, 30);
      const w = new Vector3(2, 4, 5);

      v.divide(w); // v = v / w

      expect(w.x).toBe(2);
      expect(w.y).toBe(4);
      expect(w.z).toBe(5);
    });

    it('should throw when dividing by a vector with zero components', () => {
      const v = new Vector3(1, 2, 3);
      const w = new Vector3(1, 0, 3); // y component is zero

      expect(() => v.divide(w)).toThrow(/division by zero/);
    });
  });

  describe('divideScalar()', () => {
    it('should divide all components by a positive scalar', () => {
      const v = new Vector3(10, 20, 30);

      v.divideScalar(2);

      expect(v.x).toBe(5);  // 10 / 2
      expect(v.y).toBe(10); // 20 / 2
      expect(v.z).toBe(15); // 30 / 2
    });

    it('should divide all components by a negative scalar', () => {
      const v = new Vector3(10, -20, 30);

      v.divideScalar(-2);

      expect(v.x).toBe(-5);  // 10 / -2
      expect(v.y).toBe(10);  // -20 / -2
      expect(v.z).toBe(-15); // 30 / -2
    });

    it('should handle fractional results correctly', () => {
      const v = new Vector3(3, 6, 9);

      v.divideScalar(0.5);

      expect(v.x).toBe(6);  // 3 / 0.5
      expect(v.y).toBe(12); // 6 / 0.5
      expect(v.z).toBe(18); // 9 / 0.5
    });

    it('should throw when dividing by 0', () => {
      const v = new Vector3(1, 2, 3);

      expect(() => v.divideScalar(0)).toThrow(/division by zero/);
    });

    it('should return itself for chaining', () => {
      const v = new Vector3(10, 10, 10);

      const result = v.divideScalar(2);

      expect(result).toBe(v);
    });
  });

  describe('applyEuler()', () => {
    it('should rotate a vector around X axis', () => {
      const v = new Vector3(0, 1, 0);
      const euler = new Euler(Math.PI / 2, 0, 0, 'XYZ'); // rotate 90 deg around X
      v.applyEuler(euler);

      // Y becomes Z, Z becomes -Y
      expect(v.x).toBeCloseTo(0);
      expect(v.y).toBeCloseTo(0);
      expect(v.z).toBeCloseTo(1);
    });

    it('should rotate a vector around Y axis', () => {
      const v = new Vector3(1, 0, 0);
      const euler = new Euler(0, Math.PI / 2, 0, 'XYZ'); // rotate 90 deg around Y
      v.applyEuler(euler);

      // X becomes Z, Z becomes -X
      expect(v.x).toBeCloseTo(0);
      expect(v.y).toBeCloseTo(0);
      expect(v.z).toBeCloseTo(-1);
    });

    it('should rotate a vector around Z axis', () => {
      const v = new Vector3(1, 0, 0);
      const euler = new Euler(0, 0, Math.PI / 2, 'XYZ'); // rotate 90 deg around Z
      v.applyEuler(euler);

      // X becomes Y, Y becomes -X
      expect(v.x).toBeCloseTo(0);
      expect(v.y).toBeCloseTo(1);
      expect(v.z).toBeCloseTo(0);
    });

    it('should support chaining', () => {
      const v = new Vector3(1, 0, 0);
      const euler = new Euler(0, 0, Math.PI / 2, 'XYZ');
      const result = v.applyEuler(euler);
      expect(result).toBe(v); // returns same instance
    });

    it('should rotate zero vector to remain zero', () => {
      const v = new Vector3(0, 0, 0);
      const euler = new Euler(Math.PI / 3, Math.PI / 4, Math.PI / 6, 'XYZ');
      v.applyEuler(euler);
      expect(v.x).toBeCloseTo(0);
      expect(v.y).toBeCloseTo(0);
      expect(v.z).toBeCloseTo(0);
    });
  });

  describe('applyAxisAngle()', () => {
    it('should rotate vector 90 degrees around X axis', () => {
      const v = new Vector3(0, 1, 0);
      const axis = new Vector3(1, 0, 0);
      v.applyAxisAngle(axis, Math.PI / 2);

      // Y becomes Z, Z becomes -Y
      expect(v.x).toBeCloseTo(0);
      expect(v.y).toBeCloseTo(0);
      expect(v.z).toBeCloseTo(1);
    });

    it('should rotate vector 90 degrees around Y axis', () => {
      const v = new Vector3(1, 0, 0);
      const axis = new Vector3(0, 1, 0);
      v.applyAxisAngle(axis, Math.PI / 2);

      // X becomes Z, Z becomes -X
      expect(v.x).toBeCloseTo(0);
      expect(v.y).toBeCloseTo(0);
      expect(v.z).toBeCloseTo(-1);
    });

    it('should rotate vector 90 degrees around Z axis', () => {
      const v = new Vector3(1, 0, 0);
      const axis = new Vector3(0, 0, 1);
      v.applyAxisAngle(axis, Math.PI / 2);

      // X becomes Y, Y becomes -X
      expect(v.x).toBeCloseTo(0);
      expect(v.y).toBeCloseTo(1);
      expect(v.z).toBeCloseTo(0);
    });

    it('should support chaining', () => {
      const v = new Vector3(1, 0, 0);
      const axis = new Vector3(0, 0, 1);
      const result = v.applyAxisAngle(axis, Math.PI / 2);
      expect(result).toBe(v); // returns same instance
    });

    it('should rotate zero vector to remain zero', () => {
      const v = new Vector3(0, 0, 0);
      const axis = new Vector3(1, 0, 0);
      v.applyAxisAngle(axis, Math.PI / 4);
      expect(v.x).toBeCloseTo(0);
      expect(v.y).toBeCloseTo(0);
      expect(v.z).toBeCloseTo(0);
    });
  });

  describe('applyMatrix3()', () => {
    it('should apply identity matrix and leave the vector unchanged', () => {
      const v = new Vector3(1, 2, 3);
      const m = new Matrix3();  // identity by default;

      v.applyMatrix3(m);

      expect(v.x).toBeCloseTo(1);
      expect(v.y).toBeCloseTo(2);
      expect(v.z).toBeCloseTo(3);
    });

    it('should apply a scaling matrix correctly', () => {
      // scale x by 2, y by 3, z by 4
      const m = new Matrix3(
        2, 0, 0,
        0, 3, 0,
        0, 0, 4
      );

      const v = new Vector3(1, 1, 1);
      v.applyMatrix3(m);

      expect(v.x).toBeCloseTo(2);
      expect(v.y).toBeCloseTo(3);
      expect(v.z).toBeCloseTo(4);
    });

    it('should apply a rotation matrix (90deg about Z axis)', () => {
      const angle = Math.PI / 2;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      // 2D rotation in  XY plane, Z unchanged
      const m = new Matrix3(
        cos, -sin, 0,
        sin, cos, 0,
        0, 0, 0
      );

      const v = new Vector3(1, 0, 0);
      v.applyMatrix3(m);

      // (1, 0, 0) rotated 90deg around Z -> (0, 1, 0);
      expect(v.x).toBeCloseTo(0);
      expect(v.y).toBeCloseTo(1);
      expect(v.z).toBeCloseTo(0);
    });

    it('should support chaining (returns this)', () => {
      const m = new Matrix3();  // identity
      const v = new Vector3(1, 2, 3);

      const result = v.applyMatrix3(m);
      expect(result).toBe(v);
    });
  });

  describe('lengthSq()', () => {
    it('should return 0 for the zero vector', () => {
      const v = new Vector3(0, 0, 0);

      expect(v.lengthSq()).toBe(0);
    });

    it('should return the correct squared length for positive components', () => {
      const v = new Vector3(3, 4, 12) // lengthSq(v) = 169

      expect(v.lengthSq()).toBe(169);
    });

    it('should return the correct square length for negative components', () => {
      const v = new Vector3(-3, -4, -12); // lengthSq(v) = 169

      expect(v.lengthSq()).toBe(169);
    });

    it('should handle fractional components correctly', () => {
      const v = new Vector3(0.5, 0.5, 0.5); // lengthSq(v) = 0.75

      expect(v.lengthSq()).toBeCloseTo(0.75);
    });
  });

  describe('length()', () => {
    it('should return 0 for the zero vector', () => {
      const v = new Vector3(0, 0, 0); // length(v) = 0

      expect(v.length()).toBe(0);
    });

    it('should return correct length for positive components', () => {
      const v = new Vector3(3, 4, 12);  // length(v) = 13

      expect(v.length()).toBe(13);
    });

    it('should return correct length for negative components', () => {
      const v = new Vector3(-3, -4, -12); // length(v) = 13

      expect(v.length()).toBe(13);
    });

    it('should handle fractional components correctly', () => {
      const v = new Vector3(0.5, 0.5, 0.5)  // length(v) = 0.75

      expect(v.length()).toBeCloseTo(Math.sqrt(0.75));
    });
  });

  describe('manhattanLength()', () => {
    it('returns 0 for a zero vector', () => {
      const v = new Vector3(0, 0, 0);
      expect(v.manhattanLength()).toBe(0);
    });

    it('computes the Manhattan length for positive components', () => {
      const v = new Vector3(1, 2, 3);
      expect(v.manhattanLength()).toBe(6); // 1 + 2 + 3
    });

    it('computes the Manhattan length for negative components', () => {
      const v = new Vector3(-1, -2, -3);
      expect(v.manhattanLength()).toBe(6); // |-1| + |-2| + |-3|
    });

    it('computes the Manhattan length for mixed positive and negative components', () => {
      const v = new Vector3(-1, 2, -3);
      expect(v.manhattanLength()).toBe(6); // |-1| + |2| + |-3|
    });

    it('works with floating point numbers', () => {
      const v = new Vector3(1.5, -2.5, 3.5);
      expect(v.manhattanLength()).toBeCloseTo(7.5); // 1.5 + 2.5 + 3.5
    });
  });

  describe('normalize()', () => {
    it('should normalize a non-zero vector to length 1 ', () => {
      const v = new Vector3(3, 4, 0)  // length = 5

      v.normalize();

      expect(v.length()).toBeCloseTo(1);
      // direction should remain  the same (proportional component)
      expect(v.x / v.y).toBeCloseTo(3 / 4);
    });

    it('should handle negative components correctly', () => {
      const v = new Vector3(-2, -3, -6);

      v.normalize();

      expect(v.length()).toBeCloseTo(1);
      // direction check
      expect(v.x / v.y).toBeCloseTo(-2 / -3);
      expect(v.y / v.z).toBeCloseTo(-3 / -6);
    });

    it('should leave the zero vector unchanged (edge case)', () => {
      const v = new Vector3(0, 0, 0);
      v.normalize();
      // Since length() || 1 => divideScalar(1)
      expect(v.x).toBe(0);
      expect(v.y).toBe(0);
      expect(v.z).toBe(0);
    });

    it('should be chainable', () => {
      const v = new Vector3(10, 0, 0);
      const result = v.normalize();
      expect(result).toBe(v);
    });
  });

  describe('setLength()', () => {
    it('sets the length of a non-zero vector correctly', () => {
      const v = new Vector3(1, 2, 2);
      const newLength = 5;
      v.setLength(newLength);
      const length = Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2);
      expect(length).toBeCloseTo(newLength);
    });

    it('does not change the direction of the vector', () => {
      const v = new Vector3(3, 0, 4);
      const originalDirection = { x: v.x / Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2), y: v.y / Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2), z: v.z / Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2) };
      v.setLength(10);
      const newDirection = { x: v.x / Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2), y: v.y / Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2), z: v.z / Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2) };
      expect(newDirection.x).toBeCloseTo(originalDirection.x);
      expect(newDirection.y).toBeCloseTo(originalDirection.y);
      expect(newDirection.z).toBeCloseTo(originalDirection.z);
    });

    it('returns the vector itself (method chaining)', () => {
      const v = new Vector3(1, 1, 1);
      const returned = v.setLength(2);
      expect(returned).toBe(v);
    });

    it('handles zero vector by leaving it as zero', () => {
      const v = new Vector3(0, 0, 0);
      v.setLength(5);
      expect(v.x).toBe(0);
      expect(v.y).toBe(0);
      expect(v.z).toBe(0);
    });

    it('works with floating-point lengths', () => {
      const v = new Vector3(2, 2, 1);
      v.setLength(3.5);
      const length = Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2);
      expect(length).toBeCloseTo(3.5);
    });
  });

  describe('lerp()', () => {
    it('returns itself (method chaining)', () => {
      const v1 = new Vector3(1, 2, 3);
      const v2 = new Vector3(4, 5, 6);
      const result = v1.lerp(v2, 0.5);
      expect(result).toBe(v1);
    });

    it('alpha = 0 returns the original vector', () => {
      const v1 = new Vector3(1, 2, 3);
      const v2 = new Vector3(4, 5, 6);
      v1.lerp(v2, 0);
      expect(v1.x).toBe(1);
      expect(v1.y).toBe(2);
      expect(v1.z).toBe(3);
    });

    it('alpha = 1 returns the target vector', () => {
      const v1 = new Vector3(1, 2, 3);
      const v2 = new Vector3(4, 5, 6);
      v1.lerp(v2, 1);
      expect(v1.x).toBe(4);
      expect(v1.y).toBe(5);
      expect(v1.z).toBe(6);
    });

    it('alpha = 0.5 interpolates halfway between vectors', () => {
      const v1 = new Vector3(0, 0, 0);
      const v2 = new Vector3(2, 4, 6);
      v1.lerp(v2, 0.5);
      expect(v1.x).toBeCloseTo(1);
      expect(v1.y).toBeCloseTo(2);
      expect(v1.z).toBeCloseTo(3);
    });

    it('works with alpha outside 0-1 range (extrapolation)', () => {
      const v1 = new Vector3(1, 1, 1);
      const v2 = new Vector3(2, 2, 2);
      v1.lerp(v2, 1.5); // should extrapolate
      expect(v1.x).toBeCloseTo(2.5);
      expect(v1.y).toBeCloseTo(2.5);
      expect(v1.z).toBeCloseTo(2.5);

      const v3 = new Vector3(2, 2, 2);
      const v4 = new Vector3(4, 4, 4);
      v3.lerp(v4, -0.5); // extrapolate backward
      expect(v3.x).toBeCloseTo(1);
      expect(v3.y).toBeCloseTo(1);
      expect(v3.z).toBeCloseTo(1);
    });
  });

  describe('lerpVectors', () => {
    it('returns itself (method chaining)', () => {
      const v = new Vector3(0, 0, 0);
      const v1 = new Vector3(1, 2, 3);
      const v2 = new Vector3(4, 5, 6);
      const result = v.lerpVectors(v1, v2, 0.5);
      expect(result).toBe(v);
    });

    it('alpha = 0 sets this vector to v1', () => {
      const v = new Vector3();
      const v1 = new Vector3(1, 2, 3);
      const v2 = new Vector3(4, 5, 6);
      v.lerpVectors(v1, v2, 0);
      expect(v.x).toBe(1);
      expect(v.y).toBe(2);
      expect(v.z).toBe(3);
    });

    it('alpha = 1 sets this vector to v2', () => {
      const v = new Vector3();
      const v1 = new Vector3(1, 2, 3);
      const v2 = new Vector3(4, 5, 6);
      v.lerpVectors(v1, v2, 1);
      expect(v.x).toBe(4);
      expect(v.y).toBe(5);
      expect(v.z).toBe(6);
    });

    it('alpha = 0.5 interpolates halfway between v1 and v2', () => {
      const v = new Vector3();
      const v1 = new Vector3(0, 0, 0);
      const v2 = new Vector3(2, 4, 6);
      v.lerpVectors(v1, v2, 0.5);
      expect(v.x).toBeCloseTo(1);
      expect(v.y).toBeCloseTo(2);
      expect(v.z).toBeCloseTo(3);
    });

    it('supports extrapolation for alpha outside [0,1]', () => {
      const v = new Vector3();
      const v1 = new Vector3(1, 1, 1);
      const v2 = new Vector3(2, 2, 2);

      // alpha > 1
      v.lerpVectors(v1, v2, 1.5);
      expect(v.x).toBeCloseTo(2.5);
      expect(v.y).toBeCloseTo(2.5);
      expect(v.z).toBeCloseTo(2.5);

      // alpha < 0
      v.lerpVectors(v1, v2, -0.5);
      expect(v.x).toBeCloseTo(0.5);
      expect(v.y).toBeCloseTo(0.5);
      expect(v.z).toBeCloseTo(0.5);
    });

    it('works with floating point vectors and alpha', () => {
      const v = new Vector3();
      const v1 = new Vector3(1.2, 2.4, 3.6);
      const v2 = new Vector3(4.8, 5.6, 6.4);
      const alpha = 0.25;
      v.lerpVectors(v1, v2, alpha);
      expect(v.x).toBeCloseTo(1.2 + (4.8 - 1.2) * alpha);
      expect(v.y).toBeCloseTo(2.4 + (5.6 - 2.4) * alpha);
      expect(v.z).toBeCloseTo(3.6 + (6.4 - 3.6) * alpha);
    });
  });

  describe('cross()', () => {
    it('returns itself (method chaining)', () => {
      const v1 = new Vector3(1, 0, 0);
      const v2 = new Vector3(0, 1, 0);
      const result = v1.cross(v2);
      expect(result).toBe(v1);
    });

    it('computes the cross product of two orthogonal vectors', () => {
      const v1 = new Vector3(1, 0, 0);
      const v2 = new Vector3(0, 1, 0);
      v1.cross(v2);
      expect(v1.x).toBeCloseTo(0);
      expect(v1.y).toBeCloseTo(0);
      expect(v1.z).toBeCloseTo(1); // x × y = z
    });

    it('produces a zero vector when crossing with itself', () => {
      const v = new Vector3(1, 2, 3);
      v.cross(v);
      expect(v.x).toBeCloseTo(0);
      expect(v.y).toBeCloseTo(0);
      expect(v.z).toBeCloseTo(0);
    });

    it('produces a zero vector when crossing parallel vectors', () => {
      const v1 = new Vector3(2, 2, 2);
      const v2 = new Vector3(4, 4, 4); // parallel to v1
      v1.cross(v2);
      expect(v1.x).toBeCloseTo(0);
      expect(v1.y).toBeCloseTo(0);
      expect(v1.z).toBeCloseTo(0);
    });

    it('computes the cross product correctly for general vectors', () => {
      const v1 = new Vector3(1, 2, 3);
      const v2 = new Vector3(4, 5, 6);
      v1.cross(v2);
      // formula: (y1*z2 - z1*y2, z1*x2 - x1*z2, x1*y2 - y1*x2)
      expect(v1.x).toBeCloseTo(2 * 6 - 3 * 5); // -3
      expect(v1.y).toBeCloseTo(3 * 4 - 1 * 6); // 6
      expect(v1.z).toBeCloseTo(1 * 5 - 2 * 4); // -3
    });

    it('works with zero vector', () => {
      const v1 = new Vector3(0, 0, 0);
      const v2 = new Vector3(1, 2, 3);
      v1.cross(v2);
      expect(v1.x).toBe(0);
      expect(v1.y).toBe(0);
      expect(v1.z).toBe(0);
    });
  });

  describe('crossVectors()', () => {
    it('should compute the correct cross product of two perpendicular unit vectors', () => {
      const a = new Vector3(1, 0, 0); // x-axis
      const b = new Vector3(0, 1, 0); // y-axis
      const result = new Vector3().crossVectors(a, b);

      expect(result.x).toBeCloseTo(0);
      expect(result.y).toBeCloseTo(0);
      expect(result.z).toBeCloseTo(1); // right-hand rule → z-axis
    });

    it('should produce the opposite direction if vector order is swapped', () => {
      const a = new Vector3(1, 0, 0);
      const b = new Vector3(0, 1, 0);
      const result = new Vector3().crossVectors(b, a);

      expect(result.x).toBeCloseTo(0);
      expect(result.y).toBeCloseTo(0);
      expect(result.z).toBeCloseTo(-1);
    });

    it('should return a vector perpendicular to both input vectors', () => {
      const a = new Vector3(2, 3, 4);
      const b = new Vector3(5, 6, 7);
      const result = new Vector3().crossVectors(a, b);

      // Dot product should be zero if perpendicular
      const dotA = result.dot(a);
      const dotB = result.dot(b);

      expect(dotA).toBeCloseTo(0);
      expect(dotB).toBeCloseTo(0);
    });

    it('should handle parallel vectors (cross product = zero vector)', () => {
      const a = new Vector3(1, 2, 3);
      const b = new Vector3(2, 4, 6); // b = 2 * a
      const result = new Vector3().crossVectors(a, b);

      expect(result.x).toBeCloseTo(0);
      expect(result.y).toBeCloseTo(0);
      expect(result.z).toBeCloseTo(0);
    });

    it('should return the same instance (this)', () => {
      const a = new Vector3(1, 0, 0);
      const b = new Vector3(0, 1, 0);
      const v = new Vector3();

      const returned = v.crossVectors(a, b);
      expect(returned).toBe(v); // same reference
    });
  });

  describe('projectOnVector()', () => {
    it('returns itself (method chaining)', () => {
      const v1 = new Vector3(1, 2, 3);
      const v2 = new Vector3(4, 5, 6);
      const result = v1.projectOnVector(v2);
      expect(result).toBe(v1);
    });

    it('projects correctly onto a non-zero vector', () => {
      const v1 = new Vector3(3, 4, 0);
      const v2 = new Vector3(1, 0, 0);
      v1.projectOnVector(v2);
      expect(v1.x).toBeCloseTo(3);
      expect(v1.y).toBeCloseTo(0);
      expect(v1.z).toBeCloseTo(0);
    });

    it('projects correctly when vectors are perpendicular (result is zero vector)', () => {
      const v1 = new Vector3(0, 1, 0);
      const v2 = new Vector3(1, 0, 0);
      v1.projectOnVector(v2);
      expect(v1.x).toBeCloseTo(0);
      expect(v1.y).toBeCloseTo(0);
      expect(v1.z).toBeCloseTo(0);
    });

    it('projects correctly when vectors are parallel', () => {
      const v1 = new Vector3(2, 2, 2);
      const v2 = new Vector3(1, 1, 1);
      v1.projectOnVector(v2);
      // scalar = (v1 dot v2) / (v2 dot v2) = (6)/(3) = 2
      // projected = v2 * scalar = (1,1,1)*2 = (2,2,2)
      expect(v1.x).toBeCloseTo(2);
      expect(v1.y).toBeCloseTo(2);
      expect(v1.z).toBeCloseTo(2);
    });

    it('projects onto a zero vector sets this vector to zero', () => {
      const v1 = new Vector3(1, 2, 3);
      const v2 = new Vector3(0, 0, 0);
      v1.projectOnVector(v2);
      expect(v1.x).toBe(0);
      expect(v1.y).toBe(0);
      expect(v1.z).toBe(0);
    });

    it('works with floating point vectors', () => {
      const v1 = new Vector3(1.5, 2.5, 3.5);
      const v2 = new Vector3(0.5, 1.5, -0.5);
      v1.projectOnVector(v2);

      const scalar = (0.5 * 1.5 + 1.5 * 2.5 + -0.5 * 3.5) / (0.5 ** 2 + 1.5 ** 2 + (-0.5) ** 2); // compute expected
      expect(v1.x).toBeCloseTo(0.5 * scalar);
      expect(v1.y).toBeCloseTo(1.5 * scalar);
      expect(v1.z).toBeCloseTo(-0.5 * scalar);
    });
  });

  describe('projectOnPlane()', () => {
    it('returns itself (method chaining)', () => {
      const v = new Vector3(1, 2, 3);
      const normal = new Vector3(0, 1, 0);
      const result = v.projectOnPlane(normal);
      expect(result).toBe(v);
    });

    it('projects a vector perpendicular to the plane normal correctly', () => {
      const v = new Vector3(1, 2, 3);
      const normal = new Vector3(0, 1, 0); // y-axis normal
      v.projectOnPlane(normal);
      // result should have y component zero (perpendicular to normal)
      expect(v.y).toBeCloseTo(0);
    });

    it('leaves a vector on the plane unchanged', () => {
      const v = new Vector3(1, 0, 2); // already on plane y=0
      const normal = new Vector3(0, 1, 0);
      const original = v.clone();
      v.projectOnPlane(normal);
      expect(v.x).toBeCloseTo(original.x);
      expect(v.y).toBeCloseTo(original.y);
      expect(v.z).toBeCloseTo(original.z);
    });

    it('projects a vector along the normal to zero', () => {
      const v = new Vector3(0, 5, 0);
      const normal = new Vector3(0, 1, 0);
      v.projectOnPlane(normal);
      expect(v.x).toBeCloseTo(0);
      expect(v.y).toBeCloseTo(0);
      expect(v.z).toBeCloseTo(0);
    });

    it('works with arbitrary plane normals and floating-point vectors', () => {
      const v = new Vector3(3, 4, 5);
      const normal = new Vector3(1 / Math.sqrt(3), 1 / Math.sqrt(3), 1 / Math.sqrt(3)); // normalized diagonal
      v.projectOnPlane(normal);
      // dot product of v and normal after projection should be close to 0
      const dot = v.x * normal.x + v.y * normal.y + v.z * normal.z;
      expect(dot).toBeCloseTo(0);
    });

    it('works with negative components', () => {
      const v = new Vector3(-2, -3, -4);
      const normal = new Vector3(0, 1, 0);
      v.projectOnPlane(normal);
      expect(v.y).toBeCloseTo(0);
    });
  });

  describe('reflect()', () => {
    it('returns itself (method chaining)', () => {
      const v = new Vector3(1, 2, 3);
      const normal = new Vector3(0, 1, 0);
      const result = v.reflect(normal);
      expect(result).toBe(v);
    });

    it('reflects a vector across the x-axis plane (normal = y)', () => {
      const v = new Vector3(1, -2, 3);
      const normal = new Vector3(0, 1, 0); // y-axis normal
      v.reflect(normal);
      expect(v.x).toBeCloseTo(1);
      expect(v.y).toBeCloseTo(2); // flipped
      expect(v.z).toBeCloseTo(3);
    });

    it('reflects a vector along the normal (reverses direction)', () => {
      const v = new Vector3(0, 5, 0);
      const normal = new Vector3(0, 1, 0);
      v.reflect(normal);
      expect(v.x).toBeCloseTo(0);
      expect(v.y).toBeCloseTo(-5);
      expect(v.z).toBeCloseTo(0);
    });

    it('reflects a vector perpendicular to the normal (unchanged)', () => {
      const v = new Vector3(3, 0, 4);
      const normal = new Vector3(0, 1, 0);
      const original = v.clone();
      v.reflect(normal);
      expect(v.x).toBeCloseTo(original.x);
      expect(v.y).toBeCloseTo(original.y);
      expect(v.z).toBeCloseTo(original.z);
    });

    it('reflects correctly for an arbitrary normalized normal', () => {
      const v = new Vector3(1, 2, 3);
      const normal = new Vector3(1 / Math.sqrt(3), 1 / Math.sqrt(3), 1 / Math.sqrt(3));
      v.reflect(normal);

      // The reflected vector should satisfy: reflected · normal = -(original · normal)
      const dotOriginal = 1 * normal.x + 2 * normal.y + 3 * normal.z;
      const dotReflected = v.x * normal.x + v.y * normal.y + v.z * normal.z;
      expect(dotReflected).toBeCloseTo(-dotOriginal);
    });

    it('works with negative components', () => {
      const v = new Vector3(-1, -2, -3);
      const normal = new Vector3(0, 1, 0);
      v.reflect(normal);
      expect(v.x).toBeCloseTo(-1);
      expect(v.y).toBeCloseTo(2); // flipped
      expect(v.z).toBeCloseTo(-3);
    });
  });

  describe('angleTo()', () => {
    it('returns 0 for parallel vectors in the same direction', () => {
      const v1 = new Vector3(1, 0, 0);
      const v2 = new Vector3(2, 0, 0);
      expect(v1.angleTo(v2)).toBeCloseTo(0);
    });

    it('returns π for parallel vectors in opposite directions', () => {
      const v1 = new Vector3(1, 0, 0);
      const v2 = new Vector3(-1, 0, 0);
      expect(v1.angleTo(v2)).toBeCloseTo(Math.PI);
    });

    it('returns π/2 for perpendicular vectors', () => {
      const v1 = new Vector3(1, 0, 0);
      const v2 = new Vector3(0, 1, 0);
      expect(v1.angleTo(v2)).toBeCloseTo(Math.PI / 2);
    });

    it('returns π/2 if one vector is zero', () => {
      const v1 = new Vector3(0, 0, 0);
      const v2 = new Vector3(1, 2, 3);
      expect(v1.angleTo(v2)).toBeCloseTo(Math.PI / 2);
    });

    it('returns π/2 if both vectors are zero', () => {
      const v1 = new Vector3(0, 0, 0);
      const v2 = new Vector3(0, 0, 0);
      expect(v1.angleTo(v2)).toBeCloseTo(Math.PI / 2);
    });

    it('computes the correct angle for arbitrary vectors', () => {
      const v1 = new Vector3(1, 2, 3);
      const v2 = new Vector3(4, 5, 6);
      const dot = 1 * 4 + 2 * 5 + 3 * 6;
      const len1 = Math.sqrt(1 ** 2 + 2 ** 2 + 3 ** 2);
      const len2 = Math.sqrt(4 ** 2 + 5 ** 2 + 6 ** 2);
      const expectedAngle = Math.acos(dot / (len1 * len2));
      expect(v1.angleTo(v2)).toBeCloseTo(expectedAngle);
    });

    it('handles floating-point inaccuracies (clamping)', () => {
      const v1 = new Vector3(1, 0, 0);
      const v2 = new Vector3(1 + 1e-12, 0, 0); // tiny numerical error
      const angle = v1.angleTo(v2);
      expect(angle).toBeCloseTo(0);
    });
  });

  describe('distanceToSquared()', () => {
    it('returns 0 for the same vector', () => {
      const v1 = new Vector3(1, 2, 3);
      expect(v1.distanceToSquared(v1)).toBe(0);
    });

    it('computes the correct squared distance for positive components', () => {
      const v1 = new Vector3(1, 2, 3);
      const v2 = new Vector3(4, 6, 8);
      // dx=3, dy=4, dz=5 => 3^2+4^2+5^2 = 50
      expect(v1.distanceToSquared(v2)).toBe(50);
    });

    it('computes the correct squared distance with negative components', () => {
      const v1 = new Vector3(-1, -2, -3);
      const v2 = new Vector3(4, 0, -1);
      // dx=5, dy=2, dz=2 => 5^2+2^2+2^2 = 33
      expect(v1.distanceToSquared(v2)).toBe(33);
    });

    it('is symmetric', () => {
      const v1 = new Vector3(1, 2, 3);
      const v2 = new Vector3(4, 5, 6);
      expect(v1.distanceToSquared(v2)).toBe(v2.distanceToSquared(v1));
    });

    it('works with floating-point numbers', () => {
      const v1 = new Vector3(1.5, 2.5, 3.5);
      const v2 = new Vector3(4.2, 5.1, 6.3);
      const dx = 1.5 - 4.2; // -2.7
      const dy = 2.5 - 5.1; // -2.6
      const dz = 3.5 - 6.3; // -2.8
      const expected = dx * dx + dy * dy + dz * dz;
      expect(v1.distanceToSquared(v2)).toBeCloseTo(expected);
    });
  });

  describe('distanceTo()', () => {
    it('returns 0 for the same vector', () => {
      const v1 = new Vector3(1, 2, 3);
      expect(v1.distanceTo(v1)).toBe(0);
    });

    it('computes the correct distance for positive components', () => {
      const v1 = new Vector3(1, 2, 3);
      const v2 = new Vector3(4, 6, 8);
      // dx=3, dy=4, dz=5 => sqrt(3^2+4^2+5^2) = sqrt(50)
      expect(v1.distanceTo(v2)).toBeCloseTo(Math.sqrt(50));
    });

    it('computes the correct distance with negative components', () => {
      const v1 = new Vector3(-1, -2, -3);
      const v2 = new Vector3(4, 0, -1);
      // dx=5, dy=2, dz=2 => sqrt(5^2+2^2+2^2) = sqrt(33)
      expect(v1.distanceTo(v2)).toBeCloseTo(Math.sqrt(33));
    });

    it('is symmetric', () => {
      const v1 = new Vector3(1, 2, 3);
      const v2 = new Vector3(4, 5, 6);
      expect(v1.distanceTo(v2)).toBeCloseTo(v2.distanceTo(v1));
    });

    it('works with floating-point numbers', () => {
      const v1 = new Vector3(1.5, 2.5, 3.5);
      const v2 = new Vector3(4.2, 5.1, 6.3);
      const dx = 1.5 - 4.2; // -2.7
      const dy = 2.5 - 5.1; // -2.6
      const dz = 3.5 - 6.3; // -2.8
      const expected = Math.sqrt(dx * dx + dy * dy + dz * dz);
      expect(v1.distanceTo(v2)).toBeCloseTo(expected);
    });
  });

  describe('manhattanDistanceTo()', () => {
    it('returns 0 for the same vector', () => {
      const v1 = new Vector3(1, 2, 3);
      expect(v1.manhattanDistanceTo(v1)).toBe(0);
    });

    it('computes correct distance for positive components', () => {
      const v1 = new Vector3(1, 2, 3);
      const v2 = new Vector3(4, 6, 8);
      // |3| + |4| + |5| = 12
      expect(v1.manhattanDistanceTo(v2)).toBe(12);
    });

    it('computes correct distance with negative components', () => {
      const v1 = new Vector3(-1, -2, -3);
      const v2 = new Vector3(4, 0, -1);
      // |(-1)-4| + |(-2)-0| + |(-3)-(-1)| = 5 + 2 + 2 = 9
      expect(v1.manhattanDistanceTo(v2)).toBe(9);
    });

    it('is symmetric', () => {
      const v1 = new Vector3(1, 2, 3);
      const v2 = new Vector3(4, 5, 6);
      expect(v1.manhattanDistanceTo(v2)).toBe(v2.manhattanDistanceTo(v1));
    });

    it('works with floating-point numbers', () => {
      const v1 = new Vector3(1.5, 2.5, 3.5);
      const v2 = new Vector3(4.2, 5.1, 6.3);
      const expected = Math.abs(1.5 - 4.2) + Math.abs(2.5 - 5.1) + Math.abs(3.5 - 6.3);
      expect(v1.manhattanDistanceTo(v2)).toBeCloseTo(expected);
    });
  });

  describe('setFromSphericalCoords()', () => {
    it('returns itself (method chaining)', () => {
      const v = new Vector3();
      const result = v.setFromSphericalCoords(1, Math.PI / 2, 0);
      expect(result).toBe(v);
    });

    it('radius = 0 sets vector to origin', () => {
      const v = new Vector3();
      v.setFromSphericalCoords(0, Math.PI / 4, Math.PI / 3);
      expect(v.x).toBeCloseTo(0);
      expect(v.y).toBeCloseTo(0);
      expect(v.z).toBeCloseTo(0);
    });

    it('phi = 0 points along positive y-axis', () => {
      const v = new Vector3();
      v.setFromSphericalCoords(5, 0, Math.PI / 3);
      expect(v.x).toBeCloseTo(0);
      expect(v.y).toBeCloseTo(5);
      expect(v.z).toBeCloseTo(0);
    });

    it('phi = π points along negative y-axis', () => {
      const v = new Vector3();
      v.setFromSphericalCoords(2, Math.PI, Math.PI / 4);
      expect(v.x).toBeCloseTo(0);
      expect(v.y).toBeCloseTo(-2);
      expect(v.z).toBeCloseTo(0);
    });

    it('phi = π/2 lies in x-z plane (y=0)', () => {
      const v = new Vector3();
      const radius = 3;
      const theta = Math.PI / 4;
      v.setFromSphericalCoords(radius, Math.PI / 2, theta);
      expect(v.y).toBeCloseTo(0);
      const expectedXY = Math.sin(theta) * radius;
      const expectedXZ = Math.cos(theta) * radius;
      expect(v.x).toBeCloseTo(expectedXY);
      expect(v.z).toBeCloseTo(expectedXZ);
    });

    it('computes known angles correctly', () => {
      const v = new Vector3();
      const radius = 1;
      const phi = Math.acos(1 / 2); // cos(phi) = 0.5 => y = 0.5
      const theta = Math.PI / 2;
      v.setFromSphericalCoords(radius, phi, theta);
      expect(v.y).toBeCloseTo(Math.cos(phi)); // 0.5
      expect(v.x).toBeCloseTo(Math.sin(phi) * Math.sin(theta)); // sin(phi)*1
      expect(v.z).toBeCloseTo(Math.sin(phi) * Math.cos(theta)); // sin(phi)*0
    });
  });

  describe('setFromSpherical()', () => {
    it('returns itself (method chaining)', () => {
      const v = new Vector3();
      const s = new Spherical(1, Math.PI / 2, 0);
      const result = v.setFromSpherical(s);
      expect(result).toBe(v);
    });

    it('sets vector correctly for known spherical coordinates', () => {
      const v = new Vector3();
      const s = new Spherical
      v.setFromSpherical(s);

      const expectedX = Math.sin(s.phi) * Math.sin(s.theta) * s.radius;
      const expectedY = Math.cos(s.phi) * s.radius;
      const expectedZ = Math.sin(s.phi) * Math.cos(s.theta) * s.radius;

      expect(v.x).toBeCloseTo(expectedX);
      expect(v.y).toBeCloseTo(expectedY);
      expect(v.z).toBeCloseTo(expectedZ);
    });

    it('handles radius = 0 (origin)', () => {
      const v = new Vector3();
      const s = new Spherical(0, Math.PI / 3, Math.PI / 5);
      v.setFromSpherical(s);
      expect(v.x).toBeCloseTo(0);
      expect(v.y).toBeCloseTo(0);
      expect(v.z).toBeCloseTo(0);
    });

    it('phi = 0 points along positive y-axis', () => {
      const v = new Vector3();
      const s = new Spherical(5, 0, 2);
      v.setFromSpherical(s);
      expect(v.x).toBeCloseTo(0);
      expect(v.y).toBeCloseTo(5);
      expect(v.z).toBeCloseTo(0);
    });

    it('phi = π points along negative y-axis', () => {
      const v = new Vector3();
      const s = new Spherical(3, Math.PI, 0);

      v.setFromSpherical(s);
      expect(v.x).toBeCloseTo(0);
      expect(v.y).toBeCloseTo(-3);
      expect(v.z).toBeCloseTo(0);
    });

    it('phi = π/2 lies in x-z plane (y=0)', () => {
      const v = new Vector3();
      const s = new Spherical(2, Math.PI / 2, Math.PI / 3);
      v.setFromSpherical(s);
      expect(v.y).toBeCloseTo(0);
      expect(v.x).toBeCloseTo(Math.sin(s.phi) * Math.sin(s.theta) * s.radius);
      expect(v.z).toBeCloseTo(Math.sin(s.phi) * Math.cos(s.theta) * s.radius);
    });
  });

  describe('setFromCylindricalCoords()', () => {
    it('returns itself (method chaining)', () => {
      const v = new Vector3();
      const result = v.setFromCylindricalCoords(1, Math.PI / 2, 0);
      expect(result).toBe(v);
    });

    it('radius = 0 sets vector on y-axis', () => {
      const v = new Vector3();
      v.setFromCylindricalCoords(0, Math.PI / 4, 3);
      expect(v.x).toBeCloseTo(0);
      expect(v.y).toBeCloseTo(3);
      expect(v.z).toBeCloseTo(0);
    });

    it('theta = 0 places vector on positive z-axis', () => {
      const v = new Vector3();
      v.setFromCylindricalCoords(5, 0, 2);
      expect(v.x).toBeCloseTo(0);
      expect(v.y).toBeCloseTo(2);
      expect(v.z).toBeCloseTo(5);
    });

    it('theta = π/2 places vector on positive x-axis', () => {
      const v = new Vector3();
      v.setFromCylindricalCoords(4, Math.PI / 2, -1);
      expect(v.x).toBeCloseTo(4);
      expect(v.y).toBeCloseTo(-1);
      expect(v.z).toBeCloseTo(0);
    });

    it('computes arbitrary radius, theta, y correctly', () => {
      const radius = 3;
      const theta = Math.PI / 4;
      const y = 2;
      const v = new Vector3();
      v.setFromCylindricalCoords(radius, theta, y);

      const expectedX = radius * Math.sin(theta);
      const expectedZ = radius * Math.cos(theta);
      expect(v.x).toBeCloseTo(expectedX);
      expect(v.y).toBeCloseTo(y);
      expect(v.z).toBeCloseTo(expectedZ);
    });

    it('works with negative radius (flips x-z plane)', () => {
      const radius = -2;
      const theta = Math.PI / 3;
      const y = 1;
      const v = new Vector3();
      v.setFromCylindricalCoords(radius, theta, y);

      expect(v.x).toBeCloseTo(radius * Math.sin(theta));
      expect(v.y).toBeCloseTo(y);
      expect(v.z).toBeCloseTo(radius * Math.cos(theta));
    });
  });

  describe('setFromCylindrical()', () => {
    it('returns itself (method chaining)', () => {
      const v = new Vector3();
      const c = new Cylindrical(1, Math.PI / 2, 0);
      const result = v.setFromCylindrical(c);
      expect(result).toBe(v);
    });

    it('radius = 0 sets vector on y-axis', () => {
      const v = new Vector3();
      const c = new Cylindrical(0, Math.PI / 4, 3);
      v.setFromCylindrical(c);
      expect(v.x).toBeCloseTo(0);
      expect(v.y).toBeCloseTo(3);
      expect(v.z).toBeCloseTo(0);
    });

    it('theta = 0 places vector on positive z-axis', () => {
      const v = new Vector3();
      const c = new Cylindrical(5, 0, 2);
      v.setFromCylindrical(c);
      expect(v.x).toBeCloseTo(0);
      expect(v.y).toBeCloseTo(2);
      expect(v.z).toBeCloseTo(5);
    });

    it('theta = π/2 places vector on positive x-axis', () => {
      const v = new Vector3();
      const c = new Cylindrical(4, Math.PI / 2, -1);
      v.setFromCylindrical(c);
      expect(v.x).toBeCloseTo(4);
      expect(v.y).toBeCloseTo(-1);
      expect(v.z).toBeCloseTo(0);
    });

    it('computes arbitrary cylindrical coordinates correctly', () => {
      const radius = 3;
      const theta = Math.PI / 3;
      const y = 2;
      const c = new Cylindrical(radius, theta, y);
      const v = new Vector3();
      v.setFromCylindrical(c);

      expect(v.x).toBeCloseTo(radius * Math.sin(theta));
      expect(v.y).toBeCloseTo(y);
      expect(v.z).toBeCloseTo(radius * Math.cos(theta));
    });

    it('handles negative radius correctly', () => {
      const radius = -2;
      const theta = Math.PI / 3;
      const y = 1;
      const c = new Cylindrical(radius, theta, y);
      const v = new Vector3();
      v.setFromCylindrical(c);

      expect(v.x).toBeCloseTo(radius * Math.sin(theta));
      expect(v.y).toBeCloseTo(y);
      expect(v.z).toBeCloseTo(radius * Math.cos(theta));
    });
  });

  describe('applyNormalMatrix()', () => {
    it('should apply the matrix and normalize the result', () => {
      // [ 2 0 0 ]
      // [ 0 3 0 ]
      // [ 0 0 4 ]
      const m = new Matrix3(
        2, 0, 0,
        0, 3, 0,
        0, 0, 4
      );

      const v = new Vector3(1, 1, 1);
      v.applyNormalMatrix(m);

      // First, applying the matrix gives (2, 3, 4)
      // Length of (2,3,4) = √(4+9+16) = √29
      const length = Math.sqrt(29);

      expect(v.x).toBeCloseTo(2 / length);
      expect(v.y).toBeCloseTo(3 / length);
      expect(v.z).toBeCloseTo(4 / length);
      expect(v.length()).toBeCloseTo(1);
    });

    it('should work with negative components', () => {
      const m = new Matrix3(
        -1, 0, 0,
        0, -1, 0,
        0, 0, -1
      );

      const v = new Vector3(2, -3, 4);
      v.applyNormalMatrix(m);

      // Matrix flips signs: (-2, 3, -4)
      const length = Math.sqrt(4 + 9 + 16);
      expect(v.x).toBeCloseTo(-2 / length);
      expect(v.y).toBeCloseTo(3 / length);
      expect(v.z).toBeCloseTo(-4 / length);
      expect(v.length()).toBeCloseTo(1);
    });

    it('should be chainable', () => {
      const m = new Matrix3();
      const v = new Vector3(5, 5, 5);
      const result = v.applyNormalMatrix(m);
      expect(result).toBe(v);
    });
  });

  describe('applyMatrix4()', () => {
    it('should correctly apply a translation matrix', () => {
      const v = new Vector3(1, 2, 3);

      // translate by (10, 20, 30);
      const m = new Matrix4(
        1, 0, 0, 10,
        0, 1, 0, 20,
        0, 0, 1, 30,
        0, 0, 0, 1
      );

      v.applyMatrix4(m);

      expect(v.x).toBeCloseTo(11);
      expect(v.y).toBeCloseTo(22);
      expect(v.z).toBeCloseTo(33);
    });

    it('should correctly apply a scaling matrix', () => {
      const v = new Vector3(1, 1, 1);
      // Scale by 2 in all axes
      const m = new Matrix4(
        2, 0, 0, 0,
        0, 2, 0, 0,
        0, 0, 2, 0,
        0, 0, 0, 1
      );

      v.applyMatrix4(m);

      expect(v.x).toBeCloseTo(2);
      expect(v.y).toBeCloseTo(2);
      expect(v.z).toBeCloseTo(2);
    });

    it('should correctly apply perspective divide', () => {
      const v = new Vector3(1, 1, 1);
      // Perspective matrix where w depends on x+y+z
      const m = new Matrix4(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        1, 1, 1, 1   // this will make w = 1+x+y+z = 4
      );

      v.applyMatrix4(m);

      // After multiplication: position = (1,1,1,4)
      // divide by w=4: (0.25, 0.25, 0.25)
      expect(v.x).toBeCloseTo(0.25);
      expect(v.y).toBeCloseTo(0.25);
      expect(v.z).toBeCloseTo(0.25);
    });

    it('should return this for chaining', () => {
      const v = new Vector3(1, 2, 3);
      const m = new Matrix4();
      const result = v.applyMatrix4(m);
      expect(result).toBe(v);
    });
  });

  describe('applyQuaternion()', () => {
    it('should rotate a vector by a unit quaternion', () => {
      const v = new Vector3(1, 0, 0);
      const q = new Quaternion(0, 0, Math.sin(Math.PI / 4), Math.cos(Math.PI / 4)); // 90° around Z
      v.applyQuaternion(q);
      expect(v.x).toBeCloseTo(0);
      expect(v.y).toBeCloseTo(1);
      expect(v.z).toBeCloseTo(0);
    });

    it('should return itself for chaining', () => {
      const v = new Vector3(1, 2, 3);
      const q = new Quaternion(0, 0, 0, 1);
      const result = v.applyQuaternion(q);
      expect(result).toBe(v);
    });

    it('should not modify the vector if quaternion is identity', () => {
      const v = new Vector3(5, -2, 3);
      const q = new Quaternion(0, 0, 0, 1); // identity quaternion
      v.applyQuaternion(q);
      expect(v.x).toBeCloseTo(5);
      expect(v.y).toBeCloseTo(-2);
      expect(v.z).toBeCloseTo(3);
    });

    it('should handle rotation around X axis', () => {
      const v = new Vector3(0, 1, 0);
      const q = new Quaternion(Math.sin(Math.PI / 4), 0, 0, Math.cos(Math.PI / 4)); // 90° around X
      v.applyQuaternion(q);
      expect(v.x).toBeCloseTo(0);
      expect(v.y).toBeCloseTo(0);
      expect(v.z).toBeCloseTo(1);
    });
  });

  describe('project()', () => {
    let vector: Vector3;
    let camera: OrthographicCamera;

    beforeEach(() => {
      vector = new Vector3(1, 2, 3);

      camera = new OrthographicCamera();
      // Mocking camera matrices for testing
      camera.matrixWorldInverse = new Matrix4().set(
        1, 0, 0, -1,
        0, 1, 0, -2,
        0, 0, 1, -3,
        0, 0, 0, 1
      );

      camera.projectionMatrix = new Matrix4().set(
        2, 0, 0, 0,
        0, 2, 0, 0,
        0, 0, 2, 0,
        0, 0, 0, 1
      );
    });

    it('should return the same instance', () => {
      const result = vector.project(camera);
      expect(result).toBe(vector);
    });

    it('should correctly apply world inverse and projection matrices', () => {
      vector.project(camera);

      // First apply matrixWorldInverse: (1-1, 2-2, 3-3) = (0,0,0)
      // Then apply projectionMatrix: (0*2, 0*2, 0*2) = (0,0,0)
      expect(vector.x).toBeCloseTo(0);
      expect(vector.y).toBeCloseTo(0);
      expect(vector.z).toBeCloseTo(0);
    });

    it('should handle non-zero result correctly', () => {
      vector.set(2, 3, 4);

      // Modify camera for test
      camera.matrixWorldInverse.set(
        1, 0, 0, -1,
        0, 1, 0, -1,
        0, 0, 1, -1,
        0, 0, 0, 1
      );

      camera.projectionMatrix.set(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      );

      vector.project(camera);

      // Expected: (2-1, 3-1, 4-1) = (1,2,3)
      expect(vector.x).toBeCloseTo(1);
      expect(vector.y).toBeCloseTo(2);
      expect(vector.z).toBeCloseTo(3);
    });

    it('should return the same instance for chaining', () => {
      const v = new Vector3(1, 2, 3);
      const camera = new OrthographicCamera(-5, 5, 5, -5, 1, 10);

      camera.updateProjectionMatrix();

      const result = v.project(camera);
      expect(result).toBe(v);
    });
  });

  describe('unproject()', () => {
    let vector: Vector3;
    let camera: OrthographicCamera;

    beforeEach(() => {
      vector = new Vector3(1, 2, 3);

      camera = new OrthographicCamera();
      // Mock camera matrices
      camera.projectionMatrixInverse = new Matrix4().set(
        0.5, 0, 0, 0,
        0, 0.5, 0, 0,
        0, 0, 0.5, 0,
        0, 0, 0, 1
      );

      camera.matrixWorld = new Matrix4().set(
        1, 0, 0, 1,
        0, 1, 0, 2,
        0, 0, 1, 3,
        0, 0, 0, 1
      );
    });

    it('should return the same instance', () => {
      const result = vector.unproject(camera);
      expect(result).toBe(vector);
    });

    it('should correctly apply projection inverse and world matrices', () => {
      vector.unproject(camera);

      // Apply projectionMatrixInverse: (1*0.5, 2*0.5, 3*0.5) = (0.5, 1, 1.5)
      // Apply matrixWorld: (0.5+1, 1+2, 1.5+3) = (1.5, 3, 4.5)
      expect(vector.x).toBeCloseTo(1.5);
      expect(vector.y).toBeCloseTo(3);
      expect(vector.z).toBeCloseTo(4.5);
    });

    it('should handle different vector values correctly', () => {
      vector.set(2, 4, 6);

      camera.projectionMatrixInverse.set(
        0.1, 0, 0, 0,
        0, 0.2, 0, 0,
        0, 0, 0.3, 0,
        0, 0, 0, 1
      );

      camera.matrixWorld.set(
        1, 0, 0, -1,
        0, 1, 0, -2,
        0, 0, 1, -3,
        0, 0, 0, 1
      );

      vector.unproject(camera);

      // projectionMatrixInverse: (2*0.1, 4*0.2, 6*0.3) = (0.2, 0.8, 1.8)
      // matrixWorld: (0.2-1, 0.8-2, 1.8-3) = (-0.8, -1.2, -1.2)
      expect(vector.x).toBeCloseTo(-0.8);
      expect(vector.y).toBeCloseTo(-1.2);
      expect(vector.z).toBeCloseTo(-1.2);
    });
  });

  describe('transformDirection()', () => {
    it('should rotate direction vector correctly', () => {
      const dir = new Vector3(1, 0, 0);

      // 90 degree rotation around Z axis
      const angle = Math.PI / 2;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      const m = new Matrix4(
        cos, -sin, 0, 0,
        sin, cos, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      );

      dir.transformDirection(m);

      // (1,0,0) rotated 90deg around Z -> (0,1,0)
      expect(dir.x).toBeCloseTo(0);
      expect(dir.y).toBeCloseTo(1);
      expect(dir.z).toBeCloseTo(0);
    });

    it('should ignore translation components', () => {
      const dir = new Vector3(0, 1, 0);

      // Matrix with translation (should not affect direction)
      const m = new Matrix4(
        1, 0, 0, 10,
        0, 1, 0, 20,
        0, 0, 1, 30,
        0, 0, 0, 1
      );

      dir.transformDirection(m);

      // should be unchanged and normalized
      expect(dir.x).toBeCloseTo(0, 6);
      expect(dir.y).toBeCloseTo(1, 6);
      expect(dir.z).toBeCloseTo(0, 6);
    });

    it('should normalize after transformation with scale', () => {
      const dir = new Vector3(1, 1, 0);

      // Non-uniform scaling matrix
      const m = new Matrix4().set(
        2, 0, 0, 0,
        0, 3, 0, 0,
        0, 0, 4, 0,
        0, 0, 0, 1
      );

      dir.transformDirection(m);

      // The vector should still be normalized
      expect(Math.abs(dir.length() - 1)).toBeLessThan(1e-6);

      // Expected normalized direction after applying non-uniform scale
      const expected = new Vector3(2, 3, 0).normalize();

      expect(dir.x).toBeCloseTo(expected.x, 6);
      expect(dir.y).toBeCloseTo(expected.y, 6);
      expect(dir.z).toBeCloseTo(expected.z, 6);
    });

    it('should handle arbitrary rotation and stay normalized', () => {
      const dir = new Vector3(0, 0, 1);
      const rotationY = new Matrix4().makeRotationY(Math.PI / 4); // 45 deg

      dir.transformDirection(rotationY);

      // 45 degree rotation around Y axis -> should piont diagonally in XZ plane
      expect(dir.x).toBeCloseTo(Math.sin(Math.PI / 4), 6);
      expect(dir.y).toBeCloseTo(0, 6);
      expect(dir.z).toBeCloseTo(Math.cos(Math.PI / 4), 6);
      expect(Math.abs(dir.length() - 1)).toBeLessThan(1e-6);

    });

    it('should be chainable', () => {
      const dir = new Vector3(1, 0, 0);
      const m = new Matrix4();

      const result = dir.transformDirection(m);

      // ensures it returns same instance
      expect(result).toBe(dir);
    });
  });

  describe('min()', () => {
    it('should clamp each component to the minimum of itself and the given vector', () => {
      const a = new Vector3(5, 2, 9);
      const b = new Vector3(3, 4, 8);

      a.min(b);

      expect(a.x).toBe(3); // min(5,3)
      expect(a.y).toBe(2); // min(2,4)
      expect(a.z).toBe(8); // min(9,8)
    });

    it('should leave components unchanged when all are smaller', () => {
      const a = new Vector3(1, 2, 3);
      const b = new Vector3(5, 5, 5);

      a.min(b);

      expect(a.x).toBe(1); // min(1,5)
      expect(a.y).toBe(2); // min(2,5)
      expect(a.z).toBe(3); // min(3,5)
    });

    it('should handle negative numbers correctly', () => {
      const a = new Vector3(-1, 2, -3);
      const b = new Vector3(-5, 3, 0);

      a.min(b);

      expect(a.x).toBe(-5); // min(-1,-5)
      expect(a.y).toBe(2);  // min(2,3)
      expect(a.z).toBe(-3); // min(-3,0)
    });

    it('should handle equal vectors correctly', () => {
      const a = new Vector3(2, 2, 2);
      const b = new Vector3(2, 2, 2);

      a.min(b);

      expect(a.x).toBe(2);
      expect(a.y).toBe(2);
      expect(a.z).toBe(2);
    });

    it('should be chainable', () => {
      const a = new Vector3(1, 2, 3);
      const b = new Vector3(0, 0, 0);

      const result = a.min(b);

      expect(result).toBe(a);
    });
  });

  describe('max()', () => {
    it('should replace components with the larger of the two vectors', () => {
      const a = new Vector3(1, 5, -3);
      const b = new Vector3(2, 4, -2);

      a.max(b);

      expect(a.x).toBe(2);     // max(1, 2)
      expect(a.y).toBe(5);     // max(5, 4);
      expect(a.z).toBe(-2);    // max(-3, -2);
    });


    // TODO:
    it('should not modify components that are already larger', () => {
      const a = new Vector3(5, 5, 5);
      const b = new Vector3(1, 2, 3);

      a.max(b);

      expect(a.equals(new Vector3(5, 5, 5))).toBe(true);
    });

    it('should handle negative values correctly', () => {
      const a = new Vector3(-5, -2, 3);
      const b = new Vector3(-10, -1, 0);

      a.max(b);

      expect(a.x).toBe(-5); // max(-5, -10)
      expect(a.y).toBe(-1); // max(-2, -1)
      expect(a.z).toBe(3);  // max(3, 0)
    });

    it('should be chainable', () => {
      const a = new Vector3(0, 1, 2);
      const b = new Vector3(3, 4, 5);

      const result = a.max(b);

      expect(result).toBe(a);
    })
  });

  describe('clamp()', () => {
    it('clamps components greater than max', () => {
      const v = new Vector3(15, 5, 20);
      const min = new Vector3(0, 0, 0);
      const max = new Vector3(10, 10, 10);

      v.clamp(min, max);

      expect(v.x).toBe(10); // clamped to max.x
      expect(v.y).toBe(5);  // within range, unchanged
      expect(v.z).toBe(10); // clamped to max.z
    });

    it('clamps components less than min', () => {
      const v = new Vector3(-5, -2, -10);
      const min = new Vector3(0, 0, 0);
      const max = new Vector3(10, 10, 10);

      v.clamp(min, max);

      expect(v.x).toBe(0);  // clamped to min.x
      expect(v.y).toBe(0);  // clamped to min.y
      expect(v.z).toBe(0);  // clamped to min.z
    });

    it('does not change components within range', () => {
      const v = new Vector3(3, 7, 5);
      const min = new Vector3(0, 0, 0);
      const max = new Vector3(10, 10, 10);

      v.clamp(min, max);

      expect(v.x).toBe(3);
      expect(v.y).toBe(7);
      expect(v.z).toBe(5);
    });

    it('works when some components are below min and some above max', () => {
      const v = new Vector3(-5, 5, 20);
      const min = new Vector3(0, 0, 0);
      const max = new Vector3(10, 10, 10);

      v.clamp(min, max);

      expect(v.x).toBe(0);  // clamped to min.x
      expect(v.y).toBe(5);  // unchanged
      expect(v.z).toBe(10); // clamped to max.z
    });

    it('returns the current instance for chaining', () => {
      const v = new Vector3(5, 5, 5);
      const min = new Vector3(0, 0, 0);
      const max = new Vector3(10, 10, 10);

      const result = v.clamp(min, max);
      expect(result).toBe(v); // same instance
    });

  });

  describe('clampScalar()', () => {
    it('should return the same instance', () => {
      const v = new Vector3(1, 2, 3);
      const result = v.clampScalar(0, 10);
      expect(result).toBe(v);
    });

    it('should clamp components above the max', () => {
      const v = new Vector3(5, 20, 100);
      v.clampScalar(0, 10);

      expect(v.x).toBe(5);
      expect(v.y).toBe(10);
      expect(v.z).toBe(10);
    });

    it('should clamp components below the min', () => {
      const v = new Vector3(-5, -1, 2);
      v.clampScalar(0, 10);

      expect(v.x).toBe(0);
      expect(v.y).toBe(0);
      expect(v.z).toBe(2);
    });

    it('should not modify components within range', () => {
      const v = new Vector3(2, 5, 8);
      v.clampScalar(0, 10);

      expect(v.x).toBe(2);
      expect(v.y).toBe(5);
      expect(v.z).toBe(8);
    });

    it('should work with negative ranges', () => {
      const v = new Vector3(-10, 0, 10);
      v.clampScalar(-5, 5);

      expect(v.x).toBe(-5);
      expect(v.y).toBe(0);
      expect(v.z).toBe(5);
    });

    it('should clamp when min === max', () => {
      const v = new Vector3(-100, 50, 999);
      v.clampScalar(3, 3);

      expect(v.x).toBe(3);
      expect(v.y).toBe(3);
      expect(v.z).toBe(3);
    });
  });

  describe('clampLength()', () => {
    it('should return the same instance', () => {
      const v = new Vector3(3, 4, 0); // length = 5
      const result = v.clampLength(1, 10);
      expect(result).toBe(v);
    });

    it('should not change the vector if its length is within the range', () => {
      const v = new Vector3(3, 4, 0); // length = 5
      v.clampLength(1, 10);

      expect(v.length()).toBeCloseTo(5);
    });

    it('should clamp vector length down to max when length > max', () => {
      const v = new Vector3(10, 0, 0); // length = 10
      v.clampLength(1, 5);            // max = 5

      expect(v.length()).toBeCloseTo(5);
      expect(v.x).toBeCloseTo(5);
      expect(v.y).toBeCloseTo(0);
      expect(v.z).toBeCloseTo(0);
    });

    it('should clamp vector length up to min when length < min', () => {
      const v = new Vector3(1, 0, 0); // length = 1
      v.clampLength(3, 10);          // min = 3

      expect(v.length()).toBeCloseTo(3);
      // direction preserved
      expect(v.x).toBeCloseTo(3);
      expect(v.y).toBeCloseTo(0);
      expect(v.z).toBeCloseTo(0);
    });

    it('should preserve direction when clamping', () => {
      const v = new Vector3(2, 2, 0); // length ≈ 2.828
      v.clampLength(1, 1);           // clamp to exactly 1

      expect(v.length()).toBeCloseTo(1);

      // Check normalized direction ≈ (0.707, 0.707, 0)
      const n = v.clone().normalize();
      expect(n.x).toBeCloseTo(1 / Math.sqrt(2));
      expect(n.y).toBeCloseTo(1 / Math.sqrt(2));
      expect(n.z).toBeCloseTo(0);
    });

    it('should handle zero-length vector by treating length as 1 (per implementation)', () => {
      const v = new Vector3(0, 0, 0);
      v.clampLength(2, 5);

      // Zero vector has no direction, so divideScalar(1) → still zero,
      // then multiplying → still zero
      expect(v.x).toBeCloseTo(0);
      expect(v.y).toBeCloseTo(0);
      expect(v.z).toBeCloseTo(0);

      // but logically, length stays 0
      expect(v.length()).toBeCloseTo(0);
    });
  });

  describe('floor()', () => {
    it('should return the same instance', () => {
      const v = new Vector3(1.2, 3.7, -4.1);
      const result = v.floor();
      expect(result).toBe(v);
    });

    it('should floor positive decimal components', () => {
      const v = new Vector3(1.9, 2.1, 3.999);
      v.floor();

      expect(v.x).toBe(1);
      expect(v.y).toBe(2);
      expect(v.z).toBe(3);
    });

    it('should floor negative decimal components', () => {
      const v = new Vector3(-1.1, -2.9, -3.0001);
      v.floor();

      expect(v.x).toBe(-2);
      expect(v.y).toBe(-3);
      expect(v.z).toBe(-4);
    });

    it('should leave integer components unchanged', () => {
      const v = new Vector3(-5, 10, 0);
      v.floor();

      expect(v.x).toBe(-5);
      expect(v.y).toBe(10);
      expect(v.z).toBe(0);
    });

    it('should work for mixed positive and negative values', () => {
      const v = new Vector3(4.2, -7.7, 0.5);
      v.floor();

      expect(v.x).toBe(4);
      expect(v.y).toBe(-8);
      expect(v.z).toBe(0);
    });
  });

  describe('ceil()', () => {
    it('should return the same instance', () => {
      const v = new Vector3(1.2, 3.7, -4.1);
      const result = v.ceil();
      expect(result).toBe(v);
    });

    it('should ceil positive decimal components', () => {
      const v = new Vector3(1.1, 2.9, 3.0001);
      v.ceil();

      expect(v.x).toBe(2);
      expect(v.y).toBe(3);
      expect(v.z).toBe(4);
    });

    it('should ceil negative decimal components', () => {
      const v = new Vector3(-1.9, -2.1, -3.999);
      v.ceil();

      expect(v.x).toBe(-1);
      expect(v.y).toBe(-2);
      expect(v.z).toBe(-3);
    });

    it('should leave integer components unchanged', () => {
      const v = new Vector3(-5, 10, 0);
      v.ceil();

      expect(v.x).toBe(-5);
      expect(v.y).toBe(10);
      expect(v.z).toBe(0);
    });

    it('should work for mixed positive and negative values', () => {
      const v = new Vector3(4.2, -7.7, 0.5);
      v.ceil();

      expect(v.x).toBe(5);
      expect(v.y).toBe(-7);
      expect(v.z).toBe(1);
    });
  });

  describe('round()', () => {
    it('should return the same instance', () => {
      const v = new Vector3(1.2, 3.7, -4.1);
      const result = v.round();
      expect(result).toBe(v);
    });

    it('should round positive decimal components correctly', () => {
      const v = new Vector3(1.4, 2.5, 3.6);
      v.round();

      expect(v.x).toBe(1);
      expect(v.y).toBe(3); // Math.round(2.5) → 3
      expect(v.z).toBe(4);
    });

    it('should round negative decimal components correctly', () => {
      const v = new Vector3(-1.4, -2.5, -3.6);
      v.round();

      expect(v.x).toBe(-1);
      expect(v.y).toBe(-2); // Math.round(-2.5) → -2
      expect(v.z).toBe(-4);
    });

    it('should leave integer components unchanged', () => {
      const v = new Vector3(-5, 10, 0);
      v.round();

      expect(v.x).toBe(-5);
      expect(v.y).toBe(10);
      expect(v.z).toBe(0);
    });

    it('should work for mixed positive and negative values', () => {
      const v = new Vector3(4.2, -7.7, 0.5);
      v.round();

      expect(v.x).toBe(4);
      expect(v.y).toBe(-8);
      expect(v.z).toBe(1);
    });
  });

  describe('roundToZero()', () => {
    it('should return the same instance', () => {
      const v = new Vector3(1.9, -2.7, 3.5);
      const result = v.roundToZero();
      expect(result).toBe(v);
    });

    it('should truncate positive decimal components towards zero', () => {
      const v = new Vector3(1.9, 2.1, 3.7);
      v.roundToZero();

      expect(v.x).toBe(1);
      expect(v.y).toBe(2);
      expect(v.z).toBe(3);
    });

    it('should truncate negative decimal components towards zero', () => {
      const v = new Vector3(-1.9, -2.1, -3.7);
      v.roundToZero();

      expect(v.x).toBe(-1);
      expect(v.y).toBe(-2);
      expect(v.z).toBe(-3);
    });

    it('should leave integer components unchanged', () => {
      const v = new Vector3(-5, 10, 0);
      v.roundToZero();

      expect(v.x).toBe(-5);
      expect(v.y).toBe(10);
      expect(v.z).toBe(0);
    });

    it('should work for mixed positive and negative values', () => {
      const v = new Vector3(4.9, -7.3, 0.5);
      v.roundToZero();

      expect(v.x).toBe(4);
      expect(v.y).toBe(-7);
      expect(v.z).toBe(0);
    });

    it('should handle zero values correctly', () => {
      const v = new Vector3(0, -0, 0.0);
      v.roundToZero();

      expect(v.x).toBe(0);
      expect(v.y).toBeCloseTo(0);
      expect(v.z).toBe(0);
    });
  });

  describe('dot()', () => {
    it('should compute the correct dot product for simple vectors', () => {
      const a = new Vector3(1, 2, 3);
      const b = new Vector3(4, 5, 6);
      const result = a.dot(b);

      // 1*4 + 2*5 + 3*6 = 32
      expect(result).toBeCloseTo(32);
    });

    it('should return 0 for perpendicular (orthogonal) vectors', () => {
      const a = new Vector3(1, 0, 0);
      const b = new Vector3(0, 1, 0);
      const result = a.dot(b);

      expect(result).toBeCloseTo(0);
    });

    it('should return positive value for vectors pointing in the same direction', () => {
      const a = new Vector3(1, 2, 3);
      const b = new Vector3(2, 4, 6); // same direction, scaled
      const result = a.dot(b);

      // 1*2 + 2*4 + 3*6 = 28
      expect(result).toBeCloseTo(28);
    });

    it('should return negative value for vectors pointing in opposite directions', () => {
      const a = new Vector3(1, 0, 0);
      const b = new Vector3(-1, 0, 0);
      const result = a.dot(b);

      expect(result).toBeCloseTo(-1);
    });

    it('should handle zero vector correctly', () => {
      const a = new Vector3(0, 0, 0);
      const b = new Vector3(3, 4, 5);
      const result = a.dot(b);

      expect(result).toBeCloseTo(0);
    });

    it('should return the same result regardless of order (commutative)', () => {
      const a = new Vector3(2, 3, 4);
      const b = new Vector3(5, 6, 7);

      expect(a.dot(b)).toBeCloseTo(b.dot(a));
    });

    it('should handle negative components correctly', () => {
      const a = new Vector3(-1, 2, -3);
      const b = new Vector3(4, -5, 6);
      const result = a.dot(b);

      // (-1)*4 + 2*(-5) + (-3)*6 = -4 -10 -18 = -32
      expect(result).toBeCloseTo(-32);
    });
  });

  describe('fromArray()', () => {
    it('sets vector components from an array', () => {
      const v = new Vector3();
      const arr = [1, 2, 3];

      v.fromArray(arr);

      expect(v.x).toBe(1);
      expect(v.y).toBe(2);
      expect(v.z).toBe(3);
    });

    it('uses the offset parameter', () => {
      const v = new Vector3();
      const arr = [0, 0, 0, 4, 5, 6];

      v.fromArray(arr, 3);

      expect(v.x).toBe(4);
      expect(v.y).toBe(5);
      expect(v.z).toBe(6);
    });

    it('returns the same instance for chaining', () => {
      const v = new Vector3();
      const arr = [7, 8, 9];

      const result = v.fromArray(arr);

      expect(result).toBe(v);
    });
  });

  describe('setFromMatrixPosion()', () => {
    it("extracts translation from identity matrix", () => {
      const v = new Vector3();
      const m = new Matrix4(); // identity matrix

      v.setFromMatrixPosition(m);

      expect(v.x).toBeCloseTo(0);
      expect(v.y).toBeCloseTo(0);
      expect(v.z).toBeCloseTo(0);
    });

    it("extracts translation from a matrix with position", () => {
      const v = new Vector3();
      const m = new Matrix4().makeTranslation(5, -3, 2);

      v.setFromMatrixPosition(m);

      expect(v.x).toBeCloseTo(5);
      expect(v.y).toBeCloseTo(-3);
      expect(v.z).toBeCloseTo(2);
    });

    it("overwrites previous vector values", () => {
      const v = new Vector3(1, 2, 3);
      const m = new Matrix4().makeTranslation(10, 20, 30);

      v.setFromMatrixPosition(m);

      expect(v.x).toBeCloseTo(10);
      expect(v.y).toBeCloseTo(20);
      expect(v.z).toBeCloseTo(30);
    });

    it("returns itself for chaining", () => {
      const v = new Vector3();
      const m = new Matrix4().makeTranslation(1, 2, 3);

      const result = v.setFromMatrixPosition(m);

      expect(result).toBe(v);
    });

    it("ignores rotation and scale components", () => {
      const v = new Vector3();
      const m = new Matrix4()
        .makeRotationX(Math.PI / 2)
        .setPosition(7, 8, 9); // custom position after rotation

      v.setFromMatrixPosition(m);

      expect(v.x).toBeCloseTo(7);
      expect(v.y).toBeCloseTo(8);
      expect(v.z).toBeCloseTo(9);
    });
  });

  describe('setFromMatrixScale()', () => {
    it('returns itself (method chaining)', () => {
      const v = new Vector3();
      const m = new Matrix4().identity();
      const result = v.setFromMatrixScale(m);
      expect(result).toBe(v);
    });

    it('extracts scale from identity matrix', () => {
      const v = new Vector3();
      const m = new Matrix4().identity();
      v.setFromMatrixScale(m);
      expect(v.x).toBeCloseTo(1);
      expect(v.y).toBeCloseTo(1);
      expect(v.z).toBeCloseTo(1);
    });

    it('extracts uniform scale correctly', () => {
      const v = new Vector3();
      const m = new Matrix4().makeScale(3, 3, 3);
      v.setFromMatrixScale(m);
      expect(v.x).toBeCloseTo(3);
      expect(v.y).toBeCloseTo(3);
      expect(v.z).toBeCloseTo(3);
    });

    it('extracts non-uniform scale correctly', () => {
      const v = new Vector3();
      const m = new Matrix4().makeScale(2, 5, 3);
      v.setFromMatrixScale(m);
      expect(v.x).toBeCloseTo(2);
      expect(v.y).toBeCloseTo(5);
      expect(v.z).toBeCloseTo(3);
    });

    it('handles zero scale correctly', () => {
      const v = new Vector3();
      const m = new Matrix4().makeScale(0, 0, 0);
      v.setFromMatrixScale(m);
      expect(v.x).toBeCloseTo(0);
      expect(v.y).toBeCloseTo(0);
      expect(v.z).toBeCloseTo(0);
    });

    it('handles combined scale + rotation', () => {
      const v = new Vector3();
      const m = new Matrix4()
        .makeRotationX(Math.PI / 4)
        .scale(new Vector3(2, 3, 4)); // hypothetical scale method
      v.setFromMatrixScale(m);
      // Because rotation does not change length, scale extraction should still be (2,3,4)
      expect(v.x).toBeCloseTo(2);
      expect(v.y).toBeCloseTo(3);
      expect(v.z).toBeCloseTo(4);
    });
  });

  describe('setFromMatrixColumn()', () => {
    it('should set the vector components from column 0', () => {
      const m = new Matrix4().fromArray([
        1, 2, 3, 4,    // column 0
        5, 6, 7, 8,    // column 1
        9, 10, 11, 12, // column 2
        13, 14, 15, 16 // column 3
      ]);

      const v = new Vector3().setFromMatrixColumn(m, 0);

      expect(Array.from(v.toArray())).toEqual([1, 2, 3]);
    });

    it('should set the vector components from column 1', () => {
      const m = new Matrix4().fromArray([
        1, 2, 3, 4,    // column 0
        5, 6, 7, 8,    // column 1
        9, 10, 11, 12, // column 2
        13, 14, 15, 16 // column 3
      ]);

      const v = new Vector3().setFromMatrixColumn(m, 1);

      expect(Array.from(v.toArray())).toEqual([5, 6, 7]);
    });

    it('should set the vector components from column 2', () => {
      const m = new Matrix4().fromArray([
        1, 2, 3, 4,
        5, 6, 7, 8,
        9, 10, 11, 12,
        13, 14, 15, 16
      ]);

      const v = new Vector3().setFromMatrixColumn(m, 2);

      expect(Array.from(v.toArray())).toEqual([9, 10, 11]);
    });

    it('should set the vector components from column 3', () => {
      const m = new Matrix4().fromArray([
        1, 2, 3, 4,
        5, 6, 7, 8,
        9, 10, 11, 12,
        13, 14, 15, 16
      ]);

      const v = new Vector3().setFromMatrixColumn(m, 3);

      expect(Array.from(v.toArray())).toEqual([13, 14, 15]);
    });

    it('should return this for chaining', () => {
      const m = new Matrix4();
      const v = new Vector3();
      const result = v.setFromMatrixColumn(m, 0);
      expect(result).toBe(v);
    });
  });

  describe('setFromMatrix3Column()', () => {
    it('sets vector from the first column of the matrix', () => {
      const v = new Vector3();
      const m = new Matrix3(
        1, 2, 3,
        4, 5, 6,
        7, 8, 9
      );

      v.setFromMatrix3Column(m, 0);

      expect(v.x).toBe(1);
      expect(v.y).toBe(4);
      expect(v.z).toBe(7);
    });

    it('sets vector from the second column of the matrix', () => {
      const v = new Vector3();
      const m = new Matrix3(
        1, 2, 3,
        4, 5, 6,
        7, 8, 9
      );

      v.setFromMatrix3Column(m, 1);

      expect(v.x).toBe(2);
      expect(v.y).toBe(5);
      expect(v.z).toBe(8);
    });

    it('sets vector from the third column of the matrix', () => {
      const v = new Vector3();
      const m = new Matrix3(
        1, 2, 3,
        4, 5, 6,
        7, 8, 9
      );

      v.setFromMatrix3Column(m, 2);

      expect(v.x).toBe(3);
      expect(v.y).toBe(6);
      expect(v.z).toBe(9);
    });

    it('returns the same instance for chaining', () => {
      const v = new Vector3();
      const m = new Matrix3();

      const result = v.setFromMatrix3Column(m, 0);

      expect(result).toBe(v);
    });
  });

  describe('setFromEuler()', () => {
    it('returns itself (method chaining)', () => {
      const v = new Vector3();
      const e = new Euler(0, 0, 0);
      const result = v.setFromEuler(e);
      expect(result).toBe(v);
    });

    it('copies values from a known Euler', () => {
      const e = new Euler(Math.PI / 2, Math.PI / 4, Math.PI / 3);
      const v = new Vector3();
      v.setFromEuler(e);
      expect(v.x).toBeCloseTo(e.x);
      expect(v.y).toBeCloseTo(e.y);
      expect(v.z).toBeCloseTo(e.z);
    });

    it('handles zero angles', () => {
      const e = new Euler(0, 0, 0);
      const v = new Vector3();
      v.setFromEuler(e);
      expect(v.x).toBeCloseTo(0);
      expect(v.y).toBeCloseTo(0);
      expect(v.z).toBeCloseTo(0);
    });

    it('handles negative angles', () => {
      const e = new Euler(-Math.PI / 2, -Math.PI / 4, -Math.PI / 3);
      const v = new Vector3();
      v.setFromEuler(e);
      expect(v.x).toBeCloseTo(e.x);
      expect(v.y).toBeCloseTo(e.y);
      expect(v.z).toBeCloseTo(e.z);
    });

    it('works with floating-point angles', () => {
      const e = new Euler(0.123, 4.56, -7.89);
      const v = new Vector3();
      v.setFromEuler(e);
      expect(v.x).toBeCloseTo(e.x);
      expect(v.y).toBeCloseTo(e.y);
      expect(v.z).toBeCloseTo(e.z);
    });
  });

  describe('setFromColor()', () => {
    it('should return the same instance', () => {
      const vector = new Vector3();
      const color = new Color(0.1, 0.2, 0.3);

      const result = vector.setFromColor(color);
      expect(result).toBe(vector);
    });

    it('should set the vector components from the color', () => {
      const vector = new Vector3();
      const color = new Color(0.5, 0.6, 0.7);

      vector.setFromColor(color);

      expect(vector.x).toBeCloseTo(0.5);
      expect(vector.y).toBeCloseTo(0.6);
      expect(vector.z).toBeCloseTo(0.7);
    });

    it('should overwrite existing vector values', () => {
      const vector = new Vector3(1, 2, 3);
      const color = new Color(0.9, 0.8, 0.7);

      vector.setFromColor(color);

      expect(vector.x).toBeCloseTo(0.9);
      expect(vector.y).toBeCloseTo(0.8);
      expect(vector.z).toBeCloseTo(0.7);
    });

    it('should handle zero color values', () => {
      const vector = new Vector3(1, 1, 1);
      const color = new Color(0, 0, 0);

      vector.setFromColor(color);

      expect(vector.x).toBeCloseTo(0);
      expect(vector.y).toBeCloseTo(0);
      expect(vector.z).toBeCloseTo(0);
    });
  });

  describe('equals()', () => {
    it('should return true for vectors with the same components', () => {
      const v1 = new Vector3(1, 2, 3);
      const v2 = new Vector3(1, 2, 3);

      expect(v1.equals(v2)).toBe(true);
    });

    it('should return false if x components differ', () => {
      const v1 = new Vector3(1, 2, 3);
      const v2 = new Vector3(0, 2, 3);

      expect(v1.equals(v2)).toBe(false);
    });

    it('should return false if y components differ', () => {
      const v1 = new Vector3(1, 2, 3);
      const v2 = new Vector3(1, 0, 3);

      expect(v1.equals(v2)).toBe(false);
    });

    it('should return false if z components differ', () => {
      const v1 = new Vector3(1, 2, 3);
      const v2 = new Vector3(1, 2, 0);

      expect(v1.equals(v2)).toBe(false);
    });

    it('should return false for completely different vectors', () => {
      const v1 = new Vector3(1, 2, 3);
      const v2 = new Vector3(4, 5, 6);

      expect(v1.equals(v2)).toBe(false);
    });

    it('should return true when comparing the vector to itself', () => {
      const v1 = new Vector3(7, 8, 9);

      expect(v1.equals(v1)).toBe(true);
    });
  });

  describe('toArray()', () => {
    it('should write the vector components to a provided array starting at offset 0', () => {
      const v = new Vector3(1, 2, 3);
      const arr: number[] = [];

      const result = v.toArray(arr);

      expect(arr).toEqual([1, 2, 3]);
      expect(result).toBe(arr); // should return the same array
    });

    it('should write the vector components to a provided array at a specified offset', () => {
      const v = new Vector3(4, 5, 6);
      const arr: number[] = [0, 0, 0, 0, 0];

      v.toArray(arr, 1);

      expect(arr).toEqual([0, 4, 5, 6, 0]);
    });

    it('should return a new array if none is provided', () => {
      const v = new Vector3(7, 8, 9);

      const result = v.toArray();

      expect(result).toEqual([7, 8, 9]);
    });

    it('should not overwrite elements outside the specified offset', () => {
      const v = new Vector3(1, 2, 3);
      const arr = [9, 9, 9, 9, 9];

      v.toArray(arr, 2);

      expect(arr).toEqual([9, 9, 1, 2, 3]);
    });
  });

  describe('random()', () => {
    it('should return the same instance', () => {
      const v = new Vector3();
      const result = v.random();
      expect(result).toBe(v);
    });

    it('should set x, y, z to numbers between 0 (inclusive) and 1 (exclusive)', () => {
      const v = new Vector3();
      v.random();

      expect(v.x).toBeGreaterThanOrEqual(0);
      expect(v.x).toBeLessThan(1);

      expect(v.y).toBeGreaterThanOrEqual(0);
      expect(v.y).toBeLessThan(1);

      expect(v.z).toBeGreaterThanOrEqual(0);
      expect(v.z).toBeLessThan(1);
    });

    it('should produce different values on consecutive calls', () => {
      const v1 = new Vector3().random();
      const v2 = new Vector3().random();

      // There's a very small chance they are equal; we can check that at least one component differs
      const different = v1.x !== v2.x || v1.y !== v2.y || v1.z !== v2.z;
      expect(different).toBe(true);
    });

    it('should overwrite previous vector values', () => {
      const v = new Vector3(10, 20, 30);
      v.random();

      expect(v.x).not.toBe(10);
      expect(v.y).not.toBe(20);
      expect(v.z).not.toBe(30);
    });
  });

  describe('fromBufferAttribute()', () => {
    it('should copy x, y, z from a simple BufferAttribute', () => {
      const array = new Float32Array([1, 2, 3, 4, 5, 6]);
      const attr = new BufferAttribute(array, 3);

      const v = new Vector3();
      v.fromBufferAttribute(attr, 0);

      expect(v.x).toBe(1);
      expect(v.y).toBe(2);
      expect(v.z).toBe(3);

      v.fromBufferAttribute(attr, 1);
      expect(v.x).toBe(4);
      expect(v.y).toBe(5);
      expect(v.z).toBe(6);
    });

    it('should work with normalized BufferAttribute', () => {
      const array = new Uint8Array([0, 127, 255]);
      const attr = new BufferAttribute(array, 3, true);

      const v = new Vector3();
      v.fromBufferAttribute(attr, 0);

      // Values should be denormalized (0 to 1)
      expect(v.x).toBeCloseTo(0 / 255);
      expect(v.y).toBeCloseTo(127 / 255);
      expect(v.z).toBeCloseTo(1);
    });

    it('should copy x, y, z from an InterleavedBufferAttribute', () => {
      // InterleavedBuffer with stride 4
      const array = new Float32Array([
        1, 2, 3, 10,
        4, 5, 6, 20
      ]);
      const interleaved = new InterleavedBuffer(array, 2); // stride = 4
      interleaved.stride = 4; // manually set stride

      const attr = new InterleavedBufferAttribute(interleaved, 3, 0); // offset = 0
      const v = new Vector3();

      v.fromBufferAttribute(attr, 0);
      expect(v.x).toBe(1);
      expect(v.y).toBe(2);
      expect(v.z).toBe(3);

      v.fromBufferAttribute(attr, 1);
      expect(v.x).toBe(4);
      expect(v.y).toBe(5);
      expect(v.z).toBe(6);
    });

    it('should respect normalized flag in InterleavedBufferAttribute', () => {
      const array = new Uint8Array([0, 127, 255, 0, 64, 128, 255, 0]);
      const interleaved = new InterleavedBuffer(array, 2);
      interleaved.stride = 4;

      const attr = new InterleavedBufferAttribute(interleaved, 3, 0, true);
      const v = new Vector3();

      v.fromBufferAttribute(attr, 0);
      expect(v.x).toBeCloseTo(0 / 255);
      expect(v.y).toBeCloseTo(127 / 255);
      expect(v.z).toBeCloseTo(1);

      v.fromBufferAttribute(attr, 1);
      expect(v.x).toBeCloseTo(64 / 255);
      expect(v.y).toBeCloseTo(128 / 255);
      expect(v.z).toBeCloseTo(1);
    });
  });

  describe('randomDirection()', () => {
    it('should return the same instance', () => {
      const v = new Vector3();
      const result = v.randomDirection();
      expect(result).toBe(v);
    });

    it('should produce a vector of length approximately 1', () => {
      const v = new Vector3().randomDirection();
      const length = v.length();

      // allow small floating-point errors
      expect(length).toBeGreaterThan(0.9999);
      expect(length).toBeLessThan(1.0001);
    });

    it('should overwrite previous vector values', () => {
      const v = new Vector3(10, 20, 30);
      v.randomDirection();

      // Since vector is normalized, none of the original values should remain exactly the same
      expect(v.x).not.toBe(10);
      expect(v.y).not.toBe(20);
      expect(v.z).not.toBe(30);
    });

    it('should produce different vectors on consecutive calls', () => {
      const v1 = new Vector3().randomDirection();
      const v2 = new Vector3().randomDirection();

      // There’s a very small chance vectors are equal; check at least one component differs
      const different = v1.x !== v2.x || v1.y !== v2.y || v1.z !== v2.z;
      expect(different).toBe(true);
    });

    it('should produce vectors pointing in all directions over many samples', () => {
      const samples = 1000;
      let positiveX = false, negativeX = false;
      let positiveY = false, negativeY = false;
      let positiveZ = false, negativeZ = false;

      for (let i = 0; i < samples; i++) {
        const v = new Vector3().randomDirection();
        if (v.x > 0) positiveX = true; else negativeX = true;
        if (v.y > 0) positiveY = true; else negativeY = true;
        if (v.z > 0) positiveZ = true; else negativeZ = true;

        if (positiveX && negativeX && positiveY && negativeY && positiveZ && negativeZ) break;
      }

      expect(positiveX).toBe(true);
      expect(negativeX).toBe(true);
      expect(positiveY).toBe(true);
      expect(negativeY).toBe(true);
      expect(positiveZ).toBe(true);
      expect(negativeZ).toBe(true);
    });
  });

  describe('[Symbol.iterator]()', () => {
    it('should iterate x, y, z in order', () => {
      const v = new Vector3(1, 2, 3);

      const iterator = v[Symbol.iterator]();

      expect(iterator.next().value).toBe(1);
      expect(iterator.next().value).toBe(2);
      expect(iterator.next().value).toBe(3);
      expect(iterator.next().done).toBe(true);
    });

    it('should support spread operator', () => {
      const v = new Vector3(4, 5, 6);

      const arr = [...v];

      expect(arr).toEqual([4, 5, 6]);
    });

    it('should support array destructuring', () => {
      const v = new Vector3(7, 8, 9);

      const [x, y, z] = v;

      expect(x).toBe(7);
      expect(y).toBe(8);
      expect(z).toBe(9);
    });

    it('should work inside for-of loop', () => {
      const v = new Vector3(10, 20, 30);
      const collected: number[] = [];

      for (const n of v) {
        collected.push(n);
      }

      expect(collected).toEqual([10, 20, 30]);
    });
  });
});
