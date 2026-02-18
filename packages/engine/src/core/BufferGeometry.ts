import { BufferAttribute, Uint16BufferAttribute, Uint32BufferAttribute } from './BufferAttribute';
import { InterleavedBufferAttribute } from './InterleavedBufferAttribute';
import { GLBufferAttribute } from './GLBufferAttribute';
import { Float32BufferAttribute } from './BufferAttribute';

import { EventDispatcher } from './EventDispatcher';
import { generateUUID } from '../math/MathUtils';
import { arrayNeedsUint32 } from '../utils';


import { Matrix4 } from '../math/Matrix4';
import { Node3D } from './Node3D';
import { Vector3 } from '../math/Vector3';
import { Box3 } from '../math/Box3';
import { Sphere } from '../math/Sphere';
import { Matrix3 } from '../math/Matrix3';
import { Quaternion } from '../math/Quaternion';
import { Vector2 } from '../math/Vector2';

let _id = 0;

const _m1 = /*@__PURE__*/ new Matrix4();
const _obj = /*@__PURE__*/ new Node3D();
const _offset = /*@__PURE__*/ new Vector3();
const _box = /*@__PURE__*/ new Box3();
const _boxMorphTargets = /*@__PURE__*/ new Box3();
const _vector = /*@__PURE__*/ new Vector3();

/**
 * A representation of mesh, line, or point geometry.
 *
 * @remarks
 * Includes vertex positions,
 * face indices, normals, colors, UVs, and custom attributes.
 *
 * ```ts
 * const geometry = new BufferGeometry();
 * // create a simple square shape. We duplicate the top left and bottom right
 * // vertices because each vertex needs to appear once per triangle.
 * const vertices = new Float32Array([
* 	-1.0, -1.0,  1.0, // v0
 * 	 1.0, -1.0,  1.0, // v1
 * 	 1.0,  1.0,  1.0, // v2
 *
 * 	 1.0,  1.0,  1.0, // v3
 * 	-1.0,  1.0,  1.0, // v4
 * 	-1.0, -1.0,  1.0  // v5
 * ]);
 * // itemSize = 3 because there are 3 values (components) per vertex
 * geometry.setAttribute('position', new BufferAttribute(vertices, 3));
 * const material = new MeshBasicMaterial( { color: 0xff0000 } );
 * const mesh = new Mesh( geometry, material );
 * scene.add( mesh );
 * ```
 *
 * @augments EventDispatcher
 */
export class BufferGeometry extends EventDispatcher {
  /**
   * this flag can be used for type testing.
   *
 */
  public readonly isBufferGeometry: boolean = true;

  /**
   * The ID of the BufferGeometry.
   *
   * @name BufferGeometry#id
  */
  public readonly id: number;

  /**
   * The UUID of the node
   *
   */
  public readonly uuid: string = generateUUID();

  /**
   * The name of the BufferGeometry
   */
  public name: string = '';

  /**
   * The type property is used for detecting the object type
   * in context of serialization/deserialization
   *
   */
  public readonly type: string = 'BufferGeometry';

  /**
   * Allows for vertices to be re-used across multiple triangles;
   * This is called using "indexed triangles". Each triangle is associated with the
   * indices of three vertices. This attribute therefore stores the index of each vertex
   * for each triangle face. If this attribute is not set, the renderer assumes
   * that each three contiguous positions represent a single triangle face.
   */
  public index: BufferAttribute | null = null;

  /**
   * A (storage) buffer attribute which was generated with a compute shader and
   * now defines indirect draw calls
   *
   * @remarks
   * Can only be used with {@link WebGPURenderer}
   */
  public indirect: BufferAttribute | null = null;

  /**
   * This dictionary has an id the name of the attribute to be set and as value
   * the buffer attribute to set it to. Rather than accessing this property directly,
   * use `setAttribute`, `getAttribute`, `deleteAttribute`, and `hasAttribute`.
   */
  public attributes: { [name: string]: BufferAttribute | InterleavedBufferAttribute } = {};

