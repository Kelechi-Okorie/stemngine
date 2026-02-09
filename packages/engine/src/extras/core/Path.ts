import { Vector2 } from '../../math/Vector2';
import { CurvePath } from './CurvePath';
import { EllipseCurve } from '../curves/EllipseCurve';
import { SplineCurve } from '../curves/SplineCurve';
import { CubicBezierCurve } from '../curves/CubicBezierCurve';
import { QuadraticBezierCurve } from '../curves/QuadraticBezierCurve';
import { LineCurve } from '../curves/LineCurve';

/**
 * A 2D path representation. The class provides methods for creating paths
 * and contours of 2D shapes similar to the 2D Canvas API.
 *
 * ```js
 * const path = new Path();
 *
 * path.lineTo( 0, 0.8 );
 * path.quadraticCurveTo( 0, 1, 0.2, 1 );
 * path.lineTo( 1, 1 );
 *
 * const points = path.getPoints();
 *
 * const geometry = new BufferGeometry().setFromPoints( points );
 * const material = new LineBasicMaterial( { color: 0xffffff } );
 *
 * const line = new Line( geometry, material );
 * scene.add( line );
 * ```
 *
 * @augments CurvePath
 */
export class Path extends CurvePath<Vector2> {

  /**
   * The current offset of the path. Any new curve added will start here.
   *
   * @type {Vector2}
   */
  public currentPoint: Vector2 = new Vector2();

  /**
   * Constructs a new path.
   *
   * @param {Array<Vector2>} [points] - An array of 2D points defining the path.
   */
  constructor(points?: Vector2[]) {

    super();

    this.type = 'Path';

    if (points) {

      this.setFromPoints(points);

    }

  }

  /**
   * Creates a path from the given list of points. The points are added
   * to the path as instances of {@link LineCurve}.
   *
   * @param {Array<Vector2>} points - An array of 2D points.
   * @return {Path} A reference to this path.
   */
  public setFromPoints(points: Vector2[]): this {

    this.moveTo(points[0].x, points[0].y);

    for (let i = 1, l = points.length; i < l; i++) {

      this.lineTo(points[i].x, points[i].y);

    }

    return this;

  }

  /**
   * Moves {@link Path#currentPoint} to the given point.
   *
   * @param {number} x - The x coordinate.
   * @param {number} y - The y coordinate.
   * @return {Path} A reference to this path.
   */
  public moveTo(x: number, y: number): this {

    this.currentPoint.set(x, y); // TODO consider referencing vectors instead of copying?

    return this;

  }

  /**
   * Adds an instance of {@link LineCurve} to the path by connecting
   * the current point with the given one.
   *
   * @param {number} x - The x coordinate of the end point.
   * @param {number} y - The y coordinate of the end point.
   * @return {Path} A reference to this path.
   */
  public lineTo(x: number, y: number): this {

    const curve = new LineCurve(this.currentPoint.clone(), new Vector2(x, y));
    this.curves.push(curve);

    this.currentPoint.set(x, y);

    return this;

  }

  /**
   * Adds an instance of {@link QuadraticBezierCurve} to the path by connecting
   * the current point with the given one.
   *
   * @param {number} aCPx - The x coordinate of the control point.
   * @param {number} aCPy - The y coordinate of the control point.
   * @param {number} aX - The x coordinate of the end point.
   * @param {number} aY - The y coordinate of the end point.
   * @return {Path} A reference to this path.
   */
  public quadraticCurveTo(aCPx: number, aCPy: number, aX: number, aY: number): this {

    const curve = new QuadraticBezierCurve(
      this.currentPoint.clone(),
      new Vector2(aCPx, aCPy),
      new Vector2(aX, aY)
    );

    this.curves.push(curve);

    this.currentPoint.set(aX, aY);

    return this;

  }

  /**
   * Adds an instance of {@link CubicBezierCurve} to the path by connecting
   * the current point with the given one.
   *
   * @param {number} aCP1x - The x coordinate of the first control point.
   * @param {number} aCP1y - The y coordinate of the first control point.
   * @param {number} aCP2x - The x coordinate of the second control point.
   * @param {number} aCP2y - The y coordinate of the second control point.
   * @param {number} aX - The x coordinate of the end point.
   * @param {number} aY - The y coordinate of the end point.
   * @return {Path} A reference to this path.
   */
  public bezierCurveTo(
    aCP1x: number,
    aCP1y: number,
    aCP2x: number,
    aCP2y: number,
    aX: number,
    aY: number
  ): this {

    const curve = new CubicBezierCurve(
      this.currentPoint.clone(),
      new Vector2(aCP1x, aCP1y),
      new Vector2(aCP2x, aCP2y),
      new Vector2(aX, aY)
    );

    this.curves.push(curve);

    this.currentPoint.set(aX, aY);

    return this;

  }

  /**
   * Adds an instance of {@link SplineCurve} to the path by connecting
   * the current point with the given list of points.
   *
   * @param {Array<Vector2>} pts - An array of points in 2D space.
   * @return {Path} A reference to this path.
   */
  public splineThru(pts: Vector2[]): this {

    const npts = [this.currentPoint.clone()].concat(pts);

    const curve = new SplineCurve(npts);
    this.curves.push(curve);

    this.currentPoint.copy(pts[pts.length - 1]);

    return this;

  }

