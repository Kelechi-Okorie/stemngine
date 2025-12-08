import { Node3D } from '../core/Node3D.js';
import { Color } from '../math/Color.js';

/**
 * Abstract base class for lights - all other light types inherit the
 * properties and methods described here.
 *
 * @abstract
 * @augments Object3D
 */
export class Light extends Node3D {
  /**
   * This flag can be used for type testing.
   *
   * @type {boolean}
   * @readonly
   * @default true
   */
  public isLight: boolean = true;

  public type: string = 'Light';

  /**
   * The light's color.
   *
   * @type {Color}
   */
  public color: Color;

  /**
   * The light's intensity.
   *
   * @type {number}
   * @default 1
   */
  public intensity: number;

  // Optional properties that may exist in subclasses
  public groundColor?: Color;
  public distance?: number;
  public angle?: number;
  public decay?: number;
  public penumbra?: number;
  public shadow?: any; // you can type this more strictly if you have a Shadow class
  public target?: Node3D;


  /**
   * Constructs a new light.
   *
   * @param {(number|Color|string)} [color=0xffffff] - The light's color.
   * @param {number} [intensity=1] - The light's strength/intensity.
   */
  constructor(color: number | Color | string, intensity: number = 1) {

    super();

    this.color = new Color(color);
    this.intensity = intensity;
  }

  /**
   * Frees the GPU-related resources allocated by this instance. Call this
   * method whenever this instance is no longer used in your app.
   */
  public dispose() {

    // Empty here in base class; some subclasses override.

  }

  /**
   * Copies from another light to this light
   * @param source
   * @param recursive
   * @returns
   */
  public copy(source: Light, recursive: boolean) {

    super.copy(source, recursive);

    this.color.copy(source.color);
    this.intensity = source.intensity;

    return this;

  }

  public toJSON(meta: { [key: string]: any }) {

    const data = super.toJSON(meta);

    data.object.color = this.color.getHex();
    data.object.intensity = this.intensity;

    if (this.groundColor !== undefined) data.object.groundColor = this.groundColor.getHex();

    if (this.distance !== undefined) data.object.distance = this.distance;
    if (this.angle !== undefined) data.object.angle = this.angle;
    if (this.decay !== undefined) data.object.decay = this.decay;
    if (this.penumbra !== undefined) data.object.penumbra = this.penumbra;

    if (this.shadow !== undefined) data.object.shadow = this.shadow.toJSON();
    if (this.target !== undefined) data.object.target = this.target.uuid;

    return data;

  }

}
