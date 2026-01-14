import { NotEqualDepth, GreaterDepth, GreaterEqualDepth, EqualDepth, LessEqualDepth, LessDepth, AlwaysDepth, NeverDepth, CullFaceFront, CullFaceBack, CullFaceNone, DoubleSide, BackSide, CustomBlending, MultiplyBlending, SubtractiveBlending, AdditiveBlending, NoBlending, NormalBlending, AddEquation, SubtractEquation, ReverseSubtractEquation, MinEquation, MaxEquation, ZeroFactor, OneFactor, SrcColorFactor, SrcAlphaFactor, SrcAlphaSaturateFactor, DstColorFactor, DstAlphaFactor, OneMinusSrcColorFactor, OneMinusSrcAlphaFactor, OneMinusDstColorFactor, OneMinusDstAlphaFactor, ConstantColorFactor, OneMinusConstantColorFactor, ConstantAlphaFactor, OneMinusConstantAlphaFactor, CullFace } from '../../constants';
import { Color } from '../../math/Color';
import { Vector4 } from '../../math/Vector4';
import { WebGLExtensions } from './WebGLExtensions';

interface WebGLMaterialLike {
  side: number;

  blending: number;
  transparent: boolean;

  blendEquation?: number;
  blendSrc?: number;
  blendDst?: number;
  blendEquationAlpha?: number;
  blendSrcAlpha?: number;
  blendDstAlpha?: number;
  blendColor?: Color;
  blendAlpha?: number;
  premultipliedAlpha?: boolean;

  depthFunc: number;
  depthTest: boolean;
  depthWrite: boolean;

  colorWrite: boolean;

  stencilWrite: boolean;
  stencilWriteMask: number;
  stencilFunc: number;
  stencilRef: number;
  stencilFuncMask: number;
  stencilFail: number;
  stencilZFail: number;
  stencilZPass: number;

  polygonOffset: boolean;
  polygonOffsetFactor: number;
  polygonOffsetUnits: number;

  alphaToCoverage?: boolean;
}

interface BoundTexture {
  type?: number;
  texture?: WebGLTexture | null;
}

interface UniformsGroup {
  name: string;
  __bindingPointIndex: number;
  // add other properties if needed
}

const reversedFuncs = {
  [NeverDepth]: AlwaysDepth,
  [LessDepth]: GreaterDepth,
  [EqualDepth]: NotEqualDepth,
  [LessEqualDepth]: GreaterEqualDepth,

  [AlwaysDepth]: NeverDepth,
  [GreaterDepth]: LessDepth,
  [NotEqualDepth]: EqualDepth,
  [GreaterEqualDepth]: LessEqualDepth,
};

export class WebGLState {
  private readonly gl;
  private extensions: WebGLExtensions;

  // TODO: type better
  public colorBuffer: any
  public depthBuffer: any;
  public stencilBuffer: any;

  public uboBindings = new WeakMap();
  public uboProgramMap = new WeakMap();

  public enabledCapabilities: { [key: number]: boolean } = {};

  public currentBoundFramebuffers: { [key: number]: WebGLFramebuffer | null } = {};
  public currentDrawbuffers = new WeakMap();
  public defaultDrawbuffers: number[] = [];

  public currentProgram: WebGLProgram | null = null;

  public currentBlendingEnabled: boolean = false;
  public currentBlending: number | null = null;
  public currentBlendEquation: number | null = null;
  public currentBlendSrc: number | null = null;
  public currentBlendDst: number | null = null;
  public currentBlendEquationAlpha: number | null = null;
  public currentBlendSrcAlpha: number | null = null;
  public currentBlendDstAlpha: number | null = null;
  public currentBlendColor: Color = new Color(0, 0, 0);
  public currentBlendAlpha: number = 0;
  public currentPremultipledAlpha: boolean = false;

  public currentFlipSided: boolean | null = null;
  public currentCullFace: number | null = null;

  public currentLineWidth: number | null = null;

  public currentPolygonOffsetFactor: number | null = null;
  public currentPolygonOffsetUnits: number | null = null;

  public maxTextures: number;

  public lineWidthAvailable = false;
  public version = 0;
  public glVersion: any;

  public currentTextureSlot: number | null = null;
  public currentBoundTextures: Record<number, BoundTexture> = {};

  public scissorParam: any;
  public viewportParam: any;

  public currentScissor: any;
  public currentViewport: any;

  public emptyTextures: { [key: number]: WebGLTexture | null } = {};

  private equationToGL!: Record<number, GLenum>;
  private factorToGL!: Record<number, GLenum>;

