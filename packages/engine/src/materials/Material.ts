import { Color } from '../math/Color.js';
import { EventDispatcher } from '../core/EventDispatcher.js';
import { FrontSide, NormalBlending, LessEqualDepth, AddEquation, OneMinusSrcAlphaFactor, SrcAlphaFactor, AlwaysStencilFunc, KeepStencilOp, MaterialBlendMode, MaterialSide, MaterialBlendEquation, MaterialBlendFactor, MaterialDepthFunc, StencilFunc, StencilOp, Precision } from '../constants.js';
import { generateUUID } from '../math/MathUtils.js';
import { Plane } from '../math/Plane.js';

let _materialId = 0;

/**
 * Abstract base class for materials.
 *
 * Materials define the appearance of renderable 3D objects.
 *
 * @abstract
 * @augments EventDispatcher
 */
export class Material extends EventDispatcher {
  /**
 * This flag can be used for type testing.
 *
 * @type {boolean}
 * @readonly
 * @default true
 */
  public readonly isMaterial: boolean = true;

  /**
   * The ID of the material.
   *
   * @name Material#id
   * @type {number}
   * @readonly
   */
  public id: number = _materialId++;

  /**
 * The UUID of the material.
 *
 * @type {string}
 * @readonly
 */
  public readonly uuid: string = generateUUID();

  /**
   * The name of the material.
   *
   * @type {string}
   */
  public name: string = '';

  /**
   * The type property is used for detecting the object type
   * in context of serialization/deserialization.
   *
   * @type {string}
   * @readonly
   */
  public type: string = 'Material';

  /**
   * Defines the blending type of the material.
   *
   * It must be set to `CustomBlending` if custom blending properties like
   * {@link Material#blendSrc}, {@link Material#blendDst} or {@link Material#blendEquation}
   * should have any effect.
   *
   * @type {(NoBlending|NormalBlending|AdditiveBlending|SubtractiveBlending|MultiplyBlending|CustomBlending)}
   * @default NormalBlending
   */
  public blending: MaterialBlendMode = NormalBlending;

  /**
   * Defines which side of faces will be rendered - front, back or both.
   *
   * @type {(FrontSide|BackSide|DoubleSide)}
   * @default FrontSide
   */
  public side: MaterialSide = FrontSide;

  /**
   * If set to `true`, vertex colors should be used.
   *
   * The engine supports RGB and RGBA vertex colors depending on whether a three (RGB) or
   * four (RGBA) component color buffer attribute is used.
   *
   * @type {boolean}
   * @default false
   */
  public vertexColors: boolean = false;

  /**
   * Defines how transparent the material is.
   * A value of `0.0` indicates fully transparent, `1.0` is fully opaque.
   *
   * If the {@link Material#transparent} is not set to `true`,
   * the material will remain fully opaque and this value will only affect its color.
   *
   * @type {number}
   * @default 1
   */
  public opacity: number = 1;

  /**
   * Defines whether this material is transparent. This has an effect on
   * rendering as transparent objects need special treatment and are rendered
   * after non-transparent objects.
   *
   * When set to true, the extent to which the material is transparent is
   * controlled by {@link Material#opacity}.
   *
   * @type {boolean}
   * @default false
   */
  public transparent: boolean = false;

  /**
   * Enables alpha hashed transparency, an alternative to {@link Material#transparent} or
   * {@link Material#alphaTest}. The material will not be rendered if opacity is lower than
   * a random threshold. Randomization introduces some grain or noise, but approximates alpha
   * blending without the associated problems of sorting. Using TAA can reduce the resulting noise.
   *
   * @type {boolean}
   * @default false
   */
  public alphaHash: boolean = false;

  /**
   * Defines the blending source factor.
   *
   * @type {(ZeroFactor|OneFactor|SrcColorFactor|OneMinusSrcColorFactor|SrcAlphaFactor|OneMinusSrcAlphaFactor|DstAlphaFactor|OneMinusDstAlphaFactor|DstColorFactor|OneMinusDstColorFactor|SrcAlphaSaturateFactor|ConstantColorFactor|OneMinusConstantColorFactor|ConstantAlphaFactor|OneMinusConstantAlphaFactor)}
   * @default SrcAlphaFactor
   */
  public blendSrc: MaterialBlendFactor = SrcAlphaFactor;

