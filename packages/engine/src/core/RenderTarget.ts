import { EventDispatcher } from './EventDispatcher.js';
import { Texture } from '../textures/Texture.js';
import { LinearFilter, TextureOptions } from '../constants.js';
import { Vector4 } from '../math/Vector4.js';
import { Source } from '../textures/Source.js';

export interface RenderTargetOptions {
  // Render target options
  depthBuffer?: boolean;
  stencilBuffer?: boolean;
  resolveDepthBuffer?: boolean;
  resolveStencilBuffer?: boolean;
  depthTexture?: Texture | null;
  samples?: number;
  count?: number;
  depth?: number;
  multiview?: boolean;
}

/**
 * A render target is a buffer where the video card draws pixels for a scene
 * that is being rendered in the background. It is used in different effects,
 * such as applying postprocessing to a rendered image before displaying it
 * on the screen.
 *
 * @augments EventDispatcher
 */
export class RenderTarget extends EventDispatcher {
  /**
 * This flag can be used for type testing.
 *
 * @type {boolean}
 * @readonly
 * @default true
 */
  public isRenderTarget: boolean = true;

  /**
   * The width of the render target.
   *
   * @type {number}
   * @default 1
   */
  public width: number;

  /**
   * The height of the render target.
   *
   * @type {number}
   * @default 1
   */
  public height: number;

  /**
   * The depth of the render target.
   *
   * @type {number}
   * @default 1
   */
  public depth: number;

  /**
   * A rectangular area inside the render target's viewport. Fragments that are
   * outside the area will be discarded.
   *
   * @type {Vector4}
   * @default (0,0,width,height)
   */
  public scissor: Vector4;

  /**
   * Indicates whether the scissor test should be enabled when rendering into
   * this render target or not.
   *
   * @type {boolean}
   * @default false
   */
  public scissorTest: boolean = false;

  /**
   * A rectangular area representing the render target's viewport.
   *
   * @type {Vector4}
   * @default (0,0,width,height)
   */
  public viewport: Vector4;


  /**
   * An array of textures. Each color attachment is represented as a separate texture.
   * Has at least a single entry for the default color attachment.
   *
   * @type {Array<Texture>}
   */
  public textures: Texture[] = [];

  /**
   * Whether to allocate a depth buffer or not.
   *
   * @type {boolean}
   * @default true
   */
  public depthBuffer: boolean;

  /**
   * Whether to allocate a stencil buffer or not.
   *
   * @type {boolean}
   * @default false
   */
  public stencilBuffer: boolean;

  /**
   * Whether to resolve the depth buffer or not.
   *
   * @type {boolean}
   * @default true
   */
  public resolveDepthBuffer: boolean;

  /**
   * Whether to resolve the stencil buffer or not.
   *
   * @type {boolean}
   * @default true
   */
  public resolveStencilBuffer: boolean;

  private _depthTexture: Texture | null = null;

  /**
   * The number of MSAA samples.
   *
   * A value of `0` disables MSAA.
   *
   * @type {number}
   * @default 0
   */
  public samples: number;

  /**
   * Whether to this target is used in multiview rendering.
   *
   * @type {boolean}
   * @default false
   */
  public multiview: boolean;

  /**
   * Constructs a new render target.
   *
   * @param {number} [width=1] - The width of the render target.
   * @param {number} [height=1] - The height of the render target.
   * @param {RenderTarget~Options} [options] - The configuration object.
   */
  constructor(
    width: number = 1,
    height: number = 1,
    options: RenderTargetOptions = {}
  ) {

    super();

    options = Object.assign({
      generateMipmaps: false,
      internalFormat: null,
      minFilter: LinearFilter,
      depthBuffer: true,
      stencilBuffer: false,
      resolveDepthBuffer: true,
      resolveStencilBuffer: true,
      depthTexture: null,
      samples: 0,
      count: 1,
      depth: 1,
      multiview: false
    }, options);

    this.width = width;
    this.height = height;
    this.depth = options.depth!;
    this.scissor = new Vector4(0, 0, width, height);
    this.viewport = new Vector4(0, 0, width, height);

    const image = { width: width, height: height, depth: options.depth };

    const texture = new Texture(image);

    const count = options.count!;
    for (let i = 0; i < count; i++) {

      this.textures[i] = texture.clone();
      this.textures[i].isRenderTargetTexture = true;
      this.textures[i].renderTarget = this;

    }

    this._setTextureOptions(options);

    this.depthBuffer = options.depthBuffer!;
    this.stencilBuffer = options.stencilBuffer!;
    this.resolveDepthBuffer = options.resolveDepthBuffer!;
    this.resolveStencilBuffer = options.resolveStencilBuffer!;

    this._depthTexture = null;
    this.depthTexture = options.depthTexture!;

    this.samples = options.samples!;
    this.multiview = options.multiview!;

  }

