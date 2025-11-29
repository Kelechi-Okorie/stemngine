import { describe, it, expect } from "vitest";
import { InstancedBufferAttribute } from '../../../src/core/InstancedBufferAttribute';

describe('InstancedBufferAttribute', () => {
  describe('constructor()', () => {
    it("creates attribute with correct fields", () => {
      const arr = new Float32Array([1, 2, 3, 4]);
      const attr = new InstancedBufferAttribute(arr, 2);

      expect(attr.array).toBe(arr);
      expect(attr.itemSize).toBe(2);
      expect(attr.normalized).toBe(true);        // default
      expect(attr.meshPerAttribute).toBe(1);     // default
    });

    it("respects explicit normalization flag", () => {
      const arr = new Uint16Array([10, 20, 30, 40]);
      const attr = new InstancedBufferAttribute(arr, 2, false);

      expect(attr.normalized).toBe(false);
    });

    it("sets meshPerAttribute correctly", () => {
      const arr = new Float32Array([5, 6, 7, 8]);
      const attr = new InstancedBufferAttribute(arr, 2, true, 4);

      expect(attr.meshPerAttribute).toBe(4);
    });

    it("passes array and itemSize to BufferAttribute via super()", () => {
      const arr = new Float32Array([9, 9, 9]);
      const attr = new InstancedBufferAttribute(arr, 3);

      // These properties come from the parent BufferAttribute
      expect(attr.count).toBe(arr.length / 3);
      expect(attr.itemSize).toBe(3);
    });
  });

  describe('copy()', () => {
    it("copies base BufferAttribute properties", () => {
      const sourceArray = new Float32Array([1, 2, 3, 4, 5, 6]);
      const source = new InstancedBufferAttribute(sourceArray, 3, false, 2);

      const targetArray = new Float32Array([0, 0, 0, 0, 0, 0]);
      const target = new InstancedBufferAttribute(targetArray, 3);

      const result = target.copy(source);

      // Base class fields
      expect(target.array).toBe(source.array);
      expect(target.itemSize).toBe(source.itemSize);
      expect(target.normalized).toBe(source.normalized);
      expect(target.count).toBe(source.count);

      // Ensure it returns this
      expect(result).toBe(target);
    });

    it("copies meshPerAttribute correctly", () => {
      const source = new InstancedBufferAttribute(new Float32Array([1, 2, 3, 4]), 2, true, 5);
      const target = new InstancedBufferAttribute(new Float32Array([0, 0, 0, 0]), 2);

      target.copy(source);

      expect(target.meshPerAttribute).toBe(5);
    });

    it("does not modify the source attribute", () => {
      const source = new InstancedBufferAttribute(new Float32Array([1, 2, 3, 4]), 2, true, 3);
      const target = new InstancedBufferAttribute(new Float32Array([0, 0, 0, 0]), 2);

      target.copy(source);

      expect(source.meshPerAttribute).toBe(3);
      expect(source.array[0]).toBe(1);
    });
  });

  describe('toJSON()', () => {
    it("includes base BufferAttribute properties", () => {
      const array = new Float32Array([1, 2, 3, 4, 5, 6]);
      const attr = new InstancedBufferAttribute(array, 3, true, 2);

      const json = attr.toJSON();

      expect(json).toHaveProperty("itemSize", 3);
      expect(json).toHaveProperty("type", "Float32Array");
      expect(json).toHaveProperty("array", Array.from(array));
      expect(json).toHaveProperty("normalized", true);
    });

    it("includes meshPerAttribute and isInstancedBufferAttribute", () => {
      const attr = new InstancedBufferAttribute(new Float32Array([1, 2, 3]), 1, true, 5);

      const json = attr.toJSON();

      expect(json).toHaveProperty("meshPerAttribute", 5);
      expect(json).toHaveProperty("isInstancedBufferAttribute", true);
    });

    it("does not modify the original attribute", () => {
      const array = new Float32Array([7, 8, 9]);
      const attr = new InstancedBufferAttribute(array, 1, false, 1);

      const json = attr.toJSON();

      // original attribute remains unchanged
      expect(attr.meshPerAttribute).toBe(1);
      expect(attr.array).toBe(array);
    });

    it("returns a plain object", () => {
      const attr = new InstancedBufferAttribute(new Float32Array([0, 1, 2]), 1);
      const json = attr.toJSON();

      expect(json.constructor).toBe(Object);
    });
  });
});