  /**
   * Defines the blending destination factor.
   *
   * @type {(ZeroFactor|OneFactor|SrcColorFactor|OneMinusSrcColorFactor|SrcAlphaFactor|OneMinusSrcAlphaFactor|DstAlphaFactor|OneMinusDstAlphaFactor|DstColorFactor|OneMinusDstColorFactor|SrcAlphaSaturateFactor|ConstantColorFactor|OneMinusConstantColorFactor|ConstantAlphaFactor|OneMinusConstantAlphaFactor)}
   * @default OneMinusSrcAlphaFactor
   */
  public blendDst: MaterialBlendFactor = OneMinusSrcAlphaFactor;

  /**
   * Defines the blending equation.
   *
   * @type {(AddEquation|SubtractEquation|ReverseSubtractEquation|MinEquation|MaxEquation)}
   * @default AddEquation
   */
  public blendEquation: MaterialBlendEquation = AddEquation;

  /**
   * Defines the blending source alpha factor.
   *
   * @type {?(ZeroFactor|OneFactor|SrcColorFactor|OneMinusSrcColorFactor|SrcAlphaFactor|OneMinusSrcAlphaFactor|DstAlphaFactor|OneMinusDstAlphaFactor|DstColorFactor|OneMinusDstColorFactor|SrcAlphaSaturateFactor|ConstantColorFactor|OneMinusConstantColorFactor|ConstantAlphaFactor|OneMinusConstantAlphaFactor)}
   * @default null
   */
  public blendSrcAlpha: MaterialBlendFactor | null = null;

  /**
   * Defines the blending destination alpha factor.
   *
   * @type {?(ZeroFactor|OneFactor|SrcColorFactor|OneMinusSrcColorFactor|SrcAlphaFactor|OneMinusSrcAlphaFactor|DstAlphaFactor|OneMinusDstAlphaFactor|DstColorFactor|OneMinusDstColorFactor|SrcAlphaSaturateFactor|ConstantColorFactor|OneMinusConstantColorFactor|ConstantAlphaFactor|OneMinusConstantAlphaFactor)}
   * @default null
   */
  public blendDstAlpha: MaterialBlendFactor | null = null;

  /**
   * Defines the blending equation of the alpha channel.
   *
   * @type {?(AddEquation|SubtractEquation|ReverseSubtractEquation|MinEquation|MaxEquation)}
   * @default null
   */
  public blendEquationAlpha: MaterialBlendEquation | null = null;

  /**
 * Represents the RGB values of the constant blend color.
 *
 * This property has only an effect when using custom blending with `ConstantColor` or `OneMinusConstantColor`.
 *
 * @type {Color}
 * @default (0,0,0)
 */
  public blendColor: Color = new Color(0, 0, 0);

  /**
   * Represents the alpha value of the constant blend color.
   *
   * This property has only an effect when using custom blending with `ConstantAlpha` or `OneMinusConstantAlpha`.
   *
   * @type {number}
   * @default 0
   */
  public blendAlpha: number = 0;

  /**
   * Defines the depth function.
   *
   * @type {(NeverDepth|AlwaysDepth|LessDepth|LessEqualDepth|EqualDepth|GreaterEqualDepth|GreaterDepth|NotEqualDepth)}
   * @default LessEqualDepth
   */
  public depthFunc: MaterialDepthFunc = LessEqualDepth;

  /**
   * Whether to have depth test enabled when rendering this material.
   * When the depth test is disabled, the depth write will also be implicitly disabled.
   *
   * @type {boolean}
   * @default true
   */
  public depthTest: boolean = true;

  /**
   * Whether rendering this material has any effect on the depth buffer.
   *
   * When drawing 2D overlays it can be useful to disable the depth writing in
   * order to layer several things together without creating z-index artifacts.
   *
   * @type {boolean}
   * @default true
   */
  public depthWrite: boolean = true;

  /**
   * The bit mask to use when writing to the stencil buffer.
   *
   * @type {number}
   * @default 0xff
   */
  public stencilWriteMask: number = 0xff;

  /**
   * The stencil comparison function to use.
   *
   * @type {NeverStencilFunc|LessStencilFunc|EqualStencilFunc|LessEqualStencilFunc|GreaterStencilFunc|NotEqualStencilFunc|GreaterEqualStencilFunc|AlwaysStencilFunc}
   * @default AlwaysStencilFunc
   */
  public stencilFunc: StencilFunc = AlwaysStencilFunc;

