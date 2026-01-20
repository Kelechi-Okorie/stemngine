import {
  REVISION,
  BackSide,
  FrontSide,
  DoubleSide,
  HalfFloatType,
  UnsignedByteType,
  NoToneMapping,
  LinearMipmapLinearFilter,
  SRGBColorSpace,
  LinearSRGBColorSpace,
  RGBAIntegerFormat,
  RGIntegerFormat,
  RedIntegerFormat,
  UnsignedIntType,
  UnsignedShortType,
  UnsignedInt248Type,
  UnsignedShort4444Type,
  UnsignedShort5551Type,
  WebGLCoordinateSystem,
  ToneMappingType,
  ColorSpace,
  AnyTypedArray
} from '../constants';
import { Color } from '../math/Color';
import { Frustum } from '../math/Frustum';
import { Matrix4 } from '../math/Matrix4';
import { Vector2 } from '../math/Vector2';
import { Vector3 } from '../math/Vector3';
import { Vector4, isVector4 } from '../math/Vector4';
import { Camera } from '../cameras/Camera';
import { WebGLAnimation } from './webgl/WebGLAnimation';
import { WebGLAttributes } from './webgl/WebGLAttributes';
import { WebGLBackground } from './webgl/WebGLBackground';
import { WebGLBindingStates } from './webgl/WebGLBindingStates';
import { WebGLBufferRenderer } from './webgl/WebGLBufferRenderer';
import { WebGLCapabilities } from './webgl/WebGLCapabilities';
import { WebGLClipping } from './webgl/WebGLClipping';
import { WebGLCubeMaps } from './webgl/WebGLCubeMaps';
import { WebGLCubeUVMaps } from './webgl/WebGLCubeUVMaps';
import { WebGLExtensions } from './webgl/WebGLExtensions';
import { WebGLGeometries } from './webgl/WebGLGeometries';
import { WebGLIndexedBufferRenderer, isIndexedRenderer } from './webgl/WebGLIndexedBufferRenderer';
import { WebGLInfo } from './webgl/WebGLInfo';
import { WebGLMorphtargets } from './webgl/WebGLMorphtargets';
import { WebGLObjects } from './webgl/WebGLObjects';
import { WebGLPrograms } from './webgl/WebGLPrograms';
import { WebGLProperties } from './webgl/WebGLProperties';
import { WebGLRenderLists, WebGLRenderList } from './webgl/WebGLRenderLists';
import { WebGLRenderStates, WebGLRenderState } from './webgl/WebGLRenderStates';
import { WebGLRenderTarget } from './WebGLRenderTarget';
import { WebGLShadowMap } from './webgl/WebGLShadowMap';
import { WebGLState } from './webgl/WebGLState';
import { WebGLTextures } from './webgl/WebGLTextures';
import { WebGLUniforms } from './webgl/WebGLUniforms';
import { WebGLUtils } from './webgl/WebGLUtils';
import { WebXRManager } from './webxr/WebXRManager';
import { WebGLMaterials } from './webgl/WebGLMaterials';
import { WebGLUniformsGroups } from './webgl/WebGLUniformsGroups';
import { createCanvasElement, probeAsync, warnOnce } from '../utils';
import { ColorManagement } from '../math/ColorManagement';
import { BaseEvent, EventDispatcher } from '../core/EventDispatcher';
import { Mesh } from '../objects/Mesh';
import { Scene } from '../scenes/Scene';
import { Texture } from '../textures/Texture';

import { isLight } from '../lights/Light';
import { isLightShadow } from '../lights/LightShadow';
import { isArrayCamera } from '../cameras/ArrayCamera';
import { Plane } from '../math/Plane';
import { Node3D } from '../core/Node3D';

export interface WebGLRendererOptions {
  canvas?: HTMLCanvasElement;
  context?: WebGL2RenderingContext | null;
  precision?: 'highp' | 'mediump' | 'lowp';
  alpha?: boolean;
  premultipliedAlpha?: boolean;
  antialias?: boolean;
  stencil?: boolean;
  preserveDrawingBuffer?: boolean;
  powerPreference?: 'default' | 'low-power' | 'high-performance';
  failIfMajorPerformanceCaveat?: boolean;
  depth?: boolean;
  logarithmicDepthBuffer?: boolean;
  reversedDepthBuffer?: boolean;
}


/**
 * This renderer uses WebGL 2 to display scenes.
 *
 * WebGL 1 is not supported.
 */
export class WebGLRenderer {

  /**
 * This flag can be used for type testing.
 *
 * @readonly
 * @default true
 */
  public readonly isWebGLRenderer: boolean = true;

  /**
 * A canvas where the renderer draws its output.This is automatically created by the renderer
 * in the constructor (if not provided already); you just need to add it to your page like so:
 * ```js
 * document.body.appendChild( renderer.domElement );
 * ```
 *
 * @type {DOMElement}
 */
  public domElement;

  /**
 * A object with debug configuration settings.
 *
 * - `checkShaderErrors`: If it is `true`, defines whether material shader programs are
 * checked for errors during compilation and linkage process. It may be useful to disable
 * this check in production for performance gain. It is strongly recommended to keep these
 * checks enabled during development. If the shader does not compile and link - it will not
 * work and associated material will not render.
 * - `onShaderError(gl, program, glVertexShader,glFragmentShader)`: A callback function that
 * can be used for custom error reporting. The callback receives the WebGL context, an instance
 * of WebGLProgram as well two instances of WebGLShader representing the vertex and fragment shader.
 * Assigning a custom function disables the default error reporting.
 *
 * @type {Object}
 */
  public debug = {

    /**
     * Enables error checking and reporting when shader programs are being compiled.
     * @type {boolean}
     */
    checkShaderErrors: true,
    /**
     * Callback for custom error reporting.
     * @type {?Function}
     */
    onShaderError: null
  };

  // clearing

  /**
   * Whether the renderer should automatically clear its output before rendering a frame or not.
   *
   * @default true
   */
  public autoClear = true;

  /**
   * If {@link WebGLRenderer#autoClear} set to `true`, whether the renderer should clear
   * the color buffer or not.
   *
   * @default true
   */
  public autoClearColor = true;

  /**
   * If {@link WebGLRenderer#autoClear} set to `true`, whether the renderer should clear
   * the depth buffer or not.
   *
   * @default true
   */
  public autoClearDepth = true;

  /**
   * If {@link WebGLRenderer#autoClear} set to `true`, whether the renderer should clear
   * the stencil buffer or not.
   *
   * @default true
   */
  public autoClearStencil = true;

  // scene graph

  /**
   * Whether the renderer should sort objects or not.
   *
   * Note: Sorting is used to attempt to properly render objects that have some
   * degree of transparency. By definition, sorting objects may not work in all
   * cases. Depending on the needs of application, it may be necessary to turn
   * off sorting and use other methods to deal with transparency rendering e.g.
   * manually determining each object's rendering order.
   *
   * @default true
   */
  public sortObjects = true;

  // user-defined clipping

  /**
   * User-defined clipping planes specified in world space. These planes apply globally.
   * Points in space whose dot product with the plane is negative are cut away.
   *
   */
  public clippingPlanes: Plane[] = [];

  /**
   * Whether the renderer respects object-level clipping planes or not.
   *
   * @default false
   */
  public localClippingEnabled = false;

  // tone mapping

  /**
   * The tone mapping technique of the renderer.
   *
   * @default NoToneMapping
   */
  public toneMapping: ToneMappingType = NoToneMapping;

  /**
 * Exposure level of tone mapping.
 *
 * @default 1
 */
  public toneMappingExposure = 1.0;

  // transmission

  /**
   * The normalized resolution scale for the transmission render target, measured in percentage
   * of viewport dimensions. Lowering this value can result in significant performance improvements
   * when using {@link MeshPhysicalMaterial#transmission}.
   *
   * @default 1
   */
  public transmissionResolutionScale = 1.0;

  // internal state cache

  protected _outputColorSpace: ColorSpace = SRGBColorSpace;

  private _currentActiveCubeFace = 0;
  private _currentActiveMipmapLevel = 0;

  protected _currentRenderTarget: WebGLRenderTarget | null = null;

  private _currentMaterialId = -1;

  protected _currentCamera: Camera | null = null;

  private _currentViewport = new Vector4();
  private _currentScissor = new Vector4();
  private _currentScissorTest: boolean;

  private _currentClearColor = new Color(0x000000);
  private _currentClearAlpha = 0;

  private _isContextLost = false;

  private _width: number;
  private _height: number;

  protected _pixelRatio = 1;

  protected _opaqueSort!: (a: any, b: any) => number;
  protected _transparentSort!: (a: any, b: any) => number;

  protected _viewport: Vector4;
  protected _scissor: Vector4;
  private _scissorTest = false;

  // frustum

  protected _frustum = new Frustum();

  // clipping

  private _clippingEnabled = false;
  private _localClippingEnabled = false;

  // camera matrices cache

  private _projScreenMatrix = new Matrix4();

  private _vector3 = new Vector3();

  private _vector4 = new Vector4();

  private _emptyScene = { background: null, fog: null, environment: null, overrideMaterial: null, isScene: true };

  protected _renderBackground = false;

  protected parameters: WebGLRendererOptions;

  protected canvas: HTMLCanvasElement;
  protected _gl: WebGL2RenderingContext;
  protected reversedDepthBuffer: boolean;

  protected stencil: boolean;

  protected _alpha: boolean;

  private extensions!: WebGLExtensions;
  private capabilities!: WebGLCapabilities;
  public state!: WebGLState;
  private info!: WebGLInfo;

  public properties!: WebGLProperties;
  private textures!: WebGLTextures;
  private cubemaps!: WebGLCubeMaps;
  private cubeuvmaps!: WebGLCubeUVMaps;
  private attributes!: WebGLAttributes;
  private geometries!: WebGLGeometries;
  private objects!: WebGLObjects;

  private programCache!: WebGLPrograms;
  private materials!: WebGLMaterials;
  private renderLists!: WebGLRenderLists;
  private renderStates!: WebGLRenderStates;
  private clipping!: WebGLClipping;
  public shadowMap!: WebGLShadowMap;

  private background!: WebGLBackground;
  private morphtargets!: WebGLMorphtargets;
  private bufferRenderer!: WebGLBufferRenderer;
  private indexedBufferRenderer!: WebGLIndexedBufferRenderer;

  private utils!: WebGLUtils;
  private bindingStates!: WebGLBindingStates;
  private uniformsGroups!: WebGLUniformsGroups;

  private premultipliedAlpha: boolean;

  public onAnimationFrameCallback: any = null;

  public animation = new WebGLAnimation();

  protected _scratchFrameBuffer: any;

  protected _srcFramebuffer: any;
  protected _dstFramebuffer: any;

  protected uintClearColor = new Uint32Array(4);
  protected intClearColor = new Int32Array(4);

  protected currentRenderList: WebGLRenderList | null = null;
  protected currentRenderState: WebGLRenderState | null = null;

  protected renderListStack: WebGLRenderList[] = [];
  protected renderStateStack: WebGLRenderState[] = [];

  private cm = ColorManagement.instance;

