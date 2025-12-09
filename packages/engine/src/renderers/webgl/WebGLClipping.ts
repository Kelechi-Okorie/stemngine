import { Matrix3 } from '../../math/Matrix3.js';
import { Plane } from '../../math/Plane.js';
import { Camera } from '../../cameras/Camera.js';
import { Material } from '../../materials/Material.js';

// What the renderer stores in properties.get(material)
export interface MaterialProperties {
  clippingState?: Float32Array | null;
}

// Three.js property store pattern: WeakMap<any, any>
export interface Properties {
  get(obj: any): MaterialProperties;
}

export interface ClippingUniform {
  value: Float32Array | null;
  needsUpdate: boolean;
}

export interface WebGLClippingInstance {
  uniform: ClippingUniform;
  numPlanes: number;
  numIntersection: number;

  init(planes: Plane[], enableLocalClipping: boolean): boolean;
  beginShadows(): void;
  endShadows(): void;
  setGlobalState(planes: Plane[] | null, camera: Camera): void;
  setState(material: Material & ClippingMaterial, camera: Camera, useCache: boolean): void;
}

export interface ClippingMaterial {
  clippingPlanes: Plane[] | null;
  clipIntersection: boolean;
  clipShadows: boolean;
}

export function WebGLClipping(properties: Properties): void {

  const scope = {} as WebGLClippingInstance;

  let globalState: Float32Array | null = null;
  let numGlobalPlanes = 0;
  let localClippingEnabled = false;
  let renderingShadows = false;

  const tempPlane = new Plane();
  const viewNormalMatrix = new Matrix3();

  const uniform: ClippingUniform = { value: null, needsUpdate: false };

  scope.uniform = uniform;
  scope.numPlanes = 0;
  scope.numIntersection = 0;

  // ------------------------------------------------------
  // init()
  // ------------------------------------------------------

  scope.init = function (planes, enableLocalClipping) {

    const enabled =
      planes.length !== 0 ||
      enableLocalClipping ||
      // enable state of previous frame - the clipping code has to
      // run another frame in order to reset the state:
      numGlobalPlanes !== 0 ||
      localClippingEnabled;

    localClippingEnabled = enableLocalClipping;

    numGlobalPlanes = planes.length;

    return enabled;

  };

  // ------------------------------------------------------
  // Shadows
  // ------------------------------------------------------

  scope.beginShadows = function () {

    renderingShadows = true;
    projectPlanes(null);

  };

  scope.endShadows = function () {

    renderingShadows = false;

  };

  // ------------------------------------------------------
  // Global state
  // ------------------------------------------------------

  scope.setGlobalState = function (planes: Plane[] | null, camera: Camera) {

    globalState = projectPlanes(planes, camera, 0);

  };

  // ------------------------------------------------------
  // Per-material state
  // ------------------------------------------------------

  scope.setState = function (
    material: Material & ClippingMaterial,
    camera: Camera,
    useCache: boolean
  ): void {

    // const planes = material.clippingPlanes,
    //   clipIntersection = material.clipIntersection,
    //   clipShadows = material.clipShadows;

    const { clippingPlanes: planes, clipIntersection, clipShadows } = material;

    const materialProperties = properties.get(material);

    if (!localClippingEnabled || planes === null || planes.length === 0 || renderingShadows && !clipShadows) {

      // there's no local clipping

      if (renderingShadows) {

        // there's no global clipping

        projectPlanes(null);

      } else {

        resetGlobalState();

      }

    } else {

      const nGlobal = renderingShadows ? 0 : numGlobalPlanes,
        lGlobal = nGlobal * 4;

      let dstArray = materialProperties.clippingState || null;

      uniform.value = dstArray; // ensure unique state

      dstArray = projectPlanes(planes, camera, lGlobal, useCache);

      for (let i = 0; i !== lGlobal; ++i) {

        dstArray![i] = globalState![i];

      }

      materialProperties.clippingState = dstArray;
      this.numIntersection = clipIntersection ? this.numPlanes : 0;
      this.numPlanes += nGlobal;

    }


  };

  function resetGlobalState(): void {

    if (uniform.value !== globalState) {

      uniform.value = globalState;
      uniform.needsUpdate = numGlobalPlanes > 0;

    }

    scope.numPlanes = numGlobalPlanes;
    scope.numIntersection = 0;

  }

  function projectPlanes(
    planes: Plane[] | null,
    camera?: Camera,
    dstOffset: number = 0,
    skipTransform: boolean = false
  ): Float32Array | null {

    const nPlanes = planes !== null ? planes.length : 0;
    let dstArray = null;

    if (nPlanes !== 0) {

      dstArray = uniform.value;

      if (skipTransform !== true || dstArray === null) {

        const flatSize = dstOffset + nPlanes * 4,
          viewMatrix = camera!.matrixWorldInverse;

        viewNormalMatrix.getNormalMatrix(viewMatrix);

        if (dstArray === null || dstArray.length < flatSize) {

          dstArray = new Float32Array(flatSize);

        }

        for (let i = 0, i4 = dstOffset; i !== nPlanes; ++i, i4 += 4) {

          tempPlane.copy(planes![i]).applyMatrix4(viewMatrix, viewNormalMatrix);

          tempPlane.normal.toArray(dstArray as any, i4);
          dstArray[i4 + 3] = tempPlane.constant;

        }

      }

      uniform.value = dstArray;
      uniform.needsUpdate = true;

    }

    scope.numPlanes = nPlanes;
    scope.numIntersection = 0;

    return dstArray;

  }

}
