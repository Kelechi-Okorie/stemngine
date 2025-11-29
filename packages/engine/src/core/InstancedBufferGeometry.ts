import { BufferGeometry } from './BufferGeometry.js';

/**
 * An instanced version of a geometry
 *
 * @augments BufferGeometry
 */
export class InstancedBufferGeometry extends BufferGeometry {
  /**
   * This flag can be used for type testing.
   *
   * @type {boolean}
   * @readonly
   * @default true
   */
  public isInstancedBufferGeometry: boolean = true;

  /**
   * The type property is used for detecting the object type
   * in context of serialization/deserialization
   *
   * @readonly
   */
  public type: string = 'InstancedBufferGeometry';

  /**
   * The instance count defines how many instances of the geometry will be rendered
   */
  public instanceCount: number = Infinity;

  /**
   * Constructs a new instanced buffer geometry
   */
  constructor() {
    super();
  }

  /**
   * Copies the given InstancedBufferGeometry into this InstancedBufferGeometry.
   *
   * @param source - The InstancedBufferGeometry to copy from
   * @returns A reference to this InstancedBufferGeometry
   */
  public copy(source: InstancedBufferGeometry): this {
    super.copy(source);

    this.instanceCount = source.instanceCount;

    return this;
  }

  /**
   * Serializes this InstancedBufferGeometry to a JSON object.
   *
   * @returns The serialized InstancedBufferGeometry
   */
  public toJSON() {
    const data = super.toJSON();

    data.instanceCount = this.instanceCount;

    data.isInstanceBufferGeometry = true;

    return data;
  }
}
