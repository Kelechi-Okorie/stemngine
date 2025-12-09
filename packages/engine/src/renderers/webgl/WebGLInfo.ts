export function WebGLInfo( gl: WebGL2RenderingContext ) {

	const memory: {
    geometries: number;
    textures: number;
  } = {
		geometries: 0,
		textures: 0
	};

	const render: {
    frame: number;
    calls: number;
    triangles: number;
    points: number;
    lines: number;
  } = {
		frame: 0,
		calls: 0,
		triangles: 0,
		points: 0,
		lines: 0
	};

	function update( count:number, mode: number, instanceCount: number ): void {

		render.calls ++;

		switch ( mode ) {

			case gl.TRIANGLES:
				render.triangles += instanceCount * ( count / 3 );
				break;

			case gl.LINES:
				render.lines += instanceCount * ( count / 2 );
				break;

			case gl.LINE_STRIP:
				render.lines += instanceCount * ( count - 1 );
				break;

			case gl.LINE_LOOP:
				render.lines += instanceCount * count;
				break;

			case gl.POINTS:
				render.points += instanceCount * count;
				break;

			default:
				console.error( 'THREE.WebGLInfo: Unknown draw mode:', mode );
				break;

		}

	}

	function reset(): void {

		render.calls = 0;
		render.triangles = 0;
		render.points = 0;
		render.lines = 0;

	}

	return {
		memory,
		render,
		programs: null as any[] | null,
		autoReset: true,
		reset,
		update
	};

}
