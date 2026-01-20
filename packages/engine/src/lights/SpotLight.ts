import { Light } from './Light.js';
import { SpotLightShadow } from './SpotLightShadow';
import { Node3D } from '../core/Node3D';
import { Color } from '../math/Color.js';
import { Texture } from '../textures/Texture.js';

/**
 * This light gets emitted from a single point in one direction, along a cone
 * that increases in size the further from the light it gets.
 *
 * This light can cast shadows - see the {@link SpotLightShadow} for details.
 *
 * ```js
 * // white spotlight shining from the side, modulated by a texture
 * const spotLight = new THREE.SpotLight( 0xffffff );
 * spotLight.position.set( 100, 1000, 100 );
 * spotLight.map = new TextureLoader().load( url );
 *
 * spotLight.castShadow = true;
 * spotLight.shadow.mapSize.width = 1024;
 * spotLight.shadow.mapSize.height = 1024;
 * spotLight.shadow.camera.near = 500;
 * spotLight.shadow.camera.far = 4000;
 * spotLight.shadow.camera.fov = 30;s
 * ```
 *
 * @augments Light
 */
export class SpotLight extends Light {
  /**
   * This flag can be used for type testing.
   *
   * @readonly
   * @default true
   */
  public isSpotLight = true;

  /**
  * A texture used to modulate the color of the light. The spot light
  * color is mixed with the RGB value of this texture, with a ratio
  * corresponding to its alpha value. The cookie-like masking effect is
  * reproduced using pixel values (0, 0, 0, 1-cookie_value).
  *
  * *Warning*: This property is disabled if {@link Object3D#castShadow} is set to `false`.
  *
  * @default null
  */
  public map: Texture | null = null;



  /**
   * Constructs a new spot light.
   *
   * @param {(number|Color|string)} [color=0xffffff] - The light's color.
   * @param {number} [intensity=1] - The light's strength/intensity measured in candela (cd).
   * @param {number} [distance=0] - Maximum range of the light. `0` means no limit.
   * @param {number} [angle=Math.PI/3] - Maximum angle of light dispersion from its direction whose upper bound is `Math.PI/2`.
   * @param {number} [penumbra=0] - Percent of the spotlight cone that is attenuated due to penumbra. Value range is `[0,1]`.
   * @param {number} [decay=2] - The amount the light dims along the distance of the light.
   */
  constructor(
    color: number | Color | string = new Color(0xffffff),
    intensity: number = 1,
    distance: number = 0,
    angle: number = Math.PI / 3,
    penumbra: number = 0,
    decay: number = 2
  ) {

    super(color, intensity);

    this.type = 'SpotLight';

    this.position.copy(Node3D.DEFAULT_UP);
    this.updateMatrix();

    /**
     * The spot light points from its position to the
     * target's position.
     *
     * For the target's position to be changed to anything other
     * than the default, it must be added to the scene.
     *
     * It is also possible to set the target to be another 3D object
     * in the scene. The light will now track the target object.
     *
     * @type {Object3D}
     */
    this.target = new Node3D();

    /**
     * Maximum range of the light. `0` means no limit.
     *
     * @type {number}
     * @default 0
     */
    this.distance = distance;

    /**
     * Maximum angle of light dispersion from its direction whose upper bound is `Math.PI/2`.
     *
     * @type {number}
     * @default Math.PI/3
     */
    this.angle = angle;

    /**
     * Percent of the spotlight cone that is attenuated due to penumbra.
     * Value range is `[0,1]`.
     *
     * @type {number}
     * @default 0
     */
    this.penumbra = penumbra;

    /**
     * The amount the light dims along the distance of the light. In context of
     * physically-correct rendering the default value should not be changed.
     *
     * @type {number}
     * @default 2
     */
    this.decay = decay;

    /**
     * This property holds the light's shadow configuration.
     *
     * @type {SpotLightShadow}
     */
    this.shadow = new SpotLightShadow();

  }

  /**
   * The light's power. Power is the luminous power of the light measured in lumens (lm).
   *  Changing the power will also change the light's intensity.
   *
   * @type {number}
   */
  public get power(): number {

    // compute the light's luminous power (in lumens) from its intensity (in candela)
    // by convention for a spotlight, luminous power (lm) = π * luminous intensity (cd)
    return this.intensity * Math.PI;

  }

  public set power(power) {

    // set the light's intensity (in candela) from the desired luminous power (in lumens)
    this.intensity = power / Math.PI;

  }

  public dispose(): void {

    if (this.shadow) {
      this.shadow.dispose();
    }

  }

  public copy(source: SpotLight, recursive: boolean) {

    super.copy(source, recursive);

    this.distance = source.distance;
    this.angle = source.angle;
    this.penumbra = source.penumbra;
    this.decay = source.decay;

    this.target = source.target!.clone();

    if (source.shadow) {
      this.shadow = source.shadow.clone();
    }

    return this;

  }

}

export function isSpotLight(light: Light): light is SpotLight {
  return (light as SpotLight).isSpotLight === true;
}

