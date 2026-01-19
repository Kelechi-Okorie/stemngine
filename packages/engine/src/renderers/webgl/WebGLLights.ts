import { Camera } from '../../cameras/Camera';
import { Light } from '../../lights/Light';
import { Color } from '../../math/Color';
import { Matrix4 } from '../../math/Matrix4';
import { Vector2 } from '../../math/Vector2';
import { Vector3 } from '../../math/Vector3';
import { UniformsLib } from '../shaders/UniformsLib';
import { WebGLExtensions } from './WebGLExtensions';
import { Texture } from '../../textures/Texture.js';
import { isLightProbe } from '../../lights/LightProbe';
import { isRectAreaLight } from '../../lights/RectAreaLight';
import { isDirectionalLight } from '../../lights/DirectionalLight';

type DirectionalLightUniforms = {
  direction: Vector3;
  color: Color;
};

type SpotLightUniforms = {
  position: Vector3;
  direction: Vector3;
  color: Color;
  distance: number;
  coneCos: number;
  penumbraCos: number;
  decay: number;
};

type PointLightUniforms = {
  position: Vector3;
  color: Color;
  distance: number;
  decay: number;
};

type HemisphereLightUniforms = {
  direction: Vector3;
  skyColor: Color;
  groundColor: Color;
};

type RectAreaLightUniforms = {
  color: Color;
  position: Vector3;
  halfWidth: Vector3;
  halfHeight: Vector3;
};

type LightUniforms =
  | DirectionalLightUniforms
  | SpotLightUniforms
  | PointLightUniforms
  | HemisphereLightUniforms
  | RectAreaLightUniforms;

type DirectionalLightShadowUniforms = {
  shadowIntensity: number;
  shadowBias: number;
  shadowNormalBias: number;
  shadowRadius: number;
  shadowMapSize: Vector2;
};

type SpotLightShadowUniforms = DirectionalLightShadowUniforms;

type PointLightShadowUniforms = DirectionalLightShadowUniforms & {
  shadowCameraNear: number;
  shadowCameraFar: number;
};

type WebGLLightsState = {
  version: number;

  hash: {
    directionalLength: number;
    pointLength: number;
    spotLength: number;
    rectAreaLength: number;
    hemiLength: number;

    numDirectionalShadows: number;
    numPointShadows: number;
    numSpotShadows: number;
    numSpotMaps: number;

    numLightProbes: number;
  };

  ambient: [number, number, number];
  probe: Vector3[];

  directional: DirectionalLightUniforms[];
  directionalShadow: DirectionalLightShadowUniforms[];
  directionalShadowMap: (Texture | null)[];
  directionalShadowMatrix: Matrix4[];

  spot: SpotLightUniforms[];
  spotShadow: SpotLightShadowUniforms[];
  spotShadowMap: (Texture | null)[];
  spotLightMatrix: Matrix4[];
  spotLightMap: Texture[];

  rectArea: RectAreaLightUniforms[];
  rectAreaLTC1: Texture | null;
  rectAreaLTC2: Texture | null;

  point: PointLightUniforms[];
  pointShadow: PointLightShadowUniforms[];
  pointShadowMap: (Texture | null)[];
  pointShadowMatrix: Matrix4[];

  hemi: HemisphereLightUniforms[];

  numSpotLightShadowsWithMaps: number;
  numLightProbes: number;
};

type TexturableLight = Light & { map?: Texture };


function UniformsCache() {

  const lights: Record<number, any> = {};

  return {

    get: function (light: Light) {

      if (lights[light.id] !== undefined) {

        return lights[light.id];

      }

      let uniforms;

      switch (light.type) {

        case 'DirectionalLight':
          uniforms = {
            direction: new Vector3(),
            color: new Color()
          };
          break;

        case 'SpotLight':
          uniforms = {
            position: new Vector3(),
            direction: new Vector3(),
            color: new Color(),
            distance: 0,
            coneCos: 0,
            penumbraCos: 0,
            decay: 0
          };
          break;

        case 'PointLight':
          uniforms = {
            position: new Vector3(),
            color: new Color(),
            distance: 0,
            decay: 0
          };
          break;

        case 'HemisphereLight':
          uniforms = {
            direction: new Vector3(),
            skyColor: new Color(),
            groundColor: new Color()
          };
          break;

        case 'RectAreaLight':
          uniforms = {
            color: new Color(),
            position: new Vector3(),
            halfWidth: new Vector3(),
            halfHeight: new Vector3()
          };
          break;

      }

      lights[light.id] = uniforms;

      return uniforms;

    }

  };

}