  /**
   * This dictionary holds the morph targets of the geometry.
   *
   * @remarks
   * Once the geometry has been rendered, the morph attribute data cannot be changed
   * You will have to call dispose(), and create a new geometry instance
   *
   * key (name): The name of the attribute you want to morph (e.g, 'position', 'normal')
   * value: An array of BufferAttributes or InterleavedBufferAttributes instances. Each entry
   * in the array is a morph target defining the attribute data for the morphed attribute.
   *
   * Morph targets (or blend shapes) are a way to animate vertex positions without changing
   * mesh topology
   * 
   * Example:
   * One  morph target might move the vertices to make a smile
   * Another morph target might move the vertices to make a frown
   *
   * You can blend between morph targets using wights (0 -> 1) to create smooth animations
   *
   * Each morph target can have a weight (controlled in the mesh via mesh.morphTargetInfluences array)
   */
  public morphAttributes: { [name: string]: Array<BufferAttribute | InterleavedBufferAttribute> } = {};

  /**
   * Used to control the morph target behaviour
   *
   * @remarks
   * When set to true, the morph target data is treated as relative offset, rather than as absolute
   * positions/normals
   */
  public morphTargetsRelative: boolean = false;

  /**
   * Split the geometry into groups, each of which will be rendered in a
   * separate draw call.
   *
   * @remarks
   * An array of objects, where each object describes a subset of the geometry.
   *
   * Why groups exist:
   * - multiple materials on one geometry
   * - effective rendering
   *
   * This allows an array of materials to be used with the geometry.
   *
   * Use `addGroup()` and `clearGroups()` to edit groups, rather than modifying this array directly.
   *
   * Every vertex and index must belong to exactly one group — groups must not share vertices or
   * indices, and must not leave vertices or indices unused.
   */
  public groups: { start: number, count: number, materialIndex?: number }[] = [];

  /**
   * Bounding box for the geometry which can be calculated with `computeBoundingBox()`.
   *
   */
  public boundingBox: Box3 | null = null;

  /**
   * Bounding sphere for the geometry which can be calculated with `computeBoundingSphere()`.
   *
   */
  public boundingSphere: Sphere | null = null;

  /**
   * Determines the part of the geometry to render. This should not be set directly,
   * instead use `setDrawRange()`.
   *
   */
  public drawRange: { start: number, count: number } = { start: 0, count: Infinity };

  /**
   * An object that can be used to store custom data about the geometry.
   * It should not hold references to functions as these will not be cloned.
   *
   * @type {Object}
   */
  public userData: Record<string, any> = {};

  /**
   * Holds the constructor parameters that have been used to generate this geometry.
   *
   * @remarks
   * any modifications to the geometry after instantiation are not reflected in this property.
   */
  public parameters!: { [key: string]: any };

  /**
   * Constructs a new BufferGeometry.
   */
  constructor() {

    super();

    this.id = _id++;

  }

  /**
   * Returns the index of this geometry
   *
   * @remarks
   * Index is a BufferAttribute that stores vertex indices for indexed drawing
   *
   * @returns The index attribute
   */
  public getIndex(): BufferAttribute | null {

    return this.index;

  }

  /**
   * Sets the given index to this geometry
   *
   * @param index - The index attribute
   * @returns A reference to this instance
   */
  public setIndex(index: number[] | BufferAttribute): this {

    if (Array.isArray(index)) {

      this.index = new (arrayNeedsUint32(index) ? Uint32BufferAttribute : Uint16BufferAttribute)(index, 1);

    } else {

      this.index = index;

    }

    return this;

  }

  /**
   * Sets the given indrect attribute to this geometry
   *
   * @remarks
   * Indirect is a BufferAttribute that stores draw call parameters for indirect drawing
   *
   * In modern graphics (WebGPU, WebGL2), indrect drawing lets GPU execute draw calls without
   * CPU intervention for each draw, improving performance for complex scenes.
   *
   * Normall you call gl.drawElements or gl.drawArrays and specifying counts manually,
   * With indirect drawing, the GPU stores parameters like
   * - vertex count
   * - instance count
   * - first vertex
   * - base instance
   *
   * BufferAttribute holds this data in a typed array so the GPU can read it directly
   *
   * @param indirect - The indirect attribute
   * @returns A reference to this instance
   */
  public setIndirect(indirect: BufferAttribute): this {

    this.indirect = indirect;

    return this;

  }

  /**
   * Returns the indrect attribute of this geometry
   *
   * @returns The indirect attribute
   */
  public getIndrect(): BufferAttribute | null {

    return this.indirect;

  }

  /**
   * Returns the buffer attribute for the given name
   *
   * @param name - The name of the attribute
   * @returns The buffer attribute
   */
  public getAttribute(name: string): BufferAttribute | InterleavedBufferAttribute | undefined {

    return this.attributes[name];

  }

