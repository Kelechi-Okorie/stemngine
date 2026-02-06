import { BufferUsage, StaticDrawUsage, GpuType, FloatType, AnyTypedArray } from "../constants";
import { Vector3 } from '../math/Vector3';
import { Vector2 } from '../math/Vector2';
import { normalize, denormalize } from '../math/MathUtils';
import { toHalfFloat, fromHalfFloat } from '../extras/DataUtils';
import { Matrix3 } from "../math/Matrix3";
import { Matrix4 } from "../math/Matrix4";

const _vector =  /*@__PURE__*/ new Vector3();
const _vector2 = /*__PURE__*/ new Vector2();

let _id = 0;

/**
 * This class stores data for an attribute (such as vertex position, face indices,
 * normals, colors, UVs, and any custom attributes) associated with a geometry,
 * which allows for more efficent passing of data to the GPU.
 *
 * @remarks
 * When working with vector-like data, the `fromBufferAttribute(attribute, index)`
 * helper methods on vector, quaternion and color class might be helpful E.g.
 * {@link Vector3#fromBufferAttribute}, {@link Quaternion#fromBufferAttribute}
 *
 * A core low-level data structure for storing geometry data / describing vertex data
 * for the GPU.
 *
 * It:
 * wraps a typed array
 * defines how that array is structured (itemSize, normalized)
 * gives helpers for reading and writing data to and from the array
 * optionally normalizes integer data
 * Is used by BufferGeometry and the renderer to send data to shaders
 *
 * without it, you cannot render vertices, normals, UVs, or any mesh
 *
 * Describes how raw numeric data is stored for the GPU and how to access it
 * It is the bridge between Javascript arays / TypedArrays and GPU vertex attributes.
 * such as:
 * positions
 * normals
 * UVs
 * colors
 * tangents
 * skinning weights and indices
 * custom attributes
 *
 * Meshes are built from BufferGeometries, which contain one or more BufferAttributes.
 *
 * In short, A bufferAttribute = (TypedArray + itemSize)
 */
export class BufferAttribute {
  /**
   * This flag can be used for type testing
   *
   * @default true
   */
  public readonly isBufferAttribute: boolean = true;

  /**
   * The ID of the buffer attribute.
   *
   * @name BufferAttribute#id
   * @readonly
   */
  public readonly id: number;

  /**
   * The name of the buffer attribute
   *
   */
  public name: string = '';

  /**
   * The array holding the attribute data. It should have `itemSize * numVertices` elements,
   * where `numVertices` is the number of vertices in the associated geometry
   *
   */
  public array: AnyTypedArray;

  /**
   * The number of values of the array that should be associated with a particular vertex.
   * For instance, if this attribute is storing a 3-component vector (such as position,
   * normal, color), then the value would be `3`)
   *
   */
  public itemSize: number;

  /**
   * Represents the number of items this bufffer attribute stores. It is internally computed
   * by dividingn the `array` l ength by the `itemSize`
   *
   * @readonly
   */
  public count: number = 0;

  /**
   * Applies to integer data only. Indicates how the underlying data in the buffer maps to
   * the values in the GLSL code.
   *
   * @remarks
   * For instance, if `array' is an instance of `UInt16Array`,
   * and `normalized` is `true`, the values `0 - +65535` in the array data will be mapped to
   * `0.0f - +1.0f` in the GLSL attribute. If false, the values will be converted to floats
   * unmodified, i.e. 65535 becomes 65535.0f.
   */
  public normalized: boolean = false;

  /**
   * Defines the intended usage pattern of the data store for optimization purposes
   *
   * @remarks
   * After the initial use of a buffer, it's usage cannot be changed. Instead, instantiate
   * a new one and set the desired usage before the next render
   */
  public usage: BufferUsage = StaticDrawUsage;

  /**
   * This can be used to only update some components of stored vectors (for example, just the
   * components related to color).
   *
   * @remarks
   * Use the `addUpdateRange()` function to add ranges to this array.
   *
   * @type {Array<Object>}
   */
  public updateRanges: { start: number; count: number }[] = [];

