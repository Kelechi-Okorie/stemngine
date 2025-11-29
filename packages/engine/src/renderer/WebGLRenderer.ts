import { createCanvasElement } from "../utils";

interface WebGLContextAttributes {
  canvas?: HTMLCanvasElement;
  context?: WebGL2RenderingContext;
  alpha?: boolean;
  depth?: boolean;
  stencil?: boolean;
  antialias?: boolean;
  premultipliedAlpha?: boolean;
  preserveDrawingBuffer?: boolean;
  powerPreference?: "default" | "high-performance" | "low-power";
  failIfMajorPerformanceCaveat?: boolean;
  reverseDepthBuffer?: boolean;
}

/**
 * This renderer uses WebGL 2 to display scenes
 *
 * @remarks
 * WebGL 1 is not supported.
 */
export class WebGLRenderer {
    /**
   * this flag can be used for type testing.
   *
   * @type {boolean}
   * @readonly
   * @defaultValue true
 */
  public readonly isWebGLRenderer: boolean = true;

  /**
   * Refers to the canvas transparency (alpha) setting.
   *
   * @remarks
   * When set to `true`, the canvas contains an alpha buffer.
   * This allows the canvas to be transparent, so that the HTML
   * content behind the canvas is visible.
   *
   * When set to `false`, the canvas is opaque.
   *
   * @defaultValue false
   */
  private _alpha: boolean;

  /**
   * Constructs a new WebGLRenderer.
   *
   * @param parameters - An object containing settings for the renderer.
   */
  constructor( parameters: WebGLContextAttributes = {} ) {
    // this._alpha = parameters.alpha === true;
    const {
      canvas = createCanvasElement(),
      context = null,
      alpha = false,
      depth = true,
      stencil = false,
      antialias = false,
      premultipliedAlpha = true,
      preserveDrawingBuffer = false,
      powerPreference = 'default',
      failIfMajorPerformanceCaveat = false,
      reverseDepthBuffer = false
    } = parameters

    if (context !== null) {
      // WebGL 1 is not supported
      if (typeof WebGLRenderingContext !== 'undefined' && context instanceof WebGLRenderingContext) {
        throw new Error('WebGLRenderer: WebGLRenderingContext is not supported. Use WebGL2RenderingContext instead.');
      }

      this._alpha = context.getContextAttributes()?.alpha ?? false;
    } else {
      this._alpha = alpha;
    }
  }

}
