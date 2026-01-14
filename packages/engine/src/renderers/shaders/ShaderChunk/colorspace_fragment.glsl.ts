const colorspace_fragment = /* glsl */`
gl_FragColor = linearToOutputTexel( gl_FragColor );
`;

export default colorspace_fragment;
