import { describe, it, expect, vi } from "vitest";
import { OrthographicCamera } from "../../../src/cameras/OrthographicCamera";
import { Vector3 } from "../../../src/math/Vector3";
import { Matrix4 } from "../../../src/math/Matrix4";
import { Node3D } from "../../../src/core/Node3D";

function matricesAlmostEqual(a: Matrix4, b: Matrix4, eps = 1e-12) {
  for (let i = 0; i < 16; i++) {
    if (Math.abs(a.elements[i] - b.elements[i]) > eps) return false;
  }
  return true;
}

describe('OrthographicCamera', () => {
  describe('constructor()', () => {
    it('should initialize with default parameters', () => {
      const camera = new OrthographicCamera();

      // Default frustum
      expect(camera.left).toBe(-1);
      expect(camera.right).toBe(1);
      expect(camera.top).toBe(1);
      expect(camera.bottom).toBe(-1);

      // Default near/far
      expect(camera.near).toBe(0.1);
      expect(camera.far).toBe(2000);

      // Zoom and flags
      expect(camera.zoom).toBe(1);
      expect(camera.isOrthographicCamera).toBe(true);
      expect(camera.type).toBe('OrthographicCamera');

      // Projection matrices exist
      expect(camera.projectionMatrix).toBeDefined();
      expect(camera.projectionMatrixInverse).toBeDefined();
    });

    it('should initialize with custom parameters', () => {
      const camera = new OrthographicCamera(-10, 10, 20, -20, 0.5, 500);

      expect(camera.left).toBe(-10);
      expect(camera.right).toBe(10);
      expect(camera.top).toBe(20);
      expect(camera.bottom).toBe(-20);

      expect(camera.near).toBe(0.5);
      expect(camera.far).toBe(500);
    });

    it('should update projection matrix when constructed', () => {
      const camera = new OrthographicCamera();

      // Projection inverse should exist and not equal original
      expect(camera.projectionMatrixInverse).toBeDefined();
      expect(camera.projectionMatrixInverse).not.toBe(camera.projectionMatrix);
    });

    it('should have undefined view initially', () => {
      const camera = new OrthographicCamera();
      expect(camera.view).toBeUndefined();
    });
  });

  describe('reversedDepth', () => {
    it('should have a default value of false', () => {
      const camera = new OrthographicCamera();
      expect(camera.reversedDepth).toBe(false);
    });

    it('should reflect changes if _reverseDepth is modified internally', () => {
      const camera = new OrthographicCamera();
      // Temporarily bypass private modifier for testing
      (camera as any)._reverseDepth = true;
      expect(camera.reversedDepth).toBe(true);

      (camera as any)._reverseDepth = false;
      expect(camera.reversedDepth).toBe(false);
    });
  });

  describe('getWorldDirection()', () => {
    it('should return a Vector3', () => {
      const camera = new OrthographicCamera();
      const target = new Vector3();
      const result = camera.getWorldDirection(target);
      expect(result).toBeInstanceOf(Vector3);
    });

    it('should store the result in the provided target', () => {
      const camera = new OrthographicCamera();
      const target = new Vector3(1, 2, 3);
      const result = camera.getWorldDirection(target);
      expect(result).toBe(target); // same reference
    });

    it('should point along the camera’s negative local Z-axis by default', () => {
      const camera = new OrthographicCamera();
      const target = new Vector3();
      camera.updateMatrixWorld(); // ensure world matrix is correct

      const direction = camera.getWorldDirection(target);
      // In default orientation, negative Z in world space
      expect(direction.x).toBeCloseTo(0);
      expect(direction.y).toBeCloseTo(0);
      expect(direction.z).toBeCloseTo(-1);
    });

    it('should reflect rotation if the camera is rotated', () => {
      const camera = new OrthographicCamera();
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
      const camera = new OrthographicCamera();

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
      const camera = new OrthographicCamera();

      // Call with force=false
      expect(() => camera.updateMatrixWorld(false)).not.toThrow();
    });

    it('should maintain identity when no transformation is applied', () => {
      const camera = new OrthographicCamera();

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
      const camera = new OrthographicCamera();

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
      const camera = new OrthographicCamera();

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
      const camera = new OrthographicCamera();

      // Default call without arguments
      camera.updateWorldMatrix();

      // Check identity (since camera has no transforms yet)
      for (let i = 0; i < 16; i++) {
        expect(camera.matrixWorld.elements[i]).toBeCloseTo(i % 5 === 0 ? 1 : 0);
        expect(camera.matrixWorldInverse.elements[i]).toBeCloseTo(i % 5 === 0 ? 1 : 0);
      }
    });
  });

  describe('copy()', () => {
    it('should copy all properties including inherited ones', () => {
      const source = new OrthographicCamera(-10, 10, 5, -5, 0.5, 1500);
      source.position.set(1, 2, 3);
      source.rotation.set(0.1, 0.2, 0.3);
      source.scale.set(2, 2, 2);
      source.updateMatrixWorld(true);

      // Set view
      source.setViewOffset(1920, 1080, 100, 50, 800, 600);

      // Add a child node
      const child = new Node3D();
      child.name = 'child';
      source.add(child);

      // Copy into a new camera
      const copyCamera = new OrthographicCamera();
      copyCamera.copy(source, true);

      // --- Check OrthographicCamera properties ---
      expect(copyCamera.left).toBe(source.left);
      expect(copyCamera.right).toBe(source.right);
      expect(copyCamera.top).toBe(source.top);
      expect(copyCamera.bottom).toBe(source.bottom);
      expect(copyCamera.near).toBe(source.near);
      expect(copyCamera.far).toBe(source.far);
      expect(copyCamera.zoom).toBe(source.zoom);

      // Check view object
      expect(copyCamera.view).toEqual(source.view);
      expect(copyCamera.view).not.toBe(source.view); // deep copy

      // --- Check Camera properties ---
      expect(copyCamera.matrixWorldInverse.equals(source.matrixWorldInverse)).toBe(true);
      expect(copyCamera.projectionMatrix.equals(source.projectionMatrix)).toBe(true);
      expect(copyCamera.projectionMatrixInverse.equals(source.projectionMatrixInverse)).toBe(true);

      // --- Check Node3D properties ---
      expect(copyCamera.position.equals(source.position)).toBe(true);

      expect(copyCamera.rotation.x).toBeCloseTo(source.rotation.x);
      expect(copyCamera.rotation.y).toBeCloseTo(source.rotation.y);
      expect(copyCamera.rotation.z).toBeCloseTo(source.rotation.z);
      expect(copyCamera.rotation.order).toBe(source.rotation.order);


      expect(copyCamera.scale.equals(source.scale)).toBe(true);
      expect(copyCamera.children.length).toBe(source.children.length);
      expect(copyCamera.children[0].name).toBe('child');

      // Modifying the copy's child should not affect source child
      copyCamera.children[0].name = 'modified';
      expect(source.children[0].name).toBe('child');
    });

    it('should handle recursive = false and not copy children', () => {
      const source = new OrthographicCamera();
      const child = new Node3D();
      source.add(child);

      const copyCamera = new OrthographicCamera();
      copyCamera.copy(source, false);

      expect(copyCamera.children.length).toBe(0);
    });
  });

  describe('setViewOffset()', () => {
    it('should create the view object if it does not exist', () => {
      const camera = new OrthographicCamera();
      camera.view = undefined; // ensure view is initially undefined

      camera.setViewOffset(1920, 1080, 100, 50, 800, 600);

      expect(camera.view).toBeDefined();
      expect(camera.view!.enabled).toBe(true);
      expect(camera.view!.fullWidth).toBe(1920);
      expect(camera.view!.fullHeight).toBe(1080);
      expect(camera.view!.offsetX).toBe(100);
      expect(camera.view!.offsetY).toBe(50);
      expect(camera.view!.width).toBe(800);
      expect(camera.view!.height).toBe(600);
    });

    it('should update an existing view object', () => {
      const camera = new OrthographicCamera();
      camera.view = {
        enabled: false,
        fullWidth: 1,
        fullHeight: 1,
        offsetX: 0,
        offsetY: 0,
        width: 1,
        height: 1,
      };

      camera.setViewOffset(2560, 1440, 200, 100, 1024, 768);

      expect(camera.view!.enabled).toBe(true);
      expect(camera.view!.fullWidth).toBe(2560);
      expect(camera.view!.fullHeight).toBe(1440);
      expect(camera.view!.offsetX).toBe(200);
      expect(camera.view!.offsetY).toBe(100);
      expect(camera.view!.width).toBe(1024);
      expect(camera.view!.height).toBe(768);
    });

    it('should call updateProjectionMatrix', () => {
      const camera = new OrthographicCamera();
      const spy = vi.spyOn(camera, 'updateProjectionMatrix');

      camera.setViewOffset(1920, 1080, 0, 0, 1920, 1080);

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('clearViewOffset()', () => {
    it('should disable the view offset if view exists', () => {
      const camera = new OrthographicCamera();
      camera.view = {
        enabled: true,
        fullWidth: 1920,
        fullHeight: 1080,
        offsetX: 100,
        offsetY: 50,
        width: 800,
        height: 600,
      };

      camera.clearViewOffset();

      expect(camera.view!.enabled).toBe(false);
    });

    it('should not throw if view is undefined', () => {
      const camera = new OrthographicCamera();
      camera.view = undefined;

      expect(() => camera.clearViewOffset()).not.toThrow();
    });

    it('should call updateProjectionMatrix after clearing view', () => {
      const camera = new OrthographicCamera();
      camera.view = {
        enabled: true,
        fullWidth: 1920,
        fullHeight: 1080,
        offsetX: 0,
        offsetY: 0,
        width: 1920,
        height: 1080,
      };

      const spy = vi.spyOn(camera, 'updateProjectionMatrix');

      camera.clearViewOffset();

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('updateProjection', () => {
    it('should compute the correct default orthographic frustum', () => {
      const camera = new OrthographicCamera(-10, 10, 10, -10, 1, 100);
      camera.zoom = 1;

      camera.updateProjectionMatrix();

      const m = camera.projectionMatrix.elements;

      // basic sanity checks
      expect(m).toHaveLength(16);
      expect(camera.projectionMatrixInverse).toBeDefined();
      expect(camera.projectionMatrixInverse).not.toBeNull();
    });

    it('should adjust the frustum when view is set and enabled', () => {
      const camera = new OrthographicCamera(-10, 10, 10, -10, 1, 100);
      camera.zoom = 1;
      camera.view = {
        enabled: true,
        fullWidth: 20,
        fullHeight: 20,
        offsetX: 5,
        offsetY: 5,
        width: 10,
        height: 10,
      };

      camera.updateProjectionMatrix();

      const m = camera.projectionMatrix.clone();
      const inv = camera.projectionMatrixInverse.clone();

      // Multiply matrix by its inverse, result should be identity
      const result = m.multiply(inv);

      // Identity matrix
      const identity = new Matrix4();

      expect(matricesAlmostEqual(result, identity)).toBe(true);
    });


    it('should not throw when view is undefined', () => {
      const camera = new OrthographicCamera();
      camera.view = undefined;

      expect(() => camera.updateProjectionMatrix()).not.toThrow();
    });
  });

  // TODO: toJSON will be reworked whtn Node3D.toJSON is implemented
  describe('toJSON', () => {
    it('should serialize all OrthographicCamera properties including view', () => {
      const camera = new OrthographicCamera(-10, 10, 10, -10, 1, 100);
      camera.name = 'TestCamera';
      camera.zoom = 2;
      camera.view = {
        enabled: true,
        fullWidth: 200,
        fullHeight: 100,
        offsetX: 10,
        offsetY: 5,
        width: 50,
        height: 25
      };

      const json = camera.toJSON();

      // Check OrthographicCamera-specific properties
      expect(json.node.left).toBe(camera.left);
      expect(json.node.right).toBe(camera.right);
      expect(json.node.top).toBe(camera.top);
      expect(json.node.bottom).toBe(camera.bottom);
      expect(json.node.near).toBe(camera.near);
      expect(json.node.far).toBe(camera.far);
      expect(json.node.zoom).toBe(camera.zoom);

      // Check view
      expect(json.node.view).toBeDefined();
      expect(json.node.view.enabled).toBe(true);
      expect(json.node.view.fullWidth).toBe(200);
      expect(json.node.view.fullHeight).toBe(100);
      expect(json.node.view.offsetX).toBe(10);
      expect(json.node.view.offsetY).toBe(5);
      expect(json.node.view.width).toBe(50);
      expect(json.node.view.height).toBe(25);

      // Check inherited Node3D properties
      expect(json.node.name).toBe(camera.name);
      expect(json.node.uuid).toBe(camera.uuid);
      expect(json.node.layers).toBe(camera.layers.mask);
    });

    it('should serialize correctly when view is undefined', () => {
      const camera = new OrthographicCamera(-10, 10, 10, -10, 1, 100);
      camera.view = undefined;

      const json = camera.toJSON();

      expect(json.node.view).toBeUndefined();
      expect(json.node.left).toBe(camera.left);
      expect(json.node.right).toBe(camera.right);
      expect(json.node.top).toBe(camera.top);
      expect(json.node.bottom).toBe(camera.bottom);
      expect(json.node.zoom).toBe(camera.zoom);
    });

    it('should include userData and non-default Node3D properties', () => {
      const camera = new OrthographicCamera(-10, 10, 10, -10, 1, 100);
      camera.userData = { custom: 42 };
      camera.visible = false;
      camera.castShadow = true;

      const json = camera.toJSON();

      expect(json.node.userData).toEqual({ custom: 42 });
      expect(json.node.visible).toBe(false);
      expect(json.node.castShadow).toBe(true);
    });

    it('should not modify original camera when serializing', () => {
      const camera = new OrthographicCamera(-10, 10, 10, -10, 1, 100);
      const before = JSON.stringify(camera);
      camera.toJSON();
      const after = JSON.stringify(camera);
      expect(after).toBe(before);
    });
  });
});
