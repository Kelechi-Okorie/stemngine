/**
 * This type represents mouse buttons and interaction types in context of controls.
 */
interface ConstantsMouse {
  MIDDLE: number;
  LEFT: number;
  RIGHT: number;
  ROTATE: number;
  DOLLY: number;
  PAN: number;
}

/**
 * This type represents touch interaction types in context of controls.
 */
interface ConstantsTouch {
  ROTATE: number;
  PAN: number;
  DOLLY_PAN: number;
  DOLLY_ROTATE: number;
}

/**
 * This type represents the different timestamp query types.
 */
interface ConstantsTimestampQuery {
  COMPUTE: string;
  RENDER: string;
}

/**
 * Represents the different interpolation sampling types.
 */
interface ConstantsInterpolationSamplingType {
  PERSPECTIVE: string;
  LINEAR: string;
  FLAT: string;
}

/**
 * Represents the different interpolation sampling modes.
 */
interface ConstantsInterpolationSamplingMode {
  NORMAL: string;
  CENTROID: string;
  SAMPLE: string;
  // exists in the interface but not in the object that implements the interface
  // and source does not use them either in its documentations
  // FLAT_FIRST: string;
  // FLAT_EITHER: string;
  FIRST: string;
  EITHER: string;
}

export interface WritableArrayLike<T> {
  readonly length: number;
  [index: number]: T;
}

export type CoordinateSystem = typeof WebGLCoordinateSystem | typeof WebGPUCoordinateSystem;

export type BufferUsage = typeof StaticDrawUsage | typeof DynamicDrawUsage | typeof StreamDrawUsage | typeof StaticReadUsage | typeof DynamicReadUsage | typeof StreamReadUsage | typeof StaticCopyUsage | typeof DynamicCopyUsage | typeof StreamCopyUsage;

export type GpuType = typeof FloatType | typeof IntType;

export type AnyTypedArray = Float32Array | Uint32Array | Uint16Array | Uint8Array | Uint8ClampedArray | Int32Array | Int16Array | Int8Array;

/**
 * A TypedArray with a buffer that has an optional _uuid property
 */
export type BufferViewWithUUID = AnyTypedArray & {
  buffer: (ArrayBuffer | SharedArrayBuffer) & { _uuid?: string };
};

/**
 * Color space
 */
export type ColorSpace = | typeof NoColorSpace | typeof SRGBColorSpace | typeof LinearSRGBColorSpace

/**
 * Constructor type for TypedArrays
 */
export type TypedArrayConstructor<T extends AnyTypedArray> = {
  new(arr: number[] | ArrayLike<number>): T;
  BYTES_PER_ELEMENT: number;
}

/**
 * Euler orders
 */
export type EulerOrder = 'XYZ' | 'YXZ' | 'ZXY' | 'ZYX' | 'YZX' | 'XZY';

/**
 * The default order of Euler angles.
 */
export const EulerDefaultOrder = 'XYZ';

export type InterpolationMode = typeof InterpolateLinear | typeof InterpolateDiscrete | typeof InterpolateSmooth;

export type AnimationBlendMode = typeof NormalBlending | typeof AdditiveBlending;

export type MaterialBlendMode = typeof NoBlending | typeof NormalBlending | typeof AdditiveBlending | typeof SubtractiveBlending | typeof MultiplyBlending | typeof CustomBlending;

export type MaterialSide = typeof FrontSide | typeof BackSide | typeof DoubleSide;

/** Union type for all blending factors */
export type MaterialBlendFactor =
  | typeof ZeroFactor
  | typeof OneFactor
  | typeof SrcColorFactor
  | typeof OneMinusSrcColorFactor
  | typeof SrcAlphaFactor
  | typeof OneMinusSrcAlphaFactor
  | typeof DstAlphaFactor
  | typeof OneMinusDstAlphaFactor
  | typeof DstColorFactor
  | typeof OneMinusDstColorFactor
  | typeof SrcAlphaSaturateFactor
  | typeof ConstantColorFactor
  | typeof OneMinusConstantColorFactor
  | typeof ConstantAlphaFactor
  | typeof OneMinusConstantAlphaFactor;

/** Union type for material blending equations */
export type MaterialBlendEquation =
  | typeof AddEquation
  | typeof SubtractEquation
  | typeof ReverseSubtractEquation
  | typeof MinEquation
  | typeof MaxEquation;

/** Union type for material depth functions */
export type MaterialDepthFunc =
  | typeof NeverDepth
  | typeof AlwaysDepth
  | typeof LessDepth
  | typeof LessEqualDepth
  | typeof EqualDepth
  | typeof GreaterEqualDepth
  | typeof GreaterDepth
  | typeof NotEqualDepth;

export type StencilFunc =
  | typeof NeverStencilFunc
  | typeof LessStencilFunc
  | typeof EqualStencilFunc
  | typeof LessEqualStencilFunc
  | typeof GreaterStencilFunc
  | typeof NotEqualStencilFunc
  | typeof GreaterEqualStencilFunc
  | typeof AlwaysStencilFunc;

export type StencilOp =
  | typeof ZeroStencilOp
  | typeof KeepStencilOp
  | typeof ReplaceStencilOp
  | typeof IncrementStencilOp
  | typeof DecrementStencilOp
  | typeof IncrementWrapStencilOp
  | typeof DecrementWrapStencilOp
  | typeof InvertStencilOp;

export type EnvironmentColorOperation =
  | typeof MultiplyOperation
  | typeof MixOperation
  | typeof AddOperation

export type LineJoin = 'round' | 'bevel' | 'miter';
export type LineCap = 'butt' | 'round' | 'square';

