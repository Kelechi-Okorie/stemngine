const logdepthbuf_pars_fragment = /* glsl */`
#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )

	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;

#endif
`;

export default logdepthbuf_pars_fragment;
