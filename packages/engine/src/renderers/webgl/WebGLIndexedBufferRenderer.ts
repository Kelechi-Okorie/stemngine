import { WebGLExtensions } from "./WebGLExtensions";
import { WebGLInfo } from "./WebGLInfo";
import { WebGLBufferRenderer } from "./WebGLBufferRenderer";

export class WebGLIndexedBufferRenderer {

  public gl: WebGL2RenderingContext;
  public extensions: WebGLExtensions;
  public info: WebGLInfo;

  public mode!: GLenum; // WebGL draw mode, e.g., gl.TRIANGLES, gl.LINES, etc.

  public type!: GLenum; // WebGL index type, e.g., gl.UNSIGNED_SHORT or gl.UNSIGNED_INT;
  public bytesPerElement!: number;

  constructor(
    gl: WebGL2RenderingContext,
    extensions: WebGLExtensions,
    info: WebGLInfo
  ) {
    this.gl = gl;
    this.extensions = extensions;
    this.info = info;
  }

  public setMode(value: GLenum) {

    this.mode = value;

  }


  public setIndex(value: { type: GLenum; bytesPerElement: number }) {

    this.type = value.type;
    this.bytesPerElement = value.bytesPerElement;

  }

  public render(start: number, count: number) {

    this.gl.drawElements(this.mode, count, this.type, start * this.bytesPerElement);

    this.info.update(count, this.mode, 1);

  }

  public renderInstances(start: number, count: number, primcount: number) {

    if (primcount === 0) return;

    this.gl.drawElementsInstanced(this.mode, count, this.type, start * this.bytesPerElement, primcount);

    this.info.update(count, this.mode, primcount);

  }

  public renderMultiDraw(
    starts: Int32Array | Uint32Array,
    counts: Int32Array | Uint32Array,
    drawCount: number
  ) {

    if (drawCount === 0) return;

    const extension = this.extensions.get('WEBGL_multi_draw');
    extension.multiDrawElementsWEBGL(this.mode, counts, 0, this.type, starts, 0, drawCount);

    let elementCount = 0;
    for (let i = 0; i < drawCount; i++) {

      elementCount += counts[i];

    }

    this.info.update(elementCount, this.mode, 1);


  }

  public renderMultiDrawInstances(
    starts: Int32Array | Uint32Array,
    counts: Int32Array | Uint32Array,
    drawCount: number,
    primcount: Int32Array | Uint32Array
  ) {

    if (drawCount === 0) return;

    const extension = this.extensions.get('WEBGL_multi_draw');

    if (extension === null) {

      for (let i = 0; i < starts.length; i++) {

        this.renderInstances(starts[i] / this.bytesPerElement, counts[i], primcount[i]);

      }

    } else {

      extension.multiDrawElementsInstancedWEBGL(this.mode, counts, 0, this.type, starts, 0, primcount, 0, drawCount);

      let elementCount = 0;
      for (let i = 0; i < drawCount; i++) {

        elementCount += counts[i] * primcount[i];

      }

      this.info.update(elementCount, this.mode, 1);

    }

  }

}

export function isIndexedRenderer(
  r: WebGLBufferRenderer | WebGLIndexedBufferRenderer
): r is WebGLIndexedBufferRenderer {
  return 'setIndex' in r;
}