export type TextureWrapping = typeof RepeatWrapping | typeof ClampToEdgeWrapping | typeof MirroredRepeatWrapping;

export type TextureMagFilter = typeof NearestFilter | typeof LinearFilter;

export type TextureMinFilter = typeof NearestFilter | typeof LinearFilter | typeof NearestMipmapNearestFilter | typeof NearestMipmapLinearFilter | typeof LinearMipmapNearestFilter | typeof LinearMipmapLinearFilter;

export type TextureFormat =
  | typeof AlphaFormat
  | typeof RGBAFormat
  | typeof RGBFormat
  // | typeof LuminanceFormat
  // | typeof LuminanceAlphaFormat
  | typeof RedFormat
  | typeof DepthFormat
  | typeof DepthStencilFormat
  | typeof RGBAIntegerFormat
  | typeof RedIntegerFormat
  | typeof RGBIntegerFormat;

export type CompressedTextureFormat =
  // S3TC / DXT
  | typeof RGB_S3TC_DXT1_Format
  | typeof RGBA_S3TC_DXT1_Format
  | typeof RGBA_S3TC_DXT3_Format
  | typeof RGBA_S3TC_DXT5_Format

  // PVRTC
  | typeof RGB_PVRTC_2BPPV1_Format
  | typeof RGB_PVRTC_4BPPV1_Format
  | typeof RGBA_PVRTC_2BPPV1_Format
  | typeof RGBA_PVRTC_4BPPV1_Format

  // ETC
  | typeof RGB_ETC1_Format
  | typeof RGB_ETC2_Format
  | typeof RGBA_ETC2_EAC_Format

  // ASTC
  | typeof RGBA_ASTC_4x4_Format
  | typeof RGBA_ASTC_5x4_Format
  | typeof RGBA_ASTC_5x5_Format
  | typeof RGBA_ASTC_6x5_Format
  | typeof RGBA_ASTC_6x6_Format
  | typeof RGBA_ASTC_8x5_Format
  | typeof RGBA_ASTC_8x6_Format
  | typeof RGBA_ASTC_8x8_Format
  | typeof RGBA_ASTC_10x5_Format
  | typeof RGBA_ASTC_10x6_Format
  | typeof RGBA_ASTC_10x8_Format
  | typeof RGBA_ASTC_10x10_Format
  | typeof RGBA_ASTC_12x10_Format
  | typeof RGBA_ASTC_12x12_Format

  // BPTC
  | typeof RGBA_BPTC_Format
  | typeof RGB_BPTC_SIGNED_Format
  | typeof RGB_BPTC_UNSIGNED_Format

  // RGTC
  | typeof RED_RGTC1_Format
  | typeof SIGNED_RED_RGTC1_Format
  | typeof RED_GREEN_RGTC2_Format
  | typeof SIGNED_RED_GREEN_RGTC2_Format;


export type TextureDataType =
  | typeof UnsignedByteType
  | typeof ByteType
  | typeof ShortType
  | typeof UnsignedShortType
  | typeof IntType
  | typeof UnsignedIntType
  | typeof FloatType
  | typeof HalfFloatType
  | typeof UnsignedShort4444Type
  | typeof UnsignedShort5551Type
  | typeof UnsignedInt248Type;

export type TextureMapping =
  | typeof UVMapping
  | typeof CubeReflectionMapping
  | typeof CubeRefractionMapping
  | typeof EquirectangularReflectionMapping
  | typeof EquirectangularRefractionMapping
  | typeof CubeUVReflectionMapping;

export type TextureInternalFormat =
  | 'RGBA8'
  | 'RGB8'
  | 'RGBA16F'
  | 'RGBA32F'
  | 'R8'
  | 'R16F'
  | 'R32F'
  | 'RGB16F'
  | 'RGB32F'
  | 'SRGB8'
  | 'SRGB8_ALPHA8'; // add more as needed

export interface Mipmap {
  data: Uint8Array | Float32Array;
  width: number;
  height: number;
}

/**
 * Used to hold subregions of a texture to update
 */
export interface UpdateRange {
  start: number;
  count: number;
}

export interface TextureOptions {
  // Texture options
  mapping?: number;
  generateMipmaps?: boolean;
  magFilter?: number;
  minFilter?: number;
  format?: number;
  type?: number;
  internalFormat?: string | null;
  wrapS?: number;
  wrapT?: number;
  wrapR?: number;
  anisotropy?: number;
  colorSpace?: string;
  flipY?: boolean;
}

export type Precision = 'highp' | 'mediump' | 'lowp';

export type NormalMapType = typeof TangentSpaceNormalMap | typeof ObjectSpaceNormalMap;

export type ToneMappingType =
  | typeof NoToneMapping
  | typeof LinearToneMapping
  | typeof ReinhardToneMapping
  | typeof CineonToneMapping
  | typeof ACESFilmicToneMapping
  | typeof CustomToneMapping
  | typeof AgXToneMapping
  | typeof NeutralToneMapping;

export type CullFace =
  | typeof CullFaceNone
  | typeof CullFaceBack
  | typeof CullFaceFront
  | typeof CullFaceFrontBack;


export type WebGLInternalFormatName =
  { [K in keyof WebGL2RenderingContext]:
    WebGL2RenderingContext[K] extends number ? K : never
  }[keyof WebGL2RenderingContext]

export const REVISION = '0.1.0-dev';

/**
 * Represents mouse buttons and interaction types in context of controls.
 *
 * @type {ConstantsMouse}
 * @constant
 */