  /**
   * Configures the bound GPU type for use in shaders.
   *
   * @remarks
   * This only has an effect for integer arrays and is not configurable for float arrays.
   * For lower precision float types, use `Float16BufferAttribute`.
   *
   * @default FloatType
   */
  public gpuType: GpuType = FloatType;

  /**
   * A version number, incremented every time the `needsUpdate` is set to `true`.
   *
   */
  public version: number = 0;

  /**
   * Constructs a new buffer attribute
   *
   * @param array - The array holding the attribute data
   * @param itemSize - The size of the item
   * @param normalized - Whether the data are normalized or not
   */
  constructor(array: AnyTypedArray, itemSize: number, normalized: boolean = false) {

    if (Array.isArray(array)) {
      throw new TypeError('BufferAttribute: array should be a Typed Array');
    }

    this.id = _id++;

    this.array = array;

    this.itemSize = itemSize;

    this.count = array !== undefined ? array.length / itemSize : 0

    this.normalized = normalized;
  }

  /**
   * Sets the given array data in the buffer attribute.
   *
   * @param value - The array to set
   * @param offset - The offset in this buffer attribute's array.
   * @returns A reference to this instance
   */
  public set(value: AnyTypedArray, offset: number = 0): this {

    // Matching the BufferAttribute constructor, do not normalize the array
    this.array.set(value, offset);

    return this;

  }

  /**
   * Returns the given component of the vector at the given index
   *
   * @param index - The index into the buffer attribute.
   * @param component - The component index
   * @returns The value of the component
   */
  public getComponent(index: number, component: number): number {

    let value = this.array[index * this.itemSize + component];

    if (this.normalized) value = denormalize(value, this.array);

    return value;

  }

  /**
   * Sets the given value to the given component of the vector at the given index.
   *
   * @param index - The index into the buffer attribute.
   * @param component - The comopnent index
   * @param value - The value to set
   * @returns A reference to this instance
   */
  public setComponent(index: number, component: number, value: number): this {

    if (this.normalized) value = normalize(value, this.array);

    this.array[index * this.itemSize + component] = value;

    return this;

  }

  /**
   * Returns the x component of the vector at the given index
   *
   * @param index - The index into the buffer attribute.
   * @returns The x component
   */
  public getX(index: number): number {

    let x = this.array[index * this.itemSize];

    if (this.normalized) x = denormalize(x, this.array);

    return x;

  }

  /**
   * Sets the x component of the vector at the given index.
   *
   * @param index - The index into the buffer attribute.
   * @param x - The x component
   * @returns A reference to this instance
   */
  public setX(index: number, x: number): this {

    if (this.normalized) x = normalize(x, this.array);

    this.array[index * this.itemSize] = x;

    return this;

  }

  /**
   * Returns the y component of the vector at the given index.
   *
   * @param index - The index into the buffer attribute.
   * @returns The y component
   */
  public getY(index: number): number {

    let y = this.array[index * this.itemSize + 1];

    if (this.normalized) y = denormalize(y, this.array);

    return y;

  }

  /**
   * Sets the y component of the vector at the given index.
   *
   * @param index - The index into the buffer attribute.
   * @param y - The value to set
   * @returns A reference to this instance
   */
  public setY(index: number, y: number): this {

    if (this.normalized) y = normalize(y, this.array);

    this.array[index * this.itemSize + 1] = y;

    return this;

  }

  /**
   * Returns the z component of the vector at the given index.
   *
   * @param index - The index into the buffer attribute
   * @returns The z component
   */
  public getZ(index: number): number {

    let z = this.array[index * this.itemSize + 2];

    if (this.normalized) z = denormalize(z, this.array);

    return z;

  }

  /**
   * Sets the z component of the vector at the given index.
   *
   * @param index - The index into the buffer attribute
   * @param z - The z component
   * @returns A reference to this instance
   */
  public setZ(index: number, z: number): this {

    if (this.normalized) z = normalize(z, this.array);

    this.array[index * this.itemSize + 2] = z;

    return this;

  }

