import { Curve } from './Curve';
import * as Curves from '../curves/Curves';
import { isVector2, Vector2 } from '../../math/Vector2';
import { isVector3, Vector3 } from '../../math/Vector3';
import { isEllipseCurve } from '../curves/EllipseCurve';
import { isLineCurve } from '../curves/LineCurve';
import { isLineCurve3 } from '../curves/LineCurve3';
import { isSplineCurve } from '../curves/SplineCurve';

/**
 * A base class extending {@link Curve}. `CurvePath` is simply an
 * array of connected curves, but retains the API of a curve.
 *
 * @augments Curve
 */
export class CurvePath<T extends Vector2 | Vector3> extends Curve<T> {

  public type: string = 'CurvePath';

  /**
   * An array of curves defining the
   * path.
   *
   * @type {Array<Curve>}
   */
  public curves: Curve<T>[] = [];

  /**
   * Whether the path should automatically be closed
   * by a line curve.
   *
   * @type {boolean}
   * @default false
   */
  public autoClose: boolean = false;

  public cacheLengths: number[] | null = null;

  /**
   * Constructs a new curve path.
   */
  constructor() {

    super();

  }

  /**
   * Adds a curve to this curve path.
   *
   * @param {Curve} curve - The curve to add.
   */
  public add(curve: Curve<T>): void {

    this.curves.push(curve);

  }

  /**
   * Adds a line curve to close the path.
   *
   * @return {CurvePath} A reference to this curve path.
   */
  public closePath(): this {

    // Add a line curve if start and end of lines are not connected
    const startPoint = this.curves[0].getPoint(0);
    const endPoint = this.curves[this.curves.length - 1].getPoint(1);

    // if (!startPoint.equals(endPoint)) {

    //   const lineType = (startPoint.isVector2 === true) ? 'LineCurve' : 'LineCurve3';
    //   this.curves.push(new Curves[lineType](endPoint, startPoint));

    // }

    if (isVector2(startPoint) && isVector2(endPoint) && !startPoint.equals(endPoint)) {

      const lineType = 'LineCurve';
      const line = new Curves[lineType](endPoint, startPoint) as unknown as Curve<T>
      this.curves.push(line);

    } else if (isVector3(startPoint) && isVector3(endPoint) && !startPoint.equals(endPoint)) {

      const lineType = 'LineCurve3';
      const line = new Curves[lineType](endPoint, startPoint) as unknown as Curve<T>
      this.curves.push(line);

    }

    return this;

  }

  /**
   * This method returns a vector in 2D or 3D space (depending on the curve definitions)
   * for the given interpolation factor.
   *
   * @param {number} t - A interpolation factor representing a position on the curve. Must be in the range `[0,1]`.
   * @param {(Vector2|Vector3)} [optionalTarget] - The optional target vector the result is written to.
   * @return {?(Vector2|Vector3)} The position on the curve. It can be a 2D or 3D vector depending on the curve definition.
   */
  public getPoint(t: number, optionalTarget?: T): T {

    // To get accurate point with reference to
    // entire path distance at time t,
    // following has to be done:

    // 1. Length of each sub path have to be known
    // 2. Locate and identify type of curve
    // 3. Get t for the curve
    // 4. Return curve.getPointAt(t')

    const d = t * this.getLength();
    const curveLengths = this.getCurveLengths();
    let i = 0;

    // To think about boundaries points.

    while (i < curveLengths.length) {

      if (curveLengths[i] >= d) {

        const diff = curveLengths[i] - d;
        const curve = this.curves[i];

        const segmentLength = curve.getLength();
        const u = segmentLength === 0 ? 0 : 1 - diff / segmentLength;

        return curve.getPointAt(u, optionalTarget);

      }

      i++;

    }

    // return null;

    // fallback: return a clone of the first curve's start point
    return this.curves[0].getPointAt(0, optionalTarget as T);

    // loop where sum != 0, sum > d , sum+1 <d

  }

