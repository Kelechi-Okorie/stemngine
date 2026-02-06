import { Vector3 } from '../math/Vector3';
import { InterleavedBuffer } from './InterleavedBuffer';
import { AnyTypedArray } from '../constants';
import { Matrix4 } from '../math/Matrix4';
import { Matrix3 } from '../math/Matrix3';
import { normalize, denormalize } from '../math/MathUtils';
import { BufferAttribute } from './BufferAttribute';
import { BufferViewWithUUID } from '../constants';

const _vector = /*@__PURE__*/ new Vector3();

/**
 * An alternative version of a buffer attribute with interleaved data.
 *
 * @remarks
 * Interleaved attributes share a common interleaved data storage {@link InterleavedBuffer}
 * and refer with different offsets and strides into that buffer.
 */
export class InterleavedBufferAttribute {

  /**
   * this flag can be used for type testing.
   *
  */
  public readonly isInterleavedBufferAttribute: boolean = true;

  /**
   * The name of the buffer attribute
   */
  public name: string = '';

  /**
   * The type property is used for detecting the object type
   * in context of serialization/deserialization
   *
  */
  public readonly type: string = 'InterleavedBufferAttribute';

  /**
   * The buffer holding the interleaved data
   */
  public data: InterleavedBuffer;

  /**
   * The item size, see {@link BufferAttribute#itemSize}
   */
  public itemSize: number;

  /**
   * The offset into the interleaved buffer
   */
  public offset: number;

  /**
   * Whether the data are normalized or not see {@link BufferAttribute#normalized}
   */
  public normalized: boolean;

  /**
   * Constructs a new interleaved buffer attribute
   *
   * @param interleavedBuffer - The buffer holding the interleaved data
   * @param itemSize - The item size
   * @param offset - The offset into the interleaved buffer
   * @param normalized - Whether the data are normalized or not
   */
  constructor(
    interleavedBuffer: InterleavedBuffer,
    itemSize: number,
    offset: number,
    normalized: boolean = false
  ) {

    this.data = interleavedBuffer;
    this.itemSize = itemSize;
    this.offset = offset;
    this.normalized = normalized;

  }

  /**
   * The total number of elements (vertices) stored in the buffer
   */
  public get count(): number {

    return this.data.count;

  }

  /**
   * Gets the array holding the interleaved buffer attribute data
   */
  public get array(): BufferViewWithUUID {

    return this.data.array;

  }

  /**
   * Flag to indicate that this attribute has changed and should be re-sent to the GPU
   *
   * @remarks
   * Set this to true when you modify the values in the array.
   *
   * @param value - The new value of the needsUpdate flag
   */
  public set needsUpdate(value: boolean) {

    // if (value === true) {
    //   this.data.version++;
    // }

    this.data.needsUpdate = value;

  }

  /**
   * Returns the given comoponent of the vector at the given index
   *
   * @param index - The index into the buffer attribute
   * @param component - The component index
   * @returns The returned value
   */
  public getComponent(index: number, component: number): number {

    let value = this.array[index * this.data.stride + this.offset + component];

    if (this.normalized) value = denormalize(value, this.array);

    return value;

  }

  /**
   * Sets the given value to the given component of the vector at the given index
   *
   * @param index - The index into the buffer attribute
   * @param component - The component index
   * @param value - The value to set
   * @returns A reference to this instance
   */
  public setComponent(index: number, component: number, value: number): InterleavedBufferAttribute {

    if (this.normalized) value = normalize(value, this.array);

    this.data.array[index * this.data.stride + this.offset + component] = value;

    return this;

  }

  /**
   * Returns the x component of the vector at the given index
   *
   * @param index - The index into the buffer attribute
   * @returns the x component
   */
  public getX(index: number): number {

    let x = this.data.array[index * this.data.stride + this.offset];

    if (this.normalized) x = denormalize(x, this.array);

    return x;

  }

  /**
   * Sets the x component of the vector at the given index
   *
   * @param index - The index into the attribute
   * @param x - The value to set
   * @returns A reference to this instance
   */
  public SetX(index: number, x: number): InterleavedBufferAttribute {

    if (this.normalized) x = normalize(x, this.array);

    this.data.array[index * this.data.stride + this.offset] = x;

    return this;

  }

