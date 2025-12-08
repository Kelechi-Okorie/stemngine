import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TYPED_ARRAYS, TypedArrayName, arrayMin, arrayMax, arrayNeedsUint32, getTypedArray, createElement, createCanvasElement, warnOnce, probeAsync, toNormalizedProjectionMatrix, toReversedProjectionMatrix } from '../../../src/utils.js';
import { Matrix4 } from '../../../src/math/Matrix4.js';

/**
 * @vitest-environment jsdom
 */

describe('utils', () => {
  describe("arrayMin", () => {
    it("returns the minimum value in a positive number array", () => {
      expect(arrayMin([5, 3, 9, 1, 4])).toBe(1);
    });

    it("returns the minimum value in a mixed (positive/negative) number array", () => {
      expect(arrayMin([7, -2, 5, -10, 3])).toBe(-10);
    });

    it("returns the only element when array has one item", () => {
      expect(arrayMin([42])).toBe(42);
    });

    it("returns Infinity for an empty array", () => {
      expect(arrayMin([])).toBe(Infinity);
    });

    it("handles an array where the smallest value is last", () => {
      expect(arrayMin([9, 8, 7, 0])).toBe(0);
    });

    it("handles an array where the smallest value is first", () => {
      expect(arrayMin([-5, 2, 10])).toBe(-5);
    });

    it("works with repeated values", () => {
      expect(arrayMin([3, 3, 3, 3])).toBe(3);
    });
  });

  describe("arrayMax", () => {
    it("returns the max value in a positive number array", () => {
      expect(arrayMax([1, 5, 2, 9, 4])).toBe(9);
    });

    it("returns the max value in a mixed positive/negative array", () => {
      expect(arrayMax([-10, 0, 7, -3, 5])).toBe(7);
    });

    it("returns the only element if array has one item", () => {
      expect(arrayMax([42])).toBe(42);
    });

    it("returns -Infinity for an empty array", () => {
      expect(arrayMax([])).toBe(-Infinity);
    });

    it("handles an array where the max value is at the end", () => {
      expect(arrayMax([3, 6, 1, 20])).toBe(20);
    });

    it("handles an array where the max value is at the beginning", () => {
      expect(arrayMax([100, 2, 3, 4])).toBe(100);
    });

    it("works with repeated values", () => {
      expect(arrayMax([7, 7, 7])).toBe(7);
    });
  });

  describe('arrayNeedsUint32', () => {
    it("returns false for an empty array", () => {
      expect(arrayNeedsUint32([])).toBe(false);
    });

    it("returns false when all values are below 65535", () => {
      expect(arrayNeedsUint32([0, 1, 100, 65534])).toBe(false);
    });

    it("returns true when a value is exactly 65535", () => {
      expect(arrayNeedsUint32([10, 200, 65535])).toBe(true);
    });

    it("returns true when a value is greater than 65535", () => {
      expect(arrayNeedsUint32([5, 5000, 70000])).toBe(true);
    });

    it("returns false for typed arrays with small values", () => {
      const arr = new Uint16Array([0, 100, 5000]);
      expect(arrayNeedsUint32(arr)).toBe(false);
    });

    it("returns true for typed arrays that contain large values", () => {
      const arr = new Float32Array([0, 1, 70000]);
      expect(arrayNeedsUint32(arr)).toBe(true);
    });

    it("respects array-like objects", () => {
      const arr = { length: 3, 0: 1, 1: 2, 2: 80000 };
      expect(arrayNeedsUint32(arr)).toBe(true);
    });

    it("early exits when a large value is near the end", () => {
      // Spy on iteration count with a proxy
      let readCount = 0;
      const arr = new Array(1000).fill(1);
      arr[999] = 70000;

      const proxy = new Proxy(arr, {
        get(target, prop) {
          if (!isNaN(Number(prop))) readCount++;
          return (target as any)[prop];
        }
      });

      const result = arrayNeedsUint32(proxy);
      expect(result).toBe(true);

      // Should read only a few values, not entire array
      expect(readCount).toBeLessThan(10);
    });
  });

  describe("getTypedArray", () => {

    it("creates a Uint8Array from a buffer", () => {
      const buffer = new ArrayBuffer(4);
      const arr = getTypedArray("Uint8Array", buffer);
      expect(arr).toBeInstanceOf(Uint8Array);
      expect(arr.buffer).toBe(buffer);
    });

    it("creates a Float32Array from a buffer", () => {
      const buffer = new ArrayBuffer(16);
      const arr = getTypedArray("Float32Array", buffer);
      expect(arr).toBeInstanceOf(Float32Array);
      expect(arr.buffer).toBe(buffer);
    });

    it("creates an Int16Array and writes data correctly", () => {
      const buffer = new ArrayBuffer(4);
      const arr = getTypedArray("Int16Array", buffer);
      arr[0] = -123;
      expect(arr[0]).toBe(-123);
    });

    it("works with every supported typed array type", () => {
      const buffer = new ArrayBuffer(64);

      const types: TypedArrayName[] = [
        "Int8Array", "Uint8Array", "Uint8ClampedArray",
        "Int16Array", "Uint16Array",
        "Int32Array", "Uint32Array",
        "Float32Array", "Float64Array"
      ];

      for (const type of types) {
        const arr = getTypedArray(type, buffer);
        expect(arr).toBeInstanceOf(TYPED_ARRAYS[type]);
      }
    });

    it("throws when passed an unknown typed array name", () => {
      // @ts-expect-error testing runtime behavior
      expect(() => getTypedArray("NotAType", new ArrayBuffer(8))).toThrow();
    });

  });

  describe('createElement()', () => {
    it("creates a div element", () => {
      const div = createElement("div");
      expect(div).toBeInstanceOf(HTMLDivElement);
      expect(div.tagName).toBe("DIV");
    });

    it("creates a span element", () => {
      const span = createElement("span");
      expect(span).toBeInstanceOf(HTMLSpanElement);
      expect(span.tagName).toBe("SPAN");
    });

    it("creates a canvas element", () => {
      const canvas = createElement("canvas");
      expect(canvas).toBeInstanceOf(HTMLCanvasElement);
      expect(canvas.tagName).toBe("CANVAS");
    });

    it("supports generic type inference", () => {
      const input = createElement("input");
      // TypeScript should infer input as HTMLInputElement
      expect(input).toBeInstanceOf(HTMLInputElement);
      expect(input.tagName).toBe("INPUT");
    });

    it("creates elements with no children by default", () => {
      const div = createElement("div");
      expect(div.childNodes.length).toBe(0);
    });

    it("created element is not attached to document by default", () => {
      const div = createElement("div");
      expect(document.body.contains(div)).toBe(false);
    });
  });

  describe('createCanvasElemnent()', () => {
    it('should return an HTMLCanvasElement', () => {
      const canvas = createCanvasElement();
      expect(canvas).toBeInstanceOf(HTMLCanvasElement);
    });

    it('should create a new canvas each time', () => {
      const c1 = createCanvasElement();
      const c2 = createCanvasElement();
      expect(c1).not.toBe(c2);
    });

    it('should set display:block on the canvas', () => {
      const canvas = createCanvasElement();
      expect(canvas.style.display).toBe('block');
    });

    it('should have no width or height set initially', () => {
      const canvas = createCanvasElement();
      expect(canvas.width).toBe(300);    // JSDOM default
      expect(canvas.height).toBe(150);   // JSDOM default
    });
  });

  describe("warnOnce", () => {
    beforeEach(() => {
      // Reset console.warn mocks between tests
      vi.restoreAllMocks();
    });

    it("logs a warning the first time the message is used", () => {
      const spy = vi.spyOn(console, "warn").mockImplementation(() => { });

      warnOnce("hello");
      expect(spy).toHaveBeenCalledWith("hello");

      spy.mockRestore();
    });

    it("does not log the same message twice", () => {
      const spy = vi.spyOn(console, "warn").mockImplementation(() => { });

      warnOnce("duplicate warning");
      warnOnce("duplicate warning");

      expect(spy).toHaveBeenCalledTimes(1);

      spy.mockRestore();
    });

    it("logs different messages independently", () => {
      const spy = vi.spyOn(console, "warn").mockImplementation(() => { });

      warnOnce("first");
      warnOnce("second");

      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenCalledWith("first");
      expect(spy).toHaveBeenCalledWith("second");

      spy.mockRestore();
    });
  });

  describe('probeAsync()', () => {
    // We need to mock WebGL because clientWaitSync is GPU-specific
    let gl: any;
    let sync: any;

    beforeEach(() => {
      sync = {};
      gl = {
        SYNC_FLUSH_COMMANDS_BIT: 1,
        WAIT_FAILED: 0,
        TIMEOUT_EXPIRED: 1,
        CONDITION_SATISFIED: 2,
        ALREADY_SIGNALED: 3,
        clientWaitSync: vi.fn()
      };
    });

    it("resolves when clientWaitSync returns CONDITION_SATISFIED", async () => {
      gl.clientWaitSync.mockReturnValue(gl.CONDITION_SATISFIED);

      await expect(probeAsync(gl, sync, 10)).resolves.toBeUndefined();
      expect(gl.clientWaitSync).toHaveBeenCalled();
    });

    it("resolves when clientWaitSync returns ALREADY_SIGNALED", async () => {
      gl.clientWaitSync.mockReturnValue(gl.ALREADY_SIGNALED);

      await expect(probeAsync(gl, sync, 10)).resolves.toBeUndefined();
    });

    it("rejects when clientWaitSync returns WAIT_FAILED", async () => {
      gl.clientWaitSync.mockReturnValue(gl.WAIT_FAILED);

      await expect(probeAsync(gl, sync, 10)).rejects.toBeUndefined();
    });

    it("retries polling when TIMEOUT_EXPIRED is returned", async () => {
      const callOrder: number[] = [];
      let attempts = 0;

      gl.clientWaitSync.mockImplementation(() => {
        attempts++;
        callOrder.push(attempts);
        return attempts < 3 ? gl.TIMEOUT_EXPIRED : gl.CONDITION_SATISFIED;
      });

      await probeAsync(gl, sync, 1);

      expect(callOrder.length).toBe(3);
    });
  });

  describe('toNormalizedProjectionMatrix()', () => {
    it("converts z column from [-1,1] to [0,1]", () => {
      // Construct row-major: last column is [0, 0, 1, 1] for w=1
      const m = new Matrix4(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, -1, 1,
        0, 0, 1, 1
      );

      toNormalizedProjectionMatrix(m);

      const e = m.elements; // column-major internal storage

      // Column-major indices for z column: 2,6,10,14
      expect(e[2]).toBeCloseTo(0.5 * 0 + 0.5 * 0);    // 0
      expect(e[6]).toBeCloseTo(0.5 * 0 + 0.5 * 0);    // 0
      expect(e[10]).toBeCloseTo(0.5 * (-1) + 0.5 * 1); // 0
      expect(e[14]).toBeCloseTo(0.5 * 1 + 0.5 * 1);    // 1
    });

    it("does not modify x or y columns", () => {
      const m = new Matrix4(
        1, 2, 3, 4,
        5, 6, 7, 8,
        9, 10, 11, 12,
        13, 14, 15, 16
      );

      const original = [...m.elements];

      toNormalizedProjectionMatrix(m);

      const e = m.elements;
      // x column indices: 0,1,2,3? Actually column-major: 0,4,8,12
      expect(e[0]).toBe(original[0]);
      expect(e[4]).toBe(original[4]);
      expect(e[8]).toBe(original[8]);
      expect(e[12]).toBe(original[12]);

      // y column indices: 1,5,9,13
      expect(e[1]).toBe(original[1]);
      expect(e[5]).toBe(original[5]);
      expect(e[9]).toBe(original[9]);
      expect(e[13]).toBe(original[13]);
    });

    it.skip("works with zero and positive values in z column", () => {
      const m = new Matrix4(
        0, 0, 0, 1,
        0, 0, 1, 1,
        0, 0, 2, 2,
        0, 0, 3, 3
      );

      toNormalizedProjectionMatrix(m);

      const e = m.elements;
      expect(e[2]).toBeCloseTo(0.5 * 0 + 0.5 * 0); // 0
      expect(e[6]).toBeCloseTo(0.5 * 1 + 0.5 * 1); // 1
      expect(e[10]).toBeCloseTo(0.5 * 2 + 0.5 * 2); // 2
      expect(e[14]).toBeCloseTo(0.5 * 3 + 0.5 * 3); // 3
    });
  });

  describe.skip('toReversedProjectionMatrix()', () => {
    it("reverses a perspective projection matrix", () => {
      // Perspective matrix mock (column-major storage)
      const m = new Matrix4(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 2, 3,
        0, 0, -1, 0
      );

      const original = [...m.elements];

      toReversedProjectionMatrix(m);

      const e = m.elements;

      // Perspective branch: m[11] === -1
      expect(e[10]).toBeCloseTo(-original[10] - 1);
      expect(e[14]).toBeCloseTo(-original[14]);

      // Other elements unchanged
      for (let i = 0; i < 16; i++) {
        if (i !== 10 && i !== 14) {
          expect(e[i]).toBe(original[i]);
        }
      }
    });

    it("reverses an orthographic projection matrix", () => {
      // Orthographic matrix mock (column-major storage)
      const m = new Matrix4(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 2, 3,
        0, 0, 0, 1
      );

      const original = [...m.elements];

      toReversedProjectionMatrix(m);

      const e = m.elements;

      // Orthographic branch: m[11] !== -1
      expect(e[10]).toBeCloseTo(-original[10]);
      expect(e[14]).toBeCloseTo(-original[14] + 1);

      // Other elements unchanged
      for (let i = 0; i < 16; i++) {
        if (i !== 10 && i !== 14) {
          expect(e[i]).toBe(original[i]);
        }
      }
    });

    it("does not change other elements", () => {
      const m = new Matrix4(
        1, 2, 3, 4,
        5, 6, 7, 8,
        9, 10, 11, 12,
        13, 14, -1, 16
      );

      const original = [...m.elements];

      toReversedProjectionMatrix(m);

      const e = m.elements;
      for (let i = 0; i < 16; i++) {
        if (i !== 10 && i !== 14) {
          expect(e[i]).toBe(original[i]);
        }
      }
    });
  });
});