  /**
   * Sets the given attribute for the given name
   *
   * @param name - The name of the attribute
   * @param attribute - The buffer attribute
   * @returns A reference to this instance
   */
  public setAttribute(name: string, attribute: BufferAttribute | InterleavedBufferAttribute): this {

    this.attributes[name] = attribute;

    return this;

  }

  /**
   * Deletes the attribute for the given name
   *
   * @param name - The name of the attribute
   * @returns A reference for this instance
   */
  public deleteAttribute(name: string): BufferGeometry {

    delete this.attributes[name];

    return this;

  }

  /**
   * Returns true if this geometry has an attribute for the given name
   *
   * @param name - The name of the attribute
   * @returns true if the attribute exists
   */
  public hasAttribute(name: string): boolean {

    return this.attributes[name] !== undefined;

  }

  /**
   * Adds a group to this geometry
   *
   * @param start - The first element in this draw call. That is the
   * first vertex for non-index geometries, otherwise the first triangle index
   * @param count - Specifies how many vertices or indices are
   * part of this group
   * @param materialIndex - The material array index to use
   */
  public addGroup(start: number, count: number, materialIndex: number = 0): void {

    this.groups.push({

      start: start,
      count: count,
      materialIndex: materialIndex

    });

  }

  /**
   * Clears all groups for this geometry
   */
  public clearGroups(): void {

    this.groups = [];

  }

  /**
   * Sets the draw range for this geometry
   *
   * @param start - The starting index
   * @param count - The number of indices to be rendered
   */
  public setDrawRange(start: number, count: number): void {

    this.drawRange.start = start;
    this.drawRange.count = count;

  }

  /**
   * Applies the given 4x4 matrix transformation matrix to the geometry.
   *
   * @param matrix - The transformation matrix
   * @returns A reference to this instance
   */
  public applyMatrix4(matrix: Matrix4): this {

    const position = this.attributes.position;

    if (position !== undefined) {

      position.applyMatrix4(matrix);

      position.needsUpdate = true;

    }

    const normal = this.attributes.normal;

    if (normal !== undefined) {

      const normalMatrix = new Matrix3().getNormalMatrix(matrix);

      normal.applyNormalMatrix(normalMatrix);

      normal.needsUpdate = true;

    }

    const tangent = this.attributes.tangent;

    if (tangent !== undefined) {

      tangent.transformDirection(matrix);

      tangent.needsUpdate = true;

    }

    if (this.boundingBox !== null) {

      this.computeBoundingBox();

    }

    if (this.boundingSphere !== null) {

      this.computeBoundingSphere();

    }

    return this;

  }

  /**
   * Applies the rotation represented by the Quaternion to the geometry
   *
   * @param q - The quaternion to apply
   * @returns A reference to this instance
   */
  public applyQuaternion(q: Quaternion): this {

    _m1.makeRotationFromQuaternion(q);

    this.applyMatrix4(_m1);

    return this;

  }

  /**
   * Rotates the geometry about the X axis.
   *
   * @remarks
   * This is typically done as a one time operation, and not during a loop
   * Use {@link Object3D.rotateX} for typical real-time mesh rotation
   *
   * @param angle - The angle in radians
   * @returns A reference to this instance
   */
  public rotateX(angle: number): this {

    _m1.makeRotationX(angle);

    this.applyMatrix4(_m1);

    return this;

  }

  /**
   * Rotates the geometry about the Y axis.
   *
   * @remarks
   * This is typically done as a one time
   * operation, and not during a loop. Use {@link Object3D#rotation} for typical
   * real-time mesh rotation.
   *
   * @param angle - The angle in radians.
   * @returns A reference to this instance.
   */
  public rotateY(angle: number): this {

    // rotate geometry around world y-axis

    _m1.makeRotationY(angle);

    this.applyMatrix4(_m1);

    return this;

  }

  /**
   * Rotates the geometry about the Z axis.
   *
   * @remarks
   * This is typically done as a one time
   * operation, and not during a loop. Use {@link Object3D#rotation} for typical
   * real-time mesh rotation.
   *
   * @param angle - The angle in radians.
   * @returns A reference to this instance.
   */
  public rotateZ(angle: number): this {

    // rotate geometry around world z-axis

    _m1.makeRotationZ(angle);

    this.applyMatrix4(_m1);

    return this;

  }

