import { Material } from './Material.js';
import { Color } from '../math/Color.js';
import { Texture } from '../textures/Texture.js';

/**
 * A material for rendering point primitives.
 *
 * Materials define the appearance of renderable 3D objects.
 *
 * ```ts
 * const vertices = [];
 *
 * for ( let i = 0; i < 10000; i ++ ) {
 * 	const x = selfMathUtils.randFloatSpread( 2000 );
 * 	const y = selfMathUtils.randFloatSpread( 2000 );
 * 	const z = selfMathUtils.randFloatSpread( 2000 );
 *
 * 	vertices.push( x, y, z );
 * }
 *
 * const geometry = new selfBufferGeometry();
 * geometry.setAttribute( 'position', new selfFloat32BufferAttribute( vertices, 3 ) );
 * const material = new selfPointsMaterial( { color: 0x888888 } );
 * const points = new selfPoints( geometry, material );
 * scene.add( points );
 * ```
 *
 * @augments Material
 */
class PointsMaterial extends Material {
  /**
   * This flag can be used for type testing.
   *
   * @type {boolean}
   * @readonly
   * @default true
   */
  public isPointsMaterial: boolean = true;

  /**
   * Color of the material.
   *
   * @type {Color}
   * @default (1,1,1)
   */
  public color: Color = new Color(0xffffff);

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
   * Defines the size of the points in pixels.
   *
   * Might be capped if the value exceeds hardware dependent parameters like [gl.ALIASED_POINT_SIZE_RANGE]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getParamete}.
   *
   * @type {number}
   * @default 1
   */
  public size: number = 1;

  /**
   * Specifies whether size of individual points is attenuated by the camera depth (perspective camera only).
   *
   * @type {boolean}
   * @default true
   */
  public sizeAttenuation: boolean = true;

  /**
   * Whether the material is affected by fog or not.
   *
   * @type {boolean}
   * @default true
   */
  public fog: boolean = true;


  /**
   * Constructs a new points material.
   *
   * @param {Object} [parameters] - An object with one or more properties
   * defining the material's appearance. Any property of the material
   * (including any property from inherited materials) can be passed
   * in here. Color values can be passed any type of value accepted
   * by {@link Color#set}.
   */
  constructor(parameters: { [key: string]: any }) {

    super();

    this.type = 'PointsMaterial';

    this.setValues(parameters);

  }

  copy(source: PointsMaterial): this {

    super.copy(source);

    this.color.copy(source.color);

    this.map = source.map;

    this.alphaMap = source.alphaMap;

    this.size = source.size;
    this.sizeAttenuation = source.sizeAttenuation;

    this.fog = source.fog;

    return this;

  }

}

export { PointsMaterial };
