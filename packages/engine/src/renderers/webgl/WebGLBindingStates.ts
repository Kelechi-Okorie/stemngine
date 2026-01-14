import { IntType } from '../../constants.js';
import { WebGLAttributes } from './WebGLAttributes.js';

interface BindingState {
  geometry: any | null;
  program: any | null;
  wireframe: boolean;
  newAttributes: number[];
  enabledAttributes: number[];
  attributeDivisors: number[];
  object: WebGLVertexArrayObject | null;
  attributes: Record<string, any>;
  attributesNum: number;
  index: number | null;
}

export class WebGLBindingStates {
  private readonly gl: WebGL2RenderingContext;
  private attributes: WebGLAttributes

  private maxVertexAttributes: any;

  private bindingStates: { [key: number]: any } = {};

  private defaultState = this.createBindingState(null);
  private currentState: BindingState = this.defaultState;
  private forceUpdate = false;

  constructor(
    gl: WebGL2RenderingContext,
    attributes: WebGLAttributes
  ) {
    this.gl = gl;
    this.attributes = attributes;

    this.maxVertexAttributes = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
  }

  public setup(
    object: any,
    material: any,
    program: {
      id: number,
      getAttributes(): Record<string, { location: number, locationSize: number }>;
    },
    geometry: any,
    index: any | null
  ): void {

    let updateBuffers = false;

    const state = this.getBindingState(geometry, program, material);

    if (this.currentState !== state) {

      this.currentState = state;
      this.bindVertexArrayObject(this.currentState.object);

    }

    updateBuffers = this.needsUpdate(object, geometry, program, index);

    if (updateBuffers) this.saveCache(object, geometry, program, index);

    if (index !== null) {

      this.attributes.update(index, this.gl.ELEMENT_ARRAY_BUFFER);

    }

    if (updateBuffers || this.forceUpdate) {

      this.forceUpdate = false;

      this.setupVertexAttributes(object, material, program, geometry);

      if (index !== null) {

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.attributes.get(index)!.buffer);

      }

    }

  }

  public createVertexArrayObject() {

    return this.gl.createVertexArray();

  }

  public bindVertexArrayObject(vao: WebGLVertexArrayObject | null) {

    return this.gl.bindVertexArray(vao);

  }

  public deleteVertexArrayObject(vao: WebGLVertexArrayObject | null) {

    return this.gl.deleteVertexArray(vao);

  }

  public getBindingState(
    geometry: { id: number },
    program: { id: number },
    material: { wireframe?: boolean }
  ) {

    const wireframe = (material.wireframe === true);

    let programMap = this.bindingStates[geometry.id];

    if (programMap === undefined) {

      programMap = {};
      this.bindingStates[geometry.id] = programMap;

    }

    let stateMap = programMap[program.id];

    if (stateMap === undefined) {

      stateMap = {};
      programMap[program.id] = stateMap;

    }

    let state = stateMap[wireframe ? 1 : 0];

    if (state === undefined) {

      state = this.createBindingState(this.createVertexArrayObject());
      stateMap[wireframe ? 1 : 0] = state;

    }

    return state;

  }

  public createBindingState(vao: WebGLVertexArrayObject | null) {

    const newAttributes = [];
    const enabledAttributes = [];
    const attributeDivisors = [];

    for (let i = 0; i < this.maxVertexAttributes; i++) {

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
      attributesNum: 0,
      index: null as number | null

    };

  }

  public needsUpdate(
    object: {
      instanceMatrix?: any;
      instanceColor?: any;
    },
    geometry: {
      attributes: Record<string, any>;
    },
    program: {
      getAttributes(): Record<string, { location: number }>;
    },
    index: any
  ) {

    const cachedAttributes = this.currentState.attributes;
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

    if (this.currentState.attributesNum !== attributesNum) return true;

    if (this.currentState.index !== index) return true;

    return false;

  }

  public saveCache(
    object: any,
    geometry: { attributes: Record<string, any> },
    program: { getAttributes: () => Record<string, { location: number }> },
    index: number
  ) {

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

        const data: Record<string, any> = {};
        data.attribute = attribute;

        if (attribute && attribute.data) {

          data.data = attribute.data;

        }

        cache[name] = data;

        attributesNum++;

      }

    }

    this.currentState.attributes = cache;
    this.currentState.attributesNum = attributesNum;

    this.currentState.index = index;

  }

  public initAttributes() {

    const newAttributes = this.currentState.newAttributes;

    for (let i = 0, il = newAttributes.length; i < il; i++) {

      newAttributes[i] = 0;

    }

  }

  public enableAttribute(attribute: number) {

    this.enableAttributeAndDivisor(attribute, 0);

  }

  public enableAttributeAndDivisor(attribute: number, meshPerAttribute: number) {

    const newAttributes = this.currentState.newAttributes;
    const enabledAttributes = this.currentState.enabledAttributes;
    const attributeDivisors = this.currentState.attributeDivisors;

    newAttributes[attribute] = 1;

    if (enabledAttributes[attribute] === 0) {

      this.gl.enableVertexAttribArray(attribute);
      enabledAttributes[attribute] = 1;

    }

    if (attributeDivisors[attribute] !== meshPerAttribute) {

      this.gl.vertexAttribDivisor(attribute, meshPerAttribute);
      attributeDivisors[attribute] = meshPerAttribute;

    }

  }

  public disableUnusedAttributes() {

    const newAttributes = this.currentState.newAttributes;
    const enabledAttributes = this.currentState.enabledAttributes;

    for (let i = 0, il = enabledAttributes.length; i < il; i++) {

      if (enabledAttributes[i] !== newAttributes[i]) {

        this.gl.disableVertexAttribArray(i);
        enabledAttributes[i] = 0;

      }

    }

  }

  public vertexAttribPointer(
    index: number,
    size: number,
    type: GLenum,
    normalized: boolean,
    stride: number,
    offset: number,
    integer: boolean
  ) {

    if (integer === true) {

      this.gl.vertexAttribIPointer(index, size, type, stride, offset);

    } else {

      this.gl.vertexAttribPointer(index, size, type, normalized, stride, offset);

    }

  }

  public setupVertexAttributes(
    object: {
      instanceMatrix?: any;
      instanceColor?: any;
      isInstancedMesh?: boolean;
    },
    material: {
      defaultAttributeValues?: Record<string, number[]>;
    },
    program: {
      getAttributes: () => Record<
        string,
        { location: number; locationSize: number }
      >;
    },
    geometry: {
      attributes: Record<string, any>;
      _maxInstanceCount?: number;
    }
  ) {

    this.initAttributes();

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

          const attribute = this.attributes.get(geometryAttribute);

          // TODO Attribute may not be available on context restore

          if (attribute === undefined) continue;

          const buffer = attribute.buffer;
          const type = attribute.type;
          const bytesPerElement = attribute.bytesPerElement;

          // check for integer attributes

          const integer = (type === this.gl.INT || type === this.gl.UNSIGNED_INT || geometryAttribute.gpuType === IntType);

          if (geometryAttribute.isInterleavedBufferAttribute) {

            const data = geometryAttribute.data;
            const stride = data.stride;
            const offset = geometryAttribute.offset;

            if (data.isInstancedInterleavedBuffer) {

              for (let i = 0; i < programAttribute.locationSize; i++) {

                this.enableAttributeAndDivisor(programAttribute.location + i, data.meshPerAttribute);

              }

              if (object.isInstancedMesh !== true && geometry._maxInstanceCount === undefined) {

                geometry._maxInstanceCount = data.meshPerAttribute * data.count;

              }

            } else {

              for (let i = 0; i < programAttribute.locationSize; i++) {

                this.enableAttribute(programAttribute.location + i);

              }

            }

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);

            for (let i = 0; i < programAttribute.locationSize; i++) {

              this.vertexAttribPointer(
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

                this.enableAttributeAndDivisor(programAttribute.location + i, geometryAttribute.meshPerAttribute);

              }

              if (object.isInstancedMesh !== true && geometry._maxInstanceCount === undefined) {

                geometry._maxInstanceCount = geometryAttribute.meshPerAttribute * geometryAttribute.count;

              }

            } else {

              for (let i = 0; i < programAttribute.locationSize; i++) {

                this.enableAttribute(programAttribute.location + i);

              }

            }

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);

            for (let i = 0; i < programAttribute.locationSize; i++) {

              this.vertexAttribPointer(
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
                this.gl.vertexAttrib2fv(programAttribute.location, value);
                break;

              case 3:
                this.gl.vertexAttrib3fv(programAttribute.location, value);
                break;

              case 4:
                this.gl.vertexAttrib4fv(programAttribute.location, value);
                break;

              default:
                this.gl.vertexAttrib1fv(programAttribute.location, value);

            }

          }

        }

      }

    }

    this.disableUnusedAttributes();

  }

  public dispose() {

    this.reset();

    for (const geometryId in this.bindingStates) {

      const programMap = this.bindingStates[geometryId];

      for (const programId in programMap) {

        const stateMap = programMap[programId];

        for (const wireframe in stateMap) {

          this.deleteVertexArrayObject(stateMap[wireframe].object);

          delete stateMap[wireframe];

        }

        delete programMap[programId];

      }

      delete this.bindingStates[geometryId];

    }

  }

  public releaseStatesOfGeometry(geometry: { id: number }) {

    if (this.bindingStates[geometry.id] === undefined) return;

    const programMap = this.bindingStates[geometry.id];

    for (const programId in programMap) {

      const stateMap = programMap[programId];

      for (const wireframe in stateMap) {

        this.deleteVertexArrayObject(stateMap[wireframe].object);

        delete stateMap[wireframe];

      }

      delete programMap[programId];

    }

    delete this.bindingStates[geometry.id];

  }

  public releaseStatesOfProgram(program: { id: string | number }) {

    for (const geometryId in this.bindingStates) {

      const programMap = this.bindingStates[geometryId];

      if (programMap[program.id] === undefined) continue;

      const stateMap = programMap[program.id];

      for (const wireframe in stateMap) {

        this.deleteVertexArrayObject(stateMap[wireframe].object);

        delete stateMap[wireframe];

      }

      delete programMap[program.id];

    }

  }

  public reset() {

    this.resetDefaultState();
    this.forceUpdate = true;

    if (this.currentState === this.defaultState) return;

    this.currentState = this.defaultState;
    this.bindVertexArrayObject(this.currentState.object);

  }

  // for backward-compatibility

  public resetDefaultState() {

    this.defaultState.geometry = null;
    this.defaultState.program = null;
    this.defaultState.wireframe = false;

  }
}