  constructor(
    gl: WebGL2RenderingContext,
    extensions: WebGLExtensions
  ) {
    this.gl = gl;
    this.extensions = extensions;

    this.colorBuffer = this.ColorBuffer();
    this.depthBuffer = this.DepthBuffer();
    this.stencilBuffer = this.StencilBuffer();

    this.maxTextures = this.gl.getParameter(this.gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
    this.glVersion = this.gl.getParameter(this.gl.VERSION);

    if (this.glVersion.indexOf('WebGL') !== - 1) {

      // version = parseFloat(/^WebGL (\d)/.exec(glVersion)[1]);
      const match = /^WebGL (\d)/.exec(this.glVersion);
      const version = match ? parseFloat(match[1]) : 1; // fallback to 1 if null

      this.lineWidthAvailable = (version >= 1.0);

    } else if (this.glVersion.indexOf('OpenGL ES') !== - 1) {

      // version = parseFloat(/^OpenGL ES (\d)/.exec(glVersion)[1]);
      const match = /^OpenGL ES (\d)/.exec(this.glVersion);
      const version = match ? parseFloat(match[1]) : 1; // fallback to 1 if null

      this.lineWidthAvailable = (version >= 2.0);

    }

    this.scissorParam = gl.getParameter(gl.SCISSOR_BOX);
    this.viewportParam = gl.getParameter(gl.VIEWPORT);

    this.currentScissor = new Vector4().fromArray(this.scissorParam);
    this.currentViewport = new Vector4().fromArray(this.viewportParam);

    this.emptyTextures[gl.TEXTURE_2D] = this.createTexture(gl.TEXTURE_2D, gl.TEXTURE_2D, 1);
    this.emptyTextures[gl.TEXTURE_CUBE_MAP] = this.createTexture(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_CUBE_MAP_POSITIVE_X, 6);
    this.emptyTextures[gl.TEXTURE_2D_ARRAY] = this.createTexture(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_2D_ARRAY, 1, 1);
    this.emptyTextures[gl.TEXTURE_3D] = this.createTexture(gl.TEXTURE_3D, gl.TEXTURE_3D, 1, 1);

    this.equationToGL = {
      [AddEquation]: gl.FUNC_ADD,
      [SubtractEquation]: gl.FUNC_SUBTRACT,
      [ReverseSubtractEquation]: gl.FUNC_REVERSE_SUBTRACT,
      [MinEquation]: gl.MIN,
      [MaxEquation]: gl.MAX
    };

    this.factorToGL = {
      [ZeroFactor]: gl.ZERO,
      [OneFactor]: gl.ONE,
      [SrcColorFactor]: gl.SRC_COLOR,
      [SrcAlphaFactor]: gl.SRC_ALPHA,
      [SrcAlphaSaturateFactor]: gl.SRC_ALPHA_SATURATE,
      [DstColorFactor]: gl.DST_COLOR,
      [DstAlphaFactor]: gl.DST_ALPHA,
      [OneMinusSrcColorFactor]: gl.ONE_MINUS_SRC_COLOR,
      [OneMinusSrcAlphaFactor]: gl.ONE_MINUS_SRC_ALPHA,
      [OneMinusDstColorFactor]: gl.ONE_MINUS_DST_COLOR,
      [OneMinusDstAlphaFactor]: gl.ONE_MINUS_DST_ALPHA,
      [ConstantColorFactor]: gl.CONSTANT_COLOR,
      [OneMinusConstantColorFactor]: gl.ONE_MINUS_CONSTANT_COLOR,
      [ConstantAlphaFactor]: gl.CONSTANT_ALPHA,
      [OneMinusConstantAlphaFactor]: gl.ONE_MINUS_CONSTANT_ALPHA
    };

  }

  public ColorBuffer() {

    let locked: boolean = false;

    const color = new Vector4();
    let currentColorMask: boolean | null = null;
    const currentColorClear = new Vector4(0, 0, 0, 0);

    const gl = this.gl

    return {

      setMask: function (colorMask: boolean) {

        if (currentColorMask !== colorMask && !locked) {

          gl.colorMask(colorMask, colorMask, colorMask, colorMask);
          currentColorMask = colorMask;

        }

      },

      setLocked: function (lock: boolean) {

        locked = lock;

      },

      setClear: function (
        r: number,
        g: number,
        b: number,
        a: number,
        premultipliedAlpha?: boolean
      ) {

        if (premultipliedAlpha === true) {

          r *= a; g *= a; b *= a;

        }

        color.set(r, g, b, a);

        if (currentColorClear.equals(color) === false) {

          gl.clearColor(r, g, b, a);
          currentColorClear.copy(color);

        }

      },

      reset: function () {

        locked = false;

        currentColorMask = null;
        currentColorClear.set(- 1, 0, 0, 0); // set to invalid state

      }

    };

  }

  public DepthBuffer() {

    let locked = false;

    let currentReversed = false;
    let currentDepthMask: boolean | null = null;
    let currentDepthFunc: any | null = null;
    let currentDepthClear: number | null = null;

    const gl = this.gl;
    const extensions = this.extensions;

    const enable = this.enable.bind(this);
    const disable = this.disable.bind(this);

    return {

      setReversed: function (reversed: boolean) {

        if (currentReversed !== reversed) {

          const ext = extensions.get('EXT_clip_control');

          if (reversed) {

            ext.clipControlEXT(ext.LOWER_LEFT_EXT, ext.ZERO_TO_ONE_EXT);

          } else {

            ext.clipControlEXT(ext.LOWER_LEFT_EXT, ext.NEGATIVE_ONE_TO_ONE_EXT);

          }

          currentReversed = reversed;

          const oldDepth = currentDepthClear;
          currentDepthClear = null;
          this.setClear(oldDepth as number);

        }

      },

      getReversed: function () {

        return currentReversed;

      },

      setTest: function (depthTest: boolean) {

        if (depthTest) {

          enable(gl.DEPTH_TEST);

        } else {

          disable(gl.DEPTH_TEST);

        }

      },

      setMask: function (depthMask: boolean) {

        if (currentDepthMask !== depthMask && !locked) {

          gl.depthMask(depthMask);
          currentDepthMask = depthMask;

        }

      },

      setFunc: function (depthFunc: any | null) {

        if (currentReversed) depthFunc = reversedFuncs[depthFunc];

        if (currentDepthFunc !== depthFunc) {

          switch (depthFunc) {

            case NeverDepth:

              gl.depthFunc(gl.NEVER);
              break;

            case AlwaysDepth:

              gl.depthFunc(gl.ALWAYS);
              break;

            case LessDepth:

              gl.depthFunc(gl.LESS);
              break;

            case LessEqualDepth:

              gl.depthFunc(gl.LEQUAL);
              break;

            case EqualDepth:

              gl.depthFunc(gl.EQUAL);
              break;

            case GreaterEqualDepth:

              gl.depthFunc(gl.GEQUAL);
              break;

            case GreaterDepth:

              gl.depthFunc(gl.GREATER);
              break;

            case NotEqualDepth:

              gl.depthFunc(gl.NOTEQUAL);
              break;

            default:

              gl.depthFunc(gl.LEQUAL);

          }

          currentDepthFunc = depthFunc;

        }

      },

      setLocked: function (lock: boolean) {

        locked = lock;

      },

      setClear: function (depth: number) {

        if (currentDepthClear !== depth) {

          if (currentReversed) {

            depth = 1 - depth;

          }

          gl.clearDepth(depth);
          currentDepthClear = depth;

        }

      },

      reset: function () {

        locked = false;

        currentDepthMask = null;
        currentDepthFunc = null;
        currentDepthClear = null;
        currentReversed = false;

      }

    };

  }

  public StencilBuffer() {

    let locked: boolean = false;

    let currentStencilMask: number | null = null;
    let currentStencilFunc: number | null = null;
    let currentStencilRef: number | null = null;
    let currentStencilFuncMask: number | null = null;
    let currentStencilFail: number | null = null;
    let currentStencilZFail: number | null = null;
    let currentStencilZPass: number | null = null;
    let currentStencilClear: number | null = null;

    const gl = this.gl;

    const enable = this.enable.bind(this);
    const disable = this.disable.bind(this);

    return {

      setTest: function (stencilTest: boolean) {

        if (!locked) {

          if (stencilTest) {

            enable(gl.STENCIL_TEST);

          } else {

            disable(gl.STENCIL_TEST);

          }

        }

      },

      setMask: function (stencilMask: number) {

        if (currentStencilMask !== stencilMask && !locked) {

          gl.stencilMask(stencilMask);
          currentStencilMask = stencilMask;

        }

      },

      setFunc: function (stencilFunc: number, stencilRef: number, stencilMask: number) {

        if (currentStencilFunc !== stencilFunc ||
          currentStencilRef !== stencilRef ||
          currentStencilFuncMask !== stencilMask) {

          gl.stencilFunc(stencilFunc, stencilRef, stencilMask);

          currentStencilFunc = stencilFunc;
          currentStencilRef = stencilRef;
          currentStencilFuncMask = stencilMask;

        }

      },

      setOp: function (stencilFail: number, stencilZFail: number, stencilZPass: number) {

        if (currentStencilFail !== stencilFail ||
          currentStencilZFail !== stencilZFail ||
          currentStencilZPass !== stencilZPass) {

          gl.stencilOp(stencilFail, stencilZFail, stencilZPass);

          currentStencilFail = stencilFail;
          currentStencilZFail = stencilZFail;
          currentStencilZPass = stencilZPass;

        }

      },

      setLocked: function (lock: boolean) {

        locked = lock;

      },

      setClear: function (stencil: number) {

        if (currentStencilClear !== stencil) {

          gl.clearStencil(stencil);
          currentStencilClear = stencil;

        }

      },

      reset: function () {

        locked = false;

        currentStencilMask = null;
        currentStencilFunc = null;
        currentStencilRef = null;
        currentStencilFuncMask = null;
        currentStencilFail = null;
        currentStencilZFail = null;
        currentStencilZPass = null;
        currentStencilClear = null;

      }

    };

  }

  //

  public createTexture(
    type: number,
    target: number,
    count: number,
    dimensions?: number
  ) {

    const data = new Uint8Array(4); // 4 is required to match default unpack alignment of 4.
    const texture = this.gl.createTexture();

    this.gl.bindTexture(type, texture);
    this.gl.texParameteri(type, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(type, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);

    for (let i = 0; i < count; i++) {

      if (type === this.gl.TEXTURE_3D || type === this.gl.TEXTURE_2D_ARRAY) {

        this.gl.texImage3D(target, 0, this.gl.RGBA, 1, 1, dimensions!, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, data);

      } else {

        this.gl.texImage2D(target + i, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, data);

      }

    }

    return texture;

  }



  //

  public enable(id: number) {

    if (this.enabledCapabilities[id] !== true) {

      this.gl.enable(id);
      this.enabledCapabilities[id] = true;

    }

  }

  public disable(id: number) {

    if (this.enabledCapabilities[id] !== false) {

      this.gl.disable(id);
      this.enabledCapabilities[id] = false;

    }

  }

  public bindFramebuffer(
    target: number,
    framebuffer: WebGLFramebuffer | null
  ): boolean {

    if (this.currentBoundFramebuffers[target] !== framebuffer) {

      this.gl.bindFramebuffer(target, framebuffer);

      this.currentBoundFramebuffers[target] = framebuffer;

      // gl.DRAW_FRAMEBUFFER is equivalent to gl.FRAMEBUFFER

      if (target === this.gl.DRAW_FRAMEBUFFER) {

        this.currentBoundFramebuffers[this.gl.FRAMEBUFFER] = framebuffer;

      }

      if (target === this.gl.FRAMEBUFFER) {

        this.currentBoundFramebuffers[this.gl.DRAW_FRAMEBUFFER] = framebuffer;

      }

      return true;

    }

    return false;

  }

  public drawBuffers(
    renderTarget: { textures: unknown[] } | null,
    framebuffer: WebGLFramebuffer
  ): void {

    let drawBuffers = this.defaultDrawbuffers;

    let needsUpdate = false;

    if (renderTarget) {

      drawBuffers = this.currentDrawbuffers.get(framebuffer);

      if (drawBuffers === undefined) {

        drawBuffers = [];
        this.currentDrawbuffers.set(framebuffer, drawBuffers);

      }

      const textures = renderTarget.textures;

      if (drawBuffers.length !== textures.length || drawBuffers[0] !== this.gl.COLOR_ATTACHMENT0) {

        for (let i = 0, il = textures.length; i < il; i++) {

          drawBuffers[i] = this.gl.COLOR_ATTACHMENT0 + i;

        }

        drawBuffers.length = textures.length;

        needsUpdate = true;

      }

    } else {

      if (drawBuffers[0] !== this.gl.BACK) {

        drawBuffers[0] = this.gl.BACK;

        needsUpdate = true;

      }

    }

    if (needsUpdate) {

      this.gl.drawBuffers(drawBuffers);

    }

  }

  public useProgram(program: WebGLProgram | null) {

    if (this.currentProgram !== program) {

      this.gl.useProgram(program);

      this.currentProgram = program;

      return true;

    }

    return false;

  }


  public setBlending(
    blending: number,
    blendEquation: number = AddEquation,
    blendSrc: number = OneFactor,
    blendDst: number = ZeroFactor,
    blendEquationAlpha: number = blendEquation,
    blendSrcAlpha: number = blendSrc,
    blendDstAlpha: number = blendDst,
    blendColor: Color = new Color(0, 0, 0),
    blendAlpha: number = 0,
    premultipliedAlpha: boolean = false
  ) {

    if (blending === NoBlending) {

      if (this.currentBlendingEnabled === true) {

        this.disable(this.gl.BLEND);
        this.currentBlendingEnabled = false;

      }

      return;

    }

    if (this.currentBlendingEnabled === false) {

      this.enable(this.gl.BLEND);
      this.currentBlendingEnabled = true;

    }

    if (blending !== CustomBlending) {

      if (blending !== this.currentBlending || premultipliedAlpha !== this.currentPremultipledAlpha) {

        if (this.currentBlendEquation !== AddEquation || this.currentBlendEquationAlpha !== AddEquation) {

          this.gl.blendEquation(this.gl.FUNC_ADD);

          this.currentBlendEquation = AddEquation;
          this.currentBlendEquationAlpha = AddEquation;

        }

        if (premultipliedAlpha) {

          switch (blending) {

            case NormalBlending:
              this.gl.blendFuncSeparate(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
              break;

            case AdditiveBlending:
              this.gl.blendFunc(this.gl.ONE, this.gl.ONE);
              break;

            case SubtractiveBlending:
              this.gl.blendFuncSeparate(this.gl.ZERO, this.gl.ONE_MINUS_SRC_COLOR, this.gl.ZERO, this.gl.ONE);
              break;

            case MultiplyBlending:
              this.gl.blendFuncSeparate(this.gl.DST_COLOR, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.ZERO, this.gl.ONE);
              break;

            default:
              console.error('WebGLState: Invalid blending: ', blending);
              break;

          }

        } else {

          switch (blending) {

            case NormalBlending:
              this.gl.blendFuncSeparate(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
              break;

            case AdditiveBlending:
              this.gl.blendFuncSeparate(this.gl.SRC_ALPHA, this.gl.ONE, this.gl.ONE, this.gl.ONE);
              break;

            case SubtractiveBlending:
              console.error('WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true');
              break;

            case MultiplyBlending:
              console.error('WebGLState: MultiplyBlending requires material.premultipliedAlpha = true');
              break;

            default:
              console.error('WebGLState: Invalid blending: ', blending);
              break;

          }

        }

        this.currentBlendSrc = null;
        this.currentBlendDst = null;
        this.currentBlendSrcAlpha = null;
        this.currentBlendDstAlpha = null;
        this.currentBlendColor.set(0, 0, 0);
        this.currentBlendAlpha = 0;

        this.currentBlending = blending;
        this.currentPremultipledAlpha = premultipliedAlpha;

      }

      return;

    }

    // custom blending

    blendEquationAlpha = blendEquationAlpha || blendEquation;
    blendSrcAlpha = blendSrcAlpha || blendSrc;
    blendDstAlpha = blendDstAlpha || blendDst;

    if (blendEquation !== this.currentBlendEquation || blendEquationAlpha !== this.currentBlendEquationAlpha) {

      this.gl.blendEquationSeparate(this.equationToGL[blendEquation], this.equationToGL[blendEquationAlpha]);

      this.currentBlendEquation = blendEquation;
      this.currentBlendEquationAlpha = blendEquationAlpha;

    }

    if (blendSrc !== this.currentBlendSrc || blendDst !== this.currentBlendDst || blendSrcAlpha !== this.currentBlendSrcAlpha || blendDstAlpha !== this.currentBlendDstAlpha) {

      this.gl.blendFuncSeparate(this.factorToGL[blendSrc], this.factorToGL[blendDst], this.factorToGL[blendSrcAlpha], this.factorToGL[blendDstAlpha]);

      this.currentBlendSrc = blendSrc;
      this.currentBlendDst = blendDst;
      this.currentBlendSrcAlpha = blendSrcAlpha;
      this.currentBlendDstAlpha = blendDstAlpha;

    }

    if (blendColor.equals(this.currentBlendColor) === false || blendAlpha !== this.currentBlendAlpha) {

      this.gl.blendColor(blendColor.r, blendColor.g, blendColor.b, blendAlpha);

      this.currentBlendColor.copy(blendColor);
      this.currentBlendAlpha = blendAlpha;

    }

    this.currentBlending = blending;
    this.currentPremultipledAlpha = false;

  }

  public setMaterial(material: WebGLMaterialLike, frontFaceCW: boolean) {

    material.side === DoubleSide
      ? this.disable(this.gl.CULL_FACE)
      : this.enable(this.gl.CULL_FACE);

    let flipSided = (material.side === BackSide);
    if (frontFaceCW) flipSided = !flipSided;

    this.setFlipSided(flipSided);

    (material.blending === NormalBlending && material.transparent === false)
      ? this.setBlending(NoBlending)
      : this.setBlending(material.blending, material.blendEquation, material.blendSrc, material.blendDst, material.blendEquationAlpha, material.blendSrcAlpha, material.blendDstAlpha, material.blendColor, material.blendAlpha, material.premultipliedAlpha);

    this.depthBuffer.setFunc(material.depthFunc);
    this.depthBuffer.setTest(material.depthTest);
    this.depthBuffer.setMask(material.depthWrite);
    this.colorBuffer.setMask(material.colorWrite);

    const stencilWrite = material.stencilWrite;
    this.stencilBuffer.setTest(stencilWrite);
    if (stencilWrite) {

      this.stencilBuffer.setMask(material.stencilWriteMask);
      this.stencilBuffer.setFunc(material.stencilFunc, material.stencilRef, material.stencilFuncMask);
      this.stencilBuffer.setOp(material.stencilFail, material.stencilZFail, material.stencilZPass);

    }

    this.setPolygonOffset(material.polygonOffset, material.polygonOffsetFactor, material.polygonOffsetUnits);

    material.alphaToCoverage === true
      ? this.enable(this.gl.SAMPLE_ALPHA_TO_COVERAGE)
      : this.disable(this.gl.SAMPLE_ALPHA_TO_COVERAGE);

  }

  //

  public setFlipSided(flipSided: boolean) {

    if (this.currentFlipSided !== flipSided) {

      if (flipSided) {

        this.gl.frontFace(this.gl.CW);

      } else {

        this.gl.frontFace(this.gl.CCW);

      }

      this.currentFlipSided = flipSided;

    }

  }

  public setCullFace(cullFace: CullFace): void {

    if (cullFace !== CullFaceNone) {

      this.enable(this.gl.CULL_FACE);

      if (cullFace !== this.currentCullFace) {

        if (cullFace === CullFaceBack) {

          this.gl.cullFace(this.gl.BACK);

        } else if (cullFace === CullFaceFront) {

          this.gl.cullFace(this.gl.FRONT);

        } else {

          this.gl.cullFace(this.gl.FRONT_AND_BACK);

        }

      }

    } else {

      this.disable(this.gl.CULL_FACE);

    }

    this.currentCullFace = cullFace;

  }

  public setLineWidth(width: number) {

    if (width !== this.currentLineWidth) {

      if (this.lineWidthAvailable) this.gl.lineWidth(width);

      this.currentLineWidth = width;

    }

  }

  public setPolygonOffset(
    polygonOffset: boolean,
    factor: number,
    units: number
  ): void {

    if (polygonOffset) {

      this.enable(this.gl.POLYGON_OFFSET_FILL);

      if (this.currentPolygonOffsetFactor !== factor || this.currentPolygonOffsetUnits !== units) {

        this.gl.polygonOffset(factor, units);

        this.currentPolygonOffsetFactor = factor;
        this.currentPolygonOffsetUnits = units;

      }

    } else {

      this.disable(this.gl.POLYGON_OFFSET_FILL);

    }

  }

  public setScissorTest(scissorTest: boolean): void {

    if (scissorTest) {

      this.enable(this.gl.SCISSOR_TEST);

    } else {

      this.disable(this.gl.SCISSOR_TEST);

    }

  }

  // texture

  public activeTexture(webglSlot?: number): void {

    if (webglSlot === undefined) webglSlot = this.gl.TEXTURE0 + this.maxTextures - 1;

    if (this.currentTextureSlot !== webglSlot) {

      this.gl.activeTexture(webglSlot);
      this.currentTextureSlot = webglSlot;

    }

  }

  public bindTexture(
    webglType: number,
    webglTexture: WebGLTexture | null,
    webglSlot?: number
  ): void {

    if (webglSlot === undefined) {

      if (this.currentTextureSlot === null) {

        webglSlot = this.gl.TEXTURE0 + this.maxTextures - 1;

      } else {

        webglSlot = this.currentTextureSlot;

      }

    }

    let boundTexture = this.currentBoundTextures[webglSlot];

    if (boundTexture === undefined) {

      boundTexture = { type: undefined, texture: undefined };
      this.currentBoundTextures[webglSlot] = boundTexture;

    }

    if (boundTexture.type !== webglType || boundTexture.texture !== webglTexture) {

      if (this.currentTextureSlot !== webglSlot) {

        this.gl.activeTexture(webglSlot);
        this.currentTextureSlot = webglSlot;

      }

      this.gl.bindTexture(webglType, webglTexture || this.emptyTextures[webglType]);

      boundTexture.type = webglType;
      boundTexture.texture = webglTexture;

    }

  }

  public unbindTexture() {

    if (this.currentTextureSlot !== null) {

      const boundTexture = this.currentBoundTextures[this.currentTextureSlot];

      if (boundTexture !== undefined && boundTexture.type !== undefined) {

        this.gl.bindTexture(boundTexture.type, null);

        boundTexture.type = undefined;
        boundTexture.texture = undefined;

      }
    }

  }


  public compressedTexImage2D(
    target: GLenum,
    level: GLint,
    internalformat: GLenum,
    width: GLsizei,
    height: GLsizei,
    border: GLint,
    data: ArrayBufferView,
    srcOffset?: GLintptr
  ): void {

    try {

      // gl.compressedTexImage2D(...arguments);
      this.gl.compressedTexImage2D(target, level, internalformat, width, height, border, data, srcOffset);

    } catch (error) {

      console.error('WebGLState:', error);

    }

  }

  public compressedTexImage3D(
    target: GLenum,
    level: GLint,
    internalformat: GLenum,
    width: GLsizei,
    height: GLsizei,
    depth: GLsizei,
    border: GLint,
    data: ArrayBufferView,
    srcOffset?: GLintptr
  ): void {

    try {

      // gl.compressedTexImage3D(...arguments);
      this.gl.compressedTexImage3D(target, level, internalformat, width, height, depth, border, data, srcOffset);

    } catch (error) {

      console.error('WebGLState:', error);

    }

  }

  /**
   * texImage* - upload full texture
   * texSubImage* - upload partial texture
   * compressed* - upload only compressed data
   * texStorage* - reserve GPU memory
   */


  public texSubImage2D(
    target: GLenum,
    level: GLint,
    xoffset: GLint,
    yoffset: GLint,
    format: GLenum,
    type: GLenum,
    source: TexImageSource | null,
    width: GLsizei,
    height: GLsizei,
    pixel: ArrayBufferView<ArrayBufferLike> | null
  ): void {

    try {

      // gl.texSubImage2D(...arguments);
      // gl.texSubImage2D(target, level, xoffset, yoffset, format, type, source);

      if (source === null) {
        this.gl.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixel)
      } else {
        this.gl.texSubImage2D(target, level, xoffset, yoffset, format, type, source);
      }

    } catch (error) {

      console.error('WebGLState:', error);

    }

  }

  public texSubImage3D(
    target: number,
    level: number,
    xoffset: number,
    yoffset: number,
    zoffset: number,
    width: number,
    height: number,
    depth: number,
    format: number,
    type: number,
    pixels: ArrayBufferView,
    srcOffset?: GLintptr
  ): void {

    try {

      // gl.texSubImage3D(...arguments);
      this.gl.texSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, type, pixels, srcOffset);

    } catch (error) {

      console.error('WebGLState:', error);

    }

  }

  public compressedTexSubImage2D(
    target: GLenum,
    level: GLint,
    xoffset: GLint,
    yoffset: GLint,
    width: GLsizei,
    height: GLsizei,
    format: GLenum,
    data: ArrayBufferView,
    srcOffset?: GLintptr
  ): void {

    try {

      // gl.compressedTexSubImage2D(...arguments);
      this.gl.compressedTexSubImage2D(target, level, xoffset, yoffset, width, height, format, data, srcOffset);

    } catch (error) {

      console.error('WebGLState:', error);

    }

  }

  public compressedTexSubImage3D(
    target: number,
    level: number,
    xoffset: number,
    yoffset: number,
    zoffset: number,
    width: number,
    height: number,
    depth: number,
    format: number,
    data: ArrayBufferView,
    srcOffset?: GLintptr
  ): void {

    try {

      // gl.compressedTexSubImage3D(...arguments);
      this.gl.compressedTexSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, data, srcOffset);

    } catch (error) {

      console.error('WebGLState:', error);

    }

  }

  public texStorage2D(
    target: number,
    levels: number,
    internalformat: number,
    width: number,
    height: number
  ): void {

    try {

      // gl.texStorage2D(...arguments);
      this.gl.texStorage2D(target, levels, internalformat, width, height);

    } catch (error) {

      console.error('WebGLState:', error);

    }

  }

  public texStorage3D(
    target: GLenum,
    levels: GLsizei,
    internalformat: GLenum,
    width: GLsizei,
    height: GLsizei,
    depth: GLsizei
  ): void {

    try {

      // gl.texStorage3D(...arguments);
      this.gl.texStorage3D(target, levels, internalformat, width, height, depth);

    } catch (error) {

      console.error('WebGLState:', error);

    }

  }

  public texImage2D(
    target: GLenum,
    level: GLint,
    internalformat: GLint,
    format: GLenum,
    type: GLenum,
    source: TexImageSource | null,
    width: GLsizei,
    height: GLsizei,
    border: GLint = 0,
    pixel: ArrayBufferView<ArrayBufferLike> | null
  ): void {

    try {

      // gl.texImage2D(...arguments);
      // gl.texImage2D(target, level, internalformat, format, type, source);

      if (source === null) {
        this.gl.texImage2D(target, level, internalformat, width, height, border, format, type, pixel);

      } else {
        // Upload path
        this.gl.texImage2D(target, level, internalformat, format, type, source);
      }

    } catch (error) {

      console.error('WebGLState:', error);

    }

  }

  public texImage3D(
    target: number,
    level: number,
    internalformat: number,
    width: number,
    height: number,
    depth: number,
    border: number,
    format: number,
    type: number,
    pixels: ArrayBufferView,
    srcOffset: GLintptr = 0
  ) {

    try {

      // gl.texImage3D(...arguments);
      this.gl.texImage3D(target, level, internalformat, width, height, depth, border, format, type, pixels, srcOffset);

    } catch (error) {

      console.error('WebGLState:', error);

    }

  }

  //

  public scissor(scissor: Vector4) {

    if (this.currentScissor.equals(scissor) === false) {

      this.gl.scissor(scissor.x, scissor.y, scissor.z, scissor.w);
      this.currentScissor.copy(scissor);

    }

  }

  public viewport(viewport: Vector4) {

    if (this.currentViewport.equals(viewport) === false) {

      this.gl.viewport(viewport.x, viewport.y, viewport.z, viewport.w);
      this.currentViewport.copy(viewport);

    }

  }

  public updateUBOMapping(
    uniformsGroup: UniformsGroup,
    program: WebGLProgram
  ) {

    let mapping = this.uboProgramMap.get(program);

    if (mapping === undefined) {

      mapping = new WeakMap();

      this.uboProgramMap.set(program, mapping);

    }

    let blockIndex = mapping.get(uniformsGroup);

    if (blockIndex === undefined) {

      blockIndex = this.gl.getUniformBlockIndex(program, uniformsGroup.name);

      mapping.set(uniformsGroup, blockIndex);

    }

  }

  public uniformBlockBinding(
    uniformsGroup: UniformsGroup,
    program: WebGLProgram
  ) {

    const mapping = this.uboProgramMap.get(program);
    const blockIndex = mapping.get(uniformsGroup);

    if (this.uboBindings.get(program) !== blockIndex) {

      // bind shader specific block index to global block point
      this.gl.uniformBlockBinding(program, blockIndex, uniformsGroup.__bindingPointIndex);

      this.uboBindings.set(program, blockIndex);

    }

  }

  //

  public reset() {

    // reset state

    this.gl.disable(this.gl.BLEND);
    this.gl.disable(this.gl.CULL_FACE);
    this.gl.disable(this.gl.DEPTH_TEST);
    this.gl.disable(this.gl.POLYGON_OFFSET_FILL);
    this.gl.disable(this.gl.SCISSOR_TEST);
    this.gl.disable(this.gl.STENCIL_TEST);
    this.gl.disable(this.gl.SAMPLE_ALPHA_TO_COVERAGE);

    this.gl.blendEquation(this.gl.FUNC_ADD);
    this.gl.blendFunc(this.gl.ONE, this.gl.ZERO);
    this.gl.blendFuncSeparate(this.gl.ONE, this.gl.ZERO, this.gl.ONE, this.gl.ZERO);
    this.gl.blendColor(0, 0, 0, 0);

    this.gl.colorMask(true, true, true, true);
    this.gl.clearColor(0, 0, 0, 0);

    this.gl.depthMask(true);
    this.gl.depthFunc(this.gl.LESS);

    this.depthBuffer.setReversed(false);

    this.gl.clearDepth(1);

    this.gl.stencilMask(0xffffffff);
    this.gl.stencilFunc(this.gl.ALWAYS, 0, 0xffffffff);
    this.gl.stencilOp(this.gl.KEEP, this.gl.KEEP, this.gl.KEEP);
    this.gl.clearStencil(0);

    this.gl.cullFace(this.gl.BACK);
    this.gl.frontFace(this.gl.CCW);

    this.gl.polygonOffset(0, 0);

    this.gl.activeTexture(this.gl.TEXTURE0);

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this.gl.bindFramebuffer(this.gl.DRAW_FRAMEBUFFER, null);
    this.gl.bindFramebuffer(this.gl.READ_FRAMEBUFFER, null);

    this.gl.useProgram(null);

    this.gl.lineWidth(1);

    this.gl.scissor(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

    // reset internals

    this.enabledCapabilities = {};

    this.currentTextureSlot = null;
    this.currentBoundTextures = {};

    this.currentBoundFramebuffers = {};
    this.currentDrawbuffers = new WeakMap();
    this.defaultDrawbuffers = [];

    this.currentProgram = null;

    this.currentBlendingEnabled = false;
    this.currentBlending = null;
    this.currentBlendEquation = null;
    this.currentBlendSrc = null;
    this.currentBlendDst = null;
    this.currentBlendEquationAlpha = null;
    this.currentBlendSrcAlpha = null;
    this.currentBlendDstAlpha = null;
    this.currentBlendColor = new Color(0, 0, 0);
    this.currentBlendAlpha = 0;
    this.currentPremultipledAlpha = false;

    this.currentFlipSided = null;
    this.currentCullFace = null;

    this.currentLineWidth = null;

    this.currentPolygonOffsetFactor = null;
    this.currentPolygonOffsetUnits = null;

    this.currentScissor.set(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.currentViewport.set(0, 0, this.gl.canvas.width, this.gl.canvas.height);

    this.colorBuffer.reset();
    this.depthBuffer.reset();
    this.stencilBuffer.reset();

  }

}
