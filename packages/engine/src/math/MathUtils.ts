import type { Quaternion } from './Quaternion.js';
import { AnyTypedArray } from '../constants.js';

/**
 * _lut - A lookup table for fast calculations
 * It’s a fast way to convert a byte (0–255) into its two-digit hexadecimal string
 *
 * @example
 * _lut[15]  // '0f'
 * _lut[255] // 'ff'
 *
 * @remarks
 * Using a lookup table avoids calling toString(16) repeatedly,
 * which is slightly faster for *performance-sensitive code
 */
const _lut = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '0a', '0b', '0c', '0d', '0e', '0f', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '1a', '1b', '1c', '1d', '1e', '1f', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '2a', '2b', '2c', '2d', '2e', '2f', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '3a', '3b', '3c', '3d', '3e', '3f', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '4a', '4b', '4c', '4d', '4e', '4f', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '5a', '5b', '5c', '5d', '5e', '5f', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '6a', '6b', '6c', '6d', '6e', '6f', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '7a', '7b', '7c', '7d', '7e', '7f', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '8a', '8b', '8c', '8d', '8e', '8f', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99', '9a', '9b', '9c', '9d', '9e', '9f', 'a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9', 'aa', 'ab', 'ac', 'ad', 'ae', 'af', 'b0', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9', 'ba', 'bb', 'bc', 'bd', 'be', 'bf', 'c0', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'ca', 'cb', 'cc', 'cd', 'ce', 'cf', 'd0', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'da', 'db', 'dc', 'dd', 'de', 'df', 'e0', 'e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8', 'e9', 'ea', 'eb', 'ec', 'ed', 'ee', 'ef', 'f0', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'fa', 'fb', 'fc', 'fd', 'fe', 'ff'];

let _seed = 1234567;

export const DEG2RAD = Math.PI / 180;
export const RAD2DEG = 180 / Math.PI;

/**
 * Generate a [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier)
 * (Universally Unique Identifier) according to RFC4122 version 4
 *
 * @returns A randomly generated UUID
 */
export function generateUUID(): string {
  // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136

  // Math.random() * 0xffffffff generates a 32-bit integer in the range 0…4294967295
  // The | 0 truncates it to a signed 32-bit integer
  // We generate 4 random 32-bit numbers: d0, d1, d2, d3
  const d0 = Math.random() * 0xffffffff | 0;
  const d1 = Math.random() * 0xffffffff | 0;
  const d2 = Math.random() * 0xffffffff | 0;
  const d3 = Math.random() * 0xffffffff | 0;

  // This is where the magic happens
  // Each dX & 0xff extracts the lowest byte of dX
  // dX >> 8 & 0xff extracts the next byte, and so on
  // _lut[...] converts each byte into two hex characters
  // The '-' characters are inserted according to the UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  // Special bits
  //    - d1 >> 16 & 0x0f | 0x40 → ensures the version is 4 (0100 in binary
  //    - d2 & 0x3f | 0x80 → ensures the variant is 10xx (RFC 4122 standard)
  const uuid = _lut[d0 & 0xff] + _lut[d0 >> 8 & 0xff] + _lut[d0 >> 16 & 0xff] + _lut[d0 >> 24 & 0xff] + '-' +
    _lut[d1 & 0xff] + _lut[d1 >> 8 & 0xff] + '-' + _lut[d1 >> 16 & 0x0f | 0x40] + _lut[d1 >> 24 & 0xff] + '-' +
    _lut[d2 & 0x3f | 0x80] + _lut[d2 >> 8 & 0xff] + '-' + _lut[d2 >> 16 & 0xff] + _lut[d2 >> 24 & 0xff] +
    _lut[d3 & 0xff] + _lut[d3 >> 8 & 0xff] + _lut[d3 >> 16 & 0xff] + _lut[d3 >> 24 & 0xff];

  // Makes the UUID lowercase to normalize the output
  // Saves memory by flattening the concatenated strings
  return uuid.toLowerCase();

  /**
   * Summary
   *
   * _lut → fast byte → hex conversion
   * d0..d3 → 4 random 32-bit integers
   * Bitwise operations → extract bytes, enforce version and variant bits
   * Concatenation → UUID string in v4 standard format
   * toLowerCase() → normalize result
   *
   * output example: "1e3f5c2a-6b7d-4f8a-90bc-d23456789abc"
   */
}