function ShadowUniformsCache() {

  const lights: Record<number, any> = {};

  return {

    get: function (light: Light) {

      if (lights[light.id] !== undefined) {

        return lights[light.id];

      }

      let uniforms;

      switch (light.type) {

        case 'DirectionalLight':
          uniforms = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new Vector2()
          };
          break;

        case 'SpotLight':
          uniforms = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new Vector2()
          };
          break;

        case 'PointLight':
          uniforms = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new Vector2(),
            shadowCameraNear: 1,
            shadowCameraFar: 1000
          };
          break;

        // TODO (abelnation): set RectAreaLight shadow uniforms

      }

      lights[light.id] = uniforms;

      return uniforms;

    }

  };

}



let nextVersion = 0;

function shadowCastingAndTexturingLightsFirst(lightA: any, lightB: any) {

  return (lightB.castShadow ? 2 : 0) - (lightA.castShadow ? 2 : 0) + (lightB.map ? 1 : 0) - (lightA.map ? 1 : 0);

}

export class WebGLLights {
  private readonly extensions: WebGLExtensions;
  private cache = UniformsCache();

  private shadowCache = ShadowUniformsCache();

  public state: WebGLLightsState = {

    version: 0,

    hash: {
      directionalLength: - 1,
      pointLength: - 1,
      spotLength: - 1,
      rectAreaLength: - 1,
      hemiLength: - 1,

      numDirectionalShadows: - 1,
      numPointShadows: - 1,
      numSpotShadows: - 1,
      numSpotMaps: - 1,

      numLightProbes: - 1
    },

    ambient: [0, 0, 0],
    probe: [],
    directional: [],
    directionalShadow: [],
    directionalShadowMap: [],
    directionalShadowMatrix: [],
    spot: [],
    spotLightMap: [],
    spotShadow: [],
    spotShadowMap: [],
    spotLightMatrix: [],
    rectArea: [],
    rectAreaLTC1: null,
    rectAreaLTC2: null,
    point: [],
    pointShadow: [],
    pointShadowMap: [],
    pointShadowMatrix: [],
    hemi: [],
    numSpotLightShadowsWithMaps: 0,
    numLightProbes: 0

  };

  private vector3 = new Vector3();
  private matrix4 = new Matrix4();
  private matrix42 = new Matrix4();

  constructor(extensions: WebGLExtensions) {
    this.extensions = extensions;

    for (let i = 0; i < 9; i++) this.state.probe.push(new Vector3());

  }

