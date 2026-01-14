export function WebGLShader(
  gl: WebGL2RenderingContext,
  type: GLenum,  // VERTEX_SHADER, FRAGMENT_SHADER, etc.
  string: string
) {

  const shader: WebGLShader | null = gl.createShader(type);

  if (!shader) return null;

  gl.shaderSource(shader, string);
  gl.compileShader(shader);

  return shader;

}