  /**
   * Returns the w component of the vector at the given index.
   *
   * @param index - The index into the buffer attribute
   * @returns The w component
   */
  public getW(index: number): number {
    let w = this.array[index * this.itemSize + 3];

    if (this.normalized) w = denormalize(w, this.array);

    return w;
  }

  /**
   * Sets the w component of the vector at the given index.
   *
   * @param index - The index into the buffer attribute
   * @param w - The w component
   * @returns A reference to this instance
   */
  public setW(index: number, w: number): this {

    if (this.normalized) w = normalize(w, this.array);

    this.array[index * this.itemSize + 3] = w;

    return this;

  }

  /**
   * Sets the x and y components of the vector at the given index.
   *
   * @param index - The index into the buffer attribute
   * @param x - The x component
   * @param y - The y component
   * @returns A reference to this instance
   */
  public setXY(index: number, x: number, y: number): this {

    index *= this.itemSize;

    if (this.normalized) {

      x = normalize(x, this.array);
      y = normalize(y, this.array);

    }

    this.array[index + 0] = x;
    this.array[index + 1] = y;

    return this;
  }

  /**
   * Sets the x, y, and z components of the vector at the given index.
   *
   * @param index - The index into the buffer attribute
   * @param x - The x component
   * @param y - The y component
   * @param z - The z component
   * @returns A reference to this instance
   */
  public setXYZ(index: number, x: number, y: number, z: number): this {

    index *= this.itemSize;

    if (this.normalized) {

      x = normalize(x, this.array);
      y = normalize(y, this.array);
      z = normalize(z, this.array);

    }

    this.array[index + 0] = x;
    this.array[index + 1] = y;
    this.array[index + 2] = z;

    return this;

  }

  /**
   * Sets the x, y, z, and w components of the vector at the given index.
   *
   * @param index - The index into the buffer attribute
   * @param x - The x component
   * @param y - The y component
   * @param z - The z component
   * @param w - The w component
   * @returns A reference to this instance
   */
  public setXYZW(index: number, x: number, y: number, z: number, w: number): this {

    index *= this.itemSize;

    if (this.normalized) {

      x = normalize(x, this.array);
      y = normalize(y, this.array);
      z = normalize(z, this.array);
      w = normalize(w, this.array);

    }

    this.array[index + 0] = x;
    this.array[index + 1] = y;
    this.array[index + 2] = z;
    this.array[index + 3] = w;

    return this;

  }

  /**
   * Flag to indicate this attribute has changed and should be re-sent to the GPU
   *
   * @remarks
   * Set this to true when you modify the value of the array
   */
  public set needsUpdate(value: boolean) {

    if (value === true) this.version++;

  }

  /**
   * Sets the usage of this buffer attribute.
   *
   * @param value - The usage to set
   * @returns A reference to this attribute
   */
  public setUsage(value: BufferUsage): this {

    this.usage = value;

    return this;

  }

  /**
   * Adds a range of data in the array to be updated on the GPU
   *
   * @param start - Position at which to start updating
   * @param count - The number of components to update
   */
  public addUpdateRange(start: number, count: number): void {

    this.updateRanges.push({ start, count });

  }

  /**
   * Clears the update ranges array
   */
  public clearUpdateRanges(): void {

    this.updateRanges.length = 0;

  }

  /**
   * Copies the values of the given buffer attribute to this instance.
   *
   * @param source - The buffer attribute to copy from
   * @returns A reference to this instance
   */
  public copy(source: BufferAttribute): this {

    this.name = source.name;
    // this.array = new source.array.constructor(source.array);
    this.array = source.array;
    this.itemSize = source.itemSize;
    this.count = source.count;
    this.normalized = source.normalized;
    this.version = source.version;

    this.usage = source.usage;
    this.gpuType = source.gpuType;

    return this;
  }