  /**
   * Constructs a new WebGL renderer.
   *
   * @param {WebGLRenderer~Options} [parameters] - The configuration parameter.
   */
  constructor(parameters: WebGLRendererOptions = {}) {

    const {
      canvas = createCanvasElement(),
      context = null,
      depth = true,
      stencil = false,
      alpha = false,
      antialias = false,
      premultipliedAlpha = true,
      preserveDrawingBuffer = false,
      powerPreference = 'default',
      failIfMajorPerformanceCaveat = false,
      reversedDepthBuffer = false,
    } = parameters;

    this.parameters = parameters;

    if (context !== null) {

      if (typeof WebGLRenderingContext !== 'undefined' && context instanceof WebGLRenderingContext) {

        throw new Error('WebGLRenderer: WebGL 1 is not supported.');

      }

      const attrs = context.getContextAttributes();

      // this._alpha = context.getContextAttributes().alpha;
      this._alpha = attrs?.alpha ?? true;

    } else {

      this._alpha = alpha;

    }

    this.canvas = canvas;

    // initialize

    // this._gl = context;
    this.reversedDepthBuffer = reversedDepthBuffer;
    this.premultipliedAlpha = premultipliedAlpha;


    // render() can be called from within a callback triggered by another render.
    // We track this so that the nested render call gets its list and state isolated from the parent render call.

    this.domElement = canvas;

    const width = canvas.width;
    const height = canvas.height;

    this._width = width;
    this._height = height;

    this._viewport = new Vector4(0, 0, width, height);
    this._scissor = new Vector4(0, 0, width, height);

    this._currentScissorTest = this._scissorTest;

    this.stencil = stencil;

    try {

      const contextAttributes = {
        alpha: true,
        depth,
        stencil,
        antialias,
        premultipliedAlpha,
        preserveDrawingBuffer,
        powerPreference,
        failIfMajorPerformanceCaveat,
      };

      // OffscreenCanvas does not have setAttribute, see #22811
      if ('setAttribute' in canvas) canvas.setAttribute('data-engine', `stemngine r${REVISION}`);

      // event listeners must be registered before WebGL context is created, see #12753
      canvas.addEventListener('webglcontextlost', this.onContextLost, false);
      canvas.addEventListener('webglcontextrestored', this.onContextRestore, false);
      canvas.addEventListener('webglcontextcreationerror', this.onContextCreationError, false);

      // if (this._gl === null) {
      if (context === null) {

        const contextName = 'webgl2';

        this._gl = this.getContext(contextName, contextAttributes);

        // if (this._gl === null) {

        //   if (this.getContext(contextName)) {

        //     throw new Error('Error creating WebGL context with your selected attributes.');

        //   } else {

        //     throw new Error('Error creating WebGL context.');

        //   }

        // }

      } else {
        this._gl = context;
      }

    } catch (error) {

      if (error instanceof Error) {
        console.error('WebGLRenderer: ' + error.message);
      } else {
        console.error('WebGLRenderer: ', error);
      }

      throw error;

    }

    // this.initGLContext();
    this.extensions = new WebGLExtensions(this._gl);
    this.extensions.init();

    this.utils = new WebGLUtils(this._gl, this.extensions);

    this.capabilities = new WebGLCapabilities(this._gl, this.extensions, this.parameters, this.utils);

    this.state = new WebGLState(this._gl, this.extensions);

    if (this.capabilities.reversedDepthBuffer && this.reversedDepthBuffer) {

      this.state.buffers.depth.setReversed(true);

    }

    this.info = new WebGLInfo(this._gl);
    this.properties = new WebGLProperties();
    this.textures = new WebGLTextures(this._gl, this.extensions, this.state, this.properties, this.capabilities, this.utils, this.info);
    this.cubemaps = new WebGLCubeMaps(this);
    this.cubeuvmaps = new WebGLCubeUVMaps(this);
    this.attributes = new WebGLAttributes(this._gl);
    this.bindingStates = new WebGLBindingStates(this._gl, this.attributes);
    this.geometries = new WebGLGeometries(this._gl, this.attributes, this.info, this.bindingStates);
    this.objects = new WebGLObjects(this._gl, this.geometries, this.attributes, this.info);
    this.morphtargets = new WebGLMorphtargets(this._gl, this.capabilities, this.textures);
    this.clipping = new WebGLClipping(this.properties);
    this.programCache = new WebGLPrograms(this, this.cubemaps, this.cubeuvmaps, this.extensions, this.capabilities, this.bindingStates, this.clipping);
    this.materials = new WebGLMaterials(this, this.properties);
    this.renderLists = new WebGLRenderLists();
    this.renderStates = new WebGLRenderStates(this.extensions);
    this.background = new WebGLBackground(this, this.cubemaps, this.cubeuvmaps, this.state, this.objects, this._alpha, this.premultipliedAlpha);
    this.shadowMap = new WebGLShadowMap(this, this.objects, this.capabilities);
    this.uniformsGroups = new WebGLUniformsGroups(this._gl, this.info, this.capabilities, this.state);

    this.bufferRenderer = new WebGLBufferRenderer(this._gl, this.extensions, this.info);
    this.indexedBufferRenderer = new WebGLIndexedBufferRenderer(this._gl, this.extensions, this.info);

    this.info.programs = this.programCache.programs;

    this.animation.setAnimationLoop(this.onAnimationFrame);

    if (typeof self !== 'undefined') this.animation.setContext(self);

    // xr

    // const xr = new WebXRManager(_this, _gl);

    /**
     * A reference to the XR manager.
     *
     * @type {WebXRManager}
     */
    // this.xr = xr;

    this._scratchFrameBuffer = this._gl.createFramebuffer();


    this._srcFramebuffer = this._gl.createFramebuffer();
    this._dstFramebuffer = this._gl.createFramebuffer();


    /**
     * __THREE_DEVTOOLS__ is a global variable that the Three.js DevTools
     *  browser extension injects into the page.
     *
     * It allows the extension to observe WebGLRenderer instances, Object3D trees, materials, etc
     */

    // if (typeof __THREE_DEVTOOLS__ !== 'undefined') {

    //   __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent('observe', { detail: this }));

    // }

  }

  public initGLContext() {

    this.extensions = new WebGLExtensions(this._gl);
    this.extensions.init();

    this.utils = new WebGLUtils(this._gl, this.extensions);

    this.capabilities = new WebGLCapabilities(this._gl, this.extensions, this.parameters, this.utils);

    this.state = new WebGLState(this._gl, this.extensions);

    if (this.capabilities.reversedDepthBuffer && this.reversedDepthBuffer) {

      this.state.buffers.depth.setReversed(true);

    }

    this.info = new WebGLInfo(this._gl);
    this.properties = new WebGLProperties();
    this.textures = new WebGLTextures(this._gl, this.extensions, this.state, this.properties, this.capabilities, this.utils, this.info);
    this.cubemaps = new WebGLCubeMaps(this);
    this.cubeuvmaps = new WebGLCubeUVMaps(this);
    this.attributes = new WebGLAttributes(this._gl);
    this.bindingStates = new WebGLBindingStates(this._gl, this.attributes);
    this.geometries = new WebGLGeometries(this._gl, this.attributes, this.info, this.bindingStates);
    this.objects = new WebGLObjects(this._gl, this.geometries, this.attributes, this.info);
    this.morphtargets = new WebGLMorphtargets(this._gl, this.capabilities, this.textures);
    this.clipping = new WebGLClipping(this.properties);
    this.programCache = new WebGLPrograms(this, this.cubemaps, this.cubeuvmaps, this.extensions, this.capabilities, this.bindingStates, this.clipping);
    this.materials = new WebGLMaterials(this, this.properties);
    this.renderLists = new WebGLRenderLists();
    this.renderStates = new WebGLRenderStates(this.extensions);
    this.background = new WebGLBackground(this, this.cubemaps, this.cubeuvmaps, this.state, this.objects, this._alpha, this.premultipliedAlpha);
    this.shadowMap = new WebGLShadowMap(this, this.objects, this.capabilities);
    this.uniformsGroups = new WebGLUniformsGroups(this._gl, this.info, this.capabilities, this.state);

    this.bufferRenderer = new WebGLBufferRenderer(this._gl, this.extensions, this.info);
    this.indexedBufferRenderer = new WebGLIndexedBufferRenderer(this._gl, this.extensions, this.info);

    this.info.programs = this.programCache.programs;

  }

  protected getTargetPixelRatio(): number {

    return this._currentRenderTarget === null ? this._pixelRatio : 1;

  }

  /**
  * Returns the rendering context.
  *
  * @return {WebGL2RenderingContext} The rendering context.
  */
  public getContext(
    contextName: string = 'webgl2',
    contextAttributes?: WebGLContextAttributes
  ): WebGL2RenderingContext {

    const newContext = this.canvas.getContext('webgl2', contextAttributes);

    if (newContext === null) {

      if (this.getContext(contextName)) {

        throw new Error('Error creating WebGL context with your selected attributes.');

      } else {

        throw new Error('Error creating WebGL context.');

      }

    }

    // return this.canvas.getContext('webgl2', contextAttributes);
    return newContext;

  }


  /**
  * Returns the rendering context attributes.
  *
  */
  public getContextAttributes(): WebGLContextAttributes | null {

    return this._gl.getContextAttributes();

  };

  /**
   * Simulates a loss of the WebGL context. This requires support for the `WEBGL_lose_context` extension.
   */
  public forceContextLoss(): void {

    const extension = this.extensions.get('WEBGL_lose_context');
    if (extension) extension.loseContext();

  };

  /**
   * Simulates a restore of the WebGL context. This requires support for the `WEBGL_lose_context` extension.
   */
  public forceContextRestore(): void {

    const extension = this.extensions.get('WEBGL_lose_context');
    if (extension) extension.restoreContext();

  };


  /**
  * Returns the pixel ratio.
  *
  * @return {number} The pixel ratio.
  */
  public getPixelRatio(): number {

    return this._pixelRatio;

  };

  /**
   * Sets the given pixel ratio and resizes the canvas if necessary.
   *
   * @param {number} value - The pixel ratio.
   */
  public setPixelRatio(value: number | undefined): void {

    if (value === undefined) return;

    this._pixelRatio = value;

    this.setSize(this._width, this._height, false);

  };

  /**
   * Returns the renderer's size in logical pixels. This method does not honor the pixel ratio.
   *
   * @param {Vector2} target - The method writes the result in this target object.
   * @return {Vector2} The renderer's size in logical pixels.
   */
  public getSize(target: Vector2): Vector2 {

    return target.set(this._width, this._height);

  };

  /**
   * Resizes the output canvas to (width, height) with device pixel ratio taken
   * into account, and also sets the viewport to fit that size, starting in (0,
   * 0). Setting `updateStyle` to false prevents any style changes to the output canvas.
   *
   * @param width - The width in logical pixels.
   * @param height - The height in logical pixels.
   * @param updateStyle - Whether to update the `style` attribute of the canvas or not.
   */
  public setSize(width: number, height: number, updateStyle = true): void {

    // if (xr.isPresenting) {

    //   console.warn('WebGLRenderer: Can\'t change size while VR device is presenting.');
    //   return;

    // }

    this._width = width;
    this._height = height;

    this.canvas.width = Math.floor(width * this._pixelRatio);
    this.canvas.height = Math.floor(height * this._pixelRatio);

    if (updateStyle === true) {

      this.canvas.style.width = width + 'px';
      this.canvas.style.height = height + 'px';

    }

    this.setViewport(0, 0, width, height);

  };

  /**
   * Returns the drawing buffer size in physical pixels. This method honors the pixel ratio.
   *
   * @param {Vector2} target - The method writes the result in this target object.
   * @return {Vector2} The drawing buffer size.
   */
  public getDrawingBufferSize(target: Vector2): Vector2 {

    return target.set(this._width * this._pixelRatio, this._height * this._pixelRatio).floor();

  };

  /**
   * This method allows to define the drawing buffer size by specifying
   * width, height and pixel ratio all at once. The size of the drawing
   * buffer is computed with this formula:
   * ```js
   * size.x = width * pixelRatio;
   * size.y = height * pixelRatio;
   * ```
   *
   * @param {number} width - The width in logical pixels.
   * @param {number} height - The height in logical pixels.
   * @param {number} pixelRatio - The pixel ratio.
   */
  public setDrawingBufferSize(width: number, height: number, pixelRatio: number) {

    this._width = width;
    this._height = height;

    this._pixelRatio = pixelRatio;

    this.canvas.width = Math.floor(width * pixelRatio);
    this.canvas.height = Math.floor(height * pixelRatio);

    this.setViewport(0, 0, width, height);

  };

  /**
   * Returns the current viewport definition.
   *
   * @param {Vector2} target - The method writes the result in this target object.
   * @return {Vector2} The current viewport definition.
   */
  public getCurrentViewport(target: Vector4): Vector4 { // TODO: threejs actually uses Vector2

    return target.copy(this._currentViewport);

  };

  /**
   * Returns the viewport definition.
   *
   * @param {Vector4} target - The method writes the result in this target object.
   * @return {Vector4} The viewport definition.
   */
  public getViewport(target: Vector4): Vector4 {

    return target.copy(this._viewport);

  };

  /**
   * Sets the viewport to render from `(x, y)` to `(x + width, y + height)`.
   *
   * @param {number | Vector4} x - The horizontal coordinate for the lower left corner of the viewport origin in logical pixel unit.
   * Or alternatively a four-component vector specifying all the parameters of the viewport.
   * @param {number} y - The vertical coordinate for the lower left corner of the viewport origin  in logical pixel unit.
   * @param {number} width - The width of the viewport in logical pixel unit.
   * @param {number} height - The height of the viewport in logical pixel unit.
   */
  public setViewport(
    x: number | Vector4,
    y: number,
    width: number,
    height: number
  ) {

    if (isVector4(x)) {

      this._viewport.set(x.x, x.y, x.z, x.w);

    } else {

      this._viewport.set(x, y, width, height);

    }

    this.state.viewport(this._currentViewport.copy(this._viewport).multiplyScalar(this._pixelRatio).round());

  };

  /**
   * Returns the scissor region.
   *
   * @param {Vector4} target - The method writes the result in this target object.
   * @return {Vector4} The scissor region.
   */
  public getScissor(target: Vector4): Vector4 {

    return target.copy(this._scissor);

  };

  /**
   * Sets the scissor region to render from `(x, y)` to `(x + width, y + height)`.
   *
   * @param {number | Vector4} x - The horizontal coordinate for the lower left corner of the scissor region origin in logical pixel unit.
   * Or alternatively a four-component vector specifying all the parameters of the scissor region.
   * @param {number} y - The vertical coordinate for the lower left corner of the scissor region origin  in logical pixel unit.
   * @param {number} width - The width of the scissor region in logical pixel unit.
   * @param {number} height - The height of the scissor region in logical pixel unit.
   */
  public setScissor(
    x: number | Vector4,
    y: number,
    width: number,
    height: number
  ) {

    if (isVector4(x)) {

      this._scissor.set(x.x, x.y, x.z, x.w);

    } else {

      this._scissor.set(x, y, width, height);

    }

    this.state.scissor(this._currentScissor.copy(this._scissor).multiplyScalar(this._pixelRatio).round());

  };

  /**
   * Returns `true` if the scissor test is enabled.
   *
   * @return {boolean} Whether the scissor test is enabled or not.
   */
  public getScissorTest(): boolean {

    return this._scissorTest;

  };

  /**
   * Enable or disable the scissor test. When this is enabled, only the pixels
   * within the defined scissor area will be affected by further renderer
   * actions.
   *
   * @param {boolean} boolean - Whether the scissor test is enabled or not.
   */
  public setScissorTest(boolean: boolean): void {

    this.state.setScissorTest(this._scissorTest = boolean);

  };

  /**
   * Sets a custom opaque sort function for the render lists. Pass `null`
   * to use the default `painterSortStable` function.
   *
   * @param {?Function} method - The opaque sort function.
   */
  public setOpaqueSort(method: (a: any, b: any) => number) {  // TODO: type well

    this._opaqueSort = method;

  };

  /**
   * Sets a custom transparent sort function for the render lists. Pass `null`
   * to use the default `reversePainterSortStable` function.
   *
   * @param {?Function} method - The opaque sort function.
   */
  public setTransparentSort(method: (a: any, b: any) => number) { // TODO: type well

    this._transparentSort = method;

  };

  // Clearing

