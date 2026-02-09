import { BufferGeometry } from "../core/BufferGeometry";
import { Float32BufferAttribute } from "../core/BufferAttribute";
import { Vector3 } from "../math/Vector3";

/**
 * A geometry class for a rectangular cuboid with a given width, height, and depth.
 *
 * @remarks
 * On creation, the cuboid is centered at the origin, with each edge parallel
 * to one of the axes of the local coordinate system.
 *
 * @example
 * ```ts
 * const geometry = new BoxGeometry( 1, 1, 1 );
 * const material = new MeshBasicMaterial( { color: 0x00ff00 } );
 * const cube = new Mesh( geometry, material );
 * scene.add( cube );
 * ```
 *
 * @augments BufferGeometry
 */
export class BoxGeometry extends BufferGeometry {

  /**
   * The type of this geometry.
   */
  public readonly type: string = "BoxGeometry";

  /**
   * Holds the constructor parameters that have been used to generate this geometry.
   *
   * @remarks
   * any modifications to the geometry after instantiation are not reflected in this property.
   */
  // public parameters: { [key: string]: number; };

  /**
   * Creates a new BoxGeometry instance.
   *
   * @remarks
   * Purpose:
   * The constructor builds a 3D box geometry from scratch
   * - Centered at the origin (0, 0, 0)
   * - Edges aligned with axes
   * - Uses width, height, depth as dimensions
   * - Supports multiple segments along each axis (widthSegments, heightSegments, depthSegments)
   * (so you can have a subdived box for more vertices)
   *
   * It produces the necessary buffer attributes:
   * - vertices (position buffer)
   * - normals (for lighting calculations)
   * - uvs (texture coordinates)
   * - index buffer (defines how vertices form triangles)
   * - groups (for multi-material support)
   */
  constructor(
    public width: number = 1,
    public height: number = 1,
    public depth: number = 1,
    public widthSegments: number = 1,
    public heightSegments: number = 1,
    public depthSegments: number = 1
  ) {

    super();

    this.parameters = {
      width: width,
      height: height,
      depth: depth,
      widthSegments: widthSegments,
      heightSegments: heightSegments,
      depthSegments: depthSegments
    };

    const scope = this;

    // segments
    widthSegments = Math.floor(widthSegments);
    heightSegments = Math.floor(heightSegments);
    depthSegments = Math.floor(depthSegments);

    // buffers
    /**
     * Top-level structure
     *
     * @remarks
     * These arrays will hold the computed data for the box geometry
     * - indices: triangle indices into the vertex array
     * - vertices: vertex positions
     * - normals: normals per vertex
     * - uvs: texture coordinates
     */
    const indices: number[] = [];
    const vertices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];

    // helper variables
    /**
     * Counters and offsets
     *
     * @remarks
     * - numOfVertices tracks how many vertices have been added so far
     * - groupStart tracks the starting index for each group of faces (for multi-materials)
     */
    let numberOfVertices: number = 0; // offset into the vertex buffer
    let groupStart: number = 0; // offset into the index buffer

    // build each side of the box geometry
    /**
     * Building the faces
     *
     * @remarks
     * - Right, Left, Top, Bottom, Front, Back
     * The constructor calls buildPlane 6 times, once per face
     *
     * Arguments:
     * 1. u, v, w -> axes used for this face
     * 2. udir, vdir -> direction multipliers for u and v axes (-1 or 1)
     * 3. width, height, depth -> dimensions of the plane
     * 4. gridX, gridY -> number of segments alongn u and v axes
     * 5. materialIndex -> which group / material this face uses
     *
     * This allows the function to reuse one generic plane-building logic for all faces
     */
    buildPlane('z', 'y', 'x', - 1, - 1, depth, height, width, depthSegments, heightSegments, 0); // px
    buildPlane('z', 'y', 'x', 1, - 1, depth, height, - width, depthSegments, heightSegments, 1); // nx
    buildPlane('x', 'z', 'y', 1, 1, width, depth, height, widthSegments, depthSegments, 2); // py
    buildPlane('x', 'z', 'y', 1, - 1, width, depth, - height, widthSegments, depthSegments, 3); // ny
    buildPlane('x', 'y', 'z', 1, - 1, width, height, depth, widthSegments, heightSegments, 4); // pz
    buildPlane('x', 'y', 'z', - 1, - 1, width, height, - depth, widthSegments, heightSegments, 5); // nz

