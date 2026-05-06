import { PlaneGeometry, ShaderMaterial, Mesh, Camera, Matrix4, Material } from "@stemngine/engine";
import { LAYERS } from "../../Interfaces";

/**
 * Screen-space grids
 * 
 * A raymarched ground-plane grid rendered in screen space
 */
export class Grid {

  public grid: Mesh;

  private material: Material;

  constructor() {

    const geometry = new PlaneGeometry(2, 2);

    const vertexShader = `
      varying vec2 vUv;

      void main() {
        vUv = uv;

        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      precision highp float;

      varying vec2 vUv;
      
      uniform mat4 uCameraMatrixWorld;
      uniform mat4 uProjectionMatrix;
      uniform mat4 uProjectionMatrixInverse;

      void main() {

        // 1. screen -> NDC
        vec2 ndc = vUv * 2.0 - 1.0;

        // 2. NDC -> view space ray
        vec4 rayClip = vec4(ndc, -1.0, 1.0);
        vec4 rayView = uProjectionMatrixInverse * rayClip;

        // 3. view -> world direction
        vec3 rayDir = normalize((uCameraMatrixWorld * vec4(rayView.xyz, 0.0)).xyz);

        // 4. camera postion
        vec3 rayOrigin = uCameraMatrixWorld[3].xyz;

        // 5. prevent division by zero
        if (abs(rayDir.y) < 0.0001) discard;

        // 6. intersect with plane y = 0
        float t = -rayOrigin.y / rayDir.y;

        // 7. discard pixels behind camera
        if (t < 0.0) discard;

        // 8 compute world position
        vec3 worldPos = rayOrigin + rayDir * t;

        // project to clip space
        vec4 clipPos = uProjectionMatrix * inverse(uCameraMatrixWorld) * vec4(worldPos, 1.0);

        // perspective divide
        float ndcDepth = clipPos.z / clipPos.w;

        // convert from [-1, 1] -> [0, 1]
        float depth = ndcDepth * 0.5 + 0.5;

        gl_FragDepth = depth;

        vec2 base = worldPos.xz;

        // minor grid (1 unit)
        vec2 minorGrid = abs(fract(base - 0.5) - 0.5) / fwidth(base);

        // major grid ( every 10 units)
        vec2 majorGrid = abs(fract(base / 10.0 - 0.5) - 0.5) / fwidth(base / 10.0);

        float minorLine = min(minorGrid.x, minorGrid.y);
        float majorLine = min(majorGrid.x, majorGrid.y);

        // convert to alpha
        float minorAlpha = 1.0 - clamp(minorLine, 0.0, 1.0);
        float majorAlpha = 1.0 - clamp(majorLine, 0.0, 1.0);

        // combine
        float alpha = max(minorAlpha * 0.5, majorAlpha);
        
        if (alpha < 0.01) discard;

        float xDist = abs(worldPos.x);
        float zDist = abs(worldPos.z);

        // anti-alised line
        float xAxis = 1.0 - smoothstep(0.0, fwidth(worldPos.z), zDist);
        float zAxis = 1.0 - smoothstep(0.0, fwidth(worldPos.x), xDist);

        float dist = length(worldPos.xz);
        float fade = exp(-dist * 0.02); // TODO: tweak
        alpha *= fade;

        vec3 axisColorX = vec3(1.0, 0.0, 0.0);
        vec3 axisColorZ = vec3(0.0, 0.0, 1.0);
        
        vec3 color = vec3(0.7);
        color = mix(color, axisColorX, xAxis);
        color = mix(color, axisColorZ, zAxis);

        // gl_FragColor = vec4(vec3(0.7), alpha);
        gl_FragColor = vec4(color, alpha);
      }
    `;

    this.material = new ShaderMaterial({
      uniforms: {
        uCameraMatrixWorld: { value: new Matrix4() },
        uProjectionMatrix: { value: new Matrix4() },
        uProjectionMatrixInverse: { value: new Matrix4() }
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthTest: true,
      depthWrite: false
    });

    this.grid = new Mesh(geometry, this.material);
    this.grid.name = "3D viewport grid";
    this.grid.layers.set(LAYERS.HELPERS);

  }

  public update(camera: Camera) {

    const material = this.grid.material as ShaderMaterial;

    // camera.updateMatrixWorld(true);
    // camera.updateProjectionMatrix();  // TODO: check

    material.uniforms.uCameraMatrixWorld.value.copy(camera.matrixWorld);
    material.uniforms.uProjectionMatrix.value.copy(camera.projectionMatrix);
    material.uniforms.uProjectionMatrixInverse.value.copy(camera.projectionMatrixInverse);

  }

}