  /**
   * Returns the clear color.
   *
   * @param {Color} target - The method writes the result in this target object.
   * @return {Color} The clear color.
   */
  public getClearColor(target: Color): Color {

    return target.copy(this.background.getClearColor());

  };

  /**
   * Sets the clear color and alpha.
   *
   * @param {Color} color - The clear color.
   * @param {number} [alpha=1] - The clear alpha.
   */
  public setClearColor(color: Color, alpha: number = 1): void {

    this.background.setClearColor(color, alpha);

  };

  /**
   * Returns the clear alpha. Ranges within `[0,1]`.
   *
   * @return {number} The clear alpha.
   */
  public getClearAlpha(): number {

    return this.background.getClearAlpha();

  };

  /**
   * Sets the clear alpha.
   *
   * @param {number} alpha - The clear alpha.
   */
  public setClearAlpha(alpha: number) {

    this.background.setClearAlpha(alpha);

  };

  /**
   * Tells the renderer to clear its color, depth or stencil drawing buffer(s).
   * This method initializes the buffers to the current clear color values.
   *
   * @param {boolean} [color=true] - Whether the color buffer should be cleared or not.
   * @param {boolean} [depth=true] - Whether the depth buffer should be cleared or not.
   * @param {boolean} [stencil=true] - Whether the stencil buffer should be cleared or not.
   */
  public clear(color: boolean = true, depth: boolean = true, stencil: boolean = true): void {

    let bits = 0;

    if (color) {

      // check if we're trying to clear an integer target
      let isIntegerFormat = false;
      if (this._currentRenderTarget !== null) {

        const targetFormat = this._currentRenderTarget.texture.format;
        isIntegerFormat = targetFormat === RGBAIntegerFormat ||
          targetFormat === RGIntegerFormat ||
          targetFormat === RedIntegerFormat;

      }

      // use the appropriate clear functions to clear the target if it's a signed
      // or unsigned integer target
      if (isIntegerFormat) {

        const targetType = this._currentRenderTarget!.texture.type;
        const isUnsignedType = targetType === UnsignedByteType ||
          targetType === UnsignedIntType ||
          targetType === UnsignedShortType ||
          targetType === UnsignedInt248Type ||
          targetType === UnsignedShort4444Type ||
          targetType === UnsignedShort5551Type;

        const clearColor = this.background.getClearColor();
        const a = this.background.getClearAlpha();
        const r = clearColor.r;
        const g = clearColor.g;
        const b = clearColor.b;

        if (isUnsignedType) {

          this.uintClearColor[0] = r;
          this.uintClearColor[1] = g;
          this.uintClearColor[2] = b;
          this.uintClearColor[3] = a;
          this._gl.clearBufferuiv(this._gl.COLOR, 0, this.uintClearColor);

        } else {

          this.intClearColor[0] = r;
          this.intClearColor[1] = g;
          this.intClearColor[2] = b;
          this.intClearColor[3] = a;
          this._gl.clearBufferiv(this._gl.COLOR, 0, this.intClearColor);

        }

      } else {

        bits |= this._gl.COLOR_BUFFER_BIT;

      }

    }

    if (depth) {

      bits |= this._gl.DEPTH_BUFFER_BIT;

    }

    if (stencil) {

      bits |= this._gl.STENCIL_BUFFER_BIT;
      this.state.buffers.stencil.setMask(0xffffffff);

    }

    this._gl.clear(bits);

  };

  /**
   * Clears the color buffer. Equivalent to calling `renderer.clear( true, false, false )`.
   */
  public clearColor(): void {

    this.clear(true, false, false);

  };

  /**
   * Clears the depth buffer. Equivalent to calling `renderer.clear( false, true, false )`.
   */
  public clearDepth(): void {

    this.clear(false, true, false);

  };

  /**
   * Clears the stencil buffer. Equivalent to calling `renderer.clear( false, false, true )`.
   */
  public clearStencil(): void {

    this.clear(false, false, true);

  };

  /**
   * Frees the GPU-related resources allocated by this instance. Call this
   * method whenever this instance is no longer used in your app.
   */
  public dispose = (): void => {

    this.canvas.removeEventListener('webglcontextlost', this.onContextLost, false);
    this.canvas.removeEventListener('webglcontextrestored', this.onContextRestore, false);
    this.canvas.removeEventListener('webglcontextcreationerror', this.onContextCreationError, false);

    this.background.dispose();
    this.renderLists.dispose();
    this.renderStates.dispose();
    this.properties.dispose();
    this.cubemaps.dispose();
    this.cubeuvmaps.dispose();
    this.objects.dispose();
    this.bindingStates.dispose();
    this.uniformsGroups.dispose();
    this.programCache.dispose();

    // this.xr.dispose();

    // this.xr.removeEventListener('sessionstart', this.onXRSessionStart);
    // this.xr.removeEventListener('sessionend', this.onXRSessionEnd);

    this.animation.stop();

  };

  // Events

  public onContextLost(event: BaseEvent<WebGLRenderer>): void {

    event.preventDefault();

    console.log('WebGLRenderer: Context Lost.');

    this._isContextLost = true;

  }

  public onContextRestore( /* event */) {

    console.log('WebGLRenderer: Context Restored.');

    this._isContextLost = false;

    const infoAutoReset = this.info.autoReset;
    const shadowMapEnabled = this.shadowMap.enabled;
    const shadowMapAutoUpdate = this.shadowMap.autoUpdate;
    const shadowMapNeedsUpdate = this.shadowMap.needsUpdate;
    const shadowMapType = this.shadowMap.type;

    this.initGLContext();

    this.info.autoReset = infoAutoReset;
    this.shadowMap.enabled = shadowMapEnabled;
    this.shadowMap.autoUpdate = shadowMapAutoUpdate;
    this.shadowMap.needsUpdate = shadowMapNeedsUpdate;
    this.shadowMap.type = shadowMapType;

  }

  public onContextCreationError(event: BaseEvent<WebGLRenderer>) {

    console.error('WebGLRenderer: A WebGL context could not be created. Reason: ', event.statusMessage);

  }

  public onMaterialDispose = (event: any) => {  // TODO: type well

    const material = event.target!;

    material.removeEventListener('dispose', this.onMaterialDispose);

    this.deallocateMaterial(material);

  }

  // Buffer deallocation

  public deallocateMaterial(material: WebGLMaterials) {

    this.releaseMaterialProgramReferences(material);

    this.properties.remove(material);

  }


  public releaseMaterialProgramReferences(material: WebGLMaterials) {

    const programs = this.properties.get(material).programs;

    if (programs !== undefined) {

      programs.forEach((program: WebGLProgram) => {

        this.programCache.releaseProgram(program);

      });

      if ('isShaderMaterial' in material) {

        this.programCache.releaseShaderCache(material);

      }

    }

  }

  // Buffer rendering

  public renderBufferDirect(
    camera: Camera,
    scene: any, // TODO: type well
    geometry: any,
    material: any,
    object: any,
    group: any  // TODO: type well
  ) {

    if (scene === null) scene = this._emptyScene; // renderBufferDirect second parameter used to be fog (could be null)

    const frontFaceCW = (object.isMesh && object.matrixWorld.determinant() < 0);

    const program = this.setProgram(camera, scene, geometry, material, object);

    this.state.setMaterial(material, frontFaceCW);

    //

    let index = geometry.index;
    let rangeFactor = 1;

    if (material.wireframe === true) {

      index = this.geometries.getWireframeAttribute(geometry);

      if (index === undefined) return;

      rangeFactor = 2;

    }

    //

    const drawRange = geometry.drawRange;
    const position = geometry.attributes.position;

    let drawStart = drawRange.start * rangeFactor;
    let drawEnd = (drawRange.start + drawRange.count) * rangeFactor;

    if (group !== null) {

      drawStart = Math.max(drawStart, group.start * rangeFactor);
      drawEnd = Math.min(drawEnd, (group.start + group.count) * rangeFactor);

    }

    if (index !== null) {

      drawStart = Math.max(drawStart, 0);
      drawEnd = Math.min(drawEnd, index.count);

    } else if (position !== undefined && position !== null) {

      drawStart = Math.max(drawStart, 0);
      drawEnd = Math.min(drawEnd, position.count);

    }

    const drawCount = drawEnd - drawStart;

    if (drawCount < 0 || drawCount === Infinity) return;

    //

    this.bindingStates.setup(object, material, program, geometry, index);

    let attribute;
    let renderer: WebGLBufferRenderer | WebGLIndexedBufferRenderer = this.bufferRenderer;

    if (index !== null) {

      attribute = this.attributes.get(index);

      renderer = this.indexedBufferRenderer;

      if (attribute !== undefined && isIndexedRenderer(renderer)) {
        renderer.setIndex(attribute);
      }

    }

    //

    if (object.isMesh) {

      if (material.wireframe === true) {

        this.state.setLineWidth(material.wireframeLinewidth * this.getTargetPixelRatio());
        renderer.setMode(this._gl.LINES);

      } else {

        renderer.setMode(this._gl.TRIANGLES);

      }

    } else if (object.isLine) {

      let lineWidth = material.linewidth;

      if (lineWidth === undefined) lineWidth = 1; // Not using Line*Material

      this.state.setLineWidth(lineWidth * this.getTargetPixelRatio());

      if (object.isLineSegments) {

        renderer.setMode(this._gl.LINES);

      } else if (object.isLineLoop) {

        renderer.setMode(this._gl.LINE_LOOP);

      } else {

        renderer.setMode(this._gl.LINE_STRIP);

      }

    } else if (object.isPoints) {

      renderer.setMode(this._gl.POINTS);

    } else if (object.isSprite) {

      renderer.setMode(this._gl.TRIANGLES);

    }

    if (object.isBatchedMesh) {

      if (object._multiDrawInstances !== null) {

        // @deprecated, r174
        warnOnce('WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection.');
        renderer.renderMultiDrawInstances(object._multiDrawStarts, object._multiDrawCounts, object._multiDrawCount, object._multiDrawInstances);

      } else {

        if (!this.extensions.get('WEBGL_multi_draw')) {

          const starts = object._multiDrawStarts;
          const counts = object._multiDrawCounts;
          const drawCount = object._multiDrawCount;


          // const bytesPerElement = index ? this.attributes.get(index).bytesPerElement : 1;
          /**
           * if index is missing -> 1
           * if get(index) return undefined -> 1
           * otherwise -> bytesPerElement
           */
          const attribute = index !== undefined
            ? this.attributes.get(index)
            : undefined;

          const bytesPerElement = attribute?.bytesPerElement ?? 1;

          const uniforms = this.properties.get(material).currentProgram.getUniforms();
          for (let i = 0; i < drawCount; i++) {

            uniforms.setValue(this._gl, '_gl_DrawID', i);
            renderer.render(starts[i] / bytesPerElement, counts[i]);

          }

        } else {

          renderer.renderMultiDraw(object._multiDrawStarts, object._multiDrawCounts, object._multiDrawCount);

        }

      }

    } else if (object.isInstancedMesh) {

      renderer.renderInstances(drawStart, drawCount, object.count);

    } else if (geometry.isInstancedBufferGeometry) {

      const maxInstanceCount = geometry._maxInstanceCount !== undefined ? geometry._maxInstanceCount : Infinity;
      const instanceCount = Math.min(geometry.instanceCount, maxInstanceCount);

      renderer.renderInstances(drawStart, drawCount, instanceCount);

    } else {

      renderer.render(drawStart, drawCount);

    }

  };

  // Compile

  // TODO: type well
  public prepareMaterial(material: any, scene: any, object: any) {

    if (material.transparent === true && material.side === DoubleSide && material.forceSinglePass === false) {

      material.side = BackSide;
      material.needsUpdate = true;
      this.getProgram(material, scene, object);

      material.side = FrontSide;
      material.needsUpdate = true;
      this.getProgram(material, scene, object);

      material.side = DoubleSide;

    } else {

      this.getProgram(material, scene, object);

    }

  }

  /**
   * Compiles all materials in the scene with the camera. This is useful to precompile shaders
   * before the first rendering. If you want to add a 3D object to an existing scene, use the third
   * optional parameter for applying the target scene.
   *
   * Note that the (target) scene's lighting and environment must be configured before calling this method.
   *
   * @param {Object3D} scene - The scene or another type of 3D object to precompile.
   * @param {Camera} camera - The camera.
   * @param {?Scene} [targetScene=null] - The target scene.
   * @return {Set<Material>} The precompiled materials.
   */
  public compile(
    scene: any,  // TODO: type well
    camera: Camera,
    targetScene?: Scene
  ) {

    if (!targetScene) targetScene = scene;

    this.currentRenderState = this.renderStates.get(targetScene!);
    this.currentRenderState.init(camera);

    this.renderStateStack.push(this.currentRenderState);

    // gather lights from both the target scene and the new object that will be added to the scene.

    targetScene?.traverseVisible((object) => {

      if (isLight(object) && object.layers.test(camera.layers)) {

        this.currentRenderState!.pushLight(object);

        if (object.castShadow) {

          this.currentRenderState!.pushShadow(object);

        }

      }

    });

    if (scene !== targetScene) {

      scene.traverseVisible((object: any) => {

        if (object.isLight && object.layers.test(camera.layers)) {

          this.currentRenderState?.pushLight(object);

          if (object.castShadow) {

            this.currentRenderState?.pushShadow(object);

          }

        }

      });

    }

    this.currentRenderState?.setupLights();

    // Only initialize materials in the new scene, not the targetScene.

    const materials = new Set();

    scene.traverse((object: any) => {

      if (!(object.isMesh || object.isPoints || object.isLine || object.isSprite)) {

        return;

      }

      const material = object.material;

      if (material) {

        if (Array.isArray(material)) {

          for (let i = 0; i < material.length; i++) {

            const material2 = material[i];

            this.prepareMaterial(material2, targetScene, object);
            materials.add(material2);

          }

        } else {

          this.prepareMaterial(material, targetScene, object);
          materials.add(material);

        }

      }

    });

    const renderState = this.renderStateStack.pop();
    // this.currentRenderState = this.renderStateStack.pop();
    if (renderState) {
      this.currentRenderState = renderState;
    }

    return materials;

  };