  /**
   * Returns the y component of the vector at the given index
   *
   * @param index - the index into the buffer attribute
   * @returns The y component
   */
  public getY(index: number): number {
    let y = this.data.array[index * this.data.stride + this.offset + 1];

    if (this.normalized) y = denormalize(y, this.array);

    return y;
  }

  /**
   * Sets the y component of the vector at the given index
   *
   * @param index - The index into the buffer attribute
   * @param y - The value to set
   * @returns A reference to this instance
   */
  public setY(index: number, y: number): InterleavedBufferAttribute {

    if (this.normalized) y = normalize(y, this.array);

    this.data.array[index * this.data.stride + this.offset + 1] = y;

    return this;

  }

  /**
   * Returns the z component of the vector at the given index
   *
   * @param index - The index into the buffer attribute
   * @returns The z component
   */
  public getZ(index: number): number {

    let z = this.data.array[index * this.data.stride + this.offset + 2];

    if (this.normalized) z = denormalize(z, this.array);

    return z;

  }

  /**
   * Sets the z component of the vector at the given index
   *
   * @param index - The index into the buffer attribute
   * @param z - The value to set
   * @returns A reference to this instance
   */
  public setZ(index: number, z: number): InterleavedBufferAttribute {

    if (this.normalized) z = normalize(z, this.array);

    this.data.array[index * this.data.stride + this.offset + 2] = z;

    return this;

  }

  /**
   * Returns the w comopnent of the vector at the given index
   *
   * @param index - The index into the buffer attribute
   * @returns The w component
   */
  public getW(index: number): number {

    let w = this.data.array[index * this.data.stride + this.offset + 3];

    if (this.normalized) w = denormalize(w, this.array);

    return w;

  }

  /**
   * Sets the w component of the vector at the given index
   *
   * @param index - The index into the buffer attribute
   * @param w - The value to set
   * @returns A reference to this instance
   */
  public setW(index: number, w: number): InterleavedBufferAttribute {

    if (this.normalized) w = normalize(w, this.array);

    this.data.array[index * this.data.stride + this.offset + 3] = w;

    return this;

  }

  /**
   * Sets the x and y component of the vector at the given index
   *
   * @param index - The index into the buffer attriburte
   * @param x - The value for the x component to set
   * @param y - The value for the y component to set
   * @returns A reference to this instance
   */
  public setXY(index: number, x: number, y: number): InterleavedBufferAttribute {

    index = index * this.data.stride + this.offset;

    if (this.normalized) {

      x = normalize(x, this.array);
      y = normalize(y, this.array);

    }

    this.data.array[index + 0] = x;
    this.data.array[index + 1] = y;

    return this;

  }

  /**
   * Sets the x, y, and z components of the vector at the given index
   *
   * @param index - The index into the buffer attribute
   * @param x - The value for the x component to set
   * @param y - The value for the y component to set
   * @param z - The value for the z component to set
   * @returns A reference to this instance
   */
  public setXYZ(index: number, x: number, y: number, z: number): InterleavedBufferAttribute {

    index = index * this.data.stride + this.offset;

    if (this.normalized) {

      x = normalize(x, this.array);
      y = normalize(y, this.array);
      z = normalize(z, this.array);

    }

    this.data.array[index + 0] = x;
    this.data.array[index + 1] = y;
    this.data.array[index + 2] = z;

    return this;

  }

  /**
   * Sets the x, y, z, and w components of the vector at the given index
   *
   * @param index - The index into the buffer attribute
   * @param x - The value for the x component to set
   * @param y - The value for the y component to set
   * @param z - The value for the z component to set
   * @param w - The value for the w component to set
   * @returns A reference to this instance
   */
  public setXYZW(index: number, x: number, y: number, z: number, w: number): InterleavedBufferAttribute {

    index = index * this.data.stride + this.offset;

    if (this.normalized) {

      x = normalize(x, this.array);
      y = normalize(y, this.array);
      z = normalize(z, this.array);
      w = normalize(w, this.array);

    }

    this.data.array[index + 0] = x;
    this.data.array[index + 1] = y;
    this.data.array[index + 2] = z;
    this.data.array[index + 3] = w;

    return this;

  }

  /**
   * Applies the given 4x4 matrix to the given attribute
   *
   * @remarks
   * Only works with item size 3
   *
   * @param m - The matrix to apply
   * @returns A reference to this instance
   */
  public applyMatrix4(m: Matrix4): InterleavedBufferAttribute {

    for (let i = 0, l = this.data.count; i < l; i++) {

      _vector.fromBufferAttribute(this, i);

      _vector.applyMatrix4(m);

      this.setXYZ(i, _vector.x, _vector.y, _vector.z);
    }

    return this;

  }

