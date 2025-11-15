import { BufferUsage, StaticDrawUsage, GpuType, FloatType, AnyTypedArray } from "../constants";
import {Vector3} from '../math/Vector3';
import {Vector2} from '../math/Vector2';
import {normalize, denormalize} from '../math/MathUtils';

const _vector =  /*@__PURE__*/ new Vector3();
const _vector2 = /*__PURE__*/ new Vector2();

let _id = 0;

/**
 * This class stored data for an attribute (such as vertex position, face indeces,
 * normals, colors, UVs, and any custom attributes) associated with a geometry,
 * which allows for more efficent passing of data to the GPU.
 *
 * @remarks
 * When working with vector-like data, the `fromBufferAtribute (attribute, index)`
 * helper methods on vector, quaternion and color class might be helpful E.g.
 * {@link Vector3#fromBufferAttribute}, {@link Quaternion#fromBufferAttribute}
 */
export class BufferAttribute {
  /**
   * This flag can be used for type testing
   *
   * @readonly
   * @default true
   */
  public isBufferAttribute: boolean = true;

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
   * the values in the GLSL code. For instance, if `array' is an instance of `UInt16Array`,
   * and `normalized` is `true`, the values `0 - +65535` in the array data will be mapped to
   * `0.0f - +1.0f` in the GLSL attribute. If `normali
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
   * Use the `addUpdateRage()` function to add ranges to this array.
   *
   * @type {Array<Object>}
   */
  public updateRanges: object[] = [];

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
   * Constructs a new buffer attribure
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
   * Sets the given array data in the buffer attribure.
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
}
