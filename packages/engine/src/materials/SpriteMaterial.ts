import { Material } from './Material.js';
import { Color } from '../math/Color.js';
import { Texture } from '../textures/Texture.js';

/**
 * A material for rendering instances of {@link Sprite}.
 *
 * ```js
 * const map = new THREE.TextureLoader().load( 'textures/sprite.png' );
 * const material = new THREE.SpriteMaterial( { map: map, color: 0xffffff } );
 *
 * const sprite = new THREE.Sprite( material );
 * sprite.scale.set(200, 200, 1)
 * scene.add( sprite );
 * ```
 *
 * @augments Material
 */
export class SpriteMaterial extends Material {

  /**
 * This flag can be used for type testing.
 *
 */
  public readonly isSpriteMaterial = true;

  public readonly type: string = 'SpriteMaterial';

  /**
   * Color of the material.
   *
   * @type {Color}
   * @default (1,1,1)
   */
  public color = new Color( 0xffffff );

  /**
   * The color map. May optionally include an alpha channel, typically combined
   * with {@link Material#transparent} or {@link Material#alphaTest}. The texture map
   * color is modulated by the diffuse `color`.
   *
   * @type {?Texture}
   * @default null
   */
  public map: Texture | null = null;

  /**
   * The alpha map is a grayscale texture that controls the opacity across the
   * surface (black: fully transparent; white: fully opaque).
   *
   * Only the color of the texture is used, ignoring the alpha channel if one
   * exists. For RGB and RGBA textures, the renderer will use the green channel
   * when sampling this texture due to the extra bit of precision provided for
   * green in DXT-compressed and uncompressed RGB 565 formats. Luminance-only and
   * luminance/alpha textures will also still work as expected.
   *
   * @type {?Texture}
   * @default null
   */
  public alphaMap: Texture | null = null;

  /**
   * The rotation of the sprite in radians.
   *
   * @type {number}
   * @default 0
   */
  public rotation: number = 0;

  /**
   * Specifies whether size of the sprite is attenuated by the camera depth (perspective camera only).
   *
   */
  public sizeAttenuation = true;

  /**
   * Whether the material is affected by fog or not.
   *
   */
  public fog = true;


  /**
   * Constructs a new sprite material.
   *
   * @param {Object} [parameters] - An object with one or more properties
   * defining the material's appearance. Any property of the material
   * (including any property from inherited materials) can be passed
   * in here. Color values can be passed any type of value accepted
   * by {@link Color#set}.
   */
  constructor(parameters?:  { [key: string]: any }) {

    super();


    this.color = new Color(0xffffff);

    this.map = null;

    this.alphaMap = null;

    this.rotation = 0;

    this.sizeAttenuation = true;

    /**
     * Overwritten since sprite materials are transparent
     * by default.
     *
     * @type {boolean}
     * @default true
     */
    this.transparent = true;

    this.fog = true;

    this.setValues(parameters);

  }

  copy(source: SpriteMaterial) {

    super.copy(source);

    this.color.copy(source.color);

    this.map = source.map;

    this.alphaMap = source.alphaMap;

    this.rotation = source.rotation;

    this.sizeAttenuation = source.sizeAttenuation;

    this.fog = source.fog;

    return this;

  }

}
