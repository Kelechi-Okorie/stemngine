import { generateUUID } from "../math/MathUtils";
import { Vector2 } from "../math/Vector2";
import { Vector3 } from '../math/Vector3';
import { ImageUtils } from "../extras/ImageUtils";

let _sourceId: number = 0;

/**
 * Represents the data source of a texture.
 *
 * @remarks
 * The main purpose of this class is to decouple the data definition from the
 * texture definition so the same data can be used with multiple texture
 * instance
 */
export class Source {
  /**
   * This flag can be used for type testing
   */
  public isSource: boolean = true;

  /**
   * The ID of the source
   */
  public id: number = _sourceId++;

  /**
   * The UUID of the source
   */
  public uuid: string = generateUUID();

  /**
   * The data definition of a texture
   */
  public data: any;

  /**
   * This property is relevant when {@link Source#needsUpdate} is set to true and
   * provides more control on how texture data should be processed.
   * When dataReady is set to false, the engine performs the memory allocation
   * (if necessary) but does not transfer the data into the GPU memory
   */
  public dataReady: boolean = true;

  /**
   * This starts at 0 and counts how many times
   * {@link Source#needsUpdate} is set to true
   */
  public version: number = 0;

  /**
   * Constructs a new video texture
   */
  constructor(data: any = null) {
    data = data;
  }

  /**
   * Returns the dimensions of the source into the given target vector
   *
   * @param target - The target object the result is written into
   * @returns The dimension of the source
   */
  public getSize(target: Vector2 | Vector3): Vector2 | Vector3 {
    const data = this.data;

    if ((typeof HTMLVideoElement !== 'undefined') && (data instanceof HTMLVideoElement)) {

      target.set(data.videoWidth, data.videoHeight, 0);

    } else if (data instanceof VideoFrame) {

      target.set(data.displayHeight, data.displayWidth, 0);

    } else if (data !== null) {

      target.set(data.width, data.height, data.depth || 0);

    } else {

      target.set(0, 0, 0);

    }

    return target;

  }

  /**
   * When the property is set to true, the engine allocates the memory for the texture
   * (if necessary) and triggers the actual texture upload to the GPU next time
   * the source is used
   *
   * @param value
   */
  public set needsUpdate(value: boolean) {
    if (value === true) this.version++;
  }

  /**
   * Serializes the source into JSON
   *
   * @see {@link ObjectLoader#parse}
   *
   * @param meta - An optional value holding meta information about the serialization
   * @returns A JSON object representing the serialized source
   */
  public toJSON(meta: { [key: string]: any } | string): { [key: string]: any } {
    // TODO: confirm if the input and return typing are correct
    const isRootObject = (meta === undefined || typeof meta === 'string');

    if (!isRootObject && meta.images[this.uuid] !== undefined) {

      return meta.images[this.uuid];

    }

    const output: {
      uuid: string;
      url: string | Record<string, any> | (string | Record<string, any>)[];
    } = {
      uuid: this.uuid,
      url: ''
    };

    const data = this.data;

    if (data !== null) {

      let url;

      if (Array.isArray(data)) {

        // cube texture

        url = [];

        for (let i = 0, l = data.length; i < l; i++) {

          if (data[i].isDataTexture) {

            url.push(serializeImage(data[i].image));

          } else {

            url.push(serializeImage(data[i]));

          }

        }

      } else {

        // texture

        url = serializeImage(data);

      }

      output.url = url;

    }

    if (!isRootObject) {

      meta.images[this.uuid] = output;

    }

    return output;

  }
}

/**
 *
 */
function serializeImage(image: any) {
  if ((typeof HTMLImageElement !== 'undefined' && image instanceof HTMLImageElement) ||
    (typeof HTMLCanvasElement !== 'undefined' && image instanceof HTMLCanvasElement) ||
    (typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap)) {

    // default images

    return ImageUtils.getDataURL(image);

  } else {

    if (image.data) {

      // images of DataTexture

      return {
        data: Array.from(image.data),
        width: image.width,
        height: image.height,
        type: image.data.constructor.name
      };

    } else {

      console.warn('Texture: Unable to serialize Texture.');
      return {};

    }

  }

}