  /**
   * Applies the given 3x3 normal matrix to the given attribute
   *
   * @remarks
   * Only works with item size 3
   *
   * @param m - The normal matrix to apply
   * @returns A referenct to this instance
   */
  public applyNormalMatrix(m: Matrix3): InterleavedBufferAttribute {

    for (let i = 0, l = this.count; i < l; i++) {

      _vector.fromBufferAttribute(this, i);

      _vector.applyNormalMatrix(m);

      this.setXYZ(i, _vector.x, _vector.y, _vector.z);

    }

    return this;

  }

  /**
   * Applies the given 4x4 matrix to the given attribute
   *
   * @remarks
   * Only works with item size 3 and with direction vectors
   *
   * @param m - The matrix to apply
   * @returns A reference to this instance
   */
  public transformDirection(m: Matrix4): InterleavedBufferAttribute {

    for (let i = 0, l = this.count; i < l; i++) {

      _vector.fromBufferAttribute(this, i);

      _vector.transformDirection(m);

      this.setXYZ(i, _vector.x, _vector.y, _vector.z);

    }

    return this;

  }

  /**
   * Returns a new buffer attribute with copied values from this instance
   *
   * @remarks
   * If no parameter is provided, cloning an interleaved buffer attribute will
   * de-interleave buffer data
   *
   * @param data - An object with interleaved buffer that allows to retain the
   * interleaved property
   * @returns A clone of this instance
   */
  public clone(data?: any): BufferAttribute | InterleavedBufferAttribute {

    if (data === undefined) {

      console.log('InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.');

      const array = [];

      for (let i = 0; i < this.count; i++) {

        const index = i * this.data.stride + this.offset;

        for (let j = 0; j < this.itemSize; j++) {

          array.push(this.data.array[index + j]);

        }

      }

      const Ctor = this.array.constructor as { new(buffer: ArrayLike<number>): AnyTypedArray };

      return new BufferAttribute(new Ctor(array), this.itemSize, this.normalized);

    } else {

      if (data.interleavedBuffers === undefined) {

        data.interleavedBuffers = {};

      }

      if (data.interleavedBuffers[this.data.uuid] === undefined) {

        data.interleavedBuffers[this.data.uuid] = this.data.clone(data);

      }

      return new InterleavedBufferAttribute(
        data.interleavedBuffers[this.data.uuid],
        this.itemSize,
        this.offset,
        this.normalized
      );

    }

  }

  /**
   * Serializes the buffer attribuet into JSON
   *
   * @remrks
   * If not parameter is provided, cloning an interleaved buffer attribute will de-interleave
   * buffer data
   *
   * @param data - An optional value holding meta information about the serialization
   * @returns A JSON object representing the serialized buffer attribute
   */
  public toJSON(
    data: {
      interleavedBuffers?: Record<string, any>;
      arrayBuffers?: Record<string, number[]>
    }
  ): any {

    if (data === undefined) {
      console.log('InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.');

      const array = [];

      for (let i = 0; i < this.count; i++) {

        const index = i * this.data.stride + this.offset;

        for (let j = 0; j < this.itemSize; j++) {

          array.push(this.data.array[index + j]);

        }

      }

      // de-interleave data and save it as an ordinary buffer attribute for now

      return {
        itemSize: this.itemSize,
        type: this.array.constructor.name,
        array: array,
        normalized: this.normalized
      };

    } else {

      // save as true interleaved attribute

      if (data.interleavedBuffers === undefined) {

        data.interleavedBuffers = {};

      }

      if (data.interleavedBuffers[this.data.uuid] === undefined) {

        data.interleavedBuffers[this.data.uuid] = this.data.toJSON(data);

      }

      return {
        isInterleavedBufferAttribute: true,
        itemSize: this.itemSize,
        data: this.data.uuid,
        offset: this.offset,
        normalized: this.normalized
      };

    }

  }

}

export function isInterleavedBufferAttribute(
  attr: BufferAttribute | InterleavedBufferAttribute
): attr is InterleavedBufferAttribute {

  return (attr as InterleavedBufferAttribute).isInterleavedBufferAttribute === true;
  
}

