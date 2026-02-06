import { AnyTypedArray } from "../constants";
import { BufferAttribute } from "./BufferAttribute";

/**
 * An instanced version of a buffer attribute
 *
 * @augments BufferAttribute
 */
export class InstancedBufferAttribute extends BufferAttribute {
  /**
   * This flag can be used for type testing.
   */
  public readonly isInstancedBufferAttribute: boolean = true;

  /**
   * Defines how often a value of this buffer attribute should be repeated
   * A value of one means that each value of the instance attribute is used
   * for a single instance.
   * A value of two means that each value is used for two consecutive
   * instances (and so on)
   */
  public meshPerAttribute: number;

  /**
   * Constructs a new instanced buffer attribute
   *
   * @param array - The array holding the attribute data
   * @param itemSize - The item size
   * @param normalized - Whether the data are normalized or not
   * @param meshPerAttribute - How often a value of this buffer attribute
   * should be repeated
   */
  constructor(
    array: AnyTypedArray,
    itemSize: number,
    normalized: boolean = true,
    meshPerAttribute: number = 1
  ) {
    super(array, itemSize, normalized);

    this.meshPerAttribute = meshPerAttribute;
  }

  /**
   * Copies the given InstancedBufferAttribute into this InstancedBufferAttribute.
   *
   * @param source - The InstancedBufferAttribute to copy from
   * @returns A reference to this InstancedBufferAttribute
   */
  public copy(source: InstancedBufferAttribute): this {
    super.copy(source);

    this.meshPerAttribute = source.meshPerAttribute;

    return this;
  }

  /**
   * Serializes this InstancedBufferAttribute to a JSON object.
   *
   * @returns The serialized InstancedBufferAttribute
   */
  public toJSON(): object {
    const data = super.toJSON();

    data.meshPerAttribute = this.meshPerAttribute;

    data.isInstancedBufferAttribute = true;

    return data;
  }
}
