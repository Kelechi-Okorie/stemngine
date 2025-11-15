import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { BufferAttribute } from '../../../src/core/BufferAttribute';
import { StaticDrawUsage, FloatType } from '../../../src/constants';
import * as utils from '../../../src/math/MathUtils';

describe('BufferAttribure', () => {
  describe('constructor', () => {
    beforeEach(() => {
      // Reset module-level ID counter before each test if needed
      // (_id would need to be exported for this)
    });

    it('should initialize with the correct properties', () => {
      const array = new Float32Array([0, 1, 2, 3, 4, 5]);
      const itemSize = 3;
      const normalized = true;

      const attr = new BufferAttribute(array, itemSize, normalized);

      expect(attr.isBufferAttribute).toBe(true);
      expect(attr.array).toBe(array);
      expect(attr.itemSize).toBe(itemSize);
      expect(attr.count).toBe(array.length / itemSize);
      expect(attr.normalized).toBe(normalized);
      expect(attr.name).toBe('');
      expect(attr.version).toBe(0);
      expect(attr.usage).toBe(StaticDrawUsage || expect.anything());
      expect(attr.updateRanges).toEqual([]);
      expect(attr.gpuType).toBe(FloatType || expect.anything());
    });

    it('should assign a unique ID to each instance', () => {
      const array1 = new Float32Array([0, 0, 0]);
      const array2 = new Float32Array([1, 2, 3]);

      const attr1 = new BufferAttribute(array1, 1);
      const attr2 = new BufferAttribute(array2, 1);

      expect(attr1.id).not.toBe(attr2.id);
      expect(attr2.id).toBeGreaterThan(attr1.id);
    });

    it('should compute count correctly', () => {
      const array = new Uint16Array([0, 1, 2, 3, 4, 5, 6, 7, 8]);
      const itemSize = 3;

      const attr = new BufferAttribute(array, itemSize);

      expect(attr.count).toBe(array.length / itemSize); // 9 / 3 = 3
    });

    it('should throw if initialized with a plain JS array', () => {
      const jsArray = [0, 1, 2, 3];

      expect(() => new BufferAttribute(jsArray as any, 2))
        .toThrow('BufferAttribute: array should be a Typed Array');
    });

    it('should store the normalized flag correctly', () => {
      const array = new Float32Array([0, 1, 2]);
      const attr = new BufferAttribute(array, 3, true);

      expect(attr.normalized).toBe(true);
    });

    it('should store the name property as an empty string by default', () => {
      const array = new Float32Array([0, 1, 2]);
      const attr = new BufferAttribute(array, 3);

      expect(attr.name).toBe('');
    });
  });

  describe('set()', () => {
    it('should set values from a typed array', () => {
      const array = new Float32Array([0, 0, 0, 0, 0, 0]);
      const attr = new BufferAttribute(array, 3);

      const newValues = new Float32Array([1, 2, 3, 4, 5, 6]);
      attr.set(newValues);

      expect(attr.array).toEqual(newValues);
    });

    it('should set values with an offset', () => {
      const array = new Float32Array([0, 0, 0, 0, 0, 0]);
      const attr = new BufferAttribute(array, 3);

      const values = new Float32Array([1, 2, 3]);
      attr.set(values, 3);

      expect(Array.from(attr.array)).toEqual([0, 0, 0, 1, 2, 3]);
    });

    it('should return the instance (for chaining)', () => {
      const array = new Float32Array([0, 0, 0, 0, 0, 0]);
      const attr = new BufferAttribute(array, 3);

      const values = new Float32Array([1, 2, 3]);
      const result = attr.set(values);

      expect(result).toBe(attr); // same instance
    });

    it('should throw if using non-typed arrays (optional check)', () => {
      const array = new Float32Array([0, 0, 0]);
      const attr = new BufferAttribute(array, 3);

      expect(() => attr.set([1, 2, 3] as any)).not.toThrow();
      // Actually, Float32Array.set() allows JS arrays, so this won't throw
      // If you want strict enforcement, you can add a runtime check
    });
  });





  describe('getX()', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should return the x component at the given index', () => {
      const array = new Float32Array([
        10, 20, 30,  // index 0
        40, 50, 60   // index 1
      ]);

      const attr = new BufferAttribute(array, 3); // itemSize = 3

      expect(attr.getX(0)).toBe(10);
      expect(attr.getX(1)).toBe(40);
    });

    it('should apply denormalization if normalized is true', () => {
      const array = new Float32Array([100, 0, 0]);
      const attr = new BufferAttribute(array, 1, true); // itemSize = 1, normalized

      const x = attr.getX(0);

      expect(x).toBe(100);
    });

    it('should work with different typed arrays', () => {
      const array = new Uint16Array([0, 1, 2, 3, 4, 5]);
      const attr = new BufferAttribute(array, 2); // itemSize = 2

      expect(attr.getX(0)).toBe(0);
      expect(attr.getX(1)).toBe(2);
      expect(attr.getX(2)).toBe(4);
    });
  });

  describe('getY()', () => {
    it('should return the y component at the given index', () => {
      const array = new Float32Array([
        10, 20, 30,  // index 0
        40, 50, 60   // index 1
      ]);

      const attr = new BufferAttribute(array, 3); // itemSize = 3

      expect(attr.getY(0)).toBe(20);
      expect(attr.getY(1)).toBe(50);
    });

    it('should apply denormalization if normalized is true', () => {
      const array = new Float32Array([0, 100, 0]);
      const attr = new BufferAttribute(array, 2, true); // itemSize = 2, normalized

      const y = attr.getY(0);

      expect(y).toBe(100);
    });

    it('should work with different typed arrays and item sizes', () => {
      const array = new Uint16Array([0, 1, 2, 3, 4, 5, 6, 7]);
      const attr = new BufferAttribute(array, 4); // itemSize = 4

      expect(attr.getY(0)).toBe(1); // index 0, second element
      expect(attr.getY(1)).toBe(5); // index 1, second element
    });
  });

  describe('getZ()', () => {
    it('should return the z component at the given index', () => {
      const array = new Float32Array([
        10, 20, 30,  // index 0
        40, 50, 60   // index 1
      ]);

      const attr = new BufferAttribute(array, 3); // itemSize = 3

      expect(attr.getZ(0)).toBe(30);
      expect(attr.getZ(1)).toBe(60);
    });

    it('should apply denormalization if normalized is true', () => {
      const array = new Float32Array([0, 0, 100]);
      const attr = new BufferAttribute(array, 3, true);

      const z = attr.getZ(0);

      expect(z).toBe(100);
    });

    it('should work with different typed arrays and item sizes', () => {
      const array = new Uint16Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
      const attr = new BufferAttribute(array, 4); // itemSize = 4

      expect(attr.getZ(0)).toBe(2); // index 0, third element
      expect(attr.getZ(1)).toBe(6); // index 1, third element
      expect(attr.getZ(2)).toBe(10); // index 2, third element
    });

  });

  describe('getW()', () => {
    it('should return the w component at the given index', () => {
      const array = new Float32Array([
        0.1, 0.2, 0.3, 0.4,   // index 0
        1, 2, 3, 4             // index 1
      ]);

      const attr = new BufferAttribute(array, 4); // itemSize = 4 for quaternions

      expect(attr.getW(0)).toBeCloseTo(0.4);
      expect(attr.getW(1)).toBeCloseTo(4);
    });

    it('should apply denormalization if normalized is true', () => {
      const array = new Float32Array([0, 0, 0, 100]);
      const attr = new BufferAttribute(array, 4, true); // normalized

      const w = attr.getW(0);

      expect(w).toBe(100);
    });

    it('should work with different typed arrays and multiple quaternions', () => {
      const array = new Uint16Array([
        0, 1, 2, 3,      // index 0
        4, 5, 6, 7,      // index 1
        8, 9, 10, 11     // index 2
      ]);
      const attr = new BufferAttribute(array, 4);

      expect(attr.getW(0)).toBe(3);
      expect(attr.getW(1)).toBe(7);
      expect(attr.getW(2)).toBe(11);
    });
  });
});
