const logdepthbuf_pars_vertex = /* glsl */`
#ifdef USE_LOGARITHMIC_DEPTH_BUFFER

	varying float vFragDepth;
	varying float vIsPerspective;

#endif
`;

export default logdepthbuf_pars_vertex;
