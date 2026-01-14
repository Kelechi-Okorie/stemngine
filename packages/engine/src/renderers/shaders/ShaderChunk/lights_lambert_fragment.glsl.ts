const lights_lambert_fragment = /* glsl */`
LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;
`;

export default lights_lambert_fragment;