export const MOUSE: ConstantsMouse = { LEFT: 0, MIDDLE: 1, RIGHT: 2, ROTATE: 0, DOLLY: 1, PAN: 2 };

/**
 * Represents touch interaction types in context of controls.
 *
 * @type {ConstantsTouch}
 * @constant
 */
export const TOUCH: ConstantsTouch = { ROTATE: 0, PAN: 1, DOLLY_PAN: 2, DOLLY_ROTATE: 3 };

/**
 * Disables face culling.
 *
 * @type {number}
 * @constant
 */
export const CullFaceNone: number = 0;

/**
 * Culls back faces.
 *
 * @type {number}
 * @constant
 */
export const CullFaceBack: number = 1;

/**
 * Culls front faces.
 *
 * @type {number}
 * @constant
 */
export const CullFaceFront: number = 2;

/**
 * Culls both front and back faces.
 *
 * @type {number}
 * @constant
 */
export const CullFaceFrontBack: number = 3;

/**
 * Gives unfiltered shadow maps - fastest, but lowest quality.
 *
 * @type {number}
 * @constant
 */
export const BasicShadowMap: number = 0;

/**
 * Filters shadow maps using the Percentage-Closer Filtering (PCF) algorithm.
 *
 * @type {number}
 * @constant
 */
export const PCFShadowMap: number = 1;

/**
 * Filters shadow maps using the Percentage-Closer Filtering (PCF) algorithm with
 * better soft shadows especially when using low-resolution shadow maps.
 *
 * @type {number}
 * @constant
 */
export const PCFSoftShadowMap: number = 2;

/**
 * Filters shadow maps using the Variance Shadow Map (VSM) algorithm.
 * When using VSMShadowMap all shadow receivers will also cast shadows.
 *
 * @type {number}
 * @constant
 */
export const VSMShadowMap: number = 3;

/**
 * Only front faces are rendered.
 *
 * @type {number}
 * @constant
 */
export const FrontSide: number = 0;

/**
 * Only back faces are rendered.
 *
 * @type {number}
 * @constant
 */
export const BackSide: number = 1;

/**
 * Both front and back faces are rendered.
 *
 * @type {number}
 * @constant
 */
export const DoubleSide: number = 2;

/**
 * No blending is performed which effectively disables
 * alpha transparency.
 *
 * @type {number}
 * @constant
 */
export const NoBlending: number = 0;

/**
 * The default blending.
 *
 * @type {number}
 * @constant
 */
export const NormalBlending: number = 1;

/**
 * Represents additive blending.
 *
 * @type {number}
 * @constant
 */
export const AdditiveBlending: number = 2;

/**
 * Represents subtractive blending.
 *
 * @type {number}
 * @constant
 */
export const SubtractiveBlending: number = 3;

/**
 * Represents multiply blending.
 *
 * @type {number}
 * @constant
 */
export const MultiplyBlending: number = 4;

/**
 * Represents custom blending.
 *
 * @type {number}
 * @constant
 */
export const CustomBlending: number = 5;

/**
 * A `source + destination` blending equation.
 *
 * @type {number}
 * @constant
 */
export const AddEquation: number = 100;

/**
 * A `source - destination` blending equation.
 *
 * @type {number}
 * @constant
 */
export const SubtractEquation: number = 101;

/**
 * A `destination - source` blending equation.
 *
 * @type {number}
 * @constant
 */
export const ReverseSubtractEquation: number = 102;

/**
 * A blend equation that uses the minimum of source and destination.
 *
 * @type {number}
 * @constant
 */
export const MinEquation: number = 103;

/**
 * A blend equation that uses the maximum of source and destination.
 *
 * @type {number}
 * @constant
 */
export const MaxEquation: number = 104;

/**
 * Multiplies all colors by `0`.
 *
 * @type {number}
 * @constant
 */
export const ZeroFactor: number = 200;

/**
 * Multiplies all colors by `1`.
 *
 * @type {number}
 * @constant
 */
export const OneFactor: number = 201;

/**
 * Multiplies all colors by the source colors.
 *
 * @type {number}
 * @constant
 */
export const SrcColorFactor: number = 202;

/**
 * Multiplies all colors by `1` minus each source color.
 *
 * @type {number}
 * @constant
 */
export const OneMinusSrcColorFactor: number = 203;

/**
 * Multiplies all colors by the source alpha value.
 *
 * @type {number}
 * @constant
 */
export const SrcAlphaFactor: number = 204;

/**
 * Multiplies all colors by 1 minus the source alpha value.
 *
 * @type {number}
 * @constant
 */
export const OneMinusSrcAlphaFactor: number = 205;

/**
 * Multiplies all colors by the destination alpha value.
 *
 * @type {number}
 * @constant
 */
export const DstAlphaFactor: number = 206;

/**
 * Multiplies all colors by `1` minus the destination alpha value.
 *
 * @type {number}
 * @constant
 */
export const OneMinusDstAlphaFactor: number = 207;

/**
 * Multiplies all colors by the destination color.
 *
 * @type {number}
 * @constant
 */
export const DstColorFactor: number = 208;

/**
 * Multiplies all colors by `1` minus each destination color.
 *
 * @type {number}
 * @constant
 */
export const OneMinusDstColorFactor: number = 209;

/**
 * Multiplies the RGB colors by the smaller of either the source alpha
 * value or the value of `1` minus the destination alpha value. The alpha
 * value is multiplied by `1`.
 *
 * @type {number}
 * @constant
 */
export const SrcAlphaSaturateFactor: number = 210;

/**
 * Multiplies all colors by a constant color.
 *
 * @type {number}
 * @constant
 */
export const ConstantColorFactor: number = 211;

