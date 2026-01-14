const lightmap_pars_fragment = /* glsl */`
#ifdef USE_LIGHTMAP

	uniform sampler2D lightMap;
	uniform float lightMapIntensity;

#endif
`;

export default lightmap_pars_fragment;
