import { describe, it, expect, vi, beforeEach } from "vitest";
import { ImageUtils } from "../../../src/extras/imageUtils";
// import { createCanvas, Canvas, Image} from 'canvas';

/**
 * @vitest-environment jsdom
 */

global.ImageData = class MockImageData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  constructor(data: Uint8ClampedArray | number[], width: number, height: number) {
    this.data = data instanceof Uint8ClampedArray ? data : new Uint8ClampedArray(data);
    this.width = width;
    this.height = height;
  }
} as any;

class MockCanvas {
  width = 0;
  height = 0;
  getContext(type: string) {
    if (type === '2d') {
      return {
        drawImage: vi.fn(),
        putImageData: vi.fn(),
        getImageData: vi.fn(() => ({
          data: new Uint8ClampedArray(this.width * this.height * 4),
        })),
      };
    }
    return null;
  }
  toDataURL(type?: string) {
    return `data:${type || 'image/png'};base64,MOCKDATA`;
  }
}

(global as any).HTMLCanvasElement = MockCanvas;
(global as any).ImageData = class {
  constructor(public width: number, public height: number) { }
};
(global as any).HTMLImageElement = class {
  width = 10;
  height = 10;
  src = '';
};

type TypedArray = Uint8ClampedArray | Float32Array | Uint8Array | Uint16Array;

// Helper to create raw image data
function createRawImageData<T extends TypedArray>(
  width: number,
  height: number,
  ArrayType: { new (length: number): T }
): { width: number; height: number; data: T } {
  return {
    width,
    height,
    data: new ArrayType(width * height * 4),
  };
}


describe("ImageUtils", () => {
  describe.skip('getDataURL', () => {
    let canvasMock: any;
    let ctxMock: any;

    beforeEach(() => {
      // Reset _canvas for each test
      // @ts-ignore
      ImageUtils["_canvas"] = undefined;

      ctxMock = {
        drawImage: vi.fn(),
        putImageData: vi.fn(),
        getImageData: vi.fn().mockReturnValue({ data: [], width: 1, height: 1 }),
      };

      canvasMock = {
        width: 0,
        height: 0,
        getContext: vi.fn().mockReturnValue(ctxMock),
        toDataURL: vi.fn().mockReturnValue("data:image/png;base64,mock"),
      };

      // Mock createElement to return our canvas mock
      vi.mock("../utils", async () => {
        const original: any = await vi.importActual("../utils");
        return {
          ...original,
          createElement: vi.fn(() => canvasMock),
        };
      });
    });

    it("returns src if image is HTMLImageElement with data URI", () => {
      const img = { src: "data:image/png;base64,123" } as HTMLImageElement;
      const result = ImageUtils.getDataURL(img);
      expect(result).toBe(img.src);
    });

    it("returns src if HTMLCanvasElement is undefined", () => {
      const img = { src: "image.png" } as HTMLImageElement;
      const originalCanvas = (global as any).HTMLCanvasElement;
      (global as any).HTMLCanvasElement = undefined;
      const result = ImageUtils.getDataURL(img);
      expect(result).toBe(img.src);
      (global as any).HTMLCanvasElement = originalCanvas;
    });

    it("returns canvas.toDataURL if image is HTMLCanvasElement", () => {
      const canvas = { ...canvasMock };
      const result = ImageUtils.getDataURL(canvas as unknown as HTMLCanvasElement);
      expect(result).toBe("data:image/png;base64,mock");
    });

    it("creates canvas and draws HTMLImageElement", () => {
      const img = { width: 100, height: 50 } as HTMLImageElement;
      const result = ImageUtils.getDataURL(img);
      expect(canvasMock.width).toBe(100);
      expect(canvasMock.height).toBe(50);
      expect(ctxMock.drawImage).toHaveBeenCalledWith(img, 0, 0, 100, 50);
      expect(result).toBe("data:image/png;base64,mock");
    });

    it("respects custom type parameter", () => {
      const img = { width: 10, height: 10 } as HTMLImageElement;
      canvasMock.toDataURL = vi.fn().mockReturnValue("data:image/jpeg;base64,abc");
      const result = ImageUtils.getDataURL(img, "image/jpeg");
      expect(result).toBe("data:image/jpeg;base64,abc");
    });
  });

  describe.skip('sRGBToLinear()', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("converts raw image data (Uint8ClampedArray) to linear", () => {
      const raw = createRawImageData(2, 2, Uint8ClampedArray);
      const result = ImageUtils.sRGBToLinear(raw) as typeof raw;

      expect(result.width).toBe(raw.width);
      expect(result.height).toBe(raw.height);
      expect(result.data).not.toEqual(raw.data);
      // Check first pixel roughly converted
      expect(result.data[0]).toBeLessThan(128);
    });

    it("converts raw image data (Float32Array) to linear", () => {
      const raw = createRawImageData(2, 2, Float32Array);
      // fill float values in 0–1 range
      raw.data.fill(0.5);
      const result = ImageUtils.sRGBToLinear(raw) as typeof raw;
      expect(result.data[0]).toBeCloseTo(Math.pow((0.5 + 0.055) / 1.055, 2.4));
    });

    it.skip("converts HTMLCanvasElement to linear", () => {
      const canvas = document.createElement("canvas");
      canvas.width = 2;
      canvas.height = 2;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "rgb(128,128,128)";
      ctx.fillRect(0, 0, 2, 2);

      const result = ImageUtils.sRGBToLinear(canvas) as HTMLCanvasElement;
      expect(result).not.toBe(canvas);
      expect(result.width).toBe(canvas.width);
      expect(result.height).toBe(canvas.height);
    });

    it("converts HTMLImageElement to linear", () => {
      const img = document.createElement("img");
      img.width = 2;
      img.height = 2;
      // We won't set src; just test the canvas creation branch
      const result = ImageUtils.sRGBToLinear(img) as HTMLCanvasElement;
      expect(result.width).toBe(img.width);
      expect(result.height).toBe(img.height);
    });

    it("returns input for unsupported types", () => {
      const input = { foo: "bar" };
      console.warn = vi.fn();
      const result = ImageUtils.sRGBToLinear(input as any);
      expect(result).toBe(input);
      expect(console.warn).toHaveBeenCalledWith(
        "ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."
      );
    });
  });
});
