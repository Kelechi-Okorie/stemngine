import { WebGLExtensions } from "./WebGLExtensions";
import { WebGLInfo } from "./WebGLInfo";
import { BufferAttribute } from "../../core/BufferAttribute";

export function WebGLIndexedBufferRenderer(
  gl: WebGL2RenderingContext,
  extensions: ReturnType<typeof WebGLExtensions>,
  info: ReturnType<typeof WebGLInfo>
) {

  let mode: number;
  let type: number;
  let bytesPerElement: number;


  function setMode(value: number) {

    mode = value;

  }

  function setIndex(value: BufferAttribute) {

    type = value.type;
    bytesPerElement = value.bytesPerElement;

  }

  function render(start: number, count: number) {

    gl.drawElements(mode, count, type, start * bytesPerElement);

    info.update(count, mode, 1);

  }

  function renderInstances(start: number, count: number, primcount: number) {

    if (primcount === 0) return;

    gl.drawElementsInstanced(mode, count, type, start * bytesPerElement, primcount);

    info.update(count, mode, primcount);

  }

  function renderMultiDraw(starts: Int32Array, counts: Int32Array, drawCount: number) {

    if (drawCount === 0) return;

    const extension = extensions.get('WEBGL_multi_draw');
    extension.multiDrawElementsWEBGL(mode, counts, 0, type, starts, 0, drawCount);

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

        renderInstances(starts[i] / bytesPerElement, counts[i], primcount[i]);

      }

    } else {

      extension.multiDrawElementsInstancedWEBGL(mode, counts, 0, type, starts, 0, primcount, 0, drawCount);

      let elementCount = 0;
      for (let i = 0; i < drawCount; i++) {

        elementCount += counts[i] * primcount[i];

      }

      info.update(elementCount, mode, 1);

    }

  }

  //

  // this.setMode = setMode;
  // this.setIndex = setIndex;
  // this.render = render;
  // this.renderInstances = renderInstances;
  // this.renderMultiDraw = renderMultiDraw;
  // this.renderMultiDrawInstances = renderMultiDrawInstances;

  return {
    setMode,
    setIndex,
    render,
    renderInstances,
    renderMultiDraw,
    renderMultiDrawInstances
  };

}
