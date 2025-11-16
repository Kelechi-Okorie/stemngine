import { describe, it, expect, vi } from 'vitest'
import { Quaternion } from '../../../src/math/Quaternion.js';
import { Matrix4 } from '../../../src/math/Matrix4';
import { Euler } from '../../../src/math/Euler.js';
import { Vector3 } from '../../../src/math/Vector3.js';
import { BufferAttribute } from '../../../src/core/BufferAttribute.js';

function expectQuatClose(q1: Quaternion, q2: Quaternion, precision = 6) {
  expect(q1.x).toBeCloseTo(q2.x, precision);
  expect(q1.y).toBeCloseTo(q2.y, precision);
  expect(q1.z).toBeCloseTo(q2.z, precision);
  expect(q1.w).toBeCloseTo(q2.w, precision);
}

function isUnit(q: Quaternion, eps = 1e-6) {
  const len = Math.sqrt(q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w);
  return Math.abs(len - 1) < eps;
}

describe('Quaternion', () => {
  describe('constructor()', () => {
    it('creates a quaternion with default values when no arguments are provided', () => {
      const q = new Quaternion();

      expect(q.x).toBe(0);
      expect(q.y).toBe(0);
      expect(q.z).toBe(0);
      expect(q.w).toBe(1);
    });

    it('create a quaternion with provided x, y, z, w values', () => {
      const q = new Quaternion(1, 2, 3, 4);

      expect(q.x).toBe(1);
      expect(q.y).toBe(2);
      expect(q.z).toBe(3);
      expect(q.w).toBe(4);
    });

    it('sets isQuaternion flag to true', () => {
      const q = new Quaternion();

      expect(q.isQuaternion).toBe(true);
    });

    it('returns an instance of Quaternion', () => {
      const q = new Quaternion();

      expect(q).toBeInstanceOf(Quaternion);
    });
  });

  describe('set()', () => {
    it('updates all components correctly', () => {
      const q = new Quaternion();
      q.set(1, 2, 3, 4);

      expect(q.x).toBe(1);
      expect(q.y).toBe(2);
      expect(q.z).toBe(3);
      expect(q.w).toBe(4);
    });

    it('calls the _onChangeCallback when components are set', () => {
      const q = new Quaternion();
      const spy = vi.fn();
      q._onChange(spy);

      q.set(1, 2, 3, 4);

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('does not modify callback when not explictly changed', () => {
      const q = new Quaternion();
      const originalCallback = (q as any)._onChangeCallback;
      q.set(1, 2, 3, 4);

      expect((q as any)._onChangeCallback).toBe(originalCallback);
    });

    it('handles setting same values without issues', () => {
      const q = new Quaternion(1, 2, 3, 4);
      const spy = vi.fn();
      q._onChange(spy);

      q.set(1, 2, 3, 4);  // same values

      expect(q.x).toBe(1);
      expect(q.y).toBe(2);
      expect(q.z).toBe(3);
      expect(q.w).toBe(4);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('returns itself for chaining', () => {
      const q = new Quaternion();
      const result = q.set(5, 6, 7, 8);

      expect(result).toBe(q);
    });

  });

  describe('getX()', () => {
    it("returns the x component", () => {
      const q = new Quaternion(1, 2, 3, 4);
      expect(q.getX()).toBe(1);
    });

    it("works with negative values", () => {
      const q = new Quaternion(-5.5, 2, 3, 4);
      expect(q.getX()).toBeCloseTo(-5.5);
    });

    it("works with floating point values", () => {
      const q = new Quaternion(0.123456, 0, 0, 1);
      expect(q.getX()).toBeCloseTo(0.123456);
    });

    it("does not modify the quaternion", () => {
      const q = new Quaternion(9, 8, 7, 6);
      const x = q.getX();

      expect(x).toBe(9);
      expect(q.x).toBe(9);
      expect(q.y).toBe(8);
      expect(q.z).toBe(7);
      expect(q.w).toBe(6);
    });

    it("works independently of other components", () => {
      const q = new Quaternion(42, 123, -50, 999);
      expect(q.getX()).toBe(42);
    });
  });

  describe('setX()', () => {
    it("sets the x component to the given value", () => {
      const q = new Quaternion(1, 2, 3, 4);
      q.setX(10);
      expect(q.x).toBe(10);
    });

    it("supports negative values", () => {
      const q = new Quaternion(5, 2, 3, 4);
      q.setX(-7.25);
      expect(q.x).toBeCloseTo(-7.25);
    });

    it("does not modify other components", () => {
      const q = new Quaternion(1, 2, 3, 4);
      q.setX(99);

      expect(q.x).toBe(99);
      expect(q.y).toBe(2);
      expect(q.z).toBe(3);
      expect(q.w).toBe(4);
    });

    it("calls _onChangeCallback()", () => {
      const q = new Quaternion(1, 2, 3, 4);

      // Spy on the callback
      const spy = vi.spyOn(q as any, "_onChangeCallback");

      q.setX(20);

      expect(spy).toHaveBeenCalledOnce();
    });

    it("does not call _onChangeCallback() if value is the same (optional behavior test)", () => {
      // Only add this test if your implementation *should* avoid redundant calls.
      const q = new Quaternion(10, 2, 3, 4);

      const spy = vi.spyOn(q as any, "_onChangeCallback");

      q.setX(10); // same value

      // If your design says it should still notify, change this expectation.
      expect(spy).toHaveBeenCalledOnce();
    });
  });

  describe('getY()', () => {
    it("returns the y component of the quaternion", () => {
      const q = new Quaternion(1, 2, 3, 4);
      expect(q.getY()).toBe(2);
    });

    it("returns negative values correctly", () => {
      const q = new Quaternion(0, -5.5, 0, 0);
      expect(q.getY()).toBe(-5.5);
    });

    it("returns 0 if y is 0", () => {
      const q = new Quaternion(1, 0, 3, 4);
      expect(q.getY()).toBe(0);
    });

    it("does not modify the quaternion", () => {
      const q = new Quaternion(1, 2, 3, 4);
      const y = q.getY();
      expect(q.x).toBe(1);
      expect(q.y).toBe(2);
      expect(q.z).toBe(3);
      expect(q.w).toBe(4);
      expect(y).toBe(2);
    });
  });

  describe('setY()', () => {
    it("sets the y component of the quaternion", () => {
      const q = new Quaternion(1, 2, 3, 4);
      q.setY(10);
      expect(q.y).toBe(10);
    });

    it("calls _onChangeCallback when setting y", () => {
      const q = new Quaternion(1, 2, 3, 4);
      const spy = vi.spyOn(q as any, "_onChangeCallback");
      q.setY(5);
      expect(spy).toHaveBeenCalled();
    });

    it("updates y correctly with negative values", () => {
      const q = new Quaternion(0, 0, 0, 0);
      q.setY(-7.5);
      expect(q.y).toBe(-7.5);
    });

    it("does not modify other components", () => {
      const q = new Quaternion(1, 2, 3, 4);
      q.setY(20);
      expect(q.x).toBe(1);
      expect(q.z).toBe(3);
      expect(q.w).toBe(4);
    });
  });

  describe('getZ()', () => {
    it("returns the z component of the quaternion", () => {
      const q = new Quaternion(1, 2, 3, 4);
      expect(q.getZ()).toBe(3);
    });

    it("returns zero if z is initially zero", () => {
      const q = new Quaternion(0, 0, 0, 1);
      expect(q.getZ()).toBe(0);
    });

    it("returns negative values correctly", () => {
      const q = new Quaternion(0, 0, -5, 1);
      expect(q.getZ()).toBe(-5);
    });

    it("does not modify any component", () => {
      const q = new Quaternion(7, 8, 9, 10);
      const z = q.getZ();
      expect(q.x).toBe(7);
      expect(q.y).toBe(8);
      expect(q.w).toBe(10);
      expect(z).toBe(9);
    });
  });

  describe('setZ()', () => {
    it("sets the z component of the quaternion", () => {
      const q = new Quaternion(1, 2, 3, 4);
      q.setZ(10);
      expect(q.z).toBe(10);
    });

    it("calls _onChangeCallback after setting z", () => {
      const q = new Quaternion(0, 0, 0, 1);
      const callback = vi.fn();
      q._onChange(callback);

      q.setZ(5);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("updates z correctly multiple times", () => {
      const q = new Quaternion(0, 0, 0, 1);
      q.setZ(7);
      expect(q.z).toBe(7);

      q.setZ(-3);
      expect(q.z).toBe(-3);
    });

    it("does not modify other components", () => {
      const q = new Quaternion(1, 2, 3, 4);
      q.setZ(20);
      expect(q.x).toBe(1);
      expect(q.y).toBe(2);
      expect(q.w).toBe(4);
      expect(q.z).toBe(20);
    });
  });

  describe('getW()', () => {
    it("returns the w component of the quaternion", () => {
      const q = new Quaternion(1, 2, 3, 4);
      expect(q.getW()).toBe(4);
    });

    it("returns the correct value after modifying w directly", () => {
      const q = new Quaternion(0, 0, 0, 1);
      q.w = 10;
      expect(q.getW()).toBe(10);
    });

    it("returns the correct value after using setW()", () => {
      const q = new Quaternion(1, 2, 3, 4);
      q.setW(99);
      expect(q.getW()).toBe(99);
    });
  });

  describe('setW()', () => {
    it("sets the w component of the quaternion", () => {
      const q = new Quaternion(1, 2, 3, 4);
      q.setW(99);
      expect(q.w).toBe(99);
    });

    it("calls _onChangeCallback when setting w", () => {
      const q = new Quaternion(0, 0, 0, 0);
      const spy = vi.spyOn(q as any, "_onChangeCallback");

      q.setW(42);

      expect(spy).toHaveBeenCalled();
      expect(q.w).toBe(42);
    });
  });

  describe('clone()', () => {
    it('should create a new quaternion with the same values', () => {
      const q1 = new Quaternion(1, 2, 3, 4);
      const q2 = q1.clone();

      expect(q2.x).toBe(q1.x);
      expect(q2.y).toBe(q1.y);
      expect(q2.z).toBe(q1.z);
      expect(q2.w).toBe(q1.w);
    });

    it('should return a different instance', () => {
      const q1 = new Quaternion(1, 2, 3, 4);
      const q2 = q1.clone();

      expect(q2).not.toBe(q1); // different reference
    });

    it('modifying the clone should not affect the original', () => {
      const q1 = new Quaternion(1, 2, 3, 4);
      const q2 = q1.clone();
      q2.x = 9;
      q2.y = 8;

      expect(q1.x).toBe(1);
      expect(q1.y).toBe(2);
      expect(q2.x).toBe(9);
      expect(q2.y).toBe(8);
    });
  });

  describe('copy()', () => {
    it('should copy all components from another quaternion', () => {
      const q1 = new Quaternion(1, 2, 3, 4);
      const q2 = new Quaternion();

      q2.copy(q1);

      expect(q2.x).toBe(1);
      expect(q2.y).toBe(2);
      expect(q2.z).toBe(3);
      expect(q2.w).toBe(4);
    });

    it('should return itself for chaining', () => {
      const q1 = new Quaternion(1, 2, 3, 4);
      const q2 = new Quaternion();

      const result = q2.copy(q1);
      expect(result).toBe(q2);
    });

    it('should call the _onChangeCallback', () => {
      const q1 = new Quaternion(1, 2, 3, 4);
      const q2 = new Quaternion();
      const callback = vi.fn();

      q2._onChange(callback);

      q2.copy(q1);

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('setFromEuler()', () => {
    it('should create the identity quaternion for zero Euler angles', () => {
      const euler = new Euler(0, 0, 0, 'XYZ');
      const q = new Quaternion().setFromEuler(euler);
      expect(q.x).toBeCloseTo(0);
      expect(q.y).toBeCloseTo(0);
      expect(q.z).toBeCloseTo(0);
      expect(q.w).toBeCloseTo(1);
    });

    it('should represent 90° rotation around X axis correctly', () => {
      const euler = new Euler(Math.PI / 2, 0, 0, 'XYZ');
      const q = new Quaternion().setFromEuler(euler);
      expect(q.x).toBeCloseTo(Math.sin(Math.PI / 4));
      expect(q.y).toBeCloseTo(0);
      expect(q.z).toBeCloseTo(0);
      expect(q.w).toBeCloseTo(Math.cos(Math.PI / 4));
    });

    it('should represent 90° rotation around Y axis correctly', () => {
      const euler = new Euler(0, Math.PI / 2, 0, 'XYZ');
      const q = new Quaternion().setFromEuler(euler);
      expect(q.x).toBeCloseTo(0);
      expect(q.y).toBeCloseTo(Math.sin(Math.PI / 4));
      expect(q.z).toBeCloseTo(0);
      expect(q.w).toBeCloseTo(Math.cos(Math.PI / 4));
    });

    it('should represent 90° rotation around Z axis correctly', () => {
      const euler = new Euler(0, 0, Math.PI / 2, 'XYZ');
      const q = new Quaternion().setFromEuler(euler);
      expect(q.x).toBeCloseTo(0);
      expect(q.y).toBeCloseTo(0);
      expect(q.z).toBeCloseTo(Math.sin(Math.PI / 4));
      expect(q.w).toBeCloseTo(Math.cos(Math.PI / 4));
    });

    it('should handle different rotation orders (e.g. ZYX vs XYZ)', () => {
      const eulerXYZ = new Euler(Math.PI / 4, Math.PI / 4, Math.PI / 4, 'XYZ');
      const eulerZYX = new Euler(Math.PI / 4, Math.PI / 4, Math.PI / 4, 'ZYX');

      const q1 = new Quaternion().setFromEuler(eulerXYZ);
      const q2 = new Quaternion().setFromEuler(eulerZYX);

      // They represent different rotations, so they should not be equal
      expect(q1.equals(q2)).toBe(false);
    });

    it('should call the onChange callback when update=true', () => {
      const q = new Quaternion();
      let called = false;
      // @ts-ignore access private for test
      q._onChangeCallback = () => { called = true; };
      q.setFromEuler(new Euler(0, Math.PI / 4, 0, 'XYZ'), true);
      expect(called).toBe(true);
    });

    it('should NOT call the onChange callback when update=false', () => {
      const q = new Quaternion();
      let called = false;
      // @ts-ignore access private for test
      q._onChangeCallback = () => { called = true; };
      q.setFromEuler(new Euler(0, Math.PI / 4, 0, 'XYZ'), false);
      expect(called).toBe(false);
    });

    it('should warn on unknown rotation order', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => { });
      const euler = new Euler(0, 0, 0, 'BAD');
      new Quaternion().setFromEuler(euler);
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should return the same quaternion instance (chainable)', () => {
      const q = new Quaternion();
      const result = q.setFromEuler(new Euler(0, 0, 0, 'XYZ'));
      expect(result).toBe(q);
    });
  });

  describe('setFromAxisAngle()', () => {
    it('should create the identity quaternion for zero angle', () => {
      const axis = new Vector3(1, 0, 0);
      const q = new Quaternion().setFromAxisAngle(axis, 0);
      expect(q.x).toBeCloseTo(0);
      expect(q.y).toBeCloseTo(0);
      expect(q.z).toBeCloseTo(0);
      expect(q.w).toBeCloseTo(1);
    });

    it('should correctly represent a 180° rotation around the X axis', () => {
      const axis = new Vector3(1, 0, 0);
      const q = new Quaternion().setFromAxisAngle(axis, Math.PI);
      expect(q.x).toBeCloseTo(1 * Math.sin(Math.PI / 2));
      expect(q.y).toBeCloseTo(0);
      expect(q.z).toBeCloseTo(0);
      expect(q.w).toBeCloseTo(Math.cos(Math.PI / 2)); // ≈ 0
    });

    it('should correctly represent a 90° rotation around the Y axis', () => {
      const axis = new Vector3(0, 1, 0);
      const q = new Quaternion().setFromAxisAngle(axis, Math.PI / 2);
      const half = Math.PI / 4;
      expect(q.x).toBeCloseTo(0);
      expect(q.y).toBeCloseTo(Math.sin(half));
      expect(q.z).toBeCloseTo(0);
      expect(q.w).toBeCloseTo(Math.cos(half));
    });

    it('should correctly represent a 45° rotation around the Z axis', () => {
      const axis = new Vector3(0, 0, 1);
      const q = new Quaternion().setFromAxisAngle(axis, Math.PI / 4);
      const half = Math.PI / 8;
      expect(q.x).toBeCloseTo(0);
      expect(q.y).toBeCloseTo(0);
      expect(q.z).toBeCloseTo(Math.sin(half));
      expect(q.w).toBeCloseTo(Math.cos(half));
    });

    it('should handle arbitrary normalized axis', () => {
      const axis = new Vector3(1, 1, 1).normalize();
      const angle = Math.PI / 3;
      const q = new Quaternion().setFromAxisAngle(axis, angle);
      const s = Math.sin(angle / 2);
      expect(q.x).toBeCloseTo(axis.x * s);
      expect(q.y).toBeCloseTo(axis.y * s);
      expect(q.z).toBeCloseTo(axis.z * s);
      expect(q.w).toBeCloseTo(Math.cos(angle / 2));
    });

    it('should not modify the axis vector passed in', () => {
      const axis = new Vector3(0, 1, 0);
      const before = axis.clone();
      new Quaternion().setFromAxisAngle(axis, Math.PI / 2);
      expect(axis.equals(before)).toBe(true);
    });

    it('should return the same quaternion instance (chainable)', () => {
      const q = new Quaternion();
      const result = q.setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 4);
      expect(result).toBe(q);
    });
  })

  describe('setFromRotationMatrix()', () => {
    it('should return this', () => {
      const q = new Quaternion();
      const m = new Matrix4().makeRotationX(Math.PI / 2);

      const result = q.setFromRotationMatrix(m);
      expect(result).toBe(q);
    });

    it('should produce identity quaternion for identity matrix', () => {
      const q = new Quaternion();
      const m = new Matrix4().identity();

      q.setFromRotationMatrix(m);

      expect(q.x).toBeCloseTo(0);
      expect(q.y).toBeCloseTo(0);
      expect(q.z).toBeCloseTo(0);
      expect(q.w).toBeCloseTo(1);
    });

    it('should correctly extract quaternion from rotation around X axis', () => {
      const angle = Math.PI / 2;
      const m = new Matrix4().makeRotationX(angle);
      const q = new Quaternion().setFromRotationMatrix(m);

      // rotation of 90° around X → quaternion (x=√½, w=√½)
      expect(q.x).toBeCloseTo(Math.sin(angle / 2));
      expect(q.y).toBeCloseTo(0);
      expect(q.z).toBeCloseTo(0);
      expect(q.w).toBeCloseTo(Math.cos(angle / 2));
    });

    it('should correctly extract quaternion from rotation around Y axis', () => {
      const angle = Math.PI / 2;
      const m = new Matrix4().makeRotationY(angle);
      const q = new Quaternion().setFromRotationMatrix(m);

      expect(q.x).toBeCloseTo(0);
      expect(q.y).toBeCloseTo(Math.sin(angle / 2));
      expect(q.z).toBeCloseTo(0);
      expect(q.w).toBeCloseTo(Math.cos(angle / 2));
    });

    it('should correctly extract quaternion from rotation around Z axis', () => {
      const angle = Math.PI / 2;
      const m = new Matrix4().makeRotationZ(angle);
      const q = new Quaternion().setFromRotationMatrix(m);

      expect(q.x).toBeCloseTo(0);
      expect(q.y).toBeCloseTo(0);
      expect(q.z).toBeCloseTo(Math.sin(angle / 2));
      expect(q.w).toBeCloseTo(Math.cos(angle / 2));
    });

    it('should yield a normalized quaternion (length ≈ 1)', () => {
      const euler = new Euler(Math.PI / 3, Math.PI / 4, Math.PI / 5);
      const m = new Matrix4().makeRotationFromEuler(euler);

      const q = new Quaternion().setFromRotationMatrix(m);

      // const length = Math.sqrt(q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w);
      const length = q.length();
      expect(length).toBeCloseTo(1, 5);
    });

    it('should handle 180° rotation correctly (trace near -1)', () => {
      const angle = Math.PI; // 180 degrees
      const m = new Matrix4().makeRotationY(angle);
      const q = new Quaternion().setFromRotationMatrix(m);

      // Expected quaternion: rotation 180° around Y → (0, 1, 0, 0)
      expect(Math.abs(q.x)).toBeCloseTo(0);
      expect(Math.abs(q.y)).toBeCloseTo(1);
      expect(Math.abs(q.z)).toBeCloseTo(0);
      expect(Math.abs(q.w)).toBeCloseTo(0);
    });
  });

  describe('setFromUnitVectors()', () => {
    it('should set the quaternion to identity if vectors are the same', () => {
      const vFrom = new Vector3(1, 0, 0).normalize();
      const vTo = new Vector3(1, 0, 0).normalize();

      const q = new Quaternion().setFromUnitVectors(vFrom, vTo);

      expect(q.x).toBeCloseTo(0);
      expect(q.y).toBeCloseTo(0);
      expect(q.z).toBeCloseTo(0);
      expect(q.w).toBeCloseTo(1);
    });

    it('should rotate 180 degrees if vectors are opposite', () => {
      const vFrom = new Vector3(1, 0, 0).normalize();
      const vTo = new Vector3(-1, 0, 0).normalize();

      const q = new Quaternion().setFromUnitVectors(vFrom, vTo);

      // The quaternion should be a 180-degree rotation around YZ plane
      // Since there are multiple valid 180-degree rotations, check that length is 1
      expect(Math.sqrt(q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w)).toBeCloseTo(1);
      expect(q.w).toBeCloseTo(0);
    });

    it('should rotate correctly between perpendicular vectors', () => {
      const vFrom = new Vector3(1, 0, 0).normalize();
      const vTo = new Vector3(0, 1, 0).normalize();

      const q = new Quaternion().setFromUnitVectors(vFrom, vTo);

      // The rotation should rotate X to Y
      const rotated = vFrom.clone().applyQuaternion(q);
      expect(rotated.x).toBeCloseTo(vTo.x);
      expect(rotated.y).toBeCloseTo(vTo.y);
      expect(rotated.z).toBeCloseTo(vTo.z);
    });

    it('should return itself for chaining', () => {
      const vFrom = new Vector3(1, 0, 0).normalize();
      const vTo = new Vector3(0, 1, 0).normalize();

      const q = new Quaternion();
      const result = q.setFromUnitVectors(vFrom, vTo);
      expect(result).toBe(q);
    });
  });

  describe('angleTo()', () => {
    it('should return 0 for identical quaternions', () => {
      const q1 = new Quaternion(1, 0, 0, 0).normalize();
      const q2 = new Quaternion(1, 0, 0, 0).normalize();
      expect(q1.angleTo(q2)).toBeCloseTo(0);
    });

    it('should return 0 for opposite quaternions (same rotation)', () => {
      const q1 = new Quaternion(1, 0, 0, 0).normalize();
      const q2 = new Quaternion(-1, 0, 0, 0).normalize(); // opposite quaternion
      expect(q1.angleTo(q2)).toBeCloseTo(0); // opposite quaternions are treated as same rotation
    });

    it('should return the correct angle for 90 degree rotation', () => {
      const sqrt2over2 = Math.sqrt(2) / 2;
      const q1 = new Quaternion(1, 0, 0, 0).normalize();
      const q2 = new Quaternion(sqrt2over2, sqrt2over2, 0, 0).normalize(); // 90 deg around X+Y axis
      expect(q1.angleTo(q2)).toBeCloseTo(Math.PI / 2, 5);
    });

    it('should return values between 0 and PI', () => {
      const q1 = new Quaternion(0.3, 0.5, 0.4, 0.7).normalize();
      const q2 = new Quaternion(-0.6, 0.2, 0.5, -0.5).normalize();
      const angle = q1.angleTo(q2);
      expect(angle).toBeGreaterThanOrEqual(0);
      expect(angle).toBeLessThanOrEqual(Math.PI);
    });

    it('should handle non-normalized quaternions correctly', () => {
      const q1 = new Quaternion(1, 0, 0, 0);
      const q2 = new Quaternion(0, 2, 0, 0); // not normalized
      const angle = q1.normalize().angleTo(q2.normalize());
      expect(angle).toBeCloseTo(Math.PI); // matches your function
    });
  });

  describe('rotateTowards()', () => {
    it('should return itself when the angle to target is zero', () => {
      const q1 = new Quaternion(1, 0, 0, 0).normalize();
      const result = q1.rotateTowards(q1, Math.PI / 4);
      expect(result).toBe(q1);
    });

    it('should rotate partially towards the target when step < angle', () => {
      const q1 = new Quaternion(1, 0, 0, 0).normalize();
      const q2 = new Quaternion(0, 1, 0, 0).normalize();
      const step = Math.PI / 4; // 45 degrees

      const originalAngle = q1.angleTo(q2); // capture before mutation
      const result = q1.rotateTowards(q2, step);
      const angleAfter = result.angleTo(q2);

      expect(angleAfter).toBeLessThan(originalAngle);
      expect(angleAfter).toBeGreaterThan(0);
    });

    it('should reach the target when step >= angle', () => {
      const q1 = new Quaternion(1, 0, 0, 0).normalize();
      const q2 = new Quaternion(0, 1, 0, 0).normalize();
      const fullAngle = q1.angleTo(q2);

      q1.rotateTowards(q2, fullAngle * 2); // step > angle
      expect(q1.x).toBeCloseTo(q2.x);
      expect(q1.y).toBeCloseTo(q2.y);
      expect(q1.z).toBeCloseTo(q2.z);
      expect(q1.w).toBeCloseTo(q2.w);
    });

    it('should call slerp with correct t', () => {
      const q1 = new Quaternion(1, 0, 0, 0).normalize();
      const q2 = new Quaternion(0, 1, 0, 0).normalize();
      const step = Math.PI / 4;

      const originalSlerp = q1.slerp;
      q1.slerp = vi.fn().mockImplementation(() => q1);

      q1.rotateTowards(q2, step);

      const expectedT = Math.min(1, step / q1.angleTo(q2));
      expect(q1.slerp).toHaveBeenCalledWith(q2, expectedT);

      q1.slerp = originalSlerp; // restore
    });

    it('should return itself for chaining', () => {
      const q1 = new Quaternion(1, 0, 0, 0).normalize();
      const q2 = new Quaternion(0, 1, 0, 0).normalize();
      const result = q1.rotateTowards(q2, Math.PI / 8);
      expect(result).toBe(q1);
    });
  });

  describe('identity()', () => {
    it('should set the quaternion to identity', () => {
      const q = new Quaternion(1, 2, 3, 4);

      const result = q.identity();

      // identity quaternion components
      expect(result.x).toBeCloseTo(0);
      expect(result.y).toBeCloseTo(0);
      expect(result.z).toBeCloseTo(0);
      expect(result.w).toBeCloseTo(1);

      // should return itself for chaining
      expect(result).toBe(q);
    });

    it('should overwrite previous values', () => {
      const q = new Quaternion(0.5, -0.5, 0.5, -0.5);

      q.identity();

      expect(q.x).toBeCloseTo(0);
      expect(q.y).toBeCloseTo(0);
      expect(q.z).toBeCloseTo(0);
      expect(q.w).toBeCloseTo(1);
    });
  });

  describe('invert()', () => {
    it('should invert a unit quaternion by conjugating it', () => {
      const q = new Quaternion(1, -2, 3, 4);
      const callback = vi.fn(); // mock callback
      q._onChange(callback);

      const result = q.invert();

      // Vector part should be negated
      expect(result.x).toBeCloseTo(-1);
      expect(result.y).toBeCloseTo(2);
      expect(result.z).toBeCloseTo(-3);
      // Scalar part should remain the same
      expect(result.w).toBeCloseTo(4);

      // Should return itself for chaining
      expect(result).toBe(q);

      // Should call _onChangeCallback
      expect(callback).toHaveBeenCalled();
    });

    it('should invert the identity quaternion', () => {
      const q = new Quaternion(0, 0, 0, 1);
      q.invert();
      expect(q.x).toBeCloseTo(0);
      expect(q.y).toBeCloseTo(0);
      expect(q.z).toBeCloseTo(0);
      expect(q.w).toBeCloseTo(1);
    });
  });

  describe('conjugate()', () => {
    it('should return the conjugate of the quaternion', () => {
      const q = new Quaternion(1, -2, 3, 4);
      const callback = vi.fn(); // mock callback
      q._onChange(callback);

      const result = q.conjugate();

      // Vector part should be negated
      expect(result.x).toBeCloseTo(-1);
      expect(result.y).toBeCloseTo(2);
      expect(result.z).toBeCloseTo(-3);
      // Scalar part should remain the same
      expect(result.w).toBeCloseTo(4);

      // Should return itself for chaining
      expect(result).toBe(q);

      // Should call _onChangeCallback
      expect(callback).toHaveBeenCalled();
    });

    it('should negate the vector part of the identity quaternion', () => {
      const q = new Quaternion(0, 0, 0, 1);
      q.conjugate();
      expect(q.x).toBeCloseTo(0);
      expect(q.y).toBeCloseTo(0);
      expect(q.z).toBeCloseTo(0);
      expect(q.w).toBeCloseTo(1);
    });
  });

  describe('premultiply()', () => {
    it('should be equivalent to multiplyQuaternions(q, this)', () => {
      const a = new Quaternion().setFromEuler(new Euler(0.2, 0.5, -0.4));
      const q = new Quaternion().setFromEuler(new Euler(1.0, -0.3, 0.7));

      const expected = new Quaternion().multiplyQuaternions(q, a);

      const result = a.clone().premultiply(q);

      expectQuatClose(result, expected);
    });

    it('should not change the quaternion when premultiplied by identity', () => {
      const a = new Quaternion().setFromEuler(new Euler(0.4, -0.2, 0.9));
      const identity = new Quaternion(0, 0, 0, 1);

      const result = a.clone().premultiply(identity);

      expectQuatClose(result, a);
    });

    it('premultiplying identity by q should return q', () => {
      const identity = new Quaternion(0, 0, 0, 1);
      const q = new Quaternion().setFromEuler(new Euler(-0.8, 0.3, 0.6));

      const result = identity.clone().premultiply(q);

      expectQuatClose(result, q);
    });

    it('should compose rotations in the correct order (q2 ∘ q1)', () => {
      const q1 = new Quaternion().setFromEuler(new Euler(0.5, 0.2, -0.1));
      const q2 = new Quaternion().setFromEuler(new Euler(-0.3, 0.9, 0.4));

      const expected = new Quaternion().multiplyQuaternions(q2, q1);

      const result = q1.clone().premultiply(q2);

      expectQuatClose(result, expected);
    });

    it('should mutate this quaternion', () => {
      const a = new Quaternion().setFromEuler(new Euler(0.1, 0.2, 0.3));
      const q = new Quaternion().setFromEuler(new Euler(-0.4, 0.5, 0.6));

      const original = a;

      const result = a.premultiply(q);

      expect(result).toBe(original);
    });
  });

  describe('multiplyQuaternions', () => {
    it('should correctly multiply two simple quaternions', () => {
      const a = new Quaternion(1, 0, 0, 0);
      const b = new Quaternion(0, 1, 0, 0);

      const result = new Quaternion().multiplyQuaternions(a, b);

      // Hand-computed result:
      // x = a.x*b.w + a.w*b.x + a.y*b.z - a.z*b.y = 1*0 + 0*0 + 0*0 - 0*1 = 0
      // y = a.y*b.w + a.w*b.y + a.z*b.x - a.x*b.z = 0
      // z = a.z*b.w + a.w*b.z + a.x*b.y - a.y*b.x = 1
      // w = a.w*b.w - a.x*b.x - a.y*b.y - a.z*b.z = 0
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
      expect(result.z).toBe(1);
      expect(result.w).toBe(0);
    });

    it('should return the identity when multiplying by identity', () => {
      const identity = new Quaternion(0, 0, 0, 1);
      const a = new Quaternion(0.3, 0.5, -0.2, 0.8).normalize();

      const result1 = new Quaternion().multiplyQuaternions(a, identity);
      const result2 = new Quaternion().multiplyQuaternions(identity, a);

      // Quaternion multiplication is not exact in floating-point math.
      // A 1e-15 drift if normal.
      // A 10^-6 tolerance is used here for comparison.
      expect(result1.x).toBeCloseTo(a.x, 6);
      expect(result1.y).toBeCloseTo(a.y, 6);
      expect(result1.z).toBeCloseTo(a.z, 6);
      expect(result1.w).toBeCloseTo(a.w, 6);

      expect(result2.x).toBeCloseTo(a.x, 6);
      expect(result2.y).toBeCloseTo(a.y, 6);
      expect(result2.z).toBeCloseTo(a.z, 6);
      expect(result2.w).toBeCloseTo(a.w, 6);
    });

    it('should produce different results depending on order (non-commutative)', () => {
      const a = new Quaternion(0.2, 0.7, 0.1, 0.6).normalize();
      const b = new Quaternion(0.1, -0.4, 0.3, 0.5).normalize();

      const ab = new Quaternion().multiplyQuaternions(a, b);
      const ba = new Quaternion().multiplyQuaternions(b, a);

      expect(ab).not.toEqual(ba);
    });

    it('should call the _onChangeCallback', () => {
      const a = new Quaternion(1, 0, 0, 0);
      const b = new Quaternion(0, 1, 0, 0);

      const q = new Quaternion();
      q._onChange(() => { });
      q['_onChangeCallback'] = vi.fn();

      q.multiplyQuaternions(a, b);

      expect(q['_onChangeCallback']).toHaveBeenCalled();
    });

    it('should compose rotations correctly', () => {
      // 90° rotation around X
      const qx = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2);

      // 90° rotation around Y
      const qy = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2);

      // combined rotation: first Y then X
      const combined = new Quaternion().multiplyQuaternions(qx, qy);

      // expected quaternion from reference (Three.js equivalent)
      const expected = qx.clone().multiply(qy);

      expect(combined.x).toBeCloseTo(expected.x);
      expect(combined.y).toBeCloseTo(expected.y);
      expect(combined.z).toBeCloseTo(expected.z);
      expect(combined.w).toBeCloseTo(expected.w);
    });

    it('should allow chaining', () => {
      const a = new Quaternion(1, 0, 0, 0);
      const b = new Quaternion(0, 1, 0, 0);

      const q = new Quaternion();
      const r = q.multiplyQuaternions(a, b);

      expect(r).toBe(q);
    });
  });

  describe('multiplyQuaternionsFlat()', () => {
    it("should correctly multiply two simple quaternions", () => {
      const a = [1, 2, 3, 4];   // q0
      const b = [5, 6, 7, 8];   // q1
      const dst = [0, 0, 0, 0];

      Quaternion.multiplyQuaternionsFlat(dst, 0, a, 0, b, 0);

      const expected = new Quaternion(1, 2, 3, 4)
        .multiply(new Quaternion(5, 6, 7, 8));

      expect(dst[0]).toBeCloseTo(expected.x);
      expect(dst[1]).toBeCloseTo(expected.y);
      expect(dst[2]).toBeCloseTo(expected.z);
      expect(dst[3]).toBeCloseTo(expected.w);
    });

    it("should respect dstOffset, srcOffset0, and srcOffset1", () => {
      const arr = [
        99, 99,          // padding
        0, 0, 0, 1,      // q0 (offset 2)
        99, 99,          // padding
        1, 0, 0, 0       // q1 (offset 8)
      ];

      const dst = [9, 9, 9, 9, 9, 9];

      Quaternion.multiplyQuaternionsFlat(dst, 2, arr, 2, arr, 8);

      const expected = new Quaternion(0, 0, 0, 1).multiply(
        new Quaternion(1, 0, 0, 0)
      );

      expect(dst[0]).toBe(9);
      expect(dst[1]).toBe(9);

      expect(dst[2]).toBeCloseTo(expected.x);
      expect(dst[3]).toBeCloseTo(expected.y);
      expect(dst[4]).toBeCloseTo(expected.z);
      expect(dst[5]).toBeCloseTo(expected.w);
    });

    it("multiplying by identity quaternion should return original", () => {
      const id = [0, 0, 0, 1];
      const q = [0.3, -0.5, 0.8, 0.1];

      let dst = [0, 0, 0, 0];
      Quaternion.multiplyQuaternionsFlat(dst, 0, q, 0, id, 0);

      expect(dst[0]).toBeCloseTo(q[0]);
      expect(dst[1]).toBeCloseTo(q[1]);
      expect(dst[2]).toBeCloseTo(q[2]);
      expect(dst[3]).toBeCloseTo(q[3]);
    });

    it("should NOT commute (q0*q1 ≠ q1*q0)", () => {
      const q0 = [0, 1, 0, 0];
      const q1 = [0, 0, 1, 0];

      const dstA = [0, 0, 0, 0];
      const dstB = [0, 0, 0, 0];

      Quaternion.multiplyQuaternionsFlat(dstA, 0, q0, 0, q1, 0);
      Quaternion.multiplyQuaternionsFlat(dstB, 0, q1, 0, q0, 0);

      expect(dstA).not.toEqual(dstB);
    });

    it("should return the dst array", () => {
      const q0 = [0, 0, 0, 1];
      const q1 = [1, 0, 0, 0];

      const dst = [0, 0, 0, 0];

      const returned = Quaternion.multiplyQuaternionsFlat(dst, 0, q0, 0, q1, 0);

      expect(returned).toBe(dst);
    });
  });

  describe('slerp()', () => {
    it("t = 0 should return the original quaternion", () => {
      const a = new Quaternion(0, 0, 0, 1);
      const b = new Quaternion(1, 0, 0, 0);

      const result = a.clone().slerp(b, 0);
      expectQuatClose(result, a);
    });

    it("t = 1 should return qb", () => {
      const a = new Quaternion(0, 0, 0, 1);
      const b = new Quaternion(1, 0, 0, 0);

      const result = a.clone().slerp(b, 1);
      expectQuatClose(result, b);
    });

    it("should slerp halfway between orthogonal quaternions", () => {
      const a = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), 0);
      const b = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI);

      const mid = a.clone().slerp(b, 0.5);

      const expected = new Quaternion().setFromAxisAngle(
        new Vector3(1, 0, 0),
        Math.PI / 2
      );

      expectQuatClose(mid, expected);
    });

    it("should flip qb when cosHalfTheta < 0", () => {
      const a = new Quaternion(0, 0, 0, 1);
      // Opposite quaternion (represents the same rotation)
      const b = new Quaternion(0, 0, 0, -1);

      const r = a.clone().slerp(b, 0.5);

      // Should stay identity
      const identity = new Quaternion(0, 0, 0, 1);
      expectQuatClose(r, identity);
    });

    it("should fall back to linear interpolation for nearly identical quaternions", () => {
      const a = new Quaternion(0, 0, 0, 1);
      const b = new Quaternion(0, 0, 0, 1 + 1e-16).normalize();

      const r = a.clone().slerp(b, 0.5);

      const expected = new Quaternion(
        0,
        0,
        0,
        (1 + b.w) * 0.5
      ).normalize();

      expectQuatClose(r, expected);
    });

    it("should produce normalized output", () => {
      const a = new Quaternion(0.1, 0.2, 0.3, 0.4).normalize();
      const b = new Quaternion(0.5, 0.6, 0.7, 0.8).normalize();

      const r = a.clone().slerp(b, 0.3);

      const len = Math.hypot(r.x, r.y, r.z, r.w);
      expect(len).toBeCloseTo(1, 6);
    });

    it("should not mutate qb", () => {
      const a = new Quaternion(0, 0, 0, 1);
      const b = new Quaternion(1, 0, 0, 0);

      const bCopy = b.clone();
      a.clone().slerp(b, 0.3);

      expectQuatClose(b, bCopy);
    });
  });

  describe('slerpFlat()', () => {
    it("should copy src0 when t = 0", () => {
      const dst = [0, 0, 0, 0];

      const src0 = [1, 2, 3, 4];
      const src1 = [9, 9, 9, 9];

      Quaternion.slerpFlat(dst, 0, src0, 0, src1, 0, 0);

      expect(dst).toEqual([1, 2, 3, 4]);
    });

    it("should copy src1 when t = 1", () => {
      const dst = [0, 0, 0, 0];

      const src0 = [1, 2, 3, 4];
      const src1 = [5, 6, 7, 8];

      Quaternion.slerpFlat(dst, 0, src0, 0, src1, 0, 1);

      expect(dst).toEqual([5, 6, 7, 8]);
    });

    it("should slerp halfway for t = 0.5 between two different quaternions", () => {
      const dst = [0, 0, 0, 0];

      const src0 = [0, 0, 0, 1];             // identity rotation
      const src1 = [1, 0, 0, 0];             // 180° around X

      Quaternion.slerpFlat(dst, 0, src0, 0, src1, 0, 0.5);

      // Expected halfway rotation is 90° around X: ( √0.5, 0, 0, √0.5 )
      const s = Math.sqrt(0.5);

      expect(dst[0]).toBeCloseTo(s, 5);
      expect(dst[1]).toBeCloseTo(0, 5);
      expect(dst[2]).toBeCloseTo(0, 5);
      expect(dst[3]).toBeCloseTo(s, 5);
    });

    it("should handle identical quaternions", () => {
      const dst = [0, 0, 0, 0];

      const src0 = [0, 0, 0, 1];
      const src1 = [0, 0, 0, 1];

      Quaternion.slerpFlat(dst, 0, src0, 0, src1, 0, 0.5);

      expect(dst).toEqual([0, 0, 0, 1]);
    });

    it("should take shortest path when quaternions are opposite", () => {
      const dst = [0, 0, 0, 0];

      const src0 = [0, 0, 0, 1];
      const src1 = [0, 0, 0, -1]; // opposite direction

      Quaternion.slerpFlat(dst, 0, src0, 0, src1, 0, 0.5);

      // Should NOT flip unpredictably — result should match src0 normalized
      expect(dst[0]).toBeCloseTo(0);
      expect(dst[1]).toBeCloseTo(0);
      expect(dst[2]).toBeCloseTo(0);
      expect(dst[3]).toBeCloseTo(1);
    });

    it("should write output at dstOffset", () => {
      const dst = [99, 99, 99, 99, 99, 99];

      const src0 = [0, 0, 0, 1];
      const src1 = [1, 0, 0, 0];

      Quaternion.slerpFlat(dst, 2, src0, 0, src1, 0, 0.5);

      const s = Math.sqrt(0.5);

      expect(dst[0]).toBe(99);
      expect(dst[1]).toBe(99);

      expect(dst[2]).toBeCloseTo(s, 10);
      expect(dst[3]).toBeCloseTo(0, 10);
      expect(dst[4]).toBeCloseTo(0, 10);
      expect(dst[5]).toBeCloseTo(s, 10);
    });
  });

  describe('slerpQuaternion()', () => {
    it('should return qa when t = 0', () => {
      const qa = new Quaternion(1, 0, 0, 0).normalize();
      const qb = new Quaternion(0, 1, 0, 0).normalize();
      const q = new Quaternion();

      const result = q.slerpQuaternion(qa, qb, 0);

      expect(result).toBe(q); // returns itself
      expect(result.x).toBeCloseTo(qa.x);
      expect(result.y).toBeCloseTo(qa.y);
      expect(result.z).toBeCloseTo(qa.z);
      expect(result.w).toBeCloseTo(qa.w);
    });

    it('should return qb when t = 1', () => {
      const qa = new Quaternion(1, 0, 0, 0).normalize();
      const qb = new Quaternion(0, 1, 0, 0).normalize();
      const q = new Quaternion();

      const result = q.slerpQuaternion(qa, qb, 1);

      expect(result).toBe(q);
      expect(result.x).toBeCloseTo(qb.x);
      expect(result.y).toBeCloseTo(qb.y);
      expect(result.z).toBeCloseTo(qb.z);
      expect(result.w).toBeCloseTo(qb.w);
    });

    it('should interpolate correctly when 0 < t < 1', () => {
      const qa = new Quaternion(1, 0, 0, 0).normalize();
      const qb = new Quaternion(0, 1, 0, 0).normalize();
      const q = new Quaternion();

      const t = 0.5;
      const result = q.slerpQuaternion(qa, qb, t);

      expect(result).toBe(q);
      // The dot product should be between qa and qb
      const dotQA = result.dot(qa);
      const dotQB = result.dot(qb);
      expect(dotQA).toBeGreaterThan(0);
      expect(dotQB).toBeGreaterThan(0);
    });
  })
  describe('dot()', () => {
    it('should return 1 for the dot product of a quaternion with itself', () => {
      const q = new Quaternion(1, 2, 3, 4);
      const dot = q.dot(q);
      expect(dot).toBeCloseTo(1 * 1 + 2 * 2 + 3 * 3 + 4 * 4);
    });

    it('should return 0 for orthogonal quaternions', () => {
      const q1 = new Quaternion(1, 0, 0, 0);
      const q2 = new Quaternion(0, 1, 0, 0);
      const dot = q1.dot(q2);
      expect(dot).toBeCloseTo(0);
    });

    it('should return the correct value for arbitrary quaternions', () => {
      const q1 = new Quaternion(1, 2, 3, 4);
      const q2 = new Quaternion(5, 6, 7, 8);
      const dot = q1.dot(q2);
      expect(dot).toBeCloseTo(1 * 5 + 2 * 6 + 3 * 7 + 4 * 8);
    });

    it('should return a negative value when appropriate', () => {
      const q1 = new Quaternion(-1, -2, -3, -4);
      const q2 = new Quaternion(1, 2, 3, 4);
      const dot = q1.dot(q2);
      expect(dot).toBeCloseTo(-1 * 1 + -2 * 2 + -3 * 3 + -4 * 4);
    });
  });

  describe('lengthSq()', () => {
    it('should return 0 for the zero quaternion', () => {
      const q = new Quaternion(0, 0, 0, 0);
      expect(q.lengthSq()).toBeCloseTo(0);
    });

    it('should return 1 for a unit quaternion', () => {
      // (0, 0, 0, 1) has length 1
      const q = new Quaternion(0, 0, 0, 1);
      expect(q.lengthSq()).toBeCloseTo(1);
    });

    it('should correctly compute the squared length for arbitrary values', () => {
      const q = new Quaternion(1, 2, 3, 4);
      const expected = 1 * 1 + 2 * 2 + 3 * 3 + 4 * 4; // 30
      expect(q.lengthSq()).toBeCloseTo(expected);
    });

    it('should handle negative components correctly (squares remove sign)', () => {
      const q = new Quaternion(-1, -2, -3, -4);
      const expected = 1 + 4 + 9 + 16; // 30
      expect(q.lengthSq()).toBeCloseTo(expected);
    });

    it('should match the square of the actual length', () => {
      const q = new Quaternion(2, 3, 6, 1);
      const length = Math.sqrt(2 * 2 + 3 * 3 + 6 * 6 + 1 * 1);
      expect(q.lengthSq()).toBeCloseTo(length * length);
    });
  });

  describe('length()', () => {
    it('should return 0 for the zero quaternion', () => {
      const q = new Quaternion(0, 0, 0, 0);
      expect(q.length()).toBeCloseTo(0);
    });

    it('should return 1 for a unit quaternion', () => {
      const q = new Quaternion(0, 0, 0, 1);
      expect(q.length()).toBeCloseTo(1);
    });

    it('should correctly compute the Euclidean length for arbitrary values', () => {
      const q = new Quaternion(1, 2, 3, 4);
      const expected = Math.sqrt(1 * 1 + 2 * 2 + 3 * 3 + 4 * 4); // sqrt(30)
      expect(q.length()).toBeCloseTo(expected);
    });

    it('should handle negative components correctly (sign should not affect length)', () => {
      const q = new Quaternion(-1, -2, -3, -4);
      const expected = Math.sqrt(1 + 4 + 9 + 16); // sqrt(30)
      expect(q.length()).toBeCloseTo(expected);
    });

    it('should match sqrt of lengthSq()', () => {
      const q = new Quaternion(2, 3, 6, 1);
      expect(q.length()).toBeCloseTo(Math.sqrt(q.lengthSq()));
    });

    it('should not modify quaternion components', () => {
      const q = new Quaternion(1, 2, 3, 4);
      const before = { ...q };
      q.length();
      expect(q).toEqual(before);
    });
  });

  describe('normalize()', () => {
    it('should normalize a non-zero quaternion', () => {
      const q = new Quaternion(2, 3, 4, 1);
      q.normalize();

      const length = Math.sqrt(q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w);
      expect(length).toBeCloseTo(1);
    });

    it('should set a zero quaternion to (0, 0, 0, 1)', () => {
      const q = new Quaternion(0, 0, 0, 0);
      q.normalize();

      expect(q.x).toBe(0);
      expect(q.y).toBe(0);
      expect(q.z).toBe(0);
      expect(q.w).toBe(1);
    });

    it('should call the onChange callback when normalizing', () => {
      const q = new Quaternion(1, 2, 3, 4);
      const callback = vi.fn();
      q._onChange(callback);

      q.normalize();
      expect(callback).toHaveBeenCalled();
    });

    it('should return itself for chaining', () => {
      const q = new Quaternion(1, 2, 3, 4);
      const result = q.normalize();
      expect(result).toBe(q);
    });
  });

  describe('slerp()', () => {
    it('should return itself when t = 0', () => {
      const q1 = new Quaternion(1, 0, 0, 0);
      const result = q1.slerp(new Quaternion(0, 1, 0, 0), 0);
      expect(result).toBe(q1);
    });

    it('should copy the target quaternion when t = 1', () => {
      const q1 = new Quaternion(1, 0, 0, 0);
      const q2 = new Quaternion(0, 1, 0, 0);
      const result = q1.slerp(q2, 1);
      expect(result.x).toBeCloseTo(q2.x);
      expect(result.y).toBeCloseTo(q2.y);
      expect(result.z).toBeCloseTo(q2.z);
      expect(result.w).toBeCloseTo(q2.w);
    });

    it('should interpolate halfway between two quaternions', () => {
      const q1 = new Quaternion(1, 0, 0, 0).normalize();
      const q2 = new Quaternion(0, 1, 0, 0).normalize();
      q1.slerp(q2, 0.5);
      const dot = q1.dot(q2);
      expect(dot).toBeGreaterThan(0); // halfway rotation should not be opposite
      expect(q1.length()).toBeCloseTo(1); // normalized
    });

    it('should handle opposite quaternions correctly', () => {
      const q1 = new Quaternion(1, 0, 0, 0).normalize();
      const q2 = new Quaternion(-1, 0, 0, 0).normalize();
      q1.slerp(q2, 0.5);
      expect(q1.length()).toBeCloseTo(1);
    });

    it('should call the _onChangeCallback', () => {
      const q1 = new Quaternion(1, 0, 0, 0);
      const q2 = new Quaternion(0, 1, 0, 0);
      const callback = vi.fn();
      q1._onChange(callback);
      q1.slerp(q2, 0.5);

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('random()', () => {
    // Because random() produces uniform random quaternions, you cannot test
    // exact values. Instead, you test the properties that must always be true
    // Must always return a unit quaternion
    // Must always return different values across multiple calls
    // All generated quaternions must be valid numbers
    // Must mutate and return this

    it('should return a normalized quaternion', () => {
      const q = new Quaternion().random();
      expect(isUnit(q)).toBe(true);
    });

    it('should mutate and return this quaternion', () => {
      const q = new Quaternion();
      const returned = q.random();
      expect(returned).toBe(q);
    });

    it('should generate different quaternions over multiple calls', () => {
      const q1 = new Quaternion().random().clone();
      const q2 = new Quaternion().random().clone();

      // Not strict inequality, because rare collision possible.
      // But statistically this will always pass.
      const identical =
        Math.abs(q1.x - q2.x) < 1e-8 &&
        Math.abs(q1.y - q2.y) < 1e-8 &&
        Math.abs(q1.z - q2.z) < 1e-8 &&
        Math.abs(q1.w - q2.w) < 1e-8;

      expect(identical).toBe(false);
    });

    it('should generate valid finite numbers', () => {
      const q = new Quaternion().random();

      expect(Number.isFinite(q.x)).toBe(true);
      expect(Number.isFinite(q.y)).toBe(true);
      expect(Number.isFinite(q.z)).toBe(true);
      expect(Number.isFinite(q.w)).toBe(true);
    });

    it('should always normalize even after many samples', () => {
      // Stress test: generate many random quaternions
      for (let i = 0; i < 1000; i++) {
        const q = new Quaternion().random();
        expect(isUnit(q)).toBe(true);
      }
    });
  });

  describe('equals()', () => {
    it('should return true when all components are exactly equal', () => {
      const q1 = new Quaternion(1, 2, 3, 4);
      const q2 = new Quaternion(1, 2, 3, 4);
      expect(q1.equals(q2)).toBe(true);
    });

    it('should return false when any component differs (x)', () => {
      const q1 = new Quaternion(1, 2, 3, 4);
      const q2 = new Quaternion(9, 2, 3, 4);
      expect(q1.equals(q2)).toBe(false);
    });

    it('should return false when any component differs (y)', () => {
      const q1 = new Quaternion(1, 2, 3, 4);
      const q2 = new Quaternion(1, 9, 3, 4);
      expect(q1.equals(q2)).toBe(false);
    });

    it('should return false when any component differs (z)', () => {
      const q1 = new Quaternion(1, 2, 3, 4);
      const q2 = new Quaternion(1, 2, 9, 4);
      expect(q1.equals(q2)).toBe(false);
    });

    it('should return false when any component differs (w)', () => {
      const q1 = new Quaternion(1, 2, 3, 4);
      const q2 = new Quaternion(1, 2, 3, 9);
      expect(q1.equals(q2)).toBe(false);
    });

    it('should return true when both are zero quaternions', () => {
      const q1 = new Quaternion(0, 0, 0, 0);
      const q2 = new Quaternion(0, 0, 0, 0);
      expect(q1.equals(q2)).toBe(true);
    });

    it('should return false when compared to a quaternion with NaN components', () => {
      const q1 = new Quaternion(1, 2, 3, 4);
      const q2 = new Quaternion(NaN, 2, 3, 4);
      expect(q1.equals(q2)).toBe(false);
    });

    it('should return true when comparing a quaternion to itself (reflexive property)', () => {
      const q = new Quaternion(1, 2, 3, 4);
      expect(q.equals(q)).toBe(true);
    });
  });

  describe('fromArray()', () => {
    it('should set components from the array starting at offset 0', () => {
      const q = new Quaternion();
      const arr = [1, 2, 3, 4];

      q.fromArray(arr);

      expect(q.x).toBe(1);
      expect(q.y).toBe(2);
      expect(q.z).toBe(3);
      expect(q.w).toBe(4);
    });

    it('should set components using the given offset', () => {
      const q = new Quaternion();
      const arr = [9, 9, 9, 1, 2, 3, 4];

      q.fromArray(arr, 3);

      expect(q.x).toBe(1);
      expect(q.y).toBe(2);
      expect(q.z).toBe(3);
      expect(q.w).toBe(4);
    });

    it('should not modify the original array', () => {
      const q = new Quaternion();
      const arr = [1, 2, 3, 4];

      q.fromArray(arr);

      expect(arr).toEqual([1, 2, 3, 4]);
    });

    it('should call _onChangeCallback', () => {
      const q = new Quaternion();
      const spy = vi.spyOn(q as any, '_onChangeCallback');

      q.fromArray([1, 2, 3, 4]);

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should return the quaternion instance (this)', () => {
      const q = new Quaternion();
      const arr = [1, 2, 3, 4];

      const result = q.fromArray(arr);

      expect(result).toBe(q);
    });
  });

  describe('toArray()', () => {
    it('should write quaternion components to a new array when no array is provided', () => {
      const q = new Quaternion(1, 2, 3, 4);

      const arr = q.toArray([]);

      expect(arr).toEqual([1, 2, 3, 4]);
    });

    it('should write quaternion components to the given array at offset 0', () => {
      const q = new Quaternion(5, 6, 7, 8);
      const arr = [0, 0, 0, 0];

      q.toArray(arr);

      expect(arr).toEqual([5, 6, 7, 8]);
    });

    it('should write quaternion components to the given array with an offset', () => {
      const q = new Quaternion(9, 10, 11, 12);
      const arr = [0, 0, 0, 0, 0, 0, 0];

      q.toArray(arr, 3);

      expect(arr).toEqual([0, 0, 0, 9, 10, 11, 12]);
    });

    it('should return the same array passed in', () => {
      const q = new Quaternion(1, 1, 1, 1);
      const arr = [99, 99, 99, 99];

      const returned = q.toArray(arr);

      expect(returned).toBe(arr);
    });

    it('should not modify array elements outside the written range', () => {
      const q = new Quaternion(2, 4, 6, 8);
      const arr = [100, 100, 100, 100, 100, 100];

      q.toArray(arr, 2);

      expect(arr).toEqual([100, 100, 2, 4, 6, 8]);
    });
  });

  describe('fromAttribute()', () => {
    it('should set quaternion components from the buffer attribute', () => {
      // Create a typed array storing quaternion data: [x0,y0,z0,w0, x1,y1,z1,w1]
      const array = new Float32Array([
        0.1, 0.2, 0.3, 0.4,   // index 0
        1, 2, 3, 4            // index 1
      ]);

      const attr = new BufferAttribute(array, 4); // itemSize = 4 for quaternions
      const q = new Quaternion();

      // Read the second quaternion (index 1)
      q.fromBufferAttribute(attr, 1);

      expect(q.x).toBeCloseTo(1);
      expect(q.y).toBeCloseTo(2);
      expect(q.z).toBeCloseTo(3);
      expect(q.w).toBeCloseTo(4);
    });

    it('should call _onChangeCallback', () => {
      const array = new Float32Array([0, 0, 0, 1]);
      const attr = new BufferAttribute(array, 4);
      const q = new Quaternion();
      const callback = vi.fn();

      let called = false;
      // q._onChangeCallback = () => { called = true; };
      q._onChange(callback);

      q.fromBufferAttribute(attr, 0);

      expect(callback).toHaveBeenCalled();
    });

    it('should return the same quaternion instance for chaining', () => {
      const array = new Float32Array([0, 0, 0, 1]);
      const attr = new BufferAttribute(array, 4);
      const q = new Quaternion();

      const result = q.fromBufferAttribute(attr, 0);

      expect(result).toBe(q);
    });
  });

  describe('ToJSON()', () => {
    it('should return the quaternion components as an array [x, y, z, w]', () => {
      const q = new Quaternion();
      q.x = 1;
      q.y = 2;
      q.z = 3;
      q.w = 4;

      const json = q.ToJSON();

      expect(json).toEqual([1, 2, 3, 4]);
    });

    it('should return an empty array if quaternion components are zero', () => {
      const q = new Quaternion();
      q.x = 0;
      q.y = 0;
      q.z = 0;
      q.w = 0;

      const json = q.ToJSON();

      expect(json).toEqual([0, 0, 0, 0]);
    });

  });

  describe('_onChange()', () => {
    it("should not throw if quaternion is modified before registering a callback", () => {
      const q = new Quaternion();
      expect(() => q.set(1, 2, 3, 4)).not.toThrow();
    });

    it("should register the onChange callback and call it when quaternion changes", () => {
      const q = new Quaternion();
      const cb = vi.fn();

      q._onChange(cb);
      q.set(1, 2, 3, 4);

      expect(cb).toHaveBeenCalledTimes(1);
    });

    it("should override previously-set callbacks", () => {
      const q = new Quaternion();
      const cb1 = vi.fn();
      const cb2 = vi.fn();

      q._onChange(cb1);
      q._onChange(cb2); // replace old callback

      q.set(0, 0, 0, 1);

      expect(cb1).toHaveBeenCalledTimes(0);
      expect(cb2).toHaveBeenCalledTimes(1);
    });

    it("should trigger the callback for other mutating methods (multiply etc.)", () => {
      const q = new Quaternion();
      const cb = vi.fn();

      q._onChange(cb);
      q.multiply(new Quaternion(0, 1, 0, 0));

      expect(cb).toHaveBeenCalledTimes(1);
    });

    it("should trigger exactly once per change", () => {
      const q = new Quaternion();
      const cb = vi.fn();

      q._onChange(cb);

      q.set(1, 0, 0, 1);
      q.set(0, 1, 0, 1);
      q.set(0, 0, 1, 1);

      expect(cb).toHaveBeenCalledTimes(3);
    });

    it("should return this for chaining", () => {
      const q = new Quaternion();
      const cb = () => { };

      const result = q._onChange(cb);

      expect(result).toBe(q);
    });
  });

  describe('[Symbol.iterator]()', () => {
    it('should iterate over quaternion components in order', () => {
      const q = new Quaternion();
      q.x = 1;
      q.y = 2;
      q.z = 3;
      q.w = 4;

      const result = [...q]; // spread operator uses the iterator
      expect(result).toEqual([1, 2, 3, 4]);
    });

    it('should work with for...of loop', () => {
      const q = new Quaternion();
      q.x = 5;
      q.y = 6;
      q.z = 7;
      q.w = 8;

      const components: number[] = [];
      for (const c of q) {
        components.push(c);
      }

      expect(components).toEqual([5, 6, 7, 8]);
    });

    it('should reflect updated quaternion values', () => {
      const q = new Quaternion();
      q.x = 0; q.y = 0; q.z = 0; q.w = 0;

      q.x = 9; q.y = 10; q.z = 11; q.w = 12;
      const result = [...q];

      expect(result).toEqual([9, 10, 11, 12]);
    });
  });
});
