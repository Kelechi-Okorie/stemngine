import { BufferAttribute } from "./BufferAttribute";

/**
 * An alternative version of a buffer attribute with more control over the VBO
 *
 * @remarks
 * The renderer does not construct a VBO for this kind of attribute. Instead, it uses
 * whatever VBO is passed in constructor and can later be altered via the buffer property
 *
 * The most common use case for this class is when so me kind of GPGPU calculation
 * interferes  or even produces the VBOs in question
 *
 * Notice that this class can only be used with {@link WebGLRenderer}
 */
export class GLBufferAttribute {
  /**
   * This flag can be used for type testing.
   *
   * @type {boolean}
   * @readonly
   * @default true
   */
  public readonly isGLBufferAttribute: boolean = true;

  /**
   * The name of the buffer attribute
   */
  public name: string = '';

  /**
   * The native WebGL buffer
   */
  public buffer: WebGLBuffer;

  /**
   * The native data type
   */
  public type: number;

  /**
   * The item size, see {@link BufferAttribute.itemSize}
   */
  public itemSize: number;

  /**
   * The corresponding size (in bytes) of the given type parameter
   */
  public elementSize: number;

  /**
   * The expected number of vertices in the VBO
   */
  public count: number;

  /**
   * Applies to integer data only
   *
   * @remarks
   * Indicates how the underlying data in the buffer maps to the values in the GLSL
   * shader code. For instance, if buffer contains data of gl.UNSIGNED_SHORT,
   * and normalized is true, the value 0 - 65535 in the buffer data will be mapped to
   * 0.0f - +1.0f in the GLSL attribute. If normalized is false, the value will be
   * converted to float unmodified, i.e. 65535 becomes 65535.0f
   */
  public normalized: boolean;

  /**
   * A vertion number, incremented every time the needsUpdate is set to true
   */
  public version: number = 0;

  /**
   * Constructs a new GL buffer attribute
   *
   * @param buffer - The native WebGL buffer
   * @param type - The native data type
   * @param itemSize - The item size, see {@link BufferAttribute.itemSize}
   * @param elementSize - The corresponding size (in bytes) of the given type parameter
   * @param count - The expected number of vertices in the VBO
   * @param normalized - Whether the data is normalized (applies to integer data only)
   */
  constructor(buffer: WebGLBuffer, type: number, itemSize: number, elementSize: number, count: number, normalized: boolean = false) {
    this.buffer = buffer;
    this.type = type;
    this.itemSize = itemSize;
    this.elementSize = elementSize;
    this.count = count;
    this.normalized = normalized;
  }

  /**
   * Flag to indicate that this attribute has changed and should be re-sent
   * to the GPU. Set this to true when you modify the value of the array
   */
  public set needsUpdate(value: boolean) {
    if (value === true) this.version++;
  }

  /**
   * Sets the given native WebGL buffer
   *
   * @param buffer - The native WebGL buffer
   * @returns A reference to this buffer attribute
   */
  public setBuffer(buffer: WebGLBuffer): WebGLBuffer {
    this.buffer = buffer;

    return this;
  }

  /**
   * Sets the given native data type and element suze
   *
   * @param type - The native data type (e.g. gl.FLOAT)
   * @param elementSize - The corresponding size (in bytes) for the given type parameter
   * @returns A reference to this buffer attribute
   */
  public setType(type: number, elementSize: number): GLBufferAttribute {
    this.type = type;
    this.elementSize = elementSize;

    return this;
  }

  /**
   * Sets the item size
   *
   * @param itemSize - The item size, see {@link BufferAttribute.itemSize}
   * @returns A reference to this buffer attribute
   */
  public setItemSize(itemSize: number): GLBufferAttribute {
    this.itemSize = itemSize;

    return this;
  }

  /**
   * Sets the count (the expected number of vertices in the VBO)
   *
   * @param count - The count
   * @returns A reference to this buffer attribute
   */
  public setCount(count: number): GLBufferAttribute {
    this.count = count;

    return this;
  }
}
