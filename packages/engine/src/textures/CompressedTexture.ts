import { Texture } from './Texture.js';
import { ClampToEdgeWrapping, ColorSpace, LinearFilter, LinearMipmapLinearFilter, Mipmap, RGBAFormat, TextureDataType, TextureFormat, TextureMagFilter, TextureMapping, TextureMinFilter, TextureWrapping, UnsignedByteType } from '../constants.js';

/**
 * Creates a texture based on data in compressed form.
 *
 * These texture are usually loaded with {@link CompressedTextureLoader}.
 *
 * @augments Texture
 */
export class CompressedTexture extends Texture {
  /**
   * This flag can be used for type testing.
   *
   * @type {boolean}
   * @readonly
   * @default true
   */
  public isCompressedTexture: boolean = true;

  /**
   * Constructs a new compressed texture.
   *
   * @param {Array<Object>} mipmaps - This array holds for all mipmaps (including the bases mip)
   * the data and dimensions.
   * @param {number} width - The width of the texture.
   * @param {number} height - The height of the texture.
   * @param {number} [format=RGBAFormat] - The texture format.
   * @param {number} [type=UnsignedByteType] - The texture type.
   * @param {number} [mapping=Texture.DEFAULT_MAPPING] - The texture mapping.
   * @param {number} [wrapS=ClampToEdgeWrapping] - The wrapS value.
   * @param {number} [wrapT=ClampToEdgeWrapping] - The wrapT value.
   * @param {number} [magFilter=LinearFilter] - The mag filter value.
   * @param {number} [minFilter=LinearMipmapLinearFilter] - The min filter value.
   * @param {number} [anisotropy=Texture.DEFAULT_ANISOTROPY] - The anisotropy value.
   * @param {string} [colorSpace=NoColorSpace] - The color space.
   */
  constructor(
    mipmaps: Mipmap[],
    width: number,
    height: number,
    format: TextureFormat = RGBAFormat,
    type: TextureDataType = UnsignedByteType,
    mapping: TextureMapping = Texture.DEFAULT_MAPPING,
    wrapS: TextureWrapping = ClampToEdgeWrapping,
    wrapT: TextureWrapping = ClampToEdgeWrapping,
    magFilter: TextureMagFilter = LinearFilter,
    minFilter: TextureMinFilter = LinearMipmapLinearFilter,
    anisotropy: number = Texture.DEFAULT_ANISOTROPY,
    colorSpace: ColorSpace = 'NoColorSpace'
  ) {

    super(null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, colorSpace);

    this.mipmaps = mipmaps
    this.flipY = false;
    this.generateMipmaps = false;
  }

}
