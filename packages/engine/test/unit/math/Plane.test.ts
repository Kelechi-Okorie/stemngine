import { describe, it, expect } from 'vitest';
import { Plane } from '../../../src/math/Plane';
import { Vector3 } from '../../../src/math/Vector3';
import { Sphere } from '../../../src/math/Sphere';

describe('Plane', () => {
  describe('constructor()', () => {
    it("should construct with default values", () => {
      const p = new Plane();

      expect(p.isPlane).toBe(true);
      expect(p.normal).toBeInstanceOf(Vector3);

      // default normal = (1, 0, 0)
      expect(p.normal.x).toBe(1);
      expect(p.normal.y).toBe(0);
      expect(p.normal.z).toBe(0);

      // default constant = 0
      expect(p.constant).toBe(0);
    });

    it("should use provided normal and constant", () => {
      const normal = new Vector3(0, 1, 0);
      const constant = 5;

      const p = new Plane(normal, constant);

      // reference equality: normal should not be copied
      expect(p.normal).toBe(normal);

      expect(p.normal.x).toBe(0);
      expect(p.normal.y).toBe(1);
      expect(p.normal.z).toBe(0);

      expect(p.constant).toBe(5);
    });

    it("should set isPlane flag to true", () => {
      const p = new Plane();
      expect(p.isPlane).toBe(true);
    });
  });

  describe('set()', () => {
    it("should set the plane's normal and constant", () => {
      const p = new Plane(); // defaults: normal=(1,0,0), constant=0

      const newNormal = new Vector3(0, 1, 0);
      const newConstant = 5;

      p.set(newNormal, newConstant);

      // values copied
      expect(p.normal.x).toBe(0);
      expect(p.normal.y).toBe(1);
      expect(p.normal.z).toBe(0);

      expect(p.constant).toBe(5);
    });

    it("should copy the normal vector instead of referencing it", () => {
      const p = new Plane();
      const n = new Vector3(0, 1, 0);

      p.set(n, 1);

      // mutate original source vector
      n.set(5, 5, 5);

      // plane.normal should remain unchanged
      expect(p.normal.x).toBe(0);
      expect(p.normal.y).toBe(1);
      expect(p.normal.z).toBe(0);
    });

    it("should return the plane instance (chainable)", () => {
      const p = new Plane();

      const result = p.set(new Vector3(0, 0, 1), 3);

      expect(result).toBe(p);
    });
  });

  describe('setComponents()', () => {
    it("should set the plane normal and constant from components", () => {
      const p = new Plane(); // default normal = (1,0,0), constant = 0

      p.setComponents(0, 1, 0, 5);

      expect(p.normal.x).toBe(0);
      expect(p.normal.y).toBe(1);
      expect(p.normal.z).toBe(0);
      expect(p.constant).toBe(5);
    });

    it("should overwrite previous values", () => {
      const p = new Plane(new Vector3(5, 5, 5), 10);

      p.setComponents(1, 2, 3, 4);

      expect(p.normal.x).toBe(1);
      expect(p.normal.y).toBe(2);
      expect(p.normal.z).toBe(3);
      expect(p.constant).toBe(4);
    });

    it("should return the plane instance (chainable)", () => {
      const p = new Plane();

      const result = p.setComponents(4, 5, 6, 7);

      expect(result).toBe(p);
    });
  });

  describe('setFromNormalAndCoplanarPoint()', () => {
    it("should set the normal by copying the provided vector", () => {
      const p = new Plane();
      const n = new Vector3(0, 1, 0);
      const point = new Vector3(0, 0, 5);

      p.setFromNormalAndCoplanarPoint(n, point);

      // normal is copied (not referenced)
      expect(p.normal.x).toBe(0);
      expect(p.normal.y).toBe(1);
      expect(p.normal.z).toBe(0);

      // modifying original should NOT change plane
      n.set(5, 5, 5);
      expect(p.normal.x).toBe(0);
    });

    it("should compute the constant as -point.dot(normal)", () => {
      const normal = new Vector3(0, 1, 0);     // Y-plane
      const point = new Vector3(0, 5, 0);      // point at y = 5

      const p = new Plane().setFromNormalAndCoplanarPoint(normal, point);

      // dot(point, normal) = 5 → constant = -5
      expect(p.constant).toBe(-5);
    });

    it("should overwrite existing values", () => {
      const p = new Plane(new Vector3(1, 0, 0), 10);

      p.setFromNormalAndCoplanarPoint(
        new Vector3(0, 0, 1),
        new Vector3(0, 0, 3)
      );

      expect(p.normal.x).toBe(0);
      expect(p.normal.y).toBe(0);
      expect(p.normal.z).toBe(1);
      expect(p.constant).toBe(-3);
    });

    it("should return the plane instance for chaining", () => {
      const p = new Plane();

      const result = p.setFromNormalAndCoplanarPoint(
        new Vector3(1, 0, 0),
        new Vector3(0, 2, 0)
      );

      expect(result).toBe(p);
    });

    it("should handle the case where the coplanar point is at the origin", () => {
      const normal = new Vector3(0, 1, 0);
      const point = new Vector3(0, 0, 0);

      const p = new Plane().setFromNormalAndCoplanarPoint(normal, point);

      expect(p.constant).toBeCloseTo(0); // dot = 0 → constant = 0
    });

    it("should work correctly even when normal is not normalized", () => {
      const n = new Vector3(0, 2, 0);   // not unit length
      const point = new Vector3(0, 3, 0);

      const p = new Plane().setFromNormalAndCoplanarPoint(n, point);

      // constant = -point.dot(normal) = -(3 * 2) = -6
      expect(p.constant).toBe(-6);

      // normal is copied directly (no normalization in your code)
      expect(p.normal.y).toBe(2);
    });
  });

  describe('setFromCoplanarPoints()', () => {
    it("should compute the correct normal for counter-clockwise points", () => {
      const a = new Vector3(0, 0, 0);
      const b = new Vector3(1, 0, 0);
      const c = new Vector3(0, 1, 0);

      const plane = new Plane();
      plane.setFromCoplanarPoints(a, b, c);

      // normal should point along +Z
      expect(plane.normal.x).toBeCloseTo(0);
      expect(plane.normal.y).toBeCloseTo(0);
      expect(plane.normal.z).toBeCloseTo(1);

      // constant = -normal.dot(a) = 0
      expect(plane.constant).toBeCloseTo(0);
    });

    it("should overwrite previous plane values", () => {
      const plane = new Plane(new Vector3(1, 0, 0), 5);

      const a = new Vector3(0, 0, 0);
      const b = new Vector3(1, 0, 0);
      const c = new Vector3(0, 1, 0);

      plane.setFromCoplanarPoints(a, b, c);

      expect(plane.normal.x).toBeCloseTo(0);
      expect(plane.normal.y).toBeCloseTo(0);
      expect(plane.normal.z).toBeCloseTo(1);
      expect(plane.constant).toBeCloseTo(0);
    });

    it("should return the plane instance for chaining", () => {
      const plane = new Plane();
      const result = plane.setFromCoplanarPoints(
        new Vector3(0, 0, 0),
        new Vector3(1, 0, 0),
        new Vector3(0, 1, 0)
      );

      expect(result).toBe(plane);
    });

    it("should handle non-axis-aligned planes correctly", () => {
      const a = new Vector3(0, 0, 1);
      const b = new Vector3(1, 0, 1);
      const c = new Vector3(0, 1, 2);

      const plane = new Plane();
      plane.setFromCoplanarPoints(a, b, c);

      // compute expected normal manually
      const ab = b.clone().sub(a);
      const ac = c.clone().sub(a);
      const expectedNormal = ab.cross(ac).normalize();

      expect(plane.normal.x).toBeCloseTo(expectedNormal.x);
      expect(plane.normal.y).toBeCloseTo(expectedNormal.y);
      expect(plane.normal.z).toBeCloseTo(expectedNormal.z);

      expect(plane.constant).toBeCloseTo(-expectedNormal.dot(a));
    });

    it("should handle degenerate (collinear) points by producing zero normal", () => {
      const a = new Vector3(0, 0, 0);
      const b = new Vector3(1, 1, 1);
      const c = new Vector3(2, 2, 2); // collinear with a-b

      const plane = new Plane();
      plane.setFromCoplanarPoints(a, b, c);

      // the normal vector length will be zero
      expect(plane.normal.length()).toBeCloseTo(0);

      // constant is still computed as -dot(a, normal) = 0
      expect(plane.constant).toBeCloseTo(0);
    });
  });

  describe('normalize()', () => {
    it("should normalize the plane normal to unit length", () => {
      const normal = new Vector3(3, 0, 4); // length = 5
      const constant = 10;
      const plane = new Plane(normal, constant);

      plane.normalize();

      expect(plane.normal.length()).toBeCloseTo(1);
    });

    it("should scale the constant according to the normal length", () => {
      const normal = new Vector3(0, 3, 4); // length = 5
      const constant = 10;
      const plane = new Plane(normal, constant);

      plane.normalize();

      // constant should be divided by original normal length (5)
      expect(plane.constant).toBeCloseTo(10 / 5);
    });

    it("should overwrite previous normal and constant values", () => {
      const plane = new Plane(new Vector3(2, 0, 0), 4);

      plane.normalize();

      expect(plane.normal.x).toBeCloseTo(1);
      expect(plane.normal.y).toBeCloseTo(0);
      expect(plane.normal.z).toBeCloseTo(0);
      expect(plane.constant).toBeCloseTo(4 / 2);
    });

    it("should return the plane instance for chaining", () => {
      const plane = new Plane(new Vector3(1, 2, 2), 5);

      const result = plane.normalize();

      expect(result).toBe(plane);
    });

    it("should handle a zero-length normal (optional: may throw)", () => {
      const plane = new Plane(new Vector3(0, 0, 0), 5);

      // dividing by zero will produce Infinity in JS
      plane.normalize();

      // expect(plane.normal.x).toBe(Infinity);
      // expect(plane.normal.y).toBe(Infinity);
      // expect(plane.normal.z).toBe(Infinity);
      // expect(plane.constant).toBe(Infinity);

      expect(Number.isNaN(plane.normal.x)).toBe(true);
      expect(Number.isNaN(plane.normal.y)).toBe(true);
      expect(Number.isNaN(plane.normal.z)).toBe(true);
      // expect(Number.isNaN(plane.constant)).toBe(true);
    });
  });

  describe('negate()', () => {
    it("should negate the normal vector", () => {
      const plane = new Plane(new Vector3(1, -2, 3), 5);

      plane.negate();

      expect(plane.normal.x).toBe(-1);
      expect(plane.normal.y).toBe(2);
      expect(plane.normal.z).toBe(-3);
    });

    it("should negate the constant", () => {
      const plane = new Plane(new Vector3(0, 1, 0), 7);

      plane.negate();

      expect(plane.constant).toBe(-7);
    });

    it("should overwrite previous values correctly", () => {
      const plane = new Plane(new Vector3(-2, 0, 4), -3);

      plane.negate();

      expect(plane.normal.x).toBe(2);
      expect(plane.normal.y).toBeCloseTo(0);
      expect(plane.normal.z).toBe(-4);
      expect(plane.constant).toBe(3);
    });

    it("should return the plane instance for chaining", () => {
      const plane = new Plane(new Vector3(1, 2, 3), 5);

      const result = plane.negate();

      expect(result).toBe(plane);
    });
  });

  describe('distanceTo()', () => {
    it("should return 0 for a point on the plane", () => {
      const plane = new Plane(new Vector3(0, 1, 0), -5); // y - 5 = 0
      const point = new Vector3(1, 5, 3); // y = 5 → on plane

      const distance = plane.distanceToPoint(point);
      expect(distance).toBeCloseTo(0);
    });

    it("should return positive distance for a point in the direction of the normal", () => {
      const plane = new Plane(new Vector3(0, 1, 0), -5); // y - 5 = 0
      const point = new Vector3(2, 7, -1); // y = 7 → above plane

      const distance = plane.distanceToPoint(point);
      expect(distance).toBeCloseTo(2); // 7 + (-5) = 2
    });

    it("should return negative distance for a point opposite the normal", () => {
      const plane = new Plane(new Vector3(0, 1, 0), -5); // y - 5 = 0
      const point = new Vector3(-3, 3, 0); // y = 3 → below plane

      const distance = plane.distanceToPoint(point);
      expect(distance).toBeCloseTo(-2); // 3 + (-5) = -2
    });

    it("should work with non-axis-aligned planes", () => {
      // plane: normal = (1,1,1)/√3, constant = -√3
      const normal = new Vector3(1, 1, 1).normalize();
      const constant = -Math.sqrt(3);
      const plane = new Plane(normal, constant);

      const pointOnPlane = new Vector3(1, 1, 1); // sum = 3, dot = √3, + constant = 0
      const pointAbove = new Vector3(2, 2, 2);   // distance > 0
      const pointBelow = new Vector3(0, 0, 0);   // distance < 0

      expect(plane.distanceToPoint(pointOnPlane)).toBeCloseTo(0);
      expect(plane.distanceToPoint(pointAbove)).toBeGreaterThan(0);
      expect(plane.distanceToPoint(pointBelow)).toBeLessThan(0);
    });
  });

  describe('distanceToSphere()', () => {
    it("should return 0 for a sphere touching the plane", () => {
      const plane = new Plane(new Vector3(0, 1, 0), -5); // y - 5 = 0
      const sphere = new Sphere(new Vector3(0, 10, 0), 5); // touches plane at y = 5

      const distance = plane.distanceToSphere(sphere);
      expect(distance).toBeCloseTo(0);
    });

    it("should return positive distance for a sphere fully in front of the plane", () => {
      const plane = new Plane(new Vector3(0, 1, 0), -5); // y - 5 = 0
      const sphere = new Sphere(new Vector3(0, 12, 0), 5); // closest point at y = 7

      const distance = plane.distanceToSphere(sphere);
      expect(distance).toBeCloseTo(2); // distanceToPoint = 7, minus radius 5
    });

    it("should return negative distance for a sphere intersecting the plane", () => {
      const plane = new Plane(new Vector3(0, 1, 0), -5);
      const sphere = new Sphere(new Vector3(0, 3, 0), 5); // intersects plane

      const distance = plane.distanceToSphere(sphere);
      expect(distance).toBeCloseTo(-7); // distanceToPoint = -2
    });

    it("should return negative distance for a sphere completely behind the plane", () => {
      const plane = new Plane(new Vector3(0, 1, 0), -5);
      const sphere = new Sphere(new Vector3(0, 0, 0), 2); // behind plane

      const distance = plane.distanceToSphere(sphere);
      expect(distance).toBeLessThan(0);
    });

    it("should work with non-axis-aligned planes", () => {
      const normal = new Vector3(1, 1, 1).normalize();
      const constant = -Math.sqrt(3);
      const plane = new Plane(normal, constant);

      const sphereOnPlane = new Sphere(new Vector3(1, 1, 1), 1);
      const sphereAbove = new Sphere(new Vector3(2, 2, 2), 0.5);
      const sphereBelow = new Sphere(new Vector3(0, 0, 0), 0.5);

      expect(plane.distanceToSphere(sphereOnPlane)).toBeCloseTo(-1); // distanceToPoint = 0, minus radius 1
      expect(plane.distanceToSphere(sphereAbove)).toBeGreaterThan(0);
      expect(plane.distanceToSphere(sphereBelow)).toBeLessThan(0);
    });
  });

  describe('projectPoint()', () => {
    it("should project a point above the plane onto it", () => {
      const plane = new Plane(new Vector3(0, 1, 0), -5); // plane: y - 5 = 0
      const point = new Vector3(2, 10, -3); // above plane
      const target = new Vector3();

      const projected = plane.projectPoint(point, target);

      // projected point should lie on plane: distanceToPoint = 0
      expect(plane.distanceToPoint(projected)).toBeCloseTo(0);

      // projected.x and projected.z remain same
      expect(projected.x).toBeCloseTo(point.x);
      expect(projected.z).toBeCloseTo(point.z);

      // projected.y should equal plane height
      expect(projected.y).toBeCloseTo(5);

      // returned vector is target
      expect(projected).toBe(target);
    });

    it("should project a point below the plane onto it", () => {
      const plane = new Plane(new Vector3(0, 1, 0), -5); // plane: y - 5 = 0
      const point = new Vector3(-1, 2, 4); // below plane
      const target = new Vector3();

      const projected = plane.projectPoint(point, target);

      expect(plane.distanceToPoint(projected)).toBeCloseTo(0);
      expect(projected.x).toBeCloseTo(point.x);
      expect(projected.z).toBeCloseTo(point.z);
      expect(projected.y).toBeCloseTo(5);
      expect(projected).toBe(target);
    });

    it("should leave a point on the plane unchanged", () => {
      const plane = new Plane(new Vector3(0, 1, 0), -5);
      const point = new Vector3(1, 5, -2); // already on plane
      const target = new Vector3();

      const projected = plane.projectPoint(point, target);

      expect(projected.x).toBeCloseTo(point.x);
      expect(projected.y).toBeCloseTo(point.y);
      expect(projected.z).toBeCloseTo(point.z);
      expect(plane.distanceToPoint(projected)).toBeCloseTo(0);
    });

    it("should work for non-axis-aligned planes", () => {
      const normal = new Vector3(1, 1, 1).normalize();
      const constant = -Math.sqrt(3);
      const plane = new Plane(normal, constant);

      const point = new Vector3(2, 1, 0);
      const target = new Vector3();

      const projected = plane.projectPoint(point, target);

      // projected point lies on plane
      expect(plane.distanceToPoint(projected)).toBeCloseTo(0);

      // returned vector is the target
      expect(projected).toBe(target);
    });
  });

  describe('copy()', () => {
    it("should copy normal and constant from another plane", () => {
      const source = new Plane(new Vector3(1, 2, 3), 5);
      const target = new Plane();

      target.copy(source);

      expect(target.normal.x).toBe(1);
      expect(target.normal.y).toBe(2);
      expect(target.normal.z).toBe(3);

      expect(target.constant).toBe(5);
    });

    it("should copy values, not references", () => {
      const source = new Plane(new Vector3(1, 1, 1), 10);
      const target = new Plane();

      target.copy(source);

      // modifying source normal should not affect target
      source.normal.set(5, 5, 5);
      expect(target.normal.x).toBe(1);
      expect(target.normal.y).toBe(1);
      expect(target.normal.z).toBe(1);
    });

    it("should overwrite previous values of the target plane", () => {
      const source = new Plane(new Vector3(0, 1, 0), 7);
      const target = new Plane(new Vector3(1, 0, 0), 3);

      target.copy(source);

      expect(target.normal.x).toBe(0);
      expect(target.normal.y).toBe(1);
      expect(target.normal.z).toBe(0);
      expect(target.constant).toBe(7);
    });

    it("should return the plane instance for chaining", () => {
      const source = new Plane(new Vector3(1, 0, 0), 2);
      const target = new Plane();

      const result = target.copy(source);

      expect(result).toBe(target);
    });
  });
});