  public setup(lights: Light[]) {

    let r = 0, g = 0, b = 0;

    for (let i = 0; i < 9; i++) this.state.probe[i].set(0, 0, 0);

    let directionalLength = 0;
    let pointLength = 0;
    let spotLength = 0;
    let rectAreaLength = 0;
    let hemiLength = 0;

    let numDirectionalShadows = 0;
    let numPointShadows = 0;
    let numSpotShadows = 0;
    let numSpotMaps = 0;
    let numSpotShadowsWithMaps = 0;

    let numLightProbes = 0;

    // ordering : [shadow casting + map texturing, map texturing, shadow casting, none ]
    lights.sort(shadowCastingAndTexturingLightsFirst);

    for (let i = 0, l = lights.length; i < l; i++) {

      const light = lights[i];

      const color = light.color;
      const intensity = light.intensity;
      const distance = light.distance;

      const shadowMap = (light.shadow && light.shadow.map) ? light.shadow.map.texture : null;

      if ('isAmbientLight' in light) {

        r += color.r * intensity;
        g += color.g * intensity;
        b += color.b * intensity;

      } else if (isLightProbe(light)) {

        for (let j = 0; j < 9; j++) {

          this.state.probe[j].addScaledVector(light.sh.coefficients[j], intensity);

        }

        numLightProbes++;

      } else if ('isDirectionalLight' in light) {

        const uniforms = this.cache.get(light);

        uniforms.color.copy(light.color).multiplyScalar(light.intensity);

        if (light.castShadow) {

          const shadow = light.shadow;

          const shadowUniforms = this.shadowCache.get(light);

          shadowUniforms.shadowIntensity = shadow.intensity;
          shadowUniforms.shadowBias = shadow.bias;
          shadowUniforms.shadowNormalBias = shadow.normalBias;
          shadowUniforms.shadowRadius = shadow.radius;
          shadowUniforms.shadowMapSize = shadow.mapSize;

          this.state.directionalShadow[directionalLength] = shadowUniforms;
          this.state.directionalShadowMap[directionalLength] = shadowMap;
          this.state.directionalShadowMatrix[directionalLength] = light.shadow.matrix;

          numDirectionalShadows++;

        }

        this.state.directional[directionalLength] = uniforms;

        directionalLength++;

      } else if ('isSpotLight' in light) {

        const uniforms = this.cache.get(light);

        uniforms.position.setFromMatrixPosition(light.matrixWorld);

        uniforms.color.copy(color).multiplyScalar(intensity);
        uniforms.distance = distance;

        uniforms.coneCos = Math.cos(light.angle!);
        uniforms.penumbraCos = Math.cos(light.angle! * (1 - light.penumbra!));
        uniforms.decay = light.decay;

        this.state.spot[spotLength] = uniforms;

        const shadow = light.shadow;

        if ('map' in light) {

          this.state.spotLightMap[numSpotMaps] = light.map as Texture;
          numSpotMaps++;

          // make sure the lightMatrix is up to date
          // TODO : do it if required only
          shadow.updateMatrices(light);

          if (light.castShadow) numSpotShadowsWithMaps++;

        }

        this.state.spotLightMatrix[spotLength] = shadow.matrix;

        if (light.castShadow) {

          const shadowUniforms = this.shadowCache.get(light);

          shadowUniforms.shadowIntensity = shadow.intensity;
          shadowUniforms.shadowBias = shadow.bias;
          shadowUniforms.shadowNormalBias = shadow.normalBias;
          shadowUniforms.shadowRadius = shadow.radius;
          shadowUniforms.shadowMapSize = shadow.mapSize;

          this.state.spotShadow[spotLength] = shadowUniforms;
          this.state.spotShadowMap[spotLength] = shadowMap;

          numSpotShadows++;

        }

        spotLength++;

      } else if (isRectAreaLight(light)) {

        const uniforms = this.cache.get(light);

        uniforms.color.copy(color).multiplyScalar(intensity);

        uniforms.halfWidth.set(light.width * 0.5, 0.0, 0.0);
        uniforms.halfHeight.set(0.0, light.height * 0.5, 0.0);

        this.state.rectArea[rectAreaLength] = uniforms;

        rectAreaLength++;

      } else if ('isPointLight' in light) {

        const uniforms = this.cache.get(light);

        uniforms.color.copy(light.color).multiplyScalar(light.intensity);
        uniforms.distance = light.distance;
        uniforms.decay = light.decay;

        if (light.castShadow) {

          const shadow = light.shadow;

          const shadowUniforms = this.shadowCache.get(light);

          shadowUniforms.shadowIntensity = shadow.intensity;
          shadowUniforms.shadowBias = shadow.bias;
          shadowUniforms.shadowNormalBias = shadow.normalBias;
          shadowUniforms.shadowRadius = shadow.radius;
          shadowUniforms.shadowMapSize = shadow.mapSize;
          shadowUniforms.shadowCameraNear = shadow.camera.near;
          shadowUniforms.shadowCameraFar = shadow.camera.far;

          this.state.pointShadow[pointLength] = shadowUniforms;
          this.state.pointShadowMap[pointLength] = shadowMap;
          this.state.pointShadowMatrix[pointLength] = light.shadow.matrix;

          numPointShadows++;

        }

        this.state.point[pointLength] = uniforms;

        pointLength++;

      } else if ('isHemisphereLight' in light) {

        const uniforms = this.cache.get(light);

        uniforms.skyColor.copy(light.color).multiplyScalar(intensity);
        uniforms.groundColor.copy(light.groundColor).multiplyScalar(intensity);

        this.state.hemi[hemiLength] = uniforms;

        hemiLength++;

      }

    }

    // TODO: look at RectAreaLight LTC support
    // if (rectAreaLength > 0) {

    //   if (extensions.has('OES_texture_float_linear') === true) {

    //     state.rectAreaLTC1 = UniformsLib.LTC_FLOAT_1;
    //     state.rectAreaLTC2 = UniformsLib.LTC_FLOAT_2;

    //   } else {

    //     state.rectAreaLTC1 = UniformsLib.LTC_HALF_1;
    //     state.rectAreaLTC2 = UniformsLib.LTC_HALF_2;

    //   }

    // }

    this.state.ambient[0] = r;
    this.state.ambient[1] = g;
    this.state.ambient[2] = b;

    const hash = this.state.hash;

    if (hash.directionalLength !== directionalLength ||
      hash.pointLength !== pointLength ||
      hash.spotLength !== spotLength ||
      hash.rectAreaLength !== rectAreaLength ||
      hash.hemiLength !== hemiLength ||
      hash.numDirectionalShadows !== numDirectionalShadows ||
      hash.numPointShadows !== numPointShadows ||
      hash.numSpotShadows !== numSpotShadows ||
      hash.numSpotMaps !== numSpotMaps ||
      hash.numLightProbes !== numLightProbes) {

      this.state.directional.length = directionalLength;
      this.state.spot.length = spotLength;
      this.state.rectArea.length = rectAreaLength;
      this.state.point.length = pointLength;
      this.state.hemi.length = hemiLength;

      this.state.directionalShadow.length = numDirectionalShadows;
      this.state.directionalShadowMap.length = numDirectionalShadows;
      this.state.pointShadow.length = numPointShadows;
      this.state.pointShadowMap.length = numPointShadows;
      this.state.spotShadow.length = numSpotShadows;
      this.state.spotShadowMap.length = numSpotShadows;
      this.state.directionalShadowMatrix.length = numDirectionalShadows;
      this.state.pointShadowMatrix.length = numPointShadows;
      this.state.spotLightMatrix.length = numSpotShadows + numSpotMaps - numSpotShadowsWithMaps;
      this.state.spotLightMap.length = numSpotMaps;
      this.state.numSpotLightShadowsWithMaps = numSpotShadowsWithMaps;
      this.state.numLightProbes = numLightProbes;

      hash.directionalLength = directionalLength;
      hash.pointLength = pointLength;
      hash.spotLength = spotLength;
      hash.rectAreaLength = rectAreaLength;
      hash.hemiLength = hemiLength;

      hash.numDirectionalShadows = numDirectionalShadows;
      hash.numPointShadows = numPointShadows;
      hash.numSpotShadows = numSpotShadows;
      hash.numSpotMaps = numSpotMaps;

      hash.numLightProbes = numLightProbes;

      this.state.version = nextVersion++;

    }

  }

