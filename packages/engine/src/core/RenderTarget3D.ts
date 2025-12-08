import { RenderTarget } from './RenderTarget.js';
import { Data3DTexture } from '../textures/Data3DTexture';

/**
 * Represents a 3D render target.
 *
 * @augments RenderTarget
 */
export class RenderTarget3D extends RenderTarget {
  /**
   * This flag can be used for type testing.
   *
   * @type {boolean}
   * @readonly
   * @default true
   */
  public isRenderTarget3D: boolean = true;

  /**
   * Constructs a new 3D render target.
   *
   * @param {number} [width=1] - The width of the render target.
   * @param {number} [height=1] - The height of the render target.
   * @param {number} [depth=1] - The height of the render target.
   * @param {RenderTarget~Options} [options] - The configuration object.
   */
  constructor(width: number = 1, height: number = 1, depth: number = 1, options = {}) {

    super(width, height, options);

    this.depth = depth;

    /**
     * Overwritten with a different texture type.
     *
     * @type {Data3DTexture}
     */
    this.texture = new Data3DTexture(null, width, height, depth);
    this._setTextureOptions(options);

    this.texture.isRenderTargetTexture = true;

  }

}