  /**
   * Translates the geometry.
   *
   * @remarks
   * This is typically done as a one time
   * operation, and not during a loop. Use {@link Object3D#position} for typical
   * real-time mesh rotation.
   *
   * @param x - The x offset.
   * @param y - The y offset.
   * @param z - The z offset.
   * @returns A reference to this instance.
   */
  public translate(x: number, y: number, z: number): this {

    // translate geometry

    _m1.makeTranslation(x, y, z);

    this.applyMatrix4(_m1);

    return this;

  }

  /**
   * Scales the geometry
   *
   * @remarks
   * This is typically done as a one time
   * operation, and not during a loop. Use {@link Object3D#scale} for typical
   * real-time mesh rotation.
   *
   * @param x - The x scale.
   * @param y - The y scale.
   * @param z - The z scale.
   * @returns A reference to this instance.
   */
  public scale(x: number, y: number, z: number): this {

    // scale geometry

    _m1.makeScale(x, y, z);

    this.applyMatrix4(_m1);

    return this;

  }

  /**
   * Rotates the geometry to face a point in 3D space.
   *
   * @remarks
   * This is typically done as a one time
   * operation, and not during a loop. Use {@link Object3D#lookAt} for typical
   * real-time mesh rotation.
   *
   * @param vector - The target point.
   * @return A reference to this instance.
   */
  public lookAt(vector: Vector3): this {

    _obj.lookAt(vector);

    _obj.updateMatrix();

    this.applyMatrix4(_obj.matrix);

    return this;

  }

  /**
   * Center the geometry based on its bounding box.
   *
   * @return {BufferGeometry} A reference to this instance.
   */
  public center(): this {

    this.computeBoundingBox();

    this.boundingBox!.getCenter(_offset).negate();

    this.translate(_offset.x, _offset.y, _offset.z);

    return this;

  }

  /**
   * Defines a geometry by creating a `position` attribute based on the given array of points.
   *
   * @remarks
   * The array
   * can hold 2D or 3D vectors. When using two-dimensional data, the `z` coordinate for all vertices is
   * set to `0`.
   *
   * If the method is used with an existing `position` attribute, the vertex data are overwritten with the
   * data from the array. The length of the array must match the vertex count.
   *
   * @param points - The points.
   * @returns A reference to this instance.
   */
  public setFromPoints(points: Vector2[] | Vector3[]): this {

    const positionAttribute = this.getAttribute('position');

    if (positionAttribute === undefined) {

      const position = [];

      for (let i = 0, l = points.length; i < l; i++) {

        const point = points[i];

        const z = 'z' in point ? point.z : 0;
        position.push(point.x, point.y, z);

      }

      this.setAttribute('position', new Float32BufferAttribute(position, 3));

    } else {

      const l = Math.min(points.length, positionAttribute.count); // make sure data do not exceed buffer size

      for (let i = 0; i < l; i++) {

        const point = points[i];

        const z = 'z' in point ? point.z : 0;
        positionAttribute.setXYZ(i, point.x, point.y, z);

      }

      if (points.length > positionAttribute.count) {

        console.warn('BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.');

      }

      positionAttribute.needsUpdate = true;

    }

    return this;

  }

  /**
   * Computes the bounding box of the geometry, and updates the boundingBox property.
   *
   * @remarks
   * The bounding box is not computed by the engint; it must be computed by the user
   * You may need to recompute the bonding box if the geometry vertices are modified
   */
  public computeBoundingBox(): void {

    if (this.boundingBox === null) {

      this.boundingBox = new Box3();

    }

    const position = this.attributes.position;
    const morphAttributesPosition = this.morphAttributes.position;

    if (position && isGLBufferAttribute(position)) {

      console.error('BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.', this);

      this.boundingBox.set(
        new Vector3(- Infinity, - Infinity, - Infinity),
        new Vector3(+ Infinity, + Infinity, + Infinity)
      );

      return;

    }

    if (position !== undefined) {

      this.boundingBox.setFromBufferAttribute(position);

      // process morph attributes if present

      if (morphAttributesPosition) {

        for (let i = 0, il = morphAttributesPosition.length; i < il; i++) {

          const morphAttribute = morphAttributesPosition[i];
          _box.setFromBufferAttribute(morphAttribute);

          if (this.morphTargetsRelative) {

            _vector.addVectors(this.boundingBox.min, _box.min);
            this.boundingBox.expandByPoint(_vector);

            _vector.addVectors(this.boundingBox.max, _box.max);
            this.boundingBox.expandByPoint(_vector);

          } else {

            this.boundingBox.expandByPoint(_box.min);
            this.boundingBox.expandByPoint(_box.max);

          }

        }

      }

    } else {

      this.boundingBox.makeEmpty();

    }

    if (isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) {

      console.error('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.', this);

    }

  }

