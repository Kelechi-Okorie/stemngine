import { Light } from './Light.js';
import { Color } from '../math/Color.js';
import { Node3D } from '../core/Node3D'

/**
 * A light source positioned directly above the scene, with color fading from
 * the sky color to the ground color.
 *
 * This light cannot be used to cast shadows.
 *
 * ```js
 * const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
 * scene.add( light );
 * ```
 *
 * @augments Light
 */
export class HemisphereLight extends Light {
  /**
 * This flag can be used for type testing.
 *
 * @readonly
 * @default true
 */
  public isHemisphereLight = true;

  public type = 'HemisphereLight';


  /**
   * Constructs a new hemisphere light.
   *
   * @param {(number|Color|string)} [skyColor=0xffffff] - The light's sky color.
   * @param {(number|Color|string)} [groundColor=0xffffff] - The light's ground color.
   * @param {number} [intensity=1] - The light's strength/intensity.
   */
  constructor(
    skyColor: number | Color | string,
    groundColor: number | Color | string,
    intensity: number = 1
  ) {

    super(skyColor, intensity);

    this.position.copy(Node3D.DEFAULT_UP);
    this.updateMatrix();

    /**
     * The light's ground color.
     *
     * @type {Color}
     */
    this.groundColor = new Color(groundColor);

  }

  public copy(source: this, recursive: boolean) {

    super.copy(source, recursive);

    this.groundColor!.copy(source.groundColor!);

    return this;

  }

}

export function isHemisphereLight(light: Light): light is HemisphereLight {
  return (light as HemisphereLight).isHemisphereLight === true;
}

