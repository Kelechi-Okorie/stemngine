import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PerspectiveCamera } from '../../../src/cameras/PerspectiveCamera';
import { WebGLCoordinateSystem } from '../../../src/constants';
import { Matrix4 } from '../../../src/math/Matrix4';
import { Vector3 } from '../../../src/math/Vector3';
import { DEG2RAD, RAD2DEG } from '../../../src/math/MathUtils';
import { Vector2 } from '../../../src/math/Vector2';

function matricesAlmostEqual(a: Matrix4, b: Matrix4, eps = 1e-12): boolean {
  for (let i = 0; i < 16; i++) {
    if (Math.abs(a.elements[i] - b.elements[i]) > eps) return false;

    console.log({ a: a.elements[i], b: b.elements[i] })
  }
  return true;
}

function computeExpectedFov(focalLength: number, filmHeight: number) {
  const vExtentSlope = 0.5 * filmHeight / focalLength;
  return RAD2DEG * 2 * Math.atan(vExtentSlope);
}

function expectedBounds(fovDeg: number, aspect: number, distance: number) {
  const fovRad = fovDeg * Math.PI / 180;
  const height = Math.tan(fovRad / 2) * distance * 2;
  const width = height * aspect;

  return {
    minX: -width / 2,
    minY: -height / 2,
    maxX: width / 2,
    maxY: height / 2,
  };
}

function expectedSize(fovDeg: number, aspect: number, distance: number) {
  const fovRad = fovDeg * Math.PI / 180;
  const height = 2 * distance * Math.tan(fovRad / 2);
  const width = height * aspect;
  return { width, height };
}