  /**
   * Computes the bounding sphere of the geometry, and updates the boundingSphere property.
   *
   * @remarks
   * The engine automatically computes the bounding sphere when it is needed
   * e.g., for ray casting or view frustum culling
   * You may need to recompute the bonding sphere if the geometry vertices are modified
   */
  public computeBoundingSphere(): void {

    if (this.boundingSphere === null) {

      this.boundingSphere = new Sphere();

    }

    const position = this.attributes.position;
    const morphAttributesPosition = this.morphAttributes.position;

    if (position && isGLBufferAttribute(position)) {

      console.error('BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.', this);

      this.boundingSphere.set(new Vector3(), Infinity);

      return;

    }

    if (position) {

      // first, find the center of the bounding sphere

      const center = this.boundingSphere.center;

      _box.setFromBufferAttribute(position);

      // process morph attributes if present

      if (morphAttributesPosition) {

        for (let i = 0, il = morphAttributesPosition.length; i < il; i++) {

          const morphAttribute = morphAttributesPosition[i];
          _boxMorphTargets.setFromBufferAttribute(morphAttribute);

          if (this.morphTargetsRelative) {

            _vector.addVectors(_box.min, _boxMorphTargets.min);
            _box.expandByPoint(_vector);

            _vector.addVectors(_box.max, _boxMorphTargets.max);
            _box.expandByPoint(_vector);

          } else {

            _box.expandByPoint(_boxMorphTargets.min);
            _box.expandByPoint(_boxMorphTargets.max);

          }

        }

      }

      _box.getCenter(center);

      // second, try to find a boundingSphere with a radius smaller than the
      // boundingSphere of the boundingBox: sqrt(3) smaller in the best case

      let maxRadiusSq = 0;

      for (let i = 0, il = position.count; i < il; i++) {

        _vector.fromBufferAttribute(position, i);

        maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(_vector));

      }

      // process morph attributes if present

      if (morphAttributesPosition) {

        for (let i = 0, il = morphAttributesPosition.length; i < il; i++) {

          const morphAttribute = morphAttributesPosition[i];
          const morphTargetsRelative = this.morphTargetsRelative;

          for (let j = 0, jl = morphAttribute.count; j < jl; j++) {

            _vector.fromBufferAttribute(morphAttribute, j);

            if (morphTargetsRelative) {

              _offset.fromBufferAttribute(position, j);
              _vector.add(_offset);

            }

            maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(_vector));

          }

        }

      }

      this.boundingSphere.radius = Math.sqrt(maxRadiusSq);

