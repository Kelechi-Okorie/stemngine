import { WebGLUniforms } from './WebGLUniforms';
import { WebGLShader } from './WebGLShader';
import { ShaderChunk } from '../shaders/ShaderChunk';
import { NoToneMapping, AddOperation, MixOperation, MultiplyOperation, CubeRefractionMapping, CubeUVReflectionMapping, CubeReflectionMapping, PCFSoftShadowMap, PCFShadowMap, VSMShadowMap, AgXToneMapping, ACESFilmicToneMapping, NeutralToneMapping, CineonToneMapping, CustomToneMapping, ReinhardToneMapping, LinearToneMapping, GLSL3, LinearTransfer, SRGBTransfer, ColorSpace, ToneMappingType } from '../../constants.js';
import { ColorManagement } from '../../math/ColorManagement.js';
import { Vector3 } from '../../math/Vector3.js';
import { Matrix3 } from '../../math/Matrix3.js';
import { WebGLRenderer } from '../WebGLRenderer';
import { WebGLBindingStates } from './WebGLBindingStates';

interface WebGLProgramParameters {
  // === identity ===
  shaderType: string;
  shaderName: string;
  defines?: Record<string, string | number | boolean>;

  // === precision / GLSL ===
  precision: 'highp' | 'mediump' | 'lowp';
  glslVersion?: number;

  // === feature toggles ===
  extensionClipCullDistance?: boolean;
  batching?: boolean;
  batchingColor?: boolean;
  instancing?: boolean;
  instancingColor?: boolean;
  instancingMorph?: boolean;

  useFog?: boolean;
  fog?: boolean;
  fogExp2?: boolean;

  map?: boolean;
  envMap?: boolean;
  lightMap?: boolean;
  aoMap?: boolean;
  bumpMap?: boolean;
  normalMap?: boolean;
  normalMapObjectSpace?: boolean;
  normalMapTangentSpace?: boolean;
  displacementMap?: boolean;
  emissiveMap?: boolean;

  anisotropy?: boolean;
  anisotropyMap?: boolean;

  clearcoat?: boolean;
  clearcoatMap?: boolean;
  clearcoatRoughnessMap?: boolean;
  clearcoatNormalMap?: boolean;

  iridescence?: boolean;
  iridescenceMap?: boolean;
  iridescenceThicknessMap?: boolean;

  sheen?: boolean;
  sheenColorMap?: boolean;
  sheenRoughnessMap?: boolean;

  transmission?: boolean;
  transmissionMap?: boolean;
  thicknessMap?: boolean;

  specularMap?: boolean;
  specularColorMap?: boolean;
  specularIntensityMap?: boolean;

  roughnessMap?: boolean;
  metalnessMap?: boolean;

  alphaMap?: boolean;
  alphaTest?: boolean;
  alphaHash?: boolean;
  alphaToCoverage?: boolean;

  premultipliedAlpha?: boolean;
  opaque?: boolean;

  // === UV channels ===
  mapUv?: number;
  alphaMapUv?: number;
  lightMapUv?: number;
  aoMapUv?: number;
  emissiveMapUv?: number;
  bumpMapUv?: number;
  normalMapUv?: number;
  displacementMapUv?: number;

  metalnessMapUv?: number;
  roughnessMapUv?: number;

  anisotropyMapUv?: number;

  clearcoatMapUv?: number;
  clearcoatNormalMapUv?: number;
  clearcoatRoughnessMapUv?: number;

  iridescenceMapUv?: number;
  iridescenceThicknessMapUv?: number;

  sheenColorMapUv?: number;
  sheenRoughnessMapUv?: number;

  specularMapUv?: number;
  specularColorMapUv?: number;
  specularIntensityMapUv?: number;

  transmissionMapUv?: number;
  thicknessMapUv?: number;

  // === geometry ===
  vertexTangents?: boolean;
  vertexColors?: boolean;
  vertexAlphas?: boolean;
  vertexUv1s?: boolean;
  vertexUv2s?: boolean;
  vertexUv3s?: boolean;

  pointsUvs?: boolean;

  flatShading?: boolean;
  doubleSided?: boolean;
  flipSided?: boolean;

  skinning?: boolean;

  morphTargets?: boolean;
  morphNormals?: boolean;
  morphColors?: boolean;
  morphTargetsCount?: number;
  morphTextureStride?: number;

  // === lighting / shadows ===
  shadowMapEnabled?: boolean;
  shadowMapType?: number;
  numLightProbes: number;

  // === depth ===
  logarithmicDepthBuffer?: boolean;
  reversedDepthBuffer?: boolean;
  useDepthPacking?: boolean;
  depthPacking?: number;

  // === color / tone ===
  toneMapping: number;
  outputColorSpace: ColorSpace;
  dithering?: boolean;

  // === video ===
  decodeVideoTexture?: boolean;
  decodeVideoTextureEmissive?: boolean;

  // === material type ===
  isRawShaderMaterial?: boolean;



  extensionMultiDraw?: string;
  numClippingPlanes?: number;
}

// From https://www.khronos.org/registry/webgl/extensions/KHR_parallel_shader_compile/
const COMPLETION_STATUS_KHR = 0x91B1;

let programIdCount = 0;
const cm = ColorManagement.instance;

function handleSource(string: string, errorLine: number) {

  const lines = string.split('\n');
  const lines2 = [];

  const from = Math.max(errorLine - 6, 0);
  const to = Math.min(errorLine + 6, lines.length);

  for (let i = from; i < to; i++) {

    const line = i + 1;
    lines2.push(`${line === errorLine ? '>' : ' '} ${line}: ${lines[i]}`);

  }

  return lines2.join('\n');

}