  /**
   * The value to use when performing stencil comparisons or stencil operations.
   *
   * @type {number}
   * @default 0
   */
  public stencilRef: number = 0;

  /**
   * The bit mask to use when comparing against the stencil buffer.
   *
   * @type {number}
   * @default 0xff
   */
  public stencilFuncMask: number = 0xff;

  /**
   * Which stencil operation to perform when the comparison function returns `false`.
   *
   * @type {ZeroStencilOp|KeepStencilOp|ReplaceStencilOp|IncrementStencilOp|DecrementStencilOp|IncrementWrapStencilOp|DecrementWrapStencilOp|InvertStencilOp}
   * @default KeepStencilOp
   */
  public stencilFail: StencilOp = KeepStencilOp;

  /**
   * Which stencil operation to perform when the comparison function returns
   * `true` but the depth test fails.
   *
   * @type {ZeroStencilOp|KeepStencilOp|ReplaceStencilOp|IncrementStencilOp|DecrementStencilOp|IncrementWrapStencilOp|DecrementWrapStencilOp|InvertStencilOp}
   * @default KeepStencilOp
   */
  public stencilZFail: StencilOp = KeepStencilOp;

  /**
   * Which stencil operation to perform when the comparison function returns
   * `true` and the depth test passes.
   *
   * @type {ZeroStencilOp|KeepStencilOp|ReplaceStencilOp|IncrementStencilOp|DecrementStencilOp|IncrementWrapStencilOp|DecrementWrapStencilOp|InvertStencilOp}
   * @default KeepStencilOp
   */
  public stencilZPass: StencilOp = KeepStencilOp;

  /**
   * Whether stencil operations are performed against the stencil buffer. In
   * order to perform writes or comparisons against the stencil buffer this
   * value must be `true`.
   *
   * @type {boolean}
   * @default false
   */
  public stencilWrite: boolean = false;

  /**
   * User-defined clipping planes specified as Plane objects in world
   * space. These planes apply to the objects this material is attached to.
   * Points in space whose signed distance to the plane is negative are clipped
   * (not rendered). This requires {@link WebGLRenderer#localClippingEnabled} to
   * be `true`.
   *
   * @type {?Array<Plane>}
   * @default null
   */
  public clippingPlanes: Plane[] | null = null;

  /**
   * Changes the behavior of clipping planes so that only their intersection is
   * clipped, rather than their union.
   *
   * @type {boolean}
   * @default false
   */
  public clipIntersection: boolean = false;

  /**
   * Defines whether to clip shadows according to the clipping planes specified
   * on this material.
   *
   * @type {boolean}
   * @default false
   */
  public clipShadows: boolean = false;

  /**
   * Defines which side of faces cast shadows. If `null`, the side casting shadows
   * is determined as follows:
   *
   * - When {@link Material#side} is set to `FrontSide`, the back side cast shadows.
   * - When {@link Material#side} is set to `BackSide`, the front side cast shadows.
   * - When {@link Material#side} is set to `DoubleSide`, both sides cast shadows.
   *
   * @type {?(FrontSide|BackSide|DoubleSide)}
   * @default null
   */
  public shadowSide: MaterialSide | null = null;

  /**
   * Whether to render the material's color.
   *
   * This can be used in conjunction with {@link Object3D#renderOder} to create invisible
   * objects that occlude other objects.
   *
   * @type {boolean}
   * @default true
   */
  public colorWrite: boolean = true;

  /**
   * Override the renderer's default precision for this material.
   *
   * @type {?('highp'|'mediump'|'lowp')}
   * @default null
   */
  public precision: Precision | null = null;

  /**
   * Whether to use polygon offset or not. When enabled, each fragment's depth value will
   * be offset after it is interpolated from the depth values of the appropriate vertices.
   * The offset is added before the depth test is performed and before the value is written
   * into the depth buffer.
   *
   * Can be useful for rendering hidden-line images, for applying decals to surfaces, and for
   * rendering solids with highlighted edges.
   *
   * @type {boolean}
   * @default false
   */
  public polygonOffset: boolean = false;

  /**
   * Specifies a scale factor that is used to create a variable depth offset for each polygon.
   *
   * @type {number}
   * @default 0
   */
  public polygonOffsetFactor: number = 0;

