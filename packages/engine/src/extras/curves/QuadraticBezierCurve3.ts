import { Curve } from '../core/Curve';
import { QuadraticBezier } from '../core/Interpolations';
import { Vector3 } from '../../math/Vector3';

/**
 * A curve representing a 3D Quadratic Bezier curve.
 *
 * @augments Curve
 */
export class QuadraticBezierCurve3 extends Curve {

  /**
   * This flag can be used for type testing.
   *
   * @type {boolean}
   * @readonly
   * @default true
   */
  public readonly isQuadraticBezierCurve3: boolean = true;

  public type: string = 'QuadraticBezierCurve3';

  /**
   * The start point.
   *
   * @type {Vector3}
   */
  public v0: Vector3;

  /**
   * The control point.
   *
   * @type {Vector3}
   */
  public v1: Vector3;

  /**
   * The end point.
   *
   * @type {Vector3}
   */
  public v2: Vector3;

  /**
   * Constructs a new Quadratic Bezier curve.
   *
   * @param [v0] - The start point.
   * @param [v1] - The control point.
   * @param [v2] - The end point.
   */
  constructor(v0 = new Vector3(), v1 = new Vector3(), v2 = new Vector3()) {

    super();

    this.v0 = v0;

    this.v1 = v1;

    this.v2 = v2;

  }

  /**
   * Returns a point on the curve.
   *
   * @param t - A interpolation factor representing a position on the curve. Must be in the range `[0,1]`.
   * @param [optionalTarget] - The optional target vector the result is written to.
   * @return The position on the curve.
   */
  public getPoint(t: number, optionalTarget = new Vector3()): Vector3 {

    const point = optionalTarget;

    const v0 = this.v0, v1 = this.v1, v2 = this.v2;

    point.set(
      QuadraticBezier(t, v0.x, v1.x, v2.x),
      QuadraticBezier(t, v0.y, v1.y, v2.y),
      QuadraticBezier(t, v0.z, v1.z, v2.z)
    );

    return point;

  }

  public copy(source: QuadraticBezierCurve3): this {

    super.copy(source);

    this.v0.copy(source.v0);
    this.v1.copy(source.v1);
    this.v2.copy(source.v2);

    return this;

  }

  public toJSON() {

    const data = super.toJSON();

    data.v0 = this.v0.toArray();
    data.v1 = this.v1.toArray();
    data.v2 = this.v2.toArray();

    return data;

  }

  public fromJSON(json: any) {

    super.fromJSON(json);

    this.v0.fromArray(json.v0);
    this.v1.fromArray(json.v1);
    this.v2.fromArray(json.v2);

    return this;

  }

}
