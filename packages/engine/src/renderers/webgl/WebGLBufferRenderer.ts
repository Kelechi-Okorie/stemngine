import { WebGLExtensions } from "./WebGLExtensions";
import { WebGLInfo } from "./WebGLInfo";

export class WebGLBufferRenderer {
  public gl: WebGL2RenderingContext;
  public extensions: WebGLExtensions;
  public info: WebGLInfo;
  public mode!: GLenum; // WebGL draw mode, e.g., gl.TRIANGLES, gl.LINES, etc.

  constructor(
    gl: WebGL2RenderingContext,
    extensions: WebGLExtensions,
    info: WebGLInfo
  ) {
    this.gl = gl;
    this.extensions = extensions;
    this.info = info;
  }

  publicsetMode(value: GLenum): void {

    this.mode = value;

  }

  public render(start: number, count: number): void {

    this.gl.drawArrays(this.mode, start, count);

    this.info.update(count, this.mode, 1);

  }

  public renderInstances(start: number, count: number, primcount: number): void {

    if (primcount === 0) return;

    this.gl.drawArraysInstanced(this.mode, start, count, primcount);

    this.info.update(count, this.mode, primcount);

  }

  public renderMultiDraw(starts: Int32Array, counts: Int32Array, drawCount: number): void {

    if (drawCount === 0) return;

    const extension = this.extensions.get('WEBGL_multi_draw');
    extension.multiDrawArraysWEBGL(this.mode, starts, 0, counts, 0, drawCount);

    let elementCount = 0;
    for (let i = 0; i < drawCount; i++) {

      elementCount += counts[i];

    }

    this.info.update(elementCount, this.mode, 1);

  }

  public renderMultiDrawInstances(
    starts: Int32Array,
    counts: Int32Array,
    drawCount: number,
    primcount: Int32Array
  ): void {

    if (drawCount === 0) return;

    const extension = this.extensions.get('WEBGL_multi_draw');

    if (extension === null) {

      for (let i = 0; i < starts.length; i++) {

        this.renderInstances(starts[i], counts[i], primcount[i]);

      }

    } else {

      extension.multiDrawArraysInstancedWEBGL(this.mode, starts, 0, counts, 0, primcount, 0, drawCount);

      let elementCount = 0;
      for (let i = 0; i < drawCount; i++) {

        elementCount += counts[i] * primcount[i];

      }

      this.info.update(elementCount, this.mode, 1);

    }

  }
}
