import { BufferGeometry } from "../../core/BufferGeometry";
import { WebGLAttributes } from "./WebGLAttributes";
import { WebGLGeometries } from "./WebGLGeometries";
import { WebGLInfo } from "./WebGLInfo";
import { Node3D } from "../../core/Node3D";
import { EventDispatcher } from "../../core/EventDispatcher";

export function WebGLObjects(
  gl: WebGL2RenderingContext,
  geometries: ReturnType<typeof WebGLGeometries>,
  attributes: ReturnType<typeof WebGLAttributes>,
  info: ReturnType<typeof WebGLInfo>
) {

  let updateMap = new WeakMap();

  function update(object: Node3D & {geometry:  BufferGeometry}) {

    const frame = info.render.frame;

    const geometry = object.geometry;
    const buffergeometry = geometries.get(object, geometry);

    // Update once per frame

    if (updateMap.get(buffergeometry) !== frame) {

      geometries.update(buffergeometry);

      updateMap.set(buffergeometry, frame);

    }

    if ('isInstancedMesh' in object /* object.isInstancedMesh */) {

      if (object.hasEventListener('dispose', onInstancedMeshDispose) === false) {

        object.addEventListener('dispose', onInstancedMeshDispose);

      }

      if (updateMap.get(object) !== frame) {

        attributes.update(object.instanceMatrix, gl.ARRAY_BUFFER);

        if (object.instanceColor !== null) {

          attributes.update(object.instanceColor, gl.ARRAY_BUFFER);

        }

        updateMap.set(object, frame);

      }

    }

    if ('isSkinnedMesh' in object/* object.isSkinnedMesh */) {

      const skeleton = object.skeleton;

      if (updateMap.get(skeleton) !== frame) {

        skeleton.update();

        updateMap.set(skeleton, frame);

      }

    }

    return buffergeometry;

  }

  function dispose() {

    updateMap = new WeakMap();

  }

  function onInstancedMeshDispose(event: EventDispatcher & { target: any}) {

    const instancedMesh = event.target;

    instancedMesh.removeEventListener('dispose', onInstancedMeshDispose);

    attributes.remove(instancedMesh.instanceMatrix);

    if (instancedMesh.instanceColor !== null) attributes.remove(instancedMesh.instanceColor);

  }

  return { update, dispose };

}
