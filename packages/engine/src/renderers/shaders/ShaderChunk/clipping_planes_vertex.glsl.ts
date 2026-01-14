const clipping_planes_vertex = /* glsl */`
#if NUM_CLIPPING_PLANES > 0

	vClipPosition = - mvPosition.xyz;

#endif
`;

export default clipping_planes_vertex;