/**
 * Multiplies all colors by `1` minus a constant color.
 *
 * @type {number}
 * @constant
 */
export const OneMinusConstantColorFactor: number = 212;

/**
 * Multiplies all colors by a constant alpha value.
 *
 * @type {number}
 * @constant
 */
export const ConstantAlphaFactor: number = 213;

/**
 * Multiplies all colors by 1 minus a constant alpha value.
 *
 * @type {number}
 * @constant
 */
export const OneMinusConstantAlphaFactor: number = 214;

/**
 * Never pass.
 *
 * @type {number}
 * @constant
 */
export const NeverDepth: number = 0;

/**
 * Always pass.
 *
 * @type {number}
 * @constant
 */
export const AlwaysDepth: number = 1;

/**
 * Pass if the incoming value is less than the depth buffer value.
 *
 * @type {number}
 * @constant
 */
export const LessDepth: number = 2;

/**
 * Pass if the incoming value is less than or equal to the depth buffer value.
 *
 * @type {number}
 * @constant
 */
export const LessEqualDepth: number = 3;

/**
 * Pass if the incoming value equals the depth buffer value.
 *
 * @type {number}
 * @constant
 */
export const EqualDepth: number = 4;

/**
 * Pass if the incoming value is greater than or equal to the depth buffer value.
 *
 * @type {number}
 * @constant
 */
export const GreaterEqualDepth: number = 5;

/**
 * Pass if the incoming value is greater than the depth buffer value.
 *
 * @type {number}
 * @constant
 */
export const GreaterDepth: number = 6;

/**
 * Pass if the incoming value is not equal to the depth buffer value.
 *
 * @type {number}
 * @constant
 */
export const NotEqualDepth: number = 7;

/**
 * Multiplies the environment map color with the surface color.
 *
 * @type {number}
 * @constant
 */
export const MultiplyOperation: number = 0;

/**
 * Uses reflectivity to blend between the two colors.
 *
 * @type {number}
 * @constant
 */
export const MixOperation: number = 1;

/**
 * Adds the two colors.
 *
 * @type {number}
 * @constant
 */
export const AddOperation: number = 2;

/**
 * No tone mapping is applied.
 *
 * @type {number}
 * @constant
 */
export const NoToneMapping: number = 0;

/**
 * Linear tone mapping.
 *
 * @type {number}
 * @constant
 */
export const LinearToneMapping: number = 1;

/**
 * Reinhard tone mapping.
 *
 * @type {number}
 * @constant
 */
export const ReinhardToneMapping: number = 2;

/**
 * Cineon tone mapping.
 *
 * @type {number}
 * @constant
 */
export const CineonToneMapping: number = 3;

/**
 * ACES Filmic tone mapping.
 *
 * @type {number}
 * @constant
 */
export const ACESFilmicToneMapping: number = 4;

/**
 * Custom tone mapping.
 *
 * Expects a custom implementation by modifying shader code of the material's fragment shader.
 *
 * @type {number}
 * @constant
 */
export const CustomToneMapping: number = 5;

/**
 * AgX tone mapping.
 *
 * @type {number}
 * @constant
 */
export const AgXToneMapping: number = 6;

/**
 * Neutral tone mapping.
 *
 * Implementation based on the Khronos 3D Commerce Group standard tone mapping.
 *
 * @type {number}
 * @constant
 */
export const NeutralToneMapping: number = 7;

/**
 * The skinned mesh shares the same world space as the skeleton.
 *
 * @type {string}
 * @constant
 */
export const AttachedBindMode: string = 'attached';

/**
 * The skinned mesh does not share the same world space as the skeleton.
 * This is useful when a skeleton is shared across multiple skinned meshes.
 *
 * @type {string}
 * @constant
 */
export const DetachedBindMode: string = 'detached';

/**
 * Maps textures using the geometry's UV coordinates.
 *
 * @type {number}
 * @constant
 */
export const UVMapping: number = 300;

/**
 * Reflection mapping for cube textures.
 *
 * @type {number}
 * @constant
 */
export const CubeReflectionMapping: number = 301;

/**
 * Refraction mapping for cube textures.
 *
 * @type {number}
 * @constant
 */
export const CubeRefractionMapping: number = 302;

/**
 * Reflection mapping for equirectangular textures.
 *
 * @type {number}
 * @constant
 */
export const EquirectangularReflectionMapping: number = 303;

/**
 * Refraction mapping for equirectangular textures.
 *
 * @type {number}
 * @constant
 */
export const EquirectangularRefractionMapping: number = 304;

/**
 * Reflection mapping for PMREM textures.
 *
 * @type {number}
 * @constant
 */
export const CubeUVReflectionMapping: number = 306;

/**
 * The texture will simply repeat to infinity.
 *
 * @type {number}
 * @constant
 */
export const RepeatWrapping: number = 1000;

/**
 * The last pixel of the texture stretches to the edge of the mesh.
 *
 * @type {number}
 * @constant
 */
export const ClampToEdgeWrapping: number = 1001;

/**
 * The texture will repeats to infinity, mirroring on each repeat.
 *
 * @type {number}
 * @constant
 */
export const MirroredRepeatWrapping: number = 1002;

/**
 * Returns the value of the texture element that is nearest (in Manhattan distance)
 * to the specified texture coordinates.
 *
 * @type {number}
 * @constant
 */
export const NearestFilter: number = 1003;

/**
 * Chooses the mipmap that most closely matches the size of the pixel being textured
 * and uses the `NearestFilter` criterion (the texel nearest to the center of the pixel)
 * to produce a texture value.
 *
 * @type {number}
 * @constant
 */
