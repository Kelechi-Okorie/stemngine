import { LightShadow } from './LightShadow.js';
import { OrthographicCamera } from '../cameras/OrthographicCamera.js';

/**
 * Represents the shadow configuration of directional lights.
 *
 * @augments LightShadow
 */
export class DirectionalLightShadow extends LightShadow {
  /**
   * This flag can be used for type testing.
   *
   * @readonly
   * @default true
   */
  public isDirectionalLightShadow = true;

  /**
   * Constructs a new directional light shadow.
   */
  constructor() {

    super(new OrthographicCamera(- 5, 5, 5, - 5, 0.5, 500));
  }

}
