import {
  ColorSpace,
  SRGBColorSpace,
  LinearSRGBColorSpace,
  SRGBTransfer,
  LinearTransfer,
  NoColorSpace
} from '../constants.js';

import { Matrix3 } from './Matrix3.js';
import { warnOnce } from '../utils.js';
import { Color } from './Color.js';

/* ------------------------------------------------------------------------- */
/* XYZ Conversion Matrices */
/* ------------------------------------------------------------------------- */

const LINEAR_REC709_TO_XYZ = new Matrix3().set(
  0.4123908, 0.3575843, 0.1804808,
  0.2126390, 0.7151687, 0.0721923,
  0.0193308, 0.1191948, 0.9505322
);

const XYZ_TO_LINEAR_REC709 = new Matrix3().set(
  3.2409699, -1.5373832, -0.4986108,
  -0.9692436, 1.8759675, 0.0415551,
  0.0556301, -0.2039770, 1.0569715
);

/* ------------------------------------------------------------------------- */
/* Type Definitions */
/* ------------------------------------------------------------------------- */

export type ToneMappingMode = 'standard' | 'extended';

type TransferType = typeof LinearTransfer | typeof SRGBTransfer;

export interface ColorSpaceDefinition {
  primaries: number[];
  whitePoint: number[];
  transfer: TransferType;
  toXYZ: Matrix3;
  fromXYZ: Matrix3;
  luminanceCoefficients: number[];
  workingColorSpaceConfig?: { unpackColorSpace: ColorSpace };
  outputColorSpaceConfig?: { drawingBufferColorSpace: ColorSpace; toneMappingMode?: ToneMappingMode };
}

export type ColorManagementSpaces = Record<ColorSpace, ColorSpaceDefinition>;

/******************************************************************************
 * sRGB definitions
 */

const REC709_PRIMARIES = [0.640, 0.330, 0.300, 0.600, 0.150, 0.060];
const REC709_LUMINANCE_COEFFICIENTS = [0.2126, 0.7152, 0.0722];
const D65 = [0.3127, 0.3290];


/* ------------------------------------------------------------------------- */
/* Color Management Class */
/* ------------------------------------------------------------------------- */
/**
 *
 * @remarks
 * A utility that handles conversions between different color spaces for rendering
 * This ensures colors are correctly interpreted on different devices and with
 * different pipelines (linear vs sRGB, etc).
  *
  * Purpose
  * Computers and monitors often use differet color representations
  * The most common are sRGB (standard RGB for screens) and linear RGB (for physically
  * accurate lighting computations).
  * ColorManagement manages conversions between these spaces, so that colors render
  * correctly, especially with lighting and tone mapping
*/

export class ColorManagement {
  // Singleton instance
  private static _instance: ColorManagement;

  /**
   * Boolean to enable or disable color management.
   * if false, colors are left as-is
   */
  public enabled = true;

  /**
   * The internal color space used for computations, usually LinearSRGBColorSpace
   * You convert colors to this space for lighting calculations and from it to display
   */
  public workingColorSpace: ColorSpace = LinearSRGBColorSpace;

  /**
   * An object storing definitions of supported color spaces.
   *
   * Required:
   *	- primaries: chromaticity coordinates [ rx ry gx gy bx by ]
    *	- whitePoint: reference white [ x y ]
    *	- transfer: gamma or transfer function (linear or sRGB curve) (pre-defined)
    *	- toXYZ: Matrix3 RGB to XYZ transform
    *	- fromXYZ: Matrix3 XYZ to RGB transform
    *	- luminanceCoefficients: RGB luminance coefficients
    *
    * Optional:
    *  - outputColorSpaceConfig: { drawingBufferColorSpace: ColorSpace, toneMappingMode: 'extended' | 'standard' }
    *  - workingColorSpaceConfig: { unpackColorSpace: ColorSpace }
    *
    * Reference:
    * - https://www.russellcottrell.com/photo/matrixCalculator.htm
    */
  public spaces: ColorManagementSpaces = {};

