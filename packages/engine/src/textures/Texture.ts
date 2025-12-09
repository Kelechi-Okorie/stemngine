import { EventDispatcher } from "../core/EventDispatcher";
import {
  MirroredRepeatWrapping,
  ClampToEdgeWrapping,
  RepeatWrapping,
  UnsignedByteType,
  RGBAFormat,
  LinearMipmapLinearFilter,
  LinearFilter,
  UVMapping,
  NoColorSpace,
  ColorSpace,

  TextureWrapping,
  TextureMagFilter,
  TextureMinFilter,
  TextureFormat,
  TextureDataType,
  TextureMapping,
  TextureInternalFormat,
  Mipmap,
  UpdateRange
} from '../constants';
import { generateUUID } from "../math/MathUtils";
import { Vector2 } from "../engine";
import { Vector3 } from "../math/Vector3";
import { Matrix3 } from "../math/Matrix3";
import { Source } from "./Source";
import { RenderTarget } from "../core/RenderTarget";
import { WebGLRenderTarget } from "../renderers/WebGLRenderTarget";

let _textureId: number = 0;

const _tempVec3 = /*@__PURE__*/ new Vector3();

export type TextureImage =
  | HTMLImageElement
  | HTMLCanvasElement
  | HTMLVideoElement
  | ImageBitmap
  | { width: number; height: number; depth?: number }
  | null;

/**
 * Base class for all textures
 *
 * @remarks
 * After the initial use of a texture, its dimensions, format, and type
 * cannot be changed.
 * Instead call {@link Texture#dispose} on the texture and instantiate a new one
 *
 * @augments EventDispatcher
 */
export class Texture extends EventDispatcher {
  /**
   * A texture can be indexed with any string and will return any
   */
  [key: string]: any;

  /**
   * This flag can be used for type testing.
   *
   * @type {boolean}
   * @readonly
   * @default true
   */
  public readonly isTexture: boolean = true;

  /**
   * The ID of the texture
   */
  public id: number = _textureId++;

  /**
   * The UUID of the material
   */
  public uuid: string = generateUUID();

  /**
   * The name of the material
   */
  public name: string = "";

  /**
   * The data definition of a texture
   *
   * @remarks
   * A reference to the data source can be shared across textures.
   * This is often useful in context of sprite sheets
   * where multiple textures render the same data but with different
   * texture transformations
   */
  public source: Source;

  /**
   * An array holding user-defined mipmaps
   */
  public mipmaps: Mipmap[] = [];

  /**
   * How the texture is applied to the object
   *
   * @remarks
   * The value UVMapping is the default, where texture or uv coordinates are
   * used to apply the map
   */
  public mapping: TextureMapping = Texture.DEFAULT_MAPPING;

  /**
   * Lets you select the uv attribute to map the texture to
   *
   * @remarks
   * 0 for uv
   * 1 for uv1
   * 2 for uv2
   * and 3 for uv3
   */
  public channel: number = 0;

  /**
   * This defines how the texture is wrapped horizontally and corresponds to
   * U in UV mapping
   */
  public wrapS: TextureWrapping = ClampToEdgeWrapping;

  /**
   * This defines how the texture is wrapped horizontally and corresponds to
   * V in UV mapping
   */
  public wrapT: TextureWrapping = ClampToEdgeWrapping;

  /**
   * How the texture is sampled when a texel covers more than one pixel
   */
  public magFilter: TextureMagFilter = LinearFilter;

  /**
   * How the texture is sample when a texel covers less than one pixel
   */
  public minFilter: TextureMinFilter = LinearMipmapLinearFilter;

  /**
   * The number of samples taken along the axis through the pixel that has
   * the highest density of texels
   *
   * @remarks
   * By default, this value is 1.
   * A higher value gives a less blurry result than a basic mipmap,
   * at the cost of more texture samples being used
   */
  public anisotropy: number = Texture.DEFAULT_ANISOTROPY;