export const NearestMipmapNearestFilter: number = 1004;

/**
 * Chooses the two mipmaps that most closely match the size of the pixel being textured and
 * uses the `NearestFilter` criterion to produce a texture value from each mipmap.
 * The final texture value is a weighted average of those two values.
 *
 * @type {number}
 * @constant
 */
export const NearestMipmapLinearFilter: number = 1005;

/**
 * Returns the weighted average of the four texture elements that are closest to the specified
 * texture coordinates, and can include items wrapped or repeated from other parts of a texture,
 * depending on the values of `wrapS` and `wrapT`, and on the exact mapping.
 *
 * @type {number}
 * @constant
 */
export const LinearFilter: number = 1006;

/**
 * Chooses the mipmap that most closely matches the size of the pixel being textured and uses
 * the `LinearFilter` criterion (a weighted average of the four texels that are closest to the
 * center of the pixel) to produce a texture value.
 *
 * @type {number}
 * @constant
 */
export const LinearMipmapNearestFilter: number = 1007;

/**
 * Chooses the two mipmaps that most closely match the size of the pixel being textured and uses
 * the `LinearFilter` criterion to produce a texture value from each mipmap. The final texture value
 * is a weighted average of those two values.
 *
 * @type {number}
 * @constant
 */
export const LinearMipmapLinearFilter: number = 1008;

/**
 * An unsigned byte data type for textures.
 *
 * @type {number}
 * @constant
 */
export const UnsignedByteType: number = 1009;

/**
 * A byte data type for textures.
 *
 * @type {number}
 * @constant
 */
export const ByteType: number = 1010;

/**
 * A short data type for textures.
 *
 * @type {number}
 * @constant
 */
export const ShortType: number = 1011;

/**
 * An unsigned short data type for textures.
 *
 * @type {number}
 * @constant
 */
export const UnsignedShortType: number = 1012;

/**
 * An int data type for textures.
 *
 * @type {number}
 * @constant
 */
export const IntType: number = 1013;

/**
 * An unsigned int data type for textures.
 *
 * @type {number}
 * @constant
 */
export const UnsignedIntType: number = 1014;

/**
 * A float data type for textures.
 *
 * @type {number}
 * @constant
 */
export const FloatType: number = 1015;

/**
 * A half float data type for textures.
 *
 * @type {number}
 * @constant
 */
export const HalfFloatType: number = 1016;

/**
 * An unsigned short 4_4_4_4 (packed) data type for textures.
 *
 * @type {number}
 * @constant
 */
export const UnsignedShort4444Type: number = 1017;

/**
 * An unsigned short 5_5_5_1 (packed) data type for textures.
 *
 * @type {number}
 * @constant
 */
export const UnsignedShort5551Type: number = 1018;

/**
 * An unsigned int 24_8 data type for textures.
 *
 * @type {number}
 * @constant
 */
export const UnsignedInt248Type: number = 1020;

/**
 * An unsigned int 5_9_9_9 (packed) data type for textures.
 *
 * @type {number}
 * @constant
 */
export const UnsignedInt5999Type: number = 35902;

/**
 * An unsigned int 10_11_11 (packed) data type for textures.
 *
 * @type {number}
 * @constant
 */
export const UnsignedInt101111Type: number = 35899;

/**
 * Discards the red, green and blue components and reads just the alpha component.
 *
 * @type {number}
 * @constant
 */
export const AlphaFormat: number = 1021;

/**
 * Discards the alpha component and reads the red, green and blue component.
 *
 * @type {number}
 * @constant
 */
export const RGBFormat: number = 1022;

/**
 * Reads the red, green, blue and alpha components.
 *
 * @type {number}
 * @constant
 */
export const RGBAFormat: number = 1023;

/**
 * Reads each element as a single depth value, converts it to floating point, and clamps to the range `[0,1]`.
 *
 * @type {number}
 * @constant
 */
export const DepthFormat: number = 1026;

/**
 * Reads each element is a pair of depth and stencil values. The depth component of the pair is interpreted as
 * in `DepthFormat`. The stencil component is interpreted based on the depth + stencil internal format.
 *
 * @type {number}
 * @constant
 */
export const DepthStencilFormat: number = 1027;

/**
 * Discards the green, blue and alpha components and reads just the red component.
 *
 * @type {number}
 * @constant
 */
export const RedFormat: number = 1028;

/**
 * Discards the green, blue and alpha components and reads just the red component. The texels are read as integers instead of floating point.
 *
 * @type {number}
 * @constant
 */
export const RedIntegerFormat: number = 1029;

/**
 * Discards the alpha, and blue components and reads the red, and green components.
 *
 * @type {number}
 * @constant
 */
export const RGFormat: number = 1030;

/**
 * Discards the alpha, and blue components and reads the red, and green components. The texels are read as integers instead of floating point.
 *
 * @type {number}
 * @constant
 */
export const RGIntegerFormat: number = 1031;

/**
 * Discards the alpha component and reads the red, green and blue component. The texels are read as integers instead of floating point.
 *
 * @type {number}
 * @constant
 */
export const RGBIntegerFormat: number = 1032;

/**
 * Reads the red, green, blue and alpha components. The texels are read as integers instead of floating point.
 *
 * @type {number}
 * @constant
 */
export const RGBAIntegerFormat: number = 1033;

/**
 * A DXT1-compressed image in an RGB image format.
 *
 * @type {number}
 * @constant
 */
export const RGB_S3TC_DXT1_Format: number = 33776;

/**
 * A DXT1-compressed image in an RGB image format with a simple on/off alpha value.
 *
 * @type {number}
 * @constant
 */