  /**
   * Constructs a new ColorManagement instance.
   */
  private constructor() {
    this.define({
      [LinearSRGBColorSpace]: {
        primaries: REC709_PRIMARIES,
        whitePoint: D65,
        transfer: LinearTransfer,
        toXYZ: LINEAR_REC709_TO_XYZ,
        fromXYZ: XYZ_TO_LINEAR_REC709,
        luminanceCoefficients: REC709_LUMINANCE_COEFFICIENTS,
        workingColorSpaceConfig: { unpackColorSpace: SRGBColorSpace },
        outputColorSpaceConfig: { drawingBufferColorSpace: SRGBColorSpace },
      },
      [SRGBColorSpace]: {
        primaries: REC709_PRIMARIES,
        whitePoint: D65,
        transfer: SRGBTransfer,
        toXYZ: LINEAR_REC709_TO_XYZ,
        fromXYZ: XYZ_TO_LINEAR_REC709,
        luminanceCoefficients: REC709_LUMINANCE_COEFFICIENTS,
        outputColorSpaceConfig: { drawingBufferColorSpace: SRGBColorSpace },
      },
    });
  }

  // public accessor for the singleton instance
  public static get instance(): ColorManagement {
    if (!this._instance) {
      this._instance = new ColorManagement();
    }

    return this._instance;
  }

  /**
   * Converts a Color from sourceColorSpace to targetColorSpace.
   *
   * @remarks
   * Hangled transfer functions and RGB <-> XYZ conversions if needed
   *
   * @param color - The Color to convert.
   * @param sourceColorSpace - The source color space.
   * @param targetColorSpace - The target color space.
   * @returns The converted Color.
   */
  public convert(color: Color, sourceColorSpace: ColorSpace, targetColorSpace: ColorSpace): Color {
    if (
      this.enabled === false ||
      sourceColorSpace === targetColorSpace ||
      !sourceColorSpace ||
      !targetColorSpace
    ) {

      return color;

    }

    if (this.spaces[sourceColorSpace].transfer === SRGBTransfer) {

      color.r = SRGBToLinear(color.r);
      color.g = SRGBToLinear(color.g);
      color.b = SRGBToLinear(color.b);

    }

    if (this.spaces[sourceColorSpace].primaries !== this.spaces[targetColorSpace].primaries) {

      color.applyMatrix3(this.spaces[sourceColorSpace].toXYZ);
      color.applyMatrix3(this.spaces[targetColorSpace].fromXYZ);

    }

    if (this.spaces[targetColorSpace].transfer === SRGBTransfer) {

      color.r = LinearToSRGB(color.r);
      color.g = LinearToSRGB(color.g);
      color.b = LinearToSRGB(color.b);

    }

    return color;
  }

  /**
   * Converts a color from the working color space to the target color space.
   *
   * @param color
   * @param targetColorSpace
   * @returns
   */
  public workingToColorSpace(color: Color, targetColorSpace: ColorSpace): Color {
    return this.convert(color, this.workingColorSpace, targetColorSpace);
  }

  /**
   * Converts a color from a source space to the working color space.
   * @param color
   * @param sourceColorSpace
   * @returns
   */
  public colorSpaceToWorking(color: Color, sourceColorSpace: ColorSpace): Color {
    return this.convert(color, sourceColorSpace, this.workingColorSpace);
  }

  /**
   * Returns RGB primaries for a color space
   * @param colorSpace
   * @returns
   */
  public getPrimaries(colorSpace: ColorSpace): number[] {
    return this.spaces[colorSpace].primaries;
  }

  /**
   * Returns the gamma / transfer function for a color space
   * @param colorSpace
   * @returns
   */
  public getTransfer(colorSpace: ColorSpace): TransferType {
    if (colorSpace === NoColorSpace) return LinearTransfer;

    return this.spaces[colorSpace].transfer;
  }