  // compileAsync

  /**
   * Asynchronous version of {@link WebGLRenderer#compile}.
   *
   * This method makes use of the `KHR_parallel_shader_compile` WebGL extension. Hence,
   * it is recommended to use this version of `compile()` whenever possible.
   *
   * @async
   * @param {Object3D} scene - The scene or another type of 3D object to precompile.
   * @param {Camera} camera - The camera.
   * @param {?Scene} [targetScene=null] - The target scene.
   * @return {Promise} A Promise that resolves when the given scene can be rendered without unnecessary stalling due to shader compilation.
   */
  public compileAsync(
    scene: Scene,
    camera: Camera,
    targetScene?: Scene
  ) {

    const materials = this.compile(scene, camera, targetScene);

    // Wait for all the materials in the new object to indicate that they're
    // ready to be used before resolving the promise.

    return new Promise((resolve) => {

      const checkMaterialsReady = () => {

        materials.forEach((material: any) => {

          const materialProperties = this.properties.get(material);
          const program = materialProperties.currentProgram;

          if (program.isReady()) {

            // remove any programs that report they're ready to use from the list
            materials.delete(material);

          }

        });

        // once the list of compiling materials is empty, call the callback

        if (materials.size === 0) {

          resolve(scene);
          return;

        }

        // if some materials are still not ready, wait a bit and check again

        setTimeout(checkMaterialsReady, 10);

      }

      if (this.extensions.get('KHR_parallel_shader_compile') !== null) {

        // If we can check the compilation status of the materials without
        // blocking then do so right away.

        checkMaterialsReady();

      } else {

        // Otherwise start by waiting a bit to give the materials we just
        // initialized a chance to finish.

        setTimeout(checkMaterialsReady, 10);

      }

    });

  };

  // Animation Loop


  public onAnimationFrame(time: number) {

    if (this.onAnimationFrameCallback) this.onAnimationFrameCallback(time);

  }

  // function onXRSessionStart() {

  //   animation.stop();

  // }

  // function onXRSessionEnd() {

  //   animation.start();

  // }

  public setAnimationLoop(callback: any) {  // TODO: type very well

    this.onAnimationFrameCallback = callback;
    // xr.setAnimationLoop(callback);

    (callback === null) ? this.animation.stop() : this.animation.start();

  };

  // xr.addEventListener('sessionstart', onXRSessionStart);
  // xr.addEventListener('sessionend', onXRSessionEnd);

  // Rendering

  /**
   * Renders the given scene (or other type of 3D object) using the given camera.
   *
   * The render is done to a previously specified render target set by calling {@link WebGLRenderer#setRenderTarget}
   * or to the canvas as usual.
   *
   * By default render buffers are cleared before rendering but you can prevent
   * this by setting the property `autoClear` to `false`. If you want to prevent
   * only certain buffers being cleared you can `autoClearColor`, `autoClearDepth`
   * or `autoClearStencil` to `false`. To force a clear, use {@link WebGLRenderer#clear}.
   *
   * @param {Object3D} scene - The scene to render.
   * @param {Camera} camera - The camera.
   */
  public render(scene: Scene, camera: Camera) {

    if (camera !== undefined && camera.isCamera !== true) {

      console.error('WebGLRenderer.render: camera is not an instance of Camera.');
      return;

    }

    if (this._isContextLost === true) return;

    // update scene graph

    if (scene.matrixWorldAutoUpdate === true) scene.updateMatrixWorld();

    // update camera matrices and frustum

    if (camera.parent === null && camera.matrixWorldAutoUpdate === true) camera.updateMatrixWorld();

    // if (xr.enabled === true && xr.isPresenting === true) {

    //   if (xr.cameraAutoUpdate === true) xr.updateCamera(camera);

    //   camera = xr.getCamera(); // use XR camera for rendering

    // }

    // TODO: work on this
    // if (scene.isScene === true) scene.onBeforeRender(this, scene, camera, this._currentRenderTarget);

    this.currentRenderState = this.renderStates.get(scene, this.renderStateStack.length);
    this.currentRenderState.init(camera);

    this.renderStateStack.push(this.currentRenderState!);

    this._projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    this._frustum.setFromProjectionMatrix(this._projScreenMatrix, WebGLCoordinateSystem, camera.reversedDepth);

    this._localClippingEnabled = this.localClippingEnabled;
    this._clippingEnabled = this.clipping.init(this.clippingPlanes, this._localClippingEnabled);

    this.currentRenderList = this.renderLists.get(scene, this.renderListStack.length);
    this.currentRenderList.init();

    this.renderListStack.push(this.currentRenderList!);

    // if (xr.enabled === true && xr.isPresenting === true) {

    //   const depthSensingMesh = _this.xr.getDepthSensingMesh();

    //   if (depthSensingMesh !== null) {

    //     projectObject(depthSensingMesh, camera, - Infinity, _this.sortObjects);

    //   }

    // }

    this.projectObject(scene, camera, 0, this.sortObjects);

    this.currentRenderList.finish();

    if (this.sortObjects === true) {

      this.currentRenderList.sort(this._opaqueSort, this._transparentSort);

    }

    // _renderBackground = xr.enabled === false || xr.isPresenting === false || xr.hasDepthSensing() === false;
    // if (_renderBackground) {

    //   background.addToRenderList(currentRenderList, scene);

    // }

    //

    this.info.render.frame++;

    if (this._clippingEnabled === true) this.clipping.beginShadows();

    const shadowsArray = this.currentRenderState.state.shadowsArray;
    this.shadowMap.render(shadowsArray, scene, camera);

    if (this._clippingEnabled === true) this.clipping.endShadows();

    //

    if (this.info.autoReset === true) this.info.reset();

    // render scene

    const opaqueObjects = this.currentRenderList?.opaque;
    const transmissiveObjects = this.currentRenderList?.transmissive ?? [];

    this.currentRenderState?.setupLights();

    if (/* 'isArrayCamera' in camera */ isArrayCamera(camera)) {

      const cameras = camera.cameras;

      if (transmissiveObjects.length > 0) {

        for (let i = 0, l = cameras.length; i < l; i++) {

          const camera2 = cameras[i];

          this.renderTransmissionPass(opaqueObjects, transmissiveObjects, scene, camera2);

        }

      }

      if (this._renderBackground) this.background.render(scene);

      for (let i = 0, l = cameras.length; i < l; i++) {

        const camera2 = cameras[i];

        // Cameras don't have a viewport property
        this.renderScene(this.currentRenderList, scene, camera2, /* camera2.viewport */);

      }

    } else {

      if (transmissiveObjects.length > 0) this.renderTransmissionPass(opaqueObjects, transmissiveObjects, scene, camera);

      if (this._renderBackground) this.background.render(scene);

      this.renderScene(this.currentRenderList, scene, camera);

    }

    //

    if (this._currentRenderTarget !== null && this._currentActiveMipmapLevel === 0) {

      // resolve multisample renderbuffers to a single-sample texture if necessary

      this.textures.updateMultisampleRenderTarget(this._currentRenderTarget);

      // Generate mipmap if we're using any kind of mipmap filtering

      this.textures.updateRenderTargetMipmap(this._currentRenderTarget);

    }

    // TODO: work on this
    // if (scene.isScene === true) scene.onAfterRender(this, scene, camera);

    // _gl.finish();

    this.bindingStates.resetDefaultState();
    this._currentMaterialId = - 1;
    this._currentCamera = null;

    this.renderStateStack.pop();

    if (this.renderStateStack.length > 0) {

      this.currentRenderState = this.renderStateStack[this.renderStateStack.length - 1];

      if (this._clippingEnabled === true) {

        this.clipping.setGlobalState(this.clippingPlanes, this.currentRenderState.state.camera!);
      }

    } else {

      this.currentRenderState = null;

    }

    this.renderListStack.pop();

    if (this.renderListStack.length > 0) {

      this.currentRenderList = this.renderListStack[this.renderListStack.length - 1];

    } else {

      this.currentRenderList = null;

    }

  };

  // TODO: type well
  public projectObject(
    object: any,
    camera: Camera,
    groupOrder: any,
    sortObjects: any
  ) {

    if (object.visible === false) return;

    const visible = object.layers.test(camera.layers);

    if (visible) {

      if (object.isGroup) {

        groupOrder = object.renderOrder;

      } else if (object.isLOD) {

        if (object.autoUpdate === true) object.update(camera);

      } else if (object.isLight) {

        this.currentRenderState!.pushLight(object);

        if (object.castShadow) {

          this.currentRenderState!.pushShadow(object);

        }

      } else if (object.isSprite) {

        if (!object.frustumCulled || this._frustum.intersectsSprite(object)) {

          if (sortObjects) {

            this._vector4.setFromMatrixPosition(object.matrixWorld)
              .applyMatrix4(this._projScreenMatrix);

          }

          const geometry = this.objects.update(object);
          const material = object.material;

          if (material.visible) {

            this.currentRenderList!.push(object, geometry, material, groupOrder, this._vector4.z, null);

          }

        }

      } else if (object.isMesh || object.isLine || object.isPoints) {

        if (!object.frustumCulled || this._frustum.intersectsObject(object)) {

          const geometry = this.objects.update(object);
          const material = object.material;

          if (sortObjects) {

            if (object.boundingSphere !== undefined) {

              if (object.boundingSphere === null) object.computeBoundingSphere();
              this._vector4.copy(object.boundingSphere.center);

            } else {

              if (geometry.boundingSphere === null) geometry.computeBoundingSphere();
              this._vector4.copy(geometry.boundingSphere!.center);

            }

            this._vector4
              .applyMatrix4(object.matrixWorld)
              .applyMatrix4(this._projScreenMatrix);

          }

          if (Array.isArray(material)) {

            const groups = geometry.groups;

            for (let i = 0, l = groups.length; i < l; i++) {

              const group = groups[i];
              const groupMaterial = material[group.materialIndex!];

              if (groupMaterial && groupMaterial.visible) {

                this.currentRenderList!.push(object, geometry, groupMaterial, groupOrder, this._vector4.z, group);

              }

            }

          } else if (material.visible) {

            this.currentRenderList!.push(object, geometry, material, groupOrder, this._vector4.z, null);

          }

        }

      }

    }

    const children = object.children;

    for (let i = 0, l = children.length; i < l; i++) {

      this.projectObject(children[i], camera, groupOrder, sortObjects);

    }

  }

  // TODO: type well
  public renderScene(
    currentRenderList: any,
    scene: Scene,
    camera: Camera,
    viewport?: any
  ) {

    const opaqueObjects = currentRenderList.opaque;
    const transmissiveObjects = currentRenderList.transmissive;
    const transparentObjects = currentRenderList.transparent;

    this.currentRenderState!.setupLightsView(camera);

    if (this._clippingEnabled === true) this.clipping.setGlobalState(this.clippingPlanes, camera);

    if (viewport) this.state.viewport(this._currentViewport.copy(viewport));

    if (opaqueObjects.length > 0) this.renderObjects(opaqueObjects, scene, camera);
    if (transmissiveObjects.length > 0) this.renderObjects(transmissiveObjects, scene, camera);
    if (transparentObjects.length > 0) this.renderObjects(transparentObjects, scene, camera);

    // Ensure depth buffer writing is enabled so it can be cleared on next render

    this.state.buffers.depth.setTest(true);
    this.state.buffers.depth.setMask(true);
    this.state.buffers.color.setMask(true);

    this.state.setPolygonOffset(false);

  }

  // TODO: type well
  public renderTransmissionPass(
    opaqueObjects: any,
    transmissiveObjects: any,
    scene: any,
    camera: any
  ) {

    const overrideMaterial = scene.isScene === true ? scene.overrideMaterial : null;

    if (overrideMaterial !== null) {

      return;

    }

    if (this.currentRenderState!.state.transmissionRenderTarget[camera.id] === undefined) {

      this.currentRenderState!.state.transmissionRenderTarget[camera.id] = new WebGLRenderTarget(1, 1, {
        generateMipmaps: true,
        type: (this.extensions.has('EXT_color_buffer_half_float') || this.extensions.has('EXT_color_buffer_float')) ? HalfFloatType : UnsignedByteType,
        minFilter: LinearMipmapLinearFilter,
        samples: 4,
        stencilBuffer: this.stencil,
        resolveDepthBuffer: false,
        resolveStencilBuffer: false,
        colorSpace: this.cm.workingColorSpace,
      });

      // debug

      /*
      const geometry = new PlaneGeometry();
      const material = new MeshBasicMaterial( { map: _transmissionRenderTarget.texture } );

      const mesh = new Mesh( geometry, material );
      scene.add( mesh );
      */

    }

    const transmissionRenderTarget = this.currentRenderState!.state.transmissionRenderTarget[camera.id];

    const activeViewport = camera.viewport || this._currentViewport;
    transmissionRenderTarget.setSize(activeViewport.z * this.transmissionResolutionScale, activeViewport.w * this.transmissionResolutionScale);

    //

    const currentRenderTarget = this.getRenderTarget();
    const currentActiveCubeFace = this.getActiveCubeFace();
    const currentActiveMipmapLevel = this.getActiveMipmapLevel();

    this.setRenderTarget(transmissionRenderTarget);

    this.getClearColor(this._currentClearColor);
    this._currentClearAlpha = this.getClearAlpha();
    if (this._currentClearAlpha < 1) this.setClearColor(new Color(0xffffff), 0.5);

    this.clear();

    if (this._renderBackground) this.background.render(scene);

    // Turn off the features which can affect the frag color for opaque objects pass.
    // Otherwise they are applied twice in opaque objects pass and transmission objects pass.
    const currentToneMapping = this.toneMapping;
    this.toneMapping = NoToneMapping;

    // Remove viewport from camera to avoid nested render calls resetting viewport to it (e.g Reflector).
    // Transmission render pass requires viewport to match the transmissionRenderTarget.
    const currentCameraViewport = camera.viewport;
    if (camera.viewport !== undefined) camera.viewport = undefined;

    this.currentRenderState!.setupLightsView(camera);

    if (this._clippingEnabled === true) this.clipping.setGlobalState(this.clippingPlanes, camera);

    this.renderObjects(opaqueObjects, scene, camera);

    this.textures.updateMultisampleRenderTarget(transmissionRenderTarget);
    this.textures.updateRenderTargetMipmap(transmissionRenderTarget);

    if (this.extensions.has('WEBGL_multisampled_render_to_texture') === false) { // see #28131

      let renderTargetNeedsUpdate = false;

      for (let i = 0, l = transmissiveObjects.length; i < l; i++) {

        const renderItem = transmissiveObjects[i];

        const object = renderItem.object;
        const geometry = renderItem.geometry;
        const material = renderItem.material;
        const group = renderItem.group;

        if (material.side === DoubleSide && object.layers.test(camera.layers)) {

          const currentSide = material.side;

          material.side = BackSide;
          material.needsUpdate = true;

          this.renderObject(object, scene, camera, geometry, material, group);

          material.side = currentSide;
          material.needsUpdate = true;

          renderTargetNeedsUpdate = true;

        }

      }

      if (renderTargetNeedsUpdate === true) {

        this.textures.updateMultisampleRenderTarget(transmissionRenderTarget);
        this.textures.updateRenderTargetMipmap(transmissionRenderTarget);

      }

    }

    this.setRenderTarget(currentRenderTarget, currentActiveCubeFace, currentActiveMipmapLevel);

    this.setClearColor(this._currentClearColor, this._currentClearAlpha);

    if (currentCameraViewport !== undefined) camera.viewport = currentCameraViewport;

    this.toneMapping = currentToneMapping;

  }