  /**
   * format of the texture
   */
  public format: TextureFormat = RGBAFormat;

  /**
   * The default internal format is derived from {@link Texture#format} and
   * {@link Texture#type} and defines how the texture data is going to be
   * stored on the GPU
   *
   * @remarks
   * This property allows to overwrite the default format
   */
  public internalFormat: TextureInternalFormat = 'RGBA8';

  /**
   * The dat type of the texture
   */
  public type: TextureDataType = UnsignedByteType;

  /**
   * How much a single repetition of the texture is offset from the beginning,
   * in each direction U and V.
   *
   * @remarks
   * Typical range is 0.0 to 1.0
   */
  public offset: Vector2 = new Vector2();

  /**
   * How many times the texture is repeated across the surface, in each
   * direction U and V.
   *
   * @remarks
   * If repeat is set greater than 1 in either direction, the corresponding
   * wrap parameter should also be set to RepeatWrapping or MirrorRepeatWrapping
   * to achieve the desired tiling effect
   */
  public repeat: Vector2 = new Vector2(1, 1);

  /**
   * The point around which rotation occurs.
   *
   * @remarks
   * A value of (0,5, 0.5) corresponds to the center of the texture.
   * Default is (0, 0), the lower left
   */
  public center: Vector2 = new Vector2(0, 0);

  /**
   * How much the texture is rotated around the center point, in radians
   *
   * @remarks
   * Positive values are counter-clockwise
   */
  public rotation: number = 0;

  /**
   * Whether to update the texture's uv-transformation {@link Texture#matrix}
   * from the properties {@link Texture#offset}, {@link Texture#repeat},
   * {@link Texture#rotation}, and {@link Texture#center}
   *
   * @remarks
   * Set this to false if you are specifying the uv-transform matrix directly
   */
  public matrixAutoUpdate: boolean = true;

  /**
   * The uv-transformation matrix of the texture
   */
  public matrix: Matrix3 = new Matrix3();

  /**
   * Whether to generate mipmaps (if possible) for a texture
   *
   * @remarks
   * Set this to false if you are creating mipmaps manually
   */
  public generateMipmaps: boolean = true;

  /**
   * If set to true, the alpha channel, if present, is multiplied into the
   * the color channels when the texture is uploaded to the GPU.
   *
   * @remarks
   * This property has no effect when using ImageBitmap.
   * You need to configure premultiply alpha on bitmap creation instead
   */
  public premultiplyAlpha: boolean = false;

  /**
   * If set to true, the texture is flipped along the vertical axis when
   * uploaded to the GPU
   *
   * @remarks
   * This property has no effect when using ImageBitmap.
   * You need to configure the flip on bitmap creation instead
   */
  public flipY: boolean = true;

  /**
   * Specifies the alignment requirements for the start of each pixel row
   * in memory.
   *
   * @remarks
   * The allowable values are
   * 1 (byte-alignment)
   * 2 (rows aligned to even numbered bytes)
   * 4 (word-aligned) and
   * 8 (rows start on double-world boundaries)
   *
   * [see]{@link http://www.khronos.org/opengls/sdk/docs/main/xhtml/glPixelStorei.xml}
   */
  public unpackAlignment: 1 | 2 | 4 | 8 = 4;

  /**
   * Textures containing color data should be annoted with SRGBColorSpace
   * or LinearSRGBColorSpace
   */
  public colorSpace: ColorSpace = NoColorSpace;

  /**
   * An object that can be used to store custom data about the texture.
   *
   * @remarks
   * It should not hold references to functions as these will not be cloned
   */
  public userData: { [key: string]: any } = {};

  /**
   * This can be used to only update a subrgion or specified rows of the texture
   * (for example, just the first 3 rows).
   *
   * @remarks
   * Use the addUpdateRange() function to add ranges to this array
   */
  public updateRanges: UpdateRange[] = [];

  /**
   * This starts at 0 and count how many times {@link Texture#needsUpdate}
   * is set to true
   */
  public version: number = 0;