  /**
   * Is multiplied by an implementation-specific value to create a constant depth offset.
   *
   * @type {number}
   * @default 0
   */
  public polygonOffsetUnits: number = 0;

  /**
   * Whether to apply dithering to the color to remove the appearance of banding.
   *
   * @type {boolean}
   * @default false
   */
  public dithering: boolean = false;

  /**
   * Whether alpha to coverage should be enabled or not. Can only be used with MSAA-enabled contexts
   * (meaning when the renderer was created with *antialias* parameter set to `true`). Enabling this
   * will smooth aliasing on clip plane edges and alphaTest-clipped edges.
   *
   * @type {boolean}
   * @default false
   */
  public alphaToCoverage: boolean = false;

  /**
   * Whether to premultiply the alpha (transparency) value.
   *
   * @type {boolean}
   * @default false
   */
  public premultipliedAlpha: boolean = false;

  /**
   * Whether double-sided, transparent objects should be rendered with a single pass or not.
   *
   * The engine renders double-sided, transparent objects with two draw calls (back faces first,
   * then front faces) to mitigate transparency artifacts. There are scenarios however where this
   * approach produces no quality gains but still doubles draw calls e.g. when rendering flat
   * vegetation like grass sprites. In these cases, set the `forceSinglePass` flag to `true` to
   * disable the two pass rendering to avoid performance issues.
   *
   * @type {boolean}
   * @default false
   */
  public forceSinglePass: boolean = false;

  /**
   * Whether it's possible to override the material with {@link Scene#overrideMaterial} or not.
   *
   * @type {boolean}
   * @default true
   */
  public allowOverride: boolean = true;

  /**
   * Defines whether 3D objects using this material are visible.
   *
   * @type {boolean}
   * @default true
   */
  public visible: boolean = true;

  /**
   * Defines whether this material is tone mapped according to the renderer's tone mapping setting.
   *
   * It is ignored when rendering to a render target or using post processing or when using
   * `WebGPURenderer`. In all these cases, all materials are honored by tone mapping.
   *
   * @type {boolean}
   * @default true
   */
  public toneMapped: boolean = true;

  /**
   * An object that can be used to store custom data about the Material. It
   * should not hold references to functions as these will not be cloned.
   *
   * @type {Object}
   */
  public userData: { [key: string]: unknown } = {};

  /**
   * This starts at `0` and counts how many times {@link Material#needsUpdate} is set to `true`.
   *
   * @type {number}
   * @readonly
   * @default 0
   */
  public version: number = 0;

  private _alphaTest: number = 0;

  /**
   * Constructs a new material.
   */
  constructor() {

    super();

  }

  /**
   * Sets the alpha value to be used when running an alpha test. The material
   * will not be rendered if the opacity is lower than this value.
   *
   * @type {number}
   * @readonly
   * @default 0
   */
  public get alphaTest(): number {

    return this._alphaTest;

  }

  public set alphaTest(value: number) {

    if (this._alphaTest > 0 !== value > 0) {

      this.version++;

    }

    this._alphaTest = value;

  }

  /**
   * An optional callback that is executed immediately before the material is used to render a 3D object.
   *
   * This method can only be used when rendering with {@link WebGLRenderer}.
   *
   * @param {WebGLRenderer} renderer - The renderer.
   * @param {Scene} scene - The scene.
   * @param {Camera} camera - The camera that is used to render the scene.
   * @param {BufferGeometry} geometry - The 3D object's geometry.
   * @param {Object3D} object - The 3D object.
   * @param {Object} group - The geometry group data.
   */
  onBeforeRender( /* renderer, scene, camera, geometry, object, group */) { }

  /**
   * An optional callback that is executed immediately before the shader
   * program is compiled. This function is called with the shader source code
   * as a parameter. Useful for the modification of built-in materials.
   *
   * This method can only be used when rendering with {@link WebGLRenderer}. The
   * recommended approach when customizing materials is to use `WebGPURenderer` with the new
   * Node Material system and [TSL]{@link https://github.com/mrdoob/js/wiki/js-Shading-Language}.
   *
   * @param {{vertexShader:string,fragmentShader:string,uniforms:Object}} shaderobject - The object holds the uniforms and the vertex and fragment shader source.
   * @param {WebGLRenderer} renderer - A reference to the renderer.
   */
  onBeforeCompile( /* shaderobject, renderer */) { }