const _m0 = /*@__PURE__*/ new Matrix3();

function getEncodingComponents(colorSpace: ColorSpace) {
  const cm = ColorManagement.instance;

  cm._getMatrix(_m0, cm.workingColorSpace, colorSpace);

  const encodingMatrix = `mat3( ${_m0.elements.map((v) => v.toFixed(4))} )`;

  switch (cm.getTransfer(colorSpace)) {

    case LinearTransfer:
      return [encodingMatrix, 'LinearTransferOETF'];

    case SRGBTransfer:
      return [encodingMatrix, 'sRGBTransferOETF'];

    default:
      console.warn('THREE.WebGLProgram: Unsupported color space: ', colorSpace);
      return [encodingMatrix, 'LinearTransferOETF'];

  }

}

function getShaderErrors(
  gl: WebGL2RenderingContext,
  shader: WebGLShader,
  type: string
): string {

  const status = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

  const shaderInfoLog = gl.getShaderInfoLog(shader) || '';
  const errors = shaderInfoLog.trim();

  if (status && errors === '') return '';

  const errorMatches = /ERROR: 0:(\d+)/.exec(errors);
  if (errorMatches) {

    // --enable-privileged-webgl-extension
    // console.log( '**' + type + '**', gl.getExtension( 'WEBGL_debug_shaders' ).getTranslatedShaderSource( shader ) );

    const errorLine = parseInt(errorMatches[1], 10);
    const source = gl.getShaderSource(shader);
    return type.toUpperCase() + '\n\n' + errors + '\n\n' + handleSource(source!, errorLine);

  } else {

    return errors;

  }

}

function getTexelEncodingFunction(functionName: string, colorSpace: ColorSpace) {

  const components = getEncodingComponents(colorSpace);

  return [

    `vec4 ${functionName}( vec4 value ) {`,

    `	return ${components[1]}( vec4( value.rgb * ${components[0]}, value.a ) );`,

    '}',

  ].join('\n');

}

function getToneMappingFunction(functionName: string, toneMapping: ToneMappingType) {

  let toneMappingName;

  switch (toneMapping) {

    case LinearToneMapping:
      toneMappingName = 'Linear';
      break;

    case ReinhardToneMapping:
      toneMappingName = 'Reinhard';
      break;

    case CineonToneMapping:
      toneMappingName = 'Cineon';
      break;

    case ACESFilmicToneMapping:
      toneMappingName = 'ACESFilmic';
      break;

    case AgXToneMapping:
      toneMappingName = 'AgX';
      break;

    case NeutralToneMapping:
      toneMappingName = 'Neutral';
      break;

    case CustomToneMapping:
      toneMappingName = 'Custom';
      break;

    default:
      console.warn('THREE.WebGLProgram: Unsupported toneMapping:', toneMapping);
      toneMappingName = 'Linear';

  }

  return 'vec3 ' + functionName + '( vec3 color ) { return ' + toneMappingName + 'ToneMapping( color ); }';

}

const _v0 = /*@__PURE__*/ new Vector3();

function getLuminanceFunction() {

  cm.getLuminanceCoefficients(_v0);

  const r = _v0.x.toFixed(4);
  const g = _v0.y.toFixed(4);
  const b = _v0.z.toFixed(4);

  return [

    'float luminance( const in vec3 rgb ) {',

    `	const vec3 weights = vec3( ${r}, ${g}, ${b} );`,

    '	return dot( weights, rgb );',

    '}'

  ].join('\n');

}

function generateVertexExtensions(parameters: WebGLProgramParameters) {  // TODO: type well

  const chunks = [
    parameters.extensionClipCullDistance ? '#extension GL_ANGLE_clip_cull_distance : require' : '',
    parameters.extensionMultiDraw ? '#extension GL_ANGLE_multi_draw : require' : '',
  ];

  return chunks.filter(filterEmptyLine).join('\n');

}

function generateDefines(defines: Record<string, string | number | boolean>) {

  const chunks = [];

  for (const name in defines) {

    const value = defines[name];

    if (value === false) continue;

    chunks.push('#define ' + name + ' ' + value);

  }

  return chunks.join('\n');

}

function fetchAttributeLocations(
  gl: WebGL2RenderingContext,
  program: WebGLProgram
) {

  // TODO: type better
  const attributes:
    {
      [key: string]: {
        type: GLenum,
        location: GLenum,
        locationSize: GLenum
      }
    } = {};

  const n = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

  for (let i = 0; i < n; i++) {

    const info = gl.getActiveAttrib(program, i);
    if (!info) continue;
    const name = info.name;

    let locationSize = 1;
    if (info.type === gl.FLOAT_MAT2) locationSize = 2;
    if (info.type === gl.FLOAT_MAT3) locationSize = 3;
    if (info.type === gl.FLOAT_MAT4) locationSize = 4;

    // console.log( 'THREE.WebGLProgram: ACTIVE VERTEX ATTRIBUTE:', name, i );

    attributes[name] = {
      type: info.type,
      location: gl.getAttribLocation(program, name),
      locationSize: locationSize
    };

  }

  return attributes;

}

function filterEmptyLine(string: string) {

  return string !== '';

}

