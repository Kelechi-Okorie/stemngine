import { Path } from './Path';
import { generateUUID } from '../../math/MathUtils';
import { Vector2 } from '../../math/Vector2';

/**
 * Defines an arbitrary 2d shape plane using paths with optional holes. It
 * can be used with {@link ExtrudeGeometry}, {@link ShapeGeometry}, to get
 * points, or to get triangulated faces.
 *
 * ```js
 * const heartShape = new Shape();
 *
 * heartShape.moveTo( 25, 25 );
 * heartShape.bezierCurveTo( 25, 25, 20, 0, 0, 0 );
 * heartShape.bezierCurveTo( - 30, 0, - 30, 35, - 30, 35 );
 * heartShape.bezierCurveTo( - 30, 55, - 10, 77, 25, 95 );
 * heartShape.bezierCurveTo( 60, 77, 80, 55, 80, 35 );
 * heartShape.bezierCurveTo( 80, 35, 80, 0, 50, 0 );
 * heartShape.bezierCurveTo( 35, 0, 25, 25, 25, 25 );
 *
 * const extrudeSettings = {
 * 	depth: 8,
 * 	bevelEnabled: true,
 * 	bevelSegments: 2,
 * 	steps: 2,
 * 	bevelSize: 1,
 * 	bevelThickness: 1
 * };
 *
 * const geometry = new ExtrudeGeometry( heartShape, extrudeSettings );
 * const mesh = new Mesh( geometry, new MeshBasicMaterial() );
 * ```
 *
 * @augments Path
 */
export class Shape extends Path {

  /**
   * The UUID of the shape.
   *
   * @type {string}
   * @readonly
   */
  public uuid: string = generateUUID();

  /**
   * Defines the holes in the shape. Hole definitions must use the
   * opposite winding order (CW/CCW) than the outer shape.
   *
   * @type {Array<Path>}
   * @readonly
   */
  public holes: Path[] = [];

  /**
   * Constructs a new shape.
   *
   * @param {Array<Vector2>} [points] - An array of 2D points defining the shape.
   */
  constructor(points: Vector2[]) {

    super(points);

    this.type = 'Shape';

  }

  /**
   * Returns an array representing each contour of the holes
   * as a list of 2D points.
   *
   * @param {number} divisions - The fineness of the result.
   * @return {Array<Array<Vector2>>} The holes as a series of 2D points.
   */
  public getPointsHoles(divisions: number): Vector2[][] {

    const holesPts = [];

    for (let i = 0, l = this.holes.length; i < l; i++) {

      holesPts[i] = this.holes[i].getPoints(divisions);

    }

    return holesPts;

  }

  // get points of shape and holes (keypoints based on segments parameter)

  /**
   * Returns an object that holds contour data for the shape and its holes as
   * arrays of 2D points.
   *
   * @param {number} divisions - The fineness of the result.
   * @return {{shape:Array<Vector2>,holes:Array<Array<Vector2>>}} An object with contour data.
   */
  public extractPoints(divisions: number) {

    return {

      shape: this.getPoints(divisions),
      holes: this.getPointsHoles(divisions)

    };

  }

  public copy(source: Shape) {

    super.copy(source);

    this.holes = [];

    for (let i = 0, l = source.holes.length; i < l; i++) {

      const hole = source.holes[i];

      // TODO: check if it's better to override clone instead
      // of casting to Path
      this.holes.push(hole.clone() as Path);

    }

    return this;

  }

  public toJSON() {

    const data = super.toJSON();

    data.uuid = this.uuid;
    data.holes = [];

    for (let i = 0, l = this.holes.length; i < l; i++) {

      const hole = this.holes[i];
      data.holes.push(hole.toJSON());

    }

    return data;

  }

  public fromJSON(json: any): this {

    super.fromJSON(json);

    this.uuid = json.uuid;
    this.holes = [];

    for (let i = 0, l = json.holes.length; i < l; i++) {

      const hole = json.holes[i];
      this.holes.push(new Path().fromJSON(hole));

    }

    return this;

  }

}