  /**
   * In case {@link Material#onBeforeCompile} is used, this callback can be used to identify
   * values of settings used in `onBeforeCompile()`, so js can reuse a cached
   * shader or recompile the shader for this material as needed.
   *
   * This method can only be used when rendering with {@link WebGLRenderer}.
   *
   * @return {string} The custom program cache key.
   */
  public customProgramCacheKey(): string {

    return this.onBeforeCompile.toString();

  }

  /**
   * This method can be used to set default values from parameter objects.
   * It is a generic implementation so it can be used with different types
   * of materials.
   *
   * @param {Object} [values] - The material values to set.
   */
  public setValues(values?: { [key: string]: any }) {

    if (values === undefined) return;

    for (const key in values) {

      const newValue = values[key];

      if (newValue === undefined) {

        console.warn(`Material: parameter '${key}' has value of undefined.`);
        continue;

      }

      const self = this as any;

      const currentValue = self[key];

      if (currentValue === undefined) {

        console.warn(`Material: '${key}' is not a property of ${this.type}.`);
        continue;

      }

      if (currentValue && currentValue.isColor) {

        currentValue.set(newValue);

      } else if ((currentValue && currentValue.isVector3) && (newValue && newValue.isVector3)) {

        currentValue.copy(newValue);

      } else {

        self[key] = newValue;

      }

    }

  }

