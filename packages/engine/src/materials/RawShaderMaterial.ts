import { ShaderMaterial } from './ShaderMaterial.js';

/**
 * This class works just like {@link ShaderMaterial}, except that definitions
 * of built-in uniforms and attributes are not automatically prepended to the
 * GLSL shader code.
 *
 * `RawShaderMaterial` can only be used with {@link WebGLRenderer}.
 *
 * @augments ShaderMaterial
 */
export class RawShaderMaterial extends ShaderMaterial {
  /**
   * This flag can be used for type testing.
   *
   * @type {boolean}
   * @readonly
   * @default true
   */
  public isRawShaderMaterial: boolean = true;

  /**
   * Constructs a new raw shader material.
   *
   * @param {Object} [parameters] - An object with one or more properties
   * defining the material's appearance. Any property of the material
   * (including any property from inherited materials) can be passed
   * in here. Color values can be passed any type of value accepted
   * by {@link Color#set}.
   */
  constructor(parameters: { [key: string]: any }) {

    super(parameters);

    this.type = 'RawShaderMaterial';

  }

}
