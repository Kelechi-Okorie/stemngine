import { createElementNS, createElement, createCanvasElement } from '../utils';
import { SRGBToLinear } from "../math/ColorManagement";

interface RawImageData {
  data: Uint8Array | Uint8ClampedArray | Float32Array | number[];
  width: number;
  height: number;
}

let _canvas: HTMLCanvasElement | undefined;

/**
 * A class containing utility functions for images
 *
 * @hideconstructor
 */
export class ImageUtils {
  /**
   * Returns a data URI containing a representation of the given image
   *
   * @param image - the image object
   * @param type - Indicates the image format
   * @returns The data URI
   */
  public static getDataURL(
    image: HTMLImageElement | HTMLCanvasElement | ImageBitmap,
    type: string = 'image/png'
  ) {
    if (image instanceof HTMLImageElement && /^data:/i.test(image.src)) {

      return image.src;

    }

    if (typeof HTMLCanvasElement === 'undefined') {

      return (image as HTMLImageElement).src;

    }

    let canvas;

    if (image instanceof HTMLCanvasElement) {

      canvas = image;

    } else {

      // createElementNS in original version
      if (_canvas === undefined) _canvas = createElement('canvas');

      _canvas.width = image.width;
      _canvas.height = image.height;

      const context = _canvas.getContext('2d')!;

      if (image instanceof ImageData) {

        context.putImageData(image, 0, 0);

      } else {

        context.drawImage(image, 0, 0, image.width, image.height);

      }

      canvas = _canvas;

    }

    return canvas.toDataURL(type);
  }

  /**
   * Converts the given sRGB image data to linear color space
   *
   * @param image - The image object
   * @returns The converted image
   */
  public static sRGBToLinear(
    image: HTMLImageElement | HTMLCanvasElement | ImageBitmap | RawImageData,
  ): HTMLImageElement | HTMLCanvasElement | ImageBitmap | RawImageData {
    if ((typeof HTMLImageElement !== 'undefined' && image instanceof HTMLImageElement) ||
      (typeof HTMLCanvasElement !== 'undefined' && image instanceof HTMLCanvasElement) ||
      (typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap)) {

      // createElement in original version
      const canvas = createElement('canvas');

      canvas.width = image.width;
      canvas.height = image.height;

      const context = canvas.getContext('2d')!;
      context.drawImage(image, 0, 0, image.width, image.height);

      const imageData = context.getImageData(0, 0, image.width, image.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i++) {

        data[i] = SRGBToLinear(data[i] / 255) * 255;

      }

      context.putImageData(imageData, 0, 0);

      return canvas;

    } else if ('data' in image) {

      const data = image.data.slice(0);

      for (let i = 0; i < data.length; i++) {

        if (data instanceof Uint8Array || data instanceof Uint8ClampedArray) {

          data[i] = Math.floor(SRGBToLinear(data[i] / 255) * 255);

        } else {

          // assuming float

          data[i] = SRGBToLinear(data[i]);

        }

      }

      return {
        data: data,
        width: image.width,
        height: image.height
      };

    } else {

      console.warn('ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.');
      return image;

    }

  }
}
