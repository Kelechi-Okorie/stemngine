import { describe, it, expect, beforeEach } from "vitest";
import { InstancedInterleavedBuffer } from "../../../src/core/InstancedInterleaveBuffer";
import { InterleavedBuffer } from "../../../src/core/InterleavedBuffer.js";

describe("InstancedInterleaveBuffer", () => {
  describe("constructor()", () => {
    it("should be an instance of InterleavedBuffer", () => {
      const array = new Float32Array([1, 2, 3, 4]);
      const buffer = new InstancedInterleavedBuffer(array, 2);

      expect(buffer).toBeInstanceOf(InterleavedBuffer);
    });

    it("should set isInstancedInterleavedBuffer to true", () => {
      const array = new Float32Array([1, 2, 3]);
      const buffer = new InstancedInterleavedBuffer(array, 1);

      expect(buffer.isInstancedInterleavedBuffer).toBe(true);
    });

    it("should set meshPerAttribute to the default value 1 if not provided", () => {
      const array = new Float32Array([1, 2, 3]);
      const buffer = new InstancedInterleavedBuffer(array, 1);

      expect(buffer.meshPerAttribute).toBe(1);
    });

    it("should set meshPerAttribute to the given value", () => {
      const array = new Float32Array([1, 2, 3, 4]);
      const buffer = new InstancedInterleavedBuffer(array, 2, 3);

      expect(buffer.meshPerAttribute).toBe(3);
    });

    it("should correctly set array, stride, and count from InterleavedBuffer", () => {
      const array = new Float32Array([1, 2, 3, 4, 5, 6]);
      const stride = 3;
      const buffer = new InstancedInterleavedBuffer(array, stride);

      expect(buffer.array).toBe(array);
      expect(buffer.stride).toBe(stride);
      expect(buffer.count).toBe(array.length / stride);
    });

    it("should have default InterleavedBuffer properties", () => {
      const array = new Float32Array([1, 2]);
      const buffer = new InstancedInterleavedBuffer(array, 2);

      expect(buffer.isInterleavedBuffer).toBe(true);
      expect(buffer.type).toBe("InterleavedBuffer");
      expect(buffer.usage).toBeDefined();
      expect(buffer.updateRanges).toEqual([]);
      expect(buffer.version).toBe(0);
    });
  });

  describe("copy()", () => {
    it("should copy array, stride, and count from the source buffer", () => {
      const sourceArray = new Float32Array([1, 2, 3, 4]);
      const source = new InstancedInterleavedBuffer(sourceArray, 2, 3);

      const targetArray = new Float32Array([0, 0, 0, 0]);
      const target = new InstancedInterleavedBuffer(targetArray, 1, 1);

      target.copy(source);

      expect(target.array).toBe(source.array);
      expect(target.stride).toBe(source.stride);
      expect(target.count).toBe(source.count);
    });

    it("should copy meshPerAttribute from the source buffer", () => {
      const source = new InstancedInterleavedBuffer(new Float32Array([1, 2, 3]), 1, 5);
      const target = new InstancedInterleavedBuffer(new Float32Array([0, 0, 0]), 1);

      target.copy(source);

      expect(target.meshPerAttribute).toBe(source.meshPerAttribute);
    });

    it("should return a reference to itself", () => {
      const source = new InstancedInterleavedBuffer(new Float32Array([1, 2]), 1);
      const target = new InstancedInterleavedBuffer(new Float32Array([0, 0]), 1);

      const result = target.copy(source);

      expect(result).toBe(target);
    });
  });

  describe("clone()", () => {
    let buffer: InstancedInterleavedBuffer;
    let array: Float32Array;

    beforeEach(() => {
      array = new Float32Array([1, 2, 3, 4, 5, 6]);
      buffer = new InstancedInterleavedBuffer(array, 3, 2);
    });

    it('should return a new InstancedInterleavedBuffer', () => {
      const clone = buffer.clone({}) as InstancedInterleavedBuffer;

      expect(clone).toBeInstanceOf(InstancedInterleavedBuffer);
      expect(clone).not.toBe(buffer); // ensure it is a new object
    });

    it('should copy the array data correctly', () => {
      const clone = buffer.clone({});
      expect(clone.array).not.toBe(buffer.array); // should be a separate array
      expect(clone.array).toEqual(buffer.array);  // values should match
    });

    it('should copy stride correctly', () => {
      const clone = buffer.clone({});
      expect(clone.stride).toBe(buffer.stride);
    });

    it('should copy meshPerAttribute correctly', () => {
      const clone = buffer.clone({}) as InstancedInterleavedBuffer;
      expect(clone.meshPerAttribute).toBe(buffer.meshPerAttribute);
    });

    it('should preserve usage', () => {
      buffer.setUsage(1); // assume 1 is a valid BufferUsage
      const clone = buffer.clone({});
      expect(clone.usage).toBe(buffer.usage);
    });

    it('should generate new buffer UUID in data if not present', () => {
      const data: any = {};
      const clone = buffer.clone(data);

      expect(data.arrayBuffers).toBeDefined();
      const uuidKeys = Object.keys(data.arrayBuffers);
      expect(uuidKeys.length).toBeGreaterThan(0);
      expect(data.arrayBuffers[uuidKeys[0]]).toBeInstanceOf(ArrayBuffer);
    });
  });

  describe("toJSON()", () => {
    it('should serialize to a JSON object', () => {
      const array = new Float32Array([1, 2, 3, 4]);
      const stride = 2;
      const meshPerAttribute = 3;

      const buffer = new InstancedInterleavedBuffer(array, stride, meshPerAttribute);

      const json = buffer.toJSON();

      // It should return an object
      expect(typeof json).toBe('object');

      // It should include parent properties from InterleavedBuffer.toJSON
      expect(json).toHaveProperty('uuid', buffer.uuid);
      expect(json).toHaveProperty('buffer', buffer.array.buffer._uuid);
      expect(json).toHaveProperty('type', buffer.array.constructor.name);
      expect(json).toHaveProperty('stride', stride);

      // It should include subclass properties
      expect(json).toHaveProperty('isInstancedInterleavedBuffer', true);
      expect(json).toHaveProperty('meshPerAttribute', meshPerAttribute);
    });

    it('should accept an optional data object', () => {
      const array = new Float32Array([5, 6, 7, 8]);
      const buffer = new InstancedInterleavedBuffer(array, 2, 2);

      const data = { arrayBuffers: {} };
      const json = buffer.toJSON(data);

      expect(json).toHaveProperty('uuid', buffer.uuid);
      expect(json).toHaveProperty('buffer', buffer.array.buffer._uuid);
      // expect(data.arrayBuffers).toHaveProperty(buffer.array.buffer._uuid);
    });
  });
});
