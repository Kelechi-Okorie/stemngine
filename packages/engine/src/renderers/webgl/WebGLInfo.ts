import { WebGLProgram } from "./WebGLProgram";

export class WebGLInfo {
  private readonly gl: WebGL2RenderingContext;

  public memory = {
    geometries: 0,
    textures: 0
  };

  public render = {
    frame: 0,
    calls: 0,
    triangles: 0,
    points: 0,
    lines: 0
  };

  public programs: WebGLProgram[] = [];
  public autoReset = true;


  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
  }

  public update(count: number, mode: number, instanceCount: number): void {

    this.render.calls++;

    switch (mode) {

      case this.gl.TRIANGLES:
        this.render.triangles += instanceCount * (count / 3);
        break;

      case this.gl.LINES:
        this.render.lines += instanceCount * (count / 2);
        break;

      case this.gl.LINE_STRIP:
        this.render.lines += instanceCount * (count - 1);
        break;

      case this.gl.LINE_LOOP:
        this.render.lines += instanceCount * count;
        break;

      case this.gl.POINTS:
        this.render.points += instanceCount * count;
        break;

      default:
        console.error('WebGLInfo: Unknown draw mode:', mode);
        break;

    }

  }

  public reset() {

    this.render.calls = 0;
    this.render.triangles = 0;
    this.render.points = 0;
    this.render.lines = 0;

  }

}
