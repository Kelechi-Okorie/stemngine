import { BackSide, DoubleSide, CubeUVReflectionMapping, ObjectSpaceNormalMap, TangentSpaceNormalMap, NoToneMapping, NormalBlending, LinearSRGBColorSpace, SRGBTransfer, Precision } from '../../constants';
import { Layers } from '../../core/Layers';
import { WebGLProgram } from './WebGLProgram';
import { WebGLShaderCache } from './WebGLShaderCache';
import { ShaderLib } from '../shaders/ShaderLib';
import { cloneUniforms } from '../shaders/UniformsUtils';
import { ColorManagement } from '../../math/ColorManagement';
import { WebGLRenderer } from '../WebGLRenderer';
import { WebGLCubeMaps } from './WebGLCubeMaps';
import { WebGLCubeUVMaps } from './WebGLCubeUVMaps';
import { WebGLExtensions } from './WebGLExtensions';
import { WebGLCapabilities } from './WebGLCapabilities';
import { WebGLBindingStates } from './WebGLBindingStates';
import { WebGLClipping } from './WebGLClipping';
import { WebGLMaterials } from './WebGLMaterials';
import { WebGLLights } from './WebGLLights';
import { LightShadow } from '../../lights/LightShadow';
import { Scene } from '../../scenes/Scene';
import { Node3D } from '../../core/Node3D';
import { Mesh } from '../../objects/Mesh';

export class WebGLPrograms {
  private readonly renderer: WebGLRenderer;
  private readonly cubemaps: WebGLCubeMaps;
  private readonly cubeuvmaps: WebGLCubeUVMaps;
  private readonly extensions: WebGLExtensions;
  private readonly capabilities: WebGLCapabilities;
  private readonly bindingStates: WebGLBindingStates;
  private readonly clipping: WebGLClipping;

  private readonly cm: ColorManagement = ColorManagement.instance;


  protected _programLayers = new Layers();
  protected _customShaders = new WebGLShaderCache();
  protected _activeChannels = new Set();
  public programs: WebGLProgram[] = [];

  protected logarithmicDepthBuffer: boolean;
  protected SUPPORTS_VERTEX_TEXTURES: boolean;

  private precision: Precision;

  private shaderIDs: Record<string, string> = {
    MeshDepthMaterial: 'depth',
    MeshDistanceMaterial: 'distanceRGBA',
    MeshNormalMaterial: 'normal',
    MeshBasicMaterial: 'basic',
    MeshLambertMaterial: 'lambert',
    MeshPhongMaterial: 'phong',
    MeshToonMaterial: 'toon',
    MeshStandardMaterial: 'physical',
    MeshPhysicalMaterial: 'physical',
    MeshMatcapMaterial: 'matcap',
    LineBasicMaterial: 'basic',
    LineDashedMaterial: 'dashed',
    PointsMaterial: 'points',
    ShadowMaterial: 'shadow',
    SpriteMaterial: 'sprite'
  };

  constructor(
    renderer: WebGLRenderer,
    cubemaps: WebGLCubeMaps,
    cubeuvmaps: WebGLCubeUVMaps,
    extensions: WebGLExtensions,
    capabilities: WebGLCapabilities,
    bindingStates: WebGLBindingStates,
    clipping: WebGLClipping
  ) {
    this.renderer = renderer;
    this.cubemaps = cubemaps;
    this.cubeuvmaps = cubeuvmaps;
    this.extensions = extensions;
    this.capabilities = capabilities;
    this.bindingStates = bindingStates;
    this.clipping = clipping;

    this.logarithmicDepthBuffer = capabilities.logarithmicDepthBuffer;
    this.SUPPORTS_VERTEX_TEXTURES = capabilities.vertexTextures;

    this.precision = capabilities.precision;

  }

  private getChannel(value: any) {

    this._activeChannels.add(value);

    if (value === 0) return 'uv';

    return `uv${value}`;

  }

