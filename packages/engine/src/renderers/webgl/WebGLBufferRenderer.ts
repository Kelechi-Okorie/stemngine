import { WebGLRenderer } from "../WebGLRenderer";
import { WebGLExtensions } from "./WebGLExtensions";
import { WebGLInfo } from "./WebGLInfo";

export function WebGLBufferRenderer(
  gl: WebGL2RenderingContext,
  extensions: ReturnType<typeof WebGLExtensions>,
  info: ReturnType<typeof WebGLInfo>
) {

  let mode: number;

  function setMode(value: number) {

    mode = value;

  }

  function render(start: number, count: number) {

    gl.drawArrays(mode, start, count);

    info.update(count, mode, 1);

  }

  function renderInstances(start: number, count: number, primcount: number) {

    if (primcount === 0) return;

    gl.drawArraysInstanced(mode, start, count, primcount);

    info.update(count, mode, primcount);

  }

  function renderMultiDraw(starts: Int32Array, counts: Int32Array, drawCount: number) {

    if (drawCount === 0) return;

    const extension = extensions.get('WEBGL_multi_draw');
    extension.multiDrawArraysWEBGL(mode, starts, 0, counts, 0, drawCount);

    let elementCount = 0;
    for (let i = 0; i < drawCount; i++) {

      elementCount += counts[i];

    }

    info.update(elementCount, mode, 1);

  }

  function renderMultiDrawInstances(
    starts: Int32Array,
    counts: Int32Array,
    drawCount: number,
    primcount: Int32Array
  ) {

    if (drawCount === 0) return;

    const extension = extensions.get('WEBGL_multi_draw');

    if (extension === null) {

      for (let i = 0; i < starts.length; i++) {

        renderInstances(starts[i], counts[i], primcount[i]);

      }

    } else {

      extension.multiDrawArraysInstancedWEBGL(mode, starts, 0, counts, 0, primcount, 0, drawCount);

      let elementCount = 0;
      for (let i = 0; i < drawCount; i++) {

        elementCount += counts[i] * primcount[i];

      }

      info.update(elementCount, mode, 1);

    }

  }

  //

  // this.setMode = setMode;
  // this.render = render;
  // this.renderInstances = renderInstances;
  // this.renderMultiDraw = renderMultiDraw;
  // this.renderMultiDrawInstances = renderMultiDrawInstances;

  return { setMode, render, renderInstances, renderMultiDraw, renderMultiDrawInstances };
}