  /**
   * Serializes the material into JSON.
   *
   * @param {?(Object|string)} meta - An optional value holding meta information about the serialization.
   * @return {Object} A JSON object representing the serialized material.
   * @see {@link ObjectLoader#parse}
   */
  public toJSON(meta?: any): any {

    const isRootObject = (meta === undefined || typeof meta === 'string');

    if (isRootObject) {

      meta = {
        textures: {},
        images: {}
      };

    }

    const data: {
      metadata: { version: number; type: string; generator: string };
      [key: string]: any;
    } = {
      metadata: {
        version: 4.7,
        type: 'Material',
        generator: 'Material.toJSON'
      }
    };

    // standard Material serialization
    data.uuid = this.uuid;
    data.type = this.type;

    if (this.name !== '') data.name = this.name;

    const self = this as any;

    if (self.color && self.color.isColor) data.color = self.color.getHex();

    if (self.roughness !== undefined) data.roughness = self.roughness;
    if (self.metalness !== undefined) data.metalness = self.metalness;

    if (self.sheen !== undefined) data.sheen = self.sheen;
    if (self.sheenColor && self.sheenColor.isColor) data.sheenColor = self.sheenColor.getHex();
    if (self.sheenRoughness !== undefined) data.sheenRoughness = self.sheenRoughness;
    if (self.emissive && self.emissive.isColor) data.emissive = self.emissive.getHex();
    if (self.emissiveIntensity !== undefined && self.emissiveIntensity !== 1) data.emissiveIntensity = self.emissiveIntensity;
    if (self.specular && self.specular.isColor) data.specular = self.specular.getHex();
    if (self.specularIntensity !== undefined) data.specularIntensity = self.specularIntensity;
    if (self.specularColor && self.specularColor.isColor) data.specularColor = self.specularColor.getHex();
    if (self.shininess !== undefined) data.shininess = self.shininess;
    if (self.clearcoat !== undefined) data.clearcoat = self.clearcoat;
    if (self.clearcoatRoughness !== undefined) data.clearcoatRoughness = self.clearcoatRoughness;

    if (self.clearcoatMap && self.clearcoatMap.isTexture) {

      data.clearcoatMap = self.clearcoatMap.toJSON(meta).uuid;

    }

    if (self.clearcoatRoughnessMap && self.clearcoatRoughnessMap.isTexture) {
      data.clearcoatRoughnessMap = self.clearcoatRoughnessMap.toJSON(meta).uuid;

    }

    if (self.clearcoatNormalMap && self.clearcoatNormalMap.isTexture) {

      data.clearcoatNormalMap = self.clearcoatNormalMap.toJSON(meta).uuid;
      data.clearcoatNormalScale = self.clearcoatNormalScale.toArray();

    }

    if (self.sheenColorMap && self.sheenColorMap.isTexture) {
      data.sheenColorMap = self.sheenColorMap.toJSON(meta).uuid;

    }

    if (self.sheenRoughnessMap && self.sheenRoughnessMap.isTexture) {

      data.sheenRoughnessMap = self.sheenRoughnessMap.toJSON(meta).uuid;

    }

    if (self.dispersion !== undefined) data.dispersion = self.dispersion;

    if (self.iridescence !== undefined) data.iridescence = self.iridescence;
    if (self.iridescenceIOR !== undefined) data.iridescenceIOR = self.iridescenceIOR;
    if (self.iridescenceThicknessRange !== undefined) data.iridescenceThicknessRange = self.iridescenceThicknessRange;

    if (self.iridescenceMap && self.iridescenceMap.isTexture) {

      data.iridescenceMap = self.iridescenceMap.toJSON(meta).uuid;

    }

    if (self.iridescenceThicknessMap && self.iridescenceThicknessMap.isTexture) {

      data.iridescenceThicknessMap = self.iridescenceThicknessMap.toJSON(meta).uuid;

    }

    if (self.anisotropy !== undefined) data.anisotropy = self.anisotropy;
    if (self.anisotropyRotation !== undefined) data.anisotropyRotation = self.anisotropyRotation;

    if (self.anisotropyMap && self.anisotropyMap.isTexture) {

      data.anisotropyMap = self.anisotropyMap.toJSON(meta).uuid;

    }

    if (self.map && self.map.isTexture) data.map = self.map.toJSON(meta).uuid;
    if (self.matcap && self.matcap.isTexture) data.matcap = self.matcap.toJSON(meta).uuid;
    if (self.alphaMap && self.alphaMap.isTexture) data.alphaMap = self.alphaMap.toJSON(meta).uuid;

    if (self.lightMap && self.lightMap.isTexture) {

      data.lightMap = self.lightMap.toJSON(meta).uuid;
      data.lightMapIntensity = self.lightMapIntensity;

    }

    if (self.aoMap && self.aoMap.isTexture) {

      data.aoMap = self.aoMap.toJSON(meta).uuid;
      data.aoMapIntensity = self.aoMapIntensity;

    }

    if (self.bumpMap && self.bumpMap.isTexture) {

      data.bumpMap = self.bumpMap.toJSON(meta).uuid;
      data.bumpScale = self.bumpScale;

    }

    if (self.normalMap && self.normalMap.isTexture) {

      data.normalMap = self.normalMap.toJSON(meta).uuid;
      data.normalMapType = self.normalMapType;
      data.normalScale = self.normalScale.toArray();

    }

    if (self.displacementMap && self.displacementMap.isTexture) {

      data.displacementMap = self.displacementMap.toJSON(meta).uuid;
      data.displacementScale = self.displacementScale;
      data.displacementBias = self.displacementBias;

    }

    if (self.roughnessMap && self.roughnessMap.isTexture) data.roughnessMap = self.roughnessMap.toJSON(meta).uuid;
    if (self.metalnessMap && self.metalnessMap.isTexture) data.metalnessMap = self.metalnessMap.toJSON(meta).uuid;

    if (self.emissiveMap && self.emissiveMap.isTexture) data.emissiveMap = self.emissiveMap.toJSON(meta).uuid;
    if (self.specularMap && self.specularMap.isTexture) data.specularMap = self.specularMap.toJSON(meta).uuid;
    if (self.specularIntensityMap && self.specularIntensityMap.isTexture) data.specularIntensityMap = self.specularIntensityMap.toJSON(meta).uuid;
    if (self.specularColorMap && self.specularColorMap.isTexture) data.specularColorMap = self.specularColorMap.toJSON(meta).uuid;

    if (self.envMap && self.envMap.isTexture) {

      data.envMap = self.envMap.toJSON(meta).uuid;

      if (self.combine !== undefined) data.combine = self.combine;

    }

    if (self.envMapRotation !== undefined) data.envMapRotation = self.envMapRotation.toArray();
    if (self.envMapIntensity !== undefined) data.envMapIntensity = self.envMapIntensity;
    if (self.reflectivity !== undefined) data.reflectivity = self.reflectivity;
    if (self.refractionRatio !== undefined) data.refractionRatio = self.refractionRatio;

    if (self.gradientMap && self.gradientMap.isTexture) {

      data.gradientMap = self.gradientMap.toJSON(meta).uuid;

    }

    if (self.transmission !== undefined) data.transmission = self.transmission;
    if (self.transmissionMap && self.transmissionMap.isTexture) data.transmissionMap = self.transmissionMap.toJSON(meta).uuid;
    if (self.thickness !== undefined) data.thickness = self.thickness;
    if (self.thicknessMap && self.thicknessMap.isTexture) data.thicknessMap = self.thicknessMap.toJSON(meta).uuid;
    if (self.attenuationDistance !== undefined && self.attenuationDistance !== Infinity) data.attenuationDistance = self.attenuationDistance;
    if (self.attenuationColor !== undefined) data.attenuationColor = self.attenuationColor.getHex();

    if (self.size !== undefined) data.size = self.size;
    if (self.shadowSide !== null) data.shadowSide = self.shadowSide;
    if (self.sizeAttenuation !== undefined) data.sizeAttenuation = self.sizeAttenuation;

    if (self.blending !== NormalBlending) data.blending = self.blending;
    if (self.side !== FrontSide) data.side = this.side;
    if (this.vertexColors === true) data.vertexColors = true;

    if (this.opacity < 1) data.opacity = this.opacity;
    if (this.transparent === true) data.transparent = true;

    if (this.blendSrc !== SrcAlphaFactor) data.blendSrc = this.blendSrc;
    if (this.blendDst !== OneMinusSrcAlphaFactor) data.blendDst = this.blendDst;
    if (this.blendEquation !== AddEquation) data.blendEquation = this.blendEquation;
    if (this.blendSrcAlpha !== null) data.blendSrcAlpha = this.blendSrcAlpha;
    if (this.blendDstAlpha !== null) data.blendDstAlpha = this.blendDstAlpha;
    if (this.blendEquationAlpha !== null) data.blendEquationAlpha = this.blendEquationAlpha;
    if (this.blendColor && this.blendColor.isColor) data.blendColor = this.blendColor.getHex();
    if (this.blendAlpha !== 0) data.blendAlpha = this.blendAlpha;

    if (this.depthFunc !== LessEqualDepth) data.depthFunc = this.depthFunc;
    if (this.depthTest === false) data.depthTest = this.depthTest;
    if (this.depthWrite === false) data.depthWrite = this.depthWrite;
    if (this.colorWrite === false) data.colorWrite = this.colorWrite;

    if (this.stencilWriteMask !== 0xff) data.stencilWriteMask = this.stencilWriteMask;
    if (this.stencilFunc !== AlwaysStencilFunc) data.stencilFunc = this.stencilFunc;
    if (this.stencilRef !== 0) data.stencilRef = this.stencilRef;
    if (this.stencilFuncMask !== 0xff) data.stencilFuncMask = this.stencilFuncMask;
    if (this.stencilFail !== KeepStencilOp) data.stencilFail = this.stencilFail;
    if (this.stencilZFail !== KeepStencilOp) data.stencilZFail = this.stencilZFail;
    if (this.stencilZPass !== KeepStencilOp) data.stencilZPass = this.stencilZPass;
    if (this.stencilWrite === true) data.stencilWrite = this.stencilWrite;

    // rotation (SpriteMaterial)
    if (self.rotation !== undefined && self.rotation !== 0) data.rotation = self.rotation;

    if (self.polygonOffset === true) data.polygonOffset = true;
    if (self.polygonOffsetFactor !== 0) data.polygonOffsetFactor = this.polygonOffsetFactor;
    if (this.polygonOffsetUnits !== 0) data.polygonOffsetUnits = this.polygonOffsetUnits;

    if (self.linewidth !== undefined && self.linewidth !== 1) data.linewidth = self.linewidth;
    if (self.dashSize !== undefined) data.dashSize = self.dashSize;
    if (self.gapSize !== undefined) data.gapSize = self.gapSize;
    if (self.scale !== undefined) data.scale = self.scale;

    if (this.dithering === true) data.dithering = true;

    if (this.alphaTest > 0) data.alphaTest = this.alphaTest;
    if (this.alphaHash === true) data.alphaHash = true;
    if (this.alphaToCoverage === true) data.alphaToCoverage = true;
    if (this.premultipliedAlpha === true) data.premultipliedAlpha = true;
    if (this.forceSinglePass === true) data.forceSinglePass = true;

    if (self.wireframe === true) data.wireframe = true;
    if (self.wireframeLinewidth > 1) data.wireframeLinewidth = self.wireframeLinewidth;
    if (self.wireframeLinecap !== 'round') data.wireframeLinecap = self.wireframeLinecap;
    if (self.wireframeLinejoin !== 'round') data.wireframeLinejoin = self.wireframeLinejoin;

    if (self.flatShading === true) data.flatShading = true;

    if (this.visible === false) data.visible = false;

    if (this.toneMapped === false) data.toneMapped = false;

    if (self.fog === false) data.fog = false;

    if (Object.keys(this.userData).length > 0) data.userData = this.userData;

    // TODO: Copied from Object3D.toJSON

    function extractFromCache(cache: { [key: string]: any}) {

      const values = [];

      for (const key in cache) {

        const data = cache[key];
        delete data.metadata;
        values.push(data);

      }

      return values;

    }

    if (isRootObject) {

      const textures = extractFromCache(meta.textures);
      const images = extractFromCache(meta.images);

      if (textures.length > 0) data.textures = textures;
      if (images.length > 0) data.images = images;

    }

    return data;

  }

