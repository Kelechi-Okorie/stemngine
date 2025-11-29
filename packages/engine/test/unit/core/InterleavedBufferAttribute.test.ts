import { describe, it, expect, vi, beforeEach } from "vitest";
import { InterleavedBufferAttribute } from "../../../src/core/InterleavedBufferAttribute";
import { InterleavedBuffer } from "../../../src/core/InterleavedBuffer";
import { StaticDrawUsage, BufferViewWithUUID } from "../../../src/constants";
import { AnyTypedArray } from "../../../src/constants";
import { normalize, denormalize } from "../../../src/math/MathUtils";
import * as MathUtils from "../../../src/math/MathUtils";
import { Matrix4 } from "../../../src/math/Matrix4";
import { Matrix3 } from "../../../src/math/Matrix3";
import { BufferAttribute } from "../../../src/core/BufferAttribute";

// Fake InterleavedBuffer helper
function makeInterleavedBuffer(array: any, stride: number) {
  return new InterleavedBuffer(array, stride);
}

describe('InterleavedBufferAttribute', () => {
  describe('constructor()', () => {
    it('should create an instance with the given typed array and stride', () => {
      const array = new Float32Array([1, 2, 3, 4, 5, 6]);
      const stride = 3;
      const buffer = new InterleavedBuffer(array, stride);

      expect(buffer).toBeInstanceOf(InterleavedBuffer);
      expect(buffer.isInterleavedBuffer).toBe(true);
      expect(buffer.array).toBe(array);
      expect(buffer.stride).toBe(stride);
      expect(buffer.count).toBe(array.length / stride);
      expect(buffer.usage).toBe(StaticDrawUsage);
      expect(buffer.updateRanges).toEqual([]);
      expect(buffer.version).toBe(0);
      expect(typeof buffer.uuid).toBe('string');
      expect(buffer.uuid.length).toBeGreaterThan(0);
    });

    it('should calculate count correctly even if array length is not divisible by stride', () => {
      const array = new Float32Array([1, 2, 3, 4, 5]);
      const stride = 2;
      const buffer = new InterleavedBuffer(array, stride);

      expect(buffer.count).toBe(array.length / stride); // 5 / 2 = 2.5
    });

    it('should default usage to StaticDrawUsage if not provided', () => {
      const array = new Float32Array([1, 2, 3]);
      const buffer = new InterleavedBuffer(array, 1);

      expect(buffer.usage).toBe(StaticDrawUsage);
    });

    it('should generate a uuid for the buffer', () => {
      const array = new Float32Array([1, 2, 3]);
      const buffer = new InterleavedBuffer(array, 1);

      expect(typeof buffer.uuid).toBe('string');
      expect(buffer.uuid).toHaveLength(36); // typical UUID length
    });
  });

  describe('get count()', () => {
    it('should return the count from the underlying data', () => {
      const mockData = { count: 42 };
      const attribute = {
        data: mockData,
        get count() {
          return this.data.count;
        }
      } as { data: { count: number }; count: number };

      expect(attribute.count).toBe(42);

      // Update underlying count
      mockData.count = 10;
      expect(attribute.count).toBe(10);
    });

    it('should reflect changes in the underlying data', () => {
      const mockData = { count: 0 };
      const attribute = {
        data: mockData,
        get count() {
          return this.data.count;
        }
      } as { data: { count: number }; count: number };

      expect(attribute.count).toBe(0);

      mockData.count = 5;
      expect(attribute.count).toBe(5);
    });
  });

  describe('get array()', () => {
    it('should return the underlying array from data', () => {
      const typedArray = new Float32Array([1, 2, 3]);
      const mockData = { array: typedArray };
      const attribute = {
        data: mockData,
        get array() {
          return this.data.array;
        }
      } as { data: { array: AnyTypedArray }; array: AnyTypedArray };

      expect(attribute.array).toBe(typedArray); // should return the exact same instance
    });

    it('should reflect changes in the underlying array', () => {
      const typedArray = new Float32Array([1, 2, 3]);
      const newArray = new Float32Array([4, 5, 6]);
      const mockData = { array: typedArray };
      const attribute = {
        data: mockData,
        get array() {
          return this.data.array;
        }
      } as { data: { array: AnyTypedArray }; array: AnyTypedArray };

      expect(attribute.array).toBe(typedArray);

      // Update the underlying array
      mockData.array = newArray;
      expect(attribute.array).toBe(newArray);
    });
  });

  describe('set needsUpdate()', () => {
    it('should forward the value to data.needsUpdate', () => {
      const mockData = { needsUpdate: false };
      const attribute = {
        data: mockData,
        set needsUpdate(value: boolean) {
          this.data.needsUpdate = value;
        }
      } as { data: { needsUpdate: boolean }; needsUpdate: boolean };

      expect(mockData.needsUpdate).toBe(false);

      attribute.needsUpdate = true;
      expect(mockData.needsUpdate).toBe(true);

      attribute.needsUpdate = false;
      expect(mockData.needsUpdate).toBe(false);
    });

    it('should not modify data.needsUpdate if set to the same value', () => {
      const mockData = { needsUpdate: false };
      const attribute = {
        data: mockData,
        set needsUpdate(value: boolean) {
          this.data.needsUpdate = value;
        }
      } as { data: { needsUpdate: boolean }; needsUpdate: boolean };

      attribute.needsUpdate = false;
      expect(mockData.needsUpdate).toBe(false);
    });
  });

  describe('getComponent()', () => {
    it('should return the correct raw component when normalized = false', () => {
      const array = new Float32Array([
        1, 2, 3,   // vertex 0
        4, 5, 6    // vertex 1
      ]);
      const buffer = new InterleavedBuffer(array, 3);
      const attr = new InterleavedBufferAttribute(buffer, 3, 0, false);

      expect(attr.getComponent(0, 0)).toBe(1);
      expect(attr.getComponent(0, 1)).toBe(2);
      expect(attr.getComponent(0, 2)).toBe(3);

      expect(attr.getComponent(1, 0)).toBe(4);
      expect(attr.getComponent(1, 1)).toBe(5);
      expect(attr.getComponent(1, 2)).toBe(6);
    });

    it('should respect offset and stride', () => {
      const array = new Float32Array([
        10, 11, 12, 99,  // vertex 0 (value=99 is junk)
        20, 21, 22, 98   // vertex 1 (value=98 is junk)
      ]);
      const buffer = new InterleavedBuffer(array, 4);
      const attr = new InterleavedBufferAttribute(buffer, 3, 0, false);

      expect(attr.getComponent(0, 0)).toBe(10);
      expect(attr.getComponent(0, 1)).toBe(11);
      expect(attr.getComponent(0, 2)).toBe(12);

      expect(attr.getComponent(1, 0)).toBe(20);
      expect(attr.getComponent(1, 1)).toBe(21);
      expect(attr.getComponent(1, 2)).toBe(22);
    });

    it('should apply denormalize() when normalized = true (Uint8Array example)', () => {
      const array = new Uint8Array([0, 127, 255]);
      const buffer = new InterleavedBuffer(array, 3);
      const attr = new InterleavedBufferAttribute(buffer, 3, 0, true);

      expect(attr.getComponent(0, 0)).toBeCloseTo(0);
      expect(attr.getComponent(0, 1)).toBeCloseTo(127 / 255);
      expect(attr.getComponent(0, 2)).toBeCloseTo(1);
    });

    describe('should denormalize correctly by typed array type', () => {

      it('Float32Array → no change', () => {
        const array = new Float32Array([0.5]);
        const buffer = new InterleavedBuffer(array, 1);
        const attr = new InterleavedBufferAttribute(buffer, 1, 0, true);

        expect(attr.getComponent(0, 0)).toBe(0.5);
      });

      it('Uint32Array', () => {
        const array = new Uint32Array([2147483647]); // half
        const buffer = new InterleavedBuffer(array, 1);
        const attr = new InterleavedBufferAttribute(buffer, 1, 0, true);

        expect(attr.getComponent(0, 0)).toBeCloseTo(2147483647 / 4294967295);
      });

      it('Uint16Array', () => {
        const array = new Uint16Array([32767]);
        const buffer = new InterleavedBuffer(array, 1);
        const attr = new InterleavedBufferAttribute(buffer, 1, 0, true);

        expect(attr.getComponent(0, 0)).toBeCloseTo(32767 / 65535);
      });

      it('Uint8Array', () => {
        const array = new Uint8Array([128]);
        const buffer = new InterleavedBuffer(array, 1);
        const attr = new InterleavedBufferAttribute(buffer, 1, 0, true);

        expect(attr.getComponent(0, 0)).toBeCloseTo(128 / 255);
      });

      it('Uint8ClampedArray', () => {
        const array = new Uint8ClampedArray([200]);
        const buffer = new InterleavedBuffer(array, 1);
        const attr = new InterleavedBufferAttribute(buffer, 1, 0, true);

        expect(attr.getComponent(0, 0)).toBeCloseTo(200 / 255);
      });

      it('Int32Array', () => {
        const array = new Int32Array([2147483647]);
        const buffer = new InterleavedBuffer(array, 1);
        const attr = new InterleavedBufferAttribute(buffer, 1, 0, true);

        expect(attr.getComponent(0, 0)).toBeCloseTo(1);
      });

      it('Int16Array', () => {
        const array = new Int16Array([16384]);
        const buffer = new InterleavedBuffer(array, 1);
        const attr = new InterleavedBufferAttribute(buffer, 1, 0, true);

        expect(attr.getComponent(0, 0)).toBeCloseTo(16384 / 32767);
      });

      it('Int8Array', () => {
        const array = new Int8Array([63]);
        const buffer = new InterleavedBuffer(array, 1);
        const attr = new InterleavedBufferAttribute(buffer, 1, 0, true);

        expect(attr.getComponent(0, 0)).toBeCloseTo(63 / 127);
      });

    });

    it('throws if array is an unsupported type', () => {
      // Use a fake typed array type to simulate error
      const fakeArray = {
        constructor: class FakeTypedArray { },
        length: 1,
        0: 123
      } as any;

      const buffer = new InterleavedBuffer(fakeArray, 1);
      const attr = new InterleavedBufferAttribute(buffer, 1, 0, true);

      expect(() => attr.getComponent(0, 0)).toThrow();
    });
  });

  describe('setComponent()', () => {
    it("should set the raw value when normalized = false", () => {
      const array = new Float32Array(6); // stride 3, 2 entries
      const ib = new InterleavedBuffer(array, 3);
      const attr = new InterleavedBufferAttribute(ib, 3, 0, false);

      attr.setComponent(0, 1, 42);

      expect(array[1]).toBe(42);
    });

    it("should write to correct index based on stride + offset", () => {
      const array = new Float32Array(9);
      const ib = new InterleavedBuffer(array, 3);

      // offset = 1 means each vector is {x, y, z} but we start at y
      const attr = new InterleavedBufferAttribute(ib, 3, 1, false);

      // index = 1, component = 2 → array[(1 * 3) + 1 + 2] = array[6]
      attr.setComponent(1, 2, 99);

      expect(array[6]).toBe(99);
    });

    it("should apply normalize() when normalized = true", () => {
      const array = new Uint8Array(3);
      const ib = new InterleavedBuffer(array, 3);

      const attr = new InterleavedBufferAttribute(ib, 3, 0, true);

      // Spy on normalize()
      const normalizeSpy = vi.spyOn(MathUtils, "normalize")
        .mockImplementation((v) => v * 2);  // fake transformation

      attr.setComponent(0, 1, 50);

      expect(normalizeSpy).toHaveBeenCalledWith(50, array);
      expect(array[1]).toBe(100); // because of mock: 50 → 100

      normalizeSpy.mockRestore();
    });

    it("should return `this`", () => {
      const array = new Float32Array(3);
      const ib = new InterleavedBuffer(array, 3);

      const attr = new InterleavedBufferAttribute(ib, 3, 0, false);

      const returned = attr.setComponent(0, 0, 123);

      expect(returned).toBe(attr);
    });
  });

  describe('getX()', () => {
    it("returns raw value when not normalized", () => {
      const array = new Float32Array([10, 20, 30, 40]); // stride = 2 → (10,20), (30,40)
      const buffer = makeInterleavedBuffer(array, 2);
      const attr = new InterleavedBufferAttribute(buffer, 2, 0, false);

      // index=1 → array[1*2 + 0] = array[2] = 30
      expect(attr.getX(1)).toBe(30);
    });

    it("uses offset correctly", () => {
      const array = new Float32Array([
        5, 6,   // index0
        7, 8    // index1
      ]);
      const buffer = makeInterleavedBuffer(array, 2);
      const attr = new InterleavedBufferAttribute(buffer, 2, 1, false);

      // index=1 → array[1*2 + offset(1)] = array[3] = 8
      expect(attr.getX(1)).toBe(8);
    });

    it("applies denormalization when normalized=true (Uint8Array)", () => {
      const array = new Uint8Array([0, 128, 255]);
      const buffer = makeInterleavedBuffer(array, 1);
      const attr = new InterleavedBufferAttribute(buffer, 1, 0, true);

      expect(attr.getX(0)).toBe(denormalize(0, array));
      expect(attr.getX(1)).toBe(denormalize(128, array));
      expect(attr.getX(2)).toBe(denormalize(255, array));
    });

    it("denormalizes signed integer types (Int16Array)", () => {
      const array = new Int16Array([-32768, -1000, 0, 32767]);
      const buffer = makeInterleavedBuffer(array, 1);
      const attr = new InterleavedBufferAttribute(buffer, 1, 0, true);

      expect(attr.getX(0)).toBe(denormalize(-32768, array)); // clamps to -1
      expect(attr.getX(1)).toBe(denormalize(-1000, array));
      expect(attr.getX(2)).toBe(denormalize(0, array));
      expect(attr.getX(3)).toBe(denormalize(32767, array));
    });

    it("works correctly with stride > 1", () => {
      const array = new Float32Array([
        1, 2, 3,     // index 0 → x=1
        4, 5, 6,     // index 1 → x=4
        7, 8, 9      // index 2 → x=7
      ]);

      const buffer = makeInterleavedBuffer(array, 3);
      const attr = new InterleavedBufferAttribute(buffer, 3, 0, false);

      expect(attr.getX(0)).toBe(1);
      expect(attr.getX(1)).toBe(4);
      expect(attr.getX(2)).toBe(7);
    });

    it("works with stride + offset together", () => {
      const array = new Float32Array([
        10, 11, 12,    // index0
        20, 21, 22,    // index1
        30, 31, 32     // index2
      ]);

      const buffer = makeInterleavedBuffer(array, 3);
      const attr = new InterleavedBufferAttribute(buffer, 3, 1, false);

      // offset = 1 → x = element 1 of each triple
      expect(attr.getX(0)).toBe(11);
      expect(attr.getX(1)).toBe(21);
      expect(attr.getX(2)).toBe(31);
    });

    it("denormalizes correctly even with stride + offset", () => {
      const array = new Uint8Array([
        0, 127, 255,    // index0
        64, 100, 200    // index1
      ]);

      const buffer = makeInterleavedBuffer(array, 3);
      const attr = new InterleavedBufferAttribute(buffer, 3, 2, true);

      // offset = 2 → take the 3rd component of each block
      expect(attr.getX(0)).toBe(denormalize(255, array));
      expect(attr.getX(1)).toBe(denormalize(200, array));
    });

  });

  describe('setX()', () => {
    it("sets X without normalization", () => {
      const array = new Float32Array([0, 0, 0, 0, 0, 0]);
      const ib = new InterleavedBuffer(array, 3);
      const attr = new InterleavedBufferAttribute(
        ib,
        1,
        0,
        false // normalized = false
      );

      attr.SetX(1, 42);

      // index=1 → position = 1*3 + 0 = 3
      expect(array[3]).toBe(42);
    });

    it("sets X with normalization", () => {
      const array = new Uint8Array([0, 0, 0, 0, 0, 0]);
      const ib = new InterleavedBuffer(array, 3);
      const attr = new InterleavedBufferAttribute(
        ib,
        1,
        0,
        true // normalized = true
      );

      attr.SetX(0, 127 / 255); // middle of 0-255

      // normalization: 127 / 255 = ~0.498
      expect(attr.getX(0)).toBeCloseTo(127 / 255, 5);
    });

    it("respects stride and offset", () => {
      const array = new Float32Array([1, 2, 3, 4, 5, 6]);
      const ib = new InterleavedBuffer(array, 3);
      const attr = new InterleavedBufferAttribute(
        ib,
        2, // offset = component index 2
        2,
        false
      );

      attr.SetX(1, 99);

      // index 1 → 1*3 + offset 2 = 5
      expect(array[5]).toBe(99);
    });

    it("returns 'this' for chaining", () => {
      const array = new Float32Array(6);
      const ib = new InterleavedBuffer(array, 3);
      const attr = new InterleavedBufferAttribute(
        ib,
        1,
        0,
        false
      );

      const out = attr.SetX(0, 10);

      expect(out).toBe(attr);
    });

    it("sets X at final valid index correctly", () => {
      const array = new Float32Array([0, 0, 0, 0, 0, 0]);
      const ib = new InterleavedBuffer(array, 3);
      const attr = new InterleavedBufferAttribute(
        ib,
        1,
        0,
        false
      );

      attr.SetX(1, 7);

      expect(array[3]).toBe(7);
    });
  });

  describe('getY()', () => {
    it("gets Y without normalization", () => {
      const array = new Float32Array([0, 1, 2, 3, 4, 5]);
      const ib = new InterleavedBuffer(array, 3);
      const attr = new InterleavedBufferAttribute(ib, 1, 0, false);

      // index=0 → position = 0*3 + 0 + 1 = 1
      // index=1 → position = 1*3 + 0 + 1 = 4
      expect(attr.getY(0)).toBe(1);
      expect(attr.getY(1)).toBe(4);
    });

    it("gets Y with normalization", () => {
      const array = new Uint8Array([0, 127, 255, 64, 128, 192]);
      const ib = new InterleavedBuffer(array, 3);
      const attr = new InterleavedBufferAttribute(ib, 1, 0, true);

      // normalized: 127/255 ≈ 0.498, 128/255 ≈ 0.502
      expect(attr.getY(0)).toBeCloseTo(127 / 255, 5);
      expect(attr.getY(1)).toBeCloseTo(128 / 255, 5);
    });

    it("respects stride and offset", () => {
      const array = new Float32Array([1, 2, 3, 4, 5, 6]);
      const ib = new InterleavedBuffer(array, 3);
      const attr = new InterleavedBufferAttribute(ib, 1, 1, false);

      // index 0 → 0*3 + offset 1 + component 1 = 3? careful
      // getY uses +1 for component, so effective index = index*stride + offset + 1
      // here: 0*3 + 1 + 1 = 2 → array[2] = 3
      // index 1 → 1*3 + 1 + 1 = 5 → array[5] = 6
      expect(attr.getY(0)).toBe(3);
      expect(attr.getY(1)).toBe(6);
    });

    it("gets Y at final valid index correctly", () => {
      const array = new Float32Array([0, 1, 2, 3, 4, 5]);
      const ib = new InterleavedBuffer(array, 3);
      const attr = new InterleavedBufferAttribute(ib, 1, 0, false);

      // last valid index = 1 (count = 2)
      expect(attr.getY(1)).toBe(4);
    });
  });

  describe('setY()', () => {
    it("sets Y without normalization", () => {
      const array = new Float32Array([0, 0, 0, 0, 0, 0]);
      const ib = new InterleavedBuffer(array, 3);
      const attr = new InterleavedBufferAttribute(ib, 1, 0, false);

      attr.setY(1, 42);

      // index 1 → 1*3 + offset 0 + 1 = 4
      expect(array[4]).toBe(42);
    });

    it("sets Y with normalization", () => {
      const array = new Uint8Array([0, 0, 0, 0, 0, 0]);
      const ib = new InterleavedBuffer(array, 3);
      const attr = new InterleavedBufferAttribute(ib, 1, 0, true);

      const yValue = 127 / 255;
      attr.setY(0, yValue);

      // normalized value is stored internally; getY() should denormalize it back
      expect(attr.getY(0)).toBeCloseTo(yValue, 5);
    });

    it("respects stride and offset", () => {
      const array = new Float32Array([1, 2, 3, 4, 5, 6]);
      const ib = new InterleavedBuffer(array, 3);
      const attr = new InterleavedBufferAttribute(ib, 1, 1, false);

      attr.setY(0, 99);
      attr.setY(1, 100);

      // position = index*stride + offset + 1
      // index 0 → 0*3 + 1 + 1 = 2 → array[2] = 99
      // index 1 → 1*3 + 1 + 1 = 5 → array[5] = 100
      expect(array[2]).toBe(99);
      expect(array[5]).toBe(100);
    });

    it("returns 'this' for chaining", () => {
      const array = new Float32Array(6);
      const ib = new InterleavedBuffer(array, 3);
      const attr = new InterleavedBufferAttribute(ib, 1, 0, false);

      const out = attr.setY(0, 10);
      expect(out).toBe(attr);
    });

    it("sets Y at final valid index correctly", () => {
      const array = new Float32Array([0, 0, 0, 0, 0, 0]);
      const ib = new InterleavedBuffer(array, 3);
      const attr = new InterleavedBufferAttribute(ib, 1, 0, false);

      // last valid index = 1 (count = 2)
      attr.setY(1, 77);
      expect(array[4]).toBe(77); // index 1 → 1*3 + offset 0 + 1 = 4
    });
  });

  describe('getZ()', () => {
    it("gets Z without normalization", () => {
      const array = new Float32Array([0, 1, 2, 3, 4, 5]);
      const ib = new InterleavedBuffer(array, 3);
      const attr = new InterleavedBufferAttribute(ib, 1, 0, false);

      // index 0 → 0*3 + 0 + 2 = 2 → array[2] = 2
      // index 1 → 1*3 + 0 + 2 = 5 → array[5] = 5
      expect(attr.getZ(0)).toBe(2);
      expect(attr.getZ(1)).toBe(5);
    });

    it("gets Z with normalization", () => {
      const array = new Uint8Array([0, 0, 127, 64, 128, 192]);
      const ib = new InterleavedBuffer(array, 3);
      const attr = new InterleavedBufferAttribute(ib, 1, 0, true);

      // normalized: 127/255 ≈ 0.498, 192/255 ≈ 0.753
      expect(attr.getZ(0)).toBeCloseTo(127 / 255, 5);
      expect(attr.getZ(1)).toBeCloseTo(192 / 255, 5);
    });

    it("respects stride and offset", () => {
      const array = new Float32Array([1, 2, 3, 4, 5, 6]);
      const ib = new InterleavedBuffer(array, 3);
      const attr = new InterleavedBufferAttribute(ib, 1, 1, false);

      // position = index*stride + offset + 2
      // index 0 → 0*3 + 1 + 2 = 3 → array[3] = 4
      // index 1 → 1*3 + 1 + 2 = 6 → array[6] → out of bounds in this small array, so adjust test array
      const testArray = new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      const ib2 = new InterleavedBuffer(testArray, 3);
      const attr2 = new InterleavedBufferAttribute(ib2, 1, 1, false);

      expect(attr2.getZ(0)).toBe(4);
      expect(attr2.getZ(1)).toBe(7);
    });

    it("gets Z at final valid index correctly", () => {
      const array = new Float32Array([0, 1, 2, 3, 4, 5]);
      const ib = new InterleavedBuffer(array, 3);
      const attr = new InterleavedBufferAttribute(ib, 1, 0, false);

      // last valid index = 1
      expect(attr.getZ(1)).toBe(5); // index 1 → 1*3 + 0 + 2 = 5
    });
  });

  describe('setZ()', () => {
    it("sets Z without normalization", () => {
      const array = new Float32Array([0, 0, 0, 0, 0, 0]);
      const ib = new InterleavedBuffer(array, 3);
      const attr = new InterleavedBufferAttribute(ib, 1, 0, false);

      attr.setZ(1, 42);

      // index 1 → 1*3 + offset 0 + 2 = 5
      expect(array[5]).toBe(42);
    });

    it("sets Z with normalization", () => {
      const array = new Uint8Array([0, 0, 0, 0, 0, 0]);
      const ib = new InterleavedBuffer(array, 3);
      const attr = new InterleavedBufferAttribute(ib, 1, 0, true);

      const zValue = 127 / 255;
      attr.setZ(0, zValue);

      // normalized value is stored internally; getZ() should denormalize it back
      expect(attr.getZ(0)).toBeCloseTo(zValue, 5);
    });

    it("respects stride and offset", () => {
      const array = new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      const ib = new InterleavedBuffer(array, 3);
      const attr = new InterleavedBufferAttribute(ib, 1, 1, false);

      attr.setZ(0, 99);
      attr.setZ(1, 100);

      // index*stride + offset + 2
      // index 0 → 0*3 + 1 + 2 = 3 → array[3] = 99
      // index 1 → 1*3 + 1 + 2 = 6 → array[6] = 100
      expect(array[3]).toBe(99);
      expect(array[6]).toBe(100);
    });

    it("returns 'this' for chaining", () => {
      const array = new Float32Array(6);
      const ib = new InterleavedBuffer(array, 3);
      const attr = new InterleavedBufferAttribute(ib, 1, 0, false);

      const out = attr.setZ(0, 10);
      expect(out).toBe(attr);
    });

    it("sets Z at final valid index correctly", () => {
      const array = new Float32Array([0, 0, 0, 0, 0, 0]);
      const ib = new InterleavedBuffer(array, 3);
      const attr = new InterleavedBufferAttribute(ib, 1, 0, false);

      // last valid index = 1
      attr.setZ(1, 77);
      expect(array[5]).toBe(77); // index 1 → 1*3 + 0 + 2 = 5
    });
  });

  describe('getW()', () => {
    it("gets W without normalization", () => {
      const array = new Float32Array([0, 1, 2, 3, 4, 5, 6, 7]);
      const ib = new InterleavedBuffer(array, 4); // stride = 4
      const attr = new InterleavedBufferAttribute(ib, 1, 0, false);

      // index 0 → 0*4 + 0 + 3 = 3 → array[3] = 3
      // index 1 → 1*4 + 0 + 3 = 7 → array[7] = 7
      expect(attr.getW(0)).toBe(3);
      expect(attr.getW(1)).toBe(7);
    });

    it("gets W with normalization", () => {
      const array = new Uint8Array([0, 0, 0, 127, 64, 64, 64, 255]);
      const ib = new InterleavedBuffer(array, 4);
      const attr = new InterleavedBufferAttribute(ib, 1, 0, true);

      // normalized: 127/255 ≈ 0.498, 255/255 = 1
      expect(attr.getW(0)).toBeCloseTo(127 / 255, 5);
      expect(attr.getW(1)).toBeCloseTo(255 / 255, 5);
    });

    it("respects stride and offset", () => {
      const array = new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
      const ib = new InterleavedBuffer(array, 4);
      const attr = new InterleavedBufferAttribute(ib, 1, 1, false);

      // index*stride + offset + 3
      // index 0 → 0*4 + 1 + 3 = 4 → array[4] = 5
      // index 1 → 1*4 + 1 + 3 = 8 → array[8] = 9
      expect(attr.getW(0)).toBe(5);
      expect(attr.getW(1)).toBe(9);
    });

    it("gets W at final valid index correctly", () => {
      const array = new Float32Array([0, 1, 2, 3, 4, 5, 6, 7]);
      const ib = new InterleavedBuffer(array, 4);
      const attr = new InterleavedBufferAttribute(ib, 1, 0, false);

      // last valid index = 1
      expect(attr.getW(1)).toBe(7); // 1*4 + 0 + 3 = 7
    });
  });

  describe('setW()', () => {
    it("sets W without normalization", () => {
      const array = new Float32Array([0, 0, 0, 0, 0, 0, 0, 0]);
      const ib = new InterleavedBuffer(array, 4); // stride = 4
      const attr = new InterleavedBufferAttribute(ib, 1, 0, false);

      attr.setW(1, 42);

      // index 1 → 1*4 + offset 0 + 3 = 7
      expect(array[7]).toBe(42);
    });

    it("sets W with normalization", () => {
      const array = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]);
      const ib = new InterleavedBuffer(array, 4);
      const attr = new InterleavedBufferAttribute(ib, 1, 0, true);

      const wValue = 127 / 255;
      attr.setW(0, wValue);

      // normalized value is stored internally; getW() should denormalize it back
      expect(attr.getW(0)).toBeCloseTo(wValue, 5);
    });

    it("respects stride and offset", () => {
      const array = new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
      const ib = new InterleavedBuffer(array, 4);
      const attr = new InterleavedBufferAttribute(ib, 1, 1, false);

      attr.setW(0, 99);
      attr.setW(1, 100);

      // index*stride + offset + 3
      // index 0 → 0*4 + 1 + 3 = 4 → array[4] = 99
      // index 1 → 1*4 + 1 + 3 = 8 → array[8] = 100
      expect(array[4]).toBe(99);
      expect(array[8]).toBe(100);
    });

    it("returns 'this' for chaining", () => {
      const array = new Float32Array(8);
      const ib = new InterleavedBuffer(array, 4);
      const attr = new InterleavedBufferAttribute(ib, 1, 0, false);

      const out = attr.setW(0, 10);
      expect(out).toBe(attr);
    });

    it("sets W at final valid index correctly", () => {
      const array = new Float32Array([0, 1, 2, 3, 4, 5, 6, 7]);
      const ib = new InterleavedBuffer(array, 4);
      const attr = new InterleavedBufferAttribute(ib, 1, 0, false);

      // last valid index = 1
      attr.setW(1, 77);
      expect(array[7]).toBe(77); // 1*4 + 0 + 3 = 7
    });
  });

  describe('setXY()', () => {
    it("sets X and Y without normalization", () => {
      const array = new Float32Array([0, 0, 0, 0, 0, 0]);
      const ib = new InterleavedBuffer(array, 3); // stride = 3
      const attr = new InterleavedBufferAttribute(ib, 2, 0, false);

      attr.setXY(1, 42, 84);

      // index 1 → 1*3 + offset 0 = 3
      // array[3] = x = 42, array[4] = y = 84
      expect(array[3]).toBe(42);
      expect(array[4]).toBe(84);
    });

    it("sets X and Y with normalization", () => {
      const array = new Uint8Array([0, 0, 0, 0, 0, 0]);
      const ib = new InterleavedBuffer(array, 3);
      const attr = new InterleavedBufferAttribute(ib, 2, 0, true);

      const xValue = 127 / 255;
      const yValue = 255 / 255;
      attr.setXY(0, xValue, yValue);

      // getX/getY should return denormalized values
      expect(attr.getX(0)).toBeCloseTo(xValue, 5);
      expect(attr.getY(0)).toBeCloseTo(yValue, 5);
    });

    it("respects stride and offset", () => {
      const array = new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      const ib = new InterleavedBuffer(array, 3);
      const attr = new InterleavedBufferAttribute(ib, 2, 1, false);

      attr.setXY(0, 99, 100);
      attr.setXY(1, 101, 102);

      // index = index*stride + offset
      // index 0 → 0*3 + 1 = 1 → array[1]=x=99, array[2]=y=100
      // index 1 → 1*3 + 1 = 4 → array[4]=x=101, array[5]=y=102
      expect(array[1]).toBe(99);
      expect(array[2]).toBe(100);
      expect(array[4]).toBe(101);
      expect(array[5]).toBe(102);
    });

    it("returns 'this' for chaining", () => {
      const array = new Float32Array(6);
      const ib = new InterleavedBuffer(array, 3);
      const attr = new InterleavedBufferAttribute(ib, 2, 0, false);

      const out = attr.setXY(0, 10, 20);
      expect(out).toBe(attr);
    });

    it("sets X and Y at final valid index correctly", () => {
      const array = new Float32Array([0, 0, 0, 0, 0, 0]);
      const ib = new InterleavedBuffer(array, 3);
      const attr = new InterleavedBufferAttribute(ib, 2, 0, false);

      // last valid index = 1
      attr.setXY(1, 77, 88);
      expect(array[3]).toBe(77); // X
      expect(array[4]).toBe(88); // Y
    });
  });

  describe('setXYZ()', () => {
    it("sets X, Y, Z without normalization", () => {
      const array = new Float32Array([0, 0, 0, 0, 0, 0, 0, 0, 0]);
      const ib = new InterleavedBuffer(array, 3); // stride = 3
      const attr = new InterleavedBufferAttribute(ib, 3, 0, false);

      attr.setXYZ(1, 42, 84, 126);

      // index 1 → 1*3 + offset 0 = 3
      // array[3]=x=42, array[4]=y=84, array[5]=z=126
      expect(array[3]).toBe(42);
      expect(array[4]).toBe(84);
      expect(array[5]).toBe(126);
    });

    it("sets X, Y, Z with normalization", () => {
      const array = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0]);
      const ib = new InterleavedBuffer(array, 3);
      const attr = new InterleavedBufferAttribute(ib, 3, 0, true);

      const xValue = 127 / 255;
      const yValue = 64 / 255;
      const zValue = 255 / 255;

      attr.setXYZ(0, xValue, yValue, zValue);

      expect(attr.getX(0)).toBeCloseTo(xValue, 5);
      expect(attr.getY(0)).toBeCloseTo(yValue, 5);
      expect(attr.getZ(0)).toBeCloseTo(zValue, 5);
    });

    it("respects stride and offset", () => {
      const array = new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
      const ib = new InterleavedBuffer(array, 4); // stride = 4
      const attr = new InterleavedBufferAttribute(ib, 3, 1, false);

      attr.setXYZ(0, 99, 100, 101);
      attr.setXYZ(1, 102, 103, 104);

      // index = index*stride + offset
      // index 0 → 0*4 + 1 = 1 → array[1]=x=99, array[2]=y=100, array[3]=z=101
      // index 1 → 1*4 + 1 = 5 → array[5]=x=102, array[6]=y=103, array[7]=z=104
      expect(array[1]).toBe(99);
      expect(array[2]).toBe(100);
      expect(array[3]).toBe(101);
      expect(array[5]).toBe(102);
      expect(array[6]).toBe(103);
      expect(array[7]).toBe(104);
    });

    it("returns 'this' for chaining", () => {
      const array = new Float32Array(6);
      const ib = new InterleavedBuffer(array, 3);
      const attr = new InterleavedBufferAttribute(ib, 3, 0, false);

      const out = attr.setXYZ(0, 10, 20, 30);
      expect(out).toBe(attr);
    });

    it("sets X, Y, Z at final valid index correctly", () => {
      const array = new Float32Array([0, 0, 0, 0, 0, 0]);
      const ib = new InterleavedBuffer(array, 3);
      const attr = new InterleavedBufferAttribute(ib, 3, 0, false);

      // last valid index = 1
      attr.setXYZ(1, 77, 88, 99);
      expect(array[3]).toBe(77); // X
      expect(array[4]).toBe(88); // Y
      expect(array[5]).toBe(99); // Z
    });
  });

  describe('setXYZW()', () => {
    it("sets X, Y, Z, W without normalization", () => {
      const array = new Float32Array([0, 0, 0, 0, 0, 0, 0, 0]);
      const ib = new InterleavedBuffer(array, 4); // stride = 4
      const attr = new InterleavedBufferAttribute(ib, 4, 0, false);

      attr.setXYZW(1, 10, 20, 30, 40);

      // index 1 → 1*4 + offset 0 = 4
      expect(array[4]).toBe(10); // X
      expect(array[5]).toBe(20); // Y
      expect(array[6]).toBe(30); // Z
      expect(array[7]).toBe(40); // W
    });

    it("sets X, Y, Z, W with normalization", () => {
      const array = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]);
      const ib = new InterleavedBuffer(array, 4);
      const attr = new InterleavedBufferAttribute(ib, 4, 0, true);

      const xValue = 127 / 255;
      const yValue = 64 / 255;
      const zValue = 255 / 255;
      const wValue = 32 / 255;

      attr.setXYZW(0, xValue, yValue, zValue, wValue);

      expect(attr.getX(0)).toBeCloseTo(xValue, 5);
      expect(attr.getY(0)).toBeCloseTo(yValue, 5);
      expect(attr.getZ(0)).toBeCloseTo(zValue, 5);
      expect(attr.getW(0)).toBeCloseTo(wValue, 5);
    });

    it("respects stride and offset", () => {
      const array = new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
      const ib = new InterleavedBuffer(array, 5); // stride = 5
      const attr = new InterleavedBufferAttribute(ib, 4, 1, false);

      attr.setXYZW(0, 99, 100, 101, 102);
      attr.setXYZW(1, 103, 104, 105, 106);

      // index = index*stride + offset
      // index 0 → 0*5 + 1 = 1 → array[1..4] = 99,100,101,102
      expect(array[1]).toBe(99);
      expect(array[2]).toBe(100);
      expect(array[3]).toBe(101);
      expect(array[4]).toBe(102);

      // index 1 → 1*5 + 1 = 6 → array[6..9] = 103,104,105,106
      expect(array[6]).toBe(103);
      expect(array[7]).toBe(104);
      expect(array[8]).toBe(105);
      expect(array[9]).toBe(106);
    });

    it("returns 'this' for chaining", () => {
      const array = new Float32Array(8);
      const ib = new InterleavedBuffer(array, 4);
      const attr = new InterleavedBufferAttribute(ib, 4, 0, false);

      const out = attr.setXYZW(0, 1, 2, 3, 4);
      expect(out).toBe(attr);
    });

    it("sets X, Y, Z, W at final valid index correctly", () => {
      const array = new Float32Array([0, 0, 0, 0, 0, 0, 0, 0]);
      const ib = new InterleavedBuffer(array, 4);
      const attr = new InterleavedBufferAttribute(ib, 4, 0, false);

      // last valid index = 1
      attr.setXYZW(1, 77, 88, 99, 111);

      expect(array[4]).toBe(77);  // X
      expect(array[5]).toBe(88);  // Y
      expect(array[6]).toBe(99);  // Z
      expect(array[7]).toBe(111); // W
    });
  });

  describe('applyMatrix4()', () => {
    it("applies a translation matrix", () => {
      const array = new Float32Array([1, 2, 3, 4, 5, 6]);
      const ib = new InterleavedBuffer(array, 3); // stride = 3
      const attr = new InterleavedBufferAttribute(ib, 3, 0, false);

      const translation = new Matrix4().makeTranslation(10, 20, 30);

      attr.applyMatrix4(translation);

      // Vector3(x, y, z) + translation
      expect(array[0]).toBeCloseTo(11); // 1 + 10
      expect(array[1]).toBeCloseTo(22); // 2 + 20
      expect(array[2]).toBeCloseTo(33); // 3 + 30
      expect(array[3]).toBeCloseTo(14); // 4 + 10
      expect(array[4]).toBeCloseTo(25); // 5 + 20
      expect(array[5]).toBeCloseTo(36); // 6 + 30
    });

    it("applies a scaling matrix", () => {
      const array = new Float32Array([1, 2, 3, 4, 5, 6]);
      const ib = new InterleavedBuffer(array, 3);
      const attr = new InterleavedBufferAttribute(ib, 3, 0, false);

      const scale = new Matrix4().makeScale(2, 3, 4);

      attr.applyMatrix4(scale);

      expect(array[0]).toBeCloseTo(2);  // 1*2
      expect(array[1]).toBeCloseTo(6);  // 2*3
      expect(array[2]).toBeCloseTo(12); // 3*4
      expect(array[3]).toBeCloseTo(8);  // 4*2
      expect(array[4]).toBeCloseTo(15); // 5*3
      expect(array[5]).toBeCloseTo(24); // 6*4
    });

    it("returns 'this' for chaining", () => {
      const array = new Float32Array([1, 2, 3]);
      const ib = new InterleavedBuffer(array, 3);
      const attr = new InterleavedBufferAttribute(ib, 3, 0, false);

      const matrix = new Matrix4().makeTranslation(1, 1, 1);

      const out = attr.applyMatrix4(matrix);
      expect(out).toBe(attr);
    });

    it("does not affect itemSize beyond 3", () => {
      const array = new Float32Array([1, 2, 3, 99, 4, 5, 6, 100]);
      const ib = new InterleavedBuffer(array, 4); // stride = 4
      const attr = new InterleavedBufferAttribute(ib, 3, 0, false);

      const translation = new Matrix4().makeTranslation(1, 1, 1);

      attr.applyMatrix4(translation);

      // x, y, z transformed, last component (offset+3) untouched
      expect(array[0]).toBeCloseTo(2);
      expect(array[1]).toBeCloseTo(3);
      expect(array[2]).toBeCloseTo(4);
      expect(array[3]).toBe(99); // untouched
      expect(array[4]).toBeCloseTo(5);
      expect(array[5]).toBeCloseTo(6);
      expect(array[6]).toBeCloseTo(7);
      expect(array[7]).toBe(100); // untouched
    });
  });

  describe('applyNormalMatrix()', () => {
    it('applies a 90-degree rotation around Z axis', () => {
      const array = new Float32Array([1, 0, 0, 0, 1, 0]);
      const ib = new InterleavedBuffer(array, 3);
      const attr = new InterleavedBufferAttribute(ib, 3, 0, false);

      const angle = Math.PI / 2;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      // Normal matrix for rotation around Z
      const normalMatrix = new Matrix3().set(
        cos, -sin, 0,
        sin, cos, 0,
        0, 0, 1
      );

      attr.applyNormalMatrix(normalMatrix);

      // First vector [1,0,0] -> [0,1,0]
      expect(array[0]).toBeCloseTo(0);
      expect(array[1]).toBeCloseTo(1);
      expect(array[2]).toBeCloseTo(0);

      // Second vector [0,1,0] -> [-1,0,0]
      expect(array[3]).toBeCloseTo(-1);
      expect(array[4]).toBeCloseTo(0);
      expect(array[5]).toBeCloseTo(0);
    });

    it('respects stride and offset', () => {
      const array = new Float32Array([
        0, 1, 0, 0,   // first vector offset = 1
        0, 0, 1, 0    // second vector offset = 1 + stride
      ]);
      const ib = new InterleavedBuffer(array, 4); // stride = 4
      const attr = new InterleavedBufferAttribute(ib, 3, 1, false); // offset = 1

      const angle = Math.PI / 2;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      const normalMatrix = new Matrix3().set(
        cos, -sin, 0,
        sin, cos, 0,
        0, 0, 1
      );

      attr.applyNormalMatrix(normalMatrix);

      // first vector at offset 1 -> [1,0,0] rotated 90 deg -> [0,1,0]
      expect(array[1]).toBeCloseTo(0);
      expect(array[2]).toBeCloseTo(1);
      expect(array[3]).toBeCloseTo(0);

      // second vector at offset+stride = 1+4 = 5 -> [0,1,0] rotated -> [-1,0,0]
      expect(array[5]).toBeCloseTo(-1);
      expect(array[6]).toBeCloseTo(0);
      expect(array[7]).toBeCloseTo(0);
    });

    it('returns "this" for chaining', () => {
      const array = new Float32Array([1, 0, 0]);
      const ib = new InterleavedBuffer(array, 3);
      const attr = new InterleavedBufferAttribute(ib, 3, 0, false);

      const normalMatrix = new Matrix3().set(
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
      );

      const out = attr.applyNormalMatrix(normalMatrix);

      expect(out).toBe(attr);
    });
  });

  describe('transformDirection()', () => {
    it('applies a 90-degree rotation around Z axis', () => {
      const array = new Float32Array([1, 0, 0, 0, 1, 0]);
      const ib = new InterleavedBuffer(array, 3);
      const attr = new InterleavedBufferAttribute(ib, 3, 0, false);

      const angle = Math.PI / 2;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      const rotationZ = new Matrix4().set(
        cos, -sin, 0, 0,
        sin, cos, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      );

      attr.transformDirection(rotationZ);

      // First vector (1,0,0) -> (0,1,0)
      expect(array[0]).toBeCloseTo(0);
      expect(array[1]).toBeCloseTo(1);
      expect(array[2]).toBeCloseTo(0);

      // Second vector (0,1,0) -> (-1,0,0)
      expect(array[3]).toBeCloseTo(-1);
      expect(array[4]).toBeCloseTo(0);
      expect(array[5]).toBeCloseTo(0);
    });

    it('respects stride and offset', () => {
      const array = new Float32Array([
        0, 1, 0, 0,   // first vector offset = 1
        0, 0, 1, 0    // second vector offset = 1 + stride
      ]);
      const ib = new InterleavedBuffer(array, 4); // stride = 4
      const attr = new InterleavedBufferAttribute(ib, 3, 1, false); // offset = 1

      const angle = Math.PI / 2;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      const rotationZ = new Matrix4().set(
        cos, -sin, 0, 0,
        sin, cos, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      );

      attr.transformDirection(rotationZ);

      // first vector at offset 1 -> rotated (1,0,0) -> (0,1,0)
      expect(array[1]).toBeCloseTo(0);
      expect(array[2]).toBeCloseTo(1);
      expect(array[3]).toBeCloseTo(0);

      // second vector at offset+stride = 1+4 = 5 -> rotated (0,1,0) -> (-1,0,0)
      expect(array[5]).toBeCloseTo(-1);
      expect(array[6]).toBeCloseTo(0);
      expect(array[7]).toBeCloseTo(0);
    });

    it('returns "this" for chaining', () => {
      const array = new Float32Array([1, 0, 0]);
      const ib = new InterleavedBuffer(array, 3);
      const attr = new InterleavedBufferAttribute(ib, 3, 0, false);

      const rotation = new Matrix4().makeRotationX(Math.PI / 4);
      const out = attr.transformDirection(rotation);

      expect(out).toBe(attr);
    });
  });



  describe('clone()', () => {
    it('de-interleaves data when no argument is provided', () => {
      const array = new Float32Array([1, 2, 3, 4, 5, 6]) as BufferViewWithUUID;
      const ib = new InterleavedBuffer(array, 3);
      const attr = new InterleavedBufferAttribute(ib, 3, 0, false);

      // const data = { arrayBuffers: { [array.buffer._uuid as string]: array.buffer } };

      // clone with no argument to trigger de-interleaving
      const clone = attr.clone() as BufferAttribute;

      expect(clone).toBeInstanceOf(BufferAttribute);
      expect(clone.array.length).toBe(6);
      expect(clone.array[0]).toBe(1);
      expect(clone.array[1]).toBe(2);
      expect(clone.array[2]).toBe(3);
      expect(clone.array[3]).toBe(4);
      expect(clone.array[4]).toBe(5);
      expect(clone.array[5]).toBe(6);
    });

    it('returns a new InterleavedBufferAttribute when interleaved data is provided', () => {
      const array = new Float32Array([1, 2, 3, 4, 5, 6]);
      const ib = new InterleavedBuffer(array, 3);
      const attr = new InterleavedBufferAttribute(ib, 3, 0, false);

      const data: any = { interleavedBuffers: {} };

      const clone = attr.clone(data) as InterleavedBufferAttribute;

      expect(clone).toBeInstanceOf(InterleavedBufferAttribute);
      expect(clone.itemSize).toBe(attr.itemSize);
      expect(clone.offset).toBe(attr.offset);
      expect(clone.normalized).toBe(attr.normalized);

      // Changing original array should reflect in the clone
      array[0] = 100;
      expect(clone.getX(0)).toBe(1);
    });

    it('reuses interleaved buffer in data if already cloned', () => {
      const array = new Float32Array([1, 2, 3, 4, 5, 6]);
      const ib = new InterleavedBuffer(array, 3);
      const attr = new InterleavedBufferAttribute(ib, 3, 0, false);

      const data: any = { interleavedBuffers: {} };

      const clone1 = attr.clone(data) as InterleavedBufferAttribute;
      const clone2 = attr.clone(data) as InterleavedBufferAttribute;

      // Both clones should share the same underlying interleaved buffer
      expect(clone1.data).toBe(clone2.data);
    });
  });
});