function replaceLightNums(string: any, parameters: any) { // TODO: type correctly

  const numSpotLightCoords = parameters.numSpotLightShadows + parameters.numSpotLightMaps - parameters.numSpotLightShadowsWithMaps;

  return string
    .replace(/NUM_DIR_LIGHTS/g, parameters.numDirLights)
    .replace(/NUM_SPOT_LIGHTS/g, parameters.numSpotLights)
    .replace(/NUM_SPOT_LIGHT_MAPS/g, parameters.numSpotLightMaps)
    .replace(/NUM_SPOT_LIGHT_COORDS/g, numSpotLightCoords)
    .replace(/NUM_RECT_AREA_LIGHTS/g, parameters.numRectAreaLights)
    .replace(/NUM_POINT_LIGHTS/g, parameters.numPointLights)
    .replace(/NUM_HEMI_LIGHTS/g, parameters.numHemiLights)
    .replace(/NUM_DIR_LIGHT_SHADOWS/g, parameters.numDirLightShadows)
    .replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g, parameters.numSpotLightShadowsWithMaps)
    .replace(/NUM_SPOT_LIGHT_SHADOWS/g, parameters.numSpotLightShadows)
    .replace(/NUM_POINT_LIGHT_SHADOWS/g, parameters.numPointLightShadows);

}

function replaceClippingPlaneNums(string: any, parameters: any) { // TODO: type correctly

  return string
    .replace(/NUM_CLIPPING_PLANES/g, parameters.numClippingPlanes)
    .replace(/UNION_CLIPPING_PLANES/g, (parameters.numClippingPlanes - parameters.numClipIntersection));

}

// Resolve Includes

const includePattern = /^[ \t]*#include +<([\w\d./]+)>/gm;

function resolveIncludes(string: string) {

  return string.replace(includePattern, includeReplacer);

}

const shaderChunkMap = new Map();

function includeReplacer(match: string, include: string): string {

  let string = ShaderChunk[include];

  if (string === undefined) {

    const newInclude = shaderChunkMap.get(include);

    if (newInclude !== undefined) {

      string = ShaderChunk[newInclude];
      console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.', include, newInclude);

    } else {

      throw new Error('Can not resolve #include <' + include + '>');

    }

  }

  return resolveIncludes(string);

}

// Unroll Loops

const unrollLoopPattern = /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;

function unrollLoops(string: string): string {

  return string.replace(unrollLoopPattern, loopReplacer);

}

function loopReplacer(
  match: string,
  start: string,
  end: string,
  snippet: string
): string {

  let string = '';

  for (let i = parseInt(start); i < parseInt(end); i++) {

    string += snippet
      .replace(/\[\s*i\s*\]/g, '[ ' + i + ' ]')
      .replace(/UNROLLED_LOOP_INDEX/g, i);

  }

  return string;

}

//

function generatePrecision(parameters: any) {

  let precisionstring = `precision ${parameters.precision} float;
	precision ${parameters.precision} int;
	precision ${parameters.precision} sampler2D;
	precision ${parameters.precision} samplerCube;
	precision ${parameters.precision} sampler3D;
	precision ${parameters.precision} sampler2DArray;
	precision ${parameters.precision} sampler2DShadow;
	precision ${parameters.precision} samplerCubeShadow;
	precision ${parameters.precision} sampler2DArrayShadow;
	precision ${parameters.precision} isampler2D;
	precision ${parameters.precision} isampler3D;
	precision ${parameters.precision} isamplerCube;
	precision ${parameters.precision} isampler2DArray;
	precision ${parameters.precision} usampler2D;
	precision ${parameters.precision} usampler3D;
	precision ${parameters.precision} usamplerCube;
	precision ${parameters.precision} usampler2DArray;
	`;

  if (parameters.precision === 'highp') {

    precisionstring += '\n#define HIGH_PRECISION';

  } else if (parameters.precision === 'mediump') {

    precisionstring += '\n#define MEDIUM_PRECISION';

  } else if (parameters.precision === 'lowp') {

    precisionstring += '\n#define LOW_PRECISION';

  }

  return precisionstring;

}

function generateShadowMapTypeDefine(parameters: any) {

  let shadowMapTypeDefine = 'SHADOWMAP_TYPE_BASIC';

  if (parameters.shadowMapType === PCFShadowMap) {

    shadowMapTypeDefine = 'SHADOWMAP_TYPE_PCF';

  } else if (parameters.shadowMapType === PCFSoftShadowMap) {

    shadowMapTypeDefine = 'SHADOWMAP_TYPE_PCF_SOFT';

  } else if (parameters.shadowMapType === VSMShadowMap) {

    shadowMapTypeDefine = 'SHADOWMAP_TYPE_VSM';

  }

  return shadowMapTypeDefine;

}

function generateEnvMapTypeDefine(parameters: any) {

  let envMapTypeDefine = 'ENVMAP_TYPE_CUBE';

  if (parameters.envMap) {

    switch (parameters.envMapMode) {

      case CubeReflectionMapping:
      case CubeRefractionMapping:
        envMapTypeDefine = 'ENVMAP_TYPE_CUBE';
        break;

      case CubeUVReflectionMapping:
        envMapTypeDefine = 'ENVMAP_TYPE_CUBE_UV';
        break;

    }

  }

  return envMapTypeDefine;

}

function generateEnvMapModeDefine(parameters: any) {

  let envMapModeDefine = 'ENVMAP_MODE_REFLECTION';

  if (parameters.envMap) {

    switch (parameters.envMapMode) {

      case CubeRefractionMapping:

        envMapModeDefine = 'ENVMAP_MODE_REFRACTION';
        break;

    }

  }

  return envMapModeDefine;

}

