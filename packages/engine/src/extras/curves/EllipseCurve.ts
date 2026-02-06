import { Curve } from '../core/Curve';
import { Vector2 } from '../../math/Vector2';

/**
 * A curve representing an ellipse.
 *
 * ```js
 * const curve = new EllipseCurve(
 * 	0, 0,
 * 	10, 10,
 * 	0, 2 * Math.PI,
 * 	false,
 * 	0
 * );
 *
 * const points = curve.getPoints( 50 );
 * const geometry = new BufferGeometry().setFromPoints( points );
 *
 * const material = new LineBasicMaterial( { color: 0xff0000 } );
 *
 * // Create the final object to add to the scene
 * const ellipse = new Line( geometry, material );
 * ```
 *
 * @augments Curve
 */
export class EllipseCurve extends Curve {

  /**
 * This flag can be used for type testing.
 *
 */
  public readonly isEllipseCurve: boolean = true;

  public type: string = 'EllipseCurve';

  /**
   * The X center of the ellipse.
   *
   * @default 0
   */
  public aX: number;

  /**
   * The Y center of the ellipse.
   *
   * @default 0
   */
  public aY: number;

  /**
   * The radius of the ellipse in the x direction.
   * Setting the this value equal to the {@link EllipseCurve#yRadius} will result in a circle.
   *
   * @default 1
   */
  public xRadius: number;

  /**
   * The radius of the ellipse in the y direction.
   * Setting the this value equal to the {@link EllipseCurve#xRadius} will result in a circle.
   *
   * @default 1
   */
  public yRadius: number;

  /**
   * The start angle of the curve in radians starting from the positive X axis.
   *
   * @default 0
   */
  public aStartAngle: number;

  /**
   * The end angle of the curve in radians starting from the positive X axis.
   *
   * @default Math.PI*2
   */
  public aEndAngle: number;

  /**
   * Whether the ellipse is drawn clockwise or not.
   *
   * @default false
   */
  public aClockwise: boolean;

  /**
   * The rotation angle of the ellipse in radians, counterclockwise from the positive X axis.
   *
   * @default 0
   */
  public aRotation: number;

  /**
   * Constructs a new ellipse curve.
   *
   * @param [aX=0] - The X center of the ellipse.
   * @param [aY=0] - The Y center of the ellipse.
   * @param [xRadius=1] - The radius of the ellipse in the x direction.
   * @param [yRadius=1] - The radius of the ellipse in the y direction.
   * @param [aStartAngle=0] - The start angle of the curve in radians starting from the positive X axis.
   * @param [aEndAngle=Math.PI*2] - The end angle of the curve in radians starting from the positive X axis.
   * @param [aClockwise=false] - Whether the ellipse is drawn clockwise or not.
   * @param [aRotation=0] - The rotation angle of the ellipse in radians, counterclockwise from the positive X axis.
   */
  constructor(
    aX: number = 0,
    aY: number = 0,
    xRadius: number = 1,
    yRadius: number = 1,
    aStartAngle: number = 0,
    aEndAngle: number = Math.PI * 2,
    aClockwise: boolean = false,
    aRotation: number = 0
  ) {

    super();

    this.aX = aX;
    this.aY = aY;
    this.xRadius = xRadius;
    this.yRadius = yRadius;
    this.aStartAngle = aStartAngle;
    this.aEndAngle = aEndAngle;
    this.aClockwise = aClockwise;
    this.aRotation = aRotation;

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

    const twoPi = Math.PI * 2;
    let deltaAngle = this.aEndAngle - this.aStartAngle;
    const samePoints = Math.abs(deltaAngle) < Number.EPSILON;

    // ensures that deltaAngle is 0 .. 2 PI
    while (deltaAngle < 0) deltaAngle += twoPi;
    while (deltaAngle > twoPi) deltaAngle -= twoPi;

    if (deltaAngle < Number.EPSILON) {

      if (samePoints) {

        deltaAngle = 0;

      } else {

        deltaAngle = twoPi;

      }

    }

    if (this.aClockwise === true && !samePoints) {

      if (deltaAngle === twoPi) {

        deltaAngle = - twoPi;

      } else {

        deltaAngle = deltaAngle - twoPi;

      }

    }

    const angle = this.aStartAngle + t * deltaAngle;
    let x = this.aX + this.xRadius * Math.cos(angle);
    let y = this.aY + this.yRadius * Math.sin(angle);

    if (this.aRotation !== 0) {

      const cos = Math.cos(this.aRotation);
      const sin = Math.sin(this.aRotation);

      const tx = x - this.aX;
      const ty = y - this.aY;

      // Rotate the point about the center of the ellipse.
      x = tx * cos - ty * sin + this.aX;
      y = tx * sin + ty * cos + this.aY;

    }

    return point.set(x, y);

  }

  public copy(source: any): this {

    super.copy(source);

    this.aX = source.aX;
    this.aY = source.aY;

    this.xRadius = source.xRadius;
    this.yRadius = source.yRadius;

    this.aStartAngle = source.aStartAngle;
    this.aEndAngle = source.aEndAngle;

    this.aClockwise = source.aClockwise;

    this.aRotation = source.aRotation;

    return this;

  }

  public toJSON() {

    const data = super.toJSON();

    data.aX = this.aX;
    data.aY = this.aY;

    data.xRadius = this.xRadius;
    data.yRadius = this.yRadius;

    data.aStartAngle = this.aStartAngle;
    data.aEndAngle = this.aEndAngle;

    data.aClockwise = this.aClockwise;

    data.aRotation = this.aRotation;

    return data;

  }

  public fromJSON(json: any) {

    super.fromJSON(json);

    this.aX = json.aX;
    this.aY = json.aY;

    this.xRadius = json.xRadius;
    this.yRadius = json.yRadius;

    this.aStartAngle = json.aStartAngle;
    this.aEndAngle = json.aEndAngle;

    this.aClockwise = json.aClockwise;

    this.aRotation = json.aRotation;

    return this;

  }

}
