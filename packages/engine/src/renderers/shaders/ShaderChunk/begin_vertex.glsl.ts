const begin_vertex = /* glsl */`
vec3 transformed = vec3( position );

#ifdef USE_ALPHAHASH

	vPosition = vec3( position );

#endif
`;

export default begin_vertex;
