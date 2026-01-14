import { SphericalHarmonics3 } from '../math/SphericalHarmonics3';
import { Light } from './Light.js';
import { Color } from '../math/Color';

/**
 * Light probes are an alternative way of adding light to a 3D scene. Unlike
 * classical light sources (e.g. directional, point or spot lights), light
 * probes do not emit light. Instead they store information about light
 * passing through 3D space. During rendering, the light that hits a 3D
 * object is approximated by using the data from the light probe.
 *
 * Light probes are usually created from (radiance) environment maps. The
 * class {@link LightProbeGenerator} can be used to create light probes from
 * cube textures or render targets. However, light estimation data could also
 * be provided in other forms e.g. by WebXR. This enables the rendering of
 * augmented reality content that reacts to real world lighting.
 *
 * The current probe implementation in three.js supports so-called diffuse
 * light probes. This type of light probe is functionally equivalent to an
 * irradiance environment map.
 *
 * @augments Light
 */
export class LightProbe extends Light {
  /**
   * This flag can be used for type testing.
   *
   * @readonly
   * @default true
   */
  public isLightProbe = true;

  public sh: SphericalHarmonics3;


  /**
   * Constructs a new light probe.
   *
   * @param {SphericalHarmonics3} sh - The spherical harmonics which represents encoded lighting information.
   * @param {number} [intensity=1] - The light's strength/intensity.
   */
  constructor(
    sh: SphericalHarmonics3 = new SphericalHarmonics3(),
    intensity: number = 1
  ) {

    super(new Color(), intensity);

    /**
     * A light probe uses spherical harmonics to encode lighting information.
     *
     * @type {SphericalHarmonics3}
     */
    this.sh = sh;

  }

  public copy(source: this) {

    super.copy(source, true);

    this.sh.copy(source.sh);

    return this;

  }

  /**
   * Deserializes the light prove from the given JSON.
   *
   * @param {Object} json - The JSON holding the serialized light probe.
   * @return {LightProbe} A reference to this light probe.
   */
  public fromJSON(json: any): this {

    this.intensity = json.intensity; // TODO: Move this bit to Light.fromJSON();
    this.sh.fromArray(json.sh);

    return this;

  }

  public toJSON(meta: any) {

    const data = super.toJSON(meta);

    data.object.sh = this.sh.toArray();

    return data;

  }

}

export function isLightProbe(light: Light): light is LightProbe {
  return (light as LightProbe).isLightProbe === true;
}