  public getParameters(
    material: any,
    lights: any,
    shadows: LightShadow,
    scene: Scene,
    object: any
  ) {

    const fog = scene.fog;
    const geometry = object.geometry;
    const environment = material.isMeshStandardMaterial ? scene.environment : null;

    const envMap = (material.isMeshStandardMaterial ? this.cubeuvmaps : this.cubemaps).get(material.envMap || environment);
    const envMapCubeUVHeight = (!!envMap) && (envMap.mapping === CubeUVReflectionMapping) ? envMap.image.height : null;

    const shaderID = this.shaderIDs[material.type];

    // heuristics to create shader parameters according to lights in the scene
    // (not to blow over maxLights budget)

    if (material.precision !== null) {

      this.precision = this.capabilities.getMaxPrecision(material.precision);

      if (this.precision !== material.precision) {

        console.warn('THREE.WebGLProgram.getParameters:', material.precision, 'not supported, using', this.precision, 'instead.');

      }

    }

    //

    const morphAttribute = geometry.morphAttributes.position || geometry.morphAttributes.normal || geometry.morphAttributes.color;
    const morphTargetsCount = (morphAttribute !== undefined) ? morphAttribute.length : 0;

    let morphTextureStride = 0;

    if (geometry.morphAttributes.position !== undefined) morphTextureStride = 1;
    if (geometry.morphAttributes.normal !== undefined) morphTextureStride = 2;
    if (geometry.morphAttributes.color !== undefined) morphTextureStride = 3;

    //

    let vertexShader, fragmentShader;
    let customVertexShaderID, customFragmentShaderID;

    if (shaderID) {

      const shader = ShaderLib[shaderID as keyof typeof ShaderLib];

      if (!('vertexShader' in shader) || !('fragmentShader' in shader)) {
        throw new Error(`Shader '${shaderID}' does not define vertex/fragment shaders`);
      }

      vertexShader = shader.vertexShader;
      fragmentShader = shader.fragmentShader;

    } else {

      vertexShader = material.vertexShader;
      fragmentShader = material.fragmentShader;

      this._customShaders.update(material);

      customVertexShaderID = this._customShaders.getVertexShaderID(material);
      customFragmentShaderID = this._customShaders.getFragmentShaderID(material);

    }

    const currentRenderTarget = this.renderer.getRenderTarget();
    const reversedDepthBuffer = this.renderer.state.buffers.depth.getReversed();

    const IS_INSTANCEDMESH = object.isInstancedMesh === true;
    const IS_BATCHEDMESH = object.isBatchedMesh === true;

    const HAS_MAP = !!material.map;
    const HAS_MATCAP = !!material.matcap;
    const HAS_ENVMAP = !!envMap;
    const HAS_AOMAP = !!material.aoMap;
    const HAS_LIGHTMAP = !!material.lightMap;
    const HAS_BUMPMAP = !!material.bumpMap;
    const HAS_NORMALMAP = !!material.normalMap;
    const HAS_DISPLACEMENTMAP = !!material.displacementMap;
    const HAS_EMISSIVEMAP = !!material.emissiveMap;

    const HAS_METALNESSMAP = !!material.metalnessMap;
    const HAS_ROUGHNESSMAP = !!material.roughnessMap;

    const HAS_ANISOTROPY = material.anisotropy > 0;
    const HAS_CLEARCOAT = material.clearcoat > 0;
    const HAS_DISPERSION = material.dispersion > 0;
    const HAS_IRIDESCENCE = material.iridescence > 0;
    const HAS_SHEEN = material.sheen > 0;
    const HAS_TRANSMISSION = material.transmission > 0;

    const HAS_ANISOTROPYMAP = HAS_ANISOTROPY && !!material.anisotropyMap;

    const HAS_CLEARCOATMAP = HAS_CLEARCOAT && !!material.clearcoatMap;
    const HAS_CLEARCOAT_NORMALMAP = HAS_CLEARCOAT && !!material.clearcoatNormalMap;
    const HAS_CLEARCOAT_ROUGHNESSMAP = HAS_CLEARCOAT && !!material.clearcoatRoughnessMap;

    const HAS_IRIDESCENCEMAP = HAS_IRIDESCENCE && !!material.iridescenceMap;
    const HAS_IRIDESCENCE_THICKNESSMAP = HAS_IRIDESCENCE && !!material.iridescenceThicknessMap;

    const HAS_SHEEN_COLORMAP = HAS_SHEEN && !!material.sheenColorMap;
    const HAS_SHEEN_ROUGHNESSMAP = HAS_SHEEN && !!material.sheenRoughnessMap;

    const HAS_SPECULARMAP = !!material.specularMap;
    const HAS_SPECULAR_COLORMAP = !!material.specularColorMap;
    const HAS_SPECULAR_INTENSITYMAP = !!material.specularIntensityMap;

    const HAS_TRANSMISSIONMAP = HAS_TRANSMISSION && !!material.transmissionMap;
    const HAS_THICKNESSMAP = HAS_TRANSMISSION && !!material.thicknessMap;

    const HAS_GRADIENTMAP = !!material.gradientMap;

    const HAS_ALPHAMAP = !!material.alphaMap;

    const HAS_ALPHATEST = material.alphaTest > 0;

    const HAS_ALPHAHASH = !!material.alphaHash;

    const HAS_EXTENSIONS = !!material.extensions;

    let toneMapping = NoToneMapping;

    if (material.toneMapped) {

      if (currentRenderTarget === null || currentRenderTarget.isXRRenderTarget === true) {

        toneMapping = this.renderer.toneMapping;

      }

    }

    const parameters = {

      shaderID: shaderID,
      shaderType: material.type,
      shaderName: material.name,

      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      defines: material.defines,

      customVertexShaderID: customVertexShaderID,
      customFragmentShaderID: customFragmentShaderID,

      isRawShaderMaterial: material.isRawShaderMaterial === true,
      glslVersion: material.glslVersion,

      precision: this.precision,

      batching: IS_BATCHEDMESH,
      batchingColor: IS_BATCHEDMESH && object._colorsTexture !== null,
      instancing: IS_INSTANCEDMESH,
      instancingColor: IS_INSTANCEDMESH && object.instanceColor !== null,
      instancingMorph: IS_INSTANCEDMESH && object.morphTexture !== null,

      supportsVertexTextures: this.SUPPORTS_VERTEX_TEXTURES,
      outputColorSpace: (currentRenderTarget === null) ? this.renderer.outputColorSpace : (currentRenderTarget.isXRRenderTarget === true ? currentRenderTarget.texture.colorSpace : LinearSRGBColorSpace),
      alphaToCoverage: !!material.alphaToCoverage,

      map: HAS_MAP,
      matcap: HAS_MATCAP,
      envMap: HAS_ENVMAP,
      envMapMode: HAS_ENVMAP && envMap.mapping,
      envMapCubeUVHeight: envMapCubeUVHeight,
      aoMap: HAS_AOMAP,
      lightMap: HAS_LIGHTMAP,
      bumpMap: HAS_BUMPMAP,
      normalMap: HAS_NORMALMAP,
      displacementMap: this.SUPPORTS_VERTEX_TEXTURES && HAS_DISPLACEMENTMAP,
      emissiveMap: HAS_EMISSIVEMAP,

      normalMapObjectSpace: HAS_NORMALMAP && material.normalMapType === ObjectSpaceNormalMap,
      normalMapTangentSpace: HAS_NORMALMAP && material.normalMapType === TangentSpaceNormalMap,

      metalnessMap: HAS_METALNESSMAP,
      roughnessMap: HAS_ROUGHNESSMAP,

      anisotropy: HAS_ANISOTROPY,
      anisotropyMap: HAS_ANISOTROPYMAP,

      clearcoat: HAS_CLEARCOAT,
      clearcoatMap: HAS_CLEARCOATMAP,
      clearcoatNormalMap: HAS_CLEARCOAT_NORMALMAP,
      clearcoatRoughnessMap: HAS_CLEARCOAT_ROUGHNESSMAP,

      dispersion: HAS_DISPERSION,

      iridescence: HAS_IRIDESCENCE,
      iridescenceMap: HAS_IRIDESCENCEMAP,
      iridescenceThicknessMap: HAS_IRIDESCENCE_THICKNESSMAP,

      sheen: HAS_SHEEN,
      sheenColorMap: HAS_SHEEN_COLORMAP,
      sheenRoughnessMap: HAS_SHEEN_ROUGHNESSMAP,

      specularMap: HAS_SPECULARMAP,
      specularColorMap: HAS_SPECULAR_COLORMAP,
      specularIntensityMap: HAS_SPECULAR_INTENSITYMAP,

      transmission: HAS_TRANSMISSION,
      transmissionMap: HAS_TRANSMISSIONMAP,
      thicknessMap: HAS_THICKNESSMAP,

      gradientMap: HAS_GRADIENTMAP,

      opaque: material.transparent === false && material.blending === NormalBlending && material.alphaToCoverage === false,

      alphaMap: HAS_ALPHAMAP,
      alphaTest: HAS_ALPHATEST,
      alphaHash: HAS_ALPHAHASH,

      combine: material.combine,

      //

      mapUv: HAS_MAP && this.getChannel(material.map.channel),
      aoMapUv: HAS_AOMAP && this.getChannel(material.aoMap.channel),
      lightMapUv: HAS_LIGHTMAP && this.getChannel(material.lightMap.channel),
      bumpMapUv: HAS_BUMPMAP && this.getChannel(material.bumpMap.channel),
      normalMapUv: HAS_NORMALMAP && this.getChannel(material.normalMap.channel),
      displacementMapUv: HAS_DISPLACEMENTMAP && this.getChannel(material.displacementMap.channel),
      emissiveMapUv: HAS_EMISSIVEMAP && this.getChannel(material.emissiveMap.channel),

      metalnessMapUv: HAS_METALNESSMAP && this.getChannel(material.metalnessMap.channel),
      roughnessMapUv: HAS_ROUGHNESSMAP && this.getChannel(material.roughnessMap.channel),

      anisotropyMapUv: HAS_ANISOTROPYMAP && this.getChannel(material.anisotropyMap.channel),

      clearcoatMapUv: HAS_CLEARCOATMAP && this.getChannel(material.clearcoatMap.channel),
      clearcoatNormalMapUv: HAS_CLEARCOAT_NORMALMAP && this.getChannel(material.clearcoatNormalMap.channel),
      clearcoatRoughnessMapUv: HAS_CLEARCOAT_ROUGHNESSMAP && this.getChannel(material.clearcoatRoughnessMap.channel),

      iridescenceMapUv: HAS_IRIDESCENCEMAP && this.getChannel(material.iridescenceMap.channel),
      iridescenceThicknessMapUv: HAS_IRIDESCENCE_THICKNESSMAP && this.getChannel(material.iridescenceThicknessMap.channel),

      sheenColorMapUv: HAS_SHEEN_COLORMAP && this.getChannel(material.sheenColorMap.channel),
      sheenRoughnessMapUv: HAS_SHEEN_ROUGHNESSMAP && this.getChannel(material.sheenRoughnessMap.channel),

      specularMapUv: HAS_SPECULARMAP && this.getChannel(material.specularMap.channel),
      specularColorMapUv: HAS_SPECULAR_COLORMAP && this.getChannel(material.specularColorMap.channel),
      specularIntensityMapUv: HAS_SPECULAR_INTENSITYMAP && this.getChannel(material.specularIntensityMap.channel),

      transmissionMapUv: HAS_TRANSMISSIONMAP && this.getChannel(material.transmissionMap.channel),
      thicknessMapUv: HAS_THICKNESSMAP && this.getChannel(material.thicknessMap.channel),

      alphaMapUv: HAS_ALPHAMAP && this.getChannel(material.alphaMap.channel),

      //

      vertexTangents: !!geometry.attributes.tangent && (HAS_NORMALMAP || HAS_ANISOTROPY),
      vertexColors: material.vertexColors,
      vertexAlphas: material.vertexColors === true && !!geometry.attributes.color && geometry.attributes.color.itemSize === 4,

      pointsUvs: object.isPoints === true && !!geometry.attributes.uv && (HAS_MAP || HAS_ALPHAMAP),

      fog: !!fog,
      useFog: material.fog === true,
      fogExp2: (!!fog && 'isFogExp2' in fog),

      flatShading: (material.flatShading === true && material.wireframe === false),

      sizeAttenuation: material.sizeAttenuation === true,
      logarithmicDepthBuffer: this.logarithmicDepthBuffer,
      reversedDepthBuffer: reversedDepthBuffer,

      skinning: object.isSkinnedMesh === true,

      morphTargets: geometry.morphAttributes.position !== undefined,
      morphNormals: geometry.morphAttributes.normal !== undefined,
      morphColors: geometry.morphAttributes.color !== undefined,
      morphTargetsCount: morphTargetsCount,
      morphTextureStride: morphTextureStride,

      numDirLights: lights.directional.length,
      numPointLights: lights.point.length,
      numSpotLights: lights.spot.length,
      numSpotLightMaps: lights.spotLightMap.length,
      numRectAreaLights: lights.rectArea.length,
      numHemiLights: lights.hemi.length,

      numDirLightShadows: lights.directionalShadowMap.length,
      numPointLightShadows: lights.pointShadowMap.length,
      numSpotLightShadows: lights.spotShadowMap.length,
      numSpotLightShadowsWithMaps: lights.numSpotLightShadowsWithMaps,

      numLightProbes: lights.numLightProbes,

      numClippingPlanes: this.clipping.numPlanes,
      numClipIntersection: this.clipping.numIntersection,

      dithering: material.dithering,

      shadowMapEnabled: this.renderer.shadowMap.enabled && shadows.length > 0,
      shadowMapType: this.renderer.shadowMap.type,

      toneMapping: toneMapping,

      decodeVideoTexture: HAS_MAP && (material.map.isVideoTexture === true) && (this.cm.getTransfer(material.map.colorSpace) === SRGBTransfer),
      decodeVideoTextureEmissive: HAS_EMISSIVEMAP && (material.emissiveMap.isVideoTexture === true) && (this.cm.getTransfer(material.emissiveMap.colorSpace) === SRGBTransfer),

      premultipliedAlpha: material.premultipliedAlpha,

      doubleSided: material.side === DoubleSide,
      flipSided: material.side === BackSide,

      useDepthPacking: material.depthPacking >= 0,
      depthPacking: material.depthPacking || 0,

      index0AttributeName: material.index0AttributeName,

      extensionClipCullDistance: HAS_EXTENSIONS && material.extensions.clipCullDistance === true && this.extensions.has('WEBGL_clip_cull_distance'),
      extensionMultiDraw: (HAS_EXTENSIONS && material.extensions.multiDraw === true || IS_BATCHEDMESH) && this.extensions.has('WEBGL_multi_draw'),

      rendererExtensionParallelShaderCompile: this.extensions.has('KHR_parallel_shader_compile'),

      customProgramCacheKey: material.customProgramCacheKey()

    };

    // the usage of getChannel() determines the active texture channels for this shader

    parameters.vertexUv1s = _activeChannels.has(1);
    parameters.vertexUv2s = _activeChannels.has(2);
    parameters.vertexUv3s = _activeChannels.has(3);

    _activeChannels.clear();

    return parameters;

  }