  // TODO: type well
  public renderObjects(
    renderList: any,
    scene: any,
    camera: any
  ) {

    const overrideMaterial = scene.isScene === true ? scene.overrideMaterial : null;

    for (let i = 0, l = renderList.length; i < l; i++) {

      const renderItem = renderList[i];

      const object = renderItem.object;
      const geometry = renderItem.geometry;
      const group = renderItem.group;
      let material = renderItem.material;

      if (material.allowOverride === true && overrideMaterial !== null) {

        material = overrideMaterial;

      }

      if (object.layers.test(camera.layers)) {

        this.renderObject(object, scene, camera, geometry, material, group);

      }

    }

  }

  // TODO: type well
  public renderObject(
    object: Node3D,
    scene: Scene,
    camera: Camera,
    geometry: any,
    material: any,
    group: any
  ) {

    object.onBeforeRender(this, scene, camera, geometry, material, group);

    object.modelViewMatrix.multiplyMatrices(camera.matrixWorldInverse, object.matrixWorld);
    object.normalMatrix.getNormalMatrix(object.modelViewMatrix);

    material.onBeforeRender(this, scene, camera, geometry, object, group);

    if (material.transparent === true && material.side === DoubleSide && material.forceSinglePass === false) {

      material.side = BackSide;
      material.needsUpdate = true;
      this.renderBufferDirect(camera, scene, geometry, material, object, group);

      material.side = FrontSide;
      material.needsUpdate = true;
      this.renderBufferDirect(camera, scene, geometry, material, object, group);

      material.side = DoubleSide;

    } else {

      this.renderBufferDirect(camera, scene, geometry, material, object, group);

    }

    object.onAfterRender(this, scene, camera, geometry, material, group);

  }

  public getProgram = (
    material: any,
    scene: any,
    object: any
  ) => {

    if (scene.isScene !== true) scene = this._emptyScene; // scene could be a Mesh, Line, Points, ...

    const materialProperties = this.properties.get(material);

    const lights = this.currentRenderState!.state.lights;
    const shadowsArray = this.currentRenderState!.state.shadowsArray;

    const lightsStateVersion = lights.state.version;

    const parameters = this.programCache.getParameters(material, lights.state, shadowsArray, scene, object);
    const programCacheKey = this.programCache.getProgramCacheKey(parameters);

    let programs = materialProperties.programs;

    // always update environment and fog - changing these trigger an getProgram call, but it's possible that the program doesn't change

    materialProperties.environment = material.isMeshStandardMaterial ? scene.environment : null;
    materialProperties.fog = scene.fog;
    materialProperties.envMap = (material.isMeshStandardMaterial ? this.cubeuvmaps : this.cubemaps).get(material.envMap || materialProperties.environment);
    materialProperties.envMapRotation = (materialProperties.environment !== null && material.envMap === null) ? scene.environmentRotation : material.envMapRotation;

    if (programs === undefined) {

      // new material

      material.addEventListener('dispose', this.onMaterialDispose);

      programs = new Map();
      materialProperties.programs = programs;

    }

    let program = programs.get(programCacheKey);

    if (program !== undefined) {

      // early out if program and light state is identical

      if (materialProperties.currentProgram === program && materialProperties.lightsStateVersion === lightsStateVersion) {

        this.updateCommonMaterialProperties(material, parameters);

        return program;

      }

    } else {

      parameters.uniforms = this.programCache.getUniforms(material);

      material.onBeforeCompile(parameters, this);

      program = this.programCache.acquireProgram(parameters, programCacheKey);
      programs.set(programCacheKey, program);

      materialProperties.uniforms = parameters.uniforms;

    }

    const uniforms = materialProperties.uniforms;

    if ((!material.isShaderMaterial && !material.isRawShaderMaterial) || material.clipping === true) {

      uniforms.clippingPlanes = this.clipping.uniform;

    }

    this.updateCommonMaterialProperties(material, parameters);

    // store the light setup it was created for

    materialProperties.needsLights = this.materialNeedsLights(material);
    materialProperties.lightsStateVersion = lightsStateVersion;

    if (materialProperties.needsLights) {

      // wire up the material to this renderer's lighting state

      uniforms.ambientLightColor.value = lights.state.ambient;
      uniforms.lightProbe.value = lights.state.probe;
      uniforms.directionalLights.value = lights.state.directional;
      uniforms.directionalLightShadows.value = lights.state.directionalShadow;
      uniforms.spotLights.value = lights.state.spot;
      uniforms.spotLightShadows.value = lights.state.spotShadow;
      uniforms.rectAreaLights.value = lights.state.rectArea;
      uniforms.ltc_1.value = lights.state.rectAreaLTC1;
      uniforms.ltc_2.value = lights.state.rectAreaLTC2;
      uniforms.pointLights.value = lights.state.point;
      uniforms.pointLightShadows.value = lights.state.pointShadow;
      uniforms.hemisphereLights.value = lights.state.hemi;

      uniforms.directionalShadowMap.value = lights.state.directionalShadowMap;
      uniforms.directionalShadowMatrix.value = lights.state.directionalShadowMatrix;
      uniforms.spotShadowMap.value = lights.state.spotShadowMap;
      uniforms.spotLightMatrix.value = lights.state.spotLightMatrix;
      uniforms.spotLightMap.value = lights.state.spotLightMap;
      uniforms.pointShadowMap.value = lights.state.pointShadowMap;
      uniforms.pointShadowMatrix.value = lights.state.pointShadowMatrix;
      // TODO (abelnation): add area lights shadow info to uniforms

    }

    materialProperties.currentProgram = program;
    materialProperties.uniformsList = null;

    return program;

  }

  // TODO: type well
  public getUniformList(materialProperties: any) {

    if (materialProperties.uniformsList === null) {

      const progUniforms = materialProperties.currentProgram.getUniforms();
      materialProperties.uniformsList = WebGLUniforms.seqWithValue(progUniforms.seq, materialProperties.uniforms);

    }

    return materialProperties.uniformsList;

  }

  // TODO: type well
  public updateCommonMaterialProperties(material: any, parameters: any) {

    const materialProperties = this.properties.get(material);

    materialProperties.outputColorSpace = parameters.outputColorSpace;
    materialProperties.batching = parameters.batching;
    materialProperties.batchingColor = parameters.batchingColor;
    materialProperties.instancing = parameters.instancing;
    materialProperties.instancingColor = parameters.instancingColor;
    materialProperties.instancingMorph = parameters.instancingMorph;
    materialProperties.skinning = parameters.skinning;
    materialProperties.morphTargets = parameters.morphTargets;
    materialProperties.morphNormals = parameters.morphNormals;
    materialProperties.morphColors = parameters.morphColors;
    materialProperties.morphTargetsCount = parameters.morphTargetsCount;
    materialProperties.numClippingPlanes = parameters.numClippingPlanes;
    materialProperties.numIntersection = parameters.numClipIntersection;
    materialProperties.vertexAlphas = parameters.vertexAlphas;
    materialProperties.vertexTangents = parameters.vertexTangents;
    materialProperties.toneMapping = parameters.toneMapping;

  }

