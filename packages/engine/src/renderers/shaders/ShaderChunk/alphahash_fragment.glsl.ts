const alphahash_fragment = /* glsl */`
#ifdef USE_ALPHAHASH

	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;

#endif
`;

export default alphahash_fragment;