  public _setTextureOptions(options: RenderTargetOptions & TextureOptions = {}) {

    const values: TextureOptions = {
      minFilter: LinearFilter,
      generateMipmaps: false,
      flipY: false,
      internalFormat: null
    };

    if (options.mapping !== undefined) values.mapping = options.mapping;
    if (options.wrapS !== undefined) values.wrapS = options.wrapS;
    if (options.wrapT !== undefined) values.wrapT = options.wrapT;
    if (options.wrapR !== undefined) values.wrapR = options.wrapR;
    if (options.magFilter !== undefined) values.magFilter = options.magFilter;
    if (options.minFilter !== undefined) values.minFilter = options.minFilter;
    if (options.format !== undefined) values.format = options.format;
    if (options.type !== undefined) values.type = options.type;
    if (options.anisotropy !== undefined) values.anisotropy = options.anisotropy;
    if (options.colorSpace !== undefined) values.colorSpace = options.colorSpace;
    if (options.flipY !== undefined) values.flipY = options.flipY;
    if (options.generateMipmaps !== undefined) values.generateMipmaps = options.generateMipmaps;
    if (options.internalFormat !== undefined) values.internalFormat = options.internalFormat;

    for (let i = 0; i < this.textures.length; i++) {

      const texture = this.textures[i];
      texture.setValues(values);

    }

  }

  /**
   * The texture representing the default color attachment.
   *
   * @type {Texture}
   */
  public get texture(): Texture {

    return this.textures[0];

  }

  public set texture(value) {

    this.textures[0] = value;

  }

  public set depthTexture(current) {

    if (this._depthTexture !== null) this._depthTexture.renderTarget = null;
    if (current !== null) current.renderTarget = this;

    this._depthTexture = current;

  }

  /**
   * Instead of saving the depth in a renderbuffer, a texture
   * can be used instead which is useful for further processing
   * e.g. in context of post-processing.
   *
   * @type {?DepthTexture}
   * @default null
   */
  public get depthTexture(): Texture | null {

    return this._depthTexture;

  }

  /**
   * Sets the size of this render target.
   *
   * @param {number} width - The width.
   * @param {number} height - The height.
   * @param {number} [depth=1] - The depth.
   */
  public setSize(width: number, height: number, depth: number = 1) {

    if (this.width !== width || this.height !== height || this.depth !== depth) {

      this.width = width;
      this.height = height;
      this.depth = depth;

      for (let i = 0, il = this.textures.length; i < il; i++) {

        this.textures[i].image.width = width;
        this.textures[i].image.height = height;
        this.textures[i].image.depth = depth;
        this.textures[i].isArrayTexture = this.textures[i].image.depth > 1;

      }

      this.dispose();

    }

    this.viewport.set(0, 0, width, height);
    this.scissor.set(0, 0, width, height);

  }

  /**
   * Returns a new render target with copied values from this instance.
   *
   * @return {RenderTarget} A clone of this instance.
   */
  public clone(): RenderTarget {

    return new RenderTarget().copy(this);

  }

  /**
   * Copies the settings of the given render target. This is a structural copy so
   * no resources are shared between render targets after the copy. That includes
   * all MRT textures and the depth texture.
   *
   * @param {RenderTarget} source - The render target to copy.
   * @return {RenderTarget} A reference to this instance.
   */
  public copy(source: RenderTarget) {

    this.width = source.width;
    this.height = source.height;
    this.depth = source.depth;

    this.scissor.copy(source.scissor);
    this.scissorTest = source.scissorTest;

    this.viewport.copy(source.viewport);

    this.textures.length = 0;

    for (let i = 0, il = source.textures.length; i < il; i++) {

      this.textures[i] = source.textures[i].clone();
      this.textures[i].isRenderTargetTexture = true;
      this.textures[i].renderTarget = this;

      // ensure image object is not shared, see #20328

      const image = Object.assign({}, source.textures[i].image);
      this.textures[i].source = new Source(image);

    }

    this.depthBuffer = source.depthBuffer;
    this.stencilBuffer = source.stencilBuffer;

    this.resolveDepthBuffer = source.resolveDepthBuffer;
    this.resolveStencilBuffer = source.resolveStencilBuffer;

    if (source.depthTexture !== null) this.depthTexture = source.depthTexture.clone();

    this.samples = source.samples;

    return this;

  }

  /**
   * Frees the GPU-related resources allocated by this instance. Call this
   * method whenever this instance is no longer used in your app.
   *
   * @fires RenderTarget#dispose
   */
  dispose() {

    this.dispatchEvent({ type: 'dispose' });

  }

}
