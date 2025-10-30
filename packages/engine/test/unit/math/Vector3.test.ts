import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Vector3 } from '../../../src/math/Vector3';
import { Matrix3 } from '../../../src/math/Matrix3';
import { Matrix4 } from '../../../src/math/Matrix4';

describe('Vector3', () => {
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

  describe('Vector3 setX / setY / setZ', () => {
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

  describe('Vector3 setComponent / getComponent', () => {
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

  describe('Vector3.clone()', () => {
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

  describe('Vector3.copy()', () => {
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

  describe('Vector3.add()', () => {
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

  describe('Vector3.addScalar()', () => {
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

  describe('Vector3.addVectors()', () => {
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

  describe('Vector3.addScaledVector()', () => {
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

  describe('Vector3.sub()', () => {
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

  describe('Vector3.subScalar()', () => {
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

  describe('Vector3.subVectors()', () => {
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

  describe('Vector3.multiply()', () => {
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

  describe('Vector3.multiplyScalar()', () => {
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

  describe('Vector3.multiplyVectors()', () => {
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

  describe('Vector3.divide()', () => {
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

  describe('Vector3.divideScalar()', () => {
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

  describe('Vector3.applyMatrix3()', () => {
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

  describe('Vector3.lengthSq()', () => {
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

  describe('Vector3.length()', () => {
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

  describe('Vector3.normalize()', () => {
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

  describe('Vector3.applyNormalMatrix()', () => {
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

  describe('Vector3.applyMatrix4()', () => {
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
});