  public getProgramCacheKey(parameters: any) {

    const array = [];

    if (parameters.shaderID) {

      array.push(parameters.shaderID);

    } else {

      array.push(parameters.customVertexShaderID);
      array.push(parameters.customFragmentShaderID);

    }

    if (parameters.defines !== undefined) {

      for (const name in parameters.defines) {

        array.push(name);
        array.push(parameters.defines[name]);

      }

    }

    if (parameters.isRawShaderMaterial === false) {

      this.getProgramCacheKeyParameters(array, parameters);
      this.getProgramCacheKeyBooleans(array, parameters);
      array.push(this.renderer.outputColorSpace);

    }

    array.push(parameters.customProgramCacheKey);

    return array.join();

  }

  // TODO: type very well
  private getProgramCacheKeyParameters(array: any, parameters: any) {

    array.push(parameters.precision);
    array.push(parameters.outputColorSpace);
    array.push(parameters.envMapMode);
    array.push(parameters.envMapCubeUVHeight);
    array.push(parameters.mapUv);
    array.push(parameters.alphaMapUv);
    array.push(parameters.lightMapUv);
    array.push(parameters.aoMapUv);
    array.push(parameters.bumpMapUv);
    array.push(parameters.normalMapUv);
    array.push(parameters.displacementMapUv);
    array.push(parameters.emissiveMapUv);
    array.push(parameters.metalnessMapUv);
    array.push(parameters.roughnessMapUv);
    array.push(parameters.anisotropyMapUv);
    array.push(parameters.clearcoatMapUv);
    array.push(parameters.clearcoatNormalMapUv);
    array.push(parameters.clearcoatRoughnessMapUv);
    array.push(parameters.iridescenceMapUv);
    array.push(parameters.iridescenceThicknessMapUv);
    array.push(parameters.sheenColorMapUv);
    array.push(parameters.sheenRoughnessMapUv);
    array.push(parameters.specularMapUv);
    array.push(parameters.specularColorMapUv);
    array.push(parameters.specularIntensityMapUv);
    array.push(parameters.transmissionMapUv);
    array.push(parameters.thicknessMapUv);
    array.push(parameters.combine);
    array.push(parameters.fogExp2);
    array.push(parameters.sizeAttenuation);
    array.push(parameters.morphTargetsCount);
    array.push(parameters.morphAttributeCount);
    array.push(parameters.numDirLights);
    array.push(parameters.numPointLights);
    array.push(parameters.numSpotLights);
    array.push(parameters.numSpotLightMaps);
    array.push(parameters.numHemiLights);
    array.push(parameters.numRectAreaLights);
    array.push(parameters.numDirLightShadows);
    array.push(parameters.numPointLightShadows);
    array.push(parameters.numSpotLightShadows);
    array.push(parameters.numSpotLightShadowsWithMaps);
    array.push(parameters.numLightProbes);
    array.push(parameters.shadowMapType);
    array.push(parameters.toneMapping);
    array.push(parameters.numClippingPlanes);
    array.push(parameters.numClipIntersection);
    array.push(parameters.depthPacking);

  }

