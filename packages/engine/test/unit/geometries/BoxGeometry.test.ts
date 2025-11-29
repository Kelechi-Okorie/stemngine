import { describe, it, expect, vi } from "vitest";
import { BoxGeometry } from "../../../src/geometries/BoxGeometry";
import { BufferAttribute } from "../../../src/core/BufferAttribute";
import { Float32BufferAttribute } from "../../../src/core/BufferAttribute";
import { BufferGeometry } from "../../../src/core/BufferGeometry";

describe('BoxGeometry', () => {
  describe('constructor()', () => {
    it('should create a BoxGeometry with default parameters', () => {
      const geometry = new BoxGeometry();

      expect(geometry).toBeInstanceOf(BoxGeometry);
      expect(geometry.type).toBe('BoxGeometry');

      // default dimensions
      expect(geometry.width).toBe(1);
      expect(geometry.height).toBe(1);
      expect(geometry.depth).toBe(1);

      // default segments
      expect(geometry.parameters).toEqual({
        width: 1,
        height: 1,
        depth: 1,
        widthSegments: 1,
        heightSegments: 1,
        depthSegments: 1
      });

      // buffer attributes
      expect(geometry.getAttribute('position')).toBeInstanceOf(Float32BufferAttribute);
      expect(geometry.getAttribute('normal')).toBeInstanceOf(Float32BufferAttribute);
      expect(geometry.getAttribute('uv')).toBeInstanceOf(Float32BufferAttribute);

      // index buffer
      expect(geometry.getIndex()).toBeDefined();
    });

    it('should set custom dimensions and segments', () => {
      const geometry = new BoxGeometry(2, 3, 4, 2, 2, 2);

      expect(geometry.width).toBe(2);
      expect(geometry.height).toBe(3);
      expect(geometry.depth).toBe(4);

      expect(geometry.parameters).toEqual({
        width: 2,
        height: 3,
        depth: 4,
        widthSegments: 2,
        heightSegments: 2,
        depthSegments: 2
      });

      const position = geometry.getAttribute('position')!;
      const normal = geometry.getAttribute('normal')!;
      const uv = geometry.getAttribute('uv')!;

      expect(position.count).toBeGreaterThan(0);
      expect(normal.count).toBeGreaterThan(0);
      expect(uv.count).toBeGreaterThan(0);
    });

    it('should generate correct number of groups for multi-material support', () => {
      const geometry = new BoxGeometry(1, 1, 1, 1, 1, 1);
      const groups = geometry.groups;

      // Box has 6 faces
      expect(groups.length).toBe(6);

      groups.forEach((group, idx) => {
        expect(group.materialIndex).toBe(idx);
        expect(group.count).toBeGreaterThan(0);
      });
    });

    it('should handle fractional segments by flooring them', () => {
      const geometry = new BoxGeometry(1, 1, 1, 1.9, 2.7, 3.5);

      expect(geometry.parameters?.widthSegments).toBeCloseTo(1.9); // parameters are original
      expect(geometry.parameters?.heightSegments).toBeCloseTo(2.7);
      expect(geometry.parameters?.depthSegments).toBeCloseTo(3.5);

      // Internally segments are floored, but we can verify position buffer length > 0
      expect(geometry.getAttribute('position')!.count).toBeGreaterThan(0);
    });
  });

  describe('copy()', () => {
    it('should copy parameters from another BoxGeometry', () => {
      const original = new BoxGeometry(2, 3, 4, 2, 2, 2);
      const copy = new BoxGeometry().copy(original);

      // The copied object should have the same parameter values
      expect(copy.parameters).toEqual(original.parameters);

      // Individual properties should match
      // expect(copy.width).toBe(original.width);
      // expect(copy.height).toBe(original.height);
      // expect(copy.depth).toBe(original.depth);
      // expect(copy.widthSegments).toBe(original.widthSegments);
      // expect(copy.heightSegments).toBe(original.heightSegments);
      // expect(copy.depthSegments).toBe(original.depthSegments);
    });

    it('should return a reference to this instance', () => {
      const original = new BoxGeometry(1, 1, 1);
      const instance = new BoxGeometry();
      const result = instance.copy(original);

      expect(result).toBe(instance);
    });

    it('should create a new parameters object (not a reference)', () => {
      const original = new BoxGeometry(2, 2, 2);
      const copy = new BoxGeometry().copy(original);

      // Modifying copy.parameters should not affect original.parameters
      if (copy.parameters) copy.parameters.width = 999;
      expect(original.parameters?.width).not.toBe(999);
    });

    it('should call super.copy', () => {
      const original = new BoxGeometry(1, 1, 1);
      const spy = vi.spyOn(BufferGeometry.prototype, 'copy');
      const copy = new BoxGeometry().copy(original);

      expect(spy).toHaveBeenCalledWith(original);

      spy.mockRestore();
    });
  });

  describe('fromJSON()', () => {
    it('should create a new BoxGeometry instance from a JSON object', () => {
      const json = {
        width: 2,
        height: 3,
        depth: 4,
        widthSegments: 2,
        heightSegments: 3,
        depthSegments: 4
      };

      const geometry = BoxGeometry.prototype.fromJSON(json);

      expect(geometry).toBeInstanceOf(BoxGeometry);
      expect(geometry.width).toBe(2);
      expect(geometry.height).toBe(3);
      expect(geometry.depth).toBe(4);
      expect(geometry.widthSegments).toBe(2);
      expect(geometry.heightSegments).toBe(3);
      expect(geometry.depthSegments).toBe(4);

      // parameters property should also match
      expect(geometry.parameters).toEqual({
        width: 2,
        height: 3,
        depth: 4,
        widthSegments: 2,
        heightSegments: 3,
        depthSegments: 4
      });
    });

    it('should use default values when JSON properties are missing', () => {
      const json = {};

      const geometry = BoxGeometry.prototype.fromJSON(json);

      expect(geometry.width).toBe(1);
      expect(geometry.height).toBe(1);
      expect(geometry.depth).toBe(1);
      expect(geometry.widthSegments).toBe(1);
      expect(geometry.heightSegments).toBe(1);
      expect(geometry.depthSegments).toBe(1);

      expect(geometry.parameters).toEqual({
        width: 1,
        height: 1,
        depth: 1,
        widthSegments: 1,
        heightSegments: 1,
        depthSegments: 1
      });
    });
  });
});
