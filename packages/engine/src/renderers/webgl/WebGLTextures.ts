import { LinearFilter, LinearMipmapLinearFilter, LinearMipmapNearestFilter, NearestFilter, NearestMipmapLinearFilter, NearestMipmapNearestFilter, RGBAFormat, DepthFormat, DepthStencilFormat, UnsignedIntType, FloatType, MirroredRepeatWrapping, ClampToEdgeWrapping, RepeatWrapping, UnsignedByteType, NoColorSpace, LinearSRGBColorSpace, NeverCompare, AlwaysCompare, LessCompare, LessEqualCompare, EqualCompare, GreaterEqualCompare, GreaterCompare, NotEqualCompare, SRGBTransfer, LinearTransfer, UnsignedShortType, UnsignedInt248Type, ColorSpace, WebGLInternalFormatName } from '../../constants';
import { createElementNS } from '../../utils';
import { ColorManagement } from '../../math/ColorManagement';
import { Vector2 } from '../../math/Vector2';
import { getByteLength } from '../../extras/TextureUtils';
import { WebGLExtensions } from './WebGLExtensions';
import { WebGLCapabilities } from './WebGLCapabilities';
import { WebGLUtils } from './WebGLUtils';
import { WebGLInfo } from './WebGLInfo';
import { WebGLState } from './WebGLState';
import { WebGLProperties } from './WebGLProperties.js';
import { Texture } from '../../textures/Texture.js';
import { Color } from '../../math/Color.js';
import { BaseEvent } from '../../core/EventDispatcher.js';
import { WebGLRenderTarget } from '../WebGLRenderTarget.js';
import { isWebGL3DRenderTarget } from '../WebGL3DRenderTarget';
import { isWebGLArrayRenderTarget } from '../WebGLArrayRenderTarget';

interface WebGLTextureEntry {
  texture: WebGLTexture | null;
  usedTimes: number;
}

interface TextureProperties {
  __webglInit?: boolean;
  __cacheKey?: string;
  __webglTexture: WebGLTexture | null;
  __version: number | null;
}

export class WebGLTextures {


  public _gl: WebGL2RenderingContext;
  public extensions: WebGLExtensions;
  public state: WebGLState;
  public properties: WebGLProperties;
  public capabilities: WebGLCapabilities;
  public utils: WebGLUtils;
  public info: WebGLInfo;


  public multisampledRTTExt: any;
  public supportsInvalidateFramebuffer = typeof navigator === 'undefined' ? false : /OculusBrowser/g.test(navigator.userAgent);

  public _imageDimensions = new Vector2();
  public _videoTextures = new WeakMap();
  public _canvas: any;

  public _sources = new WeakMap(); // maps WebglTexture objects to instances of Source

  // cordova iOS (as of 5.0) still uses UIWebView, which provides OffscreenCanvas,
  // also OffscreenCanvas.getContext("webgl"), but not OffscreenCanvas.getContext("2d")!
  // Some implementations may only implement OffscreenCanvas partially (e.g. lacking 2d).

  public useOffscreenCanvas = false;
  public textureUnits = 0;

  public cm = ColorManagement.instance;

  public readonly wrappingToGL: Record<GLenum, GLenum>;

  public readonly filterToGL: Record<GLenum, GLenum>;

  public readonly compareToGL: Record<GLenum, GLenum>;

  public invalidationArrayRead: GLenum[] = [];
  public invalidationArrayDraw: GLenum[] = [];


  constructor(
    _gl: WebGL2RenderingContext,
    extensions: WebGLExtensions,
    state: WebGLState,
    properties: WebGLProperties,
    capabilities: WebGLCapabilities,
    utils: WebGLUtils,
    info: WebGLInfo
  ) {

    this._gl = _gl;
    this.extensions = extensions;
    this.state = state;
    this.properties = properties;
    this.capabilities = capabilities;
    this.utils = utils;
    this.info = info;

    this.multisampledRTTExt = this.extensions.has('WEBGL_multisampled_render_to_texture') ? this.extensions.get('WEBGL_multisampled_render_to_texture') : null;

    this.wrappingToGL = {
      [RepeatWrapping]: this._gl.REPEAT,
      [ClampToEdgeWrapping]: this._gl.CLAMP_TO_EDGE,
      [MirroredRepeatWrapping]: this._gl.MIRRORED_REPEAT
    };

    this.filterToGL = {
      [NearestFilter]: this._gl.NEAREST,
      [NearestMipmapNearestFilter]: this._gl.NEAREST_MIPMAP_NEAREST,
      [NearestMipmapLinearFilter]: this._gl.NEAREST_MIPMAP_LINEAR,

      [LinearFilter]: this._gl.LINEAR,
      [LinearMipmapNearestFilter]: this._gl.LINEAR_MIPMAP_NEAREST,
      [LinearMipmapLinearFilter]: this._gl.LINEAR_MIPMAP_LINEAR
    };

    this.compareToGL = {
      [NeverCompare]: this._gl.NEVER,
      [AlwaysCompare]: this._gl.ALWAYS,
      [LessCompare]: this._gl.LESS,
      [LessEqualCompare]: this._gl.LEQUAL,
      [EqualCompare]: this._gl.EQUAL,
      [GreaterEqualCompare]: this._gl.GEQUAL,
      [GreaterCompare]: this._gl.GREATER,
      [NotEqualCompare]: this._gl.NOTEQUAL
    };


    try {

      this.useOffscreenCanvas = typeof OffscreenCanvas !== 'undefined'
        // eslint-disable-next-line compat/compat
        && (new OffscreenCanvas(1, 1).getContext('2d')) !== null;

    } catch (err) {

      // Ignore any errors

    }

  }

  public createCanvas(width: number, height: number) {

    // Use OffscreenCanvas when available. Specially needed in web workers

    return this.useOffscreenCanvas ?
      // eslint-disable-next-line compat/compat
      new OffscreenCanvas(width, height) : createElementNS('canvas');

  }

  public resizeImage(
    image: HTMLImageElement | HTMLCanvasElement | ImageBitmap | VideoFrame,
    needsNewCanvas: boolean,
    maxSize: number
  ) {

    let scale = 1;

    const dimensions = this.getDimensions(image);

    // handle case if texture exceeds max size

    if (dimensions.width > maxSize || dimensions.height > maxSize) {

      scale = maxSize / Math.max(dimensions.width, dimensions.height);

    }

    // only perform resize if necessary

    if (scale < 1) {

      // only perform resize for certain image types

      if ((typeof HTMLImageElement !== 'undefined' && image instanceof HTMLImageElement) ||
        (typeof HTMLCanvasElement !== 'undefined' && image instanceof HTMLCanvasElement) ||
        (typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap) ||
        (typeof VideoFrame !== 'undefined' && image instanceof VideoFrame)) {

        const width = Math.floor(scale * dimensions.width);
        const height = Math.floor(scale * dimensions.height);

        if (this._canvas === undefined) this._canvas = this.createCanvas(width, height);

        // cube textures can't reuse the same canvas

        const canvas = needsNewCanvas ? this.createCanvas(width, height) : this._canvas;

        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, width, height);

        console.warn('WebGLRenderer: Texture has been resized from (' + dimensions.width + 'x' + dimensions.height + ') to (' + width + 'x' + height + ').');

        return canvas;

      } else {

        if ('data' in image) {

          console.warn('WebGLRenderer: Image in DataTexture is too big (' + dimensions.width + 'x' + dimensions.height + ').');

        }

        return image;

      }

    }

