import { ArrayCamera } from '../cameras/ArrayCamera';
import { CoordinateSystem, WebGLCoordinateSystem } from '../constants';
import { Node3D } from '../core/Node3D';
import { Sprite } from '../objects/Sprite';
import { Box3 } from './Box3';
import { Frustum } from './Frustum';
import { Matrix4 } from './Matrix4';
import { Sphere } from './Sphere';
import { Vector3 } from './Vector3';

const _projScreenMatrix = /*@__PURE__*/ new Matrix4();
const _frustum = /*@__PURE__*/ new Frustum();

/**
 * FrustumArray is used to determine if an object is visible in at least one camera
 * from an array of cameras. This is particularly useful for multi-view renderers.
*/
export class FrustumArray {

  /**
   * The coordinate system to use.
   *
   * @default WebGLCoordinateSystem
   */
  public coordinateSystem: CoordinateSystem = WebGLCoordinateSystem;

  /**
   * Constructs a new frustum array.
   *
   */
  constructor() { }

  /**
   * Returns `true` if the 3D object's bounding sphere is intersecting any frustum
   * from the camera array.
   *
   * @param {Object3D} object - The 3D object to test.
   * @param {Object} cameraArray - An object with a cameras property containing an array of cameras.
   * @return {boolean} Whether the 3D object is visible in any camera.
   */
  public intersectsObject(object: Node3D, cameraArray: ArrayCamera) {

    if (!cameraArray.isArrayCamera || cameraArray.cameras.length === 0) {

      return false;

    }

    for (let i = 0; i < cameraArray.cameras.length; i++) {

      const camera = cameraArray.cameras[i];

      _projScreenMatrix.multiplyMatrices(
        camera.projectionMatrix,
        camera.matrixWorldInverse
      );

      _frustum.setFromProjectionMatrix(
        _projScreenMatrix,
        camera.coordinateSystem,
        camera.reversedDepth
      );

      if (_frustum.intersectsObject(object)) {

        return true; // Object is visible in at least one camera

      }

    }

    return false; // Not visible in any camera

  }

  /**
   * Returns `true` if the given sprite is intersecting any frustum
   * from the camera array.
   *
   * @param {Sprite} sprite - The sprite to test.
   * @param {Object} cameraArray - An object with a cameras property containing an array of cameras.
   * @return {boolean} Whether the sprite is visible in any camera.
   */
  intersectsSprite(sprite: Sprite, cameraArray: ArrayCamera) {

    if (!cameraArray || !cameraArray.cameras || cameraArray.cameras.length === 0) {

      return false;

    }

    for (let i = 0; i < cameraArray.cameras.length; i++) {

      const camera = cameraArray.cameras[i];

      _projScreenMatrix.multiplyMatrices(
        camera.projectionMatrix,
        camera.matrixWorldInverse
      );

      _frustum.setFromProjectionMatrix(
        _projScreenMatrix,
        camera.coordinateSystem,
        camera.reversedDepth
      );

      if (_frustum.intersectsSprite(sprite)) {

        return true; // Sprite is visible in at least one camera

      }

    }

    return false; // Not visible in any camera

  }

  /**
   * Returns `true` if the given bounding sphere is intersecting any frustum
   * from the camera array.
   *
   * @param {Sphere} sphere - The bounding sphere to test.
   * @param {Object} cameraArray - An object with a cameras property containing an array of cameras.
   * @return {boolean} Whether the sphere is visible in any camera.
   */
  intersectsSphere(sphere: Sphere, cameraArray: ArrayCamera) {

    if (!cameraArray || !cameraArray.cameras || cameraArray.cameras.length === 0) {

      return false;

    }

    for (let i = 0; i < cameraArray.cameras.length; i++) {

      const camera = cameraArray.cameras[i];

      _projScreenMatrix.multiplyMatrices(
        camera.projectionMatrix,
        camera.matrixWorldInverse
      );

      _frustum.setFromProjectionMatrix(
        _projScreenMatrix,
        camera.coordinateSystem,
        camera.reversedDepth
      );

      if (_frustum.intersectsSphere(sphere)) {

        return true; // Sphere is visible in at least one camera

      }

    }

    return false; // Not visible in any camera

  }

  /**
   * Returns `true` if the given bounding box is intersecting any frustum
   * from the camera array.
   *
   * @param {Box3} box - The bounding box to test.
   * @param {Object} cameraArray - An object with a cameras property containing an array of cameras.
   * @return {boolean} Whether the box is visible in any camera.
   */
  intersectsBox(box: Box3, cameraArray: ArrayCamera) {

    if (!cameraArray || !cameraArray.cameras || cameraArray.cameras.length === 0) {

      return false;

    }

    for (let i = 0; i < cameraArray.cameras.length; i++) {

      const camera = cameraArray.cameras[i];

      _projScreenMatrix.multiplyMatrices(
        camera.projectionMatrix,
        camera.matrixWorldInverse
      );

      _frustum.setFromProjectionMatrix(
        _projScreenMatrix,
        camera.coordinateSystem,
        camera.reversedDepth
      );

      if (_frustum.intersectsBox(box)) {

        return true; // Box is visible in at least one camera

      }

    }

    return false; // Not visible in any camera

  }

  /**
   * Returns `true` if the given point lies within any frustum
   * from the camera array.
   *
   * @param {Vector3} point - The point to test.
   * @param {Object} cameraArray - An object with a cameras property containing an array of cameras.
   * @return {boolean} Whether the point is visible in any camera.
   */
  containsPoint(point: Vector3, cameraArray: ArrayCamera) {

    if (!cameraArray || !cameraArray.cameras || cameraArray.cameras.length === 0) {

      return false;

    }

    for (let i = 0; i < cameraArray.cameras.length; i++) {

      const camera = cameraArray.cameras[i];

      _projScreenMatrix.multiplyMatrices(
        camera.projectionMatrix,
        camera.matrixWorldInverse
      );

      _frustum.setFromProjectionMatrix(
        _projScreenMatrix,
        camera.coordinateSystem,
        camera.reversedDepth
      );

      if (_frustum.containsPoint(point)) {

        return true; // Point is visible in at least one camera

      }

    }

    return false; // Not visible in any camera

  }

  /**
   * Returns a new frustum array with copied values from this instance.
   *
   * @return {FrustumArray} A clone of this instance.
   */
  clone() {

    return new FrustumArray();

  }

}
