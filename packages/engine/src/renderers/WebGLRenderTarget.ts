import { RenderTarget } from '../core/RenderTarget.js';

/**
 * A render target used in context of {@link WebGLRenderer}.
 *
 * @augments RenderTarget
 */
export class WebGLRenderTarget extends RenderTarget {
  /**
   * This flag can be used for type testing.
   *
   * @type {boolean}
   * @readonly
   * @default true
   */
  public isWebGLRenderTarget: boolean = true;


  /**
   * Constructs a new 3D render target.
   *
   * @param {number} [width=1] - The width of the render target.
   * @param {number} [height=1] - The height of the render target.
   * @param {RenderTarget~Options} [options] - The configuration object.
   */
  constructor(
    width: number = 1,
    height: number = 1,
    options = {}
  ) {

    super(width, height, options);
  }

}