  /**
   * A callback function, called when the texture s updated (e.g., when
   * {@link Texture#needsUpdate} has been set to true and then the texture is used)
   */
  public onUpdate: (() => {}) | null = null;

  /**
   * An optional back reference to the textures render target
   */
  public renderTarget: RenderTarget | WebGLRenderTarget | null = null;

  /**
   * Indicates whether a texture belongs to a render target or not
   */
  public isRenderTargetTexture: boolean = false;

  /**
   * Indicates if a texture should be handled like a texture array
   */
  public isArrayTexture: boolean;

  /**
   * Indicates whether this texture should be processed by PMREMGenerator or not
   * (only relevent for render target textures)
   */
  private pmremVersion: number = 0;

  /**
 * The default image for all textures.
 *
 * @static
 * @type {?Image}
 * @default null
 */
  static DEFAULT_IMAGE: HTMLImageElement | null = null;

  /**
   * The default mapping for all textures.
   *
   * @static
   * @type {number}
   * @default UVMapping
   */
  static DEFAULT_MAPPING: TextureMapping = UVMapping;

  /**
   * The default anisotropy value for all textures.
   *
   * @static
   * @type {number}
   * @default 1
   */
  static DEFAULT_ANISOTROPY: number = 1;


  /**
   * Constructs a new texture
   *
   * @param image = The image holding the texture data
   * @param mapping - The texture mapping
   * @param wrapS - The wrapS value
   * @param wrapT - The wrapT value
   * @param magFilter - The mag filter value
   * @param minFilter - The min filter value
   * @param format - The texture format
   * @param type - The texture type
   * @param anisotropy - The anisotropy value
   * @param colorSpace - The color space
   */
  constructor(
    image: TextureImage | TextureImage[] = Texture.DEFAULT_IMAGE,
    mapping: TextureMapping = Texture.DEFAULT_MAPPING,
    wrapS: TextureWrapping = ClampToEdgeWrapping,
    wrapT: TextureWrapping = ClampToEdgeWrapping,
    magFilter: TextureMagFilter = LinearFilter,
    minFilter: TextureMinFilter = LinearMipmapLinearFilter,
    format: TextureFormat = RGBAFormat,
    type: TextureDataType = UnsignedByteType,
    anisotropy: number = Texture.DEFAULT_ANISOTROPY,
    colorSpace: ColorSpace = NoColorSpace
  ) {
    super();

    this.source = new Source(image);
    this.mapping = mapping;
    this.wrapS = wrapS;
    this.wrapT = wrapT;
    this.magFilter = magFilter;
    this.minFilter = minFilter;
    this.anisotropy = anisotropy;
    this.format = format;
    this.type = type;
    this.colorSpace = colorSpace;
    // this.isArrayTexture = image && image.depth && image.depth > 1 ? true : false;
    this.isArrayTexture =
      image != null &&
      typeof image === 'object' &&
      'depth' in image &&
      typeof image.depth === 'number' &&
      image.depth > 1;

  }

  /**
   * The width of the texture in pixels.
   */
  public get width(): number {

    return this.source.getSize(_tempVec3).x;

  }

  /**
   * The height of the texture in pixels.
   */
  public get height(): number {

    return this.source.getSize(_tempVec3).y;

  }

  /**
   * The depth of the texture in pixels.
   */
  public get depth(): number {

    // return this.source.getSize(_tempVec3)?.z; // TODO: type this correctly

    const size = this.source.getSize(_tempVec3);

    if (size && 'z' in size) {
      return size.z;
    }

    return 0; // or 0, or whatever default depth you want


  }

  /**
   * The image object holding the texture data.
   *
   * @type {?Object}
   */
  public get image(): any {

    return this.source.data;

  }

  public set image(value) {

    this.source.data = value || null;

  }

