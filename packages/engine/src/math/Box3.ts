import { BufferAttribute } from "../core/BufferAttribute";
import { InterleavedBufferAttribute } from "../core/InterleavedBufferAttribute";
import { Vector3 } from "./Vector3";

/**
 * Represents an axis-aligned bounding box in 3D space.
 */
export class Box3 {
  /**
   * this flag can be used for type testing.
   *
   * @type {boolean}
   * @readonly
   * @defaultValue true
 */
  public readonly isBox3: boolean = true;

  /**
   * The lower boundary of the box
   */
  public min: Vector3;

  /**
   * The upper boundary of the box
   */
  public max: Vector3;

  /**
   * Constructs a new bounding box
   *
   * @param min - A vector representing the lower boundary of the box
   * @param max - A vector representing the upper boundary of the box
   */
  constructor(min?: Vector3, max?: Vector3) {
    this.min = (min !== undefined) ? min : new Vector3(+Infinity, +Infinity, +Infinity);
    this.max = (max !== undefined) ? max : new Vector3(-Infinity, -Infinity, -Infinity);
  }




  /**
   * Sets the lower and upper boundaries of this box
   *
   * @remarks
   * Please note that this method only copies values from the given objects
   *
   * @param min - A vector representing the lower boundary of the box
   * @param max - A vector representing the upper boundary of the box
   * @returns A reference to this box
   */
  public set(min: Vector3, max: Vector3): Box3 {
    this.min.copy(min);
    this.max.copy(max);

    return this;
  }

  /**
   * Expands the boundaries of this box to include the given piont
   *
   * @param point - A point that should be included by the bounding box
   * @returns A reference to this box
   */
  public expandByPoint(point: Vector3): Box3 {
    this.min.min(point);
    this.max.max(point);

    return this;
  }

  /**
   * Sets the upper and lower bounds of this box so it encloses the position data
   * in the given buffer attribute
   *
   * @param attribute - A buffer attribute holding the 3D position data
   * @returns A reference to this box
   */
  public setFromBufferAttribute(attribute: BufferAttribute | InterleavedBufferAttribute): Box3 {
    this.makeEmpty();

    for (let i = 0, il = attribute.count; i < il; i++) {

      this.expandByPoint(_vector.fromBufferAttribute(attribute, i));

    }

    return this;

  }

  /**
   * Makes this box empty which means it encloses a zero space in 3D
   *
   * @returns A reference to this box
   */
  public makeEmpty(): Box3 {
    this.min.x = this.min.y = this.min.z = + Infinity;
    this.max.x = this.max.y = this.max.z = - Infinity;

    return this;
  }

  /**
   * Returns true if this box includes zero points within its bounds
   *
   * @remarks
   * Note that a box with equal lower and upper boundaries still includes
   * one point, the one both bounds share
   *
   * @returns Whether this box is empty
   */
  public isEmpty(): boolean {
    // this is a more robust check for empty than ( volume <= 0 ) because volume can get positive with two negative axes

    return (this.max.x < this.min.x) || (this.max.y < this.min.y) || (this.max.z < this.min.z);
  }

  /**
   * returns the center point of this box
   *
   * @param target - The target vector that is used to store the method's result
   * @returns The center point
   */
  public getCenter(target: Vector3): Vector3 {
    return this.isEmpty() ? target.set(0, 0, 0) : target.addVectors(this.min, this.max).multiplyScalar(0.5);
  }

  /**
 * Returns `true` if the given point lies within or on the boundaries of this box.
 *
 * @param point - The point to test.
 * @return Whether the bounding box contains the given point or not.
 */
  public containsPoint(point: Vector3): boolean {

    return point.x >= this.min.x && point.x <= this.max.x &&
      point.y >= this.min.y && point.y <= this.max.y &&
      point.z >= this.min.z && point.z <= this.max.z;

  }

  /**
   * Returns true if this bounding box is equal with the given one
   *
   * @param box - The box to compare with
   * @returns Whether this bounding box is equal with the given one
   */
  public equals(box: Box3): boolean {
    return box.min.equals(this.min) && box.max.equals(this.max);
  }

  /**
   * Copies the values of the given box to this instance
   *
   * @param box - The box to copy
   * @returns A reference to this box
   */
  public copy(box: Box3): Box3 {
    this.min.copy(box.min);
    this.max.copy(box.max);

    return this;
  }

  /**
   * Returns a new box with copied values from this instance
   *
   * @returns A clone of this instance
   */
  public clone(): Box3 {
    return new Box3().copy(this);
  }
}

const _points = [
	/*@__PURE__*/ new Vector3(),
	/*@__PURE__*/ new Vector3(),
	/*@__PURE__*/ new Vector3(),
	/*@__PURE__*/ new Vector3(),
	/*@__PURE__*/ new Vector3(),
	/*@__PURE__*/ new Vector3(),
	/*@__PURE__*/ new Vector3(),
	/*@__PURE__*/ new Vector3()
];

const _vector = /*@__PURE__*/ new Vector3();

const _box = /*@__PURE__*/ new Box3();

// triangle centered vertices

const _v0 = /*@__PURE__*/ new Vector3();
const _v1 = /*@__PURE__*/ new Vector3();
const _v2 = /*@__PURE__*/ new Vector3();

// triangle edge vectors

const _f0 = /*@__PURE__*/ new Vector3();
const _f1 = /*@__PURE__*/ new Vector3();
const _f2 = /*@__PURE__*/ new Vector3();

const _center = /*@__PURE__*/ new Vector3();
const _extents = /*@__PURE__*/ new Vector3();
const _triangleNormal = /*@__PURE__*/ new Vector3();
const _testAxis = /*@__PURE__*/ new Vector3();

