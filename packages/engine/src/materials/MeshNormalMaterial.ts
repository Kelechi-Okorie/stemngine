import { NormalMapType, TangentSpaceNormalMap } from '../constants.js';
import { Material } from './Material.js';
import { Vector2 } from '../math/Vector2.js';
import { Texture } from '../textures/Texture.js';

/**
 * A material that maps the normal vectors to RGB colors.
 *
 * @augments Material
 */
export class MeshNormalMaterial extends Material {
  /**
   * This flag can be used for type testing.
   *
   * @type {boolean}
   * @readonly
   * @default true
   */
  public isMeshNormalMaterial: boolean = true;

  /**
   * The texture to create a bump map. The black and white values map to the
   * perceived depth in relation to the lights. Bump doesn't actually affect
   * the geometry of the object, only the lighting. If a normal map is defined
   * this will be ignored.
   *
   * @type {?Texture}
   * @default null
   */
  public bumpMap: Texture | null = null;

  /**
   * How much the bump map affects the material. Typical range is `[0,1]`.
   *
   * @type {number}
   * @default 1
   */
  public bumpScale: number = 1;

  /**
   * The texture to create a normal map. The RGB values affect the surface
   * normal for each pixel fragment and change the way the color is lit. Normal
   * maps do not change the actual shape of the surface, only the lighting. In
   * case the material has a normal map authored using the left handed
   * convention, the `y` component of `normalScale` should be negated to compensate
   * for the different handedness.
   *
   * @type {?Texture}
   * @default null
   */
  public normalMap: Texture | null = null;

  /**
   * The type of normal map.
   *
   * @type {(TangentSpaceNormalMap|ObjectSpaceNormalMap)}
   * @default TangentSpaceNormalMap
   */
  public normalMapType: NormalMapType = TangentSpaceNormalMap;

  /**
   * How much the normal map affects the material. Typical value range is `[0,1]`.
   *
   * @type {Vector2}
   * @default (1,1)
   */
  public normalScale: Vector2 = new Vector2(1, 1);

    /**
     * The displacement map affects the position of the mesh's vertices. Unlike
     * other maps which only affect the light and shade of the material the
     * displaced vertices can cast shadows, block other objects, and otherwise
     * act as real geometry. The displacement texture is an image where the value
     * of each pixel (white being the highest) is mapped against, and
     * repositions, the vertices of the mesh.
     *
     * @type {?Texture}
     * @default null
     */
    public displacementMap: Texture | null = null;

    /**
     * How much the displacement map affects the mesh (where black is no
     * displacement, and white is maximum displacement). Without a displacement
     * map set, this value is not applied.
     *
     * @type {number}
     * @default 0
     */
    public displacementScale: number = 1;

    /**
     * The offset of the displacement map's values on the mesh's vertices.
     * The bias is added to the scaled sample of the displacement map.
     * Without a displacement map set, this value is not applied.
     *
     * @type {number}
     * @default 0
     */
    public displacementBias: number = 0;

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
     * WebGL and WebGPU ignore this property and always render
     * 1 pixel wide lines.
     *
     * @type {number}
     * @default 1
     */
    public wireframeLinewidth: number = 1;

    /**
     * Whether the material is rendered with flat shading or not.
     *
     * @type {boolean}
     * @default false
     */
    public flatShading: boolean = false;

  /**
   * Constructs a new mesh normal material.
   *
   * @param {Object} [parameters] - An object with one or more properties
   * defining the material's appearance. Any property of the material
   * (including any property from inherited materials) can be passed
   * in here. Color values can be passed any type of value accepted
   * by {@link Color#set}.
   */
  constructor(parameters?: { [key: string]: any }) {

    super();

    this.type = 'MeshNormalMaterial';


    this.setValues(parameters);

  }

  public copy(source: MeshNormalMaterial): this {

    super.copy(source);

    this.bumpMap = source.bumpMap;
    this.bumpScale = source.bumpScale;

    this.normalMap = source.normalMap;
    this.normalMapType = source.normalMapType;
    this.normalScale.copy(source.normalScale);

    this.displacementMap = source.displacementMap;
    this.displacementScale = source.displacementScale;
    this.displacementBias = source.displacementBias;

    this.wireframe = source.wireframe;
    this.wireframeLinewidth = source.wireframeLinewidth;

    this.flatShading = source.flatShading;

    return this;

  }

}
