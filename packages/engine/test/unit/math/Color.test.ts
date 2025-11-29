import { describe, it, expect, beforeEach, vi } from "vitest";
import { Color } from "../../../src/math/Color";
import { ColorManagement, SRGBToLinear, LinearToSRGB } from "../../../src/math/ColorManagement";
import { NoColorSpace, LinearSRGBColorSpace, SRGBColorSpace, DstAlphaFactor } from "../../../src/constants";
import { clamp, lerp } from '../../../src/math/MathUtils';
import { Vector3 } from "../../../src/math/Vector3";
import { Matrix3 } from "../../../src/math/Matrix3";
import { BufferAttribute } from "../../../src/core/BufferAttribute";

describe('Color', () => {
  describe.skip('constructor()', () => {
it('creates a color with default values when no arguments are provided', () => {
      const color = new Color();
      expect(color.r).toBe(1);
      expect(color.g).toBe(1);
      expect(color.b).toBe(1);
    });

    it('creates a color from individual RGB components', () => {
      const color = new Color(0.2, 0.4, 0.6);
      expect(color.r).toBe(0.2);
      expect(color.g).toBe(0.4);
      expect(color.b).toBe(0.6);
    });

    it('creates a color from another Color instance', () => {
      const original = new Color(0.1, 0.2, 0.3);
      const copy = new Color(original);
      expect(copy.r).toBe(0.1);
      expect(copy.g).toBe(0.2);
      expect(copy.b).toBe(0.3);
    });

    it('creates a color from a hexadecimal number', () => {
      const color = new Color(0xff8800); // hex FF8800
      expect(color.r).toBeCloseTo(1); // 255 / 255
      expect(color.g).toBeCloseTo(136 / 255);
      expect(color.b).toBeCloseTo(0);
    });

    it('creates a color from a CSS-style string', () => {
      const color = new Color('rgb(128,64,32)');
      expect(color.r).toBeCloseTo(128 / 255);
      expect(color.g).toBeCloseTo(64 / 255);
      expect(color.b).toBeCloseTo(32 / 255);
    });
  });

  describe('setScalar()', () => {
    it('sets all RGB components to the given scalar', () => {
      const c = new Color().setScalar(0.5);

      expect(c.r).toBe(0.5);
      expect(c.g).toBe(0.5);
      expect(c.b).toBe(0.5);
    });

    it('overwrites previous component values', () => {
      const c = new Color(0.1, 0.2, 0.3);
      c.setScalar(1);

      expect(c.r).toBe(1);
      expect(c.g).toBe(1);
      expect(c.b).toBe(1);
    });

    it('accepts zero', () => {
      const c = new Color().setScalar(0);

      expect(c.r).toBe(0);
      expect(c.g).toBe(0);
      expect(c.b).toBe(0);
    });

    it('accepts negative values', () => {
      const c = new Color().setScalar(-2);

      expect(c.r).toBe(-2);
      expect(c.g).toBe(-2);
      expect(c.b).toBe(-2);
    });

    it('returns `this` for chaining', () => {
      const c = new Color();
      const returned = c.setScalar(0.3);

      expect(returned).toBe(c);
    });

    it('does not modify other instances', () => {
      const a = new Color(0.2, 0.3, 0.4);
      const b = new Color(0.2, 0.3, 0.4);

      a.setScalar(0.9);

      expect(b.r).toBe(0.2);
      expect(b.g).toBe(0.3);
      expect(b.b).toBe(0.4);
    });
  });

  describe('setHex()', () => {
    it('sets RGB components correctly from a hex value in default SRGBColorSpace', () => {
      const c = new Color();
      const hex = 0x123456;

      c.setHex(hex);

      // Convert each component from hex to 0-1
      const r = (0x12) / 255;
      const g = (0x34) / 255;
      const b = (0x56) / 255;

      // values are converted SRGB → Linear
      expect(c.r).toBeCloseTo(SRGBToLinear(r));
      expect(c.g).toBeCloseTo(SRGBToLinear(g));
      expect(c.b).toBeCloseTo(SRGBToLinear(b));
    });

    it('sets RGB components correctly for white (0xffffff)', () => {
      const c = new Color();
      c.setHex(0xffffff);

      expect(c.r).toBeCloseTo(SRGBToLinear(1));
      expect(c.g).toBeCloseTo(SRGBToLinear(1));
      expect(c.b).toBeCloseTo(SRGBToLinear(1));
    });

    it('sets RGB components correctly for black (0x000000)', () => {
      const c = new Color();
      c.setHex(0x000000);

      expect(c.r).toBeCloseTo(SRGBToLinear(0));
      expect(c.g).toBeCloseTo(SRGBToLinear(0));
      expect(c.b).toBeCloseTo(SRGBToLinear(0));
    });

    it('accepts a custom color space and returns `this` for chaining', () => {
      const c = new Color();
      const returned = c.setHex(0xff0000, SRGBColorSpace);
      expect(returned).toBe(c);

      // Red component converted to linear
      expect(c.r).toBeCloseTo(SRGBToLinear(1));
      expect(c.g).toBeCloseTo(SRGBToLinear(0));
      expect(c.b).toBeCloseTo(SRGBToLinear(0));
    });
  });

  describe('setRGB()', () => {
    it('sets RGB components correctly with default working color space', () => {
      const c = new Color();
      const r = 0.4, g = 0.5, b = 0.6;

      // call setRGB with default color space
      c.setRGB(r, g, b);

      // In default working color space, if it is linear, values are unchanged
      expect(c.r).toBeCloseTo(r);
      expect(c.g).toBeCloseTo(g);
      expect(c.b).toBeCloseTo(b);
    });

    it('sets RGB components correctly with SRGBColorSpace', () => {
      const c = new Color();
      const r = 0.4, g = 0.5, b = 0.6;

      // call setRGB with SRGBColorSpace
      c.setRGB(r, g, b, SRGBColorSpace);

      // values are converted SRGB → Linear
      expect(c.r).toBeCloseTo(SRGBToLinear(r));
      expect(c.g).toBeCloseTo(SRGBToLinear(g));
      expect(c.b).toBeCloseTo(SRGBToLinear(b));
    });

    it('returns `this` for chaining', () => {
      const c = new Color();
      const returned = c.setRGB(0.1, 0.2, 0.3, SRGBColorSpace);
      expect(returned).toBe(c);
    });

  });

  describe('setHSL', () => {

    it('sets RGB correctly for zero saturation (gray)', () => {
      const c = new Color();
      const h = 0.5;
      const s = 0;
      const l = 0.25;

      c.setHSL(h, s, l);

      // Values are directly l in linear space, because colorSpaceToWorking converts
      expect(c.r).toBeCloseTo(l);
      expect(c.g).toBeCloseTo(l);
      expect(c.b).toBeCloseTo(l);
    });

    it('sets RGB correctly for mid-saturation and mid-lightness', () => {
      const c = new Color();
      const h = 0.5;
      const s = 0.5;
      const l = 0.5;

      c.setHSL(h, s, l);

      const p = l <= 0.5 ? l * (1 + s) : l + s - l * s;
      const q = 2 * l - p;
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * 6 * (2 / 3 - t);
        return p;
      };
      const r = hue2rgb(q, p, h + 1 / 3);
      const g = hue2rgb(q, p, h);
      const b = hue2rgb(q, p, h - 1 / 3);

      expect(c.r).toBeCloseTo(r);
      expect(c.g).toBeCloseTo(g);
      expect(c.b).toBeCloseTo(b);
    });

    it('wraps hue correctly using euclideanModulo', () => {
      const c = new Color();
      c.setHSL(-0.25, 1, 0.5); // negative hue wraps to 0.75

      const p = 0.5 <= 0.5 ? 0.5 * (1 + 1) : 0.5 + 1 - 0.5 * 1; // 1
      const q = 2 * 0.5 - p; // 0
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * 6 * (2 / 3 - t);
        return p;
      };
      const r = hue2rgb(q, p, 0.75 + 1 / 3);
      const g = hue2rgb(q, p, 0.75);
      const b = hue2rgb(q, p, 0.75 - 1 / 3);

      expect(c.r).toBeCloseTo(r);
      expect(c.g).toBeCloseTo(g);
      expect(c.b).toBeCloseTo(b);
    });

    it('accepts custom color space and returns this for chaining', () => {
      const c = new Color();
      const returned = c.setHSL(0.3, 0.6, 0.7, NoColorSpace);
      expect(returned).toBe(c);
    });
  });

  describe('setStyle()', () => {
    it('parses rgb() with 0-255 numbers', () => {
      const c = new Color();
      c.setStyle('rgb(255, 128, 64)');
      expect(c.r).toBeCloseTo(SRGBToLinear(1));
      expect(c.g).toBeCloseTo(SRGBToLinear(128 / 255));
      expect(c.b).toBeCloseTo(SRGBToLinear(64 / 255));
    });

    it('parses rgba() and ignores alpha', () => {
      const c = new Color();
      c.setStyle('rgba(255, 128, 64, 0.5)');
      expect(c.r).toBeCloseTo(SRGBToLinear(1));
      expect(c.g).toBeCloseTo(SRGBToLinear(128 / 255));
      expect(c.b).toBeCloseTo(SRGBToLinear(64 / 255));
    });

    it('parses rgb() percentages', () => {
      const c = new Color();
      c.setStyle('rgb(100%, 50%, 25%)');
      expect(c.r).toBeCloseTo(SRGBToLinear(1));
      expect(c.g).toBeCloseTo(SRGBToLinear(0.5));
      expect(c.b).toBeCloseTo(SRGBToLinear(0.25));
    });

    it.skip('parses hsl()', () => {
      const c = new Color();
      c.setStyle('hsl(180, 50%, 50%)');

      // Compute expected RGB using hue2rgb logic or precalculated values
      const r = 0.25;
      const g = 0.75;
      const b = 0.5;

      expect(c.r).toBeCloseTo(SRGBToLinear(r));
      expect(c.g).toBeCloseTo(SRGBToLinear(g));
      expect(c.b).toBeCloseTo(SRGBToLinear(b));
    });

    it.skip('parses hsla() and ignores alpha', () => {
      const c = new Color();
      c.setStyle('hsla(180, 50%, 50%, 0.5)');
      const r = 0.25, g = 0.5, b = 0.5;
      expect(c.r).toBeCloseTo(SRGBToLinear(r));
      expect(c.g).toBeCloseTo(SRGBToLinear(g));
      expect(c.b).toBeCloseTo(SRGBToLinear(b));
    });

    it('parses 3-digit hex #f80', () => {
      const c = new Color();
      c.setStyle('#f80');
      expect(c.r).toBeCloseTo(SRGBToLinear(15 / 15));
      expect(c.g).toBeCloseTo(SRGBToLinear(8 / 15));
      expect(c.b).toBeCloseTo(SRGBToLinear(0));
    });

    it('parses 6-digit hex #ff8800', () => {
      const c = new Color();
      c.setStyle('#ff8800');
      expect(c.r).toBeCloseTo(SRGBToLinear(1));
      expect(c.g).toBeCloseTo(SRGBToLinear(136 / 255));
      expect(c.b).toBeCloseTo(SRGBToLinear(0));
    });
  });

  describe('setColorName()', () => {
    it('sets RGB correctly for a known color name', () => {
      const c = new Color();
      c.setColorName('red'); // 0xFF0000

      expect(c.r).to.be.closeTo(SRGBToLinear(1), 0.0001);
      expect(c.g).to.be.closeTo(SRGBToLinear(0), 0.0001);
      expect(c.b).to.be.closeTo(SRGBToLinear(0), 0.0001);
    });

    it('is case-insensitive', () => {
      const c = new Color();
      c.setColorName('Blue'); // 0x0000FF

      expect(c.r).to.be.closeTo(SRGBToLinear(0), 0.0001);
      expect(c.g).to.be.closeTo(SRGBToLinear(0), 0.0001);
      expect(c.b).to.be.closeTo(SRGBToLinear(1), 0.0001);
    });

    it('warns for unknown color names but does not throw', () => {
      const c = new Color();
      let warned = false;
      const originalWarn = console.warn;
      console.warn = () => { warned = true; };

      c.setColorName('notacolor');

      expect(warned).to.be.true;

      console.warn = originalWarn;
    });

    it('returns this for chaining', () => {
      const c = new Color();
      const result = c.setColorName('green');

      expect(result).to.equal(c);
    });

    it('respects the colorSpace parameter', () => {
      const c = new Color();
      // Use a dummy color space name to test that the parameter is passed to setHex
      const dummySpace = SRGBColorSpace;
      const result = c.setColorName('yellow', dummySpace);

      expect(result).to.equal(c);
      // Optionally, we could check RGB values for yellow 0xFFFF00
      expect(c.r).to.be.closeTo(SRGBToLinear(1), 0.0001);
      expect(c.g).to.be.closeTo(SRGBToLinear(1), 0.0001);
      expect(c.b).to.be.closeTo(SRGBToLinear(0), 0.0001);
    });
  });

  describe('clone()', () => {
    it('returns a new Color instance', () => {
      const c = new Color(0.1, 0.2, 0.3);
      const clone = c.clone();

      expect(clone).to.be.instanceOf(Color);
      expect(clone).to.not.equal(c); // ensure it is a new object
    });

    it('copies the RGB values correctly', () => {
      const c = new Color(0.5, 0.25, 0.75);
      const clone = c.clone();

      expect(clone.r).to.equal(c.r);
      expect(clone.g).to.equal(c.g);
      expect(clone.b).to.equal(c.b);
    });

    it('modifying the clone does not affect the original', () => {
      const c = new Color(0.1, 0.2, 0.3);
      const clone = c.clone();

      clone.r = 0.9;
      clone.g = 0.8;
      clone.b = 0.7;

      expect(c.r).to.equal(0.1);
      expect(c.g).to.equal(0.2);
      expect(c.b).to.equal(0.3);
    });

    it('works with default constructor values', () => {
      const c = new Color();
      const clone = c.clone();

      expect(clone.r).to.equal(c.r);
      expect(clone.g).to.equal(c.g);
      expect(clone.b).to.equal(c.b);
    });
  });

  describe('copy()', () => {
    it('copies RGB values from another color', () => {
      const c1 = new Color(0.1, 0.2, 0.3);
      const c2 = new Color(0.5, 0.6, 0.7);

      c1.copy(c2);

      expect(c1.r).toBeCloseTo(c2.r);
      expect(c1.g).toBeCloseTo(c2.g);
      expect(c1.b).toBeCloseTo(c2.b);
    });

    it('returns this for chaining', () => {
      const c1 = new Color(0.1, 0.2, 0.3);
      const c2 = new Color(0.5, 0.6, 0.7);

      const result = c1.copy(c2);
      expect(result).toBe(c1);
    });

    it('modifying the copied color does not affect the original', () => {
      const c1 = new Color(0.1, 0.2, 0.3);
      const c2 = new Color(0.5, 0.6, 0.7);

      c1.copy(c2);
      c2.r = 0.9;
      c2.g = 0.8;
      c2.b = 0.7;

      expect(c1.r).toBeCloseTo(0.5);
      expect(c1.g).toBeCloseTo(0.6);
      expect(c1.b).toBeCloseTo(0.7);
    });

    it('works when copying from itself', () => {
      const c = new Color(0.2, 0.4, 0.6);
      c.copy(c);

      expect(c.r).toBeCloseTo(0.2);
      expect(c.g).toBeCloseTo(0.4);
      expect(c.b).toBeCloseTo(0.6);
    });
  });

  describe('copySRGBToLinear()', () => {
    it('copies and converts RGB values from sRGB to linear', () => {
      const c1 = new Color();
      const c2 = new Color(0.25, 0.5, 0.75);

      c1.copySRGBToLinear(c2);

      expect(c1.r).toBeCloseTo(SRGBToLinear(0.25));
      expect(c1.g).toBeCloseTo(SRGBToLinear(0.5));
      expect(c1.b).toBeCloseTo(SRGBToLinear(0.75));
    });

    it('returns this for chaining', () => {
      const c1 = new Color();
      const c2 = new Color(0.1, 0.2, 0.3);

      const result = c1.copySRGBToLinear(c2);
      expect(result).toBe(c1);
    });

    it('modifying the source color does not affect the copied linear color', () => {
      const c1 = new Color();
      const c2 = new Color(0.25, 0.5, 0.75);

      c1.copySRGBToLinear(c2);

      c2.r = 0.9;
      c2.g = 0.8;
      c2.b = 0.7;

      expect(c1.r).toBeCloseTo(SRGBToLinear(0.25));
      expect(c1.g).toBeCloseTo(SRGBToLinear(0.5));
      expect(c1.b).toBeCloseTo(SRGBToLinear(0.75));
    });

    it('works when copying itself', () => {
      const c = new Color(0.4, 0.5, 0.6);

      c.copySRGBToLinear(c);

      expect(c.r).toBeCloseTo(SRGBToLinear(0.4));
      expect(c.g).toBeCloseTo(SRGBToLinear(0.5));
      expect(c.b).toBeCloseTo(SRGBToLinear(0.6));
    });
  });

  describe('copyLinearToSRGB()', () => {
    it('copies and converts RGB values from linear to sRGB', () => {
      const c1 = new Color();
      const c2 = new Color(0.1, 0.5, 0.9);

      c1.copyLinearToSRGB(c2);

      expect(c1.r).toBeCloseTo(LinearToSRGB(0.1));
      expect(c1.g).toBeCloseTo(LinearToSRGB(0.5));
      expect(c1.b).toBeCloseTo(LinearToSRGB(0.9));
    });

    it('returns this for chaining', () => {
      const c1 = new Color();
      const c2 = new Color(0.2, 0.4, 0.6);

      const result = c1.copyLinearToSRGB(c2);
      expect(result).toBe(c1);
    });

    it('modifying the source color does not affect the copied sRGB color', () => {
      const c1 = new Color();
      const c2 = new Color(0.15, 0.45, 0.75);

      c1.copyLinearToSRGB(c2);

      c2.r = 0.9;
      c2.g = 0.8;
      c2.b = 0.7;

      expect(c1.r).toBeCloseTo(LinearToSRGB(0.15));
      expect(c1.g).toBeCloseTo(LinearToSRGB(0.45));
      expect(c1.b).toBeCloseTo(LinearToSRGB(0.75));
    });

    it('works when copying itself', () => {
      const c = new Color(0.3, 0.5, 0.7);

      c.copyLinearToSRGB(c);

      expect(c.r).toBeCloseTo(LinearToSRGB(0.3));
      expect(c.g).toBeCloseTo(LinearToSRGB(0.5));
      expect(c.b).toBeCloseTo(LinearToSRGB(0.7));
    });
  });

  describe('convertSRGBToLinear()', () => {
    it('converts RGB values from sRGB to linear', () => {
      const c = new Color(0.1, 0.5, 0.9);

      c.convertSRGBToLinear();

      expect(c.r).toBeCloseTo(SRGBToLinear(0.1));
      expect(c.g).toBeCloseTo(SRGBToLinear(0.5));
      expect(c.b).toBeCloseTo(SRGBToLinear(0.9));
    });

    it('returns this for chaining', () => {
      const c = new Color(0.2, 0.4, 0.6);

      const result = c.convertSRGBToLinear();
      expect(result).toBe(c);
    });

    it('calling it twice keeps converting correctly', () => {
      const c = new Color(0.3, 0.6, 0.9);

      c.convertSRGBToLinear();
      const firstConversion = { ...c };

      c.convertSRGBToLinear();
      expect(c.r).toBeCloseTo(SRGBToLinear(firstConversion.r));
      expect(c.g).toBeCloseTo(SRGBToLinear(firstConversion.g));
      expect(c.b).toBeCloseTo(SRGBToLinear(firstConversion.b));
    });

    it('works when all components are zero', () => {
      const c = new Color(0, 0, 0);

      c.convertSRGBToLinear();

      expect(c.r).toBeCloseTo(0);
      expect(c.g).toBeCloseTo(0);
      expect(c.b).toBeCloseTo(0);
    });

    it('works when all components are one', () => {
      const c = new Color(1, 1, 1);

      c.convertSRGBToLinear();

      expect(c.r).toBeCloseTo(1);
      expect(c.g).toBeCloseTo(1);
      expect(c.b).toBeCloseTo(1);
    });
  });

  describe('convertLinearToSRGB()', () => {
    it('converts RGB values from linear to sRGB', () => {
      const c = new Color(0.1, 0.5, 0.9);

      c.convertLinearToSRGB();

      expect(c.r).toBeCloseTo(LinearToSRGB(0.1));
      expect(c.g).toBeCloseTo(LinearToSRGB(0.5));
      expect(c.b).toBeCloseTo(LinearToSRGB(0.9));
    });

    it('returns this for chaining', () => {
      const c = new Color(0.2, 0.4, 0.6);

      const result = c.convertLinearToSRGB();
      expect(result).toBe(c);
    });

    it('calling it twice keeps converting correctly', () => {
      const c = new Color(0.3, 0.6, 0.9);

      c.convertLinearToSRGB();
      const firstConversion = { ...c };

      c.convertLinearToSRGB();
      expect(c.r).toBeCloseTo(LinearToSRGB(firstConversion.r));
      expect(c.g).toBeCloseTo(LinearToSRGB(firstConversion.g));
      expect(c.b).toBeCloseTo(LinearToSRGB(firstConversion.b));
    });

    it('works when all components are zero', () => {
      const c = new Color(0, 0, 0);

      c.convertLinearToSRGB();

      expect(c.r).toBeCloseTo(0);
      expect(c.g).toBeCloseTo(0);
      expect(c.b).toBeCloseTo(0);
    });

    it('works when all components are one', () => {
      const c = new Color(1, 1, 1);

      c.convertLinearToSRGB();

      expect(c.r).toBeCloseTo(1);
      expect(c.g).toBeCloseTo(1);
      expect(c.b).toBeCloseTo(1);
    });
  });

  describe('getHex()', () => {
    it('returns the correct hex value for basic RGB', () => {
      const c = new Color(1, 0, 0); // Red
      expect(c.getHex()).toBe(0xff0000);

      const c2 = new Color(0, 1, 0); // Green
      expect(c2.getHex()).toBe(0x00ff00);

      const c3 = new Color(0, 0, 1); // Blue
      expect(c3.getHex()).toBe(0x0000ff);
    });

    it('clamps values correctly when out of range', () => {
      const c = new Color(-0.5, 1.5, 2);
      const r = Math.round(clamp(-0.5 * 255, 0, 255));
      const g = Math.round(clamp(1.5 * 255, 0, 255));
      const b = Math.round(clamp(2 * 255, 0, 255));
      const expectedHex = (r << 16) + (g << 8) + b;
      expect(c.getHex()).toBe(expectedHex);
    });

    it('returns the same hex value for the same color in default color space', () => {
      const c = new Color(0.1, 0.2, 0.3);
      const hex1 = c.getHex();
      const hex2 = c.getHex(SRGBColorSpace);
      expect(hex1).toBe(hex2);
    });

    it('returns a number', () => {
      const c = new Color(0.4, 0.5, 0.6);
      expect(typeof c.getHex()).toBe('number');
    });
  });

  describe('getHexString()', () => {
    it('returns correct hex string for pure colors', () => {
      const red = new Color(1, 0, 0);
      expect(red.getHexString()).toBe('ff0000');

      const green = new Color(0, 1, 0);
      expect(green.getHexString()).toBe('00ff00');

      const blue = new Color(0, 0, 1);
      expect(blue.getHexString()).toBe('0000ff');
    });

    it.skip('returns correct hex string for non-integer RGB values', () => {
      const c = new Color(0.5, 0.25, 0.75);
      const r = Math.round(0.5 * 255).toString(16).padStart(2, '0');
      const g = Math.round(0.25 * 255).toString(16).padStart(2, '0');
      const b = Math.round(0.75 * 255).toString(16).padStart(2, '0');
      const expectedHex = `${r}${g}${b}`;
      expect(c.getHexString()).toBe(expectedHex);
    });

    it('pads with zeros for small values', () => {
      const c = new Color(0.01, 0.02, 0.03);
      const hex = c.getHexString();
      expect(hex.length).toBe(6);
      expect(/^[0-9a-f]{6}$/.test(hex)).toBe(true);
    });

    it('returns lowercase hex string', () => {
      const c = new Color(1, 0.5, 0);
      const hex = c.getHexString();
      expect(hex).toBe(hex.toLowerCase());
    });

    it('returns the same hex string for default color space', () => {
      const c = new Color(0.1, 0.2, 0.3);
      expect(c.getHexString()).toBe(c.getHexString(SRGBColorSpace));
    });
  });

  describe('getHSL()', () => {
    let c: Color;
    let target: { h: number, s: number, l: number };

    beforeEach(() => {
      target = { h: 0, s: 0, l: 0 };
    });

    it('returns HSL for pure red', () => {
      c = new Color(1, 0, 0);
      c.getHSL(target);
      expect(target.h).toBeCloseTo(0);      // red hue
      expect(target.s).toBeCloseTo(1);      // fully saturated
      expect(target.l).toBeCloseTo(0.5);    // medium lightness
    });

    it('returns HSL for pure green', () => {
      c = new Color(0, 1, 0);
      c.getHSL(target);
      expect(target.h).toBeCloseTo(1 / 3);    // green hue
      expect(target.s).toBeCloseTo(1);
      expect(target.l).toBeCloseTo(0.5);
    });

    it('returns HSL for pure blue', () => {
      c = new Color(0, 0, 1);
      c.getHSL(target);
      expect(target.h).toBeCloseTo(2 / 3);    // blue hue
      expect(target.s).toBeCloseTo(1);
      expect(target.l).toBeCloseTo(0.5);
    });

    it('returns HSL for gray (no saturation)', () => {
      c = new Color(0.25, 0.25, 0.25);
      c.getHSL(target);
      expect(target.h).toBeCloseTo(0);      // hue is arbitrary when s=0
      expect(target.s).toBeCloseTo(0);
      expect(target.l).toBeCloseTo(0.25);
    });

    it('returns correct HSL for arbitrary color', () => {
      c = new Color(0.5, 0.25, 0.75);
      c.getHSL(target);
      // Expected values calculated manually or using an online converter
      expect(target.h).toBeCloseTo(0.75);   // hue ≈ 270°
      expect(target.s).toBeCloseTo(0.5);    // medium saturation
      expect(target.l).toBeCloseTo(0.5);    // medium lightness
    });

    it('returns the target object itself', () => {
      c = new Color(0, 0, 0);
      const result = c.getHSL(target);
      expect(result).toBe(target);
    });
  });

  describe('getRBG()', () => {
    let c: Color;
    let target: Color;

    beforeEach(() => {
      target = new Color(0, 0, 0);
    });

    it('copies RGB values correctly for a red color', () => {
      c = new Color(1, 0, 0);
      const result = c.getRGB(target);
      expect(target.r).toBeCloseTo(1);
      expect(target.g).toBeCloseTo(0);
      expect(target.b).toBeCloseTo(0);
      expect(result).toBe(target);
    });

    it('copies RGB values correctly for green', () => {
      c = new Color(0, 1, 0);
      c.getRGB(target);
      expect(target.r).toBeCloseTo(0);
      expect(target.g).toBeCloseTo(1);
      expect(target.b).toBeCloseTo(0);
    });

    it('copies RGB values correctly for blue', () => {
      c = new Color(0, 0, 1);
      c.getRGB(target);
      expect(target.r).toBeCloseTo(0);
      expect(target.g).toBeCloseTo(0);
      expect(target.b).toBeCloseTo(1);
    });

    it('copies RGB values correctly for arbitrary color', () => {
      c = new Color(0.2, 0.4, 0.6);
      c.getRGB(target);
      expect(target.r).toBeCloseTo(0.2);
      expect(target.g).toBeCloseTo(0.4);
      expect(target.b).toBeCloseTo(0.6);
    });

    it('returns the target color reference', () => {
      c = new Color(0, 0, 0);
      const result = c.getRGB(target);
      expect(result).toBe(target);
    });
  });

  describe('getStyle()', () => {
    let c: Color;

    beforeEach(() => {
      c = new Color(0, 0, 0);
    });

    it.skip('returns CSS rgb() string for standard SRGB colors', () => {
      c.r = 1; c.g = 0.5; c.b = 0.25;
      const style = c.getStyle();
      expect(style).toBe('rgb(255,128,64)');
    });

    it.skip('rounds RGB values correctly', () => {
      c.r = 0.501; c.g = 0.499; c.b = 0.123;
      const style = c.getStyle();
      expect(style).toBe('rgb(128,127,31)');
    });

    it('returns CSS color() string for non-SRGB color space', () => {
      c.r = 0.1; c.g = 0.2; c.b = 0.3;
      const style = c.getStyle(LinearSRGBColorSpace);
      expect(style).toBe(`color(${LinearSRGBColorSpace} 0.100 0.200 0.300)`);
    });

    it('returns correct style for black', () => {
      c.r = 0; c.g = 0; c.b = 0;
      expect(c.getStyle()).toBe('rgb(0,0,0)');
    });

    it('returns correct style for white', () => {
      c.r = 1; c.g = 1; c.b = 1;
      expect(c.getStyle()).toBe('rgb(255,255,255)');
    });
  });

  describe.skip('offsetHSL()', () => {
    let c: Color;

    beforeEach(() => {
      c = new Color(1, 0.5, 0.25); // Initial color
    });

    it('adds HSL values correctly', () => {
      // Offset hue by 0.1, saturation by 0.1, lightness by 0.1
      c.offsetHSL(0.1, 0.1, 0.1);

      const hsl = { h: 0, s: 0, l: 0 };
      c.getHSL(hsl);

      expect(hsl.h).toBeCloseTo(((0.0416666667 + 0.1) % 1), 5); // original hue + 0.1
      expect(hsl.s).toBeCloseTo(0.6, 5); // 0.5 + 0.1
      expect(hsl.l).toBeCloseTo(0.35, 5); // 0.25 + 0.1
    });

    it('wraps hue correctly when exceeding 1', () => {
      c.offsetHSL(1.2, 0, 0); // hue > 1

      const hsl = { h: 0, s: 0, l: 0 };
      c.getHSL(hsl);

      expect(hsl.h).toBeCloseTo(((0.0416666667 + 1.2) % 1), 5);
    });

    it('works with negative offsets', () => {
      c.offsetHSL(-0.1, -0.2, -0.05);

      const hsl = { h: 0, s: 0, l: 0 };
      c.getHSL(hsl);

      expect(hsl.h).toBeCloseTo(0.0416666667 - 0.1, 5);
      expect(hsl.s).toBeCloseTo(0.3, 5);
      expect(hsl.l).toBeCloseTo(0.2, 5);
    });

    it('returns the same Color instance for chaining', () => {
      const result = c.offsetHSL(0.1, 0.1, 0.1);
      expect(result).toBe(c);
    });
  });

  describe('add()', () => {
    let c1: Color;
    let c2: Color;

    beforeEach(() => {
      c1 = new Color(0.2, 0.3, 0.4);
      c2 = new Color(0.5, 0.1, 0.25);
    });

    it('adds RGB values correctly', () => {
      c1.add(c2);

      expect(c1.r).toBeCloseTo(0.7);
      expect(c1.g).toBeCloseTo(0.4);
      expect(c1.b).toBeCloseTo(0.65);
    });

    it('adds zero color correctly', () => {
      const zero = new Color(0, 0, 0);
      c1.add(zero);

      expect(c1.r).toBeCloseTo(0.2);
      expect(c1.g).toBeCloseTo(0.3);
      expect(c1.b).toBeCloseTo(0.4);
    });

    it('returns the same Color instance for chaining', () => {
      const result = c1.add(c2);
      expect(result).toBe(c1);
    });

    it('can handle negative values', () => {
      const neg = new Color(-0.1, -0.2, -0.3);
      c1.add(neg);

      expect(c1.r).toBeCloseTo(0.1);
      expect(c1.g).toBeCloseTo(0.1);
      expect(c1.b).toBeCloseTo(0.1);
    });

    it('can exceed 1 without clamping', () => {
      const large = new Color(1, 1, 1);
      c1.add(large);

      expect(c1.r).toBeCloseTo(1.2);
      expect(c1.g).toBeCloseTo(1.3);
      expect(c1.b).toBeCloseTo(1.4);
    });
  });

  describe('addColors()', () => {
    let c: Color;
    let c1: Color;
    let c2: Color;

    beforeEach(() => {
      c = new Color();
      c1 = new Color(0.2, 0.3, 0.4);
      c2 = new Color(0.5, 0.1, 0.25);
    });

    it('adds two colors correctly', () => {
      c.addColors(c1, c2);

      expect(c.r).toBeCloseTo(0.7);
      expect(c.g).toBeCloseTo(0.4);
      expect(c.b).toBeCloseTo(0.65);
    });

    it('returns the same Color instance for chaining', () => {
      const result = c.addColors(c1, c2);
      expect(result).toBe(c);
    });

    it('can handle zero colors', () => {
      const zero = new Color(0, 0, 0);
      c.addColors(c1, zero);

      expect(c.r).toBeCloseTo(0.2);
      expect(c.g).toBeCloseTo(0.3);
      expect(c.b).toBeCloseTo(0.4);
    });

    it('can handle negative values', () => {
      const neg = new Color(-0.1, -0.2, -0.3);
      c.addColors(c1, neg);

      expect(c.r).toBeCloseTo(0.1);
      expect(c.g).toBeCloseTo(0.1);
      expect(c.b).toBeCloseTo(0.1);
    });

    it('can exceed 1 without clamping', () => {
      const large = new Color(1, 1, 1);
      c.addColors(c1, large);

      expect(c.r).toBeCloseTo(1.2);
      expect(c.g).toBeCloseTo(1.3);
      expect(c.b).toBeCloseTo(1.4);
    });
  });

  describe('addScalar()', () => {
    let c: Color;

    beforeEach(() => {
      c = new Color(0.2, 0.3, 0.4);
    });

    it('adds scalar to all RGB components', () => {
      c.addScalar(0.1);

      expect(c.r).toBeCloseTo(0.3);
      expect(c.g).toBeCloseTo(0.4);
      expect(c.b).toBeCloseTo(0.5);
    });

    it('supports negative scalar values', () => {
      c.addScalar(-0.2);

      expect(c.r).toBeCloseTo(0.0);
      expect(c.g).toBeCloseTo(0.1);
      expect(c.b).toBeCloseTo(0.2);
    });

    it('supports chaining', () => {
      const result = c.addScalar(0.1);
      expect(result).toBe(c);
    });

    it('can exceed 1 without clamping', () => {
      c.addScalar(0.9);

      expect(c.r).toBeCloseTo(1.1);
      expect(c.g).toBeCloseTo(1.2);
      expect(c.b).toBeCloseTo(1.3);
    });

    it('can add 0 without changing the color', () => {
      c.addScalar(0);

      expect(c.r).toBeCloseTo(0.2);
      expect(c.g).toBeCloseTo(0.3);
      expect(c.b).toBeCloseTo(0.4);
    });
  });

  describe('sub()', () => {
    let c: Color;

    beforeEach(() => {
      c = new Color(0.6, 0.5, 0.4);
    });

    it('subtracts another color from this color', () => {
      const other = new Color(0.2, 0.3, 0.1);
      c.sub(other);

      expect(c.r).toBeCloseTo(0.4);
      expect(c.g).toBeCloseTo(0.2);
      expect(c.b).toBeCloseTo(0.3);
    });

    it('clamps values at 0', () => {
      const other = new Color(0.7, 0.6, 0.5);
      c.sub(other);

      expect(c.r).toBeCloseTo(0);
      expect(c.g).toBeCloseTo(0);
      expect(c.b).toBeCloseTo(0);
    });

    it('supports chaining', () => {
      const other = new Color(0.1, 0.1, 0.1);
      const result = c.sub(other);
      expect(result).toBe(c);
    });

    it('subtracting zero has no effect', () => {
      const other = new Color(0, 0, 0);
      c.sub(other);

      expect(c.r).toBeCloseTo(0.6);
      expect(c.g).toBeCloseTo(0.5);
      expect(c.b).toBeCloseTo(0.4);
    });

    it('subtracting itself results in zero', () => {
      const other = new Color(0.6, 0.5, 0.4);
      c.sub(other);

      expect(c.r).toBeCloseTo(0);
      expect(c.g).toBeCloseTo(0);
      expect(c.b).toBeCloseTo(0);
    });
  });

  describe('multiply()', () => {
    let c: Color;

    beforeEach(() => {
      c = new Color(0.5, 0.4, 0.3);
    });

    it('multiplies this color with another color', () => {
      const other = new Color(2, 0.5, 1);
      c.multiply(other);

      expect(c.r).toBeCloseTo(1.0);
      expect(c.g).toBeCloseTo(0.2);
      expect(c.b).toBeCloseTo(0.3);
    });

    it('multiplying by zero results in zero', () => {
      const other = new Color(0, 0, 0);
      c.multiply(other);

      expect(c.r).toBeCloseTo(0);
      expect(c.g).toBeCloseTo(0);
      expect(c.b).toBeCloseTo(0);
    });

    it('multiplying by one leaves the color unchanged', () => {
      const other = new Color(1, 1, 1);
      c.multiply(other);

      expect(c.r).toBeCloseTo(0.5);
      expect(c.g).toBeCloseTo(0.4);
      expect(c.b).toBeCloseTo(0.3);
    });

    it('supports chaining', () => {
      const other = new Color(0.2, 0.3, 0.4);
      const result = c.multiply(other);
      expect(result).toBe(c);
    });

    it('multiplying by itself squares the values', () => {
      c.multiply(c);

      expect(c.r).toBeCloseTo(0.25);
      expect(c.g).toBeCloseTo(0.16);
      expect(c.b).toBeCloseTo(0.09);
    });
  });

  describe('multiplyScalar()', () => {
    let c: Color;

    beforeEach(() => {
      c = new Color(0.5, 0.4, 0.3);
    });

    it('multiplies this color by a positive scalar', () => {
      c.multiplyScalar(2);

      expect(c.r).toBeCloseTo(1.0);
      expect(c.g).toBeCloseTo(0.8);
      expect(c.b).toBeCloseTo(0.6);
    });

    it('multiplying by zero results in zero', () => {
      c.multiplyScalar(0);

      expect(c.r).toBeCloseTo(0);
      expect(c.g).toBeCloseTo(0);
      expect(c.b).toBeCloseTo(0);
    });

    it('multiplying by one leaves the color unchanged', () => {
      c.multiplyScalar(1);

      expect(c.r).toBeCloseTo(0.5);
      expect(c.g).toBeCloseTo(0.4);
      expect(c.b).toBeCloseTo(0.3);
    });

    it('supports chaining', () => {
      const result = c.multiplyScalar(1.5);
      expect(result).toBe(c);
    });

    it('multiplies by a negative scalar', () => {
      c.multiplyScalar(-1);

      expect(c.r).toBeCloseTo(-0.5);
      expect(c.g).toBeCloseTo(-0.4);
      expect(c.b).toBeCloseTo(-0.3);
    });
  });

  describe('lerp()', () => {
    let c: Color;
    let target: Color;

    beforeEach(() => {
      c = new Color(0.0, 0.5, 1.0);
      target = new Color(1.0, 0.0, 0.5);
    });

    it('lerps with alpha = 0 returns the original color', () => {
      const result = c.lerp(target, 0);

      expect(result.r).toBeCloseTo(0.0);
      expect(result.g).toBeCloseTo(0.5);
      expect(result.b).toBeCloseTo(1.0);
    });

    it('lerps with alpha = 1 returns the target color', () => {
      const result = c.lerp(target, 1);

      expect(result.r).toBeCloseTo(1.0);
      expect(result.g).toBeCloseTo(0.0);
      expect(result.b).toBeCloseTo(0.5);
    });

    it('lerps with alpha = 0.5 returns the midpoint color', () => {
      const result = c.lerp(target, 0.5);

      expect(result.r).toBeCloseTo(0.5);
      expect(result.g).toBeCloseTo(0.25);
      expect(result.b).toBeCloseTo(0.75);
    });

    it('supports chaining', () => {
      const result = c.lerp(target, 0.3);
      expect(result).toBe(c);
    });

    it('lerps with alpha > 1 extrapolates beyond target', () => {
      const result = c.lerp(target, 1.5);

      expect(result.r).toBeCloseTo(1.5);
      expect(result.g).toBeCloseTo(-0.25);
      expect(result.b).toBeCloseTo(0.25);
    });

    it('lerps with alpha < 0 extrapolates before original', () => {
      const result = c.lerp(target, -0.5);

      expect(result.r).toBeCloseTo(-0.5);
      expect(result.g).toBeCloseTo(0.75);
      expect(result.b).toBeCloseTo(1.25);
    });
  });

  describe('lerpColors()', () => {
    let c: Color;
    let color1: Color;
    let color2: Color;

    beforeEach(() => {
      c = new Color(0, 0, 0);
      color1 = new Color(0.0, 0.5, 1.0);
      color2 = new Color(1.0, 0.0, 0.5);
    });

    it('lerps with alpha = 0 returns the first color', () => {
      const result = c.lerpColors(color1, color2, 0);

      expect(result.r).toBeCloseTo(color1.r);
      expect(result.g).toBeCloseTo(color1.g);
      expect(result.b).toBeCloseTo(color1.b);
    });

    it('lerps with alpha = 1 returns the second color', () => {
      const result = c.lerpColors(color1, color2, 1);

      expect(result.r).toBeCloseTo(color2.r);
      expect(result.g).toBeCloseTo(color2.g);
      expect(result.b).toBeCloseTo(color2.b);
    });

    it('lerps with alpha = 0.5 returns the midpoint color', () => {
      const result = c.lerpColors(color1, color2, 0.5);

      expect(result.r).toBeCloseTo(0.5);
      expect(result.g).toBeCloseTo(0.25);
      expect(result.b).toBeCloseTo(0.75);
    });

    it('supports chaining', () => {
      const result = c.lerpColors(color1, color2, 0.3);
      expect(result).toBe(c);
    });

    it('lerps with alpha > 1 extrapolates beyond the second color', () => {
      const result = c.lerpColors(color1, color2, 1.5);

      expect(result.r).toBeCloseTo(1.5);
      expect(result.g).toBeCloseTo(-0.25);
      expect(result.b).toBeCloseTo(0.25);
    });

    it('lerps with alpha < 0 extrapolates before the first color', () => {
      const result = c.lerpColors(color1, color2, -0.5);

      expect(result.r).toBeCloseTo(-0.5);
      expect(result.g).toBeCloseTo(0.75);
      expect(result.b).toBeCloseTo(1.25);
    });
  });

  describe('lerpHSL()', () => {
    let c: Color;
    let color1: Color;
    let color2: Color;

    beforeEach(() => {
      c = new Color(0, 0, 0);
      color1 = new Color().setHSL(0.0, 0.5, 0.25); // red-ish
      color2 = new Color().setHSL(0.5, 1.0, 0.75); // cyan-ish
    });

    it('lerps with alpha = 0 returns the original color', () => {
      const result = c.lerpHSL(color1, 0);

      expect(result).toBe(c); // chaining
      const hsl: any = {};
      result.getHSL(hsl);
      const hslOriginal: any = {};
      c.getHSL(hslOriginal);

      expect(hsl.h).toBeCloseTo(hslOriginal.h);
      expect(hsl.s).toBeCloseTo(hslOriginal.s);
      expect(hsl.l).toBeCloseTo(hslOriginal.l);
    });

    it('lerps with alpha = 1 returns the target color', () => {
      const result = c.lerpHSL(color1, 1);

      const hsl: any = {};
      result.getHSL(hsl);
      const hslTarget: any = {};
      color1.getHSL(hslTarget);

      expect(hsl.h).toBeCloseTo(hslTarget.h);
      expect(hsl.s).toBeCloseTo(hslTarget.s);
      expect(hsl.l).toBeCloseTo(hslTarget.l);
    });

    it.skip('lerps with alpha = 0.5 returns the midpoint HSL', () => {
      c.setHSL(0.0, 0.5, 0.25); // start color
      const result = c.lerpHSL(color2, 0.5);

      const hsl: any = {};
      result.getHSL(hsl);

      const hslStart: any = {};
      c.getHSL(hslStart);

      const hslEnd: any = {};
      color2.getHSL(hslEnd);

      expect(hsl.h).toBeCloseTo(lerp(hslStart.h, hslEnd.h, 0.5));
      expect(hsl.s).toBeCloseTo(lerp(hslStart.s, hslEnd.s, 0.5));
      expect(hsl.l).toBeCloseTo(lerp(hslStart.l, hslEnd.l, 0.5));
    });

    it('supports chaining', () => {
      const result = c.lerpHSL(color1, 0.3);
      expect(result).toBe(c);
    });

    it.skip('lerps HSL correctly with alpha > 1 (extrapolation)', () => {
      c.setHSL(0.0, 0.5, 0.25);
      const result = c.lerpHSL(color2, 1.5);

      const hsl: any = {};
      result.getHSL(hsl);
      const hslStart: any = {};
      c.getHSL(hslStart);
      const hslEnd: any = {};
      color2.getHSL(hslEnd);

      expect(hsl.h).toBeCloseTo(lerp(hslStart.h, hslEnd.h, 1.5));
      expect(hsl.s).toBeCloseTo(lerp(hslStart.s, hslEnd.s, 1.5));
      expect(hsl.l).toBeCloseTo(lerp(hslStart.l, hslEnd.l, 1.5));
    });
  });

  describe('setFromVector3()', () => {
    let c: Color;
    let v: Vector3;

    beforeEach(() => {
      c = new Color(0, 0, 0);
      v = new Vector3(0.1, 0.5, 0.9);
    });

    it('sets the color from a Vector3', () => {
      c.setFromVector3(v);

      expect(c.r).toBeCloseTo(v.x);
      expect(c.g).toBeCloseTo(v.y);
      expect(c.b).toBeCloseTo(v.z);
    });

    it('supports chaining', () => {
      const result = c.setFromVector3(v);
      expect(result).toBe(c);
    });

    it('overwrites previous RGB values', () => {
      c.r = 1;
      c.g = 1;
      c.b = 1;

      c.setFromVector3(v);

      expect(c.r).toBeCloseTo(v.x);
      expect(c.g).toBeCloseTo(v.y);
      expect(c.b).toBeCloseTo(v.z);
    });

    it('handles zero vector', () => {
      const zero = new Vector3(0, 0, 0);
      c.setFromVector3(zero);

      expect(c.r).toBe(0);
      expect(c.g).toBe(0);
      expect(c.b).toBe(0);
    });
  });

  describe('applyMatrix3()', () => {
    let c: Color;
    let m: Matrix3;

    beforeEach(() => {
      c = new Color(1, 2, 3);
    });

    it('applies the matrix to the color', () => {
      m = new Matrix3().set(
        1, 0, 0,
        0, 2, 0,
        0, 0, 3
      );

      c.applyMatrix3(m);

      expect(c.r).toBeCloseTo(1); // 1*1 + 0*2 + 0*3
      expect(c.g).toBeCloseTo(4); // 0*1 + 2*2 + 0*3
      expect(c.b).toBeCloseTo(9); // 0*1 + 0*2 + 3*3
    });

    it('supports chaining', () => {
      m = new Matrix3().identity();
      const result = c.applyMatrix3(m);
      expect(result).toBe(c);
    });

    it('handles identity matrix without changing color', () => {
      m = new Matrix3().identity();

      const rBefore = c.r;
      const gBefore = c.g;
      const bBefore = c.b;

      c.applyMatrix3(m);

      expect(c.r).toBeCloseTo(rBefore);
      expect(c.g).toBeCloseTo(gBefore);
      expect(c.b).toBeCloseTo(bBefore);
    });

    it('works with zero matrix', () => {
      m = new Matrix3().set(
        0, 0, 0,
        0, 0, 0,
        0, 0, 0
      );

      c.applyMatrix3(m);

      expect(c.r).toBeCloseTo(0);
      expect(c.g).toBeCloseTo(0);
      expect(c.b).toBeCloseTo(0);
    });
  });

  describe('equals()', () => {
    it('returns true for colors with identical RGB values', () => {
      const c1 = new Color(0.1, 0.5, 0.9);
      const c2 = new Color(0.1, 0.5, 0.9);

      expect(c1.equals(c2)).toBe(true);
    });

    it('returns false if red channel differs', () => {
      const c1 = new Color(0.1, 0.5, 0.9);
      const c2 = new Color(0.2, 0.5, 0.9);

      expect(c1.equals(c2)).toBe(false);
    });

    it('returns false if green channel differs', () => {
      const c1 = new Color(0.1, 0.5, 0.9);
      const c2 = new Color(0.1, 0.6, 0.9);

      expect(c1.equals(c2)).toBe(false);
    });

    it('returns false if blue channel differs', () => {
      const c1 = new Color(0.1, 0.5, 0.9);
      const c2 = new Color(0.1, 0.5, 0.8);

      expect(c1.equals(c2)).toBe(false);
    });

    it('returns true when comparing color to itself', () => {
      const c = new Color(0.3, 0.7, 0.2);
      expect(c.equals(c)).toBe(true);
    });
  });

  describe('fromArray()', () => {
    it('sets RGB values from the beginning of an array', () => {
      const c = new Color();
      const arr = [0.1, 0.5, 0.9];

      c.fromArray(arr);

      expect(c.r).toBeCloseTo(0.1);
      expect(c.g).toBeCloseTo(0.5);
      expect(c.b).toBeCloseTo(0.9);
    });

    it('sets RGB values using an offset', () => {
      const c = new Color();
      const arr = [0, 0, 0, 0.2, 0.4, 0.6];

      c.fromArray(arr, 3);

      expect(c.r).toBeCloseTo(0.2);
      expect(c.g).toBeCloseTo(0.4);
      expect(c.b).toBeCloseTo(0.6);
    });

    it('returns the same instance for chaining', () => {
      const c = new Color();
      const arr = [0.3, 0.6, 0.9];

      const result = c.fromArray(arr);

      expect(result).toBe(c);
    });

    it.skip('handles negative offset', () => {
      const c = new Color();
      const arr = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6];

      c.fromArray(arr, -3);

      expect(c.r).toBeCloseTo(0.4);
      expect(c.g).toBeCloseTo(0.5);
      expect(c.b).toBeCloseTo(0.6);
    });
  });

  describe('toArray()', () => {
    it('writes RGB values to a provided array starting at offset 0', () => {
      const c = new Color(0.1, 0.5, 0.9);
      const arr: number[] = [];

      const result = c.toArray(arr);

      expect(result).toEqual([0.1, 0.5, 0.9]);
      expect(result).toBe(arr); // should return the same array
    });

    it('writes RGB values to a provided array with an offset', () => {
      const c = new Color(0.2, 0.4, 0.6);
      const arr = [0, 0, 0, 0, 0];

      const result = c.toArray(arr, 1);

      expect(result).toEqual([0, 0.2, 0.4, 0.6, 0]);
    });

    it('creates and returns a new array if none is provided', () => {
      const c = new Color(0.3, 0.6, 0.9);

      const result = c.toArray();

      expect(result).toEqual([0.3, 0.6, 0.9]);
    });

    it('returns the same array instance if provided', () => {
      const c = new Color(0.4, 0.5, 0.6);
      const arr: number[] = [0, 0, 0];

      const result = c.toArray(arr);

      expect(result).toBe(arr);
    });
  });

  describe('fromBufferAttribute()', () => {
it('sets RGB components from the buffer attribute at the given index', () => {
      // Mock BufferAttribute
      const attribute = {
        getX: vi.fn((i: number) => i + 0.1),
        getY: vi.fn((i: number) => i + 0.2),
        getZ: vi.fn((i: number) => i + 0.3),
      } as unknown as BufferAttribute;

      const color = new Color(0, 0, 0);

      color.fromBufferAttribute(attribute, 5);

      expect(color.r).toBeCloseTo(5.1);
      expect(color.g).toBeCloseTo(5.2);
      expect(color.b).toBeCloseTo(5.3);

      // Ensure BufferAttribute methods were called with correct index
      expect(attribute.getX).toHaveBeenCalledWith(5);
      expect(attribute.getY).toHaveBeenCalledWith(5);
      expect(attribute.getZ).toHaveBeenCalledWith(5);
    });

    it('returns itself for chaining', () => {
      const attribute = {
        getX: () => 1,
        getY: () => 2,
        getZ: () => 3,
      } as unknown as BufferAttribute;

      const color = new Color(0, 0, 0);
      const result = color.fromBufferAttribute(attribute, 0);

      expect(result).toBe(color);
    });
  });

  describe('toJSON()', () => {
    it('returns the hexadecimal value of the color', () => {
      const color = new Color(1, 0.5, 0); // RGB: (1, 0.5, 0)

      // Stub getHex to make test predictable
      const spy = vi.spyOn(color, 'getHex').mockReturnValue(0xff8000);

      const jsonValue = color.toJSON();

      expect(jsonValue).toBe(0xff8000);
      expect(spy).toHaveBeenCalled();

      spy.mockRestore();
    });

    it('returns a number, not a string', () => {
      const color = new Color(0.1, 0.2, 0.3);
      const jsonValue = color.toJSON();
      expect(typeof jsonValue).toBe('number');
    });
  });
});
