import { ClampToEdgeWrapping, LinearFilter, RGBAFormat, TextureDataType, TextureFormat, TextureMagFilter, TextureMapping, TextureMinFilter, TextureWrapping, UnsignedByteType } from '../constants.js';
import { Texture } from './Texture.js';

/**
 * A texture for use with a video.
 *
 * ```ts
 * // assuming you have created a HTML video element with id="video"
 * const video = document.getElementById( 'video' );
 * const texture = new VideoTexture( video );
 * ```
 *
 * Note: When using video textures with {@link WebGPURenderer}, {@link Texture#colorSpace} must be
 * set to SRGBColorSpace.
 *
 * Note: After the initial use of a texture, its dimensions, format, and type
 * cannot be changed. Instead, call {@link Texture#dispose} on the texture and instantiate a new one.
 *
 * @augments Texture
 */
export class VideoTexture extends Texture {
  /**
   * This flag can be used for type testing.
   *
   * @type {boolean}
   * @readonly
   * @default true
   */
  public readonly isVideoTexture: boolean = true;

  /**
   * The video frame request callback identifier, which is a positive integer.
   *
   * Value of 0 represents no scheduled rVFC.
   *
   * @private
   * @type {number}
   */
  public _requestVideoFrameCallbackId: number = 0;

  /**
   * Constructs a new video texture.
   *
   * @param {HTMLVideoElement} video - The video element to use as a data source for the texture.
   * @param {number} [mapping=Texture.DEFAULT_MAPPING] - The texture mapping.
   * @param {number} [wrapS=ClampToEdgeWrapping] - The wrapS value.
   * @param {number} [wrapT=ClampToEdgeWrapping] - The wrapT value.
   * @param {number} [magFilter=LinearFilter] - The mag filter value.
   * @param {number} [minFilter=LinearFilter] - The min filter value.
   * @param {number} [format=RGBAFormat] - The texture format.
   * @param {number} [type=UnsignedByteType] - The texture type.
   * @param {number} [anisotropy=Texture.DEFAULT_ANISOTROPY] - The anisotropy value.
   */
  constructor(
    video: HTMLVideoElement,
    mapping: TextureMapping = Texture.DEFAULT_MAPPING,
    wrapS: TextureWrapping = ClampToEdgeWrapping,
    wrapT: TextureWrapping = ClampToEdgeWrapping,
    magFilter: TextureMagFilter = LinearFilter,
    minFilter: TextureMinFilter = LinearFilter,
    format: TextureFormat = RGBAFormat,
    type: TextureDataType = UnsignedByteType,
    anisotropy: number = Texture.DEFAULT_ANISOTROPY
  ) {

    super(video, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy);

    /**
     * Whether to generate mipmaps (if possible) for a texture.
     *
     * Overwritten and set to `false` by default.
     *
     * @type {boolean}
     * @default false
     */
    this.generateMipmaps = false;



    const scope = this;

    function updateVideo() {

      scope.needsUpdate = true;
      scope._requestVideoFrameCallbackId = video.requestVideoFrameCallback(updateVideo);

    }

    if ('requestVideoFrameCallback' in video) {

      this._requestVideoFrameCallbackId = video.requestVideoFrameCallback(updateVideo);

    }

  }

  public clone() {

    return new Texture(this.image).copy(this);

  }

  /**
   * This method is called automatically by the renderer and sets {@link Texture#needsUpdate}
   * to `true` every time a new frame is available.
   *
   * Only relevant if `requestVideoFrameCallback` is not supported in the browser.
   */
  publicupdate() {

    const video = this.image;
    const hasVideoFrameCallback = 'requestVideoFrameCallback' in video;

    if (hasVideoFrameCallback === false && video.readyState >= video.HAVE_CURRENT_DATA) {

      this.needsUpdate = true;

    }

  }

  public dispose() {

    if (this._requestVideoFrameCallbackId !== 0) {

      this.source.data.cancelVideoFrameCallback(this._requestVideoFrameCallbackId);

    }

    super.dispose();

  }

}
