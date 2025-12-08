import { Material } from './Material.js';
import { EnvironmentColorOperation, LineCap, LineJoin, MultiplyOperation } from '../constants.js';
import { Color } from '../math/Color.js';
import { Euler } from '../math/Euler.js';
import { Texture } from '../textures/Texture.js';

/**
 * A material for drawing geometries in a simple shaded (flat or wireframe) way.
 *
 * This material is not affected by lights.
 *
 * @augments Material
 */
export class MeshBasicMaterial extends Material {
  /**
   * This flag can be used for type testing.
   *
   * @type {boolean}
   * @readonly
   * @default true
   */
  public readonly isMeshBasicMaterial: boolean = true;

  /**
   * Color of the material.
   *
   * @type {Color}
   * @default (1,1,1)
   */
  public color: Color = new Color(0xffffff); // diffuse

  /**
   * The color map. May optionally include an alpha channel, typically combined
   * with {@link Material#transparent} or {@link Material#alphaTest}. The texture map
   * color is modulated by the diffuse `color`.
   *
   * @type {?Texture}
   * @default null
   */
  public map:  Texture | null = null;

  /**
   * The light map. Requires a second set of UVs.
   *
   * @type {?Texture}
   * @default null
   */
  public lightMap: Texture | null = null;

  /**
   * Intensity of the baked light.
   *
   * @type {number}
   * @default 1
   */
  public lightMapIntensity: number = 1.0;

  /**
   * The red channel of this texture is used as the ambient occlusion map.
   * Requires a second set of UVs.
   *
   * @type {?Texture}
   * @default null
   */
  public aoMap: Texture | null = null;

  /**
   * Intensity of the ambient occlusion effect. Range is `[0,1]`, where `0`
   * disables ambient occlusion. Where intensity is `1` and the AO map's
   * red channel is also `1`, ambient light is fully occluded on a surface.
   *
   * @type {number}
   * @default 1
   */
  public aoMapIntensity: number = 1.0;

  /**
   * Specular map used by the material.
   *
   * @type {?Texture}
   * @default null
   */
  public specularMap: Texture | null = null;

  /**
   * The alpha map is a grayscale texture that controls the opacity across the
   * surface (black: fully transparent; white: fully opaque).
   *
   * Only the color of the texture is used, ignoring the alpha channel if one
   * exists. For RGB and RGBA textures, the renderer will use the green channel
   * when sampling this texture due to the extra bit of precision provided for
   * green in DXT-compressed and uncompressed RGB 565 formats. Luminance-only and
   * luminance/alpha textures will also still work as expected.
   *
   * @type {?Texture}
   * @default null
   */
  public alphaMap: Texture | null = null;

  /**
   * The environment map.
   *
   * @type {?Texture}
   * @default null
   */
  public envMap: Texture | null = null;

  /**
   * The rotation of the environment map in radians.
   *
   * @type {Euler}
   * @default (0,0,0)
   */
  public envMapRotation: Euler = new Euler();

  /**
   * How to combine the result of the surface's color with the environment map, if any.
   *
   * When set to `MixOperation`, the {@link MeshBasicMaterial#reflectivity} is used to
   * blend between the two colors.
   *
   * @type {(MultiplyOperation|MixOperation|AddOperation)}
   * @default MultiplyOperation
   */
  public combine: EnvironmentColorOperation = MultiplyOperation;

  /**
   * How much the environment map affects the surface.
   * The valid range is between `0` (no reflections) and `1` (full reflections).
   *
   * @type {number}
   * @default 1
   */
  public reflectivity: number = 1;

  /**
   * The index of refraction (IOR) of air (approximately 1) divided by the
   * index of refraction of the material. It is used with environment mapping
   * modes {@link CubeRefractionMapping} and {@link EquirectangularRefractionMapping}.
   * The refraction ratio should not exceed `1`.
   *
   * @type {number}
   * @default 0.98
   */
  public refractionRatio: number = 0.98;

  /**
   * Renders the geometry as a wireframe.
   *
   * @type {boolean}
   * @default false
   */
  public wireframe: boolean = false;

  /**
   * Controls the thickness of the wireframe.
   *
   * Can only be used with {@link SVGRenderer}.
   *
   * @type {number}
   * @default 1
   */
  public wireframeLinewidth: number = 1;

  /**
   * Defines appearance of wireframe ends.
   *
   * Can only be used with {@link SVGRenderer}.
   *
   * @type {('round'|'bevel'|'miter')}
   * @default 'round'
   */
  public wireframeLinecap: LineCap = 'round';

  /**
   * Defines appearance of wireframe joints.
   *
   * Can only be used with {@link SVGRenderer}.
   *
   * @type {('round'|'bevel'|'miter')}
   * @default 'round'
   */
  public wireframeLinejoin: LineJoin = 'round';

  /**
   * Whether the material is affected by fog or not.
   *
   * @type {boolean}
   * @default true
   */
  public fog: boolean = true;

  /**
   * Constructs a new mesh basic material.
   *
   * @param {Object} [parameters] - An object with one or more properties
   * defining the material's appearance. Any property of the material
   * (including any property from inherited materials) can be passed
   * in here. Color values can be passed any type of value accepted
   * by {@link Color#set}.
   */
  constructor(parameters?: { [key: string]: any }) {

    super();

    this.type = 'MeshBasicMaterial';


    this.setValues(parameters);

  }

  copy(source: MeshBasicMaterial): this {

    super.copy(source);

    this.color.copy(source.color);

    this.map = source.map;

    this.lightMap = source.lightMap;
    this.lightMapIntensity = source.lightMapIntensity;

    this.aoMap = source.aoMap;
    this.aoMapIntensity = source.aoMapIntensity;

    this.specularMap = source.specularMap;

    this.alphaMap = source.alphaMap;

    this.envMap = source.envMap;
    this.envMapRotation.copy(source.envMapRotation);
    this.combine = source.combine;
    this.reflectivity = source.reflectivity;
    this.refractionRatio = source.refractionRatio;

    this.wireframe = source.wireframe;
    this.wireframeLinewidth = source.wireframeLinewidth;
    this.wireframeLinecap = source.wireframeLinecap;
    this.wireframeLinejoin = source.wireframeLinejoin;

    this.fog = source.fog;

    return this;

  }

}