  /**
   * Updates the texture transformation matrix from the from the properties {@link Texture#offset},
   * {@link Texture#repeat}, {@link Texture#rotation}, and {@link Texture#center}.
   */
  public updateMatrix() {

    this.matrix.setUvTransform(this.offset.x, this.offset.y, this.repeat.x, this.repeat.y, this.rotation, this.center.x, this.center.y);

  }

  /**
   * Adds a range of data in the data texture to be updated on the GPU.
   *
   * @param {number} start - Position at which to start update.
   * @param {number} count - The number of components to update.
   */
  public addUpdateRange(start: number, count: number) {

    this.updateRanges.push({ start, count });

  }

  /**
   * Clears the update ranges.
   */
  public clearUpdateRanges(): void {

    this.updateRanges.length = 0;

  }

  /**
   * Returns a new texture with copied values from this instance.
   *
   * @return {Texture} A clone of this instance.
   */
  public clone(): Texture {

    return new Texture().copy(this);

  }

  /**
   * Copies the values of the given texture to this instance.
   *
   * @param {Texture} source - The texture to copy.
   * @return {Texture} A reference to this instance.
   */
  public copy(source: Texture): this {

    this.name = source.name;

    this.source = source.source;
    this.mipmaps = source.mipmaps.slice(0);

    this.mapping = source.mapping;
    this.channel = source.channel;

    this.wrapS = source.wrapS;
    this.wrapT = source.wrapT;

    this.magFilter = source.magFilter;
    this.minFilter = source.minFilter;

    this.anisotropy = source.anisotropy;

    this.format = source.format;
    this.internalFormat = source.internalFormat;
    this.type = source.type;

    this.offset.copy(source.offset);
    this.repeat.copy(source.repeat);
    this.center.copy(source.center);
    this.rotation = source.rotation;

    this.matrixAutoUpdate = source.matrixAutoUpdate;
    this.matrix.copy(source.matrix);

    this.generateMipmaps = source.generateMipmaps;
    this.premultiplyAlpha = source.premultiplyAlpha;
    this.flipY = source.flipY;
    this.unpackAlignment = source.unpackAlignment;
    this.colorSpace = source.colorSpace;

    this.renderTarget = source.renderTarget;
    this.isRenderTargetTexture = source.isRenderTargetTexture;
    this.isArrayTexture = source.isArrayTexture;

    this.userData = JSON.parse(JSON.stringify(source.userData));

    this.needsUpdate = true;

    return this;

  }

  /**
   * Sets this texture's properties based on `values`.
   * @param {Object} values - A container with texture parameters.
   */
  public setValues(values: { [key: string]: any }): void {
    // [key: string]: any;

    for (const key in values) {

      const newValue = values[key];

      if (newValue === undefined) {

        console.warn(`Texture.setValues(): parameter '${key}' has value of undefined.`);
        continue;

      }

      const currentValue = this[key];

      if (currentValue === undefined) {

        console.warn(`Texture.setValues(): property '${key}' does not exist.`);
        continue;

      }

      if ((currentValue && newValue) && (currentValue.isVector2 && newValue.isVector2)) {

        currentValue.copy(newValue);

      } else if ((currentValue && newValue) && (currentValue.isVector3 && newValue.isVector3)) {

        currentValue.copy(newValue);

      } else if ((currentValue && newValue) && (currentValue.isMatrix3 && newValue.isMatrix3)) {

        currentValue.copy(newValue);

      } else {

        this[key] = newValue;

      }

    }

  }

