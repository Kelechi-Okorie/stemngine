import { Uint16BufferAttribute, Uint32BufferAttribute } from '../../core/BufferAttribute.js';
import { arrayNeedsUint32 } from '../../utils.js';
import { GLAttribute, WebGLAttributes } from './WebGLAttributes.js';
import { WebGLInfo } from './WebGLInfo.js';
import { WebGLBindingStates } from './WebGLBindingStates.js';
import { BufferGeometry } from '../../core/BufferGeometry.js';
import { Node3D } from '../../core/Node3D.js';

export function WebGLGeometries(
  gl: WebGL2RenderingContext,
  attributes: ReturnType<typeof WebGLAttributes>,
  info: ReturnType<typeof WebGLInfo>,
  bindingStates:ReturnType<typeof WebGLBindingStates>
) {

  const geometries: Record<number, true> = {};
  const wireframeAttributes = new WeakMap();

  function onGeometryDispose(event: { target: BufferGeometry}) {

    const geometry = event.target;

    if (geometry.index !== null) {

      attributes.remove(geometry.index);

    }

    for (const name in geometry.attributes) {

      attributes.remove(geometry.attributes[name]);

    }

    geometry.removeEventListener('dispose', onGeometryDispose);

    delete geometries[geometry.id];

    const attribute = wireframeAttributes.get(geometry);

    if (attribute) {

      attributes.remove(attribute);
      wireframeAttributes.delete(geometry);

    }

    bindingStates.releaseStatesOfGeometry(geometry);

    if (geometry.isInstancedBufferGeometry === true) {

      delete geometry._maxInstanceCount;

    }

    //

    info.memory.geometries--;

  }

  function get(
    object: Node3D,
    geometry: BufferGeometry
  ) {

    if (geometries[geometry.id] === true) return geometry;

    geometry.addEventListener('dispose', onGeometryDispose);

    geometries[geometry.id] = true;

    info.memory.geometries++;

    return geometry;

  }

  function update(geometry: BufferGeometry) {

    const geometryAttributes = geometry.attributes;

    // Updating index buffer in VAO now. See WebGLBindingStates.

    for (const name in geometryAttributes) {

      attributes.update(geometryAttributes[name], gl.ARRAY_BUFFER);

    }

  }

  function updateWireframeAttribute(geometry: BufferGeometry) {

    const indices = [];

    const geometryIndex = geometry.index;
    const geometryPosition = geometry.attributes.position;
    let version = 0;

    if (geometryIndex !== null) {

      const array = geometryIndex.array;
      version = geometryIndex.version;

      for (let i = 0, l = array.length; i < l; i += 3) {

        const a = array[i + 0];
        const b = array[i + 1];
        const c = array[i + 2];

        indices.push(a, b, b, c, c, a);

      }

    } else if (geometryPosition !== undefined) {

      const array = geometryPosition.array;
      version = geometryPosition.version;

      for (let i = 0, l = (array.length / 3) - 1; i < l; i += 3) {

        const a = i + 0;
        const b = i + 1;
        const c = i + 2;

        indices.push(a, b, b, c, c, a);

      }

    } else {

      return;

    }

    const attribute = new (arrayNeedsUint32(indices) ? Uint32BufferAttribute : Uint16BufferAttribute)(indices, 1);
    attribute.version = version;

    // Updating index buffer in VAO now. See WebGLBindingStates

    //

    const previousAttribute = wireframeAttributes.get(geometry);

    if (previousAttribute) attributes.remove(previousAttribute);

    //

    wireframeAttributes.set(geometry, attribute);

  }

  function getWireframeAttribute(geometry: BufferGeometry) {

    const currentAttribute = wireframeAttributes.get(geometry);

    if (currentAttribute) {

      const geometryIndex = geometry.index;

      if (geometryIndex !== null) {

        // if the attribute is obsolete, create a new one

        if (currentAttribute.version < geometryIndex.version) {

          updateWireframeAttribute(geometry);

        }

      }

    } else {

      updateWireframeAttribute(geometry);

    }

    return wireframeAttributes.get(geometry);

  }

  return {

    get: get,
    update: update,

    getWireframeAttribute: getWireframeAttribute

  };

}
