import { Uint16BufferAttribute, Uint32BufferAttribute } from '../../core/BufferAttribute';
import { arrayNeedsUint32 } from '../../utils';
import { BufferGeometry } from '../../core/BufferGeometry.js';
import { BufferAttribute } from '../../core/BufferAttribute';
import { WebGLAttributes } from './WebGLAttributes';
import { WebGLBindingStates } from './WebGLBindingStates';
import { BaseEvent } from '../../core/EventDispatcher';
import { WebGLInfo } from './WebGLInfo.js';

export class WebGLGeometries {
 private readonly gl: WebGL2RenderingContext;
  private readonly attributes: WebGLAttributes;
  private readonly info: WebGLInfo;
  private readonly bindingStates: WebGLBindingStates;

  // Map of geometries by id
  protected geometries: Record<number, boolean> = {};

  // Map to store wireframe attributes for each geometry
  protected wireframeAttributes: WeakMap<BufferGeometry, BufferAttribute> = new WeakMap();

  constructor(
  gl: WebGL2RenderingContext,
  attributes: WebGLAttributes,
  info: WebGLInfo,
  bindingStates: WebGLBindingStates
) {
  this.gl = gl;
  this.attributes = attributes;
  this.info = info;
  this.bindingStates = bindingStates;
}

  public onGeometryDispose(event: BaseEvent) {

    const geometry = event.target;

    if (geometry.index !== null) {

      this.attributes.remove(geometry.index);

    }

    for (const name in geometry.attributes) {

      this.attributes.remove(geometry.attributes[name]);

    }

    geometry.removeEventListener('dispose', this.onGeometryDispose);

    delete this.geometries[geometry.id];

    const attribute = this.wireframeAttributes.get(geometry);

    if (attribute) {

      this.attributes.remove(attribute);
      this.wireframeAttributes.delete(geometry);

    }

    this.bindingStates.releaseStatesOfGeometry(geometry);

    if (geometry.isInstancedBufferGeometry === true) {

      delete geometry._maxInstanceCount;

    }

    //

    this.info.memory.geometries--;

  }

  public get(object: any, geometry: BufferGeometry): BufferGeometry {

    if (this.geometries[geometry.id] === true) return geometry;

    geometry.addEventListener('dispose', this.onGeometryDispose);

    this.geometries[geometry.id] = true;

    this.info.memory.geometries++;

    return geometry;

  }

  public update(geometry: BufferGeometry) {

    const geometryAttributes = geometry.attributes;

    // Updating index buffer in VAO now. See WebGLBindingStates.

    for (const name in geometryAttributes) {

      this.attributes.update(geometryAttributes[name], this.gl.ARRAY_BUFFER);

    }

  }

  public updateWireframeAttribute(geometry: BufferGeometry) {

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

      // Narrow type to BufferAttribute
      if (geometryPosition instanceof BufferAttribute) {

        const array = geometryPosition.array;
        version = geometryPosition.version;

        for (let i = 0, l = (array.length / 3) - 1; i < l; i += 3) {

          const a = i + 0;
          const b = i + 1;
          const c = i + 2;

          indices.push(a, b, b, c, c, a);

        }
      }

    } else {

      return;

    }

    const attribute = new (arrayNeedsUint32(indices) ? Uint32BufferAttribute : Uint16BufferAttribute)(indices, 1);
    attribute.version = version;

    // Updating index buffer in VAO now. See WebGLBindingStates

    //

    const previousAttribute = this.wireframeAttributes.get(geometry);

    if (previousAttribute) this.attributes.remove(previousAttribute);

    //

    this.wireframeAttributes.set(geometry, attribute);

  }

  public getWireframeAttribute(geometry: BufferGeometry) {

    const currentAttribute = this.wireframeAttributes.get(geometry);

    if (currentAttribute) {

      const geometryIndex = geometry.index;

      if (geometryIndex !== null) {

        // if the attribute is obsolete, create a new one

        if (currentAttribute.version < geometryIndex.version) {

          this.updateWireframeAttribute(geometry);

        }

      }

    } else {

      this.updateWireframeAttribute(geometry);

    }

    return this.wireframeAttributes.get(geometry);

  }

}
