const clipping_planes_pars_vertex = /* glsl */`
#if NUM_CLIPPING_PLANES > 0

	varying vec3 vClipPosition;

#endif
`;

export default clipping_planes_pars_vertex;
