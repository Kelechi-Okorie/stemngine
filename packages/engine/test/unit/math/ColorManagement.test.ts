import { describe, it, expect, beforeEach, vi } from "vitest";
import { Color } from "../../../src/math/Color";
import { ColorManagement, SRGBToLinear, LinearToSRGB, ColorManagementSpaces } from "../../../src/math/ColorManagement";
import { LinearSRGBColorSpace, LinearTransfer, NoColorSpace, SRGBColorSpace, SRGBTransfer } from "../../../src/constants";

describe("ColorManagement", () => {
  describe.skip('Initialization', () => {
    it('defines color spaces correctly on initialization', () => {
      const cm = ColorManagement.instance; // singleton instance

      const linear = cm.spaces[0];
      const srgb = cm.spaces[1];

      expect(linear).toBeDefined();
      expect(linear.primaries).toBeDefined();
      expect(linear.whitePoint).toBeDefined();
      expect(linear.transfer).toBeDefined();
      expect(linear.toXYZ).toBeDefined();
      expect(linear.fromXYZ).toBeDefined();
      expect(linear.luminanceCoefficients).toBeDefined();
      // expect(linear.workingColorSpaceConfig.unpackColorSpace).toBe(SRGBColorSpace);
      // expect(linear.outputColorSpaceConfig.drawingBufferColorSpace).toBe(SRGBColorSpace);

      expect(srgb).toBeDefined();
      expect(srgb.primaries).toBeDefined();
      expect(srgb.whitePoint).toBeDefined();
      expect(srgb.transfer).toBeDefined();
      expect(srgb.toXYZ).toBeDefined();
      expect(srgb.fromXYZ).toBeDefined();
      expect(srgb.luminanceCoefficients).toBeDefined();
      // expect(srgb.outputColorSpaceConfig.drawingBufferColorSpace).toBe(SRGBColorSpace);
    });
  })

  describe('convert()', () => {
    let cm: ColorManagement;

    beforeEach(() => {
      cm = ColorManagement.instance; // singleton instance
      cm.enabled = true;
    });

    it('returns the original color if disabled or source=target', () => {
      const color = new Color(0.5, 0.5, 0.5);
      cm.enabled = false;
      expect(cm.convert(color, SRGBColorSpace, LinearSRGBColorSpace)).toBe(color);

      cm.enabled = true;
      expect(cm.convert(color, SRGBColorSpace, SRGBColorSpace)).toBe(color);
    });

    it('applies SRGBToLinear if source has SRGBTransfer', () => {
      const color = new Color(0.5, 0.5, 0.5);
      const converted = cm.convert(color, SRGBColorSpace, LinearSRGBColorSpace);

      expect(converted.r).toBeCloseTo(SRGBToLinear(0.5));
      expect(converted.g).toBeCloseTo(SRGBToLinear(0.5));
      expect(converted.b).toBeCloseTo(SRGBToLinear(0.5));
    });

    it.skip('applies matrix conversion if primaries differ', () => {
      const color = new Color(0.2, 0.4, 0.6);

      // spy on applyMatrix3
      const applySpy = vi.spyOn(color, 'applyMatrix3');
      cm.convert(color, SRGBColorSpace, LinearSRGBColorSpace);

      expect(applySpy).toHaveBeenCalledTimes(2); // toXYZ and fromXYZ
    });

    it('applies LinearToSRGB if target has SRGBTransfer', () => {
      const color = new Color(0.5, 0.5, 0.5);
      const converted = cm.convert(color, LinearSRGBColorSpace, SRGBColorSpace);

      expect(converted.r).toBeCloseTo(LinearToSRGB(0.5));
      expect(converted.g).toBeCloseTo(LinearToSRGB(0.5));
      expect(converted.b).toBeCloseTo(LinearToSRGB(0.5));
    });
  });

  describe('workingToColorSpace()', () => {
    let cm: ColorManagement;

    beforeEach(() => {
      cm = ColorManagement.instance;
      cm.enabled = true;
      cm.workingColorSpace = SRGBColorSpace;
    });

    it('calls convert with workingColorSpace as source', () => {
      const color = new Color(0.5, 0.5, 0.5);
      const convertSpy = vi.spyOn(cm, 'convert');

      const targetColorSpace = LinearSRGBColorSpace;
      const result = cm.workingToColorSpace(color, targetColorSpace);

      expect(convertSpy).toHaveBeenCalledWith(color, SRGBColorSpace, targetColorSpace);
      expect(result).toBe(color); // convert returns the color itself
    });

    it('returns the same color instance', () => {
      const color = new Color(0.1, 0.2, 0.3);
      const result = cm.workingToColorSpace(color, LinearSRGBColorSpace);

      expect(result).toBe(color);
    });

    it('uses the current workingColorSpace as source', () => {
      cm.workingColorSpace = LinearSRGBColorSpace;
      const color = new Color(0.6, 0.4, 0.2);
      const convertSpy = vi.spyOn(cm, 'convert');

      cm.workingToColorSpace(color, SRGBColorSpace);

      expect(convertSpy).toHaveBeenCalledWith(color, LinearSRGBColorSpace, SRGBColorSpace);
    });
  });

  describe('colorSpaceToWorking()', () => {
    let cm: ColorManagement;

    beforeEach(() => {
      cm = ColorManagement.instance;
      cm.enabled = true;
      cm.workingColorSpace = SRGBColorSpace;
    });

    it('calls convert with the given source and workingColorSpace as target', () => {
      const color = new Color(0.3, 0.5, 0.7);
      const convertSpy = vi.spyOn(cm, 'convert');

      const sourceColorSpace = LinearSRGBColorSpace;
      const result = cm.colorSpaceToWorking(color, sourceColorSpace);

      expect(convertSpy).toHaveBeenCalledWith(color, sourceColorSpace, SRGBColorSpace);
      expect(result).toBe(color); // convert returns the color itself
    });

    it('returns the same color instance', () => {
      const color = new Color(0.2, 0.4, 0.6);
      const result = cm.colorSpaceToWorking(color, LinearSRGBColorSpace);

      expect(result).toBe(color);
    });

    it('uses the current workingColorSpace as target', () => {
      cm.workingColorSpace = LinearSRGBColorSpace;
      const color = new Color(0.1, 0.3, 0.5);
      const convertSpy = vi.spyOn(cm, 'convert');

      cm.colorSpaceToWorking(color, SRGBColorSpace);

      expect(convertSpy).toHaveBeenCalledWith(color, SRGBColorSpace, LinearSRGBColorSpace);
    });
  });

  describe('getPrimaries()', () => {
    let cm: ColorManagement;

    beforeEach(() => {
      cm = ColorManagement.instance;
    });

    it('returns the correct primaries for SRGBColorSpace', () => {
      const primaries = cm.getPrimaries(SRGBColorSpace);
      expect(primaries).toEqual(cm.spaces[SRGBColorSpace].primaries);
    });

    it('returns the correct primaries for LinearSRGBColorSpace', () => {
      const primaries = cm.getPrimaries(LinearSRGBColorSpace);
      expect(primaries).toEqual(cm.spaces[LinearSRGBColorSpace].primaries);
    });

    it('returns an array of numbers', () => {
      const primaries = cm.getPrimaries(SRGBColorSpace);
      expect(Array.isArray(primaries)).toBe(true);
      expect(primaries.every(n => typeof n === 'number')).toBe(true);
    });
  });

  describe('getTransfer()', () => {
    let cm: ColorManagement;

    beforeEach(() => {
      cm = ColorManagement.instance;
    });

    it('returns the correct transfer function for SRGBColorSpace', () => {
      const transfer = cm.getTransfer(SRGBColorSpace);
      expect(transfer).toBe(SRGBTransfer);
    });

    it('returns the correct transfer function for LinearSRGBColorSpace', () => {
      const transfer = cm.getTransfer(LinearSRGBColorSpace);
      expect(transfer).toBe(LinearTransfer);
    });

    it('returns LinearTransfer for NoColorSpace', () => {
      const transfer = cm.getTransfer(NoColorSpace);
      expect(transfer).toBe(LinearTransfer);
    });
  });

  describe('getToneMappingMode()', () => {
    let cm: ColorManagement;

    beforeEach(() => {
      cm = ColorManagement.instance;
    });

    it('returns "standard" if toneMappingMode is not defined', () => {
      const mode = cm.getToneMappingMode(SRGBColorSpace);
      expect(mode).toBe('standard');
    });
  });

  describe('getLuminanceCoefficients()', () => {
    let cm: ColorManagement;
    let target: Color;

    beforeEach(() => {
      cm = ColorManagement.instance;
      target = new Color();
    });

    it('populates the target Color with default workingColorSpace luminance coefficients', () => {
      const result = cm.getLuminanceCoefficients(target);
      expect(result).toBe(target); // returns same instance
      const expected = cm.spaces[cm.workingColorSpace].luminanceCoefficients;
      expect(result.toArray()).toEqual(expected);
    });

    it('populates the target Color with specified colorSpace luminance coefficients', () => {
      const result = cm.getLuminanceCoefficients(target, LinearSRGBColorSpace);
      expect(result).toBe(target); // returns same instance
      const expected = cm.spaces[LinearSRGBColorSpace].luminanceCoefficients;
      expect(result.toArray()).toEqual(expected);
    });
  });

  describe('define()', () => {
    let cm: ColorManagement;

    beforeEach(() => {
      cm = ColorManagement.instance;
      // Reset spaces for isolation
      cm.spaces = {};
    });

    it.skip('adds new color space definitions', () => {
      const newSpace = {
        [SRGBColorSpace]: {
          primaries: [0.64, 0.33, 0.03],
          whitePoint: [0.3127, 0.3290],
          transfer: (x: number) => x,
          toXYZ: [],
          fromXYZ: [],
          luminanceCoefficients: [0.2126, 0.7152, 0.0722],
          outputColorSpaceConfig: { drawingBufferColorSpace: SRGBColorSpace },
        },
      };

      // cm.define(newSpace);

      // expect(cm.spaces[SRGBColorSpace]).toBeDefined();
      // expect(cm.spaces[SRGBColorSpace].primaries).toEqual(newSpace[SRGBColorSpace].primaries);
      // expect(cm.spaces[SRGBColorSpace].luminanceCoefficients).toEqual(newSpace[SRGBColorSpace].luminanceCoefficients);
    });

    it.skip('merges with existing color space definitions', () => {
      const existing = {
        [SRGBColorSpace]: { primaries: [1, 1, 1] },
      };
      // cm.spaces = { ...existing };

      // const newSpace = {
      //   [SRGBColorSpace]: { primaries: [0.5, 0.5, 0.5] },
      // };

      // cm.define(newSpace);

      // expect(cm.spaces[SRGBColorSpace].primaries).toEqual([0.5, 0.5, 0.5]);
    });
  });
});