    return image;

  }

  public textureNeedsGenerateMipmaps(texture: Texture) {

    return texture.generateMipmaps;

  }

  public generateMipmap(target: GLenum): void {

    this._gl.generateMipmap(target);

  }

  public getTargetType(texture: any): GLenum {

    if (texture.isWebGLCubeRenderTarget) return this._gl.TEXTURE_CUBE_MAP;
    if (texture.isWebGL3DRenderTarget) return this._gl.TEXTURE_3D;
    if (texture.isWebGLArrayRenderTarget || texture.isCompressedArrayTexture) return this._gl.TEXTURE_2D_ARRAY;
    return this._gl.TEXTURE_2D;

  }

  public getInternalFormat(
    internalFormatName: WebGLInternalFormatName | null,
    glFormat: GLenum,
    glType: GLenum,
    colorSpace: ColorSpace,
    forceLinearTransfer: boolean = false
  ) {

    if (internalFormatName !== null) {

      if (this._gl[internalFormatName] !== undefined) return this._gl[internalFormatName];

      console.warn('WebGLRenderer: Attempt to use non-existing WebGL internal format \'' + internalFormatName + '\'');

    }

    let internalFormat = glFormat;

    if (glFormat === this._gl.RED) {

      if (glType === this._gl.FLOAT) internalFormat = this._gl.R32F;
      if (glType === this._gl.HALF_FLOAT) internalFormat = this._gl.R16F;
      if (glType === this._gl.UNSIGNED_BYTE) internalFormat = this._gl.R8;

    }

    if (glFormat === this._gl.RED_INTEGER) {

      if (glType === this._gl.UNSIGNED_BYTE) internalFormat = this._gl.R8UI;
      if (glType === this._gl.UNSIGNED_SHORT) internalFormat = this._gl.R16UI;
      if (glType === this._gl.UNSIGNED_INT) internalFormat = this._gl.R32UI;
      if (glType === this._gl.BYTE) internalFormat = this._gl.R8I;
      if (glType === this._gl.SHORT) internalFormat = this._gl.R16I;
      if (glType === this._gl.INT) internalFormat = this._gl.R32I;

    }

    if (glFormat === this._gl.RG) {

      if (glType === this._gl.FLOAT) internalFormat = this._gl.RG32F;
      if (glType === this._gl.HALF_FLOAT) internalFormat = this._gl.RG16F;
      if (glType === this._gl.UNSIGNED_BYTE) internalFormat = this._gl.RG8;

    }

    if (glFormat === this._gl.RG_INTEGER) {

      if (glType === this._gl.UNSIGNED_BYTE) internalFormat = this._gl.RG8UI;
      if (glType === this._gl.UNSIGNED_SHORT) internalFormat = this._gl.RG16UI;
      if (glType === this._gl.UNSIGNED_INT) internalFormat = this._gl.RG32UI;
      if (glType === this._gl.BYTE) internalFormat = this._gl.RG8I;
      if (glType === this._gl.SHORT) internalFormat = this._gl.RG16I;
      if (glType === this._gl.INT) internalFormat = this._gl.RG32I;

    }

    if (glFormat === this._gl.RGB_INTEGER) {

      if (glType === this._gl.UNSIGNED_BYTE) internalFormat = this._gl.RGB8UI;
      if (glType === this._gl.UNSIGNED_SHORT) internalFormat = this._gl.RGB16UI;
      if (glType === this._gl.UNSIGNED_INT) internalFormat = this._gl.RGB32UI;
      if (glType === this._gl.BYTE) internalFormat = this._gl.RGB8I;
      if (glType === this._gl.SHORT) internalFormat = this._gl.RGB16I;
      if (glType === this._gl.INT) internalFormat = this._gl.RGB32I;

    }

    if (glFormat === this._gl.RGBA_INTEGER) {

      if (glType === this._gl.UNSIGNED_BYTE) internalFormat = this._gl.RGBA8UI;
      if (glType === this._gl.UNSIGNED_SHORT) internalFormat = this._gl.RGBA16UI;
      if (glType === this._gl.UNSIGNED_INT) internalFormat = this._gl.RGBA32UI;
      if (glType === this._gl.BYTE) internalFormat = this._gl.RGBA8I;
      if (glType === this._gl.SHORT) internalFormat = this._gl.RGBA16I;
      if (glType === this._gl.INT) internalFormat = this._gl.RGBA32I;

    }

    if (glFormat === this._gl.RGB) {

      if (glType === this._gl.UNSIGNED_INT_5_9_9_9_REV) internalFormat = this._gl.RGB9_E5;
      if (glType === this._gl.UNSIGNED_INT_10F_11F_11F_REV) internalFormat = this._gl.R11F_G11F_B10F;

    }

    if (glFormat === this._gl.RGBA) {

      const transfer = forceLinearTransfer ? LinearTransfer : this.cm.getTransfer(colorSpace);

      if (glType === this._gl.FLOAT) internalFormat = this._gl.RGBA32F;
      if (glType === this._gl.HALF_FLOAT) internalFormat = this._gl.RGBA16F;
      if (glType === this._gl.UNSIGNED_BYTE) internalFormat = (transfer === SRGBTransfer) ? this._gl.SRGB8_ALPHA8 : this._gl.RGBA8;
      if (glType === this._gl.UNSIGNED_SHORT_4_4_4_4) internalFormat = this._gl.RGBA4;
      if (glType === this._gl.UNSIGNED_SHORT_5_5_5_1) internalFormat = this._gl.RGB5_A1;

    }

    if (internalFormat === this._gl.R16F || internalFormat === this._gl.R32F ||
      internalFormat === this._gl.RG16F || internalFormat === this._gl.RG32F ||
      internalFormat === this._gl.RGBA16F || internalFormat === this._gl.RGBA32F) {

      this.extensions.get('EXT_color_buffer_float');

    }

    return internalFormat;

  }

  public getInternalDepthFormat(useStencil: boolean, depthType: GLenum | null): GLenum {

    let glInternalFormat;
    if (useStencil) {

      if (depthType === null || depthType === UnsignedIntType || depthType === UnsignedInt248Type) {

        glInternalFormat = this._gl.DEPTH24_STENCIL8;

      } else if (depthType === FloatType) {

        glInternalFormat = this._gl.DEPTH32F_STENCIL8;

      } else if (depthType === UnsignedShortType) {

        glInternalFormat = this._gl.DEPTH24_STENCIL8;
        console.warn('DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.');

      }

    } else {

      if (depthType === null || depthType === UnsignedIntType || depthType === UnsignedInt248Type) {

        glInternalFormat = this._gl.DEPTH_COMPONENT24;

      } else if (depthType === FloatType) {

        glInternalFormat = this._gl.DEPTH_COMPONENT32F;

      } else if (depthType === UnsignedShortType) {

        glInternalFormat = this._gl.DEPTH_COMPONENT16;

      }

    }

    if (glInternalFormat === undefined) {
      // 🚨 Impossible state → explicit error
      throw new Error(`Unsupported depth texture type: ${depthType}`);
    }

    return glInternalFormat;

  }

  public getMipLevels(texture: Texture, image: { width: number, height: number, mipmaps: any[] }) {

    if (this.textureNeedsGenerateMipmaps(texture) === true || (texture.isFramebufferTexture && texture.minFilter !== NearestFilter && texture.minFilter !== LinearFilter)) {

      return Math.log2(Math.max(image.width, image.height)) + 1;

    } else if (texture.mipmaps !== undefined && texture.mipmaps.length > 0) {

      // user-defined mipmaps

      return texture.mipmaps.length;

    } else if (texture.isCompressedTexture && Array.isArray(texture.image)) {

      return image.mipmaps.length;

    } else {

      // texture without mipmaps (only base level)

      return 1;

    }

  }

  //

  public onTextureDispose(event: BaseEvent) {

    const texture = event.target;

    texture.removeEventListener('dispose', this.onTextureDispose);

    this.deallocateTexture(texture);

    if (texture.isVideoTexture) {

      this._videoTextures.delete(texture);

    }

  }

  public onRenderTargetDispose(event: BaseEvent) {

    const renderTarget = event.target;

    renderTarget.removeEventListener('dispose', this.onRenderTargetDispose);

    this.deallocateRenderTarget(renderTarget);

  }

  //

  public deallocateTexture(texture: Texture) {

    const textureProperties = this.properties.get(texture);

    if (textureProperties.__webglInit === undefined) return;

    // check if it's necessary to remove the WebGLTexture object

    const source = texture.source;
    const webglTextures = this._sources.get(source);

    if (webglTextures) {

      const webglTexture = webglTextures[textureProperties.__cacheKey];
      webglTexture.usedTimes--;

      // the WebGLTexture object is not used anymore, remove it

      if (webglTexture.usedTimes === 0) {

        this.deleteTexture(texture);

      }

      // remove the weak map entry if no WebGLTexture uses the source anymore

      if (Object.keys(webglTextures).length === 0) {

        this._sources.delete(source);

      }

    }

    this.properties.remove(texture);

  }

  public deleteTexture(texture: Texture) {

    const textureProperties = this.properties.get(texture);
    this._gl.deleteTexture(textureProperties.__webglTexture);

    const source = texture.source;
    const webglTextures = this._sources.get(source);
    delete webglTextures[textureProperties.__cacheKey];

    this.info.memory.textures--;

  }

  public deallocateRenderTarget(renderTarget: WebGLRenderTarget) {

    const renderTargetProperties = this.properties.get(renderTarget);

    if (renderTarget.depthTexture) {

      renderTarget.depthTexture.dispose();

      this.properties.remove(renderTarget.depthTexture);

    }

    if ('isWebGLCubeRenderTarget' in renderTarget) {

      for (let i = 0; i < 6; i++) {

        if (Array.isArray(renderTargetProperties.__webglFramebuffer[i])) {

          for (let level = 0; level < renderTargetProperties.__webglFramebuffer[i].length; level++) this._gl.deleteFramebuffer(renderTargetProperties.__webglFramebuffer[i][level]);

        } else {

          this._gl.deleteFramebuffer(renderTargetProperties.__webglFramebuffer[i]);

        }

        if (renderTargetProperties.__webglDepthbuffer) this._gl.deleteRenderbuffer(renderTargetProperties.__webglDepthbuffer[i]);

      }

    } else {

      if (Array.isArray(renderTargetProperties.__webglFramebuffer)) {

        for (let level = 0; level < renderTargetProperties.__webglFramebuffer.length; level++) this._gl.deleteFramebuffer(renderTargetProperties.__webglFramebuffer[level]);

      } else {

        this._gl.deleteFramebuffer(renderTargetProperties.__webglFramebuffer);

      }

      if (renderTargetProperties.__webglDepthbuffer) this._gl.deleteRenderbuffer(renderTargetProperties.__webglDepthbuffer);
      if (renderTargetProperties.__webglMultisampledFramebuffer) this._gl.deleteFramebuffer(renderTargetProperties.__webglMultisampledFramebuffer);

      if (renderTargetProperties.__webglColorRenderbuffer) {

        for (let i = 0; i < renderTargetProperties.__webglColorRenderbuffer.length; i++) {

          if (renderTargetProperties.__webglColorRenderbuffer[i]) this._gl.deleteRenderbuffer(renderTargetProperties.__webglColorRenderbuffer[i]);

        }

      }

      if (renderTargetProperties.__webglDepthRenderbuffer) this._gl.deleteRenderbuffer(renderTargetProperties.__webglDepthRenderbuffer);

    }

    const textures = renderTarget.textures;

    for (let i = 0, il = textures.length; i < il; i++) {

      const attachmentProperties = this.properties.get(textures[i]);

      if (attachmentProperties.__webglTexture) {

        this._gl.deleteTexture(attachmentProperties.__webglTexture);

        this.info.memory.textures--;

      }

      this.properties.remove(textures[i]);

    }

    this.properties.remove(renderTarget);

  }

  //

  public resetTextureUnits() {

    this.textureUnits = 0;

  }

  public allocateTextureUnit() {

    const textureUnit = this.textureUnits;

    if (textureUnit >= this.capabilities.maxTextures) {

      console.warn('WebGLTextures: Trying to use ' + textureUnit + ' texture units while this GPU supports only ' + this.capabilities.maxTextures);

    }

    this.textureUnits += 1;

    return textureUnit;

  }

  public getTextureCacheKey(texture: Texture) {

    const array = [];

    array.push(texture.wrapS);
    array.push(texture.wrapT);
    array.push(texture.wrapR || 0);
    array.push(texture.magFilter);
    array.push(texture.minFilter);
    array.push(texture.anisotropy);
    array.push(texture.internalFormat);
    array.push(texture.format);
    array.push(texture.type);
    array.push(texture.generateMipmaps);
    array.push(texture.premultiplyAlpha);
    array.push(texture.flipY);
    array.push(texture.unpackAlignment);
    array.push(texture.colorSpace);

    return array.join();

  }

  //

  public setTexture2D(texture: Texture, slot: number) {
    // TODO: check if there's a better way to do it instead of using as TextureProperties
    const textureProperties = this.properties.get(texture) as TextureProperties;

    if (texture.isVideoTexture) this.updateVideoTexture(texture);

    if (texture.isRenderTargetTexture === false && texture.isExternalTexture !== true && texture.version > 0 && textureProperties.__version !== texture.version) {

      const image = texture.image;

      if (image === null) {

        console.warn('WebGLRenderer: Texture marked for update but no image data found.');

      } else if (image.complete === false) {

        console.warn('WebGLRenderer: Texture marked for update but image is incomplete');

      } else {

        this.uploadTexture(textureProperties, texture, slot);
        return;

      }

    } else if (texture.isExternalTexture) {

      textureProperties.__webglTexture = texture.sourceTexture ? texture.sourceTexture : null;

    }

    this.state.bindTexture(this._gl.TEXTURE_2D, textureProperties.__webglTexture, this._gl.TEXTURE0 + slot);

  }

  public setTexture2DArray(texture: Texture, slot: number) {

    const textureProperties = this.properties.get(texture) as TextureProperties;

    if (texture.isRenderTargetTexture === false && texture.version > 0 && textureProperties.__version !== texture.version) {

      this.uploadTexture(textureProperties, texture, slot);
      return;

    }

    this.state.bindTexture(this._gl.TEXTURE_2D_ARRAY, textureProperties.__webglTexture, this._gl.TEXTURE0 + slot);

  }

  public setTexture3D(texture: Texture, slot: number) {

    const textureProperties = this.properties.get(texture) as TextureProperties;

    if (texture.isRenderTargetTexture === false && texture.version > 0 && textureProperties.__version !== texture.version) {

      this.uploadTexture(textureProperties, texture, slot);
      return;

    }

    this.state.bindTexture(this._gl.TEXTURE_3D, textureProperties.__webglTexture, this._gl.TEXTURE0 + slot);

  }

  public setTextureCube(texture: Texture, slot: number) {

    const textureProperties = this.properties.get(texture) as TextureProperties;

    if (texture.version > 0 && textureProperties.__version !== texture.version) {

      this.uploadCubeTexture(textureProperties, texture, slot);
      return;

    }

    this.state.bindTexture(this._gl.TEXTURE_CUBE_MAP, textureProperties.__webglTexture, this._gl.TEXTURE0 + slot);

  }


  public setTextureParameters(textureType: GLenum, texture: Texture) {

    if (texture.type === FloatType && this.extensions.has('OES_texture_float_linear') === false &&
      (texture.magFilter === LinearFilter || texture.magFilter === LinearMipmapNearestFilter || texture.magFilter === NearestMipmapLinearFilter || texture.magFilter === LinearMipmapLinearFilter ||
        texture.minFilter === LinearFilter || texture.minFilter === LinearMipmapNearestFilter || texture.minFilter === NearestMipmapLinearFilter || texture.minFilter === LinearMipmapLinearFilter)) {

      console.warn('WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.');

    }

    this._gl.texParameteri(textureType, this._gl.TEXTURE_WRAP_S, this.wrappingToGL[texture.wrapS]);
    this._gl.texParameteri(textureType, this._gl.TEXTURE_WRAP_T, this.wrappingToGL[texture.wrapT]);

    if (textureType === this._gl.TEXTURE_3D || textureType === this._gl.TEXTURE_2D_ARRAY) {

      this._gl.texParameteri(textureType, this._gl.TEXTURE_WRAP_R, this.wrappingToGL[texture.wrapR]);

    }

    this._gl.texParameteri(textureType, this._gl.TEXTURE_MAG_FILTER, this.filterToGL[texture.magFilter]);
    this._gl.texParameteri(textureType, this._gl.TEXTURE_MIN_FILTER, this.filterToGL[texture.minFilter]);

    if (texture.comparepublic) {

      this._gl.texParameteri(textureType, this._gl.TEXTURE_COMPARE_MODE, this._gl.COMPARE_REF_TO_TEXTURE);
      this._gl.texParameteri(textureType, this._gl.TEXTURE_COMPARE_FUNC, this.compareToGL[texture.comparepublic]);

    }

    if (this.extensions.has('EXT_texture_filter_anisotropic') === true) {

      if (texture.magFilter === NearestFilter) return;
      if (texture.minFilter !== NearestMipmapLinearFilter && texture.minFilter !== LinearMipmapLinearFilter) return;
      if (texture.type === FloatType && this.extensions.has('OES_texture_float_linear') === false) return; // verify extension

      if (texture.anisotropy > 1 || this.properties.get(texture).__currentAnisotropy) {

        const extension = this.extensions.get('EXT_texture_filter_anisotropic');
        this._gl.texParameterf(textureType, extension.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(texture.anisotropy, this.capabilities.getMaxAnisotropy()));
        this.properties.get(texture).__currentAnisotropy = texture.anisotropy;

      }

    }

  }

  public initTexture(textureProperties: TextureProperties, texture: Texture) {

    let forceUpload = false;

    if (textureProperties.__webglInit === undefined) {

      textureProperties.__webglInit = true;

      texture.addEventListener('dispose', this.onTextureDispose);

    }

    // create Source <-> WebGLTextures mapping if necessary

    const source = texture.source;
    let webglTextures = this._sources.get(source);

    if (webglTextures === undefined) {

      webglTextures = {};
      this._sources.set(source, webglTextures);

    }

    // check if there is already a WebGLTexture object for the given texture parameters

    const textureCacheKey = this.getTextureCacheKey(texture);

    if (textureCacheKey !== textureProperties.__cacheKey) {

      // if not, create a new instance of WebGLTexture

      if (webglTextures[textureCacheKey] === undefined) {

        // create new entry

        webglTextures[textureCacheKey] = {
          texture: this._gl.createTexture(),
          usedTimes: 0
        };

        this.info.memory.textures++;

        // when a new instance of WebGLTexture was created, a texture upload is required
        // even if the image contents are identical

        forceUpload = true;

      }

      webglTextures[textureCacheKey].usedTimes++;

      // every time the texture cache key changes, it's necessary to check if an instance of
      // WebGLTexture can be deleted in order to avoid a memory leak.

      const cacheKey = textureProperties.__cacheKey;
      if (cacheKey !== undefined) {

        const webglTexture = webglTextures[cacheKey];

        if (webglTexture !== undefined) {

          webglTextures[cacheKey].usedTimes--;

          if (webglTexture.usedTimes === 0) {

            this.deleteTexture(texture);

          }

        }
      }

      // store references to cache key and WebGLTexture object

      textureProperties.__cacheKey = textureCacheKey;
      textureProperties.__webglTexture = webglTextures[textureCacheKey].texture;

    }

    return forceUpload;

  }

  public getRow(
    index: number,
    rowLength: number,
    componentStride: number
  ) {

    return Math.floor(Math.floor(index / componentStride) / rowLength);

  }

  public updateTexture(
    texture: Texture,
    image: any,
    glFormat: GLenum,
    glType: GLenum
  ) {

    const componentStride = 4; // only RGBA supported

    const updateRanges = texture.updateRanges;

    if (updateRanges.length === 0) {

      this.state.texSubImage2D(this._gl.TEXTURE_2D, 0, 0, 0, glFormat, glType, null, image.width, image.height, image.data);

    } else {

      // Before applying update ranges, we merge any adjacent / overlapping
      // ranges to reduce load on `gl.texSubImage2D`. Empirically, this has led
      // to performance improvements for applications which make heavy use of
      // update ranges. Likely due to GPU command overhead.
      //
      // Note that to reduce garbage collection between frames, we merge the
      // update ranges in-place. This is safe because this method will clear the
      // update ranges once updated.

      updateRanges.sort((a, b) => a.start - b.start);

      // To merge the update ranges in-place, we work from left to right in the
      // existing updateRanges array, merging ranges. This may result in a final
      // array which is smaller than the original. This index tracks the last
      // index representing a merged range, any data after this index can be
      // trimmed once the merge algorithm is completed.
      let mergeIndex = 0;

      for (let i = 1; i < updateRanges.length; i++) {

        const previousRange = updateRanges[mergeIndex];
        const range = updateRanges[i];

        // Only merge if in the same row and overlapping/adjacent
        const previousEnd = previousRange.start + previousRange.count;
        const currentRow = this.getRow(range.start, image.width, componentStride);
        const previousRow = this.getRow(previousRange.start, image.width, componentStride);

        // We add one here to merge adjacent ranges. This is safe because ranges
        // operate over positive integers.
        if (
          range.start <= previousEnd + 1 &&
          currentRow === previousRow &&
          this.getRow(range.start + range.count - 1, image.width, componentStride) === currentRow // ensure range doesn't spill
        ) {

          previousRange.count = Math.max(
            previousRange.count,
            range.start + range.count - previousRange.start
          );

        } else {

          ++mergeIndex;
          updateRanges[mergeIndex] = range;

        }


      }

      // Trim the array to only contain the merged ranges.
      updateRanges.length = mergeIndex + 1;

      const currentUnpackRowLen = this._gl.getParameter(this._gl.UNPACK_ROW_LENGTH);
      const currentUnpackSkipPixels = this._gl.getParameter(this._gl.UNPACK_SKIP_PIXELS);
      const currentUnpackSkipRows = this._gl.getParameter(this._gl.UNPACK_SKIP_ROWS);

      this._gl.pixelStorei(this._gl.UNPACK_ROW_LENGTH, image.width);

      for (let i = 0, l = updateRanges.length; i < l; i++) {

        const range = updateRanges[i];

        const pixelStart = Math.floor(range.start / componentStride);
        const pixelCount = Math.ceil(range.count / componentStride);

        const x = pixelStart % image.width;
        const y = Math.floor(pixelStart / image.width);

        // Assumes update ranges refer to contiguous memory
        const width = pixelCount;
        const height = 1;

        this._gl.pixelStorei(this._gl.UNPACK_SKIP_PIXELS, x);
        this._gl.pixelStorei(this._gl.UNPACK_SKIP_ROWS, y);

        this.state.texSubImage2D(this._gl.TEXTURE_2D, 0, x, y, glFormat, glType, null, width, height, image.data);

      }

      texture.clearUpdateRanges();

      this._gl.pixelStorei(this._gl.UNPACK_ROW_LENGTH, currentUnpackRowLen);
      this._gl.pixelStorei(this._gl.UNPACK_SKIP_PIXELS, currentUnpackSkipPixels);
      this._gl.pixelStorei(this._gl.UNPACK_SKIP_ROWS, currentUnpackSkipRows);

    }

  }

  public uploadTexture(
    textureProperties: TextureProperties,
    texture: Texture,
    slot: number
  ) {

    let textureType: GLenum = this._gl.TEXTURE_2D;

    if (texture.isDataArrayTexture || texture.isCompressedArrayTexture) textureType = this._gl.TEXTURE_2D_ARRAY;
    if (texture.isData3DTexture) textureType = this._gl.TEXTURE_3D;

    const forceUpload = this.initTexture(textureProperties, texture);
    const source = texture.source;

    this.state.bindTexture(textureType, textureProperties.__webglTexture, this._gl.TEXTURE0 + slot);

    const sourceProperties = this.properties.get(source);

    if (source.version !== sourceProperties.__version || forceUpload === true) {

      this.state.activeTexture(this._gl.TEXTURE0 + slot);

      const workingPrimaries = this.cm.getPrimaries(this.cm.workingColorSpace);
      const texturePrimaries = texture.colorSpace === NoColorSpace ? null : this.cm.getPrimaries(texture.colorSpace);
      const unpackConversion = texture.colorSpace === NoColorSpace || workingPrimaries === texturePrimaries ? this._gl.NONE : this._gl.BROWSER_DEFAULT_WEBGL;

      this._gl.pixelStorei(this._gl.UNPACK_FLIP_Y_WEBGL, texture.flipY);
      this._gl.pixelStorei(this._gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultiplyAlpha);
      this._gl.pixelStorei(this._gl.UNPACK_ALIGNMENT, texture.unpackAlignment);
      this._gl.pixelStorei(this._gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, unpackConversion);

      let image = this.resizeImage(texture.image, false, this.capabilities.maxTextureSize);
      image = this.verifyColorSpace(texture, image);

      const glFormat = this.utils.convert(texture.format, texture.colorSpace);

      const glType = this.utils.convert(texture.type);

      if (glFormat === null || glType == null) {
        throw new Error('Unsupported texture format');
      }

      let glInternalFormat = this.getInternalFormat(texture.internalFormat, glFormat, glType, texture.colorSpace, texture.isVideoTexture);

      this.setTextureParameters(textureType, texture);

      let mipmap;
      const mipmaps = texture.mipmaps;

      const useTexStorage = (texture.isVideoTexture !== true);
      const allocateMemory = (sourceProperties.__version === undefined) || (forceUpload === true);
      const dataReady = source.dataReady;
      const levels = this.getMipLevels(texture, image);

      if (texture.isDepthTexture) {

        glInternalFormat = this.getInternalDepthFormat(texture.format === DepthStencilFormat, texture.type);

        //

        if (allocateMemory) {

          if (useTexStorage) {

            this.state.texStorage2D(this._gl.TEXTURE_2D, 1, glInternalFormat, image.width, image.height);

          } else {

            this.state.texImage2D(this._gl.TEXTURE_2D, 0, glInternalFormat, glFormat, glType, null, image.width, image.height, 0, null);

          }

        }

      } else if (texture.isDataTexture) {

        // use manually created mipmaps if available
        // if there are no manual mipmaps
        // set 0 level mipmap and then use GL to generate other mipmap levels

        if (mipmaps.length > 0) {

          if (useTexStorage && allocateMemory) {

            this.state.texStorage2D(this._gl.TEXTURE_2D, levels, glInternalFormat, mipmaps[0].width, mipmaps[0].height);

          }

          for (let i = 0, il = mipmaps.length; i < il; i++) {

            mipmap = mipmaps[i];

            if (useTexStorage) {

              if (dataReady) {

                this.state.texSubImage2D(this._gl.TEXTURE_2D, i, 0, 0, glFormat, glType, null, mipmap.width, mipmap.height, mipmap.data);

              }

            } else {

              this.state.texImage2D(this._gl.TEXTURE_2D, i, glInternalFormat, glFormat, glType, null, mipmap.width, mipmap.height, 0, mipmap.data);

            }

          }

          texture.generateMipmaps = false;

        } else {

          if (useTexStorage) {

            if (allocateMemory) {

              this.state.texStorage2D(this._gl.TEXTURE_2D, levels, glInternalFormat, image.width, image.height);

            }

            if (dataReady) {

              this.updateTexture(texture, image, glFormat, glType);

            }

          } else {

            this.state.texImage2D(this._gl.TEXTURE_2D, 0, glInternalFormat, glFormat, glType, null, image.width, image.height, 0, image.data);

          }

        }

      } else if (texture.isCompressedTexture) {

        if (texture.isCompressedArrayTexture) {

          if (useTexStorage && allocateMemory) {

            this.state.texStorage3D(this._gl.TEXTURE_2D_ARRAY, levels, glInternalFormat, mipmaps[0].width, mipmaps[0].height, image.depth);

          }

          for (let i = 0, il = mipmaps.length; i < il; i++) {

            mipmap = mipmaps[i];

            if (texture.format !== RGBAFormat) {

              if (glFormat !== null) {

                if (useTexStorage) {

                  if (dataReady) {

                    if (texture.layerUpdates.size > 0) {

                      const layerByteLength = getByteLength(mipmap.width, mipmap.height, texture.format, texture.type);

                      for (const layerIndex of texture.layerUpdates) {

                        const layerData = mipmap.data.subarray(
                          layerIndex * layerByteLength / mipmap.data.BYTES_PER_ELEMENT,
                          (layerIndex + 1) * layerByteLength / mipmap.data.BYTES_PER_ELEMENT
                        );
                        this.state.compressedTexSubImage3D(this._gl.TEXTURE_2D_ARRAY, i, 0, 0, layerIndex, mipmap.width, mipmap.height, 1, glFormat, layerData);

                      }

                      texture.clearLayerUpdates();

                    } else {

                      this.state.compressedTexSubImage3D(this._gl.TEXTURE_2D_ARRAY, i, 0, 0, 0, mipmap.width, mipmap.height, image.depth, glFormat, mipmap.data);

                    }

                  }

                } else {

                  this.state.compressedTexImage3D(this._gl.TEXTURE_2D_ARRAY, i, glInternalFormat, mipmap.width, mipmap.height, image.depth, 0, mipmap.data);

                }

              } else {

                console.warn('WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()');

              }

            } else {

              if (useTexStorage) {

                if (dataReady) {

                  this.state.texSubImage3D(this._gl.TEXTURE_2D_ARRAY, i, 0, 0, 0, mipmap.width, mipmap.height, image.depth, glFormat, glType, mipmap.data);

                }

              } else {

                this.state.texImage3D(this._gl.TEXTURE_2D_ARRAY, i, glInternalFormat, mipmap.width, mipmap.height, image.depth, 0, glFormat, glType, mipmap.data);

              }

            }

          }

        } else {

          if (useTexStorage && allocateMemory) {

            this.state.texStorage2D(this._gl.TEXTURE_2D, levels, glInternalFormat, mipmaps[0].width, mipmaps[0].height);

          }

          for (let i = 0, il = mipmaps.length; i < il; i++) {

            mipmap = mipmaps[i];

            if (texture.format !== RGBAFormat) {

              if (glFormat !== null) {

                if (useTexStorage) {

                  if (dataReady) {

                    this.state.compressedTexSubImage2D(this._gl.TEXTURE_2D, i, 0, 0, mipmap.width, mipmap.height, glFormat, mipmap.data);

                  }

                } else {

                  this.state.compressedTexImage2D(this._gl.TEXTURE_2D, i, glInternalFormat, mipmap.width, mipmap.height, 0, mipmap.data);

                }

              } else {

                console.warn('WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()');

              }

            } else {

              if (useTexStorage) {

                if (dataReady) {

                  this.state.texSubImage2D(this._gl.TEXTURE_2D, i, 0, 0, glFormat, glType, null, mipmap.width, mipmap.height, mipmap.data);

                }

              } else {

                this.state.texImage2D(this._gl.TEXTURE_2D, i, glInternalFormat, glFormat, glType, null, mipmap.width, mipmap.height, 0, mipmap.data);

              }

            }

          }

        }

      } else if (texture.isDataArrayTexture) {

        if (useTexStorage) {

          if (allocateMemory) {

            this.state.texStorage3D(this._gl.TEXTURE_2D_ARRAY, levels, glInternalFormat, image.width, image.height, image.depth);

          }

          if (dataReady) {

            if (texture.layerUpdates.size > 0) {

              const layerByteLength = getByteLength(image.width, image.height, texture.format, texture.type);

              for (const layerIndex of texture.layerUpdates) {

                const layerData = image.data.subarray(
                  layerIndex * layerByteLength / image.data.BYTES_PER_ELEMENT,
                  (layerIndex + 1) * layerByteLength / image.data.BYTES_PER_ELEMENT
                );
                this.state.texSubImage3D(this._gl.TEXTURE_2D_ARRAY, 0, 0, 0, layerIndex, image.width, image.height, 1, glFormat, glType, layerData);

              }

              texture.clearLayerUpdates();

            } else {

              this.state.texSubImage3D(this._gl.TEXTURE_2D_ARRAY, 0, 0, 0, 0, image.width, image.height, image.depth, glFormat, glType, image.data);

            }

          }

        } else {

          this.state.texImage3D(this._gl.TEXTURE_2D_ARRAY, 0, glInternalFormat, image.width, image.height, image.depth, 0, glFormat, glType, image.data);

        }

      } else if (texture.isData3DTexture) {

        if (useTexStorage) {

          if (allocateMemory) {

            this.state.texStorage3D(this._gl.TEXTURE_3D, levels, glInternalFormat, image.width, image.height, image.depth);

          }

          if (dataReady) {

            this.state.texSubImage3D(this._gl.TEXTURE_3D, 0, 0, 0, 0, image.width, image.height, image.depth, glFormat, glType, image.data);

          }

        } else {

          this.state.texImage3D(this._gl.TEXTURE_3D, 0, glInternalFormat, image.width, image.height, image.depth, 0, glFormat, glType, image.data);

        }

      } else if (texture.isFramebufferTexture) {

        if (allocateMemory) {

          if (useTexStorage) {

            this.state.texStorage2D(this._gl.TEXTURE_2D, levels, glInternalFormat, image.width, image.height);

          } else {

            let width = image.width, height = image.height;

            for (let i = 0; i < levels; i++) {

              this.state.texImage2D(this._gl.TEXTURE_2D, i, glInternalFormat, glFormat, glType, null, width, height, 0, null);

              width >>= 1;
              height >>= 1;

            }

          }

        }

      } else {

        // regular Texture (image, video, canvas)

        // use manually created mipmaps if available
        // if there are no manual mipmaps
        // set 0 level mipmap and then use GL to generate other mipmap levels

        if (mipmaps.length > 0) {

          if (useTexStorage && allocateMemory) {

            const dimensions = this.getDimensions(mipmaps[0]);

            this.state.texStorage2D(this._gl.TEXTURE_2D, levels, glInternalFormat, dimensions.width, dimensions.height);

          }

          for (let i = 0, il = mipmaps.length; i < il; i++) {

            mipmap = mipmaps[i];

            if (useTexStorage) {

              if (dataReady) {

                this.state.texSubImage2D(this._gl.TEXTURE_2D, i, 0, 0, glFormat, glType, null, mipmap.width, mipmap.height, mipmap.data);

              }

            } else {

              this.state.texImage2D(this._gl.TEXTURE_2D, i, glInternalFormat, glFormat, glType, null, mipmap.width, mipmap.height, 0, mipmap.data);

            }

          }

          texture.generateMipmaps = false;

        } else {

          if (useTexStorage) {

            if (allocateMemory) {

              const dimensions = this.getDimensions(image);

              this.state.texStorage2D(this._gl.TEXTURE_2D, levels, glInternalFormat, dimensions.width, dimensions.height);

            }

            if (dataReady) {

              this.state.texSubImage2D(this._gl.TEXTURE_2D, 0, 0, 0, glFormat, glType, image, image.width, image.height, null);

            }

          } else {

            this.state.texImage2D(this._gl.TEXTURE_2D, 0, glInternalFormat, glFormat, glType, image, image.width, image.height, 0, null);

          }

        }

      }

      if (this.textureNeedsGenerateMipmaps(texture)) {

        this.generateMipmap(textureType);

      }

      sourceProperties.__version = source.version;

      // if (texture.onUpdate) texture.onUpdate(texture);
      if (texture.onUpdate) texture.onUpdate();

    }

    textureProperties.__version = texture.version;

  }

  public uploadCubeTexture(
    textureProperties: TextureProperties,
    texture: Texture,
    slot: number
  ) {

    if (texture.image.length !== 6) return;

    const forceUpload = this.initTexture(textureProperties, texture);
    const source = texture.source;

    this.state.bindTexture(this._gl.TEXTURE_CUBE_MAP, textureProperties.__webglTexture, this._gl.TEXTURE0 + slot);

    const sourceProperties = this.properties.get(source);

    if (source.version !== sourceProperties.__version || forceUpload === true) {

      this.state.activeTexture(this._gl.TEXTURE0 + slot);

      const workingPrimaries = this.cm.getPrimaries(this.cm.workingColorSpace);
      const texturePrimaries = texture.colorSpace === NoColorSpace ? null : this.cm.getPrimaries(texture.colorSpace);
      const unpackConversion = texture.colorSpace === NoColorSpace || workingPrimaries === texturePrimaries ? this._gl.NONE : this._gl.BROWSER_DEFAULT_WEBGL;

      this._gl.pixelStorei(this._gl.UNPACK_FLIP_Y_WEBGL, texture.flipY);
      this._gl.pixelStorei(this._gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultiplyAlpha);
      this._gl.pixelStorei(this._gl.UNPACK_ALIGNMENT, texture.unpackAlignment);
      this._gl.pixelStorei(this._gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, unpackConversion);

      const isCompressed = (texture.isCompressedTexture || texture.image[0].isCompressedTexture);
      const isDataTexture = (texture.image[0] && texture.image[0].isDataTexture);

      const cubeImage = [];

      for (let i = 0; i < 6; i++) {

        if (!isCompressed && !isDataTexture) {

          cubeImage[i] = this.resizeImage(texture.image[i], true, this.capabilities.maxCubemapSize);

        } else {

          cubeImage[i] = isDataTexture ? texture.image[i].image : texture.image[i];

        }

        cubeImage[i] = this.verifyColorSpace(texture, cubeImage[i]);

      }

      const image = cubeImage[0];
      const glFormat = this.utils.convert(texture.format, texture.colorSpace);
      const glType = this.utils.convert(texture.type);

      if (glFormat === null || glType === null) {
        console.warn('Unsupported texture format/type');
        return;
      }

      const glInternalFormat = this.getInternalFormat(texture.internalFormat, glFormat, glType, texture.colorSpace);

      const useTexStorage = (texture.isVideoTexture !== true);
      const allocateMemory = (sourceProperties.__version === undefined) || (forceUpload === true);
      const dataReady = source.dataReady;
      let levels = this.getMipLevels(texture, image);

      this.setTextureParameters(this._gl.TEXTURE_CUBE_MAP, texture);

      let mipmaps;

      if (isCompressed) {

        if (useTexStorage && allocateMemory) {

          this.state.texStorage2D(this._gl.TEXTURE_CUBE_MAP, levels, glInternalFormat, image.width, image.height);

        }

        for (let i = 0; i < 6; i++) {

          mipmaps = cubeImage[i].mipmaps;

          for (let j = 0; j < mipmaps.length; j++) {

            const mipmap = mipmaps[j];

            if (texture.format !== RGBAFormat) {

              if (glFormat !== null) {

                if (useTexStorage) {

                  if (dataReady) {

                    this.state.compressedTexSubImage2D(this._gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, j, 0, 0, mipmap.width, mipmap.height, glFormat, mipmap.data);

                  }

                } else {

                  this.state.compressedTexImage2D(this._gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, j, glInternalFormat, mipmap.width, mipmap.height, 0, mipmap.data);

                }

              } else {

                console.warn('WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()');

              }

            } else {

              if (useTexStorage) {

                if (dataReady) {

                  this.state.texSubImage2D(this._gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, j, 0, 0, glFormat, glType, null, mipmap.width, mipmap.height, mipmap.data);

                }

              } else {

                this.state.texImage2D(this._gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, j, glInternalFormat, glFormat, glType, null, mipmap.width, mipmap.height, 0, mipmap.data);

              }

            }

          }

        }

      } else {

        mipmaps = texture.mipmaps;

        if (useTexStorage && allocateMemory) {

          // TODO: Uniformly handle mipmap definitions
          // Normal textures and compressed cube textures define base level + mips with their mipmap array
          // Uncompressed cube textures use their mipmap array only for mips (no base level)

          if (mipmaps.length > 0) levels++;

          const dimensions = this.getDimensions(cubeImage[0]);

          this.state.texStorage2D(this._gl.TEXTURE_CUBE_MAP, levels, glInternalFormat, dimensions.width, dimensions.height);

        }

        for (let i = 0; i < 6; i++) {

          if (isDataTexture) {

            if (useTexStorage) {

              if (dataReady) {

                this.state.texSubImage2D(this._gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, 0, 0, glFormat, glType, null, cubeImage[i].width, cubeImage[i].height, cubeImage[i].data);

              }

            } else {

              this.state.texImage2D(this._gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, glInternalFormat, glFormat, glType, null, cubeImage[i].width, cubeImage[i].height, 0, cubeImage[i].data);

            }

            for (let j = 0; j < mipmaps.length; j++) {

              const mipmap = mipmaps[j];
              const mipmapImage = mipmap.image[i].image;

              if (useTexStorage) {

                if (dataReady) {

                  this.state.texSubImage2D(this._gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, j + 1, 0, 0, glFormat, glType, null, mipmapImage.width, mipmapImage.height, mipmapImage.data);

                }

              } else {

                this.state.texImage2D(this._gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, j + 1, glInternalFormat, glFormat, glType, null, mipmapImage.width, mipmapImage.height, 0, mipmapImage.data);

              }

            }

          } else {

            if (useTexStorage) {

              if (dataReady) {

                this.state.texSubImage2D(this._gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, 0, 0, glFormat, glType, cubeImage[i], cubeImage[i].width, cubeImage[i].height, null);

              }

            } else {

              this.state.texImage2D(this._gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, glInternalFormat, glFormat, glType, cubeImage[i], cubeImage[i].width, cubeImage[i].height, 0, null);

            }

            for (let j = 0; j < mipmaps.length; j++) {

              const mipmap = mipmaps[j];

              if (useTexStorage) {

                if (dataReady) {

                  this.state.texSubImage2D(this._gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, j + 1, 0, 0, glFormat, glType, mipmap.image[i], 0, 0, null);

                }

              } else {

                this.state.texImage2D(this._gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, j + 1, glInternalFormat, glFormat, glType, mipmap.image[i], 0, 0, 0, null);

              }

            }

          }

        }

      }

      if (this.textureNeedsGenerateMipmaps(texture)) {

        // We assume images for cube map have the same size.
        this.generateMipmap(this._gl.TEXTURE_CUBE_MAP);

      }

      sourceProperties.__version = source.version;

      // if (texture.onUpdate) texture.onUpdate(texture);
      if (texture.onUpdate) texture.onUpdate();

    }

    textureProperties.__version = texture.version;

  }

  // Render targets

  // Setup storage for target texture and bind it to correct framebuffer
  public setupFrameBufferTexture(
    framebuffer: WebGLFramebuffer,
    // renderTarget: { width: number; height: number; depth?: number },
    renderTarget: WebGLRenderTarget,
    texture: Texture,
    attachment: GLenum,
    textureTarget: GLenum,
    level: number
  ) {

    const glFormat = this.utils.convert(texture.format, texture.colorSpace);
    const glType = this.utils.convert(texture.type);

    if (glFormat === null || glType === null) {
      console.warn('Unsupported texture format/type');
      return;
    }

    const glInternalFormat = this.getInternalFormat(texture.internalFormat, glFormat, glType, texture.colorSpace);
    const renderTargetProperties = this.properties.get(renderTarget);
    const textureProperties = this.properties.get(texture);

    textureProperties.__renderTarget = renderTarget;

    if (!renderTargetProperties.__hasExternalTextures) {

      const width = Math.max(1, renderTarget.width >> level);
      const height = Math.max(1, renderTarget.height >> level);

      if (textureTarget === this._gl.TEXTURE_3D || textureTarget === this._gl.TEXTURE_2D_ARRAY) {

        this.state.texImage3D(textureTarget, level, glInternalFormat, width, height, renderTarget.depth, 0, glFormat, glType, null as unknown as ArrayBufferView);

      } else {

        this.state.texImage2D(textureTarget, level, glInternalFormat, glFormat, glType, null, width, height, 0, null);

      }

    }

    this.state.bindFramebuffer(this._gl.FRAMEBUFFER, framebuffer);

    if (this.useMultisampledRTT(renderTarget)) {

      this.multisampledRTTExt.framebufferTexture2DMultisampleEXT(this._gl.FRAMEBUFFER, attachment, textureTarget, textureProperties.__webglTexture, 0, this.getRenderTargetSamples(renderTarget));

    } else if (textureTarget === this._gl.TEXTURE_2D || (textureTarget >= this._gl.TEXTURE_CUBE_MAP_POSITIVE_X && textureTarget <= this._gl.TEXTURE_CUBE_MAP_NEGATIVE_Z)) { // see #24753

      this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, attachment, textureTarget, textureProperties.__webglTexture, level);

    }

    this.state.bindFramebuffer(this._gl.FRAMEBUFFER, null);

  }

  // Setup storage for internal depth/stencil buffers and bind to correct framebuffer
  public setupRenderBufferStorage(
    renderbuffer: WebGLRenderbuffer,
    renderTarget: WebGLRenderTarget,
    isMultisample: boolean
  ) {

    this._gl.bindRenderbuffer(this._gl.RENDERBUFFER, renderbuffer);

    if (renderTarget.depthBuffer) {

      // retrieve the depth attachment types
      const depthTexture = renderTarget.depthTexture;
      const depthType = depthTexture && depthTexture.isDepthTexture ? depthTexture.type : null;
      const glInternalFormat = this.getInternalDepthFormat(renderTarget.stencilBuffer, depthType);
      const glAttachmentType = renderTarget.stencilBuffer ? this._gl.DEPTH_STENCIL_ATTACHMENT : this._gl.DEPTH_ATTACHMENT;

      // set up the attachment
      const samples = this.getRenderTargetSamples(renderTarget);
      const isUseMultisampledRTT = this.useMultisampledRTT(renderTarget);
      if (isUseMultisampledRTT) {

        this.multisampledRTTExt.renderbufferStorageMultisampleEXT(this._gl.RENDERBUFFER, samples, glInternalFormat, renderTarget.width, renderTarget.height);

      } else if (isMultisample) {

        this._gl.renderbufferStorageMultisample(this._gl.RENDERBUFFER, samples, glInternalFormat, renderTarget.width, renderTarget.height);

      } else {

        this._gl.renderbufferStorage(this._gl.RENDERBUFFER, glInternalFormat, renderTarget.width, renderTarget.height);

      }

      this._gl.framebufferRenderbuffer(this._gl.FRAMEBUFFER, glAttachmentType, this._gl.RENDERBUFFER, renderbuffer);

    } else {

      const textures = renderTarget.textures;

      for (let i = 0; i < textures!.length; i++) {

        const texture = textures![i];

        const glFormat = this.utils.convert(texture.format, texture.colorSpace);
        const glType = this.utils.convert(texture.type);

        if (glFormat === null || glType === null) {
          console.warn('Unsupported texture format/type');
          return;
        }

        const glInternalFormat = this.getInternalFormat(texture.internalFormat, glFormat, glType, texture.colorSpace);
        const samples = this.getRenderTargetSamples(renderTarget);

        if (isMultisample && this.useMultisampledRTT(renderTarget) === false) {

          this._gl.renderbufferStorageMultisample(this._gl.RENDERBUFFER, samples, glInternalFormat, renderTarget.width, renderTarget.height);

        } else if (this.useMultisampledRTT(renderTarget)) {

          this.multisampledRTTExt.renderbufferStorageMultisampleEXT(this._gl.RENDERBUFFER, samples, glInternalFormat, renderTarget.width, renderTarget.height);

        } else {

          this._gl.renderbufferStorage(this._gl.RENDERBUFFER, glInternalFormat, renderTarget.width, renderTarget.height);

        }

      }

    }

    this._gl.bindRenderbuffer(this._gl.RENDERBUFFER, null);

  }

  // Setup resources for a Depth Texture for a FBO (needs an extension)
  public setupDepthTexture(
    framebuffer: WebGLFramebuffer,
    renderTarget: WebGLRenderTarget
  ): void {

    const isCube = (renderTarget && 'isWebGLCubeRenderTarget' in renderTarget);
    if (isCube) throw new Error('Depth Texture with cube render targets is not supported');

    this.state.bindFramebuffer(this._gl.FRAMEBUFFER, framebuffer);

    if (!(renderTarget.depthTexture && renderTarget.depthTexture.isDepthTexture)) {

      throw new Error('renderTarget.depthTexture must be an instance of DepthTexture');

    }

    const textureProperties = this.properties.get(renderTarget.depthTexture);
    textureProperties.__renderTarget = renderTarget;

    // upload an empty depth texture with framebuffer size
    if (!textureProperties.__webglTexture ||
      renderTarget.depthTexture.image.width !== renderTarget.width ||
      renderTarget.depthTexture.image.height !== renderTarget.height) {

      renderTarget.depthTexture.image.width = renderTarget.width;
      renderTarget.depthTexture.image.height = renderTarget.height;
      renderTarget.depthTexture.needsUpdate = true;

    }

    this.setTexture2D(renderTarget.depthTexture, 0);

    const webglDepthTexture = textureProperties.__webglTexture;
    const samples = this.getRenderTargetSamples(renderTarget);

    if (renderTarget.depthTexture.format === DepthFormat) {

      if (this.useMultisampledRTT(renderTarget)) {

        this.multisampledRTTExt.framebufferTexture2DMultisampleEXT(this._gl.FRAMEBUFFER, this._gl.DEPTH_ATTACHMENT, this._gl.TEXTURE_2D, webglDepthTexture, 0, samples);

      } else {

        this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.DEPTH_ATTACHMENT, this._gl.TEXTURE_2D, webglDepthTexture, 0);

      }

    } else if (renderTarget.depthTexture.format === DepthStencilFormat) {

      if (this.useMultisampledRTT(renderTarget)) {

        this.multisampledRTTExt.framebufferTexture2DMultisampleEXT(this._gl.FRAMEBUFFER, this._gl.DEPTH_STENCIL_ATTACHMENT, this._gl.TEXTURE_2D, webglDepthTexture, 0, samples);

      } else {

        this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.DEPTH_STENCIL_ATTACHMENT, this._gl.TEXTURE_2D, webglDepthTexture, 0);

      }

    } else {

      throw new Error('Unknown depthTexture format');

    }

  }

  // Setup GL resources for a non-texture depth buffer
  public setupDepthRenderbuffer(
    renderTarget: WebGLRenderTarget
  ) {

    const renderTargetProperties = this.properties.get(renderTarget);
    const isCube = ('isWebGLCubeRenderTarget' in renderTarget === true);

    // if the bound depth texture has changed
    if (renderTargetProperties.__boundDepthTexture !== renderTarget.depthTexture) {

      // fire the dispose event to get rid of stored state associated with the previously bound depth buffer
      const depthTexture = renderTarget.depthTexture;
      if (renderTargetProperties.__depthDisposeCallback) {

        renderTargetProperties.__depthDisposeCallback();

      }

      // set up dispose listeners to track when the currently attached buffer is implicitly unbound
      if (depthTexture) {

        const disposeEvent = () => {

          delete renderTargetProperties.__boundDepthTexture;
          delete renderTargetProperties.__depthDisposeCallback;
          depthTexture.removeEventListener('dispose', disposeEvent);

        };

        depthTexture.addEventListener('dispose', disposeEvent);
        renderTargetProperties.__depthDisposeCallback = disposeEvent;

      }

      renderTargetProperties.__boundDepthTexture = depthTexture;

    }

    if (renderTarget.depthTexture && !renderTargetProperties.__autoAllocateDepthBuffer) {

      if (isCube) throw new Error('target.depthTexture not supported in Cube render targets');

      const mipmaps = renderTarget.texture.mipmaps;

      if (mipmaps && mipmaps.length > 0) {

        this.setupDepthTexture(renderTargetProperties.__webglFramebuffer[0], renderTarget);

      } else {

        this.setupDepthTexture(renderTargetProperties.__webglFramebuffer, renderTarget);

      }

    } else {

      if (isCube) {

        renderTargetProperties.__webglDepthbuffer = [];

        for (let i = 0; i < 6; i++) {

          this.state.bindFramebuffer(this._gl.FRAMEBUFFER, renderTargetProperties.__webglFramebuffer[i]);

          if (renderTargetProperties.__webglDepthbuffer[i] === undefined) {

            renderTargetProperties.__webglDepthbuffer[i] = this._gl.createRenderbuffer();
            this.setupRenderBufferStorage(renderTargetProperties.__webglDepthbuffer[i], renderTarget, false);

          } else {

            // attach buffer if it's been created already
            const glAttachmentType = renderTarget.stencilBuffer ? this._gl.DEPTH_STENCIL_ATTACHMENT : this._gl.DEPTH_ATTACHMENT;
            const renderbuffer = renderTargetProperties.__webglDepthbuffer[i];
            this._gl.bindRenderbuffer(this._gl.RENDERBUFFER, renderbuffer);
            this._gl.framebufferRenderbuffer(this._gl.FRAMEBUFFER, glAttachmentType, this._gl.RENDERBUFFER, renderbuffer);

          }

        }

      } else {

        const mipmaps = renderTarget.texture.mipmaps;

        if (mipmaps && mipmaps.length > 0) {

          this.state.bindFramebuffer(this._gl.FRAMEBUFFER, renderTargetProperties.__webglFramebuffer[0]);

        } else {

          this.state.bindFramebuffer(this._gl.FRAMEBUFFER, renderTargetProperties.__webglFramebuffer);

        }

        if (renderTargetProperties.__webglDepthbuffer === undefined) {

          renderTargetProperties.__webglDepthbuffer = this._gl.createRenderbuffer();
          this.setupRenderBufferStorage(renderTargetProperties.__webglDepthbuffer, renderTarget, false);

        } else {

          // attach buffer if it's been created already
          const glAttachmentType = renderTarget.stencilBuffer ? this._gl.DEPTH_STENCIL_ATTACHMENT : this._gl.DEPTH_ATTACHMENT;
          const renderbuffer = renderTargetProperties.__webglDepthbuffer;
          this._gl.bindRenderbuffer(this._gl.RENDERBUFFER, renderbuffer);
          this._gl.framebufferRenderbuffer(this._gl.FRAMEBUFFER, glAttachmentType, this._gl.RENDERBUFFER, renderbuffer);

        }

      }

    }

    this.state.bindFramebuffer(this._gl.FRAMEBUFFER, null);

  }

  // rebind framebuffer with external textures
  public rebindTextures(
    renderTarget: WebGLRenderTarget,
    colorTexture?: any,
    depthTexture?: any
  ): void {

    const renderTargetProperties = this.properties.get(renderTarget);

    if (colorTexture !== undefined) {

      this.setupFrameBufferTexture(renderTargetProperties.__webglFramebuffer, renderTarget, renderTarget.texture, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_2D, 0);

    }

    if (depthTexture !== undefined) {

      this.setupDepthRenderbuffer(renderTarget);

    }

  }

  // Set up GL resources for the render target
  public setupRenderTarget(
    renderTarget: WebGLRenderTarget
  ): void {

    const texture = renderTarget.texture;

    const renderTargetProperties = this.properties.get(renderTarget);
    const textureProperties = this.properties.get(texture);

    renderTarget.addEventListener('dispose', this.onRenderTargetDispose);

    const textures = renderTarget.textures;

    const isCube = ('isWebGLCubeRenderTarget' in renderTarget === true);
    const isMultipleRenderTargets = (textures!.length > 1);

    if (!isMultipleRenderTargets) {

      if (textureProperties.__webglTexture === undefined) {

        textureProperties.__webglTexture = this._gl.createTexture();

      }

      textureProperties.__version = texture.version;
      this.info.memory.textures++;

    }

    // Setup framebuffer

    if (isCube) {

      renderTargetProperties.__webglFramebuffer = [];

      for (let i = 0; i < 6; i++) {

        if (texture.mipmaps && texture.mipmaps.length > 0) {

          renderTargetProperties.__webglFramebuffer[i] = [];

          for (let level = 0; level < texture.mipmaps.length; level++) {

            renderTargetProperties.__webglFramebuffer[i][level] = this._gl.createFramebuffer();

          }

        } else {

          renderTargetProperties.__webglFramebuffer[i] = this._gl.createFramebuffer();

        }

      }

    } else {

      if (texture.mipmaps && texture.mipmaps.length > 0) {

        renderTargetProperties.__webglFramebuffer = [];

        for (let level = 0; level < texture.mipmaps.length; level++) {

          renderTargetProperties.__webglFramebuffer[level] = this._gl.createFramebuffer();

        }

      } else {

        renderTargetProperties.__webglFramebuffer = this._gl.createFramebuffer();

      }

      if (isMultipleRenderTargets) {

        for (let i = 0, il = textures!.length; i < il; i++) {

          const attachmentProperties = this.properties.get(textures![i]);

          if (attachmentProperties.__webglTexture === undefined) {

            attachmentProperties.__webglTexture = this._gl.createTexture();

            this.info.memory.textures++;

          }

        }

      }

      if ((renderTarget.samples! > 0) && this.useMultisampledRTT(renderTarget) === false) {

        renderTargetProperties.__webglMultisampledFramebuffer = this._gl.createFramebuffer();
        renderTargetProperties.__webglColorRenderbuffer = [];

        this.state.bindFramebuffer(this._gl.FRAMEBUFFER, renderTargetProperties.__webglMultisampledFramebuffer);

        for (let i = 0; i < textures!.length; i++) {

          const texture = textures![i];
          renderTargetProperties.__webglColorRenderbuffer[i] = this._gl.createRenderbuffer();

          this._gl.bindRenderbuffer(this._gl.RENDERBUFFER, renderTargetProperties.__webglColorRenderbuffer[i]);

          const glFormat = this.utils.convert(texture.format, texture.colorSpace);
          const glType = this.utils.convert(texture.type);

          if (glFormat === null || glType === null) {
            console.warn('Unsupported texture format/type');
            return;
          }

          const glInternalFormat = this.getInternalFormat(texture.internalFormat, glFormat, glType, texture.colorSpace, 'isXRRenderTarget' in renderTarget === true);
          const samples = this.getRenderTargetSamples(renderTarget);
          this._gl.renderbufferStorageMultisample(this._gl.RENDERBUFFER, samples, glInternalFormat, renderTarget.width, renderTarget.height);

          this._gl.framebufferRenderbuffer(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0 + i, this._gl.RENDERBUFFER, renderTargetProperties.__webglColorRenderbuffer[i]);

        }

        this._gl.bindRenderbuffer(this._gl.RENDERBUFFER, null);

        if (renderTarget.depthBuffer) {

          renderTargetProperties.__webglDepthRenderbuffer = this._gl.createRenderbuffer();
          this.setupRenderBufferStorage(renderTargetProperties.__webglDepthRenderbuffer, renderTarget, true);

        }

        this.state.bindFramebuffer(this._gl.FRAMEBUFFER, null);

      }

    }

    // Setup color buffer

    if (isCube) {

      this.state.bindTexture(this._gl.TEXTURE_CUBE_MAP, textureProperties.__webglTexture);
      this.setTextureParameters(this._gl.TEXTURE_CUBE_MAP, texture);

      for (let i = 0; i < 6; i++) {

        if (texture.mipmaps && texture.mipmaps.length > 0) {

          for (let level = 0; level < texture.mipmaps.length; level++) {

            this.setupFrameBufferTexture(renderTargetProperties.__webglFramebuffer[i][level], renderTarget, texture, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, level);

          }

        } else {

          this.setupFrameBufferTexture(renderTargetProperties.__webglFramebuffer[i], renderTarget, texture, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0);

        }

      }

      if (this.textureNeedsGenerateMipmaps(texture)) {

        this.generateMipmap(this._gl.TEXTURE_CUBE_MAP);

      }

      this.state.unbindTexture();

    } else if (isMultipleRenderTargets) {

      for (let i = 0, il = textures!.length; i < il; i++) {

        const attachment = textures![i];
        const attachmentProperties = this.properties.get(attachment);

        let glTextureType: GLenum = this._gl.TEXTURE_2D;

        // if (renderTarget.isWebGL3DRenderTarget || renderTarget.isWebGLArrayRenderTarget) {

        //   glTextureType = renderTarget.isWebGL3DRenderTarget ? _gl.TEXTURE_3D : _gl.TEXTURE_2D_ARRAY;

        // }

        if (isWebGL3DRenderTarget(renderTarget)) {
          glTextureType = this._gl.TEXTURE_3D;
        } else if (isWebGLArrayRenderTarget(renderTarget)) {
          glTextureType = this._gl.TEXTURE_2D_ARRAY;
        }


        this.state.bindTexture(glTextureType, attachmentProperties.__webglTexture);
        this.setTextureParameters(glTextureType, attachment);
        this.setupFrameBufferTexture(renderTargetProperties.__webglFramebuffer, renderTarget, attachment, this._gl.COLOR_ATTACHMENT0 + i, glTextureType, 0);

        if (this.textureNeedsGenerateMipmaps(attachment)) {

          this.generateMipmap(glTextureType);

        }

      }

      this.state.unbindTexture();

    } else {

      let glTextureType: GLenum = this._gl.TEXTURE_2D;

      // if (renderTarget.isWebGL3DRenderTarget || renderTarget.isWebGLArrayRenderTarget) {

      //   glTextureType = renderTarget.isWebGL3DRenderTarget ? this._gl.TEXTURE_3D : this._gl.TEXTURE_2D_ARRAY;

      // }

      if (isWebGL3DRenderTarget(renderTarget)) {
        glTextureType = this._gl.TEXTURE_3D;
      } else if (isWebGLArrayRenderTarget(renderTarget)) {
        glTextureType = this._gl.TEXTURE_2D_ARRAY;
      }

      this.state.bindTexture(glTextureType, textureProperties.__webglTexture);
      this.setTextureParameters(glTextureType, texture);

      if (texture.mipmaps && texture.mipmaps.length > 0) {

        for (let level = 0; level < texture.mipmaps.length; level++) {

          this.setupFrameBufferTexture(renderTargetProperties.__webglFramebuffer[level], renderTarget, texture, this._gl.COLOR_ATTACHMENT0, glTextureType, level);

        }

      } else {

        this.setupFrameBufferTexture(renderTargetProperties.__webglFramebuffer, renderTarget, texture, this._gl.COLOR_ATTACHMENT0, glTextureType, 0);

      }

      if (this.textureNeedsGenerateMipmaps(texture)) {

        this.generateMipmap(glTextureType);

      }

      this.state.unbindTexture();

    }

    // Setup depth and stencil buffers

    if (renderTarget.depthBuffer) {

      this.setupDepthRenderbuffer(renderTarget);

    }

  }

  public updateRenderTargetMipmap(
    renderTarget: {
      textures: Texture[]
    }
  ): void {

    const textures = renderTarget.textures;

    for (let i = 0, il = textures.length; i < il; i++) {

      const texture = textures[i];

      if (this.textureNeedsGenerateMipmaps(texture)) {

        const targetType = this.getTargetType(renderTarget);
        const webglTexture = this.properties.get(texture).__webglTexture;

        this.state.bindTexture(targetType, webglTexture);
        this.generateMipmap(targetType);
        this.state.unbindTexture();

      }

    }

  }

  public updateMultisampleRenderTarget(
    // renderTarget: {
    //   samples: number;
    //   textures: Texture[];
    //   width: number;
    //   height: number;
    //   depthBuffer: boolean;
    //   stencilBuffer: boolean;
    //   resolveDepthBuffer?: boolean;
    //   resolveStencilBuffer?: boolean;
    //   texture: { mipmaps?: any[] };
    // }
    renderTarget: WebGLRenderTarget
  ) {

    if (renderTarget.samples > 0) {

      if (this.useMultisampledRTT(renderTarget) === false) {

        const textures = renderTarget.textures;
        const width = renderTarget.width;
        const height = renderTarget.height;
        let mask = this._gl.COLOR_BUFFER_BIT;
        const depthStyle = renderTarget.stencilBuffer ? this._gl.DEPTH_STENCIL_ATTACHMENT : this._gl.DEPTH_ATTACHMENT;
        const renderTargetProperties = this.properties.get(renderTarget);
        const isMultipleRenderTargets = (textures.length > 1);

        // If MRT we need to remove FBO attachments
        if (isMultipleRenderTargets) {

          for (let i = 0; i < textures.length; i++) {

            this.state.bindFramebuffer(this._gl.FRAMEBUFFER, renderTargetProperties.__webglMultisampledFramebuffer);
            this._gl.framebufferRenderbuffer(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0 + i, this._gl.RENDERBUFFER, null);

            this.state.bindFramebuffer(this._gl.FRAMEBUFFER, renderTargetProperties.__webglFramebuffer);
            this._gl.framebufferTexture2D(this._gl.DRAW_FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0 + i, this._gl.TEXTURE_2D, null, 0);

          }

        }

        this.state.bindFramebuffer(this._gl.READ_FRAMEBUFFER, renderTargetProperties.__webglMultisampledFramebuffer);

        const mipmaps = renderTarget.texture.mipmaps;

        if (mipmaps && mipmaps.length > 0) {

          this.state.bindFramebuffer(this._gl.DRAW_FRAMEBUFFER, renderTargetProperties.__webglFramebuffer[0]);

        } else {

          this.state.bindFramebuffer(this._gl.DRAW_FRAMEBUFFER, renderTargetProperties.__webglFramebuffer);

        }

        for (let i = 0; i < textures.length; i++) {

          if (renderTarget.resolveDepthBuffer) {

            if (renderTarget.depthBuffer) mask |= this._gl.DEPTH_BUFFER_BIT;

            // resolving stencil is slow with a D3D backend. disable it for all transmission render targets (see #27799)

            if (renderTarget.stencilBuffer && renderTarget.resolveStencilBuffer) mask |= this._gl.STENCIL_BUFFER_BIT;

          }

          if (isMultipleRenderTargets) {

            this._gl.framebufferRenderbuffer(this._gl.READ_FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.RENDERBUFFER, renderTargetProperties.__webglColorRenderbuffer[i]);

            const webglTexture = this.properties.get(textures[i]).__webglTexture;
            this._gl.framebufferTexture2D(this._gl.DRAW_FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_2D, webglTexture, 0);

          }

          this._gl.blitFramebuffer(0, 0, width, height, 0, 0, width, height, mask, this._gl.NEAREST);

          if (this.supportsInvalidateFramebuffer === true) {

            this.invalidationArrayRead.length = 0;
            this.invalidationArrayDraw.length = 0;

            this.invalidationArrayRead.push(this._gl.COLOR_ATTACHMENT0 + i);

            if (renderTarget.depthBuffer && renderTarget.resolveDepthBuffer === false) {

              this.invalidationArrayRead.push(depthStyle);
              this.invalidationArrayDraw.push(depthStyle);

              this._gl.invalidateFramebuffer(this._gl.DRAW_FRAMEBUFFER, this.invalidationArrayDraw);

            }

            this._gl.invalidateFramebuffer(this._gl.READ_FRAMEBUFFER, this.invalidationArrayRead);

          }

        }

        this.state.bindFramebuffer(this._gl.READ_FRAMEBUFFER, null);
        this.state.bindFramebuffer(this._gl.DRAW_FRAMEBUFFER, null);

        // If MRT since pre-blit we removed the FBO we need to reconstruct the attachments
        if (isMultipleRenderTargets) {

          for (let i = 0; i < textures.length; i++) {

            this.state.bindFramebuffer(this._gl.FRAMEBUFFER, renderTargetProperties.__webglMultisampledFramebuffer);
            this._gl.framebufferRenderbuffer(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0 + i, this._gl.RENDERBUFFER, renderTargetProperties.__webglColorRenderbuffer[i]);

            const webglTexture = this.properties.get(textures[i]).__webglTexture;

            this.state.bindFramebuffer(this._gl.FRAMEBUFFER, renderTargetProperties.__webglFramebuffer);
            this._gl.framebufferTexture2D(this._gl.DRAW_FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0 + i, this._gl.TEXTURE_2D, webglTexture, 0);

          }

        }

        this.state.bindFramebuffer(this._gl.DRAW_FRAMEBUFFER, renderTargetProperties.__webglMultisampledFramebuffer);

      } else {

        if (renderTarget.depthBuffer && renderTarget.resolveDepthBuffer === false && this.supportsInvalidateFramebuffer) {

          const depthStyle = renderTarget.stencilBuffer ? this._gl.DEPTH_STENCIL_ATTACHMENT : this._gl.DEPTH_ATTACHMENT;

          this._gl.invalidateFramebuffer(this._gl.DRAW_FRAMEBUFFER, [depthStyle]);

        }

      }

    }

  }

  public getRenderTargetSamples(renderTarget: WebGLRenderTarget) {

    return Math.min(this.capabilities.maxSamples, renderTarget.samples);

  }

  public useMultisampledRTT(renderTarget: WebGLRenderTarget) {

    const renderTargetProperties = this.properties.get(renderTarget);

    return renderTarget.samples > 0 && this.extensions.has('WEBGL_multisampled_render_to_texture') === true && renderTargetProperties.__useRenderToTexture !== false;

  }

  public updateVideoTexture(texture: Texture) {

    const frame = this.info.render.frame;

    // Check the last frame we updated the VideoTexture

    if (this._videoTextures.get(texture) !== frame) {

      this._videoTextures.set(texture, frame);
      texture.update();

    }

  }

  public verifyColorSpace(texture: Texture, image: any) { // TODO: type better

    const colorSpace = texture.colorSpace;
    const format = texture.format;
    const type = texture.type;

    if (texture.isCompressedTexture === true || texture.isVideoTexture === true) return image;

    if (colorSpace !== LinearSRGBColorSpace && colorSpace !== NoColorSpace) {

      // sRGB

      if (this.cm.getTransfer(colorSpace) === SRGBTransfer) {

        // in WebGL 2 uncompressed textures can only be sRGB encoded if they have the RGBA8 format

        if (format !== RGBAFormat || type !== UnsignedByteType) {

          console.warn('WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.');

        }

      } else {

        console.error('WebGLTextures: Unsupported texture color space:', colorSpace);

      }

    }

    return image;

  }

  public getDimensions(image: any) {

    if (typeof HTMLImageElement !== 'undefined' && image instanceof HTMLImageElement) {

      // if intrinsic data are not available, fallback to width/height

      this._imageDimensions.width = image.naturalWidth || image.width;
      this._imageDimensions.height = image.naturalHeight || image.height;

    } else if (typeof VideoFrame !== 'undefined' && image instanceof VideoFrame) {

      this._imageDimensions.width = image.displayWidth;
      this._imageDimensions.height = image.displayHeight;

    } else {

      this._imageDimensions.width = image.width;
      this._imageDimensions.height = image.height;

    }

    return this._imageDimensions;

  }

}
