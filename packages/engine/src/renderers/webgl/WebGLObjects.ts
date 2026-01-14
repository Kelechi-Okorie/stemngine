import { BaseEvent } from "../../core/EventDispatcher";
import { WebGLAttributes } from "./WebGLAttributes";
import { WebGLGeometries } from "./WebGLGeometries";
import { WebGLInfo } from "./WebGLInfo";

export class WebGLObjects {
  private readonly gl: WebGL2RenderingContext;
  private readonly geometries: WebGLGeometries;
  private readonly attributes: WebGLAttributes;
  private readonly info: WebGLInfo

  protected updateMap = new WeakMap();

  constructor(
  gl: WebGL2RenderingContext,
  geometries: WebGLGeometries,
  attributes: WebGLAttributes,
  info: WebGLInfo
) {
  this.gl = gl;
  this.geometries = geometries;
  this.attributes = attributes;
  this.info = info;
}

  public update(object: any) {  // TODO: type better

    const frame = this.info.render.frame;

    const geometry = object.geometry;
    const buffergeometry = this.geometries.get(object, geometry);

    // Update once per frame

    if (this.updateMap.get(buffergeometry) !== frame) {

      this.geometries.update(buffergeometry);

      this.updateMap.set(buffergeometry, frame);

    }

    if (object.isInstancedMesh) {

      if (object.hasEventListener('dispose', this.onInstancedMeshDispose) === false) {

        object.addEventListener('dispose', this.onInstancedMeshDispose);

      }

      if (this.updateMap.get(object) !== frame) {

        this.attributes.update(object.instanceMatrix, this.gl.ARRAY_BUFFER);

        if (object.instanceColor !== null) {

          this.attributes.update(object.instanceColor, this.gl.ARRAY_BUFFER);

        }

        this.updateMap.set(object, frame);

      }

    }

    if (object.isSkinnedMesh) {

      const skeleton = object.skeleton;

      if (this.updateMap.get(skeleton) !== frame) {

        skeleton.update();

        this.updateMap.set(skeleton, frame);

      }

    }

    return buffergeometry;

  }

  public dispose() {

    this.updateMap = new WeakMap();

  }

  private onInstancedMeshDispose = (event: BaseEvent) => {

    const instancedMesh = event.target;

    instancedMesh.removeEventListener('dispose', this.onInstancedMeshDispose);

    this.attributes.remove(instancedMesh.instanceMatrix);

    if (instancedMesh.instanceColor !== null) this.attributes.remove(instancedMesh.instanceColor);

  }

  // return {

  //   update,
  //   dispose

  // };

}
