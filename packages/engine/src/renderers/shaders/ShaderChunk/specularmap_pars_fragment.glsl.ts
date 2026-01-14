const specularmap_pars_fragment = /* glsl */`
#ifdef USE_SPECULARMAP

	uniform sampler2D specularMap;

#endif
`;

export default specularmap_pars_fragment;