  public setupView(lights: Light[], camera: Camera) {

    let directionalLength = 0;
    let pointLength = 0;
    let spotLength = 0;
    let rectAreaLength = 0;
    let hemiLength = 0;

    const viewMatrix = camera.matrixWorldInverse;

    for (let i = 0, l = lights.length; i < l; i++) {

      const light = lights[i];

      if ('isDirectionalLight' in light) {

        const uniforms = this.state.directional[directionalLength];

        uniforms.direction.setFromMatrixPosition(light.matrixWorld);
        this.vector3.setFromMatrixPosition(light.target!.matrixWorld);
        uniforms.direction.sub(this.vector3);
        uniforms.direction.transformDirection(viewMatrix);

        directionalLength++;

      } else if ('isSpotLight' in light) {

        const uniforms = this.state.spot[spotLength];

        uniforms.position.setFromMatrixPosition(light.matrixWorld);
        uniforms.position.applyMatrix4(viewMatrix);

        uniforms.direction.setFromMatrixPosition(light.matrixWorld);
        this.vector3.setFromMatrixPosition(light.target!.matrixWorld);
        uniforms.direction.sub(this.vector3);
        uniforms.direction.transformDirection(viewMatrix);

        spotLength++;

      } else if (isRectAreaLight(light)) {

        const uniforms = this.state.rectArea[rectAreaLength];

        uniforms.position.setFromMatrixPosition(light.matrixWorld);
        uniforms.position.applyMatrix4(viewMatrix);

        // extract local rotation of light to derive width/height half vectors
        this.matrix42.identity();
        this.matrix4.copy(light.matrixWorld);
        this.matrix4.premultiply(viewMatrix);
        this.matrix42.extractRotation(this.matrix4);

        uniforms.halfWidth.set(light.width * 0.5, 0.0, 0.0);
        uniforms.halfHeight.set(0.0, light.height * 0.5, 0.0);

        uniforms.halfWidth.applyMatrix4(this.matrix42);
        uniforms.halfHeight.applyMatrix4(this.matrix42);

        rectAreaLength++;

      } else if ('isPointLight' in light) {

        const uniforms = this.state.point[pointLength];

        uniforms.position.setFromMatrixPosition(light.matrixWorld);
        uniforms.position.applyMatrix4(viewMatrix);

        pointLength++;

      } else if ('isHemisphereLight' in light) {

        const uniforms = this.state.hemi[hemiLength];

        uniforms.direction.setFromMatrixPosition(light.matrixWorld);
        uniforms.direction.transformDirection(viewMatrix);

        hemiLength++;

      }

    }

  }

}