    // build geometry

    this.setIndex(indices);
    this.setAttribute('position', new Float32BufferAttribute(vertices, 3));
    this.setAttribute('normal', new Float32BufferAttribute(normals, 3));
    this.setAttribute('uv', new Float32BufferAttribute(uvs, 2));

    /**
     * Builds a plane
     */
    function buildPlane(
      u: 'x' | 'y' | 'z',
      v: 'x' | 'y' | 'z',
      w: 'x' | 'y' | 'z',
      udir: number,
      vdir: number,
      width: number,
      height: number,
      depth: number,
      gridX: number,
      gridY: number,
      materialIndex: number
    ) {
      /**
       * Grid and segment calculations
       */
      const segmentWidth = width / gridX; // size of each segment along width
      const segmentHeight = height / gridY; // size of each segment along height

      // for centring vertices at origin
      const widthHalf = width / 2;
      const heightHalf = height / 2;
      const depthHalf = depth / 2;

      const gridX1 = gridX + 1;
      const gridY1 = gridY + 1;

      let vertexCounter = 0;
      let groupCount = 0;

      const vector = new Vector3();

      // generate vertices, normals and uvs
      /**
       * - Loop over grid points, not just corners (that's why +1)
       * - vector[u], vector[v], vector[w] -> dynamically pick axes for this face
       * - vertices -> actual 3D coordinates
       * - normals -> perpendicular to the face
       * - uvs -> normalized 0..1 coordinates
       */
      for (let iy = 0; iy < gridY1; iy++) {

        const y = iy * segmentHeight - heightHalf;

        for (let ix = 0; ix < gridX1; ix++) {

          const x = ix * segmentWidth - widthHalf;

          // set values to correct vector component

          vector[u] = x * udir;
          vector[v] = y * vdir;
          vector[w] = depthHalf;

          // now apply vector to vertex buffer

          vertices.push(vector.x, vector.y, vector.z);

          // set values to correct vector component

          vector[u] = 0;
          vector[v] = 0;
          vector[w] = depth > 0 ? 1 : - 1;

          // now apply vector to normal buffer

          normals.push(vector.x, vector.y, vector.z);

          // uvs

          uvs.push(ix / gridX);
          uvs.push(1 - (iy / gridY));

          // counters

          vertexCounter += 1;

        }

      }

      // generate indices (triangles)

      // 1. you need three indices to draw a single face
      // 2. a single segment consists of two faces
      // 3. so we need to generate six (2*3) indices per segment
      /**
       * - Each segment forms 2 triangles (6 indices)
       * - a, b, c, d -> the 4 corners of the segment
       * - push indices in triangle order for rendering
       */
      for (let iy = 0; iy < gridY; iy++) {

        for (let ix = 0; ix < gridX; ix++) {

          const a = numberOfVertices + ix + gridX1 * iy;
          const b = numberOfVertices + ix + gridX1 * (iy + 1);
          const c = numberOfVertices + (ix + 1) + gridX1 * (iy + 1);
          const d = numberOfVertices + (ix + 1) + gridX1 * iy;

          // faces

          indices.push(a, b, d);
          indices.push(b, c, d);

          // increase counter

          groupCount += 6;

        }

      }

      // add a group to the geometry. this will ensure multi material support
      /**
       * - addGroup allows you to assign different materials to different faces
       */
      scope.addGroup(groupStart, groupCount, materialIndex);

      // calculate new start value for groups
      /**
       * - groupStart is updated for the next face
       */
      groupStart += groupCount;

      // update total number of vertices
      /**
       * - numOfVertices tracks cumulative vertices
       */
      numberOfVertices += vertexCounter;

    }
  }

  /**
   * Copies the values of the given geometry to this instance.
   *
   * @param {BufferGeometry} source - The geometry to copy.
   * @return {BufferGeometry} A reference to this instance.
   */
  public copy(source: BoxGeometry): this {
    super.copy(source);

    this.parameters = Object.assign({}, source.parameters);

    return this;
  }

  /**
   * Factory method for creating an instance of this class from a JSON object.
   *
   * @param data - A JSON object representing the serialized geometry
   * @returns A new instance
   */
  public fromJSON(data: any): BoxGeometry {
    return new BoxGeometry(data.width, data.height, data.depth, data.widthSegments, data.heightSegments, data.depthSegments);
  }

}
