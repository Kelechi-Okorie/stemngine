const premultiplied_alpha_fragment = /* glsl */`
#ifdef PREMULTIPLIED_ALPHA

	// Get normal blending with premultipled, use with CustomBlending, OneFactor, OneMinusSrcAlphaFactor, AddEquation.
	gl_FragColor.rgb *= gl_FragColor.a;

#endif
`;

export default premultiplied_alpha_fragment;
