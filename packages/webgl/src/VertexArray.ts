import { Buffer } from "./Buffer";
import { VertexAttribute } from "./WebGL";

export class VertexArray {
  attributes: VertexAttribute[] = [];
  elementArrayBuffer: Buffer | null = null;
}
