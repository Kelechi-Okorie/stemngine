import { Texture, TextureImage } from './Texture.js';
import { ColorSpace, CubeReflectionMapping, TextureDataType, TextureFormat, TextureMagFilter, TextureMapping, TextureMinFilter, TextureWrapping } from '../constants.js';

/**
 * Creates a cube texture made up of six images.
 *
 * ```ts
 * const loader = new CubeTextureLoader();
 * loader.setPath( 'textures/cube/pisa/' );
 *
 * const textureCube = loader.load( [
 * 	'px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'
 * ] );
 *
 * const material = new MeshBasicMaterial( { color: 0xffffff, envMap: textureCube } );
 * ```
 *
 * @augments Texture
 */
export class CubeTexture extends Texture {
      /**
     * This flag can be used for type testing.
     *
     * @type {boolean}
     * @readonly
     * @default true
     */
    public readonly isCubeTexture: boolean = true;

  /**
   * Constructs a new cube texture.
   *
   * @param {Array<Image>} [images=[]] - An array holding a image for each side of a cube.
   * @param {number} [mapping=CubeReflectionMapping] - The texture mapping.
   * @param {number} [wrapS=ClampToEdgeWrapping] - The wrapS value.
   * @param {number} [wrapT=ClampToEdgeWrapping] - The wrapT value.
   * @param {number} [magFilter=LinearFilter] - The mag filter value.
   * @param {number} [minFilter=LinearMipmapLinearFilter] - The min filter value.
   * @param {number} [format=RGBAFormat] - The texture format.
   * @param {number} [type=UnsignedByteType] - The texture type.
   * @param {number} [anisotropy=Texture.DEFAULT_ANISOTROPY] - The anisotropy value.
   * @param {string} [colorSpace=NoColorSpace] - The color space value.
   */
  constructor(
    images: TextureImage[] = [],
    mapping: TextureMapping = CubeReflectionMapping,
    wrapS?: TextureWrapping,
    wrapT?: TextureWrapping,
    magFilter?: TextureMagFilter,
    minFilter?: TextureMinFilter,
    format?: TextureFormat,
    type?: TextureDataType,
    anisotropy?: number,
    colorSpace?: ColorSpace
  ) {

    super(images, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, colorSpace);

    this.flipY = false;

  }

  /**
   * Alias for {@link CubeTexture#image}.
   *
   * @type {Array<Image>}
   */
  public get images(): TextureImage[] {

    return this.image;

  }

  public set images(value: TextureImage[]) {

    this.image = value;

  }

}

export function isCubeTexture(
  renderTarget: Texture
): renderTarget is CubeTexture {
  return (renderTarget as any).isCubeTexture === true;
}