  /**
   * Copies a vector from the given buffer attribute to this buffer.
   *
   * @remarks
   * The start and destination position in the attribute are represented by
   * the given indices
   *
   * @param index1 - The destination index into this buffer attribute
   * @param attribute - The source buffer attribute
   * @param index2 - The source index into the source buffer attribute
   * @returns A reference to this buffer attribute
   */
  public copyAt(index1: number, attribute: BufferAttribute, index2: number): this {

    index1 *= this.itemSize;
    index2 *= attribute.itemSize;

    for (let i = 0, l = this.itemSize; i < l; i++) {

      this.array[index1 + i] = attribute.array[index2 + i];

    }

    return this;

  }

  /**
   * Copies the given array data into this buffer attribute.
   *
   * @param array - The array to copy
   * @returns A reference to this instance
   */
  public copyArray(array: AnyTypedArray): this {

    this.array.set(array);

    return this;

  }

  /**
   * Applies the given 3x3 matrix to the given attribute
   *
   * @remarks
   * Works with item sizes of 2 and 3
   *
   * @param m - The matrix to apply
   * @returns A reference to this instance
   */
  public applyMatrix3(m: Matrix3): this {

    if (this.itemSize === 2) {

      for (let i = 0, l = this.count; i < l; i++) {

        _vector2.fromBufferAttribute(this, i);
        _vector2.applyMatrix3(m);

        this.setXY(i, _vector2.x, _vector2.y);

      }

    } else if (this.itemSize === 3) {

      for (let i = 0, l = this.count; i < l; i++) {

        _vector.fromBufferAttribute(this, i);
        _vector.applyMatrix3(m);

        this.setXYZ(i, _vector.x, _vector.y, _vector.z);

      }

    }

    return this;

  }

  /**
   * Applies the given 4x4 matrix to the given attribute. Only works with item size of 3.
   *
   * @param m - The matrix to apply
   * @returns A reference to this instance
   */
  public applyMatrix4(m: Matrix4): this {

    for (let i = 0, l = this.count; i < l; i++) {

      _vector.fromBufferAttribute(this, i);

      _vector.applyMatrix4(m);

      this.setXYZ(i, _vector.x, _vector.y, _vector.z);

    }

    return this;

  }

