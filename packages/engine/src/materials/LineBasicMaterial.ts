import { Material } from './Material.js';
import { Color } from '../math/Color.js';
import { LineJoin, LineCap } from '../constants.js';
import { Texture } from '../textures/Texture.js';

/**
 * A material for rendering line primitives.
 *
 * Materials define the appearance of renderable 3D objects.
 *
 * ```js
 * const material = new LineBasicMaterial( { color: 0xffffff } );
 * ```
 *
 * @augments Material
 */
export class LineBasicMaterial extends Material {
  /**
   * This flag can be used for type testing.
   *
   * @type {boolean}
   * @readonly
   * @default true
   */
  public readonly isLineBasicMaterial: boolean = true;

  /**
   * Color of the material.
   *
   * @type {Color}
   * @default (1,1,1)
   */
  public color: Color = new Color(0xffffff);

  /**
   * Sets the color of the lines using data from a texture. The texture map
   * color is modulated by the diffuse `color`.
   *
   * @type {?Texture}
   * @default null
   */
  public map: Texture | null = null;

  /**
   * Controls line thickness or lines.
   *
   * Can only be used with {@link SVGRenderer}. WebGL and WebGPU
   * ignore this setting and always render line primitives with a
   * width of one pixel.
   *
   * @type {number}
   * @default 1
   */
  public linewidth: number = 1;

  /**
   * Defines appearance of line ends.
   *
   * Can only be used with {@link SVGRenderer}.
   *
   * @type {('butt'|'round'|'square')}
   * @default 'round'
   */
  public linecap: LineCap = 'round';

  /**
   * Defines appearance of line joints.
   *
   * Can only be used with {@link SVGRenderer}.
   *
   * @type {('round'|'bevel'|'miter')}
   * @default 'round'
   */
  public linejoin: LineJoin = 'round';

  /**
   * Whether the material is affected by fog or not.
   *
   * @type {boolean}
   * @default true
   */
  public fog: boolean = true;

  /**
   * Constructs a new line basic material.
   *
   * @param {Object} [parameters] - An object with one or more properties
   * defining the material's appearance. Any property of the material
   * (including any property from inherited materials) can be passed
   * in here. Color values can be passed any type of value accepted
   * by {@link Color#set}.
   */
  constructor(parameters?: { [key: string]: any }) {

    super();


    this.type = 'LineBasicMaterial';


    this.setValues(parameters);

  }

  public copy(source: LineBasicMaterial): this {

    super.copy(source);

    this.color.copy(source.color);

    this.map = source.map;

    this.linewidth = source.linewidth;
    this.linecap = source.linecap;
    this.linejoin = source.linejoin;

    this.fog = source.fog;

    return this;

  }

}
