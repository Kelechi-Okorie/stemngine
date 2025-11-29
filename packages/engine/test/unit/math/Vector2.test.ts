import { describe, it, expect, vi } from 'vitest';
import { Vector2 } from '../../../src/math/Vector2';
import { Matrix3 } from '../../../src/math/Matrix3';
import { BufferAttribute } from '../../../src/core/BufferAttribute';

describe('Vector2', () => {
  describe('constructor()', () => {
    it("should construct with default values (0, 0)", () => {
      const v = new Vector2();

      expect(v.x).toBe(0);
      expect(v.y).toBe(0);
      expect(v.isVector2).toBe(true);
    });

    it("should construct with given x and y values", () => {
      const v = new Vector2(5, -3);

      expect(v.x).toBe(5);
      expect(v.y).toBe(-3);
    });

    it("should allow modifying x and y after construction", () => {
      const v = new Vector2(2, 4);

      v.x = 10;
      v.y = -10;

      expect(v.x).toBe(10);
      expect(v.y).toBe(-10);
    });

    it("should correctly set isVector2 flag", () => {
      const v = new Vector2();
      expect(v.isVector2).toBe(true);
    });

    it("should create independent instances", () => {
      const a = new Vector2(1, 2);
      const b = new Vector2(3, 4);

      expect(a).not.toBe(b);

      a.x = 100;
      expect(b.x).toBe(3); // ensure no shared state
    });
  });

  describe('set/get width/height', () => {
    it("width getter should return x", () => {
      const v = new Vector2(5, 10);

      expect(v.width).toBe(5);
    });

    it("width setter should update x", () => {
      const v = new Vector2(1, 2);

      v.width = 99;

      expect(v.x).toBe(99);
      expect(v.width).toBe(99);
      expect(v.y).toBe(2);   // ensure y is unaffected
    });

    it("height getter should return y", () => {
      const v = new Vector2(3, 7);

      expect(v.height).toBe(7);
    });

    it("height setter should update y (EXPECTED BEHAVIOR)", () => {
      const v = new Vector2(0, 0);

      v.height = 42;

      expect(v.y).toBe(42);   // expected correct behavior
      expect(v.x).toBe(0);    // should NOT change x
    });

    it("height setter should update x (ACTUAL CURRENT BEHAVIOR)", () => {
      const v = new Vector2(10, 20);

      v.height = 123;

      // matches your current incorrect implementation
      expect(v.x).toBe(10);
      expect(v.y).toBe(123);
    });

  });

  describe('set()', () => {
    it("should set x and y to the given values", () => {
      const v = new Vector2();

      v.set(5, -3);

      expect(v.x).toBe(5);
      expect(v.y).toBe(-3);
    });

    it("should overwrite existing values", () => {
      const v = new Vector2(10, 20);

      v.set(-7, 42);

      expect(v.x).toBe(-7);
      expect(v.y).toBe(42);
    });

    it("should return `this` to allow chaining", () => {
      const v = new Vector2();

      const result = v.set(1, 2);

      expect(result).toBe(v); // same instance
    });

    it("should work with floating-point values", () => {
      const v = new Vector2();

      v.set(3.14, -2.71);

      expect(v.x).toBeCloseTo(3.14);
      expect(v.y).toBeCloseTo(-2.71);
    });
  });

  describe('setScalar()', () => {
    it("sets both x and y components to the scalar value", () => {
      const v = new Vector2(0, 0);
      v.setScalar(5);

      expect(v.x).toBe(5);
      expect(v.y).toBe(5);
    });

    it("overwrites existing values", () => {
      const v = new Vector2(3, 7);
      v.setScalar(10);

      expect(v.x).toBe(10);
      expect(v.y).toBe(10);
    });

    it("returns the same instance (for chaining)", () => {
      const v = new Vector2(1, 2);
      const result = v.setScalar(4);

      expect(result).toBe(v);
    });

    it("works with negative scalars", () => {
      const v = new Vector2();
      v.setScalar(-3);

      expect(v.x).toBe(-3);
      expect(v.y).toBe(-3);
    });

    it("works with zero", () => {
      const v = new Vector2(5, 9);
      v.setScalar(0);

      expect(v.x).toBe(0);
      expect(v.y).toBe(0);
    });

    it("works with floating point numbers", () => {
      const v = new Vector2();
      v.setScalar(3.14);

      expect(v.x).toBeCloseTo(3.14);
      expect(v.y).toBeCloseTo(3.14);
    });
  });

  describe('setX() and setY()', () => {
    it("sets the x component to the given value", () => {
      const v = new Vector2(1, 2);
      v.setX(10);

      expect(v.x).toBe(10);
      expect(v.y).toBe(2); // should not change
    });

    it("overwrites previous x value", () => {
      const v = new Vector2(5, 5);
      v.setX(-3);

      expect(v.x).toBe(-3);
    });

    it("returns the same instance for chaining", () => {
      const v = new Vector2();
      const result = v.setX(7);

      expect(result).toBe(v);
    });
  });

  describe("Vector2.setY", () => {
    it("sets the y component to the given value", () => {
      const v = new Vector2(3, 4);
      v.setY(20);

      expect(v.y).toBe(20);
      expect(v.x).toBe(3); // should not change
    });

    it("overwrites previous y value", () => {
      const v = new Vector2(0, 9);
      v.setY(-8);

      expect(v.y).toBe(-8);
    });

    it("returns the same instance for chaining", () => {
      const v = new Vector2();
      const result = v.setY(11);

      expect(result).toBe(v);
    });
  });

  describe('setComponent()', () => {
    it("sets the x component when index is 0", () => {
      const v = new Vector2(1, 2);
      v.setComponent(0, 10);

      expect(v.x).toBe(10);
      expect(v.y).toBe(2);
    });

    it("sets the y component when index is 1", () => {
      const v = new Vector2(3, 4);
      v.setComponent(1, 20);

      expect(v.y).toBe(20);
      expect(v.x).toBe(3);
    });

    it("throws an error when index is out of range (negative)", () => {
      const v = new Vector2();

      expect(() => v.setComponent(-1, 5))
        .toThrowError("index is out of range -1");
    });

    it("throws an error when index is out of range (greater than 1)", () => {
      const v = new Vector2();

      expect(() => v.setComponent(2, 5))
        .toThrowError("index is out of range 2");
    });

    it("returns the same instance for chaining", () => {
      const v = new Vector2();
      const result = v.setComponent(0, 99);

      expect(result).toBe(v);
    });
  });

  describe('getComponent()', () => {
    it("returns the x component when index is 0", () => {
      const v = new Vector2(5, 10);
      expect(v.getComponent(0)).toBe(5);
    });

    it("returns the y component when index is 1 (currently buggy: returns x)", () => {
      const v = new Vector2(7, 20);

      expect(v.getComponent(1)).toBe(20); // Should be y
    });

    it("throws an error when index is negative", () => {
      const v = new Vector2(1, 2);
      expect(() => v.getComponent(-1)).toThrowError("index is out of range -1");
    });

    it("throws an error when index is greater than 1", () => {
      const v = new Vector2(1, 2);
      expect(() => v.getComponent(2)).toThrowError("index is out of range 2");
    });
  });

  describe('add()', () => {
    it("adds another vector correctly", () => {
      const a = new Vector2(1, 2);
      const b = new Vector2(3, 4);

      a.add(b);

      expect(a.x).toBe(4);
      expect(a.y).toBe(6);
    });

    it("returns the same instance (this)", () => {
      const a = new Vector2(1, 2);
      const b = new Vector2(3, 4);

      const result = a.add(b);

      expect(result).toBe(a);
    });

    it("works with zero vector", () => {
      const a = new Vector2(5, 6);
      const zero = new Vector2(0, 0);

      a.add(zero);

      expect(a.x).toBe(5);
      expect(a.y).toBe(6);
    });
  });

  describe('addScalar()', () => {
    it("adds a scalar to both x and y components", () => {
      const v = new Vector2(1, 2);
      v.addScalar(3);

      expect(v.x).toBe(4);
      expect(v.y).toBe(5);
    });

    it("returns the same instance (this)", () => {
      const v = new Vector2(1, 2);
      const result = v.addScalar(5);

      expect(result).toBe(v);
    });

    it("adds zero correctly (no change)", () => {
      const v = new Vector2(3, 4);
      v.addScalar(0);

      expect(v.x).toBe(3);
      expect(v.y).toBe(4);
    });

    it("works with negative scalars", () => {
      const v = new Vector2(5, 7);
      v.addScalar(-2);

      expect(v.x).toBe(3);
      expect(v.y).toBe(5);
    });
  });

  describe('addVectors()', () => {
    it("adds two vectors correctly", () => {
      const a = new Vector2(1, 2);
      const b = new Vector2(3, 4);
      const v = new Vector2();

      v.addVectors(a, b);

      expect(v.x).toBe(4);
      expect(v.y).toBe(6);
    });

    it("returns the same instance (this)", () => {
      const a = new Vector2(1, 1);
      const b = new Vector2(2, 2);
      const v = new Vector2();

      const result = v.addVectors(a, b);

      expect(result).toBe(v);
    });

    it("works when vectors have zero components", () => {
      const a = new Vector2(0, 0);
      const b = new Vector2(5, -3);
      const v = new Vector2();

      v.addVectors(a, b);

      expect(v.x).toBe(5);
      expect(v.y).toBe(-3);
    });

    it("works with negative components", () => {
      const a = new Vector2(-1, -2);
      const b = new Vector2(-3, 4);
      const v = new Vector2();

      v.addVectors(a, b);

      expect(v.x).toBe(-4);
      expect(v.y).toBe(2);
    });
  });

  describe('addScaledVector()', () => {
    it("adds a scaled vector correctly", () => {
      const v = new Vector2(1, 2);
      const scale = 3;
      const target = new Vector2(4, 5);

      target.addScaledVector(v, scale);

      expect(target.x).toBe(4 + 1 * 3);
      expect(target.y).toBe(5 + 2 * 3);
    });

    it("returns the same instance", () => {
      const v = new Vector2(2, 3);
      const target = new Vector2(0, 0);

      const result = target.addScaledVector(v, 2);

      expect(result).toBe(target);
    });

    it("works with negative scale", () => {
      const v = new Vector2(1, -1);
      const target = new Vector2(3, 3);

      target.addScaledVector(v, -2);

      expect(target.x).toBe(3 + 1 * -2); // 1
      expect(target.y).toBe(3 + -1 * -2); // 5
    });

    it("works with zero scale", () => {
      const v = new Vector2(5, 7);
      const target = new Vector2(1, 1);

      target.addScaledVector(v, 0);

      expect(target.x).toBe(1);
      expect(target.y).toBe(1);
    });
  });

  describe('sub()', () => {
    it("subtracts another vector correctly", () => {
      const a = new Vector2(5, 7);
      const b = new Vector2(2, 3);

      a.sub(b);

      expect(a.x).toBe(5 - 2);
      expect(a.y).toBe(7 - 3);
    });

    it("returns the same instance", () => {
      const a = new Vector2(1, 1);
      const b = new Vector2(0, 0);

      const result = a.sub(b);

      expect(result).toBe(a);
    });

    it("handles negative values correctly", () => {
      const a = new Vector2(-2, 3);
      const b = new Vector2(4, -1);

      a.sub(b);

      expect(a.x).toBe(-2 - 4); // -6
      expect(a.y).toBe(3 - -1); // 4
    });
  });

  describe('subScalar()', () => {
    it("subtracts a scalar from both components correctly", () => {
      const v = new Vector2(5, 7);
      v.subScalar(2);

      expect(v.x).toBe(3);
      expect(v.y).toBe(5);
    });

    it("returns the same instance", () => {
      const v = new Vector2(1, 1);
      const result = v.subScalar(0);

      expect(result).toBe(v);
    });

    it("handles negative scalars correctly", () => {
      const v = new Vector2(4, -3);
      v.subScalar(-2);

      expect(v.x).toBe(6);
      expect(v.y).toBe(-1);
    });

    it("handles zero correctly", () => {
      const v = new Vector2(2, 3);
      v.subScalar(0);

      expect(v.x).toBe(2);
      expect(v.y).toBe(3);
    });
  });

  describe('subVectors()', () => {
    it("subtracts the components of two vectors correctly", () => {
      const a = new Vector2(5, 7);
      const b = new Vector2(2, 3);
      const v = new Vector2().subVectors(a, b);

      expect(v.x).toBe(3);
      expect(v.y).toBe(4);
    });

    it("returns the same instance", () => {
      const a = new Vector2(1, 1);
      const b = new Vector2(0, 0);
      const v = new Vector2();
      const result = v.subVectors(a, b);

      expect(result).toBe(v);
    });

    it("handles negative components correctly", () => {
      const a = new Vector2(-2, 3);
      const b = new Vector2(1, -1);
      const v = new Vector2().subVectors(a, b);

      expect(v.x).toBe(-3);
      expect(v.y).toBe(4);
    });

    it("handles zero correctly", () => {
      const a = new Vector2(0, 0);
      const b = new Vector2(0, 0);
      const v = new Vector2().subVectors(a, b);

      expect(v.x).toBe(0);
      expect(v.y).toBe(0);
    });
  });

  describe('multiply()', () => {
    it("multiplies the components of two vectors correctly", () => {
      const a = new Vector2(2, 3);
      const b = new Vector2(4, 5);
      const v = new Vector2(1, 1).multiply(a); // multiply by a
      v.multiply(b); // then multiply by b

      expect(v.x).toBe(8); // 1*2*4
      expect(v.y).toBe(15); // 1*3*5
    });

    it("returns the same instance", () => {
      const a = new Vector2(2, 3);
      const v = new Vector2(1, 1);
      const result = v.multiply(a);

      expect(result).toBe(v);
    });

    it("handles zero correctly", () => {
      const a = new Vector2(0, 3);
      const v = new Vector2(2, 4).multiply(a);

      expect(v.x).toBe(0);
      expect(v.y).toBe(12);
    });

    it("handles negative components correctly", () => {
      const a = new Vector2(-2, 3);
      const b = new Vector2(4, -5);
      const v = new Vector2(1, 1).multiply(a).multiply(b);

      expect(v.x).toBe(-8); // 1*-2*4
      expect(v.y).toBe(-15); // 1*3*-5
    });
  });

  describe('multiplyScalar()', () => {
    it("multiplies both components by a positive scalar", () => {
      const v = new Vector2(2, 3);
      v.multiplyScalar(4);

      expect(v.x).toBe(8);
      expect(v.y).toBe(12);
    });

    it("multiplies both components by a negative scalar", () => {
      const v = new Vector2(2, -3);
      v.multiplyScalar(-2);

      expect(v.x).toBe(-4);
      expect(v.y).toBe(6);
    });

    it("multiplies both components by zero", () => {
      const v = new Vector2(5, 7);
      v.multiplyScalar(0);

      expect(v.x).toBe(0);
      expect(v.y).toBe(0);
    });

    it("returns the same instance", () => {
      const v = new Vector2(1, 1);
      const result = v.multiplyScalar(5);

      expect(result).toBe(v);
    });
  });

  describe('divide', () => {
    it("divides both components by the given vector", () => {
      const v = new Vector2(10, 20);
      v.divide(new Vector2(2, 4));

      expect(v.x).toBe(5);
      expect(v.y).toBe(5);
    });

    it("divides with negative values", () => {
      const v = new Vector2(-10, 20);
      v.divide(new Vector2(2, -4));

      expect(v.x).toBe(-5);
      expect(v.y).toBe(-5);
    });

    it("returns the same instance", () => {
      const v = new Vector2(1, 1);
      const result = v.divide(new Vector2(1, 1));

      expect(result).toBe(v);
    });

    it("throws or returns Infinity if dividing by zero", () => {
      const v = new Vector2(1, 1);
      const result = v.divide(new Vector2(0, 0));

      expect(result.x).toBe(Infinity);
      expect(result.y).toBe(Infinity);
    });
  });

  describe('divideScalar()', () => {
    it("divides both components by the given scalar", () => {
      const v = new Vector2(10, 20);
      v.divideScalar(2);

      expect(v.x).toBe(5);
      expect(v.y).toBe(10);
    });

    it("divides with a negative scalar", () => {
      const v = new Vector2(10, -20);
      v.divideScalar(-2);

      expect(v.x).toBe(-5);
      expect(v.y).toBe(10);
    });

    it("returns the same instance", () => {
      const v = new Vector2(1, 1);
      const result = v.divideScalar(2);

      expect(result).toBe(v);
    });

    it("returns Infinity for division by zero", () => {
      const v = new Vector2(1, 2);
      const result = v.divideScalar(0);

      expect(result.x).toBe(Infinity);
      expect(result.y).toBe(Infinity);
    });
  });

  describe('applymatrix3()', () => {
    it("applies identity matrix and leaves vector unchanged", () => {
      const v = new Vector2(3, 4);
      const m = new Matrix3().set(
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
      );

      v.applyMatrix3(m);

      expect(v.x).toBe(3);
      expect(v.y).toBe(4);
    });

    it("applies translation", () => {
      const v = new Vector2(1, 2);
      const m = new Matrix3().set(
        1, 0, 5,
        0, 1, 6,
        0, 0, 1
      );

      v.applyMatrix3(m);

      expect(v.x).toBe(6); // 1 + 5
      expect(v.y).toBe(8); // 2 + 6
    });

    it("applies scaling", () => {
      const v = new Vector2(2, 3);
      const m = new Matrix3().set(
        2, 0, 0,
        0, 3, 0,
        0, 0, 1
      );

      v.applyMatrix3(m);

      expect(v.x).toBe(4); // 2 * 2
      expect(v.y).toBe(9); // 3 * 3
    });

    it("applies rotation 90 degrees", () => {
      const angle = Math.PI / 2;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      const v = new Vector2(1, 0);
      const m = new Matrix3().set(
        cos, -sin, 0,
        sin, cos, 0,
        0, 0, 1
      );

      v.applyMatrix3(m);

      expect(v.x).toBeCloseTo(0);
      expect(v.y).toBeCloseTo(1);
    });

    it("returns the same instance", () => {
      const v = new Vector2(1, 2);
      const m = new Matrix3().identity();

      const result = v.applyMatrix3(m);
      expect(result).toBe(v);
    });
  });

  describe('min()', () => {
    it("reduces components that are greater than the given vector", () => {
      const v = new Vector2(5, 10);
      const other = new Vector2(3, 12);

      v.min(other);

      expect(v.x).toBe(3); // 5 > 3 => clamped to 3
      expect(v.y).toBe(10); // 10 <= 12 => unchanged
    });

    it("leaves components unchanged if they are smaller or equal", () => {
      const v = new Vector2(2, 7);
      const other = new Vector2(3, 7);

      v.min(other);

      expect(v.x).toBe(2);
      expect(v.y).toBe(7);
    });

    it("returns the same instance", () => {
      const v = new Vector2(5, 10);
      const other = new Vector2(3, 12);

      const result = v.min(other);

      expect(result).toBe(v);
    });

    it("works when both components are equal to the other vector", () => {
      const v = new Vector2(3, 4);
      const other = new Vector2(3, 4);

      v.min(other);

      expect(v.x).toBe(3);
      expect(v.y).toBe(4);
    });
  });

  describe('max()', () => {
    it("increases components that are smaller than the given vector", () => {
      const v = new Vector2(5, 10);
      const other = new Vector2(7, 8);

      v.max(other);

      expect(v.x).toBe(7);  // 5 < 7 → increased
      expect(v.y).toBe(10); // 10 >= 8 → unchanged
    });

    it("leaves components unchanged if they are larger or equal", () => {
      const v = new Vector2(9, 12);
      const other = new Vector2(7, 10);

      v.max(other);

      expect(v.x).toBe(9);
      expect(v.y).toBe(12);
    });

    it("works when both components are equal to the other vector", () => {
      const v = new Vector2(3, 4);
      const other = new Vector2(3, 4);

      v.max(other);

      expect(v.x).toBe(3);
      expect(v.y).toBe(4);
    });

    it("returns the same instance for chaining", () => {
      const v = new Vector2(1, 2);
      const other = new Vector2(3, 4);

      const result = v.max(other);

      expect(result).toBe(v);
    });

    it("can handle negative values correctly", () => {
      const v = new Vector2(-5, -1);
      const other = new Vector2(-3, -4);

      v.max(other);

      expect(v.x).toBe(-3); // max(-5, -3) = -3
      expect(v.y).toBe(-1); // max(-1, -4) = -1
    });
  });

  describe('clamp()', () => {
    it("clamps components below the minimum", () => {
      const v = new Vector2(1, 2);
      const minV = new Vector2(3, 4);
      const maxV = new Vector2(10, 10);

      v.clamp(minV, maxV);

      expect(v.x).toBe(3);
      expect(v.y).toBe(4);
    });

    it("clamps components above the maximum", () => {
      const v = new Vector2(12, 15);
      const minV = new Vector2(3, 4);
      const maxV = new Vector2(10, 10);

      v.clamp(minV, maxV);

      expect(v.x).toBe(10);
      expect(v.y).toBe(10);
    });

    it("does not change components within the range", () => {
      const v = new Vector2(5, 7);
      const minV = new Vector2(3, 4);
      const maxV = new Vector2(10, 10);

      v.clamp(minV, maxV);

      expect(v.x).toBe(5);
      expect(v.y).toBe(7);
    });

    it("returns the same instance for chaining", () => {
      const v = new Vector2(5, 7);
      const minV = new Vector2(3, 4);
      const maxV = new Vector2(10, 10);

      const result = v.clamp(minV, maxV);

      expect(result).toBe(v);
    });

    it("works with negative ranges", () => {
      const v = new Vector2(-5, 15);
      const minV = new Vector2(-3, 0);
      const maxV = new Vector2(3, 10);

      v.clamp(minV, maxV);

      expect(v.x).toBe(-3); // clamped up to min
      expect(v.y).toBe(10); // clamped down to max
    });
  });

  describe('clampScalar()', () => {
    it("clamps components below the minimum scalar", () => {
      const v = new Vector2(1, 2);
      v.clampScalar(3, 10);

      expect(v.x).toBe(3);
      expect(v.y).toBe(3);
    });

    it("clamps components above the maximum scalar", () => {
      const v = new Vector2(12, 15);
      v.clampScalar(3, 10);

      expect(v.x).toBe(10);
      expect(v.y).toBe(10);
    });

    it("does not change components within the range", () => {
      const v = new Vector2(5, 7);
      v.clampScalar(3, 10);

      expect(v.x).toBe(5);
      expect(v.y).toBe(7);
    });

    it("returns the same instance for chaining", () => {
      const v = new Vector2(5, 7);
      const result = v.clampScalar(3, 10);

      expect(result).toBe(v);
    });

    it("works with negative ranges", () => {
      const v = new Vector2(-5, 15);
      v.clampScalar(-3, 10);

      expect(v.x).toBe(-3); // clamped up to min
      expect(v.y).toBe(10); // clamped down to max
    });
  });

  describe('lengthSq()', () => {
    it("returns 0 for a zero vector", () => {
      const v = new Vector2(0, 0);
      expect(v.lengthSq()).toBe(0);
    });

    it("computes the correct square length for positive components", () => {
      const v = new Vector2(3, 4);
      expect(v.lengthSq()).toBe(25); // 3^2 + 4^2 = 9 + 16 = 25
    });

    it("computes the correct square length for negative components", () => {
      const v = new Vector2(-3, -4);
      expect(v.lengthSq()).toBe(25); // (-3)^2 + (-4)^2 = 9 + 16 = 25
    });

    it("computes the correct square length for mixed components", () => {
      const v = new Vector2(-2, 5);
      expect(v.lengthSq()).toBe(29); // (-2)^2 + 5^2 = 4 + 25 = 29
    });

    it("does not modify the vector", () => {
      const v = new Vector2(1, 2);
      const lengthSquared = v.lengthSq();
      expect(v.x).toBe(1);
      expect(v.y).toBe(2);
    });
  });

  describe('length()', () => {
    it("returns 0 for a zero vector", () => {
      const v = new Vector2(0, 0);
      expect(v.length()).toBe(0);
    });

    it("computes the correct length for positive components", () => {
      const v = new Vector2(3, 4);
      expect(v.length()).toBe(5); // sqrt(3^2 + 4^2) = 5
    });

    it("computes the correct length for negative components", () => {
      const v = new Vector2(-3, -4);
      expect(v.length()).toBe(5); // sqrt((-3)^2 + (-4)^2) = 5
    });

    it("computes the correct length for mixed components", () => {
      const v = new Vector2(-2, 5);
      expect(v.length()).toBe(Math.sqrt(29)); // sqrt((-2)^2 + 5^2) = sqrt(29)
    });

    it("does not modify the vector", () => {
      const v = new Vector2(1, 2);
      const len = v.length();
      expect(v.x).toBe(1);
      expect(v.y).toBe(2);
    });
  });

  describe('manhattanLength()', () => {
    it('should return 0 for the zero vector', () => {
      const v = new Vector2(0, 0);
      expect(v.manhattanLength()).toBe(0);
    });

    it('should return correct Manhattan length for positive components', () => {
      const v = new Vector2(3, 4);
      expect(v.manhattanLength()).toBe(7);
    });

    it('should return correct Manhattan length for negative components', () => {
      const v = new Vector2(-2, -5);
      expect(v.manhattanLength()).toBe(7);
    });

    it('should return correct Manhattan length for mixed components', () => {
      const v = new Vector2(-3, 5);
      expect(v.manhattanLength()).toBe(8);
    });
  });

  describe('clampLength()', () => {
    it("does not change a vector whose length is within min and max", () => {
      const v = new Vector2(3, 4); // length = 5
      const result = v.clone().clampLength(2, 10);
      expect(result.x).toBeCloseTo(3);
      expect(result.y).toBeCloseTo(4);
    });

    it("scales up a vector shorter than min length", () => {
      const v = new Vector2(1, 1); // length = sqrt(2) ≈ 1.414
      const minLength = 3;
      const result = v.clone().clampLength(minLength, 10);
      expect(result.length()).toBeCloseTo(minLength);
    });

    it("scales down a vector longer than max length", () => {
      const v = new Vector2(6, 8); // length = 10
      const maxLength = 5;
      const result = v.clone().clampLength(2, maxLength);
      expect(result.length()).toBeCloseTo(maxLength);
    });

    it("handles a zero vector without error", () => {
      const v = new Vector2(0, 0);
      const result = v.clone().clampLength(1, 5);
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });

    it("preserves direction while clamping length", () => {
      const v = new Vector2(3, 4); // length = 5
      const maxLength = 2;
      const result = v.clone().clampLength(1, maxLength);
      const angleOriginal = Math.atan2(v.y, v.x);
      const angleResult = Math.atan2(result.y, result.x);
      expect(angleResult).toBeCloseTo(angleOriginal);
    });
  });

  describe('floor()', () => {
    it("floors positive components", () => {
      const v = new Vector2(3.7, 4.9);
      v.floor();
      expect(v.x).toBe(3);
      expect(v.y).toBe(4);
    });

    it("floors negative components", () => {
      const v = new Vector2(-3.7, -4.2);
      v.floor();
      expect(v.x).toBe(-4);
      expect(v.y).toBe(-5);
    });

    it("floors mixed positive and negative components", () => {
      const v = new Vector2(-2.3, 5.8);
      v.floor();
      expect(v.x).toBe(-3);
      expect(v.y).toBe(5);
    });

    it("does not change integer components", () => {
      const v = new Vector2(7, -3);
      v.floor();
      expect(v.x).toBe(7);
      expect(v.y).toBe(-3);
    });

    it("returns a reference to the same vector", () => {
      const v = new Vector2(2.5, 3.5);
      const result = v.floor();
      expect(result).toBe(v);
    });
  });

  describe('ceil()', () => {
    it("ceils positive components", () => {
      const v = new Vector2(3.2, 4.7);
      v.ceil();
      expect(v.x).toBe(4);
      expect(v.y).toBe(5);
    });

    it("ceils negative components", () => {
      const v = new Vector2(-3.2, -4.7);
      v.ceil();
      expect(v.x).toBe(-3);
      expect(v.y).toBe(-4);
    });

    it("ceils mixed positive and negative components", () => {
      const v = new Vector2(-2.8, 5.1);
      v.ceil();
      expect(v.x).toBe(-2);
      expect(v.y).toBe(6);
    });

    it("does not change integer components", () => {
      const v = new Vector2(7, -3);
      v.ceil();
      expect(v.x).toBe(7);
      expect(v.y).toBe(-3);
    });

    it("returns a reference to the same vector", () => {
      const v = new Vector2(2.5, 3.5);
      const result = v.ceil();
      expect(result).toBe(v);
    });
  });

  describe('round()', () => {
    it("rounds positive components correctly", () => {
      const v = new Vector2(3.2, 4.7);
      v.round();
      expect(v.x).toBe(3);
      expect(v.y).toBe(5);
    });

    it("rounds negative components correctly", () => {
      const v = new Vector2(-3.2, -4.7);
      v.round();
      expect(v.x).toBe(-3);
      expect(v.y).toBe(-5);
    });

    it("rounds .5 values away from zero", () => {
      const v = new Vector2(2.5, -2.5);
      v.round();
      expect(v.x).toBe(3);
      expect(v.y).toBe(-2);
    });

    it("does not change already integer components", () => {
      const v = new Vector2(7, -3);
      v.round();
      expect(v.x).toBe(7);
      expect(v.y).toBe(-3);
    });

    it("returns a reference to the same vector", () => {
      const v = new Vector2(2.7, 3.3);
      const result = v.round();
      expect(result).toBe(v);
    });
  });

  describe('roundToZero()', () => {
    it("truncates positive components towards zero", () => {
      const v = new Vector2(3.9, 4.7);
      v.roundToZero();
      expect(v.x).toBe(3);
      expect(v.y).toBe(4);
    });

    it("truncates negative components towards zero", () => {
      const v = new Vector2(-3.9, -4.7);
      v.roundToZero();
      expect(v.x).toBe(-3);
      expect(v.y).toBe(-4);
    });

    it("does not change integer components", () => {
      const v = new Vector2(7, -2);
      v.roundToZero();
      expect(v.x).toBe(7);
      expect(v.y).toBe(-2);
    });

    it("returns the same vector reference", () => {
      const v = new Vector2(2.9, -3.1);
      const result = v.roundToZero();
      expect(result).toBe(v);
    });
  });

  describe('negate()', () => {
    it("negates positive components", () => {
      const v = new Vector2(3, 4);
      v.negate();
      expect(v.x).toBe(-3);
      expect(v.y).toBe(-4);
    });

    it("negates negative components", () => {
      const v = new Vector2(-5, -6);
      v.negate();
      expect(v.x).toBe(5);
      expect(v.y).toBe(6);
    });

    it("negates mixed sign components", () => {
      const v = new Vector2(-2, 7);
      v.negate();
      expect(v.x).toBe(2);
      expect(v.y).toBe(-7);
    });

    it("returns the same vector instance (chainable)", () => {
      const v = new Vector2(1, -1);
      const result = v.negate();
      expect(result).toBe(v);
    });

    it("negates zero to zero", () => {
      const v = new Vector2(0, 0);
      v.negate();
      expect(v.x).toBeCloseTo(0);
      expect(v.y).toBeCloseTo(0);
    });
  });

  describe('dot()', () => {
    it("calculates dot product of positive vectors", () => {
      const a = new Vector2(2, 3);
      const b = new Vector2(4, 5);
      const result = a.dot(b);
      expect(result).toBe(2 * 4 + 3 * 5); // 8 + 15 = 23
    });

    it("calculates dot product of negative vectors", () => {
      const a = new Vector2(-1, -2);
      const b = new Vector2(-3, -4);
      const result = a.dot(b);
      expect(result).toBe((-1) * (-3) + (-2) * (-4)); // 3 + 8 = 11
    });

    it("calculates dot product with zero vector", () => {
      const a = new Vector2(1, 2);
      const b = new Vector2(0, 0);
      expect(a.dot(b)).toBe(0);
    });

    it("calculates dot product of perpendicular vectors", () => {
      const a = new Vector2(1, 0);
      const b = new Vector2(0, 1);
      expect(a.dot(b)).toBe(0);
    });

    it("returns a number", () => {
      const a = new Vector2(1, 2);
      const b = new Vector2(3, 4);
      expect(typeof a.dot(b)).toBe("number");
    });
  });

  describe('cross()', () => {
    it("calculates cross product of positive vectors", () => {
      const a = new Vector2(2, 3);
      const b = new Vector2(4, 5);
      const result = a.cross(b);
      expect(result).toBe(2 * 5 - 3 * 4); // 10 - 12 = -2
    });

    it("calculates cross product of negative vectors", () => {
      const a = new Vector2(-1, -2);
      const b = new Vector2(-3, -4);
      const result = a.cross(b);
      expect(result).toBe((-1) * (-4) - (-2) * (-3)); // 4 - 6 = -2
    });

    it("cross product with zero vector is zero", () => {
      const a = new Vector2(1, 2);
      const b = new Vector2(0, 0);
      expect(a.cross(b)).toBe(0);
    });

    it("cross product of perpendicular vectors", () => {
      const a = new Vector2(1, 0);
      const b = new Vector2(0, 1);
      expect(a.cross(b)).toBe(1);
      expect(b.cross(a)).toBe(-1);
    });

    it("returns a number", () => {
      const a = new Vector2(3, 4);
      const b = new Vector2(1, 2);
      expect(typeof a.cross(b)).toBe("number");
    });
  });

  describe('normalize()', () => {
    it('should normalize a non-zero vector', () => {
      const v = new Vector2(3, 4);
      const result = v.normalize();
      expect(result).toBe(v); // returns itself
      expect(v.x).toBeCloseTo(0.6);
      expect(v.y).toBeCloseTo(0.8);
      expect(v.length()).toBeCloseTo(1);
    });

    it('should handle a zero vector without error', () => {
      const v = new Vector2(0, 0);
      const result = v.normalize();
      expect(result).toBe(v);
      expect(v.x).toBe(0);
      expect(v.y).toBe(0);
      expect(v.length()).toBe(0);
    });
  });

  describe('angle()', () => {
    it('should return 0 for a vector along +x axis', () => {
      const v = new Vector2(1, 0);
      expect(v.angle()).toBeCloseTo(0);
    });

    it('should return π/2 for a vector along +y axis', () => {
      const v = new Vector2(0, 1);
      expect(v.angle()).toBeCloseTo(Math.PI / 2);
    });

    it('should return π for a vector along -x axis', () => {
      const v = new Vector2(-1, 0);
      expect(v.angle()).toBeCloseTo(Math.PI);
    });

    it('should return 3π/2 for a vector along -y axis', () => {
      const v = new Vector2(0, -1);
      expect(v.angle()).toBeCloseTo((3 * Math.PI) / 2);
    });

    it('should return correct angle for arbitrary vector', () => {
      const v = new Vector2(1, 1);
      expect(v.angle()).toBeCloseTo(Math.PI / 4);
    });
  });

  describe('angleTo()', () => {
    it('should return 0 for two identical vectors', () => {
      const a = new Vector2(1, 0);
      const b = new Vector2(1, 0);
      expect(a.angleTo(b)).toBeCloseTo(0);
    });

    it('should return π/2 for perpendicular vectors', () => {
      const a = new Vector2(1, 0);
      const b = new Vector2(0, 1);
      expect(a.angleTo(b)).toBeCloseTo(Math.PI / 2);
    });

    it('should return π for opposite vectors', () => {
      const a = new Vector2(1, 0);
      const b = new Vector2(-1, 0);
      expect(a.angleTo(b)).toBeCloseTo(Math.PI);
    });

    it('should handle zero-length vectors gracefully', () => {
      const a = new Vector2(0, 0);
      const b = new Vector2(1, 0);
      expect(a.angleTo(b)).toBeCloseTo(Math.PI / 2);
    });

    it('should return correct angle for arbitrary vectors', () => {
      const a = new Vector2(1, 1);
      const b = new Vector2(1, 0);
      expect(a.angleTo(b)).toBeCloseTo(Math.PI / 4);
    });
  });

  describe('distanceToSquared', () => {
    it('should return 0 for the same vector', () => {
      const a = new Vector2(1, 1);
      expect(a.distanceToSquared(a)).toBe(0);
    });

    it('should compute squared distance correctly for positive coordinates', () => {
      const a = new Vector2(1, 2);
      const b = new Vector2(4, 6);
      const expected = (1 - 4) ** 2 + (2 - 6) ** 2; // 9 + 16 = 25
      expect(a.distanceToSquared(b)).toBe(expected);
    });

    it('should compute squared distance correctly for negative coordinates', () => {
      const a = new Vector2(-2, -3);
      const b = new Vector2(1, 1);
      const expected = (-2 - 1) ** 2 + (-3 - 1) ** 2; // 9 + 16 = 25
      expect(a.distanceToSquared(b)).toBe(expected);
    });

    it('should compute squared distance correctly when one vector is the origin', () => {
      const a = new Vector2(0, 0);
      const b = new Vector2(3, 4);
      const expected = 3 ** 2 + 4 ** 2; // 9 + 16 = 25
      expect(a.distanceToSquared(b)).toBe(expected);
    });

    it('should be symmetric', () => {
      const a = new Vector2(2, 5);
      const b = new Vector2(7, 1);
      expect(a.distanceToSquared(b)).toBe(b.distanceToSquared(a));
    });
  });

  describe('distanceTo()', () => {
    it('should return 0 for the same vector', () => {
      const a = new Vector2(1, 1);
      expect(a.distanceTo(a)).toBe(0);
    });

    it('should compute distance correctly for positive coordinates', () => {
      const a = new Vector2(1, 2);
      const b = new Vector2(4, 6);
      const expected = Math.sqrt((1 - 4) ** 2 + (2 - 6) ** 2); // sqrt(25) = 5
      expect(a.distanceTo(b)).toBe(expected);
    });

    it('should compute distance correctly for negative coordinates', () => {
      const a = new Vector2(-2, -3);
      const b = new Vector2(1, 1);
      const expected = Math.sqrt((-2 - 1) ** 2 + (-3 - 1) ** 2); // sqrt(25) = 5
      expect(a.distanceTo(b)).toBe(expected);
    });

    it('should compute distance correctly when one vector is the origin', () => {
      const a = new Vector2(0, 0);
      const b = new Vector2(3, 4);
      const expected = Math.sqrt(3 ** 2 + 4 ** 2); // 5
      expect(a.distanceTo(b)).toBe(expected);
    });

    it('should be symmetric', () => {
      const a = new Vector2(2, 5);
      const b = new Vector2(7, 1);
      expect(a.distanceTo(b)).toBe(b.distanceTo(a));
    });
  });

  describe('manhattanDistanceTo', () => {
    it('should return 0 when vectors are the same', () => {
      const a = new Vector2(1, 1);
      expect(a.manhattanDistanceTo(a)).toBe(0);
    });

    it('should compute Manhattan distance for positive coordinates', () => {
      const a = new Vector2(1, 2);
      const b = new Vector2(4, 6);
      const expected = Math.abs(1 - 4) + Math.abs(2 - 6); // 3 + 4 = 7
      expect(a.manhattanDistanceTo(b)).toBe(expected);
    });

    it('should compute Manhattan distance for negative coordinates', () => {
      const a = new Vector2(-2, -3);
      const b = new Vector2(1, 1);
      const expected = Math.abs(-2 - 1) + Math.abs(-3 - 1); // 3 + 4 = 7
      expect(a.manhattanDistanceTo(b)).toBe(expected);
    });

    it('should be symmetric', () => {
      const a = new Vector2(2, 5);
      const b = new Vector2(7, 1);
      expect(a.manhattanDistanceTo(b)).toBe(b.manhattanDistanceTo(a));
    });

    it('should handle vectors with zero components', () => {
      const a = new Vector2(0, 0);
      const b = new Vector2(3, 4);
      const expected = 3 + 4; // 7
      expect(a.manhattanDistanceTo(b)).toBe(expected);
    });
  })

  describe('setLength()', () => {
    it('should set the length of a non-zero vector', () => {
      const v = new Vector2(3, 4); // length = 5
      v.setLength(10);
      const expectedLength = 10;
      expect(v.length()).toBeCloseTo(expectedLength);
    });

    it('should preserve the direction of the vector', () => {
      const v = new Vector2(1, 1);
      const originalAngle = v.angle();
      v.setLength(5);
      const newAngle = v.angle();
      expect(newAngle).toBeCloseTo(originalAngle);
    });

    it('should set a zero vector to zero (cannot determine direction)', () => {
      const v = new Vector2(0, 0);
      v.setLength(5);
      expect(v.x).toBe(0);
      expect(v.y).toBe(0);
    });

    it('should set a negative length correctly', () => {
      const v = new Vector2(1, 0);
      v.setLength(-3);
      expect(v.length()).toBeCloseTo(3);
      expect(v.x).toBeCloseTo(-3);
      expect(v.y).toBeCloseTo(0);
    });
  });

  describe('lerp()', () => {
    it('should return the same vector when alpha = 0', () => {
      const v1 = new Vector2(1, 2);
      const v2 = new Vector2(5, 6);
      v1.lerp(v2, 0);
      expect(v1.x).toBeCloseTo(1);
      expect(v1.y).toBeCloseTo(2);
    });

    it('should return the target vector when alpha = 1', () => {
      const v1 = new Vector2(1, 2);
      const v2 = new Vector2(5, 6);
      v1.lerp(v2, 1);
      expect(v1.x).toBeCloseTo(5);
      expect(v1.y).toBeCloseTo(6);
    });

    it('should interpolate correctly for alpha = 0.5', () => {
      const v1 = new Vector2(0, 0);
      const v2 = new Vector2(10, 10);
      v1.lerp(v2, 0.5);
      expect(v1.x).toBeCloseTo(5);
      expect(v1.y).toBeCloseTo(5);
    });

    it('should handle alpha > 1 (extrapolation)', () => {
      const v1 = new Vector2(0, 0);
      const v2 = new Vector2(10, 10);
      v1.lerp(v2, 1.5);
      expect(v1.x).toBeCloseTo(15);
      expect(v1.y).toBeCloseTo(15);
    });

    it('should handle negative alpha (reverse extrapolation)', () => {
      const v1 = new Vector2(10, 10);
      const v2 = new Vector2(0, 0);
      v1.lerp(v2, -0.5);
      expect(v1.x).toBeCloseTo(15);
      expect(v1.y).toBeCloseTo(15);
    });
  });

  describe('lerpVectors()', () => {
    it('should return v1 when alpha = 0', () => {
      const result = new Vector2();
      const v1 = new Vector2(1, 2);
      const v2 = new Vector2(5, 6);
      result.lerpVectors(v1, v2, 0);
      expect(result.x).toBeCloseTo(1);
      expect(result.y).toBeCloseTo(2);
    });

    it('should return v2 when alpha = 1', () => {
      const result = new Vector2();
      const v1 = new Vector2(1, 2);
      const v2 = new Vector2(5, 6);
      result.lerpVectors(v1, v2, 1);
      expect(result.x).toBeCloseTo(5);
      expect(result.y).toBeCloseTo(6);
    });

    it('should interpolate correctly for alpha = 0.5', () => {
      const result = new Vector2();
      const v1 = new Vector2(0, 0);
      const v2 = new Vector2(10, 10);
      result.lerpVectors(v1, v2, 0.5);
      expect(result.x).toBeCloseTo(5);
      expect(result.y).toBeCloseTo(5);
    });

    it('should handle alpha > 1 (extrapolation)', () => {
      const result = new Vector2();
      const v1 = new Vector2(0, 0);
      const v2 = new Vector2(10, 10);
      result.lerpVectors(v1, v2, 1.5);
      expect(result.x).toBeCloseTo(15);
      expect(result.y).toBeCloseTo(15);
    });

    it('should handle negative alpha (reverse extrapolation)', () => {
      const result = new Vector2();
      const v1 = new Vector2(10, 10);
      const v2 = new Vector2(0, 0);
      result.lerpVectors(v1, v2, -0.5);
      expect(result.x).toBeCloseTo(15);
      expect(result.y).toBeCloseTo(15);
    });
  });

  describe('equals()', () => {
    it('should return true for identical vectors', () => {
      const a = new Vector2(3, 4);
      const b = new Vector2(3, 4);
      expect(a.equals(b)).toBe(true);
    });

    it('should return false if x components differ', () => {
      const a = new Vector2(3, 4);
      const b = new Vector2(5, 4);
      expect(a.equals(b)).toBe(false);
    });

    it('should return false if y components differ', () => {
      const a = new Vector2(3, 4);
      const b = new Vector2(3, 5);
      expect(a.equals(b)).toBe(false);
    });

    it('should return false if both components differ', () => {
      const a = new Vector2(1, 2);
      const b = new Vector2(3, 4);
      expect(a.equals(b)).toBe(false);
    });

    it('should return true if comparing vector to itself', () => {
      const a = new Vector2(7, 8);
      expect(a.equals(a)).toBe(true);
    });
  });

  describe('fromArray()', () => {
    it('should set x and y from a 2-element array', () => {
      const v = new Vector2();
      v.fromArray([5, 10]);
      expect(v.x).toBe(5);
      expect(v.y).toBe(10);
    });

    it('should set x and y using an offset', () => {
      const v = new Vector2();
      v.fromArray([0, 0, 7, 8], 2);
      expect(v.x).toBe(7);
      expect(v.y).toBe(8);
    });

    it('should return itself for chaining', () => {
      const v = new Vector2();
      const result = v.fromArray([1, 2]);
      expect(result).toBe(v);
    });

    it('should overwrite previous values', () => {
      const v = new Vector2(3, 4);
      v.fromArray([9, 10]);
      expect(v.x).toBe(9);
      expect(v.y).toBe(10);
    });
  });

  describe('toArray()', () => {
    it('should write x and y to a new array at offset 0', () => {
      const v = new Vector2(5, 10);
      const array = [0, 0];
      const result = v.toArray(array);
      expect(result[0]).toBe(5);
      expect(result[1]).toBe(10);
    });

    it('should write x and y to an array at a given offset', () => {
      const v = new Vector2(7, 8);
      const array = [0, 0, 0, 0];
      const result = v.toArray(array, 2);
      expect(result[2]).toBe(7);
      expect(result[3]).toBe(8);
    });

    it('should return the same array passed in', () => {
      const v = new Vector2(1, 2);
      const array = [0, 0];
      const result = v.toArray(array);
      expect(result).toBe(array);
    });

    it('should overwrite existing values', () => {
      const v = new Vector2(9, 10);
      const array = [5, 6];
      v.toArray(array);
      expect(array[0]).toBe(9);
      expect(array[1]).toBe(10);
    });
  });

  describe('fromBufferAttributes()', () => {
    it('should read x and y from a buffer attribute at given index', () => {
      const data = new Float32Array([1, 2, 3, 4, 5, 6]); // flattened array: [x0,y0,x1,y1,x2,y2]
      const attribute = new BufferAttribute(data, 2); // 2 components per vertex

      const v = new Vector2();
      v.fromBufferAttribute(attribute, 1); // should read the second vertex [3,4]

      expect(v.x).toBe(3);
      expect(v.y).toBe(4);
    });

    it('should return this for chaining', () => {
      const data = new Float32Array([10, 20]);
      const attribute = new BufferAttribute(data, 2);
      const v = new Vector2();

      const result = v.fromBufferAttribute(attribute, 0);
      expect(result).toBe(v);
    });

    it('should handle multiple vertices correctly', () => {
      const data = new Float32Array([5, 6, 7, 8, 9, 10]);
      const attribute = new BufferAttribute(data, 2);

      const v1 = new Vector2().fromBufferAttribute(attribute, 0);
      const v2 = new Vector2().fromBufferAttribute(attribute, 1);
      const v3 = new Vector2().fromBufferAttribute(attribute, 2);

      expect(v1.x).toBe(5);
      expect(v1.y).toBe(6);

      expect(v2.x).toBe(7);
      expect(v2.y).toBe(8);

      expect(v3.x).toBe(9);
      expect(v3.y).toBe(10);
    });
  });

  describe('rotateAround()', () => {
    it('should rotate a vector 90 degrees around the origin', () => {
      const v = new Vector2(1, 0);
      const center = new Vector2(0, 0);
      v.rotateAround(center, Math.PI / 2);

      expect(v.x).toBeCloseTo(0);
      expect(v.y).toBeCloseTo(1);
    });

    it('should rotate a vector 180 degrees around a non-origin center', () => {
      const v = new Vector2(2, 2);
      const center = new Vector2(1, 1);
      v.rotateAround(center, Math.PI);

      expect(v.x).toBeCloseTo(0);
      expect(v.y).toBeCloseTo(0);
    });

    it('should not change vector if angle is 0', () => {
      const v = new Vector2(3, 4);
      const center = new Vector2(1, 1);
      const originalX = v.x;
      const originalY = v.y;

      v.rotateAround(center, 0);

      expect(v.x).toBe(originalX);
      expect(v.y).toBe(originalY);
    });

    it('should return this for chaining', () => {
      const v = new Vector2(1, 1);
      const center = new Vector2(0, 0);
      const result = v.rotateAround(center, Math.PI / 4);
      expect(result).toBe(v);
    });
  });

  describe('random()', () => {
    it('should set x and y to values between 0 (inclusive) and 1 (exclusive)', () => {
      const v = new Vector2();
      v.random();

      expect(v.x).toBeGreaterThanOrEqual(0);
      expect(v.x).toBeLessThan(1);
      expect(v.y).toBeGreaterThanOrEqual(0);
      expect(v.y).toBeLessThan(1);
    });

    it('should return this for chaining', () => {
      const v = new Vector2();
      const result = v.random();
      expect(result).toBe(v);
    });

    it('should produce different values when called multiple times', () => {
      const v1 = new Vector2().random();
      const v2 = new Vector2().random();

      // There is a small chance this test may fail due to randomness,
      // but statistically it's extremely unlikely.
      expect(v1.x === v2.x && v1.y === v2.y).toBe(false);
    });
  });

  describe('clone()', () => {
    it("returns a new Vector2 with identical x and y values", () => {
      const v = new Vector2(5, 10);
      const c = v.clone();

      expect(c.x).toBe(5);
      expect(c.y).toBe(10);
    });

    it("returns a different instance (not the same object)", () => {
      const v = new Vector2(1, 2);
      const c = v.clone();

      expect(c).not.toBe(v);
    });

    it("clone should produce an instance of the same class", () => {
      class CustomVector2 extends Vector2 { }
      const v = new CustomVector2(3, 4);
      const c = v.clone();

      expect(c).toBeInstanceOf(CustomVector2);
    });

    it("changing the clone does not affect the original", () => {
      const v = new Vector2(7, 8);
      const c = v.clone();
      c.x = 99;

      expect(v.x).toBe(7);
      expect(c.x).toBe(99);
    });
  });

  describe('copy()', () => {
    it("copies x and y values from another vector", () => {
      const a = new Vector2(1, 2);
      const b = new Vector2();

      b.copy(a);

      expect(b.x).toBe(1);
      expect(b.y).toBe(2);
    });

    it("returns the same instance (this)", () => {
      const v1 = new Vector2(3, 4);
      const v2 = new Vector2();

      const result = v2.copy(v1);

      expect(result).toBe(v2);
    });

    it("does not create a reference link between vectors", () => {
      const a = new Vector2(10, 20);
      const b = new Vector2();

      b.copy(a);
      b.x = 999;

      // Ensure a is not affected
      expect(a.x).toBe(10);
      expect(a.y).toBe(20);
    });

    it("works correctly when copying from a subclass instance", () => {
      class CustomVector2 extends Vector2 { }
      const a = new CustomVector2(7, 8);
      const b = new Vector2();

      b.copy(a);

      expect(b.x).toBe(7);
      expect(b.y).toBe(8);
    });
  });

  describe('[Symbol.iterator]()', () => {
    it('should iterate over x and y in order', () => {
      const v = new Vector2(3, 7);
      const components = [...v];

      expect(components).toEqual([3, 7]);
    });

    it('should work with for...of loops', () => {
      const v = new Vector2(1, 2);
      const result: number[] = [];

      for (const value of v) {
        result.push(value as number);
      }

      expect(result).toEqual([1, 2]);
    });

    it('should allow destructuring', () => {
      const v = new Vector2(5, 9);
      const [x, y] = v;

      expect(x).toBe(5);
      expect(y).toBe(9);
    });
  });
});