  /**
   * Applies the given 3x3 normal matrix to the given attribute. Only works for item size 3
   *
   * @param m - The normal matrix to apply
   * @returns A reference to this instance
   */
  public applyNormalMatrix(m: Matrix3): this {

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
   * @param m - Tha matrix to apply
   * @returns A reference to this instance
   */
  public transformDirection(m: Matrix4): this {

    for (let i = 0, l = this.count; i < l; i++) {

      _vector.fromBufferAttribute(this, i);

      _vector.transformDirection(m);

      this.setXYZ(i, _vector.x, _vector.y, _vector.z);

    }

    return this;

  }

  /**
   * Sets the given callback function that is execute after the renderer has transfered
   * the attribute array data to the GPU.
   *
   * @remarks
   * Can be used to perform clean-up oprations after the upload when attribute data are
   * not needed anymore on the CPU side
   *
   * @param callback - The callback function
   * @returns A reference to this instance
   */
  public onUpload(callback: () => void): this {

    this.onUploadCallback = callback;

    return this;

  }

  // TODO: check if onUploadCalblack(): void {} is correct or if it should be
  // public onUploadCallback: (() => void) | null = null; which actually
  // seems more correct
  /**
   * A callback function that is executed after the renderer has transfered the attribute
   * array data to the GPU
   */
  public onUploadCallback(): void { }

  /**
   * Returns a new buffer attribute with copied values from this instance.
   *
   * @returns A clone of this instance
   */
  public clone(): BufferAttribute {

    return new BufferAttribute(this.array, this.itemSize).copy(this);

  }

  /**
   * Serialzes the buffer attribute to a JSON object.
   *
   * @returns The serialized buffer attribute
   */
  public toJSON(): any {

    type SerializedBufferAttribute = {
      itemSize: number;
      type: string;
      array: number[];
      normalized: boolean;
      name?: string;
      usage?: number;
    };

    const data: SerializedBufferAttribute = {
      itemSize: this.itemSize,
      type: this.array.constructor.name,
      array: Array.from(this.array),
      normalized: this.normalized
    };

    if (this.name !== '') data.name = this.name;
    if (this.usage !== StaticDrawUsage) data.usage = this.usage;

    return data;

  }

}

/**
 * Convenient class that can be used when creating a Int8 buffer attribute
 * with a plain Array instance
 *
 * @augments BufferAttribute
 */
export class Int8BufferAttribute extends BufferAttribute {
  /**
   * Contructs a new Int8 buffer attribute
   *
   * @param array - The array holding the attribute data
   * @param itemSize - The item size
   * @param normalized - Whether the data is normalized or not
   */
  constructor(array: number[] | Int8Array, itemSize: number, normalized: boolean = false) {

    super(new Int8Array(array), itemSize, normalized);

  }

}

/**
 * Convenient class that can be used when creating a Uint8 buffer attribute
 * with a plain Array instance
 *
 * @augments BufferAttribute
 */
export class Uint8BufferAttribute extends BufferAttribute {
  /**
   * Constructs a new Uint8 buffer attribute
   *
   * @param array - The array holding the attribute data
   * @param itemSize - The item size
   * @param normalized - Whether the data is normalized or not
   */
  constructor(array: number[] | Uint8Array, itemSize: number, normalized: boolean = false) {

    super(new Uint8Array(array), itemSize, normalized);

  }

}

/**
 * Convenient class that can be used when creating a Uint8Clamped buffer attribute with
 * a plain Array instance
 *
 * @augments BufferAttribute
 */
export class Uint8ClampedBufferAttribute extends BufferAttribute {
  /**
   * Constructs a new Uint8Clamped buffer attribute
   *
   * @param array - The array holding the attribute data
   * @param itemSize - The item size
   * @param normalized - Whether the data is normalized or not
   */
  constructor(array: number[] | Uint8ClampedArray, itemSize: number, normalized: boolean = false) {

    super(new Uint8ClampedArray(array), itemSize, normalized);

  }

}

/**
 * Convenient class that can be used when creating a Int16 buffer attribute with plain
 * array instance
 *
 * @augments BufferAttribute
 */
export class Int16BufferAttribute extends BufferAttribute {
  /**
   * Constructs a new Int16 buffer attribute
   *
   * @param array - The array holding the attribute data
   * @param itemSize - The item size
   * @param normalized - Whether the data is normalized or not
   */
  constructor(array: number[] | Int16Array, itemSize: number, normalized: boolean = false) {

    super(new Int16Array(array), itemSize, normalized);

  }

}

/**
 * Convenient class that can be used when creating a Uint16 buffer attribute with
 * a plain Array instance
 *
 * @augments BufferAttribute
 */
export class Uint16BufferAttribute extends BufferAttribute {
  /**
   * Constructs a new Uint16 buffer attribute
   *
   * @param array - The array holding the attribute data
   * @param itemSize - The item size
   * @param normalized - Whether the data is normalized or not
   */
  constructor(array: number[] | Uint16Array, itemSize: number, normalized: boolean = false) {

    super(new Uint16Array(array), itemSize, normalized);

  }

}

/**
 * Convenient class that can be used when creating a Int32 buffer attribute with
 * a plain Array instance
 *
 * @augments BufferAttribute
 */
export class Int32BufferAttribute extends BufferAttribute {
  /**
   * Constructs a new Int32 buffer attribute
   *
   * @param array - The array holding the attribute data
   * @param itemSize - The item size
   * @param normalized - Whether the data is normalized or not
   */
  constructor(array: number[] | Int32Array, itemSize: number, normalized: boolean = false) {

    super(new Int32Array(array), itemSize, normalized);

  }

}

/**
 * Convenient class that can be used when creating a Uint32 buffer attribute with
 * a plain Array instance
 *
 * @augments BufferAttribute
 */
export class Uint32BufferAttribute extends BufferAttribute {
  /**
   * Constructs a new Uint32 buffer attribute
   *
   * @param array - The array holding the attribute data
   * @param itemSize - The item size
   * @param normalized - Whether the data is normalized or not
   */
  constructor(array: number[] | Uint32Array, itemSize: number, normalized: boolean = false) {

    super(new Uint32Array(array), itemSize, normalized);

  }

}

/**
 * Convenient class that can be used when creating a Float16 buffer attribute with
 * a plain Array instance
 *
 * @augments BufferAttribute
 */
export class Float16BufferAttribute extends BufferAttribute {
  /**
   * Constructs a new Float16 buffer attribute
   *
   * @param array - The array holding the attribute data
   * @param itemSize - The item size
   * @param normalized - Whether the data is normalized or not
   */
  constructor(array: number[] | Uint16Array, itemSize: number, normalized: boolean = false) {

    super(new Uint16Array(array), itemSize, normalized);

  }

