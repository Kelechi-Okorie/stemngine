import { describe, it, expect } from 'vitest';
import { InterleavedBuffer } from '../../../src/core/InterleavedBuffer';
import { BufferUsage, BufferViewWithUUID, DynamicDrawUsage, StaticDrawUsage, StreamDrawUsage } from '../../../src/constants';

describe('InterleavedBuffer', () => {
  describe('constructor', () => {
    it('should create an instance with the given typed array and stride', () => {
      const array = new Float32Array([1, 2, 3, 4, 5, 6]);
      const stride = 3;

      const buffer = new InterleavedBuffer(array, stride);

      expect(buffer).toBeInstanceOf(InterleavedBuffer);
      expect(buffer.array).toBe(array); // same reference
      expect(buffer.stride).toBe(stride);
      expect(buffer.count).toBe(array.length / stride);
      expect(buffer.isInterleavedBuffer).toBe(true);
      expect(buffer.type).toBe('InterleavedBuffer');
      expect(buffer.usage).toBe(StaticDrawUsage);
      expect(buffer.updateRanges).toEqual([]);
      expect(buffer.version).toBe(0);
      expect(buffer.name).toBe('');
      expect(typeof buffer.uuid).toBe('string');
    });

    it('should calculate count correctly for non-divisible length', () => {
      const array = new Float32Array([1, 2, 3, 4, 5]);
      const stride = 2;

      const buffer = new InterleavedBuffer(array, stride);

      expect(buffer.count).toBe(array.length / stride); // 5/2 = 2.5
    });
  });

  describe('needsUpdate()', () => {
    it('should increment version when needsUpdate is set to true', () => {
      const array = new Float32Array([1, 2, 3]);
      const buffer = new InterleavedBuffer(array, 3);

      const initialVersion = buffer.version;

      buffer.needsUpdate = true;

      expect(buffer.version).toBe(initialVersion + 1);
    });

    it('should not change version when needsUpdate is set to false', () => {
      const array = new Float32Array([1, 2, 3]);
      const buffer = new InterleavedBuffer(array, 3);

      const initialVersion = buffer.version;

      buffer.needsUpdate = false;

      expect(buffer.version).toBe(initialVersion);
    });

    it('should increment version multiple times if set to true repeatedly', () => {
      const array = new Float32Array([1, 2, 3]);
      const buffer = new InterleavedBuffer(array, 3);

      buffer.needsUpdate = true;
      buffer.needsUpdate = true;
      buffer.needsUpdate = true;

      expect(buffer.version).toBe(3);
    });
  });

  describe('setUsage()', () => {
    it('should set the usage and return the instance', () => {
      const array = new Float32Array([1, 2, 3]);
      const buffer = new InterleavedBuffer(array, 3);

      const result = buffer.setUsage(DynamicDrawUsage);

      expect(buffer.usage).toBe(DynamicDrawUsage);
      expect(result).toBe(buffer); // method should return "this"
    });

    it('should overwrite the previous usage', () => {
      const array = new Float32Array([1, 2, 3]);
      const buffer = new InterleavedBuffer(array, 3);

      expect(buffer.usage).toBe(StaticDrawUsage); // default

      buffer.setUsage(StreamDrawUsage);

      expect(buffer.usage).toBe(StreamDrawUsage);
    });
  });

  describe('addUpdateRange()', () => {
    it('should add a new update range to the updateRanges array', () => {
      const array = new Float32Array([1, 2, 3, 4, 5, 6]);
      const buffer = new InterleavedBuffer(array, 3);

      expect(buffer.updateRanges).toEqual([]);

      buffer.addUpdateRange(0, 3);

      expect(buffer.updateRanges).toHaveLength(1);
      expect(buffer.updateRanges[0]).toEqual({ offset: 0, count: 3 });

      buffer.addUpdateRange(3, 3);

      expect(buffer.updateRanges).toHaveLength(2);
      expect(buffer.updateRanges[1]).toEqual({ offset: 3, count: 3 });
    });
  });

  describe('clearUpdateRanges()', () => {
    it('should clear all update ranges from the updateRanges array', () => {
      const array = new Float32Array([1, 2, 3, 4, 5, 6]);
      const buffer = new InterleavedBuffer(array, 3);

      // Add some ranges first
      buffer.addUpdateRange(0, 3);
      buffer.addUpdateRange(3, 3);
      expect(buffer.updateRanges).toHaveLength(2);

      // Clear ranges
      buffer.clearUpdateRanges();
      expect(buffer.updateRanges).toHaveLength(0);
      expect(buffer.updateRanges).toEqual([]);
    });
  });

  describe('copy()', () => {
    it('should copy all properties from the source buffer', () => {
      const sourceArray = new Float32Array([1, 2, 3, 4, 5, 6]);
      const sourceBuffer = new InterleavedBuffer(sourceArray, 3);
      sourceBuffer.setUsage(StaticDrawUsage);

      const targetArray = new Float32Array([0, 0, 0, 0, 0, 0]);
      const targetBuffer = new InterleavedBuffer(targetArray, 1);

      const returned = targetBuffer.copy(sourceBuffer);

      // Check that it returns itself
      expect(returned).toBe(targetBuffer);

      // Check that properties were copied
      expect(targetBuffer.array).toBe(sourceBuffer.array);
      expect(targetBuffer.stride).toBe(sourceBuffer.stride);
      expect(targetBuffer.count).toBe(sourceBuffer.count);
      expect(targetBuffer.usage).toBe(sourceBuffer.usage);
    });
  });

  describe('copyAt()', () => {
    it('should copy a vector from the source buffer to the target buffer at given indices', () => {
      const sourceArray = new Float32Array([10, 20, 30, 40, 50, 60]);
      const sourceBuffer = new InterleavedBuffer(sourceArray, 3); // stride = 3

      const targetArray = new Float32Array([0, 0, 0, 0, 0, 0]);
      const targetBuffer = new InterleavedBuffer(targetArray, 3);

      // Copy first vector (index 0) from source to target at index 1
      const returned = targetBuffer.copyAt(1, sourceBuffer, 0);

      // Verify it returns itself
      expect(returned).toBe(targetBuffer);

      // Check that the copied vector is in the correct place
      expect(targetBuffer.array[3]).toBe(10); // index 1 * stride = 3
      expect(targetBuffer.array[4]).toBe(20);
      expect(targetBuffer.array[5]).toBe(30);

      // The rest of the target array should remain unchanged
      expect(targetBuffer.array[0]).toBe(0);
      expect(targetBuffer.array[1]).toBe(0);
      expect(targetBuffer.array[2]).toBe(0);
    });

    it('should copy multiple vectors correctly when indices are different', () => {
      const sourceArray = new Float32Array([1, 2, 3, 4, 5, 6]);
      const sourceBuffer = new InterleavedBuffer(sourceArray, 3);

      const targetArray = new Float32Array([0, 0, 0, 0, 0, 0]);
      const targetBuffer = new InterleavedBuffer(targetArray, 3);

      // Copy second vector (index 1) from source to first vector (index 0) in target
      targetBuffer.copyAt(0, sourceBuffer, 1);

      expect(targetBuffer.array[0]).toBe(4);
      expect(targetBuffer.array[1]).toBe(5);
      expect(targetBuffer.array[2]).toBe(6);

      // The rest of the target array should remain unchanged
      expect(targetBuffer.array[3]).toBe(0);
      expect(targetBuffer.array[4]).toBe(0);
      expect(targetBuffer.array[5]).toBe(0);
    });
  });

  describe('set()', () => {
    it('should set the given array data starting at offset 0 by default', () => {
      const bufferArray = new Float32Array([0, 0, 0, 0, 0, 0]);
      const buffer = new InterleavedBuffer(bufferArray, 3);

      const newData = new Float32Array([1, 2, 3]);
      const returned = buffer.set(newData);

      // Should return itself
      expect(returned).toBe(buffer);

      // First 3 elements should be updated
      expect(buffer.array[0]).toBe(1);
      expect(buffer.array[1]).toBe(2);
      expect(buffer.array[2]).toBe(3);

      // Remaining elements should remain unchanged
      expect(buffer.array[3]).toBe(0);
      expect(buffer.array[4]).toBe(0);
      expect(buffer.array[5]).toBe(0);
    });

    it('should set the given array data at a specified offset', () => {
      const bufferArray = new Float32Array([0, 0, 0, 0, 0, 0]);
      const buffer = new InterleavedBuffer(bufferArray, 3);

      const newData = new Float32Array([7, 8, 9]);
      buffer.set(newData, 3);

      // First 3 elements should remain unchanged
      expect(buffer.array[0]).toBe(0);
      expect(buffer.array[1]).toBe(0);
      expect(buffer.array[2]).toBe(0);

      // Elements starting at offset 3 should be updated
      expect(buffer.array[3]).toBe(7);
      expect(buffer.array[4]).toBe(8);
      expect(buffer.array[5]).toBe(9);
    });

    it('should overwrite existing values when using set', () => {
      const bufferArray = new Float32Array([5, 5, 5, 5, 5, 5]);
      const buffer = new InterleavedBuffer(bufferArray, 3);

      const newData = new Float32Array([1, 2, 3]);
      buffer.set(newData, 0);

      expect(buffer.array[0]).toBe(1);
      expect(buffer.array[1]).toBe(2);
      expect(buffer.array[2]).toBe(3);
      expect(buffer.array[3]).toBe(5); // untouched
      expect(buffer.array[4]).toBe(5);
      expect(buffer.array[5]).toBe(5);
    });
  });

  describe('clone()', () => {
    it('should create a new InterleavedBuffer with copied values', () => {
      const array = new Float32Array([1, 2, 3, 4, 5, 6]);
      const buffer = new InterleavedBuffer(array, 3);

      const data: any = {};
      const cloned = buffer.clone(data);

      expect(cloned).not.toBe(buffer); // different instance
      expect(cloned).toBeInstanceOf(InterleavedBuffer);

      expect(cloned.stride).toBe(buffer.stride);
      expect(cloned.usage).toBe(buffer.usage);

      // The arrays should have the same values but be different instances
      expect(cloned.array).not.toBe(buffer.array);
      expect(Array.from(cloned.array)).toEqual(Array.from(buffer.array));
    });

    it('should generate a _uuid for the buffer if missing', () => {
      const array = new Float32Array([1, 2, 3]) as BufferViewWithUUID;
      const buffer = new InterleavedBuffer(array, 3);

      const data: any = {};
      expect(array.buffer._uuid).toBeUndefined();

      buffer.clone(data);

      expect(array.buffer._uuid).toBeDefined();
      expect(typeof array.buffer._uuid).toBe('string');
    });

    it('should store the array buffer in data.arrayBuffers if not present', () => {
      const array = new Float32Array([1, 2, 3]) as BufferViewWithUUID;
      const buffer = new InterleavedBuffer(array, 3);

      const data: any = {};
      const cloned = buffer.clone(data);

      const uuid = array.buffer._uuid!;
      expect(data.arrayBuffers[uuid]).toBeDefined();
      expect(data.arrayBuffers[uuid]).toBeInstanceOf(ArrayBuffer);

      // Values stored in the buffer should match the original
      const storedArray = new Uint32Array(data.arrayBuffers[uuid]);
      const originalArray = new Uint32Array(array.buffer);
      expect(Array.from(storedArray)).toEqual(Array.from(originalArray));
    });

    it('should reuse the buffer if already present in data.arrayBuffers', () => {
      const array = new Float32Array([7, 8, 9]) as BufferViewWithUUID;
      const buffer = new InterleavedBuffer(array, 3);

      const data: { arrayBuffers: Record<string, ArrayBuffer> } = { arrayBuffers: {} };
      array.buffer._uuid = 'existing-uuid';
      data.arrayBuffers[array.buffer._uuid] = array.slice(0).buffer;

      const cloned = buffer.clone(data);

      expect(cloned.array).not.toBe(buffer.array); // new typed array instance
      expect(Array.from(cloned.array)).toEqual(Array.from(array));
    });

    it('should copy the usage from the original buffer', () => {
      const array = new Float32Array([1, 2, 3]) as BufferViewWithUUID;
      const buffer = new InterleavedBuffer(array, 3);
      buffer.setUsage(2); // some usage

      const data: any = {};
      const cloned = buffer.clone(data);

      expect(cloned.usage).toBe(buffer.usage);
    });
  });

  describe('toJSON()', () => {
    it('should return a JSON object with uuid, buffer, type, and stride', () => {
      const array = new Float32Array([1, 2, 3]) as BufferViewWithUUID;
      const buffer = new InterleavedBuffer(array, 3);

      const json = buffer.toJSON({});

      expect(json).toHaveProperty('uuid', buffer.uuid);
      expect(json).toHaveProperty('buffer');
      expect(json).toHaveProperty('type', 'Float32Array');
      expect(json).toHaveProperty('stride', buffer.stride);
    });

    it('should generate a _uuid for the buffer if missing', () => {
      const array = new Float32Array([1, 2, 3]) as BufferViewWithUUID;
      const buffer = new InterleavedBuffer(array, 3);

      expect(array.buffer._uuid).toBeUndefined();

      buffer.toJSON({});

      expect(array.buffer._uuid).toBeDefined();
      expect(typeof array.buffer._uuid).toBe('string');
    });

    it('should store the typed array values in data.arrayBuffers if not already present', () => {
      const array = new Float32Array([1, 2, 3]) as BufferViewWithUUID;
      const buffer = new InterleavedBuffer(array, 3);

      const data: { arrayBuffers?: Record<string, number[]> } = {};
      const json = buffer.toJSON(data);

      const uuid = array.buffer._uuid!;
      expect(data.arrayBuffers![uuid]).toBeDefined();
      expect(Array.isArray(data.arrayBuffers![uuid])).toBe(true);

      // The values in the stored buffer should match the array
      const storedArray = data.arrayBuffers![uuid];
      expect(storedArray).toEqual(Array.from(new Uint32Array(array.buffer)));
    });

    it('should not overwrite existing arrayBuffers in data', () => {
      const array = new Float32Array([4, 5, 6]) as BufferViewWithUUID;
      const buffer = new InterleavedBuffer(array, 3);

      const data: { arrayBuffers?: Record<string, number[]> } = { arrayBuffers: {} };
      const uuid = 'existing-uuid';
      array.buffer._uuid = uuid;
      data.arrayBuffers![uuid]= [99, 100, 101]; // existing data

      const json = buffer.toJSON(data);

      expect(data.arrayBuffers![uuid]).toEqual([99, 100, 101]); // should remain unchanged
      expect(json.buffer).toBe(uuid);
    });

    it('should work with empty data parameter', () => {
      const array = new Float32Array([7, 8, 9]) as BufferViewWithUUID;
      const buffer = new InterleavedBuffer(array, 3);

      const json = buffer.toJSON({});

      expect(json).toHaveProperty('uuid', buffer.uuid);
      expect(json).toHaveProperty('stride', buffer.stride);
      expect(json).toHaveProperty('type', 'Float32Array');
      expect(json.buffer).toBeDefined();
    });
  });
});
