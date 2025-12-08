import { CubeReflectionMapping, RGBAFormat, TextureDataType, TextureFormat, UnsignedByteType } from '../constants.js';
import { CompressedTexture } from './CompressedTexture.js';

/**
 * Creates a cube texture based on data in compressed form.
 *
 * These texture are usually loaded with {@link CompressedTextureLoader}.
 *
 * @augments CompressedTexture
 */
export class CompressedCubeTexture extends CompressedTexture {
  /**
     * This flag can be used for type testing.
     *
     * @type {boolean}
     * @readonly
     * @default true
     */
  public readonly isCompressedCubeTexture: boolean = true;

  /**
   * Constructs a new compressed texture.
   *
   * @param {Array<CompressedTexture>} images - An array of compressed textures.
   * @param {number} [format=RGBAFormat] - The texture format.
   * @param {number} [type=UnsignedByteType] - The texture type.
   */
  constructor(
    images: CompressedCubeTexture[],
    format: TextureFormat = RGBAFormat,
    type: TextureDataType = UnsignedByteType
  ) {

    super([], images[0].width, images[0].height, format, type, CubeReflectionMapping);

    /**
     * This flag can be used for type testing.
     *
     * @type {boolean}
     * @readonly
     * @default true
     */
    this.isCubeTexture = true;

    this.image = images;

  }

}