/**
 * Clamps the given value between min and max
 *
 * @param value - The value to clamp
 * @param min - The minimum value
 * @param max - The maximum value
 * @returns The clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Computes the Euclidean modulo of a given parameter.
 * That is `((n % m) + m) % m)`.
 *
 * @remarks
 * Euclidean modulo ensures the result of a mudolo operation is always non-negative,
 * even when the dividend (`n`) is negative.
 *
 * @example
 * Modulo:
 * -1 % 5 = -1
 *
 * but with Euclidean modulo:
 * euclideanModulo(-1, 5) = 4
 *
 * @param n - The dividend
 * @param m - The divisor
 * @returns The Euclidean modulo
 */
export function euclideanModulo(n: number, m: number): number {
  // https://en.wikipedia.org/wiki/Modulo_operation#Euclidean_definition

  // n % m → standard remainder (can be negative)
  // + m → shift into positive range
  // % m → wrap around to stay within [0, m)
  // This is especially usefull in graphics/game engines for:
  // Wrapping angles (0-360deg or 0-2π)
  // Array index wrapping
  // UV texture coordinate wrapping (0-1)
  return ((n % m) + m) % m;
}

/**
 * Linearly maps a value from `<a1, a2>` to `<b1, b2>` for the given value `x`.
 *
 * @param x - The value to map
 * @param a1 - The lower bound of the input range
 * @param a2 - The upper bound of the input range
 * @param b1 - The lower bound of the output range
 * @param b2 - The upper bound of the output range
 * @returns The mapped value
 */
export function mapLinear(x: number, a1: number, a2: number, b1: number, b2: number): number {
  return b1 + (x - a1) * (b2 - b1) / (a2 - a1);
}

/**
 * Returns the percentage in closed interval `[0, 1]` of `x` between `min` and `max`.
 *
 * @param x - The value to calculate the percentage for
 * @param a - The minimum value
 * @param b - The maximum value
 * @returns The percentage of `x` between `min` and `max`
 */
export function inverseLerp(a: number, b: number, value: number): number {
  // Avoid division by zero
  if (a === b) {
    return 0;
  }

  return (value - a) / (b - a);
}

/**
 * Returns a value linearly interpolated between `a` and `b` by the given percentage `t`.
 *
 * @param a - The start value
 * @param b - The end value
 * @param t - The interpolation factor in the closed interval `[0, 1]`
 * @returns The interpolated value
 */
export function lerp(a: number, b: number, t: number): number {
  return (1 - t) * a + t * b;
}

/**
 * Smoothly interpolate a number from `x` to `y` in a pringlike manner using a delta time
 * to maintain frame rate independent movement
 * for details [Frame rate independent damping using lerp]
 * {@link https://www.rorydriscoll.com/2016/03/07/frame-rate-independent-damping-using-lerp/}.
 *
 * @param x - The current value
 * @param y - The target value
 * @param lambda - The speed of interpolation (higher lambda makes movement more sudden,
 * and a lower lambda makes the movement more gradual)
 * @param dt - The delta time in seconds
 * @returns The smoothly interpolated value
 */
export function damp(x: number, y: number, lambda: number, dt: number): number {
  return lerp(x, y, 1 - Math.exp(-lambda * dt));
}

/**
 * Returns a value that alternates between `0` and given `length`  parameter.
 *
 * @remarks
 * like an automatic bounce function
 * 0 -> length -> 0 -> length -> 0 -> ...
 * perfect for
 * - oscillating positions
 * - looping animations
 * - repeating signals without using conditionals
 * - periodic movements
 *
 * @param x - The value to pingpong
 * @param length - The positive value the function will pingpong to
 * @return The alternated value
 */
export function pingpong(x: number, length: number = 1): number {
  // https://www.desmos.com/calculator/vcsjnyz7x4
  return length - Math.abs(euclideanModulo(x, length * 2) - length);
}

/**
 * Returns a value in the range `[0, 1]` that represents the percentage that `x` has
 * moved between `min` and `max`, but smoothed or slowd down the closer `x` is to
 * the `min` and `max`
 *
 * See [Smoothstep]{@link https://en.wikipedia.org/wiki/Smoothstep}
 *
 * @remarks
 * - x values between min and max will be clamped between 0 and 1 respectively
 * - C1 continuous (first derivative is continuous)
 *
 * @param x - The value to evaluate based on its position between min and max
 * @param min - The min value
 * @param max - The max value
 * @return The alternated value
 */
export function smoothstep(x: number, min: number, max: number): number {
  const t = Math.min(Math.max((x - min) / (max - min), 0), 1);
  return t * t * (3 - 2 * t);
}

/**
 * A [variation on smoothstep]{@link https://en.wikipedia.org/wiki/Smoothstep/Variations}
 * hat has zero 1st and 2nd order derivatives at x=0 and x=1
 *
 * @remarks
 * - x values between min and max will be clamped between 0 and 1 respectively
 * - C2 continuous (first and second derivatives are continuous)
 *
 * @param x - The value to evaluate based on its position between min and max
 * @param min - The min value
 * @param max - The max value
 * @return The alternated value
 */
