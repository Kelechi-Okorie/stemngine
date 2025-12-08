import { Texture } from './Texture.js';
import {
  TextureWrapping,
  TextureMagFilter,
  TextureMinFilter,
  ClampToEdgeWrapping,
  LinearFilter,
  LinearMipmapLinearFilter,
  TextureFormat,
  TextureDataType,
  TextureMapping,
  RGBAFormat,
  UnsignedByteType
} from '../constants.js';

/**
 * Creates a texture from a canvas element.
 *
 * This is almost the same as the base texture class, except that it sets {@link Texture#needsUpdate}
 * to `true` immediately since a canvas can directly be used for rendering.
 *
 * @augments Texture
 */
export class CanvasTexture extends Texture {
  /**
   * This flag can be used for type testing.
   *
   * @type {boolean}
   * @readonly
   * @default true
   */
  public readonly isCanvasTexture: boolean = true;

  /**
   * Constructs a new texture.
   *
   * @param {HTMLCanvasElement} [canvas] - The HTML canvas element.
   * @param {number} [mapping=Texture.DEFAULT_MAPPING] - The texture mapping.
   * @param {number} [wrapS=ClampToEdgeWrapping] - The wrapS value.
   * @param {number} [wrapT=ClampToEdgeWrapping] - The wrapT value.
   * @param {number} [magFilter=LinearFilter] - The mag filter value.
   * @param {number} [minFilter=LinearMipmapLinearFilter] - The min filter value.
   * @param {number} [format=RGBAFormat] - The texture format.
   * @param {number} [type=UnsignedByteType] - The texture type.
   * @param {number} [anisotropy=Texture.DEFAULT_ANISOTROPY] - The anisotropy value.
   */
  constructor(
    canvas: HTMLCanvasElement,
    mapping: TextureMapping = Texture.DEFAULT_MAPPING,
    wrapS: TextureWrapping = ClampToEdgeWrapping,
    wrapT: TextureWrapping = ClampToEdgeWrapping,
    magFilter: TextureMagFilter = LinearFilter,
    minFilter: TextureMinFilter = LinearFilter,
    format: TextureFormat = RGBAFormat,
    type: TextureDataType = UnsignedByteType,
    anisotropy: number = Texture.DEFAULT_ANISOTROPY
  ) {

    super(canvas, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy);

    this.needsUpdate = true;

  }

}
