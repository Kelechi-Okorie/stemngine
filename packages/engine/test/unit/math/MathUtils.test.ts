import { describe, it, expect, vi } from 'vitest'
import { generateUUID, clamp, euclideanModulo, mapLinear, inverseLerp, lerp, damp, pingpong, smoothstep, smootherstep, randomInt, randomFloat, randomFloatSpread, seededRandom, degToRad, radToDeg, isPowerOfTwo, ceilPowerOfTwo, floorPowerOfTwo, setQuaternionFromProperEuler, normalize, denormalize } from '../../../src/math/MathUtils.js';
import { Quaternion } from '../../../src/math/Quaternion.js';


describe('MathUtils', () => {
  describe('generateUUID()', () => {
    it('should return a string', () => {
      const uuid = generateUUID();

      expect(typeof uuid).toBe('string');
    });

    it('should have 36 characters', () => {
      const uuid = generateUUID();

      expect(uuid.length).toBe(36);
    });

    it('should have the correct format', () => {
      const uuid = generateUUID();

      // Regex for v4 UUID: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

      expect(uuid).toMatch(uuidV4Regex);
    });

    it('should product unique UUIDs', () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();

      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe('clamp()', () => {
    it('returns the value when within the range', () => {
      expect(clamp(5, 1, 10)).toBe(5);
    });

    it('returns the min when the value is below the range', () => {
      expect(clamp(-3, 0, 8)).toBe(0);
    });

    it('returns the max when the value is above the range', () => {
      expect(clamp(15, 2, 12)).toBe(12);
    });

    it('handles edge case where value equals min', () => {
      expect(clamp(3, 3, 7)).toBe(3);
    });

    it('handles edge case where value equals max', () => {
      expect(clamp(9, 4, 9)).toBe(9);
    });

    it('works with negative ranges', () => {
      expect(clamp(-5, -10, -1)).toBe(-5);
      expect(clamp(-15, -10, -1)).toBe(-10);
      expect(clamp(0, -10, -1)).toBe(-1);
    });

    it('works when min equals max', () => {
      expect(clamp(5, 7, 7)).toBe(7);
      expect(clamp(7, 7, 7)).toBe(7);
      expect(clamp(10, 7, 7)).toBe(7);
    });

    it('works with floating point numbers', () => {
      expect(clamp(5.5, 1, 10)).toBe(5.5);
      expect(clamp(-3.2, -10, -1)).toBe(-3.2);
      expect(clamp(15.7, 2, 12)).toBe(12);
    });
  });

  describe('euclideanModulo()', () => {
    it('returns correct modulo for positive n and m', () => {
      expect(euclideanModulo(7, 5)).toBe(2);
      expect(euclideanModulo(0, 5)).toBe(0);
      expect(euclideanModulo(5, 5)).toBe(0);
    });

    it('returns correct modulo for negative n and positive m', () => {
      expect(euclideanModulo(-1, 5)).toBe(4);
      expect(euclideanModulo(-6, 5)).toBe(4);
      expect(euclideanModulo(-10, 3)).toBe(2);
    });

    it('works when n is a multiple of m', () => {
      expect(euclideanModulo(10, 5)).toBe(0);
      expect(euclideanModulo(-15, 5)).toBe(0);
    });

    it('works for floating-point numbers', () => {
      expect(euclideanModulo(7.5, 5)).toBeCloseTo(2.5);
      expect(euclideanModulo(-1.2, 5)).toBeCloseTo(3.8);
    });

    it('works when m is negative', () => {
      expect(euclideanModulo(7, -5)).toBe(-3);
      expect(euclideanModulo(-2, -5)).toBe(-2);
    });
  });

  describe('mapLinear()', () => {
    it('maps value within range correctly', () => {
      expect(mapLinear(5, 0, 10, 0, 100)).toBe(50);
      expect(mapLinear(2.5, 0, 5, 0, 10)).toBe(5);
    });

    it('maps value at the lower bound correctly', () => {
      expect(mapLinear(0, 0, 10, 0, 100)).toBe(0);
      expect(mapLinear(5, 5, 15, 0, 10)).toBe(0);
    });

    it('maps value at the upper bound correctly', () => {
      expect(mapLinear(10, 0, 10, 0, 100)).toBe(100);
      expect(mapLinear(15, 5, 15, 0, 10)).toBe(10);
    });

    it('works with reversed output range', () => {
      expect(mapLinear(5, 0, 10, 100, 0)).toBe(50);
      expect(mapLinear(2.5, 0, 5, 10, 0)).toBe(5);
    });

    it('works with reversed input range', () => {
      expect(mapLinear(5, 10, 0, 0, 100)).toBe(50);
      expect(mapLinear(2.5, 5, 0, 0, 10)).toBe(5);
    });

    it('works with floating point numbers', () => {
      expect(mapLinear(0.5, 0, 1, 0, 10)).toBeCloseTo(5);
      expect(mapLinear(2.5, 0, 5, 1.0, 3.0)).toBeCloseTo(2.0);
    });
  });

  describe('inverseLerp()', () => {
    it('returns 0 when value is at start', () => {
      expect(inverseLerp(0, 10, 0)).toBeCloseTo(0);
      expect(inverseLerp(-5, 5, -5)).toBeCloseTo(0);
    });

    it('returns 1 when value is at end', () => {
      expect(inverseLerp(0, 10, 10)).toBeCloseTo(1);
      expect(inverseLerp(-5, 5, 5)).toBeCloseTo(1);
    });

    it('returns the correct fraction for values in between', () => {
      expect(inverseLerp(0, 10, 5)).toBeCloseTo(0.5);
      expect(inverseLerp(0, 5, 2.5)).toBeCloseTo(0.5);
      expect(inverseLerp(-5, 5, 0)).toBeCloseTo(0.5);
    });

    it('returns a value outside 0-1 if value is outside the interval', () => {
      expect(inverseLerp(0, 10, -5)).toBeCloseTo(-0.5);
      expect(inverseLerp(0, 10, 15)).toBeCloseTo(1.5);
    });

    it('returns 0 when start and end are the same', () => {
      expect(inverseLerp(5, 5, 5)).toBeCloseTo(0);
      expect(inverseLerp(2, 2, 3)).toBeCloseTo(0);
    });
  });

  describe('lerp()', () => {
    it('returns start value when t = 0', () => {
      expect(lerp(0, 10, 0)).toBeCloseTo(0);
      expect(lerp(-5, 5, 0)).toBeCloseTo(-5);
    });

    it('returns end value when t = 1', () => {
      expect(lerp(0, 10, 1)).toBeCloseTo(10);
      expect(lerp(-5, 5, 1)).toBeCloseTo(5);
    });

    it('returns correct interpolated value for t in (0,1)', () => {
      expect(lerp(0, 10, 0.5)).toBeCloseTo(5);
      expect(lerp(10, 20, 0.25)).toBeCloseTo(12.5);
      expect(lerp(-5, 5, 0.5)).toBeCloseTo(0);
    });

    it('returns extrapolated value for t outside [0,1]', () => {
      expect(lerp(0, 10, -0.5)).toBeCloseTo(-5);
      expect(lerp(0, 10, 1.5)).toBeCloseTo(15);
    });

    it('works when start and end are the same', () => {
      expect(lerp(5, 5, 0)).toBeCloseTo(5);
      expect(lerp(5, 5, 0.5)).toBeCloseTo(5);
      expect(lerp(5, 5, 1)).toBeCloseTo(5);
    });
  });

  describe('damp()', () => {
    it('returns a value closer to target than the current', () => {
      expect(damp(5, 5, 1, 1)).toBeCloseTo(5);
    });

    it('returns a value closer to target than the current', () => {
      const x = 0;
      const y = 10;
      const lambda = 1;
      const dt = 0.1;
      const result = damp(x, y, lambda, dt);

      expect(result).toBeGreaterThan(x);
      expect(result).toBeLessThan(y);
    });

    it('approaches target faster for higher lambda', () => {
      const x = 0;
      const y = 10;
      const dt = 0.1;

      const slow = damp(x, y, 1, dt);
      const fast = damp(x, y, 5, dt);

      expect(fast).toBeGreaterThan(slow);
    });

    it('is frame rate independent', () => {
      const x = 0;
      const y = 10;
      const lambda = 1;

      const result1 = damp(x, y, lambda, 0.1);
      const result2 = damp(x, y, lambda, 0.05);
      const result3 = damp(result2, y, lambda, 0.05);

      // Splitting 0.1s into two 0.05s steps should give roughly the same result
      expect(result3).toBeCloseTo(result1, 5);
    });

    it('works for negative lambda', () => {
      const x = 0;
      const y = 10;
      const lambda = -1;
      const dt = 0.1
      const result = damp(x, y, lambda, dt);

      expect(result).toBeLessThan(x); // moves away from target
    })
  });

  describe('pingpoing()', () => {
    it('returns values oscillating between 0 and length', () => {
      const length = 3;

      expect(pingpong(0, length)).toBeCloseTo(0);
      expect(pingpong(2, length)).toBeCloseTo(2);
      expect(pingpong(3, length)).toBeCloseTo(3);
      expect(pingpong(4, length)).toBeCloseTo(2);
      expect(pingpong(5, length)).toBeCloseTo(1);
      expect(pingpong(6, length)).toBeCloseTo(0);
      expect(pingpong(7, length)).toBeCloseTo(1);
    });

    it('defaults to length = 1 when not provided', () => {
      expect(pingpong(0)).toBeCloseTo(0);
      expect(pingpong(0.5)).toBeCloseTo(0.5);
      expect(pingpong(1)).toBeCloseTo(1);
      expect(pingpong(1.5)).toBeCloseTo(0.5);
      expect(pingpong(2)).toBeCloseTo(0);
    });

    it('handles negative x values correctly', () => {
      const length = 2;

      expect(pingpong(-1, length)).toBeCloseTo(1);
      expect(pingpong(-2, length)).toBeCloseTo(2);
      expect(pingpong(-3, length)).toBeCloseTo(1);
      expect(pingpong(-4, length)).toBeCloseTo(0);
    });

    it('always returns values in range [0, length]', () => {
      const length = 5;

      for (let i = -50; i <= 50; i++) {
        const val = pingpong(i, length);
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThanOrEqual(length);
      }
    })
  });

  describe('smoothstep()', () => {
    it('returns 0 when x is less than min', () => {
      expect(smoothstep(-5, 0, 10)).toBe(0);
      expect(smoothstep(0, 1, 2)).toBe(0);
    });

    it('should return 1 when x is greater than max', () => {
      expect(smoothstep(15, 0, 10)).toBe(1);
      expect(smoothstep(3, 1, 2)).toBe(1);
    });

    it('returs 0.5 when x is exactly halfway between min and max', () => {
      expect(smoothstep(5, 0, 10)).toBeCloseTo(0.5);
    });

    it('returns 0 when x is exactly min', () => {
      expect(smoothstep(0, 0, 10)).toBe(0);
    });

    it('returns 1 when x is exactly max', () => {
      expect(smoothstep(10, 0, 10)).toBe(1);
    });

    it('smoothly interpolates between 0 and 1 for values between min and max', () => {
      // midpoints should smoothly increase
      const values = [0, 2.5, 5, 7.5, 10].map(x => smoothstep(x, 0, 10));

      expect(values[0]).toBeCloseTo(0);
      expect(values[1]).toBeLessThan(values[2]);
      expect(values[2]).toBeCloseTo(0.5, 5);
      expect(values[3]).toBeGreaterThan(values[2]);
      expect(values[4]).toBeCloseTo(1);
    });

    it('handles negative ranges correctly', () => {
      // range from -10 to 10
      expect(smoothstep(-10, -10, 10)).toBe(0);
      expect(smoothstep(10, -10, 10)).toBe(1);
      expect(smoothstep(0, -10, 10)).toBeCloseTo(0.5, 5);
    });

    it('handles reverse range gracefully (max < min)', () => {
      // If max < min, this produces inverted interpolation
      // You may decide to clamp or invert in your implementation
      const result = smoothstep(5, 10, 0);

      expect(result).toBeTypeOf('number');
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    })
  });

  describe('smootherstep()', () => {
    it('returns 0 when x is less than min', () => {
      expect(smootherstep(-5, 0, 10)).toBe(0);
    });

    it('returns 1 when x is greater than max', () => {
      expect(smootherstep(15, 0, 10)).toBe(1);
    });

    it('returns 0 when x equals min', () => {
      expect(smootherstep(0, 0, 10)).toBe(0);
    });

    it('returns 1 when x equals max', () => {
      expect(smootherstep(10, 0, 10)).toBe(1);
    });

    it('returns 0.5 when x is halfway between min and max', () => {
      expect(smootherstep(5, 0, 10)).toBeCloseTo(0.5, 5);
    });

    it('smoothly interploates between 0 and 1 for values between min and max', () => {
      const values = [0, 2.5, 5, 7.5, 10].map(x => smootherstep(x, 0, 10));
      expect(values[0]).toBeCloseTo(0);
      expect(values[2]).toBeCloseTo(0.5, 5);
      expect(values[4]).toBeCloseTo(1);
      // Ensure it's monotonic (no dips)
      expect(values[1]).toBeLessThan(values[2]);
      expect(values[3]).toBeGreaterThan(values[2]);
    });

    it('handles negative ranges correctly', () => {
      expect(smootherstep(-10, -10, 10)).toBe(0);
      expect(smootherstep(10, -10, 10)).toBe(1);
      expect(smootherstep(0, -10, 10)).toBeCloseTo(0.5, 5);
    });

    it('clamps x values between 0 and 1 internally', () => {
      expect(smootherstep(-100, 0, 10)).toBe(0);
      expect(smootherstep(100, 0, 10)).toBe(1);
    });

    it('works with reversed range (max < min)', () => {
      const result = smootherstep(5, 10, 0);

      expect(result).toBeTypeOf('number');
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });
  });

  describe('randomInt()', () => {
    it('always returns an integer', () => {
      for (let i = 0; i < 100; i++) {
        const value = randomInt(0, 10);
        expect(Number.isInteger(value)).toBe(true);
      }
    });


    it('returns values within the specified range', () => {
      const min = 5;
      const max = 15;
      for (let i = 0; i < 1000; i++) {
        const value = randomInt(min, max);
        expect(value).toBeGreaterThanOrEqual(min);
        expect(value).toBeLessThanOrEqual(max);
      }
    });

    it('includes both min and max over multiple samples', () => {
      const min = 0;
      const max = 2;
      const samples = new Set();
      for (let i = 0; i < 500; i++) {
        samples.add(randomInt(min, max));
      }
      expect(samples.has(min)).toBe(true);
      expect(samples.has(max)).toBe(true);
    });

    it('works when min and max are the same', () => {
      expect(randomInt(5, 5)).toBe(5);
    });
  });

  describe('randomFloat()', () => {
    it('returns a number between min and max', () => {
      const min = 5;
      const max = 10;

      for (let i = 0; i < 1000; i++) {
        const value = randomFloat(min, max);
        expect(value).toBeGreaterThanOrEqual(min);
        expect(value).toBeLessThan(max); // note: not inclusive of max
      }
    });

    it('returns a float (not necessarily integer)', () => {
      const value = randomFloat(0, 1);
      expect(Number.isInteger(value)).toBe(false);
    });

    it('returns exactly min if Math.random() = 0', () => {
      // Mock Math.random
      const original = Math.random;
      Math.random = () => 0;
      expect(randomFloat(5, 10)).toBe(5);
      Math.random = original;
    });

    it('returns just below max if Math.random() ≈ 1', () => {
      const original = Math.random;
      Math.random = () => 0.999999;
      const result = randomFloat(0, 1);
      expect(result).toBeLessThan(1);
      expect(result).toBeCloseTo(1, 3);
      Math.random = original;
    });

    it('returns the same value if min == max', () => {
      expect(randomFloat(5, 5)).toBe(5);
    });
  });

  describe('randomFloatSpread()', () => {
    it('retuns a float within the range [-range/2, range/2]', () => {
      const range = 10;

      for (let i = 0; i < 1000; i++) {
        const value = randomFloatSpread(range);
        expect(value).toBeGreaterThanOrEqual(-range / 2);
        expect(value).toBeLessThan(range / 2);
      }
    });

    it('returns floats, not integers', () => {
      const value = randomFloatSpread(10);
      expect(Number.isInteger(value)).toBe(false);
    });

    it('returns 0 if range is 0', () => {
      expect(randomFloatSpread(0)).toBeCloseTo(0);
    });

    it('is centered around 0 (statistically)', () => {
      // This is a rough statistical check
      const range = 10;
      const samples = Array.from({ length: 10000 }, () => randomFloatSpread(range));
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
      // mean should be close to 0
      expect(mean).toBeCloseTo(0, 0);
    });
  });

  describe('seededRandom()', () => {
    it('returns a number between 0 and 1', () => {
      for (let i = 0; i < 1000; i++) {
        const n = seededRandom(i);
        expect(n).toBeGreaterThanOrEqual(0);
        expect(n).toBeLessThan(1);
      }
    });

    it('is deterministic for the same seed', () => {
      const seed = 12345;
      const first = seededRandom(seed);
      const second = seededRandom(seed);
      expect(first).toBeCloseTo(second, 10); // same output
    });

    it('produces different values for different seeds', () => {
      const a = seededRandom(111);
      const b = seededRandom(222);
      expect(a).not.toBeCloseTo(b, 10);
    });
  });

  describe('degToRad()', () => {
    it('converts 0 degrees to 0 radians', () => {
      expect(degToRad(0)).toBeCloseTo(0);
    });

    it('converts 180 degrees to π radians', () => {
      expect(degToRad(180)).toBeCloseTo(Math.PI);
    });

    it('converts 90 degrees to π/2 radians', () => {
      expect(degToRad(90)).toBeCloseTo(Math.PI / 2);
    });

    it('converts negative degrees correctly', () => {
      expect(degToRad(-90)).toBeCloseTo(-Math.PI / 2);
    });

    it('converts 360 degrees to 2π radians', () => {
      expect(degToRad(360)).toBeCloseTo(2 * Math.PI);
    });
  });

  describe('radToDeg()', () => {
    it('converts 0 radians to 0 degrees', () => {
      expect(radToDeg(0)).toBeCloseTo(0);
    });

    it('converts π radians to 180 degrees', () => {
      expect(radToDeg(Math.PI)).toBeCloseTo(180);
    });

    it('converts π/2 radians to 90 degrees', () => {
      expect(radToDeg(Math.PI / 2)).toBeCloseTo(90);
    });

    it('converts negative radians correctly', () => {
      expect(radToDeg(-Math.PI / 2)).toBeCloseTo(-90);
    });

    it('converts 2π radians to 360 degrees', () => {
      expect(radToDeg(2 * Math.PI)).toBeCloseTo(360);
    });
  });

  describe('isPowerOfTwo()', () => {

    it('returns true for powers of two', () => {
      expect(isPowerOfTwo(1)).toBe(true);   // 2^0
      expect(isPowerOfTwo(2)).toBe(true);   // 2^1
      expect(isPowerOfTwo(4)).toBe(true);   // 2^2
      expect(isPowerOfTwo(8)).toBe(true);   // 2^3
      expect(isPowerOfTwo(16)).toBe(true);  // 2^4
      expect(isPowerOfTwo(1024)).toBe(true); // 2^10
    });

    it('returns false for non-powers of two', () => {
      expect(isPowerOfTwo(0)).toBe(false);
      expect(isPowerOfTwo(3)).toBe(false);
      expect(isPowerOfTwo(5)).toBe(false);
      expect(isPowerOfTwo(6)).toBe(false);
      expect(isPowerOfTwo(10)).toBe(false);
    });

    it('returns false for negative numbers', () => {
      expect(isPowerOfTwo(-2)).toBe(false);
      expect(isPowerOfTwo(-8)).toBe(false);
    });

  });

  describe('ceilPowerOfTwo()', () => {
    it('returns the input if it is already a power of two', () => {
      expect(ceilPowerOfTwo(1)).toBe(1);
      expect(ceilPowerOfTwo(2)).toBe(2);
      expect(ceilPowerOfTwo(8)).toBe(8);
      expect(ceilPowerOfTwo(16)).toBe(16);
    });

    it('returns the next power of two if the input is not a power of two', () => {
      expect(ceilPowerOfTwo(3)).toBe(4);
      expect(ceilPowerOfTwo(5)).toBe(8);
      expect(ceilPowerOfTwo(9)).toBe(16);
      expect(ceilPowerOfTwo(17)).toBe(32);
    });

    it('works with floating point numbers', () => {
      expect(ceilPowerOfTwo(2.5)).toBe(4);
      expect(ceilPowerOfTwo(6.7)).toBe(8);
      expect(ceilPowerOfTwo(12.1)).toBe(16);
    });

    it('handles 0 or negative values gracefully', () => {
      expect(ceilPowerOfTwo(0)).toBe(1); // edge case
      expect(ceilPowerOfTwo(-5)).toBeNaN(); // log2 negative is NaN
    });
  });

  describe('floorPowerOfTwo()', () => {
    it('returns the largest power of two less than or equal to a positive integer', () => {
      expect(floorPowerOfTwo(1)).toBe(1);
      expect(floorPowerOfTwo(2)).toBe(2);
      expect(floorPowerOfTwo(3)).toBe(2);
      expect(floorPowerOfTwo(5)).toBe(4);
      expect(floorPowerOfTwo(16)).toBe(16);
      expect(floorPowerOfTwo(31)).toBe(16);
    });

    it('works for floats', () => {
      expect(floorPowerOfTwo(6.5)).toBe(4);
      expect(floorPowerOfTwo(9.9)).toBe(8);
    });

    it('handles 0 or negative values gracefully', () => {
      expect(floorPowerOfTwo(0)).toBe(0);
      expect(floorPowerOfTwo(-10)).toBe(0);
    });
  });

  describe('setQuaternionFromProperEuler()', () => {
    it('sets quaternion to identity for zero rotation', () => {
      const q = new Quaternion();
      setQuaternionFromProperEuler(q, 0, 0, 0, 'XYX');

      expect(q.x).toBeCloseTo(0);
      expect(q.y).toBeCloseTo(0);
      expect(q.z).toBeCloseTo(0);
      expect(q.w).toBeCloseTo(1);
    });

    it('produces quaternions for all valid orders', () => {
      const orders: ('XYX' | 'XZX' | 'YXY' | 'YZY' | 'ZXZ' | 'ZYZ')[] = ['XYX', 'XZX', 'YXY', 'YZY', 'ZXZ', 'ZYZ'];

      const a = Math.PI / 4; // 45°
      const b = Math.PI / 3; // 60°
      const c = Math.PI / 6; // 30°

      for (const order of orders) {
        const q = new Quaternion();

        expect(() => setQuaternionFromProperEuler(q, a, b, c, order)).not.toThrow();
        // Ensure quaternion has numeric components
        expect(typeof q.x).toBe('number');
        expect(typeof q.y).toBe('number');
        expect(typeof q.z).toBe('number');
        expect(typeof q.w).toBe('number');
      }
    });

    it('produces consistent quaternion for a known XYX rotation', () => {
      const q = new Quaternion();
      setQuaternionFromProperEuler(q, Math.PI / 2, Math.PI / 2, Math.PI / 2, 'XYX');

      const c2 = Math.cos(Math.PI / 4);
      const s2 = Math.sin(Math.PI / 4);
      const c13 = Math.cos(Math.PI / 2);
      const s13 = Math.sin(Math.PI / 2);
      const c1_3 = Math.cos(0);
      const s1_3 = Math.sin(0);

      expect(q.x).toBeCloseTo(c2 * s13);
      expect(q.y).toBeCloseTo(s2 * c1_3);
      expect(q.z).toBeCloseTo(s2 * s1_3);
      expect(q.w).toBeCloseTo(c2 * c13);
    });

    it('produces correct quaternion for another order (YZY)', () => {
      const q = new Quaternion();
      setQuaternionFromProperEuler(q, Math.PI / 2, Math.PI / 4, Math.PI / 6, 'YZY');

      const c2 = Math.cos(Math.PI / 8);
      const s2 = Math.sin(Math.PI / 8);
      const c13 = Math.cos((Math.PI / 2 + Math.PI / 6) / 2);
      const s13 = Math.sin((Math.PI / 2 + Math.PI / 6) / 2);
      const c1_3 = Math.cos((Math.PI / 2 - Math.PI / 6) / 2);
      const s1_3 = Math.sin((Math.PI / 2 - Math.PI / 6) / 2);

      expect(q.x).toBeCloseTo(s2 * s1_3);
      expect(q.y).toBeCloseTo(c2 * s13);
      expect(q.z).toBeCloseTo(s2 * c1_3);
      expect(q.w).toBeCloseTo(c2 * c13);
    });

    it('warns for unknown order', () => {
      const q = new Quaternion();
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
      // @ts-expect-error testing invalid order
      setQuaternionFromProperEuler(q, 0, 0, 0, 'ABC');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('MathUtils: Unknown order'));
      consoleSpy.mockRestore();
    });

    // it('produces consistent quaternion for known rotation (XYX)', () => {
    //   const q = new Quaternion();
    //   setQuaternionFromProperEuler(q, Math.PI / 2, Math.PI / 2, Math.PI / 2, 'XYX');

    //   // Correct expected values
    //   expect(q.x).toBeCloseTo(0.7071067811865476);
    //   expect(q.y).toBeCloseTo(0.7071067811865476);
    //   expect(q.z).toBeCloseTo(0);
    //   expect(q.w).toBeCloseTo(0);
    // });
  });

  describe('denormalize()', () => {
    it('returns the same value for Float32Array', () => {
      const arr = new Float32Array(1);
      expect(denormalize(0.5, arr)).toBe(0.5);
      expect(denormalize(-2, arr)).toBe(-2);
    });

    it('normalizes Uint32Array correctly', () => {
      const arr = new Uint32Array(1);
      expect(denormalize(0, arr)).toBe(0);
      expect(denormalize(4294967295, arr)).toBeCloseTo(1);
      expect(denormalize(2147483647, arr)).toBeCloseTo(2147483647 / 4294967295);
    });

    it('normalizes Uint16Array correctly', () => {
      const arr = new Uint16Array(1);
      expect(denormalize(0, arr)).toBe(0);
      expect(denormalize(65535, arr)).toBeCloseTo(1);
      expect(denormalize(32767, arr)).toBeCloseTo(32767 / 65535);
    });

    it('normalizes Uint8Array correctly', () => {
      const arr = new Uint8Array(1);
      expect(denormalize(0, arr)).toBe(0);
      expect(denormalize(255, arr)).toBeCloseTo(1);
      expect(denormalize(128, arr)).toBeCloseTo(128 / 255);
    });

    it('normalizes signed Int32Array correctly', () => {
      const arr = new Int32Array(1);
      expect(denormalize(2147483647, arr)).toBeCloseTo(1);
      expect(denormalize(-2147483647, arr)).toBeCloseTo(-1);
      expect(denormalize(-3000000000, arr)).toBe(-1); // clamp
    });

    it('normalizes signed Int16Array correctly', () => {
      const arr = new Int16Array(1);
      expect(denormalize(32767, arr)).toBeCloseTo(1);
      expect(denormalize(-32767, arr)).toBeCloseTo(-1);
      expect(denormalize(-40000, arr)).toBe(-1); // clamp
    });

    it('normalizes signed Int8Array correctly', () => {
      const arr = new Int8Array(1);
      expect(denormalize(127, arr)).toBeCloseTo(1);
      expect(denormalize(-127, arr)).toBeCloseTo(-1);
      expect(denormalize(-200, arr)).toBe(-1); // clamp
    });

    it('throws an error for unknown typed arrays', () => {
      const arr = [1, 2, 3]; // plain array
      expect(() => denormalize(0, arr as any)).toThrow('Invalid component type.');
    });
  });

  describe('normalize()', () => {
    it('returns the same value for Float32Array', () => {
      const arr = new Float32Array(1);
      expect(normalize(0.5, arr)).toBe(0.5);
      expect(normalize(-2, arr)).toBe(-2);
    });

    it('normalizes Uint32Array correctly', () => {
      const arr = new Uint32Array(1);
      expect(normalize(0, arr)).toBe(0);
      expect(normalize(1, arr)).toBe(4294967295);
      expect(normalize(0.5, arr)).toBe(Math.round(0.5 * 4294967295));
    });

    it('normalizes Uint16Array correctly', () => {
      const arr = new Uint16Array(1);
      expect(normalize(0, arr)).toBe(0);
      expect(normalize(1, arr)).toBe(65535);
      expect(normalize(0.5, arr)).toBe(Math.round(0.5 * 65535));
    });

    it('normalizes Uint8Array correctly', () => {
      const arr = new Uint8Array(1);
      expect(normalize(0, arr)).toBe(0);
      expect(normalize(1, arr)).toBe(255);
      expect(normalize(0.5, arr)).toBe(Math.round(0.5 * 255));
    });

    it('normalizes signed Int32Array correctly', () => {
      const arr = new Int32Array(1);
      expect(normalize(0, arr)).toBe(0);
      expect(normalize(1, arr)).toBe(2147483647);
      expect(normalize(-1, arr)).toBe(Math.round(-1 * 2147483647));
    });

    it('normalizes signed Int16Array correctly', () => {
      const arr = new Int16Array(1);
      expect(normalize(0, arr)).toBe(0);
      expect(normalize(1, arr)).toBe(32767);
      expect(normalize(-1, arr)).toBe(Math.round(-1 * 32767));
    });

    it('normalizes signed Int8Array correctly', () => {
      const arr = new Int8Array(1);
      expect(normalize(0, arr)).toBe(0);
      expect(normalize(1, arr)).toBe(127);
      expect(normalize(-1, arr)).toBe(Math.round(-1 * 127));
    });

    it('throws an error for unknown typed arrays', () => {
      const arr = [1, 2, 3]; // plain array
      expect(() => normalize(0, arr as any)).toThrow('Invalid component type.');
    });
  });
});