export const RGBA_S3TC_DXT1_Format: number = 33777;

/**
 * A DXT3-compressed image in an RGBA image format. Compared to a 32-bit RGBA texture, it offers 4:1 compression.
 *
 * @type {number}
 * @constant
 */
export const RGBA_S3TC_DXT3_Format: number = 33778;

/**
 * A DXT5-compressed image in an RGBA image format. It also provides a 4:1 compression, but differs to the DXT3
 * compression in how the alpha compression is done.
 *
 * @type {number}
 * @constant
 */
export const RGBA_S3TC_DXT5_Format: number = 33779;

/**
 * PVRTC RGB compression in 4-bit mode. One block for each 4×4 pixels.
 *
 * @type {number}
 * @constant
 */
export const RGB_PVRTC_4BPPV1_Format: number = 35840;

/**
 * PVRTC RGB compression in 2-bit mode. One block for each 8×4 pixels.
 *
 * @type {number}
 * @constant
 */
export const RGB_PVRTC_2BPPV1_Format: number = 35841;

/**
 * PVRTC RGBA compression in 4-bit mode. One block for each 4×4 pixels.
 *
 * @type {number}
 * @constant
 */
export const RGBA_PVRTC_4BPPV1_Format: number = 35842;

/**
 * PVRTC RGBA compression in 2-bit mode. One block for each 8×4 pixels.
 *
 * @type {number}
 * @constant
 */
export const RGBA_PVRTC_2BPPV1_Format: number = 35843;

/**
 * ETC1 RGB format.
 *
 * @type {number}
 * @constant
 */
export const RGB_ETC1_Format: number = 36196;

/**
 * ETC2 RGB format.
 *
 * @type {number}
 * @constant
 */
export const RGB_ETC2_Format: number = 37492;

/**
 * ETC2 RGBA format.
 *
 * @type {number}
 * @constant
 */
export const RGBA_ETC2_EAC_Format: number = 37496;

/**
 * ASTC RGBA 4x4 format.
 *
 * @type {number}
 * @constant
 */
export const RGBA_ASTC_4x4_Format: number = 37808;

/**
 * ASTC RGBA 5x4 format.
 *
 * @type {number}
 * @constant
 */
export const RGBA_ASTC_5x4_Format: number = 37809;

/**
 * ASTC RGBA 5x5 format.
 *
 * @type {number}
 * @constant
 */
export const RGBA_ASTC_5x5_Format: number = 37810;

/**
 * ASTC RGBA 6x5 format.
 *
 * @type {number}
 * @constant
 */
export const RGBA_ASTC_6x5_Format: number = 37811;

/**
 * ASTC RGBA 6x6 format.
 *
 * @type {number}
 * @constant
 */
export const RGBA_ASTC_6x6_Format: number = 37812;

/**
 * ASTC RGBA 8x5 format.
 *
 * @type {number}
 * @constant
 */
export const RGBA_ASTC_8x5_Format: number = 37813;

/**
 * ASTC RGBA 8x6 format.
 *
 * @type {number}
 * @constant
 */
export const RGBA_ASTC_8x6_Format: number = 37814;

/**
 * ASTC RGBA 8x8 format.
 *
 * @type {number}
 * @constant
 */
export const RGBA_ASTC_8x8_Format: number = 37815;

/**
 * ASTC RGBA 10x5 format.
 *
 * @type {number}
 * @constant
 */
export const RGBA_ASTC_10x5_Format: number = 37816;

/**
 * ASTC RGBA 10x6 format.
 *
 * @type {number}
 * @constant
 */
export const RGBA_ASTC_10x6_Format: number = 37817;

/**
 * ASTC RGBA 10x8 format.
 *
 * @type {number}
 * @constant
 */
export const RGBA_ASTC_10x8_Format: number = 37818;

/**
 * ASTC RGBA 10x10 format.
 *
 * @type {number}
 * @constant
 */
export const RGBA_ASTC_10x10_Format: number = 37819;

/**
 * ASTC RGBA 12x10 format.
 *
 * @type {number}
 * @constant
 */
export const RGBA_ASTC_12x10_Format: number = 37820;

/**
 * ASTC RGBA 12x12 format.
 *
 * @type {number}
 * @constant
 */
export const RGBA_ASTC_12x12_Format: number = 37821;

/**
 * BPTC RGBA format.
 *
 * @type {number}
 * @constant
 */
export const RGBA_BPTC_Format: number = 36492;

/**
 * BPTC Signed RGB format.
 *
 * @type {number}
 * @constant
 */
export const RGB_BPTC_SIGNED_Format: number = 36494;

/**
 * BPTC Unsigned RGB format.
 *
 * @type {number}
 * @constant
 */
export const RGB_BPTC_UNSIGNED_Format: number = 36495;

/**
 * RGTC1 Red format.
 *
 * @type {number}
 * @constant
 */
export const RED_RGTC1_Format: number = 36283;

/**
 * RGTC1 Signed Red format.
 *
 * @type {number}
 * @constant
 */
export const SIGNED_RED_RGTC1_Format: number = 36284;

/**
 * RGTC2 Red Green format.
 *
 * @type {number}
 * @constant
 */
export const RED_GREEN_RGTC2_Format: number = 36285;

/**
 * RGTC2 Signed Red Green format.
 *
 * @type {number}
 * @constant
 */
export const SIGNED_RED_GREEN_RGTC2_Format: number = 36286;

/**
 * Animations are played once.
 *
 * @type {number}
 * @constant
 */
export const LoopOnce: number = 2200;

