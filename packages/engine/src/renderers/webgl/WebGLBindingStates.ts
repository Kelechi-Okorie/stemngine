import { IntType } from '../../constants.js';
import { WebGLAttributes } from './WebGLAttributes.js';
import { BufferAttribute } from '../../core/BufferAttribute.js';
import { InterleavedBufferAttribute } from '../../core/InterleavedBufferAttribute.js';
import { InstancedBufferAttribute } from '../../core/InstancedBufferAttribute.js';
import { BufferGeometry } from '../../core/BufferGeometry.js';
import { Material } from '../../materials/Material.js';
import { WebGLProgram } from './WebGLProgram.js';
import { Node3D } from '../../core/Node3D.js';
// import { WebGLRenderingContext} from '../../renders/WebGLRenderer';

interface BindingState {
  geometry: BufferGeometry | null;
  program: WebGLProgram | null;
  wireframe: boolean;

  newAttributes: number[];
  enabledAttributes: number[];
  attributeDivisors: number[];

  object: WebGLVertexArrayObject | null;
  attributes: Record<string, any>;
  attributesNum?: number;
  index: any;
}

export interface WebGLBindingStatesInstance {
  setup(object: Node3D, material: Material, program: WebGLProgram, geometry: BufferGeometry, index: any): void;
  reset(): void;
  resetDefaultState(): void;
  dispose(): void;
  releaseStatesOfGeometry(geometry: BufferGeometry): void;
  releaseStatesOfProgram(program: WebGLProgram): void;

  initAttributes(): void;
  enableAttribute(attribute: number): void;
  disableUnusedAttributes(): void;
}

