import { FloatType, HalfFloatType, RGBAFormat, UnsignedByteType, TextureFormat, TextureDataType, Precision } from '../../constants';
import { WebGLExtensions } from './WebGLExtensions';
import { WebGLRendererOptions } from '../WebGLRenderer';
import { WebGLUtils } from './WebGLUtils.js';

export class WebGLCapabilities {

  private readonly gl: WebGL2RenderingContext;
  private readonly extensions: WebGLExtensions;
  protected parameters: WebGLRendererOptions;
  private utils: WebGLUtils;

  private maxAnisotropy: number = -1; // -1 means "not queried yet"

  public precision: Precision;
  public maxPrecision: Precision;


  public logarithmicDepthBuffer: boolean;
  public reversedDepthBuffer: boolean;

  public readonly maxTextures: number;
  public readonly maxVertexTextures: number;
  public readonly maxTextureSize: number;
  public readonly maxCubemapSize: number;

  public readonly maxAttributes: number;
  public readonly maxVertexUniforms: number;
  public readonly maxVaryings: number;
  public readonly maxFragmentUniforms: number;

  public readonly vertexTextures: boolean;

  public readonly maxSamples: number;

  public readonly isWebGL2 = true;

  constructor(
    gl: WebGL2RenderingContext,
    extensions: WebGLExtensions,
    parameters: WebGLRendererOptions,
    utils: WebGLUtils
  ) {
    this.gl = gl;
    this.extensions = extensions;
    this.parameters = parameters;
    this.utils = utils;

    this.precision = parameters.precision !== undefined ? parameters.precision : 'highp';
    this.maxPrecision = this.getMaxPrecision(this.precision);

    if (this.maxPrecision !== this.precision) {

      console.warn('THREE.WebGLRenderer:', this.precision, 'not supported, using', this.maxPrecision, 'instead.');
      this.precision = this.maxPrecision;
    }

    this.logarithmicDepthBuffer = parameters.logarithmicDepthBuffer === true;
    this.reversedDepthBuffer = parameters.reversedDepthBuffer === true && extensions.has('EXT_clip_control');

    this.maxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    this.maxVertexTextures = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
    this.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    this.maxCubemapSize = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);

    this.maxAttributes = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    this.maxVertexUniforms = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
    this.maxVaryings = gl.getParameter(gl.MAX_VARYING_VECTORS);
    this.maxFragmentUniforms = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);

    this.vertexTextures = this.maxVertexTextures > 0;

    this.maxSamples = gl.getParameter(gl.MAX_SAMPLES) as number;

  }

  public getMaxAnisotropy(): number {

    if (this.maxAnisotropy !== -1) return this.maxAnisotropy;

    if (this.extensions.has('EXT_texture_filter_anisotropic') === true) {

      const extension = this.extensions.get('EXT_texture_filter_anisotropic');

      this.maxAnisotropy = this.gl.getParameter(extension.MAX_TEXTURE_MAX_ANISOTROPY_EXT);

    } else {

      this.maxAnisotropy = 0;

    }

    return this.maxAnisotropy;

  }

  public textureFormatReadable(textureFormat: TextureFormat) {

    if (textureFormat !== RGBAFormat &&
      this.utils.convert(textureFormat) !== this.gl.getParameter(this.gl.IMPLEMENTATION_COLOR_READ_FORMAT)
    ) {

      return false;

    }

    return true;

  }

  public textureTypeReadable(textureType: TextureDataType) {

    const halfFloatSupportedByExt = (textureType === HalfFloatType) && (this.extensions.has('EXT_color_buffer_half_float') || this.extensions.has('EXT_color_buffer_float'));

    if (textureType !== UnsignedByteType && this.utils.convert(textureType) !== this.gl.getParameter(this.gl.IMPLEMENTATION_COLOR_READ_TYPE) && // Edge and Chrome Mac < 52 (#9513)
      textureType !== FloatType && !halfFloatSupportedByExt) {

      return false;

    }

    return true;

  }

  public getMaxPrecision(precision: Precision) {

    if (precision === 'highp') {

      // if ( gl.getShaderPrecisionFormat( gl.VERTEX_SHADER, gl.HIGH_FLOAT ).precision > 0 &&
      // 	gl.getShaderPrecisionFormat( gl.FRAGMENT_SHADER, gl.HIGH_FLOAT ).precision > 0 ) {

      // 	return 'highp';

      // }

      const v = this.gl.getShaderPrecisionFormat(this.gl.VERTEX_SHADER, this.gl.HIGH_FLOAT);
      const f = this.gl.getShaderPrecisionFormat(this.gl.FRAGMENT_SHADER, this.gl.HIGH_FLOAT);

      if (v !== null && f !== null && v.precision > 0 && f.precision > 0) {
        return 'highp';
      }

      precision = 'mediump';

    }

    if (precision === 'mediump') {

      // if (gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_FLOAT).precision > 0 &&
      //   gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT).precision > 0) {

      //   return 'mediump';

      // }

      const v = this.gl.getShaderPrecisionFormat(this.gl.VERTEX_SHADER, this.gl.MEDIUM_FLOAT);
      const f = this.gl.getShaderPrecisionFormat(this.gl.FRAGMENT_SHADER, this.gl.MEDIUM_FLOAT);

      if (v !== null && f !== null && v.precision > 0 && f.precision > 0) {
        return 'mediump';
      }


    }

    return 'lowp';

  }

}