function generateEnvMapBlendingDefine(parameters: any) {

  let envMapBlendingDefine = 'ENVMAP_BLENDING_NONE';

  if (parameters.envMap) {

    switch (parameters.combine) {

      case MultiplyOperation:
        envMapBlendingDefine = 'ENVMAP_BLENDING_MULTIPLY';
        break;

      case MixOperation:
        envMapBlendingDefine = 'ENVMAP_BLENDING_MIX';
        break;

      case AddOperation:
        envMapBlendingDefine = 'ENVMAP_BLENDING_ADD';
        break;

    }

  }

  return envMapBlendingDefine;

}

function generateCubeUVSize(parameters: any) {

  const imageHeight = parameters.envMapCubeUVHeight;

  if (imageHeight === null) return null;

  const maxMip = Math.log2(imageHeight) - 2;

  const texelHeight = 1.0 / imageHeight;

  const texelWidth = 1.0 / (3 * Math.max(Math.pow(2, maxMip), 7 * 16));

  return { texelWidth, texelHeight, maxMip };

}

export class WebGLProgram {

  // TODO Send this event to Three.js DevTools
  // console.log( 'WebGLProgram', cacheKey );

  public renderer: any

  public gl: any; // TODO: type well

  public defines: any;

  public vertexShader: any;
  public fragmentShader: any;

  public shadowMapTypeDefine: any;
  public envMapTypeDefine: any;
  public envMapModeDefine: any;
  public envMapBlendingDefine: any;
  public envMapCubeUVSize: any;

  public customVertexExtensions: any;

  public customDefines: any;

  public program: any;

  public prefixVertex: string
  public prefixFragment: string;
  public versionString;

  public glVertexShader: any;
  public glFragmentShader: any;

  public cachedUniforms: any;
  public cachedAttributes: any;

  public type: any;
  public name: any;
  public id: number = programIdCount;
  public cacheKey: any;
  public usedTimes: number = 1;

  public parameters;
  public programReady: boolean;

  public bindingStates: WebGLBindingStates;
  public diagnostics: any;



