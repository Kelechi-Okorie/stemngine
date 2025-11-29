import { AnyTypedArray, BufferViewWithUUID, BufferUsage, StaticDrawUsage, TypedArrayConstructor } from "../constants";
import { generateUUID } from '../math/MathUtils';

type BufferCloneData = {
  arrayBuffers?: Record<string, BufferViewWithUUID>;
}

/**
 * "Interleaved" means that multiple attributes, possibly of different types,
 * (e.g., position, normal, uv, color) are packed into a singlel array buffer.
 *
 * @remarks
 * An introduction into interleaved arrays can be found here:
 * [Interleaved array basics]{@link https://blog.tojicode.com/2011/05/interleaved-arrays-basics.html}
 */
export class InterleavedBuffer {
  /**
 * this flag can be used for type testing.
 *
 * @type {boolean}
 * @readonly
 * @defaultValue true
*/
  public readonly isInterleavedBuffer: boolean = true;

  /**
 * The type property is used for detecting the object type
 * in context of serialization/deserialization
 *
 * @readonly
*/
  public readonly type: string = 'InterleavedBuffer';

  /**
   * The UUID of this interleaved buffer
   *
   * @readonly
   */
  public readonly uuid: string = generateUUID();

  /**
   * The name of the interleaved buffer
   */
  public name: string = '';

  /**
   * A typed array with a shared buffer storing attribute data
   */
  public array: BufferViewWithUUID;

  /**
   * The number of typed-array element per vertex
   */
  public stride: number;

  /**
   * The total number of elements (vertices) stored in the buffer
   */
  public count: number;

  /**
   * Defines the intended usage pattern of the data stored for optimization purposes
   *
   * @remarks
   * After the initial use of a buffer, its usage cannot be changed. Instead
   * instiante a new one and set the desired usage before the next render
   */
  public usage: BufferUsage = StaticDrawUsage;

  /**
   * This can be used to only update some components of stored vectors (for example,
   * just the component related to color).
   * Use the `addUpdateRange()` function to add ranges to this array
   */
  public updateRanges: { offset: number; count: number }[] = [];

  /**
   * A version number, incremented every time the `needsUpdate` flag is set to true
   */
  public version: number = 0;

  /**
   * Constructs a new interleaved buffer
   *
   * @param array - A typed array with a shared buffer storing attribute data
   * @param stride - The number of typed-array elements per vertex
   */
  constructor(array: AnyTypedArray, stride: number) {
    this.array = array;
    this.stride = stride;
    this.count = array.length / stride;
  }

  /**
   * A callback function that is executed after the renderer has transferred the attribute
   * array data to the GPU
   */
  public onUploadCallback(): void { }

  /**
   * Flag to indicate that this attribute has changed and shuld be re-sent to the GPU
   *
   * @remarks
   * Set this to `true` when you modify the value of the array
   *
   * @param value - The new value of the flag
   */
  public set needsUpdate(value: boolean) {
    if (value === true) this.version++;
  }

  /**
   * Sets the usage of this interleaved buffer.
   *
   * @param value
   * @returns A reference to this interleaved buffer
   */
  public setUsage(value: BufferUsage): this {
    this.usage = value;
    return this;
  }

  /**
   * Adds a range of data in the data array to be updated on the GPU
   *
   * @param offset - Position at which to start updating
   * @count - The number of components to be updated
   */
  public addUpdateRange(offset: number, count: number): void {
    this.updateRanges.push({ offset, count })
  }

  /**
   * Clears the update ranges array
   */
  public clearUpdateRanges(): void {
    this.updateRanges.length = 0;
  }

  /**
   * Copies the values of the given InterleavedBuffer to this instance.
   *
   * @param source - the interleaved buffer to copy from
   * @returns A reference to this instance
   */
  public copy(source: InterleavedBuffer): this {
    this.array = source.array;
    this.stride = source.stride;
    this.count = source.count;
    this.usage = source.usage;

    return this;
  }

  /**
   * Copies a vector from the given interleaved buffer to this buffer.
   *
   * @remarks
   * The start and destination position in the attribute are represented by
   * the given indices
   *
   * @param index1 - The destination index into this i nterleaved buffer
   * @param interleavedBuffer - The source interleaved buffer
   * @param index2 - The source index into the source interleaved buffer
   * @returns A reference to this interleaved buffer
   */
  public copyAt(index1: number, interleavedBuffer: InterleavedBuffer, index2: number): this {
    index1 *= this.stride;
    index2 *= interleavedBuffer.stride;

    for (let i = 0, l = this.stride; i < l; i++) {

      this.array[index1 + i] = interleavedBuffer.array[index2 + i];

    }

    return this;
  }

  /**
   * Sets the given array data in the interleaved buffer.
   *
   * @param value - The array data to set
   * @param offset - The offset in this interleaved buffer's array.
   * @returns A reference to this instance
   */
  public set(value: AnyTypedArray, offset: number = 0): this {
    this.array.set(value, offset);

    return this;
  }

  /**
   * Returns a new interleaved buffer with copied values from thsi instance
   *
   * @remarks
   * This is confusing code because it is not doing a normal clone()
   * It's  doing a special Three.js-style "shared buffer clone" used during serialization
   *
   * @param data - An object with shared array buffers that allows to retain
   * shared structure.
   *
   * @returns A clone of this instance
   */
  public clone(data: any): InterleavedBuffer {
    if (data.arrayBuffers === undefined) {

      data.arrayBuffers = {};

    }

    if (this.array.buffer._uuid === undefined) {

      this.array.buffer._uuid = generateUUID();

    }

    if (data.arrayBuffers[this.array.buffer._uuid] === undefined) {

      data.arrayBuffers[this.array.buffer._uuid] = this.array.slice(0).buffer;

    }

    const Ctor = this.array.constructor as { new(buffer: ArrayBuffer): AnyTypedArray };

    const array = new Ctor(data.arrayBuffers[this.array.buffer._uuid]);

    const ib = new InterleavedBuffer(array, this.stride);
    ib.setUsage(this.usage);

    return ib;
  }

  /**
   * Sets the given callback function that executed after the renderer has transferred
   * the array data to the GPU.
   *
   * @remarks
   * Can be used to perform clean-up operations after the upload when data are not
   * needed anymore on the CUP side.
   *
   * @param callback - The function to callback
   * @returns A reference to this instance
   */
  public onUpload(callback: () => void): this {
    this.onUploadCallback = callback;

    return this;
  }

  /**
   * Serializes the interleaved buffer into JSON.
   *
   * @param data - An optional value holding meta information about the serialization
   * @returns A JSON object representing the serialized interleaved buffer
   */
  public toJSON(data: { arrayBuffers?: Record<string, number[]> }): any {
    if (data.arrayBuffers === undefined) {

      data.arrayBuffers = {};

    }

    // generate UUID for array buffer if necessary

    if (this.array.buffer._uuid === undefined) {

      this.array.buffer._uuid = generateUUID();

    }

    if (data.arrayBuffers[this.array.buffer._uuid] === undefined) {

      data.arrayBuffers[this.array.buffer._uuid] = Array.from(new Uint32Array(this.array.buffer));

    }

    return {
      uuid: this.uuid,
      buffer: this.array.buffer._uuid,
      type: this.array.constructor.name,
      stride: this.stride
    };
  }
}
