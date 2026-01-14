const roughnessmap_pars_fragment = /* glsl */`
#ifdef USE_ROUGHNESSMAP

	uniform sampler2D roughnessMap;

#endif
`;

export default roughnessmap_pars_fragment;
