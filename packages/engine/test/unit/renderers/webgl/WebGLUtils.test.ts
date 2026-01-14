import { describe, it, expect, beforeEach, vi } from "vitest";
import { WebGLUtils } from '../../../../src/renderers/webgl/WebGLUtils';
import { WebGLExtensions } from "../../../../src/renderers/webgl/WebGLExtensions";
import { ColorManagement } from "../../../../src/math/ColorManagement";
import { UnsignedByteType, RGBAFormat, RGB_S3TC_DXT1_Format, NoColorSpace, SRGBColorSpace } from "../../../../src/constants";

describe('WebGLUtils', () => {
  describe('convert()', () => {
    let gl: Partial<WebGL2RenderingContext>;
    let extensions: ReturnType<typeof WebGLExtensions>;
    let utils: ReturnType<typeof WebGLUtils>;

    beforeEach(() => {
      // Mock WebGL context constants
      gl = {
        UNSIGNED_BYTE: 0x1401,
        RGBA: 0x1908,
      } as any;

      // Mock extensions
      extensions = {
        get: vi.fn().mockReturnValue({
          COMPRESSED_RGBA_S3TC_DXT1_EXT: 0x83F1,
          COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT: 0x8C4D,
        }),
      } as any;

      // Mock ColorManagement singleton
      const cm = ColorManagement.instance;

      utils = WebGLUtils(gl as WebGL2RenderingContext, extensions);
    });

    it('should convert basic WebGL types', () => {
      expect(utils.convert(UnsignedByteType)).toBe(gl.UNSIGNED_BYTE);
      expect(utils.convert(RGBAFormat)).toBe(gl.RGBA);
    });

    it('should convert S3TC compressed format with default transfer', () => {
      // ColorManagement.instance.getTransfer = (cs: any) => null; // default transfer
      const result = utils.convert(RGB_S3TC_DXT1_Format);
      const ext = extensions.get('WEBGL_compressed_texture_s3tc');
      expect(result).toBe(ext?.COMPRESSED_RGB_S3TC_DXT1_EXT);
    });

    it('should convert S3TC compressed format with SRGBTransfer', () => {
      // ColorManagement.instance.getTransfer = (cs: any) => SRGBTransfer;
      const result = utils.convert(RGB_S3TC_DXT1_Format);
      const ext = extensions.get('WEBGL_compressed_texture_s3tc_srgb');
      expect(result).toBe(ext?.COMPRESSED_SRGB_S3TC_DXT1_EXT);
    });

    it('should return null for unknown numeric type', () => {
      expect(utils.convert(99999)).toBeNull();
    });

    it('should return null for unknown string type', () => {
      expect(utils.convert('NON_EXISTENT')).toBeNull();
    });

    it('should convert WebGL constant from string', () => {
      expect(utils.convert('UNSIGNED_BYTE')).toBe(gl.UNSIGNED_BYTE);
      expect(utils.convert('RGBA')).toBe(gl.RGBA);
    });
  });
});
