import { Camera } from '../../cameras/Camera.js';
import { Material } from '../../materials/Material.js';
import { Matrix3 } from '../../math/Matrix3.js';
import { Plane } from '../../math/Plane.js';

export class WebGLClipping {

  public globalState: Float32Array | null = null;
  public numGlobalPlanes = 0;
  public localClippingEnabled = false;
  public renderingShadows = false;

  public plane = new Plane();
  public viewNormalMatrix = new Matrix3();

  public uniform: { value: Float32Array | null, needsUpdate: boolean } = { value: null, needsUpdate: false };

  public numPlanes = 0;
  public numIntersection = 0;

  private properties: any;

  constructor(properties: any) {
    this.properties = properties;
  }

  public init(
    planes: Plane[],
    enableLocalClipping: boolean
  ) {

    const enabled =
      planes.length !== 0 ||
      enableLocalClipping ||
      // enable state of previous frame - the clipping code has to
      // run another frame in order to reset the state:
      this.numGlobalPlanes !== 0 ||
      this.localClippingEnabled;

    this.localClippingEnabled = enableLocalClipping;

    this.numGlobalPlanes = planes.length;

    return enabled;

  };

  public beginShadows() {

    this.renderingShadows = true;
    this.projectPlanes(null);

  };

  public endShadows() {

    this.renderingShadows = false;

  };

  public setGlobalState(planes: Plane[], camera: Camera) {

    this.globalState = this.projectPlanes(planes, camera, 0);

  };

  public setState(material: Material, camera: Camera, useCache: boolean) {

    const planes = material.clippingPlanes,
      clipIntersection = material.clipIntersection,
      clipShadows = material.clipShadows;

    const materialProperties = this.properties.get(material);

    if (!this.localClippingEnabled || planes === null || planes.length === 0 || this.renderingShadows && !clipShadows) {

      // there's no local clipping

      if (this.renderingShadows) {

        // there's no global clipping

        this.projectPlanes(null);

      } else {

        this.resetGlobalState();

      }

    } else {

      const nGlobal = this.renderingShadows ? 0 : this.numGlobalPlanes,
        lGlobal = nGlobal * 4;

      let dstArray = materialProperties.clippingState || null;

      this.uniform.value = dstArray; // ensure unique state

      dstArray = this.projectPlanes(planes, camera, lGlobal, useCache);

      for (let i = 0; i !== lGlobal; ++i) {

        dstArray[i] = this.globalState![i];

      }

      materialProperties.clippingState = dstArray;
      this.numIntersection = clipIntersection ? this.numPlanes : 0;
      this.numPlanes += nGlobal;

    }


  };

  private resetGlobalState() {

    if (this.uniform.value !== this.globalState) {

      this.uniform.value = this.globalState;
      this.uniform.needsUpdate = this.numGlobalPlanes > 0;

    }

    this.numPlanes = this.numGlobalPlanes;
    this.numIntersection = 0;

  }

  private projectPlanes(
    planes: Plane[] | null,
    camera?: Camera,
    dstOffset: number = 0,
    skipTransform?: boolean
  ): Float32Array | null {

    const nPlanes = planes !== null ? planes.length : 0;
    let dstArray: Float32Array | null = null;

    if (nPlanes !== 0) {
      if (!camera) {
        console.warn('WebGLClipping: camera is required when planes are provided.');
        return null; // early return if camera is not provided
      }


      dstArray = this.uniform.value;

      if (skipTransform !== true || dstArray === null) {

        const flatSize = dstOffset + nPlanes * 4;
        const viewMatrix = camera.matrixWorldInverse;


        this.viewNormalMatrix.getNormalMatrix(viewMatrix);

        if (dstArray === null || dstArray.length < flatSize) {

          dstArray = new Float32Array(flatSize);

        }

        for (let i = 0, i4 = dstOffset; i !== nPlanes; ++i, i4 += 4) {

          this.plane.copy(planes![i]).applyMatrix4(viewMatrix, this.viewNormalMatrix);

          this.plane.normal.toArray(dstArray as any, i4);
          dstArray[i4 + 3] = this.plane.constant;

        }

      }

      this.uniform.value = dstArray;
      this.uniform.needsUpdate = true;

    }

    this.numPlanes = nPlanes;
    this.numIntersection = 0;

    return dstArray;

  }

}
