import { BufferGeometry } from '../core/BufferGeometry';
import { Float32BufferAttribute } from '../core/BufferAttribute';
import { Shape } from '../extras/core/Shape';
import { ShapeUtils } from '../extras/ShapeUtils';
import { Vector2 } from '../math/Vector2';

/**
 * Creates an one-sided polygonal geometry from one or more path shapes.
 *
 * ```js
 * const arcShape = new Shape()
 *	.moveTo( 5, 1 )
 *	.absarc( 1, 1, 4, 0, Math.PI * 2, false );
 *
 * const geometry = new ShapeGeometry( arcShape );
 * const material = new MeshBasicMaterial( { color: 0x00ff00, side: DoubleSide } );
 * const mesh = new Mesh( geometry, material ) ;
 * scene.add( mesh );
 * ```
 *
 * @augments BufferGeometry
 * @demo scenes/geometry-browser.html#ShapeGeometry
 */
export class ShapeGeometry extends BufferGeometry {

  public type = 'ShapeGeometry';

  /**
   * Constructs a new shape geometry.
   *
   * @param {Shape|Array<Shape>} [shapes] - A shape or an array of shapes.
   * @param {number} [curveSegments=12] - Number of segments per shape.
   */
  constructor(
    shapes: Shape | Shape[] = new Shape([
      new Vector2(0, 0.5),
      new Vector2(- 0.5, - 0.5),
      new Vector2(0.5, - 0.5)
    ]),
    curveSegments: number = 12
  ) {

    super();

    /**
     * Holds the constructor parameters that have been
     * used to generate the geometry. Any modification
     * after instantiation does not change the geometry.
     *
     * @type {Object}
     */
    this.parameters = {
      shapes: shapes,
      curveSegments: curveSegments
    };

    // buffers

    const indices: number[] = [];
    const vertices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];

    // helper variables

    let groupStart = 0;
    let groupCount = 0;

    // allow single and array values for "shapes" parameter

    if (Array.isArray(shapes) === false) {

      addShape(shapes);

    } else {

      for (let i = 0; i < shapes.length; i++) {

        addShape(shapes[i]);

        this.addGroup(groupStart, groupCount, i); // enables MultiMaterial support

        groupStart += groupCount;
        groupCount = 0;

      }

    }

    // build geometry

    this.setIndex(indices);
    this.setAttribute('position', new Float32BufferAttribute(vertices, 3));
    this.setAttribute('normal', new Float32BufferAttribute(normals, 3));
    this.setAttribute('uv', new Float32BufferAttribute(uvs, 2));


    // helper functions

    function addShape(shape: Shape) {

      const indexOffset = vertices.length / 3;
      const points = shape.extractPoints(curveSegments);

      let shapeVertices = points.shape;
      const shapeHoles = points.holes;

      // check direction of vertices

      if (ShapeUtils.isClockWise(shapeVertices) === false) {

        shapeVertices = shapeVertices.reverse();

      }

      for (let i = 0, l = shapeHoles.length; i < l; i++) {

        const shapeHole = shapeHoles[i];

        if (ShapeUtils.isClockWise(shapeHole) === true) {

          shapeHoles[i] = shapeHole.reverse();

        }

      }

      const faces = ShapeUtils.triangulateShape(shapeVertices, shapeHoles);

      // join vertices of inner and outer paths to a single array

      for (let i = 0, l = shapeHoles.length; i < l; i++) {

        const shapeHole = shapeHoles[i];
        shapeVertices = shapeVertices.concat(shapeHole);

      }

      // vertices, normals, uvs

      for (let i = 0, l = shapeVertices.length; i < l; i++) {

        const vertex = shapeVertices[i];

        vertices.push(vertex.x, vertex.y, 0);
        normals.push(0, 0, 1);
        uvs.push(vertex.x, vertex.y); // world uvs

      }

      // indices

      for (let i = 0, l = faces.length; i < l; i++) {

        const face = faces[i];

        const a = face[0] + indexOffset;
        const b = face[1] + indexOffset;
        const c = face[2] + indexOffset;

        indices.push(a, b, c);
        groupCount += 3;

      }

    }

  }

  public copy(source: ShapeGeometry) {

    super.copy(source);

    this.parameters = Object.assign({}, source.parameters);

    return this;

  }

  public toJSON() {

    const data = super.toJSON();

    const shapes = this.parameters.shapes;

    return toJSON(shapes, data);

  }

  /**
   * Factory method for creating an instance of this class from the given
   * JSON object.
   *
   * @param {Object} data - A JSON object representing the serialized geometry.
   * @param {Array<Shape>} shapes - An array of shapes.
   * @return {ShapeGeometry} A new instance.
   */
  public static fromJSON(data: any, shapes: Shape[]) {

    const geometryShapes: Shape[] = [];

    for (let j = 0, jl = data.shapes.length; j < jl; j++) {

      const shape = shapes[data.shapes[j]];

      geometryShapes.push(shape);

    }

    return new ShapeGeometry(geometryShapes, data.curveSegments);

  }

}

function toJSON(shapes: Shape | Shape[], data: any) {

  data.shapes = [];

  if (Array.isArray(shapes)) {

    for (let i = 0, l = shapes.length; i < l; i++) {

      const shape = shapes[i];

      data.shapes.push(shape.uuid);

    }

  } else {

    data.shapes.push(shapes.uuid);

  }

  return data;

}