  // TODO: type very well
  private getProgramCacheKeyBooleans(array: any, parameters: any) {

    this._programLayers.disableAll();

    if (parameters.supportsVertexTextures)
      this._programLayers.enable(0);
    if (parameters.instancing)
      this._programLayers.enable(1);
    if (parameters.instancingColor)
      this._programLayers.enable(2);
    if (parameters.instancingMorph)
      this._programLayers.enable(3);
    if (parameters.matcap)
      this._programLayers.enable(4);
    if (parameters.envMap)
      this._programLayers.enable(5);
    if (parameters.normalMapObjectSpace)
      this._programLayers.enable(6);
    if (parameters.normalMapTangentSpace)
      this._programLayers.enable(7);
    if (parameters.clearcoat)
      this._programLayers.enable(8);
    if (parameters.iridescence)
      this._programLayers.enable(9);
    if (parameters.alphaTest)
      this._programLayers.enable(10);
    if (parameters.vertexColors)
      this._programLayers.enable(11);
    if (parameters.vertexAlphas)
      this._programLayers.enable(12);
    if (parameters.vertexUv1s)
      this._programLayers.enable(13);
    if (parameters.vertexUv2s)
      this._programLayers.enable(14);
    if (parameters.vertexUv3s)
      this._programLayers.enable(15);
    if (parameters.vertexTangents)
      this._programLayers.enable(16);
    if (parameters.anisotropy)
      this._programLayers.enable(17);
    if (parameters.alphaHash)
      this._programLayers.enable(18);
    if (parameters.batching)
      this._programLayers.enable(19);
    if (parameters.dispersion)
      this._programLayers.enable(20);
    if (parameters.batchingColor)
      this._programLayers.enable(21);
    if (parameters.gradientMap)
      this._programLayers.enable(22);

    array.push(this._programLayers.mask);
    this._programLayers.disableAll();

    if (parameters.fog)
      this._programLayers.enable(0);
    if (parameters.useFog)
      this._programLayers.enable(1);
    if (parameters.flatShading)
      this._programLayers.enable(2);
    if (parameters.logarithmicDepthBuffer)
      this._programLayers.enable(3);
    if (parameters.reversedDepthBuffer)
      this._programLayers.enable(4);
    if (parameters.skinning)
      this._programLayers.enable(5);
    if (parameters.morphTargets)
      this._programLayers.enable(6);
    if (parameters.morphNormals)
      this._programLayers.enable(7);
    if (parameters.morphColors)
      this._programLayers.enable(8);
    if (parameters.premultipliedAlpha)
      this._programLayers.enable(9);
    if (parameters.shadowMapEnabled)
      this._programLayers.enable(10);
    if (parameters.doubleSided)
      this._programLayers.enable(11);
    if (parameters.flipSided)
      this._programLayers.enable(12);
    if (parameters.useDepthPacking)
      this._programLayers.enable(13);
    if (parameters.dithering)
      this._programLayers.enable(14);
    if (parameters.transmission)
      this._programLayers.enable(15);
    if (parameters.sheen)
      this._programLayers.enable(16);
    if (parameters.opaque)
      this._programLayers.enable(17);
    if (parameters.pointsUvs)
      this._programLayers.enable(18);
    if (parameters.decodeVideoTexture)
      this._programLayers.enable(19);
    if (parameters.decodeVideoTextureEmissive)
      this._programLayers.enable(20);
    if (parameters.alphaToCoverage)
      this._programLayers.enable(21);

    array.push(this._programLayers.mask);

  }

