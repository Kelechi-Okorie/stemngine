const fog_vertex = /* glsl */`
#ifdef USE_FOG

	vFogDepth = - mvPosition.z;

#endif
`;

export default fog_vertex;