  constructor(
    renderer: WebGLRenderer,
    cacheKey: string,
    parameters: any,
    bindingStates: WebGLBindingStates
  ) {
    this.renderer = renderer;
    this.gl = renderer.getContext();

    this.parameters = parameters;
    this.defines = parameters.defines

    this.cacheKey = cacheKey;
    this.bindingStates = bindingStates;

    this.vertexShader = parameters.vertexShader;
    this.fragmentShader = parameters.fragmentShader;

    this.shadowMapTypeDefine = generateShadowMapTypeDefine(parameters);
    this.envMapTypeDefine = generateEnvMapTypeDefine(parameters);
    this.envMapModeDefine = generateEnvMapModeDefine(parameters);
    this.envMapBlendingDefine = generateEnvMapBlendingDefine(parameters);
    this.envMapCubeUVSize = generateCubeUVSize(parameters);

    this.customVertexExtensions = generateVertexExtensions(parameters);

    this.customDefines = generateDefines(this.defines);

    this.program = this.gl.createProgram();

    //  this.prefixVertex;
    //   this.prefixFragment;
    this.versionString = parameters.glslVersion ? '#version ' + parameters.glslVersion + '\n' : '';

    this.programReady = (parameters.rendererExtensionParallelShaderCompile === false);



    if (parameters.isRawShaderMaterial) {

      this.prefixVertex = [

        '#define SHADER_TYPE ' + parameters.shaderType,
        '#define SHADER_NAME ' + parameters.shaderName,

        this.customDefines

      ].filter(filterEmptyLine).join('\n');

      if (this.prefixVertex.length > 0) {

        this.prefixVertex += '\n';

      }

      this.prefixFragment = [

        '#define SHADER_TYPE ' + parameters.shaderType,
        '#define SHADER_NAME ' + parameters.shaderName,

        this.customDefines

      ].filter(filterEmptyLine).join('\n');

      if (this.prefixFragment.length > 0) {

        this.prefixFragment += '\n';

      }

    } else {

      this.prefixVertex = [

        generatePrecision(parameters),

        '#define SHADER_TYPE ' + parameters.shaderType,
        '#define SHADER_NAME ' + parameters.shaderName,

        this.customDefines,

        parameters.extensionClipCullDistance ? '#define USE_CLIP_DISTANCE' : '',
        parameters.batching ? '#define USE_BATCHING' : '',
        parameters.batchingColor ? '#define USE_BATCHING_COLOR' : '',
        parameters.instancing ? '#define USE_INSTANCING' : '',
        parameters.instancingColor ? '#define USE_INSTANCING_COLOR' : '',
        parameters.instancingMorph ? '#define USE_INSTANCING_MORPH' : '',

        parameters.useFog && parameters.fog ? '#define USE_FOG' : '',
        parameters.useFog && parameters.fogExp2 ? '#define FOG_EXP2' : '',

        parameters.map ? '#define USE_MAP' : '',
        parameters.envMap ? '#define USE_ENVMAP' : '',
        parameters.envMap ? '#define ' + this.envMapModeDefine : '',
        parameters.lightMap ? '#define USE_LIGHTMAP' : '',
        parameters.aoMap ? '#define USE_AOMAP' : '',
        parameters.bumpMap ? '#define USE_BUMPMAP' : '',
        parameters.normalMap ? '#define USE_NORMALMAP' : '',
        parameters.normalMapObjectSpace ? '#define USE_NORMALMAP_OBJECTSPACE' : '',
        parameters.normalMapTangentSpace ? '#define USE_NORMALMAP_TANGENTSPACE' : '',
        parameters.displacementMap ? '#define USE_DISPLACEMENTMAP' : '',
        parameters.emissiveMap ? '#define USE_EMISSIVEMAP' : '',

        parameters.anisotropy ? '#define USE_ANISOTROPY' : '',
        parameters.anisotropyMap ? '#define USE_ANISOTROPYMAP' : '',

        parameters.clearcoatMap ? '#define USE_CLEARCOATMAP' : '',
        parameters.clearcoatRoughnessMap ? '#define USE_CLEARCOAT_ROUGHNESSMAP' : '',
        parameters.clearcoatNormalMap ? '#define USE_CLEARCOAT_NORMALMAP' : '',

        parameters.iridescenceMap ? '#define USE_IRIDESCENCEMAP' : '',
        parameters.iridescenceThicknessMap ? '#define USE_IRIDESCENCE_THICKNESSMAP' : '',

        parameters.specularMap ? '#define USE_SPECULARMAP' : '',
        parameters.specularColorMap ? '#define USE_SPECULAR_COLORMAP' : '',
        parameters.specularIntensityMap ? '#define USE_SPECULAR_INTENSITYMAP' : '',

        parameters.roughnessMap ? '#define USE_ROUGHNESSMAP' : '',
        parameters.metalnessMap ? '#define USE_METALNESSMAP' : '',
        parameters.alphaMap ? '#define USE_ALPHAMAP' : '',
        parameters.alphaHash ? '#define USE_ALPHAHASH' : '',

        parameters.transmission ? '#define USE_TRANSMISSION' : '',
        parameters.transmissionMap ? '#define USE_TRANSMISSIONMAP' : '',
        parameters.thicknessMap ? '#define USE_THICKNESSMAP' : '',

        parameters.sheenColorMap ? '#define USE_SHEEN_COLORMAP' : '',
        parameters.sheenRoughnessMap ? '#define USE_SHEEN_ROUGHNESSMAP' : '',

        //

        parameters.mapUv ? '#define MAP_UV ' + parameters.mapUv : '',
        parameters.alphaMapUv ? '#define ALPHAMAP_UV ' + parameters.alphaMapUv : '',
        parameters.lightMapUv ? '#define LIGHTMAP_UV ' + parameters.lightMapUv : '',
        parameters.aoMapUv ? '#define AOMAP_UV ' + parameters.aoMapUv : '',
        parameters.emissiveMapUv ? '#define EMISSIVEMAP_UV ' + parameters.emissiveMapUv : '',
        parameters.bumpMapUv ? '#define BUMPMAP_UV ' + parameters.bumpMapUv : '',
        parameters.normalMapUv ? '#define NORMALMAP_UV ' + parameters.normalMapUv : '',
        parameters.displacementMapUv ? '#define DISPLACEMENTMAP_UV ' + parameters.displacementMapUv : '',

        parameters.metalnessMapUv ? '#define METALNESSMAP_UV ' + parameters.metalnessMapUv : '',
        parameters.roughnessMapUv ? '#define ROUGHNESSMAP_UV ' + parameters.roughnessMapUv : '',

        parameters.anisotropyMapUv ? '#define ANISOTROPYMAP_UV ' + parameters.anisotropyMapUv : '',

        parameters.clearcoatMapUv ? '#define CLEARCOATMAP_UV ' + parameters.clearcoatMapUv : '',
        parameters.clearcoatNormalMapUv ? '#define CLEARCOAT_NORMALMAP_UV ' + parameters.clearcoatNormalMapUv : '',
        parameters.clearcoatRoughnessMapUv ? '#define CLEARCOAT_ROUGHNESSMAP_UV ' + parameters.clearcoatRoughnessMapUv : '',

        parameters.iridescenceMapUv ? '#define IRIDESCENCEMAP_UV ' + parameters.iridescenceMapUv : '',
        parameters.iridescenceThicknessMapUv ? '#define IRIDESCENCE_THICKNESSMAP_UV ' + parameters.iridescenceThicknessMapUv : '',

        parameters.sheenColorMapUv ? '#define SHEEN_COLORMAP_UV ' + parameters.sheenColorMapUv : '',
        parameters.sheenRoughnessMapUv ? '#define SHEEN_ROUGHNESSMAP_UV ' + parameters.sheenRoughnessMapUv : '',

        parameters.specularMapUv ? '#define SPECULARMAP_UV ' + parameters.specularMapUv : '',
        parameters.specularColorMapUv ? '#define SPECULAR_COLORMAP_UV ' + parameters.specularColorMapUv : '',
        parameters.specularIntensityMapUv ? '#define SPECULAR_INTENSITYMAP_UV ' + parameters.specularIntensityMapUv : '',

        parameters.transmissionMapUv ? '#define TRANSMISSIONMAP_UV ' + parameters.transmissionMapUv : '',
        parameters.thicknessMapUv ? '#define THICKNESSMAP_UV ' + parameters.thicknessMapUv : '',

        //

        parameters.vertexTangents && parameters.flatShading === false ? '#define USE_TANGENT' : '',
        parameters.vertexColors ? '#define USE_COLOR' : '',
        parameters.vertexAlphas ? '#define USE_COLOR_ALPHA' : '',
        parameters.vertexUv1s ? '#define USE_UV1' : '',
        parameters.vertexUv2s ? '#define USE_UV2' : '',
        parameters.vertexUv3s ? '#define USE_UV3' : '',

        parameters.pointsUvs ? '#define USE_POINTS_UV' : '',

        parameters.flatShading ? '#define FLAT_SHADED' : '',

        parameters.skinning ? '#define USE_SKINNING' : '',

        parameters.morphTargets ? '#define USE_MORPHTARGETS' : '',
        parameters.morphNormals && parameters.flatShading === false ? '#define USE_MORPHNORMALS' : '',
        (parameters.morphColors) ? '#define USE_MORPHCOLORS' : '',
        (parameters.morphTargetsCount > 0) ? '#define MORPHTARGETS_TEXTURE_STRIDE ' + parameters.morphTextureStride : '',
        (parameters.morphTargetsCount > 0) ? '#define MORPHTARGETS_COUNT ' + parameters.morphTargetsCount : '',
        parameters.doubleSided ? '#define DOUBLE_SIDED' : '',
        parameters.flipSided ? '#define FLIP_SIDED' : '',

        parameters.shadowMapEnabled ? '#define USE_SHADOWMAP' : '',
        parameters.shadowMapEnabled ? '#define ' + this.shadowMapTypeDefine : '',

        parameters.sizeAttenuation ? '#define USE_SIZEATTENUATION' : '',

        parameters.numLightProbes > 0 ? '#define USE_LIGHT_PROBES' : '',

        parameters.logarithmicDepthBuffer ? '#define USE_LOGARITHMIC_DEPTH_BUFFER' : '',
        parameters.reversedDepthBuffer ? '#define USE_REVERSED_DEPTH_BUFFER' : '',

        'uniform mat4 modelMatrix;',
        'uniform mat4 modelViewMatrix;',
        'uniform mat4 projectionMatrix;',
        'uniform mat4 viewMatrix;',
        'uniform mat3 normalMatrix;',
        'uniform vec3 cameraPosition;',
        'uniform bool isOrthographic;',

        '#ifdef USE_INSTANCING',

        '	attribute mat4 instanceMatrix;',

        '#endif',

        '#ifdef USE_INSTANCING_COLOR',

        '	attribute vec3 instanceColor;',

        '#endif',

        '#ifdef USE_INSTANCING_MORPH',

        '	uniform sampler2D morphTexture;',

        '#endif',

        'attribute vec3 position;',
        'attribute vec3 normal;',
        'attribute vec2 uv;',

        '#ifdef USE_UV1',

        '	attribute vec2 uv1;',

        '#endif',

        '#ifdef USE_UV2',

        '	attribute vec2 uv2;',

        '#endif',

        '#ifdef USE_UV3',

        '	attribute vec2 uv3;',

        '#endif',

        '#ifdef USE_TANGENT',

        '	attribute vec4 tangent;',

        '#endif',

        '#if defined( USE_COLOR_ALPHA )',

        '	attribute vec4 color;',

        '#elif defined( USE_COLOR )',

        '	attribute vec3 color;',

        '#endif',

        '#ifdef USE_SKINNING',

        '	attribute vec4 skinIndex;',
        '	attribute vec4 skinWeight;',

        '#endif',

        '\n'

      ].filter(filterEmptyLine).join('\n');

      this.prefixFragment = [

        generatePrecision(parameters),

        '#define SHADER_TYPE ' + parameters.shaderType,
        '#define SHADER_NAME ' + parameters.shaderName,

        this.customDefines,

        parameters.useFog && parameters.fog ? '#define USE_FOG' : '',
        parameters.useFog && parameters.fogExp2 ? '#define FOG_EXP2' : '',

        parameters.alphaToCoverage ? '#define ALPHA_TO_COVERAGE' : '',
        parameters.map ? '#define USE_MAP' : '',
        parameters.matcap ? '#define USE_MATCAP' : '',
        parameters.envMap ? '#define USE_ENVMAP' : '',
        parameters.envMap ? '#define ' + this.envMapTypeDefine : '',
        parameters.envMap ? '#define ' + this.envMapModeDefine : '',
        parameters.envMap ? '#define ' + this.envMapBlendingDefine : '',
        this.envMapCubeUVSize ? '#define CUBEUV_TEXEL_WIDTH ' + this.envMapCubeUVSize.texelWidth : '',
        this.envMapCubeUVSize ? '#define CUBEUV_TEXEL_HEIGHT ' + this.envMapCubeUVSize.texelHeight : '',
        this.envMapCubeUVSize ? '#define CUBEUV_MAX_MIP ' + this.envMapCubeUVSize.maxMip + '.0' : '',
        parameters.lightMap ? '#define USE_LIGHTMAP' : '',
        parameters.aoMap ? '#define USE_AOMAP' : '',
        parameters.bumpMap ? '#define USE_BUMPMAP' : '',
        parameters.normalMap ? '#define USE_NORMALMAP' : '',
        parameters.normalMapObjectSpace ? '#define USE_NORMALMAP_OBJECTSPACE' : '',
        parameters.normalMapTangentSpace ? '#define USE_NORMALMAP_TANGENTSPACE' : '',
        parameters.emissiveMap ? '#define USE_EMISSIVEMAP' : '',

        parameters.anisotropy ? '#define USE_ANISOTROPY' : '',
        parameters.anisotropyMap ? '#define USE_ANISOTROPYMAP' : '',

        parameters.clearcoat ? '#define USE_CLEARCOAT' : '',
        parameters.clearcoatMap ? '#define USE_CLEARCOATMAP' : '',
        parameters.clearcoatRoughnessMap ? '#define USE_CLEARCOAT_ROUGHNESSMAP' : '',
        parameters.clearcoatNormalMap ? '#define USE_CLEARCOAT_NORMALMAP' : '',

        parameters.dispersion ? '#define USE_DISPERSION' : '',

        parameters.iridescence ? '#define USE_IRIDESCENCE' : '',
        parameters.iridescenceMap ? '#define USE_IRIDESCENCEMAP' : '',
        parameters.iridescenceThicknessMap ? '#define USE_IRIDESCENCE_THICKNESSMAP' : '',

        parameters.specularMap ? '#define USE_SPECULARMAP' : '',
        parameters.specularColorMap ? '#define USE_SPECULAR_COLORMAP' : '',
        parameters.specularIntensityMap ? '#define USE_SPECULAR_INTENSITYMAP' : '',

        parameters.roughnessMap ? '#define USE_ROUGHNESSMAP' : '',
        parameters.metalnessMap ? '#define USE_METALNESSMAP' : '',

        parameters.alphaMap ? '#define USE_ALPHAMAP' : '',
        parameters.alphaTest ? '#define USE_ALPHATEST' : '',
        parameters.alphaHash ? '#define USE_ALPHAHASH' : '',

        parameters.sheen ? '#define USE_SHEEN' : '',
        parameters.sheenColorMap ? '#define USE_SHEEN_COLORMAP' : '',
        parameters.sheenRoughnessMap ? '#define USE_SHEEN_ROUGHNESSMAP' : '',

        parameters.transmission ? '#define USE_TRANSMISSION' : '',
        parameters.transmissionMap ? '#define USE_TRANSMISSIONMAP' : '',
        parameters.thicknessMap ? '#define USE_THICKNESSMAP' : '',

        parameters.vertexTangents && parameters.flatShading === false ? '#define USE_TANGENT' : '',
        parameters.vertexColors || parameters.instancingColor || parameters.batchingColor ? '#define USE_COLOR' : '',
        parameters.vertexAlphas ? '#define USE_COLOR_ALPHA' : '',
        parameters.vertexUv1s ? '#define USE_UV1' : '',
        parameters.vertexUv2s ? '#define USE_UV2' : '',
        parameters.vertexUv3s ? '#define USE_UV3' : '',

        parameters.pointsUvs ? '#define USE_POINTS_UV' : '',

        parameters.gradientMap ? '#define USE_GRADIENTMAP' : '',

        parameters.flatShading ? '#define FLAT_SHADED' : '',

        parameters.doubleSided ? '#define DOUBLE_SIDED' : '',
        parameters.flipSided ? '#define FLIP_SIDED' : '',

        parameters.shadowMapEnabled ? '#define USE_SHADOWMAP' : '',
        parameters.shadowMapEnabled ? '#define ' + this.shadowMapTypeDefine : '',

        parameters.premultipliedAlpha ? '#define PREMULTIPLIED_ALPHA' : '',

        parameters.numLightProbes > 0 ? '#define USE_LIGHT_PROBES' : '',

        parameters.decodeVideoTexture ? '#define DECODE_VIDEO_TEXTURE' : '',
        parameters.decodeVideoTextureEmissive ? '#define DECODE_VIDEO_TEXTURE_EMISSIVE' : '',

        parameters.logarithmicDepthBuffer ? '#define USE_LOGARITHMIC_DEPTH_BUFFER' : '',
        parameters.reversedDepthBuffer ? '#define USE_REVERSED_DEPTH_BUFFER' : '',

        'uniform mat4 viewMatrix;',
        'uniform vec3 cameraPosition;',
        'uniform bool isOrthographic;',

        (parameters.toneMapping !== NoToneMapping) ? '#define TONE_MAPPING' : '',
        (parameters.toneMapping !== NoToneMapping) ? ShaderChunk['tonemapping_pars_fragment'] : '', // this code is required here because it is used by the toneMapping() function defined below
        (parameters.toneMapping !== NoToneMapping) ? getToneMappingFunction('toneMapping', parameters.toneMapping) : '',

        parameters.dithering ? '#define DITHERING' : '',
        parameters.opaque ? '#define OPAQUE' : '',

        ShaderChunk['colorspace_pars_fragment'], // this code is required here because it is used by the various encoding/decoding function defined below
        getTexelEncodingFunction('linearToOutputTexel', parameters.outputColorSpace),
        getLuminanceFunction(),

        parameters.useDepthPacking ? '#define DEPTH_PACKING ' + parameters.depthPacking : '',

        '\n'

      ].filter(filterEmptyLine).join('\n');

    }

    this.vertexShader = resolveIncludes(this.vertexShader);
    this.vertexShader = replaceLightNums(this.vertexShader, parameters);
    this.vertexShader = replaceClippingPlaneNums(this.vertexShader, parameters);

    this.fragmentShader = resolveIncludes(this.fragmentShader);
    this.fragmentShader = replaceLightNums(this.fragmentShader, parameters);
    this.fragmentShader = replaceClippingPlaneNums(this.fragmentShader, parameters);

    this.vertexShader = unrollLoops(this.vertexShader);
    this.fragmentShader = unrollLoops(this.fragmentShader);

    if (parameters.isRawShaderMaterial !== true) {

      // GLSL 3.0 conversion for built-in materials this.and ShaderMaterial

      this.versionString = '#version 300 es\n';

      this.prefixVertex = [
        this.customVertexExtensions,
        '#define attribute in',
        '#define varying out',
        '#define texture2D texture'
      ].join('\n') + '\n' + this.prefixVertex;

      this.prefixFragment = [
        '#define varying in',
        (parameters.glslVersion === GLSL3) ? '' : 'layout(location = 0) out highp vec4 pc_fragColor;',
        (parameters.glslVersion === GLSL3) ? '' : '#define gl_FragColor pc_fragColor',
        '#define gl_FragDepthEXT gl_FragDepth',
        '#define texture2D texture',
        '#define textureCube texture',
        '#define texture2DProj textureProj',
        '#define texture2DLodEXT textureLod',
        '#define texture2DProjLodEXT textureProjLod',
        '#define textureCubeLodEXT textureLod',
        '#define texture2DGradEXT textureGrad',
        '#define texture2DProjGradEXT textureProjGrad',
        '#define textureCubeGradEXT textureGrad'
      ].join('\n') + '\n' + this.prefixFragment;

    }

    const vertexGlsl = this.versionString + this.prefixVertex + this.vertexShader;
    const fragmentGlsl = this.versionString + this.prefixFragment + this.fragmentShader;

    // console.log( '*VERTEX*', vertexGlsl );
    // console.log( '*FRAGMENT*', fragmentGlsl );

    const glVertexShader = WebGLShader(this.gl, this.gl.VERTEX_SHADER, vertexGlsl);
    const glFragmentShader = WebGLShader(this.gl, this.gl.FRAGMENT_SHADER, fragmentGlsl);

    this.gl.attachShader(this.program, glVertexShader);
    this.gl.attachShader(this.program, glFragmentShader);

    // Force a particular attribute to index 0.

    if (parameters.index0AttributeName !== undefined) {

      this.gl.bindAttribLocation(this.program, 0, parameters.index0AttributeName);

    } else if (parameters.morphTargets === true) {

      // programs with morphTargets displace position out of attribute 0
      this.gl.bindAttribLocation(this.program, 0, 'position');

    }

    this.gl.linkProgram(this.program);


    // set up caching for uniform locations

    let cachedUniforms;

  }

