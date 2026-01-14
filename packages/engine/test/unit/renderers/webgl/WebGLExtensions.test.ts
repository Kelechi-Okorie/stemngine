import { describe, it, expect, beforeEach, vi } from "vitest";
import { WebGLExtensions } from "../../../../src/renderers/webgl/WebGLExtensions";

describe('WebGLExtensions', () => {
  describe('has()', () => {
    it('should return true if extension exists', () => {
      // Mock a WebGL2RenderingContext
      const gl = {
        getExtension: vi.fn((name) => (name === 'WEBGL_depth_texture' ? {} : null)),
      } as unknown as WebGL2RenderingContext;

      const extensions = WebGLExtensions(gl);

      expect(extensions.has('WEBGL_depth_texture')).toBe(true);
    });

    it('should return false if extension does not exist', () => {
      const gl = {
        getExtension: vi.fn(() => null),
      } as unknown as WebGL2RenderingContext;

      const extensions = WebGLExtensions(gl);

      expect(extensions.has('NON_EXISTENT_EXTENSION')).toBe(false);
    });

    it('should cache extension results', () => {
      const getExtensionMock = vi.fn((name) => {
        // Return null for all to force checking all prefixes
        if (['WEBGL_depth_texture', 'MOZ_WEBGL_depth_texture', 'WEBKIT_WEBGL_depth_texture'].includes(name)) {
          return {};
        }
        return null;
      });

      const gl = { getExtension: getExtensionMock } as unknown as WebGL2RenderingContext;
      const extensions = WebGLExtensions(gl);

      // First call should call gl.getExtension at least once
      extensions.has('WEBGL_depth_texture');
      expect(getExtensionMock).toHaveBeenCalled(); // at least once is enough

      const callCountAfterFirst = getExtensionMock.mock.calls.length;

      // Second call should use cache, no additional calls
      extensions.has('WEBGL_depth_texture');
      expect(getExtensionMock.mock.calls.length).toBe(callCountAfterFirst);
    });
  });

  describe('init()', () => {
    it('init() should call getExtension for all predefined extensions', () => {
      const getExtensionMock = vi.fn(() => ({})); // mock always returns an object
      const gl = { getExtension: getExtensionMock } as unknown as WebGL2RenderingContext;

      const extensions = WebGLExtensions(gl);
      extensions.init();

      // List of extensions that init calls
      const expectedExtensions = [
        'EXT_color_buffer_float',
        'WEBGL_clip_cull_distance',
        'OES_texture_float_linear',
        'EXT_color_buffer_half_float',
        'WEBGL_multisampled_render_to_texture',
        'WEBGL_render_shared_exponent',
      ];

      expectedExtensions.forEach((name) => {
        expect(getExtensionMock).toHaveBeenCalledWith(name);
      });

      // Total calls should equal number of extensions
      expect(getExtensionMock).toHaveBeenCalledTimes(expectedExtensions.length);
    });

    it('init() should cache extensions', () => {
      const getExtensionMock = vi.fn(() => ({}));
      const gl = { getExtension: getExtensionMock } as unknown as WebGL2RenderingContext;

      const extensions = WebGLExtensions(gl);

      // First init call
      extensions.init();
      const callCountAfterFirst = getExtensionMock.mock.calls.length;

      // Second init call should not call gl.getExtension again (because of caching)
      extensions.init();
      expect(getExtensionMock.mock.calls.length).toBe(callCountAfterFirst);
    });

    // it('init() should handle missing extensions gracefully', () => {
    //   const getExtensionMock = vi.fn(() => null); // simulate no extension available
    //   const warnOnceSpy = vi.spyOn(utils, 'warnOnce'); // spy on warnOnce

    //   const gl = { getExtension: getExtensionMock } as unknown as WebGL2RenderingContext;
    //   const extensions = WebGLExtensions(gl);

    //   extensions.init();

    //   // warnOnce should not be called by init() directly (it's used in get(), not init())
    //   expect(warnOnceSpy).not.toHaveBeenCalled();
    // });
  });

  describe('get()', () => {
    let gl: WebGL2RenderingContext;
    let extensions: ReturnType<typeof WebGLExtensions>;

    beforeEach(() => {
      gl = {
        getExtension: vi.fn((name) => (name === 'EXISTING_EXTENSION' ? {} : null)),
      } as unknown as WebGL2RenderingContext;

      extensions = WebGLExtensions(gl);
    });

    it('should return the extension if it exists', () => {
      const ext = extensions.get('EXISTING_EXTENSION');
      expect(ext).toBeTruthy();
    });

    it('should return null if the extension does not exist', () => {
      const ext = extensions.get('NON_EXISTENT_EXTENSION');
      expect(ext).toBeNull();
    });

    // it('should call warnOnce if the extension does not exist', () => {
    //   const warnOnceSpy = vi.spyOn(utils, 'warnOnce');

    //   extensions.get('NON_EXISTENT_EXTENSION');
    //   expect(warnOnceSpy).toHaveBeenCalledTimes(1);
    //   expect(warnOnceSpy).toHaveBeenCalledWith(
    //     'THREE.WebGLRenderer: NON_EXISTENT_EXTENSION extension not supported.'
    //   );
    // });

    // it('should not call warnOnce if the extension exists', () => {
    //   const warnOnceSpy = vi.spyOn(utils, 'warnOnce');

    //   extensions.get('EXISTING_EXTENSION');
    //   expect(warnOnceSpy).not.toHaveBeenCalled();
    // });

    it('should cache extension results', () => {
      const getExtensionMock = vi.fn((name) => (name === 'EXISTING_EXTENSION' ? {} : null));
      const glMock = { getExtension: getExtensionMock } as unknown as WebGL2RenderingContext;
      const cachedExtensions = WebGLExtensions(glMock);

      // First call fetches from gl.getExtension
      cachedExtensions.get('EXISTING_EXTENSION');
      const callCountAfterFirst = getExtensionMock.mock.calls.length;

      // Second call should use cache
      cachedExtensions.get('EXISTING_EXTENSION');
      expect(getExtensionMock.mock.calls.length).toBe(callCountAfterFirst);
    });

  });
});
