const emissivemap_pars_fragment = /* glsl */`
#ifdef USE_EMISSIVEMAP

	uniform sampler2D emissiveMap;

#endif
`;

export default emissivemap_pars_fragment;