describe('SRGBToLinear()', () => {
  it('converts low sRGB values correctly (below threshold)', () => {
    const input = 0.02; // < 0.04045
    const expected = input * 0.0773993808;
    expect(SRGBToLinear(input)).toBeCloseTo(expected, 10);
  });

  it('converts high sRGB values correctly (above threshold)', () => {
    const input = 0.5; // > 0.04045
    const expected = Math.pow(input * 0.9478672986 + 0.0521327014, 2.4);
    expect(SRGBToLinear(input)).toBeCloseTo(expected, 10);
  });

  it('returns 0 for 0 input', () => {
    expect(SRGBToLinear(0)).toBeCloseTo(0, 10);
  });

  it('returns 1 for 1 input', () => {
    expect(SRGBToLinear(1)).toBeCloseTo(1, 10);
  });

  it('matches known values', () => {
    const testCases = [
      { input: 0.0, expected: 0.0 },
      { input: 0.018, expected: 0.018 * 0.0773993808 },
      { input: 0.5, expected: Math.pow(0.5 * 0.9478672986 + 0.0521327014, 2.4) },
      { input: 1.0, expected: 1.0 },
    ];

    for (const { input, expected } of testCases) {
      expect(SRGBToLinear(input)).toBeCloseTo(expected, 10);
    }
  });
});

describe('LinearToSRGB()', () => {
  it('converts low linear values correctly (below threshold)', () => {
    const input = 0.002; // < 0.0031308
    const expected = input * 12.92;
    expect(LinearToSRGB(input)).toBeCloseTo(expected, 10);
  });

  it('converts high linear values correctly (above threshold)', () => {
    const input = 0.5; // > 0.0031308
    const expected = 1.055 * Math.pow(input, 0.41666) - 0.055;
    expect(LinearToSRGB(input)).toBeCloseTo(expected, 10);
  });

  it('returns 0 for 0 input', () => {
    expect(LinearToSRGB(0)).toBeCloseTo(0, 10);
  });

  it('returns 1 for 1 input', () => {
    expect(LinearToSRGB(1)).toBeCloseTo(1, 10);
  });

  it('matches known values', () => {
    const testCases = [
      { input: 0.0, expected: 0.0 },
      { input: 0.001, expected: 0.001 * 12.92 },
      { input: 0.5, expected: 1.055 * Math.pow(0.5, 0.41666) - 0.055 },
      { input: 1.0, expected: 1.0 },
    ];

    for (const { input, expected } of testCases) {
      expect(LinearToSRGB(input)).toBeCloseTo(expected, 10);
    }
  });
});
