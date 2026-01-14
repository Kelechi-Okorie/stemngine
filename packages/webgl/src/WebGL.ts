import { Buffer } from "./Buffer";
import { WebGLState } from "./WebGLState";
import { VertexArray } from "./VertexArray";

export type BufferData = Float32Array | Uint16Array;

export interface VertexAttribute {
  enabled: boolean;
  buffer: Buffer | null;
  size: number;           // 1, 2, 3, 4
  type: 'FLOAT' | 'INT';  // simplify
  normalized: boolean;
  stride: number;
  offset: number;
}

export class WebGL {
  public state: WebGLState;

  public TRIANGLES = 0x0004;
  public LINES = 0x0001;
  public LINE_STRIP = 0x0003;
  public LINE_LOOP = 0x0002;
  public POINTS = 0x0000;


  constructor(width: number = 650, height: number = 450) {
    this.state = new WebGLState(width, height);
  }

  public bindBuffer(state: WebGLState, buf: Buffer) {
    this.state.arrayBuffer = buf;
  }

  public bindVertexArray(state: WebGLState, vao: VertexArray) {
    this.state.boundVAO = vao;
  }

  public enableVertexAttribArray(state: WebGLState, index: number) {
    if (!this.state.boundVAO) return;
    this.state.boundVAO.attributes[index].enabled = true;
  }

  public vertexAttribPointer(
    state: WebGLState,
    index: number,
    size: number,
    type: 'FLOAT' | 'INT',
    normalized: boolean,
    stride: number,
    offset: number
  ) {
    if (!this.state.boundVAO) return;
    const attr: VertexAttribute = {
      enabled: true,
      buffer: state.arrayBuffer,
      size,
      type,
      normalized,
      stride,
      offset,
    };
    this.state.boundVAO.attributes[index] = attr;
  }

  public drawArrays(state: WebGLState, count: number) {
    if (!this.state.currentProgram || !this.state.boundVAO) return;

    for (let i = 0; i < count; i++) {
      const vertex: Record<number, number[]> = {};

      // fetch vertex data for enabled attributes
      this.state.boundVAO.attributes.forEach((attr, loc) => {
        if (attr.enabled && attr.buffer) {
          const start = attr.offset + i * attr.stride;
          vertex[loc] = Array.from(attr.buffer.data.slice(start, start + attr.size));
        }
      });

      // run vertex shader
      const vsOutput = this.state.currentProgram.vertexShader(vertex);

      // rasterize and run fragment shader (simplified for now)
      const fragColor = this.state.currentProgram.fragmentShader(vsOutput);
      // map to framebuffer (super simplified, assumes 1-to-1 mapping)
      const x = Math.floor(vsOutput['position'][0] * state.viewport[2]);
      const y = Math.floor(vsOutput['position'][1] * state.viewport[3]);
      if (x >= 0 && y >= 0 && x < state.viewport[2] && y < state.viewport[3]) {
        state.framebuffer[y][x] = fragColor;
      }
    }
  }


}