  // TODO: type very well
  public getUniforms(material: any) {

    const shaderID = this.shaderIDs[material.type];
    let uniforms;

    if (shaderID) {

      const shader = ShaderLib[shaderID as keyof typeof ShaderLib];
      uniforms = cloneUniforms(shader.uniforms);

    } else {

      uniforms = material.uniforms;

    }

    return uniforms;

  }

  // TODO: type very well
  public acquireProgram(parameters: any, cacheKey: any) {

    let program;

    // Check if code has been already compiled
    for (let p = 0, pl = this.programs.length; p < pl; p++) {

      const preexistingProgram = this.programs[p];

      if (preexistingProgram.cacheKey === cacheKey) {

        program = preexistingProgram;
        ++program.usedTimes;

        break;

      }

    }

    if (program === undefined) {

      program = new WebGLProgram(this.renderer, cacheKey, parameters, this.bindingStates);
      this.programs.push(program);

    }

    return program;

  }

  // TODO: type very well
  public releaseProgram(program: any) {

    if (--program.usedTimes === 0) {

      // Remove from unordered set
      const i = this.programs.indexOf(program);
      this.programs[i] = this.programs[this.programs.length - 1];
      this.programs.pop();

      // Free WebGL resources
      program.destroy();

    }

  }

  // TODO: type very well
  public releaseShaderCache(material: any) {

    this._customShaders.remove(material);

  }

  public dispose() {

    this._customShaders.dispose();

  }

}