export function WebGLBindingStates(
  gl: WebGL2RenderingContext,
  attributes: ReturnType<typeof WebGLAttributes>
): WebGLBindingStatesInstance {

  const maxVertexAttributes = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);

  // const bindingStates = {};

  const bindingStates: {
    [geometryId: number]: {
      [programId: number]: {
        [wireframe: string]: BindingState
      }
    }
  } = {};


  const defaultState = createBindingState(null);
  let currentState = defaultState;
  let forceUpdate = false;

  function setup(
    object: Node3D,
    material: Material,
    program: WebGLProgram,
    geometry: BufferGeometry,
    index: number
  ) {

    let updateBuffers = false;

    const state = getBindingState(geometry, program, material);

    if (currentState !== state) {

      currentState = state;
      bindVertexArrayObject(currentState.object);

    }

    updateBuffers = needsUpdate(object, geometry, program, index);

    if (updateBuffers) saveCache(object, geometry, program, index);

    if (index !== null) {

      attributes.update(index, gl.ELEMENT_ARRAY_BUFFER);

    }

    if (updateBuffers || forceUpdate) {

      forceUpdate = false;

      setupVertexAttributes(object, material, program, geometry);

      if (index !== null) {

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, attributes.get(index).buffer);

      }

    }

  }

  function createVertexArrayObject(): WebGLVertexArrayObject | null {

    return gl.createVertexArray();

  }

  function bindVertexArrayObject(vao: WebGLVertexArrayObject | null): void {

    return gl.bindVertexArray(vao);

  }

  function deleteVertexArrayObject(vao: WebGLVertexArrayObject | null): void {

    return gl.deleteVertexArray(vao);

  }

  function getBindingState(
    geometry: BufferGeometry,
    program: WebGLProgram,
    material: Material
  ): BindingState {

    const wireframe = ((material as any).wireframe === true);

    let programMap = bindingStates[geometry.id];

    if (programMap === undefined) {

      programMap = {};
      bindingStates[geometry.id] = programMap;

    }

    let stateMap = programMap[program.id];

    if (stateMap === undefined) {

      stateMap = {};
      programMap[program.id] = stateMap;

    }

    let state = stateMap[wireframe];

    if (state === undefined) {

      state = createBindingState(createVertexArrayObject());
      stateMap[wireframe] = state;

    }

    return state;

  }

  function createBindingState(vao: WebGLVertexArrayObject | null): BindingState {

    const newAttributes = [];
    const enabledAttributes = [];
    const attributeDivisors = [];

    for (let i = 0; i < maxVertexAttributes; i++) {

      newAttributes[i] = 0;
      enabledAttributes[i] = 0;
      attributeDivisors[i] = 0;

    }

    return {

      // for backward compatibility on non-VAO support browser
      geometry: null,
      program: null,
      wireframe: false,

      newAttributes: newAttributes,
      enabledAttributes: enabledAttributes,
      attributeDivisors: attributeDivisors,
      object: vao,
      attributes: {},
      index: null

    };

  }

  function needsUpdate(
    object: Node3D,
    geometry: BufferGeometry,
    program: ReturnType<typeof WebGLProgram>,
    index: any
  ): boolean {

    const cachedAttributes = currentState.attributes;
    const geometryAttributes = geometry.attributes;

    let attributesNum = 0;

    const programAttributes = program.getAttributes();

    for (const name in programAttributes) {

      const programAttribute = programAttributes[name];

      if (programAttribute.location >= 0) {

        const cachedAttribute = cachedAttributes[name];
        let geometryAttribute = geometryAttributes[name];

        if (geometryAttribute === undefined) {

          if (name === 'instanceMatrix' && object.instanceMatrix) geometryAttribute = object.instanceMatrix;
          if (name === 'instanceColor' && object.instanceColor) geometryAttribute = object.instanceColor;

        }

        if (cachedAttribute === undefined) return true;

        if (cachedAttribute.attribute !== geometryAttribute) return true;

        if (geometryAttribute && cachedAttribute.data !== geometryAttribute.data) return true;

        attributesNum++;

      }

    }

    if (currentState.attributesNum !== attributesNum) return true;

    if (currentState.index !== index) return true;

    return false;

  }

  function saveCache(
    object: Node3D,
    geometry: BufferGeometry,
    program: ReturnType<typeof WebGLProgram>,
    index: any
  ): void {

    const cache: Record<string, any> = {};
    const attributes = geometry.attributes;
    let attributesNum = 0;

    const programAttributes = program.getAttributes();

    for (const name in programAttributes) {

      const programAttribute = programAttributes[name];

      if (programAttribute.location >= 0) {

        let attribute = attributes[name];

        if (attribute === undefined) {

          if (name === 'instanceMatrix' && object.instanceMatrix) attribute = object.instanceMatrix;
          if (name === 'instanceColor' && object.instanceColor) attribute = object.instanceColor;

        }

        const data: any = {};
        data.attribute = attribute;

        if (attribute && attribute.data) {

          data.data = attribute.data;

        }

        cache[name] = data;

        attributesNum++;

      }

    }

    currentState.attributes = cache;
    currentState.attributesNum = attributesNum;

    currentState.index = index;

  }

  function initAttributes(): void {

    const newAttributes = currentState.newAttributes;

    for (let i = 0, il = newAttributes.length; i < il; i++) {

      newAttributes[i] = 0;

    }

  }

  function enableAttribute(attribute: number): void {

    enableAttributeAndDivisor(attribute, 0);

  }

  function enableAttributeAndDivisor(attribute: number, meshPerAttribute: number): void {

    const newAttributes = currentState.newAttributes;
    const enabledAttributes = currentState.enabledAttributes;
    const attributeDivisors = currentState.attributeDivisors;

    newAttributes[attribute] = 1;

    if (enabledAttributes[attribute] === 0) {

      gl.enableVertexAttribArray(attribute);
      enabledAttributes[attribute] = 1;

    }

    if (attributeDivisors[attribute] !== meshPerAttribute) {

      gl.vertexAttribDivisor(attribute, meshPerAttribute);
      attributeDivisors[attribute] = meshPerAttribute;

    }

  }

  function disableUnusedAttributes(): void {

    const newAttributes = currentState.newAttributes;
    const enabledAttributes = currentState.enabledAttributes;

    for (let i = 0, il = enabledAttributes.length; i < il; i++) {

      if (enabledAttributes[i] !== newAttributes[i]) {

        gl.disableVertexAttribArray(i);
        enabledAttributes[i] = 0;

      }

    }

  }

  function vertexAttribPointer(
    index: number,
    size: number,
    type: number,
    normalized: boolean,
    stride: number,
    offset: number,
    integer: boolean
  ): void {

    if (integer === true) {

      gl.vertexAttribIPointer(index, size, type, stride, offset);

    } else {

      gl.vertexAttribPointer(index, size, type, normalized, stride, offset);

    }

  }

  function setupVertexAttributes(
    object: Node3D,
    material: Material,
    program: ReturnType<typeof WebGLProgram>,
    geometry: BufferGeometry
  ): void {

    initAttributes();

    const geometryAttributes = geometry.attributes;

    const programAttributes = program.getAttributes();

    const materialDefaultAttributeValues = material.defaultAttributeValues;

    for (const name in programAttributes) {

      const programAttribute = programAttributes[name];

      if (programAttribute.location >= 0) {

        let geometryAttribute = geometryAttributes[name];

        if (geometryAttribute === undefined) {

          if (name === 'instanceMatrix' && object.instanceMatrix) geometryAttribute = object.instanceMatrix;
          if (name === 'instanceColor' && object.instanceColor) geometryAttribute = object.instanceColor;

        }

        if (geometryAttribute !== undefined) {

          const normalized = geometryAttribute.normalized;
          const size = geometryAttribute.itemSize;

          const attribute = attributes.get(geometryAttribute);

          // TODO Attribute may not be available on context restore

          if (attribute === undefined) continue;

          const buffer = attribute.buffer;
          const type = attribute.type;
          const bytesPerElement = attribute.bytesPerElement;

          // check for integer attributes

          const integer = (type === gl.INT || type === gl.UNSIGNED_INT || geometryAttribute.gpuType === IntType);

          if (geometryAttribute.isInterleavedBufferAttribute) {

            const data = geometryAttribute.data;
            const stride = data.stride;
            const offset = geometryAttribute.offset;

            if (data.isInstancedInterleavedBuffer) {

              for (let i = 0; i < programAttribute.locationSize; i++) {

                enableAttributeAndDivisor(programAttribute.location + i, data.meshPerAttribute);

              }

              if (object.isInstancedMesh !== true && geometry._maxInstanceCount === undefined) {

                geometry._maxInstanceCount = data.meshPerAttribute * data.count;

              }

            } else {

              for (let i = 0; i < programAttribute.locationSize; i++) {

                enableAttribute(programAttribute.location + i);

              }

            }

            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

            for (let i = 0; i < programAttribute.locationSize; i++) {

              vertexAttribPointer(
                programAttribute.location + i,
                size / programAttribute.locationSize,
                type,
                normalized,
                stride * bytesPerElement,
                (offset + (size / programAttribute.locationSize) * i) * bytesPerElement,
                integer
              );

            }

          } else {

            if (geometryAttribute.isInstancedBufferAttribute) {

              for (let i = 0; i < programAttribute.locationSize; i++) {

                enableAttributeAndDivisor(programAttribute.location + i, geometryAttribute.meshPerAttribute);

              }

              if (object.isInstancedMesh !== true && geometry._maxInstanceCount === undefined) {

                geometry._maxInstanceCount = geometryAttribute.meshPerAttribute * geometryAttribute.count;

              }

            } else {

              for (let i = 0; i < programAttribute.locationSize; i++) {

                enableAttribute(programAttribute.location + i);

              }

            }

            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

            for (let i = 0; i < programAttribute.locationSize; i++) {

              vertexAttribPointer(
                programAttribute.location + i,
                size / programAttribute.locationSize,
                type,
                normalized,
                size * bytesPerElement,
                (size / programAttribute.locationSize) * i * bytesPerElement,
                integer
              );

            }

          }

        } else if (materialDefaultAttributeValues !== undefined) {

          const value = materialDefaultAttributeValues[name];

          if (value !== undefined) {

            switch (value.length) {

              case 2:
                gl.vertexAttrib2fv(programAttribute.location, value);
                break;

              case 3:
                gl.vertexAttrib3fv(programAttribute.location, value);
                break;

              case 4:
                gl.vertexAttrib4fv(programAttribute.location, value);
                break;

              default:
                gl.vertexAttrib1fv(programAttribute.location, value);

            }

          }

        }

      }

    }

    disableUnusedAttributes();

  }

  function dispose() {

    reset();

    for (const geometryId in bindingStates) {

      const programMap = bindingStates[geometryId];

      for (const programId in programMap) {

        const stateMap = programMap[programId];

        for (const wireframe in stateMap) {

          deleteVertexArrayObject(stateMap[wireframe].object);

          delete stateMap[wireframe];

        }

        delete programMap[programId];

      }

      delete bindingStates[geometryId];

    }

  }

  function releaseStatesOfGeometry(geometry: BufferGeometry) {

    if (bindingStates[geometry.id] === undefined) return;

    const programMap = bindingStates[geometry.id];

    for (const programId in programMap) {

      const stateMap = programMap[programId];

      for (const wireframe in stateMap) {

        deleteVertexArrayObject(stateMap[wireframe].object);

        delete stateMap[wireframe];

      }

      delete programMap[programId];

    }

    delete bindingStates[geometry.id];

  }

  function releaseStatesOfProgram(program: ReturnType<typeof WebGLProgram>): void {

    for (const geometryId in bindingStates) {

      const programMap = bindingStates[geometryId];

      if (programMap[program.id] === undefined) continue;

      const stateMap = programMap[program.id];

      for (const wireframe in stateMap) {

        deleteVertexArrayObject(stateMap[wireframe].object);

        delete stateMap[wireframe];

      }

      delete programMap[program.id];

    }

  }

  function reset() {

    resetDefaultState();
    forceUpdate = true;

    if (currentState === defaultState) return;

    currentState = defaultState;
    bindVertexArrayObject(currentState.object);

  }

  // for backward-compatibility

  function resetDefaultState() {

    defaultState.geometry = null;
    defaultState.program = null;
    defaultState.wireframe = false;

  }

  return {

    setup: setup,
    reset: reset,
    resetDefaultState: resetDefaultState,
    dispose: dispose,
    releaseStatesOfGeometry: releaseStatesOfGeometry,
    releaseStatesOfProgram: releaseStatesOfProgram,

    initAttributes: initAttributes,
    enableAttribute: enableAttribute,
    disableUnusedAttributes: disableUnusedAttributes

  };

}
