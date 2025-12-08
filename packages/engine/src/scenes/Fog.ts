import { Color } from '../math/Color.js';

/**
 * This class can be used to define a linear fog that grows linearly denser
 * with the distance.
 *
 * ```ts
 * const scene = new Scene();
 * scene.fog = new Fog( 0xcccccc, 10, 15 );
 * ```
 */
export class Fog {
  /**
   * This flag can be used for type testing.
   *
   * @type {boolean}
   * @readonly
   * @default true
   */
  public readonly isFog: boolean = true;

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
   * The minimum distance to start applying fog. Objects that are less than
   * `near` units from the active camera won't be affected by fog.
   *
   * @type {number}
   * @default 1
   */
  public near: number;

  /**
   * The maximum distance at which fog stops being calculated and applied.
   * Objects that are more than `far` units away from the active camera won't
   * be affected by fog.
   *
   * @type {number}
   * @default 1000
   */
  public far: number;

  /**
   * Constructs a new fog.
   *
   * @param {number|Color} color - The fog's color.
   * @param {number} [near=1] - The minimum distance to start applying fog.
   * @param {number} [far=1000] - The maximum distance at which fog stops being calculated and applied.
   */
  constructor(color: Color, near: number = 1, far: number = 1000) {
    this.color = new Color(color);
    this.near = near;
    this.far = far;
  }

  /**
   * Returns a new fog with copied values from this instance.
   *
   * @return {Fog} A clone of this instance.
   */
  public clone(): Fog {

    return new Fog(this.color, this.near, this.far);

  }

  /**
   * Serializes the fog into JSON.
   *
   * @param {?(Object|string)} meta - An optional value holding meta information about the serialization.
   * @return {Object} A JSON object representing the serialized fog
   */
  public toJSON( /* meta */): {[key: string]: any} {

    return {
      type: 'Fog',
      name: this.name,
      color: this.color.getHex(),
      near: this.near,
      far: this.far
    };

  }

}