  // TODO: type well
  public setProgram(
    camera: any,
    scene: any,
    geometry: any,
    material: any,
    object: any
  ) {

    if (scene.isScene !== true) scene = this._emptyScene; // scene could be a Mesh, Line, Points, ...

    this.textures.resetTextureUnits();

    const fog = scene.fog;
    const environment = material.isMeshStandardMaterial ? scene.environment : null;
    // const colorSpace = (this._currentRenderTarget === null) ? this.outputColorSpace : (this._currentRenderTarget.isXRRenderTarget === true ? this._currentRenderTarget.texture.colorSpace : LinearSRGBColorSpace);
    const colorSpace =
      this._currentRenderTarget === null
        ? this.outputColorSpace
        : LinearSRGBColorSpace;

    const envMap = (material.isMeshStandardMaterial ? this.cubeuvmaps : this.cubemaps).get(material.envMap || environment);
    const vertexAlphas = material.vertexColors === true && !!geometry.attributes.color && geometry.attributes.color.itemSize === 4;
    const vertexTangents = !!geometry.attributes.tangent && (!!material.normalMap || material.anisotropy > 0);
    const morphTargets = !!geometry.morphAttributes.position;
    const morphNormals = !!geometry.morphAttributes.normal;
    const morphColors = !!geometry.morphAttributes.color;

    let toneMapping = NoToneMapping;

    if (material.toneMapped) {

      if (this._currentRenderTarget === null /* || this._currentRenderTarget.isXRRenderTarget === true */) {

        toneMapping = this.toneMapping;

      }

    }

    const morphAttribute = geometry.morphAttributes.position || geometry.morphAttributes.normal || geometry.morphAttributes.color;
    const morphTargetsCount = (morphAttribute !== undefined) ? morphAttribute.length : 0;

    const materialProperties = this.properties.get(material);
    const lights = this.currentRenderState!.state.lights;

    if (this._clippingEnabled === true) {

      if (this._localClippingEnabled === true || camera !== this._currentCamera) {

        const useCache =
          camera === this._currentCamera &&
          material.id === this._currentMaterialId;

        // we might want to call this function with some ClippingGroup
        // object instead of the material, once it becomes feasible
        // (#8465, #8379)
        this.clipping.setState(material, camera, useCache);

      }

    }

    let needsProgramChange = false;

    if (material.version === materialProperties.__version) {

      if (materialProperties.needsLights && (materialProperties.lightsStateVersion !== lights.state.version)) {

        needsProgramChange = true;

      } else if (materialProperties.outputColorSpace !== colorSpace) {

        needsProgramChange = true;

      } else if (object.isBatchedMesh && materialProperties.batching === false) {

        needsProgramChange = true;

      } else if (!object.isBatchedMesh && materialProperties.batching === true) {

        needsProgramChange = true;

      } else if (object.isBatchedMesh && materialProperties.batchingColor === true && object.colorTexture === null) {

        needsProgramChange = true;

      } else if (object.isBatchedMesh && materialProperties.batchingColor === false && object.colorTexture !== null) {

        needsProgramChange = true;

      } else if (object.isInstancedMesh && materialProperties.instancing === false) {

        needsProgramChange = true;

      } else if (!object.isInstancedMesh && materialProperties.instancing === true) {

        needsProgramChange = true;

      } else if (object.isSkinnedMesh && materialProperties.skinning === false) {

        needsProgramChange = true;

      } else if (!object.isSkinnedMesh && materialProperties.skinning === true) {

        needsProgramChange = true;

      } else if (object.isInstancedMesh && materialProperties.instancingColor === true && object.instanceColor === null) {

        needsProgramChange = true;

      } else if (object.isInstancedMesh && materialProperties.instancingColor === false && object.instanceColor !== null) {

        needsProgramChange = true;

      } else if (object.isInstancedMesh && materialProperties.instancingMorph === true && object.morphTexture === null) {

        needsProgramChange = true;

      } else if (object.isInstancedMesh && materialProperties.instancingMorph === false && object.morphTexture !== null) {

        needsProgramChange = true;

      } else if (materialProperties.envMap !== envMap) {

        needsProgramChange = true;

      } else if (material.fog === true && materialProperties.fog !== fog) {

        needsProgramChange = true;

      } else if (materialProperties.numClippingPlanes !== undefined &&
        (materialProperties.numClippingPlanes !== this.clipping.numPlanes ||
          materialProperties.numIntersection !== this.clipping.numIntersection)) {

        needsProgramChange = true;

      } else if (materialProperties.vertexAlphas !== vertexAlphas) {

        needsProgramChange = true;

      } else if (materialProperties.vertexTangents !== vertexTangents) {

        needsProgramChange = true;

      } else if (materialProperties.morphTargets !== morphTargets) {

        needsProgramChange = true;

      } else if (materialProperties.morphNormals !== morphNormals) {

        needsProgramChange = true;

      } else if (materialProperties.morphColors !== morphColors) {

        needsProgramChange = true;

      } else if (materialProperties.toneMapping !== toneMapping) {

        needsProgramChange = true;

      } else if (materialProperties.morphTargetsCount !== morphTargetsCount) {

        needsProgramChange = true;

      }

    } else {

      needsProgramChange = true;
      materialProperties.__version = material.version;

    }

    //

    let program = materialProperties.currentProgram;

    if (needsProgramChange === true) {

      program = this.getProgram(material, scene, object);

    }

    let refreshProgram = false;
    let refreshMaterial = false;
    let refreshLights = false;

    const p_uniforms = program.getUniforms(),
      m_uniforms = materialProperties.uniforms;

    if (this.state.useProgram(program.program)) {

      refreshProgram = true;
      refreshMaterial = true;
      refreshLights = true;

    }

    if (material.id !== this._currentMaterialId) {

      this._currentMaterialId = material.id;

      refreshMaterial = true;

    }

    if (refreshProgram || this._currentCamera !== camera) {

      // common camera uniforms

      const reversedDepthBuffer = this.state.buffers.depth.getReversed();

      if (reversedDepthBuffer && camera.reversedDepth !== true) {

        camera._reversedDepth = true;
        camera.updateProjectionMatrix();

      }

      p_uniforms.setValue(this._gl, 'projectionMatrix', camera.projectionMatrix);

      p_uniforms.setValue(this._gl, 'viewMatrix', camera.matrixWorldInverse);

      const uCamPos = p_uniforms.map.cameraPosition;

      if (uCamPos !== undefined) {

        uCamPos.setValue(this._gl, this._vector3.setFromMatrixPosition(camera.matrixWorld));

      }

      if (this.capabilities.logarithmicDepthBuffer) {

        p_uniforms.setValue(this._gl, 'logDepthBufFC',
          2.0 / (Math.log(camera.far + 1.0) / Math.LN2));

      }

      // consider moving isOrthographic to UniformLib and WebGLMaterials, see https://github.com/mrdoob/three.js/pull/26467#issuecomment-1645185067

      if (material.isMeshPhongMaterial ||
        material.isMeshToonMaterial ||
        material.isMeshLambertMaterial ||
        material.isMeshBasicMaterial ||
        material.isMeshStandardMaterial ||
        material.isShaderMaterial) {

        p_uniforms.setValue(this._gl, 'isOrthographic', camera.isOrthographicCamera === true);

      }

      if (this._currentCamera !== camera) {

        this._currentCamera = camera;

        // lighting uniforms depend on the camera so enforce an update
        // now, in case this material supports lights - or later, when
        // the next material that does gets activated:

        refreshMaterial = true;		// set to true on material change
        refreshLights = true;		// remains set until update done

      }

    }

    // skinning and morph target uniforms must be set even if material didn't change
    // auto-setting of texture unit for bone and morph texture must go before other textures
    // otherwise textures used for skinning and morphing can take over texture units reserved for other material textures

    if (object.isSkinnedMesh) {

      p_uniforms.setOptional(this._gl, object, 'bindMatrix');
      p_uniforms.setOptional(this._gl, object, 'bindMatrixInverse');

      const skeleton = object.skeleton;

      if (skeleton) {

        if (skeleton.boneTexture === null) skeleton.computeBoneTexture();

        p_uniforms.setValue(this._gl, 'boneTexture', skeleton.boneTexture, this.textures);

      }

    }

    if (object.isBatchedMesh) {

      p_uniforms.setOptional(this._gl, object, 'batchingTexture');
      p_uniforms.setValue(this._gl, 'batchingTexture', object._matricesTexture, this.textures);

      p_uniforms.setOptional(this._gl, object, 'batchingIdTexture');
      p_uniforms.setValue(this._gl, 'batchingIdTexture', object._indirectTexture, this.textures);

      p_uniforms.setOptional(this._gl, object, 'batchingColorTexture');
      if (object._colorsTexture !== null) {

        p_uniforms.setValue(this._gl, 'batchingColorTexture', object._colorsTexture, this.textures);

      }

    }

    const morphAttributes = geometry.morphAttributes;

    if (morphAttributes.position !== undefined || morphAttributes.normal !== undefined || (morphAttributes.color !== undefined)) {

      this.morphtargets.update(object, geometry, program);

    }

    if (refreshMaterial || materialProperties.receiveShadow !== object.receiveShadow) {

      materialProperties.receiveShadow = object.receiveShadow;
      p_uniforms.setValue(this._gl, 'receiveShadow', object.receiveShadow);

    }

    // https://github.com/mrdoob/three.js/pull/24467#issuecomment-1209031512

    if (material.isMeshGouraudMaterial && material.envMap !== null) {

      m_uniforms.envMap.value = envMap;

      m_uniforms.flipEnvMap.value = (envMap.isCubeTexture && envMap.isRenderTargetTexture === false) ? - 1 : 1;

    }

    if (material.isMeshStandardMaterial && material.envMap === null && scene.environment !== null) {

      m_uniforms.envMapIntensity.value = scene.environmentIntensity;

    }

    if (refreshMaterial) {

      p_uniforms.setValue(this._gl, 'toneMappingExposure', this.toneMappingExposure);

      if (materialProperties.needsLights) {

        // the current material requires lighting info

        // note: all lighting uniforms are always set correctly
        // they simply reference the renderer's state for their
        // values
        //
        // use the current material's .needsUpdate flags to set
        // the GL state when required

        this.markUniformsLightsNeedsUpdate(m_uniforms, refreshLights);

      }

      // refresh uniforms common to several materials

      if (fog && material.fog === true) {

        this.materials.refreshFogUniforms(m_uniforms, fog);

      }

      this.materials.refreshMaterialUniforms(m_uniforms, material, this._pixelRatio, this._height, this.currentRenderState!.state.transmissionRenderTarget[camera.id]);

      WebGLUniforms.upload(this._gl, this.getUniformList(materialProperties), m_uniforms, this.textures);

    }

    if (material.isShaderMaterial && material.uniformsNeedUpdate === true) {

      WebGLUniforms.upload(this._gl, this.getUniformList(materialProperties), m_uniforms, this.textures);
      material.uniformsNeedUpdate = false;

    }

    if (material.isSpriteMaterial) {

      p_uniforms.setValue(this._gl, 'center', object.center);

    }

    // common matrices

    p_uniforms.setValue(this._gl, 'modelViewMatrix', object.modelViewMatrix);
    p_uniforms.setValue(this._gl, 'normalMatrix', object.normalMatrix);
    p_uniforms.setValue(this._gl, 'modelMatrix', object.matrixWorld);

    // UBOs

    if (material.isShaderMaterial || material.isRawShaderMaterial) {

      const groups = material.uniformsGroups;

      for (let i = 0, l = groups.length; i < l; i++) {

        const group = groups[i];

        this.uniformsGroups.update(group, program);
        this.uniformsGroups.bind(group, program);

      }

    }

    return program;

  }

  // If uniforms are marked as clean, they don't need to be loaded to the GPU.

  public markUniformsLightsNeedsUpdate(uniforms: any, value: any) { // TODO: type well

    uniforms.ambientLightColor.needsUpdate = value;
    uniforms.lightProbe.needsUpdate = value;

    uniforms.directionalLights.needsUpdate = value;
    uniforms.directionalLightShadows.needsUpdate = value;
    uniforms.pointLights.needsUpdate = value;
    uniforms.pointLightShadows.needsUpdate = value;
    uniforms.spotLights.needsUpdate = value;
    uniforms.spotLightShadows.needsUpdate = value;
    uniforms.rectAreaLights.needsUpdate = value;
    uniforms.hemisphereLights.needsUpdate = value;

  }

  public materialNeedsLights(material: any) {  // TODO: type well

    return material.isMeshLambertMaterial || material.isMeshToonMaterial || material.isMeshPhongMaterial ||
      material.isMeshStandardMaterial || material.isShadowMaterial ||
      (material.isShaderMaterial && material.lights === true);

  }

  /**
   * Returns the active cube face.
   *
   * @return {number} The active cube face.
   */
  public getActiveCubeFace(): number {

    return this._currentActiveCubeFace;

  };

  /**
   * Returns the active mipmap level.
   *
   * @return {number} The active mipmap level.
   */
  public getActiveMipmapLevel(): number {

    return this._currentActiveMipmapLevel;

  };

  /**
   * Returns the active render target.
   *
   * @return {?WebGLRenderTarget} The active render target. Returns `null` if no render target
   * is currently set.
   */
  public getRenderTarget(): WebGLRenderTarget | null {

    return this._currentRenderTarget;

  };

  // TODO: type well
  public setRenderTargetTextures(
    renderTarget: any,
    colorTexture: any,
    depthTexture: any
  ) {

    const renderTargetProperties = this.properties.get(renderTarget);

    renderTargetProperties.__autoAllocateDepthBuffer = renderTarget.resolveDepthBuffer === false;
    if (renderTargetProperties.__autoAllocateDepthBuffer === false) {

      // The multisample_render_to_texture extension doesn't work properly if there
      // are midframe flushes and an external depth buffer. Disable use of the extension.
      renderTargetProperties.__useRenderToTexture = false;

    }

    this.properties.get(renderTarget.texture).__webglTexture = colorTexture;
    this.properties.get(renderTarget.depthTexture).__webglTexture = renderTargetProperties.__autoAllocateDepthBuffer ? undefined : depthTexture;

    renderTargetProperties.__hasExternalTextures = true;

  };

  // TODO: type well
  public setRenderTargetFramebuffer(
    renderTarget: any,
    defaultFramebuffer: any
  ) {

    const renderTargetProperties = this.properties.get(renderTarget);
    renderTargetProperties.__webglFramebuffer = defaultFramebuffer;
    renderTargetProperties.__useDefaultFramebuffer = defaultFramebuffer === undefined;

  };