  /**
   * Returns a new material with copied values from this instance.
   *
   * @return {Material} A clone of this instance.
   */
  public clone(): Material {
    const Ctor = this.constructor as new () => Material;
    const instance = new Ctor();

    return instance.copy(this);

  }

  /**
   * Copies the values of the given material to this instance.
   *
   * @param {Material} source - The material to copy.
   * @return {Material} A reference to this instance.
   */
  public copy(source: Material): Material {

    this.name = source.name;

    this.blending = source.blending;
    this.side = source.side;
    this.vertexColors = source.vertexColors;

    this.opacity = source.opacity;
    this.transparent = source.transparent;

    this.blendSrc = source.blendSrc;
    this.blendDst = source.blendDst;
    this.blendEquation = source.blendEquation;
    this.blendSrcAlpha = source.blendSrcAlpha;
    this.blendDstAlpha = source.blendDstAlpha;
    this.blendEquationAlpha = source.blendEquationAlpha;
    this.blendColor.copy(source.blendColor);
    this.blendAlpha = source.blendAlpha;

    this.depthFunc = source.depthFunc;
    this.depthTest = source.depthTest;
    this.depthWrite = source.depthWrite;

    this.stencilWriteMask = source.stencilWriteMask;
    this.stencilFunc = source.stencilFunc;
    this.stencilRef = source.stencilRef;
    this.stencilFuncMask = source.stencilFuncMask;
    this.stencilFail = source.stencilFail;
    this.stencilZFail = source.stencilZFail;
    this.stencilZPass = source.stencilZPass;
    this.stencilWrite = source.stencilWrite;

    const srcPlanes = source.clippingPlanes;
    let dstPlanes = null;

    if (srcPlanes !== null) {

      const n = srcPlanes.length;
      dstPlanes = new Array(n);

      for (let i = 0; i !== n; ++i) {

        dstPlanes[i] = srcPlanes[i].clone();

      }

    }

    this.clippingPlanes = dstPlanes;
    this.clipIntersection = source.clipIntersection;
    this.clipShadows = source.clipShadows;

    this.shadowSide = source.shadowSide;

    this.colorWrite = source.colorWrite;

    this.precision = source.precision;

    this.polygonOffset = source.polygonOffset;
    this.polygonOffsetFactor = source.polygonOffsetFactor;
    this.polygonOffsetUnits = source.polygonOffsetUnits;

    this.dithering = source.dithering;

    this.alphaTest = source.alphaTest;
    this.alphaHash = source.alphaHash;
    this.alphaToCoverage = source.alphaToCoverage;
    this.premultipliedAlpha = source.premultipliedAlpha;
    this.forceSinglePass = source.forceSinglePass;

    this.visible = source.visible;

    this.toneMapped = source.toneMapped;

    this.userData = JSON.parse(JSON.stringify(source.userData));

    return this;

  }

  /**
   * Frees the GPU-related resources allocated by this instance. Call this
   * method whenever this instance is no longer used in your app.
   *
   * @fires Material#dispose
   */
  public dispose() {

    /**
     * Fires when the material has been disposed of.
     *
     * @event Material#dispose
     * @type {Object}
     */
    this.dispatchEvent({ type: 'dispose' });

  }

  /**
   * Setting this property to `true` indicates the engine the material
   * needs to be recompiled.
   *
   * @type {boolean}
   * @default false
   * @param {boolean} value
   */
  public set needsUpdate(value: boolean) {

    if (value === true) this.version++;

  }

}