  /**
   * Adds an arc as an instance of {@link EllipseCurve} to the path, positioned relative
   * to the current point.
   *
   * @param {number} [aX=0] - The x coordinate of the center of the arc offsetted from the previous curve.
   * @param {number} [aY=0] - The y coordinate of the center of the arc offsetted from the previous curve.
   * @param {number} [aRadius=1] - The radius of the arc.
   * @param {number} [aStartAngle=0] - The start angle in radians.
   * @param {number} [aEndAngle=Math.PI*2] - The end angle in radians.
   * @param {boolean} [aClockwise=false] - Whether to sweep the arc clockwise or not.
   * @return {Path} A reference to this path.
   */
  public arc(
    aX: number,
    aY: number,
    aRadius: number,
    aStartAngle: number,
    aEndAngle: number,
    aClockwise: boolean
  ): this {

    const x0 = this.currentPoint.x;
    const y0 = this.currentPoint.y;

    this.absarc(aX + x0, aY + y0, aRadius,
      aStartAngle, aEndAngle, aClockwise);

    return this;

  }

  /**
   * Adds an absolutely positioned arc as an instance of {@link EllipseCurve} to the path.
   *
   * @param {number} [aX=0] - The x coordinate of the center of the arc.
   * @param {number} [aY=0] - The y coordinate of the center of the arc.
   * @param {number} [aRadius=1] - The radius of the arc.
   * @param {number} [aStartAngle=0] - The start angle in radians.
   * @param {number} [aEndAngle=Math.PI*2] - The end angle in radians.
   * @param {boolean} [aClockwise=false] - Whether to sweep the arc clockwise or not.
   * @return {Path} A reference to this path.
   */
  public absarc(
    aX: number,
    aY: number,
    aRadius: number,
    aStartAngle: number,
    aEndAngle: number,
    aClockwise: boolean
  ): this {

    this.absellipse(aX, aY, aRadius, aRadius, aStartAngle, aEndAngle, aClockwise, 0);

    return this;

  }

  /**
   * Adds an ellipse as an instance of {@link EllipseCurve} to the path, positioned relative
   * to the current point
   *
   * @param {number} [aX=0] - The x coordinate of the center of the ellipse offsetted from the previous curve.
   * @param {number} [aY=0] - The y coordinate of the center of the ellipse offsetted from the previous curve.
   * @param {number} [xRadius=1] - The radius of the ellipse in the x axis.
   * @param {number} [yRadius=1] - The radius of the ellipse in the y axis.
   * @param {number} [aStartAngle=0] - The start angle in radians.
   * @param {number} [aEndAngle=Math.PI*2] - The end angle in radians.
   * @param {boolean} [aClockwise=false] - Whether to sweep the ellipse clockwise or not.
   * @param {number} [aRotation=0] - The rotation angle of the ellipse in radians, counterclockwise from the positive X axis.
   * @return {Path} A reference to this path.
   */
  public ellipse(
    aX: number,
    aY: number,
    xRadius: number,
    yRadius: number,
    aStartAngle: number,
    aEndAngle: number,
    aClockwise: boolean,
    aRotation: number
  ): this {

    const x0 = this.currentPoint.x;
    const y0 = this.currentPoint.y;

    this.absellipse(aX + x0, aY + y0, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation);

    return this;

  }

  /**
   * Adds an absolutely positioned ellipse as an instance of {@link EllipseCurve} to the path.
   *
   * @param {number} [aX=0] - The x coordinate of the absolute center of the ellipse.
   * @param {number} [aY=0] - The y coordinate of the absolute center of the ellipse.
   * @param {number} [xRadius=1] - The radius of the ellipse in the x axis.
   * @param {number} [yRadius=1] - The radius of the ellipse in the y axis.
   * @param {number} [aStartAngle=0] - The start angle in radians.
   * @param {number} [aEndAngle=Math.PI*2] - The end angle in radians.
   * @param {boolean} [aClockwise=false] - Whether to sweep the ellipse clockwise or not.
   * @param {number} [aRotation=0] - The rotation angle of the ellipse in radians, counterclockwise from the positive X axis.
   * @return {Path} A reference to this path.
   */
  public absellipse(
    aX: number,
    aY: number,
    xRadius: number,
    yRadius: number,
    aStartAngle: number,
    aEndAngle: number,
    aClockwise: boolean,
    aRotation: number
  ): this {

    const curve = new EllipseCurve(aX, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation);

    if (this.curves.length > 0) {

      // if a previous curve is present, attempt to join
      const firstPoint = curve.getPoint(0);

      if (!firstPoint.equals(this.currentPoint)) {

        this.lineTo(firstPoint.x, firstPoint.y);

      }

    }

    this.curves.push(curve);

    const lastPoint = curve.getPoint(1);
    this.currentPoint.copy(lastPoint);

    return this;

  }

  public copy(source: Path): this {

    super.copy(source);

    this.currentPoint.copy(source.currentPoint);

    return this;

  }

  public toJSON() {

    const data = super.toJSON();

    data.currentPoint = this.currentPoint.toArray();

    return data;

  }

  public fromJSON(json: any): this {

    super.fromJSON(json);

    this.currentPoint.fromArray(json.currentPoint);

    return this;

  }

}
