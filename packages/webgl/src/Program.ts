export class Program {
  vertexShader: (vertex: Record<number, number[]>) => Record<string, number[]>;
  fragmentShader: (frag: any) => [number, number, number, number];
  constructor(
    vs: (v: Record<number, number[]>) => Record<string, number[]>,
    fs: (f: any) => [number, number, number, number]
  ) {
    this.vertexShader = vs;
    this.fragmentShader = fs;
  }
}