  public onFirstUse(/* self: any */) {  // TODO: type very well

    // check for link errors
    if (renderer.debug.checkShaderErrors) {

      const programInfoLog = this.gl.getProgramInfoLog(this.program) || '';
      const vertexShaderInfoLog = this.gl.getShaderInfoLog(this.glVertexShader) || '';
      const fragmentShaderInfoLog = this.gl.getShaderInfoLog(this.glFragmentShader) || '';

      const programLog = programInfoLog.trim();
      const vertexLog = vertexShaderInfoLog.trim();
      const fragmentLog = fragmentShaderInfoLog.trim();

      let runnable = true;
      let haveDiagnostics = true;

      if (this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS) === false) {

        runnable = false;

        if (typeof this.renderer.debug.onShaderError === 'function') {

          this.renderer.debug.onShaderError(this.gl, this.program, this.glVertexShader, this.glFragmentShader);

        } else {

          // default error reporting

          const vertexErrors = getShaderErrors(this.gl, this.glVertexShader!, 'vertex');
          const fragmentErrors = getShaderErrors(this.gl, this.glFragmentShader!, 'fragment');

          console.error(
            'THREE.WebGLProgram: Shader Error ' + this.gl.getError() + ' - ' +
            'VALIDATE_STATUS ' + this.gl.getProgramParameter(this.program, this.gl.VALIDATE_STATUS) + '\n\n' +
            'Material Name: ' + this.name + '\n' +
            'Material Type: ' + this.type + '\n\n' +
            'Program Info Log: ' + programLog + '\n' +
            vertexErrors + '\n' +
            fragmentErrors
          );

        }

      } else if (programLog !== '') {

        console.warn('THREE.WebGLProgram: Program Info Log:', programLog);

      } else if (vertexLog === '' || fragmentLog === '') {

        haveDiagnostics = false;

      }

      if (haveDiagnostics) {

        this.diagnostics = {

          runnable: runnable,

          programLog: programLog,

          vertexShader: {

            log: vertexLog,
            prefix: this.prefixVertex

          },

          fragmentShader: {

            log: fragmentLog,
            prefix: this.prefixFragment

          }

        };

      }

    }