  /**
   * Sets the active rendertarget.
   *
   * @param {?WebGLRenderTarget} renderTarget - The render target to set. When `null` is given,
   * the canvas is set as the active render target instead.
   * @param {number} [activeCubeFace=0] - The active cube face when using a cube render target.
   * Indicates the z layer to render in to when using 3D or array render targets.
   * @param {number} [activeMipmapLevel=0] - The active mipmap level.
   */
  public setRenderTarget(
    renderTarget: any,  // TODO: type well
    activeCubeFace = 0,
    activeMipmapLevel = 0
  ): void {

    this._currentRenderTarget = renderTarget;
    this._currentActiveCubeFace = activeCubeFace;
    this._currentActiveMipmapLevel = activeMipmapLevel;

    let useDefaultFramebuffer = true;
    let framebuffer = null;
    let isCube = false;
    let isRenderTarget3D = false;

    if (renderTarget) {

      const renderTargetProperties = this.properties.get(renderTarget);

      if (renderTargetProperties.__useDefaultFramebuffer !== undefined) {

        // We need to make sure to rebind the framebuffer.
        this.state.bindFramebuffer(this._gl.FRAMEBUFFER, null);
        useDefaultFramebuffer = false;

      } else if (renderTargetProperties.__webglFramebuffer === undefined) {

        this.textures.setupRenderTarget(renderTarget);

      } else if (renderTargetProperties.__hasExternalTextures) {

        // Color and depth texture must be rebound in order for the swapchain to update.
        this.textures.rebindTextures(renderTarget, this.properties.get(renderTarget.texture).__webglTexture, this.properties.get(renderTarget.depthTexture).__webglTexture);

      } else if (renderTarget.depthBuffer) {

        // check if the depth texture is already bound to the frame buffer and that it's been initialized
        const depthTexture = renderTarget.depthTexture;
        if (renderTargetProperties.__boundDepthTexture !== depthTexture) {

          // check if the depth texture is compatible
          if (
            depthTexture !== null &&
            this.properties.has(depthTexture) &&
            (renderTarget.width !== depthTexture.image.width || renderTarget.height !== depthTexture.image.height)
          ) {

            throw new Error('WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.');

          }

          // Swap the depth buffer to the currently attached one
          this.textures.setupDepthRenderbuffer(renderTarget);

        }

      }

      const texture = renderTarget.texture;

      if (texture.isData3DTexture || texture.isDataArrayTexture || texture.isCompressedArrayTexture) {

        isRenderTarget3D = true;

      }

      const __webglFramebuffer = this.properties.get(renderTarget).__webglFramebuffer;

      if (renderTarget.isWebGLCubeRenderTarget) {

        if (Array.isArray(__webglFramebuffer[activeCubeFace])) {

          framebuffer = __webglFramebuffer[activeCubeFace][activeMipmapLevel];

        } else {

          framebuffer = __webglFramebuffer[activeCubeFace];

        }

        isCube = true;

      } else if ((renderTarget.samples > 0) && this.textures.useMultisampledRTT(renderTarget) === false) {

        framebuffer = this.properties.get(renderTarget).__webglMultisampledFramebuffer;

      } else {

        if (Array.isArray(__webglFramebuffer)) {

          framebuffer = __webglFramebuffer[activeMipmapLevel];

        } else {

          framebuffer = __webglFramebuffer;

        }

      }

      this._currentViewport.copy(renderTarget.viewport);
      this._currentScissor.copy(renderTarget.scissor);
      this._currentScissorTest = renderTarget.scissorTest;

    } else {

      this._currentViewport.copy(this._viewport).multiplyScalar(this._pixelRatio).floor();
      this._currentScissor.copy(this._scissor).multiplyScalar(this._pixelRatio).floor();
      this._currentScissorTest = this._scissorTest;

    }

    // Use a scratch frame buffer if rendering to a mip level to avoid depth buffers
    // being bound that are different sizes.
    if (activeMipmapLevel !== 0) {

      framebuffer = this._scratchFrameBuffer;

    }

    const framebufferBound = this.state.bindFramebuffer(this._gl.FRAMEBUFFER, framebuffer);

    if (framebufferBound && useDefaultFramebuffer) {

      this.state.drawBuffers(renderTarget, framebuffer);

    }

    this.state.viewport(this._currentViewport);
    this.state.scissor(this._currentScissor);
    this.state.setScissorTest(this._currentScissorTest);

    if (isCube) {

      const textureProperties = this.properties.get(renderTarget.texture);
      this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_CUBE_MAP_POSITIVE_X + activeCubeFace, textureProperties.__webglTexture, activeMipmapLevel);

    } else if (isRenderTarget3D) {

      const layer = activeCubeFace;

      for (let i = 0; i < renderTarget.textures.length; i++) {

        const textureProperties = this.properties.get(renderTarget.textures[i]);

        this._gl.framebufferTextureLayer(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0 + i, textureProperties.__webglTexture, activeMipmapLevel, layer);

      }

    } else if (renderTarget !== null && activeMipmapLevel !== 0) {

      // Only bind the frame buffer if we are using a scratch frame buffer to render to a mipmap.
      // If we rebind the texture when using a multi sample buffer then an error about inconsistent samples will be thrown.
      const textureProperties = this.properties.get(renderTarget.texture);
      this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_2D, textureProperties.__webglTexture, activeMipmapLevel);

    }

    this._currentMaterialId = - 1; // reset current material to ensure correct uniform bindings

  };

  /**
   * Reads the pixel data from the given render target into the given buffer.
   *
   * @param {WebGLRenderTarget} renderTarget - The render target to read from.
   * @param {number} x - The `x` coordinate of the copy region's origin.
   * @param {number} y - The `y` coordinate of the copy region's origin.
   * @param {number} width - The width of the copy region.
   * @param {number} height - The height of the copy region.
   * @param {TypedArray} buffer - The result buffer.
   * @param {number} [activeCubeFaceIndex] - The active cube face index.
   * @param {number} [textureIndex=0] - The texture index of an MRT render target.
   */
  public readRenderTargetPixels(
    renderTarget: WebGLRenderTarget,
    x: number,
    y: number,
    width: number,
    height: number,
    buffer: AnyTypedArray,
    activeCubeFaceIndex: number,
    textureIndex = 0
  ) {

    if (!(renderTarget && renderTarget.isWebGLRenderTarget)) {

      console.error('WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.');
      return;

    }

    let framebuffer = this.properties.get(renderTarget).__webglFramebuffer;

    if ('isWebGLCubeRenderTarget' in renderTarget && activeCubeFaceIndex !== undefined) {

      framebuffer = framebuffer[activeCubeFaceIndex];

    }

    if (framebuffer) {

      this.state.bindFramebuffer(this._gl.FRAMEBUFFER, framebuffer);

      try {

        const texture = renderTarget.textures[textureIndex];
        const textureFormat = texture.format;
        const textureType = texture.type;

        if (!this.capabilities.textureFormatReadable(textureFormat)) {

          console.error('WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.');
          return;

        }

        if (!this.capabilities.textureTypeReadable(textureType)) {

          console.error('WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.');
          return;

        }

        // the following if statement ensures valid read requests (no out-of-bounds pixels, see #8604)

        if ((x >= 0 && x <= (renderTarget.width - width)) && (y >= 0 && y <= (renderTarget.height - height))) {

          // when using MRT, select the correct color buffer for the subsequent read command

          if (renderTarget.textures.length > 1) this._gl.readBuffer(this._gl.COLOR_ATTACHMENT0 + textureIndex);

          const format = this.utils.convert(textureFormat);
          const type = this.utils.convert(textureType);

          if (format === null || type === null) {
            throw new Error(`Unsupported texture format/type: ${textureFormat}, ${textureType}`);
          }

          this._gl.readPixels(x, y, width, height, format, type, buffer);

        }

      } finally {

        // restore framebuffer of current render target if necessary

        const framebuffer = (this._currentRenderTarget !== null) ? this.properties.get(this._currentRenderTarget).__webglFramebuffer : null;
        this.state.bindFramebuffer(this._gl.FRAMEBUFFER, framebuffer);

      }

    }

  };

  /**
   * Asynchronous, non-blocking version of {@link WebGLRenderer#readRenderTargetPixels}.
   *
   * It is recommended to use this version of `readRenderTargetPixels()` whenever possible.
   *
   * @async
   * @param {WebGLRenderTarget} renderTarget - The render target to read from.
   * @param {number} x - The `x` coordinate of the copy region's origin.
   * @param {number} y - The `y` coordinate of the copy region's origin.
   * @param {number} width - The width of the copy region.
   * @param {number} height - The height of the copy region.
   * @param {TypedArray} buffer - The result buffer.
   * @param {number} [activeCubeFaceIndex] - The active cube face index.
   * @param {number} [textureIndex=0] - The texture index of an MRT render target.
   * @return {Promise<TypedArray>} A Promise that resolves when the read has been finished. The resolve provides the read data as a typed array.
   */
  public readRenderTargetPixelsAsync = async (
    renderTarget: WebGLRenderTarget,
    x: number,
    y: number,
    width: number,
    height: number,
    buffer: AnyTypedArray,
    activeCubeFaceIndex: number,
    textureIndex = 0
  ) => {

    if (!(renderTarget && renderTarget.isWebGLRenderTarget)) {

      throw new Error('THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.');

    }

    let framebuffer = this.properties.get(renderTarget).__webglFramebuffer;
    if ('isWebGLCubeRenderTarget' in renderTarget && activeCubeFaceIndex !== undefined) {

      framebuffer = framebuffer[activeCubeFaceIndex];

    }

    if (framebuffer) {

      // the following if statement ensures valid read requests (no out-of-bounds pixels, see #8604)
      if ((x >= 0 && x <= (renderTarget.width - width)) && (y >= 0 && y <= (renderTarget.height - height))) {

        // set the active frame buffer to the one we want to read
        this.state.bindFramebuffer(this._gl.FRAMEBUFFER, framebuffer);

        const texture = renderTarget.textures[textureIndex];
        const textureFormat = texture.format;
        const textureType = texture.type;

        if (!this.capabilities.textureFormatReadable(textureFormat)) {

          throw new Error('THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.');

        }

        if (!this.capabilities.textureTypeReadable(textureType)) {

          throw new Error('WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.');

        }

        const glBuffer = this._gl.createBuffer();
        this._gl.bindBuffer(this._gl.PIXEL_PACK_BUFFER, glBuffer);
        this._gl.bufferData(this._gl.PIXEL_PACK_BUFFER, buffer.byteLength, this._gl.STREAM_READ);

        // when using MRT, select the correct color buffer for the subsequent read command

        if (renderTarget.textures.length > 1) this._gl.readBuffer(this._gl.COLOR_ATTACHMENT0 + textureIndex);

        const format = this.utils.convert(textureFormat);
        const type = this.utils.convert(textureType);

        if (format === null || type === null) {
          throw new Error(`Unsupported texture format/type: ${textureFormat}, ${textureType}`);
        }

        this._gl.readPixels(x, y, width, height, format, type, 0);

        // reset the frame buffer to the currently set buffer before waiting
        const currFramebuffer = this._currentRenderTarget !== null ? this.properties.get(this._currentRenderTarget).__webglFramebuffer : null;
        this.state.bindFramebuffer(this._gl.FRAMEBUFFER, currFramebuffer);

        // check if the commands have finished every 8 ms
        const sync = this._gl.fenceSync(this._gl.SYNC_GPU_COMMANDS_COMPLETE, 0);

        this._gl.flush();


        if (!sync) {
          throw new Error("WebGLRenderer: Failed to create WebGLSync");
        }

        await probeAsync(this._gl, sync, 4);

        // read the data and delete the buffer
        this._gl.bindBuffer(this._gl.PIXEL_PACK_BUFFER, glBuffer);
        this._gl.getBufferSubData(this._gl.PIXEL_PACK_BUFFER, 0, buffer);
        this._gl.deleteBuffer(glBuffer);
        this._gl.deleteSync(sync);

        return buffer;

      } else {

        throw new Error('WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.');

      }

    }

  };

  /**
   * Copies pixels from the current bound framebuffer into the given texture.
   *
   * @param {FramebufferTexture} texture - The texture.
   * @param {?Vector2} [position=null] - The start position of the copy operation.
   * @param {number} [level=0] - The mip level. The default represents the base mip.
   */
  public copyFramebufferToTexture(
    texture: any, // TODO: type well
    position: Vector2 | null = null,
    level = 0
  ) {

    const levelScale = Math.pow(2, - level);
    const width = Math.floor(texture.image.width * levelScale);
    const height = Math.floor(texture.image.height * levelScale);

    const x = position !== null ? position.x : 0;
    const y = position !== null ? position.y : 0;

    this.textures.setTexture2D(texture, 0);

    this._gl.copyTexSubImage2D(this._gl.TEXTURE_2D, level, 0, 0, x, y, width, height);

    this.state.unbindTexture();

  };

  /**
   * Copies data of the given source texture into a destination texture.
   *
   * When using render target textures as `srcTexture` and `dstTexture`, you must make sure both render targets are initialized
   * {@link WebGLRenderer#initRenderTarget}.
   *
   * @param {Texture} srcTexture - The source texture.
   * @param {Texture} dstTexture - The destination texture.
   * @param {?(Box2|Box3)} [srcRegion=null] - A bounding box which describes the source region. Can be two or three-dimensional.
   * @param {?(Vector2|Vector3)} [dstPosition=null] - A vector that represents the origin of the destination region. Can be two or three-dimensional.
   * @param {number} [srcLevel=0] - The source mipmap level to copy.
   * @param {?number} [dstLevel=null] - The destination mipmap level.
   */
  public copyTextureToTexture(
    srcTexture: Texture, // TODO: type well
    dstTexture: Texture,
    srcRegion: any = null,
    dstPosition: any = null,
    srcLevel = 0,
    dstLevel = 0
  ) {

    // support the previous signature with just a single dst mipmap level
    // if (dstLevel === null) {

    //   if (srcLevel !== 0) {

    //     // @deprecated, r171
    //     warnOnce('WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels.');
    //     dstLevel = srcLevel;
    //     srcLevel = 0;

    //   } else {

    //     dstLevel = 0;

    //   }

    // }

    // gather the necessary dimensions to copy
    let width, height, depth, minX, minY, minZ;
    let dstX, dstY, dstZ;
    const image = srcTexture.isCompressedTexture ? srcTexture.mipmaps[dstLevel] : srcTexture.image;
    if (srcRegion !== null) {

      width = srcRegion.max.x - srcRegion.min.x;
      height = srcRegion.max.y - srcRegion.min.y;
      depth = srcRegion.isBox3 ? srcRegion.max.z - srcRegion.min.z : 1;
      minX = srcRegion.min.x;
      minY = srcRegion.min.y;
      minZ = srcRegion.isBox3 ? srcRegion.min.z : 0;

    } else {

      const levelScale = Math.pow(2, - srcLevel);
      width = Math.floor(image.width * levelScale);
      height = Math.floor(image.height * levelScale);
      if (srcTexture.isDataArrayTexture) {

        depth = image.depth;

      } else if (srcTexture.isData3DTexture) {

        depth = Math.floor(image.depth * levelScale);

      } else {

        depth = 1;

      }

      minX = 0;
      minY = 0;
      minZ = 0;

    }

    if (dstPosition !== null) {

      dstX = dstPosition.x;
      dstY = dstPosition.y;
      dstZ = dstPosition.z;

    } else {

      dstX = 0;
      dstY = 0;
      dstZ = 0;

    }

    // Set up the destination target
    const glFormat = this.utils.convert(dstTexture.format);
    const glType = this.utils.convert(dstTexture.type);

    if (glFormat === null || glType === null) {
      console.log('Unsupported gl texture format or type', { glFormat, glType });
      throw new Error("Unsupported texture format or type for this platform");
    }

    let glTarget;

    if (dstTexture.isData3DTexture) {

      this.textures.setTexture3D(dstTexture, 0);
      glTarget = this._gl.TEXTURE_3D;

    } else if (dstTexture.isDataArrayTexture || dstTexture.isCompressedArrayTexture) {

      this.textures.setTexture2DArray(dstTexture, 0);
      glTarget = this._gl.TEXTURE_2D_ARRAY;

    } else {

      this.textures.setTexture2D(dstTexture, 0);
      glTarget = this._gl.TEXTURE_2D;

    }

    this._gl.pixelStorei(this._gl.UNPACK_FLIP_Y_WEBGL, dstTexture.flipY);
    this._gl.pixelStorei(this._gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, dstTexture.premultiplyAlpha);
    this._gl.pixelStorei(this._gl.UNPACK_ALIGNMENT, dstTexture.unpackAlignment);

    // used for copying data from cpu
    const currentUnpackRowLen = this._gl.getParameter(this._gl.UNPACK_ROW_LENGTH);
    const currentUnpackImageHeight = this._gl.getParameter(this._gl.UNPACK_IMAGE_HEIGHT);
    const currentUnpackSkipPixels = this._gl.getParameter(this._gl.UNPACK_SKIP_PIXELS);
    const currentUnpackSkipRows = this._gl.getParameter(this._gl.UNPACK_SKIP_ROWS);
    const currentUnpackSkipImages = this._gl.getParameter(this._gl.UNPACK_SKIP_IMAGES);

    this._gl.pixelStorei(this._gl.UNPACK_ROW_LENGTH, image.width);
    this._gl.pixelStorei(this._gl.UNPACK_IMAGE_HEIGHT, image.height);
    this._gl.pixelStorei(this._gl.UNPACK_SKIP_PIXELS, minX);
    this._gl.pixelStorei(this._gl.UNPACK_SKIP_ROWS, minY);
    this._gl.pixelStorei(this._gl.UNPACK_SKIP_IMAGES, minZ);

    // set up the src texture
    const isSrc3D = srcTexture.isDataArrayTexture || srcTexture.isData3DTexture;
    const isDst3D = dstTexture.isDataArrayTexture || dstTexture.isData3DTexture;
    if (srcTexture.isDepthTexture) {

      const srcTextureProperties = this.properties.get(srcTexture);
      const dstTextureProperties = this.properties.get(dstTexture);
      const srcRenderTargetProperties = this.properties.get(srcTextureProperties.__renderTarget);
      const dstRenderTargetProperties = this.properties.get(dstTextureProperties.__renderTarget);
      this.state.bindFramebuffer(this._gl.READ_FRAMEBUFFER, srcRenderTargetProperties.__webglFramebuffer);
      this.state.bindFramebuffer(this._gl.DRAW_FRAMEBUFFER, dstRenderTargetProperties.__webglFramebuffer);

      for (let i = 0; i < depth; i++) {

        // if the source or destination are a 3d target then a layer needs to be bound
        if (isSrc3D) {

          this._gl.framebufferTextureLayer(this._gl.READ_FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this.properties.get(srcTexture).__webglTexture, srcLevel, minZ + i);
          this._gl.framebufferTextureLayer(this._gl.DRAW_FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this.properties.get(dstTexture).__webglTexture, dstLevel, dstZ + i);

        }

        this._gl.blitFramebuffer(minX, minY, width, height, dstX, dstY, width, height, this._gl.DEPTH_BUFFER_BIT, this._gl.NEAREST);

      }

      this.state.bindFramebuffer(this._gl.READ_FRAMEBUFFER, null);
      this.state.bindFramebuffer(this._gl.DRAW_FRAMEBUFFER, null);

    } else if (srcLevel !== 0 || srcTexture.isRenderTargetTexture || this.properties.has(srcTexture)) {

      // get the appropriate frame buffers
      const srcTextureProperties = this.properties.get(srcTexture);
      const dstTextureProperties = this.properties.get(dstTexture);

      // bind the frame buffer targets
      this.state.bindFramebuffer(this._gl.READ_FRAMEBUFFER, this._srcFramebuffer);
      this.state.bindFramebuffer(this._gl.DRAW_FRAMEBUFFER, this._dstFramebuffer);

      for (let i = 0; i < depth; i++) {

        // assign the correct layers and mip maps to the frame buffers
        if (isSrc3D) {

          this._gl.framebufferTextureLayer(this._gl.READ_FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, srcTextureProperties.__webglTexture, srcLevel, minZ + i);

        } else {

          this._gl.framebufferTexture2D(this._gl.READ_FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_2D, srcTextureProperties.__webglTexture, srcLevel);

        }

        if (isDst3D) {

          this._gl.framebufferTextureLayer(this._gl.DRAW_FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, dstTextureProperties.__webglTexture, dstLevel, dstZ + i);

        } else {

          this._gl.framebufferTexture2D(this._gl.DRAW_FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_2D, dstTextureProperties.__webglTexture, dstLevel);

        }

        // copy the data using the fastest function that can achieve the copy
        if (srcLevel !== 0) {

          this._gl.blitFramebuffer(minX, minY, width, height, dstX, dstY, width, height, this._gl.COLOR_BUFFER_BIT, this._gl.NEAREST);

        } else if (isDst3D) {

          this._gl.copyTexSubImage3D(glTarget, dstLevel, dstX, dstY, dstZ + i, minX, minY, width, height);

        } else {

          this._gl.copyTexSubImage2D(glTarget, dstLevel, dstX, dstY, minX, minY, width, height);

        }

      }

      // unbind read, draw buffers
      this.state.bindFramebuffer(this._gl.READ_FRAMEBUFFER, null);
      this.state.bindFramebuffer(this._gl.DRAW_FRAMEBUFFER, null);

    } else {

      if (isDst3D) {

        // copy data into the 3d texture
        if (srcTexture.isDataTexture || srcTexture.isData3DTexture) {

          this._gl.texSubImage3D(glTarget, dstLevel, dstX, dstY, dstZ, width, height, depth, glFormat, glType, image.data);

        } else if (dstTexture.isCompressedArrayTexture) {

          this._gl.compressedTexSubImage3D(glTarget, dstLevel, dstX, dstY, dstZ, width, height, depth, glFormat, image.data);

        } else {

          this._gl.texSubImage3D(glTarget, dstLevel, dstX, dstY, dstZ, width, height, depth, glFormat, glType, image);

        }

      } else {

        // copy data into the 2d texture
        if (srcTexture.isDataTexture) {

          this._gl.texSubImage2D(this._gl.TEXTURE_2D, dstLevel, dstX, dstY, width, height, glFormat, glType, image.data);

        } else if (srcTexture.isCompressedTexture) {

          this._gl.compressedTexSubImage2D(this._gl.TEXTURE_2D, dstLevel, dstX, dstY, image.width, image.height, glFormat, image.data);

        } else {

          this._gl.texSubImage2D(this._gl.TEXTURE_2D, dstLevel, dstX, dstY, width, height, glFormat, glType, image);

        }

      }

    }

    // reset values
    this._gl.pixelStorei(this._gl.UNPACK_ROW_LENGTH, currentUnpackRowLen);
    this._gl.pixelStorei(this._gl.UNPACK_IMAGE_HEIGHT, currentUnpackImageHeight);
    this._gl.pixelStorei(this._gl.UNPACK_SKIP_PIXELS, currentUnpackSkipPixels);
    this._gl.pixelStorei(this._gl.UNPACK_SKIP_ROWS, currentUnpackSkipRows);
    this._gl.pixelStorei(this._gl.UNPACK_SKIP_IMAGES, currentUnpackSkipImages);

    // Generate mipmaps only when copying level 0
    if (dstLevel === 0 && dstTexture.generateMipmaps) {

      this._gl.generateMipmap(glTarget);

    }

    this.state.unbindTexture();

  };

  /**
   * Initializes the given WebGLRenderTarget memory. Useful for initializing a render target so data
   * can be copied into it using {@link WebGLRenderer#copyTextureToTexture} before it has been
   * rendered to.
   *
   * @param {WebGLRenderTarget} target - The render target.
   */
  public initRenderTarget(target: WebGLRenderTarget) {

    if (this.properties.get(target).__webglFramebuffer === undefined) {

      this.textures.setupRenderTarget(target);

    }

  };

  /**
   * Initializes the given texture. Useful for preloading a texture rather than waiting until first
   * render (which can cause noticeable lags due to decode and GPU upload overhead).
   *
   * @param {Texture} texture - The texture.
   */
  public initTexture(texture: Texture) {

    if (texture.isCubeTexture) {

      this.textures.setTextureCube(texture, 0);

    } else if (texture.isData3DTexture) {

      this.textures.setTexture3D(texture, 0);

    } else if (texture.isDataArrayTexture || texture.isCompressedArrayTexture) {

      this.textures.setTexture2DArray(texture, 0);

    } else {

      this.textures.setTexture2D(texture, 0);

    }

    this.state.unbindTexture();

  };

  /**
   * Can be used to reset the internal WebGL state. This method is mostly
   * relevant for applications which share a single WebGL context across
   * multiple WebGL libraries.
   */
  public resetState(): void {

    this._currentActiveCubeFace = 0;
    this._currentActiveMipmapLevel = 0;
    this._currentRenderTarget = null;

    this.state.reset();
    this.bindingStates.reset();

  };

  /**
   * Defines the coordinate system of the renderer.
   *
   * In `WebGLRenderer`, the value is always `WebGLCoordinateSystem`.
   *
   * @type {WebGLCoordinateSystem|WebGPUCoordinateSystem}
   * @default WebGLCoordinateSystem
   * @readonly
   */
  public get coordinateSystem() {

    return WebGLCoordinateSystem;

  }

  /**
   * Defines the output color space of the renderer.
   *
   * @type {SRGBColorSpace|LinearSRGBColorSpace}
   * @default SRGBColorSpace
   */
  public get outputColorSpace() {

    return this._outputColorSpace;

  }

  public set outputColorSpace(colorSpace) {

    this._outputColorSpace = colorSpace;

    const contextName = 'webgl2';

    const gl = this.getContext(contextName);
    gl.drawingBufferColorSpace = this.cm._getDrawingBufferColorSpace(colorSpace);
    gl.unpackColorSpace = this.cm._getUnpackColorSpace(colorSpace);

  }

}

