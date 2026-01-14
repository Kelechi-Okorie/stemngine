import { describe, it, expect, beforeEach, vi } from "vitest";
import { WebGLInfo } from "../../../../src/renderers/webgl/WebGLInfo";

const gl = {
  TRIANGLES: 0x0004,
  LINES: 0x0001,
  LINE_STRIP: 0x0003,
  LINE_LOOP: 0x0002,
  POINTS: 0x0000,
} as unknown as WebGL2RenderingContext;



describe('WebGLInfo', () => {
  describe('update()', () => {

    let info: ReturnType<typeof WebGLInfo>;

    beforeEach(() => {
      info = WebGLInfo(gl);
      info.reset();
    });

    it('increments render.calls on every update', () => {
      info.update(3, gl.TRIANGLES, 1);
      info.update(3, gl.TRIANGLES, 1);

      expect(info.render.calls).toBe(2);
    });

    it('counts triangles correctly', () => {
      info.update(3, gl.TRIANGLES, 1); // 1 triangle
      info.update(6, gl.TRIANGLES, 2); // 4 triangles

      expect(info.render.triangles).toBe(5);
    });

    it('counts lines correctly (LINES)', () => {
      info.update(2, gl.LINES, 1); // 1 line
      info.update(4, gl.LINES, 2); // 4 lines

      expect(info.render.lines).toBe(5);
    });

    it('counts lines correctly (LINE_STRIP)', () => {
      info.update(5, gl.LINE_STRIP, 1); // 4 lines
      info.update(3, gl.LINE_STRIP, 2); // 4 lines

      expect(info.render.lines).toBe(8);
    });

    it('counts lines correctly (LINE_LOOP)', () => {
      info.update(4, gl.LINE_LOOP, 1); // 4 lines
      info.update(3, gl.LINE_LOOP, 2); // 6 lines

      expect(info.render.lines).toBe(10);
    });

    it('counts points correctly', () => {
      info.update(5, gl.POINTS, 1); // 5 points
      info.update(3, gl.POINTS, 2); // 6 points

      expect(info.render.points).toBe(11);
    });

    it('does not modify counters for unknown draw mode', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      info.update(10, 123456, 1);

      expect(info.render.triangles).toBe(0);
      expect(info.render.lines).toBe(0);
      expect(info.render.points).toBe(0);
      expect(info.render.calls).toBe(1);

      expect(errorSpy).toHaveBeenCalledOnce();
      errorSpy.mockRestore();
    });

    it('reset clears render counters', () => {
      info.update(3, gl.TRIANGLES, 1);
      info.update(4, gl.POINTS, 1);

      info.reset();

      expect(info.render.calls).toBe(0);
      expect(info.render.triangles).toBe(0);
      expect(info.render.points).toBe(0);
      expect(info.render.lines).toBe(0);
    });
  });

  describe('reset()', () => {
    let info: ReturnType<typeof WebGLInfo>;

    // Create a mock WebGL2RenderingContext
    beforeEach(() => {
      info = WebGLInfo(gl);

      // simulate some rendering updates
      info.update(6, gl.TRIANGLES, 1);
      info.update(4, gl.LINES, 2);
      info.update(3, gl.POINTS, 5);
    });

    it('should reset render counters to zero', () => {
      expect(info.render.calls).toBeGreaterThan(0);
      expect(info.render.triangles).toBeGreaterThan(0);
      expect(info.render.lines).toBeGreaterThan(0);
      expect(info.render.points).toBeGreaterThan(0);

      // call reset
      info.reset();

      expect(info.render.calls).toBe(0);
      expect(info.render.triangles).toBe(0);
      expect(info.render.lines).toBe(0);
      expect(info.render.points).toBe(0);
    });
  });
});