  /**
   * Serializes the texture into JSON.
   *
   * @param {?(Object|string)} meta - An optional value holding meta information about the serialization.
   * @return {Object} A JSON object representing the serialized texture.
   * @see {@link ObjectLoader#parse}
   */
  public toJSON(meta: { [key: string]: any }): { [key: string]: any } {

    const isRootObject = (meta === undefined || typeof meta === 'string');

    if (!isRootObject && meta.textures[this.uuid] !== undefined) {

      return meta.textures[this.uuid];

    }

    const output: { [key: string]: any } = {

      metadata: {
        version: 4.7,
        type: 'Texture',
        generator: 'Texture.toJSON'
      },

      uuid: this.uuid,
      name: this.name,

      image: this.source.toJSON(meta).uuid,

      mapping: this.mapping,
      channel: this.channel,

      repeat: [this.repeat.x, this.repeat.y],
      offset: [this.offset.x, this.offset.y],
      center: [this.center.x, this.center.y],
      rotation: this.rotation,

      wrap: [this.wrapS, this.wrapT],

      format: this.format,
      internalFormat: this.internalFormat,
      type: this.type,
      colorSpace: this.colorSpace,

      minFilter: this.minFilter,
      magFilter: this.magFilter,
      anisotropy: this.anisotropy,

      flipY: this.flipY,

      generateMipmaps: this.generateMipmaps,
      premultiplyAlpha: this.premultiplyAlpha,
      unpackAlignment: this.unpackAlignment

    };

    if (Object.keys(this.userData).length > 0) output.userData = this.userData;

    if (!isRootObject) {

      meta.textures[this.uuid] = output;

    }

    return output;

  }

  /**
   * Frees the GPU-related resources allocated by this instance. Call this
   * method whenever this instance is no longer used in your app.
   *
   * @fires Texture#dispose
   */
  public dispose(): void {

    /**
     * Fires when the texture has been disposed of.
     *
     * @event Texture#dispose
     * @type {Object}
     */
    this.dispatchEvent({ type: 'dispose' });

  }

  /**
   * Transforms the given uv vector with the textures uv transformation matrix.
   *
   * @param {Vector2} uv - The uv vector.
   * @return {Vector2} The transformed uv vector.
   */
  public transformUv(uv: Vector2): Vector2 {

    if (this.mapping !== UVMapping) return uv;

    uv.applyMatrix3(this.matrix);

    if (uv.x < 0 || uv.x > 1) {

      switch (this.wrapS) {

        case RepeatWrapping:

          uv.x = uv.x - Math.floor(uv.x);
          break;

        case ClampToEdgeWrapping:

          uv.x = uv.x < 0 ? 0 : 1;
          break;

        case MirroredRepeatWrapping:

          if (Math.abs(Math.floor(uv.x) % 2) === 1) {

            uv.x = Math.ceil(uv.x) - uv.x;

          } else {

            uv.x = uv.x - Math.floor(uv.x);

          }

          break;

      }

    }

    if (uv.y < 0 || uv.y > 1) {

      switch (this.wrapT) {

        case RepeatWrapping:

          uv.y = uv.y - Math.floor(uv.y);
          break;

        case ClampToEdgeWrapping:

          uv.y = uv.y < 0 ? 0 : 1;
          break;

        case MirroredRepeatWrapping:

          if (Math.abs(Math.floor(uv.y) % 2) === 1) {

            uv.y = Math.ceil(uv.y) - uv.y;

          } else {

            uv.y = uv.y - Math.floor(uv.y);

          }

          break;

      }

    }

    if (this.flipY) {

      uv.y = 1 - uv.y;

    }

    return uv;

  }

  /**
   * Setting this property to `true` indicates the engine the texture
   * must be updated in the next render. This triggers a texture upload
   * to the GPU and ensures correct texture parameter configuration.
   *
   * @type {boolean}
   * @default false
   * @param {boolean} value
   */
  public set needsUpdate(value: boolean) {

    if (value === true) {

      this.version++;
      this.source.needsUpdate = true;

    }

  }

  /**
   * Setting this property to `true` indicates the engine the PMREM
   * must be regenerated.
   *
   * @type {boolean}
   * @default false
   * @param {boolean} value
   */
  public set needsPMREMUpdate(value: boolean) {

    if (value === true) {

      this.pmremVersion++;

    }
  }
}

export function isTexture(obj: any): obj is Texture {
  return obj && obj.isTexture === true;
}

