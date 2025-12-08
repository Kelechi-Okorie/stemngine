import { Light } from './Light.js';
import { Color } from '../math/Color.js';

/**
 * This light globally illuminates all objects in the scene equally.
 *
 * It cannot be used to cast shadows as it does not have a direction.
 *
 * ```ts
 * const light = new AmbientLight( 0x404040 ); // soft white light
 * scene.add( light );
 * ```
 *
 * @augments Light
 */
export class AmbientLight extends Light {
  /**
   * This flag can be used for type testing.
   *
   * @type {boolean}
   * @readonly
   * @default true
   */
  public isAmbientLight: boolean = true;

  public type: string = 'AmbientLight';


  /**
   * Constructs a new ambient light.
   *
   * @param {(number|Color|string)} [color=0xffffff] - The light's color.
   * @param {number} [intensity=1] - The light's strength/intensity.
   */
  constructor(color: number | Color | string, intensity: number) {

    super(color, intensity);
  }

}