/**
 * Animations are played with a chosen number of repetitions, each time jumping from
 * the end of the clip directly to its beginning.
 *
 * @type {number}
 * @constant
 */
export const LoopRepeat: number = 2201;

/**
 * Animations are played with a chosen number of repetitions, alternately playing forward
 * and backward.
 *
 * @type {number}
 * @constant
 */
export const LoopPingPong: number = 2202;

/**
 * Discrete interpolation mode for keyframe tracks.
 *
 * @type {number}
 * @constant
 */
export const InterpolateDiscrete: number = 2300;

/**
 * Linear interpolation mode for keyframe tracks.
 *
 * @type {number}
 * @constant
 */
export const InterpolateLinear: number = 2301;

/**
 * Smooth interpolation mode for keyframe tracks.
 *
 * @type {number}
 * @constant
 */
export const InterpolateSmooth: number = 2302;

/**
 * Zero curvature ending for animations.
 *
 * @type {number}
 * @constant
 */
export const ZeroCurvatureEnding: number = 2400;

/**
 * Zero slope ending for animations.
 *
 * @type {number}
 * @constant
 */
export const ZeroSlopeEnding: number = 2401;

/**
 * Wrap around ending for animations.
 *
 * @type {number}
 * @constant
 */
export const WrapAroundEnding: number = 2402;

/**
 * Default animation blend mode.
 *
 * @type {number}
 * @constant
 */
export const NormalAnimationBlendMode: number = 2500;

/**
 * Additive animation blend mode. Can be used to layer motions on top of
 * each other to build complex performances from smaller re-usable assets.
 *
 * @type {number}
 * @constant
 */
export const AdditiveAnimationBlendMode: number = 2501;

/**
 * For every three vertices draw a single triangle.
 *
 * @type {number}
 * @constant
 */
export const TrianglesDrawMode: number = 0;

/**
 * For each vertex draw a triangle from the last three vertices.
 *
 * @type {number}
 * @constant
 */
export const TriangleStripDrawMode: number = 1;

/**
 * For each vertex draw a triangle from the first vertex and the last two vertices.
 *
 * @type {number}
 * @constant
 */
export const TriangleFanDrawMode: number = 2;

/**
 * Basic depth packing.
 *
 * @type {number}
 * @constant
 */
export const BasicDepthPacking: number = 3200;

/**
 * A depth value is packed into 32 bit RGBA.
 *
 * @type {number}
 * @constant
 */
export const RGBADepthPacking: number = 3201;

/**
 * A depth value is packed into 24 bit RGB.
 *
 * @type {number}
 * @constant
 */
export const RGBDepthPacking: number = 3202;

/**
 * A depth value is packed into 16 bit RG.
 *
 * @type {number}
 * @constant
 */
export const RGDepthPacking: number = 3203;

/**
 * Normal information is relative to the underlying surface.
 *
 * @type {number}
 * @constant
 */
export const TangentSpaceNormalMap: number = 0;

/**
 * Normal information is relative to the object orientation.
 *
 * @type {number}
 * @constant
 */
export const ObjectSpaceNormalMap: number = 1;

// Color space string identifiers, matching CSS Color Module Level 4 and WebGPU names where available.

/**
 * No color space.
 *
 * @type {string}
 * @constant
 */
export const NoColorSpace: string = '';

/**
 * sRGB color space.
 *
 * @type {string}
 * @constant
 */
export const SRGBColorSpace: string = 'srgb';

/**
 * sRGB-linear color space.
 *
 * @type {string}
 * @constant
 */
export const LinearSRGBColorSpace: string = 'srgb-linear';

/**
 * Linear transfer function.
 *
 * @type {string}
 * @constant
 */
export const LinearTransfer: string = 'linear';

/**
 * sRGB transfer function.
 *
 * @type {string}
 * @constant
 */
export const SRGBTransfer: string = 'srgb';

/**
 * Sets the stencil buffer value to `0`.
 *
 * @type {number}
 * @constant
 */
export const ZeroStencilOp: number = 0;

/**
 * Keeps the current value.
 *
 * @type {number}
 * @constant
 */
export const KeepStencilOp: number = 7680;

/**
 * Sets the stencil buffer value to the specified reference value.
 *
 * @type {number}
 * @constant
 */
export const ReplaceStencilOp: number = 7681;

/**
 * Increments the current stencil buffer value. Clamps to the maximum representable unsigned value.
 *
 * @type {number}
 * @constant
 */
export const IncrementStencilOp: number = 7682;

/**
 * Decrements the current stencil buffer value. Clamps to `0`.
 *
 * @type {number}
 * @constant
 */
export const DecrementStencilOp: number = 7683;

/**
 * Increments the current stencil buffer value. Wraps stencil buffer value to zero when incrementing
 * the maximum representable unsigned value.
 *
 * @type {number}
 * @constant
 */
export const IncrementWrapStencilOp: number = 34055;

/**
 * Decrements the current stencil buffer value. Wraps stencil buffer value to the maximum representable
 * unsigned value when decrementing a stencil buffer value of `0`.
 *
 * @type {number}
 * @constant
 */
export const DecrementWrapStencilOp: number = 34056;

/**
 * Inverts the current stencil buffer value bitwise.
 *
 * @type {number}
 * @constant
 */
export const InvertStencilOp: number = 5386;

/**
 * Will never return true.
 *
 * @type {number}
 * @constant
 */
export const NeverStencilFunc: number = 512;

/**
 * Will return true if the stencil reference value is less than the current stencil value.
 *
 * @type {number}
 * @constant
 */
export const LessStencilFunc: number = 513;

/**
 * Will return true if the stencil reference value is equal to the current stencil value.
 *
 * @type {number}
 * @constant
 */
