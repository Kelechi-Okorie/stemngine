import { Program } from "./Program";
import { VertexArray } from "./VertexArray";
import { Buffer } from "./Buffer";

export class WebGLState {
  currentProgram: Program | null = null;
  boundVAO: VertexArray | null = null;
  arrayBuffer: Buffer | null = null;
  viewport: [number, number, number, number] = [0, 0, 800, 600];
  framebuffer: number[][][]; // 2D array of pixels [r,g,b,a]

  constructor(width: number, height: number) {
    this.framebuffer = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => [0, 0, 0, 1])
    );
  }
}
