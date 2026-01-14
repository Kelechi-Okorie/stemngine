const clearcoat_normal_fragment_begin = /* glsl */`
#ifdef USE_CLEARCOAT

	vec3 clearcoatNormal = nonPerturbedNormal;

#endif
`;

export default clearcoat_normal_fragment_begin;
