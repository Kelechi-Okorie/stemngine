import { LightShadow } from './LightShadow.js';
import { RAD2DEG } from '../math/MathUtils.js';
import { PerspectiveCamera, isPerspectiveCamera } from '../cameras/PerspectiveCamera.js';
import { Light } from './Light.js';
import { SpotLight } from './SpotLight.js';

/**
 * Represents the shadow configuration of directional lights.
 *
 * @augments LightShadow
 */
export class SpotLightShadow extends LightShadow {
  /**
   * This flag can be used for type testing.
   *
   * @readonly
   * @default true
   */
  public isSpotLightShadow = true;

  /**
   * Used to focus the shadow camera. The camera's field of view is set as a
   * percentage of the spotlight's field-of-view. Range is `[0, 1]`.
   *
   * @default 1
   */
  public focus = 1;

  /**
   * Texture aspect ratio.
   *
   * @default 1
   */
  public aspect = 1;


  /**
   * Constructs a new spot light shadow.
   */
  constructor() {

    super(new PerspectiveCamera(50, 1, 0.5, 500));

  }

  public updateMatrices(light: SpotLight) {

    const camera = this.camera as PerspectiveCamera;

    const fov = RAD2DEG * 2 * light.angle! * this.focus;
    const aspect = (this.mapSize.width / this.mapSize.height) * this.aspect;
    const far = light.distance || camera.far;

    if (fov !== camera.fov || aspect !== camera.aspect || far !== camera.far) {

      camera.fov = fov;
      camera.aspect = aspect;
      camera.far = far;
      camera.updateProjectionMatrix();

    }

    super.updateMatrices(light);

  }

  public copy(source: SpotLightShadow) {

    super.copy(source);

    this.focus = source.focus;

    return this;

  }

}