    // Clean up

    // Crashes in iOS9 and iOS10. #18402
    // gl.detachShader( program, glVertexShader );
    // gl.detachShader( program, glFragmentShader );

    this.gl.deleteShader(this.glVertexShader);
    this.gl.deleteShader(this.glFragmentShader);

    this.cachedUniforms = new WebGLUniforms(this.gl, this.program);
    this.cachedAttributes = fetchAttributeLocations(this.gl, this.program);





    this.type = this.parameters.shaderType;
    this.name = this.parameters.shaderName;
    this.id = programIdCount++;
    this.cacheKey = this.cacheKey;
    this.usedTimes = 1;
    this.program = this.program;
    this.vertexShader = this.glVertexShader;
    this.fragmentShader = this.glFragmentShader;


  }




  public getUniforms() {

    if (this.cachedUniforms === undefined) {

      // Populates cachedUniforms and cachedAttributes
      this.onFirstUse();

    }

    return this.cachedUniforms;

  };

  // set up caching for attribute locations

  public getAttributes() {

    if (this.cachedAttributes === undefined) {

      // Populates cachedAttributes and cachedUniforms
      this.onFirstUse(/* this */);

    }

    return this.cachedAttributes;

  };

  // indicate when the program is ready to be used. if the KHR_parallel_shader_compile extension isn't supported,
  // flag the program as ready immediately. It may cause a stall when it's first used.


  public isReady() {

    if (this.programReady === false) {

      this.programReady = this.gl.getProgramParameter(this.program, COMPLETION_STATUS_KHR);

    }

    return this.programReady;

  };

  // free resource

  public destroy() {

    this.bindingStates.releaseStatesOfProgram(this);

    this.gl.deleteProgram(this.program);
    this.program = undefined;

  };

}
