import { InterleavedBuffer } from './InterleavedBuffer.js';
import { AnyTypedArray } from '../constants.js';

/**
 * An instanced version of an interleaved buffer
 *
 * @augments InterleavedBuffer
 */
export class InstancedInterleavedBuffer extends InterleavedBuffer {
  /**
   * This flag can be used for type testing.
   *
   * @type {boolean}
   * @readonly
   * @default true
   */
  public isInstancedInterleavedBuffer: boolean = true;

  /**
   * Defines how often a value of this buffer attribute should be repeated,
   * see {@link InstancedBufferAttribute#meshPerAttribute}.
   *
   * @type {number}
   * @default 1
   */
  public meshPerAttribute: number;

  /**
   * Constructs a new instanced interleaved buffer
   *
   * @param array - The array holding the attribute data
   * @param stride - The stride
   * @param meshPerAttribute - How often a value of this buffer attribute
   * should be repeated
   */
  constructor(array: AnyTypedArray, stride: number, meshPerAttribute: number = 1) {
    super(array, stride);

    this.meshPerAttribute = meshPerAttribute
  }

  /**
   * Copies the given InstancedInterleavedBuffer into this InstancedInterleavedBuffer.
   *
   * @param source - The InstancedInterleavedBuffer to copy from
   * @returns A reference to this InstancedInterleavedBuffer
   */
  public copy(source: InstancedInterleavedBuffer): this {
    super.copy(source);

    this.meshPerAttribute = source.meshPerAttribute;

    return this;
  }

  /**
   * Clones this InstancedInterleavedBuffer.
   *
   * @returns A new InstancedInterleavedBuffer
   */
  public clone(data: any): InterleavedBuffer {
    const baseClone = super.clone(data);
    const clone = new InstancedInterleavedBuffer(baseClone.array, baseClone.stride, this.meshPerAttribute);

    clone.setUsage(baseClone.usage);

    return clone;
  }

  /**
   * Serializes this InstancedInterleavedBuffer to a JSON object.
   *
   * @returns The serialized InstancedInterleavedBuffer
   */
  public toJSON(data: any = {}): object {
    const json = super.toJSON(data);

    json.isInstancedInterleavedBuffer = true;
    json.meshPerAttribute = this.meshPerAttribute;

    return json;
  }
}
