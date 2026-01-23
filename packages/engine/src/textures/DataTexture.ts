import { Texture } from './Texture.js';
import { AnyTypedArray, ClampToEdgeWrapping, ColorSpace, NearestFilter, RGBAFormat, TextureDataType, TextureFormat, TextureMagFilter, TextureMapping, TextureMinFilter, TextureWrapping, UnsignedByteType } from '../constants.js';
import { TextureImage } from './Texture.js';

/**
 * Creates a texture directly from raw buffer data.
 *
 * The interpretation of the data depends on type and format: If the type is
 * `UnsignedByteType`, a `Uint8Array` will be useful for addressing the
 * texel data. If the format is `RGBAFormat`, data needs four values for
 * one texel; Red, Green, Blue and Alpha (typically the opacity).
 *
 * @augments Texture
 */
export class DataTexture extends Texture {
  /**
   * This flag can be used for type testing.
   *
   * @type {boolean}
   * @readonly
   * @default true
   */
  public readonly isDataTexture: boolean = true;

  /**
   * Constructs a new data texture.
   *
   * @param {?TypedArray} [data=null] - The buffer data.
   * @param {number} [width=1] - The width of the texture.
   * @param {number} [height=1] - The height of the texture.
   * @param {number} [format=RGBAFormat] - The texture format.
   * @param {number} [type=UnsignedByteType] - The texture type.
   * @param {number} [mapping=Texture.DEFAULT_MAPPING] - The texture mapping.
   * @param {number} [wrapS=ClampToEdgeWrapping] - The wrapS value.
   * @param {number} [wrapT=ClampToEdgeWrapping] - The wrapT value.
   * @param {number} [magFilter=NearestFilter] - The mag filter value.
   * @param {number} [minFilter=NearestFilter] - The min filter value.
   * @param {number} [anisotropy=Texture.DEFAULT_ANISOTROPY] - The anisotropy value.
   * @param {string} [colorSpace=NoColorSpace] - The color space.
   */
  constructor(
    data: AnyTypedArray | null = null,
    width: number = 1,
    height: number = 1,
    format: TextureFormat = RGBAFormat,
    type: TextureDataType = UnsignedByteType,
    mapping: TextureMapping = Texture.DEFAULT_MAPPING,
    wrapS: TextureWrapping = ClampToEdgeWrapping,
    wrapT: TextureWrapping = ClampToEdgeWrapping,
    magFilter: TextureMagFilter = NearestFilter,
    minFilter: TextureMinFilter = NearestFilter,
    anisotropy: number = Texture.DEFAULT_ANISOTROPY,
    colorSpace: ColorSpace = 'NoColorSpace'
  ) {

    super(null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, colorSpace);

    this.image = { data, width, height };

    /**
     * Whether to generate mipmaps (if possible) for a texture.
     *
     * Overwritten and set to `false` by default.
     *
     * @type {boolean}
     * @default false
     */
    this.generateMipmaps = false;

    /**
     * If set to `true`, the texture is flipped along the vertical axis when
     * uploaded to the GPU.
     *
     * Overwritten and set to `false` by default.
     *
     * @type {boolean}
     * @default false
     */
    this.flipY = false;

    /**
     * Specifies the alignment requirements for the start of each pixel row in memory.
     *
     * Overwritten and set to `1` by default.
     *
     * @type {boolean}
     * @default 1
     */
    this.unpackAlignment = 1;
  }

}
