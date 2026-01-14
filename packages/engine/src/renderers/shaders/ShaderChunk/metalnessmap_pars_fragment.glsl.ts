const metalnessmap_pars_fragment = /* glsl */`
#ifdef USE_METALNESSMAP

	uniform sampler2D metalnessMap;

#endif
`;

export default metalnessmap_pars_fragment;