  /**
   * Returns the tone mapping mode for a given color space
   *
   * @param colorSpace
   * @returns The tone mapping mode
   */
  public getToneMappingMode(colorSpace: ColorSpace): ToneMappingMode {
    return this.spaces[colorSpace].outputColorSpaceConfig?.toneMappingMode ?? 'standard';
  }

  /**
   * Populates the target Color with the luminance coefficients for a color space
   * @param target
   * @param colorSpace
   * @returns The target Color populated with luminance coefficients
   */
  public getLuminanceCoefficients(target: Color, colorSpace: ColorSpace = this.workingColorSpace): Color {
    return target.fromArray(this.spaces[colorSpace]!.luminanceCoefficients);
  }

  /**
   * Adds new color space definitions to the ColorManagement instance.
   * @param colorSpaces
   */
  public define(colorSpaces: ColorManagementSpaces): void {
    Object.assign(this.spaces, colorSpaces);
  }

  /**
   * Returns a matrix to convert from source to target color space
   * @param targetMatrix
   * @param sourceColorSpace
   * @param targetColorSpace
   * @returns
   */
  public _getMatrix(targetMatrix: Matrix3, sourceColorSpace: ColorSpace, targetColorSpace: ColorSpace): Matrix3 {
    return targetMatrix
      .copy(this.spaces[sourceColorSpace].toXYZ)
      .multiply(this.spaces[targetColorSpace].fromXYZ);
  }

  /**
   * Returns the drawing buffer color space for a given color space
   *
   * @remarks
   * IF the color space does not have an explicit drawing buffer color space defined,
   * it defaults to SRGBColorSpace
   *
   * @param colorSpace
   * @returns
   */
  public _getDrawingBufferColorSpace(colorSpace: ColorSpace): /* ColorSpace */ PredefinedColorSpace {
    // return this.spaces[colorSpace]?.outputColorSpaceConfig?.drawingBufferColorSpace ?? SRGBColorSpace;

    const cs = this.spaces[colorSpace]?.outputColorSpaceConfig?.drawingBufferColorSpace;

    if (cs === "display-p3") return "display-p3";
    return "srgb"; // default fallback
  }

  /**
   * Returns the unpack color space for a given color space
   *
   * @remarks
   * This is typically used when reading or unpacking colors in a texture or buffer
   * If the working color space does not have an explicit unpack color space defined,
   * it defaults to LinearSRGBColorSpace
   *
   * @param colorSpace
   * @returns
   */
  public _getUnpackColorSpace(colorSpace: ColorSpace): /* ColorSpace */ PredefinedColorSpace {
    // return this.spaces[colorSpace]?.workingColorSpaceConfig?.unpackColorSpace ?? LinearSRGBColorSpace;

    const cs = this.spaces[colorSpace]?.workingColorSpaceConfig?.unpackColorSpace;

    if (cs === "display-p3") return "display-p3";
    return "srgb"; // default fallback

  }

}

/**
 * Converts an sRGB-encoded color value to linear RGB.
 *
 * Computers and monitors often store colors in sRGB for perceptual uniformity.
 * For physically accurate lighting calculations, colors need to be in linear space.
 *
 * @param c - The sRGB color component (in the range [0, 1]).
 * @returns The corresponding linear RGB component.
 */
export function SRGBToLinear(c: number): number {

  return (c < 0.04045) ? c * 0.0773993808 : Math.pow(c * 0.9478672986 + 0.0521327014, 2.4);

}

/**
 * Converts a linear RGB color value to sRGB encoding.
 *
 * This is the inverse of SRGBToLinear, used for displaying colors on screens.
 *
 * @param c - The linear RGB component (in the range [0, 1]).
 * @returns The corresponding sRGB component.
 */
export function LinearToSRGB(c: number) {

  return (c < 0.0031308) ? c * 12.92 : 1.055 * (Math.pow(c, 0.41666)) - 0.055;

}
