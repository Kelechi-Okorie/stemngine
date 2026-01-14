import { WebGLRenderTarget } from './WebGLRenderTarget';
import { DataArrayTexture } from '../textures/DataArrayTexture';

/**
 * An array render target used in context of {@link WebGLRenderer}.
 *
 * @augments WebGLRenderTarget
 */
export class WebGLArrayRenderTarget extends WebGLRenderTarget {
  /**
   * This flag can be used for type testing.
   *
   * @readonly
   * @default true
   */
  public isWebGLArrayRenderTarget = true;


  /**
   * Constructs a new array render target.
   *
   * @param {number} [width=1] - The width of the render target.
   * @param {number} [height=1] - The height of the render target.
   * @param {number} [depth=1] - The height of the render target.
   * @param {RenderTarget~Options} [options] - The configuration object.
   */
  constructor(
    width: number = 1,
    height: number = 1,
    depth: number = 1,
    options = {}
  ) {

    super(width, height, options);

    this.depth = depth;

    /**
     * Overwritten with a different texture type.
     *
     * @type {DataArrayTexture}
     */
    this.texture = new DataArrayTexture(null, width, height, depth);
    this._setTextureOptions(options);

    this.texture.isRenderTargetTexture = true;

  }

}

export function isWebGLArrayRenderTarget(
  renderTarget: WebGLRenderTarget
): renderTarget is WebGLArrayRenderTarget {
  return (renderTarget as any).isWebGLArrayRenderTarget === true;
}
