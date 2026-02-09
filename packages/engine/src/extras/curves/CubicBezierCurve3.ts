import { Curve } from '../core/Curve';
import { CubicBezier } from '../core/Interpolations';
import { Vector3 } from '../../math/Vector3';

/**
 * A curve representing a 3D Cubic Bezier curve.
 *
 * @augments Curve
 */
export class CubicBezierCurve3 extends Curve<Vector3> {

  /**
   * This flag can be used for type testing.
   *
   * @type {boolean}
   * @readonly
   * @default true
   */
  public isCubicBezierCurve3: boolean = true;

  public type: string = 'CubicBezierCurve3';

  /**
   * The start point.
   *
   * @type {Vector3}
   */
  public v0: Vector3;

  /**
   * The first control point.
   *
   * @type {Vector3}
   */
  public v1: Vector3;

  /**
   * The second control point.
   *
   * @type {Vector3}
   */
  public v2: Vector3;

  /**
   * The end point.
   *
   * @type {Vector3}
   */
  public v3: Vector3;

  /**
   * Constructs a new Cubic Bezier curve.
   *
   * @param [v0] - The start point.
   * @param [v1] - The first control point.
   * @param [v2] - The second control point.
   * @param [v3] - The end point.
   */
  constructor(
    v0 = new Vector3(),
    v1 = new Vector3(),
    v2 = new Vector3(),
    v3 = new Vector3()
  ) {

    super();

    this.v0 = v0;

    this.v1 = v1;

    this.v2 = v2;

    this.v3 = v3;

  }

  /**
   * Returns a point on the curve.
   *
   * @param t - A interpolation factor representing a position on the curve. Must be in the range `[0,1]`.
   * @param [optionalTarget] - The optional target vector the result is written to.
   * @return The position on the curve.
   */
  public getPoint(t: number, optionalTarget = new Vector3()) {

    const point = optionalTarget;

    const v0 = this.v0, v1 = this.v1, v2 = this.v2, v3 = this.v3;

    point.set(
      CubicBezier(t, v0.x, v1.x, v2.x, v3.x),
      CubicBezier(t, v0.y, v1.y, v2.y, v3.y),
      CubicBezier(t, v0.z, v1.z, v2.z, v3.z)
    );

    return point;

  }

  public copy(source: CubicBezierCurve3) {

    super.copy(source);

    this.v0.copy(source.v0);
    this.v1.copy(source.v1);
    this.v2.copy(source.v2);
    this.v3.copy(source.v3);

    return this;

  }

  public toJSON() {

    const data = super.toJSON();

    data.v0 = this.v0.toArray();
    data.v1 = this.v1.toArray();
    data.v2 = this.v2.toArray();
    data.v3 = this.v3.toArray();

    return data;

  }

  public fromJSON(json: any) {

    super.fromJSON(json);

    this.v0.fromArray(json.v0);
    this.v1.fromArray(json.v1);
    this.v2.fromArray(json.v2);
    this.v3.fromArray(json.v3);

    return this;

  }

}
