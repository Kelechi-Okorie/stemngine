import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Euler } from '../../../src/math/Euler.js';
import { Matrix4 } from '../../../src/math/Matrix4.js';
import { EulerOrder } from '../../../src/constants.js';
import { Vector3 } from '../../../src/math/Vector3.js';
import { Quaternion } from '../../../src/math/Quaternion.js';

const EPS = 1e-6;

describe('Euler', () => {
  describe('constructor()', () => {
    it('should have DEFAULT_ORDER as "XYZ"', () => {
      const e = new Euler();
      expect(e.DEFAULT_ORDER).toBe('XYZ');
    });

    it('should have isEuler as true', () => {
      const e = new Euler();
      expect(e.isEuler).toBe(true);
    });

    it('should initialize _x, _y, _z with default values 0', () => {
      const e = new Euler();
      // access private fields via getters if you have them, otherwise TypeScript won't allow
      expect((e as any)._x).toBe(0);
      expect((e as any)._y).toBe(0);
      expect((e as any)._z).toBe(0);
    });

    it('should initialize _order with DEFAULT_ORDER', () => {
      const e = new Euler();
      expect(e.order).toBe(e.DEFAULT_ORDER);
    });

    it('should allow custom values for constructor', () => {
      const e = new Euler(Math.PI, Math.PI / 2, 1.23, 'ZYX');
      expect((e as any)._x).toBeCloseTo(Math.PI);
      expect((e as any)._y).toBeCloseTo(Math.PI / 2);
      expect((e as any)._z).toBeCloseTo(1.23);
      expect((e as any)._order).toBe('ZYX');
    });
  });

  describe('set()', () => {
    it('should set x, y, z, and order', () => {
      const e = new Euler();

      e.set(1, 2, 3, 'ZYX');

      expect((e as any)._x).toBe(1);
      expect((e as any)._y).toBe(2);
      expect((e as any)._z).toBe(3);
      expect((e as any)._order).toBe('ZYX');
    });

    it('should default to the existing order when no order is provided', () => {
      const e = new Euler(0, 0, 0, 'YXZ');

      e.set(4, 5, 6); // No order provided

      expect((e as any)._x).toBe(4);
      expect((e as any)._y).toBe(5);
      expect((e as any)._z).toBe(6);
      expect((e as any)._order).toBe('YXZ'); // unchanged
    });

    it('should call _onChangeCallback()', () => {
      const e = new Euler();

      // Mock the private callback
      const spy = vi.fn();
      (e as any)._onChangeCallback = spy;

      e.set(1, 1, 1, 'XYZ');

      expect(spy).toHaveBeenCalledOnce();
    });

    it('should return the instance (for chaining)', () => {
      const e = new Euler();
      const result = e.set(1, 2, 3);

      expect(result).toBe(e);
    });
  });

  describe('getters()', () => {
    it('should correctly return the x, y, z values', () => {
      const e = new Euler(1, 2, 3, 'XYZ');

      expect(e.x).toBe(1);
      expect(e.y).toBe(2);
      expect(e.z).toBe(3);
    });

    it('should correctly return the order value', () => {
      const e = new Euler(0, 0, 0, 'ZYX');

      expect(e.order).toBe('ZYX');
    });

    it('should reflect internal state changes (sanity check)', () => {
      const e = new Euler();

      // Directly modify (only in test) to ensure getters reflect private fields
      (e as any)._x = 10;
      (e as any)._y = 20;
      (e as any)._z = 30;
      (e as any)._order = 'YXZ';

      expect(e.x).toBe(10);
      expect(e.y).toBe(20);
      expect(e.z).toBe(30);
      expect(e.order).toBe('YXZ');
    });
  });

  describe('setters()', () => {
    it('should update x and call _onChangeCallback', () => {
      const e = new Euler();
      const spy = vi.fn();
      e._onChange(spy);

      e.x = Math.PI;

      expect(e.x).toBe(Math.PI);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should update y and call _onChangeCallback', () => {
      const e = new Euler();
      const spy = vi.fn();
      e._onChange(spy);

      e.y = 2;

      expect(e.y).toBe(2);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should update z and call _onChangeCallback', () => {
      const e = new Euler();
      const spy = vi.fn();
      e._onChange(spy);

      e.z = -5;

      expect(e.z).toBe(-5);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should update order and call _onChangeCallback', () => {
      const e = new Euler();
      const spy = vi.fn();
      e._onChange(spy);

      e.order = 'ZYX';

      expect(e.order).toBe('ZYX');
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should call the callback once per setter call', () => {
      const e = new Euler();
      const spy = vi.fn();
      e._onChange(spy);

      e.x = 1;
      e.y = 2;
      e.z = 3;
      e.order = 'YXZ';

      expect(spy).toHaveBeenCalledTimes(4);
    });
  });

  describe('_onChange()', () => {
    it("should not throw if set() is called before registering a callback", () => {
      const e = new Euler();
      expect(() => e.set(1, 2, 3)).not.toThrow();
    });

    it("should register the onChange callback and call it when the Euler changes", () => {
      const e = new Euler();
      const cb = vi.fn();

      e._onChange(cb);
      e.set(1, 2, 3);

      expect(cb).toHaveBeenCalledTimes(1);
    });

    it("should call the latest registered callback", () => {
      const e = new Euler();
      const cb1 = vi.fn();
      const cb2 = vi.fn();

      e._onChange(cb1);
      e._onChange(cb2); // overrides the first one

      e.set(1, 2, 3);

      expect(cb1).toHaveBeenCalledTimes(0);
      expect(cb2).toHaveBeenCalledTimes(1);
    });

    it("should return this for chaining", () => {
      const e = new Euler();
      const cb = () => { };

      const result = e._onChange(cb);

      expect(result).toBe(e);
    });
  });

  describe('clone()', () => {
    it("should return a new Euler instance", () => {
      const e = new Euler(1, 2, 3, "YZX");
      const clone = e.clone();

      expect(clone).not.toBe(e);     // different instance
      expect(clone).toBeInstanceOf(Euler);
    });

    it("should copy x, y, z values", () => {
      const e = new Euler(0.1, 0.2, 0.3);
      const clone = e.clone();

      expect(clone.x).toBe(e.x);
      expect(clone.y).toBe(e.y);
      expect(clone.z).toBe(e.z);
    });

    it("should copy the rotation order", () => {
      const e = new Euler(0, 0, 0, "ZXY");
      const clone = e.clone();

      expect(clone.order).toBe("ZXY");
    });

    it("should be independent of the original after cloning", () => {
      const e = new Euler(1, 2, 3, "XYZ");
      const clone = e.clone();

      // modify original
      e.set(4, 5, 6, "YXZ");

      // clone should not change
      expect(clone.x).toBe(1);
      expect(clone.y).toBe(2);
      expect(clone.z).toBe(3);
      expect(clone.order).toBe("XYZ");
    });

    it("should not share references with the original", () => {
      const e = new Euler(10, 20, 30, "ZXY");
      const clone = e.clone();

      // ensure both are independent objects
      expect(clone).not.toBe(e);
      expect(Object.is(clone, e)).toBe(false);
    });
  });

  describe('copy()', () => {
    it("should copy x, y, z values from another Euler", () => {
      const source = new Euler(1, 2, 3, "YXZ");
      const target = new Euler();

      target.copy(source);

      expect(target.x).toBe(1);
      expect(target.y).toBe(2);
      expect(target.z).toBe(3);
    });

    it("should copy the order from another Euler", () => {
      const source = new Euler(0, 0, 0, "ZXY");
      const target = new Euler();

      target.copy(source);

      expect(target.order).toBe("ZXY");
    });

    it("should return itself for chaining", () => {
      const source = new Euler(1, 1, 1);
      const target = new Euler();

      const result = target.copy(source);

      expect(result).toBe(target);
    });

    it("should call the onChange callback exactly once", () => {
      const source = new Euler(1, 2, 3, "XYZ");
      const target = new Euler();

      const callback = vi.fn();
      target._onChange(callback);

      target.copy(source);

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should overwrite existing values in the target", () => {
      const source = new Euler(9, 8, 7, "YZX");
      const target = new Euler(1, 2, 3, "XYZ");

      target.copy(source);

      expect(target.x).toBe(9);
      expect(target.y).toBe(8);
      expect(target.z).toBe(7);
      expect(target.order).toBe("YZX");
    });

    it("should not link the two Eulers (no shared updates)", () => {
      const source = new Euler(1, 2, 3, "XYZ");
      const target = new Euler();

      target.copy(source);

      // Modify source afterward
      source.set(10, 20, 30, "ZXY");

      // Target should remain unchanged
      expect(target.x).toBe(1);
      expect(target.y).toBe(2);
      expect(target.z).toBe(3);
      expect(target.order).toBe("XYZ");
    });
  });

  describe('setFromRotationMatrix()', () => {
    it("should extract correct XYZ Euler angles from a rotation matrix", () => {
      const original = new Euler(Math.PI / 4, Math.PI / 6, -Math.PI / 3, "XYZ");
      const m = new Matrix4().makeRotationFromEuler(original);

      const e = new Euler();
      e.setFromRotationMatrix(m, "XYZ");

      expect(e.x).toBeCloseTo(original.x, EPS);
      expect(e.y).toBeCloseTo(original.y, EPS);
      expect(e.z).toBeCloseTo(original.z, EPS);
      expect(e.order).toBe("XYZ");
    });

    it("should extract correct ZYX Euler angles", () => {
      const original = new Euler(0.5, -0.25, 1.0, "ZYX");
      const m = new Matrix4().makeRotationFromEuler(original);

      const e = new Euler();
      e.setFromRotationMatrix(m, "ZYX");

      expect(e.x).toBeCloseTo(original.x, EPS);
      expect(e.y).toBeCloseTo(original.y, EPS);
      expect(e.z).toBeCloseTo(original.z, EPS);
      expect(e.order).toBe("ZYX");
    });

    it("should call _onChangeCallback() when update = true", () => {
      const m = new Matrix4().makeRotationFromEuler(new Euler(1, 1, 1));
      const e = new Euler();

      const cb = vi.fn();
      e._onChange(cb);

      e.setFromRotationMatrix(m, "XYZ", true);

      expect(cb).toHaveBeenCalledTimes(1);
    });

    it("should NOT call _onChangeCallback() when update = false", () => {
      const m = new Matrix4().makeRotationFromEuler(new Euler(1, 1, 1));
      const e = new Euler();

      const cb = vi.fn();
      e._onChange(cb);

      e.setFromRotationMatrix(m, "XYZ", false);

      expect(cb).not.toHaveBeenCalled();
    });

    it("should set the internal order value", () => {
      const m = new Matrix4().makeRotationFromEuler(new Euler());

      const e = new Euler();
      e.setFromRotationMatrix(m, "YZX");

      expect(e.order).toBe("YZX");
    });

    it("should handle gimbal lock for XYZ order (|m13| ≈ 1)", () => {
      // Gimbal lock: pitch = ±90° (y = ±π/2)
      const original = new Euler(0.3, Math.PI / 2, -1.0, "XYZ");
      const m = new Matrix4().makeRotationFromEuler(original);

      const e = new Euler();
      e.setFromRotationMatrix(m, "XYZ");

      expect(e.y).toBeCloseTo(original.y, EPS);
      // x and z cannot be recovered uniquely, but must be finite numbers
      expect(Number.isFinite(e.x)).toBe(true);
      expect(Number.isFinite(e.z)).toBe(true);
    });

    it("should support round-trip Euler → Matrix → Euler for all orders", () => {
      const orders: EulerOrder[] = ["XYZ", "YXZ", "ZXY", "ZYX", "YZX", "XZY"];

      for (const order of orders) {
        const original = new Euler(0.7, -0.4, 1.2, order);
        const m = new Matrix4().makeRotationFromEuler(original);

        const e = new Euler();
        e.setFromRotationMatrix(m, order);

        expect(e.x).toBeCloseTo(original.x, EPS);
        expect(e.y).toBeCloseTo(original.y, EPS);
        expect(e.z).toBeCloseTo(original.z, EPS);
        expect(e.order).toBe(order);
      }
    });

    it("should return itself for chaining", () => {
      const e = new Euler();
      const m = new Matrix4().makeRotationFromEuler(new Euler());

      const result = e.setFromRotationMatrix(m, "XYZ");

      expect(result).toBe(e);
    });
  });

  describe('setFromQuaternion()', () => {
    let euler: Euler;

    beforeEach(() => {
      euler = new Euler();
    });

    it('should set Euler angles from a normalized quaternion', () => {
      const axis = new Vector3(0, 1, 0);
      const angle = Math.PI / 2;
      const q = new Quaternion().setFromAxisAngle(axis, angle).normalize();

      euler.setFromQuaternion(q);

      expect(typeof euler.x).toBe('number');
      expect(typeof euler.y).toBe('number');
      expect(typeof euler.z).toBe('number');
      expect(['XYZ', 'YXZ', 'ZXY', 'ZYX', 'YZX', 'XZY']).toContain(euler.order);
    });

    it('should respect the order parameter', () => {
      const q = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2).normalize();
      const order: EulerOrder = 'ZYX';

      euler.setFromQuaternion(q, order);

      expect(euler.order).toBe(order);
    });

    it('should call the internal onChange callback if update is true', () => {
      const q = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2).normalize();
      const callback = vi.fn();
      euler._onChange(callback);

      euler.setFromQuaternion(q, undefined, true);

      expect(callback).toHaveBeenCalled();
    });

    it('should not call the internal onChange callback if update is false', () => {
      const q = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2).normalize();
      const callback = vi.fn();
      euler._onChange(callback);

      euler.setFromQuaternion(q, undefined, false);

      expect(callback).not.toHaveBeenCalled();
    });

    it('should produce Euler angles that can reconstruct the original quaternion', () => {
      const axis = new Vector3(1, 1, 0).normalize();
      const angle = Math.PI / 3;
      const qOriginal = new Quaternion().setFromAxisAngle(axis, angle).normalize();

      euler.setFromQuaternion(qOriginal);
      const qReconstructed = new Quaternion().setFromEuler(euler);

      expect(qReconstructed.x).toBeCloseTo(qOriginal.x, 5);
      expect(qReconstructed.y).toBeCloseTo(qOriginal.y, 5);
      expect(qReconstructed.z).toBeCloseTo(qOriginal.z, 5);
      expect(qReconstructed.w).toBeCloseTo(qOriginal.w, 5);
    });

    it('should return this for chaining', () => {
      const q = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2).normalize();

      const result = euler.setFromQuaternion(q);

      expect(result).toBe(euler);
    });
  });

  describe('setFromVector3()', () => {
    let euler: Euler;

    beforeEach(() => {
      euler = new Euler();
    });

    it('should set Euler angles from a Vector3', () => {
      const v = new Vector3(Math.PI / 2, Math.PI / 4, Math.PI / 6);
      euler.setFromVector3(v);

      expect(euler.x).toBeCloseTo(v.x, 10);
      expect(euler.y).toBeCloseTo(v.y, 10);
      expect(euler.z).toBeCloseTo(v.z, 10);
    });

    it('should respect the order parameter', () => {
      const v = new Vector3(1, 2, 3);
      const order: EulerOrder = 'ZYX';

      euler.setFromVector3(v, order);

      expect(euler.order).toBe(order);
    });

    it('should call the onChange callback', () => {
      const v = new Vector3(1, 2, 3);
      const callback = vi.fn();
      euler._onChange(callback);

      euler.setFromVector3(v);

      expect(callback).toHaveBeenCalled();
    });

    it('should return this for chaining', () => {
      const v = new Vector3(1, 2, 3);

      const result = euler.setFromVector3(v);

      expect(result).toBe(euler);
    });
  });

  describe('reorder()', () => {
    let euler: Euler;

    beforeEach(() => {
      euler = new Euler(Math.PI / 3, Math.PI / 4, Math.PI / 6, 'XYZ');
    });

    it('should change the order of the Euler angles', () => {
      const newOrder: EulerOrder = 'ZYX';
      euler.reorder(newOrder);

      expect(euler.order).toBe(newOrder);
    });

    it('should update Euler angles after reordering', () => {
      const oldX = euler.x;
      const oldY = euler.y;
      const oldZ = euler.z;

      euler.reorder('YXZ');

      // The angles should change (revolution info discarded)
      expect(euler.x).not.toBeCloseTo(oldX, 10);
      expect(euler.y).not.toBeCloseTo(oldY, 10);
      expect(euler.z).not.toBeCloseTo(oldZ, 10);
    });

    it('should call the onChange callback', () => {
      const callback = vi.fn();
      euler._onChange(callback);

      euler.reorder('XZY');

      expect(callback).toHaveBeenCalled();
    });

    it('should return this for chaining', () => {
      const result = euler.reorder('YZX');
      expect(result).toBe(euler);
    });
  });

  describe('equals()', () => {
    it('should return true for identical Euler instances', () => {
      const e1 = new Euler(1, 2, 3, 'XYZ');
      const e2 = new Euler(1, 2, 3, 'XYZ');

      expect(e1.equals(e2)).toBe(true);
    });

    it('should return false if x differs', () => {
      const e1 = new Euler(1, 2, 3, 'XYZ');
      const e2 = new Euler(0, 2, 3, 'XYZ');

      expect(e1.equals(e2)).toBe(false);
    });

    it('should return false if y differs', () => {
      const e1 = new Euler(1, 2, 3, 'XYZ');
      const e2 = new Euler(1, 0, 3, 'XYZ');

      expect(e1.equals(e2)).toBe(false);
    });

    it('should return false if z differs', () => {
      const e1 = new Euler(1, 2, 3, 'XYZ');
      const e2 = new Euler(1, 2, 0, 'XYZ');

      expect(e1.equals(e2)).toBe(false);
    });

    it('should return false if order differs', () => {
      const e1 = new Euler(1, 2, 3, 'XYZ');
      const e2 = new Euler(1, 2, 3, 'ZYX');

      expect(e1.equals(e2)).toBe(false);
    });
  });

  describe('fromArray()', () => {
    it('should set x, y, z from array', () => {
      const e = new Euler();
      e.fromArray([1, 2, 3]);
      expect(e.x).toBe(1);
      expect(e.y).toBe(2);
      expect(e.z).toBe(3);
      // order remains default
      expect(e.order).toBe('XYZ');
    });

    it('should set order if provided in array', () => {
      const e = new Euler();
      e.fromArray([1, 2, 3], 'ZYX');
      expect(e.x).toBe(1);
      expect(e.y).toBe(2);
      expect(e.z).toBe(3);
      expect(e.order).toBe('ZYX');
    });

    it('should call _onChangeCallback', () => {
      const e = new Euler();
      const callback = vi.fn();
      e._onChange(callback);
      e.fromArray([1, 2, 3]);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('toArray()', () => {
    it('should return a new array with x, y, z components if no array is provided', () => {
      const e = new Euler(1, 2, 3, 'XYZ');
      const arr = e.toArray();

      expect(arr).toEqual([1, 2, 3]);
    });

    it('should write components into an existing array at the given offset', () => {
      const e = new Euler(4, 5, 6);
      const arr = [0, 0, 0, 0, 0];
      const result = e.toArray(arr, 1);

      expect(result).toBe(arr); // should return the same array reference
      expect(arr).toEqual([0, 4, 5, 6, 0]);
    });

    it('should overwrite existing values in the target array', () => {
      const e = new Euler(7, 8, 9);
      const arr = [10, 11, 12, 13];
      e.toArray(arr);

      expect(arr).toEqual([7, 8, 9, 13]); // only first three overwritten, last stays the same
    });

    it('should handle offset correctly', () => {
      const e = new Euler(0.1, 0.2, 0.3);
      const arr = [0, 0, 0, 0, 0, 0];
      e.toArray(arr, 2);

      expect(arr).toEqual([0, 0, 0.1, 0.2, 0.3, 0]);
    });
  });
});