      if (isNaN(this.boundingSphere.radius)) {

        console.error('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.', this);

      }

    }

  }

  /**
   * Calculates and adds a tangent attribute to this geometry.
   *
   * @remarks
   * The computation is only supported for indexed geometries and if position, normal, and uv attributes
   * are defined. When using a tangent space normal map, prefer the MikkTSpace algorithm provided by
   * {@link BufferGeometryUtils#computeMikkTSpaceTangents} instead.
   */
  public computeTangents(): void {

    const index = this.index;
    const attributes = this.attributes;

    // based on http://www.terathon.com/code/tangent.html
    // (per vertex tangents)

    if (
      index === null ||
      attributes.position === undefined ||
      attributes.normal === undefined ||
      attributes.uv === undefined
    ) {

      console.error('BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)');
      return;

    }

    const positionAttribute = attributes.position;
    const normalAttribute = attributes.normal;
    const uvAttribute = attributes.uv;

    if (this.hasAttribute('tangent') === false) {

      this.setAttribute('tangent', new BufferAttribute(new Float32Array(4 * positionAttribute.count), 4));

    }

    const tangentAttribute = this.getAttribute('tangent');

    const tan1: Vector3[] = [], tan2: Vector3[] = [];

    for (let i = 0; i < positionAttribute.count; i++) {

      tan1[i] = new Vector3();
      tan2[i] = new Vector3();

    }

    const vA = new Vector3(),
      vB = new Vector3(),
      vC = new Vector3(),

      uvA = new Vector2(),
      uvB = new Vector2(),
      uvC = new Vector2(),

      sdir = new Vector3(),
      tdir = new Vector3();

    function handleTriangle(a: number, b: number, c: number) {

      vA.fromBufferAttribute(positionAttribute, a);
      vB.fromBufferAttribute(positionAttribute, b);
      vC.fromBufferAttribute(positionAttribute, c);

      uvA.fromBufferAttribute(uvAttribute, a);
      uvB.fromBufferAttribute(uvAttribute, b);
      uvC.fromBufferAttribute(uvAttribute, c);

      vB.sub(vA);
      vC.sub(vA);

      uvB.sub(uvA);
      uvC.sub(uvA);

      const r = 1.0 / (uvB.x * uvC.y - uvC.x * uvB.y);

      // silently ignore degenerate uv triangles having coincident or colinear vertices

      if (!isFinite(r)) return;

      sdir.copy(vB).multiplyScalar(uvC.y).addScaledVector(vC, - uvB.y).multiplyScalar(r);
      tdir.copy(vC).multiplyScalar(uvB.x).addScaledVector(vB, - uvC.x).multiplyScalar(r);

      tan1[a].add(sdir);
      tan1[b].add(sdir);
      tan1[c].add(sdir);

      tan2[a].add(tdir);
      tan2[b].add(tdir);
      tan2[c].add(tdir);

    }

    let groups = this.groups;

    if (groups.length === 0) {

      groups = [{
        start: 0,
        count: index.count
      }];

    }

    for (let i = 0, il = groups.length; i < il; ++i) {

      const group = groups[i];

      const start = group.start;
      const count = group.count;

      for (let j = start, jl = start + count; j < jl; j += 3) {

        handleTriangle(
          index.getX(j + 0),
          index.getX(j + 1),
          index.getX(j + 2)
        );

      }

    }

    const tmp = new Vector3(), tmp2 = new Vector3();
    const n = new Vector3(), n2 = new Vector3();

    function handleVertex(v: number) {

      n.fromBufferAttribute(normalAttribute, v);
      n2.copy(n);

      const t = tan1[v];

      // Gram-Schmidt orthogonalize

      tmp.copy(t);
      tmp.sub(n.multiplyScalar(n.dot(t))).normalize();

      // Calculate handedness

      tmp2.crossVectors(n2, t);
      const test = tmp2.dot(tan2[v]);
      const w = (test < 0.0) ? - 1.0 : 1.0;

      tangentAttribute!.setXYZW(v, tmp.x, tmp.y, tmp.z, w);

    }

    for (let i = 0, il = groups.length; i < il; ++i) {

      const group = groups[i];

      const start = group.start;
      const count = group.count;

      for (let j = start, jl = start + count; j < jl; j += 3) {

        handleVertex(index.getX(j + 0));
        handleVertex(index.getX(j + 1));
        handleVertex(index.getX(j + 2));

      }

    }

  }

  /**
   * Computes vertex normals for the given vertex data.
   *
   * @remarks
   * For indexed geometries, the method sets
   * each vertex normal to be the average of the face normals of the faces that share that vertex.
   * For non-indexed geometries, vertices are not shared, and the method sets each vertex normal
   * to be the same as the face normal.
   */
  public computeVertexNormals() {

    const index = this.index;
    const positionAttribute = this.getAttribute('position');

    if (positionAttribute !== undefined) {

      let normalAttribute = this.getAttribute('normal');

      if (normalAttribute === undefined) {

        normalAttribute = new BufferAttribute(new Float32Array(positionAttribute.count * 3), 3);
        this.setAttribute('normal', normalAttribute);

      } else {

        // reset existing normals to zero

        for (let i = 0, il = normalAttribute.count; i < il; i++) {

          normalAttribute.setXYZ(i, 0, 0, 0);

        }

      }

      const pA = new Vector3(), pB = new Vector3(), pC = new Vector3();
      const nA = new Vector3(), nB = new Vector3(), nC = new Vector3();
      const cb = new Vector3(), ab = new Vector3();

      // indexed elements

      if (index) {

        for (let i = 0, il = index.count; i < il; i += 3) {

          const vA = index.getX(i + 0);
          const vB = index.getX(i + 1);
          const vC = index.getX(i + 2);

          pA.fromBufferAttribute(positionAttribute, vA);
          pB.fromBufferAttribute(positionAttribute, vB);
          pC.fromBufferAttribute(positionAttribute, vC);

          cb.subVectors(pC, pB);
          ab.subVectors(pA, pB);
          cb.cross(ab);

          nA.fromBufferAttribute(normalAttribute, vA);
          nB.fromBufferAttribute(normalAttribute, vB);
          nC.fromBufferAttribute(normalAttribute, vC);

          nA.add(cb);
          nB.add(cb);
          nC.add(cb);

          normalAttribute.setXYZ(vA, nA.x, nA.y, nA.z);
          normalAttribute.setXYZ(vB, nB.x, nB.y, nB.z);
          normalAttribute.setXYZ(vC, nC.x, nC.y, nC.z);

        }

      } else {

        // non-indexed elements (unconnected triangle soup)

        for (let i = 0, il = positionAttribute.count; i < il; i += 3) {

          pA.fromBufferAttribute(positionAttribute, i + 0);
          pB.fromBufferAttribute(positionAttribute, i + 1);
          pC.fromBufferAttribute(positionAttribute, i + 2);

          cb.subVectors(pC, pB);
          ab.subVectors(pA, pB);
          cb.cross(ab);

          normalAttribute.setXYZ(i + 0, cb.x, cb.y, cb.z);
          normalAttribute.setXYZ(i + 1, cb.x, cb.y, cb.z);
          normalAttribute.setXYZ(i + 2, cb.x, cb.y, cb.z);

        }

      }

      this.normalizeNormals();

      normalAttribute.needsUpdate = true;

    }

  }

  /**
   * Ensures every normal vector in a geometry will have a magnitude of `1`. This will
   * correct lighting on the geometry surfaces.
   */
  public normalizeNormals() {

    const normals = this.attributes.normal;

    for (let i = 0, il = normals.count; i < il; i++) {

      _vector.fromBufferAttribute(normals, i);

      _vector.normalize();

      normals.setXYZ(i, _vector.x, _vector.y, _vector.z);

    }

  }

  /**
   * Return a new non-index version of this indexed geometry. If the geometry
   * is already non-indexed, the method is a NOOP.
   *
   * @returns The non-indexed version of this indexed geometry.
   */
  public toNonIndexed() {

    function convertBufferAttribute(
      attribute: BufferAttribute | InterleavedBufferAttribute,
      indices: ArrayLike<number>
    ): BufferAttribute {

      const array = attribute.array;
      const itemSize = attribute.itemSize;
      const normalized = attribute.normalized;

      const TypedArray = array.constructor as new (length: number) => any;
      const array2 = new TypedArray(indices.length * itemSize);

      let index = 0, index2 = 0;

      for (let i = 0, l = indices.length; i < l; i++) {

        if (attribute instanceof InterleavedBufferAttribute) {

          index = indices[i] * attribute.data.stride + attribute.offset;

        } else {

          index = indices[i] * itemSize;

        }

        for (let j = 0; j < itemSize; j++) {

          array2[index2++] = array[index++];

        }

      }

      return new BufferAttribute(array2, itemSize, normalized);

    }

    //

    if (this.index === null) {

      console.warn('BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.');
      return this;

    }

    const geometry2 = new BufferGeometry();

    const indices = this.index.array;
    const attributes = this.attributes;

    // attributes

    for (const name in attributes) {

      const attribute = attributes[name];

      const newAttribute = convertBufferAttribute(attribute, indices);

      geometry2.setAttribute(name, newAttribute);

    }

    // morph attributes

    const morphAttributes = this.morphAttributes;

    for (const name in morphAttributes) {

      const morphArray = [];
      const morphAttribute = morphAttributes[name]; // morphAttribute: array of Float32BufferAttributes

      for (let i = 0, il = morphAttribute.length; i < il; i++) {

        const attribute = morphAttribute[i];

        const newAttribute = convertBufferAttribute(attribute, indices);

        morphArray.push(newAttribute);

      }

      geometry2.morphAttributes[name] = morphArray;

    }

    geometry2.morphTargetsRelative = this.morphTargetsRelative;

    // groups

    const groups = this.groups;

    for (let i = 0, l = groups.length; i < l; i++) {

      const group = groups[i];
      geometry2.addGroup(group.start, group.count, group.materialIndex);

    }

    return geometry2;

  }

  /**
   * Serializes the geometry into JSON.
   *
   * @returns A JSON object representing the serialized geometry.
   */
  public toJSON() {

    const data = {
      metadata: {
        version: 1,
        type: 'BufferGeometry',
        generator: 'BufferGeometry.toJSON'
      }
    } as {
      metadata: { version: number; type: string; generator: string };
      uuid?: string;
      type?: string;
      name?: string;
      userData?: any;
      parameters?: any;
      data?: any;
      [key: string]: any
    };;

    // standard BufferGeometry serialization

    data.uuid = this.uuid;
    data.type = this.type;
    if (this.name !== '') data.name = this.name;
    if (Object.keys(this.userData).length > 0) data.userData = this.userData;

    if (this.parameters !== undefined) {

      const parameters = this.parameters;

      for (const key in parameters) {

        if (parameters[key] !== undefined) data[key] = parameters[key];

      }

      return data;

    }

    // for simplicity the code assumes attributes are not shared across geometries, see #15811

    data.data = { attributes: {} };

    const index = this.index;

    if (index !== null) {

      data.data.index = {
        type: index.array.constructor.name,
        array: Array.prototype.slice.call(index.array)
      };

    }

    const attributes = this.attributes;

    for (const key in attributes) {

      const attribute = attributes[key];

      data.data.attributes[key] = attribute.toJSON(data.data);

    }

    const morphAttributes: { [key: string]: any } = {};
    let hasMorphAttributes = false;

    for (const key in this.morphAttributes) {

      const attributeArray = this.morphAttributes[key];

      const array = [];

      for (let i = 0, il = attributeArray.length; i < il; i++) {

        const attribute = attributeArray[i];

        array.push(attribute.toJSON(data.data));

      }

      if (array.length > 0) {

        morphAttributes[key] = array;

        hasMorphAttributes = true;

      }

    }

    if (hasMorphAttributes) {

      data.data.morphAttributes = morphAttributes;
      data.data.morphTargetsRelative = this.morphTargetsRelative;

    }

    const groups = this.groups;

    if (groups.length > 0) {

      data.data.groups = JSON.parse(JSON.stringify(groups));

    }

    const boundingSphere = this.boundingSphere;

    if (boundingSphere !== null) {

      data.data.boundingSphere = boundingSphere.toJSON();

    }

    return data;

  }

  /**
   * Returns a new geometry with copied values from this instance.
   *
   * @return {BufferGeometry} A clone of this instance.
   */
  public clone(): BufferGeometry {

    return new BufferGeometry().copy(this);

  }

  /**
   * Copies the values of the given geometry to this instance.
   *
   * @param {BufferGeometry} source - The geometry to copy.
   * @return {BufferGeometry} A reference to this instance.
   */
  public copy(source: BufferGeometry): BufferGeometry {

    // reset

    this.index = null;
    this.attributes = {};
    this.morphAttributes = {};
    this.groups = [];
    this.boundingBox = null;
    this.boundingSphere = null;

    // used for storing cloned, shared data

    const data = {};

    // name

    this.name = source.name;

    // index

    const index = source.index;

    if (index !== null) {

      this.setIndex(index.clone());

    }

    // attributes

    const attributes = source.attributes;

    for (const name in attributes) {

      const attribute = attributes[name];
      this.setAttribute(name, attribute.clone(data));

    }

    // morph attributes

    const morphAttributes = source.morphAttributes;

    for (const name in morphAttributes) {

      const array = [];
      const morphAttribute = morphAttributes[name]; // morphAttribute: array of Float32BufferAttributes

      for (let i = 0, l = morphAttribute.length; i < l; i++) {

        array.push(morphAttribute[i].clone(data));

      }

      this.morphAttributes[name] = array;

    }

    this.morphTargetsRelative = source.morphTargetsRelative;

    // groups

    const groups = source.groups;

    for (let i = 0, l = groups.length; i < l; i++) {

      const group = groups[i];
      this.addGroup(group.start, group.count, group.materialIndex);

    }

    // bounding box

    const boundingBox = source.boundingBox;

    if (boundingBox !== null) {

      this.boundingBox = boundingBox.clone();

    }

    // bounding sphere

    const boundingSphere = source.boundingSphere;

    if (boundingSphere !== null) {

      this.boundingSphere = boundingSphere.clone();

    }

    // draw range

    this.drawRange.start = source.drawRange.start;
    this.drawRange.count = source.drawRange.count;

    // user data

    this.userData = source.userData;

    return this;

  }

  /**
   * Frees the GPU-related resources allocated by this instance.
   * Call this moethod whenever this instance is no longer used in your app
   *
   * @fires BufferGeometry#dispose
   */
  public dispose(): void {

    this.dispatchEvent({ type: 'dispose' });

  }

}

function isGLBufferAttribute(
  attribute: BufferAttribute | InterleavedBufferAttribute | any
): attribute is GLBufferAttribute {

  return attribute?.isGLBufferAttribute === true;

}