// JSDoc

/**
 * WebGLRenderer options.
 *
 * @typedef {Object} WebGLRenderer~Options
 * @property {DOMElement} [canvas=null] - A canvas element where the renderer draws its output. If not passed in here, a new canvas element will be created by the renderer.
 * @property {WebGL2RenderingContext} [context=null] - Can be used to attach an existing rendering context to this renderer.
 * @property {('highp'|'mediump'|'lowp')} [precision='highp'] - The default shader precision. Uses `highp` if supported by the device.
 * @property {boolean} [alpha=false] - Controls the default clear alpha value. When set to`true`, the value is `0`. Otherwise it's `1`.
 * @property {boolean} [premultipliedAlpha=true] Whether the renderer will assume colors have premultiplied alpha or not.
 * @property {boolean} [antialias=false] Whether to use the default MSAA or not.
 * @property {boolean} [stencil=false] Whether the drawing buffer has a stencil buffer of at least 8 bits or not.
 * @property {boolean} [preserveDrawingBuffer=false] Whether to preserve the buffer until manually cleared or overwritten.
 * @property {('default'|'low-power'|'high-performance')} [powerPreference='default'] Provides a hint to the user agent indicating what configuration of GPU is suitable for this WebGL context.
 * @property {boolean} [failIfMajorPerformanceCaveat=false] Whether the renderer creation will fail upon low performance is detected.
 * @property {boolean} [depth=true] Whether the drawing buffer has a depth buffer of at least 16 bits.
 * @property {boolean} [logarithmicDepthBuffer=false] Whether to use a logarithmic depth buffer. It may be necessary to use this if dealing with huge differences in scale in a single scene.
 * Note that this setting uses `gl_FragDepth` if available which disables the Early Fragment Test optimization and can cause a decrease in performance.
 * @property {boolean} [reversedDepthBuffer=false] Whether to use a reverse depth buffer. Requires the `EXT_clip_control` extension.
 * This is a more faster and accurate version than logarithmic depth buffer.
 **/

/**
 * WebGLRenderer Capabilities.
 *
 * @typedef {Object} WebGLRenderer~Capabilities
 * @property {Function} getMaxAnisotropy - Returns the maximum available anisotropy.
 * @property {Function} getMaxPrecision - Returns the maximum available precision for vertex and fragment shaders.
 * @property {boolean} logarithmicDepthBuffer - `true` if `logarithmicDepthBuffer` was set to `true` in the constructor.
 * @property {number} maxAttributes - The number of shader attributes that can be used by the vertex shader.
 * @property {number} maxCubemapSize - Maximum height * width of cube map textures that a shader can use.
 * @property {number} maxFragmentUniforms - The number of uniforms that can be used by a fragment shader.
 * @property {number} maxSamples - Maximum number of samples in context of Multisample anti-aliasing (MSAA).
 * @property {number} maxTextures - The maximum number of textures that can be used by a shader.
 * @property {number} maxTextureSize - Maximum height * width of a texture that a shader use.
 * @property {number} maxVaryings - The number of varying vectors that can used by shaders.
 * @property {number} maxVertexTextures - The number of textures that can be used in a vertex shader.
 * @property {number} maxVertexUniforms - The maximum number of uniforms that can be used in a vertex shader.
 * @property {string} precision - The shader precision currently being used by the renderer.
 * @property {boolean} reversedDepthBuffer - `true` if `reversedDepthBuffer` was set to `true` in the constructor
 * and the rendering context supports `EXT_clip_control`.
 * @property {boolean} vertexTextures - `true` if vertex textures can be used.
 **/

/**
 * WebGLRenderer Info Memory
 *
 * @typedef {Object} WebGLRenderer~InfoMemory
 * @property {number} geometries - The number of active geometries.
 * @property {number} textures - The number of active textures.
 **/

/**
 * WebGLRenderer Info Render
 *
 * @typedef {Object} WebGLRenderer~InfoRender
 * @property {number} frame - The frame ID.
 * @property {number} calls - The number of draw calls per frame.
 * @property {number} triangles - The number of rendered triangles primitives per frame.
 * @property {number} points - The number of rendered points primitives per frame.
 * @property {number} lines - The number of rendered lines primitives per frame.
 **/

/**
 * WebGLRenderer Info
 *
 * @typedef {Object} WebGLRenderer~Info
 * @property {boolean} [autoReset=true] - Whether to automatically reset the info by the renderer or not.
 * @property {WebGLRenderer~InfoMemory} memory - Information about allocated objects.
 * @property {WebGLRenderer~InfoRender} render - Information about rendered objects.
 * @property {?Array<WebGLProgram>} programs - An array `WebGLProgram`s used for rendering.
 * @property {Function} reset - Resets the info object for the next frame.
 **/

/**
 * WebGLRenderer Shadow Map.
 *
 * @typedef {Object} WebGLRenderer~ShadowMap
 * @property {boolean} [enabled=false] - If set to `true`, use shadow maps in the scene.
 * @property {boolean} [autoUpdate=true] - Enables automatic updates to the shadows in the scene.
 * If you do not require dynamic lighting / shadows, you may set this to `false`.
 * @property {boolean} [needsUpdate=false] - When set to `true`, shadow maps in the scene
 * will be updated in the next `render` call.
 * @property {(BasicShadowMap|PCFShadowMap|PCFSoftShadowMap|VSMShadowMap)} [type=PCFShadowMap] - Defines the shadow map type.
 **/
