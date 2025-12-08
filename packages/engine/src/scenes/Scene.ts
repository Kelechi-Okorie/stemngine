import { Node3D } from "../core/Node3D";
import { Euler } from '../math/Euler';
import { Color } from "../math/Color";
import { Texture } from "../textures/Texture";
import { Fog } from "./Fog";
import { FogExp2 } from "./FogExp2";
import { Material } from "../materials/Material";

/**
 * Scenes allow you to set up what is to be rendered and where.
 *
 * @remarks
 * This is where you place 3D objects like meshes, lines or lights
 *
 * @augments Node3D
 */
export class Scene extends Node3D {
  /**
   * This flag can be used for type testing.
   *
   * @type {boolean}
   * @readonly
   * @default true
   */
  public isScene: boolean = true;

  public type: string = 'Scene';

  /**
   * Defines the background of the scene. Valid inputs are:
   *
   * - A color for defining a uniform colored background.
   * - A texture for defining a (flat) textured background.
   * - Cube textures or equirectangular textures for defining a skybox.
   *
   * @type {?(Color|Texture)}
   * @default null
   */
  public background: Color | Texture | null = null;

  /**
   * Sets the environment map for all physical materials in the scene. However,
   * it's not possible to overwrite an existing texture assigned to the `envMap`
   * material property.
   *
   * @type {?Texture}
   * @default null
   */
  public environment: Texture | null = null;

  /**
   * A fog instance defining the type of fog that affects everything
   * rendered in the scene.
   *
   * @type {?(Fog|FogExp2)}
   * @default null
   */
  public fog: Fog | FogExp2 | null = null;

  /**
   * Sets the blurriness of the background. Only influences environment maps
   * assigned to {@link Scene#background}. Valid input is a float between `0`
   * and `1`.
   *
   * @type {number}
   * @default 0
   */
  public backgroundBlurriness: number = 0;

  /**
   * Attenuates the color of the background. Only applies to background textures.
   *
   * @type {number}
   * @default 1
   */
  public backgroundIntensity: number = 1;

  /**
   * The rotation of the background in radians. Only influences environment maps
   * assigned to {@link Scene#background}.
   *
   * @type {Euler}
   * @default (0,0,0)
   */
  public backgroundRotation: Euler = new Euler();

  /**
   * Attenuates the color of the environment. Only influences environment maps
   * assigned to {@link Scene#environment}.
   *
   * @type {number}
   * @default 1
   */
  public environmentIntensity: number = 1;

  /**
   * The rotation of the environment map in radians. Only influences physical materials
   * in the scene when {@link Scene#environment} is used.
   *
   * @type {Euler}
   * @default (0,0,0)
   */
  public environmentRotation: Euler = new Euler();

  /**
   * Forces everything in the scene to be rendered with the defined material. It is possible
   * to exclude materials from override by setting {@link Material#allowOverride} to `false`.
   *
   * @type {?Material}
   * @default null
   */
  public overrideMaterial: Material | null = null;

  /**
   * Constructs a new scene
   */
  constructor() {
    super();

  }

  /**
   * Copies another scene to this scene
   *
   * @param source - The source scene
   * @param recursive - revursive
   * @returns A reference to this Scene
   */
  public copy(source: Scene, recursive: boolean) {

    super.copy(source, recursive);

    if (source.background !== null) this.background = source.background.clone();
    if (source.environment !== null) this.environment = source.environment.clone();
    if (source.fog !== null) this.fog = source.fog.clone();

    this.backgroundBlurriness = source.backgroundBlurriness;
    this.backgroundIntensity = source.backgroundIntensity;
    this.backgroundRotation.copy(source.backgroundRotation);

    this.environmentIntensity = source.environmentIntensity;
    this.environmentRotation.copy(source.environmentRotation);

    if (source.overrideMaterial !== null) this.overrideMaterial = source.overrideMaterial.clone();

    this.matrixAutoUpdate = source.matrixAutoUpdate;

    return this;

  }

  /**
   *
   * @param meta
   * @returns
   */
  public toJSON(meta: { [key: string]: any}): {[key: string]: any} {

    const data = super.toJSON(meta);

    if (this.fog !== null) data.object.fog = this.fog.toJSON();

    if (this.backgroundBlurriness > 0) data.object.backgroundBlurriness = this.backgroundBlurriness;
    if (this.backgroundIntensity !== 1) data.object.backgroundIntensity = this.backgroundIntensity;
    data.object.backgroundRotation = this.backgroundRotation.toArray();

    if (this.environmentIntensity !== 1) data.object.environmentIntensity = this.environmentIntensity;
    data.object.environmentRotation = this.environmentRotation.toArray();

    return data;

  }

}