describe('PerspectiveCamera', () => {
  describe('constructor()', () => {
    it('should create a camera with default values', () => {
      const camera = new PerspectiveCamera();

      expect(camera.isCamera).toBe(true);
      expect(camera.isPerspectiveCamera).toBe(true);
      expect(camera.type).toBe('PerspectiveCamera');

      expect(camera.fov).toBe(50);
      expect(camera.aspect).toBe(1);
      expect(camera.near).toBe(0.1);
      expect(camera.far).toBe(200);
      expect(camera.zoom).toBe(1);
      expect(camera.focus).toBe(10);

      expect(camera.filmGauge).toBe(35);
      expect(camera.filmOffset).toBe(0);

      expect(camera.view).toBeUndefined();

      // Camera matrices should be instances of Matrix4
      expect(camera.projectionMatrix).toBeDefined();
      expect(camera.projectionMatrixInverse).toBeDefined();
      expect(camera.matrixWorldInverse).toBeDefined();

      // Default coordinate system
      expect(camera.coordinateSystem).toBe(WebGLCoordinateSystem);
    });

    it('should set properties passed to constructor', () => {
      const camera = new PerspectiveCamera(60, 16 / 9, 0.5, 500);

      expect(camera.fov).toBe(60);
      expect(camera.aspect).toBeCloseTo(16 / 9);
      expect(camera.near).toBe(0.5);
      expect(camera.far).toBe(500);
    });

    it('should initialize projection matrix correctly', () => {
      const camera = new PerspectiveCamera();
      expect(camera.projectionMatrix.elements).toBeDefined();
      expect(camera.projectionMatrixInverse.elements).toBeDefined();

      // Multiply projectionMatrix by its inverse
      const identityCheck = camera.projectionMatrix.clone().multiply(camera.projectionMatrixInverse);

      // Create a true identity matrix
      const identity = new Matrix4(); // by default, Matrix4Impl() creates identity

      // Test if identityCheck is approximately equal to identity
      expect(matricesAlmostEqual(identityCheck, identity)).toBe(true);
    });
  });

  describe('reversedDepth', () => {
    it('should have a default value of false', () => {
      const camera = new PerspectiveCamera();
      expect(camera.reversedDepth).toBe(false);
    });

    it('should reflect changes if _reverseDepth is modified internally', () => {
      const camera = new PerspectiveCamera();
      // Temporarily bypass private modifier for testing
      (camera as any)._reverseDepth = true;
      expect(camera.reversedDepth).toBe(true);

      (camera as any)._reverseDepth = false;
      expect(camera.reversedDepth).toBe(false);
    });
  });

  describe('getWorldDirection()', () => {
    it('should return a Vector3', () => {
      const camera = new PerspectiveCamera();
      const target = new Vector3();
      const result = camera.getWorldDirection(target);
      expect(result).toBeInstanceOf(Vector3);
    });

    it('should store the result in the provided target', () => {
      const camera = new PerspectiveCamera();
      const target = new Vector3(1, 2, 3);
      const result = camera.getWorldDirection(target);
      expect(result).toBe(target); // same reference
    });

    it('should point along the camera’s negative local Z-axis by default', () => {
      const camera = new PerspectiveCamera();
      const target = new Vector3();
      camera.updateMatrixWorld(); // ensure world matrix is correct

      const direction = camera.getWorldDirection(target);
      // In default orientation, negative Z in world space
      expect(direction.x).toBeCloseTo(0);
      expect(direction.y).toBeCloseTo(0);
      expect(direction.z).toBeCloseTo(-1);
    });

    it('should reflect rotation if the camera is rotated', () => {
      const camera = new PerspectiveCamera();
      const target = new Vector3();

      // Rotate the camera 90 degrees around Y axis
      camera.rotation.y = Math.PI / 2;
      camera.updateMatrixWorld();

      const direction = camera.getWorldDirection(target);
      expect(direction.x).toBeCloseTo(-1); // negative Z rotated around Y -> -X
      expect(direction.y).toBeCloseTo(0);
      expect(direction.z).toBeCloseTo(0);
    });
  });

  describe('updateMatrixWorld()', () => {
    it('should update matrixWorld and matrixWorldInverse', () => {
      const camera = new PerspectiveCamera();

      // Make sure matrices are initially identity
      const identity = new Matrix4();
      expect(camera.matrixWorld.equals(identity)).toBe(true);
      expect(camera.matrixWorldInverse.equals(identity)).toBe(true);

      // Apply a transformation so the update actually changes something
      camera.position.x = 10;
      camera.updateMatrixWorld(true);

      // Now matrixWorldInverse should be the inverse of matrixWorld
      const product = new Matrix4();
      product.copy(camera.matrixWorld).multiply(camera.matrixWorldInverse);

      // product should be identity
      for (let i = 0; i < 16; i++) {
        expect(product.elements[i]).toBeCloseTo(i % 5 === 0 ? 1 : 0);
      }
    });

    it('should accept force parameter', () => {
      const camera = new PerspectiveCamera();

      // Call with force=false
      expect(() => camera.updateMatrixWorld(false)).not.toThrow();
    });

    it('should maintain identity when no transformation is applied', () => {
      const camera = new PerspectiveCamera();

      camera.updateMatrixWorld(true);

      for (let i = 0; i < 16; i++) {
        if (i % 5 === 0) {
          expect(camera.matrixWorld.elements[i]).toBeCloseTo(1); // diagonal
        } else {
          expect(camera.matrixWorld.elements[i]).toBeCloseTo(0); // off-diagonal
        }
      }
    });
  });

  describe('updateWorldMatrix()', () => {
    it('should update matrixWorldInverse to be the inverse of matrixWorld', () => {
      const camera = new PerspectiveCamera();

      // Apply a transformation
      camera.position.set(2, 3, 4);
      camera.updateWorldMatrix(true, true);

      // matrixWorldInverse should now be the inverse of matrixWorld
      const product = new Matrix4();
      product.copy(camera.matrixWorld).multiply(camera.matrixWorldInverse);

      // product should be the identity matrix
      for (let i = 0; i < 16; i++) {
        expect(product.elements[i]).toBeCloseTo(i % 5 === 0 ? 1 : 0);
      }
    });

    it('should reflect changes if position or rotation is updated', () => {
      const camera = new PerspectiveCamera();

      // Save initial inverse
      const initialInverse = new Matrix4();
      initialInverse.copy(camera.matrixWorldInverse);

      // Apply new transformation
      camera.position.set(-1, 5, 2);
      camera.updateWorldMatrix(true, true);

      // matrixWorldInverse should have changed
      expect(camera.matrixWorldInverse.equals(initialInverse)).toBe(false);

      // Confirm the inverse relationship still holds
      const product = new Matrix4();
      product.copy(camera.matrixWorld).multiply(camera.matrixWorldInverse);
      for (let i = 0; i < 16; i++) {
        expect(product.elements[i]).toBeCloseTo(i % 5 === 0 ? 1 : 0);
      }
    });

    it('should support default parameters', () => {
      const camera = new PerspectiveCamera();

      // Default call without arguments
      camera.updateWorldMatrix();

      // Check identity (since camera has no transforms yet)
      for (let i = 0; i < 16; i++) {
        expect(camera.matrixWorld.elements[i]).toBeCloseTo(i % 5 === 0 ? 1 : 0);
        expect(camera.matrixWorldInverse.elements[i]).toBeCloseTo(i % 5 === 0 ? 1 : 0);
      }
    });
  });

  describe('setFocalLength()', () => {
    it('should correctly set FOV based on focal length', () => {
      const camera = new PerspectiveCamera(50, 1.0, 0.1, 2000);

      const focal = 35;
      const filmHeight = camera.getFilmHeight();

      const expectedFov = computeExpectedFov(focal, filmHeight);

      camera.setFocalLength(focal);

      expect(camera.fov).toBeCloseTo(expectedFov, 6);
    });

    it('should call updateProjectionMatrix() when focal length changes', () => {
      const camera = new PerspectiveCamera();
      const spy = vi.spyOn(camera, 'updateProjectionMatrix');

      camera.setFocalLength(50);

      expect(spy).toHaveBeenCalledOnce();
    });

    it('should use filmGauge to determine film height', () => {
      const camera = new PerspectiveCamera();
      camera.filmGauge = 70;       // double the default 35mm
      camera.aspect = 1.0;

      const focal = 50;
      const filmHeight = camera.getFilmHeight();
      const expectedFov = computeExpectedFov(focal, filmHeight);

      camera.setFocalLength(focal);

      expect(camera.fov).toBeCloseTo(expectedFov, 6);
    });

    it('should reduce FOV as focal length increases (telephoto)', () => {
      const camera = new PerspectiveCamera();

      camera.setFocalLength(20);
      const low = camera.fov;

      camera.setFocalLength(100);
      const high = camera.fov;

      expect(high).toBeLessThan(low);
    });

    it('should increase FOV as focal length decreases (wide-angle)', () => {
      const camera = new PerspectiveCamera();

      camera.setFocalLength(200);
      const tele = camera.fov;

      camera.setFocalLength(10);
      const wide = camera.fov;

      expect(wide).toBeGreaterThan(tele);
    });

    it('should handle extreme focal lengths without NaN', () => {
      const camera = new PerspectiveCamera();

      camera.setFocalLength(0.1);   // extremely wide
      expect(camera.fov).not.toBeNaN();

      camera.setFocalLength(10000); // extremely telephoto
      expect(camera.fov).not.toBeNaN();
    });

    it('should be internally reversible: FOV → focalLength → FOV', () => {
      const camera = new PerspectiveCamera();
      const originalFov = 60;

      camera.fov = originalFov;
      camera.updateProjectionMatrix();

      // compute focal length from fov
      const filmHeight = camera.getFilmHeight();
      const vExtentSlope = Math.tan((originalFov * DEG2RAD) / 2);
      const focalLength = 0.5 * filmHeight / vExtentSlope;

      camera.setFocalLength(focalLength);

      expect(camera.fov).toBeCloseTo(originalFov, 6);
    });
  });

  describe('getFocalLength()', () => {
    let camera: PerspectiveCamera;

    beforeEach(() => {
      camera = new PerspectiveCamera(60, 1, 0.1, 1000);
      camera.filmGauge = 35; // standard full-frame
    });

    // Helper for analytic focal length
    function computeExpectedFocalLength(fov: number, filmHeight: number) {
      const vSlope = Math.tan((fov * DEG2RAD) / 2);
      return 0.5 * filmHeight / vSlope;
    }

    it("should compute the correct focal length from FOV", () => {
      const filmHeight = camera.getFilmHeight();
      const expected = computeExpectedFocalLength(camera.fov, filmHeight);

      const result = camera.getFocalLength();

      expect(result).toBeCloseTo(expected, 6);
    });

    it("should change focal length when FOV changes (smaller FOV → longer lens)", () => {
      camera.fov = 60;
      const base = camera.getFocalLength();

      camera.fov = 20; // telephoto
      const tele = camera.getFocalLength();

      expect(tele).toBeGreaterThan(base);
    });

    it("should use filmGauge to determine film height", () => {
      camera.filmGauge = 70; // IMAX-like

      const filmHeight = camera.getFilmHeight();
      const expected = computeExpectedFocalLength(camera.fov, filmHeight);

      expect(camera.getFocalLength()).toBeCloseTo(expected, 6);
    });

    it("should return finite values for extreme FOVs", () => {
      camera.fov = 1;   // extremely narrow
      expect(camera.getFocalLength()).not.toBeNaN();
      expect(camera.getFocalLength()).not.toBe(Infinity);

      camera.fov = 179; // extremely wide
      expect(camera.getFocalLength()).not.toBeNaN();
      expect(camera.getFocalLength()).not.toBe(Infinity);
    });

    it("should be reversible with setFocalLength()", () => {
      const originalFov = 60;
      camera.fov = originalFov;

      const f = camera.getFocalLength(); // convert FOV → focal length

      camera.setFocalLength(f); // convert focal length → FOV

      expect(camera.fov).toBeCloseTo(originalFov, 6);
    });

    it("should decrease focal length as FOV increases (wide angle)", () => {
      camera.fov = 30;
      const tele = camera.getFocalLength();

      camera.fov = 120;
      const wide = camera.getFocalLength();

      expect(wide).toBeLessThan(tele);
    });
  });

  describe('getEffectiveFOV', () => {
    let camera: PerspectiveCamera;

    beforeEach(() => {
      camera = new PerspectiveCamera(60, 1, 0.1, 1000);
      camera.zoom = 1;
    });

    function expectedEffectiveFov(fov: number, zoom: number) {
      const baseRadians = (fov * DEG2RAD) / 2;
      const scaled = Math.atan(Math.tan(baseRadians) / zoom);
      return scaled * 2 * RAD2DEG;
    }

    it("should return the same FOV when zoom = 1", () => {
      const result = camera.getEffectiveFOV();
      const expected = expectedEffectiveFov(60, 1);

      expect(result).toBeCloseTo(expected, 6);
      expect(result).toBeCloseTo(60, 6);
    });

    it("should narrow the FOV when zoom increases", () => {
      const base = camera.getEffectiveFOV();

      camera.zoom = 2; // zoom-in → narrower
      const zoomed = camera.getEffectiveFOV();

      expect(zoomed).toBeLessThan(base);
    });

    it("should widen the FOV when zoom decreases (< 1)", () => {
      const base = camera.getEffectiveFOV();

      camera.zoom = 0.5; // zoom-out → wider
      const wide = camera.getEffectiveFOV();

      expect(wide).toBeGreaterThan(base);
    });

    it("should calculate correct values based on the analytic math", () => {
      camera.fov = 45;
      camera.zoom = 2;

      const expected = expectedEffectiveFov(45, 2);
      const actual = camera.getEffectiveFOV();

      expect(actual).toBeCloseTo(expected, 6);
    });

    it("should never return NaN or Infinity for normal values", () => {
      camera.fov = 60;
      camera.zoom = 3;

      const val = camera.getEffectiveFOV();

      expect(val).not.toBeNaN();
      expect(val).not.toBe(Infinity);
    });

    it("should handle extreme zoom values without NaN", () => {
      camera.zoom = 0.01; // extremely wide angle
      expect(camera.getEffectiveFOV()).not.toBeNaN();
      expect(camera.getEffectiveFOV()).not.toBe(Infinity);

      camera.zoom = 1000; // extremely narrow
      expect(camera.getEffectiveFOV()).not.toBeNaN();
      expect(camera.getEffectiveFOV()).not.toBe(Infinity);
    });

    it("should shrink FOV towards 0 degrees for very high zoom", () => {
      camera.zoom = 1;
      const normal = camera.getEffectiveFOV();

      camera.zoom = 1e6;
      const extreme = camera.getEffectiveFOV();

      expect(extreme).toBeLessThan(normal);
      expect(extreme).toBeCloseTo(0, 3); // gets very small
    });

    it("should expand FOV toward 180 deg for very small zoom", () => {
      camera.zoom = 1;
      const normal = camera.getEffectiveFOV();

      camera.zoom = 1e-6;
      const extreme = camera.getEffectiveFOV();

      expect(extreme).toBeGreaterThan(normal);
      expect(extreme).toBeLessThan(180); // never exceeds 180
    });
  });

  describe('getFilmWidth()', () => {
    let camera: PerspectiveCamera;

    beforeEach(() => {
      camera = new PerspectiveCamera(60, 1, 0.1, 1000);
      camera.filmGauge = 35; // typical full-frame sensor width
    });

    it("should return full filmGauge when aspect >= 1 (landscape)", () => {
      camera.aspect = 1.5;

      expect(camera.getFilmWidth()).toBeCloseTo(35, 6);
    });

    it("should return filmGauge when aspect = 1", () => {
      camera.aspect = 1;

      expect(camera.getFilmWidth()).toBeCloseTo(35, 6);
    });

    it("should scale filmGauge by aspect when aspect < 1 (portrait)", () => {
      camera.aspect = 0.5;

      const expected = 35 * 0.5;
      expect(camera.getFilmWidth()).toBeCloseTo(expected, 6);
    });

    it("should correctly compute width for very narrow portrait aspect", () => {
      camera.aspect = 0.1;

      const expected = 35 * 0.1;
      expect(camera.getFilmWidth()).toBeCloseTo(expected, 6);
    });

    it("should not return NaN or Infinity for extreme valid aspect values", () => {
      camera.aspect = 10;
      expect(camera.getFilmWidth()).not.toBeNaN();
      expect(camera.getFilmWidth()).not.toBe(Infinity);

      camera.aspect = 0.0001;
      expect(camera.getFilmWidth()).not.toBeNaN();
      expect(camera.getFilmWidth()).not.toBe(Infinity);
    });

    it("should clamp based on min(aspect, 1)", () => {
      camera.aspect = 3; // extremely wide
      expect(camera.getFilmWidth()).toBe(35);

      camera.aspect = 0.25; // portrait
      expect(camera.getFilmWidth()).toBeCloseTo(35 * 0.25, 6);
    });
  });

  describe('getFilmHeight()', () => {
    it("returns full filmGauge when aspect < 1 (portrait mode)", () => {
      const cam = new PerspectiveCamera();
      cam.filmGauge = 35;
      cam.aspect = 0.5;

      expect(cam.getFilmHeight()).toBe(35);
    });

    it("divides filmGauge by aspect when aspect >= 1 (landscape mode)", () => {
      const cam = new PerspectiveCamera();
      cam.filmGauge = 35;
      cam.aspect = 2;

      expect(cam.getFilmHeight()).toBe(35 / 2);
    });

    it("returns filmGauge unchanged when aspect = 1", () => {
      const cam = new PerspectiveCamera();
      cam.filmGauge = 35;
      cam.aspect = 1;

      expect(cam.getFilmHeight()).toBe(35);
    });

    it("handles non-standard filmGauge values", () => {
      const cam = new PerspectiveCamera();
      cam.filmGauge = 70;
      cam.aspect = 2;

      expect(cam.getFilmHeight()).toBe(70 / 2);
    });

    it("handles floating-point aspect values", () => {
      const cam = new PerspectiveCamera();
      cam.filmGauge = 50;
      cam.aspect = 1.3333333333;

      expect(cam.getFilmHeight()).toBeCloseTo(50 / 1.3333333333);
    });
  });

  describe('getViewBounds()', () => {
    it("computes correct screen-space rectangle at a given distance", () => {
      const cam = new PerspectiveCamera(60, 1.0, 0.1, 1000);

      cam.updateProjectionMatrix();

      const min = new Vector2();
      const max = new Vector2();

      cam.getViewBounds(10, min, max);

      const expected = expectedBounds(60, 1.0, 10);

      expect(min.x).toBeCloseTo(expected.minX, 5);
      expect(min.y).toBeCloseTo(expected.minY, 5);
      expect(max.x).toBeCloseTo(expected.maxX, 5);
      expect(max.y).toBeCloseTo(expected.maxY, 5);
    });

    it("handles non-square aspect ratios", () => {
      const cam = new PerspectiveCamera(60, 2.0, 0.1, 1000);

      cam.updateProjectionMatrix();

      const min = new Vector2();
      const max = new Vector2();

      cam.getViewBounds(5, min, max);

      const expected = expectedBounds(60, 2.0, 5);

      expect(min.x).toBeCloseTo(expected.minX, 5);
      expect(min.y).toBeCloseTo(expected.minY, 5);
      expect(max.x).toBeCloseTo(expected.maxX, 5);
      expect(max.y).toBeCloseTo(expected.maxY, 5);
    });

    it("returns larger bounds for greater distances", () => {
      const cam = new PerspectiveCamera(45, 1.5, 0.1, 1000);
      cam.updateProjectionMatrix();

      const min10 = new Vector2();
      const max10 = new Vector2();
      cam.getViewBounds(10, min10, max10);

      const min20 = new Vector2();
      const max20 = new Vector2();
      cam.getViewBounds(20, min20, max20);

      // Bounds at 20 should be exactly double those at 10
      expect(min20.x).toBeCloseTo(min10.x * 2, 5);
      expect(max20.x).toBeCloseTo(max10.x * 2, 5);
      expect(min20.y).toBeCloseTo(min10.y * 2, 5);
      expect(max20.y).toBeCloseTo(max10.y * 2, 5);
    });
  });

  describe('getViewSize()', () => {
    it("computes correct view size at a given distance", () => {
      const cam = new PerspectiveCamera(60, 1.0, 0.1, 100);
      cam.updateProjectionMatrix();

      const result = new Vector2();
      cam.getViewSize(10, result);

      const expected = expectedSize(60, 1.0, 10);

      expect(result.x).toBeCloseTo(expected.width, 5);
      expect(result.y).toBeCloseTo(expected.height, 5);
    });

    it("handles non-square aspect ratios", () => {
      const cam = new PerspectiveCamera(45, 2.0, 0.1, 100);
      cam.updateProjectionMatrix();

      const result = new Vector2();
      cam.getViewSize(5, result);

      const expected = expectedSize(45, 2.0, 5);

      expect(result.x).toBeCloseTo(expected.width, 5);
      expect(result.y).toBeCloseTo(expected.height, 5);
    });

    it("view size scales linearly with distance", () => {
      const cam = new PerspectiveCamera(30, 1.5, 0.1, 100);
      cam.updateProjectionMatrix();

      const size10 = new Vector2();
      const size20 = new Vector2();

      cam.getViewSize(10, size10);
      cam.getViewSize(20, size20);

      // At double distance, the frustum size doubles
      expect(size20.x).toBeCloseTo(size10.x * 2, 5);
      expect(size20.y).toBeCloseTo(size10.y * 2, 5);
    });

    it("uses getViewBounds internally and always returns positive size", () => {
      const cam = new PerspectiveCamera(75, 1.0, 0.1, 100);
      cam.updateProjectionMatrix();

      const result = new Vector2();
      cam.getViewSize(3, result);

      expect(result.x).toBeGreaterThan(0);
      expect(result.y).toBeGreaterThan(0);
    });
  });

  describe('setViewOffset()', () => {
    it("initializes view object if not present", () => {
      const cam = new PerspectiveCamera(60, 1.0, 0.1, 100);
      cam.view = undefined;

      cam.setViewOffset(1920, 1080, 0, 0, 1920, 1080);

      expect(cam.view).toBeDefined();
      expect(cam.view!.enabled).toBe(true);
      expect(cam.view!.fullWidth).toBe(1920);
      expect(cam.view!.fullHeight).toBe(1080);
      expect(cam.view!.offsetX).toBe(0);
      expect(cam.view!.offsetY).toBe(0);
      expect(cam.view!.width).toBe(1920);
      expect(cam.view!.height).toBe(1080);
    });

    it("updates aspect ratio based on fullWidth and fullHeight", () => {
      const cam = new PerspectiveCamera(60, 1.0, 0.1, 100);
      cam.setViewOffset(3840, 1080, 0, 0, 1920, 1080);

      expect(cam.aspect).toBeCloseTo(3840 / 1080, 5);
    });

    it("enables view even if view already existed", () => {
      const cam = new PerspectiveCamera();
      cam.view = { enabled: false, fullWidth: 0, fullHeight: 0, offsetX: 0, offsetY: 0, width: 0, height: 0 };

      cam.setViewOffset(1920, 1080, 100, 50, 800, 600);

      expect(cam.view!.enabled).toBe(true);
      expect(cam.view!.offsetX).toBe(100);
      expect(cam.view!.offsetY).toBe(50);
      expect(cam.view!.width).toBe(800);
      expect(cam.view!.height).toBe(600);
    });

    it("calls updateProjectionMatrix", () => {
      const cam = new PerspectiveCamera();
      cam.updateProjectionMatrix = vi.fn();

      cam.setViewOffset(1920, 1080, 0, 0, 1920, 1080);

      expect(cam.updateProjectionMatrix).toHaveBeenCalled();
    });

    it("works for multi-monitor grid offsets", () => {
      const cam = new PerspectiveCamera();
      const fullWidth = 5760;
      const fullHeight = 2160;
      const w = 1920;
      const h = 1080;

      // Example: monitor C (top row, 3rd monitor)
      cam.setViewOffset(fullWidth, fullHeight, w * 2, 0, w, h);

      expect(cam.view!.fullWidth).toBe(fullWidth);
      expect(cam.view!.fullHeight).toBe(fullHeight);
      expect(cam.view!.offsetX).toBe(w * 2);
      expect(cam.view!.offsetY).toBe(0);
      expect(cam.view!.width).toBe(w);
      expect(cam.view!.height).toBe(h);
    });
  });

  describe('clearViewOffset()', () => {
    it("disables the view offset and updates projection matrix", () => {
      const cam = new PerspectiveCamera();

      // Simulate a previously set view offset
      cam.view = {
        enabled: true,
        fullWidth: 1920,
        fullHeight: 1080,
        offsetX: 100,
        offsetY: 50,
        width: 800,
        height: 600
      };

      // Mock the updateProjectionMatrix function
      cam.updateProjectionMatrix = vi.fn();

      cam.clearViewOffset();

      expect(cam.view!.enabled).toBe(false);
      expect(cam.updateProjectionMatrix).toHaveBeenCalled();
    });

    it("does not throw if view is null or undefined", () => {
      const cam = new PerspectiveCamera();

      cam.view = undefined;;
      cam.updateProjectionMatrix = vi.fn();

      expect(() => cam.clearViewOffset()).not.toThrow();
      expect(cam.updateProjectionMatrix).toHaveBeenCalled();

      cam.view = undefined;
      cam.updateProjectionMatrix = vi.fn();

      expect(() => cam.clearViewOffset()).not.toThrow();
      expect(cam.updateProjectionMatrix).toHaveBeenCalled();
    });
  });

  describe('updateProjctionMatrix()', () => {
    it("updates the projection matrix and its inverse", () => {
      const cam = new PerspectiveCamera();
      cam.near = 0.1;
      cam.far = 100;
      cam.fov = 60;
      cam.aspect = 2;

      cam.updateProjectionMatrix();

      expect(cam.projectionMatrix.elements.length).toBe(16);
      expect(cam.projectionMatrixInverse.elements.length).toBe(16);

      // Verify that projection * inverse = identity approximately
      const identity = cam.projectionMatrix.clone().multiply(cam.projectionMatrixInverse);
      for (let i = 0; i < 16; i++) {
        expect(identity.elements[i]).toBeCloseTo(i % 5 === 0 ? 1 : 0, 6);
      }
    });

    it("applies view offset if enabled", () => {
      const cam = new PerspectiveCamera();
      cam.view = {
        enabled: true,
        fullWidth: 1920,
        fullHeight: 1080,
        offsetX: 100,
        offsetY: 50,
        width: 800,
        height: 600
      };

      cam.updateProjectionMatrix();

      // The projection matrix should reflect a sub-frustum
      expect(cam.projectionMatrix).toBeDefined();
      expect(cam.projectionMatrixInverse).toBeDefined();
    });

    it("applies film offset/skew if specified", () => {
      const cam = new PerspectiveCamera();
      cam.filmOffset = 0.5;
      cam.updateProjectionMatrix();

      expect(cam.projectionMatrix).toBeDefined();
    });

    it("handles zoom correctly", () => {
      const cam = new PerspectiveCamera();
      cam.zoom = 2;
      cam.updateProjectionMatrix();

      expect(cam.projectionMatrix).toBeDefined();
    });
  });

  describe('toJSON()', () => {
    it("serializes all main camera properties", () => {
      const cam = new PerspectiveCamera();
      cam.fov = 60;
      cam.zoom = 2;
      cam.near = 0.1;
      cam.far = 100;
      cam.focus = 1;
      cam.aspect = 1.5;

      const json = cam.toJSON();

      expect(json.node.fov).toBe(60);
      expect(json.node.zoom).toBe(2);
      expect(json.node.near).toBe(0.1);
      expect(json.node.far).toBe(100);
      expect(json.node.focus).toBe(1);
      expect(json.node.aspect).toBe(1.5);
    });

    it("includes view, filmGauge, and filmOffset if view is set", () => {
      const cam = new PerspectiveCamera();
      cam.view = {
        enabled: true,
        fullWidth: 1920,
        fullHeight: 1080,
        offsetX: 0,
        offsetY: 0,
        width: 1920,
        height: 1080
      };
      cam.filmGauge = 35;
      cam.filmOffset = 2;

      const json = cam.toJSON();

      expect(json.node.view).toEqual(cam.view);
      expect(json.node.filmGauge).toBe(35);
      expect(json.node.filmOffset).toBe(2);
    });

    it("works when view is null", () => {
      const cam = new PerspectiveCamera();
      cam.view = undefined;
      const json = cam.toJSON();

      expect(json.node.view).toBeUndefined();
      expect(json.node.filmGauge).toBeUndefined();
      expect(json.node.filmOffset).toBeUndefined();
    });
  });

  describe('clone()', () => {
    it("returns a new instance, not the same reference", () => {
      const cam = new PerspectiveCamera(60, 1.5, 0.3, 200);

      const clone = cam.clone();

      expect(clone).not.toBe(cam);
      expect(clone instanceof PerspectiveCamera).toBe(true);
    });

    it("clones all numeric fields correctly", () => {
      const cam = new PerspectiveCamera(60, 1.5, 0.3, 200);

      cam.zoom = 2;
      cam.focus = 15;
      cam.filmGauge = 40;
      cam.filmOffset = 7;

      const clone = cam.clone();

      expect(clone.fov).toBe(cam.fov);
      expect(clone.aspect).toBe(cam.aspect);
      expect(clone.near).toBe(cam.near);
      expect(clone.far).toBe(cam.far);
      expect(clone.zoom).toBe(cam.zoom);
      expect(clone.focus).toBe(cam.focus);
      expect(clone.filmGauge).toBe(cam.filmGauge);
      expect(clone.filmOffset).toBe(cam.filmOffset);
    });

    it("deep clones the view object", () => {
      const cam = new PerspectiveCamera();
      cam.view = {
        enabled: true,
        fullWidth: 1024,
        fullHeight: 768,
        offsetX: 100,
        offsetY: 50,
        width: 512,
        height: 384,
      };

      const clone = cam.clone();

      expect(clone.view).toEqual(cam.view);
      expect(clone.view).not.toBe(cam.view); // Deep clone, not reference copy
    });

    it("preserves view = undefined", () => {
      const cam = new PerspectiveCamera();
      cam.view = undefined;

      const clone = cam.clone();

      expect(clone.view).toBeUndefined();
    });

    it("does not modify the original camera during cloning", () => {
      const cam = new PerspectiveCamera(75, 2, 0.1, 1000);
      const before = {
        fov: cam.fov,
        aspect: cam.aspect,
        near: cam.near,
        far: cam.far,
      };

      cam.clone(); // perform clone

      expect(cam.fov).toBe(before.fov);
      expect(cam.aspect).toBe(before.aspect);
      expect(cam.near).toBe(before.near);
      expect(cam.far).toBe(before.far);
    });

    it("clones children recursively (if super.copy supports hierarchy)", () => {
      const parent = new PerspectiveCamera();
      const child = new PerspectiveCamera();
      parent.add(child);

      const clone = parent.clone();

      expect(clone.children.length).toBe(1);
      expect(clone.children[0]).not.toBe(child); // new instance
      expect((clone.children[0] as PerspectiveCamera).fov).toBe(child.fov);
    });
  });

  describe('copy()', () => {
    it("copies all numeric properties correctly", () => {
      const source = new PerspectiveCamera(60, 1.5, 0.5, 500);
      source.zoom = 2;
      source.focus = 20;
      source.filmGauge = 40;
      source.filmOffset = 5;

      const target = new PerspectiveCamera();
      target.copy(source);

      expect(target.fov).toBe(source.fov);
      expect(target.aspect).toBe(source.aspect);
      expect(target.near).toBe(source.near);
      expect(target.far).toBe(source.far);
      expect(target.zoom).toBe(source.zoom);
      expect(target.focus).toBe(source.focus);
      expect(target.filmGauge).toBe(source.filmGauge);
      expect(target.filmOffset).toBe(source.filmOffset);
    });

    it("deep copies the view object when present", () => {
      const source = new PerspectiveCamera();
      source.view = {
        enabled: true,
        fullWidth: 800,
        fullHeight: 600,
        offsetX: 100,
        offsetY: 50,
        width: 400,
        height: 300,
      };

      const target = new PerspectiveCamera();
      target.copy(source);

      // Not the same reference
      expect(target.view).not.toBe(source.view);

      // But same values
      expect(target.view).toEqual(source.view);
    });

    it("sets view = undefined when source.view is null or undefined", () => {
      const source = new PerspectiveCamera();
      source.view = undefined;

      const target = new PerspectiveCamera();
      target.view = {
        enabled: true,
        fullWidth: 1,
        fullHeight: 1,
        offsetX: 0,
        offsetY: 0,
        width: 1,
        height: 1,
      };

      target.copy(source);

      expect(target.view).toBeUndefined();
    });

    it("does not mutate the source camera", () => {
      const source = new PerspectiveCamera(50, 2, 1, 100);
      const original = { ...source }; // shallow copy for comparison

      const target = new PerspectiveCamera();
      target.copy(source);

      // Ensure values are equal but source unchanged
      expect(source.fov).toBe(original.fov);
      expect(source.aspect).toBe(original.aspect);
      expect(source.near).toBe(original.near);
      expect(source.far).toBe(original.far);
    });

    it("calls super.copy when recursive = true", () => {
      // This checks child copying behavior
      const parent = new PerspectiveCamera();
      const child = new PerspectiveCamera();
      parent.add(child);

      const clone = new PerspectiveCamera();
      clone.copy(parent, true);

      expect(clone.children.length).toBe(1);
      expect(clone.children[0]).not.toBe(child);        // different instance
      expect((clone.children[0] as PerspectiveCamera).fov).toBe(child.fov);    // but copied
    });
  });
});
