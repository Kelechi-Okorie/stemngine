import { Curve } from '../core/Curve';
import { CubicBezier } from '../core/Interpolations';
import { Vector2 } from '../../math/Vector2';

/**
 * A curve representing a 2D Cubic Bezier curve.
 *
 * ```js
 * const curve = new CubicBezierCurve(
 * 	new Vector2( - 0, 0 ),
 * 	new Vector2( - 5, 15 ),
 * 	new Vector2( 20, 15 ),
 * 	new Vector2( 10, 0 )
 * );
 *
 * const points = curve.getPoints( 50 );
 * const geometry = new BufferGeometry().setFromPoints( points );
 *
 * const material = new LineBasicMaterial( { color: 0xff0000 } );
 *
 * // Create the final object to add to the scene
 * const curveObject = new Line( geometry, material );
 * ```
 *
 * @augments Curve
 */
export class CubicBezierCurve extends Curve<Vector2> {

  /**
   * This flag can be used for type testing.
   *
   */
  public readonly isCubicBezierCurve: boolean = true;

  public type = 'CubicBezierCurve';

  /**
   * The start point.
   *
   * @type {Vector2}
   */
  public v0: Vector2;

  /**
   * The first control point.
   *
   * @type {Vector2}
   */
  public v1: Vector2;

  /**
   * The second control point.
   *
   * @type {Vector2}
   */
  public v2: Vector2;

  /**
   * The end point.
   *
   * @type {Vector2}
   */
  public v3: Vector2;

  /**
   * Constructs a new Cubic Bezier curve.
   *
   * @param [v0] - The start point.
   * @param [v1] - The first control point.
   * @param [v2] - The second control point.
   * @param [v3] - The end point.
   */
  constructor(
    v0 = new Vector2(),
    v1 = new Vector2(),
    v2 = new Vector2(),
    v3 = new Vector2()
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
  public getPoint(t: number, optionalTarget = new Vector2()): Vector2 {

    const point = optionalTarget;

    const v0 = this.v0, v1 = this.v1, v2 = this.v2, v3 = this.v3;

    point.set(
      CubicBezier(t, v0.x, v1.x, v2.x, v3.x),
      CubicBezier(t, v0.y, v1.y, v2.y, v3.y)
    );

    return point;

  }

  public copy(source: CubicBezierCurve): this {

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

  public fromJSON(json: any): this {

    super.fromJSON(json);

    this.v0.fromArray(json.v0);
    this.v1.fromArray(json.v1);
    this.v2.fromArray(json.v2);
    this.v3.fromArray(json.v3);

    return this;

  }

}