  public getLength() {

    // We cannot use the default .Curve getPoint() with getLength() because in
    // .Curve, getLength() depends on getPoint() but in .CurvePath
    // getPoint() depends on getLength

    const lens = this.getCurveLengths();
    return lens[lens.length - 1];

  }

  public updateArcLengths() {

    // cacheLengths must be recalculated.

    this.needsUpdate = true;
    this.cacheLengths = null;
    this.getCurveLengths();

  }

  /**
   * Returns list of cumulative curve lengths of the defined curves.
   *
   * @return {Array<number>} The curve lengths.
   */
  public getCurveLengths(): number[] {

    // Compute lengths and cache them
    // We cannot overwrite getLengths() because UtoT mapping uses it.
    // We use cache values if curves and cache array are same length

    if (this.cacheLengths && this.cacheLengths.length === this.curves.length) {

      return this.cacheLengths;

    }

    // Get length of sub-curve
    // Push sums into cached array

    const lengths = [];
    let sums = 0;

    for (let i = 0, l = this.curves.length; i < l; i++) {

      sums += this.curves[i].getLength();
      lengths.push(sums);

    }

    this.cacheLengths = lengths;

    return lengths;

  }

  public getSpacedPoints(divisions = 40): Array<T> {

    const points: Array<T> = [];

    for (let i = 0; i <= divisions; i++) {

      points.push(this.getPoint(i / divisions));

    }

    if (this.autoClose) {

      points.push(points[0]);

    }

    return points;

  }

  public getPoints(divisions = 12): Array<T> {

    const points: Array<T> = [];
    let last;

    for (let i = 0, curves = this.curves; i < curves.length; i++) {

      const curve = curves[i];
      const resolution = isEllipseCurve(curve) ? divisions * 2
        : (isLineCurve(curve) || isLineCurve3(curve)) ? 1
          : isSplineCurve(curve) ? divisions * curve.points.length
            : divisions;

      const pts = curve.getPoints(resolution);

      for (let j = 0; j < pts.length; j++) {

        const point = pts[j];

        // if (last && last.equals(point)) continue; // ensures no consecutive points are duplicates

        if (
          isVector2(last) && isVector2(point) && last.equals(point) ||
          isVector3(last) && isVector3(point) && last.equals(point)
        ) {

          continue; // ensures no consecutive points are duplicates

        }

        points.push(point);
        last = point;

      }

    }

    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    if (
      this.autoClose &&
      points.length > 1 &&
      // !points[points.length - 1].equals(points[0])
      !(
        (isVector2(lastPoint) &&
          isVector2(firstPoint) &&
          lastPoint.equals(firstPoint)) ||

        (isVector3(lastPoint) &&
          isVector3(firstPoint) &&
          lastPoint.equals(firstPoint))
      )
    ) {

      points.push(points[0]);

    }

    return points;

  }

  public copy(source: CurvePath<T>) {

    super.copy(source);

    this.curves = [];

    for (let i = 0, l = source.curves.length; i < l; i++) {

      const curve = source.curves[i];

      this.curves.push(curve.clone());

    }

    this.autoClose = source.autoClose;

    return this;

  }

  public toJSON() {

    const data = super.toJSON();

    data.autoClose = this.autoClose;
    data.curves = [];

    for (let i = 0, l = this.curves.length; i < l; i++) {

      const curve = this.curves[i];
      data.curves.push(curve.toJSON());

    }

    return data;

  }

  public fromJSON(json: any) {

    super.fromJSON(json);

    this.autoClose = json.autoClose;
    this.curves = [];

    new Curves['LineCurve']

    for (let i = 0, l = json.curves.length; i < l; i++) {

      const curve = json.curves[i];
      const type = curve.type as keyof typeof Curves;
      
      // this.curves.push(new Curves[curve.type]().fromJSON(curve));

      // TODO: check if there's a better way
      this.curves.push(
        new (Curves as Record<string, any>)[curve.type]().fromJSON(curve)
      );

    }

    return this;

  }

}

