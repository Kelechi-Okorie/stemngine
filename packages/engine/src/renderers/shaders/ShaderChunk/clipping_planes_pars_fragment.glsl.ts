const clipping_planes_pars_fragment = /* glsl */`
#if NUM_CLIPPING_PLANES > 0

	varying vec3 vClipPosition;

	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];

#endif
`;

export default clipping_planes_pars_fragment;
