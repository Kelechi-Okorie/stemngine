import { Matrix3 } from './Matrix3';
import { Matrix4 } from './Matrix4';
import { Sphere } from './Sphere';
import { Vector3 } from './Vector3';
import { Line3 } from './Line3';
import { Box3 } from './Box3';

const _vector1 = /*@__PURE__*/ new Vector3();
const _vector2 = /*@__PURE__*/ new Vector3();
const _normalMatrix = /*@__PURE__*/ new Matrix3();

/**
 * A 2 dimensional surface that extends infinitely in 3D space, represented in
 * [Hesian normal form] {@link http://mathworld.wolfram.com/HessianNormalForm.html}
 * by a unit length normal vector and a constant
 */
export class Plane {
  /**
 * This flag can be used for type testing.
 *
 * @type {boolean}
 * @readonly
 * @default true
 */
  public isPlane: boolean = true;

  /**
   * A unit length vector defining the normal of the plane.
   *
   * @type {Vector3}
   */
  public normal: Vector3;

  /**
   * The signed distance from the origin to the plane.
   *
   * @type {number}
   * @default 0
   */
  public constant: number = 0;

  /**
   * Constructs a new plane.
   *
   * @param normal - A unit length vector defining plane's normal
   * @param constant - The signed distance from the origin to the plane
   */
  constructor(normal: Vector3 = new Vector3(1, 0, 0), constant: number = 0) {
    this.normal = normal;
    this.constant = constant;
  }

  /**
   * Sets the plane components by copying the given values
   *
   * @param normal - A unit length vector defining plane's normal
   * @param constant - The signed distance from the origin to the plane
   * @returns Th current plane
   */
  public set(normal: Vector3, constant: number): Plane {
    this.normal.copy(normal);
    this.constant = constant;

    return this;
  }

  /**
   * Sets the planes components by defining x, y, z as the plane normal
   * and w as the constant
   *
   * @param x - The x component of the plane normal
   * @param y - The y component of the plane normal
   * @param z - The z component of the plane normal
   * @param w - The constant of the plane
   * @returns The current plane
   */
  public setComponents(x: number, y: number, z: number, w: number): Plane {
    this.normal.set(x, y, z);
    this.constant = w;

    return this;
  }

  /**
   * Sets the plane from the given normal and coplanar point (this is a point
   * that lies onto the plane)
   *
   * @param normal - The normal
   * @param point - A coplanar point
   * @returns A reference to this plane
   */
  public setFromNormalAndCoplanarPoint(normal: Vector3, point: Vector3): this {
    this.normal.copy(normal);
    this.constant = -point.dot(this.normal);

    return this;
  }

  /**
   * Sets the plane from 3 coplanar points
   *
   * @remarks
   * The winding order is assumed to be counter-clockwise, and determines the
   * direction of the plane normal
   *
   * @param a - The first coplanar point
   * @param b - The second coplanar point
   * @param c - The third coplanar point
   * @returns A reference to this plane
   */
  public setFromCoplanarPoints(a: Vector3, b: Vector3, c: Vector3): this {
    const normal = _vector1.subVectors(c, b).cross(_vector2.subVectors(a, b)).normalize();

    // Q: should an error be thrown if normal is zero (e.g. degenerate plane)?

    this.setFromNormalAndCoplanarPoint(normal, a);

    return this;
  }

  /**
   * Normalize the plane normal and adjusts the constant accordingly
   *
   * @returns A reference to this plane
   */
  public normalize(): this {
    // Note: will lead to a divide by zero if the plane is invalid.

    const inverseNormalLength = 1.0 / this.normal.length();
    this.normal.multiplyScalar(inverseNormalLength);
    this.constant *= inverseNormalLength;

    return this;
  }

  /**
   * Negates both plane normal and the constant
   *
   * @returns A reference to this plane
   */
  public negate(): this {
    this.constant *= -1;
    this.normal.negate();

    return this;
  }

  /**
   * Returns the signed distance from the given point to thie plane
   *
   * @param point - The point to compute the distance for
   * @returns The signed distance
   */
  public distanceToPoint(point: Vector3): number {
    return this.normal.dot(point) + this.constant;
  }

  /**
   * Returns the signed distance from the given sphere to this plane
   *
   * @param sphere - The sphere to compute the distance for
   * @returns The signed distance
   */
  public distanceToSphere(sphere: Sphere): number {
    return this.distanceToPoint(sphere.center) - sphere.radius;
  }

