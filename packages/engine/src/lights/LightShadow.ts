import { Matrix4 } from '../math/Matrix4';
import { Vector2 } from '../math/Vector2';
import { Vector3 } from '../math/Vector3';
import { Vector4 } from '../math/Vector4';
import { Frustum } from '../math/Frustum';
import { UnsignedByteType } from '../constants';
import { Camera } from '../cameras/Camera.js';
import { Light } from './Light';
import { RenderTarget } from '../core/RenderTarget';

interface LightShadowJSON {
  intensity?: number;
  bias?: number;
  normalBias?: number;
  radius?: number;
  mapSize?: number[];
  camera: Camera;
}

const _projScreenMatrix = /*@__PURE__*/ new Matrix4();
const _lightPositionWorld = /*@__PURE__*/ new Vector3();
const _lookTarget = /*@__PURE__*/ new Vector3();

/**
 * Abstract base class for light shadow classes. These classes
 * represent the shadow configuration for different light types.
 *
 * @abstract
 */
export class LightShadow {
  /**
   * The light's view of the world.
   *
   * @type {Camera}
   */
  public camera: Camera;

  /**
   * The intensity of the shadow. The default is `1`.
   * Valid values are in the range `[0, 1]`.
   *
   * @type {number}
   * @default 1
   */
  public intensity: number = 1;

  /**
   * Shadow map bias, how much to add or subtract from the normalized depth
   * when deciding whether a surface is in shadow.
   *
   * The default is `0`. Very tiny adjustments here (in the order of `0.0001`)
   * may help reduce artifacts in shadows.
   *
   * @type {number}
   * @default 0
   */
  public bias: number = 0;

  /**
   * Defines how much the position used to query the shadow map is offset along
   * the object normal. The default is `0`. Increasing this value can be used to
   * reduce shadow acne especially in large scenes where light shines onto
   * geometry at a shallow angle. The cost is that shadows may appear distorted.
   *
   * @type {number}
   * @default 0
   */
  public normalBias: number = 0;

  /**
   * Setting this to values greater than 1 will blur the edges of the shadow.
   * High values will cause unwanted banding effects in the shadows - a greater
   * map size will allow for a higher value to be used here before these effects
   * become visible.
   *
   * The property has no effect when the shadow map type is `PCFSoftShadowMap` and
   * and it is recommended to increase softness by decreasing the shadow map size instead.
   *
   * The property has no effect when the shadow map type is `BasicShadowMap`.
   *
   * @type {number}
   * @default 1
   */
  public radius: number = 1;

  /**
   * The amount of samples to use when blurring a VSM shadow map.
   *
   * @type {number}
   * @default 8
   */
  public blurSamples: number = 8;

  /**
   * Defines the width and height of the shadow map. Higher values give better quality
   * shadows at the cost of computation time. Values must be powers of two.
   *
   * @type {Vector2}
   * @default (512,512)
   */
  public mapSize: Vector2 = new Vector2(512, 512);

  /**
   * The type of shadow texture. The default is `UnsignedByteType`.
   *
   * @type {number}
   * @default UnsignedByteType
   */
  public mapType: typeof UnsignedByteType = UnsignedByteType;

  /**
   * The depth map generated using the internal camera; a location beyond a
   * pixel's depth is in shadow. Computed internally during rendering.
   *
   * @type {?RenderTarget}
   * @default null
   */
  public map: RenderTarget | null = null;

  /**
   * The distribution map generated using the internal camera; an occlusion is
   * calculated based on the distribution of depths. Computed internally during
   * rendering.
   *
   * @type {?RenderTarget}
   * @default null
   */
  public mapPass: RenderTarget | null = null;

  /**
   * Model to shadow camera space, to compute location and depth in shadow map.
   * This is computed internally during rendering.
   *
   * @type {Matrix4}
   */
  public matrix: Matrix4 = new Matrix4();

  /**
   * Enables automatic updates of the light's shadow. If you do not require dynamic
   * lighting / shadows, you may set this to `false`.
   *
   * @type {boolean}
   * @default true
   */
  public autoUpdate: boolean = true;

  /**
   * When set to `true`, shadow maps will be updated in the next `render` call.
   * If you have set {@link LightShadow#autoUpdate} to `false`, you will need to
   * set this property to `true` and then make a render call to update the light's shadow.
   *
   * @type {boolean}
   * @default false
   */
  public needsUpdate: boolean = false;

  public _frustum: Frustum = new Frustum();
  public _frameExtents: Vector2 = new Vector2(1, 1);

  public _viewportCount: number = 1;

