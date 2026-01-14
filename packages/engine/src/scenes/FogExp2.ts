import { Color } from '../math/Color.js';

/**
 * This class can be used to define an exponential squared fog,
 * which gives a clear view near the camera and a faster than exponentially
 * densening fog farther from the camera.
 *
 * ```ts
 * const scene = new Scene();
 * scene.fog = new FogExp2( 0xcccccc, 0.002 );
 * ```
 */
export class FogExp2 {
  /**
   * This flag can be used for type testing.
   *
   * @readonly
   * @default true
   */
  public isFogExp2 = true;

  /**
   * The name of the fog.
   *
   * @type {string}
   */
  public name: string = '';

  /**
   * The fog's color.
   *
   * @type {Color}
   */
  public color: Color;

  /**
   *  Defines how fast the fog will grow dense.
   *
   * @type {number}
   * @default 0.00025
   */
  public density: number;


  /**
   * Constructs a new fog.
   *
   * @param {number|Color} color - The fog's color.
   * @param {number} [density=0.00025] - Defines how fast the fog will grow dense.
   */
  constructor(color: Color, density: number = 0.00025) {
    this.color = new Color(color);
    this.density = density;
  }

  /**
   * Returns a new fog with copied values from this instance.
   *
   * @return {FogExp2} A clone of this instance.
   */
  public clone(): FogExp2 {

    return new FogExp2(this.color, this.density);

  }

  /**
   * Serializes the fog into JSON.
   *
   * @param {?(Object|string)} meta - An optional value holding meta information about the serialization.
   * @return {Object} A JSON object representing the serialized fog
   */
  public toJSON( /* meta */): { [key: string]: any } {

    return {
      type: 'FogExp2',
      name: this.name,
      color: this.color.getHex(),
      density: this.density
    };

  }

}

export function isFogExp2(
  fog: FogExp2
): fog is FogExp2 {
  return (fog as any).isFogExp2 === true;
}