export function smootherstep(x: number, min: number, max: number): number {
  const t = Math.min(Math.max((x - min) / (max - min), 0), 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/**
 * Returns a random integer between `min` and `max` inclusive.
 *
 * @param min - The minimum value
 * @param max - The maximum value
 * @returns A random integer between `min` and `max` inclusive
 */
export function randomInt(min: number, max: number): number {
  // Math.random()            gives a random number in [0, 1)
  // (max - min + 1)          scales that range to the number of integers between min and max inclusive
  // Math.floor(...) + min    shifts and floors to get an integer in [min, max]
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Returns a random float between `min` and `max`.
 *
 * @remarks
 * The result is in the range `[min, max)` meaning it includes `min` but excludes `max`.
 *
 * @param min - The minimum value
 * @param max - The maximum value
 * @returns A random float between `min` and `max`
 */
export function randomFloat(min: number, max: number): number {
  //   Math.random()                  gives a random number in [0, 1)
  // (max - min)                      scales that range to the desired size
  // Math.random() * (max - min)      now in [0, max - min)
  // + min                            shifts it to [min, max)

  return Math.random() * (max - min) + min;
}

/**
 * Returns a random integer from `<-range/2, range/2>`
 *
 * @remarks
 * So intead of generating numbers from 0 to range (like Math.random() * range),
 * it generates numbers systematically distributed around 0
 * usefule in 3D graphics for things like
 * - Random particle positions
 * - Random jitter around a point
 * - Procedural effects centered around origin
 *
 * @param range - The range to get the random integer from
 * @returns A random float
 */
export function randomFloatSpread(range: number): number {
  // Math.random()                      random number in [0, 1)
  // 0.5 - Math.random()                shifts range to center around 0 → [-0.5, 0.5)
  // range * (0.5 - Math.random())      scales to desired range → [-range/2, range/2)
  return range * (0.5 - Math.random());
}

/**
 * Returns a deterministic pseudorandom float in interval `[0, 1]` based on a seed.
 *
 * @remarks
 * if you pass the same seed again, you will get the same pseudorandom number.
 * useful for reproducible randomness, e.g procedural generation in games and simulations
 *
 * @param s - the integer seed
 * @returns A pseudorandom float in interval `[0, 1]`
 */
export function seededRandom(s: number): number {
  if (s !== undefined) _seed = s;

  // Mulberry32 algorithm
  let t = _seed += 0x6D2B79F5;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t ^= t + Math.imul(t ^ t >> 7, t | 61);
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

/**
 * Converts degrees to radians
 *
 * @param degrees - The angle in degrees
 * @returns The angle in radians
 */
export function degToRad(degrees: number): number {
  return degrees * DEG2RAD;
}

/**
 * Converts radians to degrees
 *
 * @param radians - The angle in radians
 * @returns The angle in degrees
 */
export function radToDeg(radians: number): number {
  return radians * RAD2DEG;
}

/**
 * Returns `true` if the value is a power of two.
 *
 * @param value - The value to check
 * @returns `true` if the value is a power of two, otherwise `false`
 */
export function isPowerOfTwo(value: number): boolean {
  return (value & (value - 1)) === 0 && value !== 0;
}

/**
 * Returns the smallest power of two greater than or equal to the given value.
 *
 * @remarks
 * The ceilPowerOfTwo function is primarily used in computer graphics, game engines,
 * and low-level memory/resource management where powers of two have special significance
 * - Texture dimensions - Many graphics APIs (like WebGL, OpenGL, DirectX) historically
 *   required textures to have dimensions that are powers of two (e.g., 64×64, 128×256, 512×512)
 * - Memory allocation/alignment - Allocating buffers or arrays in powers of two can
 *   improve performance on GPUs or certain CPUs
 * - Mipmapping - In graphics, when generating mipmaps (smaller versions of a texture for
 *   distance rendering), it helps if texture dimensions are powers of two for easier
 *   downscaling and sampling
 * - Algorithmic uses - Some algorithms (e.g., FFT — Fast Fourier Transform) work fastest
 *  when the input size is a power of two
 *
 * @param value - The value to evaluate
 * @returns The smallest power of two greater than or equal to the given value
 */
export function ceilPowerOfTwo(value: number): number {
  if (value === 0) return 1;        // zero maps to 1
  if (value < 0) return NaN;        // negative returns NaN
  return Math.pow(2, Math.ceil(Math.log2(value)))
}

/**
 * Returns the largest power of two less than or equal to the given value
 *
 * @param value - The value to evaluate
 * @returns The largest power of two less than or equal to the given value
 */
export function floorPowerOfTwo(value: number): number {
  if (value <= 0) return 0;        // 0 or negative maps to 0
  return Math.pow(2, Math.floor(Math.log2(value)));
}

/**
 * Sets the given quaternion from the [Intrisic Proper Euler Angles]{@link https://en.wikipedia.org/wiki/Euler_angles}
 * defined by the given angle and order
 *
 * @remarks
 * Rotations are applied to the axes in the order specified by order:
 * rotation by angle `a` is applied first, then by angle `b`, then by angle `c`
 *
 * Proper Euler anggles are rotation where the first and third axes are the  same
 * The quaternion math comes from applying the three rotations in sequence and simplifying
 * the trigonometric identities
 * The result quaternion components depend on the chosen axis order
 *
 * @param q - The quaternion to set
 * @param a - The rotation applied to the first axis, in radians
 * @param b - The rotation applied to the second axis, in radians
 * @param c - The rotation applied to the third axis, in radians
 * @param ('XYX'|'XZX'|'YXY'|'YZY'|'ZXZ'|'ZYZ') order - A string specifying the order of the axes
 */
export function setQuaternionFromProperEuler(q: Quaternion, a: number, b: number, c: number, order: 'XYX' | 'XZX' | 'YXY' | 'YZY' | 'ZXZ' | 'ZYZ'): void {
  const cos = Math.cos;
  const sin = Math.sin;

  const c2 = cos(b / 2);
  const s2 = sin(b / 2);

  const c13 = cos((a + c) / 2);
  const s13 = sin((a + c) / 2);

  const c1_3 = cos((a - c) / 2);
  const s1_3 = sin((a - c) / 2);

  const c3_1 = cos((c - a) / 2);
  const s3_1 = sin((c - a) / 2);

  switch (order) {
    case 'XYX':
      q.set(c2 * s13, s2 * c1_3, s2 * s1_3, c2 * c13);
      break;
    case 'YZY':
      q.set(s2 * s1_3, c2 * s13, s2 * c1_3, c2 * c13);
      break;
    case 'ZXZ':
      q.set(s2 * c1_3, s2 * s1_3, c2 * s13, c2 * c13);
      break;
    case 'XZX':
      q.set(c2 * s13, s2 * c3_1, s2 * s3_1, c2 * c13);
      break;
    case 'YXY':
      q.set(s2 * s3_1, c2 * s13, s2 * c3_1, c2 * c13);
      break;
    case 'ZYZ':
      q.set(s2 * c3_1, s2 * s3_1, c2 * s13, c2 * c13);
      break;
    default:
      console.warn('MathUtils: Unknown order: ' + order);
  }
}

/**
 * Denormalizes the given value according to the given typed array.
 *
 * @remarks
 * This is a low-level numeric conversion utility that is quite common in graphics
 * pipelines like WebGL, image processing, or buffer data parsing.
 *
 * @param value - The denormalized value to be normalized
 * @param array - The typed array to use for normalization
 * @returns The normalized (float) value in the range `[0, 1]`
 */
export function denormalize(value: number, array: AnyTypedArray): number {
  switch (array.constructor) {
    case Float32Array:

      return value;

    case Uint32Array:

      return value / 4294967295.0;

    case Uint16Array:

      return value / 65535.0;

    case Uint8Array:
    case Uint8ClampedArray:

      return value / 255.0;

    case Int32Array:

      return Math.max(value / 2147483647.0, - 1.0);

    case Int16Array:

      return Math.max(value / 32767.0, - 1.0);

    case Int8Array:

      return Math.max(value / 127.0, - 1.0);

    default:

      throw new Error('Invalid component type.');
  }
}

/**
 * Normalizes the given value according to the given typed array.
 *
 * @param value - The normalized value to be denormalized
 * @param array - The typed array to use for denormalization
 * @returns The denormalized value according to the typed array
 */

export function normalize(value: number, array: AnyTypedArray): number {
  switch (array.constructor) {
    case Float32Array:

      return value;

    case Uint32Array:

      return Math.round(value * 4294967295.0);

    case Uint16Array:

      return Math.round(value * 65535.0);

    case Uint8Array:
    case Uint8ClampedArray:

      return Math.round(value * 255.0);

    case Int32Array:

      return Math.round(value * 2147483647.0);

    case Int16Array:

      return Math.round(value * 32767.0);

    case Int8Array:

      return Math.round(value * 127.0);

    default:

      throw new Error('Invalid component type.');
  }
}