  /**
   * Projects a given point onto the plane
   *
   * @param point - The piont to project
   * @param target - Thte target vector that used to store the method's result
   * @returns The projected point on the plane
   */
  public projectPoint(point: Vector3, target: Vector3): Vector3 {
    return target.copy(point).addScaledVector(this.normal, - this.distanceToPoint(point));
  }

  /**
   * Returns the intersection point of the passed line and the plane
   *
   * @remarks
   * Returns null if the line does not intersect
   * Returns the ilne's starting point if the line is coplanar with the plane
   *
   * @param line - The line to compute the intersectin for
   * @param target - The target vector that is used to store the method's result
   * @returns The intersection point
   */
  public intersectLine(line: Line3, target: Vector3): Vector3 | null {
    const direction = line.delta(_vector1);

    const denominator = this.normal.dot(direction);

    if (denominator === 0) {

      // line is coplanar, return origin
      if (this.distanceToPoint(line.start) === 0) {

        return target.copy(line.start);

      }

      // Unsure if this is the correct method to handle this case.
      return null;

    }

    const t = - (line.start.dot(this.normal) + this.constant) / denominator;

    if (t < 0 || t > 1) {

      return null;

    }

    return target.copy(line.start).addScaledVector(direction, t);

  }

  /**
   * Returns true if the given line segment intersects with (passes through)
   * the plane
   *
   * @param line - The line to te st
   * @returns Whether the given line segment intersects with the plane or not
   */
  public intersectsLine(line: Line3): boolean {
    // Note: this tests if a line intersects the plane, not whether it (or its end-points) are coplanar with it.

    const startSign = this.distanceToPoint(line.start);
    const endSign = this.distanceToPoint(line.end);

    return (startSign < 0 && endSign > 0) || (endSign < 0 && startSign > 0);
  }

  /**
   * Returns true if the given bounding box intersect with the plane
   *
   * @param box - The bounding box to test
   * @returns Whether the given bounding box intersects with the plane or not
   */
  public intersectsBox(box: Box3): boolean {
    return box.intersectsPlane(this);
  }

  /**
   * Returns true if the given boundingn sphere intersects with the plane
   *
   * @param sphere - The bonding sphere to tets
   * @returns Whether the given bounding sphere intersects with plane or not
   */
  public intersectsSphere(sphere: Sphere): boolean {
    return sphere.intersectsPlane(this);
  }

  /**
   * Returns a coplanar vector to this plane, by calculating the projection of the
   * normal at the origin onto the plane
   *
   * @param target - The target vector that is used to store the method's result
   * @returns The coplanar point
   */
  public coplanarPoint(target: Vector3): Vector3 {
    return target.copy(this.normal).multiplyScalar(-this.constant);
  }

  /**
   * Apply a 4x4 matrix to the plane
   *
   * @remarks
   * The matrix must be an affine, homogenous transform
   *
   * The optional normal matrix can be pre-computed like so
   * ```ts
   * const optonalNormalMatrix = new Matrix3().getNormalMatrix(matrix);
   * ```
   *
   * @param matrix - The transform matrix
   * @param optionalNormalMatrix - A pre-computed normal matrix.
   * @returns A reference to this plane
   */
  public applyMatrix4(matrix: Matrix4, optionalNormalMatrix?: Matrix3): this {
    const normalMatrix = optionalNormalMatrix || _normalMatrix.getNormalMatrix(matrix);

    const referencePoint = this.coplanarPoint(_vector1).applyMatrix4(matrix);

    const normal = this.normal.applyMatrix3(normalMatrix).normalize();

    this.constant = - referencePoint.dot(normal);

    return this;
  }

  /**
   * Translates the plane by the distance defined by the given offsect vector
   *
   * @remarks
   * This only affects the plane constant and will not affect the normal vector
   *
   * @param offset - The offset vector
   * @returns A reference to this plane
   */
  public translate(offset: Vector3): this {
    this.constant -= offset.dot(this.normal);

    return this;
  }

  /**
   * Returns true if this plane is equal with the given one
   *
   * @param plane - The plane to test for equality
   * @returns Whether this plane is equal with the given one
   */
  public equals(plane: Plane): boolean {
    return plane.normal.equals(this.normal) && (plane.constant === this.constant);
  }

  /**
   * Copies the values of the given plane to this instance
   *
   * @param plane - The plane to copy
   * @returns A referenct to this plane
   */
  public copy(plane: Plane): this {
    this.normal.copy(plane.normal);
    this.constant = plane.constant;

    return this;
  }

  /**
   * Returns a new plane with copied values from this instance
   *
   * @returns A clone of this instance
   */
  public clone() {
    return new Plane().copy(this);
  }

}