  public getX(index: number): number {

    let x = fromHalfFloat(this.array[index * this.itemSize]);

    if (this.normalized) x = denormalize(x, this.array);

    return x;

  }

  public setX(index: number, x: number): this {

    if (this.normalized) x = normalize(x, this.array);

    this.array[index * this.itemSize] = toHalfFloat(x);

    return this;

  }

  public getY(index: number): number {

    let y = fromHalfFloat(this.array[index * this.itemSize + 1]);

    if (this.normalized) y = denormalize(y, this.array);

    return y;

  }

  public setY(index: number, y: number): this {

    if (this.normalized) y = normalize(y, this.array);

    this.array[index * this.itemSize + 1] = toHalfFloat(y);

    return this;

  }

  public getZ(index: number): number {

    let z = fromHalfFloat(this.array[index * this.itemSize + 2]);

    if (this.normalized) z = denormalize(z, this.array);

    return z;

  }

  public setZ(index: number, z: number): this {

    if (this.normalized) z = normalize(z, this.array);

    this.array[index * this.itemSize + 2] = toHalfFloat(z);

    return this;

  }

  public getW(index: number): number {

    let w = fromHalfFloat(this.array[index * this.itemSize + 3]);

    if (this.normalized) w = denormalize(w, this.array);

    return w;

  }

  public setW(index: number, w: number): this {

    if (this.normalized) w = normalize(w, this.array);

    this.array[index * this.itemSize + 3] = toHalfFloat(w);

    return this;

  }

  public setXY(index: number, x: number, y: number): this {

    index *= this.itemSize;

    if (this.normalized) {

      x = normalize(x, this.array);
      y = normalize(y, this.array);

    }

    this.array[index + 0] = toHalfFloat(x);
    this.array[index + 1] = toHalfFloat(y);

    return this;

  }

  public setXYZ(index: number, x: number, y: number, z: number): this {

    index *= this.itemSize;

    if (this.normalized) {

      x = normalize(x, this.array);
      y = normalize(y, this.array);
      z = normalize(z, this.array);

    }

    this.array[index + 0] = toHalfFloat(x);
    this.array[index + 1] = toHalfFloat(y);
    this.array[index + 2] = toHalfFloat(z);

    return this;

  }

  public setXYZW(index: number, x: number, y: number, z: number, w: number): this {

    index *= this.itemSize;

    if (this.normalized) {

      x = normalize(x, this.array);
      y = normalize(y, this.array);
      z = normalize(z, this.array);
      w = normalize(w, this.array);

    }

    this.array[index + 0] = toHalfFloat(x);
    this.array[index + 1] = toHalfFloat(y);
    this.array[index + 2] = toHalfFloat(z);
    this.array[index + 3] = toHalfFloat(w);

    return this;

  }

}

/**
 * Convenient class that can be used when creating a Float32 buffer attribute with
 * a plain Array instance
 *
 * @augments BufferAttribute
 */
export class Float32BufferAttribute extends BufferAttribute {
  /**
   * Constructs a new Float32 buffer attribute
   *
   * @param array - The array holding the attribute data
   * @param itemSize - The item size
   * @param normalized - Whether the data is normalized or not
   */
  constructor(array: number[] | Float32Array, itemSize: number, normalized: boolean = false) {

    super(new Float32Array(array), itemSize, normalized);

  }

}