export const EqualStencilFunc: number = 514;

/**
 * Will return true if the stencil reference value is less than or equal to the current stencil value.
 *
 * @type {number}
 * @constant
 */
export const LessEqualStencilFunc: number = 515;

/**
 * Will return true if the stencil reference value is greater than the current stencil value.
 *
 * @type {number}
 * @constant
 */
export const GreaterStencilFunc: number = 516;

/**
 * Will return true if the stencil reference value is not equal to the current stencil value.
 *
 * @type {number}
 * @constant
 */
export const NotEqualStencilFunc: number = 517;

/**
 * Will return true if the stencil reference value is greater than or equal to the current stencil value.
 *
 * @type {number}
 * @constant
 */
export const GreaterEqualStencilFunc: number = 518;

/**
 * Will always return true.
 *
 * @type {number}
 * @constant
 */
export const AlwaysStencilFunc: number = 519;

/**
 * Never pass.
 *
 * @type {number}
 * @constant
 */
export const NeverCompare: number = 512;

/**
 * Pass if the incoming value is less than the texture value.
 *
 * @type {number}
 * @constant
 */
export const LessCompare: number = 513;

/**
 * Pass if the incoming value equals the texture value.
 *
 * @type {number}
 * @constant
 */
export const EqualCompare: number = 514;

/**
 * Pass if the incoming value is less than or equal to the texture value.
 *
 * @type {number}
 * @constant
 */
export const LessEqualCompare: number = 515;

/**
 * Pass if the incoming value is greater than the texture value.
 *
 * @type {number}
 * @constant
 */
export const GreaterCompare: number = 516;

/**
 * Pass if the incoming value is not equal to the texture value.
 *
 * @type {number}
 * @constant
 */
export const NotEqualCompare: number = 517;

/**
 * Pass if the incoming value is greater than or equal to the texture value.
 *
 * @type {number}
 * @constant
 */
export const GreaterEqualCompare: number = 518;

/**
 * Always pass.
 *
 * @type {number}
 * @constant
 */
export const AlwaysCompare: number = 519;

/**
 * The contents are intended to be specified once by the application, and used many
 * times as the source for drawing and image specification commands.
 *
 * @type {number}
 * @constant
 */
export const StaticDrawUsage: number = 35044;

/**
 * The contents are intended to be respecified repeatedly by the application, and
 * used many times as the source for drawing and image specification commands.
 *
 * @type {number}
 * @constant
 */
export const DynamicDrawUsage: number = 35048;

/**
 * The contents are intended to be specified once by the application, and used at most
 * a few times as the source for drawing and image specification commands.
 *
 * @type {number}
 * @constant
 */
export const StreamDrawUsage: number = 35040;

/**
 * The contents are intended to be specified once by reading data from the 3D API, and queried
 * many times by the application.
 *
 * @type {number}
 * @constant
 */
export const StaticReadUsage: number = 35045;

/**
 * The contents are intended to be respecified repeatedly by reading data from the 3D API, and queried
 * many times by the application.
 *
 * @type {number}
 * @constant
 */
export const DynamicReadUsage: number = 35049;

/**
 * The contents are intended to be specified once by reading data from the 3D API, and queried at most
 * a few times by the application
 *
 * @type {number}
 * @constant
 */
export const StreamReadUsage: number = 35041;

/**
 * The contents are intended to be specified once by reading data from the 3D API, and used many times as
 * the source for WebGL drawing and image specification commands.
 *
 * @type {number}
 * @constant
 */
export const StaticCopyUsage: number = 35046;

/**
 * The contents are intended to be respecified repeatedly by reading data from the 3D API, and used many times
 * as the source for WebGL drawing and image specification commands.
 *
 * @type {number}
 * @constant
 */
export const DynamicCopyUsage: number = 35050;

/**
 * The contents are intended to be specified once by reading data from the 3D API, and used at most a few times
 * as the source for WebGL drawing and image specification commands.
 *
 * @type {number}
 * @constant
 */
export const StreamCopyUsage: number = 35042;

/**
 * GLSL 1 shader code.
 *
 * @type {string}
 * @constant
 */
export const GLSL1: string = '100';

/**
 * GLSL 3 shader code.
 *
 * @type {string}
 * @constant
 */
export const GLSL3: string = '300 es';

/**
 * WebGL coordinate system.
 *
 * @type {number}
 * @constant
 */
export const WebGLCoordinateSystem: number = 2000 as const;

/**
 * WebGPU coordinate system.
 *
 * @type {number}
 * @constant
 */
export const WebGPUCoordinateSystem: number = 2001 as const;

/**
 * Represents the different timestamp query types.
 *
 * @type {ConstantsTimestampQuery}
 * @constant
 */
export const TimestampQuery: ConstantsTimestampQuery = {
  COMPUTE: 'compute',
  RENDER: 'render'
};

/**
 * Represents mouse buttons and interaction types in context of controls.
 *
 * @type {ConstantsInterpolationSamplingType}
 * @constant
 */
export const InterpolationSamplingType: ConstantsInterpolationSamplingType = {
  PERSPECTIVE: 'perspective',
  LINEAR: 'linear',
  FLAT: 'flat'
};

/**
 * Represents the different interpolation sampling modes.
 *
 * @type {ConstantsInterpolationSamplingMode}
 * @constant
 */
export const InterpolationSamplingMode: ConstantsInterpolationSamplingMode = {
  NORMAL: 'normal',
  CENTROID: 'centroid',
  SAMPLE: 'sample',
  FIRST: 'first',
  EITHER: 'either'
};