  public _viewports: Vector4[] = [

    new Vector4(0, 0, 1, 1)

  ];

  /**
   * Constructs a new light shadow.
   *
   * @param {Camera} camera - The light's view of the world.
   */
  constructor(camera: Camera) {

    this.camera = camera;
  }

  /**
   * Used internally by the renderer to get the number of viewports that need
   * to be rendered for this shadow.
   *
   * @return {number} The viewport count.
   */
  public getViewportCount(): number {

    return this._viewportCount;

  }

  /**
   * Gets the shadow cameras frustum. Used internally by the renderer to cull objects.
   *
   * @return {Frustum} The shadow camera frustum.
   */
  public getFrustum(): Frustum {

    return this._frustum;

  }

  /**
   * Update the matrices for the camera and shadow, used internally by the renderer.
   *
   * @param {Light} light - The light for which the shadow is being rendered.
   */
  public updateMatrices(light: Light): void {

    const shadowCamera = this.camera;
    const shadowMatrix = this.matrix;

    _lightPositionWorld.setFromMatrixPosition(light.matrixWorld);
    shadowCamera.position.copy(_lightPositionWorld);

    if (light.target) {
      _lookTarget.setFromMatrixPosition(light.target.matrixWorld);
      shadowCamera.lookAt(_lookTarget);
    }
    shadowCamera.updateMatrixWorld();

    _projScreenMatrix.multiplyMatrices(shadowCamera.projectionMatrix, shadowCamera.matrixWorldInverse);
    this._frustum.setFromProjectionMatrix(_projScreenMatrix, shadowCamera.coordinateSystem, shadowCamera.reversedDepth);

    if (shadowCamera.reversedDepth) {

      shadowMatrix.set(
        0.5, 0.0, 0.0, 0.5,
        0.0, 0.5, 0.0, 0.5,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
      );

    } else {

      shadowMatrix.set(
        0.5, 0.0, 0.0, 0.5,
        0.0, 0.5, 0.0, 0.5,
        0.0, 0.0, 0.5, 0.5,
        0.0, 0.0, 0.0, 1.0
      );

    }

    shadowMatrix.multiply(_projScreenMatrix);

  }

  /**
   * Returns a viewport definition for the given viewport index.
   *
   * @param {number} viewportIndex - The viewport index.
   * @return {Vector4} The viewport.
   */
  public getViewport(viewportIndex: number): Vector4 {

    return this._viewports[viewportIndex];

  }

  /**
   * Returns the frame extends.
   *
   * @return {Vector2} The frame extends.
   */
  public getFrameExtents(): Vector2 {

    return this._frameExtents;

  }

  /**
   * Frees the GPU-related resources allocated by this instance. Call this
   * method whenever this instance is no longer used in your app.
   */
  public dispose(): void {

    if (this.map) {

      this.map.dispose();

    }

    if (this.mapPass) {

      this.mapPass.dispose();

    }

  }

  /**
   * Copies the values of the given light shadow instance to this instance.
   *
   * @param {LightShadow} source - The light shadow to copy.
   * @return {LightShadow} A reference to this light shadow instance.
   */
  public copy(source: LightShadow): LightShadow {

    this.camera = source.camera.clone();

    this.intensity = source.intensity;

    this.bias = source.bias;
    this.radius = source.radius;

    this.autoUpdate = source.autoUpdate;
    this.needsUpdate = source.needsUpdate;
    this.normalBias = source.normalBias;
    this.blurSamples = source.blurSamples;

    this.mapSize.copy(source.mapSize);

    return this;

  }

  /**
   * Returns a new light shadow instance with copied values from this instance.
   *
   * @return {LightShadow} A clone of this instance.
   */
  public clone(): LightShadow {

    return new LightShadow(this.camera).copy(this);

  }

  /**
   * Serializes the light shadow into JSON.
   *
   * @return {Object} A JSON object representing the serialized light shadow.
   * @see {@link ObjectLoader#parse}
   */
  public toJSON(): any {

    const object: LightShadowJSON = {
      camera: this.camera.toJSON().object
    };

    if (this.intensity !== 1) object.intensity = this.intensity;
    if (this.bias !== 0) object.bias = this.bias;
    if (this.normalBias !== 0) object.normalBias = this.normalBias;
    if (this.radius !== 1) object.radius = this.radius;
    if (this.mapSize.x !== 512 || this.mapSize.y !== 512) object.mapSize = this.mapSize.toArray([]);

    // object.camera = this.camera.toJSON().object;
    delete (object.camera as any).matrix;

    return object;

  }

}
