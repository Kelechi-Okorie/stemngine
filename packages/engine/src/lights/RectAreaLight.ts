import { Light } from './Light.js';
import { Color } from '../math/Color.js';

/**
 * This class emits light uniformly across the face a rectangular plane.
 * This light type can be used to simulate light sources such as bright
 * windows or strip lighting.
 *
 * Important Notes:
 *
 * - There is no shadow support.
 * - Only PBR materials are supported.
 * - You have to include `RectAreaLightUniformsLib` (`WebGLRenderer`) or `RectAreaLightTexturesLib` (`WebGPURenderer`)
 * into your app and init the uniforms/textures.
 *
 * ```js
 * RectAreaLightUniformsLib.init(); // only relevant for WebGLRenderer
 * RectAreaLightNode.setLTC( RectAreaLightTexturesLib.init() ); //  only relevant for WebGPURenderer
 *
 * const intensity = 1; const width = 10; const height = 10;
 * const rectLight = new RectAreaLight( 0xffffff, intensity, width, height );
 * rectLight.position.set( 5, 5, 0 );
 * rectLight.lookAt( 0, 0, 0 );
 * scene.add( rectLight )
 * ```
 *
 * @augments Light
 */
export class RectAreaLight extends Light {
      /**
     * This flag can be used for type testing.
     *
     * @readonly
     * @default true
     */
    public isRectAreaLight = true;

    public type = 'RectAreaLight';

    /**
     * The width of the light.
     *
     * @default 10
     */
    public width: number;

    /**
     * The height of the light.
     *
     * @default 10
     */
    public height: number;


  /**
   * Constructs a new area light.
   *
   * @param {(number|Color|string)} [color=0xffffff] - The light's color.
   * @param {number} [intensity=1] - The light's strength/intensity.
   * @param {number} [width=10] - The width of the light.
   * @param {number} [height=10] - The height of the light.
   */
  constructor(
    color: number | Color | string,
    intensity: number = 1,
    width: number = 10,
    height: number = 10
  ) {

    super(color, intensity);


    /**
     * The width of the light.
     *
     * @type {number}
     * @default 10
     */
    this.width = width;

    /**
     * The height of the light.
     *
     * @type {number}
     * @default 10
     */
    this.height = height;

  }

  /**
   * The light's power. Power is the luminous power of the light measured in lumens (lm).
   * Changing the power will also change the light's intensity.
   *
   * @type {number}
   */
  public get power(): number {

    // compute the light's luminous power (in lumens) from its intensity (in nits)
    return this.intensity * this.width * this.height * Math.PI;

  }

  public set power(power: number) {

    // set the light's intensity (in nits) from the desired luminous power (in lumens)
    this.intensity = power / (this.width * this.height * Math.PI);

  }

  public copy(source: RectAreaLight): this {

    super.copy(source, true);

    this.width = source.width;
    this.height = source.height;

    return this;

  }

  public toJSON(meta: any): any {

    const data = super.toJSON(meta);

    data.object.width = this.width;
    data.object.height = this.height;

    return data;

  }

}

export function isRectAreaLight(light: Light): light is RectAreaLight {
  return (light as RectAreaLight).isRectAreaLight === true;
}

