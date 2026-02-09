import { Vector3 } from '../../math/Vector3';
import { Curve } from '../core/Curve';

/**
 * A curve representing a 3D line segment.
 *
 * @augments Curve
 */
export class LineCurve3 extends Curve<Vector3> {

  /**
   * This flag can be used for type testing.
   *
   */
  public readonly isLineCurve3: boolean = true;

  public type: string = 'LineCurve3';

  /**
    * The start point.
    *
    * @type {Vector3}
    */
  public v1: Vector3;

  /**
   * The end point.
   *
   * @type {Vector2}
   */
  public v2: Vector3;

  /**
   * Constructs a new line curve.
   *
   * @param [v1] - The start point.
   * @param [v2] - The end point.
   */
  constructor(v1 = new Vector3(), v2 = new Vector3()) {

    super();

    this.v1 = v1;

    this.v2 = v2;

  }

  /**
   * Returns a point on the line.
   *
   * @param t - A interpolation factor representing a position on the line. Must be in the range `[0,1]`.
   * @param [optionalTarget] - The optional target vector the result is written to.
   * @return The position on the line.
   */
  public getPoint(t: number, optionalTarget = new Vector3()) {

    const point = optionalTarget;

    if (t === 1) {

      point.copy(this.v2);

    } else {

      point.copy(this.v2).sub(this.v1);
      point.multiplyScalar(t).add(this.v1);

    }

    return point;

  }

  // Line curve is linear, so we can overwrite default getPointAt
  public getPointAt(u: number, optionalTarget: Vector3) {

    return this.getPoint(u, optionalTarget);

  }

  public getTangent(t: number, optionalTarget = new Vector3()) {

    return optionalTarget.subVectors(this.v2, this.v1).normalize();

  }

  public getTangentAt(u: number, optionalTarget: Vector3) {

    return this.getTangent(u, optionalTarget);

  }

  public copy(source: LineCurve3): this {

    super.copy(source);

    this.v1.copy(source.v1);
    this.v2.copy(source.v2);

    return this;

  }

  public toJSON() {

    const data = super.toJSON();

    data.v1 = this.v1.toArray();
    data.v2 = this.v2.toArray();

    return data;

  }

  public fromJSON(json: any): this {

    super.fromJSON(json);

    this.v1.fromArray(json.v1);
    this.v2.fromArray(json.v2);

    return this;

  }

}

export function isLineCurve3(curve: Curve<any>): curve is LineCurve3 {
  return (curve as any).isLineCurve3 === true;
}
